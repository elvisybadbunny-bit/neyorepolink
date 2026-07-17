/**
 * EE.10 — GET /api/academics/contests/[id]
 * Retrieves one specific inter-school contest with ordered questions.
 */

import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { getContestWithQuestions } from "@/lib/services/inter-school-contest.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requirePermission("academics.view");
    await assertEeFeatureReleased("EE.10");

    const contest = await getContestWithQuestions(user, params.id);
    return ok(contest);
  } catch (e) {
    return handleError(e);
  }
}
