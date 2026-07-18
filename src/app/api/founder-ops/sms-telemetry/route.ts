import { NextRequest } from "next/server";
import { getCurrentUser, requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { listAllSmsTelemetry, toggleAutoFallback } from "@/lib/services/sms-telemetry.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    await requirePermission("platform.founder_ops");

    const telemetry = await listAllSmsTelemetry();
    return ok({ telemetry });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    await requirePermission("platform.founder_ops");

    const { tenantId, autoFallbackEnabled } = await req.json().catch(() => ({}));
    if (!tenantId || typeof autoFallbackEnabled !== "boolean") {
      return handleError(new Error("tenantId and autoFallbackEnabled boolean required."));
    }

    const updated = await toggleAutoFallback(tenantId, autoFallbackEnabled);
    return ok({ telemetry: updated });
  } catch (err) {
    return handleError(err);
  }
}
