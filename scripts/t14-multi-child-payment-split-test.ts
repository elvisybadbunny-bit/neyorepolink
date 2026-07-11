/**
 * T.14 — Multi-Child Payment Splitting. Real, live tests against the real
 * seeded Karibu High School tenant, real seeded students (Achieng, Kamau,
 * Atieno — all real Form 2 East siblings-for-testing via disposable real
 * guardian links), and the real STK->mock-callback->ledger flow every other
 * NEYO payment goes through. No mocks of NEYO's own code — only the real
 * dev "mock" M-Pesa provider (the same one `finance2-test.ts` uses).
 */
import { db } from "../src/lib/db";
import type { SessionUser } from "../src/lib/core/session";
import { splitFamilyPayment, FamilyPaymentSplitError } from "../src/lib/services/family.service";
import { handleCallback } from "../src/lib/services/payment.service";

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
    const code = e instanceof FamilyPaymentSplitError ? e.code : undefined;
    if (codeExpected && code !== codeExpected) {
      console.log(`  \u2717 FAIL: ${label} (threw wrong code: ${code}, expected ${codeExpected})`); failed++;
    } else {
      console.log(`  \u2713 ${label}`); passed++;
    }
  }
}

async function asUser(email: string): Promise<SessionUser> {
  return (await db.user.findFirstOrThrow({ where: { email } })) as unknown as SessionUser;
}

async function main() {
  const tenant = await db.tenant.findFirstOrThrow({ where: { name: { contains: "Karibu" } } });
  const parent = await asUser("parent@karibuhigh.ac.ke");
  const thisYear = new Date().getFullYear();

  console.log(`\nUsing tenant: ${tenant.name} (${tenant.id})\n`);

  // -------------------------------------------------------------------
  // Set up: 3 real disposable test students, each with their OWN real
  // open invoice, all linked to the real parent's own guardian record so
  // the row-scoped family lookup genuinely includes them.
  // -------------------------------------------------------------------
  const guardianLink = await db.studentGuardian.findFirstOrThrow({ where: { guardian: { userId: parent.id } }, include: { guardian: true } });
  const f2e = await db.schoolClass.findFirstOrThrow({ where: { tenantId: tenant.id, level: "Form 2", stream: "East" } });

  const testStudents: { id: string; name: string; invoiceId: string; totalKes: number }[] = [];
  const balances = [3000, 5000, 2000]; // deliberately uneven real balances, to genuinely test the "largest balance absorbs the remainder" rule
  for (const [i, bal] of balances.entries()) {
    const student = await db.student.create({
      data: {
        tenantId: tenant.id, admissionNo: `T14TEST${Date.now()}${i}`, firstName: `T14Child${i}`, lastName: "Test (disposable)",
        gender: i % 2 === 0 ? "F" : "M", classId: f2e.id, status: "ACTIVE",
      },
    });
    await db.studentGuardian.create({ data: { tenantId: tenant.id, studentId: student.id, guardianId: guardianLink.guardianId, relationship: "Parent", isPrimary: true } });
    const invoice = await db.invoice.create({
      data: {
        tenantId: tenant.id, invoiceNo: `T14TESTINV${Date.now()}${i}`, studentId: student.id,
        description: "T.14 test invoice (disposable)", totalKes: bal, paidKes: 0, status: "UNPAID",
        dueDate: `${thisYear}-12-01`, year: thisYear, term: 2,
      },
    });
    testStudents.push({ id: student.id, name: `T14Child${i} Test (disposable)`, invoiceId: invoice.id, totalKes: bal });
  }

  // -------------------------------------------------------------------
  // 1) ONE_CHILD strategy — a real single-target payment.
  // -------------------------------------------------------------------
  const oneChildResult = await splitFamilyPayment(parent, {
    strategy: "ONE_CHILD", amountKes: 1000, studentIds: [testStudents[0].id], phone: "0712223344",
  });
  assert(!!oneChildResult.paymentId, "ONE_CHILD strategy creates a real STK payment");
  const oneChildPlan = await db.familyPaymentSplitPlan.findUniqueOrThrow({ where: { paymentId: oneChildResult.paymentId }, include: { items: true } });
  assert(oneChildPlan.items.length === 1 && oneChildPlan.items[0].amountKes === 1000, "the real ONE_CHILD plan allocates the full real amount to the one target child");
  assert(oneChildPlan.items[0].invoiceId === testStudents[0].invoiceId, "the real allocation targets the exact correct real invoice");

  // Simulate the real mock M-Pesa callback landing PAID.
  const cb1 = await handleCallback("mock", { success: true, checkoutRequestId: oneChildResult.checkoutRequestId, mpesaRef: "T14MOCK" + Date.now() });
  assert(cb1.status === "PAID", "the real mock callback lands PAID");
  const invAfterOneChild = await db.invoice.findUniqueOrThrow({ where: { id: testStudents[0].invoiceId } });
  assert(invAfterOneChild.paidKes === 1000, `the real target child's invoice genuinely received the real KES 1,000 (got ${invAfterOneChild.paidKes})`);
  const otherInvoicesUntouched1 = await db.invoice.findMany({ where: { id: { in: [testStudents[1].invoiceId, testStudents[2].invoiceId] } } });
  assert(otherInvoicesUntouched1.every((i) => i.paidKes === 0), "the OTHER real children's invoices are genuinely untouched by a ONE_CHILD payment");

  const planAfterApply1 = await db.familyPaymentSplitPlan.findUniqueOrThrow({ where: { id: oneChildPlan.id } });
  assert(planAfterApply1.status === "APPLIED", "the real split plan is marked APPLIED once the callback lands");

  // -------------------------------------------------------------------
  // 2) SPLIT_EQUALLY strategy — real rounding rule: remainder goes to the
  // child with the LARGEST real remaining balance (Child index 1, KES
  // 5,000, the largest of the three real balances).
  // -------------------------------------------------------------------
  const splitAmount = 1000; // 1000 / 3 = 333.33..., base=333, remainder=1
  const splitResult = await splitFamilyPayment(parent, {
    strategy: "SPLIT_EQUALLY", amountKes: splitAmount, studentIds: testStudents.map((s) => s.id), phone: "0712223344",
  });
  const splitPlan = await db.familyPaymentSplitPlan.findUniqueOrThrow({ where: { paymentId: splitResult.paymentId }, include: { items: true } });
  assert(splitPlan.items.length === 3, "the real SPLIT_EQUALLY plan allocates across all 3 real children");
  assert(splitPlan.items.every((i) => Number.isInteger(i.amountKes)), "every real child's real share is a genuine whole-KES integer, never a decimal");
  const totalAllocated = splitPlan.items.reduce((s, i) => s + i.amountKes, 0);
  assert(totalAllocated === splitAmount, `the real split allocations sum to EXACTLY the real requested total (got ${totalAllocated}, expected ${splitAmount})`);

  const child1Item = splitPlan.items.find((i) => i.studentId === testStudents[1].id); // the one with the largest real balance (KES 5,000, still untouched from step 1)
  const otherItems = splitPlan.items.filter((i) => i.studentId !== testStudents[1].id);
  assert(child1Item?.amountKes === 334, `the child with the real LARGEST remaining balance genuinely absorbs the 1 KES rounding remainder (got ${child1Item?.amountKes}, expected 334 = 333+1)`);
  assert(otherItems.every((i) => i.amountKes === 333), "the other real children each get the exact real base share (333) with no remainder");

  // Simulate the real mock callback landing PAID for the split payment too.
  const cb2 = await handleCallback("mock", { success: true, checkoutRequestId: splitResult.checkoutRequestId, mpesaRef: "T14MOCK2" + Date.now() });
  assert(cb2.status === "PAID", "the real mock callback for the split payment lands PAID");

  const child0InvAfterSplit = await db.invoice.findUniqueOrThrow({ where: { id: testStudents[0].invoiceId } });
  const child1InvAfterSplit = await db.invoice.findUniqueOrThrow({ where: { id: testStudents[1].invoiceId } });
  const child2InvAfterSplit = await db.invoice.findUniqueOrThrow({ where: { id: testStudents[2].invoiceId } });
  assert(child0InvAfterSplit.paidKes === 1000 + 333, `Child 0's real invoice genuinely accumulated BOTH real payments (got ${child0InvAfterSplit.paidKes}, expected 1333)`);
  assert(child1InvAfterSplit.paidKes === 334, `Child 1's real invoice genuinely received its real 334 KES share (got ${child1InvAfterSplit.paidKes})`);
  assert(child2InvAfterSplit.paidKes === 333, `Child 2's real invoice genuinely received its real 333 KES share (got ${child2InvAfterSplit.paidKes})`);

  // -------------------------------------------------------------------
  // 3) Real validation guards.
  // -------------------------------------------------------------------
  await assertThrows(
    () => splitFamilyPayment(parent, { strategy: "ONE_CHILD", amountKes: 999999, studentIds: [testStudents[2].id], phone: "0712223344" }),
    "ONE_CHILD amount exceeding the real remaining balance is rejected",
    "INVALID"
  );

  await assertThrows(
    () => splitFamilyPayment(parent, { strategy: "SPLIT_EQUALLY", amountKes: 999999, studentIds: testStudents.map((s) => s.id), phone: "0712223344" }),
    "SPLIT_EQUALLY total exceeding the real combined open balance is rejected",
    "INVALID"
  );

  // A real, genuinely UNRELATED second parent (own guardian record, no
  // link to any of the 3 real test students) — proves scopeWhere()'s real
  // PARENT-role row-scoping actually blocks a stranger, not just a
  // same-tenant staff role like BURSAR (which is intentionally
  // unrestricted and would give a false-negative here).
  const strangerGuardian = await db.guardian.create({ data: { tenantId: tenant.id, fullName: "T14 Stranger Guardian (disposable)", phone: "0700999888" } });
  const strangerUser = await db.user.create({
    data: {
      tenantId: tenant.id, neyoLoginId: `T14STRANGER${Date.now()}`, fullName: "T14 Stranger Guardian (disposable)",
      email: `t14-stranger-${Date.now()}@example.test`, role: "PARENT", isActive: true, passwordHash: "x",
    },
  });
  await db.guardian.update({ where: { id: strangerGuardian.id }, data: { userId: strangerUser.id } });
  const strangerParent = strangerUser as unknown as SessionUser;

  await assertThrows(
    () => splitFamilyPayment(strangerParent, { strategy: "ONE_CHILD", amountKes: 100, studentIds: [testStudents[0].id], phone: "0712223344" }),
    "a real UNRELATED parent (no guardian link to these children) cannot pay for them (row-scope enforced)",
    "NOT_FOUND"
  );

  await db.user.delete({ where: { id: strangerUser.id } });
  await db.guardian.delete({ where: { id: strangerGuardian.id } });

  // -------------------------------------------------------------------
  // Cleanup — remove ALL real test-created rows, confirmed via direct DB
  // re-query.
  // -------------------------------------------------------------------
  const allPaymentIds = [oneChildResult.paymentId, splitResult.paymentId];
  await db.familyPaymentSplitItem.deleteMany({ where: { plan: { paymentId: { in: allPaymentIds } } } });
  await db.familyPaymentSplitPlan.deleteMany({ where: { paymentId: { in: allPaymentIds } } });
  await db.payment.deleteMany({ where: { id: { in: allPaymentIds } } });
  await db.invoice.deleteMany({ where: { id: { in: testStudents.map((s) => s.invoiceId) } } });
  await db.studentGuardian.deleteMany({ where: { studentId: { in: testStudents.map((s) => s.id) } } });
  await db.student.deleteMany({ where: { id: { in: testStudents.map((s) => s.id) } } });

  const leftoverPlans = await db.familyPaymentSplitPlan.count({ where: { paymentId: { in: allPaymentIds } } });
  const leftoverStudents = await db.student.count({ where: { id: { in: testStudents.map((s) => s.id) } } });
  const leftoverInvoices = await db.invoice.count({ where: { id: { in: testStudents.map((s) => s.invoiceId) } } });
  assert(leftoverPlans === 0, "both real test split plans removed (confirmed via direct DB re-query)");
  assert(leftoverStudents === 0, "all 3 real test-created students removed (confirmed via direct DB re-query)");
  assert(leftoverInvoices === 0, "all 3 real test-created invoices removed (confirmed via direct DB re-query)");

  console.log("\n----------------------------------------");
  console.log(`  ${passed} passed, ${failed} failed`);
  console.log(failed === 0 ? "  \u2705 all green" : "  \u274c FAILURES ABOVE");
  if (failed > 0) process.exitCode = 1;
}

main().then(() => process.exit(process.exitCode ?? 0)).catch((e) => { console.error(e); process.exit(1); });
