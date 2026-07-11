/**
 * T.6 — School-side: apply a real influencer code (during onboarding/
 * Settings → Billing, one-time). Mutually exclusive with a discount
 * campaign — a school uses one or the other, never both (enforced in
 * influencer-code.service.ts's own apply-time guard).
 */
import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { applyInfluencerCodeSchema } from "@/lib/validations/influencer-code";
import { applyInfluencerCode } from "@/lib/services/influencer-code.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("owner.dashboard");
    const body = applyInfluencerCodeSchema.parse(await req.json());
    const result = await applyInfluencerCode(user.tenantId, body.code);
    return ok(result, 201);
  } catch (e) {
    return handleError(e);
  }
}
