import { NextRequest } from "next/server";
import { getCurrentUser, requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { getBundiOcrQuotaStatus } from "@/lib/services/bundi-ocr-quota.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    requirePermission(user as any, "academics.view");

    const status = await getBundiOcrQuotaStatus(user.tenantId);
    return ok({ quota: status });
  } catch (err) {
    return handleError(err);
  }
}
