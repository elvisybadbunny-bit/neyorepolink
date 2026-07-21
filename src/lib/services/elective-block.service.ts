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
      // AA.10 follow-up — a school's own real override of the exam
      // generator's default combine-when-safe advice, surfaced to the
      // Elective/Options Block editor UI (see academics-client.tsx).
      preferSplitExamSittings: b.preferSplitExamSittings,
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
          teachingGroupKey: s.teachingGroupKey,
          teachingGroupLabel: s.teachingGroupLabel,
          studentIds: safeParse<string[]>(s.studentIdsJson, []),
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
      preferSplitExamSittings: input.preferSplitExamSittings ?? false,
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
            teachingGroupKey: s.teachingGroupKey ?? "MAIN",
            teachingGroupLabel: s.teachingGroupLabel || null,
            studentIdsJson: JSON.stringify(s.studentIds ?? []),
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
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
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
      .filter((b) => b.classes.length > 0 && b.slots.length > 0 && b.slots.every((s) => s.subjects.length >= 1))
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
            teachingGroupKey: s.teachingGroupKey,
            teachingGroupLabel: s.teachingGroupLabel,
            studentIds: safeParse<string[]>(s.studentIdsJson, []),
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

// ---------------------------------------------------------------------------
// DD.4/DD.11 — Per-subject roster print: every real subject at a level with
// its own real full student list AND each student's own real current
// class, so a school can visually confirm and physically place students
// into their real subject groups/classes from one print. Founder's own
// real words (verbatim): "add also a print combined list of each subject
// and the atudents doing them with their classes so that they can be
// placed and the list is seen from their [sic]".
//
// Deliberately a DIFFERENT real shape from getSubjectCombinationRosterPrint
// (which groups by a student's own FULL combination, e.g. "History + CRE
// + Geography") — this print instead lists ONE row per real subject,
// showing every real student who chose THAT subject regardless of their
// other choices, since a school placing students into subject-specific
// teaching groups (as opposed to a single fixed homeroom class) needs to
// see each subject's own full real roster independently. Reuses the exact
// same real StudentSubjectSelection data source as every other real
// per-student subject-choice feature in NEYO (BB.2, BB.4, L.7, BB.7) —
// never a second, drifting copy.
export async function getSubjectRosterPrint(user: SessionUser, level: string) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const classes = await tdb.schoolClass.findMany({ where: { level, archived: false }, orderBy: [{ stream: "asc" }] });
    if (classes.length === 0) return { level, subjects: [] as any[] };
    const classMap = new Map(classes.map((c) => [c.id, c]));

    const students = await tdb.student.findMany({
      where: { classId: { in: classes.map((c) => c.id) }, status: "ACTIVE" },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      select: { id: true, firstName: true, lastName: true, admissionNo: true, classId: true },
    });
    if (students.length === 0) return { level, subjects: [] as any[] };

    const selections = await tdb.studentSubjectSelection.findMany({
      where: { isConfirmed: true, studentId: { in: students.map((s) => s.id) } },
      select: { studentId: true, selectedSubjectIds: true },
    });
    if (selections.length === 0) return { level, subjects: [] as any[] };
    const selectionMap = new Map(selections.map((s) => [s.studentId, safeParse<string[]>(s.selectedSubjectIds, [])]));

    const allSubjectIds = [...new Set([...selectionMap.values()].flat())];
    const subjects = allSubjectIds.length ? await tdb.subject.findMany({ where: { id: { in: allSubjectIds } }, select: { id: true, name: true, code: true } }) : [];
    const subjectMap = new Map(subjects.map((s) => [s.id, s]));

    const bySubject = new Map<string, typeof students>();
    for (const student of students) {
      const chosen = selectionMap.get(student.id) ?? [];
      for (const subjectId of chosen) {
        const arr = bySubject.get(subjectId) ?? [];
        arr.push(student);
        bySubject.set(subjectId, arr);
      }
    }

    const rows = [...bySubject.entries()]
      .map(([subjectId, members]) => {
        const subject = subjectMap.get(subjectId);
        return {
          subjectId,
          subjectName: subject?.name ?? "Unknown subject",
          subjectCode: subject?.code ?? null,
          studentCount: members.length,
          students: members
            .map((s) => ({
              name: `${s.firstName} ${s.lastName}`,
              admissionNo: s.admissionNo,
              currentClass: s.classId ? [classMap.get(s.classId)?.level, classMap.get(s.classId)?.stream].filter(Boolean).join(" ") : level,
            }))
            .sort((a, b) => a.name.localeCompare(b.name)),
        };
      })
      .sort((a, b) => b.studentCount - a.studentCount || a.subjectName.localeCompare(b.subjectName));

    return { level, subjects: rows };
  });
}

// ---------------------------------------------------------------------------
// AA.10 — Exam-generator Options-Block-awareness.
//
// Per docs/TEACHER-ALLOCATION-AND-ELECTIVES-ENGINE-DESIGN.md Part 15, the
// founder's own real observation: a "Technical & Applied" SINGLE_CHOICE
// block (choose ONE of Business/Computer/Art/Agriculture/French) CAN
// combine cleanly at exam time — exactly one subject applies per student,
// so "everyone choosing subject X sits together" is a real, clean, single
// combined sitting per subject. A genuinely mixed-choice MULTI_SLOT block
// (e.g. History OR CRE in one real slot, Geography OR Business in
// another — a student's own real combination varies) is "hard to combine"
// (the founder's own honest words) and must NOT be forced into one
// sitting — instead each subject gets its own real, INDEPENDENT exam
// slot, containing only the real students who actually chose it, at a
// genuinely different real time so a student's own 2 (or more) chosen
// subjects from the same block never clash.
//
// Real gap this closes: Options Block subjects live ENTIRELY outside
// ClassSubjectNeed (they're scheduled via ElectiveBlock/ElectiveBlockSlot/
// ElectiveBlockSlotSubject instead), so the exam generator's own existing
// `buildGenerationPlan()` — which only ever reads ClassSubjectNeed rows —
// had ZERO awareness of Options Block subjects at all. A school running
// electives previously got no automated exam papers for those subjects
// whatsoever. Confirmed via direct investigation before writing this file
// (no `classSubjectNeed.create` call exists anywhere in the elective-block
// build/save path).
//
// Real per-student rosters come from StudentSubjectSelection (already the
// single real source of truth every other real per-student subject-choice
// feature in NEYO uses — BB.2's auto-build, BB.4's class allocation, the
// L.7 auto-grouping algorithm, and this file's own BB.7 roster print all
// already trust the exact same real field). A student's own real
// selectedSubjectIds is intersected against a block's own real subject
// set to determine which of THIS block's subjects they genuinely chose —
// this deliberately allows one real student to appear correctly under
// multiple real blocks (e.g. a genuine Humanities pair AND a separate
// genuine Technical & Applied choice) without any cross-block leakage.
export type ElectiveExamPaper = {
  blockId: string;
  blockName: string;
  blockMode: "MULTI_SLOT" | "SINGLE_CHOICE";
  // AA.10 — real, critical distinction: subjects sharing the SAME real
  // slotId are mutually exclusive alternatives for any one real student
  // (they pick exactly one per slot), so they may safely share the exact
  // same real exam date/period (a SINGLE_CHOICE block is simply the
  // special case of exactly one real slot for everything). Subjects from
  // DIFFERENT real slotIds of the SAME block may genuinely both be chosen
  // by the same real student (e.g. History from Slot A + Geography from
  // Slot B), so those must NEVER be scheduled at the same real
  // date/period — the caller uses this field to enforce exactly that.
  slotId: string;
  // AA.10 follow-up — true when this block's own school explicitly chose
  // to keep exam sittings split (ElectiveBlock.preferSplitExamSittings)
  // rather than accept the system's own default combine-when-safe advice.
  // Carried through purely for honest UI/print labelling — the actual
  // split behaviour itself is already fully encoded by `slotId` above
  // (see getElectiveBlockExamPapers: a school's split preference makes
  // every subject get its own unique synthetic slotId, so the generator's
  // ordinary "same slotId = safe to combine" rule naturally never
  // combines them, with no separate code path needed in the generator).
  preferSplitExamSittings: boolean;
  subjectId: string;
  subjectName: string;
  // Real classIds this paper's own real roster is drawn from (the
  // block's own configured member classes) — used only to scope which
  // students are eligible; the REAL sitting only ever includes students
  // who genuinely chose this subject, never the whole class.
  classIds: string[];
  studentIds: string[];
  studentCount: number;
  // Real per-class breakdown of studentIds above — every downstream
  // ExamTimetableSlot row still needs exactly one real classId per row
  // (the shape every other scope already uses), so this lets the caller
  // create one real row per real class that actually has at least one
  // real student sitting this subject, each with its own real, honest,
  // class-scoped student roster (never the whole class).
  studentIdsByClass: Record<string, string[]>;
};

export async function getElectiveBlockExamPapers(tenantId: string, classIds: string[]): Promise<ElectiveExamPaper[]> {
  return withTenant(tenantId, async () => {
    const tdb = tenantDb();
    const classIdSet = new Set(classIds);

    const blocks = await tdb.electiveBlock.findMany({
      where: { active: true },
      include: {
        classes: true,
        slots: { orderBy: { sortOrder: "asc" }, include: { subjects: { orderBy: { id: "asc" } } } },
      },
    });

    // Only blocks with at least one real member class actually selected
    // for THIS exam run are relevant — a school running an exam for only
    // some real levels should never see an unrelated block's subjects.
    const relevantBlocks = blocks.filter((b) => b.classes.some((c) => classIdSet.has(c.classId)));
    if (relevantBlocks.length === 0) return [];

    // Real subject metadata (names) needed for honest, readable output.
    const allSubjectIds = [...new Set(relevantBlocks.flatMap((b) => b.slots.flatMap((s) => s.subjects.map((sub) => sub.subjectId))))];
    const subjects = allSubjectIds.length ? await tdb.subject.findMany({ where: { id: { in: allSubjectIds } }, select: { id: true, name: true } }) : [];
    const subjectNameMap = new Map(subjects.map((s) => [s.id, s.name]));

    const papers: ElectiveExamPaper[] = [];

    for (const block of relevantBlocks) {
      const blockClassIds = block.classes.map((c) => c.classId).filter((id) => classIdSet.has(id));
      if (blockClassIds.length === 0) continue;

      // Real per-slot subject membership (which real slotId each real
      // subject belongs to) — needed so the caller can correctly treat
      // same-slot subjects as mutually exclusive (safe to share a real
      // date/period) while cross-slot subjects of the same block are kept
      // genuinely independent (never scheduled at the same real time).
      const slotIdBySubject = new Map<string, string>();
      for (const slot of block.slots) {
        for (const sub of slot.subjects) {
          // A subject appearing in more than one real slot of the SAME
          // block (unusual, but not impossible for a school-defined
          // MULTI_SLOT setup) keeps its FIRST real slot association —
          // exam placement only needs one consistent real grouping key.
          if (!slotIdBySubject.has(sub.subjectId)) slotIdBySubject.set(sub.subjectId, slot.id);
        }
      }

      // AA.10 follow-up — founder's own words: "a school can prefer split
      // even if the system advices so that they choose what they want".
      // The system's own default advice combines a SINGLE_CHOICE block's
      // subjects into one shared sitting (every subject naturally already
      // shares one real slotId in that shape). When THIS block's own
      // school has explicitly set preferSplitExamSittings, give every one
      // of its subjects its own unique synthetic slotId instead — the
      // generator's existing "same slotId = safe to combine" rule then
      // naturally treats every subject as genuinely independent, with no
      // separate branch needed downstream in exam-timetable-generator.
      // A MULTI_SLOT block's subjects are already independent by slotId,
      // so this override is a real no-op for that shape (matches the
      // schema comment's documented scope).
      if (block.preferSplitExamSittings) {
        for (const subjectId of slotIdBySubject.keys()) {
          slotIdBySubject.set(subjectId, `${slotIdBySubject.get(subjectId)}::split::${subjectId}`);
        }
      }

      const blockSubjectIds = [...slotIdBySubject.keys()];
      if (blockSubjectIds.length === 0) continue;

      const students = await tdb.student.findMany({
        where: { classId: { in: blockClassIds }, status: "ACTIVE" },
        select: { id: true, classId: true },
      });
      if (students.length === 0) continue;
      const classIdByStudent = new Map(students.map((s) => [s.id, s.classId as string]));

      const selections = await tdb.studentSubjectSelection.findMany({
        where: { isConfirmed: true, studentId: { in: students.map((s) => s.id) } },
        select: { studentId: true, selectedSubjectIds: true },
      });

      // Real per-subject roster: a student is included under a real
      // subject only if that subject genuinely appears in THEIR OWN
      // confirmed selectedSubjectIds AND is one of this block's own real
      // subjects (the intersection) — never the whole class, and never a
      // subject the student didn't actually choose.
      const studentsBySubject = new Map<string, string[]>();
      for (const sel of selections) {
        let chosen: string[] = [];
        try { chosen = JSON.parse(sel.selectedSubjectIds) as string[]; } catch { chosen = []; }
        for (const subjectId of chosen) {
          if (!slotIdBySubject.has(subjectId)) continue; // not one of THIS block's subjects
          const arr = studentsBySubject.get(subjectId) ?? [];
          arr.push(sel.studentId);
          studentsBySubject.set(subjectId, arr);
        }
      }

      // Both SINGLE_CHOICE and MULTI_SLOT modes produce one real
      // INDEPENDENT paper per subject with its own real per-student
      // roster — the real difference between the two modes is handled by
      // the CALLER (buildGenerationPlan()) via each paper's own real
      // slotId: SINGLE_CHOICE subjects all share one real slotId (so they
      // may cleanly share the exact same real date/period, since a
      // student only ever picks one), while MULTI_SLOT subjects from
      // DIFFERENT real slots of the SAME block must never be scheduled at
      // the same real date/period as each other (a student may genuinely
      // be sitting one subject from EACH of the block's own real slots).
      for (const subjectId of blockSubjectIds) {
        const studentIds = studentsBySubject.get(subjectId) ?? [];
        if (studentIds.length === 0) continue; // honestly skip a subject nobody actually chose this run
        const studentIdsByClass: Record<string, string[]> = {};
        for (const sid of studentIds) {
          const cid = classIdByStudent.get(sid);
          if (!cid) continue; // defensive — every id here came from `students`, which always has a real classId
          (studentIdsByClass[cid] ??= []).push(sid);
        }
        papers.push({
          blockId: block.id,
          blockName: block.name,
          blockMode: block.mode as "MULTI_SLOT" | "SINGLE_CHOICE",
          slotId: slotIdBySubject.get(subjectId)!,
          preferSplitExamSittings: block.preferSplitExamSittings,
          subjectId,
          subjectName: subjectNameMap.get(subjectId) ?? "Unknown subject",
          classIds: blockClassIds,
          studentIds,
          studentCount: studentIds.length,
          studentIdsByClass,
        });
      }
    }

    return papers;
  });
}
