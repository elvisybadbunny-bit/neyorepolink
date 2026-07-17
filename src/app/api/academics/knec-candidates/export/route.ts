import { NextRequest } from "next/server";
import { getCurrentUser, requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { exportKnecCandidatesManifest } from "@/lib/services/kenyan-extensions.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    requirePermission(user as any, "academics.view");

    const candidateType = new URL(req.url).searchParams.get("candidateType") || "ALL";
    const manifest = await exportKnecCandidatesManifest(user.tenantId, candidateType);
    return ok({ ...manifest });
  } catch (err) {
    return handleError(err);
  }
}
