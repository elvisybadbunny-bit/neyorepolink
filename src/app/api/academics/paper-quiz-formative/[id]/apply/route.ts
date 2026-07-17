/**
 * EE.9 — POST /api/academics/paper-quiz-formative/[id]/apply
 * 1-Click Post: records all scored student entries (`EE/ME/AE/BE`) from the paper quiz
 * directly into the live `CbcAssessment` table inside a clean database `$transaction`.
 */

import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { applyBatchToCbcAssessments } from "@/lib/services/paper-quiz-formative.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import { applyPaperQuizFormativeSchema } from "@/lib/validations/paper-quiz-formative";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requirePermission("academics.manage");
    await assertEeFeatureReleased("EE.9");

    const body = await req.json().catch(() => ({}));
    const input = applyPaperQuizFormativeSchema.parse({
      batchId: params.id,
      date: body.date,
    });

    const applied = await applyBatchToCbcAssessments(user, input);
    return ok(applied);
  } catch (e) {
    return handleError(e);
  }
}
