/**
 * EE.6 — GET /api/academics/exam-papers/public-library
 * Browse/search the National Public Exam Paper Library (`PUBLIC_SHARED` + `APPROVED` across all NEYO schools).
 */

import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { listPublicSharedExamPapers } from "@/lib/services/exam-paper-sharing.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import { listPublicSharedQuerySchema } from "@/lib/validations/exam-paper-sharing";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requirePermission("academics.view");
    await assertEeFeatureReleased("EE.6");

    const query = listPublicSharedQuerySchema.parse({
      subjectCode: req.nextUrl.searchParams.get("subjectCode") || undefined,
      level: req.nextUrl.searchParams.get("level") || undefined,
      search: req.nextUrl.searchParams.get("search") || undefined,
    });

    const papers = await listPublicSharedExamPapers(query);
    return ok({ papers });
  } catch (e) {
    return handleError(e);
  }
}
