/**
 * EE.8 — POST /api/academics/question-bank/attempt
 * Submit a student practice attempt for self-marking with zero running cost.
 * Returns `isCorrect`, correct working `explanation`, and SVG diagram.
 */

import { NextRequest } from "next/server";
import { requireUser } from "@/lib/core/session";
import { ok, fail, handleError } from "@/lib/api/respond";
import { submitStudentAttempt } from "@/lib/services/question-bank.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import { submitQuestionBankAttemptSchema } from "@/lib/validations/question-bank";
import { tenantDb } from "@/lib/core/tenant-db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    await assertEeFeatureReleased("EE.8");

    // Read the request body exactly once. Request streams cannot be consumed a
    // second time; the old teacher-demo path attempted req.json() twice and
    // produced the generic “something went wrong” response on Check Answer.
    const body = await req.json();
    const input = submitQuestionBankAttemptSchema.parse(body);

    // Resolve studentId: either the logged in student or student child associated with parent/teacher
    let studentId = "";
    if (user.role === "STUDENT") {
      const tdb = tenantDb();
      const student = await tdb.student.findFirst({ where: { userId: user.id } });
      if (!student) return fail("NOT_FOUND", "No student profile linked to your user account.", 404);
      studentId = student.id;
    } else {
      // For practice by teacher demo or explicit student parameter
      studentId = body.studentId || "";
      if (!studentId) {
        const tdb = tenantDb();
        const firstStudent = await tdb.student.findFirst({ where: { status: "ACTIVE" } });
        if (!firstStudent) return fail("NOT_FOUND", "No student found to attribute attempt.", 404);
        studentId = firstStudent.id;
      }
    }

    const marked = await submitStudentAttempt(user, studentId, input);
    return ok(marked);
  } catch (e) {
    return handleError(e);
  }
}
