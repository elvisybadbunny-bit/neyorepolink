/**
 * EE.9 — Scan a paper quiz into a printable, self-marking formative assessment.
 * Validation schemas and TypeScript definitions.
 */

import { z } from "zod";

export const createPaperQuizBatchSchema = z.object({
  subjectId: z.string().min(1),
  classId: z.string().min(1),
  strandId: z.string().min(1),
  substrandId: z.string().optional().nullable(),
  title: z.string().min(1),
  instructions: z.string().optional().nullable(),
  totalQuizMarks: z.number().int().min(1).default(10),
  eeThresholdPct: z.number().int().min(50).max(100).default(80),
  meThresholdPct: z.number().int().min(30).max(99).default(60),
  aeThresholdPct: z.number().int().min(10).max(80).default(40),
  questions: z.array(
    z.object({
      questionNumber: z.number().int().min(1),
      prompt: z.string().min(1),
      marks: z.number().int().min(1).default(2),
    })
  ).default([]),
});
export type CreatePaperQuizBatchInput = z.infer<typeof createPaperQuizBatchSchema>;

export const updateBatchStudentScoresSchema = z.object({
  batchId: z.string().min(1),
  studentScores: z.array(
    z.object({
      studentId: z.string().min(1),
      score: z.number().min(0).nullable(), // raw marks scored e.g. 8.5 out of 10
      comment: z.string().trim().max(500).optional().nullable(),
    })
  ),
});
export type UpdateBatchStudentScoresInput = z.infer<typeof updateBatchStudentScoresSchema>;

export const applyPaperQuizFormativeSchema = z.object({
  batchId: z.string().min(1),
  date: z.string().min(1).default(() => new Date().toISOString().slice(0, 10)),
});
export type ApplyPaperQuizFormativeInput = z.infer<typeof applyPaperQuizFormativeSchema>;

export const scanPaperQuizToFormativeSchema = z.object({
  imageBase64: z.string().min(1),
  subjectId: z.string().min(1),
  classId: z.string().min(1),
  strandId: z.string().min(1),
  substrandId: z.string().optional().nullable(),
  title: z.string().optional(),
  totalQuizMarks: z.number().int().min(1).default(10),
});
export type ScanPaperQuizToFormativeInput = z.infer<typeof scanPaperQuizToFormativeSchema>;

export interface PaperQuizStudentScoreItem {
  studentId: string;
  admissionNo: string;
  studentName: string;
  score: number | null;
  scorePct: number | null;
  level: number | null; // 1=BE, 2=AE, 3=ME, 4=EE
  rubricLabel: string | null; // "Exceeding Expectations (EE)"
  comment: string | null;
  status: "PENDING" | "APPLIED";
}

export interface PrintableFormativeQuizSheetData {
  trackingRef: string;
  schoolName: string;
  title: string;
  className: string;
  subjectName: string;
  strandName: string;
  substrandName: string | null;
  instructions: string;
  totalQuizMarks: number;
  thresholdSummary: string; // e.g. ">=80% EE · 60-79% ME · 40-59% AE · <40% BE"
  questions: { questionNumber: number; prompt: string; marks: number }[];
  students: { studentId: string; admissionNo: string; studentName: string }[];
  generatedAt: string;
}
