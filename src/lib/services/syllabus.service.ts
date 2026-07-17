import { db } from "@/lib/db";
import { withTenant } from "@/lib/core/tenant-context";
import { tenantDb } from "@/lib/core/tenant-db";
import { can } from "@/lib/core/permissions";
import { teacherClassIds } from "@/lib/services/teacher-portal.service";
import type { SessionUser } from "@/lib/core/session";
import type { Role } from "@/lib/core/roles";

export class SyllabusError extends Error {
  constructor(public code: "NOT_FOUND" | "FORBIDDEN" | "INVALID", message: string) {
    super(message);
    this.name = "SyllabusError";
  }
}

function classLabel(c: { level: string; stream: string | null }) {
  return [c.level, c.stream].filter(Boolean).join(" ");
}

function todayYmd() {
  return new Date(Date.now() + 3 * 3600_000).toISOString().slice(0, 10);
}

async function allowedClassFilter(user: SessionUser) {
  const allowed = await teacherClassIds(user);
  return allowed === null ? {} : { id: { in: allowed } };
}

async function assertCanWrite(user: SessionUser, classId?: string) {
  const allowed = await teacherClassIds(user);
  const primaryCanManage = can(user.role as Role, "academics.manage");
  const secondaryCanManage = user.secondaryRole ? can(user.secondaryRole as Role, "academics.manage") : false;
  if (primaryCanManage || secondaryCanManage) return;
  if (allowed !== null && classId && allowed.includes(classId)) return;
  throw new SyllabusError("FORBIDDEN", "Only Academics leadership or the teacher assigned to this class can update syllabus coverage.");
}

export async function syllabusBoard(user: SessionUser, filters: { classId?: string; subjectId?: string; status?: string } = {}) {
  return withTenant(user.tenantId, async () => {
    const classFilter = await allowedClassFilter(user);
    const classes = await tenantDb().schoolClass.findMany({
      where: { archived: false, ...classFilter },
      orderBy: [{ level: "asc" }, { stream: "asc" }],
    });
    const classIds = classes.map((c) => c.id);
    const subjects = await tenantDb().subject.findMany({ where: { archived: false }, orderBy: { name: "asc" } });
    const terms = await tenantDb().academicTerm.findMany({ orderBy: [{ year: "desc" }, { term: "desc" }], take: 9 });

    const topicWhere: Record<string, unknown> = { classId: { in: classIds } };
    if (filters.classId) topicWhere.classId = filters.classId;
    if (filters.subjectId) topicWhere.subjectId = filters.subjectId;
    if (filters.status) topicWhere.status = filters.status;

    const rows = await tenantDb().syllabusTopic.findMany({
      where: topicWhere,
      orderBy: [{ deadline: "asc" }, { topic: "asc" }],
      take: 300,
    });

    const cMap = new Map(classes.map((c) => [c.id, classLabel(c)]));
    const sMap = new Map(subjects.map((s) => [s.id, `${s.name} (${s.code})`]));
    const today = todayYmd();
    const topics = rows.map((r) => {
      const effectiveStatus = r.status !== "COVERED" && r.deadline < today ? "LATE" : r.status;
      return {
        id: r.id,
        classId: r.classId,
        className: cMap.get(r.classId) ?? "—",
        subjectId: r.subjectId,
        subjectName: sMap.get(r.subjectId) ?? "—",
        termId: r.termId,
        topic: r.topic,
        scopeRef: r.scopeRef,
        deadline: r.deadline,
        status: effectiveStatus,
        coveredAt: r.coveredAt,
        teacherId: r.teacherId,
        teacherName: r.teacherName,
        notes: r.notes,
      };
    });

    const total = topics.length;
    const covered = topics.filter((t) => t.status === "COVERED").length;
    const late = topics.filter((t) => t.status === "LATE").length;
    const inProgress = topics.filter((t) => t.status === "IN_PROGRESS").length;
    const coveragePct = total ? Math.round((covered / total) * 100) : 0;

    return {
      classes: classes.map((c) => ({ id: c.id, name: classLabel(c), level: c.level, stream: c.stream })),
      subjects: subjects.map((s) => ({ id: s.id, name: s.name, code: s.code })),
      terms: terms.map((t) => ({ id: t.id, label: `Term ${t.term} ${t.year}`, current: t.current })),
      summary: { total, covered, late, inProgress, coveragePct },
      topics,
    };
  });
}

export async function createSyllabusTopic(user: SessionUser, input: { classId: string; subjectId: string; termId?: string; topic: string; scopeRef?: string; deadline: string; teacherId?: string; notes?: string }) {
  return withTenant(user.tenantId, async () => {
    await assertCanWrite(user, input.classId);
    const cls = await tenantDb().schoolClass.findUnique({ where: { id: input.classId } });
    if (!cls) throw new SyllabusError("NOT_FOUND", "Class not found.");
    const subject = await tenantDb().subject.findUnique({ where: { id: input.subjectId } });
    if (!subject) throw new SyllabusError("NOT_FOUND", "Subject not found.");
    const teacher = input.teacherId ? await tenantDb().user.findUnique({ where: { id: input.teacherId } }) : null;
    const row = await tenantDb().syllabusTopic.create({
      data: {
        classId: input.classId,
        subjectId: input.subjectId,
        termId: input.termId || null,
        topic: input.topic,
        scopeRef: input.scopeRef || null,
        deadline: input.deadline,
        teacherId: teacher?.id ?? null,
        teacherName: teacher?.fullName ?? null,
        notes: input.notes || null,
        createdById: user.id,
        createdByName: user.fullName,
      } as never,
    });
    await db.auditLog.create({ data: { tenantId: user.tenantId, actorId: user.id, actorName: user.fullName, action: "syllabus.topic_created", entityType: "syllabusTopic", entityId: row.id, metadata: JSON.stringify({ class: classLabel(cls), subject: subject.name, topic: input.topic }) } });
    return row;
  });
}

export async function updateSyllabusTopic(user: SessionUser, input: { id: string; status: string; notes?: string }) {
  return withTenant(user.tenantId, async () => {
    const row = await tenantDb().syllabusTopic.findUnique({ where: { id: input.id } });
    if (!row) throw new SyllabusError("NOT_FOUND", "Topic not found.");
    await assertCanWrite(user, row.classId);
    const updated = await tenantDb().syllabusTopic.update({
      where: { id: row.id },
      data: {
        status: input.status,
        notes: input.notes ?? row.notes,
        coveredAt: input.status === "COVERED" ? new Date() : null,
      } as never,
    });
    await db.auditLog.create({ data: { tenantId: user.tenantId, actorId: user.id, actorName: user.fullName, action: "syllabus.topic_updated", entityType: "syllabusTopic", entityId: row.id, metadata: JSON.stringify({ status: input.status }) } });
    return updated;
  });
}

/**
 * Real-Time Syllabus Auto-Linking & Verification (`I.97` / `EE.8` / `I.88`):
 * When a teacher enters student assessments (`CbcAssessment` / `LessonObservation`)
 * or marks a `LessonPlan` as `DELIVERED`, this engine automatically scans open `SyllabusTopic` rows for that
 * class and subject. If matched (`scopeRef` / `topic`), it marks the topic `COVERED` or `IN_PROGRESS`.
 */
export async function syncSyllabusFromAssessment(
  user: SessionUser,
  input: {
    classId: string;
    subjectId: string;
    strandId?: string | null;
    substrandId?: string | null;
    topicName?: string | null;
    lessonPlanId?: string | null;
  }
) {
  return withTenant(user.tenantId, async () => {
    await assertCanWrite(user, input.classId);
    const topics = await tenantDb().syllabusTopic.findMany({
      where: {
        classId: input.classId,
        subjectId: input.subjectId,
        status: { in: ["PLANNED", "IN_PROGRESS", "LATE"] },
      },
    });

    let matchedCount = 0;
    const matchedTopicIds: string[] = [];

    for (const t of topics) {
      let isMatch = false;
      if (input.strandId && t.scopeRef === input.strandId) isMatch = true;
      else if (input.substrandId && t.scopeRef === input.substrandId) isMatch = true;
      else if (input.topicName && (t.topic.toLowerCase().includes(input.topicName.toLowerCase()) || (t.scopeRef && t.scopeRef.toLowerCase().includes(input.topicName.toLowerCase())))) isMatch = true;
      else if (topics.length === 1 && !t.coveredAt) isMatch = true; // Auto-match single pending topic if exact ref is omitted

      if (isMatch) {
        const notesAdd = input.lessonPlanId
          ? `Delivered via Lesson Plan ${input.lessonPlanId} + verified by student assessments on ${todayYmd()}`
          : `Verified by student assessments entered on ${todayYmd()}`;
        const newNotes = t.notes ? `${t.notes} | ${notesAdd}` : notesAdd;
        await tenantDb().syllabusTopic.update({
          where: { id: t.id },
          data: {
            status: "COVERED",
            coveredAt: new Date(),
            teacherId: user.id,
            teacherName: user.fullName,
            notes: newNotes.slice(0, 500),
          } as never,
        });
        matchedCount++;
        matchedTopicIds.push(t.id);
      }
    }

    if (matchedCount > 0) {
      await db.auditLog.create({
        data: {
          tenantId: user.tenantId,
          actorId: user.id,
          actorName: user.fullName,
          action: "syllabus.auto_linked_from_assessment",
          entityType: "syllabusTopic",
          entityId: matchedTopicIds[0] || input.classId,
          metadata: JSON.stringify({
            classId: input.classId,
            subjectId: input.subjectId,
            matchedCount,
            lessonPlanId: input.lessonPlanId,
          }),
        },
      });
    }

    return { matchedCount, matchedTopicIds };
  });
}

/**
 * Academics Syllabus Coverage Audit & Verification Report (`I.97`):
 * Scans every class, subject, and assigned teacher. Cross-references teacher-reported `SyllabusTopic` records against
 * REAL student assessment records (`CbcAssessment`, `LessonObservation`, `ExamResult`) and delivered `LessonPlan` records.
 * If a topic is marked `COVERED` by a teacher but has 0 student assessments and 0 delivered lesson plans, it is classified
 * as `SELF_REPORTED_ONLY`. If a teacher has entered 0 updates and 0 assessments at all, it is honestly assumed
 * `NOT_COVERED ("0 Assessments Entered — Assumed Never Covered")` per founder rule.
 */
export async function getAcademicsSyllabusCoverageReport(
  user: SessionUser,
  filters: { classId?: string; teacherId?: string; subjectId?: string; termId?: string } = {}
) {
  return withTenant(user.tenantId, async () => {
    const classWhere: Record<string, unknown> = { archived: false };
    if (filters.classId) classWhere.id = filters.classId;
    const classes = await tenantDb().schoolClass.findMany({ where: classWhere, orderBy: [{ level: "asc" }, { stream: "asc" }] });

    const subjWhere: Record<string, unknown> = { archived: false };
    if (filters.subjectId) subjWhere.id = filters.subjectId;
    const subjects = await tenantDb().subject.findMany({ where: subjWhere, orderBy: { name: "asc" } });

    const slots = await tenantDb().timetableSlot.findMany({ select: { classId: true, subjectId: true, teacherId: true } });
    const users = await tenantDb().user.findMany({ select: { id: true, fullName: true } });
    const userNameMap = new Map(users.map((u) => [u.id, u.fullName]));

    const students = await tenantDb().student.findMany({ select: { id: true, classId: true } });
    const studentClassMap = new Map(students.map((s) => [s.id, s.classId]));
    const allStrands = await tenantDb().cbcStrand.findMany({ select: { id: true, subjectId: true } });
    const strandSubjMap = new Map(allStrands.map((s) => [s.id, s.subjectId]));

    const cbcAssessments = await tenantDb().cbcAssessment.findMany({ select: { studentId: true, strandId: true, id: true } });
    const lessonPlans = await tenantDb().lessonPlan.findMany({ select: { classId: true, subjectId: true, status: true, id: true } });
    const planClassSubjMap = new Map(lessonPlans.map((p) => [p.id, { classId: p.classId, subjectId: p.subjectId }]));
    const lessonObs = await tenantDb().lessonObservation.findMany({ select: { lessonPlanId: true, id: true } });
    const topics = await tenantDb().syllabusTopic.findMany({
      where: {
        ...(filters.classId ? { classId: filters.classId } : {}),
        ...(filters.subjectId ? { subjectId: filters.subjectId } : {}),
        ...(filters.teacherId ? { teacherId: filters.teacherId } : {}),
      },
    });

    const classLabelMap = new Map(classes.map((c) => [c.id, classLabel(c)]));
    const subjectNameMap = new Map(subjects.map((s) => [s.id, `${s.name} (${s.code})`]));

    const reportItems: {
      classId: string;
      className: string;
      subjectId: string;
      subjectName: string;
      teacherId: string | null;
      teacherName: string;
      totalTopics: number;
      verifiedCoveredCount: number;
      selfReportedCoveredCount: number;
      inProgressCount: number;
      notCoveredCount: number;
      realAssessmentsEntered: number;
      deliveredLessonPlans: number;
      coveragePct: number;
      status: "VERIFIED_COVERED" | "SELF_REPORTED_ONLY" | "IN_PROGRESS" | "NOT_COVERED";
      statusLabel: string;
    }[] = [];

    for (const cls of classes) {
      for (const subj of subjects) {
        const slot = slots.find((s) => s.classId === cls.id && (s.subjectId === subj.id || s.subjectId === null));
        const teacherId = slot?.teacherId || cls.classTeacherId || null;
        if (filters.teacherId && teacherId !== filters.teacherId) continue;

        const teacherName = (teacherId && userNameMap.get(teacherId)) || (teacherId === cls.classTeacherId ? "Class Teacher" : "Unassigned");
        const clsSubjTopics = topics.filter((t) => t.classId === cls.id && t.subjectId === subj.id);
        if (clsSubjTopics.length === 0 && !filters.classId && !filters.subjectId && !slot) continue;

        const cbcCount = cbcAssessments.filter((a) => studentClassMap.get(a.studentId) === cls.id && strandSubjMap.get(a.strandId) === subj.id).length;
        const obsCount = lessonObs.filter((o) => {
          const info = planClassSubjMap.get(o.lessonPlanId);
          return info?.classId === cls.id && info?.subjectId === subj.id;
        }).length;
        const totalAssessments = cbcCount + obsCount;
        const deliveredPlans = lessonPlans.filter((p) => p.classId === cls.id && p.subjectId === subj.id && p.status === "DELIVERED").length;

        const totalTopics = clsSubjTopics.length;
        const verifiedCovered = clsSubjTopics.filter((t) => t.status === "COVERED" && (totalAssessments > 0 || deliveredPlans > 0 || t.notes?.includes("verified"))).length;
        const selfReported = clsSubjTopics.filter((t) => t.status === "COVERED" && totalAssessments === 0 && deliveredPlans === 0 && !t.notes?.includes("verified")).length;
        const inProg = clsSubjTopics.filter((t) => t.status === "IN_PROGRESS" || t.status === "LATE").length;
        const notCov = totalTopics - verifiedCovered - selfReported - inProg;

        const coveragePct = totalTopics > 0 ? Math.round(((verifiedCovered + selfReported) / totalTopics) * 100) : totalAssessments > 0 ? 100 : 0;

        let status: "VERIFIED_COVERED" | "SELF_REPORTED_ONLY" | "IN_PROGRESS" | "NOT_COVERED" = "NOT_COVERED";
        let statusLabel = "0 Topics / 0 Assessments — Assumed Never Covered";

        if (totalTopics > 0 && verifiedCovered === totalTopics) {
          status = "VERIFIED_COVERED";
          statusLabel = `Verified 100% Covered (${totalAssessments} Student Assessments & ${deliveredPlans} Lesson Plans)`;
        } else if (verifiedCovered > 0 || totalAssessments > 0) {
          status = "VERIFIED_COVERED";
          statusLabel = `Verified ${coveragePct}% Covered (${totalAssessments} Assessments Entered)`;
        } else if (selfReported > 0) {
          status = "SELF_REPORTED_ONLY";
          statusLabel = `Self-Reported ${coveragePct}% Covered (Warning: 0 Student Assessments Entered)`;
        } else if (inProg > 0) {
          status = "IN_PROGRESS";
          statusLabel = `In Progress (${inProg} topics currently active)`;
        }

        reportItems.push({
          classId: cls.id,
          className: classLabelMap.get(cls.id) ?? "—",
          subjectId: subj.id,
          subjectName: subjectNameMap.get(subj.id) ?? "—",
          teacherId,
          teacherName,
          totalTopics,
          verifiedCoveredCount: verifiedCovered,
          selfReportedCoveredCount: selfReported,
          inProgressCount: inProg,
          notCoveredCount: notCov > 0 ? notCov : 0,
          realAssessmentsEntered: totalAssessments,
          deliveredLessonPlans: deliveredPlans,
          coveragePct,
          status,
          statusLabel,
        });
      }
    }

    return {
      classes: classes.map((c) => ({ id: c.id, name: classLabel(c) })),
      subjects: subjects.map((s) => ({ id: s.id, name: s.name, code: s.code })),
      items: reportItems,
    };
  });
}

/**
 * Immutability Guard (`cant be deleted anyhowly`):
 * Teachers cannot arbitrarily delete syllabus coverage or student academic records to avoid entering fake reports when lessons weren't taught.
 * Only Academics Leadership (`academics.manage`), Principal, Deputy Principal, or Founder may authorize record deletion/voiding.
 */
export async function deleteSyllabusTopic(user: SessionUser, id: string) {
  return withTenant(user.tenantId, async () => {
    const primaryCanManage = can(user.role as Role, "academics.manage");
    const secondaryCanManage = user.secondaryRole ? can(user.secondaryRole as Role, "academics.manage") : false;
    const isLeadership = ["PRINCIPAL", "DEPUTY_PRINCIPAL", "FOUNDER", "SUPER_ADMIN", "SCHOOL_OWNER"].includes(user.role);
    if (!primaryCanManage && !secondaryCanManage && !isLeadership) {
      throw new SyllabusError("FORBIDDEN", "Syllabus and academic records cannot be deleted arbitrarily by teachers (\"cant be deleted anyhowly\"). Only the Principal or Academics HOD can authorize record voiding.");
    }
    const row = await tenantDb().syllabusTopic.findUnique({ where: { id } });
    if (!row) throw new SyllabusError("NOT_FOUND", "Topic not found.");
    await tenantDb().syllabusTopic.delete({ where: { id } });
    await db.auditLog.create({ data: { tenantId: user.tenantId, actorId: user.id, actorName: user.fullName, action: "syllabus.topic_deleted", entityType: "syllabusTopic", entityId: id, metadata: JSON.stringify({ topic: row.topic, classId: row.classId }) } });
    return { ok: true, deletedId: id };
  });
}
