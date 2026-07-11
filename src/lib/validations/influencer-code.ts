/**
 * T.6 — Influencer/Promoter Marketing Codes. Zod validation.
 *
 * Founder-confirmed (2026-07-08): mutually exclusive with T.2's own
 * discount campaigns (enforced in the service layer at signup); the
 * influencer's own reward is a real ONE-TIME payment per school signed,
 * mirroring the existing referral reward's one-time-on-first-payment
 * trigger — never an ongoing recurring percentage.
 */
import { z } from "zod";

export const createInfluencerCodeSchema = z.object({
  personName: z.string().trim().min(2, "Enter the influencer's real name.").max(80),
  personPhone: z.string().trim().max(20).optional(),
  personEmail: z.string().trim().email().optional().or(z.literal("")),
  discountPct: z.coerce.number().min(0.01, "Enter a real percentage above 0.").max(0.5, "Cannot discount more than 50%."),
  commissionKes: z.coerce.number().int().min(1, "Enter a real commission amount.").max(1_000_000),
});
export type CreateInfluencerCodeInput = z.infer<typeof createInfluencerCodeSchema>;

export const applyInfluencerCodeSchema = z.object({
  code: z.string().trim().min(4).max(30),
});
export type ApplyInfluencerCodeInput = z.infer<typeof applyInfluencerCodeSchema>;

export const setInfluencerCodeActiveSchema = z.object({
  codeId: z.string().min(1),
  active: z.boolean(),
});
export type SetInfluencerCodeActiveInput = z.infer<typeof setInfluencerCodeActiveSchema>;

export const markCommissionPaidSchema = z.object({
  commissionId: z.string().min(1),
  paidNote: z.string().trim().max(200).optional(),
});
export type MarkCommissionPaidInput = z.infer<typeof markCommissionPaidSchema>;
