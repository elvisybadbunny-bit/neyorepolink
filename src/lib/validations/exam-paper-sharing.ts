/**
 * EE.6 — Exam privacy tiers (`PRIVATE`, `SCHOOL_ONLY`, `PUBLIC_SHARED`) + cross-school sharing
 * with NEYO Ops approval queue.
 * Validation schemas and TypeScript definitions.
 */

import { z } from "zod";

export const requestPublicSharingSchema = z.object({
  paperId: z.string().min(1),
});
export type RequestPublicSharingInput = z.infer<typeof requestPublicSharingSchema>;

export const decidePublicSharingSchema = z.object({
  paperId: z.string().min(1),
  status: z.enum(["APPROVED", "REJECTED"]),
  decisionNote: z.string().trim().max(500).optional().nullable(),
});
export type DecidePublicSharingInput = z.infer<typeof decidePublicSharingSchema>;

export const clonePublicExamPaperSchema = z.object({
  sourcePaperId: z.string().min(1),
  targetSubjectId: z.string().min(1),
  targetClassId: z.string().min(1),
});
export type ClonePublicExamPaperInput = z.infer<typeof clonePublicExamPaperSchema>;

export const listPublicSharedQuerySchema = z.object({
  subjectCode: z.string().optional(),
  level: z.string().optional(),
  search: z.string().optional(),
});
export type ListPublicSharedQuery = z.infer<typeof listPublicSharedQuerySchema>;
