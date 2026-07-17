/**
 * EE.4 — GET /api/academics/mark-sheets/print
 * Returns the exact data required to print a high-contrast, QR/barcode verifiable class mark sheet.
 */

import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { getMarkSheetPrintData } from "@/lib/services/mark-sheet.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import { markSheetPrintQuerySchema } from "@/lib/validations/mark-sheet";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission("academics.view");
    await assertEeFeatureReleased("EE.4");

    const query = markSheetPrintQuerySchema.parse({
      examId: req.nextUrl.searchParams.get("examId"),
      subjectId: req.nextUrl.searchParams.get("subjectId"),
      classId: req.nextUrl.searchParams.get("classId"),
      type: req.nextUrl.searchParams.get("type") ?? "NUMERICAL",
    });

    const data = await getMarkSheetPrintData(user, query);
    return ok(data);
  } catch (e) {
    return handleError(e);
  }
}
