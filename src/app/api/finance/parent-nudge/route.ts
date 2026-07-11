/**
 * T.11b — real, manually-triggered "never logged in" parent SMS nudge.
 * GET returns the real live count + list; POST sends the real nudge.
 * Permission: comms.send (leadership + explicit comms-send holders).
 */
import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { sendNeverLoggedInNudgeSchema } from "@/lib/validations/fee-reminders";
import { neverLoggedInParents, sendNeverLoggedInNudge } from "@/lib/services/parent-nudge.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requirePermission("comms.send");
    return ok(await neverLoggedInParents(user));
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("comms.send");
    const { limit } = sendNeverLoggedInNudgeSchema.parse(await req.json().catch(() => ({})));
    return ok(await sendNeverLoggedInNudge(user, limit));
  } catch (e) {
    return handleError(e);
  }
}
