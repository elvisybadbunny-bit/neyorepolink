/**
 * U.2 — A Genuine Unit-Economics Dashboard (Revenue/Cost/Margin per School,
 * per Student, per SMS, CAC, LTV, MRR).
 *
 * Real, company-level (NEYO the company, not any school tenant). Sequenced
 * per the checklist's own recommendation: manual monthly infra-cost +
 * marketing-spend entry FIRST (same honest pattern as the pre-existing
 * `NeyoMetricSnapshot`), real per-school SMS margin/subscription price
 * simply surfaced (never re-derived), CAC/LTV computed from real signup and
 * real cancelled-subscription data.
 */
import { z } from "zod";

const isoDate = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a YYYY-MM-DD date.");

export const neyoCostSnapshotSchema = z.object({
  periodKey: z.string().trim().min(1, "Period key is required (e.g. 2026-07)."),
  periodStart: isoDate,
  periodEnd: isoDate,
  infraCostKes: z.coerce.number().int().min(0).default(0),
  marketingSpendKes: z.coerce.number().int().min(0).default(0),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});
export type NeyoCostSnapshotInput = z.infer<typeof neyoCostSnapshotSchema>;
