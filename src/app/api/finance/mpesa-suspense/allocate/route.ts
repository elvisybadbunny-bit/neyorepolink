import { NextRequest } from "next/server";
import { getCurrentUser, requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { allocateSuspenseReceipt } from "@/lib/services/mpesa-suspense.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    requirePermission(user as any, "finance.record_payment");

    const { suspenseId, targetStudentId, targetInvoiceId } = await req.json().catch(() => ({}));
    if (!suspenseId || !targetStudentId) {
      return handleError(new Error("suspenseId and targetStudentId required."));
    }

    const allocated = await allocateSuspenseReceipt(suspenseId, targetStudentId, targetInvoiceId || null, user);
    return ok({ receipt: allocated });
  } catch (err) {
    return handleError(err);
  }
}
