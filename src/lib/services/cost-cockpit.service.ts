/**
 * U.1 — NEYO Ops as a Real Company Cost/Ops Cockpit.
 *
 * Real, school-level (SMS spend budget alert, school-chosen threshold) and
 * real, company-level (live Vercel/Cloudflare R2/Africa's Talking provider
 * checks, honestly gated, never fabricated).
 */
import { db } from "@/lib/db";
import type { SessionUser } from "@/lib/core/session";
import { effectivePermissionsForUser } from "@/lib/core/session";
import { assertMetricsAccess } from "@/lib/services/founder-dashboard.service";
import { readCompanySecret } from "@/lib/services/company-secret.service";
import { notify } from "@/lib/services/notification.service";
import { currentPeriodKey } from "@/lib/services/limits.service";
import type { CostCockpitProvider } from "@/lib/validations/cost-cockpit";

export class CostCockpitError extends Error {
  code: "NOT_FOUND" | "FORBIDDEN" | "INVALID";
  constructor(code: "NOT_FOUND" | "FORBIDDEN" | "INVALID", message: string) {
    super(message);
    this.code = code;
    this.name = "CostCockpitError";
  }
}

/** Jan-Apr / May-Aug / Sep-Dec real Kenyan school-term boundaries, matching
 * `currentPeriodKey()`'s own T1/T2/T3 shape. */
function currentTermStart(now = new Date()): Date {
  const m = now.getMonth(); // 0-11
  const year = now.getFullYear();
  if (m < 4) return new Date(year, 0, 1); // T1: Jan
  if (m < 8) return new Date(year, 4, 1); // T2: May
  return new Date(year, 8, 1); // T3: Sep
}

// --- School-level: real, school-CHOSEN SMS spend budget alert -------------

export async function getSmsSpendAlertStatus(user: SessionUser) {
  const tenant = await db.tenant.findUniqueOrThrow({
    where: { id: user.tenantId },
    select: { smsSpendAlertThresholdKes: true, smsSpendAlertLastNotifiedPeriodKey: true },
  });

  const periodKey = currentPeriodKey();
  const termStart = currentTermStart();

  const ledgers = await db.smsMarginLedger.findMany({
    where: { tenantId: user.tenantId, createdAt: { gte: termStart } },
    select: { messageCount: true, pricePerSmsKes: true },
  });
  const spentKes = ledgers.reduce((sum, l) => sum + l.messageCount * l.pricePerSmsKes, 0);

  return {
    thresholdKes: tenant.smsSpendAlertThresholdKes,
    periodKey,
    spentKes,
    lastNotifiedPeriodKey: tenant.smsSpendAlertLastNotifiedPeriodKey,
  };
}

export async function setSmsSpendAlertThreshold(user: SessionUser, thresholdKes: number | null) {
  const effective = await effectivePermissionsForUser(user);
  if (!effective.includes("finance.manage_structure")) {
    throw new CostCockpitError("FORBIDDEN", "You do not have permission to set the SMS spend alert threshold.");
  }
  const updated = await db.tenant.update({
    where: { id: user.tenantId },
    data: { smsSpendAlertThresholdKes: thresholdKes },
    select: { smsSpendAlertThresholdKes: true },
  });
  return { thresholdKes: updated.smsSpendAlertThresholdKes };
}

/**
 * Real once-per-term notify guard: checks the real term-to-date SMS spend
 * against the school's own chosen threshold, and sends exactly ONE real
 * notification the first time it's crossed each real term (never repeats
 * within the same term, even if called again).
 */
export async function checkSmsSpendAlert(tenantId: string): Promise<void> {
  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
    select: {
      smsSpendAlertThresholdKes: true,
      smsSpendAlertLastNotifiedPeriodKey: true,
    },
  });
  if (!tenant || tenant.smsSpendAlertThresholdKes == null) return;

  const periodKey = currentPeriodKey();
  if (tenant.smsSpendAlertLastNotifiedPeriodKey === periodKey) return;

  const termStart = currentTermStart();
  const ledgers = await db.smsMarginLedger.findMany({
    where: { tenantId, createdAt: { gte: termStart } },
    select: { messageCount: true, pricePerSmsKes: true },
  });
  const spentKes = ledgers.reduce((sum, l) => sum + l.messageCount * l.pricePerSmsKes, 0);

  if (spentKes < tenant.smsSpendAlertThresholdKes) return;

  const leadership = await db.user.findMany({
    where: { tenantId, role: { in: ["PRINCIPAL", "SCHOOL_OWNER", "BURSAR"] } },
    select: { id: true },
  });

  for (const person of leadership) {
    await notify({
      tenantId,
      recipientId: person.id,
      title: "SMS spend alert",
      body: `This term's SMS spend has reached KES ${Math.round(spentKes).toLocaleString(
        "en-KE"
      )}, at or above your own alert threshold of KES ${tenant.smsSpendAlertThresholdKes.toLocaleString("en-KE")}.`,
      category: "finance",
      channels: ["in_app"],
    });
  }

  await db.tenant.update({
    where: { id: tenantId },
    data: { smsSpendAlertLastNotifiedPeriodKey: periodKey },
  });
}

// --- Company-level: real live provider cost cockpit ------------------------

interface ProviderResult {
  provider: CostCockpitProvider;
  configured: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

async function checkVercel(): Promise<ProviderResult> {
  const token = await readCompanySecret("vercel_api_token");
  if (!token) return { provider: "VERCEL", configured: false, error: "No real Vercel API token stored." };
  try {
    const res = await fetch("https://api.vercel.com/v2/user", { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return { provider: "VERCEL", configured: false, error: `Vercel API returned ${res.status}.` };
    const json = await res.json();
    return { provider: "VERCEL", configured: true, data: { user: json?.user?.username ?? null } };
  } catch (e) {
    return { provider: "VERCEL", configured: false, error: e instanceof Error ? e.message : "Vercel check failed." };
  }
}

async function checkCloudflareR2(): Promise<ProviderResult> {
  const token = await readCompanySecret("cloudflare_r2_api_token");
  const accountId = await readCompanySecret("cloudflare_account_id");
  if (!token || !accountId) {
    return { provider: "CLOUDFLARE_R2", configured: false, error: "No real Cloudflare R2 API token/account ID stored." };
  }
  try {
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return { provider: "CLOUDFLARE_R2", configured: false, error: `Cloudflare API returned ${res.status}.` };
    const json = await res.json();
    return { provider: "CLOUDFLARE_R2", configured: true, data: { buckets: json?.result?.length ?? 0 } };
  } catch (e) {
    return { provider: "CLOUDFLARE_R2", configured: false, error: e instanceof Error ? e.message : "Cloudflare check failed." };
  }
}

async function checkAfricasTalking(): Promise<ProviderResult> {
  const apiKey = await readCompanySecret("africas_talking_api_key");
  const username = await readCompanySecret("africas_talking_username");
  if (!apiKey || !username) {
    return { provider: "AFRICAS_TALKING", configured: false, error: "No real Africa's Talking API key/username stored." };
  }
  try {
    const res = await fetch(
      `https://api.africastalking.com/version1/user?username=${encodeURIComponent(username)}`,
      { headers: { apiKey, Accept: "application/json" } }
    );
    if (!res.ok) return { provider: "AFRICAS_TALKING", configured: false, error: `Africa's Talking API returned ${res.status}.` };
    const json = await res.json();
    return { provider: "AFRICAS_TALKING", configured: true, data: { balance: json?.UserData?.balance ?? null } };
  } catch (e) {
    return {
      provider: "AFRICAS_TALKING",
      configured: false,
      error: e instanceof Error ? e.message : "Africa's Talking check failed.",
    };
  }
}

export async function liveCostCockpit(user: SessionUser) {
  await assertMetricsAccess(user);
  const [vercel, cloudflareR2, africasTalking] = await Promise.all([
    checkVercel(),
    checkCloudflareR2(),
    checkAfricasTalking(),
  ]);
  return { vercel, cloudflareR2, africasTalking, checkedAt: new Date().toISOString() };
}

export async function costTrends(user: SessionUser) {
  await assertMetricsAccess(user);
  const snapshots = await db.neyoCostSnapshot.findMany({ orderBy: { periodStart: "asc" } });
  return { snapshots };
}
