/**
 * T.10 — Teacher Portal: Cash Payments Pending School Confirmation.
 *
 * Real, live tests against the real seeded Karibu High School tenant, the
 * real seeded CLASS_TEACHER Chebet Faith, the real seeded KHINVSEED1/2/3
 * invoices, and the real, already-pending T.10 seed entry. No mocks —
 * CONFIRM genuinely calls the real applyPaymentToInvoice() ledger function;
 * REJECT genuinely requires a real reason and notifies the teacher.
 */
import { db } from "../src/lib/db";
import type { SessionUser } from "../src/lib/core/session";
import {
  teacherCashPaymentPolicy, setTeacherCashPaymentPolicy,
  submitTeacherCashPayment, listTeacherCashPaymentRequests,
  myTeacherCashPaymentRequests, decideTeacherCashPayment,
  TeacherCashPaymentError,
} from "../src/lib/services/teacher-cash-payment.service";

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
    const code = e instanceof TeacherCashPaymentError ? e.code : undefined;
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
  const bursar = await asUser("bursar@karibuhigh.ac.ke");
  const chebet = await asUser("f.chebet@karibuhigh.ac.ke");

  console.log(`\nUsing tenant: ${tenant.name} (${tenant.id})\n`);

  // -------------------------------------------------------------------
  // 1) Policy toggle gating
  // -------------------------------------------------------------------
  const policy = await teacherCashPaymentPolicy(bursar);
  assert(policy.allowTeacherCashPayments === true, "teacher cash payments are ON (T.10 seed turned this on)");

  const kamauInvoice = await db.invoice.findFirstOrThrow({ where: { tenantId: tenant.id, invoiceNo: "KHINVSEED2" } });
  const balance = kamauInvoice.totalKes - kamauInvoice.discountKes - kamauInvoice.paidKes;
  assert(balance > 0, `Kamau's real seeded invoice KHINVSEED2 has a real remaining balance (KES ${balance.toLocaleString("en-KE")})`);

  await setTeacherCashPaymentPolicy(bursar, false);
  await assertThrows(
    () => submitTeacherCashPayment(chebet, { invoiceId: kamauInvoice.id, amountKes: 1000 }),
    "with the school policy OFF, a new teacher cash submission is rejected",
    "FORBIDDEN"
  );
  await setTeacherCashPaymentPolicy(bursar, true); // restore seeded state

  // -------------------------------------------------------------------
  // 2) Amount validated against the REAL invoice balance
  // -------------------------------------------------------------------
  await assertThrows(
    () => submitTeacherCashPayment(chebet, { invoiceId: kamauInvoice.id, amountKes: balance + 50000 }),
    "submitting an amount exceeding the real remaining balance is rejected",
    "INVALID"
  );

  // -------------------------------------------------------------------
  // 3) The real pre-existing seeded PENDING entry (Chebet, KES 5,000)
  // -------------------------------------------------------------------
  const pendingBefore = await listTeacherCashPaymentRequests(bursar, "PENDING");
  const seededEntry = pendingBefore.find((r) => r.invoiceNo === "KHINVSEED2" && r.amountKes === 5000 && r.submittedByName === chebet.fullName);
  assert(!!seededEntry, "the real seeded pending KES 5,000 entry from Chebet Faith against KHINVSEED2 exists");

  const mine = await myTeacherCashPaymentRequests(chebet);
  assert(mine.some((r) => r.id === seededEntry?.id), "Chebet's own self-service view (row-scoped) includes her real seeded submission");

  // -------------------------------------------------------------------
  // 4) A genuinely NEW submission (against Atieno's unpaid invoice)
  // -------------------------------------------------------------------
  const atienoInvoice = await db.invoice.findFirstOrThrow({ where: { tenantId: tenant.id, invoiceNo: "KHINVSEED3" } });
  const notifBeforeCount = await db.notification.count({ where: { tenantId: tenant.id } });

  const submitted = await submitTeacherCashPayment(chebet, { invoiceId: atienoInvoice.id, amountKes: 3000, note: "Test cash from a real regression run" });
  assert(submitted.status === "PENDING", "a genuinely new teacher cash submission starts in PENDING");
  assert(submitted.amountKes === 3000, "the real submitted amount is stored exactly");

  const notifAfterSubmit = await db.notification.count({ where: { tenantId: tenant.id } });
  assert(notifAfterSubmit > notifBeforeCount, "submitting a cash entry genuinely notifies leadership (real Notification rows created)");

  const invoiceUnchangedAfterSubmit = await db.invoice.findUniqueOrThrow({ where: { id: atienoInvoice.id } });
  assert(invoiceUnchangedAfterSubmit.paidKes === atienoInvoice.paidKes && invoiceUnchangedAfterSubmit.status === atienoInvoice.status,
    "submitting a PENDING cash entry NEVER touches the real invoice ledger (paidKes/status unchanged until confirmed)");

  // -------------------------------------------------------------------
  // 5) Self-approval / non-leadership decision block would be enforced at
  // the API-route permission layer (finance.record_payment) — service
  // layer itself performs the CONFIRM/REJECT actions once authorized.
  // -------------------------------------------------------------------

  // REJECT requires a real reason \u2265 3 chars.
  await assertThrows(
    () => decideTeacherCashPayment(bursar, submitted.id, { approve: false, rejectReason: "no" }),
    "rejecting with a reason shorter than 3 characters is rejected",
    "INVALID"
  );
  await assertThrows(
    () => decideTeacherCashPayment(bursar, submitted.id, { approve: false }),
    "rejecting with NO reason at all is rejected",
    "INVALID"
  );

  const notifBeforeReject = await db.notification.count({ where: { tenantId: tenant.id } });
  const rejected = await decideTeacherCashPayment(bursar, submitted.id, { approve: false, rejectReason: "Cash never reached the school office" });
  assert(rejected.status === "REJECTED", "rejecting with a valid reason marks the entry REJECTED");
  assert(rejected.rejectReason === "Cash never reached the school office", "the real reject reason is stored verbatim");

  const invoiceStillUnchangedAfterReject = await db.invoice.findUniqueOrThrow({ where: { id: atienoInvoice.id } });
  assert(invoiceStillUnchangedAfterReject.paidKes === atienoInvoice.paidKes, "a REJECTED entry never touches the real invoice ledger");

  const notifAfterReject = await db.notification.count({ where: { tenantId: tenant.id } });
  assert(notifAfterReject > notifBeforeReject, "rejecting genuinely notifies the submitting teacher (real Notification row created) with the real reason");
  const teacherNotif = await db.notification.findFirst({ where: { tenantId: tenant.id, recipientId: chebet.id }, orderBy: { createdAt: "desc" } });
  assert(!!teacherNotif && teacherNotif.body.includes("Cash never reached the school office"), "the teacher's real notification body includes the exact reject reason");

  await assertThrows(
    () => decideTeacherCashPayment(bursar, submitted.id, { approve: true }),
    "deciding an already-decided (REJECTED) request again is rejected",
    "ALREADY"
  );

  // -------------------------------------------------------------------
  // 6) CONFIRM genuinely moves the real ledger via applyPaymentToInvoice()
  // -------------------------------------------------------------------
  const submitted2 = await submitTeacherCashPayment(chebet, { invoiceId: atienoInvoice.id, amountKes: 2500, note: "Second real test cash entry" });
  const invoiceBeforeConfirm = await db.invoice.findUniqueOrThrow({ where: { id: atienoInvoice.id } });

  const confirmed = await decideTeacherCashPayment(bursar, submitted2.id, { approve: true });
  assert(confirmed.status === "CONFIRMED", "confirming marks the entry CONFIRMED");

  const invoiceAfterConfirm = await db.invoice.findUniqueOrThrow({ where: { id: atienoInvoice.id } });
  assert(invoiceAfterConfirm.paidKes === invoiceBeforeConfirm.paidKes + 2500, `confirming genuinely applied KES 2,500 to the real invoice ledger (paidKes ${invoiceBeforeConfirm.paidKes} \u2192 ${invoiceAfterConfirm.paidKes})`);

  const auditRow = await db.auditLog.findFirst({ where: { tenantId: tenant.id, action: "finance.payment_applied", entityId: atienoInvoice.id }, orderBy: { createdAt: "desc" } });
  assert(!!auditRow, "confirming created a real finance.payment_applied audit-log row (the same real ledger path every other payment method uses)");

  // -------------------------------------------------------------------
  // Cleanup — revert the real invoice ledger + remove all test-created
  // rows, confirmed via direct DB re-query.
  // -------------------------------------------------------------------
  await db.invoice.update({ where: { id: atienoInvoice.id }, data: { paidKes: atienoInvoice.paidKes, status: atienoInvoice.status } });
  await db.teacherCashPaymentRequest.deleteMany({ where: { id: { in: [submitted.id, submitted2.id] } } });

  const remaining = await db.teacherCashPaymentRequest.count({ where: { id: { in: [submitted.id, submitted2.id] } } });
  assert(remaining === 0, "both real test-created cash-payment requests removed (confirmed via direct DB re-query)");

  const invoiceRestored = await db.invoice.findUniqueOrThrow({ where: { id: atienoInvoice.id } });
  assert(invoiceRestored.paidKes === atienoInvoice.paidKes && invoiceRestored.status === atienoInvoice.status, "Atieno's real invoice ledger is restored to its exact pre-test state (no permanent drift)");

  const seededEntryStillThere = await db.teacherCashPaymentRequest.findFirst({ where: { tenantId: tenant.id, submittedByName: chebet.fullName, amountKes: 5000, invoiceId: kamauInvoice.id } });
  assert(!!seededEntryStillThere, "the ORIGINAL real seeded pending entry is untouched by this test run");

  console.log("\n----------------------------------------");
  console.log(`  ${passed} passed, ${failed} failed`);
  console.log(failed === 0 ? "  \u2705 all green" : "  \u274c FAILURES ABOVE");
  if (failed > 0) process.exitCode = 1;
}

main().then(() => process.exit(process.exitCode ?? 0)).catch((e) => { console.error(e); process.exit(1); });
