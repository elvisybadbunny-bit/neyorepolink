import { tenantDb } from "@/lib/core/tenant-db";
import { withTenant } from "@/lib/core/tenant-context";

export class ReportNarrativeError extends Error {}

export function deterministicSubjectComment(mark: number, deviation: number) {
  if (mark >= 80 && deviation >= 0)
    return "Excellent achievement. Maintain the strong understanding and consistent effort shown.";
  if (mark >= 65 && deviation >= 0)
    return "Good achievement. Keep practising consistently to strengthen mastery further.";
  if (mark >= 50 && deviation >= 0)
    return "Steady achievement. Continue practising the areas covered to build greater confidence.";
  if (mark >= 50)
    return "A fair foundation is visible. Focused revision and regular practice can close the gap to the class mean.";
  if (deviation >= -10)
    return "Developing understanding. Review difficult areas and seek support during the next learning cycle.";
  return "More support is needed. Use guided revision and regular practice, then review progress with the subject teacher.";
}

async function resolveSubjectTeacher(
  tDb: ReturnType<typeof tenantDb>,
  classId: string,
  subjectId: string,
) {
  const slots = await tDb.timetableSlot.findMany({
    where: { classId, subjectId, teacherId: { not: null } },
    select: { teacherId: true },
  });
  const counts = new Map<string, number>();
  for (const slot of slots)
    if (slot.teacherId)
      counts.set(slot.teacherId, (counts.get(slot.teacherId) ?? 0) + 1);
  const teacherId =
    [...counts.entries()].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    )[0]?.[0] ?? null;
  if (!teacherId) return { id: null, name: null };
  const teacher = await tDb.user.findUnique({
    where: { id: teacherId },
    select: { id: true, fullName: true, isActive: true },
  });
  return teacher?.isActive
    ? { id: teacher.id, name: teacher.fullName }
    : { id: null, name: null };
}

export async function getOrCreateReportNarratives(
  tenantId: string,
  termId: string,
  classId: string,
  studentId: string,
) {
  return withTenant(tenantId, async () => {
    const tDb = tenantDb();
    const subjectRows = await tDb.masterReportCard.findMany({
      where: { termId, classId, studentId, subjectId: { not: null } },
    });
    const allClassRows = await tDb.masterReportCard.findMany({
      where: { termId, classId, subjectId: { not: null } },
      select: { subjectId: true, finalMark: true },
    });
    const means = new Map<string, number>();
    for (const row of allClassRows) {
      if (!row.subjectId) continue;
      const same = allClassRows.filter(
        (item) => item.subjectId === row.subjectId,
      );
      means.set(
        row.subjectId,
        same.reduce((sum, item) => sum + item.finalMark, 0) /
          Math.max(1, same.length),
      );
    }
    for (const row of subjectRows) {
      if (!row.subjectId) continue;
      const deviation =
        row.finalMark - (means.get(row.subjectId) ?? row.finalMark);
      const autoComment = deterministicSubjectComment(row.finalMark, deviation);
      const teacher = await resolveSubjectTeacher(tDb, classId, row.subjectId);
      await tDb.reportSubjectComment.upsert({
        where: {
          tenantId_termId_studentId_subjectId: {
            tenantId,
            termId,
            studentId,
            subjectId: row.subjectId,
          },
        },
        create: {
          tenantId,
          termId,
          classId,
          studentId,
          subjectId: row.subjectId,
          autoComment,
          comment: autoComment,
          resolvedTeacherId: teacher.id,
          resolvedTeacherName: teacher.name,
        },
        update: {
          autoComment,
          resolvedTeacherId: teacher.id,
          resolvedTeacherName: teacher.name,
        },
      });
    }
    const [comments, remarks] = await Promise.all([
      tDb.reportSubjectComment.findMany({
        where: { termId, classId, studentId },
        orderBy: { subjectId: "asc" },
      }),
      tDb.reportLeadershipRemark.findMany({
        where: { termId, classId, studentId },
        orderBy: { role: "asc" },
      }),
    ]);
    return { comments, remarks };
  });
}

export async function saveSubjectComment(
  tenantId: string,
  user: { id: string; fullName: string; role: string },
  input: {
    termId: string;
    studentId: string;
    subjectId: string;
    comment: string;
    lock?: boolean;
  },
) {
  return withTenant(tenantId, async () => {
    const tDb = tenantDb();
    const existing = await tDb.reportSubjectComment.findUnique({
      where: {
        tenantId_termId_studentId_subjectId: {
          tenantId,
          termId: input.termId,
          studentId: input.studentId,
          subjectId: input.subjectId,
        },
      },
    });
    if (!existing)
      throw new ReportNarrativeError(
        "Open the learner report first so NEYO can prepare the subject comment.",
      );
    if (existing.state === "LOCKED")
      throw new ReportNarrativeError(
        "This subject comment is locked. Reopen results through the governed correction workflow before changing it.",
      );
    const comment = input.comment.trim();
    if (comment.length < 3 || comment.length > 500)
      throw new ReportNarrativeError(
        "The subject comment must be between 3 and 500 characters.",
      );
    const mayLock = ["PRINCIPAL", "DEPUTY_PRINCIPAL", "SUPER_ADMIN"].includes(
      user.role,
    );
    if (input.lock && !mayLock)
      throw new ReportNarrativeError(
        "Only authorised school leadership can lock a subject comment.",
      );
    return tDb.reportSubjectComment.update({
      where: { id: existing.id },
      data: {
        comment,
        state: input.lock ? "LOCKED" : "TEACHER_EDITED",
        editedById: user.id,
        editedByName: user.fullName,
        editedAt: new Date(),
        lockedById: input.lock ? user.id : null,
        lockedAt: input.lock ? new Date() : null,
      },
    });
  });
}

export async function saveLeadershipRemark(
  tenantId: string,
  user: { id: string; fullName: string; role: string },
  input: {
    termId: string;
    classId: string;
    studentId: string;
    remarkRole: string;
    remark: string;
    lock?: boolean;
  },
) {
  const role = input.remarkRole;
  if (!["CLASS_TEACHER", "PRINCIPAL"].includes(role))
    throw new ReportNarrativeError("Choose Class Teacher or Principal remark.");
  if (
    role === "PRINCIPAL" &&
    !["PRINCIPAL", "DEPUTY_PRINCIPAL", "SUPER_ADMIN"].includes(user.role)
  )
    throw new ReportNarrativeError(
      "Only authorised school leadership can write the Principal remark.",
    );
  return withTenant(tenantId, async () => {
    const tDb = tenantDb();
    if (
      role === "CLASS_TEACHER" &&
      !["PRINCIPAL", "DEPUTY_PRINCIPAL", "SUPER_ADMIN"].includes(user.role)
    ) {
      const cls = await tDb.schoolClass.findFirst({
        where: { id: input.classId, classTeacherId: user.id },
      });
      if (!cls)
        throw new ReportNarrativeError(
          "Only this class's assigned Class Teacher or school leadership can write the Class Teacher remark.",
        );
    }
    const existing = await tDb.reportLeadershipRemark.findUnique({
      where: {
        tenantId_termId_studentId_role: {
          tenantId,
          termId: input.termId,
          studentId: input.studentId,
          role,
        },
      },
    });
    if (existing?.state === "LOCKED")
      throw new ReportNarrativeError(
        "This remark is locked. Use the governed correction workflow before changing it.",
      );
    const remark = input.remark.trim();
    if (remark.length < 3 || remark.length > 800)
      throw new ReportNarrativeError(
        "The remark must be between 3 and 800 characters.",
      );
    const mayLock =
      role === "PRINCIPAL"
        ? ["PRINCIPAL", "DEPUTY_PRINCIPAL", "SUPER_ADMIN"].includes(user.role)
        : true;
    if (input.lock && !mayLock)
      throw new ReportNarrativeError(
        "You are not authorised to lock this remark.",
      );
    return tDb.reportLeadershipRemark.upsert({
      where: {
        tenantId_termId_studentId_role: {
          tenantId,
          termId: input.termId,
          studentId: input.studentId,
          role,
        },
      },
      create: {
        tenantId,
        termId: input.termId,
        classId: input.classId,
        studentId: input.studentId,
        role,
        remark,
        state: input.lock ? "LOCKED" : "DRAFT",
        authorId: user.id,
        authorName: user.fullName,
        lockedById: input.lock ? user.id : null,
        lockedAt: input.lock ? new Date() : null,
      },
      update: {
        remark,
        state: input.lock ? "LOCKED" : "DRAFT",
        authorId: user.id,
        authorName: user.fullName,
        lockedById: input.lock ? user.id : null,
        lockedAt: input.lock ? new Date() : null,
      },
    });
  });
}
