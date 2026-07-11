/**
 * B.7 invoices. GET list ?status=&q= (finance.view; parents row-scoped)
 * · POST manual invoice (finance.create_invoice)
 * · PATCH ?id= {amountKes} apply offline payment (finance.record_payment).
 */
import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError, fail } from "@/lib/api/respond";
import { manualInvoiceSchema } from "@/lib/validations/finance";
import { listInvoices, createManualInvoice, applyPaymentToInvoice, arrearsAging } from "@/lib/services/finance.service";
import { withIdempotency } from "@/lib/services/idempotency.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission("finance.view");
    const sp = req.nextUrl.searchParams;
    if (sp.get("aging") === "1") return ok(await arrearsAging(user));
    return ok({
      invoices: await listInvoices(user, {
        status: sp.get("status") || undefined,
        q: sp.get("q") || undefined,
      }),
    });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("finance.create_invoice");
    return ok(await createManualInvoice(user, manualInvoiceSchema.parse(await req.json())));
  } catch (e) {
    return handleError(e);
  }
}

/**
 * PATCH ?id= — apply a real cash/manual payment.
 *
 * Z.1 — real offline-safe replay: `applyPaymentToInvoice()` INCREMENTS the
 * real `paidKes` total (`inv.paidKes + amountKes`) — a genuine replay
 * without this guard would double-apply the same real cash handover. When
 * a real Idempotency-Key header is present (from an offline-queued
 * payment), a replay of the SAME key returns the exact same real result
 * the first successful attempt produced, never a second application.
 */
export async function PATCH(req: NextRequest) {
  try {
    const user = await requirePermission("finance.record_payment");
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return fail("MISSING_ID", "Invoice id required.", 400);
    const { amountKes, biometricTicket } = z.object({
      amountKes: z.coerce.number().int().min(1).max(10_000_000),
      // R.3 — real single-use server ticket, required only if the school
      // has turned on requireBiometricForFinance (see applyPaymentToInvoice()).
      biometricTicket: z.string().trim().max(80).optional(),
    }).parse(await req.json());

    const idempotencyKey = req.headers.get("Idempotency-Key");
    const result = idempotencyKey
      ? (
          await withIdempotency(user.tenantId, "finance.applyPaymentToInvoice", idempotencyKey, () =>
            applyPaymentToInvoice(user, id, amountKes, biometricTicket)
          )
        ).result
      : await applyPaymentToInvoice(user, id, amountKes, biometricTicket);

    return ok(result);
  } catch (e) {
    return handleError(e);
  }
}

