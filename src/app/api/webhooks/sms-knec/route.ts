import { NextRequest } from "next/server";
import { ok, fail, handleError } from "@/lib/api/respond";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import { lookupKnecPlacement, KnecLookupError } from "@/lib/services/sms-knec.service";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/sms-knec (`EE.12` — KNEC/KJSEA Assessment Placement Lookup Hook)
 * Accepts incoming SMS queries (shortcode 22263 style) or direct portal requests.
 * Evaluates placement in under 150ms and returns exact SMS reply text.
 */
export async function POST(req: NextRequest) {
  try {
    await assertEeFeatureReleased("EE.12");
    const body = await req.json().catch(() => ({}));
    const tenantId = body.tenantId || req.headers.get("x-tenant-id");
    if (!tenantId) {
      return fail("MISSING_TENANT", "tenantId required for KNEC lookup.", 400);
    }

    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return fail("NOT_FOUND", "School tenant not found.", 404);

    const result = await lookupKnecPlacement(tenantId, body);
    return ok({ result });
  } catch (err) {
    if (err instanceof KnecLookupError) {
      return fail(err.code, err.message, err.code === "NOT_FOUND" ? 404 : 400);
    }
    return handleError(err);
  }
}
