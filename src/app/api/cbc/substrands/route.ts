/**
 * EE.1 — real KICD sub-strands under a strand.
 * GET ?strandId= (academics.view) · POST create/preset/delete (academics.manage).
 */
import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { substrandSchema } from "@/lib/validations/cbc";
import { listSubstrands, createSubstrand, deleteSubstrand, addSubstrandPreset } from "@/lib/services/cbc.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission("academics.view");
    await assertEeFeatureReleased("EE.1");
    return ok({ substrands: await listSubstrands(user, req.nextUrl.searchParams.get("strandId") || undefined) });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("academics.manage");
    await assertEeFeatureReleased("EE.1");
    const body = await req.json();
    if (body?.action === "delete") {
      const { id } = z.object({ id: z.string().min(1) }).parse(body);
      return ok(await deleteSubstrand(user, id));
    }
    if (body?.preset) {
      const { strandId, preset } = z.object({
        strandId: z.string().min(1),
        preset: z.array(z.object({ name: z.string().min(2), learningOutcome: z.string() })),
      }).parse(body);
      return ok(await addSubstrandPreset(user, strandId, preset));
    }
    return ok(await createSubstrand(user, substrandSchema.parse(body)));
  } catch (e) {
    return handleError(e);
  }
}
