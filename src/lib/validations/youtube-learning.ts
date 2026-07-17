/**
 * EE.7 — YouTube learning library (`LearningVideo`): strand-to-video linking,
 * teacher link-submission + ops approval queue, zero API quota cost.
 * Validation schemas and TypeScript definitions.
 */

import { z } from "zod";

export const submitLearningVideoSchema = z.object({
  youtubeUrlOrId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().trim().max(1000).optional().nullable(),
  subjectId: z.string().optional().nullable(),
  strandId: z.string().optional().nullable(),
  substrandId: z.string().optional().nullable(),
  grade: z.string().optional().nullable(),
  scope: z.enum(["SCHOOL", "NATIONAL"]).default("SCHOOL"),
});
export type SubmitLearningVideoInput = z.infer<typeof submitLearningVideoSchema>;

export const opsDecideLearningVideoSchema = z.object({
  videoId: z.string().min(1),
  status: z.enum(["APPROVED", "REJECTED"]),
  rejectionReason: z.string().trim().max(500).optional().nullable(),
});
export type OpsDecideLearningVideoInput = z.infer<typeof opsDecideLearningVideoSchema>;

export const listLearningVideosQuerySchema = z.object({
  subjectId: z.string().optional(),
  strandId: z.string().optional(),
  substrandId: z.string().optional(),
  grade: z.string().optional(),
  scope: z.enum(["ALL", "SCHOOL", "NATIONAL"]).optional().default("ALL"),
  search: z.string().optional(),
});
export type ListLearningVideosQuery = z.infer<typeof listLearningVideosQuerySchema>;

export interface LearningVideoItem {
  id: string;
  youtubeId: string;
  title: string;
  description: string | null;
  channelTitle: string | null;
  thumbnailUrl: string | null;
  savedById: string;
  savedByName: string;
  subjectId: string | null;
  strandId: string | null;
  substrandId: string | null;
  grade: string | null;
  scope: string;
  approvalStatus: string;
  approvedByName: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  subjectName?: string | null;
  strandName?: string | null;
  substrandName?: string | null;
  createdAt: string;
}
