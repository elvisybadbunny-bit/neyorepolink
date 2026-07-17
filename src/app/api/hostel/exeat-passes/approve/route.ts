import { NextRequest } from "next/server";
import { getCurrentUser, requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { approveBoardingExeatPass } from "@/lib/services/kenyan-extensions.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    requirePermission(user as any, "attendance.record");

    const { id, status } = await req.json().catch(() => ({}));
    if (!id || (status !== "APPROVED" && status !== "REJECTED")) {
      return handleError(new Error("id and status (APPROVED/REJECTED) required."));
    }

    const updated = await approveBoardingExeatPass(user.tenantId, id, status, user);
    return ok({ pass: updated });
  } catch (err) {
    return handleError(err);
  }
}
