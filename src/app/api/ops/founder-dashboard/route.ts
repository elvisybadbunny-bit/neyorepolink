/**
 * U.3 — Founder Morning Dashboard. Reachable by FOUNDER (unrestricted) and
 * by any account individually granted "neyo.metrics_view".
 * GET -> real revenue/schools/signups/failed-payments/system-health snapshot.
 */
import { requireUser } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { founderMorningDashboard } from "@/lib/services/founder-dashboard.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    return ok(await founderMorningDashboard(user));
  } catch (e) {
    return handleError(e);
  }
}
