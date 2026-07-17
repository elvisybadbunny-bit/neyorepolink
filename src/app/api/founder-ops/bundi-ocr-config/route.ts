import { NextRequest } from "next/server";
import { getCurrentUser, requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { getBundiOcrConfig, saveBundiOcrConfig } from "@/lib/services/bundi-ocr-quota.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    requirePermission(user as any, "platform.founder_ops");

    const config = await getBundiOcrConfig();
    return ok({ config });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    requirePermission(user as any, "platform.founder_ops");

    const body = await req.json().catch(() => ({}));
    const updated = await saveBundiOcrConfig(body, user);
    return ok({ config: updated });
  } catch (err) {
    return handleError(err);
  }
}
