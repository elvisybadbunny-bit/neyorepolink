/**
 * EE.5 — Exam-paper scanning ("Teacher writes on paper, NEYO tidies it into a professional exam").
 * Validation schemas and TypeScript definitions.
 */

import { z } from "zod";

export const scannedExamQuestionSchema = z.object({
  id: z.string().min(1),
  questionNumber: z.number().int().min(1),
  prompt: z.string().min(1),
  questionType: z.enum(["MULTIPLE_CHOICE", "STRUCTURED", "ESSAY"]).default("STRUCTURED"),
  options: z.array(z.string()).default([]),
  marks: z.number().int().min(1).default(2),
  confidencePct: z.number().min(0).max(100).default(90),
});
export type ScannedExamQuestion = z.infer<typeof scannedExamQuestionSchema>;

export const saveTidiedExamPaperSchema = z.object({
  id: z.string().optional(),
  subjectId: z.string().min(1),
  classId: z.string().min(1),
  examId: z.string().optional().nullable(),
  title: z.string().min(1),
  instructions: z.string().optional().nullable(),
  timeAllowedMins: z.number().int().min(1).default(120),
  totalMarks: z.number().int().min(1).default(100),
  status: z.enum(["DRAFT", "TIDIED", "PUBLISHED", "ARCHIVED"]).default("TIDIED"),
  privacyTier: z.enum(["PRIVATE", "SCHOOL_ONLY", "PUBLIC_SHARED"]).default("SCHOOL_ONLY"),
  questions: z.array(scannedExamQuestionSchema).min(1),
});
export type SaveTidiedExamPaperInput = z.infer<typeof saveTidiedExamPaperSchema>;

export interface TidiedExamPaperResult {
  titleDetected: string;
  instructionsDetected: string;
  timeAllowedMinsDetected: number;
  totalMarksDetected: number;
  questions: ScannedExamQuestion[];
  pipelineStats: {
    ocrWordsDetected: number;
    questionsSegmented: number;
    enhancementApplied: boolean;
  };
}

export const exportToLmsQuizSchema = z.object({
  paperId: z.string().min(1),
  quizTitle: z.string().optional(),
  publishImmediately: z.boolean().default(true),
});
export type ExportToLmsQuizInput = z.infer<typeof exportToLmsQuizSchema>;
