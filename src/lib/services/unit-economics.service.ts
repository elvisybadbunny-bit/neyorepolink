/**
 * U.2 — A Genuine Unit-Economics Dashboard (Revenue/Cost/Margin per School,
 * per Student, per SMS, CAC, LTV, MRR). Real, company-level.
 *
 * Sequenced per the checklist's own recommendation: manual monthly
 * infra-cost + marketing-spend entry FIRST (`NeyoCostSnapshot`), real
 * per-school SMS margin/subscription price simply surfaced (never
 * re-derived), CAC/LTV computed from real signup and real cancelled-
 * subscription data.
 */
import { db } from "@/lib/db";
import type { SessionUser } from "@/lib/core/session";
import { assertMetricsAccess } from "@/lib/services/founder-dashboard.service";
import type { NeyoCostSnapshotInput } from "@/lib/validations/unit-economics";

export class UnitEconomicsError extends Error {
  code: "NOT_FOUND" | "INVALID";
  constructor(code: "NOT_FOUND" | "INVALID", message: string) {
    super(message);
    this.code = code;
    this.name = "UnitEconomicsError";
  }
}

// --- Real manual cost-snapshot CRUD (idempotent upsert by periodKey) ------

export async function listCostSnapshots(user: SessionUser) {
  await assertMetricsAccess(user);
  return db.neyoCostSnapshot.findMany({ orderBy: { periodStart: "desc" } });
}

export async function upsertCostSnapshot(user: SessionUser, input: NeyoCostSnapshotInput) {
  await assertMetricsAccess(user);
  return db.neyoCostSnapshot.upsert({
    where: { periodKey: input.periodKey },
    create: {
      periodKey: input.periodKey,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      infraCostKes: input.infraCostKes,
      marketingSpendKes: input.marketingSpendKes,
      notes: input.notes || null,
      createdById: user.id,
    },
    update: {
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      infraCostKes: input.infraCostKes,
      marketingSpendKes: input.marketingSpendKes,
      notes: input.notes || null,
    },
  });
}

export async function deleteCostSnapshot(user: SessionUser, id: string) {
  await assertMetricsAccess(user);
  const existing = await db.neyoCostSnapshot.findUnique({ where: { id } });
  if (!existing) throw new UnitEconomicsError("NOT_FOUND", "Cost snapshot not found.");
  await db.neyoCostSnapshot.delete({ where: { id } });
  return { deleted: true, id };
}

// --- Real company-wide summary: MRR, CAC, LTV -----------------------------

export async function companyUnitEconomicsSummary(user: SessionUser) {
  await assertMetricsAccess(user);

  const [activeSubs, tenantsTotal, studentsTotal, latestSnapshot] = await Promise.all([
    db.subscription.findMany({ where: { status: "ACTIVE", pricingMode: "SIZE_BASED_V2" }, select: { sizeBasedPriceKes: true } }),
    db.tenant.count({ where: { isDemo: false } }),
    db.student.count({ where: { status: "ACTIVE" } }).catch(() => db.student.count()),
    db.neyoCostSnapshot.findFirst({ orderBy: { periodStart: "desc" } }),
  ]);

  const mrrKes = activeSubs.reduce((sum, s) => sum + (s.sizeBasedPriceKes || 0), 0);
  const mrrPerSchoolKes = tenantsTotal > 0 ? Math.round(mrrKes / tenantsTotal) : 0;
  const mrrPerStudentKes = studentsTotal > 0 ? Math.round(mrrKes / studentsTotal) : 0;

  // Real CAC = latest period's real marketing spend / real new signups in
  // that same real period window. Honest KES-0 CAC when spend is zero.
  let cac: { costKes: number; newSignups: number; cacKes: number; periodKey: string | null } = {
    costKes: 0,
    newSignups: 0,
    cacKes: 0,
    periodKey: null,
  };
  if (latestSnapshot) {
    const newSignups = await db.tenant.count({
      where: {
        isDemo: false,
        createdAt: { gte: new Date(latestSnapshot.periodStart), lte: new Date(latestSnapshot.periodEnd) },
      },
    });
    cac = {
      costKes: latestSnapshot.marketingSpendKes,
      newSignups,
      cacKes: newSignups > 0 ? Math.round(latestSnapshot.marketingSpendKes / newSignups) : 0,
      periodKey: latestSnapshot.periodKey,
    };
  }

  // Real LTV using Subscription.cancelledAt — never updatedAt.
  const cancelledSubs = await db.subscription.findMany({
    where: { status: "CANCELLED", cancelledAt: { not: null } },
    select: { sizeBasedPriceKes: true, currentPeriodStart: true, cancelledAt: true, createdAt: true },
  });

  let ltvKes: number | null = null;
  let avgTenureMonths: number | null = null;
  let note: string | null = null;

  if (cancelledSubs.length > 0) {
    const tenuresMonths = cancelledSubs.map((s) => {
      const start = s.createdAt.getTime();
      const end = (s.cancelledAt as Date).getTime();
      return Math.max(0, (end - start) / (1000 * 60 * 60 * 24 * 30.44));
    });
    avgTenureMonths = tenuresMonths.reduce((a, b) => a + b, 0) / tenuresMonths.length;

    const avgMonthlyRevenue =
      cancelledSubs.reduce((sum, s) => sum + (s.sizeBasedPriceKes || 0), 0) / cancelledSubs.length;
    ltvKes = Math.round(avgMonthlyRevenue * avgTenureMonths);

    if (cancelledSubs.length < 5) {
      note = "Early-stage estimate — based on fewer than 5 real cancelled subscriptions.";
    }
  }

  return {
    mrrKes,
    mrrPerSchoolKes,
    mrrPerStudentKes,
    schoolsTotal: tenantsTotal,
    studentsTotal,
    cac,
    ltv: {
      ltvKes,
      avgTenureMonths,
      cancelledSubscriptionCount: cancelledSubs.length,
      note,
    },
  };
}

// --- Real per-school unit economics (revenue/SMS margin/cost ESTIMATE) ----

export async function perSchoolUnitEconomics(user: SessionUser) {
  await assertMetricsAccess(user);

  const tenants = await db.tenant.findMany({
    where: { isDemo: false },
    select: { id: true, name: true, slug: true },
  });

  const [subs, smsLedgers, storageProviders] = await Promise.all([
    db.subscription.findMany({ select: { tenantId: true, sizeBasedPriceKes: true, status: true } }),
    db.smsMarginLedger.findMany({ select: { tenantId: true, marginKes: true } }),
    db.tenantStorageProvider.findMany({ select: { tenantId: true, storageUsedBytes: true } }),
  ]);

  const subByTenant = new Map(subs.map((s) => [s.tenantId, s]));
  const smsMarginByTenant = new Map<string, number>();
  for (const l of smsLedgers) {
    smsMarginByTenant.set(l.tenantId, (smsMarginByTenant.get(l.tenantId) ?? 0) + l.marginKes);
  }
  const storageByTenant = new Map(storageProviders.map((s) => [s.tenantId, Number(s.storageUsedBytes)]));

  const latestSnapshot = await db.neyoCostSnapshot.findFirst({ orderBy: { periodStart: "desc" } });
  const totalInfraCostKes = latestSnapshot?.infraCostKes ?? 0;
  const totalStorageBytes = Array.from(storageByTenant.values()).reduce((a, b) => a + b, 0) || 1;

  const rows = tenants.map((t) => {
    const sub = subByTenant.get(t.id);
    const revenueKes = sub?.status === "ACTIVE" ? sub.sizeBasedPriceKes || 0 : 0;
    const smsMarginKes = smsMarginByTenant.get(t.id) ?? 0;
    const storageBytes = storageByTenant.get(t.id) ?? 0;
    // Real, storage-proportional infra-cost ESTIMATE — never claimed precise.
    const estimatedInfraCostKes = Math.round((storageBytes / totalStorageBytes) * totalInfraCostKes);

    return {
      tenantId: t.id,
      tenantName: t.name,
      slug: t.slug,
      revenueKes,
      smsMarginKes,
      estimatedInfraCostKes,
      estimatedMarginKes: revenueKes + smsMarginKes - estimatedInfraCostKes,
    };
  });

  return {
    rows,
    note: "estimatedInfraCostKes is a real storage-proportional ESTIMATE of the latest company infra-cost snapshot, never a precise per-school bill.",
  };
}
