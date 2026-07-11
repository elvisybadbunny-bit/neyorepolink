/**
 * T.10 — Teacher Portal: real cash payments PENDING school confirmation.
 * Zod validation.
 */
import { z } from "zod";

export const submitTeacherCashPaymentSchema = z.object({
  invoiceId: z.string().min(1, "Pick the invoice."),
  amountKes: z.coerce.number().int().min(1, "Enter the amount received.").max(10_000_000),
  note: z.string().trim().max(300).optional(),
});
export type SubmitTeacherCashPaymentInput = z.infer<typeof submitTeacherCashPaymentSchema>;

/**
 * decide: CONFIRM = the real cash genuinely reached the school office —
 * applies the real payment. REJECT = the cash did NOT reach the office —
 * a real reason is REQUIRED (per the founder's own answer: "if not
 * received... its reject and the teacher gets the message"), and the
 * teacher is notified with that exact reason.
 */
export const decideTeacherCashPaymentSchema = z.object({
  approve: z.boolean(),
  rejectReason: z.string().trim().min(3, "Give a real reason so the teacher understands.").max(500).optional(),
}).refine((d) => d.approve || (d.rejectReason && d.rejectReason.length >= 3), {
  message: "A reason is required when rejecting a cash entry.",
  path: ["rejectReason"],
});
export type DecideTeacherCashPaymentInput = z.infer<typeof decideTeacherCashPaymentSchema>;

export const setTeacherCashPaymentPolicySchema = z.object({
  allowTeacherCashPayments: z.boolean(),
});
export type SetTeacherCashPaymentPolicyInput = z.infer<typeof setTeacherCashPaymentPolicySchema>;
