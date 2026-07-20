import { tenantDb } from "@/lib/core/tenant-db";
import type { SessionUser } from "@/lib/core/session";

const parseJson = <T>(value: string | null | undefined, fallback: T): T => {
  if (!value) return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
};
const json = (value: unknown) => JSON.stringify(value ?? []);

export class CbeDeliveryError extends Error {
  constructor(message: string) { super(message); this.name = "CbeDeliveryError"; }
}

export async function cbeDeliveryBoard() {
  const tdb = tenantDb() as any;
  const [designs, sessions, interventions, classes, students, subjects, competencies, substrands] = await Promise.all([
    tdb.cbeCurriculumDesign.findMany({
      include: { substrand: { include: { strand: true } } },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
    tdb.cbeDeliverySession.findMany({
      include: { curriculumDesign: { include: { substrand: { include: { strand: true } } } }, evidence: true },
      orderBy: [{ deliveredOn: "desc" }, { createdAt: "desc" }],
      take: 100,
    }),
    tdb.cbeIntervention.findMany({ orderBy: [{ reviewDate: "asc" }, { createdAt: "desc" }], take: 100 }),
    tdb.schoolClass.findMany({ where: { archived: false }, orderBy: [{ level: "asc" }, { stream: "asc" }], select: { id: true, level: true, stream: true } }),
    tdb.student.findMany({ where: { status: "ACTIVE", deletedAt: null }, orderBy: [{ firstName: "asc" }, { lastName: "asc" }], select: { id: true, admissionNo: true, firstName: true, lastName: true, classId: true }, take: 500 }),
    tdb.subject.findMany({ where: { archived: false }, orderBy: { name: "asc" }, select: { id: true, name: true, code: true } }),
    tdb.competency.findMany({ orderBy: { name: "asc" }, select: { id: true, code: true, name: true }, take: 100 }),
    tdb.cbcSubstrand.findMany({ include: { strand: true }, orderBy: { name: "asc" }, take: 1000 }),
  ]);
  const normalizeDesign = (d: any) => ({
    ...d,
    suggestedLearningExperiences: parseJson(d.suggestedLearningExperiences, []),
    keyInquiryQuestions: parseJson(d.keyInquiryQuestions, []),
    competencyCodes: parseJson(d.competencyCodes, []),
    values: parseJson(d.values, []),
    pertinentIssues: parseJson(d.pertinentIssues, []),
    crossLearningAreaLinks: parseJson(d.crossLearningAreaLinks, []),
    communityServiceIdeas: parseJson(d.communityServiceIdeas, []),
    suggestedResources: parseJson(d.suggestedResources, []),
    assessmentCriteria: parseJson(d.assessmentCriteria, []),
  });
  return {
    designs: designs.map(normalizeDesign),
    sessions: sessions.map((s: any) => ({ ...s, curriculumDesign: normalizeDesign(s.curriculumDesign), resourceLinks: parseJson(s.resourceLinks, []) })),
    interventions,
    classes: classes.map((c: any) => ({ ...c, name: [c.level, c.stream].filter(Boolean).join(" ") })),
    students: students.map((s: any) => ({ ...s, name: [s.firstName, s.lastName].filter(Boolean).join(" ") })),
    subjects,
    competencies,
    substrands,
  };
}

export async function saveCurriculumDesign(user: SessionUser, input: any) {
  const tdb = tenantDb() as any;
  const substrand = await tdb.cbcSubstrand.findFirst({ where: { id: input.substrandId }, include: { strand: true } });
  if (!substrand) throw new CbeDeliveryError("Choose a real sub-strand from this school first.");
  const data = {
    substrandId: input.substrandId,
    suggestedLearningExperiences: json(input.suggestedLearningExperiences),
    keyInquiryQuestions: json(input.keyInquiryQuestions),
    competencyCodes: json(input.competencyCodes),
    values: json(input.values),
    pertinentIssues: json(input.pertinentIssues),
    crossLearningAreaLinks: json(input.crossLearningAreaLinks),
    communityServiceIdeas: json(input.communityServiceIdeas),
    suggestedResources: json(input.suggestedResources),
    assessmentCriteria: json(input.assessmentCriteria),
    lessonAllocation: input.lessonAllocation ?? null,
    sourceLabel: input.sourceLabel || null,
    sourceVersion: input.sourceVersion || null,
    sourceReference: input.sourceReference || null,
    reviewStatus: input.reviewStatus || "DRAFT",
    reviewedById: input.reviewStatus === "DRAFT" ? null : user.id,
    reviewedByName: input.reviewStatus === "DRAFT" ? null : user.fullName,
    reviewedAt: input.reviewStatus === "DRAFT" ? null : new Date(),
  };
  const existing = await tdb.cbeCurriculumDesign.findFirst({ where: { substrandId: input.substrandId } });
  return existing
    ? tdb.cbeCurriculumDesign.update({ where: { id: existing.id }, data })
    : tdb.cbeCurriculumDesign.create({ data: { ...data, createdById: user.id, createdByName: user.fullName } });
}

export async function createDeliverySession(user: SessionUser, input: any) {
  const tdb = tenantDb() as any;
  const [design, klass] = await Promise.all([
    tdb.cbeCurriculumDesign.findFirst({ where: { id: input.curriculumDesignId } }),
    tdb.schoolClass.findFirst({ where: { id: input.classId, archived: false } }),
  ]);
  if (!design || !klass) throw new CbeDeliveryError("Choose a real curriculum design and class first.");
  return tdb.cbeDeliverySession.create({ data: {
    curriculumDesignId: design.id, classId: klass.id, teacherId: user.id, teacherName: user.fullName,
    deliveredOn: input.deliveredOn, timetableSlotId: input.timetableSlotId || null,
    lessonPlanId: input.lessonPlanId || null, syllabusTopicId: input.syllabusTopicId || null,
    assessmentPlanId: input.assessmentPlanId || null, status: input.status || "PLANNED",
    deliveryNotes: input.deliveryNotes || null, resourceLinks: json(input.resourceLinks), nextSteps: input.nextSteps || null,
  } });
}

export async function recordDeliveryEvidence(user: SessionUser, input: any) {
  const tdb = tenantDb() as any;
  const [session, student] = await Promise.all([
    tdb.cbeDeliverySession.findFirst({ where: { id: input.deliverySessionId } }),
    tdb.student.findFirst({ where: { id: input.studentId, status: "ACTIVE", deletedAt: null } }),
  ]);
  if (!session || !student) throw new CbeDeliveryError("Choose a real delivery session and active learner first.");
  if (student.classId !== session.classId) throw new CbeDeliveryError("That learner is not in the class for this delivery session.");
  if (input.level != null && (input.level < 1 || input.level > 4)) throw new CbeDeliveryError("CBE level must be from 1 to 4.");
  return tdb.cbeDeliveryEvidence.create({ data: {
    deliverySessionId: session.id, studentId: student.id, level: input.level ?? null,
    observation: input.observation, evidenceUrl: input.evidenceUrl || null,
    cbcAssessmentId: input.cbcAssessmentId || null, assessmentRecordId: input.assessmentRecordId || null,
    competencyEvidenceId: input.competencyEvidenceId || null, portfolioItemId: input.portfolioItemId || null,
    recordedById: user.id, recordedByName: user.fullName,
  } });
}

export async function createIntervention(user: SessionUser, input: any) {
  const tdb = tenantDb() as any;
  const student = await tdb.student.findFirst({ where: { id: input.studentId, status: "ACTIVE", deletedAt: null } });
  const substrand = await tdb.cbcSubstrand.findFirst({ where: { id: input.substrandId } });
  if (!student || !substrand) throw new CbeDeliveryError("Choose a real active learner and sub-strand first.");
  return tdb.cbeIntervention.create({ data: {
    deliverySessionId: input.deliverySessionId || null, studentId: student.id, substrandId: substrand.id,
    reason: input.reason, actionType: input.actionType, actionDetails: input.actionDetails,
    targetLevel: input.targetLevel ?? null, reviewDate: input.reviewDate, status: "PLANNED",
    parentSummary: input.parentSummary || null, assignedById: user.id, assignedByName: user.fullName,
  } });
}

export async function reviewIntervention(user: SessionUser, input: any) {
  const tdb = tenantDb() as any;
  const row = await tdb.cbeIntervention.findFirst({ where: { id: input.id } });
  if (!row) throw new CbeDeliveryError("Intervention not found.");
  return tdb.cbeIntervention.update({ where: { id: row.id }, data: {
    status: input.status, outcome: input.outcome || null, reviewedLevel: input.reviewedLevel ?? null,
    parentSummary: input.parentSummary || row.parentSummary,
  } });
}
