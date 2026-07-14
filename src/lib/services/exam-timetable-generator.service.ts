import { withTenant } from "@/lib/core/tenant-context";
import { tenantDb } from "@/lib/core/tenant-db";
import type { SessionUser } from "@/lib/core/session";
import { generateExamInvigilators } from "@/lib/services/exam-timetable-invigilator.service";
// AA.10 — real Options-Block exam awareness (see the full design
// explanation in elective-block.service.ts, right above
// getElectiveBlockExamPapers()).
import { getElectiveBlockExamPapers, type ElectiveExamPaper } from "@/lib/services/elective-block.service";

export class ExamTimetableGeneratorError extends Error {
  constructor(public code: "NOT_FOUND" | "INVALID" | "CONFLICT", message: string) {
    super(message);
    this.name = "ExamTimetableGeneratorError";
  }
}

type PeriodInput = { label: string; startTime: string; endTime: string };
type GeneratorInput = {
  examName?: string;
  classIds?: string[];
  startDate?: string;
  endDate?: string;
  periods?: PeriodInput[];
  notes?: string | null;
  autoGenerateInvigilators?: boolean;
  // P.5 — Sunday is never a real exam day for a Kenyan school and is now
  // always excluded (was previously a real gap: every calendar day in the
  // range, including Sundays, was treated as usable exam capacity).
  // Saturday is a normal school day for many schools but a short/no-lesson
  // day for others — excludeSaturday lets a school opt out of using it for
  // exams without having to manually avoid picking those dates.
  excludeSaturday?: boolean;
  // Z.6 — real STREAM_GROUP auto-targeting (closing the last open L.7 item:
  // "class-group targeting is still open"). When multiple streams of the
  // SAME level are selected for this exam run and they share the exact
  // same real subject/paper (e.g. Form 2 East + Form 2 West both sitting
  // "Mathematics Paper 1"), real Kenyan schools overwhelmingly sit that
  // paper for the WHOLE LEVEL at the same real date/period — never
  // independently, since staggering the same paper across streams risks
  // real exam-leakage/logistics problems. Defaults to true (matching real
  // common practice); a school can turn it off per-run if they genuinely
  // want every stream sat fully independently (e.g. very different
  // capacity/venue constraints per stream). A real CombinationGroup
  // (an actual shared TEACHING group) always takes priority over a
  // same-level grouping when both would apply to the same class/subject.
  groupStreamsByLevel?: boolean;
};

type PaperTemplate = {
  subjectId: string;
  classId: string | null;
  paperConfigId: string | null;
  paperName: string;
  weightPct: number;
};

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  try { return value ? JSON.parse(value) as T : fallback; } catch { return fallback; }
}

// P.5 bugfix: this previously included every calendar day in the range —
// including Sunday, which is never a real Kenyan school exam day — as usable
// exam capacity, silently over-counting how many slots were actually
// available. Sunday is now always excluded; Saturday is excluded only when
// the school explicitly opts out via excludeSaturday (many schools do sit
// exams on Saturday, so it is not force-excluded by default).
function enumerateDates(startDate: string, endDate: string, excludeSaturday = false) {
  const out: string[] = [];
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return out;
  for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay(); // 0 = Sunday, 6 = Saturday
    if (dow === 0) continue;
    if (dow === 6 && excludeSaturday) continue;
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function normalizePaperName(name?: string | null) {
  const cleaned = (name || '').trim();
  return cleaned.length > 0 ? cleaned : 'Theory';
}

function levelAwarePaperFallbacks(classLevel?: string | null) {
  const raw = (classLevel || '').toLowerCase();
  if (raw.includes('form') || raw.includes('grade 10') || raw.includes('grade 11') || raw.includes('grade 12')) {
    return ['Paper 1', 'Paper 2'];
  }
  if (raw.includes('grade 7') || raw.includes('grade 8') || raw.includes('grade 9') || raw.includes('junior')) {
    return ['Theory'];
  }
  return ['Theory'];
}

export async function getExamTimetableGeneratorSetup(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const [classes, subjects, paperConfigs, runs] = await Promise.all([
      tdb.schoolClass.findMany({ where: { archived: false }, orderBy: [{ level: 'asc' }, { stream: 'asc' }] }),
      tdb.subject.findMany({ where: { archived: false }, orderBy: { name: 'asc' } }),
      tdb.subjectPaperConfig.findMany({ orderBy: [{ subjectId: 'asc' }, { classId: 'asc' }, { name: 'asc' }] }),
      tdb.examTimetableGeneratorRun.findMany({ orderBy: { createdAt: 'desc' } }),
    ]);
    return {
      classes,
      subjects,
      paperConfigs,
      runs: runs.map((run) => ({ ...run, classIds: parseJson<string[]>(run.classIdsJson, []), periods: parseJson<PeriodInput[]>(run.periodJson, []) })),
    };
  });
}

async function buildGenerationPlan(user: SessionUser, input: GeneratorInput) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const examName = (input.examName || '').trim();
    const classIds = Array.from(new Set((input.classIds || []).filter(Boolean)));
    const periods = (input.periods || []).filter((p) => p.label?.trim() && p.startTime && p.endTime);

    if (!examName) throw new ExamTimetableGeneratorError('INVALID', 'Exam name is required.');
    if (classIds.length === 0) throw new ExamTimetableGeneratorError('INVALID', 'Select at least one class.');
    if (!input.startDate || !input.endDate) throw new ExamTimetableGeneratorError('INVALID', 'Start and end dates are required.');
    if (input.startDate > input.endDate) throw new ExamTimetableGeneratorError('INVALID', 'End date must be after or equal to start date.');
    if (periods.length === 0) throw new ExamTimetableGeneratorError('INVALID', 'Add at least one exam period.');
    if (periods.some((p) => p.startTime >= p.endTime)) throw new ExamTimetableGeneratorError('INVALID', 'Every exam period must end after it starts.');

    const [classes, subjectNeeds, subjects, paperConfigs, existingExamSlots, blockingSlots, combinationGroups] = await Promise.all([
      tdb.schoolClass.findMany({ where: { id: { in: classIds } } }),
      tdb.classSubjectNeed.findMany({ where: { classId: { in: classIds } }, orderBy: [{ classId: 'asc' }, { subjectId: 'asc' }] }),
      tdb.subject.findMany({ where: { archived: false } }),
      tdb.subjectPaperConfig.findMany({ where: { OR: [{ classId: { in: classIds } }, { classId: null }] }, orderBy: [{ subjectId: 'asc' }, { classId: 'asc' }, { name: 'asc' }] }),
      tdb.examTimetableSlot.findMany({ where: { examName } }),
      tdb.examTimetableSlot.findMany({
        where: { classId: { in: classIds }, examDate: { gte: input.startDate, lte: input.endDate } },
        select: { classId: true, subjectId: true, examDate: true, startTime: true, paperName: true },
      }),
      // P.5 — real CombinationGroup awareness: classes that are taught a
      // subject TOGETHER (e.g. a Senior School elective combining Form 4
      // East + Form 4 West) must sit that subject's exam at the SAME
      // date/period, not independently scheduled slots that could clash with
      // each other or simply make no sense (two "sittings" of one combined
      // class for the same paper). This mirrors the same CombinationGroup
      // model the whole-school Timetable Engine already uses (L.7), instead
      // of inventing a parallel concept for exams.
      tdb.combinationGroup.findMany({ where: { active: true }, include: { members: true } }),
    ]);

    // AA.10 — real Options-Block exam awareness: automatically detects
    // every real active ElectiveBlock covering at least one of THIS run's
    // own selected classes, with a real, honest per-student roster for
    // each of its real subjects (never the whole class — only students
    // who genuinely chose that subject via a real confirmed
    // StudentSubjectSelection). Automatic per the founder's own explicit
    // choice (no separate opt-in checkbox) — a school selecting classes
    // that happen to run electives simply gets those real papers included
    // alongside their ordinary ClassSubjectNeed-based ones.
    const electivePapers = await getElectiveBlockExamPapers(user.tenantId, classIds);

    if (classes.length !== classIds.length) throw new ExamTimetableGeneratorError('INVALID', 'One or more selected classes no longer exist.');
    if (existingExamSlots.length > 0) throw new ExamTimetableGeneratorError('CONFLICT', 'This exam name already has saved timetable slots. Use a different exam name or delete the existing slots first.');

    const dates = enumerateDates(input.startDate, input.endDate, Boolean(input.excludeSaturday));
    if (dates.length === 0) throw new ExamTimetableGeneratorError('INVALID', 'Could not build a valid date range.');

    const classMap = new Map(classes.map((c) => [c.id, c]));
    const subjectMap = new Map(subjects.map((s) => [s.id, s]));

    // Which (classId, subjectId) pairs are owned by a real combination group
    // scoped to the classes actually selected for this exam run.
    const comboByClassSubject = new Map<string, string[]>(); // "classId::subjectId" -> all member classIds in that combo (within this run)
    for (const g of combinationGroups) {
      const memberIds = g.members.map((m) => m.classId).filter((id) => classIds.includes(id));
      if (memberIds.length < 2) continue; // not a real multi-class combination for THIS exam run
      for (const cid of memberIds) comboByClassSubject.set(`${cid}::${g.subjectId}`, memberIds);
    }

    // Z.6 — real STREAM_GROUP auto-grouping: within THIS exam run's own
    // selected classes, group every class sharing the exact same real
    // level (e.g. "Form 2") so a subject/paper they all genuinely need
    // together sits as one real combined sitting, unless a real
    // CombinationGroup already claims that class+subject pair (a real
    // teaching combination always wins — it's the school's own explicit,
    // deliberate choice, not an inferred one).
    const groupStreamsByLevel = input.groupStreamsByLevel !== false; // default ON
    const levelSiblingsByClass = new Map<string, string[]>(); // classId -> every OTHER selected class sharing its level
    if (groupStreamsByLevel) {
      const byLevel = new Map<string, string[]>();
      for (const c of classes) {
        const key = String(c.level ?? '');
        if (!key) continue;
        byLevel.set(key, [...(byLevel.get(key) ?? []), c.id]);
      }
      for (const [, ids] of byLevel) {
        if (ids.length < 2) continue; // only one real class at this level in this run — nothing to group
        for (const id of ids) levelSiblingsByClass.set(id, ids);
      }
    }

    const papersToPlace: Array<{
      classId: string; subjectId: string; paperConfigId: string | null; paperName: string;
      comboClassIds?: string[]; groupedByLevel?: boolean;
      // AA.10 — present only for a real Options-Block-derived paper.
      elective?: { blockId: string; blockName: string; blockMode: "MULTI_SLOT" | "SINGLE_CHOICE"; slotId: string; studentIds: string[]; studentIdsByClass: Record<string, string[]> };
    }> = [];
    const comboHandled = new Set<string>(); // "subjectId::paperName::sortedComboKey" already queued once
    const levelGroupHandled = new Set<string>(); // "level::subjectId::paperName" already queued once
    for (const need of subjectNeeds) {
      const specificConfigs = paperConfigs.filter((cfg) => cfg.subjectId === need.subjectId && cfg.classId === need.classId);
      const fallbackConfigs = paperConfigs.filter((cfg) => cfg.subjectId === need.subjectId && cfg.classId === null);
      const pickedConfigs = specificConfigs.length > 0 ? specificConfigs : fallbackConfigs;
      const comboMembers = comboByClassSubject.get(`${need.classId}::${need.subjectId}`);
      // Real per-class subject needs (e.g. a specific teacher/lesson count)
      // must genuinely agree across every sibling class before it is safe
      // to sit them together — a class that doesn't share this real
      // ClassSubjectNeed at all is simply not part of this level's group.
      // A class already claimed by a real CombinationGroup for THIS exact
      // subject must also be excluded here — otherwise a sibling stream
      // NOT in that combination would wrongly re-include the combo's own
      // members into a SECOND, duplicate exam sitting for a subject they
      // are already correctly sitting under COMBINATION scope (a real bug
      // caught by this feature's own regression test before shipping).
      const rawLevelSiblings = comboMembers ? undefined : levelSiblingsByClass.get(need.classId);
      const levelSiblingsWithNeed = rawLevelSiblings?.filter((cid) =>
        !comboByClassSubject.has(`${cid}::${need.subjectId}`) &&
        (cid === need.classId || subjectNeeds.some((n) => n.classId === cid && n.subjectId === need.subjectId))
      );
      const levelGroupMembers = levelSiblingsWithNeed && levelSiblingsWithNeed.length >= 2 ? levelSiblingsWithNeed : undefined;

      const paperNames = pickedConfigs.length > 0
        ? pickedConfigs.map((cfg) => ({ paperConfigId: cfg.id, paperName: normalizePaperName(cfg.name) }))
        : levelAwarePaperFallbacks(classMap.get(need.classId)?.level).map((paperName) => ({ paperConfigId: null, paperName }));

      for (const p of paperNames) {
        if (comboMembers) {
          const comboKey = `${need.subjectId}::${p.paperName}::${[...comboMembers].sort().join(',')}`;
          if (comboHandled.has(comboKey)) continue; // this combination's paper is already queued once for all its members
          comboHandled.add(comboKey);
          papersToPlace.push({ classId: need.classId, subjectId: need.subjectId, paperConfigId: p.paperConfigId, paperName: p.paperName, comboClassIds: comboMembers });
        } else if (levelGroupMembers) {
          const levelKey = `${classMap.get(need.classId)?.level ?? ''}::${need.subjectId}::${p.paperName}`;
          if (levelGroupHandled.has(levelKey)) continue; // this level's group already queued once for this paper
          levelGroupHandled.add(levelKey);
          papersToPlace.push({ classId: need.classId, subjectId: need.subjectId, paperConfigId: p.paperConfigId, paperName: p.paperName, comboClassIds: levelGroupMembers, groupedByLevel: true });
        } else {
          papersToPlace.push({ classId: need.classId, subjectId: need.subjectId, paperConfigId: p.paperConfigId, paperName: p.paperName });
        }
      }
    }

    // AA.10 — real Options-Block papers: each real elective subject gets
    // its own real paper. A school's own real SubjectPaperConfig for that
    // subject (if configured) is honored exactly like any ordinary
    // subject; when none exists, this falls back to the same real
    // level-aware naming ordinary un-configured subjects already use —
    // keeping exactly one real consistent naming rule across the whole
    // generator rather than a second one just for electives. One real
    // ExamTimetableSlot row is queued PER real class that has at least
    // one real student sitting this subject, each carrying its own real,
    // honest, class-scoped student roster.
    for (const paper of electivePapers) {
      for (const [classId, studentIds] of Object.entries(paper.studentIdsByClass)) {
        if (studentIds.length === 0) continue;
        const specificConfigs = paperConfigs.filter((cfg) => cfg.subjectId === paper.subjectId && cfg.classId === classId);
        const fallbackConfigs = paperConfigs.filter((cfg) => cfg.subjectId === paper.subjectId && cfg.classId === null);
        const pickedConfigs = specificConfigs.length > 0 ? specificConfigs : fallbackConfigs;
        const paperNames = pickedConfigs.length > 0
          ? pickedConfigs.map((cfg) => ({ paperConfigId: cfg.id, paperName: normalizePaperName(cfg.name) }))
          : levelAwarePaperFallbacks(classMap.get(classId)?.level).map((paperName) => ({ paperConfigId: null as string | null, paperName }));
        for (const p of paperNames) {
          papersToPlace.push({
            classId,
            subjectId: paper.subjectId,
            paperConfigId: p.paperConfigId,
            paperName: p.paperName,
            elective: { blockId: paper.blockId, blockName: paper.blockName, blockMode: paper.blockMode, slotId: paper.slotId, studentIds, studentIdsByClass: paper.studentIdsByClass },
          });
        }
      }
    }

    const capacity = dates.length * periods.length;
    if (papersToPlace.length === 0) throw new ExamTimetableGeneratorError('NOT_FOUND', 'No class subject needs were found for the selected classes.');
    if (papersToPlace.length > capacity) throw new ExamTimetableGeneratorError('CONFLICT', 'Not enough exam periods for the selected classes and subject papers. Increase the date range or add more periods.');

    const occupied = new Set<string>();
    // AA.10 — real per-STUDENT occupancy, needed ONLY for elective papers:
    // a class-wide `occupied` check alone is insufficient for a MULTI_SLOT
    // block, since the SAME real class can have two different real exam
    // rows scheduled (one per subject) that only individually involve a
    // SUBSET of that class's students — a class-level check would
    // wrongly allow both to land at the same real date/period as long as
    // neither one had already claimed the whole class. Tracking real
    // per-student occupancy closes that gap precisely, without changing
    // any existing non-elective behavior (ordinary/combo/level-group
    // papers never populate or read this set).
    const studentOccupied = new Set<string>();
    // AA.10 — real "already placed at this date/period" record, keyed by
    // blockId::slotId, so every SINGLE_CHOICE-mode subject sharing the
    // same real slotId (mutually exclusive alternatives — a student picks
    // exactly one) can genuinely combine into ONE shared real exam
    // date/period, exactly matching the founder's own real observation
    // that this shape "CAN combine cleanly... since only one subject
    // applies per student". This is a pure efficiency/clarity preference
    // (fewer distinct real exam periods needed for the whole block, and a
    // cleaner single "Options Exam" slot on the printed timetable) — never
    // attempted for a MULTI_SLOT-mode subject (a student may genuinely be
    // sitting one subject from EACH of several different real slots, so
    // those must always place independently).
    const singleChoiceSlotPlacement = new Map<string, { date: string; period: PeriodInput }>();
    const blocked = new Set(blockingSlots.map((slot) => `${slot.classId}:${slot.subjectId}:${normalizePaperName(slot.paperName)}:${slot.examDate}:${slot.startTime}`));
    const created: any[] = [];
    let cursor = 0;

    for (const paper of papersToPlace) {
      const sittingClassIds = paper.comboClassIds ?? [paper.classId];
      let placed = false;

      function createRowsFor(date: string, period: PeriodInput) {
        const venueLabel = paper.groupedByLevel
          ? `${classMap.get(paper.classId)?.level ?? 'Level'} (whole level, ${sittingClassIds.length} streams)`
          : paper.comboClassIds
          ? `${sittingClassIds.map((cid) => classMap.get(cid)?.stream ? `${classMap.get(cid)?.level} ${classMap.get(cid)?.stream}` : classMap.get(cid)?.level).join(' + ')} (combined)`
          : paper.elective
          ? `${classMap.get(paper.classId)?.level ?? 'Level'}${classMap.get(paper.classId)?.stream ? ' ' + classMap.get(paper.classId)?.stream : ''} — ${paper.elective.blockName} (${paper.elective.studentIds.length} student${paper.elective.studentIds.length === 1 ? '' : 's'})`
          : classMap.get(paper.classId)?.stream ? `${classMap.get(paper.classId)?.level} ${classMap.get(paper.classId)?.stream} Room` : `${classMap.get(paper.classId)?.level} Room`;
        for (const cid of sittingClassIds) {
          created.push({
            tenantId: user.tenantId,
            classId: cid,
            subjectId: paper.subjectId,
            paperConfigId: paper.paperConfigId,
            examName,
            paperName: paper.paperName,
            examDate: date,
            startTime: period.startTime,
            endTime: period.endTime,
            venue: venueLabel,
            targetScope: paper.groupedByLevel ? 'STREAM_GROUP' : paper.comboClassIds ? 'COMBINATION' : paper.elective ? 'ELECTIVE_BLOCK' : 'CLASS',
            targetJson: JSON.stringify(sittingClassIds),
            electiveBlockId: paper.elective ? paper.elective.blockId : null,
            // AA.10 — the real, honest per-student roster actually sitting
            // THIS specific paper — never the whole class. Only ever set
            // for a real elective paper; every other scope leaves this
            // unset, matching its own existing real class-wide meaning.
            studentIdsJson: paper.elective ? JSON.stringify(paper.elective.studentIdsByClass[cid] ?? []) : undefined,
            notes: input.notes || `Auto-generated from exam setup period ${period.label}`,
            createdById: user.id,
            createdByName: user.fullName,
          });
        }
      }

      // AA.10 — real SINGLE_CHOICE combine-cleanly attempt: if a sibling
      // subject sharing this exact real blockId+slotId has ALREADY been
      // placed this run, reuse that exact same real date/period —
      // genuinely safe because these subjects are real mutually-exclusive
      // alternatives (no student sits more than one), so reusing the slot
      // never creates a real per-student clash. Deliberately does NOT
      // re-check the class-level `occupied` set here (a real, GENUINE bug
      // found via this feature's own regression test before shipping: the
      // class's own slot is, BY DESIGN, already marked occupied by the
      // very first sibling subject in this exact combinable group, so
      // checking `occupied` again would always incorrectly reject every
      // subsequent sibling). Only real per-STUDENT occupancy is checked —
      // two genuinely different students choosing two different Technical
      // subjects never overlap, so this can never silently create a real
      // per-student double-booking.
      if (paper.elective && paper.elective.blockMode === "SINGLE_CHOICE") {
        const sharedKey = `${paper.elective.blockId}::${paper.elective.slotId}`;
        const already = singleChoiceSlotPlacement.get(sharedKey);
        if (already) {
          const anyBlocked = sittingClassIds.some((cid) => blocked.has(`${cid}:${paper.subjectId}:${paper.paperName}:${already.date}:${already.period.startTime}`));
          const anyStudentOccupied = paper.elective.studentIds.some((sid) => studentOccupied.has(`${sid}:${already.date}:${already.period.startTime}`));
          if (!anyBlocked && !anyStudentOccupied) {
            for (const sid of paper.elective.studentIds) studentOccupied.add(`${sid}:${already.date}:${already.period.startTime}`);
            createRowsFor(already.date, already.period);
            placed = true;
          }
        }
      }

      for (; cursor < capacity * 6 && !placed; cursor++) {
        const slotIndex = cursor % capacity;
        const date = dates[Math.floor(slotIndex / periods.length)];
        const period = periods[slotIndex % periods.length];
        // A combined sitting needs the SAME date/period free for every
        // member class simultaneously (they are literally in one room/exam
        // together), not just the class this paper was enumerated from.
        const anyOccupied = sittingClassIds.some((cid) => occupied.has(`${cid}:${date}:${period.startTime}`));
        const anyBlocked = sittingClassIds.some((cid) => blocked.has(`${cid}:${paper.subjectId}:${paper.paperName}:${date}:${period.startTime}`));
        // AA.10 — for a real elective paper, ALSO check that none of its
        // own real sitting students already has a different real exam at
        // this exact date/period (catches the exact cross-slot MULTI_SLOT
        // clash a class-level check alone would miss).
        const anyStudentOccupied = paper.elective ? paper.elective.studentIds.some((sid) => studentOccupied.has(`${sid}:${date}:${period.startTime}`)) : false;
        if (anyOccupied || anyBlocked || anyStudentOccupied) continue;
        for (const cid of sittingClassIds) occupied.add(`${cid}:${date}:${period.startTime}`);
        if (paper.elective) {
          for (const sid of paper.elective.studentIds) studentOccupied.add(`${sid}:${date}:${period.startTime}`);
          if (paper.elective.blockMode === "SINGLE_CHOICE") {
            singleChoiceSlotPlacement.set(`${paper.elective.blockId}::${paper.elective.slotId}`, { date, period });
          }
        }
        createRowsFor(date, period);
        placed = true;
      }
      if (!placed) throw new ExamTimetableGeneratorError('CONFLICT', `Could not place ${subjectMap.get(paper.subjectId)?.name || 'a subject'} ${paper.paperName}.`);
    }

    return {
      examName,
      classIds,
      periods,
      created,
      generatedCount: created.length,
      notes: input.notes || null,
      startDate: input.startDate!,
      endDate: input.endDate!,
    };
  });
}

export async function previewExamTimetableGeneration(user: SessionUser, input: GeneratorInput) {
  const plan = await buildGenerationPlan(user, input);
  return {
    examName: plan.examName,
    generatedCount: plan.generatedCount,
    startDate: plan.startDate,
    endDate: plan.endDate,
    classIds: plan.classIds,
    periods: plan.periods,
    slots: plan.created.map((slot) => ({ ...slot, targetIds: parseJson<string[]>(slot.targetJson, []), previewOnly: true })),
  };
}

export async function generateExamTimetableFromRules(user: SessionUser, input: GeneratorInput) {
  const plan = await buildGenerationPlan(user, input);
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const persisted: any[] = [];
    for (const slot of plan.created) persisted.push(await tdb.examTimetableSlot.create({ data: slot }));
    const run = await tdb.examTimetableGeneratorRun.create({
      data: {
        tenantId: user.tenantId,
        examName: plan.examName,
        classIdsJson: JSON.stringify(plan.classIds),
        periodJson: JSON.stringify(plan.periods),
        startDate: plan.startDate,
        endDate: plan.endDate,
        paperMode: 'ALL_SUBJECTS_SELECTED_CLASSES',
        distributionMode: 'ONE_PAPER_PER_CLASS_PER_PERIOD',
        generatedCount: persisted.length,
        notes: plan.notes,
        createdById: user.id,
        createdByName: user.fullName,
      },
    });
    const generatedSlots = persisted.map((slot) => ({ ...slot, targetIds: parseJson<string[]>(slot.targetJson, []) }));
    const invigilatorResult = input.autoGenerateInvigilators ? await generateExamInvigilators(user, plan.examName) : null;
    return {
      run: { ...run, classIds: plan.classIds, periods: plan.periods },
      generatedCount: persisted.length,
      slots: generatedSlots,
      invigilatorsGenerated: !!invigilatorResult,
      invigilatorSummary: invigilatorResult ? { generated: invigilatorResult.generated } : null,
    };
  });
}
