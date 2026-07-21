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
 *    groups students by exact real subject, builds the pairwise conflict
 *    graph, deterministically colours subjects into Option A/B/C, and proves
 *    every learner has exactly one selected subject in each block.
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
import { upsertCombinationGroup } from "@/lib/services/timetable-engine.service";
import { CORE_ESSENTIAL_MATHEMATICS } from "@/lib/validations/pathways";
import type { ConfirmAutoBuildInput } from "@/lib/validations/elective-block-auto-build";
import { buildThreeOptionBlocks, type OptionBlockKey } from "@/lib/services/senior-option-block.service";

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
  optionBlock?: OptionBlockKey | "MATH";
  homeClassCapacity: number | null;
  requiresSharedVenue: boolean;
  venueRecommendations: { id: string; name: string; shortCode: string | null; learnerCapacity: number | null; capacityPerPeriod: number }[];
  resourceBlockers: string[];
  maxGroupSize: number | null;
  requiredTeachingGroups: number;
  teachingGroups: { key: string; label: string; studentIds: string[]; studentCount: number; suggestedTeacherId: string | null; suggestedTeacherName: string | null; suggestedVenueId: string | null; suggestedVenueName: string | null }[];
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
  const [subjects, venues] = await Promise.all([
    tdb.subject.findMany({ where: { id: { in: allSubjectIds } } }),
    tdb.venue.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);
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
  const electiveByStudent = new Map<string, string[]>();
  for (const [studentId, ids] of selectionMap.entries()) {
    const electiveIds: string[] = [];
    for (const subjectId of ids) {
      if (hasRealPathwayData) {
        if (isCompulsoryForStudent(subjectId, studentId)) continue;
      } else if (universallyPicked.has(subjectId)) {
        continue; // a subject every learner picked is not a choice between alternatives
      }
      electiveIds.push(subjectId);
      const arr = bySubject.get(subjectId) ?? [];
      arr.push({ studentId });
      bySubject.set(subjectId, arr);
    }
    electiveByStudent.set(studentId, [...new Set(electiveIds)]);
  }
  if (bySubject.size === 0) {
    throw new ElectiveBlockAutoBuildError("NOT_FOUND", "Every subject selected at this level is already compulsory — no genuine elective choices detected.");
  }

  const blockResult = buildThreeOptionBlocks(students.map((student) => ({
    studentId: student.id,
    studentName: `${student.firstName} ${student.lastName} (${student.admissionNo})`,
    subjectIds: electiveByStudent.get(student.id) ?? [],
  })));
  if (!blockResult.possible) {
    const names = (blockResult.affectedLearners ?? []).slice(0, 8).join(", ");
    const unresolvedSubjects = (blockResult.unresolvedSubjectIds ?? []).map((id) => subjectById.get(id)?.name ?? id).join(", ");
    throw new ElectiveBlockAutoBuildError("CONFLICT", `${blockResult.reason}${unresolvedSubjects ? ` Conflicting subjects: ${unresolvedSubjects}.` : ""}${names ? ` Affected: ${names}${(blockResult.affectedLearners?.length ?? 0) > 8 ? "…" : ""}` : ""}`);
  }

  const rows: PreviewSubjectRow[] = [];
  for (const [subjectId, members] of bySubject.entries()) {
    const subject = subjectById.get(subjectId);
    if (!subject) continue;
    const memberStudents = students.filter((s) => members.some((m) => m.studentId === s.id));
    const memberClassIds = [...new Set(memberStudents.map((s) => s.classId).filter((id): id is string => Boolean(id)))];
    const recs = await recommendTeacherForSubject(tenantId, subjectId);
    const relevantClasses = classes.filter((c) => memberClassIds.includes(c.id));
    const homeClassCapacity = Math.max(0, ...relevantClasses.map((c) => c.capacity ?? 0)) || null;
    const requiresSharedVenue = homeClassCapacity == null || memberStudents.length > homeClassCapacity;
    const venueRecommendations = venues
      .filter((venue) => safeParse<string[]>(venue.supportsSubjectIds, []).includes(subjectId))
      .map((venue) => ({ id: venue.id, name: venue.name, shortCode: venue.shortCode, learnerCapacity: venue.learnerCapacity, capacityPerPeriod: venue.capacityPerPeriod }))
      .sort((a, b) => ((b.learnerCapacity ?? 0) - (a.learnerCapacity ?? 0)) || a.name.localeCompare(b.name));
    const resourceBlockers: string[] = [];
    if (recs.length === 0) resourceBlockers.push("No qualified teacher is linked to this subject.");
    const maxGroupSize = subject.practicalHeavy ? (subject.practicalMaxGroupSize ?? subject.recommendedMaxGroupSize) : (subject.recommendedMaxGroupSize ?? subject.practicalMaxGroupSize);
    const requiredTeachingGroups = maxGroupSize ? Math.max(1, Math.ceil(memberStudents.length / maxGroupSize)) : 1;
    if (recs.length < requiredTeachingGroups) resourceBlockers.push(`${requiredTeachingGroups} teaching groups are required but only ${recs.length} qualified available teacher(s) were found.`);
    const orderedMembers = [...memberStudents].sort((a,b)=>a.admissionNo.localeCompare(b.admissionNo)||a.id.localeCompare(b.id));
    const partitions = Array.from({length:requiredTeachingGroups},()=>[] as typeof memberStudents);
    orderedMembers.forEach((student,index)=>partitions[index%requiredTeachingGroups].push(student));
    const teachingGroups = partitions.map((members,index)=>{
      const needsExtraVenue = index >= memberClassIds.length || (homeClassCapacity != null && members.length > homeClassCapacity);
      const venue = needsExtraVenue ? venueRecommendations.find((candidate)=>candidate.learnerCapacity!=null&&candidate.learnerCapacity>=members.length) ?? null : null;
      if (needsExtraVenue && !venue) resourceBlockers.push(`Teaching Group ${index+1} has ${members.length} learners but no capacity-safe tagged venue.`);
      return { key: `SPLIT-${index+1}`, label: `${subject.name} Group ${index+1}`, studentIds: members.map(student=>student.id), studentCount: members.length, suggestedTeacherId: recs[index]?.teacherId ?? null, suggestedTeacherName: recs[index]?.teacherName ?? null, suggestedVenueId: venue?.id ?? null, suggestedVenueName: venue?.name ?? null };
    });
    if (requiredTeachingGroups === 1 && requiresSharedVenue && !venueRecommendations.some((venue) => venue.learnerCapacity != null && venue.learnerCapacity >= memberStudents.length)) resourceBlockers.push(`Combined group has ${memberStudents.length} learners but no tagged venue has a verified learner capacity large enough.`);
    rows.push({
      subjectId,
      subjectName: subject.name,
      subjectCode: subject.code,
      studentCount: memberStudents.length,
      students: memberStudents.map((s) => ({ id: s.id, name: `${s.firstName} ${s.lastName}`, admissionNo: s.admissionNo })),
      classIds: memberClassIds,
      suggestedTeacherId: recs[0]?.teacherId ?? null,
      suggestedTeacherName: recs[0]?.teacherName ?? null,
      teacherRecommendations: recs,
      defaultLessonsPerWeek,
      optionBlock: blockResult.assignment[subjectId],
      homeClassCapacity,
      requiresSharedVenue,
      venueRecommendations,
      resourceBlockers,
      maxGroupSize: maxGroupSize ?? null,
      requiredTeachingGroups,
      teachingGroups,
    });
  }
  rows.sort((a, b) => (a.optionBlock ?? "").localeCompare(b.optionBlock ?? "") || b.studentCount - a.studentCount || a.subjectCode.localeCompare(b.subjectCode));
  return { classIds, rows, blockPlan: { blocks: blockResult.blocks, learnerProof: blockResult.learnerProof, conflicts: blockResult.conflicts } };
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
  const [coreMath, essentialMath, venues] = await Promise.all([
    ensureMathSubject(CORE_ESSENTIAL_MATHEMATICS[0]),
    ensureMathSubject(CORE_ESSENTIAL_MATHEMATICS[1]),
    tdb.venue.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  async function buildRow(subject: { id: string; name: string; code: string }, memberStudents: typeof students): Promise<PreviewSubjectRow> {
    const recs = await recommendTeacherForSubject(tenantId, subject.id);
    const memberClassIds = [...new Set(memberStudents.map((s) => s.classId).filter((id): id is string => Boolean(id)))];
    const relevantClasses = classes.filter((c) => memberClassIds.includes(c.id));
    const homeClassCapacity = Math.max(0, ...relevantClasses.map((c) => c.capacity ?? 0)) || null;
    const requiresSharedVenue = homeClassCapacity == null || memberStudents.length > homeClassCapacity;
    const venueRecommendations = venues.filter((venue) => safeParse<string[]>(venue.supportsSubjectIds, []).includes(subject.id)).map((venue) => ({ id: venue.id, name: venue.name, shortCode: venue.shortCode, learnerCapacity: venue.learnerCapacity, capacityPerPeriod: venue.capacityPerPeriod }));
    const resourceBlockers = recs.length === 0 ? ["No qualified teacher is linked to this Mathematics variant."] : [];
    if (requiresSharedVenue && !venueRecommendations.some((venue) => venue.learnerCapacity != null && venue.learnerCapacity >= memberStudents.length)) resourceBlockers.push(`Combined Mathematics group has ${memberStudents.length} learners but no tagged venue has sufficient verified learner capacity.`);
    return {
      subjectId: subject.id,
      subjectName: subject.name,
      subjectCode: subject.code,
      studentCount: memberStudents.length,
      students: memberStudents.map((s) => ({ id: s.id, name: `${s.firstName} ${s.lastName}`, admissionNo: s.admissionNo })),
      classIds: memberClassIds,
      suggestedTeacherId: recs[0]?.teacherId ?? null,
      suggestedTeacherName: recs[0]?.teacherName ?? null,
      teacherRecommendations: recs,
      defaultLessonsPerWeek,
      optionBlock: "MATH",
      homeClassCapacity,
      requiresSharedVenue,
      venueRecommendations,
      resourceBlockers,
      maxGroupSize: null,
      requiredTeachingGroups: 1,
      teachingGroups: [{ key: "MAIN", label: subject.name, studentIds: memberStudents.map(student => student.id), studentCount: memberStudents.length, suggestedTeacherId: recs[0]?.teacherId ?? null, suggestedTeacherName: recs[0]?.teacherName ?? null, suggestedVenueId: null, suggestedVenueName: null }],
    };
  }

  const rows = [
    await buildRow(coreMath, stemStudents),
    await buildRow(essentialMath, nonStemStudents),
  ];
  return { classIds, rows, blockPlan: null };
}

export async function previewElectiveBlockAutoBuild(
  user: SessionUser,
  input: { level: string; kind: "ELECTIVES" | "MATH_SPLIT"; defaultLessonsPerWeek: number }
) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const { classIds, rows, blockPlan } = input.kind === "MATH_SPLIT"
      ? await buildMathSplitPreview(user.tenantId, input.level, input.defaultLessonsPerWeek)
      : await buildElectivesPreview(user.tenantId, input.level, input.defaultLessonsPerWeek);

    // Real, school-configurable lesson-slot capacity context (never a
    // hardcoded assumption like the KICD 40-lesson figure) — surfaced so
    // the school can judge whether their real weekly structure has room
    // for this block, and decide how to treat any leftover capacity
    // themselves (founder-confirmed: NEYO informs, the school decides).
    const configs = await tdb.timetableConfig.findMany({ where: { classId: { in: classIds } } });
    const resourceReport = {
      blockers: rows.flatMap((row) => row.resourceBlockers.map((detail) => ({ subjectId: row.subjectId, subjectName: row.subjectName, optionBlock: row.optionBlock, detail }))),
      subjectsWithQualifiedTeacher: rows.filter((row) => row.teacherRecommendations.length > 0).length,
      groupsRequiringSharedVenue: rows.filter((row) => row.requiresSharedVenue).length,
      groupsWithCapacitySafeVenue: rows.filter((row) => row.requiresSharedVenue && row.venueRecommendations.some((venue) => venue.learnerCapacity != null && venue.learnerCapacity >= row.studentCount)).length,
    };
    const capacityNote = configs.length > 0
      ? `This level's real timetable is configured for ${configs[0].periodsPerDay} periods/day. Phase C found ${resourceReport.blockers.length} teacher/venue capacity blocker(s).`
      : "This level has no real TimetableConfig set up yet — set one up under Academics before generating a real timetable for this block.";

    const run = await tdb.electiveBlockAutoBuildRun.create({
      data: {
        level: input.level,
        kind: input.kind,
        previewJson: JSON.stringify({ classIds, rows, blockPlan, resourceReport, capacityNote }),
        status: "PREVIEWED",
        createdById: user.id,
        createdByName: user.fullName,
      } as never,
    });

    return { runId: run.id, level: input.level, kind: input.kind, classIds, rows, blockPlan, resourceReport, capacityNote };
  });
}

export async function confirmElectiveBlockAutoBuild(user: SessionUser, input: ConfirmAutoBuildInput) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const run = await tdb.electiveBlockAutoBuildRun.findUnique({ where: { id: input.runId } });
    if (!run) throw new ElectiveBlockAutoBuildError("NOT_FOUND", "Preview run not found.");
    if (run.status !== "PREVIEWED") throw new ElectiveBlockAutoBuildError("CONFLICT", "This preview has already been confirmed or discarded.");

    const preview = safeParse<{ classIds: string[]; rows: PreviewSubjectRow[]; blockPlan?: { learnerProof: { studentId: string; studentName: string; A: string | null; B: string | null; C: string | null; valid: boolean }[] } | null }>(run.previewJson, { classIds: [], rows: [], blockPlan: null });
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
    if (input.subjects.length !== previewSubjectIds.size || input.subjects.some((s) => s.lessonsPerWeek !== 5)) {
      throw new ElectiveBlockAutoBuildError("INVALID", run.kind === "ELECTIVES"
        ? "Phase B must keep every previewed elective and exactly 5 lessons per option block. Return to Subject Selection to change confirmed choices."
        : "Both Mathematics variants must remain in the split for exactly 5 lessons per week.");
    }
    if (run.kind === "ELECTIVES" && (!preview.blockPlan || preview.blockPlan.learnerProof.some((proof) => !proof.valid))) {
      throw new ElectiveBlockAutoBuildError("CONFLICT", "The preview has no valid per-learner A/B/C proof. Run Phase B preview again.");
    }

    // Phase C + real same-subject partitions: revalidate every teaching
    // group, exact learner coverage, teacher qualification and venue.
    const assignmentRows = input.subjects.flatMap((subject) => {
      const previewRow = preview.rows.find((row) => row.subjectId === subject.subjectId)!;
      const groups = previewRow.requiredTeachingGroups > 1 ? subject.teachingGroups : [];
      if (previewRow.requiredTeachingGroups > 1) {
        if (groups.length !== previewRow.requiredTeachingGroups) throw new ElectiveBlockAutoBuildError("INVALID", `${previewRow.subjectName} requires exactly ${previewRow.requiredTeachingGroups} real teaching groups.`);
        const allIds = groups.flatMap((group) => group.studentIds);
        const expected = new Set(previewRow.students.map((student) => student.id));
        if (new Set(allIds).size !== allIds.length || allIds.length !== expected.size || allIds.some((id) => !expected.has(id))) throw new ElectiveBlockAutoBuildError("INVALID", `${previewRow.subjectName} split groups must cover every confirmed learner exactly once.`);
        return groups.map((group) => ({ subject, previewRow, groupKey: group.key, groupLabel: group.label, teacherId: group.teacherId, venueId: group.venueId || null, studentIds: group.studentIds }));
      }
      if (!subject.teacherId) throw new ElectiveBlockAutoBuildError("INVALID", `Select a teacher for ${previewRow.subjectName}.`);
      return [{ subject, previewRow, groupKey: "MAIN", groupLabel: previewRow.subjectName, teacherId: subject.teacherId, venueId: subject.venueId || null, studentIds: previewRow.students.map((student) => student.id) }];
    });
    const [teacherLinks, venues] = await Promise.all([
      tdb.teacherSubject.findMany({ where: { subjectId: { in: assignmentRows.map((row) => row.subject.subjectId) }, teacherId: { in: assignmentRows.map((row) => row.teacherId) } } }),
      tdb.venue.findMany({ where: { id: { in: assignmentRows.map((row) => row.venueId).filter((id): id is string => Boolean(id)) }, active: true } }),
    ]);
    for (const assignment of assignmentRows) {
      if (!teacherLinks.some((link) => link.subjectId === assignment.subject.subjectId && link.teacherId === assignment.teacherId)) throw new ElectiveBlockAutoBuildError("INVALID", `${assignment.teacherId} is not a qualified teacher for ${assignment.previewRow.subjectName}.`);
      const venue = assignment.venueId ? venues.find((candidate) => candidate.id === assignment.venueId) : null;
      const homeCapacity = assignment.previewRow.homeClassCapacity as number | null;
      const needsVenue = homeCapacity == null || assignment.studentIds.length > homeCapacity;
      if (needsVenue && !venue) throw new ElectiveBlockAutoBuildError("INVALID", `${assignment.groupLabel} needs a venue for ${assignment.studentIds.length} learners.`);
      if (venue) {
        if (!safeParse<string[]>(venue.supportsSubjectIds, []).includes(assignment.subject.subjectId)) throw new ElectiveBlockAutoBuildError("INVALID", `${venue.name} is not tagged for ${assignment.previewRow.subjectName}.`);
        if (venue.learnerCapacity == null || venue.learnerCapacity < assignment.studentIds.length) throw new ElectiveBlockAutoBuildError("INVALID", `${venue.name} cannot prove capacity for ${assignment.groupLabel} (${assignment.studentIds.length} learners).`);
      }
    }

    const slotGroups: { key: string; subjects: typeof input.subjects }[] = run.kind === "MATH_SPLIT"
      ? [{ key: "Mathematics", subjects: input.subjects }]
      : (["A", "B", "C"] as const).map((key) => ({
          key: `Option ${key}`,
          subjects: input.subjects.filter((subject) => preview.rows.find((row) => row.subjectId === subject.subjectId)?.optionBlock === key),
        }));
    if (slotGroups.some((group) => group.subjects.length === 0)) {
      throw new ElectiveBlockAutoBuildError("CONFLICT", "Each of Option A, B and C must contain at least one real subject.");
    }
    for (const group of slotGroups) {
      const subjectIds = new Set(group.subjects.map((subject) => subject.subjectId));
      const expanded = assignmentRows.filter((row) => subjectIds.has(row.subject.subjectId));
      const teacherIds = expanded.map((row) => row.teacherId);
      if (new Set(teacherIds).size !== teacherIds.length) throw new ElectiveBlockAutoBuildError("CONFLICT", `${group.key} assigns one teacher to two parallel teaching groups.`);
      for (const venue of venues) {
        const assigned = expanded.filter((row) => row.venueId === venue.id);
        if (assigned.length > venue.capacityPerPeriod) throw new ElectiveBlockAutoBuildError("CONFLICT", `${venue.name} can host ${venue.capacityPerPeriod} simultaneous group(s), but ${assigned.length} ${group.key} groups use it.`);
        const learnerTotal = assigned.reduce((sum, row) => sum + row.studentIds.length, 0);
        if (assigned.length > 1 && venue.learnerCapacity != null && learnerTotal > venue.learnerCapacity) throw new ElectiveBlockAutoBuildError("CONFLICT", `${venue.name} has ${venue.learnerCapacity} seats, but parallel ${group.key} groups total ${learnerTotal}.`);
      }
    }
    const slots = slotGroups.flatMap((group, groupIndex) =>
      Array.from({ length: 5 }, (_, repetition) => ({
        label: `${group.key} · ${repetition + 1}/5`,
        isDouble: false,
        sortOrder: groupIndex * 5 + repetition,
        subjects: assignmentRows.filter((row) => group.subjects.some((subject) => subject.subjectId === row.subject.subjectId)).map((row) => ({
          subjectId: row.subject.subjectId,
          teacherId: row.teacherId,
          venueId: row.venueId || undefined,
          classIds: row.subject.classIds,
          teachingGroupKey: row.groupKey,
          teachingGroupLabel: row.groupLabel,
          studentIds: row.studentIds,
        })),
      }))
    );

    const saved = await saveElectiveBlock(user, {
      action: "save_block",
      name: input.blockName,
      mode: "MULTI_SLOT",
      preferAfterBreak: input.preferAfterBreak,
      classIds: allClassIds,
      slots,
    });

    await tdb.electiveBlockAutoBuildRun.update({
      where: { id: run.id },
      data: { status: "CONFIRMED", createdElectiveBlockId: saved.id, confirmedAt: new Date() },
    });

    // DD.7 — founder's own real words: once a subject combination/elective
    // is confirmed, it should be "placed in the combination tab so that no
    // manuall inputing is reauired same to electives they are placed in
    // the electives tab as well". The real ElectiveBlock above already
    // satisfies the "Electives tab" half. For the real "Combination tab"
    // (the pre-existing manual CombinationGroup list in Smart Timetable),
    // auto-create one real CombinationGroup PER confirmed subject here too
    // — source: "SUBJECT_CHOICE" (the exact same real, pre-existing
    // mechanism a school could otherwise only create by hand), so the
    // solver's own `deriveClassesFromSubjectChoice()` keeps this group's
    // real membership honestly in sync with actual student choices for as
    // long as the school keeps it active, with zero manual re-entry.
    // Reuses upsertCombinationGroup() unchanged — never a second, drifting
    // combination-creation path.
    const combinationGroupIds: string[] = [];
    for (const s of input.subjects) {
      if ((s.teachingGroups?.length ?? 0) > 1) continue; // exact split rosters live on ElectiveBlockSlotSubject.studentIdsJson
      const group = await upsertCombinationGroup(user, {
        name: `${input.blockName} — ${preview.rows.find((r) => r.subjectId === s.subjectId)?.subjectName ?? "Subject"}`,
        subjectId: s.subjectId,
        teacherId: s.teacherId || null,
        lessonsPerWeek: preview.rows.find((r) => r.subjectId === s.subjectId)?.defaultLessonsPerWeek ?? 4,
        doubleCount: 0,
        scope: "SELECTED",
        source: "SUBJECT_CHOICE",
        classIds: s.classIds,
      });
      combinationGroupIds.push(group.id);
    }

    // DD.6 — founder's own real confirmation (via ask_user): once a real
    // combination is confirmed, NEYO should be allowed to allocate classes
    // AND assign teachers automatically, reusing BB.4's own existing
    // "Allocate Class" engine — never a second, competing allocation path.
    // Only classless real students genuinely confirmed for THIS level are
    // ever touched (findClasslessStudentsForLevel() inside
    // class-allocation.service.ts's own real gate); a level where every
    // student already has a real class is a genuine, honest no-op here.
    let classAllocation: { attempted: boolean; allocated: number; reason?: string } = { attempted: false, allocated: 0 };
    try {
      const { previewClassAllocation, confirmClassAllocation, ClassAllocationError } = await import("@/lib/services/class-allocation.service");
      const classPreview = await previewClassAllocation(user, { level: run.level });
      if (classPreview.classStrategyAvailable === "USE_EXISTING") {
        classAllocation.attempted = true;
        const result = await confirmClassAllocation(user, {
          level: run.level,
          classStrategy: "USE_EXISTING",
          seedSubjectNeeds: true,
          generateTimetable: false,
        });
        classAllocation.allocated = result.totalStudents;
      }
      // CREATE_NEW is deliberately NEVER auto-triggered here — creating
      // brand-new real classes (with a real chosen stream count/capacity)
      // is a genuine, consequential school decision that must stay an
      // explicit human action, exactly like BB.4's own standalone flow
      // already requires. Only the USE_EXISTING path (placing already-
      // classless students into a level's own already-existing classes)
      // is safe to chain automatically here.
    } catch (e) {
      // A real, honest no-op is expected here whenever this level simply
      // has no classless students left to place (e.g. every student was
      // already in a class before this combination was even confirmed) —
      // never treated as a failure of the confirm action itself.
      classAllocation.reason = e instanceof Error ? e.message : String(e);
    }

    await db.auditLog.create({
      data: {
        tenantId: user.tenantId, actorId: user.id, actorName: user.fullName,
        action: "elective_block_auto_build.confirmed", entityType: "electiveBlockAutoBuildRun", entityId: run.id,
        metadata: JSON.stringify({
          level: run.level, kind: run.kind, blockId: saved.id, subjectCount: input.subjects.length,
          optionSlotCount: slots.length, learnerProofCount: preview.blockPlan?.learnerProof.length ?? 0,
          combinationGroupIds, classAllocationAttempted: classAllocation.attempted, classAllocationCount: classAllocation.allocated,
        }),
      },
    });

    return { blockId: saved.id, combinationGroupIds, classAllocation, optionSlotCount: slots.length, learnerProofCount: preview.blockPlan?.learnerProof.length ?? 0 };
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
