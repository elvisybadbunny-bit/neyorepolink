/**
 * T.10 — Teacher Portal: real, pending cash-payment entries. A teacher
 * submits a real entry (POST) which never touches the ledger; a real
 * bursar/leadership confirms or rejects it via /api/finance/cash-payments.
 * GET returns the CALLING TEACHER's own submitted entries only.
 * Permission: portal.teacher.
 */
import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { submitTeacherCashPaymentSchema } from "@/lib/validations/teacher-cash-payment";
import { submitTeacherCashPayment, myTeacherCashPaymentRequests, teacherCashPaymentPolicy } from "@/lib/services/teacher-cash-payment.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission("portal.teacher");
    if (req.nextUrl.searchParams.get("policy")) return ok(await teacherCashPaymentPolicy(user));
    return ok({ requests: await myTeacherCashPaymentRequests(user) });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("portal.teacher");
    const input = submitTeacherCashPaymentSchema.parse(await req.json().catch(() => ({})));
    return ok(await submitTeacherCashPayment(user, input), 201);
  } catch (e) {
    return handleError(e);
  }
}
