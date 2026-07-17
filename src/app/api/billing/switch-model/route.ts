import { NextRequest } from "next/server";
import { getCurrentUser, requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { switchTenantPricingModel } from "@/lib/services/pricing-engine.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    requirePermission(user as any, "tenant.manage_settings");

    const { newPricingMode } = await req.json().catch(() => ({}));
    if (newPricingMode !== "SIZE_BASED_V2" && newPricingMode !== "MODULAR_USERS_V1") {
      return handleError(new Error("Invalid pricing mode. Must be SIZE_BASED_V2 or MODULAR_USERS_V1."));
    }

    const updated = await switchTenantPricingModel(user.tenantId, user, newPricingMode);
    return ok({ subscription: updated });
  } catch (err) {
    return handleError(err);
  }
}
