/**
 * EE.10 — GET/POST /api/academics/contests
 * GET: list open/invited inter-school contests (`listInterSchoolContests`).
 * POST: create a new inter-school contest with self-marking questions (`createInterSchoolContest`).
 */

import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import {
  listInterSchoolContests,
  createInterSchoolContest,
} from "@/lib/services/inter-school-contest.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import {
  listContestsQuerySchema,
  createContestSchema,
} from "@/lib/validations/inter-school-contest";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission("academics.view");
    await assertEeFeatureReleased("EE.10");

    const query = listContestsQuerySchema.parse({
      category: req.nextUrl.searchParams.get("category") || undefined,
      targetGradeBand: req.nextUrl.searchParams.get("targetGradeBand") || undefined,
      status: req.nextUrl.searchParams.get("status") || undefined,
      search: req.nextUrl.searchParams.get("search") || undefined,
    });

    const contests = await listInterSchoolContests(user, query);
    return ok({ contests });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("academics.manage");
    await assertEeFeatureReleased("EE.10");

    const input = createContestSchema.parse(await req.json());
    const created = await createInterSchoolContest(user, input);
    return ok(created);
  } catch (e) {
    return handleError(e);
  }
}
