import { NextRequest } from "next/server";
import { getCurrentUser, requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { recalculateAllTenantsHealth, calculateTenantHealthScore } from "@/lib/services/tenant-health.service";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    await requirePermission("platform.founder_ops");

    const snapshots = await db.tenantHealthSnapshot.findMany({
      orderBy: { calculatedAt: "desc" },
      distinct: ["tenantId"],
      include: { tenant: { select: { id: true, name: true, slug: true } } },
      take: 50,
    });

    return ok({ snapshots });
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
    if (body.tenantId) {
      const result = await calculateTenantHealthScore(body.tenantId);
      return ok({ result });
    }

    const results = await recalculateAllTenantsHealth();
    return ok({ results, count: results.length });
  } catch (err) {
    return handleError(err);
  }
}
