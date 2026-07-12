/**
 * AA.3 — New Academic Year Teacher Allocation Review wizard.
 * GET  /api/promotion/teacher-allocation-review?level=Form+2  -> real snapshot
 * GET  /api/promotion/teacher-allocation-review?action=history -> recent review runs
 * POST /api/promotion/teacher-allocation-review {action: "start"|"apply"}
 * Permission: class.manage (whole-school op, same as promotion/continuity engine).
 */
import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/core/session";
import { ok, fail, handleError } from "@/lib/api/respond";
import {
  getReviewSnapshot, startReviewRun, applyReviewDecisions, listReviewRuns,
  TeacherAllocationReviewError,
} from "@/lib/services/teacher-allocation-review.service";
import { startReviewSchema, applyReviewSchema } from "@/lib/validations/teacher-allocation-review";

export const dynamic = "force-dynamic";

const postSchema = z.discriminatedUnion("action", [
  startReviewSchema.extend({ action: z.literal("start") }),
  applyReviewSchema.extend({ action: z.literal("apply") }),
]);

function mapErr(e: unknown) {
  if (e instanceof TeacherAllocationReviewError) {
    const m = { NOT_FOUND: 404, INVALID: 400, CONFLICT: 409 } as const;
    return fail(e.code, e.message, m[e.code]);
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission("class.manage");
    if (req.nextUrl.searchParams.get("action") === "history") {
      return ok({ runs: await listReviewRuns(user) });
    }
    const level = req.nextUrl.searchParams.get("level") || "";
    if (!level) return fail("INVALID", "A real level is required.", 400);
    return ok(await getReviewSnapshot(user, level));
  } catch (e) {
    return mapErr(e) ?? handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("class.manage");
    const body = postSchema.parse(await req.json());
    if (body.action === "start") {
      return ok(await startReviewRun(user, body.level, body.promotionRunId ?? null));
    }
    return ok(await applyReviewDecisions(user, body));
  } catch (e) {
    return mapErr(e) ?? handleError(e);
  }
}
