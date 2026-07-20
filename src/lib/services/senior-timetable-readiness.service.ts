import { tenantDb } from "@/lib/core/tenant-db";
import { withTenant } from "@/lib/core/tenant-context";
import type { SessionUser } from "@/lib/core/session";

const parse = <T>(value: string | null | undefined, fallback: T): T => { try { return value ? JSON.parse(value) as T : fallback; } catch { return fallback; } };
const label = (student: any) => `${student.firstName} ${student.lastName} (${student.admissionNo})`;

export type ReadinessFinding = { code: string; title: string; detail: string; affectedStudentIds?: string[]; affectedStudentNames?: string[] };

export async function seniorTimetableReadiness(user: SessionUser, level: string) {
  return withTenant(user.tenantId, async () => {
    const db = tenantDb();
    const classes = await db.schoolClass.findMany({ where: { level, archived: false }, select: { id: true, level: true, stream: true } });
    const blockers: ReadinessFinding[] = [], warnings: ReadinessFinding[] = [], passed: ReadinessFinding[] = [];
    if (classes.length === 0) return { level, ready: false, blockers: [{ code: "NO_CLASSES", title: "No active classes", detail: `No active ${level} class exists.` }], warnings, passed, summary: { students: 0, confirmed: 0, subjects: 0, classes: 0 } };
    const classIds = classes.map((c) => c.id);
    const [students, portal, subjects, teacherLinks, configs, needs] = await Promise.all([
      db.student.findMany({ where: { classId: { in: classIds }, status: "ACTIVE", deletedAt: null }, select: { id: true, firstName: true, lastName: true, admissionNo: true, classId: true } }),
      db.subjectSelectionPortal.findFirst({ where: { targetLevel: level }, orderBy: { createdAt: "desc" }, include: { selections: true } }),
      db.subject.findMany({ where: { archived: false }, select: { id: true, name: true, code: true, mathVariant: true } }),
      db.teacherSubject.findMany({ select: { subjectId: true, teacherId: true } }),
      db.timetableConfig.findMany({ where: { classId: { in: classIds } } }),
      db.classSubjectNeed.findMany({ where: { classId: { in: classIds } }, select: { classId: true, subjectId: true, lessonsPerWeek: true, doubleCount: true } }),
    ]);
    // Prisma cannot use a later Promise result in the parallel query above.
    const realPathwayPrefs = await db.studentPathwayPreference.findMany({ where: { studentId: { in: students.map((s) => s.id) }, isAllocated: true }, include: { pathway: { include: { subjectRequirements: true } } } });
    if (students.length === 0) blockers.push({ code: "NO_STUDENTS", title: "No active learners", detail: `${level} has no active learners to timetable.` });
    if (!portal) blockers.push({ code: "NO_SELECTION_PORTAL", title: "No subject-selection cycle", detail: `Create a ${level} subject-selection portal and collect choices.` });
    const subjectMap = new Map(subjects.map((s) => [s.id, s]));
    const studentMap = new Map(students.map((s) => [s.id, s]));
    const confirmed = (portal?.selections ?? []).filter((s) => s.isConfirmed && studentMap.has(s.studentId));
    const confirmedByStudent = new Map(confirmed.map((s) => [s.studentId, parse<string[]>(s.selectedSubjectIds, [])]));
    const missing = students.filter((s) => !confirmedByStudent.has(s.id));
    if (missing.length) blockers.push({ code: "UNCONFIRMED_CHOICES", title: "Learners without confirmed choices", detail: `${missing.length} learner(s) have no confirmed selection. Draft choices never drive a timetable.`, affectedStudentIds: missing.map((s) => s.id), affectedStudentNames: missing.map(label) });
    else if (students.length) passed.push({ code: "ALL_CONFIRMED", title: "Every learner has confirmed choices", detail: `${students.length} learner records are confirmed.` });

    const wrongCount = students.filter((s) => { const ids = confirmedByStudent.get(s.id); return ids && new Set(ids).size !== 3; });
    if (wrongCount.length) blockers.push({ code: "NOT_THREE_ELECTIVES", title: "Elective count is not exactly three", detail: `${wrongCount.length} learner(s) do not have exactly three different electives.`, affectedStudentIds: wrongCount.map((s) => s.id), affectedStudentNames: wrongCount.map(label) });
    else if (confirmed.length) passed.push({ code: "THREE_ELECTIVES", title: "Three electives per confirmed learner", detail: "All confirmed learners have exactly three distinct selected subjects." });

    const selectedIds = [...new Set([...confirmedByStudent.values()].flat())];
    const unknownIds = selectedIds.filter((id) => !subjectMap.has(id));
    if (unknownIds.length) blockers.push({ code: "UNKNOWN_SUBJECT", title: "Unknown or archived selections", detail: `${unknownIds.length} selected subject record(s) are unavailable in the active school catalog.` });
    else if (selectedIds.length) passed.push({ code: "SUBJECTS_ACTIVE", title: "Selected subjects exist", detail: `${selectedIds.length} active elective subject(s) are represented.` });

    const teachersBySubject = new Map<string, Set<string>>();
    for (const link of teacherLinks) { const set = teachersBySubject.get(link.subjectId) ?? new Set<string>(); set.add(link.teacherId); teachersBySubject.set(link.subjectId, set); }
    const noTeacher = selectedIds.filter((id) => (teachersBySubject.get(id)?.size ?? 0) === 0);
    if (noTeacher.length) blockers.push({ code: "NO_QUALIFIED_TEACHER", title: "Electives without qualified teachers", detail: noTeacher.map((id) => subjectMap.get(id)?.name ?? id).join(", ") });
    else if (selectedIds.length) passed.push({ code: "TEACHERS_LINKED", title: "Every elective has a qualified teacher link", detail: "Final simultaneous block allocation is checked in Phase C." });

    const prefByStudent = new Map(realPathwayPrefs.map((p) => [p.studentId, p]));
    const noPathway = confirmed.map((s) => studentMap.get(s.studentId)!).filter((s) => !prefByStudent.has(s.id));
    if (noPathway.length) warnings.push({ code: "NO_PATHWAY", title: "Pathway allocation missing", detail: `${noPathway.length} confirmed learner(s) have no allocated pathway; the two-from-pathway rule cannot be reviewed.`, affectedStudentIds: noPathway.map((s) => s.id), affectedStudentNames: noPathway.map(label) });
    const crossPathway: any[] = [];
    for (const [studentId, ids] of confirmedByStudent) {
      const pref = prefByStudent.get(studentId); if (!pref) continue;
      const pathwaySubjectIds = new Set(pref.pathway.subjectRequirements.filter((r: any) => !r.isCore).map((r: any) => r.subjectId));
      if (ids.filter((id) => pathwaySubjectIds.has(id)).length < 2) crossPathway.push(studentMap.get(studentId));
    }
    if (crossPathway.length) warnings.push({ code: "PATHWAY_EXCEPTION_REVIEW", title: "Cross-pathway combinations need review", detail: `${crossPathway.length} learner(s) have fewer than two electives mapped to their allocated pathway. Guidance permits justified exceptions, so leadership must review rather than NEYO changing choices.`, affectedStudentIds: crossPathway.map((s) => s.id), affectedStudentNames: crossPathway.map(label) });
    else if (confirmed.length && !noPathway.length) passed.push({ code: "PATHWAY_PATTERN", title: "Pathway pattern ready", detail: "Every confirmed learner has at least two electives mapped to the allocated pathway." });

    const groups = new Set(realPathwayPrefs.map((p) => p.pathway.pathwayGroup));
    const coreMath = subjects.find((s) => s.mathVariant === "CORE");
    const essentialMath = subjects.find((s) => s.mathVariant === "ESSENTIAL");
    if (groups.has("STEM") && !coreMath) blockers.push({ code: "CORE_MATH_MISSING", title: "Core Mathematics missing", detail: "At least one STEM learner exists but Core Mathematics is not configured." });
    if ([...groups].some((g) => g && g !== "STEM") && !essentialMath) blockers.push({ code: "ESSENTIAL_MATH_MISSING", title: "Essential Mathematics missing", detail: "At least one non-STEM learner exists but Essential Mathematics is not configured." });
    if (groups.has("STEM") && [...groups].some((g) => g && g !== "STEM") && coreMath && essentialMath) passed.push({ code: "MATH_SPLIT_REQUIRED", title: "Core/Essential Mathematics split identified", detail: "Both variants exist. Build the dedicated parallel Mathematics split before generation." });

    // Parallel electives must count as 15 learner periods (3 choices × 5),
    // not as the sum of every subject the school offers. Likewise Core and
    // Essential Mathematics share five parallel positions when both exist.
    const nonMathCoreCodes = new Set(["ENG", "KIS", "KSL", "CSL", "PE", "ICTS", "PPI", "PGST"]);
    const badTotals: string[] = [];
    for (const klass of classes) {
      const own = needs.filter((n) => n.classId === klass.id);
      const nonMath = own.filter((n) => nonMathCoreCodes.has(subjectMap.get(n.subjectId)?.code ?? "")).reduce((sum, n) => sum + n.lessonsPerWeek, 0);
      const math = Math.max(0, ...own.filter((n) => ["MATC", "MATE"].includes(subjectMap.get(n.subjectId)?.code ?? "")).map((n) => n.lessonsPerWeek));
      const learnerWeeklyTotal = nonMath + math + 15;
      if (learnerWeeklyTotal !== 40) badTotals.push(`${klass.level}${klass.stream ? ` ${klass.stream}` : ""}: ${learnerWeeklyTotal}/40 effective learner periods`);
    }
    if (badTotals.length) blockers.push({ code: "WEEKLY_TOTAL", title: "Effective learner week is not 40 lessons", detail: `${badTotals.join(" · ")}. Parallel elective offerings count as three 5-period blocks, not the sum of all offered subjects.` });
    else passed.push({ code: "FORTY_LESSONS", title: "Every learner week resolves to 40 lessons", detail: "Core/support needs plus Mathematics split and three 5-period elective blocks total 40." });

    const missingConfig = classes.filter((c) => !configs.some((cfg) => cfg.classId === c.id));
    if (missingConfig.length) blockers.push({ code: "NO_TIMETABLE_CONFIG", title: "Schedule rules missing", detail: `${missingConfig.length} class(es) have no timetable configuration.` });
    const wrongConfig = configs.filter((cfg) => cfg.periodsPerDay !== 8 || cfg.lessonDurationMins !== 40);
    if (wrongConfig.length) warnings.push({ code: "ROUTINE_DIFFERENCE", title: "Routine differs from reviewed Senior guidance", detail: `${wrongConfig.length} class configuration(s) differ from 8 lessons/day at 40 minutes. Confirm the school’s current approved rule.` });
    else if (configs.length) passed.push({ code: "EIGHT_BY_FORTY", title: "Eight × 40-minute daily structure", detail: "Configured class routines match the reviewed duration structure." });
    const routineDifferences = configs.filter((cfg) => cfg.schoolDayStartTime !== "08:00" || cfg.assemblyBeforeLessonsMins !== 20 || cfg.shortBreakStart !== 2 || cfg.shortBreakMins !== 10 || cfg.longBreakStart !== 4 || cfg.longBreakMins !== 30 || (cfg.lunchAfterPeriod ?? cfg.lunchStart) !== 6 || cfg.lunchMins !== 60);
    if (routineDifferences.length) warnings.push({ code: "BELL_ROUTINE_REVIEW", title: "Bell routine needs leadership review", detail: `${routineDifferences.length} class configuration(s) differ from the reviewed 8:00 reporting, 20-minute roll-call/assembly, breaks after Periods 2 and 4, and one-hour lunch after Period 6. Apply only if this school confirms the current guideline.` });
    else if (configs.length) passed.push({ code: "BELL_ROUTINE", title: "Reviewed Senior bell routine matches", detail: "Reporting, assembly, health breaks and lunch align with the reviewed guideline." });
    const saturday = configs.filter((cfg) => cfg.hasSaturday);
    if (saturday.length) warnings.push({ code: "SATURDAY_LOCAL_RULE", title: "Saturday is a local addition", detail: `${saturday.length} class configuration(s) include Saturday. The reviewed standard 40-lesson Senior week is Monday–Friday; keep Saturday only as a separately approved remedial/local programme.` });

    const coreCodes = new Set(["ENG", "KIS", "KSL", "MATC", "MATE", "CSL", "PE", "ICTS", "PPI", "PGST"]);
    const forbiddenDoubles = needs.filter((n) => n.doubleCount > 0 && coreCodes.has(subjectMap.get(n.subjectId)?.code ?? ""));
    if (forbiddenDoubles.length) blockers.push({ code: "CORE_DOUBLE", title: "Core/support subject has a double lesson", detail: `${forbiddenDoubles.length} class-subject requirement(s) violate the reviewed single-lesson rule.` });
    else passed.push({ code: "CORE_SINGLES", title: "Core/support double check passed", detail: "No configured double was found on recognised core/support subject codes." });

    return { level, ready: blockers.length === 0, blockers, warnings, passed, summary: { students: students.length, confirmed: confirmed.length, subjects: selectedIds.length, classes: classes.length, pathwayAllocated: realPathwayPrefs.length } };
  });
}
