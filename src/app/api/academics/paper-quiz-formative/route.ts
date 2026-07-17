/**
 * EE.9 — GET/POST /api/academics/paper-quiz-formative
 * GET: list paper quiz formative assessment batches (`listPaperQuizBatches`).
 * POST: create a new formative batch mapped to a KICD strand (`createPaperQuizBatch`).
 */

import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import {
  listPaperQuizBatches,
  createPaperQuizBatch,
} from "@/lib/services/paper-quiz-formative.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import { createPaperQuizBatchSchema } from "@/lib/validations/paper-quiz-formative";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission("academics.view");
    await assertEeFeatureReleased("EE.9");

    const classId = req.nextUrl.searchParams.get("classId") || undefined;
    const strandId = req.nextUrl.searchParams.get("strandId") || undefined;

    const batches = await listPaperQuizBatches(user, { classId, strandId });
    return ok({ batches });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("academics.manage");
    await assertEeFeatureReleased("EE.9");

    const input = createPaperQuizBatchSchema.parse(await req.json());
    const batch = await createPaperQuizBatch(user, input);
    return ok(batch);
  } catch (e) {
    return handleError(e);
  }
}
