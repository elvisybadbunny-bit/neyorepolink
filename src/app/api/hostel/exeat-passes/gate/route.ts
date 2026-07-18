import { NextRequest } from "next/server";
import { getCurrentUser, requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { gateCheckExeatPass } from "@/lib/services/kenyan-extensions.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    await requirePermission("attendance.record");

    const { passNo, action } = await req.json().catch(() => ({}));
    if (!passNo || (action !== "CHECK_OUT" && action !== "CHECK_IN")) {
      return handleError(new Error("passNo and action (CHECK_OUT/CHECK_IN) required."));
    }

    const updated = await gateCheckExeatPass(user.tenantId, passNo, action, user);
    return ok({ pass: updated });
  } catch (err) {
    return handleError(err);
  }
}
