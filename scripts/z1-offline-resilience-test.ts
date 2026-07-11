/**
 * Z.1 — Real Offline-First Resilience for Internet Shutdowns regression test.
 *
 * Covers: `withIdempotency()`'s core at-most-once behaviour (first call runs
 * + stores, a replay with the SAME key returns the identical stored result
 * without re-running the real operation, a genuine concurrent-race P2002
 * fallback still returns the one real winning result); each of the 4 real
 * API-level write actions wired this session (Gate Pass issuance, Gate Pass
 * exit-scan/usePass, Visitor sign-in, cash payment via applyPaymentToInvoice)
 * proving a REAL duplicate/second mutation is never created on replay; and
 * the real `GET/POST /api/me/bundle-saver` preference round-trip logic at
 * the DB layer. Full cleanup verified via direct DB re-query.
 */
import { db } from "../src/lib/db";
import { withTenant } from "../src/lib/core/tenant-context";
import type { SessionUser } from "../src/lib/core/session";
import { withIdempotency } from "../src/lib/services/idempotency.service";
import { issueGatePass, useGatePass } from "../src/lib/services/security.service";
import { signInVisitor } from "../src/lib/services/reception.service";
import { applyPaymentToInvoice } from "../src/lib/services/finance.service";

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
  const principal = await asUser("principal@karibuhigh.ac.ke");
  const bursar = await asUser("bursar@karibuhigh.ac.ke");
  const tenant = await db.tenant.findFirstOrThrow({ where: { isDemo: false }, orderBy: { createdAt: "asc" } });
  const student = await db.student.findFirstOrThrow({ where: { tenantId: tenant.id, status: "ACTIVE" } });

  console.log(`\nUsing principal: ${principal.fullName}, bursar: ${bursar.fullName}, tenant: ${tenant.name}, student: ${student.firstName}\n`);

  const createdIds: { gatePassIds: string[]; visitorIds: string[]; invoiceIds: string[] } = {
    gatePassIds: [], visitorIds: [], invoiceIds: [],
  };

  // -------------------------------------------------------------------
  // 1) withIdempotency() — core generic behaviour.
  // -------------------------------------------------------------------
  let runCount = 0;
  const key1 = `test-key-${Date.now()}-a`;
  const run1a = await withIdempotency(tenant.id, "z1_test.probe", key1, async () => { runCount++; return { value: runCount, mintedAt: Date.now() }; });
  assert(run1a.replayed === false, "the FIRST call with a fresh idempotency key actually runs the real operation");
  assert(run1a.result.value === 1, "the first call's real result is stored correctly");

  const run1b = await withIdempotency(tenant.id, "z1_test.probe", key1, async () => { runCount++; return { value: runCount, mintedAt: Date.now() }; });
  assert(run1b.replayed === true, "a REPLAY with the SAME idempotency key is correctly detected");
  assert(runCount === 1, "the real underlying operation was NOT re-run on replay (genuine at-most-once)");
  assert(run1b.result.value === run1a.result.value && run1b.result.mintedAt === run1a.result.mintedAt, "the replay returns the EXACT SAME stored real result, never a freshly re-computed one");

  // A DIFFERENT key for the SAME action must run independently.
  const key2 = `test-key-${Date.now()}-b`;
  const run2 = await withIdempotency(tenant.id, "z1_test.probe", key2, async () => { runCount++; return { value: runCount }; });
  assert(run2.replayed === false && runCount === 2, "a genuinely different idempotency key runs the real operation independently");

  // The SAME key under a DIFFERENT action namespace must also run independently.
  const run3 = await withIdempotency(tenant.id, "z1_test.other_action", key1, async () => { runCount++; return { value: runCount }; });
  assert(run3.replayed === false && runCount === 3, "the same key under a DIFFERENT action namespace is treated as a genuinely separate real request");

  // Concurrent-race fallback: two near-simultaneous calls with the SAME new
  // key should both resolve to the SAME real winning result, never both
  // running the underlying operation to completion twice.
  let raceRunCount = 0;
  const raceKey = `race-key-${Date.now()}`;
  const [raceA, raceB] = await Promise.all([
    withIdempotency(tenant.id, "z1_test.race", raceKey, async () => { raceRunCount++; await new Promise((r) => setTimeout(r, 30)); return { winner: "A", n: raceRunCount }; }),
    withIdempotency(tenant.id, "z1_test.race", raceKey, async () => { raceRunCount++; await new Promise((r) => setTimeout(r, 30)); return { winner: "B", n: raceRunCount }; }),
  ]);
  assert(raceA.result.winner === raceB.result.winner && raceA.result.n === raceB.result.n, "a genuine near-simultaneous race on the SAME key converges to ONE real winning result for both callers (P2002 fallback works)");

  await withTenant(tenant.id, async () => {
    await db.idempotentRequest.deleteMany({ where: { tenantId: tenant.id, action: { in: ["z1_test.probe", "z1_test.other_action", "z1_test.race"] } } });
  });
  const remainingProbes = await db.idempotentRequest.count({ where: { tenantId: tenant.id, action: { in: ["z1_test.probe", "z1_test.other_action", "z1_test.race"] } } });
  assert(remainingProbes === 0, "cleanup confirmed: all test IdempotentRequest rows are gone (re-queried directly)");

  // -------------------------------------------------------------------
  // 2) Real Gate Pass issuance — NOT naturally idempotent (mints passNo).
  // -------------------------------------------------------------------
  const gpKey = `gp-key-${Date.now()}`;
  const gpInput = { studentId: student.id, reason: "Z.1 regression test — dental appointment", leaveAt: new Date(Date.now() + 3600_000).toISOString() };

  const gp1 = await withIdempotency(tenant.id, "security.gatePass", gpKey, () => issueGatePass(principal, gpInput));
  createdIds.gatePassIds.push(gp1.result.id);
  assert(gp1.replayed === false, "the first real gate-pass issuance actually runs and mints a real pass");
  const passCountAfterFirst = await withTenant(tenant.id, () => db.gatePass.count({ where: { studentId: student.id } }));

  const gp2 = await withIdempotency(tenant.id, "security.gatePass", gpKey, () => issueGatePass(principal, gpInput));
  assert(gp2.replayed === true, "replaying the SAME gate-pass issuance key is detected as a replay");
  assert(gp2.result.id === gp1.result.id && gp2.result.passNo === gp1.result.passNo, "the replay returns the EXACT SAME real pass (same id, same passNo) — never a second mint");
  const passCountAfterReplay = await withTenant(tenant.id, () => db.gatePass.count({ where: { studentId: student.id } }));
  assert(passCountAfterReplay === passCountAfterFirst, "no real second GatePass row was created in the DB on replay (re-queried directly)");

  // Without idempotency, a genuine second issuance attempt for the SAME
  // still-active student correctly throws ALREADY (the real pre-existing
  // business rule) — proving the idempotency layer isn't masking that rule.
  await assertThrows(() => issueGatePass(principal, gpInput), "a genuine second (non-replayed) gate-pass issuance for the same still-active student is correctly rejected by the real business rule");

  // -------------------------------------------------------------------
  // 3) Real Gate Pass exit-scan (usePass) — a one-way ACTIVE->USED transition.
  // -------------------------------------------------------------------
  const upKey = `up-key-${Date.now()}`;
  const passNo = gp1.result.passNo;
  const use1 = await withIdempotency(tenant.id, "security.usePass", upKey, () => useGatePass(principal, passNo));
  assert(use1.replayed === false && use1.result.status === "USED", "the first real exit-scan actually marks the pass USED");

  const use2 = await withIdempotency(tenant.id, "security.usePass", upKey, () => useGatePass(principal, passNo));
  assert(use2.replayed === true, "replaying the SAME exit-scan key is detected as a replay");
  // Note: the replay's `usedAt` comes back through a real JSON round-trip
  // (stored as `responseJson`, same as the real HTTP layer would do), so
  // compare as ISO strings rather than raw Date-object identity.
  assert(
    new Date(use2.result.usedAt as unknown as string).toISOString() === new Date(use1.result.usedAt as unknown as string).toISOString(),
    "the replay returns the exact same real usedAt timestamp — never a second (different) stamp"
  );

  // Without idempotency, a genuine second real exit-scan of an ALREADY-used
  // pass correctly throws (the real one-way-transition business rule).
  await assertThrows(() => useGatePass(principal, passNo), "a genuine second (non-replayed) exit-scan of an already-used pass is correctly rejected");

  // -------------------------------------------------------------------
  // 4) Real Visitor sign-in — NOT naturally idempotent (mints a real badgeNo).
  // -------------------------------------------------------------------
  const visKey = `vis-key-${Date.now()}`;
  const visInput = { name: "Wafula Peter", purpose: "Z.1 regression test — fees enquiry" };

  const vis1 = await withTenant(tenant.id, () =>
    withIdempotency(tenant.id, "reception.signInVisitor", visKey, () => signInVisitor(tenant.id, visInput as any, bursar.id))
  );
  createdIds.visitorIds.push(vis1.result.id);
  assert(vis1.replayed === false, "the first real visitor sign-in actually mints a real badge");
  const visitorCountAfterFirst = await withTenant(tenant.id, () => db.visitorLog.count({ where: { name: "Wafula Peter" } }));

  const vis2 = await withTenant(tenant.id, () =>
    withIdempotency(tenant.id, "reception.signInVisitor", visKey, () => signInVisitor(tenant.id, visInput as any, bursar.id))
  );
  assert(vis2.replayed === true && vis2.result.badgeNo === vis1.result.badgeNo, "replaying the SAME visitor sign-in key returns the exact same real badge, never a second one");
  const visitorCountAfterReplay = await withTenant(tenant.id, () => db.visitorLog.count({ where: { name: "Wafula Peter" } }));
  assert(visitorCountAfterReplay === visitorCountAfterFirst, "no real second VisitorLog row was created in the DB on replay (re-queried directly)");

  // -------------------------------------------------------------------
  // 5) Real cash/manual payment application — NOT naturally idempotent
  //    (INCREMENTS paidKes on every real call).
  // -------------------------------------------------------------------
  const testInvoice = await withTenant(tenant.id, () =>
    db.invoice.create({
      data: {
        tenantId: tenant.id, invoiceNo: `Z1-TEST-${Date.now()}`, studentId: student.id,
        description: "Z.1 regression test invoice", totalKes: 5000, paidKes: 0, status: "UNPAID",
        dueDate: new Date().toISOString().slice(0, 10), year: new Date().getFullYear(), term: 2,
      },
    })
  );
  createdIds.invoiceIds.push(testInvoice.id);

  const payKey = `pay-key-${Date.now()}`;
  const pay1 = await withIdempotency(tenant.id, "finance.applyPaymentToInvoice", payKey, () => applyPaymentToInvoice(bursar, testInvoice.id, 2000));
  assert(pay1.replayed === false && pay1.result.paidKes === 2000, "the first real cash payment correctly applies the real amount once");

  const pay2 = await withIdempotency(tenant.id, "finance.applyPaymentToInvoice", payKey, () => applyPaymentToInvoice(bursar, testInvoice.id, 2000));
  assert(pay2.replayed === true, "replaying the SAME payment key is detected as a replay");
  assert(pay2.result.paidKes === 2000, "the replay returns the EXACT SAME real paidKes total — never double-applied to 4000");

  const invoiceAfterReplay = await withTenant(tenant.id, () => db.invoice.findUniqueOrThrow({ where: { id: testInvoice.id } }));
  assert(invoiceAfterReplay.paidKes === 2000, "re-querying the real Invoice row directly confirms paidKes is still 2000, never double-applied by the replay");

  // A genuinely DIFFERENT payment (new key) correctly DOES apply again — the
  // idempotency layer only blocks a true replay, never a legitimate second
  // real payment.
  const payKey2 = `pay-key-${Date.now()}-second`;
  const pay3 = await withIdempotency(tenant.id, "finance.applyPaymentToInvoice", payKey2, () => applyPaymentToInvoice(bursar, testInvoice.id, 1500));
  assert(pay3.replayed === false && pay3.result.paidKes === 3500, "a genuinely NEW real payment (different idempotency key) is correctly applied on top of the first — the layer never blocks legitimate distinct payments");

  // -------------------------------------------------------------------
  // 6) Real GET/POST /api/me/bundle-saver preference round-trip (DB layer).
  // -------------------------------------------------------------------
  const before = await db.user.findUniqueOrThrow({ where: { id: bursar.id }, select: { bundleSaverEnabled: true } });
  assert(before.bundleSaverEnabled === true, "User.bundleSaverEnabled defaults to true (auto-on) for the real seeded bursar account");

  await db.user.update({ where: { id: bursar.id }, data: { bundleSaverEnabled: false } });
  const afterOff = await db.user.findUniqueOrThrow({ where: { id: bursar.id }, select: { bundleSaverEnabled: true } });
  assert(afterOff.bundleSaverEnabled === false, "the real preference can be turned off and is correctly persisted");

  await db.user.update({ where: { id: bursar.id }, data: { bundleSaverEnabled: true } });
  const afterOn = await db.user.findUniqueOrThrow({ where: { id: bursar.id }, select: { bundleSaverEnabled: true } });
  assert(afterOn.bundleSaverEnabled === true, "the real preference can be turned back on and is correctly persisted (restored to the real seeded default)");

  // -------------------------------------------------------------------
  // Cleanup — real, verified.
  // -------------------------------------------------------------------
  await withTenant(tenant.id, async () => {
    await db.idempotentRequest.deleteMany({
      where: {
        tenantId: tenant.id,
        action: { in: ["security.gatePass", "security.usePass", "reception.signInVisitor", "finance.applyPaymentToInvoice"] },
        idempotencyKey: { in: [gpKey, upKey, visKey, payKey, payKey2] },
      },
    });
    await db.gatePass.deleteMany({ where: { id: { in: createdIds.gatePassIds } } });
    await db.visitorLog.deleteMany({ where: { id: { in: createdIds.visitorIds } } });
    await db.invoice.deleteMany({ where: { id: { in: createdIds.invoiceIds } } });
  });

  const remainingGatePasses = await db.gatePass.count({ where: { id: { in: createdIds.gatePassIds } } });
  const remainingVisitors = await db.visitorLog.count({ where: { id: { in: createdIds.visitorIds } } });
  const remainingInvoices = await db.invoice.count({ where: { id: { in: createdIds.invoiceIds } } });
  const remainingKeys = await db.idempotentRequest.count({
    where: { tenantId: tenant.id, idempotencyKey: { in: [gpKey, upKey, visKey, payKey, payKey2] } },
  });
  assert(remainingGatePasses === 0, "cleanup confirmed: the test GatePass row is gone (re-queried directly)");
  assert(remainingVisitors === 0, "cleanup confirmed: the test VisitorLog row is gone (re-queried directly)");
  assert(remainingInvoices === 0, "cleanup confirmed: the test Invoice row is gone (re-queried directly)");
  assert(remainingKeys === 0, "cleanup confirmed: all real test IdempotentRequest ledger rows are gone (re-queried directly)");

  console.log("\n" + "-".repeat(40));
  console.log(`  ${passed} passed, ${failed} failed`);
  console.log(failed === 0 ? "  \u2705 all green" : "  \u274c failures found");
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
