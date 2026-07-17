import { NextRequest } from "next/server";
import { getCurrentUser, requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { submitMoeReturn } from "@/lib/services/kenyan-extensions.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    requirePermission(user as any, "academics.manage");

    const { id } = await req.json().catch(() => ({}));
    if (!id) return handleError(new Error("id is required."));

    const submitted = await submitMoeReturn(user.tenantId, id, user);
    return ok({ return: submitted });
  } catch (err) {
    return handleError(err);
  }
}
