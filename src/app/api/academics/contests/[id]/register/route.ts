/**
 * EE.10 — POST /api/academics/contests/[id]/register
 * Registers a school team (`ContestRegistration`) for an inter-school contest.
 */

import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { registerForContest } from "@/lib/services/inter-school-contest.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import { registerForContestSchema } from "@/lib/validations/inter-school-contest";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requirePermission("academics.manage");
    await assertEeFeatureReleased("EE.10");

    const body = await req.json().catch(() => ({}));
    const input = registerForContestSchema.parse({
      contestId: params.id,
      schoolTeamName: body.schoolTeamName,
    });

    const reg = await registerForContest(user, input);
    return ok(reg);
  } catch (e) {
    return handleError(e);
  }
}
