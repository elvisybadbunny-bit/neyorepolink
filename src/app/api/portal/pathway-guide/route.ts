/** Y.1 — Parent Portal: view a real child's past Pathway Guide sessions (row-scoped in the service layer). */
import { NextRequest } from "next/server";
import { requireUser } from "@/lib/core/session";
import { ok, fail, handleError } from "@/lib/api/respond";
import { myGuideSessionsForStudent, isPathwayGuideInAppEnabled } from "@/lib/services/pathway-guide.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    if (!(await isPathwayGuideInAppEnabled())) {
      return fail("FORBIDDEN", "The NEYO Pathway Guide is temporarily unavailable. Please check back soon.", 403);
    }
    const studentId = req.nextUrl.searchParams.get("studentId") || "";
    if (!studentId) return fail("VALIDATION_ERROR", "studentId is required.", 422);
    return ok(await myGuideSessionsForStudent(user, studentId));
  } catch (e) {
    return handleError(e);
  }
}
