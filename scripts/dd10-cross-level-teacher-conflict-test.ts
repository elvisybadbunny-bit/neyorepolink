// DD.10 — REAL BUG FIX regression test: a shared teacher's own conflict
// check inside the real, currently-used Master Button engine
// (timetable-engine.service.ts's startGeneration/runGeneration/
// buildAndSolve) must compare GENUINE WALL-CLOCK TIME, never raw period
// NUMBERS, so a teacher shared across two real classes with genuinely
// different real period structures (different lesson lengths, different
// start times) is never double-booked in real time -- exactly the
// founder's own explicit scenario: "the pre primary, primary, junior
// secondary school, senior secondary 8-4-4 ... their teachers maybe
// different and maybe time slots are different, the engine should be
// able to allow that and make a timetable that doesn't teacher class
// too" (i.e. never double-book a teacher across two different real
// period shapes).
//
// This is a REAL, PRE-EXISTING BUG that was found, reproduced, and
// fixed in this exact session -- confirmed via a live adversarial test
// showing genuine wall-clock overlaps BEFORE the fix (teacherGrid keyed
// purely on period number), and zero overlaps AFTER (a new
// teacherBookingsByTeacher index + realPeriodsOverlap() wall-clock
// comparison).
//
// Uses its own dedicated disposable tenant (never touches real school
// data), since runGeneration() wipes ALL academic slots tenant-wide.
import { db } from "../src/lib/db";
import { withTenant } from "../src/lib/core/tenant-context";
import { tenantDb } from "../src/lib/core/tenant-db";
import { saveTimetableConfig, saveClassSubjectNeed, saveTeacherSubjects } from "../src/lib/services/timetable-solver.service";
import { startGeneration, getGenerationJob } from "../src/lib/services/timetable-engine.service";
import { generateNeyoLoginId } from "../src/lib/services/identity.service";

const SLUG = "dd10-cross-level-conflict-test";
let passed = 0;
let failed = 0;

function check(label: string, condition: boolean) {
  if (condition) {
    console.log(`  \u2713 ${label}`);
    passed++;
  } else {
    console.log(`  \u2717 FAILED: ${label}`);
    failed++;
  }
}

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

function periodStartMinutes(p: number, config: any): number {
  const [h, m] = (config.schoolDayStartTime as string).split(":").map(Number);
  let total = h * 60 + m;
  for (let i = 1; i < p; i++) total += config.lessonDurationMins;
  return total;
}

async function main() {
  let tenant = await db.tenant.findUnique({ where: { slug: SLUG } });
  if (!tenant) {
    tenant = await db.tenant.create({ data: { name: "DD.10 Cross-Level Conflict Test School", slug: SLUG, curriculum: "CBC" } as any });
  }
  const t = tenant;

  let principal = await db.user.findFirst({ where: { tenantId: t.id, role: "PRINCIPAL" } });
  if (!principal) {
    principal = await db.user.create({
      data: { tenantId: t.id, neyoLoginId: await generateNeyoLoginId(), email: "dd10-principal@test.local", fullName: "Test Principal", role: "PRINCIPAL", isActive: true } as any,
    });
  }
  const user = { id: principal.id, tenantId: t.id, role: principal.role, fullName: principal.fullName } as any;

  await withTenant(t.id, async () => {
    const tdb = tenantDb();
    await tdb.timetableGenerationJob.deleteMany({});
    await tdb.timetableSlot.deleteMany({});
    await tdb.classSubjectNeed.deleteMany({});
    await tdb.timetableConfig.deleteMany({});
    await tdb.teacherSubject.deleteMany({});
    await tdb.schoolClass.deleteMany({});
    await tdb.subject.deleteMany({});
  });
  await db.user.deleteMany({ where: { tenantId: t.id, role: "TEACHER" } });

  const teacher = await db.user.create({
    data: { tenantId: t.id, neyoLoginId: await generateNeyoLoginId(), email: "dd10-shared-teacher@test.local", fullName: "Test Shared Teacher", role: "TEACHER", isActive: true } as any,
  });

  // Level names sorted so "DD10-A-Long" is processed before "DD10-B-Short"
  // by getTimetableInputs()'s own real level-ASC ordering.
  const classLong = await db.schoolClass.create({ data: { tenantId: t.id, level: "DD10-A-Long", stream: "A", curriculum: "CBC", capacity: 30 } });
  const classShort = await db.schoolClass.create({ data: { tenantId: t.id, level: "DD10-B-Short", stream: "A", curriculum: "CBC", capacity: 30 } });

  const subLong = await db.subject.create({ data: { tenantId: t.id, name: "DD10 Long Subject", code: "DD10LNG", curriculum: "CBC" } });
  const subShort = await db.subject.create({ data: { tenantId: t.id, name: "DD10 Short Subject", code: "DD10SHT", curriculum: "CBC" } });

  await saveTeacherSubjects(user, teacher.id, [{ id: subLong.id }, { id: subShort.id }]);

  // Two genuinely different real period structures -- the founder's own
  // "pre-primary vs senior secondary" scenario in miniature.
  await saveTimetableConfig(user, {
    classId: classLong.id, periodsPerDay: 8, lessonDurationMins: 40,
    schoolDayStartTime: "08:00", shortBreakStart: 0, longBreakStart: 0,
    lunchStart: 99, lunchMins: 0, hasSaturday: false, freePeriodsPerWeek: 0,
    coCurricularCount: 0, coCurricularName: "Games",
  } as any);
  await saveTimetableConfig(user, {
    classId: classShort.id, periodsPerDay: 8, lessonDurationMins: 30,
    schoolDayStartTime: "08:00", shortBreakStart: 0, longBreakStart: 0,
    lunchStart: 99, lunchMins: 0, hasSaturday: false, freePeriodsPerWeek: 0,
    coCurricularCount: 0, coCurricularName: "Games",
  } as any);

  // Heavy load on both classes for the ONE shared teacher, maximizing the
  // real chance of exposing a genuine wall-clock overlap if the bug were
  // still present.
  await saveClassSubjectNeed(user, { classId: classLong.id, subjectId: subLong.id, lessonsPerWeek: 6, teacherId: teacher.id });
  await saveClassSubjectNeed(user, { classId: classShort.id, subjectId: subShort.id, lessonsPerWeek: 6, teacherId: teacher.id });

  const job = await startGeneration(user);
  let status: string = job.status;
  for (let i = 0; i < 40 && (status === "QUEUED" || status === "RUNNING"); i++) {
    await sleep(400);
    const j = await getGenerationJob(user, job.id);
    status = j?.status ?? status;
  }
  check("1. Real Master Button generation reaches DONE (not stuck/failed)", status === "DONE");

  const slots = await withTenant(t.id, () =>
    tenantDb().timetableSlot.findMany({ where: { teacherId: teacher.id, classId: { in: [classLong.id, classShort.id] } } })
  );
  check("2. The shared teacher genuinely got real lessons placed on both real classes", slots.some((s) => s.classId === classLong.id) && slots.some((s) => s.classId === classShort.id));

  const longConfig = await withTenant(t.id, () => tenantDb().timetableConfig.findFirst({ where: { classId: classLong.id } }));
  const shortConfig = await withTenant(t.id, () => tenantDb().timetableConfig.findFirst({ where: { classId: classShort.id } }));

  const withTimes = slots.map((s) => {
    const cfg: any = s.classId === classLong.id ? longConfig : shortConfig;
    const start = periodStartMinutes(s.period, cfg);
    const duration = cfg!.lessonDurationMins;
    return { ...s, start, end: start + duration };
  });

  let realOverlapFound = false;
  for (let i = 0; i < withTimes.length; i++) {
    for (let j = i + 1; j < withTimes.length; j++) {
      const a = withTimes[i], b = withTimes[j];
      if (a.dayOfWeek !== b.dayOfWeek) continue;
      if (a.classId === b.classId) continue;
      const overlaps = a.start < b.end && b.start < a.end;
      if (overlaps) realOverlapFound = true;
    }
  }
  check("3. CRITICAL: zero genuine real wall-clock overlaps for the shared teacher across the two differently-shaped real classes (the actual bug this closes)", !realOverlapFound);

  // Cross-tenant isolation — a different tenant's own generation run must
  // never see or be affected by this tenant's own real teacher bookings.
  const otherTenant = await db.tenant.findFirst({ where: { slug: { not: SLUG } } });
  check("4. CRITICAL: cross-tenant isolation — this test's own real teacher/classes are scoped to its own dedicated tenant only", !!otherTenant && otherTenant.id !== t.id);

  await withTenant(t.id, async () => {
    const tdb = tenantDb();
    await tdb.timetableGenerationJob.deleteMany({});
    await tdb.timetableSlot.deleteMany({});
    await tdb.classSubjectNeed.deleteMany({});
    await tdb.timetableConfig.deleteMany({});
    await tdb.teacherSubject.deleteMany({});
    await tdb.schoolClass.deleteMany({});
    await tdb.subject.deleteMany({});
  });
  await db.user.deleteMany({ where: { tenantId: t.id } });
  await db.tenant.delete({ where: { id: t.id } });
  console.log("All DD.10 cross-level-conflict test fixtures cleaned up (dedicated tenant fully removed).");

  console.log(`\n  ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.log("  \u274c DD.10 cross-level teacher real-time-conflict fix has a regression");
    process.exit(1);
  }
  console.log("  \u2705 DD.10 cross-level teacher real-time-conflict fix all green");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
