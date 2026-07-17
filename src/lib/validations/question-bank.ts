/**
 * EE.8 — In-App Quiz / Question Bank & Weakness-Driven Student Practice (`EE.8`).
 * Validation schemas and TypeScript definitions.
 */

import { z } from "zod";

export const createQuestionBankEntrySchema = z.object({
  subjectId: z.string().min(1),
  strandId: z.string().optional().nullable(),
  substrandId: z.string().optional().nullable(),
  grade: z.string().min(1),
  prompt: z.string().min(1),
  questionType: z.enum(["MULTIPLE_CHOICE", "SHORT_ANSWER", "TRUE_FALSE"]).default("MULTIPLE_CHOICE"),
  options: z.array(z.string()).default([]),
  correctAnswer: z.string().min(1),
  explanation: z.string().trim().max(2000).optional().nullable(),
  difficulty: z.number().int().min(1).max(3).default(2),
  illustrationUrl: z.string().optional().nullable(),
  diagramSvg: z.string().optional().nullable(),
  diagramType: z.string().optional().nullable(),
  sourceType: z.enum(["TEACHER_CREATED", "BOOK_SCAN", "KICD_SEEDED", "CLONED"]).default("TEACHER_CREATED"),
  scope: z.enum(["SCHOOL", "NATIONAL_SHARED"]).default("SCHOOL"),
});
export type CreateQuestionBankEntryInput = z.infer<typeof createQuestionBankEntrySchema>;

export const submitQuestionBankAttemptSchema = z.object({
  questionId: z.string().min(1),
  selectedAnswer: z.string().min(1),
  timeTakenSecs: z.number().int().min(1).default(30),
});
export type SubmitQuestionBankAttemptInput = z.infer<typeof submitQuestionBankAttemptSchema>;

export const scanBookForQuestionsSchema = z.object({
  imageBase64: z.string().min(1),
  subjectId: z.string().min(1),
  strandId: z.string().optional().nullable(),
  substrandId: z.string().optional().nullable(),
  grade: z.string().min(1),
  defaultDifficulty: z.number().int().min(1).max(3).default(2),
});
export type ScanBookForQuestionsInput = z.infer<typeof scanBookForQuestionsSchema>;

export const listQuestionBankQuerySchema = z.object({
  subjectId: z.string().optional(),
  strandId: z.string().optional(),
  substrandId: z.string().optional(),
  grade: z.string().optional(),
  difficulty: z.coerce.number().optional(),
  scope: z.enum(["ALL", "SCHOOL", "NATIONAL_SHARED"]).optional().default("ALL"),
  search: z.string().optional(),
});
export type ListQuestionBankQuery = z.infer<typeof listQuestionBankQuerySchema>;

export interface QuestionBankItem {
  id: string;
  subjectId: string;
  strandId: string | null;
  substrandId: string | null;
  grade: string;
  prompt: string;
  questionType: string;
  options: string[];
  correctAnswer?: string; // returned to teacher/ops; omitted during pre-attempt student fetch when desired
  explanation: string | null;
  difficulty: number;
  illustrationUrl: string | null;
  diagramSvg: string | null;
  diagramType: string | null;
  sourceType: string;
  scope: string;
  approvalStatus: string;
  createdByName: string;
  subjectName?: string | null;
  strandName?: string | null;
  substrandName?: string | null;
  createdAt: string;
}

export interface StudentSuggestedQuestionGroup {
  reason: "CBC_BELOW_EXPECTATION" | "PAST_INCORRECT_ATTEMPTS" | "GENERAL_MASTERY";
  strandId: string | null;
  strandName: string;
  subjectName: string;
  grade: string;
  assessmentLevel?: number | null; // 1=BE, 2=AE
  questions: QuestionBankItem[];
}

export interface PrintableExamQuestionItem {
  id: string;
  questionNumber: number;
  prompt: string;
  questionType: string;
  options: string[];
  marks: number;
  diagramSvg: string | null;
  correctAnswer: string;
  explanation: string | null;
}

export interface PrintableQuestionBankExamData {
  trackingRef: string;
  schoolName: string;
  title: string;
  grade: string;
  subjectName: string;
  instructions: string;
  timeAllowedMins: number;
  totalMarks: number;
  questions: PrintableExamQuestionItem[];
  answerKey: {
    questionNumber: number;
    prompt: string;
    correctAnswer: string;
    explanation: string | null;
  }[];
  generatedAt: string;
}

export const printQuestionBankExamSchema = z.object({
  questionIds: z.array(z.string().min(1)).min(1),
  title: z.string().min(1),
  instructions: z.string().optional().nullable(),
  timeAllowedMins: z.number().int().min(1).default(60),
  grade: z.string().optional().nullable(),
});
export type PrintQuestionBankExamInput = z.infer<typeof printQuestionBankExamSchema>;
