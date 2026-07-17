import { db } from "@/lib/db";
import { type SessionUser } from "@/lib/core/session";
import { isFounderTier } from "@/lib/core/roles";

/**
 * Early Access Whitelist & Feature Release Controller (`FeatureReleaseControl`).
 * Allows NEYO Ops to toggle any feature between PAUSED, EARLY_ACCESS_PILOT, and LIVE_MEGA_BUTTON.
 */

export class FeatureReleaseError extends Error {
  constructor(public code: "PAUSED" | "EARLY_ACCESS_ONLY" | "FORBIDDEN", message: string) {
    super(message);
    this.name = "FeatureReleaseError";
  }
}

export async function checkFeatureReleaseAccess(tenantId: string, featureKey: string): Promise<boolean> {
  const row = await db.featureReleaseControl.findUnique({ where: { featureKey } });
  if (!row || row.status === "LIVE") return true; // LIVE or unlisted default

  if (row.status === "PAUSED") {
    throw new FeatureReleaseError(
      "PAUSED",
      `The feature '${row.label}' is currently paused platform-wide while NEYO applies core upgrades. ${row.notes || ""}`
    );
  }

  if (row.status === "EARLY_ACCESS_PILOT") {
    let whitelisted: string[] = [];
    try {
      whitelisted = JSON.parse(row.whitelistedTenantIdsJson || "[]");
    } catch {
      whitelisted = [];
    }

    if (!whitelisted.includes(tenantId)) {
      throw new FeatureReleaseError(
        "EARLY_ACCESS_ONLY",
        `The feature '${row.label}' is currently in Early Access Pilot mode and available only to whitelisted seed schools. Contact NEYO Ops if your institution wants early access.`
      );
    }
  }

  return true;
}

export async function listAllFeatureReleaseControls() {
  return db.featureReleaseControl.findMany({
    orderBy: { featureKey: "asc" },
  });
}

export async function upsertFeatureReleaseControl(
  actor: SessionUser,
  input: {
    featureKey: string;
    label: string;
    status: "PAUSED" | "EARLY_ACCESS_PILOT" | "LIVE";
    whitelistedTenantIds?: string[];
    notes?: string | null;
  }
) {
  if (!isFounderTier(actor.role) && actor.role !== "SUPER_ADMIN" && actor.role !== "NEYO_OPS") {
    throw new FeatureReleaseError("FORBIDDEN", "Only NEYO Ops can manage feature release states.");
  }

  const whitelistedJson = JSON.stringify(input.whitelistedTenantIds || []);

  const row = await db.featureReleaseControl.upsert({
    where: { featureKey: input.featureKey },
    create: {
      featureKey: input.featureKey,
      label: input.label,
      status: input.status,
      whitelistedTenantIdsJson: whitelistedJson,
      notes: input.notes ?? null,
      updatedBy: actor.fullName,
    },
    update: {
      label: input.label,
      status: input.status,
      whitelistedTenantIdsJson: whitelistedJson,
      notes: input.notes ?? null,
      updatedBy: actor.fullName,
    },
  });

  await db.auditLog.create({
    data: {
      tenantId: actor.tenantId,
      actorId: actor.id,
      actorName: actor.fullName,
      action: "platform.feature_release_updated",
      entityType: "FeatureReleaseControl",
      entityId: row.id,
      metadata: JSON.stringify({ featureKey: row.featureKey, status: row.status, whitelistedCount: input.whitelistedTenantIds?.length || 0 }),
    },
  }).catch(() => {});

  return row;
}
