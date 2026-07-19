import { db } from "@/lib/db";
import { type SessionUser } from "@/lib/core/session";

/**
 * Idea 1.1 — Automated M-Pesa Suspense Ledger & Auto-Reconciler.
 * Catches unmatched/orphan M-Pesa IPN receipts, runs fuzzy AI/Phone matching
 * against enrolled students & guardians, and allows 1-click allocation.
 */

export class MpesaSuspenseError extends Error {
  constructor(public code: "NOT_FOUND" | "ALREADY_ALLOCATED" | "INVALID", message: string) {
    super(message);
    this.name = "MpesaSuspenseError";
  }
}

export async function recordSuspenseReceipt(input: {
  tenantId?: string | null;
  transId: string;
  transTime: string;
  transAmount: number;
  billRefNumber: string;
  mpesaSenderPhone: string;
  mpesaSenderName: string;
}) {
  const existing = await db.mpesaSuspenseReceipt.findUnique({ where: { transId: input.transId } });
  if (existing) return existing;

  // Run initial fuzzy match across students / guardians if tenantId or phone is known
  let matchScore = 0;
  const reasons: string[] = [];
  let bestTenantId = input.tenantId || null;

  if (input.mpesaSenderPhone) {
    const cleanPhone = input.mpesaSenderPhone.replace(/\s+/g, "").replace(/^\+/, "");
    // Check if phone matches any guardian across the platform
    const guardian = await db.guardian.findFirst({
      where: {
        ...(bestTenantId ? { tenantId: bestTenantId } : {}),
        OR: [
          { phone: { contains: cleanPhone } },
          { phone: { contains: cleanPhone.slice(-9) } },
        ],
      },
      include: { students: { include: { student: { select: { id: true, firstName: true, lastName: true, admissionNo: true, tenantId: true } } } } },
    });

    if (guardian && guardian.students.length > 0) {
      const st = guardian.students[0].student;
      const stName = `${st.firstName} ${st.lastName}`.trim();
      matchScore += 65;
      reasons.push(`Phone match: Guardian ${guardian.fullName} (${guardian.phone}) linked to student ${stName} (${st.admissionNo})`);
      if (!bestTenantId) bestTenantId = st.tenantId;
    }
  }

  // Check if billRefNumber loosely matches any student admission number
  if (input.billRefNumber && bestTenantId) {
    const cleanRef = input.billRefNumber.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const student = await db.student.findFirst({
      where: {
        tenantId: bestTenantId,
        OR: [
          { admissionNo: { equals: input.billRefNumber } },
          { admissionNo: { contains: cleanRef } },
        ],
      },
    });
    if (student) {
      const stName = `${student.firstName} ${student.lastName}`.trim();
      matchScore = Math.min(100, matchScore + 35);
      reasons.push(`Admission match: BillRef '${input.billRefNumber}' matches student ${stName} (${student.admissionNo})`);
    }
  }

  return db.mpesaSuspenseReceipt.create({
    data: {
      tenantId: bestTenantId,
      transId: input.transId,
      transTime: input.transTime,
      transAmount: input.transAmount,
      billRefNumber: input.billRefNumber,
      mpesaSenderPhone: input.mpesaSenderPhone,
      mpesaSenderName: input.mpesaSenderName,
      status: "UNMATCHED",
      matchScore,
      matchReasonsJson: JSON.stringify(reasons),
    },
  });
}

export async function listSuspenseReceipts(tenantId?: string | null) {
  const where: any = {};
  if (tenantId) where.tenantId = tenantId;
  return db.mpesaSuspenseReceipt.findMany({
    where,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
  });
}

export async function allocateSuspenseReceipt(
  suspenseId: string,
  targetStudentId: string,
  targetInvoiceId: string | null,
  actor: SessionUser
) {
  const receipt = await db.mpesaSuspenseReceipt.findUnique({ where: { id: suspenseId } });
  if (!receipt) throw new MpesaSuspenseError("NOT_FOUND", "Suspense receipt not found.");
  if (receipt.status === "ALLOCATED") throw new MpesaSuspenseError("ALREADY_ALLOCATED", "This receipt is already allocated.");

  const student = await db.student.findUnique({ where: { id: targetStudentId } });
  if (!student || student.tenantId !== actor.tenantId || (receipt.tenantId && receipt.tenantId !== actor.tenantId)) {
    throw new MpesaSuspenseError("NOT_FOUND", "Receipt or student not found for this school.");
  }
  const duplicatePayment = await db.payment.findUnique({ where: { mpesaRef: receipt.transId } });
  if (duplicatePayment) throw new MpesaSuspenseError("ALREADY_ALLOCATED", "This M-Pesa reference is already recorded.");

  const stName = `${student.firstName} ${student.lastName}`.trim();
  return db.$transaction(async (tx) => {
    // Claim the receipt atomically. A second click/request updates zero rows and
    // cannot post the same receipt or increase an invoice twice.
    const claimed = await tx.mpesaSuspenseReceipt.updateMany({
      where: { id: receipt.id, status: "UNMATCHED" },
      data: { status: "ALLOCATING" },
    });
    if (claimed.count !== 1) throw new MpesaSuspenseError("ALREADY_ALLOCATED", "This receipt is already being allocated or was allocated.");

    if (targetInvoiceId) {
      const invoice = await tx.invoice.findUnique({ where: { id: targetInvoiceId } });
      if (!invoice || invoice.tenantId !== student.tenantId || invoice.studentId !== student.id) {
        throw new MpesaSuspenseError("INVALID", "The selected invoice does not belong to this student.");
      }
      const newPaid = invoice.paidKes + receipt.transAmount;
      const netTotal = invoice.totalKes - invoice.discountKes;
      await tx.invoice.update({ where: { id: invoice.id }, data: { paidKes: newPaid, status: newPaid >= netTotal ? "PAID" : "PARTIAL" } });
    }

    await tx.payment.create({ data: {
      tenantId: student.tenantId, invoiceId: targetInvoiceId || undefined,
      accountRef: student.admissionNo, phone: receipt.mpesaSenderPhone,
      amount: receipt.transAmount, provider: "mpesa_daraja", mpesaRef: receipt.transId,
      status: "PAID", description: `Suspense allocation by ${actor.fullName}`, paidAt: new Date(),
    } as any });

    const updated = await tx.mpesaSuspenseReceipt.update({ where: { id: receipt.id }, data: {
      status: "ALLOCATED", tenantId: student.tenantId, allocatedToStudentId: student.id,
      allocatedToInvoiceId: targetInvoiceId || null, allocatedAt: new Date(), allocatedBy: actor.fullName,
    } });
    await tx.auditLog.create({ data: {
      tenantId: student.tenantId, actorId: actor.id, actorName: actor.fullName,
      action: "finance.mpesa_suspense_allocated", entityType: "MpesaSuspenseReceipt", entityId: updated.id,
      metadata: JSON.stringify({ transId: receipt.transId, amount: receipt.transAmount, studentId: student.id, studentName: stName }),
    } });
    return updated;
  });
}
