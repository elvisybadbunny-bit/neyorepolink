/**
 * EE.9 — Scan a paper quiz into a printable, self-marking formative assessment.
 * Converts physical/digital quiz marks directly into official KICD 4-point rubric observations (`CbcAssessment`).
 */

import { tenantDb } from "@/lib/core/tenant-db";
import { withTenant } from "@/lib/core/tenant-context";
import type { SessionUser } from "@/lib/core/session";
import {
  enhanceImageForOcr,
  runLocalOcr,
} from "@/lib/services/bundi-intelligent.service";
import type {
  CreatePaperQuizBatchInput,
  UpdateBatchStudentScoresInput,
  ApplyPaperQuizFormativeInput,
  ScanPaperQuizToFormativeInput,
  PaperQuizStudentScoreItem,
  PrintableFormativeQuizSheetData,
} from "@/lib/validations/paper-quiz-formative";

export class PaperQuizFormativeError extends Error {
  constructor(public code: "NOT_FOUND" | "INVALID" | "FORBIDDEN", message: string) {
    super(message);
    this.name = "PaperQuizFormativeError";
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

function getStudentFullName(s: { firstName: string; middleName?: string | null; lastName: string }): string {
  return [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ");
}

/** Create a new Paper Quiz -> Formative Assessment batch (`EE.9`). */
export async function createPaperQuizBatch(user: SessionUser, input: CreatePaperQuizBatchInput) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const subj = await tdb.subject.findUnique({ where: { id: input.subjectId } });
    if (!subj) throw new PaperQuizFormativeError("NOT_FOUND", "Subject not found.");

    const schoolClass = await tdb.schoolClass.findUnique({ where: { id: input.classId } });
    if (!schoolClass) throw new PaperQuizFormativeError("NOT_FOUND", "Class not found.");

    const strand = await tdb.cbcStrand.findUnique({ where: { id: input.strandId } });
    if (!strand) throw new PaperQuizFormativeError("NOT_FOUND", "CBC Strand not found.");

    const students = await tdb.student.findMany({
      where: { classId: input.classId, status: "ACTIVE" },
      orderBy: { admissionNo: "asc" },
      select: { id: true, admissionNo: true, firstName: true, middleName: true, lastName: true },
    });

    const initialScores: PaperQuizStudentScoreItem[] = students.map((s) => ({
      studentId: s.id,
      admissionNo: s.admissionNo,
      studentName: getStudentFullName(s),
      score: null,
      scorePct: null,
      level: null,
      rubricLabel: null,
      comment: null,
      status: "PENDING",
    }));

    const batch = await tdb.paperQuizFormativeBatch.create({
      data: {
        tenantId: user.tenantId,
        createdById: user.id,
        createdByName: (user as any).fullName || "Teacher",
        subjectId: input.subjectId,
        classId: input.classId,
        strandId: input.strandId,
        substrandId: input.substrandId || null,
        title: input.title,
        instructions: input.instructions || "Answer all questions cleanly.",
        totalQuizMarks: input.totalQuizMarks,
        eeThresholdPct: input.eeThresholdPct,
        meThresholdPct: input.meThresholdPct,
        aeThresholdPct: input.aeThresholdPct,
        status: "DRAFT",
        questionsJson: JSON.stringify(input.questions || []),
        studentScoresJson: JSON.stringify(initialScores),
      } as never,
    });

    await audit(user, "academics.paper_quiz_formative_batch_created", batch.id, {
      subjectId: input.subjectId,
      classId: input.classId,
      strandId: input.strandId,
      studentCount: students.length,
    });

    return {
      ...batch,
      questions: JSON.parse(batch.questionsJson),
      studentScores: JSON.parse(batch.studentScoresJson) as PaperQuizStudentScoreItem[],
    };
  });
}

/** Scan a paper quiz via OCR and auto-initialize a `PaperQuizFormativeBatch` (`EE.9`). */
export async function scanPaperQuizToBatch(
  user: SessionUser,
  input: ScanPaperQuizToFormativeInput,
  mockTextOverride?: string
) {
  const buffer = Buffer.from(input.imageBase64.replace(/^data:image\/\w+;base64,/, ""), "base64");
  let fullText = mockTextOverride || "";

  if (!fullText) {
    const enhanced = await enhanceImageForOcr(buffer);
    const ocr = await runLocalOcr(enhanced);
    fullText = ocr.fullText;
  }

  const lines = fullText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const extractedQuestions: { questionNumber: number; prompt: string; marks: number }[] = [];
  const questionRegex = /^(?:Q|Question)?\s*(\d+)[\.\):\s-]+(.*)/i;
  const marksRegex = /(?:\[|\()?(\d+)\s*(?:marks?|mks?|pts?|points?)(?:\]|\))?/i;

  let count = 0;
  for (const line of lines) {
    const qMatch = line.match(questionRegex);
    if (qMatch) {
      count++;
      let promptText = qMatch[2].trim();
      let marks = 2;
      const mMatch = promptText.match(marksRegex);
      if (mMatch) {
        marks = parseInt(mMatch[1], 10) || 2;
        promptText = promptText.replace(marksRegex, "").replace(/[\[\(\]\)]/g, "").trim();
      }
      extractedQuestions.push({
        questionNumber: count,
        prompt: promptText || `Question ${count}`,
        marks,
      });
    }
  }

  if (extractedQuestions.length === 0 && fullText.trim().length > 0) {
    const paras = fullText.split(/\r?\n\r?\n/).map((p) => p.trim()).filter(Boolean);
    paras.forEach((p, idx) => {
      extractedQuestions.push({
        questionNumber: idx + 1,
        prompt: p,
        marks: 2,
      });
    });
  }

  const calculatedTotalMarks = extractedQuestions.reduce((sum, q) => sum + q.marks, 0) || input.totalQuizMarks || 10;
  const title = input.title || `Scanned Formative Quiz (${new Date().toLocaleDateString("en-KE")})`;

  return createPaperQuizBatch(user, {
    subjectId: input.subjectId,
    classId: input.classId,
    strandId: input.strandId,
    substrandId: input.substrandId || null,
    title,
    instructions: "Answer all questions cleanly in the spaces provided.",
    totalQuizMarks: calculatedTotalMarks,
    eeThresholdPct: 80,
    meThresholdPct: 60,
    aeThresholdPct: 40,
    questions: extractedQuestions,
  });
}

/** Generate exact printable student quiz sheet (`FQ-QUIZ-...`) with top-right rubric grading box (`EE.9`). */
export async function getPrintableFormativeQuizSheet(
  user: SessionUser,
  batchId: string
): Promise<PrintableFormativeQuizSheetData> {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const tenant = await tdb.tenant.findUnique({ where: { id: user.tenantId }, select: { name: true } });
    const batch = await tdb.paperQuizFormativeBatch.findUnique({
      where: { id: batchId },
      include: {
        subject: { select: { name: true } },
        schoolClass: { select: { level: true, stream: true } },
        strand: { select: { name: true } },
        substrand: { select: { name: true } },
      },
    });
    if (!batch) throw new PaperQuizFormativeError("NOT_FOUND", "Paper quiz formative batch not found.");

    const studentScores = JSON.parse(batch.studentScoresJson) as PaperQuizStudentScoreItem[];
    const questions = JSON.parse(batch.questionsJson) as { questionNumber: number; prompt: string; marks: number }[];

    const trackingRef = `FQ-QUIZ-${batch.id.slice(-6).toUpperCase()}-CLS-${batch.classId.slice(-4).toUpperCase()}`;

    return {
      trackingRef,
      schoolName: tenant?.name || "NEYO School",
      title: batch.title,
      className: `${batch.schoolClass.level} ${batch.schoolClass.stream ?? ""}`.trim(),
      subjectName: batch.subject.name,
      strandName: batch.strand.name,
      substrandName: batch.substrand?.name ?? null,
      instructions: batch.instructions || "Answer all questions cleanly in the spaces provided.",
      totalQuizMarks: batch.totalQuizMarks,
      thresholdSummary: `>=${batch.eeThresholdPct}% EE · ${batch.meThresholdPct}-${batch.eeThresholdPct - 1}% ME · ${batch.aeThresholdPct}-${batch.meThresholdPct - 1}% AE · <${batch.aeThresholdPct}% BE`,
      questions,
      students: studentScores.map((s) => ({
        studentId: s.studentId,
        admissionNo: s.admissionNo,
        studentName: s.studentName,
      })),
      generatedAt: new Date().toISOString(),
    };
  });
}

/** Update batch student quiz scores and deterministically convert to official KICD 4-point rubric levels (`EE.9`). */
export async function updateBatchStudentScores(user: SessionUser, input: UpdateBatchStudentScoresInput) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const batch = await tdb.paperQuizFormativeBatch.findUnique({
      where: { id: input.batchId },
      include: { strand: { select: { name: true } }, substrand: { select: { name: true } } },
    });
    if (!batch) throw new PaperQuizFormativeError("NOT_FOUND", "Batch not found.");

    const currentScores = JSON.parse(batch.studentScoresJson) as PaperQuizStudentScoreItem[];
    const inputMap = new Map(input.studentScores.map((s) => [s.studentId, s]));

    const updatedScores: PaperQuizStudentScoreItem[] = currentScores.map((s) => {
      const update = inputMap.get(s.studentId);
      if (!update || update.score === null || update.score === undefined) {
        return s.score !== null ? s : { ...s, score: null, scorePct: null, level: null, rubricLabel: null, comment: null, status: "PENDING" };
      }

      const score = Math.max(0, Math.min(batch.totalQuizMarks, update.score));
      const scorePct = Math.round((score / batch.totalQuizMarks) * 100);

      let level = 1;
      let rubricLabel = "Below Expectations (BE)";
      if (scorePct >= batch.eeThresholdPct) {
        level = 4;
        rubricLabel = "Exceeding Expectations (EE)";
      } else if (scorePct >= batch.meThresholdPct) {
        level = 3;
        rubricLabel = "Meeting Expectations (ME)";
      } else if (scorePct >= batch.aeThresholdPct) {
        level = 2;
        rubricLabel = "Approaching Expectations (AE)";
      }

      const topicName = batch.substrand?.name || batch.strand.name;
      const autoComment = update.comment || `${rubricLabel.split(" (")[0]} in ${topicName} based on paper quiz score of ${scorePct}% (${score}/${batch.totalQuizMarks}).`;

      return {
        ...s,
        score,
        scorePct,
        level,
        rubricLabel,
        comment: autoComment,
        status: s.status === "APPLIED" ? "APPLIED" : "PENDING",
      };
    });

    const updated = await tdb.paperQuizFormativeBatch.update({
      where: { id: batch.id },
      data: { studentScoresJson: JSON.stringify(updatedScores) } as never,
    });

    return {
      ...updated,
      questions: JSON.parse(updated.questionsJson),
      studentScores: updatedScores,
    };
  });
}

/** Post all scored entries directly into the live `CbcAssessment` table inside a `$transaction` (`EE.9`). */
export async function applyBatchToCbcAssessments(user: SessionUser, input: ApplyPaperQuizFormativeInput) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const batch = await tdb.paperQuizFormativeBatch.findUnique({ where: { id: input.batchId } });
    if (!batch) throw new PaperQuizFormativeError("NOT_FOUND", "Batch not found.");

    const currentScores = JSON.parse(batch.studentScoresJson) as PaperQuizStudentScoreItem[];
    const scoredStudents = currentScores.filter((s) => s.score !== null && s.level !== null && s.status !== "APPLIED");

    if (scoredStudents.length === 0) {
      return { ...batch, status: batch.status, appliedCount: batch.appliedCount, newObservations: 0, message: "No new pending scores to post." };
    }

    let newObservations = 0;
    await tdb.$transaction(async (tx) => {
      for (const s of scoredStudents) {
        await tx.cbcAssessment.create({
          data: {
            tenantId: user.tenantId,
            studentId: s.studentId,
            strandId: batch.strandId,
            substrandId: batch.substrandId || null,
            teacherId: user.id,
            teacherName: (user as any).fullName || "Teacher",
            level: s.level!,
            comment: s.comment || `Formative paper quiz score: ${s.scorePct}%`,
            date: input.date,
          } as never,
        });
        s.status = "APPLIED";
        newObservations++;
      }
    });

    const totalApplied = batch.appliedCount + newObservations;
    const updated = await tdb.paperQuizFormativeBatch.update({
      where: { id: batch.id },
      data: {
        status: "APPLIED",
        appliedCount: totalApplied,
        appliedAt: new Date(),
        studentScoresJson: JSON.stringify(currentScores),
      } as never,
    });

    await audit(user, "academics.paper_quiz_formative_applied", batch.id, {
      strandId: batch.strandId,
      newObservations,
      totalApplied,
    });

    return {
      ...updated,
      questions: JSON.parse(updated.questionsJson),
      studentScores: currentScores,
      newObservations,
    };
  });
}

/** List all paper quiz formative batches for the school. */
export async function listPaperQuizBatches(
  user: SessionUser,
  filters?: { classId?: string; strandId?: string }
) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const where: any = {};
    if (filters?.classId) where.classId = filters.classId;
    if (filters?.strandId) where.strandId = filters.strandId;

    const rows = await tdb.paperQuizFormativeBatch.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        subject: { select: { name: true, code: true } },
        schoolClass: { select: { level: true, stream: true } },
        strand: { select: { name: true } },
      },
    });

    return rows.map((r) => ({
      ...r,
      className: `${r.schoolClass.level} ${r.schoolClass.stream ?? ""}`.trim(),
      questions: JSON.parse(r.questionsJson),
      studentScores: JSON.parse(r.studentScoresJson) as PaperQuizStudentScoreItem[],
    }));
  });
}

/** Get single paper quiz formative batch by ID. */
export async function getPaperQuizBatch(user: SessionUser, batchId: string) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const batch = await tdb.paperQuizFormativeBatch.findUnique({
      where: { id: batchId },
      include: {
        subject: { select: { name: true, code: true } },
        schoolClass: { select: { level: true, stream: true } },
        strand: { select: { name: true } },
        substrand: { select: { name: true } },
      },
    });
    if (!batch) throw new PaperQuizFormativeError("NOT_FOUND", "Batch not found.");

    return {
      ...batch,
      className: `${batch.schoolClass.level} ${batch.schoolClass.stream ?? ""}`.trim(),
      questions: JSON.parse(batch.questionsJson),
      studentScores: JSON.parse(batch.studentScoresJson) as PaperQuizStudentScoreItem[],
    };
  });
}
