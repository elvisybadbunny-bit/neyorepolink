/**
 * T.10 — real bursar/leadership-side view + decide on teacher-submitted
 * pending cash-payment entries, plus the school-level opt-in toggle.
 * GET  ?policy=1        — the real allowTeacherCashPayments setting
 * GET  ?status=PENDING  — real list of requests (default: all)
 * POST {action:"decide", requestId, approve, rejectReason?}
 * POST {action:"setPolicy", allow}
 * Permission: finance.record_payment (view+decide), tenant.manage_settings (policy toggle).
 */
import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { decideTeacherCashPaymentSchema } from "@/lib/validations/teacher-cash-payment";
import { listTeacherCashPaymentRequests, decideTeacherCashPayment, teacherCashPaymentPolicy, setTeacherCashPaymentPolicy } from "@/lib/services/teacher-cash-payment.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission("finance.record_payment");
    const sp = req.nextUrl.searchParams;
    if (sp.get("policy")) return ok(await teacherCashPaymentPolicy(user));
    return ok({ requests: await listTeacherCashPaymentRequests(user, sp.get("status") || undefined) });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = z.object({ action: z.enum(["decide", "setPolicy"]) }).parse(body).action;
    if (action === "setPolicy") {
      const user = await requirePermission("tenant.manage_settings");
      const { allow } = z.object({ allow: z.boolean() }).parse(body);
      return ok(await setTeacherCashPaymentPolicy(user, allow));
    }
    const user = await requirePermission("finance.record_payment");
    const { requestId, biometricTicket, ...rest } = z.object({ requestId: z.string().min(1), biometricTicket: z.string().optional() }).and(decideTeacherCashPaymentSchema).parse(body);
    return ok(await decideTeacherCashPayment(user, requestId, { ...rest, biometricTicket }));
  } catch (e) {
    return handleError(e);
  }
}
