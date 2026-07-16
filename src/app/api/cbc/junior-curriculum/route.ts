/**
 * EE.3 — real KICD Junior School (Grade 7-9) curriculum content library.
 * GET ?grade=&subjectCode= -> the real strand/sub-strand preset for that
 *     grade+subject (for preview before applying).
 * POST { subjectId, grade, subjectCode } -> applies the real preset onto
 *     that school's own real Subject row (creates strands + sub-strands).
 * Gated by the Part-EE release-button registry (OFF by default).
 */
import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/core/session";
import { ok, fail, handleError } from "@/lib/api/respond";
import { applyJuniorSchoolCurriculumPreset } from "@/lib/services/cbc.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import {
  JUNIOR_SCHOOL_CURRICULUM, JUNIOR_SCHOOL_GRADES, JUNIOR_SCHOOL_SUBJECT_CODES,
  type JuniorSchoolGrade,
} from "@/lib/data/kicd-junior-school-curriculum";

export const dynamic = "force-dynamic";

function isJuniorGrade(g: string): g is JuniorSchoolGrade {
  return (JUNIOR_SCHOOL_GRADES as string[]).includes(g);
}

export async function GET(req: NextRequest) {
  try {
    await requirePermission("academics.view");
    await assertEeFeatureReleased("EE.3");
    const grade = req.nextUrl.searchParams.get("grade") ?? "";
    const subjectCode = req.nextUrl.searchParams.get("subjectCode") ?? "";
    if (!grade || !subjectCode) {
      return ok({ grades: JUNIOR_SCHOOL_GRADES, subjectCodes: JUNIOR_SCHOOL_SUBJECT_CODES });
    }
    if (!isJuniorGrade(grade)) return fail("INVALID", "Unknown Junior School grade.", 400);
    const strands = JUNIOR_SCHOOL_CURRICULUM[grade][subjectCode] ?? [];
    return ok({ grade, subjectCode, strands });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("academics.manage");
    await assertEeFeatureReleased("EE.3");
    const body = z.object({
      subjectId: z.string().min(1),
      grade: z.string().min(1),
      subjectCode: z.string().min(1),
    }).parse(await req.json());
    if (!isJuniorGrade(body.grade)) return fail("INVALID", "Unknown Junior School grade.", 400);
    const strands = JUNIOR_SCHOOL_CURRICULUM[body.grade][body.subjectCode];
    if (!strands) return fail("NOT_FOUND", "No real KICD preset available yet for this grade/subject combination.", 404);
    return ok(await applyJuniorSchoolCurriculumPreset(user, { subjectId: body.subjectId, grade: body.grade, strands }));
  } catch (e) {
    return handleError(e);
  }
}
