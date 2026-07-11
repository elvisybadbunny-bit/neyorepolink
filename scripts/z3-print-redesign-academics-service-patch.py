#!/usr/bin/env python3
"""
Idempotent patch script for the Z.3 print-redesign changes to
src/lib/services/academics.service.ts (real teacher short-code resolution
wired into getTimetable() and timetablePrintBundle()). This file has been
observed reverting during this session's fragile-file wipes. Run this any
time `grep -c "teacherShortCode" src/lib/services/academics.service.ts`
returns 0. Safe to re-run: idempotent, no-op on an already-patched file.
"""
import sys

PATH = "src/lib/services/academics.service.ts"

with open(PATH, "r") as f:
    src = f.read()

applied = []


def must_apply(name, old, new):
    global src
    if new in src:
        return
    if old not in src:
        print(f"FATAL: anchor for patch '{name}' not found — file structure changed unexpectedly.")
        sys.exit(1)
    src = src.replace(old, new, 1)
    applied.append(name)


must_apply(
    "getTimetable teacherShortCode",
    """export async function getTimetable(user: SessionUser, classId: string) {
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
    const teacherIds = [...new Set(slots.map((s) => s.teacherId).filter((x): x is string => Boolean(x)))];
    const teachers = teacherIds.length
      ? await tenantDb().user.findMany({ where: { id: { in: teacherIds } }, select: { id: true, fullName: true } })
      : [];
    const tMap = new Map(teachers.map((t) => [t.id, t.fullName]));
    // T.12 — real, cheap map of today's real confirmed substitute coverage.
    const { todaysConfirmedSubstitutesMap } = await import("@/lib/services/substitute.service");
    const substituteMap = await todaysConfirmedSubstitutesMap(user.tenantId);
    return {
      slots: slots.map((s) => {
        const sub = substituteMap.get(s.id);
        return {
          id: s.id, dayOfWeek: s.dayOfWeek, period: s.period,
          subjectId: s.subjectId, subjectName: s.subject?.name ?? null, subjectCode: s.subject?.code ?? null,
          teacherId: s.teacherId, teacherName: s.teacherId ? tMap.get(s.teacherId) ?? null : null,
          venue: (s as any).venue ?? null,
          slotType: s.slotType,
          weekRotation: s.weekRotation,
          // T.12 — real, honest "who's actually teaching this TODAY" overlay.
          substituteTodayName: sub?.teacherName ?? null,
        };
      }),""",
    """export async function getTimetable(user: SessionUser, classId: string) {
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
        };
      }),""",
)

must_apply(
    "timetablePrintBundle teacherShortCode",
    """export async function timetablePrintBundle(user: SessionUser, mode: "classes" | "teachers" | "venues") {
  return withTenant(user.tenantId, async () => {
    const [slots, classes, teachers, configRows] = await Promise.all([
      tenantDb().timetableSlot.findMany({ include: { subject: true }, orderBy: [{ dayOfWeek: "asc" }, { period: "asc" }] }),
      tenantDb().schoolClass.findMany({ orderBy: [{ level: "asc" }, { stream: "asc" }] }),
      tenantDb().user.findMany({
        where: { role: { in: ["TEACHER", "CLASS_TEACHER", "HOD", "DEPUTY_PRINCIPAL"] } },
        select: { id: true, fullName: true },
        orderBy: { fullName: "asc" },
      }),
      tenantDb().timetableConfig.findMany(),
    ]);
    const classMap = new Map(classes.map((c) => [c.id, [c.level, c.stream].filter(Boolean).join(" ") || c.level]));
    const teacherMap = new Map(teachers.map((t) => [t.id, t.fullName]));
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
          subtitle: "Teacher timetable",
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
}""",
    """export async function timetablePrintBundle(user: SessionUser, mode: "classes" | "teachers" | "venues") {
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
}""",
)

with open(PATH, "w") as f:
    f.write(src)

print(f"Applied {len(applied)} patch(es): {', '.join(applied) if applied else '(none — already up to date)'}")
