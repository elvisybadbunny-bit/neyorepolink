/**
 * G.16 Promotion engine.
 * GET  /api/promotion                 -> {plan, unmapped, history}
 * POST /api/promotion {year?}         -> commit new academic year
 * Permission: class.manage (leadership; NOT class teachers — whole-school op).
 */
import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { promotionPlan, commitPromotion, listRuns } from "@/lib/services/promotion.service";
import { commitPromotionSchema } from "@/lib/validations/promotion";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requirePermission("class.manage");
    const [plan, history] = await Promise.all([promotionPlan(user), listRuns(user)]);
    return ok({ ...plan, history });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("class.manage");
    const body = commitPromotionSchema.parse(await req.json().catch(() => ({})));
    return ok(await commitPromotion(user, body.year, body.repeatStudentIds));
  } catch (e) {
    return handleError(e);
  }
}
