import { NextRequest } from "next/server";
import { getCurrentUser, requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { listSuspenseReceipts, recordSuspenseReceipt } from "@/lib/services/mpesa-suspense.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    await requirePermission("finance.view");

    // Founder Ops can see all suspense; school bursar sees only their tenant's or unassigned suspense
    const tenantId = user.role === "FOUNDER" || user.role === "SUPER_ADMIN" ? null : user.tenantId;
    const receipts = await listSuspenseReceipts(tenantId);
    return ok({ receipts });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    await requirePermission("finance.record_payment");

    const body = await req.json().catch(() => ({}));
    const { transId, transTime, transAmount, billRefNumber, mpesaSenderPhone, mpesaSenderName } = body;
    if (!transId || !transTime || !transAmount || !mpesaSenderPhone) {
      return handleError(new Error("transId, transTime, transAmount, and mpesaSenderPhone required."));
    }

    const created = await recordSuspenseReceipt({
      tenantId: user.tenantId,
      transId,
      transTime,
      transAmount: Number(transAmount),
      billRefNumber: billRefNumber || "UNASSIGNED",
      mpesaSenderPhone,
      mpesaSenderName: mpesaSenderName || "M-PESA USER",
    });

    return ok({ receipt: created });
  } catch (err) {
    return handleError(err);
  }
}
