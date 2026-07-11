/**
 * U.1 — GET/POST the school's OWN, real, SCHOOL-CHOSEN SMS spend budget
 * alert threshold (founder's own explicit instruction: a school chooses
 * what they want, not a threshold NEYO imposes — they pay for their own
 * SMS costs). GET: any signed-in staff with finance visibility. POST:
 * leadership only, matching T.11a's own precedent exactly.
 */
import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { setSmsSpendAlertSchema } from "@/lib/validations/cost-cockpit";
import { getSmsSpendAlertStatus, setSmsSpendAlertThreshold } from "@/lib/services/cost-cockpit.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requirePermission("finance.view");
    return ok(await getSmsSpendAlertStatus(user));
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("tenant.manage_settings");
    const input = setSmsSpendAlertSchema.parse(await req.json().catch(() => ({})));
    return ok(await setSmsSpendAlertThreshold(user, input.thresholdKes));
  } catch (err) {
    return handleError(err);
  }
}
