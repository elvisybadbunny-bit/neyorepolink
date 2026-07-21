import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { fail, handleError, ok } from "@/lib/api/respond";
import { getConsolidatedReportContext } from "@/lib/services/consolidated-report-context.service";

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
      await getConsolidatedReportContext(
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
