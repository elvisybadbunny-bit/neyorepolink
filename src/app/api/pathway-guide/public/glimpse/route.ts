/** Y.1 — free KUCCPS "glimpse" (a few cluster names only) for any public session. */
import { NextRequest } from "next/server";
import { ok, fail, handleError } from "@/lib/api/respond";
import { getKuccpsGlimpse, isPathwayGuidePublicEnabled } from "@/lib/services/pathway-guide.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    if (!(await isPathwayGuidePublicEnabled())) {
      return fail("FORBIDDEN", "The NEYO Pathway Guide is temporarily unavailable. Please check back soon.", 403);
    }
    const body = await req.json();
    const sessionId = String(body?.sessionId || "");
    if (!sessionId) return fail("VALIDATION_ERROR", "sessionId is required.", 422);
    return ok(await getKuccpsGlimpse(sessionId));
  } catch (e) {
    return handleError(e);
  }
}
