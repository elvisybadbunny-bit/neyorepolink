/**
 * U.3 — Product Analytics (DAU/WAU on a real write action + module
 * adoption %). Reachable by FOUNDER + "neyo.metrics_view" accounts.
 * GET -> real, computed-live aggregates. Never a mock.
 */
import { requireUser } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { productAnalyticsSummary } from "@/lib/services/founder-dashboard.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    return ok(await productAnalyticsSummary(user));
  } catch (e) {
    return handleError(e);
  }
}
