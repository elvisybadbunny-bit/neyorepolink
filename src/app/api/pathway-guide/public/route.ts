/**
 * Y.1 — NEYO Pathway Guide, PUBLIC (no NEYO account) entry point.
 * GET  -> real questionnaire + current fee, IF the public flag is on.
 * POST { action: "start" | "answers" | "match" | "get" }
 */
import { NextRequest } from "next/server";
import { ok, fail, handleError } from "@/lib/api/respond";
import {
  isPathwayGuidePublicEnabled,
  getPathwayGuideFeeKes,
  getGuideQuestions,
  startGuideSession,
  submitGuideAnswers,
  getFullMatchedCourses,
  getGuideSessionFull,
} from "@/lib/services/pathway-guide.service";
import {
  startGuideSessionSchema,
  submitGuideAnswersSchema,
} from "@/lib/validations/pathway-guide";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const enabled = await isPathwayGuidePublicEnabled();
    if (!enabled) {
      return fail("FORBIDDEN", "The NEYO Pathway Guide is temporarily unavailable. Please check back soon.", 403);
    }
    const [questions, feeKes] = await Promise.all([getGuideQuestions(), getPathwayGuideFeeKes()]);
    return ok({ questions, feeKes });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const enabled = await isPathwayGuidePublicEnabled();
    if (!enabled) {
      return fail("FORBIDDEN", "The NEYO Pathway Guide is temporarily unavailable. Please check back soon.", 403);
    }
    const body = await req.json();

    if (body?.action === "start") {
      const input = startGuideSessionSchema.parse(body);
      const session = await startGuideSession({ isPublic: true, fullName: input.fullName, phone: input.phone });
      return ok(session, 201);
    }

    if (body?.action === "answers") {
      const input = submitGuideAnswersSchema.parse(body);
      return ok(await submitGuideAnswers(input));
    }

    if (body?.action === "match") {
      const sessionId = String(body?.sessionId || "");
      if (!sessionId) return fail("VALIDATION_ERROR", "sessionId is required.", 422);
      return ok(await getFullMatchedCourses(sessionId));
    }

    if (body?.action === "get") {
      const sessionId = String(body?.sessionId || "");
      if (!sessionId) return fail("VALIDATION_ERROR", "sessionId is required.", 422);
      return ok(await getGuideSessionFull(sessionId));
    }

    return fail("VALIDATION_ERROR", "Unknown action.", 422);
  } catch (e) {
    return handleError(e);
  }
}
