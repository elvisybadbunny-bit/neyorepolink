/**
 * EE.3 (Senior School phase complete) — real KICD Grade 10, Grade 11, and Grade 12
 * Senior School curriculum content library (Core Mathematics, Essential Mathematics,
 * English, Kiswahili, Community Service Learning, plus STEM and pathway electives
 * like Physics, Chemistry, Biology, Computer Studies, Business, Agriculture, etc.).
 *
 * GET ?grade=&subjectCode= -> the real strand/sub-strand preset for that
 *     grade+subject (for preview before applying).
 * POST { subjectId, grade, subjectCode } -> applies the real preset onto
 *     that school's own real Subject row (creates strands + sub-strands).
 * Gated by the SAME Part-EE release-button (EE.3) as the Junior School
 * curriculum library — one release-button covers the whole phased KICD
 * curriculum-content project, not a separate flag per grade band.
 *
 * Reuses `applyJuniorSchoolCurriculumPreset()` unmodified (it only ever
 * takes a subject id + a grade label string + a strand/sub-strand array —
 * genuinely grade-band-agnostic despite its Junior-School-era name).
 */
import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/core/session";
import { ok, fail, handleError } from "@/lib/api/respond";
import { applyJuniorSchoolCurriculumPreset } from "@/lib/services/cbc.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import {
  SENIOR_SCHOOL_CURRICULUM, SENIOR_SCHOOL_GRADES, SENIOR_SCHOOL_SUBJECT_CODES,
  type SeniorSchoolGrade,
} from "@/lib/data/kicd-senior-school-curriculum";

export const dynamic = "force-dynamic";

function isSeniorGrade(g: string): g is SeniorSchoolGrade {
  return (SENIOR_SCHOOL_GRADES as string[]).includes(g);
}

export async function GET(req: NextRequest) {
  try {
    await requirePermission("academics.view");
    await assertEeFeatureReleased("EE.3");
    const grade = req.nextUrl.searchParams.get("grade") ?? "";
    const subjectCode = req.nextUrl.searchParams.get("subjectCode") ?? "";
    if (!grade || !subjectCode) {
      return ok({ grades: SENIOR_SCHOOL_GRADES, subjectCodes: SENIOR_SCHOOL_SUBJECT_CODES });
    }
    if (!isSeniorGrade(grade)) return fail("INVALID", "Unknown Senior School grade (must be Grade 10, Grade 11, or Grade 12).", 400);
    const strands = SENIOR_SCHOOL_CURRICULUM[grade][subjectCode] ?? [];
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
    if (!isSeniorGrade(body.grade)) return fail("INVALID", "Unknown Senior School grade (must be Grade 10, Grade 11, or Grade 12).", 400);
    const strands = SENIOR_SCHOOL_CURRICULUM[body.grade][body.subjectCode];
    if (!strands) return fail("NOT_FOUND", "No real KICD preset available yet for this grade/subject combination.", 404);
    return ok(await applyJuniorSchoolCurriculumPreset(user, { subjectId: body.subjectId, grade: body.grade, strands }));
  } catch (e) {
    return handleError(e);
  }
}
