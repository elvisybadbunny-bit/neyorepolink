#!/usr/bin/env python3
"""
Idempotent patch script for timetable-solver.service.ts's real Z.3 venueId
wiring (saveClassSubjectNeed() + getTimetableInputs()). This file is
SEPARATE from timetable-engine.service.ts and is NOT covered by
z2-z3-timetable-engine-patch.py — it has also been observed reverting
during this session's fragile-file wipes. Run this any time
`grep -c "venueId" src/lib/services/timetable-solver.service.ts` returns 0.
Safe to re-run: idempotent, no-op on an already-patched file.
"""
import sys

PATH = "src/lib/services/timetable-solver.service.ts"

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
    "saveClassSubjectNeed venueId",
    """export async function saveClassSubjectNeed(
  user: SessionUser,
  input: { classId: string; subjectId: string; lessonsPerWeek: number; teacherId?: string | null; doubleCount?: number; allowSplitDouble?: boolean }
) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const { classId, subjectId, lessonsPerWeek, teacherId } = input;
    // L.7: doubles can't exceed half the weekly lessons.
    const doubleCount = Math.max(0, Math.min(input.doubleCount ?? 0, Math.floor(lessonsPerWeek / 2)));
    const allowSplitDouble = input.allowSplitDouble ?? false;

    const row = await tdb.classSubjectNeed.upsert({
      where: { tenantId_classId_subjectId: { tenantId: user.tenantId, classId, subjectId } },
      create: {
        tenantId: user.tenantId,
        classId,
        subjectId,
        teacherId: teacherId || null,
        lessonsPerWeek,
        doubleCount,
        allowSplitDouble,
      },
      update: {
        teacherId: teacherId || null,
        lessonsPerWeek,
        doubleCount,
        allowSplitDouble,
      },
    });

    return row;
  });""",
    """export async function saveClassSubjectNeed(
  user: SessionUser,
  input: { classId: string; subjectId: string; lessonsPerWeek: number; teacherId?: string | null; doubleCount?: number; allowSplitDouble?: boolean; venueId?: string | null }
) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const { classId, subjectId, lessonsPerWeek, teacherId } = input;
    // L.7: doubles can't exceed half the weekly lessons.
    const doubleCount = Math.max(0, Math.min(input.doubleCount ?? 0, Math.floor(lessonsPerWeek / 2)));
    const allowSplitDouble = input.allowSplitDouble ?? false;
    // Z.3 — a school may PIN an exact real Venue/Lab to this class-subject
    // need (takes priority over the school's own subject-tagged Venue
    // pool at solve time). Nullable — most needs use the pool instead.
    const venueId = input.venueId || null;

    const row = await tdb.classSubjectNeed.upsert({
      where: { tenantId_classId_subjectId: { tenantId: user.tenantId, classId, subjectId } },
      create: {
        tenantId: user.tenantId,
        classId,
        subjectId,
        teacherId: teacherId || null,
        lessonsPerWeek,
        doubleCount,
        allowSplitDouble,
        venueId,
      },
      update: {
        teacherId: teacherId || null,
        lessonsPerWeek,
        doubleCount,
        allowSplitDouble,
        venueId,
      },
    });

    return row;
  });""",
)

must_apply(
    "getTimetableInputs venues",
    """export async function getTimetableInputs(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const [classes, subjects, teachers, needs, configs, teacherAssoc] = await Promise.all([
      tdb.schoolClass.findMany({ where: { archived: false }, orderBy: [{ level: "asc" }, { stream: "asc" }] }),
      tdb.subject.findMany({ where: { archived: false }, orderBy: { code: "asc" } }),
      tdb.user.findMany({ where: { role: { in: ["TEACHER", "CLASS_TEACHER", "DEAN_OF_STUDIES", "HOSTEL_MASTER"] }, isActive: true } }),
      tdb.classSubjectNeed.findMany(),
      tdb.timetableConfig.findMany(),
      tdb.teacherSubject.findMany(),
    ]);

    return { classes, subjects, teachers, needs, configs, teacherAssoc };
  });
}""",
    """export async function getTimetableInputs(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const [classes, subjects, teachers, needs, configs, teacherAssoc, venues] = await Promise.all([
      tdb.schoolClass.findMany({ where: { archived: false }, orderBy: [{ level: "asc" }, { stream: "asc" }] }),
      tdb.subject.findMany({ where: { archived: false }, orderBy: { code: "asc" } }),
      tdb.user.findMany({ where: { role: { in: ["TEACHER", "CLASS_TEACHER", "DEAN_OF_STUDIES", "HOSTEL_MASTER"] }, isActive: true } }),
      tdb.classSubjectNeed.findMany(),
      tdb.timetableConfig.findMany(),
      tdb.teacherSubject.findMany(),
      tdb.venue.findMany({ where: { active: true }, orderBy: { name: "asc" } }), // Z.3
    ]);

    return { classes, subjects, teachers, needs, configs, teacherAssoc, venues };
  });
}""",
)

with open(PATH, "w") as f:
    f.write(src)

print(f"Applied {len(applied)} patch(es): {', '.join(applied) if applied else '(none — already up to date)'}")
