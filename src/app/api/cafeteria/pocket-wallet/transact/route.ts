import { NextRequest } from "next/server";
import { getCurrentUser, requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { depositPocketMoney, spendPocketMoney } from "@/lib/services/kenyan-extensions.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    await requirePermission("finance.record_payment");

    const body = await req.json().catch(() => ({}));
    const { studentId, action, amountKes, description } = body; // action: "DEPOSIT" | "SPEND"
    if (!studentId || !action || !amountKes) {
      return handleError(new Error("studentId, action, and amountKes required."));
    }

    if (action === "DEPOSIT") {
      const updated = await depositPocketMoney(user.tenantId, studentId, Number(amountKes), description || "Deposit", user);
      return ok({ wallet: updated });
    } else {
      const updated = await spendPocketMoney(user.tenantId, studentId, Number(amountKes), description || "Purchase", user);
      return ok({ wallet: updated });
    }
  } catch (err) {
    return handleError(err);
  }
}
