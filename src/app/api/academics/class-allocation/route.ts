/**
 * BB.4 — Grade 10 "Allocate Class" one-click flow.
 * GET  -> ?action=history: recent allocation runs for this school.
 * POST -> actions: preview (real subject-combination grouping preview,
 *         either against existing classes via L.7 or proposed new ones),
 *         confirm (real, explicit, staff-confirmed placement — creates
 *         classes if needed, moves students, seeds subject needs, fills
 *         teacher gaps, optionally regenerates the timetable).
 * Permission: class.manage (same as the existing L.7 auto-grouping route,
 * since this wizard is a real guided entry point INTO that exact engine).
 */
import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, fail, handleError } from "@/lib/api/respond";
import {
  previewClassAllocation, confirmClassAllocation, listClassAllocationRuns,
  ClassAllocationError,
} from "@/lib/services/class-allocation.service";
import { AutoGroupingError } from "@/lib/services/l7-auto-grouping.service";
import { classAllocationActionSchema } from "@/lib/validations/class-allocation";

export const dynamic = "force-dynamic";

function mapErr(e: unknown) {
  if (e instanceof ClassAllocationError || e instanceof AutoGroupingError) {
    const m = { NOT_FOUND: 404, INVALID: 400, CONFLICT: 409 } as const;
    return fail(e.code, e.message, m[e.code]);
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission("class.manage");
    if (req.nextUrl.searchParams.get("action") === "history") {
      return ok({ runs: await listClassAllocationRuns(user) });
    }
    return fail("INVALID", "Unknown action.", 400);
  } catch (e) {
    return mapErr(e) ?? handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("class.manage");
    const body = classAllocationActionSchema.parse(await req.json());
    if (body.action === "preview") {
      return ok(await previewClassAllocation(user, body));
    }
    return ok(await confirmClassAllocation(user, body));
  } catch (e) {
    return mapErr(e) ?? handleError(e);
  }
}
