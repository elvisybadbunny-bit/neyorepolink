/**
 * Z.3 — Real free-period distribution fix regression test. Reproduces the
 * founder's ORIGINAL reported bug shape: a class configured with more real
 * teaching slots (periodsPerDay x days, minus lunch) than its real
 * lessonsPerWeek need — e.g. Grade 7 Amani had 50 real available slots but
 * only 34 real lessons needed, leaving a genuine 16-slot surplus that the
 * engine previously left entirely empty at the tail of the week (Thu P7-10,
 * Fri P3-10) instead of spreading real "Free" periods across the week.
 *
 * Verifies: (1) FREE periods are filled up to the school's own explicit
 * `TimetableConfig.freePeriodsPerWeek`, never more; (2) FREE periods are
 * genuinely SPREAD across different days/periods, never clumped onto the
 * exact same day/period; (3) any further real surplus beyond the school's
 * own set number stays honestly empty (not auto-filled); (4) FREE periods
 * never overwrite a real lesson or lunch slot; (5) zero regression on a
 * class with freePeriodsPerWeek = 0 (the pre-existing default, matching the
 * L.7 suite's own scenario).
 */
import { PrismaClient } from "@prisma/client";
import { runGeneration } from "../src/lib/services/timetable-engine.service";

const db = new PrismaClient();
let pass = 0, fail = 0;
function check(name: string, cond: boolean) {
  if (cond) { pass++; console.log(`  \u2713 ${name}`); }
  else { fail++; console.log(`  \u2717 FAIL: ${name}`); }
}
function su(u: any, tenantId: string) {
  return { id: u.id, tenantId, neyoLoginId: u.id, fullName: u.fullName, phone: null, email: u.email, role: u.role, secondaryRole: null, language: "en" } as any;
}

async function main() {
  const t = await db.tenant.findUnique({ where: { slug: "karibu-high" } });
  if (!t) throw new Error("tenant not found");
  const tid = t.id;
  const principal = su(await db.user.findFirst({ where: { tenantId: tid, role: "PRINCIPAL" } }), tid);

  const existingSlots = await db.timetableSlot.findMany({ where: { tenantId: tid } });

  const suffix = Date.now() % 100000;
  // A real class with a genuine surplus: 8 periods/day x 5 days = 40 real
  // slots, minus 5 real lunch reservations = 35 real teaching slots
  // available, but only 10 real lessons needed -> a real 25-slot surplus,
  // mirroring the founder's Grade 7 Amani shape (surplus >> freePeriodsPerWeek).
  const clsSurplus = await db.schoolClass.create({ data: { tenantId: tid, level: `FP${suffix}`, stream: "SURPLUS", curriculum: "8-4-4" } });
  // A second real class with ZERO surplus configured (freePeriodsPerWeek=0)
  // to confirm zero regression on the pre-existing default behavior.
  const clsNoFree = await db.schoolClass.create({ data: { tenantId: tid, level: `FP${suffix}`, stream: "NOFREE", curriculum: "8-4-4" } });

  const math = await db.subject.create({ data: { tenantId: tid, name: "FP-Math", code: `FPM${suffix}`, curriculum: "8-4-4" } });
  const tMath = await db.user.create({ data: { tenantId: tid, neyoLoginId: `fpm${suffix}`, fullName: "FP Math Teacher", role: "TEACHER", isActive: true } as any });

  await db.timetableConfig.create({ data: { tenantId: tid, classId: clsSurplus.id, periodsPerDay: 8, freePeriodsPerWeek: 6, coCurricularCount: 0, lunchShift: 1 } });
  await db.timetableConfig.create({ data: { tenantId: tid, classId: clsNoFree.id, periodsPerDay: 8, freePeriodsPerWeek: 0, coCurricularCount: 0, lunchShift: 1 } });

  await db.classSubjectNeed.create({ data: { tenantId: tid, classId: clsSurplus.id, subjectId: math.id, teacherId: tMath.id, lessonsPerWeek: 10, doubleCount: 0 } });
  await db.classSubjectNeed.create({ data: { tenantId: tid, classId: clsNoFree.id, subjectId: math.id, teacherId: tMath.id, lessonsPerWeek: 10, doubleCount: 0 } });

  try {
    const job = await db.timetableGenerationJob.create({ data: { tenantId: tid, status: "QUEUED", phase: "Queued", startedById: principal.id, startedByName: principal.fullName } });
    await runGeneration(tid, job.id, principal);

    const freeSubject = await db.subject.findFirst({ where: { tenantId: tid, code: "FREE" } });
    check("a real FREE subject row exists after generation", !!freeSubject);

    const surplusSlots = await db.timetableSlot.findMany({ where: { tenantId: tid, classId: clsSurplus.id, slotType: "ACADEMIC" } });
    const freeSlots = surplusSlots.filter((s) => s.subjectId === freeSubject?.id);
    const mathSlots = surplusSlots.filter((s) => s.subjectId === math.id);

    check("all 10 real Math lessons are placed for the surplus class", mathSlots.length === 10);
    check(
      `FREE periods filled up to the school's own set freePeriodsPerWeek (6), got ${freeSlots.length}`,
      freeSlots.length === 6
    );

    // Real spread check: FREE periods must land on genuinely varied
    // days/periods, never clumped onto the exact same day or period.
    const freeDays = new Set(freeSlots.map((s) => s.dayOfWeek));
    const freePeriodsUsed = new Set(freeSlots.map((s) => s.period));
    check(`FREE periods spread across multiple real days (got ${freeDays.size} distinct days)`, freeDays.size >= 3);
    check(`FREE periods spread across multiple real periods (got ${freePeriodsUsed.size} distinct periods)`, freePeriodsUsed.size >= 3);

    // No day should have more than 2 real FREE periods (a real spread
    // signal, not a strict rule, but any single day dominating would
    // indicate the old clumping bug resurfacing).
    const perDayCounts = new Map<number, number>();
    for (const s of freeSlots) perDayCounts.set(s.dayOfWeek, (perDayCounts.get(s.dayOfWeek) ?? 0) + 1);
    const maxPerDay = Math.max(...Array.from(perDayCounts.values()));
    check(`no single real day has more than 2 FREE periods (max found: ${maxPerDay})`, maxPerDay <= 2);

    // Real surplus beyond freePeriodsPerWeek must stay honestly empty —
    // total occupied slots for this class = 10 real Math + 6 real Free + 5
    // real lunch = 21, leaving a genuine (40 - 21) = 19 real empty slots.
    const allSurplusKeys = new Set(surplusSlots.map((s) => `${s.dayOfWeek}:${s.period}`));
    const lunchSlots = surplusSlots.filter((s) => s.subjectId !== math.id && s.subjectId !== freeSubject?.id);
    check(`real lunch reservations exist and are untouched (found ${lunchSlots.length})`, lunchSlots.length === 5);
    const totalOccupied = mathSlots.length + freeSlots.length + lunchSlots.length;
    check(`total real occupied slots = 21 (10 Math + 6 Free + 5 Lunch), genuine surplus left honestly empty`, totalOccupied === 21);

    // No FREE slot may collide with a real Math or Lunch slot at the same
    // day+period (basic sanity — the classGrid itself guarantees this, but
    // verify from the persisted rows directly too).
    const seen = new Set<string>();
    let noCollision = true;
    for (const s of surplusSlots) {
      const k = `${s.dayOfWeek}:${s.period}`;
      if (seen.has(k)) noCollision = false;
      seen.add(k);
    }
    check("no two real slots collide on the same day+period for the surplus class", noCollision);

    // Zero regression: the freePeriodsPerWeek=0 class gets ZERO real Free
    // periods (matches the pre-existing default / L.7 suite's own scenario).
    const noFreeSlots = await db.timetableSlot.findMany({ where: { tenantId: tid, classId: clsNoFree.id, slotType: "ACADEMIC", subjectId: freeSubject?.id } });
    check("a class with freePeriodsPerWeek=0 gets ZERO real Free periods (zero regression)", noFreeSlots.length === 0);
  } finally {
    // Cleanup — real, verified.
    await db.timetableSlot.deleteMany({ where: { tenantId: tid, OR: [{ classId: clsSurplus.id }, { classId: clsNoFree.id }] } });
    await db.timetableGenerationJob.deleteMany({ where: { tenantId: tid, startedById: principal.id, phase: { in: ["Queued", "Complete"] } } });
    await db.classSubjectNeed.deleteMany({ where: { tenantId: tid, OR: [{ classId: clsSurplus.id }, { classId: clsNoFree.id }] } });
    await db.timetableConfig.deleteMany({ where: { tenantId: tid, OR: [{ classId: clsSurplus.id }, { classId: clsNoFree.id }] } });
    await db.subject.delete({ where: { id: math.id } });
    await db.user.delete({ where: { id: tMath.id } });
    await db.schoolClass.delete({ where: { id: clsSurplus.id } });
    await db.schoolClass.delete({ where: { id: clsNoFree.id } });
    // Restore any pre-existing real slots this run's regenerate wiped for
    // OTHER classes in this tenant (the Master Button regenerates the
    // WHOLE school's ACADEMIC slots, matching real production behavior).
    if (existingSlots.length > 0) {
      for (const s of existingSlots) {
        await db.timetableSlot.upsert({
          where: { tenantId_classId_dayOfWeek_period_slotType: { tenantId: s.tenantId, classId: s.classId, dayOfWeek: s.dayOfWeek, period: s.period, slotType: s.slotType } },
          create: {
            tenantId: s.tenantId, classId: s.classId, subjectId: s.subjectId, activityCategoryId: s.activityCategoryId,
            teacherId: s.teacherId, dayOfWeek: s.dayOfWeek, period: s.period, slotType: s.slotType, weekRotation: s.weekRotation, venue: s.venue,
          },
          update: {},
        });
      }
    }
  }

  console.log("\n" + "-".repeat(40));
  console.log(`  ${pass} passed, ${fail} failed`);
  console.log(fail === 0 ? "  \u2705 all green" : "  \u274c failures found");
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
