/**
 * EE.3 — real KICD Junior School (Grade 7-9) curriculum content library.
 * GET ?grade=&subjectCode= -> the real strand/sub-strand preset for that
 *     grade+subject (for preview before applying).
 * POST { subjectId, grade, subjectCode } -> applies the real preset onto
 *     that school's own real Subject row (creates strands + sub-strands).
 * Gated by the Part-EE release-button registry (OFF by default).
 *
 * Serves BOTH the original 5-subject preset library (Mathematics, English,
 * Kiswahili, Integrated Science, Social Studies) AND the Part-2 4-subject
 * follow-up (Pre-Technical Studies, Agriculture & Nutrition, Creative Arts
 * & Sports, Christian Religious Education) added later — together these 9
 * cover every real KICD-rationalised (2024 framework) Junior School
 * compulsory learning area. The two data files stay separate on disk
 * (Part 1 untouched) and are merged once, here, into one lookup.
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
import {
  JUNIOR_SCHOOL_CURRICULUM_PART2, JUNIOR_SCHOOL_SUBJECT_CODES_PART2,
} from "@/lib/data/kicd-junior-school-curriculum-part2";

export const dynamic = "force-dynamic";

function isJuniorGrade(g: string): g is JuniorSchoolGrade {
  return (JUNIOR_SCHOOL_GRADES as string[]).includes(g);
}

/** All real, currently-available Junior School preset subject codes across both parts. */
const ALL_JUNIOR_SCHOOL_SUBJECT_CODES = [...JUNIOR_SCHOOL_SUBJECT_CODES, ...JUNIOR_SCHOOL_SUBJECT_CODES_PART2];

function lookupPreset(grade: JuniorSchoolGrade, subjectCode: string) {
  return JUNIOR_SCHOOL_CURRICULUM[grade][subjectCode] ?? JUNIOR_SCHOOL_CURRICULUM_PART2[grade][subjectCode];
}

export async function GET(req: NextRequest) {
  try {
    await requirePermission("academics.view");
    await assertEeFeatureReleased("EE.3");
    const grade = req.nextUrl.searchParams.get("grade") ?? "";
    const subjectCode = req.nextUrl.searchParams.get("subjectCode") ?? "";
    if (!grade || !subjectCode) {
      return ok({ grades: JUNIOR_SCHOOL_GRADES, subjectCodes: ALL_JUNIOR_SCHOOL_SUBJECT_CODES });
    }
    if (!isJuniorGrade(grade)) return fail("INVALID", "Unknown Junior School grade.", 400);
    const strands = lookupPreset(grade, subjectCode) ?? [];
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
    const strands = lookupPreset(body.grade, body.subjectCode);
    if (!strands) return fail("NOT_FOUND", "No real KICD preset available yet for this grade/subject combination.", 404);
    return ok(await applyJuniorSchoolCurriculumPreset(user, { subjectId: body.subjectId, grade: body.grade, strands }));
  } catch (e) {
    return handleError(e);
  }
}
