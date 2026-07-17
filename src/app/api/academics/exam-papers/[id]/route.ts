/**
 * EE.5 — GET /api/academics/exam-papers/[id]
 * Retrieves one specific tidied exam paper by its `id`.
 */

import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { getScannedExamPaper } from "@/lib/services/exam-paper-scan.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requirePermission("academics.view");
    await assertEeFeatureReleased("EE.5");

    const paper = await getScannedExamPaper(user, params.id);
    return ok(paper);
  } catch (e) {
    return handleError(e);
  }
}
