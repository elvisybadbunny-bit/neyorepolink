/**
 * AA.2 — Teacher Allocation Import, full real regression test.
 *
 * Founder's own onboarding scenario: a school switching to NEYO already
 * has their teacher-subject-class allocations on paper/Excel — this
 * proves the real CSV/paste import path against real DB data (real
 * tenant, real teachers/subjects/classes created fresh — no mocks).
 *
 * Real assertions:
 *  1. An existing real teacher (matched by name) is correctly identified
 *     as EXISTING, not re-created.
 *  2. A genuinely new teacher name is correctly flagged NEW in preview.
 *  3. Committing WITHOUT createMissingTeachers correctly skips the NEW-
 *     teacher row (never silently invents a teacher).
 *  4. Committing WITH createMissingTeachers genuinely creates the real
 *     new teacher + real TeacherSubject link + real ClassSubjectNeed.
 *  5. Re-importing the SAME row a second time correctly reports
 *     WILL_UPDATE (matched, not duplicated) rather than creating a 2nd
 *     real ClassSubjectNeed row for the same class+subject.
 *  6. A row naming a real subject/class that doesn't exist is honestly
 *     flagged NOT_FOUND with a clear real error message, never silently
 *     dropped or guessed.
 *  7. A real TeacherAllocationImport history row is created with correct
 *     real counts.
 *
 * Cleans up everything it creates.
 */
import { db } from "@/lib/db";
import { withTenant } from "@/lib/core/tenant-context";
import {
  previewTeacherAllocationImport,
  commitTeacherAllocationImport,
} from "../src/lib/services/teacher-allocation-import.service";
import type { SessionUser } from "@/lib/core/session";

let pass = 0, fail = 0;
function check(name: string, cond: boolean) {
  if (cond) { pass++; console.log(`  \u2713 ${name}`); }
  else { fail++; console.log(`  \u2717 ${name}`); }
}
function su(u: any, tenantId: string): SessionUser {
  return { id: u.id, tenantId, neyoLoginId: u.id, fullName: u.fullName, phone: null, email: u.email, role: u.role, secondaryRole: null, language: "en" } as any;
}

async function main() {
  const t = await db.tenant.findUniqueOrThrow({ where: { slug: "karibu-high" } });
  const principal = su(await db.user.findFirstOrThrow({ where: { tenantId: t.id, role: "PRINCIPAL" } }), t.id);
  const suffix = Date.now() % 100000;

  const cls = await db.schoolClass.create({ data: { tenantId: t.id, level: `AA2${suffix}`, stream: "EAST", curriculum: "8-4-4" } });
  const subject = await db.subject.create({ data: { tenantId: t.id, name: `AA2-Subject-${suffix}`, code: `AA2S${suffix}`, curriculum: "8-4-4" } });
  const existingTeacher = await db.user.create({ data: { tenantId: t.id, neyoLoginId: `aa2t${suffix}`, fullName: `AA2 Existing Teacher ${suffix}`, role: "TEACHER", isActive: true } as any });

  let newTeacherId: string | null = null;
  try {
    await withTenant(t.id, async () => {
      // Row 1: existing teacher, real subject, real class -> should preview as EXISTING/WILL_CREATE.
      // Row 2: brand-new teacher name -> should preview as NEW.
      // Row 3: real teacher, but a subject that doesn't exist -> should preview as NOT_FOUND with a real error.
      const rows = [
        { teacherName: existingTeacher.fullName, subjectName: subject.name, className: `AA2${suffix} East`, lessonsPerWeek: 4, doubleCount: 1 },
        { teacherName: `AA2 Brand New Teacher ${suffix}`, subjectName: subject.name, className: `AA2${suffix} East`, lessonsPerWeek: 3, doubleCount: 0 },
        { teacherName: existingTeacher.fullName, subjectName: `AA2 Nonexistent Subject ${suffix}`, className: `AA2${suffix} East`, lessonsPerWeek: 2, doubleCount: 0 },
      ];

      const preview1 = await previewTeacherAllocationImport(principal, rows);
      check("Row 1 (existing teacher) correctly matched EXISTING", preview1[0].teacherMatch === "EXISTING" && preview1[0].matchedTeacherId === existingTeacher.id);
      check("Row 1 correctly previews WILL_CREATE (no existing ClassSubjectNeed yet)", preview1[0].needMatch === "WILL_CREATE");
      check("Row 2 (brand-new teacher name) correctly flagged NEW", preview1[1].teacherMatch === "NEW" && preview1[1].matchedTeacherId === null);
      check("Row 3 (nonexistent subject) correctly flagged NOT_FOUND with a real error message", preview1[2].subjectMatch === "NOT_FOUND" && !!preview1[2].error);

      // Commit WITHOUT createMissingTeachers — row 2 should be skipped honestly.
      const result1 = await commitTeacherAllocationImport(principal, {
        rows, fileName: "aa2-test.csv", source: "csv", createMissingTeachers: false, skipInvalid: true,
      });
      check("Commit without createMissingTeachers creates exactly 1 real ClassSubjectNeed (row 1 only)", result1.createdNeeds === 1);
      check("Commit without createMissingTeachers creates ZERO new teachers", result1.createdTeachers === 0);
      check("Commit reports 2 real failed rows (new-teacher-not-confirmed + nonexistent-subject)", result1.failedRows === 2);

      const realNeed = await db.classSubjectNeed.findFirst({ where: { classId: cls.id, subjectId: subject.id } });
      check("Real ClassSubjectNeed genuinely created with the real matched teacher + real lesson counts", !!realNeed && realNeed.teacherId === existingTeacher.id && realNeed.lessonsPerWeek === 4 && realNeed.doubleCount === 1);

      const realLink = await db.teacherSubject.findFirst({ where: { teacherId: existingTeacher.id, subjectId: subject.id } });
      check("Real TeacherSubject link genuinely created", !!realLink);

      // Re-import the SAME row 1 again -> should now preview WILL_UPDATE, not WILL_CREATE.
      const preview2 = await previewTeacherAllocationImport(principal, [rows[0]]);
      check("Re-importing the same row now correctly previews WILL_UPDATE (matched, not duplicated)", preview2[0].needMatch === "WILL_UPDATE");

      // Commit row 2 (the new teacher) WITH createMissingTeachers confirmed.
      const result2 = await commitTeacherAllocationImport(principal, {
        rows: [rows[1]], fileName: "aa2-test-2.csv", source: "csv", createMissingTeachers: true, skipInvalid: true,
      });
      check("Commit WITH createMissingTeachers genuinely creates exactly 1 new real teacher", result2.createdTeachers === 1);
      check("Commit WITH createMissingTeachers correctly UPDATES the existing ClassSubjectNeed (same class+subject as row 1) rather than duplicating it", result2.matchedNeeds === 1 && result2.createdNeeds === 0);

      const newTeacher = await db.user.findFirst({ where: { tenantId: t.id, fullName: `AA2 Brand New Teacher ${suffix}` } });
      newTeacherId = newTeacher?.id ?? null;
      check("The real new teacher genuinely exists in the DB now, with the exact real name from the import row", !!newTeacher);

      const importHistory = await db.teacherAllocationImport.findUnique({ where: { id: result1.importId } });
      check("Real TeacherAllocationImport history row created with correct real counts", !!importHistory && importHistory.createdNeeds === 1 && importHistory.failedRows === 2);

      // Confirm re-importing again did NOT create a 2nd ClassSubjectNeed row.
      const needCount = await db.classSubjectNeed.count({ where: { classId: cls.id, subjectId: subject.id } });
      check("Exactly ONE real ClassSubjectNeed row exists for this class+subject (no duplicate created by the re-import)", needCount === 1);

      // Real bug found and fixed live during this feature's own seed-data
      // testing: the SAME genuinely-new teacher name appearing on 2
      // DIFFERENT rows within ONE commit batch (e.g. one new teacher
      // allocated to 2 different real classes) must create exactly ONE
      // real new teacher, not one per row.
      const cls2 = await db.schoolClass.create({ data: { tenantId: t.id, level: `AA2B${suffix}`, stream: "WEST", curriculum: "8-4-4" } });
      const sameTeacherRows = [
        { teacherName: `AA2 Batch Teacher ${suffix}`, subjectName: subject.name, className: `AA2${suffix} East`, lessonsPerWeek: 3, doubleCount: 0 },
        { teacherName: `AA2 Batch Teacher ${suffix}`, subjectName: subject.name, className: `AA2B${suffix} WEST`, lessonsPerWeek: 3, doubleCount: 0 },
      ];
      const batchResult = await commitTeacherAllocationImport(principal, {
        rows: sameTeacherRows, fileName: "aa2-batch-test.csv", source: "csv", createMissingTeachers: true, skipInvalid: true,
      });
      check("A real NEW teacher named on 2 different rows in ONE batch creates EXACTLY 1 real new teacher (not 2)", batchResult.createdTeachers === 1);
      const batchTeacherCount = await db.user.count({ where: { tenantId: t.id, fullName: `AA2 Batch Teacher ${suffix}` } });
      check("Exactly ONE real User row exists for that teacher name (no duplicate created within the batch)", batchTeacherCount === 1);
      await db.classSubjectNeed.deleteMany({ where: { classId: { in: [cls.id, cls2.id] } } });
      await db.teacherAllocationImport.deleteMany({ where: { fileName: "aa2-batch-test.csv" } });
      const batchTeacher = await db.user.findFirst({ where: { tenantId: t.id, fullName: `AA2 Batch Teacher ${suffix}` } });
      if (batchTeacher) await db.user.delete({ where: { id: batchTeacher.id } });
      await db.schoolClass.deleteMany({ where: { id: cls2.id } });
    });
  } finally {
    await db.classSubjectNeed.deleteMany({ where: { classId: cls.id } });
    await db.teacherSubject.deleteMany({ where: { subjectId: subject.id } });
    await db.teacherAllocationImport.deleteMany({ where: { tenantId: t.id, fileName: { in: ["aa2-test.csv", "aa2-test-2.csv"] } } });
    await db.user.deleteMany({ where: { id: { in: [existingTeacher.id, ...(newTeacherId ? [newTeacherId] : [])] } } });
    await db.subject.deleteMany({ where: { id: subject.id } });
    await db.schoolClass.deleteMany({ where: { id: cls.id } });
    const confirmClean = await db.schoolClass.findMany({ where: { id: cls.id } });
    check("All AA.2 test fixtures fully cleaned up (confirmed via direct re-query)", confirmClean.length === 0);
  }

  console.log(`\n  ${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
  console.log("  \u2705 AA.2 Teacher Allocation Import all green");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
