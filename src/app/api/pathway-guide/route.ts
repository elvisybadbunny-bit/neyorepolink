/**
 * Y.1 — NEYO Pathway Guide, IN-APP (logged-in NEYO student/parent/staff)
 * entry point. Always free/unlocked immediately — no payment ever required
 * for a real NEYO school user, per the founder's own rule.
 * GET  -> questionnaire, IF the in-app flag is on.
 * POST { action: "start" | "answers" | "glimpse" | "match" | "get" }
 */
import { NextRequest } from "next/server";
import { requireUser } from "@/lib/core/session";
import { ok, fail, handleError } from "@/lib/api/respond";
import {
  isPathwayGuideInAppEnabled,
  getGuideQuestions,
  startGuideSession,
  submitGuideAnswers,
  getFullMatchedCourses,
  getGuideSessionFull,
  getKuccpsGlimpse,
} from "@/lib/services/pathway-guide.service";
import {
  startGuideSessionSchema,
  submitGuideAnswersSchema,
} from "@/lib/validations/pathway-guide";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireUser();
    const enabled = await isPathwayGuideInAppEnabled();
    if (!enabled) {
      return fail("FORBIDDEN", "The NEYO Pathway Guide is temporarily unavailable. Please check back soon.", 403);
    }
    return ok({ questions: getGuideQuestions() });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const enabled = await isPathwayGuideInAppEnabled();
    if (!enabled) {
      return fail("FORBIDDEN", "The NEYO Pathway Guide is temporarily unavailable. Please check back soon.", 403);
    }
    const body = await req.json();

    if (body?.action === "start") {
      const input = startGuideSessionSchema.parse(body);
      const session = await startGuideSession({
        tenantId: user.tenantId,
        studentId: input.studentId,
        isPublic: false,
        fullName: input.fullName || user.fullName,
      });
      return ok(session, 201);
    }

    if (body?.action === "answers") {
      const input = submitGuideAnswersSchema.parse(body);
      return ok(await submitGuideAnswers(input));
    }

    if (body?.action === "glimpse") {
      const sessionId = String(body?.sessionId || "");
      if (!sessionId) return fail("VALIDATION_ERROR", "sessionId is required.", 422);
      return ok(await getKuccpsGlimpse(sessionId));
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
