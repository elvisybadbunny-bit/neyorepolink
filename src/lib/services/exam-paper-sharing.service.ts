/**
 * EE.6 — Exam privacy tiers (`PRIVATE`, `SCHOOL_ONLY`, `PUBLIC_SHARED`) + cross-school sharing
 * with NEYO Ops approval queue.
 */

import { db } from "@/lib/db";
import { tenantDb } from "@/lib/core/tenant-db";
import { withTenant } from "@/lib/core/tenant-context";
import type { SessionUser } from "@/lib/core/session";
import type {
  DecidePublicSharingInput,
  ClonePublicExamPaperInput,
  ListPublicSharedQuery,
} from "@/lib/validations/exam-paper-sharing";
import type { ScannedExamQuestion } from "@/lib/validations/exam-paper-scan";

export class ExamSharingError extends Error {
  constructor(public code: "NOT_FOUND" | "INVALID" | "FORBIDDEN", message: string) {
    super(message);
    this.name = "ExamSharingError";
  }
}

async function audit(user: SessionUser, action: string, entityId: string, metadata?: unknown) {
  try {
    const tdb = tenantDb();
    await tdb.auditLog.create({
      data: {
        tenantId: user.tenantId,
        actorId: user.id,
        actorName: (user as any).fullName || "User",
        action,
        entityId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      } as never,
    });
  } catch (e) {
    console.error("Audit logging error:", e);
  }
}

/** Request national public sharing for an existing `ScannedExamPaper` inside the school's library. */
export async function requestPublicSharing(user: SessionUser, paperId: string) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const paper = await tdb.scannedExamPaper.findUnique({ where: { id: paperId } });
    if (!paper) throw new ExamSharingError("NOT_FOUND", "Exam paper not found.");

    if (paper.sharingApprovalStatus === "PENDING") {
      throw new ExamSharingError("INVALID", "Public sharing has already been requested for this paper.");
    }
    if (paper.privacyTier === "PUBLIC_SHARED" && paper.sharingApprovalStatus === "APPROVED") {
      throw new ExamSharingError("INVALID", "This exam paper is already approved and publicly shared.");
    }

    const updated = await tdb.scannedExamPaper.update({
      where: { id: paperId },
      data: {
        sharingApprovalStatus: "PENDING",
        sharingRequestedById: user.id,
        sharingRequestedByName: (user as any).fullName || "Teacher",
        sharingRequestedAt: new Date(),
        sharingDecidedById: null,
        sharingDecidedByName: null,
        sharingDecidedAt: null,
        sharingDecisionNote: null,
      } as never,
    });

    await audit(user, "academics.public_sharing_requested", paperId, {
      title: paper.title,
    });

    return updated;
  });
}

/** NEYO Ops only: list all pending exam sharing requests across every school tenant. */
export async function listPendingSharingRequests(opsUser: SessionUser) {
  if (!["FOUNDER", "SUPER_ADMIN", "NEYO_OPS"].includes(opsUser.role)) {
    throw new ExamSharingError("FORBIDDEN", "Only NEYO Ops can review public sharing requests.");
  }

  const rows = await db.scannedExamPaper.findMany({
    where: { sharingApprovalStatus: "PENDING" },
    orderBy: { sharingRequestedAt: "desc" },
    include: {
      tenant: { select: { id: true, name: true, slug: true } },
      subject: { select: { id: true, name: true, code: true } },
      schoolClass: { select: { id: true, level: true, stream: true } },
    },
  });

  return rows.map((r) => ({
    ...r,
    schoolName: r.tenant.name,
    className: `${r.schoolClass.level} ${r.schoolClass.stream ?? ""}`.trim(),
    questions: JSON.parse(r.questionsJson) as ScannedExamQuestion[],
  }));
}

/** NEYO Ops only: decide (`APPROVED` vs `REJECTED`) on a pending exam sharing request. */
export async function decidePublicSharingRequest(opsUser: SessionUser, input: DecidePublicSharingInput) {
  if (!["FOUNDER", "SUPER_ADMIN", "NEYO_OPS"].includes(opsUser.role)) {
    throw new ExamSharingError("FORBIDDEN", "Only NEYO Ops can decide public sharing requests.");
  }

  const paper = await db.scannedExamPaper.findUnique({ where: { id: input.paperId } });
  if (!paper) throw new ExamSharingError("NOT_FOUND", "Exam paper not found across global repository.");

  const newTier = input.status === "APPROVED" ? "PUBLIC_SHARED" : "SCHOOL_ONLY";

  const updated = await db.scannedExamPaper.update({
    where: { id: input.paperId },
    data: {
      privacyTier: newTier,
      sharingApprovalStatus: input.status,
      sharingDecidedById: opsUser.id,
      sharingDecidedByName: (opsUser as any).fullName || "NEYO Ops",
      sharingDecidedAt: new Date(),
      sharingDecisionNote: input.decisionNote || null,
    } as never,
  });

  return {
    ...updated,
    questions: JSON.parse(updated.questionsJson) as ScannedExamQuestion[],
  };
}

/** Browse/search the National Public Exam Paper Library (`PUBLIC_SHARED` and `APPROVED` papers across all schools). */
export async function listPublicSharedExamPapers(query: ListPublicSharedQuery) {
  const where: any = {
    privacyTier: "PUBLIC_SHARED",
    sharingApprovalStatus: "APPROVED",
  };

  if (query.subjectCode) {
    where.subject = { code: query.subjectCode };
  }
  if (query.level) {
    where.schoolClass = { level: query.level };
  }
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { instructions: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const rows = await db.scannedExamPaper.findMany({
    where,
    orderBy: { sharingDecidedAt: "desc" },
    take: 100,
    include: {
      tenant: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true, code: true } },
      schoolClass: { select: { id: true, level: true, stream: true } },
    },
  });

  return rows.map((r) => ({
    ...r,
    schoolName: r.tenant.name,
    className: `${r.schoolClass.level} ${r.schoolClass.stream ?? ""}`.trim(),
    questions: JSON.parse(r.questionsJson) as ScannedExamQuestion[],
  }));
}

/** 1-Click Clone: duplicates an approved national public exam paper into the requesting school's own library. */
export async function clonePublicExamPaperToTenant(user: SessionUser, input: ClonePublicExamPaperInput) {
  const source = await db.scannedExamPaper.findUnique({
    where: { id: input.sourcePaperId },
    include: { tenant: { select: { name: true } }, subject: { select: { name: true } } },
  });
  if (!source) throw new ExamSharingError("NOT_FOUND", "Source public exam paper not found.");

  if (source.privacyTier !== "PUBLIC_SHARED" || source.sharingApprovalStatus !== "APPROVED") {
    throw new ExamSharingError("FORBIDDEN", "This exam paper is not approved for public national sharing.");
  }

  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const targetSubject = await tdb.subject.findUnique({ where: { id: input.targetSubjectId } });
    if (!targetSubject) throw new ExamSharingError("NOT_FOUND", "Target subject not found in your school.");

    const targetClass = await tdb.schoolClass.findUnique({ where: { id: input.targetClassId } });
    if (!targetClass) throw new ExamSharingError("NOT_FOUND", "Target class not found in your school.");

    const clonedTitle = `${source.title} (Cloned from ${source.tenant.name})`;

    const cloned = await tdb.scannedExamPaper.create({
      data: {
        tenantId: user.tenantId,
        createdById: user.id,
        createdByName: (user as any).fullName || "Teacher",
        subjectId: targetSubject.id,
        classId: targetClass.id,
        examId: null,
        title: clonedTitle,
        instructions: source.instructions || null,
        timeAllowedMins: source.timeAllowedMins,
        totalMarks: source.totalMarks,
        status: "TIDIED",
        privacyTier: "SCHOOL_ONLY",
        sharingApprovalStatus: "NONE",
        questionsJson: source.questionsJson,
      } as never,
    });

    await audit(user, "academics.public_exam_cloned", cloned.id, {
      sourcePaperId: source.id,
      sourceSchoolName: source.tenant.name,
      clonedTitle,
    });

    return {
      ...cloned,
      questions: JSON.parse(cloned.questionsJson) as ScannedExamQuestion[],
    };
  });
}
