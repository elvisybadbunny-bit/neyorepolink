/**
 * B.19 Cafeteria — Zod validation.
 */
import { z } from "zod";

export const MEAL_TYPES = ["BREAKFAST", "LUNCH", "SUPPER"] as const;

export const menuEntrySchema = z.object({
  dayOfWeek: z.coerce.number().int().min(1).max(7),
  mealType: z.enum(MEAL_TYPES),
  menu: z.string().trim().min(2, "What's on the menu?").max(200),
});
export type MenuEntryInput = z.infer<typeof menuEntrySchema>;

export const issueCardSchema = z.object({
  studentId: z.string().min(1, "Pick the student."),
  meals: z.array(z.enum(MEAL_TYPES)).min(1, "Pick at least one meal."),
  termFeeKes: z.coerce.number().int().min(1, "Set the plan fee.").max(1_000_000),
  year: z.coerce.number().int().min(2020).max(2100),
  term: z.coerce.number().int().min(1).max(3),
});
export type IssueCardInput = z.infer<typeof issueCardSchema>;

export const kitchenIssueSchema = z.object({
  itemId: z.string().min(1, "Pick the item."),
  qty: z.coerce.number().positive(),
  meal: z.string().trim().min(2).max(80), // "Tuesday lunch — githeri"
});
export type KitchenIssueInput = z.infer<typeof kitchenIssueSchema>;

// ---------------------------------------------------------------------------
// T.9 — real per-level default feeding cost + bulk issue + self-enrollment
// ---------------------------------------------------------------------------

export const feePlanSchema = z.object({
  name: z.string().trim().min(2, "Give the plan a name.").max(120),
  level: z.string().trim().min(1, "Pick a class level."),
  classId: z.string().min(1).optional(), // optional exact class/stream override
  meals: z.array(z.enum(MEAL_TYPES)).min(1, "Pick at least one meal."),
  termFeeKes: z.coerce.number().int().min(1, "Set the plan fee.").max(1_000_000),
  year: z.coerce.number().int().min(2020).max(2100),
  term: z.coerce.number().int().min(1).max(3),
});
export type FeePlanInput = z.infer<typeof feePlanSchema>;

/** T.9 — bulk-issue real meal cards + invoices to every ACTIVE student in a plan's level/class. */
export const bulkIssueCardsSchema = z.object({
  feePlanId: z.string().min(1, "Pick a fee plan."),
  followsLiveDefault: z.boolean().optional().default(false),
});
export type BulkIssueCardsInput = z.infer<typeof bulkIssueCardsSchema>;

/** T.9 — a real parent-portal-initiated enroll/cancel request. */
export const createCafeteriaEnrollmentRequestSchema = z.object({
  studentId: z.string().min(1),
  action: z.enum(["ENROLL", "CANCEL"]),
  reason: z.string().trim().max(500).optional(),
});
export type CreateCafeteriaEnrollmentRequestInput = z.infer<typeof createCafeteriaEnrollmentRequestSchema>;

export const decideCafeteriaEnrollmentRequestSchema = z.object({
  approve: z.boolean(),
  declineReason: z.string().trim().max(500).optional(),
  // Only relevant on ENROLL approval — which plan to issue the card from.
  feePlanId: z.string().min(1).optional(),
});
export type DecideCafeteriaEnrollmentRequestInput = z.infer<typeof decideCafeteriaEnrollmentRequestSchema>;

