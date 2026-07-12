/**
 * AA.3 — real, permanent per-graduation-year class history (roster + real
 * subject-teacher allocation), frozen automatically by commitPromotion() the
 * moment a class graduates, so reusing the same SchoolClass row next year
 * never loses or blurs an earlier year's real data.
 * GET /api/promotion/class-year-history?graduationYear=2026&classId=...
 * Permission: class.manage.
 */
import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { listClassYearHistory } from "@/lib/services/promotion.service";
import { classYearHistoryQuerySchema } from "@/lib/validations/teacher-allocation-review";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission("class.manage");
    const parsed = classYearHistoryQuerySchema.parse({
      graduationYear: req.nextUrl.searchParams.get("graduationYear") ?? undefined,
      classId: req.nextUrl.searchParams.get("classId") ?? undefined,
    });
    return ok({ history: await listClassYearHistory(user, parsed) });
  } catch (e) {
    return handleError(e);
  }
}
