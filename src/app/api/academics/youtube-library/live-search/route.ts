/**
 * EE.7 — GET /api/academics/youtube-library/live-search
 * Live search against YouTube Data API v3 ONLY when quota permits (`100 units`).
 * Automatically falls back to zero-quota national DB matches when offline or unconfigured.
 */

import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { searchLiveYouTubeIfQuotaAllowed } from "@/lib/services/youtube-learning.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission("academics.view");
    await assertEeFeatureReleased("EE.7");

    const query = req.nextUrl.searchParams.get("query") || "";
    const result = await searchLiveYouTubeIfQuotaAllowed(user, query);
    return ok(result);
  } catch (e) {
    return handleError(e);
  }
}
