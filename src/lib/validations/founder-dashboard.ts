/**
 * U.3 — Founder Morning Dashboard + "Ask Bundi" (Founder AI) + Product
 * Analytics + Compliance. Real, company-level (NEYO the company, not any
 * school tenant), Founder/NEYO_OPS visible.
 */
import { z } from "zod";

// --- U.3: "Ask Bundi" (Founder AI) — internal only, honestly gated -------
// Same honest pattern as M.5 Bundi Import: real question/context pipeline
// built now; the actual provider call is a real "NOT_CONFIGURED" seam until
// a real key exists in the company secret vault. Never fabricates an answer.
export const FOUNDER_AI_PROVIDER_SETTING_KEY = "neyo_founder_ai_provider_config";

export const founderAiProviderConfigSchema = z.object({
  enabled: z.boolean().default(false), // master switch — OFF until a real provider key exists
  provider: z.enum(["NONE", "OPENAI", "ANTHROPIC", "GOOGLE"]).default("NONE"),
  model: z.string().trim().max(60).default(""),
  usdToKes: z.coerce.number().min(50).max(500).default(130),
  notes: z
    .string()
    .trim()
    .max(400)
    .optional()
    .default(
      "Provider must be configured with a real company secret before Ask Bundi can answer. Never fake an answer — the real company-data context is always shown honestly either way."
    ),
});
export type FounderAiProviderConfig = z.infer<typeof founderAiProviderConfigSchema>;
export function defaultFounderAiProviderConfig(): FounderAiProviderConfig {
  return founderAiProviderConfigSchema.parse({});
}

export const askFounderAiSchema = z.object({
  question: z.string().trim().min(3, "Ask a real question (at least 3 characters).").max(500),
});
export type AskFounderAiInput = z.infer<typeof askFounderAiSchema>;

// --- U.3: Compliance queue -------------------------------------------------
export const COMPLIANCE_REQUEST_KINDS = ["EXPORT_DATA", "DELETE_ACCOUNT"] as const;
export type ComplianceRequestKind = (typeof COMPLIANCE_REQUEST_KINDS)[number];

export const COMPLIANCE_REQUEST_STATUSES = ["PENDING", "ACKNOWLEDGED", "COMPLETED", "DECLINED"] as const;
export type ComplianceRequestStatus = (typeof COMPLIANCE_REQUEST_STATUSES)[number];

export const createComplianceRequestSchema = z.object({
  kind: z.enum(COMPLIANCE_REQUEST_KINDS),
  note: z.string().trim().max(1000).optional().or(z.literal("")),
});
export type CreateComplianceRequestInput = z.infer<typeof createComplianceRequestSchema>;

export const resolveComplianceRequestSchema = z.object({
  id: z.string().trim().min(1),
  status: z.enum(["ACKNOWLEDGED", "COMPLETED", "DECLINED"]),
  resolutionNote: z.string().trim().max(1000).optional().or(z.literal("")),
});
export type ResolveComplianceRequestInput = z.infer<typeof resolveComplianceRequestSchema>;
