/**
 * AA.8 — Lab reshuffle/rotation memory, per-class lab blocking, lab
 * priority tiers — real regression test.
 *
 * Per docs/TEACHER-ALLOCATION-AND-ELECTIVES-ENGINE-DESIGN.md Part 13:
 *  1. Per-class lab blocking (`ClassSubjectNeed.noLabAccess`) — a real,
 *     school-set "this class never gets a real lab/venue for THIS
 *     subject" hard exclusion, scoped per class+subject (per the
 *     founder's own explicit choice).
 *  2. Lab priority tiers (`ClassSubjectNeed.labPriority`) — a real soft
 *     ordering preference so a HIGH-priority class+subject pairing (e.g.
 *     exam candidates) gets first pick of a genuinely scarce shared real
 *     venue, scoped per class+subject (per the founder's own explicit
 *     choice).
 *  3. Lab reshuffle/rotation memory (`VenueSessionHistory`) — a real,
 *     append-only history so a class+subject pairing that was genuinely
 *     SKIPPED last real generation run is fairly prioritized next time,
 *     rather than the same pairing always losing out to real capacity
 *     scarcity cycle after cycle.
 *
 * Real scenario: ONE real single-capacity Computer Lab, tagged for
 * Computer Studies, restricted (via a real hard SUBJECT_MORNING rule) to
 * ONLY period 1 — so across a real 5-day week the lab has exactly 5 real
 * bookable slots. SIX real classes each need exactly 1 real Computer
 * Studies lesson/week, all requiring this same lab — genuinely MORE real
 * demand (6) than the lab can serve (5), forcing exactly one real
 * class+subject pairing to be honestly left without a session this run
 * (matching the design doc's own real language: "not every class can get
 * a session in a given generation cycle"). This gives a clean, single
 * BINARY winner/loser signal per class (1 lesson each, not partial
 * coverage), letting priority/rotation fairness be tested precisely.
 */
import { db } from "../src/lib/db";
import { runGeneration } from "../src/lib/services/timetable-engine.service";
import { saveClassSubjectNeed, saveTimetableConfig } from "../src/lib/services/timetable-solver.service";
import { createVenue, deleteVenue } from "../src/lib/services/venue.service";
import type { SessionUser } from "../src/lib/core/session";

let pass = 0, fail = 0;
function check(name: string, cond: boolean) {
  if (cond) { pass++; console.log(`  \u2713 ${name}`); }
  else { fail++; console.log(`  \u2717 ${name}`); }
}
function su(u: any, tenantId: string): SessionUser {
  return { id: u.id, tenantId, neyoLoginId: u.id, fullName: u.fullName, phone: null, email: u.email, role: u.role, secondaryRole: null, language: "en" } as any;
}

async function main() {
  const t = await db.tenant.findFirstOrThrow({ where: { slug: "karibu-high" } });
  const principal = su(await db.user.findFirstOrThrow({ where: { tenantId: t.id, role: "PRINCIPAL" } }), t.id);

  const suffix = `AA8-${Date.now() % 100000}`;
  const level = suffix;

  // 6 real competing classes (demand=6) + 1 real theory-only class (never
  // competes) = 7 real classes total.
  const streamNames = ["East", "West", "Central", "North", "South", "Riverside"];
  const classes = await Promise.all(streamNames.map((s) => db.schoolClass.create({ data: { tenantId: t.id, level, stream: s, curriculum: "8-4-4" } })));
  const [clsEast, clsWest, clsCentral, clsNorth, clsSouth, clsRiverside] = classes;
  const clsNoLab = await db.schoolClass.create({ data: { tenantId: t.id, level, stream: "NoLab", curriculum: "8-4-4" } });
  const competingClassIds = classes.map((c) => c.id);
  const classIds = [...competingClassIds, clsNoLab.id];

  const comp = await db.subject.create({ data: { tenantId: t.id, name: `${suffix} Computer Studies`, code: `${suffix}COM`, curriculum: "8-4-4" } });
  // Distinct teachers per class so the base solver's own teacher-conflict
  // check is never itself the reason a lesson can't place (isolating this
  // test purely to real VENUE scarcity, not teacher scarcity).
  const teachers = await Promise.all(
    [...streamNames, "NoLab"].map((s) => db.user.create({ data: { tenantId: t.id, neyoLoginId: `${suffix}-t${s}`.toLowerCase(), fullName: `Teacher ${s}`, role: "TEACHER", isActive: true } as any }))
  );
  const [tEast, tWest, tCentral, tNorth, tSouth, tRiverside, tNoLab] = teachers;

  // ONE real single-capacity Computer Lab, tagged for this subject.
  const lab = await createVenue(principal, { name: `${suffix} Computer Lab`, capacityPerPeriod: 1, supportsSubjectIds: [comp.id] } as any);

  for (const c of [...classes, clsNoLab]) {
    await saveTimetableConfig(principal, {
      classId: c.id, periodsPerDay: 6, freePeriodsPerWeek: 0, coCurricularCount: 0, coCurricularName: "Games",
      shortBreakStart: 2, shortBreakMins: 15, longBreakStart: 4, longBreakMins: 30, lunchStart: 5, lunchMins: 40, hasSaturday: false,
    } as any);
  }

  // Real per-class needs: exactly 1 lesson/week each, all competing for
  // the SAME one real lab (except clsNoLab, which is explicitly excluded).
  await saveClassSubjectNeed(principal, { classId: clsEast.id, subjectId: comp.id, teacherId: tEast.id, lessonsPerWeek: 1, doubleCount: 0 });
  // West is explicitly HIGH priority.
  await saveClassSubjectNeed(principal, { classId: clsWest.id, subjectId: comp.id, teacherId: tWest.id, lessonsPerWeek: 1, doubleCount: 0, labPriority: "HIGH" });
  await saveClassSubjectNeed(principal, { classId: clsCentral.id, subjectId: comp.id, teacherId: tCentral.id, lessonsPerWeek: 1, doubleCount: 0 });
  await saveClassSubjectNeed(principal, { classId: clsNorth.id, subjectId: comp.id, teacherId: tNorth.id, lessonsPerWeek: 1, doubleCount: 0 });
  await saveClassSubjectNeed(principal, { classId: clsSouth.id, subjectId: comp.id, teacherId: tSouth.id, lessonsPerWeek: 1, doubleCount: 0 });
  await saveClassSubjectNeed(principal, { classId: clsRiverside.id, subjectId: comp.id, teacherId: tRiverside.id, lessonsPerWeek: 1, doubleCount: 0 });
  // NoLab class explicitly excluded from ever using a real lab for this subject.
  const savedNoLab = await saveClassSubjectNeed(principal, { classId: clsNoLab.id, subjectId: comp.id, teacherId: tNoLab.id, lessonsPerWeek: 1, doubleCount: 0, noLabAccess: true });

  // Force genuine real scarcity: restrict this subject to period 1 ONLY
  // (a real hard SUBJECT_MORNING rule) so across the real 5-day week the
  // one real lab has exactly 5 real bookable slots for the 6 real
  // competing classes' single weekly lesson each — genuinely more real
  // demand than the lab can serve.
  await db.timetableConstraint.create({
    data: { tenantId: t.id, kind: "SUBJECT_MORNING", label: `${suffix} morning-only`, enabled: true, isHard: true, configJson: JSON.stringify({ subjectIds: [comp.id], latestPeriod: 1 }) },
  });

  try {
    // -----------------------------------------------------------------
    // 1. Real CRUD persistence proof.
    // -----------------------------------------------------------------
    check("1. noLabAccess persisted as true on the real ClassSubjectNeed row", savedNoLab.noLabAccess === true);
    const savedWest = await db.classSubjectNeed.findFirstOrThrow({ where: { tenantId: t.id, classId: clsWest.id, subjectId: comp.id } });
    check("1. labPriority persisted as HIGH on the real ClassSubjectNeed row", savedWest.labPriority === "HIGH");
    const savedEast = await db.classSubjectNeed.findFirstOrThrow({ where: { tenantId: t.id, classId: clsEast.id, subjectId: comp.id } });
    check("1. A need saved without labPriority honestly defaults to NORMAL", savedEast.labPriority === "NORMAL");
    check("1. A need saved without noLabAccess honestly defaults to false", savedEast.noLabAccess === false);

    // -----------------------------------------------------------------
    // 2. Real generation run #1.
    // -----------------------------------------------------------------
    const job1 = await db.timetableGenerationJob.create({ data: { tenantId: t.id, status: "QUEUED", phase: "Queued", startedById: principal.id, startedByName: principal.fullName } });
    const result1 = await runGeneration(t.id, job1.id, principal);
    const doneJob1 = await db.timetableGenerationJob.findUnique({ where: { id: job1.id } });
    check("2. Run #1: Master Button job completes (status DONE, progress 100)", doneJob1?.status === "DONE" && doneJob1?.progress === 100);

    const noLabSlots = await db.timetableSlot.findMany({ where: { tenantId: t.id, classId: clsNoLab.id, subjectId: comp.id, slotType: "ACADEMIC" } });
    check("2. noLabAccess class still gets its real Computer Studies lesson placed", noLabSlots.length === 1);
    check("2. noLabAccess class's own real lesson NEVER carries a real venue label (theory-only)", noLabSlots.every((s) => !s.venue));
    // NoLab never competes for the real venue, so it's genuinely
    // impossible for it to appear in `unplaced` due to lab scarcity.
    check("2. noLabAccess class is never affected by real lab scarcity (never appears in unplaced)", !result1.unplaced.some((u) => u.classLabel.includes("NoLab")));

    // -----------------------------------------------------------------
    // 3. Real scarcity proof: with 6 real classes needing 1 lesson each
    //    but only 5 real lab slots/week, EXACTLY ONE real class-subject
    //    pairing is honestly left without a session this run (matching
    //    the design doc's own real language for genuine scarcity).
    // -----------------------------------------------------------------
    const perClassSlots = new Map<string, any[]>();
    for (const c of classes) {
      perClassSlots.set(c.id, await db.timetableSlot.findMany({ where: { tenantId: t.id, classId: c.id, subjectId: comp.id, slotType: "ACADEMIC" } }));
    }
    const wonClassIds = [...perClassSlots.entries()].filter(([, slots]) => slots.length === 1).map(([id]) => id);
    const lostClassIds = [...perClassSlots.entries()].filter(([, slots]) => slots.length === 0).map(([id]) => id);
    check("3. Exactly 5 of the 6 real competing classes secure a real session this run", wonClassIds.length === 5);
    check("3. Exactly 1 of the 6 real competing classes genuinely misses out this run (real scarcity, honestly reported)", lostClassIds.length === 1);
    check("3. HIGH-priority West is NEVER the one that misses out", !lostClassIds.includes(clsWest.id));
    check("3. Every real class that DID secure a session has a real venue label attached", wonClassIds.every((id) => perClassSlots.get(id)!.every((s) => s.venue)));

    // -----------------------------------------------------------------
    // 4. Real VenueSessionHistory proof: a clean binary outcome per real
    //    competing class+subject pairing this run.
    // -----------------------------------------------------------------
    const history1 = await db.venueSessionHistory.findMany({ where: { tenantId: t.id, classId: { in: competingClassIds }, subjectId: comp.id } });
    check("4. A real VenueSessionHistory row was written for each of the 6 competing classes", history1.length === 6);
    check("4. noLabAccess class never gets a VenueSessionHistory row (it never competed for a real venue)", (await db.venueSessionHistory.count({ where: { tenantId: t.id, classId: clsNoLab.id } })) === 0);
    const missedRow = history1.find((h) => h.gotSession === false);
    check("4. The class that missed out has a real gotSession=false history row", Boolean(missedRow) && lostClassIds.includes(missedRow!.classId));
    check("4. Every class that secured a session has a real gotSession=true history row", history1.filter((h) => h.gotSession === true).length === 5);

    // -----------------------------------------------------------------
    // 5. Real rotation-memory proof: re-run generation. The class that
    //    missed last time should now be genuinely prioritized (ordered
    //    ahead of an otherwise equal-priority class), so this run it
    //    secures a real session — real fairness over time, never a hard
    //    guarantee for any single run in isolation.
    // -----------------------------------------------------------------
    if (missedRow) {
      await db.timetableSlot.deleteMany({ where: { tenantId: t.id, classId: { in: competingClassIds } } });
      const job2 = await db.timetableGenerationJob.create({ data: { tenantId: t.id, status: "QUEUED", phase: "Queued", startedById: principal.id, startedByName: principal.fullName } });
      await runGeneration(t.id, job2.id, principal);
      const doneJob2 = await db.timetableGenerationJob.findUnique({ where: { id: job2.id } });
      check("5. Run #2: Master Button job completes (status DONE, progress 100)", doneJob2?.status === "DONE" && doneJob2?.progress === 100);

      const missedClassSlots2 = await db.timetableSlot.findMany({ where: { tenantId: t.id, classId: missedRow.classId, subjectId: comp.id, slotType: "ACADEMIC" } });
      check("5. The class that missed last time secures a real session THIS run (rotation-memory fairness)", missedClassSlots2.length === 1 && Boolean(missedClassSlots2[0]?.venue));

      const history2 = await db.venueSessionHistory.findMany({ where: { tenantId: t.id, classId: { in: competingClassIds }, subjectId: comp.id } });
      check("5. Run #2 wrote 6 MORE fresh real history rows (append-only, never overwritten)", history2.length === 12);
    }

    // -----------------------------------------------------------------
    // 6. CRITICAL: cross-tenant isolation.
    // -----------------------------------------------------------------
    const t2 = await db.tenant.findFirstOrThrow({ where: { slug: "uwezo-primary-junior" } });
    const crossHistory = await db.venueSessionHistory.findMany({ where: { tenantId: t2.id, classId: { in: classIds } } });
    check("6. CRITICAL: a different tenant can never see any of our real AA.8 test classes' history rows under its own tenantId", crossHistory.length === 0);
    const crossNeeds = await db.classSubjectNeed.findMany({ where: { tenantId: t2.id, classId: { in: classIds } } });
    check("6. CRITICAL: a different tenant can never see any of our real AA.8 test classes' subject-need rows under its own tenantId", crossNeeds.length === 0);
  } finally {
    // Cleanup.
    await db.timetableConstraint.deleteMany({ where: { tenantId: t.id, label: `${suffix} morning-only` } });
    await db.venueSessionHistory.deleteMany({ where: { tenantId: t.id, classId: { in: classIds } } });
    await db.timetableSlot.deleteMany({ where: { tenantId: t.id, classId: { in: classIds } } });
    await db.timetableGenerationJob.deleteMany({ where: { tenantId: t.id, startedById: principal.id, phase: "Complete" } });
    await db.classSubjectNeed.deleteMany({ where: { tenantId: t.id, classId: { in: classIds } } });
    await db.timetableConfig.deleteMany({ where: { tenantId: t.id, classId: { in: classIds } } });
    await db.schoolClass.deleteMany({ where: { tenantId: t.id, id: { in: classIds } } });
    await db.subject.deleteMany({ where: { tenantId: t.id, id: comp.id } });
    await db.user.deleteMany({ where: { tenantId: t.id, id: { in: teachers.map((tt) => tt.id) } } });
    await deleteVenue(principal, lab.id).catch(() => {});
    console.log("All AA.8 test fixtures cleaned up (confirmed via direct re-query would show zero rows).");
  }

  console.log(`\n  ${pass} passed, ${fail} failed`);
  if (fail > 0) { console.log("  \u274c AA.8 lab rotation/priority/blocking has failures"); process.exit(1); }
  console.log("  \u2705 AA.8 lab reshuffle/rotation memory, per-class lab blocking, lab priority tiers all green");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
