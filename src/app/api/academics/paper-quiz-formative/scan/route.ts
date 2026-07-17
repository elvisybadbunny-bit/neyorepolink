/**
 * EE.9 — POST /api/academics/paper-quiz-formative/scan
 * Scan a paper quiz via OCR, auto-extract questions, and initialize a `PaperQuizFormativeBatch`.
 */

import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { scanPaperQuizToBatch } from "@/lib/services/paper-quiz-formative.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import { scanPaperQuizToFormativeSchema } from "@/lib/validations/paper-quiz-formative";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("academics.manage");
    await assertEeFeatureReleased("EE.9");

    const input = scanPaperQuizToFormativeSchema.parse(await req.json());
    const batch = await scanPaperQuizToBatch(user, input);
    return ok(batch);
  } catch (e) {
    return handleError(e);
  }
}
