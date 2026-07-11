/**
 * T.3 — School-facing custom feature request pipeline.
 * GET  -> the school's own real requests (row-scoped, tenant.manage_settings)
 * POST { action: "create" | "reply" }
 */
import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { createCustomFeatureRequestSchema, replyCustomFeatureRequestSchema } from "@/lib/validations/custom-feature-request";
import { createCustomFeatureRequest, listMyCustomFeatureRequests, replyToCustomFeatureQuote } from "@/lib/services/custom-feature-request.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requirePermission("tenant.manage_settings");
    return ok({ requests: await listMyCustomFeatureRequests(user) });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("tenant.manage_settings");
    const body = await req.json();

    if (body?.action === "reply") {
      const input = replyCustomFeatureRequestSchema.parse(body);
      return ok(await replyToCustomFeatureQuote(user, body.requestId, input));
    }

    const input = createCustomFeatureRequestSchema.parse(body);
    return ok(await createCustomFeatureRequest(user, input));
  } catch (e) {
    return handleError(e);
  }
}
