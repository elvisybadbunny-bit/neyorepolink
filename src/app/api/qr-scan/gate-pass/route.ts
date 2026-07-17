import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import { scanForGatePassStatus } from "@/lib/services/qr-scan.service";
import { scanGatePassSchema } from "@/lib/validations/qr-gate-pass";

export const dynamic = "force-dynamic";

/**
 * POST /api/qr-scan/gate-pass
 * Part EE.11 — Sub-second QR Gate-Pass status scanning (`ALLOWED`, `NOT_ALLOWED`, `DIDNT_PASS`, `INVALID`).
 * Requires `security.view` or `security.manage` permission.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("security.view");
    await assertEeFeatureReleased("EE.11");

    const body = await req.json().catch(() => ({}));
    const { scannedCode } = scanGatePassSchema.parse({
      scannedCode: body.scannedCode ?? body.scanned ?? "",
    });

    const result = await scanForGatePassStatus(user, scannedCode);
    return ok({ result });
  } catch (err) {
    return handleError(err);
  }
}
