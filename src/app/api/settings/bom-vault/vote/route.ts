import { NextRequest } from "next/server";
import { getCurrentUser, requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { castBomDocumentVote } from "@/lib/services/kenyan-extensions.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    await requirePermission("tenant.manage_settings");

    const { documentId, vote } = await req.json().catch(() => ({}));
    if (!documentId || (vote !== "YES" && vote !== "NO")) {
      return handleError(new Error("documentId and vote (YES/NO) required."));
    }

    const updated = await castBomDocumentVote(user.tenantId, documentId, vote, user);
    return ok({ document: updated });
  } catch (err) {
    return handleError(err);
  }
}
