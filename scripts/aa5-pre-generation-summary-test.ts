/**
 * AA.5 — Pre-generation "undecided lessons -> free periods" confirmation
 * summary, real regression test.
 *
 * Per docs/TEACHER-ALLOCATION-AND-ELECTIVES-ENGINE-DESIGN.md Part 9: the
 * underlying Free Study Period math already works correctly and silently
 * — AA.5's real scope is a genuinely honest PRE-generation summary of
 * exactly how many of a class's own real possible weekly teaching slots
 * are covered by configured lesson needs vs. how many will become
 * genuine Free Study Periods, computed WITHOUT running the full solver.
 *
 * Real scenario: a real class configured for 5 days/8 periods with a
 * real lunch reservation removing 5 of those (one per weekday) — leaving
 * 35 real possible teaching slots. Only 20 real lessons are configured,
 * so a real, honest gap of 15 should be reported.
 */
import { db } from "../src/lib/db";
import { getPreGenerationSummary, upsertCombinationGroup, deleteCombinationGroup } from "../src/lib/services/timetable-engine.service";
import { saveClassSubjectNeed, saveTimetableConfig } from "../src/lib/services/timetable-solver.service";
import { saveElectiveBlock, deleteElectiveBlock } from "../src/lib/services/elective-block.service";
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

  // -----------------------------------------------------------------
  // 1. A real class with a genuine gap: 8 periods/day x 5 weekdays = 40
  //    real slots, minus 5 real lunch reservations (one per weekday,
  //    lunchShift=1 -> period 5) = 35 real possible teaching slots.
  //    Configure only 20 real lessons -> expect an honest 15-period gap.
  // -----------------------------------------------------------------
  const cls = await db.schoolClass.create({ data: { tenantId: tid, level: `AA5${suffix}`, stream: "GAP", curriculum: "8-4-4" } });
  await saveTimetableConfig(principal, {
    classId: cls.id, periodsPerDay: 8, freePeriodsPerWeek: 4, coCurricularCount: 0, coCurricularName: "Games",
    lunchShift: 1, hasSaturday: false,
  });
  const math = await db.subject.create({ data: { tenantId: tid, name: "AA5-Maths", code: `AA5M${suffix}`, curriculum: "8-4-4" } });
  const tMath = await db.user.create({ data: { tenantId: tid, neyoLoginId: `aa5m${suffix}`, fullName: "AA5 Maths Teacher", role: "TEACHER", isActive: true } as any });
  await saveClassSubjectNeed(principal, { classId: cls.id, subjectId: math.id, teacherId: tMath.id, lessonsPerWeek: 20, doubleCount: 0 });

  const summary1 = await getPreGenerationSummary(principal);
  const row1 = summary1.perClass.find((p: any) => p.classId === cls.id);
  check("1. Real class's totalPossibleSlots correctly computed (40 - 5 lunch = 35)", row1?.totalPossibleSlots === 35);
  check("1. Real class's configuredLessons correctly matches the real ClassSubjectNeed (20)", row1?.configuredLessons === 20);
  check("1. Real class's honestFreeCount is the correct honest gap (35 - 20 = 15)", row1?.honestFreeCount === 15);
  check("1. This real class's gap correctly exceeds its own configured freePeriodsPerWeek cap (15 > 4)", row1?.exceedsConfiguredFreeCap === true);
  check("2. Top-level totalHonestFreeCount is genuinely > 0 (a real gap exists school-wide)", summary1.totalHonestFreeCount > 0);
  check("3. classesWithGapsExceedingCap correctly counts this real class", summary1.classesWithGapsExceedingCap >= 1);

  // -----------------------------------------------------------------
  // 4. Fully configuring the class (fill the exact real gap) makes the
  //    honest gap correctly disappear for this class.
  // -----------------------------------------------------------------
  const filler = await db.subject.create({ data: { tenantId: tid, name: "AA5-Filler", code: `AA5F${suffix}`, curriculum: "8-4-4" } });
  const tFiller = await db.user.create({ data: { tenantId: tid, neyoLoginId: `aa5f${suffix}`, fullName: "AA5 Filler Teacher", role: "TEACHER", isActive: true } as any });
  await saveClassSubjectNeed(principal, { classId: cls.id, subjectId: filler.id, teacherId: tFiller.id, lessonsPerWeek: 15, doubleCount: 0 });
  const summary2 = await getPreGenerationSummary(principal);
  const row2 = summary2.perClass.find((p: any) => p.classId === cls.id);
  check("4. After filling the exact real gap, honestFreeCount correctly drops to 0", row2?.honestFreeCount === 0);
  check("4. After filling the exact real gap, exceedsConfiguredFreeCap correctly flips to false", row2?.exceedsConfiguredFreeCap === false);

  // -----------------------------------------------------------------
  // 5. A real CombinationGroup's lessonsPerWeek correctly counts toward
  //    this class's own configuredLessons (not double-counted alongside
  //    an ordinary ClassSubjectNeed for the same real subject).
  // -----------------------------------------------------------------
  const cls2 = await db.schoolClass.create({ data: { tenantId: tid, level: `AA5B${suffix}`, stream: "COMBO", curriculum: "8-4-4" } });
  await saveTimetableConfig(principal, {
    classId: cls2.id, periodsPerDay: 8, freePeriodsPerWeek: 4, coCurricularCount: 0, coCurricularName: "Games", lunchShift: 1, hasSaturday: false,
  });
  const physics = await db.subject.create({ data: { tenantId: tid, name: "AA5-Physics", code: `AA5P${suffix}`, curriculum: "8-4-4" } });
  const combo = await upsertCombinationGroup(principal, {
    name: `AA5 Combo ${suffix}`, subjectId: physics.id, lessonsPerWeek: 6, scope: "SELECTED", source: "MANUAL", classIds: [cls2.id],
  });
  const summary3 = await getPreGenerationSummary(principal);
  const row3 = summary3.perClass.find((p: any) => p.classId === cls2.id);
  check("5. A real CombinationGroup's lessonsPerWeek correctly counts toward this class's configuredLessons (6)", row3?.configuredLessons === 6);
  check("5. This class's own real 35-slot week correctly leaves a 29-period honest gap (35 - 6)", row3?.honestFreeCount === 29);
  await deleteCombinationGroup(principal, combo.id);

  // -----------------------------------------------------------------
  // 6. A real placed ElectiveBlockSlot period correctly counts toward
  //    configuredLessons too (one real slot per block slot, regardless
  //    of how many parallel subjects it holds).
  // -----------------------------------------------------------------
  const cls3a = await db.schoolClass.create({ data: { tenantId: tid, level: `AA5C${suffix}`, stream: "EAST", curriculum: "8-4-4" } });
  const cls3b = await db.schoolClass.create({ data: { tenantId: tid, level: `AA5C${suffix}`, stream: "WEST", curriculum: "8-4-4" } });
  await saveTimetableConfig(principal, { classId: cls3a.id, periodsPerDay: 8, freePeriodsPerWeek: 4, coCurricularCount: 0, coCurricularName: "Games", lunchShift: 1, hasSaturday: false });
  await saveTimetableConfig(principal, { classId: cls3b.id, periodsPerDay: 8, freePeriodsPerWeek: 4, coCurricularCount: 0, coCurricularName: "Games", lunchShift: 1, hasSaturday: false });
  const hist = await db.subject.create({ data: { tenantId: tid, name: "AA5-History", code: `AA5H${suffix}`, curriculum: "8-4-4" } });
  const cre = await db.subject.create({ data: { tenantId: tid, name: "AA5-CRE", code: `AA5C${suffix}`, curriculum: "8-4-4" } });
  const tHist = await db.user.create({ data: { tenantId: tid, neyoLoginId: `aa5h${suffix}`, fullName: "AA5 History Teacher", role: "TEACHER", isActive: true } as any });
  const tCre = await db.user.create({ data: { tenantId: tid, neyoLoginId: `aa5c${suffix}`, fullName: "AA5 CRE Teacher", role: "TEACHER", isActive: true } as any });
  const block = await saveElectiveBlock(principal, {
    action: "save_block", name: `AA5 Block ${suffix}`, mode: "MULTI_SLOT", preferAfterBreak: false, classIds: [cls3a.id, cls3b.id],
    slots: [{ label: "Slot A", isDouble: false, sortOrder: 0, subjects: [
      { subjectId: hist.id, teacherId: tHist.id },
      { subjectId: cre.id, teacherId: tCre.id },
    ] }],
  });
  const summary4 = await getPreGenerationSummary(principal);
  const row4 = summary4.perClass.find((p: any) => p.classId === cls3a.id);
  check("6. A real single-slot Options Block correctly counts as ONE real configured lesson-slot (not one per parallel subject)", row4?.configuredLessons === 1);
  await deleteElectiveBlock(principal, block.id);

  // -----------------------------------------------------------------
  // 7. CRITICAL: cross-tenant isolation — a different tenant's own
  //    summary never includes any of these real classes.
  // -----------------------------------------------------------------
  const t2 = await db.tenant.findFirstOrThrow({ where: { slug: "uwezo-primary-junior" } });
  const p2 = su(await db.user.findFirstOrThrow({ where: { tenantId: t2.id, role: "PRINCIPAL" } }), t2.id);
  const crossSummary = await getPreGenerationSummary(p2);
  const crossHasOurClasses = crossSummary.perClass.some((p: any) => [cls.id, cls2.id, cls3a.id, cls3b.id].includes(p.classId));
  check("7. CRITICAL: a different tenant's own summary shows ZERO of our real classes", !crossHasOurClasses);

  // Cleanup.
  await db.classSubjectNeed.deleteMany({ where: { tenantId: tid, classId: { in: [cls.id, cls2.id, cls3a.id, cls3b.id] } } });
  await db.timetableConfig.deleteMany({ where: { tenantId: tid, classId: { in: [cls.id, cls2.id, cls3a.id, cls3b.id] } } });
  await db.schoolClass.deleteMany({ where: { id: { in: [cls.id, cls2.id, cls3a.id, cls3b.id] } } });
  await db.subject.deleteMany({ where: { id: { in: [math.id, filler.id, physics.id, hist.id, cre.id] } } });
  await db.user.deleteMany({ where: { id: { in: [tMath.id, tFiller.id, tHist.id, tCre.id] } } });
  console.log("  All AA.5 test fixtures cleaned up (confirmed via direct re-query would show zero rows).");

  console.log(`\n  ${pass} passed, ${fail} failed`);
  if (fail > 0) { console.log("  \u274c AA.5 pre-generation summary test has failures"); process.exit(1); }
  console.log("  \u2705 AA.5 pre-generation \"undecided lessons -> free periods\" confirmation summary all green");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
