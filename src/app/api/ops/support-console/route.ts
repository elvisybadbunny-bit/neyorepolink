/**
 * Y.2 — NEYO Support Console. Reachable by FOUNDER (unrestricted) and by
 * any NEYO_OPS/NEYO_SUPPORT account with the real "neyo.customer_requests"
 * permission (their base role grants it by default per the founder's own
 * decision, but this route is permission-gated, not role-gated, so a
 * future custom-tuned account without it is correctly still blocked).
 * GET  -> quote requests + custom feature requests + waitlist entries.
 * POST { action: "send_formal_quote" | "mark_onboarding_done" | "update_feature_request" }
 */
import { NextRequest } from "next/server";
import { requireUser } from "@/lib/core/session";
import { ok, fail, handleError } from "@/lib/api/respond";
import {
  supportConsoleDashboard,
  supportSendFormalQuote,
  supportMarkOnboardingAssistanceDone,
  supportUpdateCustomFeatureRequest,
} from "@/lib/services/neyo-support.service";
import { sendFormalQuoteSchema } from "@/lib/validations/pricing-engine";
import { updateCustomFeatureRequestSchema } from "@/lib/validations/custom-feature-request";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    return ok(await supportConsoleDashboard(user));
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();

    if (body?.action === "send_formal_quote") {
      const input = sendFormalQuoteSchema.parse(body);
      return ok(await supportSendFormalQuote(user, input));
    }
    if (body?.action === "mark_onboarding_done") {
      const id = String(body?.id || "");
      if (!id) return fail("VALIDATION_ERROR", "id is required.", 422);
      return ok(await supportMarkOnboardingAssistanceDone(user, id));
    }
    if (body?.action === "update_feature_request") {
      const requestId = String(body?.requestId || "");
      if (!requestId) return fail("VALIDATION_ERROR", "requestId is required.", 422);
      const input = updateCustomFeatureRequestSchema.parse(body);
      return ok(await supportUpdateCustomFeatureRequest(user, requestId, input));
    }

    return fail("VALIDATION_ERROR", "Unknown action.", 422);
  } catch (e) {
    return handleError(e);
  }
}
