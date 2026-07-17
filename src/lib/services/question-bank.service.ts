/**
 * EE.8 — In-App Quiz / Question Bank & Weakness-Driven Student Practice (`EE.8`).
 * Self-marking per strand/sub-strand, zero running cost, book scanning via OCR, and weakness focus.
 */

import { db } from "@/lib/db";
import { tenantDb } from "@/lib/core/tenant-db";
import { withTenant } from "@/lib/core/tenant-context";
import type { SessionUser } from "@/lib/core/session";
import {
  enhanceImageForOcr,
  runLocalOcr,
} from "@/lib/services/bundi-intelligent.service";
import type {
  CreateQuestionBankEntryInput,
  SubmitQuestionBankAttemptInput,
  ScanBookForQuestionsInput,
  ListQuestionBankQuery,
  QuestionBankItem,
  StudentSuggestedQuestionGroup,
  PrintQuestionBankExamInput,
  PrintableQuestionBankExamData,
  PrintableExamQuestionItem,
} from "@/lib/validations/question-bank";
import { JUNIOR_SCHOOL_QUESTION_SEEDS } from "@/lib/data/kicd-junior-school-question-bank";
import { JUNIOR_SCHOOL_QUESTION_SEEDS_PART2 } from "@/lib/data/kicd-junior-school-question-bank-part2";
import { QUESTION_BANK_EXPANSION_15 } from "@/lib/data/kicd-question-bank-expansion-15";
import { PRIMARY_AND_SENIOR_QUESTION_SEEDS } from "@/lib/data/kicd-primary-senior-question-bank";
import { QUESTION_BANK_EXPANSION_20_PART1 } from "@/lib/data/kicd-question-bank-expansion-20-part1";
import { QUESTION_BANK_EXPANSION_20_PART2 } from "@/lib/data/kicd-question-bank-expansion-20-part2";
import { QUESTION_BANK_EXPANSION_20_PART3 } from "@/lib/data/kicd-question-bank-expansion-20-part3";
import { QUESTION_BANK_EXPANSION_20_PART4 } from "@/lib/data/kicd-question-bank-expansion-20-part4";
import { QUESTION_BANK_EXPANSION_20_PART5 } from "@/lib/data/kicd-question-bank-expansion-20-part5";
import { QUESTION_BANK_EXPANSION_20_PART6 } from "@/lib/data/kicd-question-bank-expansion-20-part6";
import { QUESTION_BANK_EXPANSION_20_PART7 } from "@/lib/data/kicd-question-bank-expansion-20-part7";
import { QUESTION_BANK_EXPANSION_20_PART8 } from "@/lib/data/kicd-question-bank-expansion-20-part8";
import { QUESTION_BANK_EXPANSION_500_PART1 } from "@/lib/data/kicd-question-bank-expansion-500-part1";
import { QUESTION_BANK_EXPANSION_500_PART2 } from "@/lib/data/kicd-question-bank-expansion-500-part2";
import { QUESTION_BANK_EXPANSION_500_PART3 } from "@/lib/data/kicd-question-bank-expansion-500-part3";
import { QUESTION_BANK_EXPANSION_500_PART4 } from "@/lib/data/kicd-question-bank-expansion-500-part4";
import { QUESTION_BANK_EXPANSION_500_PART5 } from "@/lib/data/kicd-question-bank-expansion-500-part5";
import { QUESTION_BANK_EXPANSION_500_PART6 } from "@/lib/data/kicd-question-bank-expansion-500-part6";
import { QUESTION_BANK_EXPANSION_500_PART7 } from "@/lib/data/kicd-question-bank-expansion-500-part7";
import { QUESTION_BANK_EXPANSION_500_PART8 } from "@/lib/data/kicd-question-bank-expansion-500-part8";
import { QUESTION_BANK_EXPANSION_500_PART9 } from "@/lib/data/kicd-question-bank-expansion-500-part9";
import { QUESTION_BANK_EXPANSION_500_PART10 } from "@/lib/data/kicd-question-bank-expansion-500-part10";
import { QUESTION_BANK_EXPANSION_500_PART11 } from "@/lib/data/kicd-question-bank-expansion-500-part11";
import { QUESTION_BANK_EXPANSION_500_PART12 } from "@/lib/data/kicd-question-bank-expansion-500-part12";
import { QUESTION_BANK_EXPANSION_500_PART13 } from "@/lib/data/kicd-question-bank-expansion-500-part13";
import { QUESTION_BANK_EXPANSION_500_PART14 } from "@/lib/data/kicd-question-bank-expansion-500-part14";
import { QUESTION_BANK_EXPANSION_500_PART15 } from "@/lib/data/kicd-question-bank-expansion-500-part15";
import { QUESTION_BANK_EXPANSION_500_PART16 } from "@/lib/data/kicd-question-bank-expansion-500-part16";
import { QUESTION_BANK_EXPANSION_500_PART17 } from "@/lib/data/kicd-question-bank-expansion-500-part17";
import { QUESTION_BANK_EXPANSION_500_PART18 } from "@/lib/data/kicd-question-bank-expansion-500-part18";
import { QUESTION_BANK_EXPANSION_500_PART19 } from "@/lib/data/kicd-question-bank-expansion-500-part19";
import { QUESTION_BANK_EXPANSION_500MORE_PART1 } from "@/lib/data/kicd-question-bank-expansion-500more-part1";
import { QUESTION_BANK_EXPANSION_500MORE_PART2 } from "@/lib/data/kicd-question-bank-expansion-500more-part2";
import { QUESTION_BANK_EXPANSION_500MORE_PART3 } from "@/lib/data/kicd-question-bank-expansion-500more-part3";
import { QUESTION_BANK_EXPANSION_500MORE_PART4 } from "@/lib/data/kicd-question-bank-expansion-500more-part4";
import { QUESTION_BANK_EXPANSION_500MORE_PART5 } from "@/lib/data/kicd-question-bank-expansion-500more-part5";
import { QUESTION_BANK_EXPANSION_500MORE_PART6 } from "@/lib/data/kicd-question-bank-expansion-500more-part6";
import { QUESTION_BANK_EXPANSION_500MORE_PART7 } from "@/lib/data/kicd-question-bank-expansion-500more-part7";
import { QUESTION_BANK_EXPANSION_500MORE_PART8 } from "@/lib/data/kicd-question-bank-expansion-500more-part8";
import { QUESTION_BANK_EXPANSION_500MORE_PART9 } from "@/lib/data/kicd-question-bank-expansion-500more-part9";
import { QUESTION_BANK_EXPANSION_500MORE_PART10 } from "@/lib/data/kicd-question-bank-expansion-500more-part10";
import { QUESTION_BANK_EXPANSION_500MORE_PART11 } from "@/lib/data/kicd-question-bank-expansion-500more-part11";
import { QUESTION_BANK_EXPANSION_500MORE_PART12 } from "@/lib/data/kicd-question-bank-expansion-500more-part12";
import { QUESTION_BANK_EXPANSION_500MORE_PART13 } from "@/lib/data/kicd-question-bank-expansion-500more-part13";
import { QUESTION_BANK_EXPANSION_500MORE_PART14 } from "@/lib/data/kicd-question-bank-expansion-500more-part14";
import { QUESTION_BANK_EXPANSION_500MORE_PART15 } from "@/lib/data/kicd-question-bank-expansion-500more-part15";
import { QUESTION_BANK_EXPANSION_500MORE_PART16 } from "@/lib/data/kicd-question-bank-expansion-500more-part16";
import { QUESTION_BANK_EXPANSION_500MORE_PART17 } from "@/lib/data/kicd-question-bank-expansion-500more-part17";
import { QUESTION_BANK_EXPANSION_500MORE_PART18 } from "@/lib/data/kicd-question-bank-expansion-500more-part18";
import { QUESTION_BANK_EXPANSION_500MORE_PART19 } from "@/lib/data/kicd-question-bank-expansion-500more-part19";
import { QUESTION_BANK_EXPANSION_500MORE_PART20 } from "@/lib/data/kicd-question-bank-expansion-500more-part20";
import { QUESTION_BANK_EXPANSION_500MORE_PART21 } from "@/lib/data/kicd-question-bank-expansion-500more-part21";
import { QUESTION_BANK_EXPANSION_500MORE_PART22 } from "@/lib/data/kicd-question-bank-expansion-500more-part22";
import { QUESTION_BANK_EXPANSION_500MORE_PART23 } from "@/lib/data/kicd-question-bank-expansion-500more-part23";
import { QUESTION_BANK_EXPANSION_500MORE_PART24 } from "@/lib/data/kicd-question-bank-expansion-500more-part24";
import { QUESTION_BANK_EXPANSION_500MORE_PART25 } from "@/lib/data/kicd-question-bank-expansion-500more-part25";
import { QUESTION_BANK_EXPANSION_500MORE_PART26 } from "@/lib/data/kicd-question-bank-expansion-500more-part26";
import { QUESTION_BANK_EXPANSION_500MORE_PART27 } from "@/lib/data/kicd-question-bank-expansion-500more-part27";
import { QUESTION_BANK_EXPANSION_500MORE_PART28 } from "@/lib/data/kicd-question-bank-expansion-500more-part28";
import { QUESTION_BANK_EXPANSION_500MORE_PART29 } from "@/lib/data/kicd-question-bank-expansion-500more-part29";
import { QUESTION_BANK_EXPANSION_500MORE_PART30 } from "@/lib/data/kicd-question-bank-expansion-500more-part30";
import { QUESTION_BANK_EXPANSION_500MORE_PART31 } from "@/lib/data/kicd-question-bank-expansion-500more-part31";

export class QuestionBankError extends Error {
  constructor(public code: "NOT_FOUND" | "INVALID" | "FORBIDDEN", message: string) {
    super(message);
    this.name = "QuestionBankError";
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

/** Create a new self-marking question entry in the question bank (`EE.8`). */
export async function createQuestionEntry(user: SessionUser, input: CreateQuestionBankEntryInput) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const subj = await tdb.subject.findUnique({ where: { id: input.subjectId } });
    if (!subj) throw new QuestionBankError("NOT_FOUND", "Subject not found.");

    if (input.strandId) {
      const strand = await tdb.cbcStrand.findUnique({ where: { id: input.strandId } });
      if (!strand) throw new QuestionBankError("NOT_FOUND", "Strand not found.");
    }

    const approvalStatus = input.scope === "NATIONAL_SHARED" ? "PENDING_OPS" : "APPROVED";

    const created = await tdb.questionBankEntry.create({
      data: {
        tenantId: user.tenantId,
        createdById: user.id,
        createdByName: (user as any).fullName || "Teacher",
        subjectId: input.subjectId,
        strandId: input.strandId || null,
        substrandId: input.substrandId || null,
        grade: input.grade,
        prompt: input.prompt,
        questionType: input.questionType,
        optionsJson: JSON.stringify(input.options || []),
        correctAnswer: input.correctAnswer,
        explanation: input.explanation || null,
        difficulty: input.difficulty,
        illustrationUrl: input.illustrationUrl || null,
        diagramSvg: input.diagramSvg || null,
        diagramType: input.diagramType || null,
        sourceType: input.sourceType,
        scope: input.scope,
        approvalStatus,
      } as never,
    });

    await audit(user, "academics.question_bank_created", created.id, {
      subjectId: input.subjectId,
      strandId: input.strandId,
      scope: input.scope,
      approvalStatus,
    });

    return {
      ...created,
      options: JSON.parse(created.optionsJson) as string[],
    };
  });
}

/** List question bank entries matching grade, subject, strand, or search term. */
export async function listQuestionBank(
  user: SessionUser,
  query: ListQuestionBankQuery
): Promise<QuestionBankItem[]> {
  const whereFilters: any = {};
  if (query.subjectId) whereFilters.subjectId = query.subjectId;
  if (query.strandId) whereFilters.strandId = query.strandId;
  if (query.substrandId) whereFilters.substrandId = query.substrandId;
  if (query.grade) whereFilters.grade = query.grade;
  if (query.difficulty) whereFilters.difficulty = query.difficulty;
  if (query.search) {
    whereFilters.OR = [
      { prompt: { contains: query.search, mode: "insensitive" } },
      { explanation: { contains: query.search, mode: "insensitive" } },
    ];
  }

  // 1. School specific
  const schoolRows = await withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const whereSchool = { ...whereFilters };
    if (query.scope === "SCHOOL") whereSchool.scope = "SCHOOL";
    else if (query.scope === "NATIONAL_SHARED") whereSchool.scope = "NATIONAL_SHARED";

    return tdb.questionBankEntry.findMany({
      where: whereSchool,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        subject: { select: { name: true } },
        strand: { select: { name: true } },
        substrand: { select: { name: true } },
      },
    });
  });

  // 2. National approved repository across other schools
  let nationalRows: any[] = [];
  if (query.scope === "ALL" || query.scope === "NATIONAL_SHARED") {
    const whereNational = {
      ...whereFilters,
      scope: "NATIONAL_SHARED",
      approvalStatus: "APPROVED",
      tenantId: { not: user.tenantId },
    };
    nationalRows = await db.questionBankEntry.findMany({
      where: whereNational,
      orderBy: { approvedAt: "desc" },
      take: 100,
      include: {
        subject: { select: { name: true } },
        strand: { select: { name: true } },
        substrand: { select: { name: true } },
      },
    });
  }

  const combined = [...schoolRows, ...nationalRows];
  return combined.map((q) => ({
    id: q.id,
    subjectId: q.subjectId,
    strandId: q.strandId,
    substrandId: q.substrandId,
    grade: q.grade,
    prompt: q.prompt,
    questionType: q.questionType,
    options: JSON.parse(q.optionsJson || "[]") as string[],
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    difficulty: q.difficulty,
    illustrationUrl: q.illustrationUrl,
    diagramSvg: q.diagramSvg,
    diagramType: q.diagramType,
    sourceType: q.sourceType,
    scope: q.scope,
    approvalStatus: q.approvalStatus,
    createdByName: q.createdByName,
    subjectName: q.subject?.name ?? null,
    strandName: q.strand?.name ?? null,
    substrandName: q.substrand?.name ?? null,
    createdAt: new Date(q.createdAt).toISOString(),
  }));
}

/**
 * Scan a textbook page, past exam paper, or worksheet via Bundi Intelligent OCR (`enhanceImageForOcr` + `runLocalOcr`)
 * and deterministically structure multiple-choice / short-answer questions ready for 1-click addition (`EE.8`).
 */
export async function scanAndExtractQuestionsFromBook(
  user: SessionUser,
  input: ScanBookForQuestionsInput,
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

  const extracted: Partial<QuestionBankItem>[] = [];
  const questionRegex = /^(?:Q|Question)?\s*(\d+)[\.\):\s-]+(.*)/i;
  const optionRegex = /^([A-D])[\.\):\s-]+(.*)/i;

  let currentQ: any = null;
  let count = 0;

  for (const line of lines) {
    const qMatch = line.match(questionRegex);
    if (qMatch) {
      if (currentQ) extracted.push(currentQ);
      count++;
      currentQ = {
        id: `book-scan-${Date.now()}-${count}`,
        subjectId: input.subjectId,
        strandId: input.strandId || null,
        substrandId: input.substrandId || null,
        grade: input.grade,
        prompt: qMatch[2].trim() || `Question ${count}`,
        questionType: "MULTIPLE_CHOICE",
        options: [],
        correctAnswer: "Option A", // placeholder teacher clicks/verifies
        explanation: "Extracted via Bundi OCR from scanned book page (`EE.8`).",
        difficulty: input.defaultDifficulty || 2,
        diagramSvg: null,
        sourceType: "BOOK_SCAN",
        scope: "SCHOOL",
      };
      continue;
    }

    if (currentQ) {
      const optMatch = line.match(optionRegex);
      if (optMatch) {
        currentQ.options.push(optMatch[2].trim());
      } else if (!currentQ.prompt.endsWith("?")) {
        currentQ.prompt += ` ${line}`;
      } else {
        currentQ.explanation += `\n${line}`;
      }
    }
  }
  if (currentQ) extracted.push(currentQ);

  if (extracted.length === 0 && fullText.trim().length > 0) {
    const paras = fullText.split(/\r?\n\r?\n/).map((p) => p.trim()).filter(Boolean);
    paras.forEach((p, idx) => {
      extracted.push({
        id: `book-scan-${Date.now()}-${idx + 1}`,
        subjectId: input.subjectId,
        strandId: input.strandId || null,
        grade: input.grade,
        prompt: p,
        questionType: "SHORT_ANSWER",
        options: [],
        correctAnswer: "Exact working required",
        explanation: "Extracted from book text block via Bundi OCR (`EE.8`).",
        difficulty: input.defaultDifficulty || 2,
        sourceType: "BOOK_SCAN",
        scope: "SCHOOL",
      });
    });
  }

  return {
    questions: extracted.map((q) => ({
      ...q,
      options: q.options && q.options.length > 0 ? q.options : ["Option A", "Option B", "Option C", "Option D"],
    })),
    extractedTextLength: fullText.length,
    questionCount: extracted.length,
  };
}

/** Submit a student practice attempt and self-mark with zero running cost (`EE.8`). */
export async function submitStudentAttempt(
  user: SessionUser,
  studentId: string,
  input: SubmitQuestionBankAttemptInput
) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const question = await tdb.questionBankEntry.findUnique({ where: { id: input.questionId } });
    if (!question) throw new QuestionBankError("NOT_FOUND", "Question not found in repository.");

    const cleanSelected = input.selectedAnswer.trim().toLowerCase();
    const cleanCorrect = question.correctAnswer.trim().toLowerCase();
    const isCorrect = cleanSelected === cleanCorrect || cleanSelected.includes(cleanCorrect);

    const attempt = await tdb.questionBankAttempt.create({
      data: {
        tenantId: user.tenantId,
        studentId,
        questionId: question.id,
        selectedAnswer: input.selectedAnswer.trim(),
        isCorrect,
        timeTakenSecs: input.timeTakenSecs,
        attemptedAt: new Date(),
      } as never,
    });

    return {
      attemptId: attempt.id,
      isCorrect,
      selectedAnswer: input.selectedAnswer,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || "Correct answer verified by NEYO Self-Marking Engine (`EE.8`).",
      diagramSvg: question.diagramSvg,
    };
  });
}

/**
 * Smart Weakness-Driven Recommendation Engine (`getSuggestedQuestionsForStudent`):
 * Examines all existing `CbcAssessment` records (`level <= 2 = AE or BE`) and incorrect past attempts,
 * identifies exact weak strands, and surfaces targeted practice questions from our national repository!
 */
export async function getSuggestedQuestionsForStudent(
  user: SessionUser,
  studentId: string,
  filters?: { subjectId?: string }
): Promise<StudentSuggestedQuestionGroup[]> {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const student = await tdb.student.findUnique({
      where: { id: studentId },
      include: { schoolClass: { select: { level: true } } },
    });
    if (!student) throw new QuestionBankError("NOT_FOUND", "Student not found.");

    const grade = student.schoolClass?.level || "Grade 7";

    // Find CBC observations where student scored 1 (BE) or 2 (AE)
    const weakObservations = await tdb.cbcAssessment.findMany({
      where: {
        studentId,
        level: { lte: 2 },
      },
      include: {
        strand: { select: { id: true, name: true, subjectId: true } },
      },
      take: 20,
    });

    const groups: StudentSuggestedQuestionGroup[] = [];
    const processedStrandIds = new Set<string>();

    for (const obs of weakObservations) {
      if (!obs.strand || processedStrandIds.has(obs.strand.id)) continue;
      if (filters?.subjectId && obs.strand.subjectId !== filters.subjectId) continue;

      processedStrandIds.add(obs.strand.id);

      const subj = await tdb.subject.findUnique({ where: { id: obs.strand.subjectId }, select: { name: true } });

      // Fetch practice questions targeting exactly this weak strand
      const questions = await listQuestionBank(user, {
        strandId: obs.strand.id,
        difficulty: obs.level === 1 ? 1 : 2,
        scope: "ALL",
      });

      if (questions.length > 0) {
        groups.push({
          reason: "CBC_BELOW_EXPECTATION",
          strandId: obs.strand.id,
          strandName: obs.strand.name,
          subjectName: subj?.name || "Learning Area",
          grade,
          assessmentLevel: obs.level,
          questions: questions.slice(0, 5),
        });
      }
    }

    // Also check past incorrect practice attempts
    const incorrectAttempts = await tdb.questionBankAttempt.findMany({
      where: { studentId, isCorrect: false },
      orderBy: { attemptedAt: "desc" },
      take: 15,
      include: {
        question: { include: { subject: { select: { name: true } }, strand: { select: { id: true, name: true } } } },
      },
    });

    for (const att of incorrectAttempts) {
      const strand = att.question.strand;
      if (strand && !processedStrandIds.has(strand.id)) {
        processedStrandIds.add(strand.id);
        const moreQuestions = await listQuestionBank(user, {
          strandId: strand.id,
          scope: "ALL",
        });
        if (moreQuestions.length > 0) {
          groups.push({
            reason: "PAST_INCORRECT_ATTEMPTS",
            strandId: strand.id,
            strandName: strand.name,
            subjectName: att.question.subject?.name || "Learning Area",
            grade: att.question.grade,
            questions: moreQuestions.slice(0, 5),
          });
        }
      }
    }

    // If student has no weak strands yet, suggest general mastery practice for their grade
    if (groups.length === 0) {
      const generalQuestions = await listQuestionBank(user, {
        grade,
        subjectId: filters?.subjectId,
        scope: "ALL",
      });
      if (generalQuestions.length > 0) {
        groups.push({
          reason: "GENERAL_MASTERY",
          strandId: null,
          strandName: "General Grade Practice (`EE.8`)",
          subjectName: "All Subjects",
          grade,
          questions: generalQuestions.slice(0, 6),
        });
      }
    }

    return groups;
  });
}

/** Idempotently seed our comprehensive Junior School question bank (`JUNIOR_SCHOOL_QUESTION_SEEDS`). */
export async function seedJuniorSchoolQuestionBank(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    let seededCount = 0;
    let skippedCount = 0;

    const combinedJuniorSeeds = [...JUNIOR_SCHOOL_QUESTION_SEEDS, ...JUNIOR_SCHOOL_QUESTION_SEEDS_PART2, ...QUESTION_BANK_EXPANSION_15, ...QUESTION_BANK_EXPANSION_20_PART1, ...QUESTION_BANK_EXPANSION_20_PART2, ...QUESTION_BANK_EXPANSION_20_PART4, ...QUESTION_BANK_EXPANSION_20_PART5, ...QUESTION_BANK_EXPANSION_20_PART6];
    for (const seed of combinedJuniorSeeds) {
      let subj = await tdb.subject.findFirst({ where: { code: seed.subjectCode } });
      if (!subj) {
        const namesMap: Record<string, string> = {
          MAT: "Mathematics", ENG: "English", KIS: "Kiswahili", ISC: "Integrated Science",
          SST: "Social Studies", PTS: "Pre-Technical Studies", AGN: "Agriculture & Nutrition",
          CAS: "Creative Arts & Sports", CRE: "Christian Religious Education", ENV: "Environmental Activities",
          MATC: "Core Mathematics", MATE: "Essential Mathematics", CSL: "Community Service Learning",
          PHY: "Physics", CHE: "Chemistry", BIO: "Biology", CSC: "Computer Studies", BST: "Business Studies",
          AGR: "Agriculture", GEO: "Geography", HIS: "History and Citizenship",
        };
        subj = await tdb.subject.create({
          data: {
            tenantId: user.tenantId,
            name: namesMap[seed.subjectCode] || `${seed.subjectCode} Subject`,
            code: seed.subjectCode,
            curriculum: "CBC",
          } as never,
        });
      }

      let strand = await tdb.cbcStrand.findFirst({
        where: { subjectId: subj.id, name: { contains: seed.strandName } },
      });
      if (!strand) {
        strand = await tdb.cbcStrand.create({
          data: {
            tenantId: user.tenantId,
            subjectId: subj.id,
            name: `${seed.grade} · ${seed.strandName}`,
          } as never,
        });
      }

      let substrandId: string | null = null;
      if (seed.substrandName) {
        let sub = await tdb.cbcSubstrand.findFirst({
          where: { strandId: strand.id, name: { contains: seed.substrandName } },
        });
        if (!sub) {
          sub = await tdb.cbcSubstrand.create({
            data: {
              tenantId: user.tenantId,
              strandId: strand.id,
              name: seed.substrandName,
            } as never,
          });
        }
        substrandId = sub.id;
      }

      const existingQ = await tdb.questionBankEntry.findFirst({
        where: { subjectId: subj.id, prompt: { equals: seed.prompt } },
      });
      if (existingQ) {
        skippedCount++;
        continue;
      }

      await tdb.questionBankEntry.create({
        data: {
          tenantId: user.tenantId,
          createdById: user.id,
          createdByName: "KICD Junior School Seed (`EE.8`)",
          subjectId: subj.id,
          strandId: strand.id,
          substrandId,
          grade: seed.grade,
          prompt: seed.prompt,
          questionType: seed.questionType,
          optionsJson: JSON.stringify(seed.options),
          correctAnswer: seed.correctAnswer,
          explanation: seed.explanation,
          difficulty: seed.difficulty,
          diagramSvg: seed.diagramSvg || null,
          diagramType: seed.diagramType || null,
          sourceType: "KICD_SEEDED",
          scope: "NATIONAL_SHARED",
          approvalStatus: "APPROVED",
        } as never,
      });
      seededCount++;
    }

    await audit(user, "academics.question_bank_seeded", "JUNIOR_SCHOOL", {
      seededCount,
      skippedCount,
    });

    return { seededCount, skippedCount };
  });
}

/** Idempotently seed Primary (`Grade 1–6`) & Senior (`Grade 10`) question bank (`PRIMARY_AND_SENIOR_QUESTION_SEEDS`). */
export async function seedPrimaryAndSeniorSchoolQuestionBank(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    let seededCount = 0;
    let skippedCount = 0;

    const combinedPrimarySeniorSeeds = [...PRIMARY_AND_SENIOR_QUESTION_SEEDS, ...QUESTION_BANK_EXPANSION_20_PART3, ...QUESTION_BANK_EXPANSION_20_PART4, ...QUESTION_BANK_EXPANSION_20_PART7, ...QUESTION_BANK_EXPANSION_20_PART8, ...QUESTION_BANK_EXPANSION_500_PART1, ...QUESTION_BANK_EXPANSION_500_PART2, ...QUESTION_BANK_EXPANSION_500_PART3, ...QUESTION_BANK_EXPANSION_500_PART4, ...QUESTION_BANK_EXPANSION_500_PART5, ...QUESTION_BANK_EXPANSION_500_PART6, ...QUESTION_BANK_EXPANSION_500_PART7, ...QUESTION_BANK_EXPANSION_500_PART8, ...QUESTION_BANK_EXPANSION_500_PART9, ...QUESTION_BANK_EXPANSION_500_PART10, ...QUESTION_BANK_EXPANSION_500_PART11, ...QUESTION_BANK_EXPANSION_500_PART12, ...QUESTION_BANK_EXPANSION_500_PART13, ...QUESTION_BANK_EXPANSION_500_PART14, ...QUESTION_BANK_EXPANSION_500_PART15, ...QUESTION_BANK_EXPANSION_500_PART16, ...QUESTION_BANK_EXPANSION_500_PART17, ...QUESTION_BANK_EXPANSION_500_PART18, ...QUESTION_BANK_EXPANSION_500_PART19, ...QUESTION_BANK_EXPANSION_500MORE_PART1, ...QUESTION_BANK_EXPANSION_500MORE_PART2, ...QUESTION_BANK_EXPANSION_500MORE_PART3, ...QUESTION_BANK_EXPANSION_500MORE_PART4, ...QUESTION_BANK_EXPANSION_500MORE_PART5, ...QUESTION_BANK_EXPANSION_500MORE_PART6, ...QUESTION_BANK_EXPANSION_500MORE_PART7, ...QUESTION_BANK_EXPANSION_500MORE_PART8, ...QUESTION_BANK_EXPANSION_500MORE_PART9, ...QUESTION_BANK_EXPANSION_500MORE_PART10, ...QUESTION_BANK_EXPANSION_500MORE_PART11, ...QUESTION_BANK_EXPANSION_500MORE_PART12, ...QUESTION_BANK_EXPANSION_500MORE_PART13, ...QUESTION_BANK_EXPANSION_500MORE_PART14, ...QUESTION_BANK_EXPANSION_500MORE_PART15, ...QUESTION_BANK_EXPANSION_500MORE_PART16, ...QUESTION_BANK_EXPANSION_500MORE_PART17, ...QUESTION_BANK_EXPANSION_500MORE_PART18, ...QUESTION_BANK_EXPANSION_500MORE_PART19, ...QUESTION_BANK_EXPANSION_500MORE_PART20, ...QUESTION_BANK_EXPANSION_500MORE_PART21, ...QUESTION_BANK_EXPANSION_500MORE_PART22, ...QUESTION_BANK_EXPANSION_500MORE_PART23, ...QUESTION_BANK_EXPANSION_500MORE_PART24, ...QUESTION_BANK_EXPANSION_500MORE_PART25, ...QUESTION_BANK_EXPANSION_500MORE_PART26, ...QUESTION_BANK_EXPANSION_500MORE_PART27, ...QUESTION_BANK_EXPANSION_500MORE_PART28, ...QUESTION_BANK_EXPANSION_500MORE_PART29, ...QUESTION_BANK_EXPANSION_500MORE_PART30, ...QUESTION_BANK_EXPANSION_500MORE_PART31];
    for (const seed of combinedPrimarySeniorSeeds) {
      let subj = await tdb.subject.findFirst({ where: { code: seed.subjectCode } });
      if (!subj) {
        const namesMap: Record<string, string> = {
          MAT: "Mathematics", ENG: "English", KIS: "Kiswahili", ISC: "Integrated Science",
          SST: "Social Studies", PTS: "Pre-Technical Studies", AGN: "Agriculture & Nutrition",
          CAS: "Creative Arts & Sports", CRE: "Christian Religious Education", ENV: "Environmental Activities",
          MATC: "Core Mathematics", MATE: "Essential Mathematics", CSL: "Community Service Learning",
          PHY: "Physics", CHE: "Chemistry", BIO: "Biology", CSC: "Computer Studies", BST: "Business Studies",
          AGR: "Agriculture", GEO: "Geography", HIS: "History and Citizenship",
        };
        subj = await tdb.subject.create({
          data: {
            tenantId: user.tenantId,
            name: namesMap[seed.subjectCode] || `${seed.subjectCode} Subject`,
            code: seed.subjectCode,
            curriculum: "CBC",
          } as never,
        });
      }

      let strand = await tdb.cbcStrand.findFirst({
        where: { subjectId: subj.id, name: { contains: seed.strandName } },
      });
      if (!strand) {
        strand = await tdb.cbcStrand.create({
          data: {
            tenantId: user.tenantId,
            subjectId: subj.id,
            name: `${seed.grade} · ${seed.strandName}`,
          } as never,
        });
      }

      let substrandId: string | null = null;
      if (seed.substrandName) {
        let sub = await tdb.cbcSubstrand.findFirst({
          where: { strandId: strand.id, name: { contains: seed.substrandName } },
        });
        if (!sub) {
          sub = await tdb.cbcSubstrand.create({
            data: {
              tenantId: user.tenantId,
              strandId: strand.id,
              name: seed.substrandName,
            } as never,
          });
        }
        substrandId = sub.id;
      }

      const existingQ = await tdb.questionBankEntry.findFirst({
        where: { subjectId: subj.id, prompt: { equals: seed.prompt } },
      });
      if (existingQ) {
        skippedCount++;
        continue;
      }

      await tdb.questionBankEntry.create({
        data: {
          tenantId: user.tenantId,
          createdById: user.id,
          createdByName: "KICD Primary & Senior School Seed (`EE.8`)",
          subjectId: subj.id,
          strandId: strand.id,
          substrandId,
          grade: seed.grade,
          prompt: seed.prompt,
          questionType: seed.questionType,
          optionsJson: JSON.stringify(seed.options),
          correctAnswer: seed.correctAnswer,
          explanation: seed.explanation,
          difficulty: seed.difficulty,
          diagramSvg: seed.diagramSvg || null,
          diagramType: seed.diagramType || null,
          sourceType: "KICD_SEEDED",
          scope: "NATIONAL_SHARED",
          approvalStatus: "APPROVED",
        } as never,
      });
      seededCount++;
    }

    await audit(user, "academics.question_bank_seeded", "PRIMARY_AND_SENIOR", {
      seededCount,
      skippedCount,
    });

    return { seededCount, skippedCount };
  });
}

/** Seed Junior, Primary (`Grade 1–6`), and Senior (`Grade 10`) question banks together (`EE.8`). */
export async function seedAllQuestionBanks(user: SessionUser) {
  const junior = await seedJuniorSchoolQuestionBank(user);
  const primarySenior = await seedPrimaryAndSeniorSchoolQuestionBank(user);
  return {
    juniorSeeded: junior.seededCount,
    juniorSkipped: junior.skippedCount,
    primarySeniorSeeded: primarySenior.seededCount,
    primarySeniorSkipped: primarySenior.skippedCount,
    totalSeeded: junior.seededCount + primarySenior.seededCount,
  };
}

/**
 * Generate official, high-contrast, printable examination paper data directly from handpicked Question Bank entries (`EE.8`).
 * Includes both the formatted printable exam paper block (`questions`) and the official teacher answer key (`answerKey`).
 */
export async function getPrintableQuestionBankExam(
  user: SessionUser,
  input: PrintQuestionBankExamInput
): Promise<PrintableQuestionBankExamData> {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const tenant = await tdb.tenant.findUnique({ where: { id: user.tenantId }, select: { name: true } });

    const entries = await tdb.questionBankEntry.findMany({
      where: { id: { in: input.questionIds } },
      include: { subject: { select: { name: true, code: true } } },
    });

    if (entries.length === 0) {
      throw new QuestionBankError("NOT_FOUND", "No matching questions found in repository.");
    }

    // Preserve exact ordering requested by caller when possible
    const orderedEntries = input.questionIds
      .map((id) => entries.find((e) => e.id === id))
      .filter((e): e is NonNullable<typeof e> => Boolean(e));

    const subjectNames = Array.from(new Set(orderedEntries.map((e) => e.subject?.name || "General Subject"))).join(" / ");
    const gradeLabel = input.grade || orderedEntries[0]?.grade || "All Grades";

    let totalMarks = 0;
    const formattedQuestions: PrintableExamQuestionItem[] = orderedEntries.map((q, idx) => {
      // Calculate mark weight depending on question type if not explicit
      let marks = 2;
      const opts = JSON.parse(q.optionsJson || "[]") as string[];
      if (q.questionType === "MULTIPLE_CHOICE" || opts.length > 0) {
        marks = 2;
      } else if (q.questionType === "TRUE_FALSE") {
        marks = 1;
      } else if (q.questionType === "ESSAY" || (opts.length === 0 && (q.prompt.length > 150 || q.prompt.toLowerCase().includes("discuss")))) {
        marks = 10;
      } else if (q.questionType === "SHORT_ANSWER") {
        marks = 3;
      }

      totalMarks += marks;

      return {
        id: q.id,
        questionNumber: idx + 1,
        prompt: q.prompt,
        questionType: q.questionType,
        options: opts,
        marks,
        diagramSvg: q.diagramSvg || null,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || null,
      };
    });

    const answerKey = formattedQuestions.map((q) => ({
      questionNumber: q.questionNumber,
      prompt: q.prompt,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    }));

    const trackingRef = `MS-QB-EXAM-${Date.now()}-${user.id.slice(-4).toUpperCase()}`;

    await audit(user, "academics.question_bank_exam_printed", trackingRef, {
      title: input.title,
      questionCount: formattedQuestions.length,
      totalMarks,
    });

    return {
      trackingRef,
      schoolName: tenant?.name || "NEYO School",
      title: input.title,
      grade: gradeLabel,
      subjectName: subjectNames,
      instructions: input.instructions || "Answer all questions cleanly in the spaces or boxes provided. Show working where applicable.",
      timeAllowedMins: input.timeAllowedMins || 60,
      totalMarks,
      questions: formattedQuestions,
      answerKey,
      generatedAt: new Date().toISOString(),
    };
  });
}
