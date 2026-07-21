/**
 * B.4 Academics — service.
 * Subjects, departments, the 3-term Kenyan academic calendar, the timetable
 * (manual slots with REAL conflict detection + a greedy auto-fill), and
 * teacher lesson plans (own-only for teachers).
 */
import { db } from "@/lib/db";
import { withTenant } from "@/lib/core/tenant-context";
import { tenantDb } from "@/lib/core/tenant-db";
import { can } from "@/lib/core/permissions";
import type { SessionUser } from "@/lib/core/session";
import type { Role } from "@/lib/core/roles";

function safeParse<T>(value: string | null | undefined, fallback: T): T { try { return value ? JSON.parse(value) as T : fallback; } catch { return fallback; } }

export class AcademicsError extends Error {
  constructor(public code: "NOT_FOUND" | "DUPLICATE" | "CONFLICT" | "FORBIDDEN" | "INVALID", message: string) {
    super(message);
    this.name = "AcademicsError";
  }
}

async function audit(user: SessionUser, action: string, entityType: string, entityId: string, metadata?: unknown) {
  await db.auditLog.create({
    data: {
      tenantId: user.tenantId, actorId: user.id, actorName: user.fullName,
      action, entityType, entityId,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
}


const PRINCIPAL_OWNER_ROLES: Role[] = ["PRINCIPAL", "SCHOOL_OWNER", "SUPER_ADMIN"];
const BROAD_ACADEMICS_ROLES: Role[] = ["PRINCIPAL", "SCHOOL_OWNER", "SUPER_ADMIN", "DEPUTY_PRINCIPAL", "DEAN_OF_STUDIES"];

function hasAnyRole(user: SessionUser, roles: Role[]) {
  return roles.includes(user.role as Role) || (user.secondaryRole ? roles.includes(user.secondaryRole as Role) : false);
}

function isScopedHod(user: SessionUser) {
  return !hasAnyRole(user, BROAD_ACADEMICS_ROLES) && (user.role === "HOD" || user.secondaryRole === "HOD");
}

function assertPrincipalOwner(user: SessionUser, action: string) {
  if (!hasAnyRole(user, PRINCIPAL_OWNER_ROLES)) {
    throw new AcademicsError("FORBIDDEN", `${action} is reserved for the Principal or School Owner.`);
  }
}

async function hodDepartmentIds(user: SessionUser) {
  if (!isScopedHod(user)) return null;
  const rows = await tenantDb().department.findMany({ where: { hodId: user.id }, select: { id: true } });
  return rows.map((d) => d.id);
}

async function assertHodDepartmentAccess(user: SessionUser, departmentId: string) {
  const ids = await hodDepartmentIds(user);
  if (!ids) return;
  if (!ids.includes(departmentId)) {
    throw new AcademicsError("FORBIDDEN", "As HOD, you can only manage your own department.");
  }
}

async function assertHodSubjectAccess(user: SessionUser, subjectId: string, targetDepartmentId?: string | null) {
  const ids = await hodDepartmentIds(user);
  if (!ids) return;
  const subject = await tenantDb().subject.findUnique({ where: { id: subjectId }, select: { id: true, departmentId: true, name: true } });
  if (!subject) throw new AcademicsError("NOT_FOUND", "Subject not found.");
  const currentOk = !subject.departmentId || ids.includes(subject.departmentId);
  const targetOk = targetDepartmentId === undefined || !targetDepartmentId || ids.includes(targetDepartmentId);
  if (!currentOk || !targetOk) {
    throw new AcademicsError("FORBIDDEN", "As HOD, you can only manage subjects inside your own department.");
  }
}

async function assertHodCanMapSubjects(user: SessionUser, departmentId: string, subjectIds?: string[]) {
  const ids = await hodDepartmentIds(user);
  if (!ids) return;
  await assertHodDepartmentAccess(user, departmentId);
  if (!subjectIds?.length) return;
  const subjects = await tenantDb().subject.findMany({ where: { id: { in: subjectIds } }, select: { id: true, name: true, departmentId: true } });
  const blocked = subjects.find((s) => s.departmentId && s.departmentId !== departmentId);
  if (blocked) {
    throw new AcademicsError("FORBIDDEN", `${blocked.name} belongs to another department. HODs cannot move subjects across departments.`);
  }
}

// ---------------------------------------------------------------------------
// Departments
// ---------------------------------------------------------------------------

export async function listDepartments(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const hodIds = await hodDepartmentIds(user);
    const rows = await tenantDb().department.findMany({ where: hodIds ? { id: { in: hodIds.length ? hodIds : ["__none__"] } } : {}, orderBy: { name: "asc" }, include: { subjects: { where: { archived: false } } } });
    const departmentHeadIds = rows.map((d) => d.hodId).filter((x): x is string => Boolean(x));
    const hods = departmentHeadIds.length ? await tenantDb().user.findMany({ where: { id: { in: departmentHeadIds } }, select: { id: true, fullName: true } }) : [];
    const hodMap = new Map(hods.map((h) => [h.id, h.fullName]));
    return rows.map((d) => ({ id: d.id, name: d.name, hodId: d.hodId, hodName: d.hodId ? hodMap.get(d.hodId) ?? null : null, subjectCount: d.subjects.length }));
  });
}

export async function createDepartment(user: SessionUser, input: { name: string; hodId?: string; subjectIds?: string[] }) {
  return withTenant(user.tenantId, async () => {
    if (isScopedHod(user)) throw new AcademicsError("FORBIDDEN", "HODs manage their assigned department only; they cannot create new departments.");
    if (input.hodId) assertPrincipalOwner(user, "Appointing a Department Head");
    const dup = await tenantDb().department.findFirst({ where: { name: input.name } });
    if (dup) throw new AcademicsError("DUPLICATE", `Department "${input.name}" already exists.`);
    const d = await tenantDb().department.create({ data: { name: input.name, hodId: input.hodId || null } as never });
    if (input.subjectIds && input.subjectIds.length > 0) {
      await tenantDb().subject.updateMany({
        where: { id: { in: input.subjectIds } },
        data: { departmentId: d.id }
      });
    }
    await audit(user, "academics.department_created", "department", d.id, { name: input.name });
    return d;
  });
}

export async function updateDepartment(user: SessionUser, id: string, input: { name?: string; hodId?: string; subjectIds?: string[] }) {
  return withTenant(user.tenantId, async () => {
    const d = await tenantDb().department.findUnique({ where: { id } });
    if (!d) throw new AcademicsError("NOT_FOUND", "Department not found.");
    await assertHodDepartmentAccess(user, id);
    await assertHodCanMapSubjects(user, id, input.subjectIds);
    if (input.hodId !== undefined && input.hodId !== (d.hodId ?? "")) assertPrincipalOwner(user, "Appointing or changing a Department Head");
    const updated = await tenantDb().department.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.hodId !== undefined ? { hodId: input.hodId || null } : {}),
      },
    });
    if (input.subjectIds !== undefined) {
      await tenantDb().subject.updateMany({
        where: { departmentId: id },
        data: { departmentId: null }
      });
      await tenantDb().subject.updateMany({
        where: { id: { in: input.subjectIds } },
        data: { departmentId: id }
      });
    }
    await audit(user, "academics.department_updated", "department", id);
    return updated;
  });
}

// ---------------------------------------------------------------------------
// Subjects
// ---------------------------------------------------------------------------

export async function listSubjects(user: SessionUser, includeArchived = false) {
  return withTenant(user.tenantId, async () => {
    const hodIds = await hodDepartmentIds(user);
    const baseWhere = includeArchived ? {} : { archived: false };
    const rows = await tenantDb().subject.findMany({
      where: hodIds ? { AND: [baseWhere, { departmentId: { in: hodIds.length ? hodIds : ["__none__"] } }] } : baseWhere,
      orderBy: { name: "asc" },
      include: { department: true },
    });
    return rows.map((s) => ({
      id: s.id, name: s.name, code: s.code, curriculum: s.curriculum,
      departmentId: s.departmentId, departmentName: s.department?.name ?? null,
      archived: s.archived,
    }));
  });
}

export async function createSubject(user: SessionUser, input: { name: string; code: string; curriculum: string; departmentId?: string }) {
  return withTenant(user.tenantId, async () => {
    if (isScopedHod(user)) {
      if (!input.departmentId) throw new AcademicsError("FORBIDDEN", "As HOD, choose your own department before adding a subject.");
      await assertHodDepartmentAccess(user, input.departmentId);
    }
    const dup = await tenantDb().subject.findFirst({ where: { code: input.code } });
    if (dup) throw new AcademicsError("DUPLICATE", `Subject code "${input.code}" is already used by ${dup.name}.`);
    const s = await tenantDb().subject.create({
      data: { name: input.name, code: input.code, curriculum: input.curriculum, departmentId: input.departmentId || null } as never,
    });
    await audit(user, "academics.subject_created", "subject", s.id, { name: input.name, code: input.code });
    return s;
  });
}

export async function updateSubject(user: SessionUser, id: string, input: Partial<{ name: string; code: string; curriculum: string; departmentId: string; archived: boolean }>) {
  return withTenant(user.tenantId, async () => {
    const s = await tenantDb().subject.findUnique({ where: { id } });
    if (!s) throw new AcademicsError("NOT_FOUND", "Subject not found.");
    await assertHodSubjectAccess(user, id, input.departmentId);
    if (input.code && input.code !== s.code) {
      const dup = await tenantDb().subject.findFirst({ where: { code: input.code } });
      if (dup) throw new AcademicsError("DUPLICATE", `Subject code "${input.code}" is already used.`);
    }
    const updated = await tenantDb().subject.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.code !== undefined ? { code: input.code } : {}),
        ...(input.curriculum !== undefined ? { curriculum: input.curriculum } : {}),
        ...(input.departmentId !== undefined ? { departmentId: input.departmentId || null } : {}),
        ...(input.archived !== undefined ? { archived: input.archived } : {}),
      },
    });
    await audit(user, "academics.subject_updated", "subject", id);
    return updated;
  });
}

/** Quick-add the real KE subject set for a curriculum (skips existing codes). */
export async function addSubjectPreset(user: SessionUser, curriculum: "CBC" | "8-4-4", preset: { name: string; code: string }[]) {
  return withTenant(user.tenantId, async () => {
    if (isScopedHod(user)) throw new AcademicsError("FORBIDDEN", "HODs add or edit subjects inside their own department; school-wide presets are reserved for academics leadership.");
    const existing = new Set((await tenantDb().subject.findMany({ select: { code: true } })).map((s) => s.code));
    let added = 0;
    for (const p of preset) {
      if (existing.has(p.code)) continue;
      await tenantDb().subject.create({ data: { name: p.name, code: p.code, curriculum } as never });
      added++;
    }
    await audit(user, "academics.preset_added", "subject", curriculum, { added });
    return { added, skipped: preset.length - added };
  });
}

// ---------------------------------------------------------------------------
// Academic terms (Kenyan 3-term year)
// ---------------------------------------------------------------------------

export async function listTerms(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    return tenantDb().academicTerm.findMany({ orderBy: [{ year: "desc" }, { term: "asc" }] });
  });
}

export async function upsertTerm(user: SessionUser, input: { year: number; term: number; startDate: string; endDate: string; current: boolean }) {
  return withTenant(user.tenantId, async () => {
    const allowed = ["PRINCIPAL", "SCHOOL_OWNER", "SUPER_ADMIN"];
    const hasPrimary = allowed.includes(user.role);
    const hasSecondary = user.secondaryRole ? allowed.includes(user.secondaryRole) : false;
    if (!hasPrimary && !hasSecondary) {
      throw new AcademicsError("FORBIDDEN", "Only the Principal or School Owner can edit or change academic term dates.");
    }

    if (input.current) {
      await tenantDb().academicTerm.updateMany({ where: {}, data: { current: false } });
    }
    const row = await db.academicTerm.upsert({
      where: { tenantId_year_term: { tenantId: user.tenantId, year: input.year, term: input.term } },
      create: { tenantId: user.tenantId, year: input.year, term: input.term, startDate: input.startDate, endDate: input.endDate, current: input.current },
      update: { startDate: input.startDate, endDate: input.endDate, current: input.current },
    });
    await audit(user, "academics.term_saved", "academicTerm", row.id, { year: input.year, term: input.term, current: input.current });
    return row;
  });
}

export async function currentTerm(tenantId: string) {
  return db.academicTerm.findFirst({ where: { tenantId, current: true } });
}

// ---------------------------------------------------------------------------
// Timetable
// ---------------------------------------------------------------------------

export const DAYS = [1, 2, 3, 4, 5] as const;

export async function getTimetable(user: SessionUser, classId: string) {
  return withTenant(user.tenantId, async () => {
    const [slots, config] = await Promise.all([
      tenantDb().timetableSlot.findMany({
        where: { classId },
        include: { subject: true },
      }),
      tenantDb().timetableConfig.findFirst({
        where: { classId },
      }),
    ]);

    // AA.1 — real Elective/Options Block breakdown for any ELECTIVE_BLOCK
    // slot this class has: the founder's own "HG/TY/EF/TS/GW" printed
    // multi-teacher-code request. A single class-level cell genuinely has
    // NO one subject/teacher during an Options Block period (different
    // real students attend different parallel lessons), so the real
    // per-subject/teacher/venue list is resolved here and handed to the
    // renderer to display together in that one cell.
    const blockSlotIds = [...new Set(slots.map((s) => (s as any).electiveBlockSlotId).filter((x): x is string => Boolean(x)))];
    const blockBreakdownBySlotId = new Map<string, { label: string; isDouble: boolean; subjects: { subjectName: string; subjectCode: string | null; teacherShortCode: string | null; venue: string | null; teachingGroupLabel?: string | null; studentCount?: number }[] }>();
    if (blockSlotIds.length > 0) {
      const blockSlots = await tenantDb().electiveBlockSlot.findMany({
        where: { id: { in: blockSlotIds } },
        include: { subjects: true },
      });
      const allTeacherIds = [...new Set(blockSlots.flatMap((bs: any) => bs.subjects.map((s: any) => s.teacherId).filter(Boolean)))] as string[];
      // BB.1 — a shown venue is either the school's own explicit pin
      // (`venueId`) OR, when unset, the solver's own real auto-pick from
      // the pool for a genuine overflow subject (`resolvedVenueId`) —
      // both real venue references need resolving to a real name/code.
      const allVenueIds = [...new Set(blockSlots.flatMap((bs: any) => bs.subjects.flatMap((s: any) => [s.venueId, s.resolvedVenueId]).filter(Boolean)))] as string[];
      const allSubjectIds = [...new Set(blockSlots.flatMap((bs: any) => bs.subjects.map((s: any) => s.subjectId)))] as string[];
      const [blockTeachers, blockVenues, blockSubjects] = await Promise.all([
        allTeacherIds.length ? tenantDb().user.findMany({ where: { id: { in: allTeacherIds } }, select: { id: true, fullName: true, timetableShortCode: true } }) : Promise.resolve([]),
        allVenueIds.length ? tenantDb().venue.findMany({ where: { id: { in: allVenueIds } } }) : Promise.resolve([]),
        allSubjectIds.length ? tenantDb().subject.findMany({ where: { id: { in: allSubjectIds } } }) : Promise.resolve([]),
      ]);
      const teacherCodeMap = new Map(blockTeachers.map((t) => [t.id, t.timetableShortCode || t.fullName.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 3)]));
      const venueMap = new Map(blockVenues.map((v) => [v.id, v.shortCode || v.name]));
      const subjectMap = new Map(blockSubjects.map((s) => [s.id, s]));
      for (const bs of blockSlots as any[]) {
        blockBreakdownBySlotId.set(bs.id, {
          label: bs.label,
          isDouble: bs.isDouble,
          subjects: bs.subjects.map((s: any) => ({
            subjectName: subjectMap.get(s.subjectId)?.name ?? "?",
            subjectCode: subjectMap.get(s.subjectId)?.code ?? null,
            teacherShortCode: s.teacherId ? teacherCodeMap.get(s.teacherId) ?? null : null,
            // BB.1 — an explicit school pin always wins; otherwise show the
            // solver's own real auto-picked overflow venue, if any.
            venue: (s.venueId ? venueMap.get(s.venueId) : null) ?? (s.resolvedVenueId ? venueMap.get(s.resolvedVenueId) : null) ?? null,
            teachingGroupLabel: s.teachingGroupLabel ?? null,
            studentCount: safeParse<string[]>(s.studentIdsJson, []).length,
          })),
        });
      }
    }
    const teacherIds = [...new Set(slots.map((s) => s.teacherId).filter((x): x is string => Boolean(x)))];
    const teachers = teacherIds.length
      ? await tenantDb().user.findMany({ where: { id: { in: teacherIds } }, select: { id: true, fullName: true, timetableShortCode: true } })
      : [];
    const tMap = new Map(teachers.map((t) => [t.id, t.fullName]));
    // Z.3 — real teacher print short-code, resolved/auto-generated on demand
    // so the printed grid can show a real short abbreviation (e.g. "MO")
    // instead of a full name.
    const shortCodeMap = new Map<string, string>();
    const teachersNeedingCode = teachers.filter((t) => !t.timetableShortCode);
    for (const t of teachers) if (t.timetableShortCode) shortCodeMap.set(t.id, t.timetableShortCode);
    if (teachersNeedingCode.length > 0) {
      const { resolveTeacherShortCode } = await import("@/lib/services/venue.service");
      for (const t of teachersNeedingCode) {
        try {
          shortCodeMap.set(t.id, await resolveTeacherShortCode(user.tenantId, t.id, t.fullName));
        } catch {
          /* best-effort */
        }
      }
    }
    // T.12 — real, cheap map of today's real confirmed substitute coverage.
    const { todaysConfirmedSubstitutesMap } = await import("@/lib/services/substitute.service");
    const substituteMap = await todaysConfirmedSubstitutesMap(user.tenantId);
    return {
      slots: slots.map((s) => {
        const sub = substituteMap.get(s.id);
        const blockId = (s as any).electiveBlockSlotId as string | null;
        return {
          id: s.id, dayOfWeek: s.dayOfWeek, period: s.period,
          subjectId: s.subjectId, subjectName: s.subject?.name ?? null, subjectCode: s.subject?.code ?? null,
          teacherId: s.teacherId, teacherName: s.teacherId ? tMap.get(s.teacherId) ?? null : null,
          teacherShortCode: s.teacherId ? shortCodeMap.get(s.teacherId) ?? null : null,
          venue: (s as any).venue ?? null,
          slotType: s.slotType,
          weekRotation: s.weekRotation,
          // T.12 — real, honest "who's actually teaching this TODAY" overlay.
          substituteTodayName: sub?.teacherName ?? null,
          // AA.1 — real Options Block breakdown for ELECTIVE_BLOCK slots
          // (null for every ordinary ACADEMIC slot).
          electiveBlock: blockId ? blockBreakdownBySlotId.get(blockId) ?? null : null,
        };
      }),
      config: config || null,
    };
  });
}

/** Teacher's own weekly timetable (B.12 reuse later). */
export async function teacherTimetable(user: SessionUser, teacherId: string) {
  return withTenant(user.tenantId, async () => {
    const slots = await tenantDb().timetableSlot.findMany({ where: { teacherId }, include: { subject: true } });
    const classIds = [...new Set(slots.map((s) => s.classId))];
    const classes = classIds.length ? await tenantDb().schoolClass.findMany({ where: { id: { in: classIds } } }) : [];
    const cMap = new Map(classes.map((c) => [c.id, [c.level, c.stream].filter(Boolean).join(" ")]));
    return slots.map((s) => ({
      id: s.id, dayOfWeek: s.dayOfWeek, period: s.period,
      subjectName: s.subject?.name ?? null, subjectCode: s.subject?.code ?? null,
      className: cMap.get(s.classId) ?? "—",
      venue: (s as any).venue ?? null,
      slotType: s.slotType,
      weekRotation: s.weekRotation,
    }));
  });
}

export async function timetablePrintBundle(user: SessionUser, mode: "classes" | "teachers" | "venues") {
  return withTenant(user.tenantId, async () => {
    const [slots, classes, teachers, configRows] = await Promise.all([
      tenantDb().timetableSlot.findMany({ include: { subject: true }, orderBy: [{ dayOfWeek: "asc" }, { period: "asc" }] }),
      tenantDb().schoolClass.findMany({ orderBy: [{ level: "asc" }, { stream: "asc" }] }),
      tenantDb().user.findMany({
        where: { role: { in: ["TEACHER", "CLASS_TEACHER", "HOD", "DEPUTY_PRINCIPAL"] } },
        select: { id: true, fullName: true, timetableShortCode: true },
        orderBy: { fullName: "asc" },
      }),
      tenantDb().timetableConfig.findMany(),
    ]);
    const classMap = new Map(classes.map((c) => [c.id, [c.level, c.stream].filter(Boolean).join(" ") || c.level]));
    const teacherMap = new Map(teachers.map((t) => [t.id, t.fullName]));
    // Z.3 — real teacher print short-code (e.g. "MO" for Mary Omondi),
    // auto-generated on demand for any teacher who doesn't have one yet, so
    // the printed timetable can show a real short abbreviation instead of a
    // full name (per the founder's own explicit print-redesign request).
    const shortCodeMap = new Map<string, string>();
    for (const t of teachers) {
      if (t.timetableShortCode) {
        shortCodeMap.set(t.id, t.timetableShortCode);
      }
    }
    const teachersNeedingCode = teachers.filter((t) => !t.timetableShortCode);
    if (teachersNeedingCode.length > 0) {
      const { resolveTeacherShortCode } = await import("@/lib/services/venue.service");
      for (const t of teachersNeedingCode) {
        try {
          const code = await resolveTeacherShortCode(user.tenantId, t.id, t.fullName);
          shortCodeMap.set(t.id, code);
        } catch {
          /* best-effort — fall back to the full name below if this fails */
        }
      }
    }
    const configMap = new Map(configRows.map((c) => [c.classId, c]));
    const normalized = slots.map((s) => ({
      id: s.id,
      classId: s.classId,
      className: classMap.get(s.classId) ?? "Class",
      dayOfWeek: s.dayOfWeek,
      period: s.period,
      subjectId: s.subjectId,
      subjectName: s.subject?.name ?? null,
      subjectCode: s.subject?.code ?? null,
      teacherId: s.teacherId,
      teacherName: s.teacherId ? teacherMap.get(s.teacherId) ?? null : null,
      teacherShortCode: s.teacherId ? shortCodeMap.get(s.teacherId) ?? null : null,
      venue: (s as any).venue ?? null,
      slotType: s.slotType,
      weekRotation: s.weekRotation,
    }));

    if (mode === "classes") {
      return {
        mode,
        groups: classes.map((c) => ({
          id: c.id,
          title: classMap.get(c.id) ?? "Class",
          subtitle: "Class timetable",
          config: configMap.get(c.id) ?? null,
          slots: normalized.filter((s) => s.classId === c.id),
        })).filter((g) => g.slots.length > 0),
      };
    }
    if (mode === "teachers") {
      return {
        mode,
        groups: teachers.map((t) => ({
          id: t.id,
          title: t.fullName,
          subtitle: shortCodeMap.get(t.id) ? `Teacher timetable · ${shortCodeMap.get(t.id)}` : "Teacher timetable",
          config: null,
          slots: normalized.filter((s) => s.teacherId === t.id),
        })).filter((g) => g.slots.length > 0),
      };
    }
    const venues = Array.from(new Set(normalized.map((s) => (s.venue || "Unassigned venue").trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
    return {
      mode,
      groups: venues.map((venue) => ({
        id: venue,
        title: venue,
        subtitle: "Venue timetable",
        config: null,
        slots: normalized.filter((s) => (s.venue || "Unassigned venue").trim() === venue),
      })),
    };
  });
}

/** Set/replace one slot — with REAL conflict detection. */
export async function setSlot(user: SessionUser, input: { classId: string; subjectId: string; teacherId?: string; venue?: string; dayOfWeek: number; period: number }) {
  return withTenant(user.tenantId, async () => {
    await assertHodSubjectAccess(user, input.subjectId);
    // Manual adjacent entries for the same subject are treated as a double
    // unless a school-locked break/lunch sits between them. Both halves must
    // keep the same teacher so manual scheduling cannot create a split-owner
    // double that looks valid but causes classroom responsibility problems.
    const config = await tenantDb().timetableConfig.findFirst({ where: { classId: input.classId } });
    const lockedAfter = new Set([config?.shortBreakStart, config?.shortBreak2Start, config?.longBreakStart, config?.lunchAfterPeriod ?? config?.lunchStart].filter((value): value is number => typeof value === "number"));
    const adjacent = await tenantDb().timetableSlot.findMany({ where: { classId: input.classId, dayOfWeek: input.dayOfWeek, period: { in: [input.period - 1, input.period + 1] }, subjectId: input.subjectId } });
    const conflictingHalf = adjacent.find((slot) => {
      const boundaryAfter = Math.min(slot.period, input.period);
      return !lockedAfter.has(boundaryAfter) && (slot.teacherId ?? null) !== (input.teacherId || null);
    });
    if (conflictingHalf) throw new AcademicsError("CONFLICT", "Both halves of an adjacent double lesson must use the same subject teacher. A configured break or lunch may separate independent lessons.");

    // Teacher double-booking check: same teacher, same day+period, ANY class.
    if (input.teacherId) {
      const clash = await tenantDb().timetableSlot.findFirst({
        where: {
          teacherId: input.teacherId,
          dayOfWeek: input.dayOfWeek,
          period: input.period,
          NOT: { classId: input.classId },
        },
        include: { subject: true },
      });
      if (clash) {
        const cls = await tenantDb().schoolClass.findUnique({ where: { id: clash.classId } });
        const label = cls ? [cls.level, cls.stream].filter(Boolean).join(" ") : "another class";
        throw new AcademicsError("CONFLICT", `That teacher already teaches ${clash.subject?.name ?? "another subject"} in ${label} at this time.`);
      }
    }
    const row = await db.timetableSlot.upsert({
      where: { tenantId_classId_dayOfWeek_period_slotType: { tenantId: user.tenantId, classId: input.classId, dayOfWeek: input.dayOfWeek, period: input.period, slotType: "ACADEMIC" } },
      create: { tenantId: user.tenantId, classId: input.classId, subjectId: input.subjectId, teacherId: input.teacherId || null, venue: input.venue || null, dayOfWeek: input.dayOfWeek, period: input.period, slotType: "ACADEMIC" },
      update: { subjectId: input.subjectId, teacherId: input.teacherId || null, venue: input.venue || null },
    });
    await audit(user, "academics.slot_set", "timetableSlot", row.id, input);
    return row;
  });
}

export async function clearSlot(user: SessionUser, classId: string, dayOfWeek: number, period: number) {
  return withTenant(user.tenantId, async () => {
    if (isScopedHod(user)) {
      const existing = await tenantDb().timetableSlot.findFirst({ where: { classId, dayOfWeek, period }, select: { subjectId: true } });
      if (existing?.subjectId) await assertHodSubjectAccess(user, existing.subjectId);
    }
    await db.timetableSlot.deleteMany({ where: { tenantId: user.tenantId, classId, dayOfWeek, period } });
    return { ok: true };
  });
}

/**
 * Greedy auto-fill (B.4 "timetable generator (auto)").
 * Spreads each subject's weekly load across the grid: avoids same subject
 * twice in a day when possible, respects teacher availability across classes.
 */
export async function autoFill(
  user: SessionUser,
  input: { classId: string; weeklyLoad: Record<string, number>; teachers: Record<string, string>; clearExisting: boolean }
) {
  return withTenant(user.tenantId, async () => {
    for (const subjectId of Object.keys(input.weeklyLoad)) await assertHodSubjectAccess(user, subjectId);
    if (input.clearExisting) {
      await db.timetableSlot.deleteMany({ where: { tenantId: user.tenantId, classId: input.classId } });
    }
    const [existing, config] = await Promise.all([
      tenantDb().timetableSlot.findMany({ where: { classId: input.classId } }),
      tenantDb().timetableConfig.findFirst({ where: { classId: input.classId } }),
    ]);
    const periods = Array.from({ length: Math.max(1, config?.periodsPerDay ?? 8) }, (_, index) => index + 1);
    const taken = new Set(existing.map((s) => `${s.dayOfWeek}|${s.period}`));

    // Teacher busy map across the whole school.
    const teacherIds = Object.values(input.teachers).filter(Boolean);
    const teacherBusy = new Set<string>();
    if (teacherIds.length) {
      const busyRows = await tenantDb().timetableSlot.findMany({ where: { teacherId: { in: teacherIds } } });
      for (const b of busyRows) teacherBusy.add(`${b.teacherId}|${b.dayOfWeek}|${b.period}`);
    }

    const placed: { subjectId: string; dayOfWeek: number; period: number }[] = [];
    const unplaced: { subjectId: string; remaining: number }[] = [];
    const subjectDayCount = new Map<string, number>(); // `${subjectId}|${day}` -> count

    for (const [subjectId, load] of Object.entries(input.weeklyLoad)) {
      let remaining = load;
      // pass 1: one per day; pass 2: allow doubles
      for (const allowDouble of [false, true]) {
        if (remaining <= 0) break;
        for (const day of DAYS) {
          if (remaining <= 0) break;
          const dayKey = `${subjectId}|${day}`;
          if (!allowDouble && (subjectDayCount.get(dayKey) ?? 0) > 0) continue;
          for (const period of periods) {
            if (remaining <= 0) break;
            const cellKey = `${day}|${period}`;
            if (taken.has(cellKey)) continue;
            const teacherId = input.teachers[subjectId];
            if (teacherId && teacherBusy.has(`${teacherId}|${day}|${period}`)) continue;
            // place
            await db.timetableSlot.create({
              data: { tenantId: user.tenantId, classId: input.classId, subjectId, teacherId: teacherId || null, dayOfWeek: day, period },
            });
            taken.add(cellKey);
            if (teacherId) teacherBusy.add(`${teacherId}|${day}|${period}`);
            subjectDayCount.set(dayKey, (subjectDayCount.get(dayKey) ?? 0) + 1);
            placed.push({ subjectId, dayOfWeek: day, period });
            remaining--;
            if (!allowDouble) break; // next day
          }
        }
      }
      if (remaining > 0) unplaced.push({ subjectId, remaining });
    }

    await audit(user, "academics.timetable_autofilled", "schoolClass", input.classId, { placed: placed.length, unplaced });
    return { placed: placed.length, unplaced };
  });
}

// ---------------------------------------------------------------------------
// Lesson plans (teacher-owned)
// ---------------------------------------------------------------------------

export async function listLessonPlans(user: SessionUser, filters: { classId?: string; from?: string; to?: string }) {
  return withTenant(user.tenantId, async () => {
    const where: Record<string, unknown> = {};
    // Teachers see only their own plans; leadership sees all.
    if (user.role === "TEACHER" || user.role === "CLASS_TEACHER") where.teacherId = user.id;
    if (filters.classId) where.classId = filters.classId;
    if (filters.from || filters.to) where.date = { ...(filters.from ? { gte: filters.from } : {}), ...(filters.to ? { lte: filters.to } : {}) };
    const rows = await tenantDb().lessonPlan.findMany({
      where, orderBy: { date: "desc" }, take: 200, 
      include: { 
        subject: true,
        strand: { select: { id: true, name: true } },
        competency: { select: { id: true, name: true } },
        assessmentPlan: { select: { id: true, title: true } },
        resources: true,
      },
    });
    const classIds = [...new Set(rows.map((r) => r.classId))];
    const classes = classIds.length ? await tenantDb().schoolClass.findMany({ where: { id: { in: classIds } } }) : [];
    const cMap = new Map(classes.map((c) => [c.id, [c.level, c.stream].filter(Boolean).join(" ")]));
    return rows.map((r) => ({
      id: r.id, date: r.date, topic: r.topic, status: r.status,
      subjectName: r.subject.name, subjectCode: r.subject.code,
      className: cMap.get(r.classId) ?? "—", classId: r.classId,
      teacherName: r.teacherName, teacherId: r.teacherId,
      objectives: r.objectives, activities: r.activities, notes: r.notes,
      strand: r.strand,
      competency: r.competency,
      assessmentPlan: r.assessmentPlan,
      resources: r.resources,
    }));
  });
}

export async function createLessonPlan(user: SessionUser, input: { 
  subjectId: string; classId: string; date: string; topic: string; 
  objectives?: string | null; activities?: string | null; notes?: string | null;
  strandId?: string | null; competencyId?: string | null; assessmentPlanId?: string | null;
  resources?: { fileUrl: string; fileName?: string }[];
}) {
  return withTenant(user.tenantId, async () => {
    const plan = await tenantDb().lessonPlan.create({
      data: {
        teacherId: user.id, teacherName: user.fullName,
        subjectId: input.subjectId, classId: input.classId, date: input.date,
        topic: input.topic, objectives: input.objectives || null,
        activities: input.activities || null, notes: input.notes || null,
        strandId: input.strandId || null,
        competencyId: input.competencyId || null,
        assessmentPlanId: input.assessmentPlanId || null,
        resources: input.resources && input.resources.length > 0 ? {
          create: input.resources.map(r => ({ tenantId: user.tenantId, fileUrl: r.fileUrl, fileName: r.fileName || null }))
        } : undefined,
      } as never,
    });
    await audit(user, "academics.lesson_planned", "lessonPlan", plan.id, { topic: input.topic, date: input.date });
    return plan;
  });
}

export async function setLessonStatus(user: SessionUser, id: string, status: string) {
  return withTenant(user.tenantId, async () => {
    const plan = await tenantDb().lessonPlan.findUnique({ where: { id } });
    if (!plan) throw new AcademicsError("NOT_FOUND", "Lesson plan not found.");
    // Teachers may only touch their own plans.
    if ((user.role === "TEACHER" || user.role === "CLASS_TEACHER") && plan.teacherId !== user.id)
      throw new AcademicsError("FORBIDDEN", "You can only update your own lesson plans.");
    await tenantDb().lessonPlan.update({ where: { id }, data: { status } });
    if (status === "DELIVERED" || status === "TAUGHT") {
      const { syncSyllabusFromAssessment } = await import("@/lib/services/syllabus.service");
      await syncSyllabusFromAssessment(user, {
        classId: plan.classId,
        subjectId: plan.subjectId,
        strandId: plan.strandId || null,
        topicName: plan.topic,
        lessonPlanId: plan.id,
      }).catch(() => {});
    }
    return { id, status };
  });
}

/** Bulk Saturday timetable scheduler (Form 6 to 9 / all in one tap!) */
export async function bulkSaturdaySchedule(
  user: SessionUser,
  input: { classIds: string[]; periodIds: number[]; subjectId: string; teacherId?: string; weekRotation?: string }
) {
  return withTenant(user.tenantId, async () => {
    let createdCount = 0;
    const rotation = input.weekRotation || "ALL";
    for (const classId of input.classIds) {
      for (const p of input.periodIds) {
        await db.timetableSlot.upsert({
          where: {
            tenantId_classId_dayOfWeek_period_slotType: {
              tenantId: user.tenantId,
              classId,
              dayOfWeek: 6,
              period: p,
              slotType: "ACADEMIC",
            },
          },
          create: {
            tenantId: user.tenantId,
            classId,
            subjectId: input.subjectId,
            teacherId: input.teacherId || null,
            dayOfWeek: 6,
            period: p,
            slotType: "ACADEMIC",
            weekRotation: rotation,
          },
          update: {
            subjectId: input.subjectId,
            teacherId: input.teacherId || null,
            weekRotation: rotation,
          },
        });
        createdCount++;
      }
    }

    await audit(user, "academics.timetable_bulk_saturday", "timetableSlot", user.id, {
      classes: input.classIds.length,
      periods: input.periodIds.length,
      total: createdCount,
    });

    return { success: true, createdCount };
  });
}

/** I.28 — fair Saturday/remedial scheduler.
 * Distributes a limited Saturday set of periods across multiple subjects so the
 * same subject does not monopolize the short day. Alternates Week A / Week B
 * by cell position unless a fixed rotation is chosen.
 */
export async function fairSaturdaySchedule(
  user: SessionUser,
  input: { classIds: string[]; periodIds: number[]; subjectIds: string[]; teacherId?: string; mode?: "REMEDIAL" | "EXAM_PREP" | "SATURDAY"; rotationMode?: "ALTERNATE" | "ALL" | "WEEK_A" | "WEEK_B" }
) {
  return withTenant(user.tenantId, async () => {
    const classIds = Array.from(new Set(input.classIds.filter(Boolean)));
    const periodIds = Array.from(new Set(input.periodIds.map((p) => Math.trunc(p)).filter((p) => p >= 1 && p <= 20))).sort((a, b) => a - b);
    const subjectIds = Array.from(new Set(input.subjectIds.filter(Boolean)));
    if (classIds.length === 0) throw new AcademicsError("NOT_FOUND", "Select at least one class.");
    if (periodIds.length === 0) throw new AcademicsError("NOT_FOUND", "Select at least one Saturday period.");
    if (subjectIds.length < 2) throw new AcademicsError("NOT_FOUND", "Pick at least two subjects for fair Saturday rotation.");

    const configs = await tenantDb().timetableConfig.findMany({ where: { classId: { in: classIds } } });
    const noSaturday = new Set(configs.filter((c) => c.hasSaturday === false).map((c) => c.classId));
    const eligibleClassIds = classIds.filter((id) => !noSaturday.has(id));
    if (eligibleClassIds.length === 0) throw new AcademicsError("FORBIDDEN", "All selected classes are set not to attend Saturdays.");

    const subjects = await tenantDb().subject.findMany({ where: { id: { in: subjectIds }, archived: false }, select: { id: true, name: true, code: true } });
    if (subjects.length !== subjectIds.length) throw new AcademicsError("NOT_FOUND", "One of the selected subjects was not found.");
    const subjectOrder = subjects.map((s) => s.id);

    // wipe only selected Saturday cells for these classes before fair scheduling
    await db.timetableSlot.deleteMany({
      where: { tenantId: user.tenantId, classId: { in: eligibleClassIds }, dayOfWeek: 6, period: { in: periodIds }, slotType: "ACADEMIC" },
    });

    let createdCount = 0;
    const placements: { classId: string; period: number; subjectId: string; weekRotation: string }[] = [];
    for (let cIndex = 0; cIndex < eligibleClassIds.length; cIndex++) {
      const classId = eligibleClassIds[cIndex];
      for (let pIndex = 0; pIndex < periodIds.length; pIndex++) {
        const seq = cIndex * periodIds.length + pIndex;
        const subjectId = subjectOrder[seq % subjectOrder.length];
        const weekRotation = input.rotationMode === "ALTERNATE"
          ? (seq % 2 === 0 ? "WEEK_A" : "WEEK_B")
          : (input.rotationMode || "ALTERNATE") === "ALL" ? "ALL" : (input.rotationMode || "WEEK_A");
        await db.timetableSlot.create({
          data: {
            tenantId: user.tenantId,
            classId,
            subjectId,
            teacherId: input.teacherId || null,
            dayOfWeek: 6,
            period: periodIds[pIndex],
            slotType: input.mode === "REMEDIAL" ? "REMEDIAL" : input.mode === "EXAM_PREP" ? "PREP" : "ACADEMIC",
            weekRotation,
          },
        });
        placements.push({ classId, period: periodIds[pIndex], subjectId, weekRotation });
        createdCount++;
      }
    }
    await audit(user, "academics.timetable_fair_saturday", "timetableSlot", user.id, {
      classes: eligibleClassIds.length,
      periods: periodIds.length,
      subjects: subjectIds.length,
      mode: input.mode ?? "SATURDAY",
      rotationMode: input.rotationMode ?? "ALTERNATE",
      createdCount,
    });
    return { success: true, createdCount, skippedClasses: classIds.length - eligibleClassIds.length, placements };
  });
}

export async function getLessonPlanningAnalytics(user: SessionUser, classId: string, subjectId: string) {
  return withTenant(user.tenantId, async () => {
    const tDb = tenantDb();

    // Scope teachers to their own plans; leadership sees the whole class/subject.
    const planScope: Record<string, unknown> = { classId, subjectId };
    if (user.role === "TEACHER" || user.role === "CLASS_TEACHER") planScope.teacherId = user.id;

    // 1. Plans (planned vs taught)
    const totalPlans = await tDb.lessonPlan.count({ where: planScope });
    const taughtPlans = await tDb.lessonPlan.count({ where: { ...planScope, status: "TAUGHT" } });
    const skippedPlans = await tDb.lessonPlan.count({ where: { ...planScope, status: "SKIPPED" } });

    // 2. Strand coverage (syllabus topics)
    const strandPlans = await tDb.lessonPlan.findMany({
      where: { ...planScope, strandId: { not: null } },
      select: { strandId: true },
    });
    const coveredStrandIds = new Set(strandPlans.map((p) => p.strandId as string));
    const uniqueStrandsCovered = coveredStrandIds.size;
    const totalStrands = await tDb.cbcStrand.count({ where: { subjectId } });

    // 3. Competency coverage
    const compPlans = await tDb.lessonPlan.findMany({
      where: { ...planScope, competencyId: { not: null } },
      select: { competencyId: true },
    });
    const coveredCompetencyIds = new Set(compPlans.map((p) => p.competencyId as string));
    const uniqueCompetenciesTaught = coveredCompetencyIds.size;

    // 4. Assessment coverage + the "assessed" dimension (planned vs taught vs ASSESSED).
    // A planned objective is "assessed" when its lesson plan is linked to an
    // assessment plan that actually has at least one recorded result.
    const assessPlans = await tDb.lessonPlan.findMany({
      where: { ...planScope, assessmentPlanId: { not: null } },
      select: { id: true, assessmentPlanId: true, strandId: true, competencyId: true },
    });
    const linkedAssessmentPlanIds = [...new Set(assessPlans.map((p) => p.assessmentPlanId as string))];
    let scoredAssessmentPlanIds = new Set<string>();
    if (linkedAssessmentPlanIds.length) {
      const recCounts = await tDb.assessmentRecord.groupBy({
        by: ["planId"],
        where: { planId: { in: linkedAssessmentPlanIds } },
        _count: { _all: true },
      } as never) as Array<{ planId: string; _count: { _all: number } }>;
      scoredAssessmentPlanIds = new Set(recCounts.filter((r) => r._count._all > 0).map((r) => r.planId));
    }
    // Objectives that were assessed = competency/strand objectives whose plan is linked to a scored assessment plan.
    const assessedCompetencyIds = new Set<string>();
    const assessedStrandIds = new Set<string>();
    let assessedPlans = 0;
    for (const p of assessPlans) {
      if (p.assessmentPlanId && scoredAssessmentPlanIds.has(p.assessmentPlanId)) {
        assessedPlans++;
        if (p.competencyId) assessedCompetencyIds.add(p.competencyId);
        if (p.strandId) assessedStrandIds.add(p.strandId);
      }
    }
    const plansLinkedToAssessment = assessPlans.length;
    const assessedObjectives = assessedCompetencyIds.size + assessedStrandIds.size;

    const strandCoveragePct = totalStrands > 0 ? Math.round((uniqueStrandsCovered / totalStrands) * 100) : 0;
    const taughtPct = totalPlans > 0 ? Math.round((taughtPlans / totalPlans) * 100) : 0;
    const assessedPct = totalPlans > 0 ? Math.round((assessedPlans / totalPlans) * 100) : 0;

    return {
      // planned vs taught vs assessed (the J.12 headline)
      totalPlans,
      taughtPlans,
      skippedPlans,
      assessedPlans, // plans linked to an assessment that has recorded results
      taughtPct,
      assessedPct,
      // strand (syllabus topic) coverage
      uniqueStrandsCovered,
      totalStrands,
      strandCoveragePct,
      // competency coverage
      uniqueCompetenciesTaught,
      // assessment coverage
      plansLinkedToAssessment,
      assessedObjectives,
    };
  });
}

/** J.12 — record an observation directly from a lesson plan. */
export async function recordLessonObservation(
  user: SessionUser,
  input: {
    lessonPlanId: string;
    studentId?: string | null;
    strandId?: string | null;
    competencyId?: string | null;
    level?: number | null;
    note: string;
    date?: string;
  }
) {
  return withTenant(user.tenantId, async () => {
    const plan = await tenantDb().lessonPlan.findUnique({ where: { id: input.lessonPlanId } });
    if (!plan) throw new AcademicsError("NOT_FOUND", "Lesson plan not found.");
    if ((user.role === "TEACHER" || user.role === "CLASS_TEACHER") && plan.teacherId !== user.id)
      throw new AcademicsError("FORBIDDEN", "You can only add observations to your own lesson plans.");
    // If a learner is named, they must belong to this tenant (and ideally this class).
    if (input.studentId) {
      const student = await tenantDb().student.findUnique({ where: { id: input.studentId }, select: { id: true, classId: true } });
      if (!student) throw new AcademicsError("INVALID", "That learner was not found.");
      if (student.classId && plan.classId && student.classId !== plan.classId)
        throw new AcademicsError("INVALID", "That learner is not in this lesson's class.");
    }
    const obs = await tenantDb().lessonObservation.create({
      data: {
        lessonPlanId: input.lessonPlanId,
        studentId: input.studentId || null,
        strandId: input.strandId || plan.strandId || null,
        competencyId: input.competencyId || plan.competencyId || null,
        level: input.level ?? null,
        note: input.note,
        teacherId: user.id,
        teacherName: user.fullName,
        date: input.date || plan.date,
      } as never,
    });
    await audit(user, "academics.lesson_observation_recorded", "lessonObservation", obs.id, {
      lessonPlanId: input.lessonPlanId, studentId: input.studentId || null, level: input.level ?? null,
    });
    const { syncSyllabusFromAssessment } = await import("@/lib/services/syllabus.service");
    await syncSyllabusFromAssessment(user, {
      classId: plan.classId,
      subjectId: plan.subjectId,
      strandId: input.strandId || plan.strandId || null,
      lessonPlanId: plan.id,
    }).catch(() => {});
    return obs;
  });
}

/**
 * Immutability Guard (`cant be deleted anyhowly`):
 * Lesson observations and student academic evaluations cannot be deleted arbitrarily by ordinary teachers.
 * Requires Academics Leadership (`academics.manage`), Principal, Deputy Principal, or Founder authorization.
 */
export async function deleteLessonObservation(user: SessionUser, id: string) {
  return withTenant(user.tenantId, async () => {
    const primaryCanManage = can(user.role as Role, "academics.manage");
    const secondaryCanManage = user.secondaryRole ? can(user.secondaryRole as Role, "academics.manage") : false;
    const isLeadership = ["PRINCIPAL", "DEPUTY_PRINCIPAL", "FOUNDER", "SUPER_ADMIN", "SCHOOL_OWNER"].includes(user.role);
    if (!primaryCanManage && !secondaryCanManage && !isLeadership) {
      throw new AcademicsError("FORBIDDEN", "Lesson observations and academic records cannot be deleted arbitrarily by teachers (\"cant be deleted anyhowly\"). Only the Principal or Academics HOD can authorize deleting or voiding recorded observations.");
    }
    const row = await tenantDb().lessonObservation.findUnique({ where: { id } });
    if (!row) throw new AcademicsError("NOT_FOUND", "Observation record not found.");
    await tenantDb().lessonObservation.delete({ where: { id } });
    await audit(user, "academics.lesson_observation_deleted", "lessonObservation", id, { lessonPlanId: row.lessonPlanId, studentId: row.studentId });
    return { success: true, deletedId: id };
  });
}

/** J.12 — list observations for one lesson plan (own-scoped for teachers). */
export async function listLessonObservations(user: SessionUser, lessonPlanId: string) {
  return withTenant(user.tenantId, async () => {
    const plan = await tenantDb().lessonPlan.findUnique({ where: { id: lessonPlanId } });
    if (!plan) throw new AcademicsError("NOT_FOUND", "Lesson plan not found.");
    if ((user.role === "TEACHER" || user.role === "CLASS_TEACHER") && plan.teacherId !== user.id)
      throw new AcademicsError("FORBIDDEN", "You can only view your own lesson plans.");
    const rows = await tenantDb().lessonObservation.findMany({
      where: { lessonPlanId }, orderBy: { createdAt: "desc" }, take: 200,
    });
    // Decorate learner names for display.
    const studentIds = [...new Set(rows.map((r) => r.studentId).filter(Boolean))] as string[];
    const students = studentIds.length ? await tenantDb().student.findMany({ where: { id: { in: studentIds } }, select: { id: true, firstName: true, lastName: true } }) : [];
    const sMap = new Map(students.map((st) => [st.id, [st.firstName, st.lastName].filter(Boolean).join(" ")]));
    return rows.map((r) => ({
      id: r.id, date: r.date, note: r.note, level: r.level,
      studentId: r.studentId, studentName: r.studentId ? (sMap.get(r.studentId) ?? "Learner") : "Whole class",
      strandId: r.strandId, competencyId: r.competencyId, teacherName: r.teacherName,
    }));
  });
}

/** J.12 — attach learning resources/evidence to an existing lesson plan. */
export async function addLessonResources(
  user: SessionUser,
  lessonPlanId: string,
  resources: { fileUrl: string; fileName?: string }[]
) {
  return withTenant(user.tenantId, async () => {
    const plan = await tenantDb().lessonPlan.findUnique({ where: { id: lessonPlanId } });
    if (!plan) throw new AcademicsError("NOT_FOUND", "Lesson plan not found.");
    if ((user.role === "TEACHER" || user.role === "CLASS_TEACHER") && plan.teacherId !== user.id)
      throw new AcademicsError("FORBIDDEN", "You can only add resources to your own lesson plans.");
    if (!resources?.length) throw new AcademicsError("INVALID", "Add at least one resource.");
    await tenantDb().lessonResource.createMany({
      data: resources.map((r) => ({ tenantId: user.tenantId, lessonPlanId, fileUrl: r.fileUrl, fileName: r.fileName || null })),
    });
    await audit(user, "academics.lesson_resources_attached", "lessonPlan", lessonPlanId, { count: resources.length });
    return tenantDb().lessonResource.findMany({ where: { lessonPlanId }, orderBy: { createdAt: "desc" } });
  });
}
