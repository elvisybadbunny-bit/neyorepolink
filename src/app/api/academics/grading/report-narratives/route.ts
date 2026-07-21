import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { fail, handleError, ok } from "@/lib/api/respond";
import {
  getOrCreateReportNarratives,
  ReportNarrativeError,
  saveLeadershipRemark,
  saveSubjectComment,
} from "@/lib/services/report-narrative.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission("academics.view");
    const termId = request.nextUrl.searchParams.get("termId");
    const classId = request.nextUrl.searchParams.get("classId");
    const studentId = request.nextUrl.searchParams.get("studentId");
    if (!termId || !classId || !studentId)
      return fail(
        "INVALID",
        "termId, classId and studentId are required.",
        400,
      );
    return ok(
      await getOrCreateReportNarratives(
        user.tenantId,
        termId,
        classId,
        studentId,
      ),
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requirePermission("academics.manage");
    const body = await request.json();
    const actor = { id: user.id, fullName: user.fullName, role: user.role };
    if (body.action === "SAVE_SUBJECT_COMMENT")
      return ok(await saveSubjectComment(user.tenantId, actor, body));
    if (body.action === "SAVE_REMARK")
      return ok(await saveLeadershipRemark(user.tenantId, actor, body));
    return fail("INVALID", "Choose a supported report narrative action.", 400);
  } catch (error) {
    if (error instanceof ReportNarrativeError)
      return fail("INVALID", error.message, 400);
    return handleError(error);
  }
}
