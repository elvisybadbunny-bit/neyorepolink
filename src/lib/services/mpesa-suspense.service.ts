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
  if (!student) throw new MpesaSuspenseError("NOT_FOUND", "Target student not found.");

  // If an invoice is specified, allocate payment to it
  if (targetInvoiceId) {
    const invoice = await db.invoice.findUnique({ where: { id: targetInvoiceId } });
    if (invoice && invoice.tenantId === student.tenantId) {
      const newPaid = invoice.paidKes + receipt.transAmount;
      const netTotal = invoice.totalKes - invoice.discountKes;
      const newStatus = newPaid >= netTotal ? "PAID" : newPaid > 0 ? "PARTIAL" : "UNPAID";
      await db.invoice.update({
        where: { id: invoice.id },
        data: { paidKes: newPaid, status: newStatus },
      });
    }
  }

  const stName = `${student.firstName} ${student.lastName}`.trim();

  // Create payment record in student ledger
  await db.payment.create({
    data: {
      tenantId: student.tenantId,
      invoiceId: targetInvoiceId || undefined,
      accountRef: student.admissionNo,
      phone: receipt.mpesaSenderPhone,
      amount: receipt.transAmount,
      provider: "mpesa_daraja",
      mpesaRef: receipt.transId,
      status: "PAID",
      description: `Suspense allocation by ${actor.fullName}`,
      paidAt: new Date(),
    } as any,
  });

  const updated = await db.mpesaSuspenseReceipt.update({
    where: { id: receipt.id },
    data: {
      status: "ALLOCATED",
      tenantId: student.tenantId,
      allocatedToStudentId: student.id,
      allocatedToInvoiceId: targetInvoiceId || null,
      allocatedAt: new Date(),
      allocatedBy: actor.fullName,
    },
  });

  await db.auditLog.create({
    data: {
      tenantId: student.tenantId,
      actorId: actor.id,
      actorName: actor.fullName,
      action: "finance.mpesa_suspense_allocated",
      entityType: "MpesaSuspenseReceipt",
      entityId: updated.id,
      metadata: JSON.stringify({ transId: receipt.transId, amount: receipt.transAmount, studentId: student.id, studentName: stName }),
    },
  }).catch(() => {});

  return updated;
}
