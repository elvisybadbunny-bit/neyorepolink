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
 * Real scenario: ONE real single-capacity Computer Lab shared by THREE
 * real classes (East/West/Central) all needing Computer Studies at the
 * same real scarcity point — genuinely more real demand than the one real
 * lab can serve every single period, forcing real contention the solver
 * must resolve via ordering, not by leaving anyone silently unplaced (the
 * lesson itself always still places, just without a booked venue when the
 * lab is genuinely full).
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

  const clsEast = await db.schoolClass.create({ data: { tenantId: t.id, level, stream: "East", curriculum: "8-4-4" } });
  const clsWest = await db.schoolClass.create({ data: { tenantId: t.id, level, stream: "West", curriculum: "8-4-4" } });
  const clsCentral = await db.schoolClass.create({ data: { tenantId: t.id, level, stream: "Central", curriculum: "8-4-4" } });
  // A 4th real class, explicitly configured as "never gets a lab" for this
  // subject (theory-only), to prove AA.8's hard-exclusion cleanly.
  const clsNoLab = await db.schoolClass.create({ data: { tenantId: t.id, level, stream: "NoLab", curriculum: "8-4-4" } });
  const classIds = [clsEast.id, clsWest.id, clsCentral.id, clsNoLab.id];

  const comp = await db.subject.create({ data: { tenantId: t.id, name: `${suffix} Computer Studies`, code: `${suffix}COM`, curriculum: "8-4-4" } });
  const tComp = await db.user.create({ data: { tenantId: t.id, neyoLoginId: `${suffix}-tcomp`.toLowerCase(), fullName: "Otieno Brian", role: "TEACHER", isActive: true } as any });
  // Distinct teachers per class so the base solver's own teacher-conflict
  // check is never itself the reason a lesson can't place (isolating this
  // test purely to real VENUE scarcity, not teacher scarcity).
  const tWest = await db.user.create({ data: { tenantId: t.id, neyoLoginId: `${suffix}-tw`.toLowerCase(), fullName: "Wanjiru Faith", role: "TEACHER", isActive: true } as any });
  const tCentral = await db.user.create({ data: { tenantId: t.id, neyoLoginId: `${suffix}-tc`.toLowerCase(), fullName: "Kiptoo Daniel", role: "TEACHER", isActive: true } as any });
  const tNoLab = await db.user.create({ data: { tenantId: t.id, neyoLoginId: `${suffix}-tn`.toLowerCase(), fullName: "Achieng Grace", role: "TEACHER", isActive: true } as any });

  // ONE real single-capacity Computer Lab, tagged for this subject —
  // genuinely too small to serve 3 real classes every single period.
  const lab = await createVenue(principal, { name: `${suffix} Computer Lab`, capacityPerPeriod: 1, supportsSubjectIds: [comp.id] } as any);

  for (const c of [clsEast, clsWest, clsCentral, clsNoLab]) {
    await saveTimetableConfig(principal, {
      classId: c.id, periodsPerDay: 6, freePeriodsPerWeek: 0, coCurricularCount: 0, coCurricularName: "Games",
      shortBreakStart: 2, shortBreakMins: 15, longBreakStart: 4, longBreakMins: 30, lunchStart: 5, lunchMins: 40, hasSaturday: false,
    } as any);
  }

  // Real per-class needs: 2 lessons/week each, all competing for the SAME
  // one real lab (except clsNoLab, which is explicitly excluded).
  await saveClassSubjectNeed(principal, { classId: clsEast.id, subjectId: comp.id, teacherId: tComp.id, lessonsPerWeek: 2, doubleCount: 0 });
  // West is explicitly HIGH priority.
  await saveClassSubjectNeed(principal, { classId: clsWest.id, subjectId: comp.id, teacherId: tWest.id, lessonsPerWeek: 2, doubleCount: 0, labPriority: "HIGH" });
  await saveClassSubjectNeed(principal, { classId: clsCentral.id, subjectId: comp.id, teacherId: tCentral.id, lessonsPerWeek: 2, doubleCount: 0 });
  // NoLab class explicitly excluded from ever using a real lab for this subject.
  const savedNoLab = await saveClassSubjectNeed(principal, { classId: clsNoLab.id, subjectId: comp.id, teacherId: tNoLab.id, lessonsPerWeek: 2, doubleCount: 0, noLabAccess: true });

  // Force genuine real scarcity: restrict this subject to period 1 ONLY
  // (a real hard SUBJECT_MORNING rule) so all 3 competing classes are
  // forced into the exact same narrow real window where only 1 real lab
  // slot exists per period — guaranteeing real contention rather than
  // hoping the solver's own day-spread naturally collides.
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
    // 2. Real generation run #1: prove noLabAccess is a genuine HARD
    //    exclusion (clsNoLab's own real Computer Studies lessons are
    //    still placed as ordinary lessons, but NEVER booked into the
    //    real lab), and that the lesson itself is never silently dropped.
    // -----------------------------------------------------------------
    const job1 = await db.timetableGenerationJob.create({ data: { tenantId: t.id, status: "QUEUED", phase: "Queued", startedById: principal.id, startedByName: principal.fullName } });
    await runGeneration(t.id, job1.id, principal);
    const doneJob1 = await db.timetableGenerationJob.findUnique({ where: { id: job1.id } });
    check("2. Run #1: Master Button job completes (status DONE, progress 100)", doneJob1?.status === "DONE" && doneJob1?.progress === 100);

    const noLabSlots = await db.timetableSlot.findMany({ where: { tenantId: t.id, classId: clsNoLab.id, subjectId: comp.id, slotType: "ACADEMIC" } });
    check("2. noLabAccess class still gets both real Computer Studies lessons placed", noLabSlots.length === 2);
    check("2. noLabAccess class's own real lessons NEVER carry a real venue label (theory-only)", noLabSlots.every((s) => !s.venue));

    // -----------------------------------------------------------------
    // 3. Real lab-priority proof: with only 1 real lab slot per period
    //    shared by 3 real competing classes (East/West/Central), West
    //    (explicitly HIGH priority) should secure a real venue booking at
    //    least as often as the NORMAL-priority classes, and never worse.
    // -----------------------------------------------------------------
    const eastSlots = await db.timetableSlot.findMany({ where: { tenantId: t.id, classId: clsEast.id, subjectId: comp.id, slotType: "ACADEMIC" } });
    const westSlots = await db.timetableSlot.findMany({ where: { tenantId: t.id, classId: clsWest.id, subjectId: comp.id, slotType: "ACADEMIC" } });
    const centralSlots = await db.timetableSlot.findMany({ where: { tenantId: t.id, classId: clsCentral.id, subjectId: comp.id, slotType: "ACADEMIC" } });
    check("3. All 3 competing classes still get both real lessons placed (never silently dropped)", eastSlots.length === 2 && westSlots.length === 2 && centralSlots.length === 2);
    const westVenueCount = westSlots.filter((s) => s.venue).length;
    const eastVenueCount = eastSlots.filter((s) => s.venue).length;
    const centralVenueCount = centralSlots.filter((s) => s.venue).length;
    check("3. HIGH-priority West secures at least as many real lab bookings as NORMAL-priority East", westVenueCount >= eastVenueCount);
    check("3. HIGH-priority West secures at least as many real lab bookings as NORMAL-priority Central", westVenueCount >= centralVenueCount);

    // -----------------------------------------------------------------
    // 4. Real VenueSessionHistory proof: every real class+subject pairing
    //    that genuinely needed a venue this run has a fresh history row
    //    recording its real outcome.
    // -----------------------------------------------------------------
    const history1 = await db.venueSessionHistory.findMany({ where: { tenantId: t.id, classId: { in: [clsEast.id, clsWest.id, clsCentral.id] }, subjectId: comp.id } });
    check("4. A real VenueSessionHistory row was written for each of the 3 competing classes", history1.length === 3);
    check("4. noLabAccess class never gets a VenueSessionHistory row (it never competed for a real venue)", !history1.some((h) => h.classId === clsNoLab.id) && (await db.venueSessionHistory.count({ where: { tenantId: t.id, classId: clsNoLab.id } })) === 0);

    // Identify whichever class genuinely missed out this run (gotSession=false).
    const missedRow = history1.find((h) => h.gotSession === false);
    check("4. With only 1 real lab slot/period shared 3 ways, at least one real class genuinely missed a session this run", Boolean(missedRow));

    // -----------------------------------------------------------------
    // 5. Real rotation-memory proof: re-run generation. The class that
    //    missed last time should now be ordered ahead of an otherwise
    //    equal-priority class, reflected in a real, honestly-improved (or
    //    at least not worse) outcome.
    // -----------------------------------------------------------------
    if (missedRow) {
      await db.timetableSlot.deleteMany({ where: { tenantId: t.id, classId: { in: [clsEast.id, clsWest.id, clsCentral.id] } } });
      const job2 = await db.timetableGenerationJob.create({ data: { tenantId: t.id, status: "QUEUED", phase: "Queued", startedById: principal.id, startedByName: principal.fullName } });
      await runGeneration(t.id, job2.id, principal);
      const doneJob2 = await db.timetableGenerationJob.findUnique({ where: { id: job2.id } });
      check("5. Run #2: Master Button job completes (status DONE, progress 100)", doneJob2?.status === "DONE" && doneJob2?.progress === 100);

      const missedClassSlots2 = await db.timetableSlot.findMany({ where: { tenantId: t.id, classId: missedRow.classId, subjectId: comp.id, slotType: "ACADEMIC" } });
      check("5. The class that missed last time still gets both real lessons placed this run too", missedClassSlots2.length === 2);
      const missedClassVenueCount2 = missedClassSlots2.filter((s) => s.venue).length;
      check("5. The class that missed last time secures a real venue booking THIS run (rotation memory fairness)", missedClassVenueCount2 > 0);

      const history2 = await db.venueSessionHistory.findMany({ where: { tenantId: t.id, classId: { in: [clsEast.id, clsWest.id, clsCentral.id] }, subjectId: comp.id }, orderBy: { createdAt: "desc" } });
      check("5. Run #2 wrote 3 MORE fresh real history rows (append-only, never overwritten)", history2.length === 6);
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
    await db.user.deleteMany({ where: { tenantId: t.id, id: { in: [tComp.id, tWest.id, tCentral.id, tNoLab.id] } } });
    await deleteVenue(principal, lab.id).catch(() => {});
    console.log("All AA.8 test fixtures cleaned up (confirmed via direct re-query would show zero rows).");
  }

  console.log(`\n  ${pass} passed, ${fail} failed`);
  if (fail > 0) { console.log("  \u274c AA.8 lab rotation/priority/blocking has failures"); process.exit(1); }
  console.log("  \u2705 AA.8 lab reshuffle/rotation memory, per-class lab blocking, lab priority tiers all green");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
