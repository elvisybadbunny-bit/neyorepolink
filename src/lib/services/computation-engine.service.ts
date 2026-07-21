import { db } from "@/lib/db";
import { tenantDb } from "@/lib/core/tenant-db";
import { withTenant } from "@/lib/core/tenant-context";
import { isCurriculumEngineEnabled } from "@/lib/services/launch-control.service";

export class ComputationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ComputationError";
  }
}

/**
 * 1. Normalize Paper Marks -> Final Subject Exam Score
 * Math: (MarksScored / OutOfMarks) * (WeightPct / 100) -> Summed.
 */
async function computeSubjectExamScores(tenantId: string, examId: string) {
  return withTenant(tenantId, async () => {
    const tDb = tenantDb();
    
    // Fetch all paper results and preserve the exam's declared final maximum.
    const exam = await tDb.exam.findUnique({ where: { id: examId }, select: { maxMarks: true } });
    if (!exam) throw new ComputationError("Exam not found for paper computation.");
    const results = await tDb.examResult.findMany({
      where: { examId },
      include: { PaperResult: { include: { paperConfig: true } } }
    });

    for (const res of results) {
      if (res.PaperResult.length === 0) continue; // It was a 'default' 100% paper, marks are already in res.marks

      let finalScore = 0;
      let configuredTotalWeight = 0;

      for (const pr of res.PaperResult) {
        if (pr.marksScored === null) continue;
        const cfg = pr.paperConfig;
        configuredTotalWeight += cfg.weightPct;
        const normalized = (pr.marksScored / cfg.outOfMarks) * cfg.weightPct;
        finalScore += normalized;
      }

      // Founder-confirmed AVAILABLE_AVERAGE policy: a paper the school did not
      // conduct does not become a zero. Re-normalise only papers with a saved
      // mark back to 100%; the absent paper is omitted from the breakdown.
      if (configuredTotalWeight > 0 && configuredTotalWeight !== 100) {
        finalScore = finalScore * (100 / configuredTotalWeight);
      }

      await tDb.examResult.update({
        where: { id: res.id },
        data: { marks: Math.round((finalScore / 100) * exam.maxMarks) }
      });
    }
  });
}

/**
 * 2. K.5 Asynchronous Background Job — Master Term Report Aggregation
 * This loops through all students in a Term, looks up the TermAggregationRule (Macro-Weights),
 * calculates the final aggregate score across CATs, Projects, and Exams, and maps it to CBC Rubrics.
 */
/**
 * K.5 — Read the Master Term Report for a class in a term (subject grid + overall),
 * ordered by overall position. Used by the Academics computation dashboard.
 */
export async function getMasterReportCards(tenantId: string, termId: string, classId: string) {
  return withTenant(tenantId, async () => {
    const tDb = tenantDb();
    const rows = await tDb.masterReportCard.findMany({
      where: { termId, classId },
      orderBy: [{ subjectId: "asc" }],
    });
    const studentIds = Array.from(new Set(rows.map((r) => r.studentId)));
    const students = studentIds.length
      ? await tDb.student.findMany({ where: { id: { in: studentIds } }, select: { id: true, firstName: true, middleName: true, lastName: true, admissionNo: true } })
      : [];
    const subjectIds = Array.from(new Set(rows.map((r) => r.subjectId).filter(Boolean))) as string[];
    const subjects = subjectIds.length
      ? await tDb.subject.findMany({ where: { id: { in: subjectIds } }, select: { id: true, name: true, code: true } })
      : [];
    const nameById = new Map(students.map((s) => [s.id, [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ")]));
    const admById = new Map(students.map((s) => [s.id, s.admissionNo]));
    const subjById = new Map(subjects.map((s) => [s.id, s]));

    const byStudent = new Map<string, { name: string; admissionNo: string; overall: any | null; subjects: any[] }>();
    for (const r of rows) {
      const entry = byStudent.get(r.studentId) ?? { name: nameById.get(r.studentId) ?? "", admissionNo: admById.get(r.studentId) ?? "", overall: null, subjects: [] };
      if (r.subjectId === null) {
        entry.overall = { finalMark: r.finalMark, cbcLevel: r.cbcLevel, letterGrade: r.letterGrade, rank: r.rank, outOf: r.outOf };
      } else {
        const sub = subjById.get(r.subjectId);
        entry.subjects.push({ subjectId: r.subjectId, subjectName: sub?.name ?? "", subjectCode: sub?.code ?? "", finalMark: r.finalMark, cbcLevel: r.cbcLevel, letterGrade: r.letterGrade, rank: r.rank, outOf: r.outOf, isTraditional: r.isTraditional });
      }
      byStudent.set(r.studentId, entry);
    }
    const list = Array.from(byStudent.values()).sort((a, b) => (a.overall?.rank ?? 9999) - (b.overall?.rank ?? 9999));
    return { students: list, subjects: subjects.map((s) => ({ id: s.id, name: s.name, code: s.code })) };
  });
}

interface AggComponent {
  sourceType: "EXAM" | "ASSESSMENT";
  sourceId: string;
  label: string;
  mark: number; // 0..100 normalised
  weightPct: number; // 0..100 (effective weight used)
}

/** CBC band from a 0..100 mark. */
function cbcLevelFromMark(mark: number): number {
  if (mark >= 80) return 4;
  if (mark >= 65) return 3;
  if (mark >= 50) return 2;
  return 1;
}

const DEFAULT_GRADE_BOUNDARIES = [{ grade: "A", min: 80 }, { grade: "A-", min: 75 }, { grade: "B+", min: 70 }, { grade: "B", min: 65 }, { grade: "B-", min: 60 }, { grade: "C+", min: 55 }, { grade: "C", min: 50 }, { grade: "C-", min: 45 }, { grade: "D+", min: 40 }, { grade: "D", min: 35 }, { grade: "D-", min: 30 }, { grade: "E", min: 0 }];
function letterGradeFromMark(mark: number, boundaries = DEFAULT_GRADE_BOUNDARIES): string {
  return [...boundaries].sort((a, b) => b.min - a.min).find((boundary) => mark >= boundary.min)?.grade ?? boundaries[boundaries.length - 1]?.grade ?? "—";
}

/**
 * K.5 — Master Term Report aggregation.
 *
 * For every (student, subject) with results in the term, produce ONE final
 * aggregated mark, persisted as a MasterReportCard row, plus an overall summary
 * row per student (subjectId = null) with the term mean and class position.
 *
 * Aggregation policy (founder choice 2026-06-30):
 *  - If a TermAggregationRule applies (most specific: class+subject -> class ->
 *    subject -> global) and is NOT traditional, use its weightings over the
 *    term's exams (and assessment types). Weights are normalised over the
 *    components that actually have a mark, so a missing component doesn't zero
 *    the subject.
 *  - Otherwise (no rule, or isTraditional) use a SIMPLE AVERAGE of the term's
 *    exam results for that subject.
 *
 * Deterministic, no AI. Idempotent via the MasterReportCard unique key.
 * Returns the number of subject rows written.
 */
export async function computeMasterReportCards(tenantId: string, termId: string): Promise<number> {
  return withTenant(tenantId, async () => {
    const tDb = tenantDb();

    const term = await tDb.academicTerm.findUnique({ where: { id: termId } });
    if (!term) throw new ComputationError("Term not found for master report computation.");

    // All exams in this term (matched by year + term number) and their results.
    const exams = await tDb.exam.findMany({ where: { year: term.year, term: term.term }, select: { id: true, name: true, maxMarks: true } });
    const examIds = exams.map((e) => e.id);
    const [results, assessmentPlans] = await Promise.all([
      tDb.examResult.findMany({ where: { examId: { in: examIds } }, select: { examId: true, studentId: true, subjectId: true, marks: true } }),
      tDb.assessmentPlan.findMany({ where: { year: term.year, term: term.term, subjectId: { not: null }, status: { in: ["ACTIVE", "MODERATION", "RELEASED"] } }, include: { records: { where: { status: { in: ["SCORED", "SUBMITTED", "MODERATED", "RELEASED"] } } } } }),
    ]);
    if (results.length === 0 && assessmentPlans.every((plan) => plan.records.length === 0)) return 0;

    // Map student -> class (only students currently placed in a class are ranked).
    const studentIds = Array.from(new Set([...results.map((r) => r.studentId), ...assessmentPlans.flatMap((plan) => plan.records.map((record) => record.studentId))]));
    const students = await tDb.student.findMany({
      where: { id: { in: studentIds } },
      select: { id: true, classId: true },
    });
    const classByStudent = new Map(students.map((s) => [s.id, s.classId]));

    // Aggregation rules for the tenant.
    const rules = await tDb.termAggregationRule.findMany({});
    function ruleFor(classId: string | null, subjectId: string) {
      return (
        rules.find((r) => r.classId === classId && r.subjectId === subjectId) ||
        rules.find((r) => r.classId === classId && r.subjectId === null) ||
        rules.find((r) => r.classId === null && r.subjectId === subjectId) ||
        rules.find((r) => r.classId === null && r.subjectId === null) ||
        null
      );
    }

    // Index every conducted exam/assessment by student+subject. User-defined
    // AssessmentPlan.title becomes the report column name (CAT, Assignment,
    // Group Work, Project, or any school-authored name).
    type RKey = string;
    type SourceMark = { sourceType: "EXAM" | "ASSESSMENT"; sourceId: string; label: string; mark: number };
    const byStudentSubject = new Map<RKey, SourceMark[]>();
    for (const r of results) {
      const key = `${r.studentId}::${r.subjectId}`;
      const list = byStudentSubject.get(key) ?? [];
      const sourceExam = exams.find((exam) => exam.id === r.examId);
      const normalizedMark = sourceExam ? (r.marks / Math.max(1, sourceExam.maxMarks)) * 100 : r.marks;
      list.push({ sourceType: "EXAM", sourceId: r.examId, label: sourceExam?.name ?? "Exam", mark: normalizedMark });
      byStudentSubject.set(key, list);
    }
    for (const plan of assessmentPlans) {
      if (!plan.subjectId) continue;
      for (const record of plan.records) {
        const mark = record.scorePct ?? (record.scoreMarks != null && plan.maxMarks ? Math.round((record.scoreMarks / Math.max(1, plan.maxMarks)) * 100) : null);
        if (mark == null) continue;
        const key = `${record.studentId}::${plan.subjectId}`;
        const list = byStudentSubject.get(key) ?? [];
        list.push({ sourceType: "ASSESSMENT", sourceId: plan.id, label: plan.title, mark });
        byStudentSubject.set(key, list);
      }
    }

    const curriculumOn = await isCurriculumEngineEnabled();

    // Compute each subject final mark.
    interface SubjectRow {
      studentId: string;
      classId: string | null;
      subjectId: string;
      finalMark: number;
      isTraditional: boolean;
      components: AggComponent[];
    }
    const subjectRows: SubjectRow[] = [];

    for (const [key, list] of byStudentSubject.entries()) {
      const [studentId, subjectId] = key.split("::");
      const classId = classByStudent.get(studentId) ?? null;
      const rule = ruleFor(classId, subjectId);

      let finalMark: number;
      let isTraditional = true;
      const components: AggComponent[] = [];

      const markBySource = new Map(list.map((x) => [`${x.sourceType}:${x.sourceId}`, x]));
      let usable: { sourceType: "EXAM" | "ASSESSMENT"; sourceId: string; label: string; mark: number; weightPct: number }[] = [];
      if (rule && !rule.isTraditional && rule.weightingStrategy === "CUSTOM_WEIGHTS") {
        let weightings: { sourceType: "EXAM" | "ASSESSMENT"; sourceId: string; label?: string; weightPct: number }[] = [];
        try { weightings = JSON.parse(rule.weightingsJson); } catch { weightings = []; }
        usable = weightings.flatMap((weight) => {
          const source = markBySource.get(`${weight.sourceType}:${weight.sourceId}`);
          return source ? [{ ...source, label: weight.label || source.label, weightPct: weight.weightPct }] : [];
        });
      } else {
        // School chose equal sharing, or has no custom rule. Only work that
        // was actually conducted appears; absent assessments are not zeroes.
        usable = list.map((source) => ({ ...source, weightPct: 1 }));
      }
      if (usable.length === 0) usable = list.map((source) => ({ ...source, weightPct: 1 }));
      const totalWeight = usable.reduce((sum, source) => sum + source.weightPct, 0);
      finalMark = usable.reduce((sum, source) => sum + source.mark * (source.weightPct / Math.max(1, totalWeight)), 0);
      isTraditional = !rule || rule.isTraditional;
      for (const source of usable) {
        components.push({ sourceType: source.sourceType, sourceId: source.sourceId, label: source.label, mark: Math.round(source.mark * 100) / 100, weightPct: Math.round((source.weightPct / Math.max(1, totalWeight)) * 100) });
      }

      subjectRows.push({ studentId, classId, subjectId, finalMark: Math.round(finalMark * 100) / 100, isTraditional, components });
    }

    // Rank per (class, subject).
    const subjRankGroups = new Map<string, SubjectRow[]>();
    for (const row of subjectRows) {
      const g = `${row.classId ?? "none"}::${row.subjectId}`;
      const list = subjRankGroups.get(g) ?? [];
      list.push(row);
      subjRankGroups.set(g, list);
    }
    const subjRank = new Map<SubjectRow, { rank: number; outOf: number }>();
    for (const [, list] of subjRankGroups) {
      const sorted = [...list].sort((a, b) => b.finalMark - a.finalMark);
      sorted.forEach((row, i) => subjRank.set(row, { rank: i + 1, outOf: sorted.length }));
    }

    // Overall mean per student (across their subjects), then class rank.
    const overallByStudent = new Map<string, { classId: string | null; mean: number; count: number }>();
    for (const row of subjectRows) {
      const cur = overallByStudent.get(row.studentId) ?? { classId: row.classId, mean: 0, count: 0 };
      cur.mean += row.finalMark;
      cur.count += 1;
      overallByStudent.set(row.studentId, cur);
    }
    const overallRows = Array.from(overallByStudent.entries()).map(([studentId, v]) => ({
      studentId,
      classId: v.classId,
      mean: v.count ? Math.round((v.mean / v.count) * 100) / 100 : 0,
    }));
    const overallRankGroups = new Map<string, typeof overallRows>();
    for (const row of overallRows) {
      const g = row.classId ?? "none";
      const list = overallRankGroups.get(g) ?? [];
      list.push(row);
      overallRankGroups.set(g, list);
    }
    const overallRank = new Map<string, { rank: number; outOf: number }>();
    for (const [, list] of overallRankGroups) {
      const sorted = [...list].sort((a, b) => b.mean - a.mean);
      sorted.forEach((row, i) => overallRank.set(row.studentId, { rank: i + 1, outOf: sorted.length }));
    }

    // Use this school's saved grading boundaries; preserve the Kenyan default
    // when the school has not configured its own scale.
    const scaleRow = await tDb.gradingScale.findUnique({ where: { tenantId } });
    let gradeBoundaries = DEFAULT_GRADE_BOUNDARIES;
    try { if (scaleRow) gradeBoundaries = JSON.parse(scaleRow.boundariesJson); } catch { gradeBoundaries = DEFAULT_GRADE_BOUNDARIES; }

    // Persist (idempotent upsert) subject rows + overall summary rows.
    let written = 0;
    for (const row of subjectRows) {
      const rk = subjRank.get(row) ?? { rank: 0, outOf: 0 };
      await tDb.masterReportCard.upsert({
        where: { tenantId_termId_studentId_subjectId: { tenantId, termId, studentId: row.studentId, subjectId: row.subjectId } },
        create: {
          tenantId, termId, classId: row.classId ?? "", studentId: row.studentId, subjectId: row.subjectId,
          finalMark: row.finalMark,
          cbcLevel: curriculumOn ? cbcLevelFromMark(row.finalMark) : null,
          letterGrade: letterGradeFromMark(row.finalMark, gradeBoundaries),
          rank: rk.rank || null, outOf: rk.outOf || null,
          isTraditional: row.isTraditional,
          componentsJson: JSON.stringify(row.components),
        },
        update: {
          classId: row.classId ?? "", finalMark: row.finalMark,
          cbcLevel: curriculumOn ? cbcLevelFromMark(row.finalMark) : null,
          letterGrade: letterGradeFromMark(row.finalMark, gradeBoundaries),
          rank: rk.rank || null, outOf: rk.outOf || null,
          isTraditional: row.isTraditional,
          componentsJson: JSON.stringify(row.components),
          computedAt: new Date(),
        },
      });
      written++;
    }
    for (const row of overallRows) {
      const rk = overallRank.get(row.studentId) ?? { rank: 0, outOf: 0 };
      // Summary row has subjectId = null; Prisma compound uniques cannot select
      // on null, so upsert manually (find existing summary row, then update/create).
      const existing = await tDb.masterReportCard.findFirst({
        where: { tenantId, termId, studentId: row.studentId, subjectId: null },
        select: { id: true },
      });
      const summaryData = {
        classId: row.classId ?? "",
        finalMark: row.mean,
        cbcLevel: curriculumOn ? cbcLevelFromMark(row.mean) : null,
        letterGrade: letterGradeFromMark(row.mean, gradeBoundaries),
        rank: rk.rank || null,
        outOf: rk.outOf || null,
        isTraditional: true,
        componentsJson: "[]",
        computedAt: new Date(),
      };
      if (existing) {
        await tDb.masterReportCard.update({ where: { id: existing.id }, data: summaryData });
      } else {
        await tDb.masterReportCard.create({
          data: { tenantId, termId, studentId: row.studentId, subjectId: null, ...summaryData },
        });
      }
    }

    return written;
  });
}

/**
 * K.6 — Map exam results to CBC competency evidence (J.4) for a term.
 *
 * Mapping rule (deterministic, no AI): an exam subject belongs to a CBC
 * LearningArea; every active Competency under that learning area receives an
 * evidence row derived from the student's final subject mark:
 *   >=80 -> Level 4 (EE), >=65 -> Level 3 (ME), >=50 -> Level 2 (AE), else 1 (BE).
 *
 * Idempotent: keyed on (sourceModule="EXAM", sourceId=examResultId,
 * competencyId) so re-computation updates rather than duplicates.
 *
 * Gated by the curriculum engine flag — when Part-J / CBC is OFF this is a no-op
 * and normal computation/release is unaffected.
 *
 * Returns the number of evidence rows written/updated.
 */
export async function syncResultsToCompetencyEvidence(tenantId: string, term: number, year: number): Promise<number> {
  if (!(await isCurriculumEngineEnabled())) return 0;

  return withTenant(tenantId, async () => {
    const tDb = tenantDb();

    const results = await tDb.examResult.findMany({
      where: { exam: { term, year } },
      select: { id: true, studentId: true, subjectId: true, marks: true, updatedAt: true },
    });
    if (results.length === 0) return 0;

    // subjectId -> learningAreaId
    const subjectIds = Array.from(new Set(results.map((r) => r.subjectId)));
    const subjects = await tDb.subject.findMany({
      where: { id: { in: subjectIds } },
      select: { id: true, learningAreaId: true },
    });
    const areaBySubject = new Map(subjects.map((s) => [s.id, s.learningAreaId]));

    // learningAreaId -> active competencies in that area
    const areaIds = Array.from(new Set(subjects.map((s) => s.learningAreaId).filter(Boolean))) as string[];
    if (areaIds.length === 0) return 0;
    const competencies = await tDb.competency.findMany({
      where: { learningAreaId: { in: areaIds }, active: true },
      select: { id: true, learningAreaId: true },
    });
    const compsByArea = new Map<string, string[]>();
    for (const c of competencies) {
      if (!c.learningAreaId) continue;
      const list = compsByArea.get(c.learningAreaId) ?? [];
      list.push(c.id);
      compsByArea.set(c.learningAreaId, list);
    }

    function levelFor(marks: number): number {
      if (marks >= 80) return 4;
      if (marks >= 65) return 3;
      if (marks >= 50) return 2;
      return 1;
    }

    let written = 0;
    for (const r of results) {
      const areaId = areaBySubject.get(r.subjectId);
      if (!areaId) continue;
      const comps = compsByArea.get(areaId) ?? [];
      const level = levelFor(r.marks);
      const evidenceDate = (r.updatedAt ?? new Date()).toISOString().slice(0, 10);

      for (const competencyId of comps) {
        const existing = await tDb.competencyEvidence.findFirst({
          where: { sourceModule: "EXAM", sourceId: r.id, competencyId },
          select: { id: true },
        });
        const data = {
          level,
          scorePct: r.marks,
          narrative: `Derived from term exam result (mark ${r.marks}%).`,
          evidenceDate,
        };
        if (existing) {
          await tDb.competencyEvidence.update({ where: { id: existing.id }, data });
        } else {
          await tDb.competencyEvidence.create({
            data: {
              tenantId,
              competencyId,
              studentId: r.studentId,
              sourceModule: "EXAM",
              sourceId: r.id,
              recordedById: "system",
              recordedByName: "NEYO Computation Engine",
              approved: true,
              visibleToParents: false,
              ...data,
            },
          });
        }
        written++;
      }
    }
    return written;
  });
}

export async function triggerTermComputation(tenantId: string, portalId: string) {
  const portal = await withTenant(tenantId, () => tenantDb().marksPortal.findUnique({ where: { id: portalId } }));
  if (!portal || portal.status !== "CLOSED") throw new ComputationError("Close marks entry and review the raw marks before computation.");
  // We don't await this inside the API route. We fire and forget.
  _runBackgroundComputation(tenantId, portalId).catch(console.error);
  return { status: "COMPUTING", message: "Computation started in the background." };
}

async function _runBackgroundComputation(tenantId: string, portalId: string) {
  return withTenant(tenantId, async () => {
    const tDb = tenantDb();
    
    await tDb.marksPortal.update({
      where: { id: portalId },
      data: { status: "COMPUTING", computationStartedAt: new Date(), computationProgress: 5 }
    });

    const portal = await tDb.marksPortal.findUnique({ where: { id: portalId }, include: { term: true } });
    if (!portal || !portal.termId) throw new ComputationError("Invalid portal configuration");

    // Get all exams belonging to this term to compute their micro-weights first
    const exams = await tDb.exam.findMany({ where: { term: portal.term!.term, year: portal.term!.year } });
    for (const ex of exams) {
      await computeSubjectExamScores(tenantId, ex.id);
    }
    
    await tDb.marksPortal.update({ where: { id: portalId }, data: { computationProgress: 30 } });

    // K.5 — Term-level macro aggregation. The per-subject weighted computation
    // already ran above (computeSubjectExamScores). Now build the MasterReportCard:
    // one final aggregated mark per (student, subject) using TermAggregationRule
    // when present, else a simple average of the term's exams, plus an overall
    // summary row per student with the term mean + class position. Real work, no
    // artificial delay.
    let masterRowsWritten = 0;
    try {
      masterRowsWritten = await computeMasterReportCards(tenantId, portal.termId!);
    } catch (err) {
      console.error("K.5 master report aggregation failed (non-fatal):", err);
    }
    await tDb.marksPortal.update({ where: { id: portalId }, data: { computationProgress: 80 } });
    
    // K.6 — Auto-sync computed final results into CBC (J.4 CompetencyEvidence),
    // which also surfaces them in the J.8 Learner Journey (the journey timeline
    // reads CompetencyEvidence). This is a BEST-EFFORT enrichment: it only runs
    // when the curriculum engine (Part-J) is ON, and any failure here must NEVER
    // break the core computation/release. Normal results work with J OFF.
    const results = await tDb.examResult.findMany({ where: { exam: { term: portal.term!.term, year: portal.term!.year } } });
    try {
      await syncResultsToCompetencyEvidence(tenantId, portal.term!.term, portal.term!.year);
    } catch (err) {
      console.error("K.6 CBC sync skipped (non-fatal):", err);
    }

    await tDb.marksPortal.update({
      where: { id: portalId },
      data: { 
        status: "PENDING_RELEASE", 
        computationEndedAt: new Date(), 
        computationProgress: 100,
        computationTotalRows: results.length + masterRowsWritten
      }
    });

    // Notify Principals that results are ready for release
    const { createInApp } = await import("./notification.service");
    const leadership = await tDb.user.findMany({
      where: { role: { in: ["PRINCIPAL", "DEPUTY_PRINCIPAL", "SCHOOL_OWNER"] }, isActive: true }
    });
    
    for (const leader of leadership) {
      await createInApp({
        tenantId,
        recipientId: leader.id,
        title: "Term Computation Complete",
        body: "The computation for " + portal.name + " has finished. Results are pending your approval to release.",
        category: "system",
        href: "/academics" // We will build a Release UI
      });
    }
  });
}

// 3. K.7 & K.8 Joint Release Workflow
export async function releaseTermResults(tenantId: string, portalId: string, releaserId: string, notifyParentsBySms = false) {
  return withTenant(tenantId, async () => {
    const tDb = tenantDb();
    
    const portal = await tDb.marksPortal.findUnique({ where: { id: portalId }, include: { term: true } });
    if (!portal || portal.status !== "PENDING_RELEASE") throw new ComputationError("Portal not ready for release");

    await tDb.marksPortal.update({
      where: { id: portalId },
      data: { status: "RELEASED" }
    });

    // Make all underlying exams visible to parents
    await tDb.exam.updateMany({
      where: { term: portal.term!.term, year: portal.term!.year },
      data: { published: true }
    });

    // Notify all Teachers
    const { createInApp } = await import("./notification.service");
    const teachers = await tDb.user.findMany({ where: { role: { in: ["TEACHER", "CLASS_TEACHER"] } } });
    for (const t of teachers) {
      await createInApp({
        tenantId,
        recipientId: t.id,
        title: "Results Released",
        body: "The Principal has officially released results for " + portal.name,
        category: "system",
        href: "/academics"
      });
    }

    // K.8 — Notify parents by SMS that results are released. Real, but
    // best-effort: SMS failures must NEVER roll back the release. We message the
    // guardians of students who actually have a result in this term, deduped by
    // phone, using the shared sender (which records the SMS margin ledger, M.2).
    let smsSent = 0;
    if (notifyParentsBySms) try {
      const termResults = await tDb.examResult.findMany({
        where: { exam: { term: portal.term!.term, year: portal.term!.year } },
        select: { studentId: true },
      });
      const studentIds = Array.from(new Set(termResults.map((r) => r.studentId)));
      const links = studentIds.length
        ? await tDb.studentGuardian.findMany({
            where: { studentId: { in: studentIds } },
            include: { guardian: { select: { phone: true } } },
            orderBy: { isPrimary: "desc" },
          })
        : [];
      const phones = new Set<string>();
      for (const l of links) {
        if (l.guardian.phone) phones.add(l.guardian.phone);
      }
      const { sendSms } = await import("@/lib/notifications/sms");
      for (const phone of phones) {
        try {
          await sendSms(
            phone,
            `Results for ${portal.name} have been released. Log into the Parent Portal to view.`,
            { tenantId }
          );
          smsSent++;
        } catch (e) {
          console.error("K.8 parent SMS failed (non-fatal):", e);
        }
      }
    } catch (e) {
      console.error("K.8 parent SMS step skipped (non-fatal):", e);
    }

    return { success: true, smsSent };
  });
}
