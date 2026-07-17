import { NextRequest } from "next/server";
import { getCurrentUser, requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { createPtaConsultationSlots, listPtaConsultationSlots } from "@/lib/services/kenyan-extensions.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));

    const teacherId = new URL(req.url).searchParams.get("teacherId") || "ALL";
    const slots = await listPtaConsultationSlots(user.tenantId, teacherId);
    return ok({ slots });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    requirePermission(user as any, "academics.manage");

    const body = await req.json().catch(() => ({}));
    const { teacherId, teacherName, slotDate, startTimes, durationMins } = body;
    if (!teacherId || !slotDate || !Array.isArray(startTimes) || startTimes.length === 0) {
      return handleError(new Error("teacherId, slotDate, and startTimes array required."));
    }

    const created = await createPtaConsultationSlots(user.tenantId, teacherId, teacherName || user.fullName, slotDate, startTimes, durationMins || 15, user);
    return ok({ slots: created, count: created.length });
  } catch (err) {
    return handleError(err);
  }
}
