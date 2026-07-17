/**
 * EE.8 — GET /api/academics/question-bank/student-suggestions
 * Smart Weakness Focus (`EE.8`): suggests practice questions targeting specific strands
 * where the student scored below expectation (`1=BE` or `2=AE`) or missed past attempts.
 */

import { NextRequest } from "next/server";
import { requireUser } from "@/lib/core/session";
import { ok, fail, handleError } from "@/lib/api/respond";
import { getSuggestedQuestionsForStudent } from "@/lib/services/question-bank.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import { tenantDb } from "@/lib/core/tenant-db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    await assertEeFeatureReleased("EE.8");

    let studentId = req.nextUrl.searchParams.get("studentId") || "";
    if (!studentId) {
      if (user.role === "STUDENT") {
        const tdb = tenantDb();
        const st = await tdb.student.findFirst({ where: { userId: user.id } });
        if (st) studentId = st.id;
      } else {
        const tdb = tenantDb();
        const st = await tdb.student.findFirst({ where: { status: "ACTIVE" } });
        if (st) studentId = st.id;
      }
    }
    if (!studentId) return ok({ suggestions: [] });

    const subjectId = req.nextUrl.searchParams.get("subjectId") || undefined;
    const suggestions = await getSuggestedQuestionsForStudent(user, studentId, { subjectId });
    return ok({ suggestions });
  } catch (e) {
    return handleError(e);
  }
}
