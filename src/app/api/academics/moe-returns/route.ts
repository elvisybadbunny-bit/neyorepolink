import { NextRequest } from "next/server";
import { getCurrentUser, requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { generateMoeStatutoryReturn, listMoeReturns } from "@/lib/services/kenyan-extensions.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    await requirePermission("academics.view");

    const returns = await listMoeReturns(user.tenantId);
    return ok({ returns });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    await requirePermission("academics.manage");

    const { returnType, termKey } = await req.json().catch(() => ({}));
    if (returnType !== "FORM_A" && returnType !== "FORM_B") {
      return handleError(new Error("returnType must be FORM_A or FORM_B."));
    }

    const ret = await generateMoeStatutoryReturn(user.tenantId, returnType, termKey || "2026-T2", user);
    return ok({ return: ret });
  } catch (err) {
    return handleError(err);
  }
}
