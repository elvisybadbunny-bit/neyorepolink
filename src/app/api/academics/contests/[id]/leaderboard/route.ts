/**
 * EE.10 — GET /api/academics/contests/[id]/leaderboard
 * Compile real-time national Individual Leaderboard & School Team Trophy Rankings (`EE.10`).
 */

import { NextRequest } from "next/server";
import { requireUser } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { getContestLeaderboard } from "@/lib/services/inter-school-contest.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser();
    await assertEeFeatureReleased("EE.10");

    const leaderboard = await getContestLeaderboard(user, params.id);
    return ok(leaderboard);
  } catch (e) {
    return handleError(e);
  }
}
