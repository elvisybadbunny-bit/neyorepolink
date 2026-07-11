import { NextRequest, NextResponse } from "next/server";
import { ok, handleError } from "@/lib/api/respond";
import { handleGuidePaymentCallback, verifyGuideWebhookToken } from "@/lib/services/pathway-guide.service";

export const dynamic = "force-dynamic";

/**
 * POST /api/pathway-guide/public/payment-callback — real M-Pesa Daraja
 * callback for the Pathway Guide's small public unlock fee.
 *
 * SECURITY: same pattern as the central subscription callback
 * (`/api/billing/central-callback`) and per-tenant payment webhooks — Daraja
 * has no HMAC, so this route MUST verify the shared `DARAJA_WEBHOOK_TOKEN`
 * secret-path-token before ever unlocking a real session. Never remove this
 * check — an unauthenticated caller could otherwise unlock reports for free.
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("t");
    if (!verifyGuideWebhookToken(token)) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json().catch(() => ({}));
    const result = await handleGuidePaymentCallback(body);
    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}
