import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import { stampGatePassAction } from "@/lib/services/qr-scan.service";
import { stampGatePassSchema } from "@/lib/validations/qr-gate-pass";

export const dynamic = "force-dynamic";

/**
 * POST /api/qr-scan/gate-pass/action
 * Part EE.11 — 1-Tap Checkpoint Stamping (`Stamp Exit Now` or `Stamp Return Now`).
 * Requires `security.manage` permission.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("security.manage");
    await assertEeFeatureReleased("EE.11");

    const body = await req.json().catch(() => ({}));
    const input = stampGatePassSchema.parse(body);

    const result = await stampGatePassAction(user, input.passId, input.action, input.note);
    return ok({ result });
  } catch (err) {
    return handleError(err);
  }
}
