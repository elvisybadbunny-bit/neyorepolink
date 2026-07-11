/**
 * T.10 — Teacher Portal: real cash payments PENDING school confirmation.
 *
 * Founder's exact words: "a teacher when a school allows can allow cash
 * payments in their portals and it can only be confirmed by the school...
 * no rejection when the administration receives the money or the one
 * responsible if the money has to reach it is confirmed but if not
 * received cause its cash its reject and the teacher gets the message."
 *
 * A teacher's submission is a real, narrow, auditable PENDING entry — it
 * NEVER touches the real invoice ledger, never triggers a receipt, and
 * never counts as PAID until a real bursar/leadership user explicitly
 * CONFIRMS the cash genuinely reached the school office. Confirming this
 * request is a thin PRE-STEP in front of the already-battle-tested real
 * `applyPaymentToInvoice()` — the ONLY function that ever actually moves
 * money in NEYO; this never becomes a second, parallel payment system.
 * Gated by a real, explicit per-school opt-in
 * (Tenant.allowTeacherCashPayments, off by default — mirrors R.3's
 * requireBiometricForFinance toggle pattern exactly).
 */
import { db } from "@/lib/db";
import { withTenant } from "@/lib/core/tenant-context";
import { tenantDb } from "@/lib/core/tenant-db";
import type { SessionUser } from "@/lib/core/session";

export class TeacherCashPaymentError extends Error {
  constructor(public code: "NOT_FOUND" | "FORBIDDEN" | "ALREADY" | "INVALID", message: string) {
    super(message);
    this.name = "TeacherCashPaymentError";
  }
}

async function audit(user: SessionUser, action: string, entityId: string, metadata?: unknown) {
  await db.auditLog.create({
    data: {
      tenantId: user.tenantId, actorId: user.id, actorName: user.fullName,
      action, entityType: "teacherCashPaymentRequest", entityId,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
}

export async function teacherCashPaymentPolicy(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const tenant = await db.tenant.findUniqueOrThrow({ where: { id: user.tenantId }, select: { allowTeacherCashPayments: true } });
    return { allowTeacherCashPayments: tenant.allowTeacherCashPayments };
  });
}

export async function setTeacherCashPaymentPolicy(user: SessionUser, allow: boolean) {
  return withTenant(user.tenantId, async () => {
    const row = await db.tenant.update({ where: { id: user.tenantId }, data: { allowTeacherCashPayments: allow }, select: { allowTeacherCashPayments: true } });
    await audit(user, "finance.teacher_cash_policy_updated", user.tenantId, { allow });
    return row;
  });
}

/** A teacher submits a real, pending cash entry against a real invoice. */
export async function submitTeacherCashPayment(
  user: SessionUser,
  input: { invoiceId: string; amountKes: number; note?: string }
) {
  return withTenant(user.tenantId, async () => {
    const { allowTeacherCashPayments } = await teacherCashPaymentPolicy(user);
    if (!allowTeacherCashPayments) throw new TeacherCashPaymentError("FORBIDDEN", "This school hasn't enabled teacher cash-payment entries.");

    const invoice = await tenantDb().invoice.findUnique({ where: { id: input.invoiceId } });
    if (!invoice) throw new TeacherCashPaymentError("NOT_FOUND", "Invoice not found.");
    if (invoice.status === "PAID") throw new TeacherCashPaymentError("INVALID", "This invoice is already fully paid.");

    const balance = invoice.totalKes - invoice.discountKes - invoice.paidKes;
    if (input.amountKes > balance) {
      throw new TeacherCashPaymentError("INVALID", `Amount (KES ${input.amountKes.toLocaleString("en-KE")}) exceeds the real remaining balance (KES ${balance.toLocaleString("en-KE")}).`);
    }

    const row = await db.teacherCashPaymentRequest.create({
      data: {
        tenantId: user.tenantId, invoiceId: invoice.id,
        submittedById: user.id, submittedByName: user.fullName,
        amountKes: input.amountKes, note: input.note ?? null,
      },
    });
    await audit(user, "finance.teacher_cash_submitted", row.id, { invoiceId: invoice.id, amountKes: input.amountKes });

    // Leadership/bursar-facing notification — mirrors T.8/T.9's own real
    // "someone needs to decide this" alert pattern.
    try {
      const { notify } = await import("@/lib/services/notification.service");
      const leaders = await tenantDb().user.findMany({
        where: { role: { in: ["SCHOOL_OWNER", "PRINCIPAL", "DEPUTY_PRINCIPAL", "BURSAR", "ACCOUNTANT"] }, isActive: true },
        select: { id: true },
      });
      for (const leader of leaders) {
        await notify({
          tenantId: user.tenantId, recipientId: leader.id,
          title: "Cash payment awaiting confirmation",
          body: `${user.fullName} recorded KES ${input.amountKes.toLocaleString("en-KE")} cash for invoice ${invoice.invoiceNo} — confirm once it reaches the office.`,
          category: "finance", href: "/finance",
        });
      }
    } catch { /* best-effort */ }

    return row;
  });
}

export async function listTeacherCashPaymentRequests(user: SessionUser, status?: string) {
  return withTenant(user.tenantId, async () => {
    const rows = await tenantDb().teacherCashPaymentRequest.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: "desc" },
      include: { invoice: { select: { invoiceNo: true, studentId: true, totalKes: true, paidKes: true, discountKes: true, status: true } } },
    });
    const studentIds = [...new Set(rows.map((r) => r.invoice.studentId))];
    const students = studentIds.length
      ? await tenantDb().student.findMany({ where: { id: { in: studentIds } }, select: { id: true, firstName: true, middleName: true, lastName: true, admissionNo: true } })
      : [];
    const sMap = new Map(students.map((s) => [s.id, s]));
    return rows.map((r) => {
      const s = sMap.get(r.invoice.studentId);
      return {
        id: r.id, invoiceId: r.invoiceId, invoiceNo: r.invoice.invoiceNo,
        studentName: s ? [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ") : "—",
        admissionNo: s?.admissionNo ?? "—",
        amountKes: r.amountKes, note: r.note, status: r.status,
        submittedByName: r.submittedByName, createdAt: r.createdAt,
        decidedByName: r.decidedByName, decidedAt: r.decidedAt, rejectReason: r.rejectReason,
      };
    });
  });
}

/** A teacher's own submitted cash entries (self-service view). */
export async function myTeacherCashPaymentRequests(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const rows = await tenantDb().teacherCashPaymentRequest.findMany({
      where: { submittedById: user.id },
      orderBy: { createdAt: "desc" },
      include: { invoice: { select: { invoiceNo: true } } },
    });
    return rows.map((r) => ({
      id: r.id, invoiceNo: r.invoice.invoiceNo, amountKes: r.amountKes,
      status: r.status, createdAt: r.createdAt, decidedAt: r.decidedAt, rejectReason: r.rejectReason,
    }));
  });
}

/**
 * The real, human-reviewed decision. CONFIRM = the cash genuinely reached
 * the office — fires the real applyPaymentToInvoice() with all its real
 * side effects (R.3 biometric gate if the school has it on, R.5 receipt
 * delivery, G.31 print-queue auto-print, webhook events). REJECT = the
 * cash did NOT reach the office — a real reason is REQUIRED, and the
 * teacher is genuinely notified with that exact reason.
 */
export async function decideTeacherCashPayment(
  user: SessionUser,
  requestId: string,
  input: { approve: boolean; rejectReason?: string; biometricTicket?: string }
) {
  return withTenant(user.tenantId, async () => {
    const request = await tenantDb().teacherCashPaymentRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new TeacherCashPaymentError("NOT_FOUND", "Request not found.");
    if (request.status !== "PENDING") throw new TeacherCashPaymentError("ALREADY", "This request has already been decided.");

    if (!input.approve) {
      if (!input.rejectReason || input.rejectReason.trim().length < 3) {
        throw new TeacherCashPaymentError("INVALID", "A real reason is required when rejecting a cash entry.");
      }
      const declined = await tenantDb().teacherCashPaymentRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED", decidedById: user.id, decidedByName: user.fullName, decidedAt: new Date(), rejectReason: input.rejectReason.trim() },
      });
      await audit(user, "finance.teacher_cash_rejected", requestId, { reason: input.rejectReason });
      try {
        const { notify } = await import("@/lib/services/notification.service");
        await notify({
          tenantId: user.tenantId, recipientId: request.submittedById,
          title: "Cash payment not confirmed",
          body: `Your cash entry was rejected: ${input.rejectReason.trim()}`,
          category: "finance", href: "/teacher",
        });
      } catch { /* best-effort */ }
      return declined;
    }

    // CONFIRM — the cash genuinely reached the office. Fire the REAL,
    // already-battle-tested payment function; this request is the ONLY
    // path allowed to call it on a teacher's behalf.
    const { applyPaymentToInvoice } = await import("@/lib/services/finance.service");
    await applyPaymentToInvoice(user, request.invoiceId, request.amountKes, input.biometricTicket);

    const confirmed = await tenantDb().teacherCashPaymentRequest.update({
      where: { id: requestId },
      data: { status: "CONFIRMED", decidedById: user.id, decidedByName: user.fullName, decidedAt: new Date() },
    });
    await audit(user, "finance.teacher_cash_confirmed", requestId, { invoiceId: request.invoiceId, amountKes: request.amountKes });
    try {
      const { notify } = await import("@/lib/services/notification.service");
      await notify({
        tenantId: user.tenantId, recipientId: request.submittedById,
        title: "Cash payment confirmed",
        body: `Your KES ${request.amountKes.toLocaleString("en-KE")} cash entry was confirmed by ${user.fullName}.`,
        category: "finance", href: "/teacher",
      });
    } catch { /* best-effort */ }
    return confirmed;
  });
}
