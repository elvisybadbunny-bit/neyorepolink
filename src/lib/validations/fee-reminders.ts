/**
 * T.11 — school-configurable fee-reminder cadence + the "never logged in"
 * parent SMS nudge campaign. Zod validation.
 */
import { z } from "zod";

export const setFeeReminderScheduleSchema = z.object({
  feeReminderGraceDays: z.coerce.number().int().min(0).max(90),
  feeReminderDedupeDays: z.coerce.number().int().min(1).max(90),
});
export type SetFeeReminderScheduleInput = z.infer<typeof setFeeReminderScheduleSchema>;

/** T.11b — a real, manually-triggered nudge to parents who have NEVER logged in. */
export const sendNeverLoggedInNudgeSchema = z.object({
  // Optional cap so a bursar/principal can preview/send a smaller batch first.
  limit: z.coerce.number().int().min(1).max(1000).optional(),
});
export type SendNeverLoggedInNudgeInput = z.infer<typeof sendNeverLoggedInNudgeSchema>;
