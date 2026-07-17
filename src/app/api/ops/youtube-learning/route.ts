/**
 * EE.7 — GET/POST /api/ops/youtube-learning
 * NEYO Ops vetting queue for national YouTube learning video submissions (`scope: "NATIONAL"`).
 * GET: list all pending national video submissions across every school tenant.
 * POST: approve (`APPROVED`) or return (`REJECTED`) a submission with rejection reason.
 */

import { NextRequest } from "next/server";
import { requireRole } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import {
  listPendingNationalVideos,
  decideNationalVideoSubmission,
} from "@/lib/services/youtube-learning.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import { opsDecideLearningVideoSchema } from "@/lib/validations/youtube-learning";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const opsUser = await requireRole("SUPER_ADMIN", "FOUNDER" as never, "NEYO_OPS" as never);
    await assertEeFeatureReleased("EE.7");

    const pending = await listPendingNationalVideos(opsUser);
    return ok({ pending });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const opsUser = await requireRole("SUPER_ADMIN", "FOUNDER" as never, "NEYO_OPS" as never);
    await assertEeFeatureReleased("EE.7");

    const input = opsDecideLearningVideoSchema.parse(await req.json());
    const decided = await decideNationalVideoSubmission(opsUser, input);
    return ok(decided);
  } catch (e) {
    return handleError(e);
  }
}
