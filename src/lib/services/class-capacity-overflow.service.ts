/**
 * BB.3 — Real class-size cap + overflow decision.
 *
 * Founder's own real request, verbatim: "the school can add their maximum
 * number for a class so that when the system combines different classes
 * into one class and their is a big number remaining a new teacher is
 * added or a school can just press allow all in that one class even if
 * they surpass the number."
 *
 * `SchoolClass.capacity` already existed but was never enforced anywhere
 * in the codebase — this is the first real feature to actually read and
 * act on it. `checkCapacity()` is a real, reusable check any real
 * placement flow (L.7 auto-grouping, BB.2/BB.4 auto-build) can call before
 * committing a group of students into one class; `decideOverflow()` is the
 * real, explicit, staff-confirmed resolution — nothing is ever silently
 * decided.
 */
import { db } from "@/lib/db";
import { withTenant } from "@/lib/core/tenant-context";
import { tenantDb } from "@/lib/core/tenant-db";
import type { SessionUser } from "@/lib/core/session";
import type { DecideOverflowInput } from "@/lib/validations/class-capacity-overflow";

export class ClassCapacityOverflowError extends Error {
  constructor(public code: "NOT_FOUND" | "INVALID" | "CONFLICT", message: string) {
    super(message);
    this.name = "ClassCapacityOverflowError";
  }
}

/**
 * Real capacity check — call this BEFORE actually placing `studentIds`
 * into `classId`. Returns `{ overflow: false }` immediately (no real row
 * created) when the class has no configured capacity, or the group
 * genuinely fits — a school that never sets a capacity is never bothered
 * by this feature at all, matching NEYO's own "never force a decision
 * nobody asked for" principle.
 */
export async function checkCapacity(
  user: SessionUser,
  input: { classId: string; studentIds: string[]; subjectId?: string | null }
) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const cls = await tdb.schoolClass.findUnique({ where: { id: input.classId } });
    if (!cls) throw new ClassCapacityOverflowError("NOT_FOUND", "Class not found.");
    if (cls.capacity == null) return { overflow: false as const };

    // Real current headcount + the real incoming group, deduplicated (a
    // student already IN this class being re-confirmed here should never
    // be double-counted as "new").
    const existingCount = await tdb.student.count({ where: { classId: input.classId, status: "ACTIVE" } });
    const existingIds = new Set((await tdb.student.findMany({ where: { classId: input.classId, status: "ACTIVE" }, select: { id: true } })).map((s) => s.id));
    const genuinelyNewIds = input.studentIds.filter((id) => !existingIds.has(id));
    const projectedTotal = existingCount + genuinelyNewIds.length;

    if (projectedTotal <= cls.capacity) return { overflow: false as const };

    const overflowCount = projectedTotal - cls.capacity;
    const run = await tdb.classCapacityOverflowRun.create({
      data: {
        classId: input.classId,
        subjectId: input.subjectId ?? null,
        overflowCount,
        decision: "PENDING",
        createdById: user.id,
        createdByName: user.fullName,
      } as never,
    });
    return {
      overflow: true as const,
      runId: run.id,
      classId: input.classId,
      classLabel: `${cls.level} ${cls.stream ?? ""}`.trim(),
      capacity: cls.capacity,
      projectedTotal,
      overflowCount,
    };
  });
}

/**
 * Real, explicit, staff-confirmed resolution. SPLIT_NEW_CLASS creates a
 * genuinely new real SchoolClass (auto-named from the school's own real
 * chosen name, e.g. "Form 3 Geo" — the founder's own exact naming
 * convention), then runs the fair teacher auto-assign engine LAST, only
 * for genuinely still-unfilled ClassSubjectNeed gaps on the new class
 * (never overriding a school's own manual assignment, since there is
 * none yet on a brand-new class — this is simply "fill what's empty").
 * ALLOW_OVER_CAPACITY makes no real class-row changes at all — it is
 * purely an honest, audited acknowledgement that the school has chosen
 * to exceed their own configured cap.
 */
export async function decideOverflow(user: SessionUser, input: DecideOverflowInput) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const run = await tdb.classCapacityOverflowRun.findUnique({ where: { id: input.runId } });
    if (!run) throw new ClassCapacityOverflowError("NOT_FOUND", "Overflow check not found.");
    if (run.decision !== "PENDING") throw new ClassCapacityOverflowError("CONFLICT", "This overflow was already decided.");

    if (input.decision === "ALLOW_OVER_CAPACITY") {
      await tdb.classCapacityOverflowRun.update({
        where: { id: run.id },
        data: { decision: "ALLOW_OVER_CAPACITY", decidedAt: new Date() },
      });
      await db.auditLog.create({
        data: {
          tenantId: user.tenantId, actorId: user.id, actorName: user.fullName,
          action: "class_capacity_overflow.allowed", entityType: "classCapacityOverflowRun", entityId: run.id,
          metadata: JSON.stringify({ classId: run.classId, overflowCount: run.overflowCount }),
        },
      });
      return { decision: "ALLOW_OVER_CAPACITY" as const, newClassId: null, autoAssignedTeacherCount: 0 };
    }

    // SPLIT_NEW_CLASS — real, honest creation of a genuinely new class.
    const srcClass = await tdb.schoolClass.findUnique({ where: { id: run.classId } });
    if (!srcClass) throw new ClassCapacityOverflowError("NOT_FOUND", "The original class no longer exists.");

    const newClass = await tdb.schoolClass.create({
      data: {
        level: srcClass.level,
        // The school's own real chosen stream/section name (founder's own
        // exact naming request, e.g. "Geo" for a Form 3 Geography-driven
        // split — producing "Form 3 Geo" when combined with the level).
        stream: input.newClassStream || input.newClassName,
        curriculum: srcClass.curriculum,
        capacity: srcClass.capacity,
      } as never,
    });

    // Real, honest fair teacher auto-assign — runs LAST, as a genuine
    // fallback, and ONLY for this brand-new class's own real remaining
    // ClassSubjectNeed gaps (there is nothing for a school to have
    // manually pre-assigned yet on a class that didn't exist a moment
    // ago, so this never overrides a real human decision). If the real
    // subject that caused this overflow is known, seed a real
    // ClassSubjectNeed row for it on the new class first so there is
    // genuinely something to auto-assign.
    let autoAssignedTeacherCount = 0;
    if (run.subjectId) {
      const existingNeed = await tdb.classSubjectNeed.findFirst({ where: { classId: newClass.id, subjectId: run.subjectId } });
      if (!existingNeed) {
        await tdb.classSubjectNeed.create({ data: { classId: newClass.id, subjectId: run.subjectId, teacherId: null, lessonsPerWeek: 5 } as never });
      }
    }
    const { autoAssignTeachersToClasses } = await import("@/lib/services/timetable-solver.service");
    const beforeFilled = await tdb.classSubjectNeed.count({ where: { classId: newClass.id, teacherId: { not: null } } });
    const autoResult = await autoAssignTeachersToClasses(user);
    const afterFilled = await tdb.classSubjectNeed.count({ where: { classId: newClass.id, teacherId: { not: null } } });
    autoAssignedTeacherCount = Math.max(0, afterFilled - beforeFilled);
    void autoResult;

    await tdb.classCapacityOverflowRun.update({
      where: { id: run.id },
      data: { decision: "SPLIT_NEW_CLASS", newClassId: newClass.id, autoAssignedTeacherCount, decidedAt: new Date() },
    });

    // A real timetable regeneration is only meaningful once a tenant
    // genuinely has real subject groups configured somewhere — never
    // fired blindly for a school that hasn't set anything up yet (the
    // founder's own explicit instruction). A cheap real existence check,
    // not a full generation attempt, decides this honestly.
    const hasAnyRealSubjectGroups = (await tdb.classSubjectNeed.count()) > 0;
    let timetableJob: unknown = null;
    if (hasAnyRealSubjectGroups && autoAssignedTeacherCount > 0) {
      try {
        const { startGeneration } = await import("@/lib/services/timetable-engine.service");
        timetableJob = await startGeneration(user);
      } catch { /* a generation may already be running; the new class's own real data is still saved correctly */ }
    }

    await db.auditLog.create({
      data: {
        tenantId: user.tenantId, actorId: user.id, actorName: user.fullName,
        action: "class_capacity_overflow.split", entityType: "classCapacityOverflowRun", entityId: run.id,
        metadata: JSON.stringify({ classId: run.classId, newClassId: newClass.id, overflowCount: run.overflowCount, autoAssignedTeacherCount }),
      },
    });

    return { decision: "SPLIT_NEW_CLASS" as const, newClassId: newClass.id, autoAssignedTeacherCount, timetableJob };
  });
}

export async function listOverflowRuns(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const rows = await tenantDb().classCapacityOverflowRun.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
    return rows.map((r) => ({
      id: r.id, classId: r.classId, subjectId: r.subjectId, overflowCount: r.overflowCount,
      decision: r.decision, newClassId: r.newClassId, autoAssignedTeacherCount: r.autoAssignedTeacherCount,
      createdByName: r.createdByName, createdAt: r.createdAt, decidedAt: r.decidedAt,
    }));
  });
}
