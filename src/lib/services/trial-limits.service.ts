import { z } from "zod";
import { db } from "@/lib/db";
import { type SessionUser } from "@/lib/core/session";
import { isFounderTier } from "@/lib/core/roles";

/**
 * Requirement 3 — 1-Month Free Trial with NEYO Ops Live-Editable Usage Limits.
 * Allows NEYO Ops to configure hard trial caps (students, staff, SMS, storage)
 * so schools can test safely without exhaustive/abusive consumption before paying.
 */

export const TRIAL_LIMITS_SETTING_KEY = "trial_limits_config";

export const trialLimitsConfigSchema = z.object({
  students: z.coerce.number().int().min(1).default(50),
  staff: z.coerce.number().int().min(1).default(15),
  smsPerTerm: z.coerce.number().int().min(0).default(0),
  storageGb: z.coerce.number().min(0.1).default(1.0),
});

export type TrialLimitsConfig = z.infer<typeof trialLimitsConfigSchema>;

export function defaultTrialLimitsConfig(): TrialLimitsConfig {
  return {
    students: 50,
    staff: 15,
    smsPerTerm: 0,
    storageGb: 1.0,
  };
}

export async function getTrialLimitsConfig(): Promise<TrialLimitsConfig> {
  const setting = await db.platformSetting.findUnique({ where: { key: TRIAL_LIMITS_SETTING_KEY } });
  if (!setting?.value) return defaultTrialLimitsConfig();
  try {
    return trialLimitsConfigSchema.parse(JSON.parse(setting.value));
  } catch {
    return defaultTrialLimitsConfig();
  }
}

export async function saveTrialLimitsConfig(
  input: unknown,
  actor: { id: string; fullName: string; tenantId: string; role?: string }
): Promise<TrialLimitsConfig> {
  if (!isFounderTier(actor.role as any) && actor.role !== "SUPER_ADMIN" && actor.role !== "NEYO_OPS") {
    throw new Error("Only NEYO Ops can manage trial limits configuration.");
  }
  const config = trialLimitsConfigSchema.parse(input);
  const setting = await db.platformSetting.upsert({
    where: { key: TRIAL_LIMITS_SETTING_KEY },
    create: { key: TRIAL_LIMITS_SETTING_KEY, value: JSON.stringify(config), updatedBy: actor.fullName },
    update: { value: JSON.stringify(config), updatedBy: actor.fullName },
  });

  await db.auditLog.create({
    data: {
      tenantId: actor.tenantId,
      actorId: actor.id,
      actorName: actor.fullName,
      action: "platform.trial_limits_config_updated",
      entityType: "PlatformSetting",
      entityId: setting.key,
      metadata: JSON.stringify(config),
    },
  }).catch(() => {});

  return config;
}
