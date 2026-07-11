/**
 * G.12 — Sibling Intelligence validation.
 * Siblings = students sharing a Guardian (no new model needed). The bursar can
 * apply a sibling discount to a specific invoice; pct defaults to the tenant's
 * Tenant.siblingDiscountPct but can be overridden per application.
 */
import { z } from "zod";

export const familyQuerySchema = z.object({
  studentId: z.string().min(1),
});

export const siblingDiscountSchema = z.object({
  invoiceId: z.string().min(1),
  // Optional override; when omitted the service uses Tenant.siblingDiscountPct.
  pct: z.coerce.number().int().min(1).max(100).optional(),
  // R.3 — real single-use server ticket, required only if the school has
  // turned on requireBiometricForFinance (see applyDiscount()).
  biometricTicket: z.string().trim().max(80).optional(),
});

export type SiblingDiscountInput = z.infer<typeof siblingDiscountSchema>;

/**
 * T.14 — Multi-Child Payment Splitting. A real parent-initiated payment
 * across some/all of their linked children's real open invoices — either
 * one target child ("ONE_CHILD") or an even split across a chosen subset
 * ("SPLIT_EQUALLY"). Founder-confirmed (2026-07-08): when an equal split
 * doesn't divide evenly into whole KES, the remainder goes to the child
 * with the LARGEST remaining balance, and the split must NEVER produce
 * decimal KES amounts (every child's share is a real whole-shilling
 * integer, matching how M-Pesa/Daraja itself only ever moves whole KES).
 */
export const splitFamilyPaymentSchema = z.object({
  strategy: z.enum(["ONE_CHILD", "SPLIT_EQUALLY"]),
  amountKes: z.coerce.number().int().min(1, "Enter a real amount.").max(10_000_000),
  // ONE_CHILD: exactly one target student. SPLIT_EQUALLY: 2+ students to split across.
  studentIds: z.array(z.string().min(1)).min(1).max(20),
  phone: z.string().trim().min(1, "Enter a real phone number for the STK push."),
}).refine((d) => d.strategy !== "ONE_CHILD" || d.studentIds.length === 1, {
  message: "ONE_CHILD requires exactly one target student.",
  path: ["studentIds"],
}).refine((d) => d.strategy !== "SPLIT_EQUALLY" || d.studentIds.length >= 2, {
  message: "SPLIT_EQUALLY requires at least two children.",
  path: ["studentIds"],
});
export type SplitFamilyPaymentInput = z.infer<typeof splitFamilyPaymentSchema>;

