/** Y.1 — real M-Pesa STK push to unlock a public outsider's full matched-course report. */
import { NextRequest } from "next/server";
import { ok, fail, handleError } from "@/lib/api/respond";
import { startGuidePayment, getGuidePaymentStatus, isPathwayGuidePublicEnabled } from "@/lib/services/pathway-guide.service";
import { startGuidePaymentSchema } from "@/lib/validations/pathway-guide";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    if (!(await isPathwayGuidePublicEnabled())) {
      return fail("FORBIDDEN", "The NEYO Pathway Guide is temporarily unavailable. Please check back soon.", 403);
    }
    const input = startGuidePaymentSchema.parse(await req.json());
    return ok(await startGuidePayment(input));
  } catch (e) {
    return handleError(e);
  }
}

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("sessionId") || "";
    if (!sessionId) return fail("VALIDATION_ERROR", "sessionId is required.", 422);
    return ok(await getGuidePaymentStatus(sessionId));
  } catch (e) {
    return handleError(e);
  }
}
