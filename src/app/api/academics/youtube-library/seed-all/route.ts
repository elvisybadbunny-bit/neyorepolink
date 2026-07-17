/**
 * POST /api/academics/youtube-library/seed-all — EE.7
 * Idempotently seeds our curated KICD YouTube Learning Library across all subjects, strands, and sub-strands.
 */

import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import { seedAllYouTubeLearningVideos } from "@/lib/services/youtube-learning.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("academics.manage");
    await assertEeFeatureReleased("EE.7");

    const result = await seedAllYouTubeLearningVideos(user);
    return ok(result);
  } catch (error: any) {
    return handleError(error);
  }
}
