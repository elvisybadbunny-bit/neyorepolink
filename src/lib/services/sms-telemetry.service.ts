import { db } from "@/lib/db";

/**
 * Idea 1.5 — SMS Gateway Delivery Route & DND Health Monitor.
 * Tracks delivery ratios, DND rejections, and auto-switches high-DND schools
 * to In-App/WhatsApp channels.
 */

export async function recordSmsDeliveryAttempt(
  tenantId: string,
  status: "DELIVERED" | "REJECTED" | "DND_BLOCKED"
) {
  const periodKey = `2026-T${Math.ceil((new Date().getMonth() + 1) / 4)}`; // e.g. 2026-T3
  const row = await db.tenantSmsTelemetry.findUnique({ where: { tenantId_periodKey: { tenantId, periodKey } } });

  const totalAttempted = (row?.totalAttempted ?? 0) + 1;
  const totalDelivered = (row?.totalDelivered ?? 0) + (status === "DELIVERED" ? 1 : 0);
  const totalRejected = (row?.totalRejected ?? 0) + (status === "REJECTED" ? 1 : 0);
  const totalDndBlocked = (row?.totalDndBlocked ?? 0) + (status === "DND_BLOCKED" ? 1 : 0);
  const dndRatePct = Math.round((totalDndBlocked / Math.max(1, totalAttempted)) * 100);

  return db.tenantSmsTelemetry.upsert({
    where: { tenantId_periodKey: { tenantId, periodKey } },
    create: {
      tenantId,
      periodKey,
      totalAttempted,
      totalDelivered,
      totalRejected,
      totalDndBlocked,
      dndRatePct,
    },
    update: {
      totalAttempted,
      totalDelivered,
      totalRejected,
      totalDndBlocked,
      dndRatePct,
    },
  });
}

export async function getTenantSmsHealth(tenantId: string) {
  const periodKey = `2026-T${Math.ceil((new Date().getMonth() + 1) / 4)}`;
  const row = await db.tenantSmsTelemetry.findUnique({ where: { tenantId_periodKey: { tenantId, periodKey } } });
  if (!row) {
    return { tenantId, periodKey, totalAttempted: 0, totalDelivered: 0, totalRejected: 0, totalDndBlocked: 0, dndRatePct: 0, autoFallbackEnabled: true };
  }
  return row;
}

export async function listAllSmsTelemetry() {
  const periodKey = `2026-T${Math.ceil((new Date().getMonth() + 1) / 4)}`;
  return db.tenantSmsTelemetry.findMany({
    where: { periodKey },
    orderBy: { dndRatePct: "desc" },
    include: { tenant: { select: { id: true, name: true, phone: true } } },
    take: 50,
  });
}

export async function toggleAutoFallback(tenantId: string, enabled: boolean) {
  const periodKey = `2026-T${Math.ceil((new Date().getMonth() + 1) / 4)}`;
  return db.tenantSmsTelemetry.upsert({
    where: { tenantId_periodKey: { tenantId, periodKey } },
    create: { tenantId, periodKey, autoFallbackEnabled: enabled },
    update: { autoFallbackEnabled: enabled },
  });
}
