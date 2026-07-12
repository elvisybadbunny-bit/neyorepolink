/**
 * BB.3 — Real class-size cap + overflow decision.
 * GET  -> ?action=history: recent overflow decisions for this school.
 * POST -> actions: check (real pre-placement capacity check, any real
 *         placement flow can call this before committing a group of
 *         students into a class), decide (real, explicit, staff-confirmed
 *         SPLIT_NEW_CLASS or ALLOW_OVER_CAPACITY resolution).
 */
import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, fail, handleError } from "@/lib/api/respond";
import {
  checkCapacity, decideOverflow, listOverflowRuns,
  ClassCapacityOverflowError,
} from "@/lib/services/class-capacity-overflow.service";
import { classCapacityOverflowActionSchema } from "@/lib/validations/class-capacity-overflow";

export const dynamic = "force-dynamic";

function mapErr(e: unknown) {
  if (e instanceof ClassCapacityOverflowError) {
    const m = { NOT_FOUND: 404, INVALID: 400, CONFLICT: 409 } as const;
    return fail(e.code, e.message, m[e.code]);
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission("class.manage");
    if (req.nextUrl.searchParams.get("action") === "history") {
      return ok({ runs: await listOverflowRuns(user) });
    }
    return fail("INVALID", "Unknown action.", 400);
  } catch (e) {
    return mapErr(e) ?? handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("class.manage");
    const body = classCapacityOverflowActionSchema.parse(await req.json());
    if (body.action === "check") {
      return ok(await checkCapacity(user, body));
    }
    return ok(await decideOverflow(user, body));
  } catch (e) {
    return mapErr(e) ?? handleError(e);
  }
}
