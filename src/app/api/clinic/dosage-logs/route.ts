import { NextRequest } from "next/server";
import { getCurrentUser, requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { listTodayInfirmaryDosages, recordInfirmaryDosage } from "@/lib/services/kenyan-extensions.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    requirePermission(user as any, "student.view");

    const dosages = await listTodayInfirmaryDosages(user.tenantId);
    return ok({ dosages });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    requirePermission(user as any, "student.edit");

    const body = await req.json().catch(() => ({}));
    const { studentId, studentName, medicationPlanId, doseName, scheduledTime, status, notes } = body;
    if (!studentId || !doseName || !scheduledTime || !status) {
      return handleError(new Error("studentId, doseName, scheduledTime, and status required."));
    }

    const log = await recordInfirmaryDosage(user.tenantId, { studentId, studentName, medicationPlanId, doseName, scheduledTime, status, notes }, user);
    return ok({ dosage: log });
  } catch (err) {
    return handleError(err);
  }
}
