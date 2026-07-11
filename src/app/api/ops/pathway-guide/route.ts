/**
 * Y.1 — NEYO Ops (SUPER_ADMIN) Pathway Guide controls.
 * GET  -> current settings (in-app/public flags + fee) + usage summary + recent sessions.
 * POST { action: "set_in_app" | "set_public" | "set_fee" | "seed_kuccps" }
 */
import { NextRequest } from "next/server";
import { requireRole } from "@/lib/core/session";
import { ok, fail, handleError } from "@/lib/api/respond";
import {
  getPathwayGuideOpsSettings,
  setPathwayGuideInAppEnabled,
  setPathwayGuidePublicEnabled,
  setPathwayGuideFeeKes,
  seedKuccpsClusters,
  listKuccpsClusters,
  listRecentGuideSessions,
  guideUsageSummary,
} from "@/lib/services/pathway-guide.service";
import { setGuideFeeSchema } from "@/lib/validations/pathway-guide";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireRole("SUPER_ADMIN");
    const [settings, clusters, sessions, usage] = await Promise.all([
      getPathwayGuideOpsSettings(),
      listKuccpsClusters(),
      listRecentGuideSessions(50),
      guideUsageSummary(),
    ]);
    return ok({ settings, clusters, sessions, usage });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole("SUPER_ADMIN");
    const body = await req.json();

    if (body?.action === "set_in_app") {
      return ok(await setPathwayGuideInAppEnabled(user, Boolean(body?.enabled)));
    }
    if (body?.action === "set_public") {
      return ok(await setPathwayGuidePublicEnabled(user, Boolean(body?.enabled)));
    }
    if (body?.action === "set_fee") {
      const input = setGuideFeeSchema.parse(body);
      return ok(await setPathwayGuideFeeKes(user, input.amountKes));
    }
    if (body?.action === "seed_kuccps") {
      return ok(await seedKuccpsClusters(user));
    }

    return fail("VALIDATION_ERROR", "Unknown action.", 422);
  } catch (e) {
    return handleError(e);
  }
}
