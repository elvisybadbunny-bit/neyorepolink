import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { walkInPaymentSchema } from "@/lib/validations/reception";
import { recordWalkInPayment } from "@/lib/services/reception.service";
import { withIdempotency } from "@/lib/services/idempotency.service";
import { ok, handleError } from "@/lib/api/respond";

export const dynamic = "force-dynamic";

/**
 * POST /api/reception/payments — record a walk-in (cash/M-Pesa) payment (A.18.3).
 *
 * Z.1 — real offline-safe replay: a CASH payment's reference is generated
 * fresh (`CASH-${Date.now()}`) on every real execution, so it is NOT
 * naturally safe to retry — a real offline sync replay without this guard
 * could create a second, genuinely duplicate cash-payment record for the
 * same real handover of money. M-Pesa/bank payments are already protected
 * by their own real duplicate mpesaRef check in `recordWalkInPayment()`;
 * this adds the same real guarantee for cash.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("reception.operate", "finance.record_payment");
    const input = walkInPaymentSchema.parse(await req.json().catch(() => ({})));
    const idempotencyKey = req.headers.get("Idempotency-Key");

    const payment = idempotencyKey
      ? (
          await withIdempotency(user.tenantId, "reception.recordWalkInPayment", idempotencyKey, () =>
            recordWalkInPayment(user.tenantId, input, { id: user.id, name: user.fullName })
          )
        ).result
      : await recordWalkInPayment(user.tenantId, input, { id: user.id, name: user.fullName });

    return ok(
      { id: payment.id, ref: payment.mpesaRef, amount: payment.amount, status: payment.status },
      201
    );
  } catch (err) {
    return handleError(err);
  }
}

