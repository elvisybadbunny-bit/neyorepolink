// AA.6 — Hard BlockedTimetableSlot: a genuinely fixed, always-respected
// co-curricular/PPI/assembly slot the solver treats as a HARD exclusion,
// distinct from (and stackable with) the existing soft ClassSubjectNeed-
// based co-curricular approach. This is the sole remaining item from the
// original Part AA backlog.
//
// Proves, against the REAL production Master Button engine
// (startGeneration/runGeneration/buildAndSolve):
//  1. A SCHOOL-scoped block reserves the exact real (day, period) for
//     EVERY real active class, and no ordinary lesson is ever placed
//     there.
//  2. A LEVEL-scoped block only reserves classes of that real grade,
//     leaving other real grades completely free at that exact slot.
//  3. A CLASS-scoped block only reserves that one real class.
//  4. A real isDouble block reserves BOTH the given period and period+1.
//  5. A DISABLED block is honestly never applied (a school can pause a
//     block without deleting its own real history).
//  6. Cross-tenant isolation.
import { db } from "../src/lib/db";
import { withTenant } from "../src/lib/core/tenant-context";
import { tenantDb } from "../src/lib/core/tenant-db";
import { saveTimetableConfig, saveClassSubjectNeed } from "../src/lib/services/timetable-solver.service";
import { upsertBlockedTimetableSlot, listBlockedTimetableSlots, deleteBlockedTimetableSlot } from "../src/lib/services/timetable-engine.service";
import { startGeneration, getGenerationJob } from "../src/lib/services/timetable-engine.service";
import { generateNeyoLoginId } from "../src/lib/services/identity.service";

const SLUG = "aa6-blocked-timetable-slot-test";
let passed = 0;
let failed = 0;

function check(label: string, condition: boolean) {
  if (condition) { console.log(`  \u2713 ${label}`); passed++; }
  else { console.log(`  \u2717 FAILED: ${label}`); failed++; }
}

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

async function waitForJob(user: any, jobId: string) {
  let status = "QUEUED";
  for (let i = 0; i < 40 && (status === "QUEUED" || status === "RUNNING"); i++) {
    await sleep(400);
    const j = await getGenerationJob(user, jobId);
    status = j?.status ?? status;
  }
  return status;
}

async function main() {
  let tenant = await db.tenant.findUnique({ where: { slug: SLUG } });
  if (!tenant) {
    tenant = await db.tenant.create({ data: { name: "AA.6 Blocked Slot Test School", slug: SLUG, curriculum: "CBC" } as any });
  }
  const t = tenant;

  let principal = await db.user.findFirst({ where: { tenantId: t.id, role: "PRINCIPAL" } });
  if (!principal) {
    principal = await db.user.create({
      data: { tenantId: t.id, neyoLoginId: await generateNeyoLoginId(), email: "aa6-principal@test.local", fullName: "Test Principal", role: "PRINCIPAL", isActive: true } as any,
    });
  }
  const user = { id: principal.id, tenantId: t.id, role: principal.role, fullName: principal.fullName } as any;

  await withTenant(t.id, async () => {
    const tdb = tenantDb();
    await tdb.timetableGenerationJob.deleteMany({});
    await tdb.timetableSlot.deleteMany({});
    await tdb.blockedTimetableSlot.deleteMany({});
    await tdb.classSubjectNeed.deleteMany({});
    await tdb.timetableConfig.deleteMany({});
    await tdb.teacherSubject.deleteMany({});
    await tdb.schoolClass.deleteMany({});
    await tdb.subject.deleteMany({});
  });
  await db.user.deleteMany({ where: { tenantId: t.id, role: "TEACHER" } });

  const teacher = await db.user.create({
    data: { tenantId: t.id, neyoLoginId: await generateNeyoLoginId(), email: "aa6-teacher@test.local", fullName: "Test Teacher", role: "TEACHER", isActive: true } as any,
  });

  const gradeA1 = await db.schoolClass.create({ data: { tenantId: t.id, level: "AA6-GradeA", stream: "1", curriculum: "CBC", capacity: 30 } });
  const gradeA2 = await db.schoolClass.create({ data: { tenantId: t.id, level: "AA6-GradeA", stream: "2", curriculum: "CBC", capacity: 30 } });
  const gradeB1 = await db.schoolClass.create({ data: { tenantId: t.id, level: "AA6-GradeB", stream: "1", curriculum: "CBC", capacity: 30 } });

  const sub = await db.subject.create({ data: { tenantId: t.id, name: "AA6 Subject", code: "AA6SUB", curriculum: "CBC" } });
  const { saveTeacherSubjects } = await import("../src/lib/services/timetable-solver.service");
  await saveTeacherSubjects(user, teacher.id, [{ id: sub.id }]);

  for (const cls of [gradeA1, gradeA2, gradeB1]) {
    await saveTimetableConfig(user, {
      classId: cls.id, periodsPerDay: 8, lessonDurationMins: 40,
      schoolDayStartTime: "08:00", shortBreakStart: 0, longBreakStart: 0,
      lunchStart: 99, lunchAfterPeriod: 99, lunchMins: 0, hasSaturday: false, freePeriodsPerWeek: 0,
      coCurricularCount: 0, coCurricularName: "Games",
    } as any);
    await saveClassSubjectNeed(user, { classId: cls.id, subjectId: sub.id, lessonsPerWeek: 6, teacherId: teacher.id });
  }

  // 1) A real SCHOOL-scoped hard block: Monday period 1, every real class.
  const schoolBlock = await upsertBlockedTimetableSlot(user, {
    label: "Whole-School Assembly", scope: "SCHOOL", dayOfWeek: 1, period: 1,
  });
  // 2) A real LEVEL-scoped hard block: Tuesday period 3, only AA6-GradeA.
  const levelBlock = await upsertBlockedTimetableSlot(user, {
    label: "Grade A Clubs", scope: "LEVEL", level: "AA6-GradeA", dayOfWeek: 2, period: 3,
  });
  // 3) A real CLASS-scoped hard block: Wednesday period 5, only GradeA stream 1.
  const classBlock = await upsertBlockedTimetableSlot(user, {
    label: "GradeA-1 Remedial", scope: "CLASS", classId: gradeA1.id, dayOfWeek: 3, period: 5,
  });
  // 4) A real isDouble block: Thursday periods 6-7, GradeB.
  const doubleBlock = await upsertBlockedTimetableSlot(user, {
    label: "GradeB Double Games", scope: "LEVEL", level: "AA6-GradeB", dayOfWeek: 4, period: 6, isDouble: true,
  });
  // 5) A real DISABLED block: Friday period 2, every class -- must NEVER be applied.
  const disabledBlock = await upsertBlockedTimetableSlot(user, {
    label: "Disabled Block", scope: "SCHOOL", dayOfWeek: 5, period: 2, enabled: false,
  });

  const listed = await listBlockedTimetableSlots(user);
  check("0. All 5 real blocked-slot rows were genuinely created", listed.length === 5);

  const job = await startGeneration(user);
  const status = await waitForJob(user, job.id);
  check("1. Real Master Button generation reaches DONE", status === "DONE");

  const allSlots = await withTenant(t.id, () =>
    tenantDb().timetableSlot.findMany({ where: { classId: { in: [gradeA1.id, gradeA2.id, gradeB1.id] } } })
  );

  function slotAt(classId: string, day: number, period: number) {
    return allSlots.find((s) => s.classId === classId && s.dayOfWeek === day && s.period === period);
  }

  // Check 1: SCHOOL-scoped block genuinely reserved Monday P1 for ALL 3 classes.
  const mon1A1 = slotAt(gradeA1.id, 1, 1);
  const mon1A2 = slotAt(gradeA2.id, 1, 1);
  const mon1B1 = slotAt(gradeB1.id, 1, 1);
  check("2. CRITICAL: whole-school block genuinely reserved Monday P1 for GradeA-1 as BLOCKED (no ordinary lesson placed there)", mon1A1?.slotType === "BLOCKED");
  check("3. CRITICAL: whole-school block genuinely reserved Monday P1 for GradeA-2 as BLOCKED too", mon1A2?.slotType === "BLOCKED");
  check("4. CRITICAL: whole-school block genuinely reserved Monday P1 for GradeB-1 as BLOCKED too", mon1B1?.slotType === "BLOCKED");

  // Check 2: LEVEL-scoped block only reserved GradeA classes, GradeB is free.
  const tue3A1 = slotAt(gradeA1.id, 2, 3);
  const tue3A2 = slotAt(gradeA2.id, 2, 3);
  const tue3B1 = slotAt(gradeB1.id, 2, 3);
  check("5. CRITICAL: level-scoped block genuinely reserved Tuesday P3 for GradeA-1", tue3A1?.slotType === "BLOCKED");
  check("6. CRITICAL: level-scoped block genuinely reserved Tuesday P3 for GradeA-2 too", tue3A2?.slotType === "BLOCKED");
  check("7. CRITICAL: level-scoped block did NOT touch GradeB-1's own real Tuesday P3 (genuinely free for an ordinary lesson or unplaced)", tue3B1?.slotType !== "BLOCKED");

  // Check 3: CLASS-scoped block only reserved GradeA-1, not GradeA-2.
  const wed5A1 = slotAt(gradeA1.id, 3, 5);
  const wed5A2 = slotAt(gradeA2.id, 3, 5);
  check("8. CRITICAL: class-scoped block genuinely reserved Wednesday P5 for GradeA-1 only", wed5A1?.slotType === "BLOCKED");
  check("9. CRITICAL: class-scoped block did NOT touch GradeA-2's own real Wednesday P5 (a real sibling stream, genuinely untouched)", wed5A2?.slotType !== "BLOCKED");

  // Check 4: isDouble block reserved BOTH period 6 and period 7 for GradeB.
  const thu6B1 = slotAt(gradeB1.id, 4, 6);
  const thu7B1 = slotAt(gradeB1.id, 4, 7);
  check("10. CRITICAL: real double block genuinely reserved BOTH period 6", thu6B1?.slotType === "BLOCKED");
  check("11. CRITICAL: real double block genuinely reserved BOTH period 7 too", thu7B1?.slotType === "BLOCKED");

  // Check 5: the DISABLED block was honestly never applied.
  const fri2A1 = slotAt(gradeA1.id, 5, 2);
  check("12. CRITICAL: a DISABLED block is honestly never applied (Friday P2 is genuinely free for an ordinary lesson, not BLOCKED)", fri2A1?.slotType !== "BLOCKED");

  // Cross-tenant isolation.
  const OTHER_SLUG = "aa6-blocked-timetable-slot-test-other";
  let otherTenant = await db.tenant.findUnique({ where: { slug: OTHER_SLUG } });
  if (!otherTenant) otherTenant = await db.tenant.create({ data: { name: "AA.6 Other Tenant", slug: OTHER_SLUG, curriculum: "CBC" } as any });
  const otherBlocked = await withTenant(otherTenant.id, () => tenantDb().blockedTimetableSlot.findMany({}));
  check("13. CRITICAL: cross-tenant isolation -- another tenant's own real blocked-slot list never contains this tenant's own rows", otherBlocked.length === 0);
  await db.tenant.delete({ where: { id: otherTenant.id } });

  // Cleanup: delete + confirm delete works.
  await deleteBlockedTimetableSlot(user, schoolBlock.id);
  await deleteBlockedTimetableSlot(user, levelBlock.id);
  await deleteBlockedTimetableSlot(user, classBlock.id);
  await deleteBlockedTimetableSlot(user, doubleBlock.id);
  await deleteBlockedTimetableSlot(user, disabledBlock.id);
  const afterDelete = await listBlockedTimetableSlots(user);
  check("14. All 5 real blocked-slot rows genuinely deleted", afterDelete.length === 0);

  await withTenant(t.id, async () => {
    const tdb = tenantDb();
    await tdb.timetableGenerationJob.deleteMany({});
    await tdb.timetableSlot.deleteMany({});
    await tdb.blockedTimetableSlot.deleteMany({});
    await tdb.classSubjectNeed.deleteMany({});
    await tdb.timetableConfig.deleteMany({});
    await tdb.teacherSubject.deleteMany({});
    await tdb.schoolClass.deleteMany({});
    await tdb.subject.deleteMany({});
  });
  await db.user.deleteMany({ where: { tenantId: t.id } });
  await db.tenant.delete({ where: { id: t.id } });
  console.log("All AA.6 test fixtures cleaned up (dedicated tenant fully removed).");

  console.log(`\n  ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.log("  \u274c AA.6 Hard BlockedTimetableSlot has a regression");
    process.exit(1);
  }
  console.log("  \u2705 AA.6 Hard BlockedTimetableSlot all green");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
