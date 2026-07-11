/**
 * G.12 Sibling Intelligence API.
 * GET  /api/family?studentId=...        — the family view (siblings + combined fees), student.view + row-scoped.
 * POST /api/family {action:"sibling_discount", invoiceId, pct?} — apply the sibling discount to an invoice (finance.manage_structure).
 * POST /api/family {action:"split_payment", ...} — T.14: pay one child or split evenly across siblings (student.view, row-scoped to own children).
 */
import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { familyForStudent, applySiblingDiscount, splitFamilyPayment } from "@/lib/services/family.service";
import { familyQuerySchema, siblingDiscountSchema, splitFamilyPaymentSchema } from "@/lib/validations/family";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission("student.view");
    const { studentId } = familyQuerySchema.parse({ studentId: req.nextUrl.searchParams.get("studentId") });
    return ok(await familyForStudent(user, studentId));
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    if (body?.action === "split_payment") {
      const user = await requirePermission("student.view");
      const input = splitFamilyPaymentSchema.parse(body);
      return ok(await splitFamilyPayment(user, input));
    }

    z.object({ action: z.literal("sibling_discount") }).parse(body);
    const user = await requirePermission("finance.manage_structure");
    const input = siblingDiscountSchema.parse(body);
    return ok(await applySiblingDiscount(user, input.invoiceId, input.pct, input.biometricTicket));
  } catch (e) {
    return handleError(e);
  }
}
