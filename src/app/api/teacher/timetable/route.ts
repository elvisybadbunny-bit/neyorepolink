/**
 * B.12 "View own timetable" API.
 * GET /api/teacher/timetable — the signed-in teacher's weekly slots
 * (reuses B.4 teacherTimetable()).
 */
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { teacherTimetable } from "@/lib/services/academics.service";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requirePermission("portal.teacher");
    const slots = await teacherTimetable(user, user.id);
    const classIds = [...new Set(slots.map((slot) => slot.classId))];
    const configs = classIds.length ? await db.timetableConfig.findMany({ where: { tenantId: user.tenantId, classId: { in: classIds } } }) : [];
    return ok({ slots, configs });
  } catch (e) {
    return handleError(e);
  }
}
