import { db } from "@/lib/db";

/**
 * Idea 1.2 — School Operational Health & Churn Defcon Radar.
 * Computes a 0–100 Defcon health score based on attendance cadence, fee ledger
 * velocity, leadership login frequency, and system friction.
 */

export interface TenantHealthResult {
  tenantId: string;
  tenantName: string;
  healthScore: number; // 0-100
  churnRiskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  attendanceScore: number;
  feeLedgerScore: number;
  leadershipLoginScore: number;
  errorRateScore: number;
  topFrictionReason: string | null;
  calculatedAt: Date;
}

export async function calculateTenantHealthScore(tenantId: string): Promise<TenantHealthResult> {
  const tenant = await db.tenant.findUnique({ where: { id: tenantId }, select: { id: true, name: true } });
  if (!tenant) throw new Error("Tenant not found");

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600_000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 3600_000);

  // 1. Attendance Cadence (0-100)
  const recentAttendanceCount = await db.attendanceRecord.count({
    where: { tenantId, date: { gte: sevenDaysAgo.toISOString().slice(0, 10) } },
  });
  const activeStudentCount = await db.student.count({ where: { tenantId, status: "ACTIVE" } });
  let attendanceScore = 100;
  if (activeStudentCount > 0) {
    // Expected at least activeStudents * 3 records over a week
    const expected = activeStudentCount * 3;
    attendanceScore = Math.min(100, Math.round((recentAttendanceCount / Math.max(1, expected)) * 100));
  }

  // 2. Fee Ledger Velocity (0-100)
  const recentPayments = await db.payment.count({
    where: { tenantId, paidAt: { gte: thirtyDaysAgo } },
  });
  const recentInvoices = await db.invoice.count({
    where: { tenantId, createdAt: { gte: thirtyDaysAgo } },
  });
  let feeLedgerScore = 100;
  if (recentPayments === 0 && recentInvoices === 0 && activeStudentCount > 10) {
    feeLedgerScore = 30;
  } else if (recentPayments < 3 && activeStudentCount > 20) {
    feeLedgerScore = 65;
  }

  // 3. Leadership Login Frequency (0-100)
  const leaders = await db.user.findMany({
    where: {
      tenantId,
      isActive: true,
      OR: [
        { role: { in: ["SCHOOL_OWNER", "PRINCIPAL", "BURSAR"] } },
        { secondaryRole: { in: ["SCHOOL_OWNER", "PRINCIPAL", "BURSAR"] } },
      ],
    },
    select: { id: true, fullName: true, lastLoginAt: true },
  });
  let leadershipLoginScore = 100;
  const recentLeaderLogins = leaders.filter((u) => u.lastLoginAt && u.lastLoginAt >= sevenDaysAgo).length;
  if (leaders.length > 0) {
    leadershipLoginScore = Math.round((recentLeaderLogins / leaders.length) * 100);
    if (leadershipLoginScore === 0) leadershipLoginScore = 20; // some weight for existing setup
  }

  // 4. System Error / Friction Rate (0-100)
  const recentSuspense = await db.mpesaSuspenseReceipt.count({
    where: { tenantId, status: "UNMATCHED", createdAt: { gte: sevenDaysAgo } },
  });
  let errorRateScore = Math.max(20, 100 - recentSuspense * 15);

  // Compute composite Defcon health score (weighted)
  const compositeScore = Math.round(
    attendanceScore * 0.35 +
    leadershipLoginScore * 0.30 +
    feeLedgerScore * 0.25 +
    errorRateScore * 0.10
  );

  let churnRiskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
  let topFrictionReason: string | null = null;

  if (compositeScore < 40) {
    churnRiskLevel = "CRITICAL";
    topFrictionReason = "Critical churn alert: No recent attendance cadence and 0 leadership logins in 7 days.";
  } else if (compositeScore < 60) {
    churnRiskLevel = "HIGH";
    topFrictionReason = attendanceScore < 50 ? "Low attendance marking activity observed." : "Leadership login frequency dropped below 50%.";
  } else if (compositeScore < 80) {
    churnRiskLevel = "MEDIUM";
    topFrictionReason = recentSuspense > 0 ? `${recentSuspense} unmatched M-Pesa payments in suspense inbox.` : "Minor drop in fee ledger velocity.";
  }

  const snapshot = await db.tenantHealthSnapshot.create({
    data: {
      tenantId,
      healthScore: compositeScore,
      churnRiskLevel,
      attendanceScore,
      feeLedgerScore,
      leadershipLoginScore,
      errorRateScore,
      topFrictionReason,
      calculatedAt: now,
    },
  });

  return {
    tenantId,
    tenantName: tenant.name,
    healthScore: snapshot.healthScore,
    churnRiskLevel: snapshot.churnRiskLevel as any,
    attendanceScore: snapshot.attendanceScore,
    feeLedgerScore: snapshot.feeLedgerScore,
    leadershipLoginScore: snapshot.leadershipLoginScore,
    errorRateScore: snapshot.errorRateScore,
    topFrictionReason: snapshot.topFrictionReason,
    calculatedAt: snapshot.calculatedAt,
  };
}

export async function recalculateAllTenantsHealth() {
  const tenants = await db.tenant.findMany({
    where: { isDemo: false },
    select: { id: true },
  });
  const results: TenantHealthResult[] = [];
  for (const t of tenants) {
    const res = await calculateTenantHealthScore(t.id).catch(() => null);
    if (res) results.push(res);
  }
  return results;
}
