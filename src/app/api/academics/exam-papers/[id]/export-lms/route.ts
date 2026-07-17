/**
 * EE.5 — POST /api/academics/exam-papers/[id]/export-lms
 * 1-Click Export: automatically converts a tidied `ScannedExamPaper`
 * into a live `Quiz` and `QuizQuestion` set under the `Quiz` model inside the school's LMS.
 */

import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { exportScannedPaperToLmsQuiz } from "@/lib/services/exam-paper-scan.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import { exportToLmsQuizSchema } from "@/lib/validations/exam-paper-scan";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requirePermission("academics.manage");
    await assertEeFeatureReleased("EE.5");

    const body = await req.json().catch(() => ({}));
    const input = exportToLmsQuizSchema.parse({
      paperId: params.id,
      quizTitle: body.quizTitle,
      publishImmediately: body.publishImmediately ?? true,
    });

    const exported = await exportScannedPaperToLmsQuiz(user, input);
    return ok(exported);
  } catch (e) {
    return handleError(e);
  }
}
