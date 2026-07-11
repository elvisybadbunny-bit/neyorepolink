#!/usr/bin/env python3
"""
Idempotent patch script for the recurring `timetable-engine.service.ts`
fragile-file reversion bug (this file has silently reverted to its pristine
pre-Z.2 state 3+ times in one session). Run this any time
`grep -c "periodRepeatPenalty" src/lib/services/timetable-engine.service.ts`
returns 0 to re-apply ALL of:
  - Z.2: subjectPeriodUsage / periodRepeatPenalty() / daySpreadPenalty() /
    BACKTRACK_STEP_BUDGET / BACKTRACK_TIME_BUDGET_MS / greedy-fallback fix.
  - Z.3: real Venue/Lab conflict-checking (Card.venueCandidateIds,
    venueGrid/cardVenueUsed/venueUsedAt, venueAvailableAt()/pickVenueFor(),
    periodFree()/occupy()/release() wiring, greedy-fallback venue reset,
    TimetableSlot.venue persistence read-back).
  - Z.3: real free-period distribution fix (fills up to
    TimetableConfig.freePeriodsPerWeek worth of spread-out FREE periods
    into genuine surplus slots, honestly leaves further surplus empty).

Safe to re-run: each patch checks an anchor string is present and a marker
string is absent before applying, so re-running on an already-patched file
is a clean no-op.
"""
import re
import sys

PATH = "src/lib/services/timetable-engine.service.ts"

with open(PATH, "r") as f:
    src = f.read()

original_len = len(src)
applied = []


def must_apply(name, old, new):
    global src
    if new in src:
        return  # already applied
    if old not in src:
        print(f"FATAL: anchor for patch '{name}' not found — file structure changed unexpectedly.")
        sys.exit(1)
    src = src.replace(old, new, 1)
    applied.append(name)


# ---------------------------------------------------------------------------
# PATCH 1 — Card interface: add venueCandidateIds.
# ---------------------------------------------------------------------------
must_apply(
    "Card.venueCandidateIds",
    """interface Card {
  id: string;
  // member class ids that this card occupies simultaneously (1 for normal,
  // many for combination groups).
  classIds: string[];
  classLabel: string;
  subjectId: string;
  subjectCode: string;
  teacherId: string | null;
  size: 1 | 2; // single or double (number of consecutive/split periods)
  splitAllowed: boolean; // double may be non-adjacent
  isCombination: boolean;
}""",
    """interface Card {
  id: string;
  // member class ids that this card occupies simultaneously (1 for normal,
  // many for combination groups).
  classIds: string[];
  classLabel: string;
  subjectId: string;
  subjectCode: string;
  teacherId: string | null;
  size: 1 | 2; // single or double (number of consecutive/split periods)
  splitAllowed: boolean; // double may be non-adjacent
  isCombination: boolean;
  // Z.3 — real candidate venue ids this card may use: a single pinned
  // venue (from ClassSubjectNeed.venueId / CombinationGroup.venueId) takes
  // priority when set, otherwise the school's real Venue pool tagged for
  // this subject. Empty array = no specific venue required (never blocks
  // placement on venue availability).
  venueCandidateIds: string[];
}""",
)

# ---------------------------------------------------------------------------
# PATCH 2 — data load: add venues + venue lookup structures.
# ---------------------------------------------------------------------------
must_apply(
    "venue data-load + lookups",
    """  const data = await withTenant(tenantId, async () => {
    const tdb = tenantDb();
    const [tenant, classes, subjects, needs, configs, teacherAssoc, constraints, groups, timeOff] = await Promise.all([
      tdb.tenant.findFirst({ select: { educationLevelsOffered: true } }),
      tdb.schoolClass.findMany({ where: { archived: false }, orderBy: [{ level: "asc" }, { stream: "asc" }] }),
      tdb.subject.findMany({ where: { archived: false } }),
      tdb.classSubjectNeed.findMany(),
      tdb.timetableConfig.findMany(),
      tdb.teacherSubject.findMany(),
      tdb.timetableConstraint.findMany({ where: { enabled: true }, orderBy: { priority: "asc" } }),
      tdb.combinationGroup.findMany({ where: { active: true }, include: { members: true } }),
      tdb.teacherTimeOff.findMany(),
    ]);
    return { tenant, classes, subjects, needs, configs, teacherAssoc, constraints, groups, timeOff };
  });

  if (data.classes.length === 0) throw new TimetableEngineError("NOT_FOUND", "No active classes found.");

  const subjectById = new Map(data.subjects.map((s) => [s.id, s]));
  const configByClass = new Map(data.configs.map((c) => [c.classId, c]));""",
    """  const data = await withTenant(tenantId, async () => {
    const tdb = tenantDb();
    const [tenant, classes, subjects, needs, configs, teacherAssoc, constraints, groups, timeOff, venues] = await Promise.all([
      tdb.tenant.findFirst({ select: { educationLevelsOffered: true } }),
      tdb.schoolClass.findMany({ where: { archived: false }, orderBy: [{ level: "asc" }, { stream: "asc" }] }),
      tdb.subject.findMany({ where: { archived: false } }),
      tdb.classSubjectNeed.findMany(),
      tdb.timetableConfig.findMany(),
      tdb.teacherSubject.findMany(),
      tdb.timetableConstraint.findMany({ where: { enabled: true }, orderBy: { priority: "asc" } }),
      tdb.combinationGroup.findMany({ where: { active: true }, include: { members: true } }),
      tdb.teacherTimeOff.findMany(),
      tdb.venue.findMany({ where: { active: true } }), // Z.3
    ]);
    return { tenant, classes, subjects, needs, configs, teacherAssoc, constraints, groups, timeOff, venues };
  });

  if (data.classes.length === 0) throw new TimetableEngineError("NOT_FOUND", "No active classes found.");

  const subjectById = new Map(data.subjects.map((s) => [s.id, s]));
  const configByClass = new Map(data.configs.map((c) => [c.classId, c]));

  // Z.3 — real Venue/Lab pool lookups. `venuesForSubject` maps a subjectId
  // to the real venue ids whose `supportsSubjectIds` includes it (pool
  // fallback); `venueCandidatesFor()` prefers a school's own explicitly
  // PINNED venue (per class-subject-need or Combination Group) when set.
  const venueById = new Map(data.venues.map((v) => [v.id, v]));
  const venuesForSubject = new Map<string, string[]>();
  for (const v of data.venues) {
    let supported: string[] = [];
    try { supported = JSON.parse(v.supportsSubjectIds) as string[]; } catch { supported = []; }
    for (const sid of supported) {
      const list = venuesForSubject.get(sid) ?? [];
      list.push(v.id);
      venuesForSubject.set(sid, list);
    }
  }
  function venueCandidatesFor(subjectId: string, pinnedVenueId?: string | null): string[] {
    if (pinnedVenueId && venueById.has(pinnedVenueId)) return [pinnedVenueId];
    return venuesForSubject.get(subjectId) ?? [];
  }""",
)

# ---------------------------------------------------------------------------
# PATCH 3 — Grids: add subjectPeriodUsage (Z.2) + venue grids (Z.3).
# ---------------------------------------------------------------------------
must_apply(
    "subjectPeriodUsage + venue grids",
    """  // Grids.
  const classGrid = new Map<string, string>(); // classId:day:period -> subjectId
  const teacherGrid = new Map<string, string>(); // teacherId:day:period -> classId(s)
  const subjectDayCount = new Map<string, number>(); // classId:subjectId:day -> count
  const singleDayCount = new Map<string, number>(); // classId:subjectId:day singles only""",
    """  // Grids.
  const classGrid = new Map<string, string>(); // classId:day:period -> subjectId
  const teacherGrid = new Map<string, string>(); // teacherId:day:period -> classId(s)
  const subjectDayCount = new Map<string, number>(); // classId:subjectId:day -> count
  const singleDayCount = new Map<string, number>(); // classId:subjectId:day singles only
  // Z.2 — real memory of which PERIOD a class+subject already uses (any
  // day), so the scorer can steer AWAY from always reusing the exact same
  // period every day (the founder's own reported "same slot every day" bug).
  // Keyed classId:subjectId:period -> count of real bookings at that period.
  const subjectPeriodUsage = new Map<string, number>();
  // Z.3 — real venue-conflict grids. `venueGrid` counts real simultaneous
  // bookings at venueId:day:period, checked against that venue's own
  // `capacityPerPeriod`. `cardVenueUsed` remembers which exact venue a card
  // booked so `release()` can free the SAME slot on backtrack (a pool venue
  // can genuinely differ by day for the same class+subject). `venueUsedAt`
  // is the exact per-slot record read back later when persisting real
  // `TimetableSlot` rows.
  const venueGrid = new Map<string, number>(); // venueId:day:period -> count
  const cardVenueUsed = new Map<string, string>(); // cardId -> venueId
  const venueUsedAt = new Map<string, string>(); // classId:day:period -> venueId""",
)

# ---------------------------------------------------------------------------
# PATCH 4 — combination-group card building: add venueCandidateIds.
# ---------------------------------------------------------------------------
must_apply(
    "combo card venueCandidateIds",
    """    const sub = subjectById.get(g.subjectId);
    const dbl = Math.max(0, Math.min(g.doubleCount, Math.floor(g.lessonsPerWeek / 2)));
    const singles = g.lessonsPerWeek - dbl * 2;
    const labels = memberClassIds.map((id) => classLabel(data.classes.find((c) => c.id === id)!)).join(" + ");
    for (let i = 0; i < dbl; i++) {
      cards.push({ id: `c${cardSeq++}`, classIds: memberClassIds, classLabel: labels, subjectId: g.subjectId, subjectCode: sub?.code ?? "?", teacherId: g.teacherId, size: 2, splitAllowed: false, isCombination: true });
    }
    for (let i = 0; i < singles; i++) {
      cards.push({ id: `c${cardSeq++}`, classIds: memberClassIds, classLabel: labels, subjectId: g.subjectId, subjectCode: sub?.code ?? "?", teacherId: g.teacherId, size: 1, splitAllowed: false, isCombination: true });
    }
  }""",
    """    const sub = subjectById.get(g.subjectId);
    const dbl = Math.max(0, Math.min(g.doubleCount, Math.floor(g.lessonsPerWeek / 2)));
    const singles = g.lessonsPerWeek - dbl * 2;
    const labels = memberClassIds.map((id) => classLabel(data.classes.find((c) => c.id === id)!)).join(" + ");
    // Z.3 — real venue candidates for this Combination Group (pinned venue
    // takes priority, else the school's real subject-tagged venue pool).
    const comboVenueCandidates = venueCandidatesFor(g.subjectId, (g as any).venueId);
    for (let i = 0; i < dbl; i++) {
      cards.push({ id: `c${cardSeq++}`, classIds: memberClassIds, classLabel: labels, subjectId: g.subjectId, subjectCode: sub?.code ?? "?", teacherId: g.teacherId, size: 2, splitAllowed: false, isCombination: true, venueCandidateIds: comboVenueCandidates });
    }
    for (let i = 0; i < singles; i++) {
      cards.push({ id: `c${cardSeq++}`, classIds: memberClassIds, classLabel: labels, subjectId: g.subjectId, subjectCode: sub?.code ?? "?", teacherId: g.teacherId, size: 1, splitAllowed: false, isCombination: true, venueCandidateIds: comboVenueCandidates });
    }
  }""",
)

# ---------------------------------------------------------------------------
# PATCH 5 — normal per-class-need card building: add venueCandidateIds.
# ---------------------------------------------------------------------------
must_apply(
    "need card venueCandidateIds",
    """      const dbl = Math.max(0, Math.min(n.doubleCount, Math.floor(n.lessonsPerWeek / 2)));
      const singles = n.lessonsPerWeek - dbl * 2;
      for (let i = 0; i < dbl; i++) {
        cards.push({ id: `c${cardSeq++}`, classIds: [c.id], classLabel: classLabel(c), subjectId: n.subjectId, subjectCode: sub.code, teacherId: n.teacherId, size: 2, splitAllowed: n.allowSplitDouble, isCombination: false });
      }
      for (let i = 0; i < singles; i++) {
        cards.push({ id: `c${cardSeq++}`, classIds: [c.id], classLabel: classLabel(c), subjectId: n.subjectId, subjectCode: sub.code, teacherId: n.teacherId, size: 1, splitAllowed: false, isCombination: false });
      }
    }
  }""",
    """      const dbl = Math.max(0, Math.min(n.doubleCount, Math.floor(n.lessonsPerWeek / 2)));
      const singles = n.lessonsPerWeek - dbl * 2;
      // Z.3 — real venue candidates for this class-subject need (pinned
      // venue takes priority, else the school's real subject-tagged venue pool).
      const needVenueCandidates = venueCandidatesFor(n.subjectId, (n as any).venueId);
      for (let i = 0; i < dbl; i++) {
        cards.push({ id: `c${cardSeq++}`, classIds: [c.id], classLabel: classLabel(c), subjectId: n.subjectId, subjectCode: sub.code, teacherId: n.teacherId, size: 2, splitAllowed: n.allowSplitDouble, isCombination: false, venueCandidateIds: needVenueCandidates });
      }
      for (let i = 0; i < singles; i++) {
        cards.push({ id: `c${cardSeq++}`, classIds: [c.id], classLabel: classLabel(c), subjectId: n.subjectId, subjectCode: sub.code, teacherId: n.teacherId, size: 1, splitAllowed: false, isCombination: false, venueCandidateIds: needVenueCandidates });
      }
    }
  }""",
)

# ---------------------------------------------------------------------------
# PATCH 6 — venueAvailableAt/pickVenueFor helpers + periodFree() wiring.
# ---------------------------------------------------------------------------
must_apply(
    "venueAvailableAt/pickVenueFor + periodFree wiring",
    """  // Can a single period at (day, period) host this card across all its classes + teacher?
  function periodFree(card: Card, day: number, period: number): boolean {
    if (period < 1 || period > maxPeriodsForCard(card.classIds, day)) return false;
    for (const cid of card.classIds) {
      if (classGrid.has(`${cid}:${day}:${period}`)) return false;
      if (morningViolation(card.subjectId, period)) return false;
      if (peViolation(card.subjectCode, period)) return false;
      if (adjacentViolation(cid, card.subjectId, day, period)) return false;
    }
    if (card.teacherId) {
      if (teacherGrid.has(`${card.teacherId}:${day}:${period}`)) return false;
      if (teacherUnavailable(card.teacherId, day, period)) return false;
    }
    return true;
  }""",
    """  // Z.3 — real venue availability check: a card with no venue candidates
  // needs no specific room (never blocks placement). A card WITH candidates
  // is available at (day, period) if ANY candidate venue still has spare
  // real capacity there.
  function venueAvailableAt(card: Card, day: number, period: number): boolean {
    if (card.venueCandidateIds.length === 0) return true;
    return card.venueCandidateIds.some((vid) => {
      const cap = venueById.get(vid)?.capacityPerPeriod ?? 1;
      const used = venueGrid.get(`${vid}:${day}:${period}`) ?? 0;
      return used < cap;
    });
  }
  // Z.3 — real first-fit venue picker: the first candidate venue with spare
  // capacity at this exact real slot, or null if none.
  function pickVenueFor(card: Card, day: number, period: number): string | null {
    for (const vid of card.venueCandidateIds) {
      const cap = venueById.get(vid)?.capacityPerPeriod ?? 1;
      const used = venueGrid.get(`${vid}:${day}:${period}`) ?? 0;
      if (used < cap) return vid;
    }
    return null;
  }

  // Can a single period at (day, period) host this card across all its classes + teacher?
  function periodFree(card: Card, day: number, period: number): boolean {
    if (period < 1 || period > maxPeriodsForCard(card.classIds, day)) return false;
    for (const cid of card.classIds) {
      if (classGrid.has(`${cid}:${day}:${period}`)) return false;
      if (morningViolation(card.subjectId, period)) return false;
      if (peViolation(card.subjectCode, period)) return false;
      if (adjacentViolation(cid, card.subjectId, day, period)) return false;
    }
    if (card.teacherId) {
      if (teacherGrid.has(`${card.teacherId}:${day}:${period}`)) return false;
      if (teacherUnavailable(card.teacherId, day, period)) return false;
    }
    if (!venueAvailableAt(card, day, period)) return false; // Z.3
    return true;
  }""",
)

# ---------------------------------------------------------------------------
# PATCH 7 — occupy()/release(): add periodRepeatPenalty tracking (Z.2) + real
# venue booking/release (Z.3).
# ---------------------------------------------------------------------------
must_apply(
    "occupy/release Z.2+Z.3 wiring",
    """  function occupy(card: Card, day: number, periods: number[]) {
    for (const cid of card.classIds) {
      for (const p of periods) classGrid.set(`${cid}:${day}:${p}`, card.subjectId);
      const k = `${cid}:${card.subjectId}:${day}`;
      subjectDayCount.set(k, (subjectDayCount.get(k) ?? 0) + periods.length);
      if (card.size === 1) {
        const sk = `${cid}:${card.subjectId}:${day}`;
        singleDayCount.set(sk, (singleDayCount.get(sk) ?? 0) + 1);
      }
    }
    if (card.teacherId) for (const p of periods) teacherGrid.set(`${card.teacherId}:${day}:${p}`, card.classIds.join(","));
  }
  function release(card: Card, day: number, periods: number[]) {
    for (const cid of card.classIds) {
      for (const p of periods) classGrid.delete(`${cid}:${day}:${p}`);
      const k = `${cid}:${card.subjectId}:${day}`;
      subjectDayCount.set(k, Math.max(0, (subjectDayCount.get(k) ?? 0) - periods.length));
      if (card.size === 1) {
        const sk = `${cid}:${card.subjectId}:${day}`;
        singleDayCount.set(sk, Math.max(0, (singleDayCount.get(sk) ?? 0) - 1));
      }
    }
    if (card.teacherId) for (const p of periods) teacherGrid.delete(`${card.teacherId}:${day}:${p}`);
  }""",
    """  // Z.2 — real soft scoring penalties (never hard blocks). `periodRepeatPenalty`
  // steers the solver toward varying which period a subject uses across
  // days; `daySpreadPenalty` (always on, independent of the optional
  // LESSON_DISTRIBUTION toggle) discourages piling a subject onto a day it
  // already has lessons on.
  function periodRepeatPenalty(card: Card, periods: number[]): number {
    let penalty = 0;
    for (const cid of card.classIds) {
      for (const p of periods) {
        const used = subjectPeriodUsage.get(`${cid}:${card.subjectId}:${p}`) ?? 0;
        penalty += used * 30;
      }
    }
    return penalty;
  }
  function daySpreadPenalty(card: Card, day: number): number {
    let penalty = 0;
    for (const cid of card.classIds) {
      const cnt = subjectDayCount.get(`${cid}:${card.subjectId}:${day}`) ?? 0;
      penalty += cnt * 40;
    }
    return penalty;
  }

  function occupy(card: Card, day: number, periods: number[]) {
    for (const cid of card.classIds) {
      for (const p of periods) classGrid.set(`${cid}:${day}:${p}`, card.subjectId);
      const k = `${cid}:${card.subjectId}:${day}`;
      subjectDayCount.set(k, (subjectDayCount.get(k) ?? 0) + periods.length);
      if (card.size === 1) {
        const sk = `${cid}:${card.subjectId}:${day}`;
        singleDayCount.set(sk, (singleDayCount.get(sk) ?? 0) + 1);
      }
      for (const p of periods) {
        const pk = `${cid}:${card.subjectId}:${p}`;
        subjectPeriodUsage.set(pk, (subjectPeriodUsage.get(pk) ?? 0) + 1);
      }
    }
    if (card.teacherId) for (const p of periods) teacherGrid.set(`${card.teacherId}:${day}:${p}`, card.classIds.join(","));
    // Z.3 — real venue booking: pick the first candidate venue with spare
    // capacity at this exact slot and reserve it for every period + class
    // this card spans.
    if (card.venueCandidateIds.length > 0) {
      const chosen = pickVenueFor(card, day, periods[0]);
      if (chosen) {
        cardVenueUsed.set(card.id, chosen);
        for (const p of periods) {
          const vk = `${chosen}:${day}:${p}`;
          venueGrid.set(vk, (venueGrid.get(vk) ?? 0) + 1);
          for (const cid of card.classIds) venueUsedAt.set(`${cid}:${day}:${p}`, chosen);
        }
      }
    }
  }
  function release(card: Card, day: number, periods: number[]) {
    for (const cid of card.classIds) {
      for (const p of periods) classGrid.delete(`${cid}:${day}:${p}`);
      const k = `${cid}:${card.subjectId}:${day}`;
      subjectDayCount.set(k, Math.max(0, (subjectDayCount.get(k) ?? 0) - periods.length));
      if (card.size === 1) {
        const sk = `${cid}:${card.subjectId}:${day}`;
        singleDayCount.set(sk, Math.max(0, (singleDayCount.get(sk) ?? 0) - 1));
      }
      for (const p of periods) {
        const pk = `${cid}:${card.subjectId}:${p}`;
        subjectPeriodUsage.set(pk, Math.max(0, (subjectPeriodUsage.get(pk) ?? 0) - 1));
      }
    }
    if (card.teacherId) for (const p of periods) teacherGrid.delete(`${card.teacherId}:${day}:${p}`);
    // Z.3 — real venue release: free the SAME venue this card actually
    // booked (read back from `cardVenueUsed`, not re-picked, since a pool
    // venue choice must be reversible on backtrack).
    const usedVenue = cardVenueUsed.get(card.id);
    if (usedVenue) {
      for (const p of periods) {
        const vk = `${usedVenue}:${day}:${p}`;
        venueGrid.set(vk, Math.max(0, (venueGrid.get(vk) ?? 0) - 1));
        for (const cid of card.classIds) venueUsedAt.delete(`${cid}:${day}:${p}`);
      }
      cardVenueUsed.delete(card.id);
    }
  }""",
)

# ---------------------------------------------------------------------------
# PATCH 8 — candidatePlacements() sort: add Z.2 penalties.
# ---------------------------------------------------------------------------
must_apply(
    "candidatePlacements Z.2 penalties",
    """    placements.sort((a, b) => {
      const [dayA, ...periodsA] = a;
      const [dayB, ...periodsB] = b;
      const morningPenaltyA = periodsA.some((p) => morningViolation(card.subjectId, p)) ? 100 : 0;
      const morningPenaltyB = periodsB.some((p) => morningViolation(card.subjectId, p)) ? 100 : 0;
      const pePenaltyA = periodsA.some((p) => peViolation(card.subjectCode, p)) ? 100 : 0;
      const pePenaltyB = periodsB.some((p) => peViolation(card.subjectCode, p)) ? 100 : 0;
      const streamPenaltyA = streamDistributionOk(card, dayA) ? 0 : 50;
      const streamPenaltyB = streamDistributionOk(card, dayB) ? 0 : 50;
      const densityBonusA = preset.preferMorningAcademicDensity ? periodsA.reduce((acc, p) => acc + (p <= 4 ? -3 : 0), 0) : 0;
      const densityBonusB = preset.preferMorningAcademicDensity ? periodsB.reduce((acc, p) => acc + (p <= 4 ? -3 : 0), 0) : 0;
      const scoreA = morningPenaltyA + pePenaltyA + streamPenaltyA + densityBonusA + dayA * 2 + periodsA[0];
      const scoreB = morningPenaltyB + pePenaltyB + streamPenaltyB + densityBonusB + dayB * 2 + periodsB[0];
      return scoreA - scoreB;
    });""",
    """    placements.sort((a, b) => {
      const [dayA, ...periodsA] = a;
      const [dayB, ...periodsB] = b;
      const morningPenaltyA = periodsA.some((p) => morningViolation(card.subjectId, p)) ? 100 : 0;
      const morningPenaltyB = periodsB.some((p) => morningViolation(card.subjectId, p)) ? 100 : 0;
      const pePenaltyA = periodsA.some((p) => peViolation(card.subjectCode, p)) ? 100 : 0;
      const pePenaltyB = periodsB.some((p) => peViolation(card.subjectCode, p)) ? 100 : 0;
      const streamPenaltyA = streamDistributionOk(card, dayA) ? 0 : 50;
      const streamPenaltyB = streamDistributionOk(card, dayB) ? 0 : 50;
      const densityBonusA = preset.preferMorningAcademicDensity ? periodsA.reduce((acc, p) => acc + (p <= 4 ? -3 : 0), 0) : 0;
      const densityBonusB = preset.preferMorningAcademicDensity ? periodsB.reduce((acc, p) => acc + (p <= 4 ? -3 : 0), 0) : 0;
      // Z.2 — real soft penalties steering away from same-period-every-day
      // repetition and same-day clumping (always on, independent of the
      // optional LESSON_DISTRIBUTION toggle).
      const repeatPenaltyA = periodRepeatPenalty(card, periodsA);
      const repeatPenaltyB = periodRepeatPenalty(card, periodsB);
      const spreadPenaltyA = daySpreadPenalty(card, dayA);
      const spreadPenaltyB = daySpreadPenalty(card, dayB);
      const scoreA = morningPenaltyA + pePenaltyA + streamPenaltyA + densityBonusA + repeatPenaltyA + spreadPenaltyA + dayA * 2 + periodsA[0];
      const scoreB = morningPenaltyB + pePenaltyB + streamPenaltyB + densityBonusB + repeatPenaltyB + spreadPenaltyB + dayB * 2 + periodsB[0];
      return scoreA - scoreB;
    });""",
)

# ---------------------------------------------------------------------------
# PATCH 9 — solve(): add backtrack budget + Z.2 penalties in scoring.
# ---------------------------------------------------------------------------
must_apply(
    "solve() backtrack budget + Z.2 scoring",
    """  function solve(idx: number): boolean {
    if (idx >= cards.length) return true;
    const card = cards[idx];
    const placements = candidatePlacements(card).sort((a, b) => {
      const [dayA, ...periodsA] = a;
      const [dayB, ...periodsB] = b;
      const score = (day: number, periods: number[]) => {
        let s = 0;
        if (periods.some((p) => morningViolation(card.subjectId, p))) s += 1000;
        if (periods.some((p) => peViolation(card.subjectCode, p))) s += 500;
        if (preset.preferMorningAcademicDensity) s += periods.reduce((acc, p) => acc + (p <= 4 ? -5 : 0), 0);
        s += day * 10 + periods[0];
        return s;
      };
      return score(dayA, periodsA) - score(dayB, periodsB);
    });
    for (const placement of placements) {
      const [day, ...periods] = placement;
      if (!spreadOk(card, day)) continue;
      if (!singlePerDayOk(card, day)) continue;
      if (!streamDistributionOk(card, day)) continue;
      if (!classStreamConflictOk(card, day, periods)) continue;
      if (!periods.every((p) => periodFree(card, day, p))) continue;
      occupy(card, day, periods);
      if (solve(idx + 1)) return true;
      release(card, day, periods);
    }
    return false;
  }

  // Try a full solve; if it fails, place greedily and record unplaced loads.
  const fullySolved = solve(0);
  if (!fullySolved) {""",
    """  // Z.2 — real step/time budget for the backtracking solver. An earlier
  // unbounded version could spin at 100% CPU indefinitely on a large real
  // school (confirmed live: 3+ minutes, manually killed) — directly
  // contradicting the founder's own "support schools whichever the size"
  // requirement. Checked on EVERY step (an earlier every-2000-steps version
  // proved insufficient at scale). Once exceeded, the solver aborts cleanly
  // and the existing greedy fallback takes over.
  const BACKTRACK_STEP_BUDGET = 250_000;
  const BACKTRACK_TIME_BUDGET_MS = 20_000;
  let backtrackSteps = 0;
  const backtrackStartedAt = Date.now();
  let backtrackBudgetExceeded = false;

  function solve(idx: number): boolean {
    if (backtrackBudgetExceeded) return false;
    backtrackSteps++;
    if (backtrackSteps > BACKTRACK_STEP_BUDGET || Date.now() - backtrackStartedAt > BACKTRACK_TIME_BUDGET_MS) {
      backtrackBudgetExceeded = true;
      return false;
    }
    if (idx >= cards.length) return true;
    const card = cards[idx];
    const placements = candidatePlacements(card).sort((a, b) => {
      const [dayA, ...periodsA] = a;
      const [dayB, ...periodsB] = b;
      const score = (day: number, periods: number[]) => {
        let s = 0;
        if (periods.some((p) => morningViolation(card.subjectId, p))) s += 1000;
        if (periods.some((p) => peViolation(card.subjectCode, p))) s += 500;
        if (preset.preferMorningAcademicDensity) s += periods.reduce((acc, p) => acc + (p <= 4 ? -5 : 0), 0);
        // Z.2 — same real soft penalties as candidatePlacements() above.
        s += periodRepeatPenalty(card, periods);
        s += daySpreadPenalty(card, day);
        s += day * 10 + periods[0];
        return s;
      };
      return score(dayA, periodsA) - score(dayB, periodsB);
    });
    for (const placement of placements) {
      const [day, ...periods] = placement;
      if (!spreadOk(card, day)) continue;
      if (!singlePerDayOk(card, day)) continue;
      if (!streamDistributionOk(card, day)) continue;
      if (!classStreamConflictOk(card, day, periods)) continue;
      if (!periods.every((p) => periodFree(card, day, p))) continue;
      occupy(card, day, periods);
      if (solve(idx + 1)) return true;
      release(card, day, periods);
      if (backtrackBudgetExceeded) return false;
    }
    return false;
  }

  // Try a full solve; if it fails (including a real budget-exceeded abort),
  // place greedily and record unplaced loads.
  const fullySolved = solve(0) && !backtrackBudgetExceeded;
  if (!fullySolved) {""",
)

# ---------------------------------------------------------------------------
# PATCH 10 — greedy fallback: real Z.2 scoring (not first-available) + Z.3
# venue-grid reset.
# ---------------------------------------------------------------------------
must_apply(
    "greedy fallback Z.2+Z.3 fix",
    """    // greedy fallback so we still produce a usable timetable
    classGrid.clear();
    teacherGrid.clear();
    subjectDayCount.clear();
    singleDayCount.clear();
    // re-reserve lunch
    for (const s of lunchSlots) classGrid.set(`${s.classId}:${s.dayOfWeek}:${s.period}`, lunchSubject.id);
    for (const card of cards) {
      let done = false;
      for (const day of daysForCard(card.classIds)) {
        if (!spreadOk(card, day) || !singlePerDayOk(card, day) || !streamDistributionOk(card, day)) continue;
        const cs = candidates(card, day).filter((periods) => classStreamConflictOk(card, day, periods));
        if (cs.length > 0) { occupy(card, day, cs[0]); done = true; placed++; break; }
      }
      if (!done) unplaced.push({ classLabel: card.classLabel, subjectCode: card.subjectCode, reason: "No conflict-free slot under current constraints." });
    }
  } else {
    placed = cards.length;
  }""",
    """    // Greedy fallback so we still produce a usable timetable. Z.2 — real
    // fix: this path previously took the first available day/period in
    // fixed order (literally the "always the same slot" bug in its own
    // right) — now uses the SAME real period-repeat/day-spread scoring as
    // the backtracking solver above, evaluating EVERY real candidate
    // day+period pair rather than stopping at the first free day.
    classGrid.clear();
    teacherGrid.clear();
    subjectDayCount.clear();
    singleDayCount.clear();
    subjectPeriodUsage.clear();
    // Z.3 — real venue grids must ALSO be cleared here, otherwise stale
    // per-slot venue records from an abandoned full-solve attempt could
    // leak into the greedy fallback's own final persisted TimetableSlot
    // venue values.
    venueGrid.clear();
    cardVenueUsed.clear();
    venueUsedAt.clear();
    // re-reserve lunch
    for (const s of lunchSlots) classGrid.set(`${s.classId}:${s.dayOfWeek}:${s.period}`, lunchSubject.id);
    for (const card of cards) {
      let done = false;
      let best: { day: number; periods: number[]; score: number } | null = null;
      for (const day of daysForCard(card.classIds)) {
        if (!spreadOk(card, day) || !singlePerDayOk(card, day) || !streamDistributionOk(card, day)) continue;
        const cs = candidates(card, day).filter((periods) => classStreamConflictOk(card, day, periods));
        for (const periods of cs) {
          let score = 0;
          if (periods.some((p) => morningViolation(card.subjectId, p))) score += 1000;
          if (periods.some((p) => peViolation(card.subjectCode, p))) score += 500;
          score += periodRepeatPenalty(card, periods);
          score += daySpreadPenalty(card, day);
          score += day * 2 + periods[0];
          if (!best || score < best.score) best = { day, periods, score };
        }
      }
      if (best) {
        occupy(card, best.day, best.periods);
        done = true;
        placed++;
      }
      if (!done) unplaced.push({ classLabel: card.classLabel, subjectCode: card.subjectCode, reason: "No conflict-free slot under current constraints." });
    }
  } else {
    placed = cards.length;
  }""",
)

# ---------------------------------------------------------------------------
# PATCH 11 — Z.3 free-period distribution fix: fill genuine surplus slots
# with spread-out FREE periods, up to TimetableConfig.freePeriodsPerWeek,
# honestly leaving further surplus empty. Runs AFTER the main solve/greedy
# pass (both branches), operating directly on the real classGrid.
# ---------------------------------------------------------------------------
must_apply(
    "free-period distribution fix",
    """  await setProgress(tenantId, jobId, 80, "Saving timetable slots");

  // Build slot rows from the class grid (excluding lunch reservations, appended separately).
  const slotRows: any[] = [];""",
    """  await setProgress(tenantId, jobId, 78, "Distributing free periods");

  // Z.3 — real free-period distribution fix (the founder's originally
  // reported "weird unplaced Thursday/Friday" bug). Root cause: a class
  // can have real surplus teaching slots (periodsPerDay x real days, minus
  // lunch) beyond its real lessonsPerWeek need — the engine previously had
  // ZERO logic to fill this surplus, so it just sat genuinely empty at the
  // tail of the week. Founder-confirmed fix (`keep_manual_field`): fill
  // ONLY up to the school's own explicit `TimetableConfig.freePeriodsPerWeek`
  // (default 4) worth of real "Free" periods, genuinely SPREAD across
  // different days/periods using the SAME real Z.2 penalty scoring so Frees
  // never clump — any FURTHER surplus beyond that stays honestly empty as a
  // real signal the school hasn't filled their own subject needs yet.
  const freeSubject = await withTenant(tenantId, async () => {
    const tdb = tenantDb();
    let f = await tdb.subject.findFirst({ where: { code: "FREE" } });
    if (!f) f = await tdb.subject.create({ data: { tenantId, name: "Free Study Period", code: "FREE", curriculum: "BOTH" } });
    return f;
  });
  const freeDayCount = new Map<string, number>(); // classId:day -> count of Free periods placed today
  const freePeriodUsage = new Map<string, number>(); // classId:period -> count of Free periods placed at this period
  for (const c of data.classes) {
    const cfg = configByClass.get(c.id);
    const freeTarget = Math.max(0, cfg?.freePeriodsPerWeek ?? 0);
    if (freeTarget === 0) continue;

    // Real candidate empty slots: every real day+period this class has that
    // is not already occupied by a lesson, lunch, or a Free period from an
    // earlier iteration.
    let freePlaced = 0;
    for (let i = 0; i < freeTarget; i++) {
      let best: { day: number; period: number; score: number } | null = null;
      for (const day of daysForClass(c.id)) {
        const maxP = maxPeriodsForClass(c.id, day);
        for (let p = 1; p <= maxP; p++) {
          const key = `${c.id}:${day}:${p}`;
          if (classGrid.has(key)) continue; // real slot already used (lesson, lunch, or an earlier Free)
          // Real spread scoring — reuses the SAME Z.2 philosophy: penalize
          // reusing a day/period this class's Free periods already used,
          // so Frees land varied across the week rather than clumped.
          const dayCnt = freeDayCount.get(`${c.id}:${day}`) ?? 0;
          const periodCnt = freePeriodUsage.get(`${c.id}:${p}`) ?? 0;
          const score = dayCnt * 40 + periodCnt * 30 + day * 2 + p;
          if (!best || score < best.score) best = { day, period: p, score };
        }
      }
      if (!best) break; // genuinely no empty slot left this week — stop, never force one
      classGrid.set(`${c.id}:${best.day}:${best.period}`, freeSubject.id);
      freeDayCount.set(`${c.id}:${best.day}`, (freeDayCount.get(`${c.id}:${best.day}`) ?? 0) + 1);
      freePeriodUsage.set(`${c.id}:${best.period}`, (freePeriodUsage.get(`${c.id}:${best.period}`) ?? 0) + 1);
      freePlaced++;
    }
  }

  await setProgress(tenantId, jobId, 80, "Saving timetable slots");

  // Build slot rows from the class grid (excluding lunch reservations, appended separately).
  const slotRows: any[] = [];""",
)

# ---------------------------------------------------------------------------
# PATCH 12 — skip the FREE subject in the lunch-exclusion filter (it must be
# persisted as a real ACADEMIC slot, just like any other subject) + real
# venue read-back into TimetableSlot.venue.
# ---------------------------------------------------------------------------
must_apply(
    "slotRows venue read-back",
    """  for (const [key, subjectId] of classGrid.entries()) {
    if (subjectId === lunchSubject.id) continue;
    const [classId, dayStr, periodStr] = key.split(":");
    const teacherId = teacherForClassSubject.get(`${classId}::${subjectId}`) ?? null;
    const classExists = data.classes.some((c) => c.id === classId);
    const subjectExists = data.subjects.some((s) => s.id === subjectId);
    const teacherExists = !teacherId || teacherId === lunchSubject.id ? true : data.needs.some((n) => n.teacherId === teacherId) || data.groups.some((g) => g.teacherId === teacherId) || data.teacherAssoc.some((a) => a.teacherId === teacherId) || true;
    if (!classExists || !subjectExists || !teacherExists) continue;
    slotRows.push({
      tenantId, classId, subjectId,
      teacherId,
      dayOfWeek: Number(dayStr), period: Number(periodStr), slotType: "ACADEMIC",
    });
  }
  slotRows.push(...lunchSlots);""",
    """  for (const [key, subjectId] of classGrid.entries()) {
    if (subjectId === lunchSubject.id) continue;
    const [classId, dayStr, periodStr] = key.split(":");
    const teacherId = teacherForClassSubject.get(`${classId}::${subjectId}`) ?? null;
    const classExists = data.classes.some((c) => c.id === classId);
    const subjectExists = data.subjects.some((s) => s.id === subjectId);
    const teacherExists = !teacherId || teacherId === lunchSubject.id ? true : data.needs.some((n) => n.teacherId === teacherId) || data.groups.some((g) => g.teacherId === teacherId) || data.teacherAssoc.some((a) => a.teacherId === teacherId) || true;
    if (!classExists || !subjectExists || !teacherExists) continue;
    // Z.3 — real venue read-back: resolve the exact venue this class/day/
    // period was actually booked into (a pool venue can genuinely differ
    // by day for the same class+subject), writing its real name/shortCode
    // into the existing TimetableSlot.venue field (consistent with how it
    // is already displayed elsewhere, e.g. timetablePrintBundle()).
    const bookedVenueId = venueUsedAt.get(`${classId}:${dayStr}:${periodStr}`);
    const venueLabel = bookedVenueId ? (venueById.get(bookedVenueId)?.shortCode || venueById.get(bookedVenueId)?.name || null) : null;
    slotRows.push({
      tenantId, classId, subjectId,
      teacherId,
      dayOfWeek: Number(dayStr), period: Number(periodStr), slotType: "ACADEMIC",
      venue: venueLabel,
    });
  }
  slotRows.push(...lunchSlots);""",
)

# ---------------------------------------------------------------------------
# PATCH 13 — upsertCombinationGroup(): real venueId support (the founder's
# scoped-down "combined classes for lab sessions" mechanism).
# ---------------------------------------------------------------------------
must_apply(
    "upsertCombinationGroup venueId",
    """export async function upsertCombinationGroup(
  user: SessionUser,
  input: { id?: string; name: string; subjectId: string; teacherId?: string | null; lessonsPerWeek: number; doubleCount?: number; scope?: string; source?: string; classIds: string[] }
) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const base = {
      name: input.name.trim(),
      subjectId: input.subjectId,
      teacherId: input.teacherId || null,
      lessonsPerWeek: input.lessonsPerWeek,
      doubleCount: input.doubleCount ?? 0,
      scope: input.scope === "GLOBAL" ? "GLOBAL" : "SELECTED",
      source: input.source === "SUBJECT_CHOICE" ? "SUBJECT_CHOICE" : "MANUAL",
    };""",
    """export async function upsertCombinationGroup(
  user: SessionUser,
  input: { id?: string; name: string; subjectId: string; teacherId?: string | null; lessonsPerWeek: number; doubleCount?: number; scope?: string; source?: string; classIds: string[]; venueId?: string | null }
) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const base = {
      name: input.name.trim(),
      subjectId: input.subjectId,
      teacherId: input.teacherId || null,
      lessonsPerWeek: input.lessonsPerWeek,
      doubleCount: input.doubleCount ?? 0,
      scope: input.scope === "GLOBAL" ? "GLOBAL" : "SELECTED",
      source: input.source === "SUBJECT_CHOICE" ? "SUBJECT_CHOICE" : "MANUAL",
      // Z.3 — a real pinned Venue/Lab for this Combination Group (the
      // founder's own scoped-down "combined classes for lab sessions"
      // mechanism), nullable — falls back to the school's subject-tagged
      // Venue pool at solve time when not set.
      venueId: input.venueId || null,
    };""",
)

with open(PATH, "w") as f:
    f.write(src)

print(f"Applied {len(applied)} patch(es): {', '.join(applied) if applied else '(none — already up to date)'}")
print(f"File size: {original_len} -> {len(src)} bytes")
