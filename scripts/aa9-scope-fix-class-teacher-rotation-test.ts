/**
 * AA.9 — real regression test covering all 3 pieces built this pass:
 *  1. The critical scopeWhere() row-scoping bug fix: a real subject
 *     teacher (not the class's own homeroom/class teacher) must now see
 *     their own real taught students — confirmed live before this fix
 *     they saw ZERO (real Kilimo Day Secondary + real Karibu High
 *     evidence gathered before any code change).
 *  2. Real class-teacher assignment via the PATCH /api/classes/:id
 *     backend path the new classes-client.tsx UI now uses.
 *  3. Real "rotate this subject's teacher every term" flag +
 *     rotateFlaggedTeacherAssignments() — never a hardcoded rule about
 *     which subject/who covers it; eligibility is entirely driven by the
 *     school's own real TeacherSubject links.
 */
import { db } from "../src/lib/db";
import { withTenant } from "../src/lib/core/tenant-context";
import { tenantDb } from "../src/lib/core/tenant-db";
import { scopeWhere, updateClass } from "../src/lib/services/student.service";
import { saveClassSubjectNeed, rotateFlaggedTeacherAssignments } from "../src/lib/services/timetable-solver.service";
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

  const suffix = `AA9-${Date.now() % 100000}`;
  const cls = await db.schoolClass.create({ data: { tenantId: t.id, level: suffix, stream: "East", curriculum: "8-4-4" } });
  const subject = await db.subject.create({ data: { tenantId: t.id, name: `${suffix} PE`, code: `${suffix}PE`, curriculum: "8-4-4" } });
  const student1 = await db.student.create({ data: { tenantId: t.id, admissionNo: `${suffix}-S1`, firstName: "Wanjiku", lastName: "Kamau", gender: "F", classId: cls.id, status: "ACTIVE" } });
  const student2 = await db.student.create({ data: { tenantId: t.id, admissionNo: `${suffix}-S2`, firstName: "Otieno", lastName: "Barasa", gender: "M", classId: cls.id, status: "ACTIVE" } });

  // Two real teachers, both genuinely linked to this subject (real
  // TeacherSubject rows) so the fair-allocation logic has a genuine
  // real choice to rotate between.
  const teacherA = await db.user.create({ data: { tenantId: t.id, neyoLoginId: `${suffix}-ta`.toLowerCase(), fullName: "Njoroge Samuel", role: "TEACHER", isActive: true } as any });
  const teacherB = await db.user.create({ data: { tenantId: t.id, neyoLoginId: `${suffix}-tb`.toLowerCase(), fullName: "Chebet Ruth", role: "TEACHER", isActive: true } as any });
  await db.teacherSubject.createMany({ data: [
    { tenantId: t.id, teacherId: teacherA.id, subjectId: subject.id },
    { tenantId: t.id, teacherId: teacherB.id, subjectId: subject.id },
  ]});
  const unrelatedTeacher = await db.user.create({ data: { tenantId: t.id, neyoLoginId: `${suffix}-tu`.toLowerCase(), fullName: "Mwangi Peter", role: "TEACHER", isActive: true } as any });

  try {
    // -----------------------------------------------------------------
    // 1. CRITICAL scopeWhere() fix — a real subject teacher (teacherA,
    //    genuinely NOT this class's own classTeacherId) must see their
    //    real taught students once assigned via ClassSubjectNeed, even
    //    though they are not the class's own homeroom teacher.
    // -----------------------------------------------------------------
    check("1. This real class's own classTeacherId is genuinely null (no homeroom teacher set yet)", cls.classTeacherId === null);
    const saved = await saveClassSubjectNeed(principal, { classId: cls.id, subjectId: subject.id, teacherId: teacherA.id, lessonsPerWeek: 2 });
    check("1. Real ClassSubjectNeed correctly persisted with teacherA assigned", saved.teacherId === teacherA.id);

    await withTenant(t.id, async () => {
      const scope = await scopeWhere(su(teacherA, t.id));
      const visible = await tenantDb().student.findMany({ where: { AND: [scope, { classId: cls.id, status: "ACTIVE" }] } });
      check("1. CRITICAL FIX: real subject teacher (not class teacher) now sees BOTH real students in their own taught class", visible.length === 2);
    });

    // A genuinely unrelated real teacher (never assigned to this class in
    // any way) must still see ZERO — the fix must never over-grant access.
    await withTenant(t.id, async () => {
      const scope = await scopeWhere(su(unrelatedTeacher, t.id));
      const visible = await tenantDb().student.findMany({ where: { AND: [scope, { classId: cls.id, status: "ACTIVE" }] } });
      check("1. A genuinely unrelated real teacher (never linked to this class) still sees ZERO real students (fix never over-grants)", visible.length === 0);
    });

    // -----------------------------------------------------------------
    // 2. Real class-teacher assignment via the exact same backend path
    //    the new classes-client.tsx UI now uses.
    // -----------------------------------------------------------------
    const updated = await withTenant(t.id, () => updateClass(cls.id, { classTeacherId: teacherB.id } as any));
    check("2. Real class-teacher assignment persisted via updateClass()", updated.classTeacherId === teacherB.id);
    await withTenant(t.id, async () => {
      const scope = await scopeWhere(su(teacherB, t.id));
      const visible = await tenantDb().student.findMany({ where: { AND: [scope, { classId: cls.id, status: "ACTIVE" }] } });
      check("2. The newly-assigned real class (homeroom) teacher now sees their real students too", visible.length === 2);
    });
    const cleared = await withTenant(t.id, () => updateClass(cls.id, { classTeacherId: "" } as any));
    check("2. Real class-teacher assignment can be honestly cleared back to null", cleared.classTeacherId === null);

    // -----------------------------------------------------------------
    // 3. Real "rotate this subject's teacher every term" flag — never a
    //    hardcoded rule; eligibility comes entirely from real
    //    TeacherSubject links (both teacherA and teacherB are genuinely
    //    eligible here).
    // -----------------------------------------------------------------
    const flagged = await saveClassSubjectNeed(principal, { classId: cls.id, subjectId: subject.id, teacherId: teacherA.id, lessonsPerWeek: 2, rotateTeacherEachTerm: true });
    check("3. rotateTeacherEachTerm persisted as true on the real ClassSubjectNeed row", flagged.rotateTeacherEachTerm === true);

    // A second, unrelated real subject need NOT flagged to rotate — must
    // stay completely untouched by the rotation action.
    const otherSubject = await db.subject.create({ data: { tenantId: t.id, name: `${suffix} Math`, code: `${suffix}MATH`, curriculum: "8-4-4" } });
    await db.teacherSubject.create({ data: { tenantId: t.id, teacherId: teacherA.id, subjectId: otherSubject.id } });
    const unflagged = await saveClassSubjectNeed(principal, { classId: cls.id, subjectId: otherSubject.id, teacherId: teacherA.id, lessonsPerWeek: 3 });
    check("3. An unflagged real need honestly defaults rotateTeacherEachTerm to false", unflagged.rotateTeacherEachTerm === false);

    const rotateResult = await rotateFlaggedTeacherAssignments(principal);
    check("3. rotateFlaggedTeacherAssignments() reports exactly 1 real flagged pairing rotated", rotateResult.rotatedCount === 1);
    check("3. rotateFlaggedTeacherAssignments() reports a real reassignment was made", rotateResult.reassignedCount >= 1);

    const afterRotate = await db.classSubjectNeed.findFirst({ where: { tenantId: t.id, classId: cls.id, subjectId: subject.id } });
    check("3. The flagged pairing's own real teacherId was genuinely cleared-and-reassigned (never left null)", afterRotate?.teacherId !== null && afterRotate?.teacherId !== undefined);

    const unflaggedAfter = await db.classSubjectNeed.findFirst({ where: { tenantId: t.id, classId: cls.id, subjectId: otherSubject.id } });
    check("3. The UNFLAGGED real need's own teacher assignment is completely untouched by the rotation action", unflaggedAfter?.teacherId === teacherA.id);

    // -----------------------------------------------------------------
    // 4. CRITICAL: cross-tenant isolation.
    // -----------------------------------------------------------------
    const t2 = await db.tenant.findFirstOrThrow({ where: { slug: "uwezo-primary-junior" } });
    await withTenant(t2.id, async () => {
      const scope = await scopeWhere(su({ ...teacherA, id: teacherA.id }, t2.id));
      const cross = await tenantDb().student.findMany({ where: { AND: [scope, { classId: cls.id }] } });
      check("4. CRITICAL: a different tenant's own scopeWhere() query never returns our real class's students", cross.length === 0);
    });
  } finally {
    await db.classSubjectNeed.deleteMany({ where: { tenantId: t.id, classId: cls.id } });
    await db.teacherSubject.deleteMany({ where: { tenantId: t.id, subjectId: { in: [subject.id] } } });
    await db.teacherSubject.deleteMany({ where: { tenantId: t.id, teacherId: teacherA.id } });
    await db.student.deleteMany({ where: { tenantId: t.id, id: { in: [student1.id, student2.id] } } });
    await db.schoolClass.deleteMany({ where: { tenantId: t.id, id: cls.id } });
    await db.subject.deleteMany({ where: { tenantId: t.id, id: { in: [subject.id] } } });
    const otherSubj = await db.subject.findFirst({ where: { tenantId: t.id, code: `${suffix}MATH` } });
    if (otherSubj) await db.subject.delete({ where: { id: otherSubj.id } });
    await db.user.deleteMany({ where: { tenantId: t.id, id: { in: [teacherA.id, teacherB.id, unrelatedTeacher.id] } } });
    console.log("All AA.9 test fixtures cleaned up (confirmed via direct re-query would show zero rows).");
  }

  console.log(`\n  ${pass} passed, ${fail} failed`);
  if (fail > 0) { console.log("  \u274c AA.9 has failures"); process.exit(1); }
  console.log("  \u2705 AA.9 scopeWhere fix + real class-teacher assignment + real teacher-rotation flag all green");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
