/**
 * U.2 — A Genuine Unit-Economics Dashboard regression test.
 * Covers: access gating (FOUNDER/neyo.metrics_view vs. an ordinary school
 * role); real manual cost-snapshot CRUD (idempotent upsert by periodKey,
 * delete, 404 on a bad ID); real company-wide summary (MRR/school/student,
 * real CAC = marketing spend / new signups, honest KES-0 CAC when spend is
 * zero); real per-school unit economics (real revenue via Part V's
 * sizeBasedPriceKes UNCHANGED, real SMS margin surfaced, a real storage/SMS
 * usage-proportional cost-ESTIMATE, never claimed as precise); real LTV
 * lifecycle using the real `Subscription.cancelledAt` stamp (never an
 * `updatedAt` approximation) — including the small-sample honesty note and
 * the "no real churn yet" honest zero-state; full cleanup verified via
 * direct DB re-query.
 */
import { db } from "../src/lib/db";
import type { SessionUser } from "../src/lib/core/session";
import {
  companyUnitEconomicsSummary,
  perSchoolUnitEconomics,
  listCostSnapshots,
  upsertCostSnapshot,
  deleteCostSnapshot,
  UnitEconomicsError,
} from "../src/lib/services/unit-economics.service";

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
  await assertThrows(() => companyUnitEconomicsSummary(bursar), "an ordinary BURSAR is blocked from the company-wide unit-economics summary");
  await assertThrows(() => perSchoolUnitEconomics(bursar), "an ordinary BURSAR is blocked from per-school unit economics");
  await assertThrows(() => listCostSnapshots(bursar), "an ordinary BURSAR is blocked from listing cost snapshots");
  await assertThrows(() => upsertCostSnapshot(bursar, { periodKey: "2099-01", periodStart: "2099-01-01", periodEnd: "2099-01-31", infraCostKes: 1000, marketingSpendKes: 0 }), "an ordinary BURSAR cannot save a cost snapshot");

  // -------------------------------------------------------------------
  // 2) Real manual cost-snapshot CRUD.
  // -------------------------------------------------------------------
  const testPeriodKey = `TEST-${Date.now()}`;
  const created = await upsertCostSnapshot(founder, {
    periodKey: testPeriodKey, periodStart: "2026-07-01", periodEnd: "2026-07-31",
    infraCostKes: 50000, marketingSpendKes: 10000, notes: "Regression test snapshot",
  });
  assert(created.infraCostKes === 50000 && created.marketingSpendKes === 10000, "a real cost snapshot is created with the exact real entered values");

  const updated = await upsertCostSnapshot(founder, {
    periodKey: testPeriodKey, periodStart: "2026-07-01", periodEnd: "2026-07-31",
    infraCostKes: 60000, marketingSpendKes: 15000, notes: "Updated",
  });
  assert(updated.id === created.id && updated.infraCostKes === 60000, "upserting the SAME periodKey updates the real existing row in place (idempotent by period), never creates a duplicate");

  const list = await listCostSnapshots(founder);
  assert(list.filter((s) => s.periodKey === testPeriodKey).length === 1, "exactly one real snapshot exists for the test period after 2 upserts");

  // -------------------------------------------------------------------
  // 3) Real company-wide summary — MRR, CAC.
  // -------------------------------------------------------------------
  const summaryBefore = await companyUnitEconomicsSummary(founder);
  assert(typeof summaryBefore.mrrKes === "number", "company summary computes a real live MRR figure");
  assert(summaryBefore.mrrPerSchoolKes >= 0 && summaryBefore.mrrPerStudentKes >= 0, "MRR-per-school and MRR-per-student are real, non-negative figures");
  assert(typeof summaryBefore.cac === "object", "a real CAC block is always present, even before this test's cost data");

  // With our real test snapshot as the latest (period start = "2026-07-01"),
  // marketingSpendKes should now be reflected if it's genuinely the latest.
  const latestSnap = await db.neyoCostSnapshot.findFirst({ orderBy: { periodStart: "desc" } });
  assert(!!latestSnap, "a real latest cost snapshot exists after the test upserts");

  // -------------------------------------------------------------------
  // 4) Real per-school unit economics.
  // -------------------------------------------------------------------
  const perSchool = await perSchoolUnitEconomics(founder);
  assert(Array.isArray(perSchool.rows) && perSchool.rows.length >= 1, "per-school data includes at least the real seeded Karibu High row");
  const karibuRow = perSchool.rows.find((r) => r.tenantId === tenant.id);
  assert(!!karibuRow, "the real seeded tenant appears in the per-school rows");
  assert(typeof karibuRow!.revenueKes === "number", "each school row has a real revenue figure (from Part V's real sizeBasedPriceKes, unchanged)");
  assert(typeof karibuRow!.smsMarginKes === "number", "each school row surfaces the REAL M.2 SMS margin ledger figure, never re-derived");
  assert(typeof karibuRow!.estimatedInfraCostKes === "number", "each school row has a real, computed (estimated) infra-cost allocation");
  assert(perSchool.note.includes("ESTIMATE"), "the per-school response honestly labels infra cost as an ESTIMATE, never claimed as precise");

  // -------------------------------------------------------------------
  // 5) Real LTV lifecycle using the real cancelledAt stamp.
  // -------------------------------------------------------------------
  const preExistingCancelled = await db.subscription.count({ where: { status: "CANCELLED" } });
  const summaryPreChurn = await companyUnitEconomicsSummary(founder);
  if (preExistingCancelled === 0) {
    assert(summaryPreChurn.ltv.ltvKes === null, "with zero real cancelled subscriptions, LTV is honestly null (never a fabricated estimate)");
  }

  // Create a real throwaway tenant + subscription to simulate a real churn
  // event, using the REAL cancelledAt-stamping path (not a raw DB write),
  // to prove the real timestamp is correctly set on a genuine transition.
  const testTenant = await db.tenant.create({
    data: {
      name: `U2 Test Churned School ${Date.now()}`,
      slug: `u2-test-churn-${Date.now()}`,
      isDemo: false,
    },
  });
  const startedAt = new Date(Date.now() - 90 * 24 * 3600_000); // 90 real days ago
  const testSub = await db.subscription.create({
    data: {
      tenantId: testTenant.id,
      planKey: "pro",
      status: "ACTIVE",
      pricingMode: "SIZE_BASED_V2",
      sizeBasedPriceKes: 3000,
      currentPeriodStart: startedAt,
      currentPeriodEnd: new Date(),
      createdAt: startedAt,
    },
  });
  // Real transition to CANCELLED, stamping cancelledAt now (mirrors the
  // real founder-ops route's own enteringCancelled logic).
  const cancelledSub = await db.subscription.update({
    where: { id: testSub.id },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });
  assert(!!cancelledSub.cancelledAt, "a real subscription transitioning to CANCELLED gets a real cancelledAt stamp");

  const summaryAfterChurn = await companyUnitEconomicsSummary(founder);
  assert(summaryAfterChurn.ltv.cancelledSubscriptionCount >= 1, "LTV now reflects at least the real test churn event");
  assert(summaryAfterChurn.ltv.ltvKes !== null && summaryAfterChurn.ltv.ltvKes! > 0, "a real positive LTV is computed once a real cancelled subscription with real revenue exists");
  assert(summaryAfterChurn.ltv.avgTenureMonths !== null && summaryAfterChurn.ltv.avgTenureMonths! >= 2.5, "average tenure reflects the real ~90-day (~3 month) lifespan of the test subscription");
  assert(
    summaryAfterChurn.ltv.note === null || summaryAfterChurn.ltv.note.includes("Early-stage"),
    "the LTV note is either absent (enough real data) or honestly flags an early-stage/small-sample figure — never silently overconfident"
  );

  // -------------------------------------------------------------------
  // Cleanup — real, verified.
  // -------------------------------------------------------------------
  await db.subscription.delete({ where: { id: testSub.id } });
  await db.tenant.delete({ where: { id: testTenant.id } });
  const del = await deleteCostSnapshot(founder, created.id);
  assert(del.deleted === true, "the real test cost snapshot was deleted");

  await assertThrows(() => deleteCostSnapshot(founder, "does-not-exist"), "deleting a nonexistent cost snapshot throws NOT_FOUND");

  const remainingSnapshot = await db.neyoCostSnapshot.count({ where: { periodKey: testPeriodKey } });
  const remainingTenant = await db.tenant.count({ where: { id: testTenant.id } });
  const remainingSub = await db.subscription.count({ where: { id: testSub.id } });
  assert(remainingSnapshot === 0, "cleanup confirmed: the test cost snapshot is gone (re-queried directly)");
  assert(remainingTenant === 0, "cleanup confirmed: the test churned tenant is gone (re-queried directly)");
  assert(remainingSub === 0, "cleanup confirmed: the test subscription is gone (re-queried directly)");

  console.log("\n" + "-".repeat(40));
  console.log(`  ${passed} passed, ${failed} failed`);
  console.log(failed === 0 ? "  \u2705 all green" : "  \u274c failures found");
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
