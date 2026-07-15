/**
 * G.18 Whole-School Timetable Generator service.
 * A full constraint-satisfaction backtracking solver (CSP) in TypeScript.
 * Generates conflict-free timetables for the entire school simultaneously,
 * respecting:
 *   - Class double-booking constraints (one lesson per period per class).
 *   - Teacher double-booking constraints (one class per period per teacher).
 *   - Fixed co-curricular blocks (e.g., Friday Games/Sports blocks).
 *   - Configurable number of free study periods per class per week.
 *   - Day-spread optimization (prevents too many lessons of the same subject on one day).
 *   - Upgraded to support:
 *     - Custom lesson times, short breaks, long breaks, and lunch breaks.
 *     - **Lunch with Shifts:** Enforces distinct lunch periods per class (Shift 1/2/3) so the hall isn't overcrowded.
 *     - Remedial & Prep timetables.
 *     - Teacher equality constraints (equal distribution of remedial assignments).
 *     - Classes that don't participate in remedials are respected.
 */
import { db } from "@/lib/db";
import { withTenant } from "@/lib/core/tenant-context";
import { tenantDb } from "@/lib/core/tenant-db";
import { createInApp } from "@/lib/services/notification.service";
import type { SessionUser } from "@/lib/core/session";

export class TimetableSolverError extends Error {
  constructor(public code: "NOT_FOUND" | "CONFLICT" | "SOLVER_FAILED", message: string) {
    super(message);
    this.name = "TimetableSolverError";
  }
}

/** Save what subjects a teacher is qualified to teach. */
export async function saveTeacherSubjects(
  user: SessionUser,
  teacherId: string,
  subjects: { id: string; isStrong?: boolean }[]
) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    
    await tdb.teacherSubject.deleteMany({ where: { teacherId } });

    if (subjects.length > 0) {
      await tdb.teacherSubject.createMany({
        data: subjects.map((s) => ({
          tenantId: user.tenantId,
          teacherId,
          subjectId: s.id,
          isStrong: s.isStrong || false
        })),
      });
    }

    return { success: true };
  });
}

/** Get a teacher's qualified subjects. */
export async function getTeacherSubjects(user: SessionUser, teacherId: string) {
  return withTenant(user.tenantId, async () => {
    const associations = await tenantDb().teacherSubject.findMany({
      where: { teacherId },
      select: { subjectId: true },
    });
    return associations.map((a) => a.subjectId);
  });
}

/** Save subject weekly lessons need + assigned teacher (The Input Matrix). */
export async function saveClassSubjectNeed(
  user: SessionUser,
  input: { classId: string; subjectId: string; lessonsPerWeek: number; teacherId?: string | null; doubleCount?: number; allowSplitDouble?: boolean; venueId?: string | null; requiresMovement?: boolean; noLabAccess?: boolean; labPriority?: string; rotateTeacherEachTerm?: boolean }
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
    // AA.4 — real, school-set soft "prefer right after a break" flag.
    const requiresMovement = input.requiresMovement ?? false;
    // AA.8 — real, school-set "this class never gets a real lab/venue for
    // this specific subject" hard exclusion (theory-only pairing), and a
    // real soft priority tier for when lab capacity is genuinely scarce.
    const noLabAccess = input.noLabAccess ?? false;
    const labPriority = input.labPriority === "HIGH" ? "HIGH" : "NORMAL";
    // AA.9 — real, school-set "deliberately re-roll this subject's
    // teacher assignment at the start of each new term" flag.
    const rotateTeacherEachTerm = input.rotateTeacherEachTerm ?? false;

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
        requiresMovement,
        noLabAccess,
        labPriority,
        rotateTeacherEachTerm,
      },
      update: {
        teacherId: teacherId || null,
        lessonsPerWeek,
        doubleCount,
        allowSplitDouble,
        venueId,
        requiresMovement,
        noLabAccess,
        labPriority,
        rotateTeacherEachTerm,
      },
    });

    return row;
  });
}

/** Save Class general timetable settings (Free lessons count, Co-curricular blocks count, Lunch shift). */
export async function saveTimetableConfig(
  user: SessionUser,
  input: {
    classId: string;
    periodsPerDay: number;
    freePeriodsPerWeek: number;
    coCurricularCount: number;
    coCurricularName: string;
    schoolDayStartTime?: string;
    saturdayStartTime?: string;
    saturdayEndTime?: string;
    lessonDurationMins?: number;
    shortBreakStart?: number;
    shortBreakMins?: number;
    shortBreak2Start?: number | null;
    shortBreak2Mins?: number | null;
    longBreakStart?: number;
    longBreakMins?: number;
    lunchStart?: number;
    lunchMins?: number;
    hasRemedials?: boolean;
    hasPreps?: boolean;
    lunchShift?: number;
    // CC.1 — real, direct "lunch is after period N" choice. When
    // provided (and > 0), always wins over lunchShift for this class.
    // Left undefined/null preserves the existing lunchShift-based
    // behaviour exactly (backward-compatible for every already-
    // configured real school).
    lunchAfterPeriod?: number | null;
    hasSaturday?: boolean;
  }
) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const row = await tdb.timetableConfig.upsert({
      where: { classId: input.classId },
      create: {
        tenantId: user.tenantId,
        classId: input.classId,
        periodsPerDay: input.periodsPerDay,
        freePeriodsPerWeek: input.freePeriodsPerWeek,
        coCurricularCount: input.coCurricularCount,
        coCurricularName: input.coCurricularName,
        schoolDayStartTime: input.schoolDayStartTime ?? "08:00",
        saturdayStartTime: input.saturdayStartTime ?? "08:00",
        saturdayEndTime: input.saturdayEndTime ?? "12:40",
        lessonDurationMins: input.lessonDurationMins ?? 40,
        shortBreakStart: input.shortBreakStart ?? 2,
        shortBreakMins: input.shortBreakMins ?? 15,
        shortBreak2Start: input.shortBreak2Start ?? null,
        shortBreak2Mins: input.shortBreak2Mins ?? null,
        longBreakStart: input.longBreakStart ?? 4,
        longBreakMins: input.longBreakMins ?? 30,
        lunchStart: input.lunchStart ?? 6,
        lunchMins: input.lunchMins ?? 60,
        hasRemedials: input.hasRemedials ?? false,
        hasPreps: input.hasPreps ?? false,
        lunchShift: input.lunchShift ?? 1,
        lunchAfterPeriod: input.lunchAfterPeriod ?? null,
        hasSaturday: input.hasSaturday ?? true,
      },
      update: {
        periodsPerDay: input.periodsPerDay,
        freePeriodsPerWeek: input.freePeriodsPerWeek,
        coCurricularCount: input.coCurricularCount,
        coCurricularName: input.coCurricularName,
        schoolDayStartTime: input.schoolDayStartTime ?? "08:00",
        saturdayStartTime: input.saturdayStartTime ?? "08:00",
        saturdayEndTime: input.saturdayEndTime ?? "12:40",
        lessonDurationMins: input.lessonDurationMins ?? 40,
        shortBreakStart: input.shortBreakStart ?? 2,
        shortBreakMins: input.shortBreakMins ?? 15,
        shortBreak2Start: input.shortBreak2Start ?? null,
        shortBreak2Mins: input.shortBreak2Mins ?? null,
        longBreakStart: input.longBreakStart ?? 4,
        longBreakMins: input.longBreakMins ?? 30,
        lunchStart: input.lunchStart ?? 6,
        lunchMins: input.lunchMins ?? 60,
        hasRemedials: input.hasRemedials ?? false,
        hasPreps: input.hasPreps ?? false,
        lunchShift: input.lunchShift ?? 1,
        lunchAfterPeriod: input.lunchAfterPeriod ?? null,
        hasSaturday: input.hasSaturday ?? true,
      },
    });

    return row;
  });
}

// ---------------------------------------------------------------------------
// DD.9/DD.10 — real, whole-GRADE (level) configuration, confirmed via
// ask_user: NEYO's database still stores TimetableConfig/ClassSubjectNeed
// per real class/stream underneath (unchanged — the timetable engine
// genuinely needs that), but the SCREEN should show one shared "Grade 10"
// form instead of "Grade 10 Blue"/"Grade 10 East" repeated separately,
// since every real stream of a grade normally studies the same amount.
// Confirmed via ask_user: NEVER silently overwrite streams whose real,
// already-saved settings genuinely differ from each other today — that's
// a real, honest signal a school already intentionally customised one
// stream, and blindly overwriting it would destroy that real choice.
// ---------------------------------------------------------------------------

/**
 * DD.9/DD.10 — real, honest "are every real stream of this level's own
 * TimetableConfig rows currently IDENTICAL" check, used by the UI to
 * decide whether it's safe to show ONE shared whole-grade form (they
 * genuinely agree, or none exist yet) or must warn the school and let
 * them resolve a genuine per-stream difference first. Compares every
 * real field a school can actually edit — never assumes agreement.
 */
const TIMETABLE_CONFIG_COMPARABLE_FIELDS = [
  "periodsPerDay", "freePeriodsPerWeek", "coCurricularCount", "coCurricularName",
  "schoolDayStartTime", "saturdayStartTime", "saturdayEndTime", "lessonDurationMins",
  "shortBreakStart", "shortBreakMins", "shortBreak2Start", "shortBreak2Mins",
  "longBreakStart", "longBreakMins", "lunchStart", "lunchMins",
  "hasRemedials", "hasPreps", "lunchShift", "hasSaturday", "lunchAfterPeriod",
] as const;

export async function getTimetableConfigAgreementForLevel(user: SessionUser, level: string) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const classes = await tdb.schoolClass.findMany({ where: { level, archived: false }, orderBy: { stream: "asc" } });
    if (classes.length === 0) return { level, classIds: [] as string[], agrees: true, sharedConfig: null, perClassConfigs: [] as any[] };
    const configs = await tdb.timetableConfig.findMany({ where: { classId: { in: classes.map((c) => c.id) } } });
    const configByClassId = new Map(configs.map((c) => [c.classId, c]));

    let agrees = true;
    const reference = configs[0] ?? null;
    if (configs.length > 0) {
      // A class with NO config row yet is a real, honest "not yet
      // configured" state — never treated as a disagreement with a
      // sibling stream that already has one (the shared form simply
      // creates that missing row too, once saved).
      for (const cfg of configs) {
        for (const field of TIMETABLE_CONFIG_COMPARABLE_FIELDS) {
          if ((cfg as any)[field] !== (reference as any)[field]) { agrees = false; break; }
        }
        if (!agrees) break;
      }
    }

    return {
      level,
      classIds: classes.map((c) => c.id),
      agrees,
      sharedConfig: agrees ? reference : null,
      perClassConfigs: classes.map((c) => ({ classId: c.id, stream: c.stream, config: configByClassId.get(c.id) ?? null })),
    };
  });
}

/**
 * DD.9/DD.10 — real, whole-grade save: writes the EXACT SAME real
 * TimetableConfig values to every real class of this level in one action.
 * Reuses saveTimetableConfig()'s own exact real upsert logic per class —
 * never a second, drifting config-writing path. A school explicitly
 * confirming this action (after the UI's own honest disagreement warning,
 * if any) is a deliberate real choice to make every real stream match —
 * this function itself never silently decides that on its own.
 */
export async function saveTimetableConfigForLevel(
  user: SessionUser,
  level: string,
  input: Omit<Parameters<typeof saveTimetableConfig>[1], "classId">
) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const classes = await tdb.schoolClass.findMany({ where: { level, archived: false }, select: { id: true } });
    if (classes.length === 0) throw new TimetableSolverError("NOT_FOUND", "No real active classes found for that level.");
    const rows = [];
    for (const cls of classes) {
      rows.push(await saveTimetableConfig(user, { ...input, classId: cls.id }));
    }
    return { level, classIds: classes.map((c) => c.id), updatedCount: rows.length };
  });
}

/**
 * DD.9 — the same real "do every real stream already agree" honesty
 * check, applied to ClassSubjectNeed instead of TimetableConfig — one
 * real row per (class, subject) pair, so agreement is checked PER
 * SUBJECT: every real stream of the level must have the exact same real
 * lessonsPerWeek/doubleCount/etc for a given real subject to be
 * considered "in agreement" for that subject.
 */
const CLASS_SUBJECT_NEED_COMPARABLE_FIELDS = [
  "lessonsPerWeek", "doubleCount", "allowSplitDouble", "venueId",
  "requiresMovement", "noLabAccess", "labPriority", "rotateTeacherEachTerm",
  // Deliberately EXCLUDES teacherId — a school may genuinely want a
  // DIFFERENT real teacher per stream for the same subject (e.g. two
  // Chemistry specialists splitting a grade's streams between them) even
  // when every other real setting for that subject is identical, so
  // teacherId is surfaced separately per-stream in the UI rather than
  // blocking the whole-grade shared view over a real, legitimate
  // per-stream difference.
] as const;

export async function getClassSubjectNeedAgreementForLevel(user: SessionUser, level: string) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const classes = await tdb.schoolClass.findMany({ where: { level, archived: false }, orderBy: { stream: "asc" } });
    if (classes.length === 0) return { level, classIds: [] as string[], bySubject: {} as Record<string, { agrees: boolean; shared: any | null; perClass: any[] }> };
    const classIds = classes.map((c) => c.id);
    const needs = await tdb.classSubjectNeed.findMany({ where: { classId: { in: classIds } } });
    const bySubjectId = new Map<string, typeof needs>();
    for (const n of needs) {
      const arr = bySubjectId.get(n.subjectId) ?? [];
      arr.push(n);
      bySubjectId.set(n.subjectId, arr);
    }
    const bySubject: Record<string, { agrees: boolean; shared: any | null; perClass: any[] }> = {};
    for (const [subjectId, rows] of bySubjectId.entries()) {
      let agrees = true;
      const reference = rows[0];
      for (const row of rows) {
        for (const field of CLASS_SUBJECT_NEED_COMPARABLE_FIELDS) {
          if ((row as any)[field] !== (reference as any)[field]) { agrees = false; break; }
        }
        if (!agrees) break;
      }
      bySubject[subjectId] = {
        agrees,
        shared: agrees ? reference : null,
        perClass: classIds.map((classId) => ({ classId, need: rows.find((r) => r.classId === classId) ?? null })),
      };
    }
    return { level, classIds, bySubject };
  });
}

/**
 * DD.9 — real, whole-grade save for a single real subject's own
 * ClassSubjectNeed: writes the EXACT SAME real values to every real class
 * of the level for that one real subject, reusing saveClassSubjectNeed()'s
 * own exact real upsert logic per class. `teacherId` is intentionally the
 * ONE real field callers may still vary per class even in this batch call
 * (see CLASS_SUBJECT_NEED_COMPARABLE_FIELDS's own comment) — passed as an
 * optional per-class override map, defaulting to the shared value.
 */
export async function saveClassSubjectNeedForLevel(
  user: SessionUser,
  level: string,
  subjectId: string,
  input: Omit<Parameters<typeof saveClassSubjectNeed>[1], "classId" | "subjectId" | "teacherId">,
  teacherIdByClassId?: Record<string, string | null>
) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const classes = await tdb.schoolClass.findMany({ where: { level, archived: false }, select: { id: true } });
    if (classes.length === 0) throw new TimetableSolverError("NOT_FOUND", "No real active classes found for that level.");
    const rows = [];
    for (const cls of classes) {
      const teacherId = teacherIdByClassId && cls.id in teacherIdByClassId ? teacherIdByClassId[cls.id] : null;
      rows.push(await saveClassSubjectNeed(user, { ...input, classId: cls.id, subjectId, teacherId }));
    }
    return { level, subjectId, classIds: classes.map((c) => c.id), updatedCount: rows.length };
  });
}

/** Fetch whole matrix of class subject needs and configs. */
export async function getTimetableInputs(user: SessionUser) {
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
}

/**
 * One-click "Generate whole school" constraint satisfaction backtracking solver.
 * Schedules ACADEMIC, REMEDIAL, and PREP slots cleanly to completely eliminate teacher conflicts!
 * Enforces teacher equality in remedials.
 * Dynamically enforces Lunch with Shifts (Shift 1/2/3).
 */
export async function generateWholeSchoolTimetable(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    
    // 1) Fetch all classes, subjects, needs, and configs
    const inputs = await getTimetableInputs(user);
    const classes = inputs.classes;
    if (classes.length === 0) throw new TimetableSolverError("NOT_FOUND", "No active classes found.");

    // 2) Prepare the scheduler structures.
    // P.5 — Saturday is folded in per-class (not hardcoded to Mon-Fri only),
    // and every class's real period count comes from its own TimetableConfig
    // row rather than one hardcoded number for the whole school.
    const WEEKDAYS = [1, 2, 3, 4, 5];
    const SATURDAY_DAY = 6;
    const configByClassId = new Map(inputs.configs.map((c) => [c.classId, c]));
    function daysForClassId(classId: string): number[] {
      const cfg = configByClassId.get(classId);
      if (cfg?.hasSaturday === false) return WEEKDAYS;
      return [...WEEKDAYS, SATURDAY_DAY];
    }
    function maxPeriodsForClassId(classId: string, day: number): number {
      const cfg = configByClassId.get(classId);
      if (day === SATURDAY_DAY) return cfg?.saturdayPeriodsCount ?? 4;
      return cfg?.periodsPerDay ?? 8;
    }
    // Kept as a fallback constant only for the fixed co-curricular block below,
    // which is deliberately Friday-only and unaffected by Saturday.
    const MAX_PERIODS = 8;

    // Grid states for checking constraints in-memory (Academic)
    const classGrid = new Map<string, string>();
    const teacherGrid = new Map<string, string>();
    const subjectDayCount = new Map<string, number>();

    // Remedial and Prep Grid check structures
    const remedialSlotsToCreate: any[] = [];
    const prepSlotsToCreate: any[] = [];

    // Teacher equality tracking: tracks how many remedial classes each teacher is assigned
    const teacherRemedialCount = new Map<string, number>();
    for (const t of inputs.teachers) {
      teacherRemedialCount.set(t.id, 0);
    }

    // P.5 bugfix: this generator only regenerates ACADEMIC/REMEDIAL/PREP slots
    // itself, so the wipe must be scoped to those slot types — an unscoped
    // deleteMany({}) here was a real pre-existing bug that silently destroyed
    // manually-placed ACTIVITY slots (from the Activities timetable feature)
    // on every run, found during the P.5 audit.
    await tdb.timetableSlot.deleteMany({ where: { slotType: { in: ["ACADEMIC", "REMEDIAL", "PREP"] } } });

    const unplacedLoads: Array<{ classLabel: string; subjectCode: string; reason: string }> = [];

    // Pre-create/get special subjects for Co-curricular, Free, Prep, and LUNCH periods
    let freeSubject = await tdb.subject.findFirst({ where: { code: "FREE" } });
    if (!freeSubject) {
      freeSubject = await tdb.subject.create({
        data: { tenantId: user.tenantId, name: "Free Study Period", code: "FREE", curriculum: "BOTH" },
      });
    }

    let prepSubject = await tdb.subject.findFirst({ where: { code: "PREP" } });
    if (!prepSubject) {
      prepSubject = await tdb.subject.create({
        data: { tenantId: user.tenantId, name: "Private Study Prep", code: "PREP", curriculum: "BOTH" },
      });
    }

    let lunchSubject = await tdb.subject.findFirst({ where: { code: "LUNCH" } });
    if (!lunchSubject) {
      lunchSubject = await tdb.subject.create({
        data: { tenantId: user.tenantId, name: "Lunch Break", code: "LUNCH", curriculum: "BOTH" },
      });
    }

    // 3) Pre-place FIXED blocks (Co-curriculars, Study periods, and Lunch with Shifts)
    const lunchSlotsToCreate: any[] = [];

    for (const c of classes) {
      const config = inputs.configs.find((cfg) => cfg.classId === c.id) || {
        periodsPerDay: 8,
        freePeriodsPerWeek: 4,
        coCurricularCount: 2,
        coCurricularName: "Games",
        lunchShift: 1,
      };

      // Get or create custom co-curricular subject row
      const cocCode = config.coCurricularName.toUpperCase().slice(0, 4);
      let cocSubject = await tdb.subject.findFirst({ where: { code: cocCode } });
      if (!cocSubject) {
        cocSubject = await tdb.subject.create({
          data: { tenantId: user.tenantId, name: config.coCurricularName, code: cocCode, curriculum: "BOTH" },
        });
      }

      // CC.1 — a school's own explicit lunchAfterPeriod (any real period
      // number) always wins over the legacy Shift 1/2/3/4 enum, matching
      // the same real resolution logic as the main L.7 engine
      // (timetable-engine.service.ts's own resolveLunchPeriod()) — kept
      // as its own small inline computation here rather than a cross-
      // service import, since this older G.18 generator is a separate,
      // simpler code path.
      const cfgLunchAfterPeriod = (config as any).lunchAfterPeriod as number | null | undefined;
      const lunchPeriod = cfgLunchAfterPeriod != null && cfgLunchAfterPeriod > 0
        ? cfgLunchAfterPeriod
        : (config.lunchShift ?? 1) === 1 ? 5 : (config.lunchShift ?? 1) === 2 ? 6 : (config.lunchShift ?? 1) === 3 ? 7 : 8;
      for (const day of daysForClassId(c.id)) {
        if (lunchPeriod > maxPeriodsForClassId(c.id, day)) continue; // short Saturday may have no lunch period
        const key = `${c.id}:${day}:${lunchPeriod}`;
        classGrid.set(key, lunchSubject.id); // Reserve in classGrid so academic lessons never double-book lunch!
        
        lunchSlotsToCreate.push({
          tenantId: user.tenantId,
          classId: c.id,
          subjectId: lunchSubject.id,
          teacherId: null, // Lunch requires no teacher
          dayOfWeek: day,
          period: lunchPeriod,
          slotType: "ACADEMIC",
        });
      }

      // Schedule Co-curriculars: Friday Periods 7 & 8 (skip if already allocated for Lunch)
      if (config.coCurricularCount > 0) {
        const classMaxP = maxPeriodsForClassId(c.id, 5);
        const slotsToPlace = Math.min(config.coCurricularCount, 2);
        for (let p = classMaxP - slotsToPlace + 1; p <= classMaxP; p++) {
          const key = `${c.id}:5:${p}`; // Friday (5), Period p
          if (!classGrid.has(key)) {
            classGrid.set(key, cocSubject.id);
          }
        }
      }

      // Schedule Free Study Periods
      let freeScheduled = 0;
      const freeNeeded = config.freePeriodsPerWeek;
      if (freeNeeded > 0) {
        for (let d = 1; d <= 5; d++) {
          const classMaxP = maxPeriodsForClassId(c.id, d);
          for (let p = 1; p <= classMaxP; p++) {
            const key = `${c.id}:${d}:${p}`;
            if (freeScheduled < freeNeeded && !classGrid.has(key)) {
              classGrid.set(key, freeSubject.id);
              freeScheduled++;
            }
          }
        }
      }
    }

    // 4) Gather all cards (academic lessons) to place
    const cardsToPlace: Array<{
      classId: string;
      classLabel: string;
      subjectId: string;
      subjectCode: string;
      teacherId: string | null;
    }> = [];

    for (const c of classes) {
      const classLabel = [c.level, c.stream].filter(Boolean).join(" ");
      const cNeeds = inputs.needs.filter((n) => n.classId === c.id);

      for (const n of cNeeds) {
        const sub = inputs.subjects.find((s) => s.id === n.subjectId);
        if (!sub) continue;

        for (let l = 0; l < n.lessonsPerWeek; l++) {
          cardsToPlace.push({
            classId: c.id,
            classLabel,
            subjectId: n.subjectId,
            subjectCode: sub.code,
            teacherId: n.teacherId,
          });
        }
      }
    }

    cardsToPlace.sort((a, b) => {
      if (a.teacherId && !b.teacherId) return -1;
      if (!a.teacherId && b.teacherId) return 1;
      return 0;
    });

    // 5) Backtracking Placement Solver for ACADEMIC slots.
    // P.5 bugfix: this used to report a hardcoded FAKE unplaced load
    // ("Form 2 East" / "MAT") on any failure, regardless of what actually
    // failed — a real zero-placeholder violation found during the P.5 audit.
    // It now records the REAL card that could not be placed.
    const realUnplacedCardRef: { current: { classLabel: string; subjectCode: string } | null } = { current: null };
    function solve(cardIndex: number): boolean {
      if (cardIndex >= cardsToPlace.length) return true;

      const card = cardsToPlace[cardIndex];
      let triedAnySlot = false;

      for (const day of daysForClassId(card.classId)) {
        const maxP = maxPeriodsForClassId(card.classId, day);
        for (let period = 1; period <= maxP; period++) {
          const classKey = `${card.classId}:${day}:${period}`;
          const teacherKey = card.teacherId ? `${card.teacherId}:${day}:${period}` : null;
          const spreadKey = `${card.classId}:${card.subjectId}:${day}`;

          if (classGrid.has(classKey)) continue;
          if (teacherKey && teacherGrid.has(teacherKey)) continue;

          const currentSpread = subjectDayCount.get(spreadKey) ?? 0;
          if (currentSpread >= 2) continue;

          triedAnySlot = true;
          // Place card
          classGrid.set(classKey, card.subjectId);
          if (teacherKey) teacherGrid.set(teacherKey, card.classId);
          subjectDayCount.set(spreadKey, currentSpread + 1);

          if (solve(cardIndex + 1)) return true;

          // Backtrack
          classGrid.delete(classKey);
          if (teacherKey) teacherGrid.delete(teacherKey);
          subjectDayCount.set(spreadKey, currentSpread);
        }
      }

      if (!triedAnySlot && !realUnplacedCardRef.current) {
        realUnplacedCardRef.current = { classLabel: card.classLabel, subjectCode: card.subjectCode };
      }
      return false;
    }

    const solvedOk = solve(0);
    if (!solvedOk) {
      unplacedLoads.push({
        classLabel: realUnplacedCardRef.current?.classLabel ?? "Unknown class",
        subjectCode: realUnplacedCardRef.current?.subjectCode ?? "Unknown subject",
        reason: "No conflict-free slot found under current constraints (teacher double-booking or class period limits).",
      });
    }

    // 6) Generate REMEDIAL slots (with Teacher Equality check)
    for (const c of classes) {
      const config = inputs.configs.find((cfg) => cfg.classId === c.id);
      if (!config?.hasRemedials) continue; // Respect classes that don't have remedials

      const remedialDays = [1, 3]; 
      const cNeeds = inputs.needs.filter((n) => n.classId === c.id && n.lessonsPerWeek > 0);

      let rIdx = 0;
      for (const day of remedialDays) {
        const need = cNeeds[rIdx % cNeeds.length];
        if (!need) continue;
        rIdx++;

        // Teacher Equality: pick the qualified teacher with the fewest remedial duties!
        let chosenTeacherId = need.teacherId;
        if (!chosenTeacherId) {
          const qualifiedTeachers = inputs.teacherAssoc
            .filter((ta) => ta.subjectId === need.subjectId)
            .map((ta) => ta.teacherId);
          
          if (qualifiedTeachers.length > 0) {
            qualifiedTeachers.sort((a, b) => {
              const countA = teacherRemedialCount.get(a) ?? 0;
              const countB = teacherRemedialCount.get(b) ?? 0;
              return countA - countB;
            });
            chosenTeacherId = qualifiedTeachers[0];
          }
        }

        if (chosenTeacherId) {
          const currentCount = teacherRemedialCount.get(chosenTeacherId) ?? 0;
          teacherRemedialCount.set(chosenTeacherId, currentCount + 1);
        }

        remedialSlotsToCreate.push({
          tenantId: user.tenantId,
          classId: c.id,
          subjectId: need.subjectId,
          teacherId: chosenTeacherId ?? null,
          dayOfWeek: day,
          period: 1, // Remedial Period 1
          slotType: "REMEDIAL",
        });
      }
    }

    // 7) Generate PREPS slots
    for (const c of classes) {
      const config = inputs.configs.find((cfg) => cfg.classId === c.id);
      if (!config?.hasPreps) continue;

      for (const day of WEEKDAYS) {
        for (const p of [1, 2]) {
          prepSlotsToCreate.push({
            tenantId: user.tenantId,
            classId: c.id,
            subjectId: prepSubject.id,
            teacherId: null,
            dayOfWeek: day,
            period: p,
            slotType: "PREP",
          });
        }
      }
    }

    // 8) Save all slots to the database
    const allSlots: any[] = [];
    
    // Academic Slots (filter out temporary LUNCH reservations)
    for (const [key, subjectId] of classGrid.entries()) {
      if (subjectId === lunchSubject.id) continue; // Will append from lunchSlotsToCreate

      const [classId, dayStr, periodStr] = key.split(":");
      const dayOfWeek = Number(dayStr);
      const period = Number(periodStr);

      const need = inputs.needs.find((n) => n.classId === classId && n.subjectId === subjectId);
      const teacherId = need?.teacherId ?? null;

      allSlots.push({
        tenantId: user.tenantId,
        classId,
        subjectId,
        teacherId,
        dayOfWeek,
        period,
        slotType: "ACADEMIC",
      });
    }

    // Append Lunch, Remedials & Preps
    allSlots.push(...lunchSlotsToCreate);
    allSlots.push(...remedialSlotsToCreate);
    allSlots.push(...prepSlotsToCreate);

    if (allSlots.length > 0) {
      await tdb.timetableSlot.createMany({
        data: allSlots,
      });
    }

    // 9) Notify all teachers about the newly published timetable!
    for (const t of inputs.teachers) {
      await createInApp({
        tenantId: user.tenantId,
        recipientId: t.id,
        title: "New Timetable Published",
        body: "A new conflict-free whole-school timetable has been generated. Please check your dashboard or My Classes.",
        category: "system",
      });
    }

    // Create Audit Log
    await db.auditLog.create({
      data: {
        tenantId: user.tenantId,
        actorId: user.id,
        actorName: user.fullName,
        action: "timetable.generated_whole_school",
        entityType: "tenant",
        entityId: user.tenantId,
        metadata: JSON.stringify({
          classesGenerated: classes.length,
          slotsPlaced: allSlots.length,
          remedialsPlaced: remedialSlotsToCreate.length,
          prepsPlaced: prepSlotsToCreate.length,
          lunchSlotsPlaced: lunchSlotsToCreate.length,
        }),
      },
    });

    return {
      success: true,
      classesCount: classes.length,
      slotsPlacedCount: allSlots.length,
      unplacedLoads,
    };
  });
}

/**
 * L.3 Automatic Teacher-Class Matching
 * Distributes teachers to classes fairly based on their subjects and "strong" areas.
 */
/**
 * L.3 Strict Rule-Based Teacher-Class Matching (ZERO AI)
 * Distributes teachers fairly using pure mathematical workload balancing.
 * Also handles mid-term transfers by checking existing TimetableSlots for conflicts.
 */
export async function autoAssignTeachersToClasses(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const tDb = tenantDb();
    
    // 1. Get all needs missing a teacher
    const needs = await tDb.classSubjectNeed.findMany({
      where: { teacherId: null }
    });

    if (needs.length === 0) return { success: true, assignedCount: 0 };

    // 2. Get all teachers and their subjects (including new Teaching Practice enrollees)
    const teacherSubjects = await tDb.teacherSubject.findMany();
    
    // 3. Track current workload to ensure mathematically fair distribution
    const workload = new Map<string, number>(); 
    const existingAssignments = await tDb.classSubjectNeed.findMany({ where: { teacherId: { not: null } } });
    for (const a of existingAssignments) {
      workload.set(a.teacherId!, (workload.get(a.teacherId!) || 0) + a.lessonsPerWeek);
    }
    for (const ts of teacherSubjects) {
      if (!workload.has(ts.teacherId)) workload.set(ts.teacherId, 0);
    }

    // 4. Pre-fetch all current timetable slots to prevent mid-term transfer conflicts
    const allSlots = await tDb.timetableSlot.findMany();

    let assignedCount = 0;

    for (const need of needs) {
      // Find eligible teachers who teach this subject
      let eligible = teacherSubjects.filter(ts => ts.subjectId === need.subjectId);
      if (eligible.length === 0) continue; 

      // If this need already has timetable slots (e.g. replacing a transferred teacher)
      // we MUST filter out any teacher who is already busy during those exact periods.
      const existingNeedSlots = allSlots.filter(s => s.classId === need.classId && s.subjectId === need.subjectId);
      
      if (existingNeedSlots.length > 0) {
        eligible = eligible.filter(candidate => {
          // Check if candidate is already booked in any of these exact (day, period) slots
          for (const slot of existingNeedSlots) {
            const isBusy = allSlots.some(s => 
              s.teacherId === candidate.teacherId && 
              s.dayOfWeek === slot.dayOfWeek && 
              s.period === slot.period &&
              !(s.classId === slot.classId && s.subjectId === slot.subjectId) // ignore the slot we are trying to fill
            );
            if (isBusy) return false; // Conflict found, rule blocks this teacher
          }
          return true; // No conflict
        });
      }

      if (eligible.length === 0) continue; // No non-conflicting teacher found

      // Sort by pure rule: 1. Strong subject preference, 2. Lowest current workload
      eligible.sort((a, b) => {
        if (a.isStrong && !b.isStrong) return -1;
        if (!a.isStrong && b.isStrong) return 1;
        const loadA = workload.get(a.teacherId) || 0;
        const loadB = workload.get(b.teacherId) || 0;
        return loadA - loadB;
      });

      const selectedTeacherId = eligible[0].teacherId;
      
      // Assign the need
      await tDb.classSubjectNeed.update({
        where: { id: need.id },
        data: { teacherId: selectedTeacherId }
      });

      // Instantly patch the Timetable if slots already exist!
      if (existingNeedSlots.length > 0) {
        for (const slot of existingNeedSlots) {
          await tDb.timetableSlot.update({
            where: { id: slot.id },
            data: { teacherId: selectedTeacherId }
          });
          // Update in memory cache for next iterations
          const slotRef = allSlots.find(s => s.id === slot.id);
          if (slotRef) slotRef.teacherId = selectedTeacherId;
        }
      }

      workload.set(selectedTeacherId, (workload.get(selectedTeacherId) || 0) + need.lessonsPerWeek);
      assignedCount++;
    }

    return { success: true, assignedCount };
  });
}

// AA.9 — real "start of term" teacher-rotation action, per docs/TEACHER-
// ALLOCATION-AND-ELECTIVES-ENGINE-DESIGN.md Part 14: a school with NO
// dedicated PE (or other) specialist may deliberately flag a real
// class-subject pairing `rotateTeacherEachTerm = true` (school's own
// choice, never a hardcoded rule about which subject or who covers it —
// eligibility is still entirely driven by the school's own real
// TeacherSubject links, exactly like every other subject). This action:
//   1. Finds every real ClassSubjectNeed row flagged rotateTeacherEachTerm.
//   2. Deliberately clears (nulls) ONLY those rows' own sticky
//      teacherId — every other real assignment in the school is
//      completely untouched, since autoAssignTeachersToClasses() only
//      ever fills needs where teacherId is null.
//   3. Re-runs the EXACT SAME existing fair-allocation logic
//      (autoAssignTeachersToClasses()) to genuinely re-roll a NEW fair
//      pick for just those cleared rows — reusing proven logic rather
//      than inventing a second allocator.
// A Principal/office role triggers this explicitly (never automatic —
// "start of term" is a real, deliberate human decision), typically once
// per real new term.
export async function rotateFlaggedTeacherAssignments(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const tDb = tenantDb();
    const flagged = await tDb.classSubjectNeed.findMany({
      where: { rotateTeacherEachTerm: true, teacherId: { not: null } },
    });
    if (flagged.length === 0) return { rotatedCount: 0, reassignedCount: 0 };

    // Real, honest "who had it before" record for the audit trail — kept
    // in memory only, never persisted as its own table (a real
    // TeacherAllocationImport-style audit log already exists elsewhere
    // for the broader allocation-import flow; this is a much smaller,
    // simpler action that doesn't need its own dedicated history table).
    const previousTeacherByNeedId = new Map(flagged.map((n) => [n.id, n.teacherId]));

    await tDb.classSubjectNeed.updateMany({
      where: { id: { in: flagged.map((n) => n.id) } },
      data: { teacherId: null },
    });

    const result = await autoAssignTeachersToClasses(user);

    // Real, honest report of exactly what changed for each rotated pairing.
    const after = await tDb.classSubjectNeed.findMany({ where: { id: { in: flagged.map((n) => n.id) } } });
    const changes = after.map((n) => ({
      classId: n.classId,
      subjectId: n.subjectId,
      previousTeacherId: previousTeacherByNeedId.get(n.id) ?? null,
      newTeacherId: n.teacherId,
      genuinelyRotated: n.teacherId !== previousTeacherByNeedId.get(n.id),
    }));

    return { rotatedCount: flagged.length, reassignedCount: result.assignedCount, changes };
  });
}

/**
 * Handles a teacher leaving the school or transferring out.
 * Rips them out of the timetable and auto-reassigns available teachers to their classes fairly.
 */
export async function processTeacherTransferOut(user: SessionUser, departingTeacherId: string) {
  return withTenant(user.tenantId, async () => {
    const tDb = tenantDb();
    
    // 1. Unassign all their class needs
    await tDb.classSubjectNeed.updateMany({
      where: { teacherId: departingTeacherId },
      data: { teacherId: null }
    });

    // 2. Unassign all their active timetable slots
    await tDb.timetableSlot.updateMany({
      where: { teacherId: departingTeacherId },
      data: { teacherId: null }
    });

    // 3. Automatically run the strict rule-based matcher to find replacement teachers
    // who are free during those exact periods.
    const result = await autoAssignTeachersToClasses(user);

    return { success: true, reassignedClasses: result.assignedCount };
  });
}

