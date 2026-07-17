import { db } from "@/lib/db";
import { type SessionUser } from "@/lib/core/session";
import { isFounderTier } from "@/lib/core/roles";

/**
 * Idea 1.4 — Scheduled Maintenance Command Center.
 * Manages upcoming database pool & storage vault upgrades and read-only lock screens.
 */

export class MaintenanceError extends Error {
  constructor(public code: "FORBIDDEN" | "INVALID" | "NOT_FOUND", message: string) {
    super(message);
    this.name = "MaintenanceError";
  }
}

export async function createMaintenanceWindow(
  actor: SessionUser,
  input: {
    title: string;
    description: string;
    scheduledStartAt: Date;
    scheduledEndAt: Date;
    isReadOnlyLock?: boolean;
  }
) {
  if (!isFounderTier(actor.role) && actor.role !== "SUPER_ADMIN" && actor.role !== "NEYO_OPS") {
    throw new MaintenanceError("FORBIDDEN", "Only authorized NEYO Ops can schedule maintenance windows.");
  }
  if (input.scheduledEndAt <= input.scheduledStartAt) {
    throw new MaintenanceError("INVALID", "End time must be after scheduled start time.");
  }

  const row = await db.platformMaintenanceWindow.create({
    data: {
      title: input.title.trim(),
      description: input.description.trim(),
      scheduledStartAt: input.scheduledStartAt,
      scheduledEndAt: input.scheduledEndAt,
      isReadOnlyLock: input.isReadOnlyLock ?? true,
      status: "SCHEDULED",
      createdBy: actor.fullName,
    },
  });

  await db.auditLog.create({
    data: {
      tenantId: actor.tenantId,
      actorId: actor.id,
      actorName: actor.fullName,
      action: "platform.maintenance_window_scheduled",
      entityType: "PlatformMaintenanceWindow",
      entityId: row.id,
      metadata: JSON.stringify({ title: row.title, start: row.scheduledStartAt, end: row.scheduledEndAt }),
    },
  }).catch(() => {});

  return row;
}

export async function getActiveOrUpcomingMaintenanceWindow() {
  const now = new Date();
  const fortyEightHoursFromNow = new Date(now.getTime() + 48 * 3600_000);

  const window = await db.platformMaintenanceWindow.findFirst({
    where: {
      status: { in: ["SCHEDULED", "ACTIVE"] },
      scheduledEndAt: { gt: now },
      scheduledStartAt: { lte: fortyEightHoursFromNow },
    },
    orderBy: { scheduledStartAt: "asc" },
  });

  if (!window) return null;

  const isActiveNow = now >= window.scheduledStartAt && now <= window.scheduledEndAt;
  if (isActiveNow && window.status !== "ACTIVE") {
    await db.platformMaintenanceWindow.update({ where: { id: window.id }, data: { status: "ACTIVE" } }).catch(() => {});
  }

  return { ...window, isActiveNow };
}

export async function listAllMaintenanceWindows() {
  return db.platformMaintenanceWindow.findMany({
    orderBy: { scheduledStartAt: "desc" },
    take: 20,
  });
}

export async function updateMaintenanceStatus(id: string, status: "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED", actor: SessionUser) {
  if (!isFounderTier(actor.role) && actor.role !== "SUPER_ADMIN" && actor.role !== "NEYO_OPS") {
    throw new MaintenanceError("FORBIDDEN", "Unauthorized");
  }
  return db.platformMaintenanceWindow.update({
    where: { id },
    data: { status },
  });
}
