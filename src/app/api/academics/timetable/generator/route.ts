/**
 * G.18 Whole-School Timetable Generator API.
 * GET  /api/academics/timetable/generator          - fetches classes, subjects, teachers, configs, needs matrices
 * POST /api/academics/timetable/generator          - handles actions (save_need, save_config, save_teacher_subject, generate)
 */
import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError, fail } from "@/lib/api/respond";
import {
  getTimetableInputs, saveClassSubjectNeed, saveTimetableConfig,
  saveTeacherSubjects, generateWholeSchoolTimetable, autoAssignTeachersToClasses,
  rotateFlaggedTeacherAssignments,
  getTimetableConfigAgreementForLevel, saveTimetableConfigForLevel,
  getClassSubjectNeedAgreementForLevel, saveClassSubjectNeedForLevel,
} from "@/lib/services/timetable-solver.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission("academics.view");
    // DD.9/DD.10 — real, whole-grade agreement checks, only computed when
    // explicitly asked for (never on the ordinary matrix load, which stays
    // exactly as fast as before for schools not yet using this view).
    const level = req.nextUrl.searchParams.get("level");
    if (level && req.nextUrl.searchParams.get("agreement") === "config") {
      const result = await getTimetableConfigAgreementForLevel(user, level);
      return ok(result);
    }
    if (level && req.nextUrl.searchParams.get("agreement") === "needs") {
      const result = await getClassSubjectNeedAgreementForLevel(user, level);
      return ok(result);
    }
    const result = await getTimetableInputs(user);
    return ok(result);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("academics.manage");
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    if (action === "save_need") {
      const result = await saveClassSubjectNeed(user, {
        classId: body.classId,
        subjectId: body.subjectId,
        lessonsPerWeek: Number(body.lessonsPerWeek),
        teacherId: body.teacherId || null,
        doubleCount: body.doubleCount !== undefined ? Number(body.doubleCount) : undefined,
        allowSplitDouble: body.allowSplitDouble !== undefined ? Boolean(body.allowSplitDouble) : undefined,
        venueId: body.venueId || null,
        // AA.4 — real, school-set "prefer right after a break" flag.
        requiresMovement: body.requiresMovement !== undefined ? Boolean(body.requiresMovement) : undefined,
        // AA.8 — real, school-set "never gets a lab for this subject" flag
        // and real soft lab-priority tier ("NORMAL" | "HIGH").
        noLabAccess: body.noLabAccess !== undefined ? Boolean(body.noLabAccess) : undefined,
        labPriority: typeof body.labPriority === "string" ? body.labPriority : undefined,
        // AA.9 — real, school-set "rotate this subject's teacher each
        // term" flag (never a hardcoded rule about which subject/who).
        rotateTeacherEachTerm: body.rotateTeacherEachTerm !== undefined ? Boolean(body.rotateTeacherEachTerm) : undefined,
      });
      return ok(result);
    }

    if (action === "save_config") {
      const result = await saveTimetableConfig(user, {
        classId: body.classId,
        periodsPerDay: Number(body.periodsPerDay || 8),
        freePeriodsPerWeek: Number(body.freePeriodsPerWeek || 0),
        coCurricularCount: Number(body.coCurricularCount || 0),
        coCurricularName: body.coCurricularName || "Games",
        schoolDayStartTime: typeof body.schoolDayStartTime === "string" ? body.schoolDayStartTime : "08:00",
        saturdayStartTime: typeof body.saturdayStartTime === "string" ? body.saturdayStartTime : "08:00",
        saturdayEndTime: typeof body.saturdayEndTime === "string" ? body.saturdayEndTime : "12:40",
        lessonDurationMins: Number(body.lessonDurationMins || 40),
        shortBreakStart: Number(body.shortBreakStart || 2),
        shortBreakMins: Number(body.shortBreakMins || 15),
        shortBreak2Start: body.shortBreak2Start ? Number(body.shortBreak2Start) : null,
        shortBreak2Mins: body.shortBreak2Start ? Number(body.shortBreak2Mins || 10) : null,
        longBreakStart: Number(body.longBreakStart || 4),
        longBreakMins: Number(body.longBreakMins || 30),
        lunchStart: Number(body.lunchStart || 6),
        lunchMins: Number(body.lunchMins || 60),
        hasRemedials: Boolean(body.hasRemedials),
        hasPreps: Boolean(body.hasPreps),
        lunchShift: Number(body.lunchShift || 1),
        // CC.1 — real, direct "lunch is after period N" choice.
        lunchAfterPeriod: body.lunchAfterPeriod !== undefined && body.lunchAfterPeriod !== null && body.lunchAfterPeriod !== ""
          ? Number(body.lunchAfterPeriod)
          : null,
        hasSaturday: Boolean(body.hasSaturday !== undefined ? body.hasSaturday : true),
      });
      return ok(result);
    }

    // DD.9/DD.10 — real, whole-grade save: writes the SAME real
    // TimetableConfig values to every real class of `body.level` at once,
    // so a school configures a grade genuinely ONCE instead of once per
    // real stream. Only ever called after the UI's own honest agreement
    // check (or a school's own explicit "make every stream match" choice).
    if (action === "save_config_for_level") {
      const result = await saveTimetableConfigForLevel(user, body.level, {
        periodsPerDay: Number(body.periodsPerDay || 8),
        freePeriodsPerWeek: Number(body.freePeriodsPerWeek || 0),
        coCurricularCount: Number(body.coCurricularCount || 0),
        coCurricularName: body.coCurricularName || "Games",
        schoolDayStartTime: typeof body.schoolDayStartTime === "string" ? body.schoolDayStartTime : "08:00",
        saturdayStartTime: typeof body.saturdayStartTime === "string" ? body.saturdayStartTime : "08:00",
        saturdayEndTime: typeof body.saturdayEndTime === "string" ? body.saturdayEndTime : "12:40",
        lessonDurationMins: Number(body.lessonDurationMins || 40),
        shortBreakStart: Number(body.shortBreakStart || 2),
        shortBreakMins: Number(body.shortBreakMins || 15),
        shortBreak2Start: body.shortBreak2Start ? Number(body.shortBreak2Start) : null,
        shortBreak2Mins: body.shortBreak2Start ? Number(body.shortBreak2Mins || 10) : null,
        longBreakStart: Number(body.longBreakStart || 4),
        longBreakMins: Number(body.longBreakMins || 30),
        lunchStart: Number(body.lunchStart || 6),
        lunchMins: Number(body.lunchMins || 60),
        hasRemedials: Boolean(body.hasRemedials),
        hasPreps: Boolean(body.hasPreps),
        lunchShift: Number(body.lunchShift || 1),
        lunchAfterPeriod: body.lunchAfterPeriod !== undefined && body.lunchAfterPeriod !== null && body.lunchAfterPeriod !== ""
          ? Number(body.lunchAfterPeriod)
          : null,
        hasSaturday: Boolean(body.hasSaturday !== undefined ? body.hasSaturday : true),
      });
      return ok(result);
    }

    // DD.9 — real, whole-grade save for ONE real subject's own
    // ClassSubjectNeed, written to every real class of `body.level` at
    // once. `teacherIdByClassId` (optional) lets a school still pick a
    // genuinely different teacher per stream for this same subject, since
    // that's a real, legitimate exception (see
    // CLASS_SUBJECT_NEED_COMPARABLE_FIELDS's own comment).
    if (action === "save_need_for_level") {
      const result = await saveClassSubjectNeedForLevel(
        user,
        body.level,
        body.subjectId,
        {
          lessonsPerWeek: Number(body.lessonsPerWeek),
          doubleCount: body.doubleCount !== undefined ? Number(body.doubleCount) : undefined,
          allowSplitDouble: body.allowSplitDouble !== undefined ? Boolean(body.allowSplitDouble) : undefined,
          venueId: body.venueId || null,
          requiresMovement: body.requiresMovement !== undefined ? Boolean(body.requiresMovement) : undefined,
          noLabAccess: body.noLabAccess !== undefined ? Boolean(body.noLabAccess) : undefined,
          labPriority: typeof body.labPriority === "string" ? body.labPriority : undefined,
          rotateTeacherEachTerm: body.rotateTeacherEachTerm !== undefined ? Boolean(body.rotateTeacherEachTerm) : undefined,
        },
        body.teacherIdByClassId && typeof body.teacherIdByClassId === "object" ? body.teacherIdByClassId : undefined
      );
      return ok(result);
    }

    if (action === "save_teacher_subject") {
      const result = await saveTeacherSubjects(user, body.teacherId, (body.subjectIds as any[]).map(s => typeof s === "string" ? { id: s, isStrong: false } : s));
      return ok(result);
    }

    if (action === "generate") {
      const result = await generateWholeSchoolTimetable(user);
      return ok(result);
    }

    // AA.9 — real "start of term" action: deliberately re-rolls the
    // teacher assignment for every real class-subject pairing flagged
    // rotateTeacherEachTerm, reusing the exact same existing fair-
    // allocation logic. A Principal/office role triggers this explicitly.
    if (action === "rotate_flagged_teachers") {
      const result = await rotateFlaggedTeacherAssignments(user);
      return ok(result);
    }

    return fail("BAD_REQUEST", "Invalid action specified.", 400);
  } catch (e) {
    return handleError(e);
  }
}
