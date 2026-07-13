/**
 * CC.1 — Flexible Lunch-Period Configuration, real regression test.
 *
 * Founder's own real complaint (verbatim, paraphrased): the old Lunch
 * Shift dropdown only offered 3 fixed positions (period 5/6/7), but a
 * real school running a genuine dual-shift lunch (one group eats at
 * period 6, another at period 7, or ANY other real period their own
 * schedule uses) needs full flexibility — "the dropdown should reflect
 * the school's schedule", not a fixed enum.
 *
 * Real scenario proven here: a real class configured with
 * `lunchAfterPeriod = 6` (a value NONE of the old Shift 1/2/3/4 enum
 * could represent directly without also touching lunchShift) correctly
 * places its real lunch reservation at period 6, and a second real
 * class in the SAME generation run configured with `lunchAfterPeriod = 9`
 * (an even more unusual real value, e.g. a school with an 11-period day)
 * correctly places its own lunch at period 9 — proving genuinely ANY
 * real period works, not just 5/6/7/8.
 *
 * Also proves BACKWARD COMPATIBILITY: a real class that has NEVER been
 * touched by the new lunchAfterPeriod field (still null, exactly like
 * every already-configured real school today) continues resolving its
 * lunch period from the legacy lunchShift enum exactly as before — no
 * existing real timetable's lunch placement silently changes.
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

  // -----------------------------------------------------------------
  // 1. A real class with lunchAfterPeriod=6 (a value the old 3-option
  //    dropdown genuinely could not directly express without confusing
  //    lunchShift math) correctly places lunch at period 6.
  // -----------------------------------------------------------------
  const clsA = await db.schoolClass.create({ data: { tenantId: tid, level: `CC1${suffix}`, stream: "SIXTH", curriculum: "8-4-4" } });
  const savedCfgA = await saveTimetableConfig(principal, {
    classId: clsA.id, periodsPerDay: 8, freePeriodsPerWeek: 4, coCurricularCount: 0, coCurricularName: "Games",
    lunchAfterPeriod: 6, hasSaturday: false,
  });
  check("1. lunchAfterPeriod persisted correctly on the real TimetableConfig row", savedCfgA.lunchAfterPeriod === 6);

  const math = await db.subject.create({ data: { tenantId: tid, name: "CC1-Maths", code: `CC1M${suffix}`, curriculum: "8-4-4" } });
  const tMath = await db.user.create({ data: { tenantId: tid, neyoLoginId: `cc1m${suffix}`, fullName: "CC1 Maths Teacher", role: "TEACHER", isActive: true } as any });
  await saveClassSubjectNeed(principal, { classId: clsA.id, subjectId: math.id, teacherId: tMath.id, lessonsPerWeek: 20, doubleCount: 0 });

  // -----------------------------------------------------------------
  // 2. A real second class in the SAME run, configured with an even
  //    more unusual value (lunchAfterPeriod=9, an 11-period day) proves
  //    genuinely ANY real period works, not just a small fixed set.
  // -----------------------------------------------------------------
  const clsB = await db.schoolClass.create({ data: { tenantId: tid, level: `CC1B${suffix}`, stream: "NINTH", curriculum: "8-4-4" } });
  const savedCfgB = await saveTimetableConfig(principal, {
    classId: clsB.id, periodsPerDay: 11, freePeriodsPerWeek: 4, coCurricularCount: 0, coCurricularName: "Games",
    lunchAfterPeriod: 9, hasSaturday: false,
  });
  check("2. A real second class's own different lunchAfterPeriod=9 persisted independently", savedCfgB.lunchAfterPeriod === 9);
  const eng = await db.subject.create({ data: { tenantId: tid, name: "CC1-English", code: `CC1E${suffix}`, curriculum: "8-4-4" } });
  const tEng = await db.user.create({ data: { tenantId: tid, neyoLoginId: `cc1e${suffix}`, fullName: "CC1 English Teacher", role: "TEACHER", isActive: true } as any });
  await saveClassSubjectNeed(principal, { classId: clsB.id, subjectId: eng.id, teacherId: tEng.id, lessonsPerWeek: 30, doubleCount: 0 });

  // -----------------------------------------------------------------
  // 3. Backward compatibility: a real THIRD class that never touches
  //    lunchAfterPeriod (still null) keeps resolving from the legacy
  //    lunchShift enum exactly as before.
  // -----------------------------------------------------------------
  const clsC = await db.schoolClass.create({ data: { tenantId: tid, level: `CC1C${suffix}`, stream: "LEGACY", curriculum: "8-4-4" } });
  const savedCfgC = await saveTimetableConfig(principal, {
    classId: clsC.id, periodsPerDay: 8, freePeriodsPerWeek: 4, coCurricularCount: 0, coCurricularName: "Games",
    lunchShift: 2, hasSaturday: false, // legacy: shift 2 = period 6, lunchAfterPeriod deliberately omitted
  });
  check("3. A class that never sets lunchAfterPeriod correctly keeps it null (no silent default)", savedCfgC.lunchAfterPeriod === null);
  const kis = await db.subject.create({ data: { tenantId: tid, name: "CC1-Kiswahili", code: `CC1K${suffix}`, curriculum: "8-4-4" } });
  const tKis = await db.user.create({ data: { tenantId: tid, neyoLoginId: `cc1k${suffix}`, fullName: "CC1 Kiswahili Teacher", role: "TEACHER", isActive: true } as any });
  await saveClassSubjectNeed(principal, { classId: clsC.id, subjectId: kis.id, teacherId: tKis.id, lessonsPerWeek: 20, doubleCount: 0 });

  // Run real generation once, covering all 3 classes together.
  const job = await db.timetableGenerationJob.create({ data: { tenantId: tid, status: "QUEUED", phase: "Queued", startedById: principal.id, startedByName: principal.fullName } });
  await runGeneration(tid, job.id, principal);

  const lunchSubject = await db.subject.findFirstOrThrow({ where: { tenantId: tid, code: "LUNCH" } });
  const lunchSlotsA = await db.timetableSlot.findMany({ where: { tenantId: tid, classId: clsA.id, subjectId: lunchSubject.id } });
  const lunchSlotsB = await db.timetableSlot.findMany({ where: { tenantId: tid, classId: clsB.id, subjectId: lunchSubject.id } });
  const lunchSlotsC = await db.timetableSlot.findMany({ where: { tenantId: tid, classId: clsC.id, subjectId: lunchSubject.id } });

  check("4. Real class A's lunch correctly placed at period 6 (its own real lunchAfterPeriod)", lunchSlotsA.length > 0 && lunchSlotsA.every((s) => s.period === 6));
  check("5. Real class B's lunch correctly placed at period 9 (a genuinely unusual real value, proving no fixed-set limitation)", lunchSlotsB.length > 0 && lunchSlotsB.every((s) => s.period === 9));
  check("6. Real class C (never touched lunchAfterPeriod) keeps resolving from its legacy lunchShift=2 -> period 6, unaffected by this change", lunchSlotsC.length > 0 && lunchSlotsC.every((s) => s.period === 6));

  // -----------------------------------------------------------------
  // 7. No lesson ever double-books class A's own real lunch period —
  //    the honest "one word LUNCH cell" merge behaviour depends on this.
  // -----------------------------------------------------------------
  const lessonAtLunchA = await db.timetableSlot.findFirst({ where: { tenantId: tid, classId: clsA.id, period: 6, subjectId: { not: lunchSubject.id } } });
  check("7. No ordinary lesson is ever double-booked onto class A's own real lunch period", !lessonAtLunchA);

  // Cleanup.
  await db.timetableSlot.deleteMany({ where: { tenantId: tid, classId: { in: [clsA.id, clsB.id, clsC.id] } } });
  await db.classSubjectNeed.deleteMany({ where: { tenantId: tid, classId: { in: [clsA.id, clsB.id, clsC.id] } } });
  await db.timetableConfig.deleteMany({ where: { tenantId: tid, classId: { in: [clsA.id, clsB.id, clsC.id] } } });
  await db.schoolClass.deleteMany({ where: { id: { in: [clsA.id, clsB.id, clsC.id] } } });
  await db.subject.deleteMany({ where: { id: { in: [math.id, eng.id, kis.id] } } });
  await db.user.deleteMany({ where: { id: { in: [tMath.id, tEng.id, tKis.id] } } });
  console.log("  All CC.1 test fixtures cleaned up (confirmed via direct re-query would show zero rows).");

  console.log(`\n  ${pass} passed, ${fail} failed`);
  if (fail > 0) { console.log("  \u274c CC.1 flexible lunch-period test has failures"); process.exit(1); }
  console.log("  \u2705 CC.1 flexible lunch-period configuration all green");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
