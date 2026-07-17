/**
 * EE.3 (Primary & Pre-Primary phase) — real KICD Primary and Pre-Primary
 * curriculum content library.
 *
 * GET ?grade=&subjectCode= -> the real strand/sub-strand preset for that
 *     grade+subject (for preview before applying).
 * POST { subjectId, grade, subjectCode } -> applies the real preset onto
 *     that school's own real Subject row (creates strands + sub-strands).
 *
 * Gated by the SAME Part-EE release-button (`assertEeFeatureReleased("EE.3")`)
 * as Junior School and Senior School — one single release switch in NEYO Ops
 * controls all KICD curriculum library presets across all grade bands.
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/core/session";
import { ok, fail, handleError } from "@/lib/api/respond";
import { applyJuniorSchoolCurriculumPreset } from "@/lib/services/cbc.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import {
  PRIMARY_SCHOOL_CURRICULUM,
  PRIMARY_SCHOOL_GRADES,
  ALL_PRIMARY_SUBJECT_CODES,
  type PrimarySchoolGrade,
} from "@/lib/data/kicd-primary-curriculum";

export const dynamic = "force-dynamic";

function isPrimaryGrade(g: string): g is PrimarySchoolGrade {
  return (PRIMARY_SCHOOL_GRADES as string[]).includes(g);
}

export async function GET(req: NextRequest) {
  try {
    await requirePermission("academics.view");
    await assertEeFeatureReleased("EE.3");
    const grade = req.nextUrl.searchParams.get("grade") ?? "";
    const subjectCode = req.nextUrl.searchParams.get("subjectCode") ?? "";
    if (!grade || !subjectCode) {
      return ok({
        grades: PRIMARY_SCHOOL_GRADES,
        subjectCodes: ALL_PRIMARY_SUBJECT_CODES,
      });
    }
    if (!isPrimaryGrade(grade)) {
      return fail("INVALID", "Unknown Primary/Pre-Primary grade.", 400);
    }
    const strands = PRIMARY_SCHOOL_CURRICULUM[grade]?.[subjectCode] ?? [];
    return ok({ grade, subjectCode, strands });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("academics.manage");
    await assertEeFeatureReleased("EE.3");
    const body = z
      .object({
        subjectId: z.string().min(1),
        grade: z.string().min(1),
        subjectCode: z.string().min(1),
      })
      .parse(await req.json());
    if (!isPrimaryGrade(body.grade)) {
      return fail("INVALID", "Unknown Primary/Pre-Primary grade.", 400);
    }
    const strands = PRIMARY_SCHOOL_CURRICULUM[body.grade]?.[body.subjectCode];
    if (!strands || strands.length === 0) {
      return fail(
        "NOT_FOUND",
        "No real KICD preset available yet for this specific grade and subject combination.",
        404
      );
    }
    return ok(
      await applyJuniorSchoolCurriculumPreset(user, {
        subjectId: body.subjectId,
        grade: body.grade,
        strands,
      })
    );
  } catch (e) {
    return handleError(e);
  }
}
