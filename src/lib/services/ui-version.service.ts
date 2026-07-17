import { db } from "@/lib/db";
import type { SessionUser } from "@/lib/core/session";

export const UI_VERSION_SETTING_KEY = "ui_version_default";

export type UiVersion = "v1" | "v2";

export class UiVersionError extends Error {
  constructor(public code: "FORBIDDEN" | "INVALID", message: string) {
    super(message);
    this.name = "UiVersionError";
  }
}

/** Get global platform UI version default ("v1" or "v2"). Default is "v1" if not set. */
export async function getGlobalUiVersion(): Promise<UiVersion> {
  const row = await db.platformSetting.findUnique({
    where: { key: UI_VERSION_SETTING_KEY },
  });
  if (row?.value === "v2") return "v2";
  return "v1";
}

/** Set global platform UI version default ("v1" or "v2"). NEYO Ops (SUPER_ADMIN / FOUNDER) only. */
export async function setGlobalUiVersion(user: SessionUser, version: UiVersion) {
  if (!["SUPER_ADMIN", "FOUNDER"].includes(user.role)) {
    throw new UiVersionError("FORBIDDEN", "Only NEYO Ops can change the global UI version.");
  }
  if (!["v1", "v2"].includes(version)) {
    throw new UiVersionError("INVALID", "Invalid UI version. Must be 'v1' or 'v2'.");
  }

  const row = await db.platformSetting.upsert({
    where: { key: UI_VERSION_SETTING_KEY },
    create: {
      key: UI_VERSION_SETTING_KEY,
      value: version,
      updatedBy: user.fullName,
    },
    update: {
      value: version,
      updatedBy: user.fullName,
    },
  });

  await db.auditLog.create({
    data: {
      tenantId: user.tenantId,
      actorId: user.id,
      actorName: user.fullName,
      action: "platform.ui_version_updated",
      entityType: "platformSetting",
      entityId: row.key,
      metadata: JSON.stringify({ version, updatedBy: user.fullName }),
    },
  });

  return { version, updatedAt: row.updatedAt, updatedBy: row.updatedBy };
}
