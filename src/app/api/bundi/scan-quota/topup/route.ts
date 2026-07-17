import { NextRequest } from "next/server";
import { getCurrentUser, requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { purchaseScanTopUpBundle } from "@/lib/services/bundi-ocr-quota.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    requirePermission(user as any, "tenant.manage_settings"); // Principal / Owner only

    const body = await req.json().catch(() => ({}));
    const { bundleKey } = body;
    if (bundleKey !== "SCAN_500" && bundleKey !== "SCAN_1500" && bundleKey !== "SCAN_5000") {
      return handleError(new Error("Invalid scan bundle key. Must be SCAN_500, SCAN_1500, or SCAN_5000."));
    }

    const result = await purchaseScanTopUpBundle(user.tenantId, bundleKey, user);
    return ok({ result });
  } catch (err) {
    return handleError(err);
  }
}
