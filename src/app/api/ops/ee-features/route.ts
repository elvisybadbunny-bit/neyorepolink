/**
 * Part-EE feature toggles — NEYO Ops (SUPER_ADMIN) only.
 *
 * Founder requirement (2026-07-16, verbatim): "remember that every idea must
 * have a release button to be fully released" — every Part-EE feature ships
 * OFF platform-wide by default; NEYO Ops releases each one individually.
 *
 * GET  /api/ops/ee-features — list every Part-EE feature with its release state
 * POST /api/ops/ee-features { id, enabled, note? } — release/pause a feature
 */
import { NextRequest } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { listEeFeatureFlags, setEeFeatureReleased } from "@/lib/services/platform-flags.service";
import { EE_FEATURE_IDS } from "@/lib/core/ee-features";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireRole("SUPER_ADMIN");
    return ok({ features: await listEeFeatureFlags() });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole("SUPER_ADMIN");
    const input = z
      .object({
        id: z.enum(EE_FEATURE_IDS as [string, ...string[]]),
        enabled: z.boolean(),
        note: z.string().trim().max(200).optional(),
      })
      .parse(await req.json().catch(() => ({})));

    const row = await setEeFeatureReleased(user, input.id, input.enabled, input.note);
    return ok({ id: input.id, enabled: !row.paused, note: row.note });
  } catch (e) {
    return handleError(e);
  }
}
