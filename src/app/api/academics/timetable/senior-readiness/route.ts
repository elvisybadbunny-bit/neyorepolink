import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError, fail } from "@/lib/api/respond";
import { seniorTimetableReadiness } from "@/lib/services/senior-timetable-readiness.service";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission("academics.view");
    const level = req.nextUrl.searchParams.get("level")?.trim();
    if (!level) return fail("VALIDATION", "Choose a Senior School level first.", 422);
    return ok({ report: await seniorTimetableReadiness(user, level) });
  } catch (error) { return handleError(error); }
}
