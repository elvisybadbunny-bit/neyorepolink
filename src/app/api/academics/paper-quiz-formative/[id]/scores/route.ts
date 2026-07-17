/**
 * EE.9 — POST /api/academics/paper-quiz-formative/[id]/scores
 * Rapid numerical score entry: updates student quiz scores and deterministically converts them
 * into official KICD 4-point CBC/CBE rubric levels (`EE / ME / AE / BE`).
 */

import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { updateBatchStudentScores } from "@/lib/services/paper-quiz-formative.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import { updateBatchStudentScoresSchema } from "@/lib/validations/paper-quiz-formative";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requirePermission("academics.manage");
    await assertEeFeatureReleased("EE.9");

    const body = await req.json();
    const input = updateBatchStudentScoresSchema.parse({
      batchId: params.id,
      studentScores: body.studentScores || [],
    });

    const updated = await updateBatchStudentScores(user, input);
    return ok(updated);
  } catch (e) {
    return handleError(e);
  }
}
