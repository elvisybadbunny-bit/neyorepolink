/**
 * EE.4 — POST /api/academics/mark-sheets/apply
 * Applies teacher-confirmed score deltas from a scanned physical mark sheet directly
 * into the real `ExamResult` table inside a clean database transaction.
 */

import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { applyMarkSheetDeltas } from "@/lib/services/mark-sheet.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import { applyMarkSheetDeltasSchema } from "@/lib/validations/mark-sheet";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("academics.manage");
    await assertEeFeatureReleased("EE.4");

    const input = applyMarkSheetDeltasSchema.parse(await req.json());
    const result = await applyMarkSheetDeltas(user, input);
    return ok(result);
  } catch (e) {
    return handleError(e);
  }
}
