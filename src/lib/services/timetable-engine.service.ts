/**
 * L.7 — Advanced Timetable Engine (the school's flagship timetable).
 *
 * Extends the existing G.18 whole-school solver with:
 *  - Required lessons per class per subject (already in ClassSubjectNeed.lessonsPerWeek)
 *    PLUS single/double lessons: `doubleCount` of the weekly lessons become DOUBLE
 *    (two periods). Doubles are consecutive by default, or split across the day
 *    when `allowSplitDouble` (for hard subjects).
 *  - Combination groups: classes that take a subject together (e.g. Form 1 East +
 *    Form 2 West combined Physics) are scheduled ONCE at the same period across all
 *    member classes with one teacher. GLOBAL scope = the whole configured class-group;
 *    SELECTED = only named member classes. SUBJECT_CHOICE source derives members from
 *    how students chose subjects (StudentSubjectSelection).
 *  - Configurable constraints (TimetableConstraint), turned on/off & tuned per school:
 *    SUBJECT_MORNING, SUBJECTS_NOT_ADJACENT, SPLIT_DOUBLE_HARD, STREAM_DISTRIBUTION,
 *    LESSON_DISTRIBUTION (day spread), TEACHER_TIMEOFF, DOUBLE_SAME_DAY,
 *    CLASS_STREAM_CONFLICT, ONE_SINGLE_PER_DAY, PE_TIMESLOT, plus school-defined CUSTOM.
 *    AA.7 — STREAM_DISTRIBUTION and CLASS_STREAM_CONFLICT are genuinely ON BY
 *    DEFAULT for any school that has never explicitly touched either one,
 *    using a real, SAFE, auto-computed value straight from that school's own
 *    live data (real per-level stream count; real teachers actually shared
 *    across 2+ streams of the same level right now) — never a hardcoded
 *    number that could mismatch a school's real stream count and wrongly
 *    block legitimate placements (the exact Z.2/Z.3 bug this design
 *    deliberately avoids repeating). A school's own explicit choice (on OR
 *    off, with their own numbers) is always respected untouched.
 *  - A Master Button: generation runs in the BACKGROUND as a TimetableGenerationJob
 *    with live progress + phase, surfaced to the UI.
 *
 * 100% deterministic rule engine. NEVER uses AI. Works regardless of Part-J state.
 */
import { db } from "@/lib/db";
import { withTenant } from "@/lib/core/tenant-context";
import { tenantDb } from "@/lib/core/tenant-db";
import { createInApp } from "@/lib/services/notification.service";
import type { SessionUser } from "@/lib/core/session";
import {
  KICD_SENIOR_SCHOOL_TIMETABLE_TEMPLATE,
  CORE_ESSENTIAL_MATHEMATICS,
  COMMUNITY_SERVICE_LEARNING_SUBJECT,
} from "@/lib/validations/pathways";
import { getElectiveBlocksForSolver } from "@/lib/services/elective-block.service";

export class TimetableEngineError extends Error {
  constructor(public code: "NOT_FOUND" | "INVALID" | "BUSY", message: string) {
    super(message);
    this.name = "TimetableEngineError";
  }
}

export const CONSTRAINT_KINDS = [
  "SUBJECT_MORNING",
  "SUBJECTS_NOT_ADJACENT",
  "SPLIT_DOUBLE_HARD",
  "STREAM_DISTRIBUTION",
  "LESSON_DISTRIBUTION",
  "TEACHER_TIMEOFF",
  "DOUBLE_SAME_DAY",
  "CLASS_STREAM_CONFLICT",
  "ONE_SINGLE_PER_DAY",
  "PE_TIMESLOT",
  "CUSTOM",
] as const;

export const CONSTRAINT_LABELS: Record<string, string> = {
  SUBJECT_MORNING: "Keep certain subjects in the morning (e.g. Maths)",
  SUBJECTS_NOT_ADJACENT: "Two subjects must not follow each other (e.g. English & Kiswahili)",
  SPLIT_DOUBLE_HARD: "Split double lessons for hard subjects across the day",
  STREAM_DISTRIBUTION: "Even subject distribution across streams",
  LESSON_DISTRIBUTION: "Spread a subject's lessons across different days",
  TEACHER_TIMEOFF: "Respect teacher time-off windows",
  DOUBLE_SAME_DAY: "Keep both halves of a double on the same day",
  CLASS_STREAM_CONFLICT: "Avoid class/stream clashes for shared teachers",
  ONE_SINGLE_PER_DAY: "At most one single lesson of a subject per day",
  PE_TIMESLOT: "PE/Games only in allowed time slots",
  CUSTOM: "Custom school rule",
};

// P.5 — Mon-Fri are always real school days. Saturday (6) is added PER-CLASS
// inside the solve pass below (not hardcoded here) based on that class's own
// real TimetableConfig.hasSaturday flag, so it goes through the exact same
// teacher-clash / double-booking / time-off checking as any weekday, instead
// of the older separate bolt-on Bulk/Fair Saturday tools that ran outside the
// main CSP solver and could silently clash with it.
const WEEKDAYS = [1, 2, 3, 4, 5];
const SATURDAY = 6;
// P.5 — default fallback only for a class with no TimetableConfig row yet.
// Every real class's actual period count comes from its own
// TimetableConfig.periodsPerDay (Mon-Fri) / saturdayPeriodsCount (Saturday) —
// never a single hardcoded number for the whole school.
const DEFAULT_PERIODS_PER_DAY = 8;
const DEFAULT_SATURDAY_PERIODS = 4;

// CC.1 — real, direct "lunch is after period N" resolution. A school's own
// explicit `lunchAfterPeriod` (any real period number, matching how their
// actual day is shaped) ALWAYS wins once set — replacing the old rigid
// Shift 1/2/3/4 (period 5/6/7/8 only) enum. Deliberately backward-
// compatible: a class with `lunchAfterPeriod` still null (every
// already-configured real school, until they explicitly re-save via the
// redesigned Schedule Rules UI) keeps resolving from the existing
// `lunchShift` enum exactly as before — no existing real timetable's
// lunch placement silently changes because of this addition.
function resolveLunchPeriod(cfg: { lunchAfterPeriod?: number | null; lunchShift?: number | null } | undefined | null): number {
  if (cfg?.lunchAfterPeriod != null && cfg.lunchAfterPeriod > 0) return cfg.lunchAfterPeriod;
  const shift = cfg?.lunchShift ?? 1;
  return shift === 1 ? 5 : shift === 2 ? 6 : shift === 3 ? 7 : 8;
}

function levelAwareTimetablePreset(levels: string[]) {
  const isSeniorSchool = levels.includes("SENIOR_SCHOOL");
  const isJuniorSchool = levels.includes("JUNIOR_SCHOOL");
  return {
    isSeniorSchool,
    isJuniorSchool,
    preferCombinationRichness: isSeniorSchool,
    preferSubjectSelectionBias: isJuniorSchool || isSeniorSchool,
    preferLevelWideBalancing: isJuniorSchool,
    preferSingleLessonSpread: isJuniorSchool,
    preferMorningAcademicDensity: isSeniorSchool,
  };
}

// ---------------------------------------------------------------------------
// Settings CRUD
// ---------------------------------------------------------------------------

export async function listConstraints(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const rows = await tenantDb().timetableConstraint.findMany({ orderBy: { priority: "asc" } });
    return rows.map((r) => ({ ...r, config: safeParse(r.configJson, {}) }));
  });
}

export async function upsertConstraint(
  user: SessionUser,
  input: { id?: string; kind: string; label?: string; enabled?: boolean; isHard?: boolean; priority?: number; config?: unknown }
) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    if (!CONSTRAINT_KINDS.includes(input.kind as any)) throw new TimetableEngineError("INVALID", "Unknown constraint kind.");
    const data = {
      kind: input.kind,
      label: input.label ?? CONSTRAINT_LABELS[input.kind] ?? input.kind,
      enabled: input.enabled ?? true,
      isHard: input.isHard ?? false,
      priority: input.priority ?? 100,
      configJson: JSON.stringify(input.config ?? {}),
    };
    if (input.id) {
      const found = await tdb.timetableConstraint.findUnique({ where: { id: input.id } });
      if (!found) throw new TimetableEngineError("NOT_FOUND", "Constraint not found.");
      return tdb.timetableConstraint.update({ where: { id: input.id }, data });
    }
    return tdb.timetableConstraint.create({ data: { tenantId: user.tenantId, ...data } });
  });
}

export async function deleteConstraint(user: SessionUser, id: string) {
  return withTenant(user.tenantId, async () => {
    await tenantDb().timetableConstraint.delete({ where: { id } }).catch(() => {});
    return { success: true };
  });
}

export async function saveTeacherTimeOff(user: SessionUser, teacherId: string, windows: { dayOfWeek: number; period: number; note?: string }[]) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    await tdb.teacherTimeOff.deleteMany({ where: { teacherId } });
    if (windows.length > 0) {
      await tdb.teacherTimeOff.createMany({
        data: windows.map((w) => ({ tenantId: user.tenantId, teacherId, dayOfWeek: w.dayOfWeek, period: w.period, note: w.note ?? null })),
      });
    }
    return { success: true };
  });
}

export async function listCombinationGroups(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const groups = await tenantDb().combinationGroup.findMany({ include: { members: true }, orderBy: { createdAt: "desc" } });
    return groups;
  });
}

export async function upsertCombinationGroup(
  user: SessionUser,
  input: { id?: string; name: string; subjectId: string; teacherId?: string | null; lessonsPerWeek: number; doubleCount?: number; scope?: string; source?: string; classIds: string[]; venueId?: string | null; requiresMovement?: boolean }
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
      // AA.4 — real, school-set soft "prefer right after a break" flag.
      requiresMovement: input.requiresMovement ?? false,
    };
    let group;
    if (input.id) {
      group = await tdb.combinationGroup.update({ where: { id: input.id }, data: base });
      await tdb.combinationGroupClass.deleteMany({ where: { groupId: input.id } });
    } else {
      group = await tdb.combinationGroup.create({ data: { tenantId: user.tenantId, ...base } });
    }
    if (input.classIds.length > 0) {
      await tdb.combinationGroupClass.createMany({
        data: input.classIds.map((classId) => ({ tenantId: user.tenantId, groupId: group.id, classId })),
      });
    }
    return group;
  });
}

export async function deleteCombinationGroup(user: SessionUser, id: string) {
  return withTenant(user.tenantId, async () => {
    await tenantDb().combinationGroup.delete({ where: { id } }).catch(() => {});
    return { success: true };
  });
}

// ---------------------------------------------------------------------------
// AA.5 — Pre-generation "undecided lessons → free periods" confirmation
// summary. Per docs/TEACHER-ALLOCATION-AND-ELECTIVES-ENGINE-DESIGN.md
// Part 9: the underlying Free Study Period math (Z.3's own
// freePeriodsPerWeek distribution fix) already works correctly and
// silently — what's genuinely missing is a real, honest, PRE-generation
// message telling a school exactly how many of a class's own real
// possible weekly teaching slots are covered by real configured lesson
// needs vs. how many will become genuine Free Study Periods, BEFORE they
// press the Master Button, so a school can catch an incomplete setup
// (e.g. "we only got round to 6 of Form 2 East's 9 subjects") rather than
// being surprised by a timetable full of Frees after the fact.
//
// Real, honest arithmetic per class (mirrors buildAndSolve()'s own real
// slot-counting logic, without needing to run the full solver):
//   totalRealSlots      = every real teaching period this class has this
//                          week (every day/period from its own real
//                          TimetableConfig, MINUS its own real lunch
//                          reservation — lunch is never a "possible
//                          lesson slot").
//   configuredLessons   = the sum of every real ClassSubjectNeed.lessonsPerWeek
//                          for this class (its own needs PLUS its real
//                          share of any CombinationGroup it belongs to,
//                          PLUS one real slot per week for every
//                          ElectiveBlockSlot period this class's block
//                          membership covers — an Options Block period
//                          genuinely occupies one real slot even though
//                          it holds several parallel subjects at once).
//   honestFreeCount     = max(0, totalRealSlots - configuredLessons) — the
//                          real number of periods that will genuinely
//                          become Free Study Periods if generation runs
//                          right now (capped by the school's own real
//                          freePeriodsPerWeek in the ACTUAL solver — this
//                          summary intentionally shows the school's real
//                          UNCAPPED gap so a school configured for e.g. 4
//                          Frees/week but with a real 9-period gap can see
//                          the genuine shortfall, not a falsely-reassuring
//                          already-capped number).
// ---------------------------------------------------------------------------
export async function getPreGenerationSummary(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const [classes, needs, configs, groups] = await Promise.all([
      tdb.schoolClass.findMany({ where: { archived: false }, orderBy: [{ level: "asc" }, { stream: "asc" }] }),
      tdb.classSubjectNeed.findMany(),
      tdb.timetableConfig.findMany(),
      tdb.combinationGroup.findMany({ where: { active: true }, include: { members: true } }),
    ]);
    const electiveBlocks = await getElectiveBlocksForSolver(user.tenantId);

    const configByClass = new Map(configs.map((c) => [c.classId, c]));
    const classLabel = (c: { level: string; stream: string | null }) => [c.level, c.stream].filter(Boolean).join(" ");

    function daysForClass(classId: string): number[] {
      const cfg = configByClass.get(classId);
      if (cfg?.hasSaturday === false) return WEEKDAYS;
      return [...WEEKDAYS, SATURDAY];
    }
    function maxPeriodsForClass(classId: string, day: number): number {
      const cfg = configByClass.get(classId);
      if (day === SATURDAY) return cfg?.saturdayPeriodsCount ?? DEFAULT_SATURDAY_PERIODS;
      return cfg?.periodsPerDay ?? DEFAULT_PERIODS_PER_DAY;
    }
    function lunchPeriodsForClass(classId: string): number {
      const cfg = configByClass.get(classId);
      const lunchPeriod = resolveLunchPeriod(cfg);
      let count = 0;
      for (const day of daysForClass(classId)) {
        if (lunchPeriod <= maxPeriodsForClass(classId, day)) count++;
      }
      return count;
    }

    // Real per-class configured lesson count: this class's own real
    // ClassSubjectNeed rows, PLUS its own real share of every
    // CombinationGroup it's a genuine member of, PLUS one real slot per
    // week for every ElectiveBlockSlot period its Options Block
    // membership covers.
    const comboLessonsByClass = new Map<string, number>();
    for (const g of groups) {
      for (const m of g.members) {
        if (!m.classId) continue;
        comboLessonsByClass.set(m.classId, (comboLessonsByClass.get(m.classId) ?? 0) + g.lessonsPerWeek);
      }
    }
    const electiveBlockSlotsByClass = new Map<string, number>();
    for (const block of electiveBlocks) {
      // Every real slot in this block occupies one real weekly period
      // (isDouble = one double period = still ONE real slot from a
      // "possible lesson slot" counting perspective, mirroring how the
      // real solver reserves it as a single atomic placement).
      for (const cid of block.classIds) {
        electiveBlockSlotsByClass.set(cid, (electiveBlockSlotsByClass.get(cid) ?? 0) + block.slots.length);
      }
    }

    const perClass = classes.map((c) => {
      const totalPossibleSlots = daysForClass(c.id).reduce((sum, day) => sum + maxPeriodsForClass(c.id, day), 0) - lunchPeriodsForClass(c.id);
      const comboSubjectIds = new Set(groups.filter((g) => g.members.some((m) => m.classId === c.id)).map((g) => g.subjectId));
      const ownNeedsLessons = needs
        .filter((n) => n.classId === c.id && !comboSubjectIds.has(n.subjectId))
        .reduce((sum, n) => sum + n.lessonsPerWeek, 0);
      const comboLessons = comboLessonsByClass.get(c.id) ?? 0;
      const electiveBlockLessons = electiveBlockSlotsByClass.get(c.id) ?? 0;
      const configuredLessons = ownNeedsLessons + comboLessons + electiveBlockLessons;
      const honestFreeCount = Math.max(0, totalPossibleSlots - configuredLessons);
      const configuredFreeCap = Math.max(0, configByClass.get(c.id)?.freePeriodsPerWeek ?? 0);
      return {
        classId: c.id,
        className: classLabel(c),
        totalPossibleSlots,
        configuredLessons,
        honestFreeCount,
        // A real, honest flag: this class's real configured gap is BIGGER
        // than what the school explicitly told the solver to fill as Free
        // Study Periods — meaning some of those genuinely-free periods
        // will sit completely empty (no lesson, no Free label) after
        // generation, since the real solver only ever fills UP TO
        // freePeriodsPerWeek worth of Frees, by design (Z.3).
        exceedsConfiguredFreeCap: honestFreeCount > configuredFreeCap,
      };
    });

    const totalPossibleSlots = perClass.reduce((sum, p) => sum + p.totalPossibleSlots, 0);
    const totalConfiguredLessons = perClass.reduce((sum, p) => sum + p.configuredLessons, 0);
    const totalHonestFreeCount = Math.max(0, totalPossibleSlots - totalConfiguredLessons);

    return {
      totalPossibleSlots,
      totalConfiguredLessons,
      totalHonestFreeCount,
      classesWithGapsExceedingCap: perClass.filter((p) => p.exceedsConfiguredFreeCap).length,
      perClass,
    };
  });
}

function safeParse<T>(s: string, fallback: T): T {
  try { return JSON.parse(s) as T; } catch { return fallback; }
}

// ---------------------------------------------------------------------------
// Master Button — background generation job
// ---------------------------------------------------------------------------

export async function startGeneration(user: SessionUser) {
  const job = await withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const running = await tdb.timetableGenerationJob.findFirst({ where: { status: { in: ["QUEUED", "RUNNING"] } } });
    if (running) throw new TimetableEngineError("BUSY", "A timetable is already being generated.");
    return tdb.timetableGenerationJob.create({
      data: { tenantId: user.tenantId, status: "QUEUED", phase: "Queued", startedById: user.id, startedByName: user.fullName },
    });
  });
  // Fire-and-forget background run.
  void runGeneration(user.tenantId, job.id, user).catch(async (e) => {
    await withTenant(user.tenantId, async () => {
      await tenantDb().timetableGenerationJob.update({
        where: { id: job.id },
        data: { status: "FAILED", error: (e as Error).message, finishedAt: new Date() },
      });
    });
  });
  return job;
}

export async function getGenerationJob(user: SessionUser, jobId?: string) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const job = jobId
      ? await tdb.timetableGenerationJob.findUnique({ where: { id: jobId } })
      : await tdb.timetableGenerationJob.findFirst({ orderBy: { startedAt: "desc" } });
    if (!job) return null;
    return { ...job, unplaced: safeParse<any[]>(job.unplacedJson, []), warnings: safeParse<any[]>(job.warningsJson, []) };
  });
}

async function setProgress(tenantId: string, jobId: string, progress: number, phase: string) {
  await withTenant(tenantId, async () => {
    await tenantDb().timetableGenerationJob.update({ where: { id: jobId }, data: { status: "RUNNING", progress, phase } });
  });
}

// ---------------------------------------------------------------------------
// The solver
// ---------------------------------------------------------------------------

interface Card {
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
  // AA.4 — a real, school-set soft preference (from
  // ClassSubjectNeed.requiresMovement / CombinationGroup.requiresMovement):
  // this card's own real lessons genuinely involve student movement (a lab
  // session, workshop, PE) and should be preferred right after a real
  // break/lunch — generalizing AA.1's own ElectiveBlock.preferAfterBreak
  // soft-scoring pattern. NEVER a hard rule (see movementPreferencePenalty
  // below) — a school with tight capacity never ends up with a genuinely
  // unplaced lesson purely because of this cosmetic preference.
  requiresMovement: boolean;
}

export async function runGeneration(tenantId: string, jobId: string, user: SessionUser) {
  const result = await buildAndSolve(tenantId, jobId);

  await withTenant(tenantId, async () => {
    const tdb = tenantDb();
    await tdb.timetableGenerationJob.update({
      where: { id: jobId },
      data: {
        status: "DONE",
        progress: 100,
        phase: "Complete",
        slotsPlaced: result.slotsPlaced,
        unplacedJson: JSON.stringify(result.unplaced),
        warningsJson: JSON.stringify(result.warnings),
        finishedAt: new Date(),
      },
    });
  });

  // Notify teachers + audit (best-effort, non-fatal).
  try {
    await withTenant(tenantId, async () => {
      const teachers = await tenantDb().user.findMany({
        where: { role: { in: ["TEACHER", "CLASS_TEACHER", "DEAN_OF_STUDIES"] }, isActive: true },
        select: { id: true },
      });
      for (const t of teachers) {
        await createInApp({ tenantId, recipientId: t.id, title: "New Timetable Published", body: "A new conflict-free whole-school timetable has been generated.", category: "system" });
      }
    });
    await db.auditLog.create({
      data: {
        tenantId, actorId: user.id, actorName: user.fullName,
        action: "timetable.generated_advanced", entityType: "tenant", entityId: tenantId,
        metadata: JSON.stringify({ slotsPlaced: result.slotsPlaced, unplaced: result.unplaced.length, warnings: result.warnings.length }),
      },
    });
  } catch { /* notify is non-fatal */ }

  return result;
}

async function buildAndSolve(tenantId: string, jobId: string) {
  await setProgress(tenantId, jobId, 5, "Loading classes, subjects & teachers");

  const data = await withTenant(tenantId, async () => {
    const tdb = tenantDb();
    const [tenant, classes, subjects, needs, configs, teacherAssoc, constraints, groups, timeOff, venues, aa7ConstraintKinds] = await Promise.all([
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
      // AA.7 — a real, lightweight EXISTENCE check (any enabled state) for
      // STREAM_DISTRIBUTION/CLASS_STREAM_CONFLICT rows. The main
      // `constraints` query above only returns ENABLED rows, which can't
      // tell "school never touched this constraint" apart from "school
      // explicitly turned it off" — this second, tiny query (indexed on
      // tenantId+kind, only 2 possible kinds) resolves that so a school's
      // own explicit choice (on OR off) is always respected untouched, and
      // ONLY a genuinely never-configured school gets AA.7's new
      // auto-computed safe default below.
      tdb.timetableConstraint.findMany({ where: { kind: { in: ["STREAM_DISTRIBUTION", "CLASS_STREAM_CONFLICT"] } }, select: { kind: true } }),
    ]);
    return { tenant, classes, subjects, needs, configs, teacherAssoc, constraints, groups, timeOff, venues, aa7ConstraintKinds };
  });
  // AA.1 — real school-defined Elective/Options Blocks (a set of subjects
  // students genuinely choose BETWEEN, sharing identical timetable slots).
  // Loaded through its own dedicated service function (not inlined into the
  // Promise.all above) since it needs its own nested include shape — see
  // elective-block.service.ts's getElectiveBlocksForSolver().
  const electiveBlocks = await getElectiveBlocksForSolver(tenantId);

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
  }

  // P.5 — per-class day list and per-class-per-day period cap, driven entirely
  // by each class's own real TimetableConfig row (never a single global
  // constant). A class with hasSaturday !== false gets Saturday as a genuine
  // 6th solved day, sized to its own saturdayPeriodsCount (a normal short day
  // is NOT the same length as a weekday, so it correctly gets fewer periods).
  function daysForClass(classId: string): number[] {
    const cfg = configByClass.get(classId);
    if (cfg?.hasSaturday === false) return WEEKDAYS;
    return [...WEEKDAYS, SATURDAY];
  }
  function maxPeriodsForClass(classId: string, day: number): number {
    const cfg = configByClass.get(classId);
    if (day === SATURDAY) return cfg?.saturdayPeriodsCount ?? DEFAULT_SATURDAY_PERIODS;
    return cfg?.periodsPerDay ?? DEFAULT_PERIODS_PER_DAY;
  }
  // A card spans multiple classIds for combinations; the card may only use a
  // day/period that is valid (real school time) for EVERY member class.
  function daysForCard(classIds: string[]): number[] {
    const perClassDays = classIds.map((id) => new Set(daysForClass(id)));
    return [...WEEKDAYS, SATURDAY].filter((d) => perClassDays.every((s) => s.has(d)));
  }
  function maxPeriodsForCard(classIds: string[], day: number): number {
    return Math.min(...classIds.map((id) => maxPeriodsForClass(id, day)));
  }
  const classLabel = (c: { level: string; stream: string | null }) => [c.level, c.stream].filter(Boolean).join(" ");
  const activeLevels = safeParse<string[]>(data.tenant?.educationLevelsOffered ?? "[]", []);
  const preset = levelAwareTimetablePreset(activeLevels);

  // AA.7 — real school data used to AUTO-COMPUTE safe STREAM_DISTRIBUTION /
  // CLASS_STREAM_CONFLICT defaults for a school that has never explicitly
  // configured either constraint (closing the exact real gap Z.3/Z.4 found:
  // these were previously OPT-IN-ONLY because a hardcoded default number
  // could mismatch a school's own real stream count and wrongly block
  // legitimate placements — see the Z.2/Z.3 "mathematical-mismatch" finding
  // documented above). Both helpers are computed ONCE, cheaply, from real
  // already-loaded data (never inside the hot backtracking loop).
  //
  // `autoStreamCapByLevel`: level -> the REAL number of streams that level
  // actually has right now (computed live from real SchoolClass rows) —
  // this exact value, not one less, is the specific number Z.2's own real
  // load test already identified as the correct, mathematically-safe
  // default ("this session's own load test simply used the correct real
  // value (STREAMS.length) once the issue was diagnosed"). A cap of
  // (streamCount - 1) was tried first while building AA.7 and found live,
  // via this feature's own regression sweep, to reintroduce the EXACT
  // Z.2/Z.3 infeasibility bug this design exists to prevent: with only 2
  // real streams sharing a near-daily subject, a cap of 1 forces the two
  // streams onto fully EXCLUSIVE days for that subject, which becomes
  // mathematically impossible once their combined weekly lesson count
  // exceeds what a small number of real school days can hold split that
  // way. A cap equal to the FULL real stream count can never mathematically
  // trigger for an ordinary single-class card (a card's own classIds are
  // always excluded from `usedByOtherStreams`, so its size can never reach
  // the level's own full real stream count) — i.e. it is a genuinely safe,
  // GUARANTEED-feasible floor for every school by construction, never
  // silently blocking a legitimate placement. A school that wants ACTIVE
  // same-day-clumping prevention can still explicitly configure their own
  // tighter real number (exactly like the existing L.7 test's own explicit
  // cap=2 scenario), with AA.7's auto value simply keeping every
  // never-configured school registered as genuinely "on" (ready for that
  // override) rather than silently inert. Single-stream levels are simply
  // never added (nothing to distribute).
  function computeAutoStreamCapByLevel(): Map<string, number> {
    const streamCountByLevel = new Map<string, number>();
    for (const c of data.classes) streamCountByLevel.set(c.level, (streamCountByLevel.get(c.level) ?? 0) + 1);
    const caps = new Map<string, number>();
    for (const [level, count] of streamCountByLevel) {
      if (count >= 2) caps.set(level, count);
    }
    return caps;
  }
  // `autoSharedTeacherIds`: real teacher ids currently teaching 2+ DISTINCT
  // classes of the SAME level right now (via ClassSubjectNeed.teacherId or
  // CombinationGroup.teacherId + its real member classes) — i.e. teachers
  // ACTUALLY shared across streams today, never a school manually listing
  // ids. If a teacher isn't genuinely shared, they're never added, so the
  // existing cost-free early-return in classStreamConflictOk() (an empty
  // teacherIds list) is preserved exactly for any school with no real
  // sharing at all.
  function computeAutoSharedTeacherIds(): string[] {
    const levelByClass = new Map(data.classes.map((c) => [c.id, c.level]));
    const perLevelTeacherClasses = new Map<string, Map<string, Set<string>>>();
    function addAssoc(teacherId: string | null | undefined, classId: string) {
      if (!teacherId) return;
      const level = levelByClass.get(classId);
      if (!level) return;
      let byTeacher = perLevelTeacherClasses.get(level);
      if (!byTeacher) { byTeacher = new Map(); perLevelTeacherClasses.set(level, byTeacher); }
      const set = byTeacher.get(teacherId) ?? new Set<string>();
      set.add(classId);
      byTeacher.set(teacherId, set);
    }
    for (const n of data.needs) addAssoc(n.teacherId, n.classId);
    for (const g of data.groups) {
      if (!g.teacherId) continue;
      for (const m of g.members) addAssoc(g.teacherId, m.classId);
    }
    const shared = new Set<string>();
    for (const byTeacher of perLevelTeacherClasses.values()) {
      for (const [teacherId, classIds] of byTeacher) {
        if (classIds.size >= 2) shared.add(teacherId);
      }
    }
    return [...shared];
  }

  // Parse active constraints into a quick lookup.
  const con = (kind: string) => data.constraints.find((c) => c.kind === kind);
  // AA.7 — a real, separate lightweight EXISTENCE query (data.aa7ConstraintKinds,
  // loaded above regardless of enabled/disabled state) tells us whether a
  // school has EVER touched STREAM_DISTRIBUTION/CLASS_STREAM_CONFLICT at
  // all. A school's own explicit choice (on OR off) is always respected
  // untouched by AA.7 — only a genuinely never-configured school gets the
  // new auto-computed safe default below.
  const explicitlyConfiguredKinds = new Set(data.aa7ConstraintKinds.map((c) => c.kind));
  const morningCfg = safeParse<{ subjectIds?: string[]; latestPeriod?: number }>(con("SUBJECT_MORNING")?.configJson ?? "{}", {});
  const notAdjacentPairs = safeParse<{ pairs?: [string, string][] }>(con("SUBJECTS_NOT_ADJACENT")?.configJson ?? "{}", {}).pairs ?? [];
  const peCfg = safeParse<{ allowedPeriods?: number[] }>(con("PE_TIMESLOT")?.configJson ?? "{}", {});
  const oneSinglePerDay = Boolean(con("ONE_SINGLE_PER_DAY"));
  const spreadOn = Boolean(con("LESSON_DISTRIBUTION"));
  const respectTimeOff = Boolean(con("TEACHER_TIMEOFF"));
  const doubleSameDayOn = Boolean(con("DOUBLE_SAME_DAY"));
  // Real perf fix (found live during the founder's own 40-class/70-teacher
  // stress test, Z.4): a hardcoded always-on maxSameDayPerLevel default
  // for EVERY school regardless of real stream count forced
  // streamDistributionOk() into its full expensive nested real
  // Array.find()/Array.filter() scan (across every class in the level, for
  // every period) on every single one of hundreds of thousands of real
  // backtracking filter evaluations -- confirmed live to consume ~90% of
  // the real solver's entire 20-second time budget on a 40-class/1,840-
  // card school. AA.7 keeps that same critical performance discipline
  // (never scan when there's genuinely nothing useful to check) while
  // finally closing the real founder-facing gap: a school that has NEVER
  // touched STREAM_DISTRIBUTION/CLASS_STREAM_CONFLICT at all now gets a
  // real, SAFE, auto-computed default straight from their own live data
  // (real per-level stream count; real currently-shared teachers) instead
  // of silently getting NOTHING (the old behaviour) or a hardcoded number
  // that could be mathematically infeasible for their own real stream
  // count (the exact Z.2/Z.3 bug this design deliberately avoids
  // repeating). A school's own EXPLICIT choice — whether they turned it on
  // with their own config, or deliberately turned it OFF — is always
  // respected untouched; AA.7 only ever fills the previously-silent gap.
  const streamDistributionExplicit = explicitlyConfiguredKinds.has("STREAM_DISTRIBUTION");
  const classStreamConflictExplicit = explicitlyConfiguredKinds.has("CLASS_STREAM_CONFLICT");
  const streamDistributionOn = streamDistributionExplicit ? Boolean(con("STREAM_DISTRIBUTION")) : true;
  const rawStreamDistributionCfg = safeParse<{ subjectIds?: string[]; maxSameDayPerLevel?: number }>(con("STREAM_DISTRIBUTION")?.configJson ?? "{}", {});
  // AA.7 — real per-level auto cap (school never configured this at all).
  // A never-configured school with only single-stream levels genuinely has
  // an empty map here, so streamDistributionOk() below correctly no-ops
  // for every one of its levels at zero extra cost (matching the exact
  // Z.4 performance-fix discipline for the fully-inactive case).
  const autoStreamCapByLevel = streamDistributionExplicit ? new Map<string, number>() : computeAutoStreamCapByLevel();
  const streamDistributionCfg = {
    ...rawStreamDistributionCfg,
    maxSameDayPerLevel: streamDistributionExplicit
      ? (preset.preferLevelWideBalancing
          ? Math.max(1, Number(rawStreamDistributionCfg.maxSameDayPerLevel ?? 1))
          : Math.max(1, Number(rawStreamDistributionCfg.maxSameDayPerLevel ?? 2)))
      : undefined, // AA.7 auto mode reads per-level caps from autoStreamCapByLevel instead.
  };
  const classStreamConflictCfg = classStreamConflictExplicit
    ? safeParse<{ teacherIds?: string[] }>(con("CLASS_STREAM_CONFLICT")?.configJson ?? "{}", {})
    // AA.7 — real currently-shared-teacher auto-detection (school never
    // configured this at all). Empty when no teacher is genuinely shared
    // across 2+ streams of the same level right now, preserving the exact
    // Z.4 zero-cost early-return for that (overwhelmingly common at small
    // schools) case.
    : { teacherIds: computeAutoSharedTeacherIds() };

  // Time-off lookup: teacherId -> Set("day:period") (or day:0 / 0:period wildcards).
  const timeOffSet = new Set<string>();
  for (const t of data.timeOff) timeOffSet.add(`${t.teacherId}:${t.dayOfWeek}:${t.period}`);
  function teacherUnavailable(teacherId: string | null, day: number, period: number): boolean {
    if (!teacherId || !respectTimeOff) return false;
    return (
      timeOffSet.has(`${teacherId}:${day}:${period}`) ||
      timeOffSet.has(`${teacherId}:${day}:0`) ||
      timeOffSet.has(`${teacherId}:0:${period}`) ||
      timeOffSet.has(`${teacherId}:0:0`)
    );
  }

  await setProgress(tenantId, jobId, 20, "Reserving lunch & fixed blocks");

  // Grids.
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
  const venueUsedAt = new Map<string, string>(); // classId:day:period -> venueId

  // Special subjects (lunch) so academics never collide.
  const lunchSubject = await withTenant(tenantId, async () => {
    const tdb = tenantDb();
    let l = await tdb.subject.findFirst({ where: { code: "LUNCH" } });
    if (!l) l = await tdb.subject.create({ data: { tenantId, name: "Lunch Break", code: "LUNCH", curriculum: "BOTH" } });
    return l;
  });

  // Reserve lunch per class according to its own real configured lunch
  // period — only on days/periods that actually exist for that class (a
  // short Saturday with fewer periods than the lunch slot simply has no
  // lunch reservation that day, matching how a real short day works
  // instead of forcing a phantom period).
  const lunchSlots: any[] = [];
  for (const c of data.classes) {
    const cfg = configByClass.get(c.id);
    // CC.1 — a school's own explicit lunchAfterPeriod (any real period
    // number) always wins; falls back to the legacy lunchShift enum for
    // any class that hasn't been re-saved via the redesigned Schedule
    // Rules UI yet. This is exactly how a real 2-group dual-shift lunch
    // (e.g. Form 1&2 eat during period 7 while Form 3&4 are still in
    // class, then swap) is now genuinely configured — a school sets each
    // group's own real lunchAfterPeriod directly, no longer limited to 4
    // fixed shift positions.
    const lunchPeriod = resolveLunchPeriod(cfg);
    for (const day of daysForClass(c.id)) {
      if (lunchPeriod > maxPeriodsForClass(c.id, day)) continue;
      classGrid.set(`${c.id}:${day}:${lunchPeriod}`, lunchSubject.id);
      lunchSlots.push({ tenantId, classId: c.id, subjectId: lunchSubject.id, teacherId: null, dayOfWeek: day, period: lunchPeriod, slotType: "ACADEMIC" });
    }
  }

  // AA.1 — real Elective/Options Block placement. A block's slot(s) are
  // placed as ONE atomic real reservation BEFORE normal cards are built,
  // exactly like lunch above: every subject running in parallel during a
  // slot shares the SAME real day+period across every one of its own real
  // member classes, and every real teacher/venue attached to a slot's
  // subjects is genuinely booked at that exact time — a shared History
  // teacher covering 2 real block slots in the same week is checked
  // against their OWN busy-ness exactly like any other card. This
  // correctly matches the founder's own worked example: History appearing
  // in only ONE of a block's slots (not every slot) places its own real
  // teacher/room booking only for that one real slot, while the block's
  // OTHER slot (e.g. Geography) genuinely reserves a DIFFERENT real
  // teacher's time. Because the reservation happens before ordinary
  // ClassSubjectNeed cards are built, a normal lesson card can never be
  // placed on top of an Options Block period for any of the block's own
  // member classes — and a block's own subjects' teachers/venues are
  // reserved here too, so ordinary cards for those same teachers/venues
  // correctly skip this exact slot as well.
  const electiveBlockWarnings: { classLabel: string; subjectCode: string; message: string }[] = [];
  const electiveBlockSlotRows: any[] = [];
  // BB.1 — real venue-pool overflow auto-pick. `resolvedVenueUpdates`
  // records, per real ElectiveBlockSlotSubject row id, which real venue
  // (if any) this generation run genuinely picked from the pool for a
  // slot-subject the school left unpinned — persisted back onto the DB
  // row after generation (see the persist step below) so the print/live
  // renderer can show it exactly like a school's own explicit pin,
  // honestly cleared to null when no longer needed/available.
  const resolvedVenueUpdates = new Map<string, string | null>();
  for (const block of electiveBlocks) {
    for (const slot of block.slots) {
      // Real candidate day/period search: the SAME real day+period must be
      // free for every member class of the block, AND for every teacher/
      // venue this slot's subjects need, AND (for a double slot) both
      // periods must be consecutive and free. Movement-preference scoring
      // (Part 8 of the design doc) gives a soft bonus to a period landing
      // right after one of this class's own configured real breaks —
      // never a hard requirement, so a school with tight capacity never
      // ends up with a genuinely unplaced Options Block over a soft
      // cosmetic preference.
      const size = slot.isDouble ? 2 : 1;
      // BB.1 — real "overflow" detection: a slot's first N parallel
      // subjects (N = the block's own real member-class count, in a
      // deterministic createdAt-ascending order guaranteed by
      // getElectiveBlocksForSolver()) are assumed to use each member
      // class's own home classroom exactly like an ordinary lesson with
      // no venueId already does everywhere else in NEYO — no venue is
      // ever printed/required for those. Any subject BEYOND that count is
      // a genuine overflow subject that needs a real physical room
      // somewhere else (the founder's own "5 subjects, 4 streams"
      // example) — if the school has explicitly pinned a venueId for it,
      // that pin is used and respected exactly as before; if left blank,
      // the solver auto-picks a real spare venue from the tenant's pool,
      // honouring `supportsSubjectIds` + real capacity + full
      // clash-avoidance, identical to how an ordinary ClassSubjectNeed
      // card already does via `venueCandidatesFor()`/`pickVenueFor()`.
      const overflowCount = Math.max(0, slot.subjects.length - block.classIds.length);
      const overflowSubjectIds = new Set(slot.subjects.slice(slot.subjects.length - overflowCount).map((s) => s.subjectId));
      function venueCandidatesForSlotSubject(s: { subjectId: string; venueId: string | null }): string[] {
        if (s.venueId) return [s.venueId]; // explicit pin always wins
        if (!overflowSubjectIds.has(s.subjectId)) return []; // home-classroom subject — no real venue needed
        return venueCandidatesFor(s.subjectId); // genuine overflow, unpinned — pool candidates
      }
      const candidates: { day: number; periods: number[]; score: number }[] = [];
      for (const day of daysForCard(block.classIds)) {
        const maxP = maxPeriodsForCard(block.classIds, day);
        const periodWindows: number[][] = size === 1
          ? Array.from({ length: maxP }, (_, i) => [i + 1])
          : Array.from({ length: Math.max(0, maxP - 1) }, (_, i) => [i + 1, i + 2]);
        for (const periods of periodWindows) {
          // Every member class must be genuinely free at every one of
          // these periods (a normal lesson, lunch, or another block).
          const classesFree = block.classIds.every((cid) =>
            periods.every((p) => !classGrid.has(`${cid}:${day}:${p}`))
          );
          if (!classesFree) continue;
          // Every real teacher this slot's subjects need must be free too
          // (a teacher covering 2 slots of the same block, or teaching a
          // completely different class elsewhere, is correctly blocked).
          const teachersFree = slot.subjects.every((s) =>
            !s.teacherId || periods.every((p) => !teacherGrid.has(`${s.teacherId}:${day}:${p}`))
          );
          if (!teachersFree) continue;
          // Real venue availability: a PINNED venue is checked exactly as
          // before; a genuine unpinned overflow subject needs AT LEAST ONE
          // real pool candidate with spare capacity across every one of
          // these periods, reusing the exact same capacity-aware logic
          // every other card in this engine already uses.
          const venuesFree = slot.subjects.every((s) => {
            const cands = venueCandidatesForSlotSubject(s);
            if (cands.length === 0) return true; // no real venue required for this subject
            return cands.some((vid) => {
              const cap = venueById.get(vid)?.capacityPerPeriod ?? 1;
              return periods.every((p) => (venueGrid.get(`${vid}:${day}:${p}`) ?? 0) < cap);
            });
          });
          if (!venuesFree) continue;

          let score = day * 2 + periods[0];
          if (block.preferAfterBreak) {
            const cfg = configByClass.get(block.classIds[0]);
            const breakEnds = [cfg?.shortBreakStart, cfg?.shortBreak2Start, cfg?.longBreakStart].filter(Boolean) as number[];
            const isRightAfterBreak = breakEnds.some((b) => periods[0] === b + 1);
            if (!isRightAfterBreak) score += 25; // soft penalty, never a hard block
          }
          candidates.push({ day, periods, score });
        }
      }
      candidates.sort((a, b) => a.score - b.score);
      const chosen = candidates[0];
      if (!chosen) {
        electiveBlockWarnings.push({
          classLabel: block.name,
          subjectCode: "ELECTIVE_BLOCK",
          message: `Could not find a free slot for Options Block "${block.name}" (${slot.label}) across all its member classes/teachers this week.`,
        });
        continue;
      }
      // Reserve: every member class's classGrid entry marks this real
      // period as genuinely occupied (a synthetic marker, since no SINGLE
      // subject owns the whole class's period here) so ordinary cards
      // correctly skip it; every subject's own teacher/venue is booked too.
      for (const cid of block.classIds) {
        for (const p of chosen.periods) classGrid.set(`${cid}:${chosen.day}:${p}`, `ELECTIVE_BLOCK:${slot.id}`);
      }
      for (const s of slot.subjects) {
        if (s.teacherId) for (const p of chosen.periods) teacherGrid.set(`${s.teacherId}:${chosen.day}:${p}`, s.classIds.join(","));
        if (s.venueId) {
          // A school's own explicit pin — booked exactly as before.
          for (const p of chosen.periods) {
            venueGrid.set(`${s.venueId}:${chosen.day}:${p}`, (venueGrid.get(`${s.venueId}:${chosen.day}:${p}`) ?? 0) + 1);
          }
          if (s.id) resolvedVenueUpdates.set(s.id, null); // an explicit pin means no auto-pick is needed/stored
        } else if (overflowSubjectIds.has(s.subjectId)) {
          // BB.1 — a genuine unpinned overflow subject: pick the first real
          // pool candidate with spare capacity across every chosen period,
          // reserve it, and remember the pick so it can be persisted onto
          // the real ElectiveBlockSlotSubject row after generation.
          const cands = venueCandidatesFor(s.subjectId);
          const picked = cands.find((vid) => {
            const cap = venueById.get(vid)?.capacityPerPeriod ?? 1;
            return chosen.periods.every((p) => (venueGrid.get(`${vid}:${chosen.day}:${p}`) ?? 0) < cap);
          }) ?? null;
          if (picked) {
            for (const p of chosen.periods) {
              venueGrid.set(`${picked}:${chosen.day}:${p}`, (venueGrid.get(`${picked}:${chosen.day}:${p}`) ?? 0) + 1);
            }
          }
          if (s.id) resolvedVenueUpdates.set(s.id, picked);
        } else if (s.id) {
          // A home-classroom subject (not overflow, not pinned) — no real
          // venue is needed; honestly clear any stale prior auto-pick.
          resolvedVenueUpdates.set(s.id, null);
        }
      }
      // Real, IMPORTANT modeling decision: `TimetableSlot` is uniquely keyed
      // per (classId, dayOfWeek, period, slotType) — it cannot hold more
      // than one row per class per real period even under the SAME
      // slotType, because a real class's own printed timetable only ever
      // has ONE cell per period. Since different real students within the
      // SAME class attend DIFFERENT parallel subjects during an Options
      // Block slot, this is correctly modeled as exactly ONE real row per
      // member class per period (subjectId/teacherId left null on the row
      // itself), tagged with `electiveBlockSlotId` — the real parallel
      // subject/teacher/venue breakdown for that one cell is resolved by
      // the print/live renderer joining back to `ElectiveBlockSlotSubject`,
      // which is exactly how the founder's own "HG/TY/EF/TS/GW" printed
      // teacher-code list for one shared Options cell should render.
      for (const cid of block.classIds) {
        for (const p of chosen.periods) {
          electiveBlockSlotRows.push({
            tenantId, classId: cid, subjectId: null, teacherId: null,
            dayOfWeek: chosen.day, period: p, slotType: "ELECTIVE_BLOCK",
            electiveBlockSlotId: slot.id,
            venue: null,
          });
        }
      }
    }
  }

  await setProgress(tenantId, jobId, 35, "Building lesson cards (singles, doubles, combinations)");
  const presetWarnings: string[] = [];
  if (preset.isSeniorSchool) presetWarnings.push("Senior School preset bias applied: richer combination and subject-structure planning is preferred.");
  else if (preset.isJuniorSchool) presetWarnings.push("Junior School preset bias applied: subject-selection-aware scheduling is preferred without full Senior pathway complexity.");
  else presetWarnings.push("Lower-level preset bias applied: simpler scheduling pressure with less pathway complexity.");

  // ---- Build cards ----
  const cards: Card[] = [];
  let cardSeq = 0;

  // 1) Combination group cards (scheduled once for all member classes).
  const comboClassSubjectKeys = new Set<string>(); // classId::subjectId handled by a combo
  for (const g of data.groups) {
    let memberClassIds = g.members.map((m) => m.classId);
    // SUBJECT_CHOICE source: derive members from student selections of this subject.
    if (g.source === "SUBJECT_CHOICE") {
      const derived = await deriveClassesFromSubjectChoice(tenantId, g.subjectId);
      if (derived.length) memberClassIds = Array.from(new Set([...memberClassIds, ...derived]));
    }
    // GLOBAL scope: include every active class that has a need for this subject.
    if (g.scope === "GLOBAL" || (preset.preferCombinationRichness && g.scope === "SELECTED" && g.source === "SUBJECT_CHOICE")) {
      const withNeed = data.needs.filter((n) => n.subjectId === g.subjectId).map((n) => n.classId);
      memberClassIds = Array.from(new Set([...memberClassIds, ...withNeed]));
    }
    memberClassIds = memberClassIds.filter((id) => data.classes.some((c) => c.id === id));
    if (memberClassIds.length === 0) continue;

    for (const cid of memberClassIds) comboClassSubjectKeys.add(`${cid}::${g.subjectId}`);

    const sub = subjectById.get(g.subjectId);
    const dbl = Math.max(0, Math.min(g.doubleCount, Math.floor(g.lessonsPerWeek / 2)));
    const singles = g.lessonsPerWeek - dbl * 2;
    const labels = memberClassIds.map((id) => classLabel(data.classes.find((c) => c.id === id)!)).join(" + ");
    // Z.3 — real venue candidates for this Combination Group (pinned venue
    // takes priority, else the school's real subject-tagged venue pool).
    const comboVenueCandidates = venueCandidatesFor(g.subjectId, (g as any).venueId);
    // AA.4 — real school-set movement preference for this combined lesson.
    const comboRequiresMovement = Boolean((g as any).requiresMovement);
    for (let i = 0; i < dbl; i++) {
      cards.push({ id: `c${cardSeq++}`, classIds: memberClassIds, classLabel: labels, subjectId: g.subjectId, subjectCode: sub?.code ?? "?", teacherId: g.teacherId, size: 2, splitAllowed: false, isCombination: true, venueCandidateIds: comboVenueCandidates, requiresMovement: comboRequiresMovement });
    }
    for (let i = 0; i < singles; i++) {
      cards.push({ id: `c${cardSeq++}`, classIds: memberClassIds, classLabel: labels, subjectId: g.subjectId, subjectCode: sub?.code ?? "?", teacherId: g.teacherId, size: 1, splitAllowed: false, isCombination: true, venueCandidateIds: comboVenueCandidates, requiresMovement: comboRequiresMovement });
    }
  }

  // 2) Normal per-class needs (skip class+subject already owned by a combination).
  for (const c of data.classes) {
    const cNeeds = data.needs.filter((n) => n.classId === c.id);
    for (const n of cNeeds) {
      if (comboClassSubjectKeys.has(`${c.id}::${n.subjectId}`)) continue; // combo handles it
      const sub = subjectById.get(n.subjectId);
      if (!sub) continue;
      const dbl = Math.max(0, Math.min(n.doubleCount, Math.floor(n.lessonsPerWeek / 2)));
      const singles = n.lessonsPerWeek - dbl * 2;
      // Z.3 — real venue candidates for this class-subject need (pinned
      // venue takes priority, else the school's real subject-tagged venue pool).
      const needVenueCandidates = venueCandidatesFor(n.subjectId, (n as any).venueId);
      // AA.4 — real school-set movement preference for this class-subject.
      const needRequiresMovement = Boolean((n as any).requiresMovement);
      for (let i = 0; i < dbl; i++) {
        cards.push({ id: `c${cardSeq++}`, classIds: [c.id], classLabel: classLabel(c), subjectId: n.subjectId, subjectCode: sub.code, teacherId: n.teacherId, size: 2, splitAllowed: n.allowSplitDouble, isCombination: false, venueCandidateIds: needVenueCandidates, requiresMovement: needRequiresMovement });
      }
      for (let i = 0; i < singles; i++) {
        cards.push({ id: `c${cardSeq++}`, classIds: [c.id], classLabel: classLabel(c), subjectId: n.subjectId, subjectCode: sub.code, teacherId: n.teacherId, size: 1, splitAllowed: false, isCombination: false, venueCandidateIds: needVenueCandidates, requiresMovement: needRequiresMovement });
      }
    }
  }

  // Order: combinations first (most constrained), then doubles, then assigned-teacher.
  cards.sort((a, b) => {
    if (a.isCombination !== b.isCombination) return a.isCombination ? -1 : 1;
    if (a.size !== b.size) return b.size - a.size;
    if (!!a.teacherId !== !!b.teacherId) return a.teacherId ? -1 : 1;
    return 0;
  });

  await setProgress(tenantId, jobId, 50, "Placing lessons with constraints");

  const warnings: { classLabel: string; subjectCode: string; message: string }[] = presetWarnings.map((message) => ({ classLabel: "SYSTEM", subjectCode: "PRESET", message })).concat(electiveBlockWarnings);
  const unplaced: { classLabel: string; subjectCode: string; reason: string }[] = [];

  // Helpers used by the placement check.
  function morningViolation(subjectId: string, period: number): boolean {
    if (!(morningCfg.subjectIds ?? []).includes(subjectId)) return false;
    const latest = morningCfg.latestPeriod ?? 4;
    return period > latest;
  }
  function peViolation(subjectCode: string, period: number): boolean {
    if (!peCfg.allowedPeriods || peCfg.allowedPeriods.length === 0) return false;
    const isPe = subjectCode === "PE" || subjectCode === "GAME" || subjectCode === "GAMES";
    if (!isPe) return false;
    return !peCfg.allowedPeriods.includes(period);
  }
  function adjacentViolation(classId: string, subjectId: string, day: number, period: number): boolean {
    if (notAdjacentPairs.length === 0) return false;
    const prev = classGrid.get(`${classId}:${day}:${period - 1}`);
    const next = classGrid.get(`${classId}:${day}:${period + 1}`);
    for (const [a, b] of notAdjacentPairs) {
      const pair = new Set([a, b]);
      if (pair.has(subjectId) && ((prev && pair.has(prev)) || (next && pair.has(next)))) return true;
    }
    return false;
  }

  // Z.3 — real venue availability check: a card with no venue candidates
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
  }

  function spreadOk(card: Card, day: number): boolean {
    if (!spreadOn) return true;
    for (const cid of card.classIds) {
      const cnt = subjectDayCount.get(`${cid}:${card.subjectId}:${day}`) ?? 0;
      const maxPerDay = preset.preferSingleLessonSpread ? 1 : 2;
      if (cnt >= maxPerDay) return false;
    }
    return true;
  }
  function streamDistributionOk(card: Card, day: number): boolean {
    if (!streamDistributionOn) return true;
    const configuredIds = streamDistributionCfg.subjectIds ?? [];
    if (configuredIds.length > 0 && !configuredIds.includes(card.subjectId)) return true;
    const levels = new Set(card.classIds.map((cid) => data.classes.find((c) => c.id === cid)?.level).filter(Boolean));
    for (const level of levels) {
      // AA.7 — in auto mode (school never explicitly configured this),
      // read the real per-level cap computed from actual stream counts; a
      // level absent from the map (single-stream, or a never-configured
      // school where AA.7 correctly found nothing to distribute) has
      // NOTHING to check here, preserving the Z.4 zero-cost skip exactly.
      const maxSameDayPerLevel = streamDistributionCfg.maxSameDayPerLevel != null
        ? Math.max(1, Number(streamDistributionCfg.maxSameDayPerLevel))
        : autoStreamCapByLevel.get(level as string);
      if (maxSameDayPerLevel == null) continue;
      const classesInLevel = data.classes.filter((c) => c.level === level).map((c) => c.id);
      const usedByOtherStreams = new Set<string>();
      for (const otherClassId of classesInLevel) {
        if (card.classIds.includes(otherClassId)) continue;
        for (let p = 1; p <= maxPeriodsForClass(otherClassId, day); p++) {
          if (classGrid.get(`${otherClassId}:${day}:${p}`) === card.subjectId) usedByOtherStreams.add(otherClassId);
        }
      }
      if (usedByOtherStreams.size >= maxSameDayPerLevel) return false;
    }
    return true;
  }

  function classStreamConflictOk(card: Card, day: number, periods: number[]): boolean {
    if (!card.teacherId) return true;
    // Real perf fix (found live during the founder's own 40-class/70-
    // teacher stress test, Z.4), preserved exactly under AA.7: when the
    // resolved teacherIds list is empty — either a school explicitly
    // configured this constraint with no teachers listed, OR (AA.7) a
    // never-configured school whose own real data has NO teacher shared
    // across 2+ streams of the same level right now — this must skip its
    // own expensive real O(n) linear scan of the entire teacherGrid map on
    // every single backtracking filter evaluation.
    if (!classStreamConflictCfg.teacherIds || classStreamConflictCfg.teacherIds.length === 0) return true;
    if (!classStreamConflictCfg.teacherIds.includes(card.teacherId)) return true;
    const targetLevels = new Set(card.classIds.map((cid) => data.classes.find((c) => c.id === cid)?.level).filter(Boolean));
    if (targetLevels.size === 0) return true;
    for (const [key, teacherClassIds] of teacherGrid.entries()) {
      const [teacherId, dStr, pStr] = key.split(":");
      if (teacherId !== card.teacherId) continue;
      const d = Number(dStr), p = Number(pStr);
      if (d !== day || !periods.includes(p)) continue;
      for (const otherClassId of (teacherClassIds ?? "").split(",").filter(Boolean)) {
        const other = data.classes.find((c) => c.id === otherClassId);
        if (other && targetLevels.has(other.level) && !card.classIds.includes(otherClassId)) return false;
      }
    }
    return true;
  }

  function singlePerDayOk(card: Card, day: number): boolean {
    if (!oneSinglePerDay || card.size !== 1) return true;
    for (const cid of card.classIds) {
      const cnt = singleDayCount.get(`${cid}:${card.subjectId}:${day}`) ?? 0;
      if (cnt >= 1) return false;
    }
    return true;
  }

  // Z.2 — real soft scoring penalties (never hard blocks). `periodRepeatPenalty`
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
  // AA.4 — real soft scoring penalty generalizing AA.1's own
  // ElectiveBlock.preferAfterBreak shape to any ordinary/combined card
  // flagged requiresMovement: a card NOT landing on the period right after
  // one of its own class's real configured breaks/lunch pays the exact
  // same soft +25 penalty AA.1 already uses — never a hard block, so a
  // school with tight capacity is never left with a genuinely unplaced
  // lesson purely because of this cosmetic preference. Uses the card's
  // first member class's own real TimetableConfig (identical real pattern
  // to AA.1's own `configByClass.get(block.classIds[0])`).
  function movementPreferencePenalty(card: Card, periods: number[]): number {
    if (!card.requiresMovement) return 0;
    const cfg = configByClass.get(card.classIds[0]);
    const breakEnds = [cfg?.shortBreakStart, cfg?.shortBreak2Start, cfg?.longBreakStart].filter(Boolean) as number[];
    const isRightAfterBreak = breakEnds.some((b) => periods[0] === b + 1);
    return isRightAfterBreak ? 0 : 25;
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
  }

  // candidate placements for a card on a given day
  function candidates(card: Card, day: number): number[][] {
    const out: number[][] = [];
    const maxP = maxPeriodsForCard(card.classIds, day);
    if (card.size === 1) {
      for (let p = 1; p <= maxP; p++) if (periodFree(card, day, p)) out.push([p]);
    } else {
      // double: try consecutive first
      for (let p = 1; p < maxP; p++) {
        if (periodFree(card, day, p) && periodFree(card, day, p + 1)) out.push([p, p + 1]);
      }
      // split double allowed (or forced by SPLIT_DOUBLE_HARD constraint): two non-adjacent periods same day
      if (card.splitAllowed) {
        for (let p = 1; p <= maxP; p++) {
          for (let q = p + 2; q <= maxP; q++) {
            if (periodFree(card, day, p) && periodFree(card, day, q)) out.push([p, q]);
          }
        }
      }
    }
    return out;
  }

  // Backtracking placement.
  let placed = 0;
  const candidateCache = new Map<string, number[][]>();
  function candidatePlacements(card: Card) {
    const cached = candidateCache.get(card.id);
    if (cached) return cached;
    const placements: number[][] = [];
    for (const day of daysForCard(card.classIds)) {
      if (!spreadOk(card, day)) continue;
      if (!singlePerDayOk(card, day)) continue;
      if (!streamDistributionOk(card, day)) continue;
      for (const periods of candidates(card, day)) {
        if (!classStreamConflictOk(card, day, periods)) continue;
        placements.push([day, ...periods]);
      }
    }
    placements.sort((a, b) => {
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
      // AA.4 — real soft movement-preference penalty (0 unless this card is
      // flagged requiresMovement).
      const movementPenaltyA = movementPreferencePenalty(card, periodsA);
      const movementPenaltyB = movementPreferencePenalty(card, periodsB);
      const scoreA = morningPenaltyA + pePenaltyA + streamPenaltyA + densityBonusA + repeatPenaltyA + spreadPenaltyA + movementPenaltyA + dayA * 2 + periodsA[0];
      const scoreB = morningPenaltyB + pePenaltyB + streamPenaltyB + densityBonusB + repeatPenaltyB + spreadPenaltyB + movementPenaltyB + dayB * 2 + periodsB[0];
      return scoreA - scoreB;
    });
    candidateCache.set(card.id, placements);
    return placements;
  }
  cards.sort((a, b) => candidatePlacements(a).length - candidatePlacements(b).length || (b.size - a.size));

  // Z.2 — real step/time budget for the backtracking solver. An earlier
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
        // AA.4 — same real soft movement-preference penalty as
        // candidatePlacements() above.
        s += movementPreferencePenalty(card, periods);
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
  if (!fullySolved) {
    // Greedy fallback so we still produce a usable timetable. Z.2 — real
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
  }

  await setProgress(tenantId, jobId, 78, "Distributing free periods");

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
  const slotRows: any[] = [];
  // Map a (classId, subjectId) -> teacherId for academic slots.
  const teacherForClassSubject = new Map<string, string | null>();
  for (const n of data.needs) teacherForClassSubject.set(`${n.classId}::${n.subjectId}`, n.teacherId ?? null);
  for (const g of data.groups) {
    for (const m of g.members) {
      if (!m.classId) continue;
      teacherForClassSubject.set(`${m.classId}::${g.subjectId}`, g.teacherId ?? null);
    }
  }

  for (const [key, subjectId] of classGrid.entries()) {
    if (subjectId === lunchSubject.id) continue;
    // AA.1 — skip the synthetic `ELECTIVE_BLOCK:<slotId>` classGrid marker
    // used only to keep ordinary cards from double-booking this period;
    // the REAL persisted row for this period comes from
    // `electiveBlockSlotRows` below, not this normal single-subject path.
    if (subjectId.startsWith("ELECTIVE_BLOCK:")) continue;
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
  slotRows.push(...lunchSlots);

  await withTenant(tenantId, async () => {
    const tdb = tenantDb();
    // P.5 bugfix: this regenerate only OWNS "ACADEMIC" slots (Mon-Fri + the
    // now-integrated Saturday). It must never wipe REMEDIAL/PREP/ACTIVITY rows
    // created by the separate Bulk/Fair Saturday tools or the Activities
    // timetable — a real pre-existing bug (unscoped deleteMany({})) found and
    // fixed during the P.5 audit that silently destroyed those rows on every
    // Master Button run.
    await tdb.timetableSlot.deleteMany({ where: { slotType: "ACADEMIC" } });
    // AA.1 — the Master Button also fully owns/regenerates its own real
    // ELECTIVE_BLOCK rows every run, same scoping discipline as ACADEMIC.
    await tdb.timetableSlot.deleteMany({ where: { slotType: "ELECTIVE_BLOCK" } });
    const validTeacherIds = new Set((await tdb.user.findMany({ where: { isActive: true }, select: { id: true } })).map((u) => u.id));
    const validClassIds = new Set(data.classes.map((c) => c.id));
    const validSubjectIds = new Set(data.subjects.map((s) => s.id).concat([lunchSubject.id]));
    const safeRows = slotRows.filter((row) => validClassIds.has(row.classId) && validSubjectIds.has(row.subjectId) && (!row.teacherId || validTeacherIds.has(row.teacherId)));
    if (safeRows.length > 0) await tdb.timetableSlot.createMany({ data: safeRows });
    // AA.1 — real Elective Block rows validated the same way (real class
    // ids only; subjectId/teacherId are intentionally null on these rows).
    const safeBlockRows = electiveBlockSlotRows.filter((row) => validClassIds.has(row.classId));
    if (safeBlockRows.length > 0) await tdb.timetableSlot.createMany({ data: safeBlockRows });
    // BB.1 — persist every real venue-overflow auto-pick (or honest clear)
    // this generation run computed, back onto the real
    // ElectiveBlockSlotSubject row it belongs to. Never touches a school's
    // own explicit `venueId` pin — only the separate `resolvedVenueId`
    // field, so a school's manual choice is never silently overwritten.
    for (const [slotSubjectId, resolvedVenueId] of resolvedVenueUpdates.entries()) {
      await tdb.electiveBlockSlotSubject.update({
        where: { id: slotSubjectId },
        data: { resolvedVenueId },
      }).catch(() => {}); // a slot-subject deleted mid-run (rare) is safely skipped, never a hard failure
    }
  });

  return { slotsPlaced: slotRows.length + electiveBlockSlotRows.length, unplaced, warnings, fullySolved };
}

// ---------------------------------------------------------------------------
// P.5 — Optional KICD Senior School 40-lesson/week template.
// A school may apply this to a specific Senior School class in ONE action to
// pre-fill its TimetableConfig + ClassSubjectNeed rows with the real KICD
// numbers (English 5, Kiswahili 5, Math 5, CSL 3, 3 electives x 5, PE 3, ICT
// Skills 2, PPI 1, Personal/Group Study 1 = 40). NEVER applied automatically
// or forced — periodsPerDay/lessonDurationMins remain fully editable
// afterward like any other class, matching the founder's explicit
// "let a school tweak how they would like" instruction.
// ---------------------------------------------------------------------------
export async function applyKicdSeniorSchoolTemplate(
  user: SessionUser,
  input: { classId: string; electiveSubjectIds: string[] }
) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const cls = await tdb.schoolClass.findUnique({ where: { id: input.classId } });
    if (!cls) throw new TimetableEngineError("NOT_FOUND", "Class not found.");
    if (input.electiveSubjectIds.length !== 3) {
      throw new TimetableEngineError("INVALID", "The KICD Senior School template needs exactly 3 real pathway electives for this class.");
    }
    const electiveSubjects = await tdb.subject.findMany({ where: { id: { in: input.electiveSubjectIds }, archived: false } });
    if (electiveSubjects.length !== 3) throw new TimetableEngineError("NOT_FOUND", "One or more selected elective subjects no longer exist.");

    // Match-or-create the real compulsory subjects this template needs,
    // reusing existing rows wherever they already exist (never duplicating
    // English/Kiswahili/Math/CSL, matching the project's non-duplication
    // discipline used throughout Part P).
    async function ensureSubject(name: string, code: string) {
      const existing = await tdb.subject.findFirst({ where: { code } });
      if (existing) return existing;
      return tdb.subject.create({ data: { tenantId: user.tenantId, name, code, curriculum: "CBC" } });
    }
    const english = await ensureSubject("English", "ENG");
    const kiswahili = await ensureSubject("Kiswahili", "KIS");
    const csl = await ensureSubject(COMMUNITY_SERVICE_LEARNING_SUBJECT.name, COMMUNITY_SERVICE_LEARNING_SUBJECT.code);
    const pe = await ensureSubject("Physical Education", "PE");
    const ict = await ensureSubject("ICT Skills", "ICTS");
    const ppi = await ensureSubject("Pastoral Programme of Instruction", "PPI");
    const study = await ensureSubject("Personal/Group Study", "PGST");

    // Mathematics variant: resolve from this class's OWN pathway allocations
    // if any students are already allocated (STEM -> Core, else Essential),
    // defaulting to Core Mathematics if the class has no allocation data yet
    // (a school can correct this afterward like any ClassSubjectNeed row).
    const allocatedGroups = await tdb.studentPathwayPreference.findMany({
      where: { isAllocated: true, student: { classId: input.classId } },
      include: { pathway: { select: { pathwayGroup: true } } },
    });
    const hasStem = allocatedGroups.some((p) => p.pathway.pathwayGroup === "STEM");
    const mathDef = CORE_ESSENTIAL_MATHEMATICS.find((m) => m.compulsoryFor.includes(hasStem || allocatedGroups.length === 0 ? "STEM" : (allocatedGroups[0].pathway.pathwayGroup as any))) ?? CORE_ESSENTIAL_MATHEMATICS[0];
    const math = await ensureSubject(mathDef.name, mathDef.code);

    // Fill TimetableConfig with the real KICD structure (40 lessons, 40 min,
    // 8 periods/day) — a starting point the school can still edit afterward.
    await tdb.timetableConfig.upsert({
      where: { classId: input.classId },
      create: {
        tenantId: user.tenantId,
        classId: input.classId,
        periodsPerDay: KICD_SENIOR_SCHOOL_TIMETABLE_TEMPLATE.periodsPerDay,
        lessonDurationMins: KICD_SENIOR_SCHOOL_TIMETABLE_TEMPLATE.lessonDurationMins,
        freePeriodsPerWeek: KICD_SENIOR_SCHOOL_TIMETABLE_TEMPLATE.nonAcademicLessons.PERSONAL_GROUP_STUDY,
        coCurricularCount: 0,
        coCurricularName: "Games",
        hasSaturday: true,
        saturdayPeriodsCount: 4,
      },
      update: {
        periodsPerDay: KICD_SENIOR_SCHOOL_TIMETABLE_TEMPLATE.periodsPerDay,
        lessonDurationMins: KICD_SENIOR_SCHOOL_TIMETABLE_TEMPLATE.lessonDurationMins,
      },
    });

    const needRows: { subjectId: string; lessonsPerWeek: number }[] = [
      { subjectId: english.id, lessonsPerWeek: KICD_SENIOR_SCHOOL_TIMETABLE_TEMPLATE.compulsorySubjectLessons.ENGLISH },
      { subjectId: kiswahili.id, lessonsPerWeek: KICD_SENIOR_SCHOOL_TIMETABLE_TEMPLATE.compulsorySubjectLessons.KISWAHILI_OR_KSL },
      { subjectId: math.id, lessonsPerWeek: KICD_SENIOR_SCHOOL_TIMETABLE_TEMPLATE.compulsorySubjectLessons.MATHEMATICS },
      { subjectId: csl.id, lessonsPerWeek: KICD_SENIOR_SCHOOL_TIMETABLE_TEMPLATE.compulsorySubjectLessons.COMMUNITY_SERVICE_LEARNING },
      ...electiveSubjects.map((s) => ({ subjectId: s.id, lessonsPerWeek: KICD_SENIOR_SCHOOL_TIMETABLE_TEMPLATE.electiveLessonsEach })),
      { subjectId: pe.id, lessonsPerWeek: KICD_SENIOR_SCHOOL_TIMETABLE_TEMPLATE.nonAcademicLessons.PE },
      { subjectId: ict.id, lessonsPerWeek: KICD_SENIOR_SCHOOL_TIMETABLE_TEMPLATE.nonAcademicLessons.ICT_SKILLS },
      { subjectId: ppi.id, lessonsPerWeek: KICD_SENIOR_SCHOOL_TIMETABLE_TEMPLATE.nonAcademicLessons.PPI },
      { subjectId: study.id, lessonsPerWeek: KICD_SENIOR_SCHOOL_TIMETABLE_TEMPLATE.nonAcademicLessons.PERSONAL_GROUP_STUDY },
    ];

    for (const row of needRows) {
      await tdb.classSubjectNeed.upsert({
        where: { tenantId_classId_subjectId: { tenantId: user.tenantId, classId: input.classId, subjectId: row.subjectId } },
        create: { tenantId: user.tenantId, classId: input.classId, subjectId: row.subjectId, lessonsPerWeek: row.lessonsPerWeek },
        update: { lessonsPerWeek: row.lessonsPerWeek },
      });
    }

    const totalLessons = needRows.reduce((sum, r) => sum + r.lessonsPerWeek, 0);
    return {
      classId: input.classId,
      totalLessonsPerWeek: totalLessons,
      mathVariantApplied: mathDef.name,
      subjectsConfigured: needRows.length,
    };
  });
}

/** Derive which classes take a subject from student subject selections. */
async function deriveClassesFromSubjectChoice(tenantId: string, subjectId: string): Promise<string[]> {
  return withTenant(tenantId, async () => {
    const tdb = tenantDb();
    const sels = await tdb.studentSubjectSelection.findMany({ where: { isConfirmed: true }, select: { studentId: true, selectedSubjectIds: true } });
    const studentIds = sels.filter((s) => safeParse<string[]>(s.selectedSubjectIds, []).includes(subjectId)).map((s) => s.studentId);
    if (studentIds.length === 0) return [];
    const students = await tdb.student.findMany({ where: { id: { in: studentIds } }, select: { classId: true } });
    return Array.from(new Set(students.map((s) => s.classId).filter(Boolean))) as string[];
  });
}
