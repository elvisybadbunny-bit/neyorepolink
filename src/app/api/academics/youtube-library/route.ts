/**
 * EE.7 — GET/POST /api/academics/youtube-library
 * GET: Browse approved learning videos with ZERO YouTube API quota cost (`EE.7`).
 * POST: Submit or save a YouTube learning video link for a KICD strand or school library.
 */

import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import {
  listLearningVideos,
  submitLearningVideo,
} from "@/lib/services/youtube-learning.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import {
  listLearningVideosQuerySchema,
  submitLearningVideoSchema,
} from "@/lib/validations/youtube-learning";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission("academics.view");
    await assertEeFeatureReleased("EE.7");

    const query = listLearningVideosQuerySchema.parse({
      subjectId: req.nextUrl.searchParams.get("subjectId") || undefined,
      strandId: req.nextUrl.searchParams.get("strandId") || undefined,
      substrandId: req.nextUrl.searchParams.get("substrandId") || undefined,
      grade: req.nextUrl.searchParams.get("grade") || undefined,
      scope: req.nextUrl.searchParams.get("scope") || "ALL",
      search: req.nextUrl.searchParams.get("search") || undefined,
    });

    const videos = await listLearningVideos(user, query);
    return ok({ videos });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("academics.manage");
    await assertEeFeatureReleased("EE.7");

    const input = submitLearningVideoSchema.parse(await req.json());
    const saved = await submitLearningVideo(user, input);
    return ok(saved);
  } catch (e) {
    return handleError(e);
  }
}
