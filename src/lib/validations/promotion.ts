/**
 * T.13 — Manual Repeat-a-Level (extends G.16's promotion commit).
 *
 * `repeatStudentIds` is an explicit, staff-picked list of students who should
 * stay at their CURRENT level (repeat) instead of moving up with their class.
 * Never automatic, never exam-driven — a human ticks each name.
 */
import { z } from "zod";

export const commitPromotionSchema = z.object({
  year: z.coerce.number().int().min(1990).max(2100).optional(),
  repeatStudentIds: z.array(z.string().min(1)).max(500).optional().default([]),
});

export type CommitPromotionInput = z.infer<typeof commitPromotionSchema>;
