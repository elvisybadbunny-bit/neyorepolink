/**
 * AA.1 — Real Elective/Options Block API.
 * GET  -> list every real Options Block this school has defined (with its
 *         real classes/slots/subject-teacher/venue breakdown).
 * POST -> actions: save_block (create or update, full replace-children on
 *         update, matching CombinationGroup's own upsert pattern),
 *         delete_block.
 */
import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, fail, handleError } from "@/lib/api/respond";
import {
  listElectiveBlocks,
  saveElectiveBlock,
  deleteElectiveBlock,
  ElectiveBlockError,
} from "@/lib/services/elective-block.service";
import { electiveBlockSaveSchema, electiveBlockDeleteSchema } from "@/lib/validations/elective-block";

export const dynamic = "force-dynamic";

function mapErr(e: unknown) {
  if (e instanceof ElectiveBlockError) {
    const m = { NOT_FOUND: 404, INVALID: 400, CONFLICT: 409 } as const;
    return fail(e.code, e.message, m[e.code]);
  }
  return null;
}

export async function GET() {
  try {
    const user = await requirePermission("academics.view");
    const blocks = await listElectiveBlocks(user);
    return ok({ blocks });
  } catch (e) {
    return mapErr(e) ?? handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("academics.manage");
    const body = await req.json().catch(() => ({}));
    switch (body.action) {
      case "save_block": {
        const input = electiveBlockSaveSchema.parse(body);
        return ok(await saveElectiveBlock(user, input));
      }
      case "delete_block": {
        const input = electiveBlockDeleteSchema.parse(body);
        return ok(await deleteElectiveBlock(user, input.id));
      }
      default:
        return fail("INVALID", "Unknown action.", 400);
    }
  } catch (e) {
    return mapErr(e) ?? handleError(e);
  }
}
