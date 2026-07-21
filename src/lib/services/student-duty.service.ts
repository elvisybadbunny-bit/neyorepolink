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
  lightDuty: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export type DutyAreaInput = z.infer<typeof dutyAreaInputSchema>;

export async function listStudentDuties(user: SessionUser, filters: { classId?: string; termId?: string } = {}) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const [areas, assignments, classes, terms, tenant, students, eligibility] = await Promise.all([
      tdb.studentDutyArea.findMany({ orderBy: { name: "asc" } }),
      tdb.studentDutyAssignment.findMany({
        where: filters.termId ? { termId: filters.termId } : {},
        include: { student: { select: { id: true, firstName: true, lastName: true, admissionNo: true, classId: true, gender: true } }, dutyArea: true },
        orderBy: { createdAt: "desc" },
      }),
      tdb.schoolClass.findMany({ where: { archived: false }, orderBy: [{ level: "asc" }, { stream: "asc" }] }),
      tdb.academicTerm.findMany({ orderBy: [{ year: "desc" }, { term: "desc" }], take: 6 }),
      db.tenant.findUnique({ where: { id: user.tenantId }, select: { studentDutiesEnabled: true, studentDutyExcludeLeaders: true } }),
      tdb.student.findMany({ where: { status: "ACTIVE", deletedAt: null }, select: { id: true, firstName: true, lastName: true, admissionNo: true, classId: true }, orderBy: { firstName: "asc" }, take: 1000 }),
      db.studentDutyEligibility.findMany({ where: { tenantId: user.tenantId }, orderBy: { updatedAt: "desc" } }),
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
      config: { enabled: tenant?.studentDutiesEnabled !== false, excludeLeaders: tenant?.studentDutyExcludeLeaders === true },
      students: students.map((s) => ({ id: s.id, name: `${s.firstName} ${s.lastName}`, admissionNo: s.admissionNo, className: s.classId ? classMap.get(s.classId) ?? "—" : "—" })),
      eligibility,
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
      lightDuty: input.lightDuty,
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

export async function saveStudentDutyConfig(user: SessionUser, input: { enabled: boolean; excludeLeaders: boolean }) {
  const row = await db.tenant.update({ where: { id: user.tenantId }, data: { studentDutiesEnabled: input.enabled, studentDutyExcludeLeaders: input.excludeLeaders }, select: { studentDutiesEnabled: true, studentDutyExcludeLeaders: true } });
  await db.auditLog.create({ data: { tenantId: user.tenantId, actorId: user.id, actorName: user.fullName, action: "students.duty_config_updated", entityType: "Tenant", entityId: user.tenantId, metadata: JSON.stringify(row) } });
  return row;
}

export async function saveStudentDutyEligibility(user: SessionUser, raw: unknown) {
  const input = z.object({ studentId: z.string().min(1), isStudentLeader: z.boolean().default(false), medicalRestriction: z.enum(["NONE", "LIGHT_ONLY", "EXEMPT"]).default("NONE"), reasonSummary: z.string().trim().max(300).optional(), medicalDocumentUrl: z.string().url().optional().or(z.literal("")), expiresAt: z.string().datetime().optional().or(z.literal("")) }).parse(raw);
  const student = await db.student.findFirst({ where: { id: input.studentId, tenantId: user.tenantId, status: "ACTIVE", deletedAt: null }, select: { id: true } });
  if (!student) throw new StudentDutyError("NOT_FOUND", "Active learner not found.");
  const row = await db.studentDutyEligibility.upsert({ where: { studentId: student.id }, create: { tenantId: user.tenantId, studentId: student.id, isStudentLeader: input.isStudentLeader, medicalRestriction: input.medicalRestriction, reasonSummary: input.reasonSummary || null, medicalDocumentUrl: input.medicalDocumentUrl || null, expiresAt: input.expiresAt ? new Date(input.expiresAt) : null, approvedById: user.id, approvedByName: user.fullName }, update: { isStudentLeader: input.isStudentLeader, medicalRestriction: input.medicalRestriction, reasonSummary: input.reasonSummary || null, medicalDocumentUrl: input.medicalDocumentUrl || null, expiresAt: input.expiresAt ? new Date(input.expiresAt) : null, approvedById: user.id, approvedByName: user.fullName, approvedAt: new Date() } });
  await db.auditLog.create({ data: { tenantId: user.tenantId, actorId: user.id, actorName: user.fullName, action: "students.duty_eligibility_approved", entityType: "StudentDutyEligibility", entityId: row.id, metadata: JSON.stringify({ studentId: row.studentId, isStudentLeader: row.isStudentLeader, medicalRestriction: row.medicalRestriction, expiresAt: row.expiresAt }) } });
  return row;
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

    const [areas, students, existing, tenant, eligibilityRows] = await Promise.all([
      tdb.studentDutyArea.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
      tdb.student.findMany({
        where: { status: "ACTIVE", deletedAt: null, ...(input.classId ? { classId: input.classId } : {}) },
        select: { id: true, firstName: true, lastName: true, classId: true, gender: true },
      }),
      tdb.studentDutyAssignment.findMany({
        where: termId ? { termId } : {},
        select: { studentId: true, dutyAreaId: true },
      }),
      db.tenant.findUnique({ where: { id: user.tenantId }, select: { studentDutiesEnabled: true, studentDutyExcludeLeaders: true } }),
      db.studentDutyEligibility.findMany({ where: { tenantId: user.tenantId } }),
    ]);

    if (tenant?.studentDutiesEnabled === false) throw new StudentDutyError("INVALID", "Student duties are disabled for this school.");
    if (areas.length === 0) throw new StudentDutyError("INVALID", "No active duty areas set up. Add duty areas (or apply EE.15 universal presets) first.");
    if (students.length === 0) throw new StudentDutyError("INVALID", "No active learners found for assignment.");

    const assignedStudents = new Set(existing.map((e) => e.studentId));
    const areaCounts = new Map<string, number>();
    for (const e of existing) {
      areaCounts.set(e.dutyAreaId, (areaCounts.get(e.dutyAreaId) || 0) + 1);
    }

    let assignedCount = 0;
    const eligibilityByStudent = new Map(eligibilityRows.map((row) => [row.studentId, row]));
    const stableScore = (value: string) => [...value].reduce((hash, char) => ((hash * 31) + char.charCodeAt(0)) >>> 0, 2166136261);
    const orderedStudents = [...students].sort((a, b) => stableScore(`${termId}:${a.id}`) - stableScore(`${termId}:${b.id}`) || a.id.localeCompare(b.id));

    for (const area of areas) {
      const targetClasses: string[] = ((): string[] => { try { return JSON.parse(area.targetClassIds || "[]"); } catch { return []; } })();
      const currentCount = areaCounts.get(area.id) || 0;
      let needed = Math.max(0, area.maxStudents - currentCount);

      if (needed <= 0) continue;

      for (const st of orderedStudents) {
        if (needed <= 0) break;
        if (assignedStudents.has(st.id)) continue;
        const eligibility = eligibilityByStudent.get(st.id);
        const restriction = eligibility?.expiresAt && eligibility.expiresAt < new Date() ? "NONE" : eligibility?.medicalRestriction ?? "NONE";
        if (tenant?.studentDutyExcludeLeaders && eligibility?.isStudentLeader) continue;
        if (restriction === "EXEMPT") continue;
        if (restriction === "LIGHT_ONLY" && !area.lightDuty) continue;
        if (restriction === "NONE" && area.lightDuty) continue;
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
