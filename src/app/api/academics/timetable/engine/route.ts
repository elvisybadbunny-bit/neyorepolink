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
import { db } from "@/lib/db";
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
      case "publish_timetable": {
        const seniorClasses = await db.schoolClass.findMany({ where: { tenantId: user.tenantId, archived: false }, select: { id: true, level: true } });
        const seniorClassIds = seniorClasses.filter((klass) => /(?:Grade|Form)\s*(?:10|11|12)/i.test(klass.level)).map((klass) => klass.id);
        if (seniorClassIds.length > 0) {
          const [latestJob, activeSeniorCount] = await Promise.all([
            db.timetableGenerationJob.findFirst({ where: { tenantId: user.tenantId, status: "DONE" }, orderBy: { startedAt: "desc" } }),
            db.student.count({ where: { tenantId: user.tenantId, classId: { in: seniorClassIds }, status: "ACTIVE", deletedAt: null } }),
          ]);
          if (!latestJob || latestJob.learnerProofInvalid > 0 || latestJob.learnerProofValid !== activeSeniorCount) {
            return fail("SENIOR_PROOF_REQUIRED", `Cannot publish: latest Senior learner proof covers ${latestJob?.learnerProofValid ?? 0}/${activeSeniorCount} learners with ${latestJob?.learnerProofInvalid ?? 0} invalid. Open Phase E and regenerate after corrections.`, 409);
          }
        }
        const teacherSlots = await db.timetableSlot.findMany({
          where: { tenantId: user.tenantId },
          select: { teacherId: true },
        });
        const teacherIds = [...new Set(teacherSlots.map((s) => s.teacherId).filter(Boolean) as string[])];
        for (const tId of teacherIds) {
          await db.notification.create({
            data: {
              tenantId: user.tenantId,
              recipientId: tId,
              title: "🚀 Official Timetable Published (`Smart Timetable`)",
              body: "The school timetable has been officially published. Check your schedule under Timetable / My Classes.",
              href: "/academics?tab=timetable",
            },
          }).catch(() => {});
        }
        await db.auditLog.create({
          data: {
            tenantId: user.tenantId, actorId: user.id, actorName: user.fullName,
            action: "academics.timetable_published", entityType: "timetable", entityId: user.tenantId,
            metadata: JSON.stringify({ teacherCountNotified: teacherIds.length }),
          },
        });
        return ok({ status: "PUBLISHED", notifiedTeachersCount: teacherIds.length });
      }
      case "draft_timetable": {
        await db.auditLog.create({
          data: {
            tenantId: user.tenantId, actorId: user.id, actorName: user.fullName,
            action: "academics.timetable_drafted", entityType: "timetable", entityId: user.tenantId,
          },
        });
        return ok({ status: "DRAFT" });
      }
      default:
        return fail("INVALID", "Unknown action.", 400);
    }
  } catch (e) {
    return mapErr(e) ?? handleError(e);
  }
}
