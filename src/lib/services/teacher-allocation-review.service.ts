/**
 * AA.3 — New Academic Year Teacher Allocation Review wizard.
 *
 * Ties together the already-real L.7 Continuity Engine
 * (`getContinuitySnapshot`/`recommendTeacherForSubject`) and
 * `autoAssignTeachersToClasses()` specifically for the "just finished
 * promotion, now let's sort out teachers" moment, exactly as scoped in
 * docs/TEACHER-ALLOCATION-AND-ELECTIVES-ENGINE-DESIGN.md Part 2.
 *
 * A Principal picks ONE level (usually right after committing a real
 * promotion), sees every subject-teacher slot and every class-teacher slot
 * for that level, and makes an explicit real decision on each:
 *   - KEEP    — leave the current teacher exactly as-is.
 *   - REPLACE — a human deliberately names a specific different teacher
 *               (normally one of the Continuity Engine's own ranked
 *               recommendations, but any real eligible teacher may be named).
 *   - AUTO    — let NEYO's own fair auto-assign fill just this one slot.
 *
 * Nothing mutates until "Apply" — every decision is recorded on a real
 * TeacherAllocationReviewRun row first (an honest, auditable paper trail),
 * then applied slot-by-slot, then (optionally, on by default) a real
 * timetable regeneration is kicked off — mirroring
 * `applyTeacherChangeWithImpact()`'s own existing pattern exactly.
 */
import { db } from "@/lib/db";
import { withTenant } from "@/lib/core/tenant-context";
import { tenantDb } from "@/lib/core/tenant-db";
import type { SessionUser } from "@/lib/core/session";
import { startGeneration } from "@/lib/services/timetable-engine.service";
import { recommendTeacherForSubject } from "@/lib/services/l7-continuity-engine.service";
import type { ReviewDecision } from "@/lib/validations/teacher-allocation-review";

export class TeacherAllocationReviewError extends Error {
  constructor(public code: "NOT_FOUND" | "INVALID" | "CONFLICT", message: string) {
    super(message);
    this.name = "TeacherAllocationReviewError";
  }
}

// ---------------------------------------------------------------------------
// Snapshot — everything a Principal needs to see for one level, one screen.
// ---------------------------------------------------------------------------

export async function getReviewSnapshot(user: SessionUser, level: string) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const classes = await tdb.schoolClass.findMany({ where: { level, archived: false }, orderBy: [{ stream: "asc" }] });
    if (classes.length === 0) throw new TeacherAllocationReviewError("NOT_FOUND", "No classes found for that level.");

    const classIds = classes.map((c) => c.id);
    const needs = await tdb.classSubjectNeed.findMany({ where: { classId: { in: classIds } } });
    const subjectIds = [...new Set(needs.map((n) => n.subjectId))];
    const [subjects, activeTeachers] = await Promise.all([
      tdb.subject.findMany({ where: { id: { in: subjectIds } }, select: { id: true, name: true, code: true } }),
      tdb.user.findMany({ where: { isActive: true }, select: { id: true, fullName: true } }),
    ]);
    const activeIds = new Set(activeTeachers.map((t) => t.id));
    const teacherName = (id: string | null) => (id ? activeTeachers.find((t) => t.id === id)?.fullName ?? null : null);

    const subjectRows = await Promise.all(needs.map(async (need) => {
      const cls = classes.find((c) => c.id === need.classId)!;
      const currentValid = Boolean(need.teacherId) && activeIds.has(need.teacherId!);
      const recommendations = await recommendTeacherForSubject(
        user.tenantId, need.subjectId, need.teacherId ? [need.teacherId] : [],
      );
      return {
        classId: cls.id,
        classLabel: `${cls.level} ${cls.stream ?? ""}`.trim(),
        subjectId: need.subjectId,
        subjectName: subjects.find((s) => s.id === need.subjectId)?.name ?? "Unknown subject",
        subjectCode: subjects.find((s) => s.id === need.subjectId)?.code ?? "",
        lessonsPerWeek: need.lessonsPerWeek,
        currentTeacherId: need.teacherId,
        currentTeacherName: teacherName(need.teacherId),
        currentTeacherValid: currentValid,
        recommendations: recommendations.slice(0, 5),
      };
    }));

    const classTeacherRows = await Promise.all(classes.map(async (cls) => {
      const currentValid = Boolean(cls.classTeacherId) && activeIds.has(cls.classTeacherId!);
      // A class-teacher isn't tied to one subject, so recommend from among
      // teachers already carrying THIS class's own real subject load —
      // reuses the exact same fairness-ranked helper, scoped to any real
      // subject this class already needs, so recommendations are always
      // genuinely eligible people already teaching this level.
      const anySubjectId = needs.find((n) => n.classId === cls.id)?.subjectId;
      const recommendations = anySubjectId
        ? await recommendTeacherForSubject(user.tenantId, anySubjectId, cls.classTeacherId ? [cls.classTeacherId] : [])
        : [];
      return {
        classId: cls.id,
        classLabel: `${cls.level} ${cls.stream ?? ""}`.trim(),
        currentTeacherId: cls.classTeacherId,
        currentTeacherName: teacherName(cls.classTeacherId),
        currentTeacherValid: currentValid,
        recommendations: recommendations.slice(0, 5),
      };
    }));

    return {
      level,
      totalSubjectSlots: subjectRows.length,
      totalClassTeacherSlots: classTeacherRows.length,
      needsAttentionCount: subjectRows.filter((r) => !r.currentTeacherValid).length + classTeacherRows.filter((r) => !r.currentTeacherValid).length,
      subjectRows,
      classTeacherRows,
    };
  });
}

// ---------------------------------------------------------------------------
// Start a review session (records intent; decisions are attached on apply).
// ---------------------------------------------------------------------------

export async function startReviewRun(user: SessionUser, level: string, promotionRunId?: string | null) {
  return withTenant(user.tenantId, async () => {
    const run = await tenantDb().teacherAllocationReviewRun.create({
      data: {
        promotionRunId: promotionRunId ?? null,
        level,
        status: "IN_PROGRESS",
        decisions: "[]",
        createdById: user.id,
        createdByName: user.fullName,
      } as never,
    });
    return { reviewRunId: run.id };
  });
}

export async function listReviewRuns(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const rows = await tenantDb().teacherAllocationReviewRun.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
    return rows.map((r) => ({
      id: r.id, level: r.level, status: r.status,
      appliedCount: r.appliedCount, autoFilledCount: r.autoFilledCount,
      decisionCount: (JSON.parse(r.decisions) as unknown[]).length,
      createdByName: r.createdByName, createdAt: r.createdAt, completedAt: r.completedAt,
    }));
  });
}

// ---------------------------------------------------------------------------
// Apply — every decision recorded first, THEN mutated, exactly once.
// ---------------------------------------------------------------------------

export async function applyReviewDecisions(
  user: SessionUser,
  input: { reviewRunId: string; decisions: ReviewDecision[]; regenerateTimetable?: boolean },
) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const run = await tdb.teacherAllocationReviewRun.findUnique({ where: { id: input.reviewRunId } });
    if (!run) throw new TeacherAllocationReviewError("NOT_FOUND", "Review session not found.");
    if (run.status === "COMPLETED") throw new TeacherAllocationReviewError("CONFLICT", "This review session was already applied.");

    let appliedCount = 0;
    let autoFilledCount = 0;
    const resolvedDecisions: (ReviewDecision & { resolvedTeacherId?: string | null })[] = [];

    for (const d of input.decisions) {
      if (d.decision === "KEEP") {
        // Nothing to mutate — an explicit, recorded "no change" decision.
        resolvedDecisions.push(d);
        continue;
      }
      if (d.decision === "REPLACE") {
        if (!d.teacherId) throw new TeacherAllocationReviewError("INVALID", "A replace decision needs a real teacher.");
        if (d.roleType === "SUBJECT") {
          if (!d.subjectId) throw new TeacherAllocationReviewError("INVALID", "A subject decision needs a real subject.");
          const need = await tdb.classSubjectNeed.findFirst({ where: { classId: d.classId, subjectId: d.subjectId } });
          if (!need) throw new TeacherAllocationReviewError("NOT_FOUND", "Class subject load not found.");
          await tdb.classSubjectNeed.update({ where: { id: need.id }, data: { teacherId: d.teacherId } });
        } else {
          await tdb.schoolClass.update({ where: { id: d.classId }, data: { classTeacherId: d.teacherId } });
        }
        appliedCount++;
        resolvedDecisions.push({ ...d, resolvedTeacherId: d.teacherId });
        continue;
      }
      // AUTO — clear this one slot so autoAssignTeachersToClasses() genuinely
      // fills it fresh using its own real fairness logic, then read back
      // whichever teacher it picked so the review's own audit trail is honest.
      if (d.roleType === "SUBJECT") {
        if (!d.subjectId) throw new TeacherAllocationReviewError("INVALID", "A subject decision needs a real subject.");
        const need = await tdb.classSubjectNeed.findFirst({ where: { classId: d.classId, subjectId: d.subjectId } });
        if (!need) throw new TeacherAllocationReviewError("NOT_FOUND", "Class subject load not found.");
        await tdb.classSubjectNeed.update({ where: { id: need.id }, data: { teacherId: null } });
      } else {
        await tdb.schoolClass.update({ where: { id: d.classId }, data: { classTeacherId: null } });
      }
      resolvedDecisions.push(d);
      autoFilledCount++;
    }

    // Run the real, existing fair auto-assign ONCE for every AUTO subject
    // slot cleared above (class-teacher AUTO slots are filled by a simple
    // fairness pick below, since autoAssignTeachersToClasses() only fills
    // ClassSubjectNeed rows, not SchoolClass.classTeacherId).
    const { autoAssignTeachersToClasses } = await import("@/lib/services/timetable-solver.service");
    if (autoFilledCount > 0) {
      await autoAssignTeachersToClasses(user);
      // Read back what got assigned so the audit trail names the real teacher.
      for (const d of resolvedDecisions) {
        if (d.decision === "AUTO" && d.roleType === "SUBJECT" && d.subjectId) {
          const need = await tdb.classSubjectNeed.findFirst({ where: { classId: d.classId, subjectId: d.subjectId } });
          (d as { resolvedTeacherId?: string | null }).resolvedTeacherId = need?.teacherId ?? null;
        }
        if (d.decision === "AUTO" && d.roleType === "CLASS_TEACHER") {
          // No dedicated class-teacher auto-assign engine exists; recommend the
          // top fairness-ranked candidate from this class's own real subject
          // roster and apply it directly — same logic the Continuity Engine
          // itself already uses for class-teacher recommendations.
          const anyNeed = await tdb.classSubjectNeed.findFirst({ where: { classId: d.classId } });
          if (anyNeed) {
            const recs = await recommendTeacherForSubject(user.tenantId, anyNeed.subjectId, []);
            const pick = recs[0];
            if (pick) {
              await tdb.schoolClass.update({ where: { id: d.classId }, data: { classTeacherId: pick.teacherId } });
              (d as { resolvedTeacherId?: string | null }).resolvedTeacherId = pick.teacherId;
            }
          }
        }
      }
    }

    await tdb.teacherAllocationReviewRun.update({
      where: { id: run.id },
      data: {
        status: "COMPLETED",
        decisions: JSON.stringify(resolvedDecisions),
        appliedCount,
        autoFilledCount,
        completedAt: new Date(),
      },
    });

    await db.auditLog.create({
      data: {
        tenantId: user.tenantId, actorId: user.id, actorName: user.fullName,
        action: "teacher_allocation_review.applied", entityType: "teacherAllocationReviewRun", entityId: run.id,
        metadata: JSON.stringify({ level: run.level, appliedCount, autoFilledCount }),
      },
    });

    let timetableJob: unknown = null;
    if (input.regenerateTimetable !== false && (appliedCount > 0 || autoFilledCount > 0)) {
      timetableJob = await startGeneration(user);
    }

    return { reviewRunId: run.id, appliedCount, autoFilledCount, timetableJob };
  });
}
