/**
 * BB.7 — Dedicated Options Block & Subject-Combination Roster Prints API.
 * GET ?kind=venue_roster&level=<optional level>
 *     -> real per-class venue/teacher/subject breakdown for every real
 *        placed Options Block period (all classes if level omitted).
 * GET ?kind=combination_roster&level=<required level>
 *     -> real subject-combination groups the system generated from
 *        confirmed student choices for that level.
 * Permission: class.manage (same gate as the rest of the Elective/Options
 * Block engine and the "Allocate Class" wizard this data feeds into).
 */
import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, fail, handleError } from "@/lib/api/respond";
import { getOptionsBlockRosterPrint, getSubjectCombinationRosterPrint } from "@/lib/services/elective-block.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission("class.manage");
    const kind = req.nextUrl.searchParams.get("kind");
    const level = req.nextUrl.searchParams.get("level");

    if (kind === "venue_roster") {
      return ok(await getOptionsBlockRosterPrint(user, level || undefined));
    }
    if (kind === "combination_roster") {
      if (!level) return fail("INVALID", "A level is required for the subject-combination roster print.", 400);
      return ok(await getSubjectCombinationRosterPrint(user, level));
    }
    return fail("INVALID", "Unknown print kind. Expected 'venue_roster' or 'combination_roster'.", 400);
  } catch (e) {
    return handleError(e);
  }
}
