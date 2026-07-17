import { NextRequest } from "next/server";
import { getCurrentUser, requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { listBomGovernanceDocuments, uploadBomGovernanceDocument } from "@/lib/services/kenyan-extensions.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    requirePermission(user as any, "tenant.manage_settings");

    const category = new URL(req.url).searchParams.get("category") || "ALL";
    const documents = await listBomGovernanceDocuments(user.tenantId, category);
    return ok({ documents });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    requirePermission(user as any, "tenant.manage_settings");

    const body = await req.json().catch(() => ({}));
    const { title, category, fileUrl, requiresVote } = body;
    if (!title || !category || !fileUrl) {
      return handleError(new Error("title, category, and fileUrl required."));
    }

    const doc = await uploadBomGovernanceDocument(user.tenantId, { title, category, fileUrl, requiresVote }, user);
    return ok({ document: doc });
  } catch (err) {
    return handleError(err);
  }
}
