import { NextRequest } from "next/server";
import { getCurrentUser, requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { listLostAndFoundItems, recordLostAndFoundItem } from "@/lib/services/kenyan-extensions.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));

    const status = new URL(req.url).searchParams.get("status") || "ALL";
    const items = await listLostAndFoundItems(user.tenantId, status);
    return ok({ items });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    requirePermission(user as any, "student.view");

    const body = await req.json().catch(() => ({}));
    const { title, description, category, locationFound, photoUrl } = body;
    if (!title || !description || !category || !locationFound) {
      return handleError(new Error("title, description, category, and locationFound required."));
    }

    const item = await recordLostAndFoundItem(user.tenantId, { title, description, category, locationFound, photoUrl }, user);
    return ok({ item });
  } catch (err) {
    return handleError(err);
  }
}
