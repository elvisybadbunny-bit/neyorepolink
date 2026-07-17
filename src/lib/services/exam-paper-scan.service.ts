/**
 * EE.5 — Exam-paper scanning ("Teacher writes on paper, NEYO tidies it into a professional exam layout").
 * Built on the existing Bundi Intelligent OCR pipeline (`enhanceImageForOcr`, `runLocalOcr`).
 *
 * All operations strictly scoped to `user.tenantId`.
 */

import { tenantDb } from "@/lib/core/tenant-db";
import { withTenant } from "@/lib/core/tenant-context";
import type { SessionUser } from "@/lib/core/session";
import {
  enhanceImageForOcr,
  runLocalOcr,
  BundiIntelligentError,
} from "@/lib/services/bundi-intelligent.service";
import type {
  ScannedExamQuestion,
  TidiedExamPaperResult,
  SaveTidiedExamPaperInput,
  ExportToLmsQuizInput,
} from "@/lib/validations/exam-paper-scan";

export class ExamPaperScanError extends Error {
  constructor(public code: "NOT_FOUND" | "INVALID" | "FORBIDDEN", message: string) {
    super(message);
    this.name = "ExamPaperScanError";
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

/**
 * Scan a handwritten/rough paper exam image/PDF, run local OCR (`enhanceImageForOcr` + `runLocalOcr`),
 * and deterministically segment questions, options, mark allocations, and title.
 */
export async function scanAndTidyExamPaper(
  user: SessionUser,
  imageBuffer: Buffer,
  hint?: { title?: string; defaultMarksPerQuestion?: number; mockOcrText?: string }
): Promise<TidiedExamPaperResult> {
  return withTenant(user.tenantId, async () => {
    let fullText = hint?.mockOcrText || "";
    let wordCount = 0;

    if (!fullText) {
      // Stage 1: Image enhancement (real, zero-cost)
      const enhancedBuffer = await enhanceImageForOcr(imageBuffer);

      // Stage 2: Run local OCR
      const ocr = await runLocalOcr(enhancedBuffer);
      fullText = ocr.fullText;
      wordCount = ocr.words.length;
    } else {
      wordCount = fullText.split(/\s+/).length;
    }

    // Stage 3: Deterministic question segmentation
    // Split text into lines or segments by common question number patterns (e.g. `1.`, `Q1.`, `2)`)
    const lines = fullText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    let titleDetected = hint?.title || "";
    let instructionsDetected = "Answer all questions in the spaces provided.";
    let timeAllowedMinsDetected = 120;
    const questions: ScannedExamQuestion[] = [];

    // Try to extract header metadata from first few lines if title not given
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      if (!titleDetected && /(exam|test|term|form|grade|paper|assessment)/i.test(line)) {
        titleDetected = line;
      }
      const timeMatch = line.match(/(\d+)\s*(hours?|hrs?|mins?|minutes?)/i);
      if (timeMatch) {
        const val = parseInt(timeMatch[1], 10);
        const unit = timeMatch[2].toLowerCase();
        if (unit.startsWith("h")) timeAllowedMinsDetected = val * 60;
        else timeAllowedMinsDetected = val;
      }
    }
    if (!titleDetected) {
      titleDetected = lines[0] || "Scanned Exam Paper";
    }

    // Segment questions by finding lines starting with number + dot/paren (e.g. "1.", "2)", "Q3:")
    const questionRegex = /^(?:Q|Question)?\s*(\d+)[\.\):\s-]+(.*)/i;
    const optionRegex = /^([A-D])[\.\):\s-]+(.*)/i;
    const marksRegex = /(?:\[|\()?(\d+)\s*(?:marks?|mks?|pts?|points?)(?:\]|\))?/i;

    let currentQ: ScannedExamQuestion | null = null;
    let qCount = 0;

    for (const line of lines) {
      const qMatch = line.match(questionRegex);
      if (qMatch) {
        if (currentQ) questions.push(currentQ);
        qCount++;
        const num = parseInt(qMatch[1], 10) || qCount;
        let promptText = qMatch[2].trim();

        // Check if marks token is embedded in prompt
        let marks = hint?.defaultMarksPerQuestion || 2;
        const mMatch = promptText.match(marksRegex);
        if (mMatch) {
          marks = parseInt(mMatch[1], 10) || marks;
          promptText = promptText.replace(marksRegex, "").replace(/[\[\(\]\)]/g, "").trim();
        }

        const questionType: ScannedExamQuestion["questionType"] =
          marks >= 10 || /discuss|explain|essay|analyze|evaluate|describe in detail/i.test(promptText)
            ? "ESSAY"
            : "STRUCTURED";

        currentQ = {
          id: `q-${Date.now()}-${qCount}`,
          questionNumber: num,
          prompt: promptText || `Question ${num}`,
          questionType,
          options: [],
          marks,
          confidencePct: 90,
        };
        continue;
      }

      if (currentQ) {
        // Check if line is an option e.g. "A. Newton's first law"
        const optMatch = line.match(optionRegex);
        if (optMatch) {
          currentQ.questionType = "MULTIPLE_CHOICE";
          currentQ.options.push(optMatch[2].trim());
        } else {
          // Check if marks token is on its own line or end of prompt
          const mMatch = line.match(marksRegex);
          if (mMatch) {
            currentQ.marks = parseInt(mMatch[1], 10) || currentQ.marks;
            if (currentQ.marks >= 10 && currentQ.questionType !== "MULTIPLE_CHOICE") {
              currentQ.questionType = "ESSAY";
            }
          } else {
            // Append to prompt or check for essay indications
            if (/write an essay|explain in detail|discuss at length/i.test(line)) {
              currentQ.questionType = "ESSAY";
              if (currentQ.marks < 10) currentQ.marks = 10;
            }
            if (!currentQ.prompt.endsWith("?")) {
              currentQ.prompt += ` ${line}`;
            } else {
              currentQ.prompt += `\n${line}`;
            }
          }
        }
      }
    }
    if (currentQ) {
      questions.push(currentQ);
    }

    // Fallback if OCR format was completely free-form without exact question numbering:
    if (questions.length === 0 && fullText.trim().length > 0) {
      // Split into paragraphs as questions
      const paragraphs = fullText.split(/\r?\n\r?\n/).map((p) => p.trim()).filter(Boolean);
      paragraphs.forEach((p, idx) => {
        let marks = hint?.defaultMarksPerQuestion || 2;
        const mMatch = p.match(marksRegex);
        let promptText = p;
        if (mMatch) {
          marks = parseInt(mMatch[1], 10) || marks;
          promptText = promptText.replace(marksRegex, "").replace(/[\[\(\]\)]/g, "").trim();
        }
        questions.push({
          id: `q-${Date.now()}-${idx + 1}`,
          questionNumber: idx + 1,
          prompt: promptText,
          questionType: marks >= 10 || promptText.length > 150 ? "ESSAY" : "STRUCTURED",
          options: [],
          marks,
          confidencePct: 80,
        });
      });
    }

    const totalMarksDetected = questions.reduce((sum, q) => sum + q.marks, 0);

    await audit(user, "academics.exam_paper_scanned", titleDetected, {
      questionCount: questions.length,
      totalMarks: totalMarksDetected,
    });

    return {
      titleDetected,
      instructionsDetected,
      timeAllowedMinsDetected,
      totalMarksDetected: totalMarksDetected || 100,
      questions,
      pipelineStats: {
        ocrWordsDetected: wordCount,
        questionsSegmented: questions.length,
        enhancementApplied: true,
      },
    };
  });
}

/** Save or update a tidied exam paper inside the school's `ScannedExamPaper` library. */
export async function saveTidiedExamPaper(
  user: SessionUser,
  input: SaveTidiedExamPaperInput
) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();

    const subject = await tdb.subject.findUnique({ where: { id: input.subjectId } });
    if (!subject) throw new ExamPaperScanError("NOT_FOUND", "Subject not found.");

    const schoolClass = await tdb.schoolClass.findUnique({ where: { id: input.classId } });
    if (!schoolClass) throw new ExamPaperScanError("NOT_FOUND", "Class not found.");

    const totalMarks = input.questions.reduce((sum, q) => sum + (q.marks || 0), 0);
    const questionsJson = JSON.stringify(input.questions);

    let paper;
    if (input.id) {
      const existing = await tdb.scannedExamPaper.findUnique({ where: { id: input.id } });
      if (!existing) throw new ExamPaperScanError("NOT_FOUND", "Scanned exam paper not found.");

      paper = await tdb.scannedExamPaper.update({
        where: { id: input.id },
        data: {
          subjectId: input.subjectId,
          classId: input.classId,
          examId: input.examId || null,
          title: input.title,
          instructions: input.instructions || null,
          timeAllowedMins: input.timeAllowedMins,
          totalMarks: input.totalMarks || totalMarks,
          status: input.status,
          privacyTier: input.privacyTier,
          questionsJson,
        } as never,
      });
    } else {
      paper = await tdb.scannedExamPaper.create({
        data: {
          tenantId: user.tenantId,
          createdById: user.id,
          createdByName: (user as any).fullName || "Teacher",
          subjectId: input.subjectId,
          classId: input.classId,
          examId: input.examId || null,
          title: input.title,
          instructions: input.instructions || null,
          timeAllowedMins: input.timeAllowedMins,
          totalMarks: input.totalMarks || totalMarks,
          status: input.status,
          privacyTier: input.privacyTier,
          questionsJson,
        } as never,
      });
    }

    await audit(user, "academics.scanned_exam_paper_saved", paper.id, {
      title: paper.title,
      subjectId: paper.subjectId,
      questionCount: input.questions.length,
      totalMarks: paper.totalMarks,
    });

    return {
      ...paper,
      questions: JSON.parse(paper.questionsJson) as ScannedExamQuestion[],
    };
  });
}

/** List all scanned exam papers for the school (`ScannedExamPaper` library). */
export async function listScannedExamPapers(
  user: SessionUser,
  filters?: { subjectId?: string; classId?: string; status?: string }
) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const where: any = {};
    if (filters?.subjectId) where.subjectId = filters.subjectId;
    if (filters?.classId) where.classId = filters.classId;
    if (filters?.status) where.status = filters.status;

    const rows = await tdb.scannedExamPaper.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        schoolClass: { select: { id: true, level: true, stream: true } },
      },
    });

    return rows.map((r) => ({
      ...r,
      className: `${r.schoolClass.level} ${r.schoolClass.stream ?? ""}`.trim(),
      questions: JSON.parse(r.questionsJson) as ScannedExamQuestion[],
    }));
  });
}

/** Get one specific scanned exam paper by ID. */
export async function getScannedExamPaper(user: SessionUser, paperId: string) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const paper = await tdb.scannedExamPaper.findUnique({
      where: { id: paperId },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        schoolClass: { select: { id: true, level: true, stream: true } },
      },
    });
    if (!paper) throw new ExamPaperScanError("NOT_FOUND", "Scanned exam paper not found.");

    return {
      ...paper,
      className: `${paper.schoolClass.level} ${paper.schoolClass.stream ?? ""}`.trim(),
      questions: JSON.parse(paper.questionsJson) as ScannedExamQuestion[],
    };
  });
}

/**
 * 1-Click Export to LMS Quiz (`exportScannedPaperToLmsQuiz`):
 * Converts a tidied scanned exam paper into a live digital `Quiz` and `QuizQuestion` set under LMS.
 */
export async function exportScannedPaperToLmsQuiz(
  user: SessionUser,
  input: ExportToLmsQuizInput
) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const paper = await tdb.scannedExamPaper.findUnique({ where: { id: input.paperId } });
    if (!paper) throw new ExamPaperScanError("NOT_FOUND", "Scanned exam paper not found.");

    const questions: ScannedExamQuestion[] = JSON.parse(paper.questionsJson);
    if (questions.length === 0) {
      throw new ExamPaperScanError("INVALID", "Cannot export an empty exam paper to Quiz bank.");
    }

    const quizTitle = input.quizTitle || `${paper.title} (Digital Exam Quiz)`;

    // Create the Quiz row
    const quiz = await tdb.quiz.create({
      data: {
        tenantId: user.tenantId,
        classId: paper.classId,
        subjectId: paper.subjectId,
        teacherId: user.id,
        teacherName: (user as any).fullName || paper.createdByName || "Teacher",
        title: quizTitle,
        instructions: paper.instructions || "Answer all questions. Points are automatically awarded on submission.",
        published: input.publishImmediately,
      } as never,
    });

    let questionsCreated = 0;
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      // Format options for QuizQuestion JSON
      let optionsList = q.options;
      if (!optionsList || optionsList.length < 2) {
        if (q.questionType === "MULTIPLE_CHOICE") {
          optionsList = ["Option A", "Option B", "Option C", "Option D"];
        } else {
          // For structured/essay questions inside LMS multiple choice quiz format,
          // provide self-check or standard options
          optionsList = ["Complete and correct", "Partially correct", "Needs revision", "Not attempted"];
        }
      }

      await tdb.quizQuestion.create({
        data: {
          tenantId: user.tenantId,
          quizId: quiz.id,
          order: i + 1,
          prompt: `[${q.marks} marks] ${q.prompt}`,
          options: JSON.stringify(optionsList),
          correctIndex: 0, // default first option or self-check
        } as never,
      });
      questionsCreated++;
    }

    await audit(user, "academics.scanned_paper_exported_to_lms_quiz", quiz.id, {
      paperId: paper.id,
      quizTitle,
      questionsCreated,
    });

    return {
      quizId: quiz.id,
      quizTitle,
      questionsCreated,
      published: input.publishImmediately,
    };
  });
}
