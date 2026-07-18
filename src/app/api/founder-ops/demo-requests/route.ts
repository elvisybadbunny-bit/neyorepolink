import { NextRequest } from "next/server";
import { getCurrentUser, requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    await requirePermission("platform.founder_ops");

    const requests = await db.demoRequest.findMany({
      orderBy: { requestedAt: "desc" },
    });

    return ok({ requests });
  } catch (err) {
    return handleError(err);
  }
}
