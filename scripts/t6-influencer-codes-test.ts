/**
 * T.6 — Influencer/Promoter Marketing Codes. Real, live tests against the
 * real seeded NEYO Ops SUPER_ADMIN, the real seeded "NEYO-WANJIKU1" code,
 * and real, disposable test tenants. No mocks — genuinely exercises
 * `createInfluencerCode()`/`applyInfluencerCode()`/
 * `influencerSignupDiscountKes()`/`creditInfluencerCommission()`/
 * `markCommissionPaid()`, and the real T.2/T.6 mutual-exclusivity rule.
 */
import { db } from "../src/lib/db";
import {
  createInfluencerCode, listInfluencerCodes, setInfluencerCodeActive,
  applyInfluencerCode, influencerSignupDiscountKes, creditInfluencerCommission,
  listInfluencerCommissions, markCommissionPaid, InfluencerCodeError,
} from "../src/lib/services/influencer-code.service";

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
    const code = e instanceof InfluencerCodeError ? e.code : undefined;
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
  // 1) The real seeded "NEYO-WANJIKU1" code exists with the right real terms.
  // -------------------------------------------------------------------
  const seededCode = await db.influencerCode.findUniqueOrThrow({ where: { code: "NEYO-WANJIKU1" } });
  assert(seededCode.discountPct === 0.1 && seededCode.commissionKes === 3000, "the real seeded influencer code has the correct real 10% discount / KES 3,000 commission");
  assert(seededCode.active === true, "the real seeded influencer code is active");

  // -------------------------------------------------------------------
  // 2) A real new disposable influencer code, created via the real service.
  // -------------------------------------------------------------------
  const testCode = await createInfluencerCode(actor, { personName: "T6 Test Promoter", personPhone: "0711222333", discountPct: 0.08, commissionKes: 2000 });
  assert(testCode.code.startsWith("NEYO-"), `a real new influencer code is generated with the correct real prefix (got ${testCode.code})`);
  assert(testCode.discountPct === 0.08 && testCode.commissionKes === 2000, "the real new code stores the exact real discount/commission inputs");

  const allCodes = await listInfluencerCodes();
  assert(allCodes.some((c) => c.id === testCode.id && c.schoolsSignedUp === 0), "listInfluencerCodes() shows the real new code with a genuine 0 schools-signed-up count");

  // -------------------------------------------------------------------
  // 3) A real disposable test tenant applies the real new code.
  // -------------------------------------------------------------------
  const testTenant = await db.tenant.create({ data: { name: "T6 Test Academy (disposable)", slug: `t6-test-academy-${Date.now()}` } });
  const applied = await applyInfluencerCode(testTenant.id, testCode.code);
  assert(applied.influencerCodeId === testCode.id && applied.discountPct === 0.08, "applying the real code stores the exact real influencer link + discount");

  const afterApply = await db.tenant.findUniqueOrThrow({ where: { id: testTenant.id } });
  assert(afterApply.appliedInfluencerCodeId === testCode.id, "the real tenant row genuinely records the applied influencer code id");

  // A second application is honestly rejected (one code per school, ever).
  await assertThrows(() => applyInfluencerCode(testTenant.id, testCode.code), "applying a second influencer code to the same real school is rejected", "ALREADY");

  // An invalid/nonexistent code is honestly rejected.
  await assertThrows(() => applyInfluencerCode(testTenant.id, "NEYO-DOESNOTEXIST"), "applying a nonexistent influencer code is rejected", "NOT_FOUND");

  // -------------------------------------------------------------------
  // 4) Founder-confirmed mutual exclusivity with T.2: a school that
  // already applied a campaign discount cannot also apply an influencer
  // code.
  // -------------------------------------------------------------------
  const secondTestTenant = await db.tenant.create({ data: { name: "T6 Test Academy 2 (disposable)", slug: `t6-test-academy-2-${Date.now()}`, appliedCampaignId: "fake-campaign-id-for-exclusivity-test" } });
  await assertThrows(
    () => applyInfluencerCode(secondTestTenant.id, testCode.code),
    "a real school that already used a discount campaign cannot also apply an influencer code (T.2/T.6 mutual exclusivity)",
    "INVALID"
  );

  // -------------------------------------------------------------------
  // 5) influencerSignupDiscountKes() genuinely computes the real discount,
  // and respects the one-time claim guard exactly like T.2's own function.
  // -------------------------------------------------------------------
  const discount = await influencerSignupDiscountKes(testTenant.id, 10000);
  assert(discount.discountKes === 800 && discount.influencerCodeId === testCode.id, `influencerSignupDiscountKes() genuinely computes the real 8% discount (got ${discount.discountKes})`);

  await db.tenant.update({ where: { id: testTenant.id }, data: { hasClaimedFirstTermDiscount: true } });
  const afterClaimed = await influencerSignupDiscountKes(testTenant.id, 10000);
  assert(afterClaimed.discountKes === 0, "a real tenant that already claimed its first-term discount gets 0 from the influencer path too");
  await db.tenant.update({ where: { id: testTenant.id }, data: { hasClaimedFirstTermDiscount: false } }); // reset for the next real step

  // -------------------------------------------------------------------
  // 6) creditInfluencerCommission() genuinely creates a real one-time
  // commission, and is genuinely idempotent (never double-earned).
  // -------------------------------------------------------------------
  const commission = await creditInfluencerCommission(testTenant.id);
  assert(!!commission && commission.amountKes === 2000, `creditInfluencerCommission() genuinely creates a real KES 2,000 commission (got ${commission?.amountKes})`);
  assert(commission?.status === "OWED", "the real new commission starts in OWED status");

  const secondAttempt = await creditInfluencerCommission(testTenant.id);
  assert(secondAttempt?.id === commission?.id, "calling creditInfluencerCommission() again for the SAME real school returns the SAME existing commission (never double-earned)");

  const totalCommissionsForCode = await db.influencerCommission.count({ where: { influencerCodeId: testCode.id } });
  assert(totalCommissionsForCode === 1, "exactly 1 real commission row exists for this code+school pair, confirmed via direct DB re-query");

  // -------------------------------------------------------------------
  // 7) NEYO Ops marks the real commission paid.
  // -------------------------------------------------------------------
  const owedList = await listInfluencerCommissions("OWED");
  assert(owedList.some((c) => c.id === commission!.id), "the real new commission appears in the real OWED commissions list");

  const paid = await markCommissionPaid(actor, commission!.id, "M-Pesa ref TEST123");
  assert(paid.status === "PAID" && !!paid.paidAt, "marking a real commission paid genuinely stamps status+paidAt");

  await assertThrows(() => markCommissionPaid(actor, commission!.id), "marking an already-paid commission paid again is rejected", "ALREADY");

  const codesAfterCommission = await listInfluencerCodes();
  const testCodePerf = codesAfterCommission.find((c) => c.id === testCode.id);
  assert(testCodePerf?.schoolsSignedUp === 1 && testCodePerf?.totalPaidKes === 2000, `listInfluencerCodes() correctly reflects the real 1 school signed up + KES 2,000 paid (got signedUp=${testCodePerf?.schoolsSignedUp}, paid=${testCodePerf?.totalPaidKes})`);

  // -------------------------------------------------------------------
  // 8) NEYO Ops retires and reactivates the real test code.
  // -------------------------------------------------------------------
  const retired = await setInfluencerCodeActive(actor, testCode.id, false);
  assert(retired.active === false, "retiring a real code genuinely flips it inactive");
  const reactivated = await setInfluencerCodeActive(actor, testCode.id, true);
  assert(reactivated.active === true, "reactivating a real retired code genuinely flips it active again");

  // -------------------------------------------------------------------
  // Cleanup — remove ALL real test-created rows, confirmed via direct DB
  // re-query.
  // -------------------------------------------------------------------
  await db.influencerCommission.deleteMany({ where: { influencerCodeId: testCode.id } });
  await db.tenant.deleteMany({ where: { id: { in: [testTenant.id, secondTestTenant.id] } } });
  await db.influencerCode.delete({ where: { id: testCode.id } });

  const leftoverCode = await db.influencerCode.count({ where: { id: testCode.id } });
  const leftoverTenants = await db.tenant.count({ where: { id: { in: [testTenant.id, secondTestTenant.id] } } });
  const leftoverCommissions = await db.influencerCommission.count({ where: { influencerCodeId: testCode.id } });
  assert(leftoverCode === 0, "the real test-created influencer code removed (confirmed via direct DB re-query)");
  assert(leftoverTenants === 0, "both real disposable test tenants removed (confirmed via direct DB re-query)");
  assert(leftoverCommissions === 0, "the real test commission removed (confirmed via direct DB re-query)");

  const seededCodeStillThere = await db.influencerCode.findUnique({ where: { code: "NEYO-WANJIKU1" } });
  assert(!!seededCodeStillThere && seededCodeStillThere.active === true, "the real seeded NEYO-WANJIKU1 code is untouched by this test run");

  console.log("\n----------------------------------------");
  console.log(`  ${passed} passed, ${failed} failed`);
  console.log(failed === 0 ? "  \u2705 all green" : "  \u274c FAILURES ABOVE");
  if (failed > 0) process.exitCode = 1;
}

main().then(() => process.exit(process.exitCode ?? 0)).catch((e) => { console.error(e); process.exit(1); });
