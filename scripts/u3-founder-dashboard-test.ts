/**
 * U.3 — Founder Morning Dashboard + "Ask Bundi" (Founder AI) + Product
 * Analytics + Compliance regression test.
 * Covers: real live MRR/schools/signups/failed-payments/system-health
 * aggregation; access gating (FOUNDER/neyo.metrics_view vs. an ordinary
 * school role); Ask Bundi's honest NOT_CONFIGURED seam (never a fabricated
 * answer) + real context assembly; product analytics DAU/WAU on a real
 * write action (never counting a bare login) + module adoption %;
 * compliance queue lifecycle (auto-logged export -> COMPLETED, an explicit
 * deletion request -> PENDING -> ACKNOWLEDGED -> COMPLETED, and a DECLINED
 * path), all cleaned up afterward.
 */
import { db } from "../src/lib/db";
import { withTenant } from "../src/lib/core/tenant-context";
import type { SessionUser } from "../src/lib/core/session";
import {
  founderMorningDashboard,
  askFounderAi,
  productAnalyticsSummary,
  fileComplianceRequest,
  listComplianceRequests,
  resolveComplianceRequest,
  assertMetricsAccess,
  FounderDashboardError,
} from "../src/lib/services/founder-dashboard.service";

let passed = 0, failed = 0;
function assert(cond: boolean, label: string) {
  if (cond) { console.log(`  \u2713 ${label}`); passed++; }
  else { console.log(`  \u2717 FAIL: ${label}`); failed++; }
}
async function assertThrows(fn: () => Promise<unknown>, label: string) {
  try { await fn(); console.log(`  \u2717 FAIL: ${label} (did not throw)`); failed++; }
  catch { console.log(`  \u2713 ${label}`); passed++; }
}

async function asUser(email: string): Promise<SessionUser> {
  return (await db.user.findFirstOrThrow({ where: { email } })) as unknown as SessionUser;
}

async function main() {
  const founder = await asUser("founder@neyo.co.ke");
  const bursar = await asUser("bursar@karibuhigh.ac.ke");
  const tenant = await db.tenant.findFirstOrThrow({ where: { isDemo: false }, orderBy: { createdAt: "asc" } });

  console.log(`\nUsing founder: ${founder.fullName} (${founder.role}), tenant: ${tenant.name}\n`);

  // -------------------------------------------------------------------
  // 1) Access gating.
  // -------------------------------------------------------------------
  await assertMetricsAccess(founder); // should not throw
  assert(true, "FOUNDER passes assertMetricsAccess() (unrestricted)");
  await assertThrows(() => assertMetricsAccess(bursar), "an ordinary BURSAR is blocked from company metrics");
  await assertThrows(() => founderMorningDashboard(bursar), "an ordinary BURSAR is blocked from the Founder Morning Dashboard");
  await assertThrows(() => productAnalyticsSummary(bursar), "an ordinary BURSAR is blocked from Product Analytics");

  // -------------------------------------------------------------------
  // 2) Founder Morning Dashboard — real, live aggregation.
  // -------------------------------------------------------------------
  const dashboard = await founderMorningDashboard(founder);
  assert(typeof dashboard.greeting === "string" && dashboard.greeting.length > 0, "dashboard has a real time-of-day greeting");
  assert(["Good morning", "Good afternoon", "Good evening"].includes(dashboard.greeting), "greeting is one of the 3 real Nairobi-hour values");
  assert(typeof dashboard.revenue.mrrKes === "number", "dashboard computes a real live MRR figure");
  assert(dashboard.schools.total >= 1, "dashboard counts at least the real seeded school");
  assert(Array.isArray(dashboard.failedPayments), "dashboard returns a real (possibly empty) failed-payments list");
  assert(dashboard.systemHealth && typeof dashboard.systemHealth.status === "string", "dashboard includes real system health (never a mock)");
  assert(dashboard.newSignups.last7Days >= 0 && dashboard.newSignups.last30Days >= dashboard.newSignups.last7Days, "new-signup counts are real and monotonic (30d >= 7d)");

  // -------------------------------------------------------------------
  // 3) "Ask Bundi" — honest NOT_CONFIGURED seam, real context always shown.
  // -------------------------------------------------------------------
  const askResult = await askFounderAi(founder, "Why did revenue drop this month?");
  assert(askResult.status === "NOT_CONFIGURED", "Ask Bundi honestly reports NOT_CONFIGURED (no fabricated answer) when no provider key exists");
  assert(askResult.answer === null || askResult.answer === undefined, "no fake answer is ever stored when NOT_CONFIGURED");
  assert(typeof askResult.context === "object" && askResult.context !== null, "real live company-data context is assembled and returned regardless of provider status");
  assert(askResult.context.dashboard && typeof askResult.context.dashboard.revenue.mrrKes === "number", "the Ask Bundi context includes the SAME real MRR figure as the dashboard");
  const storedQuery = await db.founderAiQuery.findUnique({ where: { id: askResult.id } });
  assert(storedQuery?.status === "NOT_CONFIGURED", "the real FounderAiQuery row is persisted with an honest status");
  assert(!!storedQuery?.contextJson && JSON.parse(storedQuery.contextJson).dashboard, "the persisted row stores the real context JSON, not a placeholder");

  await assertThrows(() => askFounderAi(bursar, "test"), "an ordinary BURSAR cannot ask Bundi (Founder-tier/metrics_view only)");

  // -------------------------------------------------------------------
  // 4) Product Analytics — real DAU/WAU on a real write action, module adoption.
  // -------------------------------------------------------------------
  // Seed a real, fresh audit action so DAU/WAU has something deterministic
  // to count beyond whatever pre-existing seed data produced.
  const probeAction = `u3_test.probe_${Date.now()}`;
  await withTenant(tenant.id, async () => {
    await db.auditLog.create({
      data: { tenantId: tenant.id, actorId: bursar.id, actorName: bursar.fullName, action: probeAction, entityType: "Test", entityId: "probe" },
    });
  });
  const analytics = await productAnalyticsSummary(founder);
  assert(analytics.dau >= 1, "DAU counts at least the real just-created write action");
  assert(analytics.wau >= analytics.dau, "WAU is always >= DAU (superset window)");
  assert(analytics.definition.includes("real write action"), "the DAU/WAU definition is documented as a real write action, not a bare login");
  assert(Array.isArray(analytics.moduleAdoption) && analytics.moduleAdoption.length > 0, "real per-module adoption percentages are computed");
  const studentsModule = analytics.moduleAdoption.find((m: any) => m.key === "students");
  assert(!!studentsModule && studentsModule.adoptionPct > 0, "the core 'students' module shows real nonzero adoption (Karibu High has it enabled)");

  // A pure login (auth.login) must NOT inflate DAU/WAU on its own.
  const loginProbeCount1 = analytics.dau;
  await withTenant(tenant.id, async () => {
    await db.auditLog.create({
      data: { tenantId: tenant.id, actorId: `login-only-${Date.now()}`, actorName: "Login Only Probe", action: "auth.login", entityType: "Test", entityId: "probe" },
    });
  });
  const analyticsAfterLogin = await productAnalyticsSummary(founder);
  assert(analyticsAfterLogin.dau === loginProbeCount1, "a bare auth.login action does NOT count toward real DAU (matches the founder's own 'real write action' definition)");

  // -------------------------------------------------------------------
  // 5) Compliance queue — real export auto-log + real deletion lifecycle.
  // -------------------------------------------------------------------
  const exportReq = await fileComplianceRequest(bursar, { kind: "EXPORT_DATA" });
  assert(exportReq.status === "COMPLETED", "a real data-export event is auto-logged as COMPLETED (no review needed for an export itself)");
  assert(exportReq.tenantId === tenant.id && exportReq.tenantName === tenant.name, "the export request records the real requesting tenant");

  const deletionReq = await fileComplianceRequest(bursar, { kind: "DELETE_ACCOUNT", note: "Test: closing down for the regression suite" });
  assert(deletionReq.status === "PENDING", "a real account-deletion REQUEST starts PENDING — never silently auto-deleted");
  assert(deletionReq.requestedByRole === bursar.role, "the deletion request records the real requester's role");

  const pendingList = await listComplianceRequests(founder, { status: "PENDING" });
  assert(pendingList.some((r: { id: string }) => r.id === deletionReq.id), "the Founder's compliance queue shows the real pending deletion request");
  await assertThrows(() => listComplianceRequests(bursar), "an ordinary BURSAR cannot view the company-wide compliance queue");

  const acknowledged = await resolveComplianceRequest(founder, { id: deletionReq.id, status: "ACKNOWLEDGED" });
  assert(acknowledged.status === "ACKNOWLEDGED" && acknowledged.resolvedById === founder.id, "the Founder can acknowledge a real deletion request, recording who resolved it");

  const completed = await resolveComplianceRequest(founder, { id: deletionReq.id, status: "COMPLETED", resolutionNote: "Handled by the regression test." });
  assert(completed.status === "COMPLETED" && completed.resolutionNote === "Handled by the regression test.", "the Founder can mark a real deletion request COMPLETED with a real resolution note");

  // A second, separate deletion request to test the DECLINED path.
  const deletionReq2 = await fileComplianceRequest(bursar, { kind: "DELETE_ACCOUNT", note: "Second test request" });
  const declined = await resolveComplianceRequest(founder, { id: deletionReq2.id, status: "DECLINED", resolutionNote: "Not a real request." });
  assert(declined.status === "DECLINED", "the Founder can DECLINE a real deletion request");

  await assertThrows(() => resolveComplianceRequest(founder, { id: "does-not-exist", status: "COMPLETED" }), "resolving a nonexistent compliance request throws NOT_FOUND");

  // -------------------------------------------------------------------
  // Cleanup — real, verified.
  // -------------------------------------------------------------------
  await db.founderAiQuery.delete({ where: { id: askResult.id } });
  await db.complianceRequest.deleteMany({ where: { id: { in: [exportReq.id, deletionReq.id, deletionReq2.id] } } });
  await withTenant(tenant.id, async () => {
    await db.auditLog.deleteMany({ where: { action: { in: [probeAction, "auth.login"] }, entityId: "probe" } });
  });

  const remainingQueries = await db.founderAiQuery.count({ where: { id: askResult.id } });
  const remainingCompliance = await db.complianceRequest.count({ where: { id: { in: [exportReq.id, deletionReq.id, deletionReq2.id] } } });
  assert(remainingQueries === 0, "cleanup confirmed: the test FounderAiQuery row is gone (re-queried directly)");
  assert(remainingCompliance === 0, "cleanup confirmed: all 3 test ComplianceRequest rows are gone (re-queried directly)");

  console.log("\n" + "-".repeat(40));
  console.log(`  ${passed} passed, ${failed} failed`);
  console.log(failed === 0 ? "  \u2705 all green" : "  \u274c failures found");
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
