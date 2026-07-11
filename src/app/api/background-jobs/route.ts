/**
 * T.5a — Background Task Runner: real, generic status API.
 * GET            -> the current user's own real jobs (Topbar badge/panel).
 * GET ?jobId=... -> a single real job's live status.
 * Every real long-running feature creates jobs server-side via
 * `runBackgroundJob()` directly — there is no POST here.
 */
import { NextRequest } from "next/server";
import { requireUser } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { myBackgroundJobs, getBackgroundJob, activeBackgroundJobCount } from "@/lib/services/background-job.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const jobId = req.nextUrl.searchParams.get("jobId");
    if (jobId) return ok(await getBackgroundJob(user, jobId));

    const [jobs, activeCount] = await Promise.all([
      myBackgroundJobs(user),
      activeBackgroundJobCount(user),
    ]);
    return ok({ jobs, activeCount });
  } catch (e) {
    return handleError(e);
  }
}
