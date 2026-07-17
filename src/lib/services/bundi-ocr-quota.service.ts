import { db } from "@/lib/db";
import { type SessionUser } from "@/lib/core/session";
import { isFounderTier } from "@/lib/core/roles";
import {
  bundiOcrConfigSchema,
  defaultBundiOcrConfig,
  type BundiOcrConfig,
} from "@/lib/validations/bundi-ocr-quota";

export const BUNDI_OCR_CONFIG_KEY = "bundi_ocr_config";

export class BundiOcrQuotaError extends Error {
  constructor(public code: "QUOTA_EXHAUSTED" | "FORBIDDEN" | "INVALID", message: string) {
    super(message);
    this.name = "BundiOcrQuotaError";
  }
}

export async function getBundiOcrConfig(): Promise<BundiOcrConfig> {
  const setting = await db.platformSetting.findUnique({ where: { key: BUNDI_OCR_CONFIG_KEY } });
  if (!setting?.value) return defaultBundiOcrConfig();
  try {
    return bundiOcrConfigSchema.parse(JSON.parse(setting.value));
  } catch {
    return defaultBundiOcrConfig();
  }
}

export async function saveBundiOcrConfig(
  input: unknown,
  actor: { id: string; fullName: string; tenantId: string }
): Promise<BundiOcrConfig> {
  const config = bundiOcrConfigSchema.parse(input);
  const setting = await db.platformSetting.upsert({
    where: { key: BUNDI_OCR_CONFIG_KEY },
    create: { key: BUNDI_OCR_CONFIG_KEY, value: JSON.stringify(config), updatedBy: actor.fullName },
    update: { value: JSON.stringify(config), updatedBy: actor.fullName },
  });

  await db.auditLog.create({
    data: {
      tenantId: actor.tenantId,
      actorId: actor.id,
      actorName: actor.fullName,
      action: "platform.bundi_ocr_config_updated",
      entityType: "PlatformSetting",
      entityId: setting.key,
      metadata: JSON.stringify(config),
    },
  }).catch(() => {});

  return config;
}

export function getCurrentOcrPeriodKey(): string {
  const month = new Date().getMonth() + 1;
  const term = Math.ceil(month / 4);
  return `${new Date().getFullYear()}-T${term}`;
}

export async function getBundiOcrQuotaStatus(tenantId: string) {
  const config = await getBundiOcrConfig();
  const periodKey = getCurrentOcrPeriodKey();

  const row = await db.bundiOcrTelemetryAndQuota.findUnique({
    where: { tenantId_periodKey: { tenantId, periodKey } },
  });

  const freeAllowance = config.freeAllowancePerTerm;
  const freeAllowanceUsed = row?.freeAllowanceUsed ?? 0;
  const topUpScansPurchased = row?.topUpScansPurchased ?? 0;
  const topUpScansUsed = row?.topUpScansUsed ?? 0;

  const totalScansAvailable = freeAllowance + topUpScansPurchased;
  const totalScansUsed = freeAllowanceUsed + topUpScansUsed;
  const remainingScans = Math.max(0, totalScansAvailable - totalScansUsed);
  const requiresTopUp = remainingScans <= 0;

  return {
    tenantId,
    periodKey,
    freeAllowance,
    freeAllowanceUsed,
    topUpScansPurchased,
    topUpScansUsed,
    totalScansAvailable,
    totalScansUsed,
    remainingScans,
    canScan: remainingScans > 0,
    requiresTopUp,
    bundles: [
      { key: "SCAN_500", label: "500 Scan Pages", scans: 500, priceKes: config.bundle500PriceKes },
      { key: "SCAN_1500", label: "1,500 Scan Pages", scans: 1500, priceKes: config.bundle1500PriceKes },
      { key: "SCAN_5000", label: "5,000 Scan Pages", scans: 5000, priceKes: config.bundle5000PriceKes },
    ],
  };
}

export async function assertCanScanBundiOcr(tenantId: string, pagesNeeded = 1) {
  const status = await getBundiOcrQuotaStatus(tenantId);
  if (status.remainingScans < pagesNeeded) {
    throw new BundiOcrQuotaError(
      "QUOTA_EXHAUSTED",
      `Your school has utilized all ${status.totalScansAvailable} available Bundi OCR scans for ${status.periodKey}. Please purchase a Scan Top-Up Bundle (` +
        `${status.bundles[0]?.priceKes ? `KES ${status.bundles[0].priceKes} for 500 pages` : "in Billing Settings"}` +
        `) to continue auto-scanning without re-typing.`
    );
  }
  return status;
}

export async function recordBundiOcrScanUsage(
  tenantId: string,
  pages = 1,
  actor?: { id: string; fullName: string }
) {
  const config = await getBundiOcrConfig();
  const periodKey = getCurrentOcrPeriodKey();

  const row = await db.bundiOcrTelemetryAndQuota.findUnique({
    where: { tenantId_periodKey: { tenantId, periodKey } },
  });

  const freeUsed = row?.freeAllowanceUsed ?? 0;
  const topPurchased = row?.topUpScansPurchased ?? 0;
  const topUsed = row?.topUpScansUsed ?? 0;

  let newFreeUsed = freeUsed;
  let newTopUsed = topUsed;

  // Deduct from free quota first, then top-up balance
  const freeRemaining = Math.max(0, config.freeAllowancePerTerm - freeUsed);
  if (freeRemaining >= pages) {
    newFreeUsed += pages;
  } else {
    newFreeUsed = config.freeAllowancePerTerm;
    const overflow = pages - freeRemaining;
    newTopUsed += overflow;
  }

  const updated = await db.bundiOcrTelemetryAndQuota.upsert({
    where: { tenantId_periodKey: { tenantId, periodKey } },
    create: {
      tenantId,
      periodKey,
      freeAllowanceUsed: newFreeUsed,
      topUpScansPurchased: topPurchased,
      topUpScansUsed: newTopUsed,
      totalPagesScanned: pages,
      lastScannedAt: new Date(),
    },
    update: {
      freeAllowanceUsed: newFreeUsed,
      topUpScansUsed: newTopUsed,
      totalPagesScanned: { increment: pages },
      lastScannedAt: new Date(),
    },
  });

  if (actor) {
    await db.auditLog.create({
      data: {
        tenantId,
        actorId: actor.id,
        actorName: actor.fullName,
        action: "academics.bundi_ocr_scan_performed",
        entityType: "BundiOcrTelemetryAndQuota",
        entityId: updated.id,
        metadata: JSON.stringify({ pages, periodKey, remainingScans: Math.max(0, (config.freeAllowancePerTerm + topPurchased) - (newFreeUsed + newTopUsed)) }),
      },
    }).catch(() => {});
  }

  return updated;
}

export async function purchaseScanTopUpBundle(
  tenantId: string,
  bundleKey: "SCAN_500" | "SCAN_1500" | "SCAN_5000",
  actor: SessionUser
) {
  const config = await getBundiOcrConfig();
  const periodKey = getCurrentOcrPeriodKey();

  let scansAdded = 500;
  let priceKes = config.bundle500PriceKes;

  if (bundleKey === "SCAN_1500") {
    scansAdded = 1500;
    priceKes = config.bundle1500PriceKes;
  } else if (bundleKey === "SCAN_5000") {
    scansAdded = 5000;
    priceKes = config.bundle5000PriceKes;
  }

  // Create an invoice item or charge right to the school
  const order = await db.bundiScanTopUpOrder.create({
    data: {
      tenantId,
      periodKey,
      bundleKey,
      scansAdded,
      priceKes,
      status: "PAID",
      purchasedBy: actor.fullName,
    },
  });

  const updated = await db.bundiOcrTelemetryAndQuota.upsert({
    where: { tenantId_periodKey: { tenantId, periodKey } },
    create: {
      tenantId,
      periodKey,
      freeAllowanceUsed: 0,
      topUpScansPurchased: scansAdded,
      topUpScansUsed: 0,
      totalPagesScanned: 0,
    },
    update: {
      topUpScansPurchased: { increment: scansAdded },
    },
  });

  await db.auditLog.create({
    data: {
      tenantId,
      actorId: actor.id,
      actorName: actor.fullName,
      action: "finance.bundi_scan_topup_purchased",
      entityType: "BundiScanTopUpOrder",
      entityId: order.id,
      metadata: JSON.stringify({ bundleKey, scansAdded, priceKes, newTotalScansAvailable: updated.topUpScansPurchased + config.freeAllowancePerTerm }),
    },
  }).catch(() => {});

  return { order, quota: updated };
}
