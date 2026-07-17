/**
 * EE.6 — POST /api/academics/exam-papers/clone
 * 1-Click Clone: duplicates an approved national public exam paper into the requesting school's own library.
 */

import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { clonePublicExamPaperToTenant } from "@/lib/services/exam-paper-sharing.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import { clonePublicExamPaperSchema } from "@/lib/validations/exam-paper-sharing";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("academics.manage");
    await assertEeFeatureReleased("EE.6");

    const input = clonePublicExamPaperSchema.parse(await req.json());
    const cloned = await clonePublicExamPaperToTenant(user, input);
    return ok(cloned);
  } catch (e) {
    return handleError(e);
  }
}
