/**
 * EE.6 — POST /api/academics/exam-papers/[id]/share
 * Requests national public sharing (`PUBLIC_SHARED`) for a school's tidied exam paper.
 * Sets `sharingApprovalStatus = "PENDING"` for NEYO Ops vetting.
 */

import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { requestPublicSharing } from "@/lib/services/exam-paper-sharing.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requirePermission("academics.manage");
    await assertEeFeatureReleased("EE.6");

    const updated = await requestPublicSharing(user, params.id);
    return ok(updated);
  } catch (e) {
    return handleError(e);
  }
}
