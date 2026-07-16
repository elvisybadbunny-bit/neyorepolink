/**
 * L.7 — Advanced Timetable Engine settings API.
 * GET  -> all constraints + combination groups (the school's configured rules);
 *         ?action=pre_generation_summary -> AA.5's real "undecided lessons ->
 *         free periods" confirmation summary.
 * POST -> actions: upsert_constraint, delete_constraint, save_timeoff,
 *         upsert_combination, delete_combination.
 */
import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, fail, handleError } from "@/lib/api/respond";
import {
  listConstraints, upsertConstraint, deleteConstraint, saveTeacherTimeOff,
  listCombinationGroups, upsertCombinationGroup, deleteCombinationGroup,
  applyKicdSeniorSchoolTemplate, getPreGenerationSummary,
  listBlockedTimetableSlots, upsertBlockedTimetableSlot, deleteBlockedTimetableSlot,
  TimetableEngineError,
} from "@/lib/services/timetable-engine.service";

export const dynamic = "force-dynamic";

function mapErr(e: unknown) {
  if (e instanceof TimetableEngineError) {
    const m = { NOT_FOUND: 404, INVALID: 400, BUSY: 409 } as const;
    return fail(e.code, e.message, m[e.code]);
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission("academics.view");
    // AA.5 — real pre-generation "undecided lessons -> free periods"
    // confirmation summary, fetched on demand right before a school
    // presses the Master Button (never blocks the main constraints/
    // combinations fetch above).
    if (req.nextUrl.searchParams.get("action") === "pre_generation_summary") {
      return ok(await getPreGenerationSummary(user));
    }
    // AA.6 — real hard-blocked timetable slots list.
    if (req.nextUrl.searchParams.get("action") === "blocked_slots") {
      return ok({ blockedSlots: await listBlockedTimetableSlots(user) });
    }
    const [constraints, combinations] = await Promise.all([listConstraints(user), listCombinationGroups(user)]);
    return ok({ constraints, combinations });
  } catch (e) {
    return mapErr(e) ?? handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("academics.manage");
    const body = await req.json().catch(() => ({}));
    switch (body.action) {
      case "upsert_constraint":
        return ok(await upsertConstraint(user, body));
      case "delete_constraint":
        return ok(await deleteConstraint(user, body.id));
      case "save_timeoff":
        return ok(await saveTeacherTimeOff(user, body.teacherId, body.windows ?? []));
      case "upsert_combination":
        return ok(await upsertCombinationGroup(user, body));
      case "delete_combination":
        return ok(await deleteCombinationGroup(user, body.id));
      case "apply_kicd_senior_template":
        return ok(await applyKicdSeniorSchoolTemplate(user, { classId: body.classId, electiveSubjectIds: body.electiveSubjectIds ?? [] }));
      case "upsert_blocked_slot":
        return ok(await upsertBlockedTimetableSlot(user, body));
      case "delete_blocked_slot":
        return ok(await deleteBlockedTimetableSlot(user, body.id));
      default:
        return fail("INVALID", "Unknown action.", 400);
    }
  } catch (e) {
    return mapErr(e) ?? handleError(e);
  }
}
