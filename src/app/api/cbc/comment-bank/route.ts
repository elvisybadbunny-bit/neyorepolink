/**
 * EE.2 — real, school-authored comment bank for rubric-driven auto-fill.
 * NEVER AI-generated — every phrase is either school-authored or a seeded
 * human-written starter set (seedDefaultCommentBank).
 * GET ?subjectId= list · ?resolve=1&subjectId=&level=&strandId=&substrandId= auto-fill lookup.
 * POST upsert / delete / seed_defaults (academics.manage).
 */
import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/core/session";
import { ok, fail, handleError } from "@/lib/api/respond";
import { commentBankEntrySchema } from "@/lib/validations/cbc";
import { listCommentBank, upsertCommentBankEntry, deleteCommentBankEntry, resolveAutoComment, seedDefaultCommentBank } from "@/lib/services/cbc.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission("exam.enter_marks");
    await assertEeFeatureReleased("EE.2");
    const sp = req.nextUrl.searchParams;
    if (sp.get("resolve") === "1") {
      const subjectId = sp.get("subjectId");
      const level = sp.get("level");
      if (!subjectId || !level) return fail("MISSING", "subjectId and level required.", 400);
      const result = await resolveAutoComment(user, {
        subjectId,
        level: Number(level),
        strandId: sp.get("strandId") || undefined,
        substrandId: sp.get("substrandId") || undefined,
        rotateKey: sp.get("rotateKey") || undefined,
      });
      return ok(result);
    }
    return ok({ entries: await listCommentBank(user, sp.get("subjectId") || undefined) });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("academics.manage");
    await assertEeFeatureReleased("EE.2");
    const body = await req.json();
    if (body?.action === "delete") {
      const { id } = z.object({ id: z.string().min(1) }).parse(body);
      return ok(await deleteCommentBankEntry(user, id));
    }
    if (body?.action === "seed_defaults") {
      const { subjectId } = z.object({ subjectId: z.string().min(1) }).parse(body);
      return ok(await seedDefaultCommentBank(user, subjectId));
    }
    return ok(await upsertCommentBankEntry(user, commentBankEntrySchema.parse(body)));
  } catch (e) {
    return handleError(e);
  }
}
