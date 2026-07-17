import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import { applyUniversalCbcPresets } from "@/lib/services/universal-presets.service";

export const dynamic = "force-dynamic";

/**
 * POST /api/cbc/universal-presets (`EE.15` — Universal CBC/CBE Presets Engine)
 * "Where the schools never need to type in adding they just add the presets."
 * 1-Click applies 7 Universal Competencies, 4-Point Formative Rubrics, and Core Values/Duties.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("academics.manage");
    await assertEeFeatureReleased("EE.15");

    const body = await req.json().catch(() => ({}));
    const presetType = body.presetType || "ALL";

    const result = await applyUniversalCbcPresets(user, presetType);
    return ok({ result });
  } catch (err) {
    return handleError(err);
  }
}
