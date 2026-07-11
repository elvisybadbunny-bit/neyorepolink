/**
 * T.2 — NEYO Ops (SUPER_ADMIN) discount campaign pipeline.
 * GET  -> every real campaign + the current real active one.
 * POST { action: "create" | "end" }
 */
import { NextRequest } from "next/server";
import { requireRole } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { createDiscountCampaignSchema, endDiscountCampaignSchema } from "@/lib/validations/discount-campaign";
import { listDiscountCampaigns, createDiscountCampaign, endDiscountCampaign, currentActiveCampaign } from "@/lib/services/discount-campaign.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireRole("SUPER_ADMIN");
    const [campaigns, activeNewSignups, activeAllSchools] = await Promise.all([
      listDiscountCampaigns(),
      currentActiveCampaign("NEW_SIGNUPS"),
      currentActiveCampaign("ALL_ACTIVE_SCHOOLS"),
    ]);
    return ok({ campaigns, activeNewSignups, activeAllSchools });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole("SUPER_ADMIN");
    const actor = { id: user.id, fullName: user.fullName, tenantId: user.tenantId };
    const body = await req.json();

    if (body?.action === "end") {
      const input = endDiscountCampaignSchema.parse(body);
      return ok(await endDiscountCampaign(actor, input.campaignId));
    }

    const input = createDiscountCampaignSchema.parse(body);
    return ok(await createDiscountCampaign(actor, input));
  } catch (e) {
    return handleError(e);
  }
}
