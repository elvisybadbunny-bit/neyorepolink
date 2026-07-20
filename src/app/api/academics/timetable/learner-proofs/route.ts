import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { latestSeniorLearnerProofs } from "@/lib/services/senior-personal-timetable.service";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission("academics.view");
    return ok(await latestSeniorLearnerProofs(user, req.nextUrl.searchParams.get("studentId") || undefined));
  } catch (error) { return handleError(error); }
}
