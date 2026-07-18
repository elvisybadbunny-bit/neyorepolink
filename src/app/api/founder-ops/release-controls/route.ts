import { NextRequest } from "next/server";
import { getCurrentUser, requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { listAllFeatureReleaseControls, upsertFeatureReleaseControl } from "@/lib/services/early-access-release.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    await requirePermission("platform.founder_ops");

    const controls = await listAllFeatureReleaseControls();
    return ok({ controls });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    await requirePermission("platform.founder_ops");

    const body = await req.json().catch(() => ({}));
    const { featureKey, label, status, whitelistedTenantIds, notes } = body;
    if (!featureKey || !label || !status) {
      return handleError(new Error("featureKey, label, and status are required."));
    }

    const updated = await upsertFeatureReleaseControl(user, {
      featureKey,
      label,
      status,
      whitelistedTenantIds: whitelistedTenantIds || [],
      notes: notes || null,
    });
    return ok({ control: updated });
  } catch (err) {
    return handleError(err);
  }
}
