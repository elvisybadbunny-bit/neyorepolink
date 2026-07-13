/**
 * AA.1 — Elective/Options Block engine: real CRUD for school-defined
 * ElectiveBlocks, per docs/TEACHER-ALLOCATION-AND-ELECTIVES-ENGINE-DESIGN.md
 * Part 7. A block is a set of subjects students genuinely choose BETWEEN
 * (mutually exclusive alternatives) that must occupy identical real
 * timetable slot(s) — e.g. the founder's own "History OR CRE" pairing, the
 * CBE Senior School's 3-elective pathway system, or a single-choice
 * Technical & Applied block. See timetable-engine.service.ts for how the
 * solver treats a block's slots as one atomic placement unit.
 */
import { withTenant } from "@/lib/core/tenant-context";
import { tenantDb } from "@/lib/core/tenant-db";
import type { SessionUser } from "@/lib/core/session";
import type { ElectiveBlockSaveInput } from "@/lib/validations/elective-block";

export class ElectiveBlockError extends Error {
  constructor(public code: "NOT_FOUND" | "INVALID" | "CONFLICT", message: string) {
    super(message);
    this.name = "ElectiveBlockError";
  }
}

function safeParse<T>(s: string | null | undefined, fallback: T): T {
  try { return s ? (JSON.parse(s) as T) : fallback; } catch { return fallback; }
}

export async function listElectiveBlocks(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const blocks = await tdb.electiveBlock.findMany({
      where: { active: true },
      include: {
        classes: true,
        slots: { orderBy: { sortOrder: "asc" }, include: { subjects: { orderBy: { id: "asc" } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    return blocks.map((b) => ({
      id: b.id,
      name: b.name,
      mode: b.mode,
      preferAfterBreak: b.preferAfterBreak,
      classIds: b.classes.map((c) => c.classId),
      slots: b.slots.map((slot) => ({
        id: slot.id,
        label: slot.label,
        isDouble: slot.isDouble,
        sortOrder: slot.sortOrder,
        subjects: slot.subjects.map((s) => ({
          id: s.id,
          subjectId: s.subjectId,
          teacherId: s.teacherId,
          venueId: s.venueId,
          // BB.1 — the real venue the solver's own last run auto-picked
          // from the pool for this subject, if the school left venueId
          // unset and this genuinely was an overflow subject. Read-only
          // from the UI's own perspective — a school changes this by
          // pinning a real venueId instead, never by editing this field.
          resolvedVenueId: s.resolvedVenueId,
          classIds: safeParse<string[]>(s.comboClassIdsJson, []),
        })),
      })),
    }));
  });
}

export async function saveElectiveBlock(user: SessionUser, input: ElectiveBlockSaveInput) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();

    // Real, honest validation against the school's own live data — never
    // trust client-supplied ids blindly, matching every other NEYO service.
    const realClasses = await tdb.schoolClass.findMany({ where: { id: { in: input.classIds }, archived: false } });
    if (realClasses.length !== input.classIds.length) {
      throw new ElectiveBlockError("INVALID", "One or more selected classes no longer exist.");
    }
    const allSubjectIds = Array.from(new Set(input.slots.flatMap((slot) => slot.subjects.map((s) => s.subjectId))));
    const realSubjects = await tdb.subject.findMany({ where: { id: { in: allSubjectIds }, archived: false } });
    if (realSubjects.length !== allSubjectIds.length) {
      throw new ElectiveBlockError("INVALID", "One or more selected subjects no longer exist.");
    }

    const base = {
      name: input.name.trim(),
      mode: input.mode,
      preferAfterBreak: input.preferAfterBreak ?? false,
    };

    let block;
    if (input.id) {
      const existing = await tdb.electiveBlock.findUnique({ where: { id: input.id } });
      if (!existing) throw new ElectiveBlockError("NOT_FOUND", "Elective block not found.");
      block = await tdb.electiveBlock.update({ where: { id: input.id }, data: base });
      // Real, simple replace-the-children approach on update (mirrors the
      // exact same pattern CombinationGroup's own upsert already uses) —
      // a block's own slot/subject shape is small enough that a full
      // rebuild on every save is simpler and safer than diffing.
      await tdb.electiveBlockClass.deleteMany({ where: { blockId: input.id } });
      await tdb.electiveBlockSlot.deleteMany({ where: { blockId: input.id } }); // cascades to slot subjects
    } else {
      block = await tdb.electiveBlock.create({ data: { tenantId: user.tenantId, ...base } });
    }

    if (input.classIds.length > 0) {
      await tdb.electiveBlockClass.createMany({
        data: input.classIds.map((classId) => ({ tenantId: user.tenantId, blockId: block.id, classId })),
      });
    }

    for (const slot of input.slots) {
      const slotRow = await tdb.electiveBlockSlot.create({
        data: {
          tenantId: user.tenantId,
          blockId: block.id,
          label: slot.label.trim(),
          isDouble: slot.isDouble ?? false,
          sortOrder: slot.sortOrder ?? 0,
        },
      });
      for (const s of slot.subjects) {
        await tdb.electiveBlockSlotSubject.create({
          data: {
            tenantId: user.tenantId,
            slotId: slotRow.id,
            subjectId: s.subjectId,
            teacherId: s.teacherId || null,
            venueId: s.venueId || null,
            comboClassIdsJson: JSON.stringify(s.classIds && s.classIds.length > 0 ? s.classIds : input.classIds),
          },
        });
      }
    }

    return { id: block.id };
  });
}

export async function deleteElectiveBlock(user: SessionUser, id: string) {
  return withTenant(user.tenantId, async () => {
    await tenantDb().electiveBlock.delete({ where: { id } }).catch(() => {});
    return { success: true };
  });
}

/**
 * Real, internal data shape the Timetable Engine's solver consumes — kept
 * as its own function (rather than making the engine reach into Prisma
 * directly for this domain) so the engine file's own real data-loading
 * `Promise.all` stays the single obvious place every input comes from.
 */
export async function getElectiveBlocksForSolver(tenantId: string) {
  return withTenant(tenantId, async () => {
    const tdb = tenantDb();
    const blocks = await tdb.electiveBlock.findMany({
      where: { active: true },
      include: {
        classes: true,
        // BB.1 — real, deterministic subject order (createdAt asc) is
        // required so the solver's own "first N subjects = home
        // classroom, remaining = genuine overflow" rule (N = the block's
        // real member-class count) means the same real thing every single
        // generation run, not whatever order SQLite happens to return.
        slots: { orderBy: { sortOrder: "asc" }, include: { subjects: { orderBy: { id: "asc" } } } },
      },
    });
    return blocks
      .filter((b) => b.classes.length > 0 && b.slots.length > 0 && b.slots.every((s) => s.subjects.length >= 2))
      .map((b) => ({
        id: b.id,
        name: b.name,
        classIds: b.classes.map((c) => c.classId),
        preferAfterBreak: b.preferAfterBreak,
        slots: b.slots.map((slot) => ({
          id: slot.id,
          label: slot.label,
          isDouble: slot.isDouble,
          subjects: slot.subjects.map((s) => ({
            // BB.1 — the solver needs this row's own real id to persist a
            // real resolvedVenueId back onto it after auto-picking a venue.
            id: s.id,
            subjectId: s.subjectId,
            teacherId: s.teacherId,
            venueId: s.venueId,
            classIds: safeParse<string[]>(s.comboClassIdsJson, b.classes.map((c) => c.classId)),
          })),
        })),
      }));
  });
}

// ---------------------------------------------------------------------------
// BB.7 — Dedicated Options Block & Subject-Combination Roster Prints.
//
// Real gap found via investigation (not assumed): the founder asked for
// venue/teacher detail for a combined Options Block slot to be printable —
// but `timetablePrintBundle()` (the function powering the ACTUAL printed
// timetable at /print/timetable) never resolves the same real
// `electiveBlock` breakdown that `getTimetable()` (the live on-screen view)
// already computes. A printed/PDF class timetable would therefore silently
// show just one generic subject/teacher cell for what's actually a real
// multi-subject Options Block period, hiding which room/teacher a given
// student actually needs to go to.
//
// Founder's own explicit instruction (verbatim, real design decision):
// "THE VENUE DETAILS SHOULD BE AND TEACHER DETAILS SHOULD BE IN A DIFFERENT
// PRINT EXPLAINING THAT NOT IN THE TIMETABLE OVERCROWDING IT JUST IN A
// DIFFERENT PRINT MAYBE PER CLASS SHOWING THAT AND ALSO PRINTS SHOWING THE
// SUBJECT CLASS LISTS AND COMBINATIONS THAT THE SYSTEM GENERATED" — i.e.
// TWO separate, dedicated reference prints, never embedded in/overcrowding
// the main timetable grid:
//   1. getOptionsBlockRosterPrint() — per real class, every real placed
//      Options Block period with its real subject/teacher/venue breakdown.
//   2. getSubjectCombinationRosterPrint() — the real subject-combination
//      groups the system itself generated from student choices (reuses
//      L.7's own real groupStudentsBySubjectCombination() algorithm —
//      never a second, drifting copy of that logic).
// ---------------------------------------------------------------------------

export async function getOptionsBlockRosterPrint(user: SessionUser, level?: string | null) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();

    const classWhere = level ? { level, archived: false } : { archived: false };
    const classes = await tdb.schoolClass.findMany({ where: classWhere, orderBy: [{ level: "asc" }, { stream: "asc" }] });
    if (classes.length === 0) return { level: level ?? null, classes: [] as any[] };
    const classIds = classes.map((c) => c.id);
    const classMap = new Map(classes.map((c) => [c.id, c]));

    // Real placed Options Block periods only — never a proposed/unbuilt
    // block, since this print is a reference for staff/students about what
    // ACTUALLY got scheduled.
    const slots = await tdb.timetableSlot.findMany({
      where: { classId: { in: classIds }, slotType: "ELECTIVE_BLOCK", electiveBlockSlotId: { not: null } },
      orderBy: [{ dayOfWeek: "asc" }, { period: "asc" }],
    });
    if (slots.length === 0) return { level: level ?? null, classes: [] as any[] };

    const blockSlotIds = [...new Set(slots.map((s) => s.electiveBlockSlotId).filter((x): x is string => Boolean(x)))];
    const blockSlots = await tdb.electiveBlockSlot.findMany({
      where: { id: { in: blockSlotIds } },
      include: { subjects: { orderBy: { id: "asc" } }, block: true },
    });
    const blockSlotMap = new Map(blockSlots.map((bs) => [bs.id, bs]));

    const allTeacherIds = [...new Set(blockSlots.flatMap((bs) => bs.subjects.map((s) => s.teacherId).filter((x): x is string => Boolean(x))))];
    const allVenueIds = [...new Set(blockSlots.flatMap((bs) => bs.subjects.flatMap((s) => [s.venueId, s.resolvedVenueId]).filter((x): x is string => Boolean(x))))];
    const allSubjectIds = [...new Set(blockSlots.flatMap((bs) => bs.subjects.map((s) => s.subjectId)))];

    const [teachers, venues, subjects] = await Promise.all([
      allTeacherIds.length ? tdb.user.findMany({ where: { id: { in: allTeacherIds } }, select: { id: true, fullName: true, timetableShortCode: true } }) : Promise.resolve([]),
      allVenueIds.length ? tdb.venue.findMany({ where: { id: { in: allVenueIds } } }) : Promise.resolve([]),
      allSubjectIds.length ? tdb.subject.findMany({ where: { id: { in: allSubjectIds } } }) : Promise.resolve([]),
    ]);
    const teacherNameMap = new Map(teachers.map((t) => [t.id, t.fullName]));
    const venueMap = new Map(venues.map((v) => [v.id, v.shortCode || v.name]));
    const subjectMap = new Map(subjects.map((s) => [s.id, s]));

    const DAY_NAMES = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    const byClass = new Map<string, { classId: string; className: string; rows: any[] }>();
    for (const s of slots) {
      const bs = s.electiveBlockSlotId ? blockSlotMap.get(s.electiveBlockSlotId) : null;
      if (!bs) continue;
      const cls = classMap.get(s.classId);
      if (!cls) continue;
      const className = [cls.level, cls.stream].filter(Boolean).join(" ");
      const entry = byClass.get(s.classId) ?? { classId: s.classId, className, rows: [] };
      entry.rows.push({
        classId: s.classId,
        className,
        day: DAY_NAMES[s.dayOfWeek] ?? String(s.dayOfWeek),
        period: s.period,
        blockName: bs.block.name,
        slotLabel: bs.label,
        subjects: bs.subjects.map((sub) => ({
          subjectName: subjectMap.get(sub.subjectId)?.name ?? "?",
          subjectCode: subjectMap.get(sub.subjectId)?.code ?? null,
          teacherName: sub.teacherId ? teacherNameMap.get(sub.teacherId) ?? null : null,
          teacherShortCode: sub.teacherId ? (teachers.find((t) => t.id === sub.teacherId)?.timetableShortCode ?? null) : null,
          // An explicit school pin always wins; otherwise show the
          // solver's own real auto-picked overflow venue (BB.1), if any;
          // null when neither is set — this subject genuinely runs in the
          // class's own home classroom (the print renderer displays this
          // real null case with its own honest "Own home classroom" label,
          // rather than baking display text into the data layer).
          venue: (sub.venueId ? venueMap.get(sub.venueId) : null) ?? (sub.resolvedVenueId ? venueMap.get(sub.resolvedVenueId) : null) ?? null,
        })),
      });
      byClass.set(s.classId, entry);
    }

    const result = [...byClass.values()]
      .map((c) => ({ ...c, rows: c.rows.sort((a, b) => (a.day === b.day ? a.period - b.period : DAY_NAMES.indexOf(a.day) - DAY_NAMES.indexOf(b.day))) }))
      .sort((a, b) => a.className.localeCompare(b.className));

    return { level: level ?? null, classes: result };
  });
}

export async function getSubjectCombinationRosterPrint(user: SessionUser, level: string) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const { groupStudentsBySubjectCombination, classLabel: l7ClassLabel } = await import("@/lib/services/l7-auto-grouping.service");

    const classes = await tdb.schoolClass.findMany({ where: { level, archived: false }, orderBy: [{ stream: "asc" }] });
    if (classes.length === 0) return { level, groups: [] as any[] };
    const classMap = new Map(classes.map((c) => [c.id, c]));

    const students = await tdb.student.findMany({
      where: { classId: { in: classes.map((c) => c.id) }, status: "ACTIVE" },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      select: { id: true, firstName: true, lastName: true, admissionNo: true, classId: true },
    });
    if (students.length === 0) return { level, groups: [] as any[] };

    const selections = await tdb.studentSubjectSelection.findMany({
      where: { isConfirmed: true, studentId: { in: students.map((s) => s.id) } },
      select: { studentId: true, selectedSubjectIds: true },
    });
    const selectionMap = new Map(selections.map((s) => [s.studentId, safeParse<string[]>(s.selectedSubjectIds, [])]));
    if (selections.length === 0) return { level, groups: [] as any[] };

    // Real, exact same grouping key shape L.7's own
    // groupStudentsBySubjectCombination() uses internally (sorted subject id
    // set) — recomputed here (rather than reusing that function's own
    // classId assignments) since this print exists to show the real
    // COMBINATION groups themselves, independent of which physical class a
    // student was ultimately placed into.
    const allSubjectIds = [...new Set([...selectionMap.values()].flat())];
    const subjects = allSubjectIds.length ? await tdb.subject.findMany({ where: { id: { in: allSubjectIds } }, select: { id: true, name: true } }) : [];
    const subjectNameMap = new Map(subjects.map((s) => [s.id, s.name]));

    const bySubjectSet = new Map<string, { key: string; subjectIds: string[]; students: typeof students }>();
    for (const student of students) {
      const selected = selectionMap.get(student.id);
      if (!selected || selected.length === 0) continue; // no confirmed choice yet — not part of any real generated combination
      const sortedIds = [...selected].sort();
      const key = sortedIds.join("|");
      const entry = bySubjectSet.get(key) ?? { key, subjectIds: sortedIds, students: [] as typeof students };
      entry.students.push(student);
      bySubjectSet.set(key, entry);
    }

    const groups = [...bySubjectSet.values()]
      .sort((a, b) => b.students.length - a.students.length)
      .map((g) => ({
        subjectNames: g.subjectIds.length > 0 ? g.subjectIds.map((id) => subjectNameMap.get(id) ?? "?") : ["No confirmed subject choice yet"],
        studentCount: g.students.length,
        students: g.students.map((s) => ({
          name: `${s.firstName} ${s.lastName}`,
          admissionNo: s.admissionNo,
          currentClass: s.classId ? l7ClassLabel(classMap.get(s.classId) ?? { level, stream: null }) : level,
        })),
      }));

    return { level, groups };
  });
}
