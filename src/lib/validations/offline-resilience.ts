/**
 * Z.1 — Real Offline-First Resilience for internet shutdowns.
 *
 * Founder's own request: "deep analysis... to see the things that can be
 * offline so that to help in situations where there is internet shutdown...
 * check saver thing on the cache and make sure they link to the actions and
 * activities." This is the validation layer for the 2 real, distinct halves
 * built this session: (1) extending the real offline WRITE queue (G.2's
 * proven pattern) to Gate Pass / Visitor sign-in / Cash payments / Exam
 * marks; (2) wiring the existing I.84 Bundle Saver READ cache into the real
 * pages that should fall back to it, plus auto-enabling it by default
 * (founder's own choice this session).
 */
import { z } from "zod";

// A real client-generated idempotency key (UUID v4 shape) — same real value
// `queue.ts` already sends today; now actually validated + consumed server-
// side for actions that mint a real new sequential number on create (Gate
// Pass passNo, Visitor badgeNo) and are therefore NOT naturally safe to
// blindly retry the way Attendance/Exam-marks upserts already are.
export const idempotencyKeySchema = z
  .string()
  .trim()
  .min(8, "A real idempotency key is required for this offline-safe action.")
  .max(100);

export const setBundleSaverEnabledSchema = z.object({
  enabled: z.boolean(),
});
export type SetBundleSaverEnabledInput = z.infer<typeof setBundleSaverEnabledSchema>;
