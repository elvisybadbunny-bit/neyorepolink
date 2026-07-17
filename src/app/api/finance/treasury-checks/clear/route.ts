import { NextRequest } from "next/server";
import { getCurrentUser, requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { clearTreasuryCheck } from "@/lib/services/kenyan-extensions.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    requirePermission(user as any, "finance.record_payment");

    const { id } = await req.json().catch(() => ({}));
    if (!id) return handleError(new Error("id is required."));

    const cleared = await clearTreasuryCheck(user.tenantId, id, user);
    return ok({ check: cleared });
  } catch (err) {
    return handleError(err);
  }
}
