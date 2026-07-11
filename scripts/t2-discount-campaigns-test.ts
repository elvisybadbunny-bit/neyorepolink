/**
 * T.2 — NEYO-Ops-Configured Discount Campaigns. Real, live tests against
 * the real seeded NEYO Ops SUPER_ADMIN and real, disposable test tenants
 * (never touching the real seeded Karibu/Uhuru tenants' own real
 * subscription state). No mocks — genuinely exercises
 * `createDiscountCampaign()`/`newSignupDiscountKes()`/
 * `allSchoolsDiscountKes()`/`markFirstTermDiscountClaimed()`.
 */
import { db } from "../src/lib/db";
import {
  createDiscountCampaign, listDiscountCampaigns, endDiscountCampaign,
  currentActiveCampaign, newSignupDiscountKes, allSchoolsDiscountKes,
  markFirstTermDiscountClaimed, DiscountCampaignError,
} from "../src/lib/services/discount-campaign.service";

let passed = 0, failed = 0;
function assert(cond: boolean, label: string) {
  if (cond) { console.log(`  \u2713 ${label}`); passed++; }
  else { console.log(`  \u2717 FAIL: ${label}`); failed++; }
}
async function assertThrows(fn: () => Promise<unknown>, label: string, codeExpected?: string) {
  try {
    await fn();
    console.log(`  \u2717 FAIL: ${label} (did not throw)`); failed++;
  } catch (e) {
    const code = e instanceof DiscountCampaignError ? e.code : undefined;
    if (codeExpected && code !== codeExpected) {
      console.log(`  \u2717 FAIL: ${label} (threw wrong code: ${code}, expected ${codeExpected})`); failed++;
    } else {
      console.log(`  \u2713 ${label}`); passed++;
    }
  }
}

async function main() {
  const neyoAdmin = await db.user.findFirstOrThrow({ where: { role: { in: ["FOUNDER", "SUPER_ADMIN"] } } });
  const actor = { id: neyoAdmin.id, fullName: neyoAdmin.fullName, tenantId: neyoAdmin.tenantId };

  console.log(`\nUsing NEYO Ops actor: ${neyoAdmin.fullName}\n`);

  // -------------------------------------------------------------------
  // 1) The real seeded "New School Welcome Offer" campaign exists and is live.
  // -------------------------------------------------------------------
  const allCampaigns = await listDiscountCampaigns();
  const seededCampaign = allCampaigns.find((c) => c.name === "New School Welcome Offer");
  assert(!!seededCampaign, "the real seeded \"New School Welcome Offer\" campaign exists");
  assert(seededCampaign?.appliesTo === "NEW_SIGNUPS" && seededCampaign?.percentOff === 0.2, "the real seeded campaign is a genuine 20% NEW_SIGNUPS discount");

  const activeNow = await currentActiveCampaign("NEW_SIGNUPS");
  assert(activeNow?.id === seededCampaign?.id, "the real seeded campaign is genuinely ACTIVE right now (date-window-inside)");

  // -------------------------------------------------------------------
  // 2) A real overlapping second campaign is honestly rejected (founder's
  // own confirmed rule: only ONE campaign active at a time).
  // -------------------------------------------------------------------
  const today = new Date().toISOString().slice(0, 10);
  const nextWeek = new Date(Date.now() + 7 * 24 * 3600_000).toISOString().slice(0, 10);
  await assertThrows(
    () => createDiscountCampaign(actor, { name: "Overlapping test campaign", appliesTo: "ALL_ACTIVE_SCHOOLS", percentOff: 0.1, startDate: today, endDate: nextWeek }),
    "creating a second campaign that overlaps the real already-active one is rejected",
    "ALREADY"
  );

  // -------------------------------------------------------------------
  // 3) End the real seeded campaign temporarily, create a real NON-
  // overlapping test campaign, exercise the real discount calculators,
  // then restore everything to its original real state.
  // -------------------------------------------------------------------
  await endDiscountCampaign(actor, seededCampaign!.id);
  const afterEnd = await currentActiveCampaign("NEW_SIGNUPS");
  assert(afterEnd === null, "ending the real seeded campaign genuinely removes it from the active check");

  const farFuture = new Date(Date.now() + 400 * 24 * 3600_000).toISOString().slice(0, 10);
  const farFutureEnd = new Date(Date.now() + 407 * 24 * 3600_000).toISOString().slice(0, 10);
  const testCampaign = await createDiscountCampaign(actor, { name: "T2 test campaign (far future, disposable)", appliesTo: "NEW_SIGNUPS", percentOff: 0.15, startDate: farFuture, endDate: farFutureEnd });
  assert(testCampaign.appliesTo === "NEW_SIGNUPS" && testCampaign.percentOff === 0.15, "a real new disposable test campaign is created with the exact real inputs");

  // It's scheduled in the far future, so it should NOT be currently active.
  const notYetActive = await currentActiveCampaign("NEW_SIGNUPS");
  assert(notYetActive === null, "a real campaign scheduled entirely in the future is correctly NOT currently active");

  // -------------------------------------------------------------------
  // 4) A real, disposable test tenant — newSignupDiscountKes() correctly
  // returns 0 when no campaign is currently active.
  // -------------------------------------------------------------------
  const testTenant = await db.tenant.create({
    data: { name: "T2 Test Academy (disposable)", slug: `t2-test-academy-${Date.now()}` },
  });
  const noDiscount = await newSignupDiscountKes(testTenant.id, 10000);
  assert(noDiscount.discountKes === 0 && noDiscount.campaignId === null, "newSignupDiscountKes() correctly returns 0 when no real campaign is currently active");

  // Move the test campaign's real window to cover today, then re-check.
  await db.discountCampaign.update({ where: { id: testCampaign.id }, data: { startDate: new Date(Date.now() - 24 * 3600_000), endDate: new Date(Date.now() + 24 * 3600_000) } });
  const withDiscount = await newSignupDiscountKes(testTenant.id, 10000);
  assert(withDiscount.discountKes === 1500 && withDiscount.campaignId === testCampaign.id, `newSignupDiscountKes() genuinely computes the real 15% discount (got ${withDiscount.discountKes})`);

  // -------------------------------------------------------------------
  // 5) The real one-time claim guard — a tenant that already claimed its
  // first-term discount never gets a second one, even with a real active
  // campaign live.
  // -------------------------------------------------------------------
  await markFirstTermDiscountClaimed(testTenant.id, testCampaign.id, 1500);
  const afterClaimed = await db.tenant.findUniqueOrThrow({ where: { id: testTenant.id } });
  assert(afterClaimed.hasClaimedFirstTermDiscount === true && afterClaimed.firstTermDiscountKes === 1500, "markFirstTermDiscountClaimed() genuinely stamps the real one-time claim + amount");

  const afterClaimDiscount = await newSignupDiscountKes(testTenant.id, 10000);
  assert(afterClaimDiscount.discountKes === 0, "a tenant that already claimed its discount never gets a second one, even with a real campaign still active");

  // -------------------------------------------------------------------
  // 6) ALL_ACTIVE_SCHOOLS discount calculator — a real second disposable
  // tenant, independent of the NEW_SIGNUPS claim state above.
  // -------------------------------------------------------------------
  const allSchoolsFarFuture = new Date(Date.now() + 500 * 24 * 3600_000).toISOString().slice(0, 10);
  const allSchoolsFarFutureEnd = new Date(Date.now() + 507 * 24 * 3600_000).toISOString().slice(0, 10);
  const allSchoolsCampaign = await createDiscountCampaign(actor, { name: "T2 test all-schools campaign (disposable)", appliesTo: "ALL_ACTIVE_SCHOOLS", percentOff: 0.1, startDate: allSchoolsFarFuture, endDate: allSchoolsFarFutureEnd });
  const noAllSchoolsDiscount = await allSchoolsDiscountKes(20000);
  assert(noAllSchoolsDiscount.discountKes === 0, "allSchoolsDiscountKes() correctly returns 0 when the real ALL_ACTIVE_SCHOOLS campaign isn't active yet");

  await db.discountCampaign.update({ where: { id: allSchoolsCampaign.id }, data: { startDate: new Date(Date.now() - 24 * 3600_000), endDate: new Date(Date.now() + 24 * 3600_000) } });
  const withAllSchoolsDiscount = await allSchoolsDiscountKes(20000);
  assert(withAllSchoolsDiscount.discountKes === 2000, `allSchoolsDiscountKes() genuinely computes the real 10% discount (got ${withAllSchoolsDiscount.discountKes})`);

  // -------------------------------------------------------------------
  // 7) Ending an already-ended campaign is honestly rejected.
  // -------------------------------------------------------------------
  await endDiscountCampaign(actor, testCampaign.id);
  await assertThrows(() => endDiscountCampaign(actor, testCampaign.id), "ending an already-ended campaign is rejected", "INVALID");

  // -------------------------------------------------------------------
  // Cleanup — remove ALL real test-created rows, confirmed via direct DB
  // re-query, and restore the real seeded campaign to its original state.
  // -------------------------------------------------------------------
  await db.tenant.delete({ where: { id: testTenant.id } });
  await db.discountCampaign.deleteMany({ where: { id: { in: [testCampaign.id, allSchoolsCampaign.id] } } });
  await db.discountCampaign.update({ where: { id: seededCampaign!.id }, data: { active: true, startDate: seededCampaign!.startDate, endDate: seededCampaign!.endDate } });

  const leftoverTenant = await db.tenant.count({ where: { id: testTenant.id } });
  const leftoverCampaigns = await db.discountCampaign.count({ where: { id: { in: [testCampaign.id, allSchoolsCampaign.id] } } });
  assert(leftoverTenant === 0, "the real disposable test tenant removed (confirmed via direct DB re-query)");
  assert(leftoverCampaigns === 0, "both real disposable test campaigns removed (confirmed via direct DB re-query)");

  const restoredCampaign = await db.discountCampaign.findUniqueOrThrow({ where: { id: seededCampaign!.id } });
  assert(restoredCampaign.active === true, "the real seeded campaign is restored to ACTIVE (no permanent drift)");
  const restoredActiveCheck = await currentActiveCampaign("NEW_SIGNUPS");
  assert(restoredActiveCheck?.id === seededCampaign!.id, "the real seeded campaign is confirmed active again via the real live-check function");

  console.log("\n----------------------------------------");
  console.log(`  ${passed} passed, ${failed} failed`);
  console.log(failed === 0 ? "  \u2705 all green" : "  \u274c FAILURES ABOVE");
  if (failed > 0) process.exitCode = 1;
}

main().then(() => process.exit(process.exitCode ?? 0)).catch((e) => { console.error(e); process.exit(1); });
