import { NextRequest } from "next/server";
import { getCurrentUser, requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { listTeacherRecordsOfWork, recordSyllabusWorkCovered } from "@/lib/services/kenyan-extensions.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    requirePermission(user as any, "academics.view");

    const teacherId = new URL(req.url).searchParams.get("teacherId") || "ALL";
    const subjectId = new URL(req.url).searchParams.get("subjectId") || "ALL";
    const classId = new URL(req.url).searchParams.get("classId") || "ALL";

    const records = await listTeacherRecordsOfWork(user.tenantId, teacherId, subjectId, classId);
    return ok({ records });
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
    const { teacherId, teacherName, subjectId, classId, strandName, substrandName, weekNumber, dateCovered, status, supervisorComment } = body;
    if (!teacherId || !subjectId || !classId || !strandName || !weekNumber || !dateCovered) {
      return handleError(new Error("teacherId, subjectId, classId, strandName, weekNumber, and dateCovered required."));
    }

    const rec = await recordSyllabusWorkCovered(user.tenantId, {
      teacherId,
      teacherName: teacherName || user.fullName,
      subjectId,
      classId,
      strandName,
      substrandName: substrandName || "",
      weekNumber: Number(weekNumber),
      dateCovered,
      status: status || "COVERED",
      supervisorComment,
    }, user);

    return ok({ record: rec });
  } catch (err) {
    return handleError(err);
  }
}
