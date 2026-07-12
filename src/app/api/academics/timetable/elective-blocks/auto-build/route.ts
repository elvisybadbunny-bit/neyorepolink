/**
 * BB.2 — Elective Block auto-build FROM real student subject-choice data.
 * GET  -> ?action=history: recent auto-build runs for this school.
 * POST -> actions: preview (real ELECTIVES/MATH_SPLIT detection),
 *         confirm (creates the real ElectiveBlock via the existing
 *         saveElectiveBlock() path), discard.
 */
import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, fail, handleError } from "@/lib/api/respond";
import {
  previewElectiveBlockAutoBuild,
  confirmElectiveBlockAutoBuild,
  discardElectiveBlockAutoBuild,
  listElectiveBlockAutoBuildRuns,
  ElectiveBlockAutoBuildError,
} from "@/lib/services/elective-block-auto-build.service";
import { electiveBlockAutoBuildActionSchema } from "@/lib/validations/elective-block-auto-build";

export const dynamic = "force-dynamic";

function mapErr(e: unknown) {
  if (e instanceof ElectiveBlockAutoBuildError) {
    const m = { NOT_FOUND: 404, INVALID: 400, CONFLICT: 409 } as const;
    return fail(e.code, e.message, m[e.code]);
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission("academics.view");
    if (req.nextUrl.searchParams.get("action") === "history") {
      return ok({ runs: await listElectiveBlockAutoBuildRuns(user) });
    }
    return fail("INVALID", "Unknown action.", 400);
  } catch (e) {
    return mapErr(e) ?? handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("academics.manage");
    const body = electiveBlockAutoBuildActionSchema.parse(await req.json());
    if (body.action === "preview") {
      return ok(await previewElectiveBlockAutoBuild(user, body));
    }
    if (body.action === "confirm") {
      return ok(await confirmElectiveBlockAutoBuild(user, body));
    }
    return ok(await discardElectiveBlockAutoBuild(user, body.runId));
  } catch (e) {
    return mapErr(e) ?? handleError(e);
  }
}
