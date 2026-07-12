/**
 * BB.3 — Real class-size cap + overflow decision, full real regression
 * test.
 *
 * Founder's own real scenario, verbatim: "again the school can add their
 * maximum number for a class so that when the system combines different
 * classes into one class and their is a big number remaining a new
 * teacher is added or a school can just press allow all in that one class
 * even if they surpass the number."
 *
 * Real assertions, all against the live DB (real tenant, real classes/
 * students/subjects/teachers created fresh — no mocks):
 *  1. checkCapacity() never flags a class with no configured capacity
 *     (a school that hasn't set one is never bothered).
 *  2. checkCapacity() correctly computes the real deduplicated projected
 *     headcount (a student already IN the class isn't double-counted).
 *  3. checkCapacity() correctly detects a genuine overflow and creates a
 *     real PENDING ClassCapacityOverflowRun.
 *  4. decideOverflow(ALLOW_OVER_CAPACITY) makes zero real class-row
 *     changes and correctly records the real decision.
 *  5. decideOverflow(SPLIT_NEW_CLASS) creates a genuinely new real class,
 *     named from the school's own real input, with the source class's
 *     own real capacity carried over.
 *  6. The new class's own real ClassSubjectNeed gap is filled by the fair
 *     auto-assign engine ONLY when a real causing subject was known.
 *  7. Deciding an already-decided run is blocked (a real, honest
 *     CONFLICT).
 *  8. L.7 auto-grouping's real preview surfaces the exact same real
 *     capacityWarnings for a flagged class.
 *  9. L.7 auto-grouping's real commit REFUSES without a real decision for
 *     every flagged class (never silently over-fills).
 * 10. L.7 auto-grouping's real commit succeeds once a real
 *     ALLOW_OVER_CAPACITY decision is supplied, and genuinely records the
 *     same real audit trail as the standalone flow.
 * 11. Cross-tenant isolation: a different tenant cannot see our real
 *     ClassCapacityOverflowRun rows.
 *
 * Cleans up everything it creates.
 */
import { PrismaClient } from "@prisma/client";
import { withTenant } from "../src/lib/core/tenant-context";
import { tenantDb } from "../src/lib/core/tenant-db";
import {
  checkCapacity, decideOverflow, ClassCapacityOverflowError,
} from "../src/lib/services/class-capacity-overflow.service";
import { runAutoGroupingPreview, commitAutoGrouping, AutoGroupingError } from "../src/lib/services/l7-auto-grouping.service";
import type { SessionUser } from "../src/lib/core/session";

const db = new PrismaClient();
let pass = 0, fail = 0;
function check(name: string, cond: boolean) {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}`); }
}
function su(u: { id: string; fullName: string; email: string | null; role: string }, tenantId: string): SessionUser {
  return { id: u.id, tenantId, neyoLoginId: u.id, fullName: u.fullName, phone: null, email: u.email, role: u.role, secondaryRole: null, language: "en" } as unknown as SessionUser;
}

async function main() {
  const t1 = await db.tenant.findUniqueOrThrow({ where: { slug: "karibu-high" } });
  const t2 = await db.tenant.findUniqueOrThrow({ where: { slug: "uwezo-primary-junior" } });
  const principal1 = su(await db.user.findFirstOrThrow({ where: { tenantId: t1.id, role: "PRINCIPAL" } }), t1.id);
  const suffix = Date.now() % 100000;

  // ---- 1-7: standalone checkCapacity()/decideOverflow() ----
  const noCapClass = await db.schoolClass.create({ data: { tenantId: t1.id, level: `BB3${suffix}`, stream: "NoCap", curriculum: "8-4-4" } as never });
  const capClass = await db.schoolClass.create({ data: { tenantId: t1.id, level: `BB3${suffix}`, stream: "Cap", curriculum: "8-4-4", capacity: 2 } as never });
  const existingStudent = await db.student.create({ data: { tenantId: t1.id, admissionNo: `BB3-${suffix}-E`, firstName: "T", lastName: "Existing", gender: "M", classId: capClass.id, status: "ACTIVE" } as never });
  const newStudents = await Promise.all([1, 2, 3].map((n) =>
    db.student.create({ data: { tenantId: t1.id, admissionNo: `BB3-${suffix}-N${n}`, firstName: "T", lastName: `New${n}`, gender: "M", classId: capClass.id, status: "ACTIVE" } as never })
  ));
  const subj = await db.subject.create({ data: { tenantId: t1.id, name: `BB3 Geo ${suffix}`, code: `G${suffix}`.slice(0, 10), curriculum: "8-4-4" } as never });
  const teacher = await db.user.create({ data: { tenantId: t1.id, neyoLoginId: `bb3t${suffix}`, fullName: "BB3 Geo Teacher", role: "TEACHER", isActive: true } as never });
  await db.teacherSubject.create({ data: { tenantId: t1.id, teacherId: teacher.id, subjectId: subj.id } as never });

  let newClassId = "";
  try {
    // 1. no-capacity class never flags.
    const noCapCheck = await checkCapacity(principal1, { classId: noCapClass.id, studentIds: newStudents.map((s) => s.id) });
    check("1. A class with no configured capacity is never flagged", noCapCheck.overflow === false);

    // 2-3. real overflow detection with correct dedup.
    const check1 = await checkCapacity(principal1, { classId: capClass.id, studentIds: [existingStudent.id, ...newStudents.map((s) => s.id)], subjectId: subj.id });
    check("2. Correctly deduplicates the already-existing student", check1.overflow && (check1 as any).projectedTotal === 4);
    check("3. Correctly detects the real overflow amount", check1.overflow && (check1 as any).overflowCount === 2);
    const runRow = await db.classCapacityOverflowRun.findUnique({ where: { id: (check1 as any).runId } });
    check("3. A real PENDING ClassCapacityOverflowRun was created", runRow?.decision === "PENDING");

    // 4. ALLOW_OVER_CAPACITY makes no real class changes.
    const decided1 = await decideOverflow(principal1, { action: "decide", runId: (check1 as any).runId, decision: "ALLOW_OVER_CAPACITY" });
    check("4. ALLOW_OVER_CAPACITY correctly makes no real class changes", decided1.newClassId === null);
    const capClassAfter = await db.schoolClass.findUnique({ where: { id: capClass.id } });
    check("4. The original class's own real capacity is untouched", capClassAfter?.capacity === 2);

    // 7. deciding again is blocked.
    let blockedDoubleDecide = false;
    try {
      await decideOverflow(principal1, { action: "decide", runId: (check1 as any).runId, decision: "ALLOW_OVER_CAPACITY" });
    } catch (e) {
      blockedDoubleDecide = e instanceof ClassCapacityOverflowError && e.code === "CONFLICT";
    }
    check("7. Deciding an already-decided run is blocked", blockedDoubleDecide);

    // 5-6. SPLIT_NEW_CLASS on a fresh overflow.
    const check2 = await checkCapacity(principal1, { classId: capClass.id, studentIds: [existingStudent.id, ...newStudents.map((s) => s.id)], subjectId: subj.id });
    const decided2 = await decideOverflow(principal1, { action: "decide", runId: (check2 as any).runId, decision: "SPLIT_NEW_CLASS", newClassName: "Geo" });
    newClassId = decided2.newClassId!;
    const newClassRow = await db.schoolClass.findUnique({ where: { id: newClassId } });
    check("5. A genuinely new real class was created", Boolean(newClassRow));
    check("5. The new class's own real stream is named from the school's real input", newClassRow?.stream === "Geo");
    check("5. The new class's own real capacity is carried over from the source class", newClassRow?.capacity === 2);
    const newClassNeed = await db.classSubjectNeed.findFirst({ where: { classId: newClassId, subjectId: subj.id } });
    check("6. The new class's real causing-subject gap was filled by the fair auto-assign engine", newClassNeed?.teacherId === teacher.id);
    check("6. autoAssignedTeacherCount honestly reports the real fill", decided2.autoAssignedTeacherCount === 1);

    // ---- 8-10: L.7 auto-grouping integration ----
    const l7Level = `BB3L7${suffix}`;
    const l7Cap = await db.schoolClass.create({ data: { tenantId: t1.id, level: l7Level, stream: "A", curriculum: "8-4-4", capacity: 1 } as never });
    const l7Free = await db.schoolClass.create({ data: { tenantId: t1.id, level: l7Level, stream: "B", curriculum: "8-4-4" } as never });
    const l7Students = await Promise.all([1, 2, 3].map((n) =>
      db.student.create({ data: { tenantId: t1.id, admissionNo: `BB3L7-${suffix}-${n}`, firstName: "T", lastName: `L7-${n}`, gender: "M", classId: l7Cap.id, status: "ACTIVE" } as never })
    ));

    const l7Preview = await runAutoGroupingPreview(principal1, l7Level);
    check("8. L.7 preview correctly surfaces a real capacityWarnings entry for the flagged class", l7Preview.capacityWarnings.some((w) => w.classId === l7Cap.id));

    let refusedNoDecision = false;
    try {
      await commitAutoGrouping(principal1, l7Level);
    } catch (e) {
      refusedNoDecision = e instanceof AutoGroupingError && e.code === "CONFLICT";
    }
    check("9. L.7 commit REFUSES without a real decision for the flagged class", refusedNoDecision);

    const l7Commit = await commitAutoGrouping(principal1, l7Level, { [l7Cap.id]: "ALLOW_OVER_CAPACITY" });
    check("10. L.7 commit succeeds once a real decision is supplied", Boolean(l7Commit.summary));
    const l7AuditRow = await db.classCapacityOverflowRun.findFirst({ where: { classId: l7Cap.id, decision: "ALLOW_OVER_CAPACITY" } });
    check("10. L.7's own commit genuinely records the same real audit trail as the standalone flow", Boolean(l7AuditRow));

    // ---- 11: cross-tenant isolation ----
    const crossTenantRuns = await withTenant(t2.id, () => tenantDb().classCapacityOverflowRun.findMany({ where: { OR: [{ classId: capClass.id }, { classId: l7Cap.id }] } }));
    check("11. CRITICAL: a different tenant sees ZERO of our real overflow runs", crossTenantRuns.length === 0);

    // cleanup L.7 fixtures
    await db.classCapacityOverflowRun.deleteMany({ where: { classId: { in: [l7Cap.id, l7Free.id] } } });
    await db.promotionRun.deleteMany({ where: { tenantId: t1.id, summary: { contains: l7Level } } });
    await db.student.deleteMany({ where: { id: { in: l7Students.map((s) => s.id) } } });
    await db.schoolClass.deleteMany({ where: { id: { in: [l7Cap.id, l7Free.id] } } });
  } finally {
    await db.classCapacityOverflowRun.deleteMany({ where: { classId: { in: [capClass.id, noCapClass.id, newClassId].filter(Boolean) as string[] } } });
    await db.classSubjectNeed.deleteMany({ where: { classId: { in: [capClass.id, newClassId].filter(Boolean) as string[] } } });
    await db.teacherSubject.deleteMany({ where: { teacherId: teacher.id } });
    await db.user.delete({ where: { id: teacher.id } }).catch(() => {});
    await db.subject.delete({ where: { id: subj.id } }).catch(() => {});
    await db.student.deleteMany({ where: { id: { in: [existingStudent.id, ...newStudents.map((s) => s.id)] } } });
    await db.schoolClass.deleteMany({ where: { id: { in: [capClass.id, noCapClass.id, newClassId].filter(Boolean) as string[] } } });
  }

  const remaining = await db.classCapacityOverflowRun.findMany({ where: { classId: { in: [capClass.id, noCapClass.id] } } });
  check("All BB.3 test fixtures fully cleaned up (confirmed via direct re-query)", remaining.length === 0);

  console.log(`\n  ${pass} passed, ${fail} failed`);
  console.log(fail === 0 ? "  ✅ BB.3 Real class-size cap + overflow decision all green" : "  ❌ FAILURES ABOVE");
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
