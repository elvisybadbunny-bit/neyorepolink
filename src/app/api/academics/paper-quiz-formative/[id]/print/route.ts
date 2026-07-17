/**
 * EE.9 — GET /api/academics/paper-quiz-formative/[id]/print
 * Generate exact printable student paper quiz sheet (`FQ-QUIZ-...`) with top-right rubric grading box.
 */

import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { getPrintableFormativeQuizSheet } from "@/lib/services/paper-quiz-formative.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requirePermission("academics.view");
    await assertEeFeatureReleased("EE.9");

    const printSheet = await getPrintableFormativeQuizSheet(user, params.id);
    return ok(printSheet);
  } catch (e) {
    return handleError(e);
  }
}
