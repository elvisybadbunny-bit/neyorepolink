/**
 * U.1 — NEYO Ops as a Real Company Cost/Ops Cockpit.
 *
 * Real, company-level (live provider integrations, honestly gated) and
 * real, school-level (SMS spend budget alert, school-chosen threshold).
 */
import { z } from "zod";

// --- School-level: real, school-CHOSEN SMS spend budget alert -------------
// Founder's own explicit instruction: "a school can choose what they want,
// not a threshold [we impose] — they're going to pay for their SMS costs."
// NULL/undefined threshold = the feature is off (never nags a school that
// never asked for it).
export const setSmsSpendAlertSchema = z.object({
  thresholdKes: z.coerce.number().int().min(0).max(10_000_000).nullable(),
});
export type SetSmsSpendAlertInput = z.infer<typeof setSmsSpendAlertSchema>;

// --- Company-level: real live provider cost cockpit ------------------------
// Real, honest gating — same pattern as M.5/U.3's Ask Bundi seams. Every
// figure either comes from a real live provider API call, or is reported as
// a clear, real NOT_CONFIGURED state — never fabricated or estimated in its
// place.
export const COST_COCKPIT_PROVIDERS = ["VERCEL", "CLOUDFLARE_R2", "AFRICAS_TALKING"] as const;
export type CostCockpitProvider = (typeof COST_COCKPIT_PROVIDERS)[number];
