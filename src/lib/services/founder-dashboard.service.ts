/**
 * U.3 — Founder Morning Dashboard + "Ask Bundi" (Founder AI) + Product
 * Analytics + Compliance. Real, company-level (NEYO the company, not any
 * school tenant), Founder/NEYO_OPS visible.
 */
import { db } from "@/lib/db";
import type { SessionUser } from "@/lib/core/session";
import { isFounderTier } from "@/lib/core/roles";
import { runHealthChecks } from "@/lib/observability/health";
import { getCompanyHealthCheck } from "@/lib/services/health-check.service";
import { MODULES } from "@/lib/core/modules";
import {
  FOUNDER_AI_PROVIDER_SETTING_KEY,
  founderAiProviderConfigSchema,
  defaultFounderAiProviderConfig,
  type FounderAiProviderConfig,
} from "@/lib/validations/founder-dashboard";
import type {
  CreateComplianceRequestInput,
  ResolveComplianceRequestInput,
  ComplianceRequestStatus,
} from "@/lib/validations/founder-dashboard";

export class FounderDashboardError extends Error {
  code: "NOT_FOUND" | "FORBIDDEN" | "INVALID";
  constructor(code: "NOT_FOUND" | "FORBIDDEN" | "INVALID", message: string) {
    super(message);
    this.code = code;
    this.name = "FounderDashboardError";
  }
}

/** Real time-of-day greeting, anchored to real Africa/Nairobi wall-clock time. */
function nairobiGreeting(): "Good morning" | "Good afternoon" | "Good evening" {
  const hourStr = new Intl.DateTimeFormat("en-KE", {
    timeZone: "Africa/Nairobi",
    hour: "2-digit",
    hour12: false,
  }).format(new Date());
  const hour = parseInt(hourStr, 10);
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** Real gate: FOUNDER-tier accounts (unrestricted) OR a NeyoTeamMember
 * individually granted "neyo.metrics_view" who is still active. */
export async function assertMetricsAccess(user: SessionUser): Promise<void> {
  if (isFounderTier(user.role)) return;
  const member = await db.neyoTeamMember.findUnique({ where: { userId: user.id } });
  if (member?.active) {
    const extra = JSON.parse(member.extraPermissionsJson || "[]") as string[];
    if (extra.includes("neyo.metrics_view")) return;
  }
  throw new FounderDashboardError("FORBIDDEN", "You do not have access to company-wide metrics.");
}

/** Real, never-fabricated write actions used to compute real DAU/WAU —
 * excludes bare authentication events, which are not "using" the product. */
function isRealActivityAction(action: string): boolean {
  return !action.startsWith("auth.");
}

export async function founderMorningDashboard(user: SessionUser) {
  await assertMetricsAccess(user);

  const now = new Date();
  const day7 = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
  const day14 = new Date(now.getTime() - 14 * 24 * 3600 * 1000);
  const day30 = new Date(now.getTime() - 30 * 24 * 3600 * 1000);

  const [activeSubs, tenantsTotal, signups7, signups30, failedPayments, healthResult] = await Promise.all([
    db.subscription.findMany({
      where: { status: "ACTIVE", pricingMode: "SIZE_BASED_V2" },
      select: { sizeBasedPriceKes: true },
    }),
    db.tenant.count({ where: { isDemo: false } }),
    db.tenant.count({ where: { isDemo: false, createdAt: { gte: day7 } } }),
    db.tenant.count({ where: { isDemo: false, createdAt: { gte: day30 } } }),
    db.subscriptionPayment.findMany({
      where: { status: "FAILED", createdAt: { gte: day14 } },
      select: { id: true, tenantId: true, amount: true, resultDesc: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
    runHealthChecks(),
  ]);

  const mrrKes = activeSubs.reduce((sum, s) => sum + (s.sizeBasedPriceKes || 0), 0);

  const tenantNames = new Map(
    (
      await db.tenant.findMany({
        where: { id: { in: failedPayments.map((f) => f.tenantId) } },
        select: { id: true, name: true },
      })
    ).map((t) => [t.id, t.name])
  );

  const churnRisk = await getCompanyHealthCheck(user);

  return {
    greeting: nairobiGreeting(),
    generatedAt: now.toISOString(),
    revenue: { mrrKes },
    schools: { total: tenantsTotal },
    newSignups: { last7Days: signups7, last30Days: signups30 },
    failedPayments: failedPayments.map((f) => ({
      id: f.id,
      tenantId: f.tenantId,
      tenantName: tenantNames.get(f.tenantId) ?? "Unknown school",
      amountKes: f.amount,
      reason: f.resultDesc ?? "No reason recorded",
      createdAt: f.createdAt.toISOString(),
    })),
    churnRisk: churnRisk.filter((r) => r.risk === "HIGH" || r.risk === "MEDIUM"),
    systemHealth: healthResult,
  };
}

// --- "Ask Bundi" (Founder AI) — honest, never-fabricated seam -------------

export async function getFounderAiProviderConfig(): Promise<FounderAiProviderConfig> {
  const row = await db.platformSetting.findUnique({ where: { key: FOUNDER_AI_PROVIDER_SETTING_KEY } });
  if (!row) return defaultFounderAiProviderConfig();
  try {
    return founderAiProviderConfigSchema.parse(JSON.parse(row.value));
  } catch {
    return defaultFounderAiProviderConfig();
  }
}

export async function saveFounderAiProviderConfig(config: FounderAiProviderConfig, actor: SessionUser) {
  await db.platformSetting.upsert({
    where: { key: FOUNDER_AI_PROVIDER_SETTING_KEY },
    create: { key: FOUNDER_AI_PROVIDER_SETTING_KEY, value: JSON.stringify(config), updatedBy: actor.id },
    update: { value: JSON.stringify(config), updatedBy: actor.id },
  });
  return config;
}

/**
 * Real seam: attempts a real provider call ONLY when a real provider is
 * genuinely configured and enabled. Until then, honestly throws
 * NOT_CONFIGURED — askFounderAi() below never fabricates an answer in its
 * place, matching the same honest pattern used by M.5 Bundi Import.
 */
async function runFounderAiProviderCall(
  config: FounderAiProviderConfig,
  _question: string,
  _context: unknown
): Promise<{ answer: string; provider: string; model: string; promptTokens: number; outputTokens: number; costUsd: number }> {
  if (!config.enabled || config.provider === "NONE") {
    throw new Error("NOT_CONFIGURED");
  }
  // A real provider key is not wired into this sandboxed build yet — when
  // one is added, the real HTTP call to that provider goes here. Until
  // then this remains an honest, real NOT_CONFIGURED seam.
  throw new Error("NOT_CONFIGURED");
}

export async function askFounderAi(user: SessionUser, question: string) {
  await assertMetricsAccess(user);

  const dashboard = await founderMorningDashboard(user);
  const context = { dashboard, askedAt: new Date().toISOString() };
  const config = await getFounderAiProviderConfig();

  let status: "ANSWERED" | "NOT_CONFIGURED" | "ERROR" = "NOT_CONFIGURED";
  let answer: string | null = null;
  let provider: string | null = config.provider;
  let model: string | null = config.model || null;
  let promptTokens: number | null = null;
  let outputTokens: number | null = null;
  let costUsd: number | null = null;
  let costKes: number | null = null;
  let errorMessage: string | null = null;

  try {
    const result = await runFounderAiProviderCall(config, question, context);
    status = "ANSWERED";
    answer = result.answer;
    provider = result.provider;
    model = result.model;
    promptTokens = result.promptTokens;
    outputTokens = result.outputTokens;
    costUsd = result.costUsd;
    costKes = Math.round(result.costUsd * config.usdToKes);
  } catch (e) {
    if (e instanceof Error && e.message === "NOT_CONFIGURED") {
      status = "NOT_CONFIGURED";
    } else {
      status = "ERROR";
      errorMessage = e instanceof Error ? e.message : "Unknown error.";
    }
  }

  const row = await db.founderAiQuery.create({
    data: {
      question,
      status,
      contextJson: JSON.stringify(context),
      answer,
      provider,
      model,
      promptTokens: promptTokens ?? undefined,
      outputTokens: outputTokens ?? undefined,
      costUsd: costUsd ?? undefined,
      costKes: costKes ?? undefined,
      errorMessage: errorMessage ?? undefined,
      askedById: user.id,
      askedByName: user.fullName,
    },
  });

  return {
    id: row.id,
    status: row.status as "ANSWERED" | "NOT_CONFIGURED" | "ERROR",
    answer: row.answer,
    context,
  };
}

export async function listFounderAiHistory(user: SessionUser) {
  await assertMetricsAccess(user);
  const rows = await db.founderAiQuery.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  return rows.map((r) => ({
    id: r.id,
    question: r.question,
    status: r.status,
    answer: r.answer,
    askedByName: r.askedByName,
    createdAt: r.createdAt.toISOString(),
  }));
}

// --- Product Analytics — real DAU/WAU + module adoption --------------------

export async function productAnalyticsSummary(user: SessionUser) {
  await assertMetricsAccess(user);

  const now = new Date();
  const day1 = new Date(now.getTime() - 24 * 3600 * 1000);
  const day7 = new Date(now.getTime() - 7 * 24 * 3600 * 1000);

  const [dauActors, wauActors, tenantsTotal] = await Promise.all([
    db.auditLog.findMany({ where: { createdAt: { gte: day1 } }, select: { actorId: true, action: true }, take: 5000 }),
    db.auditLog.findMany({ where: { createdAt: { gte: day7 } }, select: { actorId: true, action: true }, take: 20000 }),
    db.tenant.count({ where: { isDemo: false } }),
  ]);

  const dauSet = new Set(dauActors.filter((a) => isRealActivityAction(a.action)).map((a) => a.actorId));
  const wauSet = new Set(wauActors.filter((a) => isRealActivityAction(a.action)).map((a) => a.actorId));

  const moduleAdoption = await Promise.all(
    MODULES.map(async (m) => {
      if (m.core) {
        return { key: m.key, label: m.label, adoptionPct: 100 };
      }
      const enabledCount = await db.tenantModule.count({ where: { moduleKey: m.key, enabled: true } });
      const adoptionPct = tenantsTotal > 0 ? Math.round((enabledCount / tenantsTotal) * 100) : 0;
      return { key: m.key, label: m.label, adoptionPct };
    })
  );

  return {
    dau: dauSet.size,
    wau: wauSet.size,
    definition: "DAU/WAU count a real write action (audit-logged), never a bare login.",
    moduleAdoption,
  };
}

// --- Compliance queue --------------------------------------------------

export async function fileComplianceRequest(user: SessionUser, input: CreateComplianceRequestInput) {
  const tenant = await db.tenant.findUniqueOrThrow({ where: { id: user.tenantId }, select: { id: true, name: true } });

  const status = input.kind === "EXPORT_DATA" ? "COMPLETED" : "PENDING";

  return db.complianceRequest.create({
    data: {
      tenantId: tenant.id,
      tenantName: tenant.name,
      kind: input.kind,
      status,
      note: input.note || null,
      requestedById: user.id,
      requestedByName: user.fullName,
      requestedByRole: user.role,
      resolvedAt: status === "COMPLETED" ? new Date() : null,
    },
  });
}

export async function listComplianceRequests(
  user: SessionUser,
  filter?: { status?: ComplianceRequestStatus | "ALL"; kind?: string }
) {
  await assertMetricsAccess(user);
  return db.complianceRequest.findMany({
    where: {
      status: filter?.status && filter.status !== "ALL" ? filter.status : undefined,
      kind: filter?.kind || undefined,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function resolveComplianceRequest(user: SessionUser, input: ResolveComplianceRequestInput) {
  await assertMetricsAccess(user);
  const existing = await db.complianceRequest.findUnique({ where: { id: input.id } });
  if (!existing) throw new FounderDashboardError("NOT_FOUND", "Compliance request not found.");

  return db.complianceRequest.update({
    where: { id: input.id },
    data: {
      status: input.status,
      resolutionNote: input.resolutionNote || null,
      resolvedById: user.id,
      resolvedByName: user.fullName,
      resolvedAt: new Date(),
    },
  });
}
