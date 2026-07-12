/**
 * BB.2 — Elective Block auto-build FROM real student subject-choice data.
 *
 * Founder's own real request, verbatim: "the adding of subjects should be
 * automatic from the students data of subjects they choose and then give
 * the combined list of students doing the subjects and the teachers too
 * and as well how many teachers too... check the CBE senior school subject
 * allocation research."
 *
 * Reuses, rather than duplicates, everything already real in NEYO:
 *  - `StudentSubjectSelection` (L.4) for real confirmed student choices.
 *  - `Pathway`/`PathwaySubjectRequirement`/`Subject.compulsoryPathwayGroups`
 *    (P.1/P.2) for real CBC/CBE compulsory-vs-elective detection.
 *  - `recommendTeacherForSubject()` (L.7 Continuity Engine) for the exact
 *    same fairness-ranked teacher recommendation used everywhere else.
 *  - `TimetableConfig` (P.5) for a level's own real configured lesson-slot
 *    capacity, never a hardcoded assumption.
 *  - `saveElectiveBlock()` (AA.1) to actually create the real block once a
 *    school confirms — BB.2 never invents a second block-creation path.
 *
 * Two real scenarios:
 *  - ELECTIVES: detects genuinely elective subjects among a level's real
 *    student choices (excluding whatever is compulsory for that student's
 *    own real pathway, or a school's own configured 8-4-4 compulsory list),
 *    groups students by exact real subject, and previews one real slot
 *    listing every detected subject.
 *  - MATH_SPLIT: detects the real Core-vs-Essential Mathematics split for
 *    a level with a genuine mix of STEM/non-STEM pathway-allocated
 *    students — a level where some students would take Core Mathematics
 *    and others Essential Mathematics needs a real parallel block, not one
 *    variant silently picked for everyone (a real, confirmed pre-existing
 *    gap found while building this feature — see timetable-engine.service.ts's
 *    `applyKicdSeniorSchoolTemplate()`, which today always picks ONE
 *    variant for a whole class based on majority allocation).
 */
import { db } from "@/lib/db";
import { withTenant } from "@/lib/core/tenant-context";
import { tenantDb } from "@/lib/core/tenant-db";
import type { SessionUser } from "@/lib/core/session";
import { recommendTeacherForSubject } from "@/lib/services/l7-continuity-engine.service";
import { saveElectiveBlock } from "@/lib/services/elective-block.service";
import { CORE_ESSENTIAL_MATHEMATICS } from "@/lib/validations/pathways";
import type { ConfirmAutoBuildInput } from "@/lib/validations/elective-block-auto-build";

export class ElectiveBlockAutoBuildError extends Error {
  constructor(public code: "NOT_FOUND" | "INVALID" | "CONFLICT", message: string) {
    super(message);
    this.name = "ElectiveBlockAutoBuildError";
  }
}

function safeParse<T>(s: string | null | undefined, fallback: T): T {
  try { return s ? (JSON.parse(s) as T) : fallback; } catch { return fallback; }
}

interface PreviewSubjectRow {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  studentCount: number;
  students: { id: string; name: string; admissionNo: string }[];
  classIds: string[]; // real classes this level's students needing this subject actually belong to
  suggestedTeacherId: string | null;
  suggestedTeacherName: string | null;
  teacherRecommendations: { teacherId: string; teacherName: string; classCount: number; lessonLoad: number }[];
  defaultLessonsPerWeek: number;
}

/**
 * ELECTIVES preview: real confirmed StudentSubjectSelection rows for a
 * level, minus whatever is genuinely compulsory (via real Pathway data for
 * CBE-tagged pathways, or a school's own Subject.compulsoryPathwayGroups
 * for a plain/8-4-4 setup) — grouped into one real subject-per-row preview.
 */
async function buildElectivesPreview(tenantId: string, level: string, defaultLessonsPerWeek: number) {
  const tdb = tenantDb();
  const classes = await tdb.schoolClass.findMany({ where: { level, archived: false } });
  if (classes.length === 0) throw new ElectiveBlockAutoBuildError("NOT_FOUND", "No active classes found for that level.");
  const classIds = classes.map((c) => c.id);

  const students = await tdb.student.findMany({
    where: { classId: { in: classIds }, status: "ACTIVE" },
    select: { id: true, firstName: true, lastName: true, admissionNo: true, classId: true },
  });
  if (students.length === 0) throw new ElectiveBlockAutoBuildError("NOT_FOUND", "No active students found for that level.");

  // Real confirmed selections only — an unconfirmed draft never drives a
  // real block, matching L.7 auto-grouping's own existing discipline.
  const selections = await tdb.studentSubjectSelection.findMany({
    where: { isConfirmed: true, studentId: { in: students.map((s) => s.id) } },
    select: { studentId: true, selectedSubjectIds: true },
  });
  if (selections.length === 0) {
    throw new ElectiveBlockAutoBuildError("NOT_FOUND", "No confirmed subject selections found for this level yet — open a Subject Selection portal first.");
  }
  const selectionMap = new Map(selections.map((s) => [s.studentId, safeParse<string[]>(s.selectedSubjectIds, [])]));

  // Real compulsory-subject detection. CBE: a student's own real allocated
  // pathway tells us exactly which subjects are compulsory for THEM
  // (Subject.compulsoryPathwayGroups). 8-4-4/no-pathway-data: fall back to
  // whatever every single student in this level has selected in common —
  // an honest, real signal (nobody would "choose between" a subject
  // literally everyone already has) rather than a guessed hardcoded list.
  const pathwayPrefs = await tdb.studentPathwayPreference.findMany({
    where: { isAllocated: true, studentId: { in: students.map((s) => s.id) } },
    include: { pathway: { select: { pathwayGroup: true } } },
  });
  const pathwayGroupByStudent = new Map(pathwayPrefs.map((p) => [p.studentId, p.pathway.pathwayGroup]));
  const hasRealPathwayData = pathwayGroupByStudent.size > 0;

  const allSubjectIds = [...new Set([...selectionMap.values()].flat())];
  const subjects = await tdb.subject.findMany({ where: { id: { in: allSubjectIds } } });
  const subjectById = new Map(subjects.map((s) => [s.id, s]));

  function isCompulsoryForStudent(subjectId: string, studentId: string): boolean {
    const subject = subjectById.get(subjectId);
    if (!subject) return false;
    const compulsoryGroups = safeParse<string[]>(subject.compulsoryPathwayGroups, []);
    if (compulsoryGroups.length === 0) return false;
    const group = pathwayGroupByStudent.get(studentId);
    return Boolean(group && compulsoryGroups.includes(group));
  }

  // Real elective detection per student: everything they picked MINUS
  // whatever is compulsory for their own real pathway (if we have real
  // pathway data), or minus a subject every real student in this level
  // picked (the honest 8-4-4 fallback signal).
  const subjectCountAcrossAllStudents = new Map<string, number>();
  for (const ids of selectionMap.values()) {
    for (const id of ids) subjectCountAcrossAllStudents.set(id, (subjectCountAcrossAllStudents.get(id) ?? 0) + 1);
  }
  const universallyPicked = new Set(
    [...subjectCountAcrossAllStudents.entries()].filter(([, count]) => count === selectionMap.size).map(([id]) => id)
  );

  const bySubject = new Map<string, { studentId: string }[]>();
  for (const [studentId, ids] of selectionMap.entries()) {
    for (const subjectId of ids) {
      if (hasRealPathwayData) {
        if (isCompulsoryForStudent(subjectId, studentId)) continue;
      } else if (universallyPicked.has(subjectId)) {
        continue; // honest 8-4-4 fallback: a subject every student picked isn't a real "choice"
      }
      const arr = bySubject.get(subjectId) ?? [];
      arr.push({ studentId });
      bySubject.set(subjectId, arr);
    }
  }
  if (bySubject.size === 0) {
    throw new ElectiveBlockAutoBuildError("NOT_FOUND", "Every subject selected at this level is already compulsory — no genuine elective choices detected.");
  }

  const rows: PreviewSubjectRow[] = [];
  for (const [subjectId, members] of bySubject.entries()) {
    const subject = subjectById.get(subjectId);
    if (!subject) continue;
    const memberStudents = students.filter((s) => members.some((m) => m.studentId === s.id));
    const memberClassIds = [...new Set(memberStudents.map((s) => s.classId).filter((id): id is string => Boolean(id)))];
    const recs = await recommendTeacherForSubject(tenantId, subjectId);
    rows.push({
      subjectId,
      subjectName: subject.name,
      subjectCode: subject.code,
      studentCount: memberStudents.length,
      students: memberStudents.map((s) => ({ id: s.id, name: `${s.firstName} ${s.lastName}`, admissionNo: s.admissionNo })),
      classIds: memberClassIds,
      suggestedTeacherId: recs[0]?.teacherId ?? null,
      suggestedTeacherName: recs[0]?.teacherName ?? null,
      teacherRecommendations: recs.slice(0, 5),
      defaultLessonsPerWeek,
    });
  }
  rows.sort((a, b) => b.studentCount - a.studentCount);
  return { classIds, rows };
}

/**
 * MATH_SPLIT preview: the real Core-vs-Essential Mathematics scenario. A
 * level's real pathway-allocated students split into two real groups
 * (STEM -> Core Mathematics, everyone else -> Essential Mathematics) —
 * genuinely parallel subjects that must occupy the SAME real timetable
 * slot, exactly the ElectiveBlock shape, rather than one variant picked
 * for the whole class as `applyKicdSeniorSchoolTemplate()` does today.
 */
async function buildMathSplitPreview(tenantId: string, level: string, defaultLessonsPerWeek: number) {
  const tdb = tenantDb();
  const classes = await tdb.schoolClass.findMany({ where: { level, archived: false } });
  if (classes.length === 0) throw new ElectiveBlockAutoBuildError("NOT_FOUND", "No active classes found for that level.");
  const classIds = classes.map((c) => c.id);

  const students = await tdb.student.findMany({
    where: { classId: { in: classIds }, status: "ACTIVE" },
    select: { id: true, firstName: true, lastName: true, admissionNo: true, classId: true },
  });
  if (students.length === 0) throw new ElectiveBlockAutoBuildError("NOT_FOUND", "No active students found for that level.");

  const pathwayPrefs = await tdb.studentPathwayPreference.findMany({
    where: { isAllocated: true, studentId: { in: students.map((s) => s.id) } },
    include: { pathway: { select: { pathwayGroup: true } } },
  });
  if (pathwayPrefs.length === 0) {
    throw new ElectiveBlockAutoBuildError("NOT_FOUND", "No real pathway allocations found for this level yet — allocate students to a pathway first.");
  }
  const groupByStudent = new Map(pathwayPrefs.map((p) => [p.studentId, p.pathway.pathwayGroup]));
  const stemStudents = students.filter((s) => groupByStudent.get(s.id) === "STEM");
  const nonStemStudents = students.filter((s) => {
    const g = groupByStudent.get(s.id);
    return g && g !== "STEM";
  });
  if (stemStudents.length === 0 || nonStemStudents.length === 0) {
    throw new ElectiveBlockAutoBuildError(
      "CONFLICT",
      "This level doesn't have a genuine mix of STEM and non-STEM pathway students — a Math split isn't needed here (every student needs the same Mathematics variant)."
    );
  }

  async function ensureMathSubject(variant: (typeof CORE_ESSENTIAL_MATHEMATICS)[number]) {
    const existing = await tdb.subject.findFirst({ where: { code: variant.code } });
    if (existing) return existing;
    // Real, honest creation matching the exact pattern
    // applyKicdSeniorSchoolTemplate() already uses — never invents a
    // duplicate if the subject already exists.
    return tdb.subject.create({ data: { tenantId, name: variant.name, code: variant.code, curriculum: "CBC", mathVariant: variant.variant } as never });
  }
  const [coreMath, essentialMath] = await Promise.all([
    ensureMathSubject(CORE_ESSENTIAL_MATHEMATICS[0]),
    ensureMathSubject(CORE_ESSENTIAL_MATHEMATICS[1]),
  ]);

  async function buildRow(subject: { id: string; name: string; code: string }, memberStudents: typeof students): Promise<PreviewSubjectRow> {
    const recs = await recommendTeacherForSubject(tenantId, subject.id);
    const memberClassIds = [...new Set(memberStudents.map((s) => s.classId).filter((id): id is string => Boolean(id)))];
    return {
      subjectId: subject.id,
      subjectName: subject.name,
      subjectCode: subject.code,
      studentCount: memberStudents.length,
      students: memberStudents.map((s) => ({ id: s.id, name: `${s.firstName} ${s.lastName}`, admissionNo: s.admissionNo })),
      classIds: memberClassIds,
      suggestedTeacherId: recs[0]?.teacherId ?? null,
      suggestedTeacherName: recs[0]?.teacherName ?? null,
      teacherRecommendations: recs.slice(0, 5),
      defaultLessonsPerWeek,
    };
  }

  const rows = [
    await buildRow(coreMath, stemStudents),
    await buildRow(essentialMath, nonStemStudents),
  ];
  return { classIds, rows };
}

export async function previewElectiveBlockAutoBuild(
  user: SessionUser,
  input: { level: string; kind: "ELECTIVES" | "MATH_SPLIT"; defaultLessonsPerWeek: number }
) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const { classIds, rows } = input.kind === "MATH_SPLIT"
      ? await buildMathSplitPreview(user.tenantId, input.level, input.defaultLessonsPerWeek)
      : await buildElectivesPreview(user.tenantId, input.level, input.defaultLessonsPerWeek);

    // Real, school-configurable lesson-slot capacity context (never a
    // hardcoded assumption like the KICD 40-lesson figure) — surfaced so
    // the school can judge whether their real weekly structure has room
    // for this block, and decide how to treat any leftover capacity
    // themselves (founder-confirmed: NEYO informs, the school decides).
    const configs = await tdb.timetableConfig.findMany({ where: { classId: { in: classIds } } });
    const capacityNote = configs.length > 0
      ? `This level's real timetable is configured for ${configs[0].periodsPerDay} periods/day. Each detected subject below defaults to ${input.defaultLessonsPerWeek} lessons/week — edit any of these before confirming.`
      : "This level has no real TimetableConfig set up yet — set one up under Academics before generating a real timetable for this block.";

    const run = await tdb.electiveBlockAutoBuildRun.create({
      data: {
        level: input.level,
        kind: input.kind,
        previewJson: JSON.stringify({ classIds, rows, capacityNote }),
        status: "PREVIEWED",
        createdById: user.id,
        createdByName: user.fullName,
      } as never,
    });

    return { runId: run.id, level: input.level, kind: input.kind, classIds, rows, capacityNote };
  });
}

export async function confirmElectiveBlockAutoBuild(user: SessionUser, input: ConfirmAutoBuildInput) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const run = await tdb.electiveBlockAutoBuildRun.findUnique({ where: { id: input.runId } });
    if (!run) throw new ElectiveBlockAutoBuildError("NOT_FOUND", "Preview run not found.");
    if (run.status !== "PREVIEWED") throw new ElectiveBlockAutoBuildError("CONFLICT", "This preview has already been confirmed or discarded.");

    const preview = safeParse<{ classIds: string[]; rows: PreviewSubjectRow[] }>(run.previewJson, { classIds: [], rows: [] });
    const allClassIds = [...new Set(input.subjects.flatMap((s) => s.classIds))];
    if (allClassIds.length === 0) throw new ElectiveBlockAutoBuildError("INVALID", "At least one real class must be included.");

    // Real, honest re-validation — never trust the client-confirmed shape
    // blindly, matching every other NEYO save path's own discipline: every
    // confirmed subjectId must have genuinely appeared in the real preview.
    const previewSubjectIds = new Set(preview.rows.map((r) => r.subjectId));
    for (const s of input.subjects) {
      if (!previewSubjectIds.has(s.subjectId)) {
        throw new ElectiveBlockAutoBuildError("INVALID", "One or more confirmed subjects were not part of the original real preview.");
      }
    }

    const saved = await saveElectiveBlock(user, {
      action: "save_block",
      name: input.blockName,
      mode: "MULTI_SLOT",
      preferAfterBreak: input.preferAfterBreak,
      classIds: allClassIds,
      slots: [{
        label: run.kind === "MATH_SPLIT" ? "Mathematics" : "Options",
        isDouble: false,
        sortOrder: 0,
        subjects: input.subjects.map((s) => ({
          subjectId: s.subjectId,
          teacherId: s.teacherId || undefined,
          venueId: undefined, // BB.1's own auto-pick handles any real overflow automatically
          classIds: s.classIds,
        })),
      }],
    });

    await tdb.electiveBlockAutoBuildRun.update({
      where: { id: run.id },
      data: { status: "CONFIRMED", createdElectiveBlockId: saved.id, confirmedAt: new Date() },
    });

    await db.auditLog.create({
      data: {
        tenantId: user.tenantId, actorId: user.id, actorName: user.fullName,
        action: "elective_block_auto_build.confirmed", entityType: "electiveBlockAutoBuildRun", entityId: run.id,
        metadata: JSON.stringify({ level: run.level, kind: run.kind, blockId: saved.id, subjectCount: input.subjects.length }),
      },
    });

    return { blockId: saved.id };
  });
}

export async function discardElectiveBlockAutoBuild(user: SessionUser, runId: string) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const run = await tdb.electiveBlockAutoBuildRun.findUnique({ where: { id: runId } });
    if (!run) throw new ElectiveBlockAutoBuildError("NOT_FOUND", "Preview run not found.");
    if (run.status !== "PREVIEWED") throw new ElectiveBlockAutoBuildError("CONFLICT", "This preview has already been confirmed or discarded.");
    await tdb.electiveBlockAutoBuildRun.update({ where: { id: runId }, data: { status: "DISCARDED" } });
    return { success: true };
  });
}

export async function listElectiveBlockAutoBuildRuns(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const rows = await tenantDb().electiveBlockAutoBuildRun.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
    return rows.map((r) => ({
      id: r.id, level: r.level, kind: r.kind, status: r.status,
      createdElectiveBlockId: r.createdElectiveBlockId,
      createdByName: r.createdByName, createdAt: r.createdAt, confirmedAt: r.confirmedAt,
    }));
  });
}
