import { NextRequest } from "next/server";
import { getCurrentUser, requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { listBoardingExeatPasses, requestBoardingExeatPass } from "@/lib/services/kenyan-extensions.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    requirePermission(user as any, "student.view");

    const passes = await listBoardingExeatPasses(user.tenantId);
    return ok({ passes });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    requirePermission(user as any, "attendance.record");

    const body = await req.json().catch(() => ({}));
    const { studentId, reason, departureTime, expectedReturnTime } = body;
    if (!studentId || !reason || !departureTime || !expectedReturnTime) {
      return handleError(new Error("studentId, reason, departureTime, and expectedReturnTime required."));
    }

    const pass = await requestBoardingExeatPass(user.tenantId, { studentId, reason, departureTime, expectedReturnTime }, user);
    return ok({ pass });
  } catch (err) {
    return handleError(err);
  }
}
