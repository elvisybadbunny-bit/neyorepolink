/**
 * EE.9 — GET /api/academics/paper-quiz-formative/[id]
 * Get one specific paper quiz formative assessment batch with student score grid.
 */

import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { getPaperQuizBatch } from "@/lib/services/paper-quiz-formative.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requirePermission("academics.view");
    await assertEeFeatureReleased("EE.9");

    const batch = await getPaperQuizBatch(user, params.id);
    return ok(batch);
  } catch (e) {
    return handleError(e);
  }
}
