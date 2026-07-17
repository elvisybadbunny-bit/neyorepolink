/**
 * EE.10 — POST /api/academics/contests/[id]/attempt
 * Submit student answers for zero-cost self-marking against contest questions (`EE.10`).
 * Evaluates `answers`, records `ContestAttempt`, and returns exact score & time.
 */

import { NextRequest } from "next/server";
import { requireUser } from "@/lib/core/session";
import { ok, fail, handleError } from "@/lib/api/respond";
import { submitContestAttempt } from "@/lib/services/inter-school-contest.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import { submitContestAttemptSchema } from "@/lib/validations/inter-school-contest";
import { tenantDb } from "@/lib/core/tenant-db";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser();
    await assertEeFeatureReleased("EE.10");

    const body = await req.json();
    const input = submitContestAttemptSchema.parse({
      contestId: params.id,
      answers: body.answers || {},
      timeTakenSecs: body.timeTakenSecs || 120,
    });

    let studentId = body.studentId || "";
    if (!studentId) {
      if (user.role === "STUDENT") {
        const tdb = tenantDb();
        const st = await tdb.student.findFirst({ where: { userId: user.id } });
        if (!st) return fail("NOT_FOUND", "No student profile linked to your user account.", 404);
        studentId = st.id;
      } else {
        const tdb = tenantDb();
        const st = await tdb.student.findFirst({ where: { status: "ACTIVE" } });
        if (!st) return fail("NOT_FOUND", "No active student found to attribute attempt.", 404);
        studentId = st.id;
      }
    }

    const attempted = await submitContestAttempt(user, studentId, input);
    return ok(attempted);
  } catch (e) {
    return handleError(e);
  }
}
