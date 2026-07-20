import { db } from "@/lib/db";
import type { SessionUser } from "@/lib/core/session";
import { createInApp } from "@/lib/services/notification.service";

const HEAD_ROLES = new Set(["PRINCIPAL", "SCHOOL_OWNER", "SUPER_ADMIN"]);
const COMMITTEE_ROLES = new Set(["PRINCIPAL", "SCHOOL_OWNER", "DEPUTY_PRINCIPAL", "HOD", "DEAN_OF_STUDIES", "SUPER_ADMIN"]);
const hasRole = (user: SessionUser, roles: Set<string>) => roles.has(user.role) || Boolean(user.secondaryRole && roles.has(user.secondaryRole));
export class TimetableGovernanceError extends Error { constructor(public code: "NOT_FOUND"|"FORBIDDEN"|"CONFLICT"|"INVALID", message: string){super(message);this.name="TimetableGovernanceError";} }

async function jobFor(user: SessionUser, jobId: string) {
  const job = await db.timetableGenerationJob.findFirst({ where: { id: jobId, tenantId: user.tenantId } });
  if (!job) throw new TimetableGovernanceError("NOT_FOUND", "Timetable generation draft not found.");
  return job;
}
export async function timetableGovernanceBoard(user: SessionUser) {
  const jobs = await db.timetableGenerationJob.findMany({ where: { tenantId: user.tenantId, status: "DONE" }, orderBy: { startedAt: "desc" }, take: 12, include: { governanceDecisions: { orderBy: { createdAt: "asc" } } } });
  return jobs.map((job) => ({ ...job, draftSlotsJson: undefined, unplaced: JSON.parse(job.unplacedJson || "[]"), warnings: JSON.parse(job.warningsJson || "[]"), qualityReport: JSON.parse(job.qualityReportJson || "{}"), reservationSummary: JSON.parse(job.reservationSummaryJson || "[]"), draftSlotCount: JSON.parse(job.draftSlotsJson || "[]").length }));
}

export async function draftTimetablePreview(user: SessionUser, jobId: string) {
  const job = await jobFor(user, jobId);
  const rows = JSON.parse(job.draftSlotsJson || "[]") as any[];
  const [classes, subjects, users] = await Promise.all([
    db.schoolClass.findMany({ where: { tenantId: user.tenantId, id: { in: [...new Set(rows.map((row) => row.classId))] } }, select: { id: true, level: true, stream: true } }),
    db.subject.findMany({ where: { tenantId: user.tenantId, id: { in: [...new Set(rows.map((row) => row.subjectId).filter(Boolean))] } }, select: { id: true, name: true, code: true } }),
    db.user.findMany({ where: { tenantId: user.tenantId, id: { in: [...new Set(rows.map((row) => row.teacherId).filter(Boolean))] } }, select: { id: true, fullName: true } }),
  ]);
  const classMap=new Map(classes.map((row)=>[row.id,[row.level,row.stream].filter(Boolean).join(" ")])); const subjectMap=new Map(subjects.map((row)=>[row.id,row])); const userMap=new Map(users.map((row)=>[row.id,row.fullName]));
  return { jobId: job.id, status: job.governanceStatus, rows: rows.sort((a,b)=>String(classMap.get(a.classId)).localeCompare(String(classMap.get(b.classId)))||a.dayOfWeek-b.dayOfWeek||a.period-b.period).map((row)=>({ ...row, className:classMap.get(row.classId)??"Class", subjectName:row.slotType==="ELECTIVE_BLOCK"?"Options Block":subjectMap.get(row.subjectId)?.name??row.slotType, subjectCode:subjectMap.get(row.subjectId)?.code??"", teacherName:userMap.get(row.teacherId)??null })) };
}

export async function committeeReviewTimetable(user: SessionUser, jobId: string, note?: string) {
  if (!hasRole(user, COMMITTEE_ROLES)) throw new TimetableGovernanceError("FORBIDDEN", "Only timetable committee leadership can record committee review.");
  const job = await jobFor(user, jobId);
  if (job.governanceStatus !== "GENERATED_DRAFT") throw new TimetableGovernanceError("CONFLICT", `This draft is ${job.governanceStatus.toLowerCase().replaceAll("_"," ")}, not awaiting committee review.`);
  if (job.learnerProofInvalid > 0) throw new TimetableGovernanceError("INVALID", "Correct every invalid learner proof before committee review.");
  await db.$transaction([db.timetableGenerationJob.update({ where: { id: job.id }, data: { governanceStatus: "COMMITTEE_REVIEWED" } }), db.timetableGovernanceDecision.create({ data: { tenantId: user.tenantId, generationJobId: job.id, decision: "COMMITTEE_REVIEWED", note: note?.trim() || null, actorId: user.id, actorName: user.fullName, actorRole: user.role } })]);
  return { status: "COMMITTEE_REVIEWED" };
}

export async function returnTimetableForCorrection(user: SessionUser, jobId: string, note: string) {
  if (!hasRole(user, COMMITTEE_ROLES)) throw new TimetableGovernanceError("FORBIDDEN", "Only timetable committee leadership can return a draft.");
  if (!note.trim()) throw new TimetableGovernanceError("INVALID", "Write the correction required before returning this draft.");
  const job = await jobFor(user, jobId);
  if (!["GENERATED_DRAFT","COMMITTEE_REVIEWED"].includes(job.governanceStatus)) throw new TimetableGovernanceError("CONFLICT", "Only an unapproved draft can be returned for correction.");
  await db.$transaction([db.timetableGenerationJob.update({ where: { id: job.id }, data: { governanceStatus: "RETURNED" } }), db.timetableGovernanceDecision.create({ data: { tenantId: user.tenantId, generationJobId: job.id, decision: "RETURNED", note: note.trim(), actorId: user.id, actorName: user.fullName, actorRole: user.role } })]);
  return { status: "RETURNED" };
}

export async function headApproveTimetable(user: SessionUser, jobId: string, note?: string) {
  if (!hasRole(user, HEAD_ROLES)) throw new TimetableGovernanceError("FORBIDDEN", "Only the Principal or School Owner can approve the official timetable.");
  const job = await jobFor(user, jobId);
  if (job.governanceStatus !== "COMMITTEE_REVIEWED") throw new TimetableGovernanceError("CONFLICT", "Committee review must be recorded before Head approval.");
  if (job.learnerProofInvalid > 0 || job.learnerProofValid === 0) throw new TimetableGovernanceError("INVALID", "Head approval requires complete valid Senior learner proofs.");
  await db.$transaction([db.timetableGenerationJob.update({ where: { id: job.id }, data: { governanceStatus: "HEAD_APPROVED", headApprovedById: user.id, headApprovedByName: user.fullName, headApprovedAt: new Date() } }), db.timetableGovernanceDecision.create({ data: { tenantId: user.tenantId, generationJobId: job.id, decision: "HEAD_APPROVED", note: note?.trim() || null, actorId: user.id, actorName: user.fullName, actorRole: user.role } })]);
  return { status: "HEAD_APPROVED" };
}

export async function publishApprovedTimetable(user: SessionUser, jobId: string, note?: string) {
  if (!hasRole(user, HEAD_ROLES)) throw new TimetableGovernanceError("FORBIDDEN", "Only the Principal or School Owner can publish the official timetable.");
  const job = await jobFor(user, jobId);
  if (job.governanceStatus !== "HEAD_APPROVED") throw new TimetableGovernanceError("CONFLICT", "Head approval is required before publication.");
  const draftSlots = JSON.parse(job.draftSlotsJson || "[]") as any[];
  if (!draftSlots.length) throw new TimetableGovernanceError("INVALID", "This draft contains no saved timetable slots.");
  const seniorClasses = await db.schoolClass.findMany({ where: { tenantId: user.tenantId, archived: false }, select: { id: true, level: true } });
  const seniorIds = seniorClasses.filter((klass) => /(?:Grade|Form)\s*(?:10|11|12)/i.test(klass.level)).map((klass) => klass.id);
  const seniorCount = await db.student.count({ where: { tenantId: user.tenantId, classId: { in: seniorIds }, status: "ACTIVE", deletedAt: null } });
  if (seniorIds.length && (job.learnerProofInvalid > 0 || job.learnerProofValid !== seniorCount)) throw new TimetableGovernanceError("CONFLICT", `Learner proof covers ${job.learnerProofValid}/${seniorCount}; regenerate before publishing.`);
  const now = new Date();
  const ownedTypes = ["ACADEMIC","ELECTIVE_BLOCK","BLOCKED"];
  const oldAssignments = await db.substituteAssignment.findMany({ where: { tenantId: user.tenantId, status: { in: ["PROPOSED","CONFIRMED","UNFILLED"] }, timetableSlot: { slotType: { in: ownedTypes } } }, include: { timetableSlot: true } });
  let carriedSubstitutions = 0;
  await db.$transaction(async (tx) => {
    await tx.timetableSlot.deleteMany({ where: { tenantId: user.tenantId, slotType: { in: ownedTypes } } });
    const newSlotByKey = new Map<string,string>();
    for (const row of draftSlots) { const created = await tx.timetableSlot.create({ data: { ...row, tenantId: user.tenantId } }); newSlotByKey.set(`${row.classId}:${row.dayOfWeek}:${row.period}:${row.teacherId ?? ""}`, created.id); }
    for (const assignment of oldAssignments) {
      const newSlotId = newSlotByKey.get(`${assignment.timetableSlot.classId}:${assignment.timetableSlot.dayOfWeek}:${assignment.timetableSlot.period}:${assignment.originalTeacherId}`);
      if (!newSlotId) continue;
      const { timetableSlot, id, timetableSlotId, tenantId, createdAt, updatedAt, ...copy } = assignment;
      void timetableSlot; void timetableSlotId; void createdAt; void updatedAt;
      await tx.substituteAssignment.create({ data: { ...copy, id, tenantId, timetableSlotId: newSlotId } }); carriedSubstitutions++;
    }
    await tx.timetableGenerationJob.updateMany({ where: { tenantId: user.tenantId, governanceStatus: "PUBLISHED", id: { not: job.id } }, data: { governanceStatus: "SUPERSEDED", supersededAt: now } });
    await tx.timetableGenerationJob.update({ where: { id: job.id }, data: { governanceStatus: "PUBLISHED", publishedById: user.id, publishedByName: user.fullName, publishedAt: now } });
    await tx.timetableGovernanceDecision.create({ data: { tenantId: user.tenantId, generationJobId: job.id, decision: "PUBLISHED", note: note?.trim() || null, actorId: user.id, actorName: user.fullName, actorRole: user.role } });
  });
  const teachers = await db.user.findMany({ where: { tenantId: user.tenantId, role: { in: ["TEACHER", "CLASS_TEACHER", "HOD", "DEAN_OF_STUDIES", "DEPUTY_PRINCIPAL"] }, isActive: true }, select: { id: true } });
  for (const teacher of teachers) await createInApp({ tenantId: user.tenantId, recipientId: teacher.id, title: "Official Timetable Published", body: "The Head-approved timetable is now active. Open Timetable / My Classes to review your schedule.", category: "system" }).catch(() => {});
  return { status: "PUBLISHED", slotCount: draftSlots.length, notifiedTeachersCount: teachers.length, carriedSubstitutions, substitutionsNeedingReview: oldAssignments.length - carriedSubstitutions };
}
