/**
 * EE.6 — GET/POST /api/ops/exam-sharing
 * NEYO Ops vetting queue for national public exam paper sharing requests.
 * GET: list all pending exam sharing requests across every school tenant.
 * POST: approve (`PUBLIC_SHARED`) or reject (`SCHOOL_ONLY`) a request with decision notes.
 */

import { NextRequest } from "next/server";
import { requireRole } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import {
  listPendingSharingRequests,
  decidePublicSharingRequest,
} from "@/lib/services/exam-paper-sharing.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import { decidePublicSharingSchema } from "@/lib/validations/exam-paper-sharing";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole("SUPER_ADMIN", "FOUNDER" as never, "NEYO_OPS" as never);
    await assertEeFeatureReleased("EE.6");

    const requests = await listPendingSharingRequests(user);
    return ok({ requests });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole("SUPER_ADMIN", "FOUNDER" as never, "NEYO_OPS" as never);
    await assertEeFeatureReleased("EE.6");

    const input = decidePublicSharingSchema.parse(await req.json());
    const decided = await decidePublicSharingRequest(user, input);
    return ok(decided);
  } catch (e) {
    return handleError(e);
  }
}
