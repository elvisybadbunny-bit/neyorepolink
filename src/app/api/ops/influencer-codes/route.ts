/**
 * T.6 — NEYO Ops (SUPER_ADMIN) influencer/promoter code management.
 * GET  ?view=commissions -> real commission ledger; default -> every real code + performance.
 * POST { action: "create" | "setActive" | "markPaid" }
 */
import { NextRequest } from "next/server";
import { requireRole } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { createInfluencerCodeSchema, setInfluencerCodeActiveSchema, markCommissionPaidSchema } from "@/lib/validations/influencer-code";
import { listInfluencerCodes, createInfluencerCode, setInfluencerCodeActive, listInfluencerCommissions, markCommissionPaid } from "@/lib/services/influencer-code.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireRole("SUPER_ADMIN");
    const view = req.nextUrl.searchParams.get("view");
    if (view === "commissions") {
      const status = req.nextUrl.searchParams.get("status") ?? undefined;
      return ok({ commissions: await listInfluencerCommissions(status) });
    }
    return ok({ codes: await listInfluencerCodes() });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole("SUPER_ADMIN");
    const actor = { id: user.id, fullName: user.fullName, tenantId: user.tenantId };
    const body = await req.json();

    if (body?.action === "setActive") {
      const input = setInfluencerCodeActiveSchema.parse(body);
      return ok(await setInfluencerCodeActive(actor, input.codeId, input.active));
    }
    if (body?.action === "markPaid") {
      const input = markCommissionPaidSchema.parse(body);
      return ok(await markCommissionPaid(actor, input.commissionId, input.paidNote));
    }

    const input = createInfluencerCodeSchema.parse(body);
    return ok(await createInfluencerCode(actor, input));
  } catch (e) {
    return handleError(e);
  }
}
