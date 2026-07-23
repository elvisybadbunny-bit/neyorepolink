/**
 * B.6 formative assessments. GET sheet ?strandId=&classId= · POST save round.
 * Permission: exam.enter_marks (teachers); row-scoped in the service.
 */
import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError, fail } from "@/lib/api/respond";
import { assessSchema } from "@/lib/validations/cbc";
import { getAssessSheet, getCbcAssessSetup, saveAssessments, deleteCbcAssessment } from "@/lib/services/cbc.service";
import { withIdempotency } from "@/lib/services/idempotency.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission("exam.enter_marks");
    if (req.nextUrl.searchParams.get("setup") === "1") return ok(await getCbcAssessSetup(user));
    const strandId = req.nextUrl.searchParams.get("strandId");
    const classId = req.nextUrl.searchParams.get("classId");
    if (!strandId || !classId) return fail("MISSING", "strandId and classId required.", 400);
    return ok(await getAssessSheet(user, strandId, classId));
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("exam.enter_marks");
    const body = await req.json().catch(() => ({}));
    if (body.action === "delete") return ok(await deleteCbcAssessment(user, body.id || ""));
    const parsed = assessSchema.extend({ classId: z.string().min(1) }).parse(body);
    const idempotencyKey = req.headers.get("Idempotency-Key");
    if (idempotencyKey) {
      const replay = await withIdempotency(
        user.tenantId,
        "cbc.assessment_round",
        idempotencyKey,
        () => saveAssessments(user, parsed, parsed.classId),
      );
      return ok({ ...replay.result, replayed: replay.replayed });
    }
    return ok(await saveAssessments(user, parsed, parsed.classId));
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requirePermission("exam.enter_marks");
    const id = req.nextUrl.searchParams.get("id") || "";
    return ok(await deleteCbcAssessment(user, id));
  } catch (e) {
    return handleError(e);
  }
}
