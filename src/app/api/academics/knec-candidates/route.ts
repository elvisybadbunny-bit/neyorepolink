import { NextRequest } from "next/server";
import { getCurrentUser, requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { listKnecCandidates, registerKnecCandidates } from "@/lib/services/kenyan-extensions.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    await requirePermission("academics.view");

    const candidateType = new URL(req.url).searchParams.get("candidateType") || "ALL";
    const candidates = await listKnecCandidates(user.tenantId, candidateType);
    return ok({ candidates });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    await requirePermission("academics.manage");

    const body = await req.json().catch(() => ({}));
    const { knecCentreCode, candidateType, indexingMode, placementExamId } = body;
    if (!knecCentreCode || !candidateType || !indexingMode) {
      return handleError(new Error("knecCentreCode, candidateType, and indexingMode required."));
    }

    const result = await registerKnecCandidates(user.tenantId, { knecCentreCode, candidateType, indexingMode, placementExamId }, user);
    return ok({ ...result });
  } catch (err) {
    return handleError(err);
  }
}
