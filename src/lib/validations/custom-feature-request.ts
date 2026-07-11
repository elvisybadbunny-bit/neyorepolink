/**
 * T.3 — School-Requested Custom Feature Pipeline. Zod validation.
 */
import { z } from "zod";

export const createCustomFeatureRequestSchema = z.object({
  title: z.string().trim().min(3, "Give it a short real title.").max(120),
  description: z.string().trim().min(10, "Describe what you need in a bit more detail.").max(3000),
});
export type CreateCustomFeatureRequestInput = z.infer<typeof createCustomFeatureRequestSchema>;

/**
 * NEYO Ops moving a request through REVIEWING -> QUOTED -> APPROVED ->
 * IN_PROGRESS -> DELIVERED (or DECLINED). Quoting requires a real recurring
 * price + billing cycle (founder's own words: "the team should tell the
 * school about the cost that will be incurred per period").
 */
export const updateCustomFeatureRequestSchema = z.object({
  status: z.enum(["REVIEWING", "QUOTED", "APPROVED", "IN_PROGRESS", "DELIVERED", "DECLINED"]),
  quotedPriceKes: z.coerce.number().int().min(0).max(10_000_000).optional(),
  quotedBillingCycle: z.enum(["MONTHLY", "TERMLY", "YEARLY"]).optional(),
  opsNote: z.string().trim().max(2000).optional(),
  declineReason: z.string().trim().min(3).max(500).optional(),
  deliveredFeatureKey: z.string().trim().min(2).max(60).regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers and underscores only.").optional(),
}).refine((d) => d.status !== "QUOTED" || (d.quotedPriceKes !== undefined && d.quotedBillingCycle), {
  message: "A real quoted price and billing cycle are required to move a request to QUOTED.",
  path: ["quotedPriceKes"],
}).refine((d) => d.status !== "DECLINED" || (d.declineReason && d.declineReason.length >= 3), {
  message: "A real reason is required when declining a request.",
  path: ["declineReason"],
}).refine((d) => d.status !== "DELIVERED" || (d.deliveredFeatureKey && d.deliveredFeatureKey.length >= 2), {
  message: "The real feature-grant key used to deliver this is required.",
  path: ["deliveredFeatureKey"],
});
export type UpdateCustomFeatureRequestInput = z.infer<typeof updateCustomFeatureRequestSchema>;

/** The school's own real response to a QUOTED request. */
export const replyCustomFeatureRequestSchema = z.object({
  approve: z.boolean(),
  schoolReply: z.string().trim().max(500).optional(),
});
export type ReplyCustomFeatureRequestInput = z.infer<typeof replyCustomFeatureRequestSchema>;

/** NEYO Ops's own later decision to release a delivered custom feature to every school. */
export const releaseCustomFeatureToAllSchema = z.object({
  requestId: z.string().min(1),
});
export type ReleaseCustomFeatureToAllInput = z.infer<typeof releaseCustomFeatureToAllSchema>;
