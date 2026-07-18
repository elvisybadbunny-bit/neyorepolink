import { NextRequest } from "next/server";
import { getCurrentUser, requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { listAllTenantArchiveTiers, run3TierStorageLifecycleArchive } from "@/lib/services/storage-lifecycle-tiers.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    await requirePermission("platform.founder_ops");

    const summaries = await listAllTenantArchiveTiers();
    return ok({ summaries });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    await requirePermission("platform.founder_ops");

    const { tenantId } = await req.json().catch(() => ({}));
    if (tenantId) {
      const summary = await run3TierStorageLifecycleArchive(tenantId);
      return ok({ summary });
    }

    const summaries = await listAllTenantArchiveTiers();
    return ok({ summaries });
  } catch (err) {
    return handleError(err);
  }
}
