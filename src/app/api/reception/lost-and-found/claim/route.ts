import { NextRequest } from "next/server";
import { getCurrentUser, requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { claimLostAndFoundItem } from "@/lib/services/kenyan-extensions.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    await requirePermission("student.view");

    const { id, studentId } = await req.json().catch(() => ({}));
    if (!id || !studentId) return handleError(new Error("id and studentId required."));

    const claimed = await claimLostAndFoundItem(user.tenantId, id, studentId, user);
    return ok({ item: claimed });
  } catch (err) {
    return handleError(err);
  }
}
