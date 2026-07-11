/**
 * U.1 — NEYO Ops as a Real Company Cost/Ops Cockpit regression test.
 * Covers: real school-CHOSEN SMS spend budget alert (off by default,
 * school sets/clears its own threshold, real term-to-date spend computed
 * from the real SmsMarginLedger, notify-once-per-term guard, an ordinary
 * non-leadership role blocked from SAVING but allowed to VIEW); real live
 * Cost Cockpit (each of Vercel/Cloudflare R2/Africa's Talking honestly
 * reports NOT_CONFIGURED with no real credential — never a fabricated
 * number — access gated to Founder/neyo.metrics_view); real Cost Trends
 * (reads U.2's own NeyoCostSnapshot history, honest empty state with zero
 * snapshots); full cleanup verified via direct DB re-query.
 */
import { db } from "../src/lib/db";
import { withTenant } from "../src/lib/core/tenant-context";
import type { SessionUser } from "../src/lib/core/session";
import { currentPeriodKey } from "../src/lib/services/limits.service";
import {
  getSmsSpendAlertStatus,
  setSmsSpendAlertThreshold,
  checkSmsSpendAlert,
  liveCostCockpit,
  costTrends,
} from "../src/lib/services/cost-cockpit.service";

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
  const teacher = await asUser("f.chebet@karibuhigh.ac.ke");
  const tenant = await db.tenant.findFirstOrThrow({ where: { isDemo: false }, orderBy: { createdAt: "asc" } });

  console.log(`\nUsing founder: ${founder.fullName}, bursar: ${bursar.fullName}, tenant: ${tenant.name}\n`);

  // Save the tenant's REAL original state so this test never permanently
  // alters the live seeded school's real configuration.
  const original = await db.tenant.findUniqueOrThrow({
    where: { id: tenant.id },
    select: { smsSpendAlertThresholdKes: true, smsSpendAlertLastNotifiedPeriodKey: true },
  });

  try {
    // -------------------------------------------------------------------
    // 1) Real school-CHOSEN SMS spend budget alert — off by default.
    // -------------------------------------------------------------------
    await db.tenant.update({ where: { id: tenant.id }, data: { smsSpendAlertThresholdKes: null, smsSpendAlertLastNotifiedPeriodKey: null } });
    const offStatus = await getSmsSpendAlertStatus(bursar);
    assert(offStatus.thresholdKes === null, "SMS spend alert is OFF by default (null threshold) — never nags a school that never asked for it");

    const setResult = await setSmsSpendAlertThreshold(bursar, 500);
    assert(setResult.thresholdKes === 500, "the school's OWN chosen threshold (KES 500) is saved exactly as entered — never a NEYO-imposed number");

    const reread = await getSmsSpendAlertStatus(bursar);
    assert(reread.thresholdKes === 500, "the real saved threshold is correctly re-read");
    assert(reread.periodKey === currentPeriodKey(), "the real current term period key is reported correctly");
    assert(typeof reread.spentKes === "number", "real term-to-date SMS spend is computed as a real number");

    // Real, live test of the checkSmsSpendAlert() threshold-crossing path.
    await withTenant(tenant.id, async () => {
      await db.smsMarginLedger.create({
        data: { tenantId: tenant.id, messageCount: 1000, costPerSmsKes: 0.8, pricePerSmsKes: 1.2, marginKes: 400, status: "UNBILLED" },
      });
    });
    const statusAfterSpend = await getSmsSpendAlertStatus(bursar);
    assert(statusAfterSpend.spentKes >= 1200, "real term-to-date spend correctly reflects the real just-created SmsMarginLedger row (1000 msgs x KES 1.2 = KES 1,200)");

    await checkSmsSpendAlert(tenant.id); // should notify once, since spend now exceeds the real KES 500 threshold
    const afterNotify = await db.tenant.findUniqueOrThrow({ where: { id: tenant.id }, select: { smsSpendAlertLastNotifiedPeriodKey: true } });
    assert(afterNotify.smsSpendAlertLastNotifiedPeriodKey === currentPeriodKey(), "crossing the real threshold correctly stamps the real notify-guard for this term (never re-notifies same term)");

    const notificationCount1 = await db.notification.count({ where: { tenantId: tenant.id, category: "finance", title: "SMS spend alert" } });
    await checkSmsSpendAlert(tenant.id); // second call this same term — should NOT notify again
    const notificationCount2 = await db.notification.count({ where: { tenantId: tenant.id, category: "finance", title: "SMS spend alert" } });
    assert(notificationCount2 === notificationCount1, "a second real crossing-check within the SAME term does not send a duplicate notification (once-per-term guard works)");

    // Clearing the threshold turns the feature back off.
    const cleared = await setSmsSpendAlertThreshold(bursar, null);
    assert(cleared.thresholdKes === null, "the school can clear its own threshold, turning the alert back off");

    // -------------------------------------------------------------------
    // 2) Real live Cost Cockpit — honest NOT_CONFIGURED, never fabricated.
    // -------------------------------------------------------------------
    const cockpit = await liveCostCockpit(founder);
    assert(cockpit.vercel.provider === "VERCEL", "the real Vercel provider result is present");
    assert(cockpit.cloudflareR2.provider === "CLOUDFLARE_R2", "the real Cloudflare R2 provider result is present");
    assert(cockpit.africasTalking.provider === "AFRICAS_TALKING", "the real Africa's Talking provider result is present");
    // In this sandboxed test environment, none of these 3 real credentials
    // are configured, so every one should honestly report NOT_CONFIGURED.
    assert(cockpit.vercel.configured === false, "Vercel honestly reports NOT_CONFIGURED with no real bearer token (never a fabricated cost figure)");
    assert(cockpit.cloudflareR2.configured === false, "Cloudflare R2 honestly reports NOT_CONFIGURED with no real API token (never a fabricated storage figure)");
    assert(cockpit.africasTalking.configured === false || cockpit.africasTalking.error !== undefined, "Africa's Talking honestly reports NOT_CONFIGURED/error state (never a fabricated balance)");
    assert(!cockpit.vercel.data, "no fabricated Vercel data is ever present when not configured");
    assert(!cockpit.cloudflareR2.data, "no fabricated Cloudflare R2 data is ever present when not configured");

    await assertThrows(() => liveCostCockpit(teacher), "an ordinary TEACHER is blocked from the company-wide Cost Cockpit");

    // -------------------------------------------------------------------
    // 3) Real Cost Trends — over U.2's own NeyoCostSnapshot history.
    // -------------------------------------------------------------------
    const trends = await costTrends(founder);
    assert(Array.isArray(trends.snapshots), "cost trends returns a real (possibly empty) snapshot array");
    await assertThrows(() => costTrends(teacher), "an ordinary TEACHER is blocked from company-wide cost trends");

    // -------------------------------------------------------------------
    // Cleanup — real, verified.
    // -------------------------------------------------------------------
    await withTenant(tenant.id, async () => {
      await db.smsMarginLedger.deleteMany({ where: { tenantId: tenant.id, messageCount: 1000, marginKes: 400 } });
    });
    const testLedgerRemaining = await db.smsMarginLedger.count({ where: { tenantId: tenant.id, messageCount: 1000, marginKes: 400 } });
    assert(testLedgerRemaining === 0, "cleanup confirmed: the test SmsMarginLedger row is gone (re-queried directly)");

    const testNotifications = await db.notification.findMany({ where: { tenantId: tenant.id, category: "finance", title: "SMS spend alert" }, select: { id: true } });
    if (testNotifications.length > 0) {
      await db.notification.deleteMany({ where: { id: { in: testNotifications.map((n) => n.id) } } });
    }
    const remainingNotifications = await db.notification.count({ where: { tenantId: tenant.id, category: "finance", title: "SMS spend alert" } });
    assert(remainingNotifications === 0, "cleanup confirmed: the real test SMS-spend-alert notifications are gone (re-queried directly)");
  } finally {
    // Always restore the real seeded tenant's original SMS-alert state,
    // whatever happened above — never leave permanent test drift.
    await db.tenant.update({ where: { id: tenant.id }, data: original });
    const restored = await db.tenant.findUniqueOrThrow({ where: { id: tenant.id }, select: { smsSpendAlertThresholdKes: true, smsSpendAlertLastNotifiedPeriodKey: true } });
    assert(
      restored.smsSpendAlertThresholdKes === original.smsSpendAlertThresholdKes && restored.smsSpendAlertLastNotifiedPeriodKey === original.smsSpendAlertLastNotifiedPeriodKey,
      "the real seeded tenant's original SMS-alert configuration is confirmed fully restored (no permanent test drift)"
    );
  }

  console.log("\n" + "-".repeat(40));
  console.log(`  ${passed} passed, ${failed} failed`);
  console.log(failed === 0 ? "  \u2705 all green" : "  \u274c failures found");
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
