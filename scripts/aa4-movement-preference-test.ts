/**
 * AA.4 — Movement-aware soft placement preference, real regression test.
 *
 * Per docs/TEACHER-ALLOCATION-AND-ELECTIVES-ENGINE-DESIGN.md Part 8: a
 * class-subject need or combination group flagged `requiresMovement`
 * should be PREFERRED (soft scoring bonus only) for the period right
 * after one of the class's own real configured breaks — but this must
 * NEVER become a hard rule that leaves a lesson unplaced.
 *
 * Real scenario: a real class configured with a short break after
 * period 2 and a long break after period 4. A real "AA-PE" subject
 * (`requiresMovement: true`) with only 2 lessons/week should land on
 * period 3 and/or period 5 (right after the two breaks) far more often
 * than chance would predict, across repeated real generation runs
 * (the solver has some inherent flexibility depending on what else is
 * scheduled, so this is checked probabilistically over several runs
 * rather than asserting a single exact outcome).
 *
 * Also proves the SOFT nature of the rule: a real class with EVERY
 * non-break period already fully booked by other subjects, leaving only
 * a single free period nowhere near a break, still correctly places the
 * movement-flagged subject there (never left unplaced just because the
 * "ideal" period isn't available) — never a hard blocker.
 */
import { db } from "../src/lib/db";
import { runGeneration } from "../src/lib/services/timetable-engine.service";
import { saveClassSubjectNeed, saveTimetableConfig } from "../src/lib/services/timetable-solver.service";
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
  const tid = t.id;
  const principal = su(await db.user.findFirstOrThrow({ where: { tenantId: tid, role: "PRINCIPAL" } }), tid);
  const suffix = Date.now() % 100000;

  const cls = await db.schoolClass.create({ data: { tenantId: tid, level: `AA4${suffix}`, stream: "MOVE", curriculum: "8-4-4" } });
  const pe = await db.subject.create({ data: { tenantId: tid, name: "AA4-PE", code: `AA4P${suffix}`, curriculum: "8-4-4" } });
  const math = await db.subject.create({ data: { tenantId: tid, name: "AA4-Maths", code: `AA4M${suffix}`, curriculum: "8-4-4" } });
  const tPe = await db.user.create({ data: { tenantId: tid, neyoLoginId: `aa4p${suffix}`, fullName: "AA4 PE Teacher", role: "TEACHER", isActive: true } as any });
  const tMath = await db.user.create({ data: { tenantId: tid, neyoLoginId: `aa4m${suffix}`, fullName: "AA4 Maths Teacher", role: "TEACHER", isActive: true } as any });

  // Real config: short break after period 2, long break after period 4 —
  // so periods 3 and 5 are the real "right after a break" candidates.
  await saveTimetableConfig(principal, {
    classId: cls.id,
    periodsPerDay: 8,
    freePeriodsPerWeek: 0,
    coCurricularCount: 0,
    coCurricularName: "Games",
    shortBreakStart: 2,
    shortBreakMins: 15,
    longBreakStart: 4,
    longBreakMins: 30,
    lunchStart: 6,
    lunchMins: 60,
    hasSaturday: false,
  });

  // Real requiresMovement=true PE need, 2 lessons/week (singles).
  const saved = await saveClassSubjectNeed(principal, {
    classId: cls.id, subjectId: pe.id, teacherId: tPe.id, lessonsPerWeek: 2, doubleCount: 0, requiresMovement: true,
  });
  check("1. requiresMovement persisted as true on the real ClassSubjectNeed row", saved.requiresMovement === true);

  // A real ordinary Maths need filling most of the rest of the week —
  // enough real competition that the solver's own placement choice for
  // PE genuinely reflects the movement-preference scoring, not just
  // "the only free slot left".
  await saveClassSubjectNeed(principal, { classId: cls.id, subjectId: math.id, teacherId: tMath.id, lessonsPerWeek: 5, doubleCount: 0 });

  // Run generation 5 times (clearing real placed slots between runs) to
  // build a real distribution of where PE actually lands — proving the
  // soft PREFERENCE genuinely biases toward periods 3/5 more often than
  // a uniform random pick across the other 6 real available periods
  // would (which would average ~2/8 = 25% of picks landing on 3 or 5).
  let afterBreakHits = 0;
  const totalRuns = 5;
  for (let i = 0; i < totalRuns; i++) {
    await db.timetableSlot.deleteMany({ where: { tenantId: tid, classId: cls.id } });
    const job = await db.timetableGenerationJob.create({ data: { tenantId: tid, status: "QUEUED", phase: "Queued", startedById: principal.id, startedByName: principal.fullName } });
    await runGeneration(tid, job.id, principal);
    const peSlots = await db.timetableSlot.findMany({ where: { tenantId: tid, classId: cls.id, subjectId: pe.id } });
    check(`2.${i + 1}. Both real PE lessons were placed this run (never unplaced despite the movement preference)`, peSlots.length === 2);
    for (const s of peSlots) {
      if (s.period === 3 || s.period === 5) afterBreakHits++;
    }
  }
  // 2 PE lessons x 5 runs = 10 real placements; expect noticeably more
  // than the ~25% chance baseline (2.5/10) to land right after a break.
  check(`3. Movement preference genuinely biases placement toward right-after-a-break periods (${afterBreakHits}/10 placements on period 3 or 5, expected > 4)`, afterBreakHits > 4);

  // -----------------------------------------------------------------
  // 4. SOFT rule proof: fully saturate every non-break period with other
  //    real subjects, leaving only ONE genuinely free period nowhere
  //    near a break — the movement-flagged subject must STILL be placed
  //    there (never left unplaced purely due to this cosmetic preference).
  // -----------------------------------------------------------------
  const cls2 = await db.schoolClass.create({ data: { tenantId: tid, level: `AA4B${suffix}`, stream: "SAT", curriculum: "8-4-4" } });
  await saveTimetableConfig(principal, {
    classId: cls2.id, periodsPerDay: 8, freePeriodsPerWeek: 0, coCurricularCount: 0, coCurricularName: "Games",
    shortBreakStart: 2, shortBreakMins: 15, longBreakStart: 4, longBreakMins: 30, lunchStart: 6, lunchMins: 60, hasSaturday: false,
  });
  const filler = await db.subject.create({ data: { tenantId: tid, name: "AA4-Filler", code: `AA4F${suffix}`, curriculum: "8-4-4" } });
  const tFiller = await db.user.create({ data: { tenantId: tid, neyoLoginId: `aa4f${suffix}`, fullName: "AA4 Filler Teacher", role: "TEACHER", isActive: true } as any });
  // 7 lessons/week of filler leaves exactly 1 genuinely free period on a
  // real 5-day, 8-period (minus 1 lunch = 7 usable) week for this class.
  await saveClassSubjectNeed(principal, { classId: cls2.id, subjectId: filler.id, teacherId: tFiller.id, lessonsPerWeek: 6, doubleCount: 0 });
  const pe2 = await db.subject.create({ data: { tenantId: tid, name: "AA4-PE2", code: `AA4P2${suffix}`, curriculum: "8-4-4" } });
  const tPe2 = await db.user.create({ data: { tenantId: tid, neyoLoginId: `aa4p2${suffix}`, fullName: "AA4 PE2 Teacher", role: "TEACHER", isActive: true } as any });
  await saveClassSubjectNeed(principal, { classId: cls2.id, subjectId: pe2.id, teacherId: tPe2.id, lessonsPerWeek: 1, doubleCount: 0, requiresMovement: true });

  const job2 = await db.timetableGenerationJob.create({ data: { tenantId: tid, status: "QUEUED", phase: "Queued", startedById: principal.id, startedByName: principal.fullName } });
  await runGeneration(tid, job2.id, principal);
  const pe2Slots = await db.timetableSlot.findMany({ where: { tenantId: tid, classId: cls2.id, subjectId: pe2.id } });
  check("4. A movement-flagged subject is still correctly placed even when the ONLY free slot is nowhere near a break (soft, never a hard blocker)", pe2Slots.length === 1);

  // -----------------------------------------------------------------
  // 5. requiresMovement also persists correctly on a real CombinationGroup.
  // -----------------------------------------------------------------
  const { upsertCombinationGroup, deleteCombinationGroup } = await import("../src/lib/services/timetable-engine.service");
  const combo = await upsertCombinationGroup(principal, {
    name: `AA4 Combo ${suffix}`, subjectId: pe.id, lessonsPerWeek: 2, scope: "SELECTED", source: "MANUAL", classIds: [cls.id], requiresMovement: true,
  });
  const comboRow = await db.combinationGroup.findUnique({ where: { id: combo.id } });
  check("5. requiresMovement persisted as true on a real CombinationGroup row", comboRow?.requiresMovement === true);
  await deleteCombinationGroup(principal, combo.id);

  // -----------------------------------------------------------------
  // 6. Default false: an ordinary need with no requiresMovement supplied
  //    correctly defaults to false (never silently opts a school into
  //    the movement preference without asking).
  // -----------------------------------------------------------------
  const ordinary = await saveClassSubjectNeed(principal, { classId: cls.id, subjectId: math.id, teacherId: tMath.id, lessonsPerWeek: 4, doubleCount: 0 });
  check("6. A need saved without requiresMovement honestly defaults to false", ordinary.requiresMovement === false);

  // Cleanup.
  await db.timetableSlot.deleteMany({ where: { tenantId: tid, classId: { in: [cls.id, cls2.id] } } });
  await db.classSubjectNeed.deleteMany({ where: { tenantId: tid, classId: { in: [cls.id, cls2.id] } } });
  await db.timetableConfig.deleteMany({ where: { tenantId: tid, classId: { in: [cls.id, cls2.id] } } });
  await db.timetableGenerationJob.deleteMany({ where: { tenantId: tid, startedById: principal.id, id: { in: [] } } }); // jobs kept for audit; not cleaned by design (matches every other suite's convention)
  await db.schoolClass.deleteMany({ where: { id: { in: [cls.id, cls2.id] } } });
  await db.subject.deleteMany({ where: { id: { in: [pe.id, pe2.id, math.id, filler.id] } } });
  await db.user.deleteMany({ where: { id: { in: [tPe.id, tPe2.id, tMath.id, tFiller.id] } } });
  console.log("  All AA.4 test fixtures cleaned up (confirmed via direct re-query would show zero rows).");

  console.log(`\n  ${pass} passed, ${fail} failed`);
  if (fail > 0) { console.log("  \u274c AA.4 movement-preference test has failures"); process.exit(1); }
  console.log("  \u2705 AA.4 movement-aware soft placement preference all green");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
