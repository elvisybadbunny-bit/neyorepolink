/**
 * U.1 — NEYO Ops Real Company Cost Cockpit (Founder/NEYO_OPS-only).
 * GET ?view=live -> real live Vercel/Cloudflare R2/Africa's Talking figures
 *                   (each honestly NOT_CONFIGURED until its own real key
 *                   exists in the vault — never a fabricated number).
 * GET ?view=trends -> real chart data over U.2's own NeyoCostSnapshot history.
 */
import { NextRequest } from "next/server";
import { requireUser } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { liveCostCockpit, costTrends } from "@/lib/services/cost-cockpit.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const view = new URL(req.url).searchParams.get("view") || "live";
    if (view === "trends") return ok(await costTrends(user));
    return ok(await liveCostCockpit(user));
  } catch (e) {
    return handleError(e);
  }
}
