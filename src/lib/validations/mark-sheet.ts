/**
 * EE.4 — Printable class mark sheets + scan-to-enter with delta/re-scan detection.
 * Validation schemas and TypeScript definitions.
 */

import { z } from "zod";

export const markSheetPrintQuerySchema = z.object({
  examId: z.string().min(1),
  subjectId: z.string().min(1),
  classId: z.string().min(1),
  type: z.enum(["NUMERICAL", "RUBRIC"]).default("NUMERICAL"),
});
export type MarkSheetPrintQuery = z.infer<typeof markSheetPrintQuerySchema>;

export interface MarkSheetStudentRow {
  studentId: string;
  admissionNumber: string;
  fullName: string;
  currentMark: number | null;
  currentRubricLevel: number | null; // 1..4
  currentComment: string | null;
}

export interface MarkSheetPrintData {
  trackingRef: string; // e.g. "MS-EXAM-cm...-SUB-cm...-CLS-cm..."
  schoolName: string;
  examId: string;
  examName: string;
  year: number;
  term: number;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  classId: string;
  className: string;
  maxMarks: number;
  type: "NUMERICAL" | "RUBRIC";
  students: MarkSheetStudentRow[];
  generatedAt: string;
}

export type MarkDeltaStatus = "UNCHANGED" | "CHANGED_DELTA" | "UNCERTAIN_REVIEW" | "NEW_ENTRY";

export interface MarkSheetDeltaRow {
  studentId: string;
  admissionNumber: string;
  studentName: string;
  oldMark: number | null;
  newMark: number | null;
  status: MarkDeltaStatus;
  confidencePct: number;
  rawOcrText: string;
  reviewNote?: string;
}

export interface MarkSheetScanResult {
  trackingRefFound: string | null;
  examId: string;
  examName: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  totalStudentsOnSheet: number;
  unchangedCount: number;
  changedDeltaCount: number;
  uncertainCount: number;
  newEntryCount: number;
  rows: MarkSheetDeltaRow[];
  pipelineStats: {
    ocrWordsDetected: number;
    rowsGrouped: number;
    enhancementApplied: boolean;
  };
}

export const applyMarkSheetDeltasSchema = z.object({
  examId: z.string().min(1),
  subjectId: z.string().min(1),
  classId: z.string().min(1),
  deltas: z.array(
    z.object({
      studentId: z.string().min(1),
      oldMark: z.number().nullable().optional(),
      newMark: z.number().int().min(0).max(1000).nullable(),
      status: z.enum(["UNCHANGED", "CHANGED_DELTA", "UNCERTAIN_REVIEW", "NEW_ENTRY"]),
    })
  ),
});
export type ApplyMarkSheetDeltasInput = z.infer<typeof applyMarkSheetDeltasSchema>;
