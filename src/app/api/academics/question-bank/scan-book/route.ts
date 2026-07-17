/**
 * EE.8 — POST /api/academics/question-bank/scan-book
 * Scan a textbook page or worksheet via Bundi Intelligent OCR (`enhanceImageForOcr` + `runLocalOcr`),
 * and extract structured candidate questions ready for 1-click bank addition.
 */

import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { scanAndExtractQuestionsFromBook } from "@/lib/services/question-bank.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import { scanBookForQuestionsSchema } from "@/lib/validations/question-bank";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("academics.manage");
    await assertEeFeatureReleased("EE.8");

    const input = scanBookForQuestionsSchema.parse(await req.json());
    const extracted = await scanAndExtractQuestionsFromBook(user, input);
    return ok(extracted);
  } catch (e) {
    return handleError(e);
  }
}
