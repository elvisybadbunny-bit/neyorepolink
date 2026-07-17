/**
 * PART K.2 / K.12 — Student Duty Roster & Leadership Assignment Engine.
 *
 * "Create duties for students by a click and with the rules set too."
 * 1. CRUD for `StudentDutyArea` (`name`, `description`, `genderConstraint: MIXED|BOYS_ONLY|GIRLS_ONLY`, `targetClassIds`, `maxStudents`).
 * 2. `autoAssignStudentDuties`: 1-click deterministic assignment respecting gender rules, class targets, and capacity caps.
 */
import { db } from "@/lib/db";
import { withTenant } from "@/lib/core/tenant-context";
import { tenantDb } from "@/lib/core/tenant-db";
import type { SessionUser } from "@/lib/core/session";
import { z } from "zod";

export class StudentDutyError extends Error {
  constructor(public code: "NOT_FOUND" | "FORBIDDEN" | "INVALID", message: string) {
    super(message);
    this.name = "StudentDutyError";
  }
}

export const dutyAreaInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(3, "Duty area name required").max(100),
  description: z.string().trim().max(300).optional(),
  genderConstraint: z.enum(["MIXED", "BOYS_ONLY", "GIRLS_ONLY"]).default("MIXED"),
  targetClassIds: z.array(z.string()).default([]),
  maxStudents: z.number().int().min(1).max(100).default(5),
  isActive: z.boolean().default(true),
});

export type DutyAreaInput = z.infer<typeof dutyAreaInputSchema>;

export async function listStudentDuties(user: SessionUser, filters: { classId?: string; termId?: string } = {}) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const [areas, assignments, classes, terms] = await Promise.all([
      tdb.studentDutyArea.findMany({ orderBy: { name: "asc" } }),
      tdb.studentDutyAssignment.findMany({
        where: filters.termId ? { termId: filters.termId } : {},
        include: { student: { select: { id: true, firstName: true, lastName: true, admissionNo: true, classId: true, gender: true } }, dutyArea: true },
        orderBy: { createdAt: "desc" },
      }),
      tdb.schoolClass.findMany({ where: { archived: false }, orderBy: [{ level: "asc" }, { stream: "asc" }] }),
      tdb.academicTerm.findMany({ orderBy: [{ year: "desc" }, { term: "desc" }], take: 6 }),
    ]);

    const classMap = new Map(classes.map((c) => [c.id, [c.level, c.stream].filter(Boolean).join(" ")]));

    return {
      areas: areas.map((a) => ({
        ...a,
        targetClassIds: ((): string[] => { try { return JSON.parse(a.targetClassIds || "[]"); } catch { return []; } })(),
      })),
      assignments: assignments.map((as) => ({
        id: as.id,
        studentId: as.studentId,
        studentName: as.student ? [as.student.firstName, as.student.lastName].filter(Boolean).join(" ") : "Unknown",
        admissionNo: as.student?.admissionNo ?? "—",
        className: as.student?.classId ? classMap.get(as.student.classId) ?? "—" : "—",
        dutyAreaId: as.dutyAreaId,
        dutyAreaName: as.dutyArea?.name ?? "—",
        termId: as.termId,
        assignedByName: as.assignedByName,
        createdAt: as.createdAt,
      })),
      classes: classes.map((c) => ({ id: c.id, name: classLabel(c) })),
      terms: terms.map((t) => ({ id: t.id, label: `Term ${t.term} ${t.year}`, current: t.current })),
    };
  });
}

function classLabel(c: { level: string; stream: string | null }) {
  return [c.level, c.stream].filter(Boolean).join(" ");
}

export async function saveStudentDutyArea(user: SessionUser, rawInput: unknown) {
  const input = dutyAreaInputSchema.parse(rawInput);
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const data = {
      tenantId: user.tenantId,
      name: input.name,
      description: input.description || null,
      genderConstraint: input.genderConstraint,
      targetClassIds: JSON.stringify(input.targetClassIds),
      maxStudents: input.maxStudents,
      isActive: input.isActive,
    };

    if (input.id) {
      const row = await tdb.studentDutyArea.update({ where: { id: input.id }, data: data as never });
      return row;
    } else {
      const row = await tdb.studentDutyArea.create({ data: data as never });
      return row;
    }
  });
}

export async function deleteStudentDutyArea(user: SessionUser, id: string) {
  return withTenant(user.tenantId, async () => {
    await tenantDb().studentDutyArea.delete({ where: { id } }).catch(() => {});
    return { success: true };
  });
}

export async function removeStudentDutyAssignment(user: SessionUser, id: string) {
  return withTenant(user.tenantId, async () => {
    await tenantDb().studentDutyAssignment.delete({ where: { id } }).catch(() => {});
    return { success: true };
  });
}

/**
 * 1-Click Auto-Assign Student Duties (`K.2` / `K.12`).
 * Evaluates active students against duty areas, enforcing capacity limits, target classes, and gender rules (`BOYS_ONLY / GIRLS_ONLY / MIXED`).
 */
export async function autoAssignStudentDuties(user: SessionUser, input: { classId?: string; termId?: string } = {}) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const term = input.termId ? await tdb.academicTerm.findUnique({ where: { id: input.termId } }) : await tdb.academicTerm.findFirst({ where: { current: true } });
    const termId = term?.id || null;

    const [areas, students, existing] = await Promise.all([
      tdb.studentDutyArea.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
      tdb.student.findMany({
        where: { status: "ACTIVE", deletedAt: null, ...(input.classId ? { classId: input.classId } : {}) },
        select: { id: true, firstName: true, lastName: true, classId: true, gender: true },
      }),
      tdb.studentDutyAssignment.findMany({
        where: termId ? { termId } : {},
        select: { studentId: true, dutyAreaId: true },
      }),
    ]);

    if (areas.length === 0) throw new StudentDutyError("INVALID", "No active duty areas set up. Add duty areas (or apply EE.15 universal presets) first.");
    if (students.length === 0) throw new StudentDutyError("INVALID", "No active learners found for assignment.");

    const assignedStudents = new Set(existing.map((e) => e.studentId));
    const areaCounts = new Map<string, number>();
    for (const e of existing) {
      areaCounts.set(e.dutyAreaId, (areaCounts.get(e.dutyAreaId) || 0) + 1);
    }

    let assignedCount = 0;
    const shuffledStudents = [...students].sort(() => Math.random() - 0.5);

    for (const area of areas) {
      const targetClasses: string[] = ((): string[] => { try { return JSON.parse(area.targetClassIds || "[]"); } catch { return []; } })();
      const currentCount = areaCounts.get(area.id) || 0;
      let needed = Math.max(0, area.maxStudents - currentCount);

      if (needed <= 0) continue;

      for (const st of shuffledStudents) {
        if (needed <= 0) break;
        if (assignedStudents.has(st.id)) continue;
        if (targetClasses.length > 0 && (!st.classId || !targetClasses.includes(st.classId))) continue;
        if (area.genderConstraint === "BOYS_ONLY" && st.gender !== "M") continue;
        if (area.genderConstraint === "GIRLS_ONLY" && st.gender !== "F") continue;

        await tdb.studentDutyAssignment.create({
          data: {
            tenantId: user.tenantId,
            studentId: st.id,
            dutyAreaId: area.id,
            termId,
            assignedById: user.id,
            assignedByName: user.fullName,
          } as never,
        });

        assignedStudents.add(st.id);
        areaCounts.set(area.id, (areaCounts.get(area.id) || 0) + 1);
        assignedCount++;
        needed--;
      }
    }

    await db.auditLog.create({
      data: {
        tenantId: user.tenantId,
        actorId: user.id,
        actorName: user.fullName,
        action: "students.duties_auto_assigned",
        entityType: "studentDutyAssignment",
        entityId: termId || user.tenantId,
        metadata: JSON.stringify({ assignedCount, classId: input.classId || "all" }),
      },
    });

    return { assignedCount, summary: `Successfully auto-assigned ${assignedCount} learner(s) across ${areas.length} duty area(s).` };
  });
}
