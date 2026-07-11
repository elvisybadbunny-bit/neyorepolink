/**
 * T.11a — GET/POST the school's own real, configurable fee-reminder cadence
 * (Tenant.feeReminderGraceDays/feeReminderDedupeDays), replacing the old
 * hardcoded "3 days after due date, repeat every 3 days" rule.
 * GET: any signed-in staff with finance visibility. POST: leadership only.
 */
import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { setFeeReminderScheduleSchema } from "@/lib/validations/fee-reminders";
import { feeReminderSchedule, setFeeReminderSchedule } from "@/lib/services/finance.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requirePermission("finance.view");
    return ok(await feeReminderSchedule(user));
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("tenant.manage_settings");
    const input = setFeeReminderScheduleSchema.parse(await req.json().catch(() => ({})));
    return ok(await setFeeReminderSchedule(user, input));
  } catch (err) {
    return handleError(err);
  }
}
