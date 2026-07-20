/**
 * T.2 — NEYO-Ops-Configured Discount Campaigns. Zod validation.
 *
 * Founder-confirmed (2026-07-08): only ONE real campaign may ever be
 * ACTIVE platform-wide at a time (enforced in the service layer). A
 * NEW_SIGNUPS discount is a real ONE-TIME reduction on a school's FIRST
 * subscription payment only — never a permanently-lowered recurring price.
 */
import { z } from "zod";

export const createDiscountCampaignSchema = z.object({
  name: z.string().trim().min(3, "Give the campaign a real name.").max(120),
  appliesTo: z.enum(["NEW_SIGNUPS", "ALL_ACTIVE_SCHOOLS"]),
  percentOff: z.coerce.number().min(0.01, "Enter a real percentage above 0.").max(1, "Cannot discount more than 100%."),
  code: z.string().trim().min(3).max(40).regex(/^[A-Z0-9_-]+$/).optional().or(z.literal("")),
  maxRedemptions: z.coerce.number().int().min(1).max(1000000).nullable().optional(),
  freeMonths: z.coerce.number().int().min(0).max(1).default(0),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
}).refine((d) => new Date(d.endDate) > new Date(d.startDate), {
  message: "The end date must be after the start date.",
  path: ["endDate"],
});
export type CreateDiscountCampaignInput = z.infer<typeof createDiscountCampaignSchema>;

export const endDiscountCampaignSchema = z.object({
  campaignId: z.string().min(1),
});
export type EndDiscountCampaignInput = z.infer<typeof endDiscountCampaignSchema>;
