import { tenantDb } from "@/lib/core/tenant-db";
import { withTenant } from "@/lib/core/tenant-context";

export class ReportNarrativeError extends Error {}

export function deterministicSubjectComment(mark: number, deviation: number, subjectLabel = "", variantKey = "") {
  const swahili = /kiswahili|swahili|\bkis\b|\bswa\b/i.test(subjectLabel);
  const variant = [...variantKey].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 2;
  const band = mark >= 80 && deviation >= 0 ? 0 : mark >= 65 && deviation >= 0 ? 1 : mark >= 50 && deviation >= 0 ? 2 : mark >= 50 ? 3 : deviation >= -10 ? 4 : 5;
  const english = [
    ["Excellent achievement. Maintain the strong understanding and consistent effort shown.", "Strong mastery is evident. Sustain this focused effort in the next learning cycle."],
    ["Good achievement. Keep practising consistently to strengthen mastery further.", "Good progress is visible. Regular revision can lift this result further."],
    ["Steady achievement. Continue practising the areas covered to build greater confidence.", "A sound foundation is developing. Consistent practice will build confidence."],
    ["A fair foundation is visible. Focused revision can close the gap to the class mean.", "The basics are present. Give extra attention to the weaker assessed areas."],
    ["Developing understanding. Review difficult areas and seek support during the next learning cycle.", "More guided practice will help. Review difficult areas with the subject teacher."],
    ["More support is needed. Use guided revision and regular practice with the subject teacher.", "Focused support is required. Build a regular revision routine with teacher guidance."],
  ];
  const kiswahili = [
    ["Ufaulu bora umeonekana. Endelea kudumisha uelewa na bidii hii.", "Umahiri mzuri umeonekana. Dumisha juhudi na umakini huu."],
    ["Umefanya vizuri. Endelea kufanya mazoezi ili kuimarisha umahiri zaidi.", "Maendeleo mazuri yanaonekana. Marudio ya mara kwa mara yataongeza ufaulu."],
    ["Maendeleo ni ya kuridhisha. Endelea kufanya mazoezi ili kuongeza kujiamini.", "Msingi mzuri unaendelea kujengeka. Mazoezi ya mara kwa mara yatasaidia."],
    ["Msingi unaonekana. Marudio yenye kulenga maeneo dhaifu yatasaidia kufikia wastani wa darasa.", "Uelewa wa msingi upo. Zingatia zaidi maeneo yaliyokuwa magumu."],
    ["Uelewa bado unakua. Pitia maeneo magumu na uombe msaada inapohitajika.", "Mazoezi zaidi yanahitajika. Jadili maeneo magumu na mwalimu wa somo."],
    ["Msaada zaidi unahitajika. Tumia marudio yaliyoongozwa na mazoezi ya mara kwa mara.", "Juhudi za ziada na mwongozo wa mwalimu vinahitajika ili kuboresha."],
  ];
  return (swahili ? kiswahili : english)[band][variant];
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
    const subjectIds = subjectRows.map((row) => row.subjectId).filter((id): id is string => Boolean(id));
    const subjects = await tDb.subject.findMany({ where: { id: { in: subjectIds } }, select: { id: true, name: true, code: true } });
    const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));
    for (const row of subjectRows) {
      if (!row.subjectId) continue;
      const deviation =
        row.finalMark - (means.get(row.subjectId) ?? row.finalMark);
      const subject = subjectById.get(row.subjectId);
      const autoComment = deterministicSubjectComment(row.finalMark, deviation, `${subject?.name ?? ""} ${subject?.code ?? ""}`, `${studentId}:${row.subjectId}`);
      const teacher = await resolveSubjectTeacher(tDb, classId, row.subjectId);
      const existingComment = await tDb.reportSubjectComment.findUnique({ where: { tenantId_termId_studentId_subjectId: { tenantId, termId, studentId, subjectId: row.subjectId } }, select: { state: true } });
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
          ...(existingComment?.state === "AUTO" ? { comment: autoComment } : {}),
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
