import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, fail, handleError } from "@/lib/api/respond";
import { handleGuidePaymentCallback } from "@/lib/services/pathway-guide.service";

export const dynamic = "force-dynamic";

const schema = z.object({
  checkoutRequestId: z.string().min(1),
  success: z.boolean().default(true),
});

/**
 * POST /api/pathway-guide/public/simulate-callback — DEV ONLY.
 * Mirrors /api/payments/simulate-callback for the Pathway Guide's own
 * separate public-payment flow (PathwayGuidePayment, not the tenant Payment
 * model) so the STK pending->paid path is testable without real Daraja
 * credentials. Deliberately unauthenticated (a real public payer never has a
 * NEYO session) but fully disabled outside development.
 */
export async function POST(req: NextRequest) {
  try {
    if (process.env.NODE_ENV === "production") {
      return fail("FORBIDDEN", "Not available in production.", 403);
    }
    const { checkoutRequestId, success } = schema.parse(await req.json().catch(() => ({})));
    const result = await handleGuidePaymentCallback({ checkoutRequestId, success, mpesaRef: `MOCK${Date.now()}` });
    return ok(result);
  } catch (err) {
    return handleError(err);
  }
}
