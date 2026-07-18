import { NextRequest } from "next/server";
import { getCurrentUser, requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { createTreasuryCheck, listTreasuryChecks } from "@/lib/services/kenyan-extensions.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    await requirePermission("finance.view");

    const checks = await listTreasuryChecks(user.tenantId);
    return ok({ checks });
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
    const { checkOrSlipNo, bankName, maturityDate, amountKes, studentId, guardianId } = body;
    if (!checkOrSlipNo || !bankName || !maturityDate || !amountKes) {
      return handleError(new Error("checkOrSlipNo, bankName, maturityDate, and amountKes required."));
    }

    const check = await createTreasuryCheck(user.tenantId, { checkOrSlipNo, bankName, maturityDate, amountKes, studentId, guardianId }, user);
    return ok({ check });
  } catch (err) {
    return handleError(err);
  }
}
