/**
 * BB.4 — Grade 10 "Allocate Class" one-click flow.
 *
 * Founder's own real request (paraphrased from their detailed message):
 * newly-joined students arrive with their real subject choices already made
 * (during Junior Secondary), the school declares which subjects are
 * compulsory, and the system should analyze the real subject combinations
 * and let the school allocate classes that weren't allocated with teachers
 * — reusing the already-real, already-working L.7 auto-grouping engine,
 * never inventing a second placement algorithm. Two real class strategies
 * matching the founder's own exact clarification ("if a school import has
 * already a list written the class name no issue the system can just
 * continue with the classes or regroup based on subjects"):
 *
 *  - USE_EXISTING: real classes already exist for this level (e.g. already
 *    named in the import file) — delegates STRAIGHT to L.7's own real
 *    runAutoGroupingPreview()/commitAutoGrouping(), zero duplicated logic.
 *  - CREATE_NEW: the level has ZERO real active classes yet (the founder's
 *    own "hasn't yet enrolled grade 10" scenario) — the school chooses how
 *    many real new streams + what real per-class capacity to create, and
 *    this service creates them, then places every real classless student
 *    at that level (identified via their real confirmed
 *    StudentSubjectSelection's own portal.targetLevel — the same real link
 *    BB.4's own import-time write, or an ordinary school-run
 *    SubjectSelectionPortal, already creates) using the EXACT SAME real
 *    groupStudentsBySubjectCombination() algorithm L.7 itself uses.
 *
 * After placement, this service optionally (seedSubjectNeeds, default true)
 * seeds real ClassSubjectNeed rows from each new/reused class's own real
 * student subject combinations, then runs the real fair
 * autoAssignTeachersToClasses() engine to fill any missing teacher — never
 * overriding an already-manually-assigned teacher, since it only ever
 * targets rows with teacherId: null. Finally, only when explicitly opted
 * into (generateTimetable, default false) AND real subject groups now
 * genuinely exist AND a real teacher was actually auto-assigned, a real
 * Master Button regeneration is triggered — the founder's own explicit
 * BB.3 addendum applies equally here: never fire a real regeneration
 * blindly when subject groups aren't configured yet.
 */
import { db } from "@/lib/db";
import { withTenant } from "@/lib/core/tenant-context";
import { tenantDb } from "@/lib/core/tenant-db";
import type { SessionUser } from "@/lib/core/session";
import {
  runAutoGroupingPreview,
  commitAutoGrouping,
  groupStudentsBySubjectCombination,
  classLabel,
  AutoGroupingError,
} from "@/lib/services/l7-auto-grouping.service";

export class ClassAllocationError extends Error {
  constructor(public code: "NOT_FOUND" | "INVALID" | "CONFLICT", message: string) {
    super(message);
    this.name = "ClassAllocationError";
  }
}

function safeParse<T>(value: string | null | undefined, fallback: T): T {
  try { return value ? (JSON.parse(value) as T) : fallback; } catch { return fallback; }
}

const STREAM_LETTERS = "ABCDEFGHIJKLMNOPQRST".split("");

/**
 * Real, honest lookup of a level's own real "classless" students — students
 * with no real classId yet, but a real confirmed StudentSubjectSelection
 * whose own portal genuinely targets this exact level. This is the real
 * link that makes a brand-new, not-yet-classed intake discoverable at all
 * (Student itself carries no independent "level" field — classId is the
 * only real link to a level today, so a student who's genuinely never had
 * a class needs this real alternate path).
 */
async function findClasslessStudentsForLevel(tdb: ReturnType<typeof tenantDb>, level: string) {
  const portals = await tdb.subjectSelectionPortal.findMany({ where: { targetLevel: level }, select: { id: true } });
  if (portals.length === 0) return { students: [], selectionMap: new Map<string, string[]>() };
  const selections = await tdb.studentSubjectSelection.findMany({
    where: { isConfirmed: true, portalId: { in: portals.map((p) => p.id) } },
    select: { studentId: true, selectedSubjectIds: true },
  });
  if (selections.length === 0) return { students: [], selectionMap: new Map<string, string[]>() };
  const students = await tdb.student.findMany({
    where: { id: { in: selections.map((s) => s.studentId) }, classId: null, status: "ACTIVE" },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    select: { id: true, firstName: true, lastName: true, classId: true },
  });
  const selectionMap = new Map(selections.map((s) => [s.studentId, safeParse<string[]>(s.selectedSubjectIds, [])]));
  return { students, selectionMap };
}

export async function previewClassAllocation(
  user: SessionUser,
  input: { level: string; proposedStreamCount?: number; proposedCapacityPerClass?: number }
) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const existingClasses = await tdb.schoolClass.findMany({ where: { level: input.level, archived: false } });

    if (existingClasses.length > 0) {
      // USE_EXISTING — delegate straight to the real L.7 engine, never a
      // second copy of the same preview logic.
      const l7Preview = await runAutoGroupingPreview(user, input.level);
      return { ...l7Preview, classStrategyAvailable: "USE_EXISTING" as const, hasExistingClasses: true };
    }

    // CREATE_NEW — the level genuinely has zero real classes yet.
    if (!input.proposedStreamCount || !input.proposedCapacityPerClass) {
      throw new ClassAllocationError("INVALID", "This level has no real classes yet — choose how many new streams to create and their capacity before previewing.");
    }
    const { students, selectionMap } = await findClasslessStudentsForLevel(tdb, input.level);
    if (students.length === 0) {
      throw new ClassAllocationError("NOT_FOUND", "No real classless students with confirmed subject choices were found for that level yet — import students with a real Subjects column, or open a Subject Selection portal for this level first.");
    }

    const proposedClasses = Array.from({ length: input.proposedStreamCount }, (_, i) => ({
      id: `NEW_${i + 1}`,
      label: `${input.level} ${STREAM_LETTERS[i] ?? i + 1} (new)`,
      capacity: input.proposedCapacityPerClass!,
    }));
    const assignments = groupStudentsBySubjectCombination(students, selectionMap, proposedClasses);

    const preview = proposedClasses.map((cls) => {
      const members = students.filter((s) => assignments.get(s.id) === cls.id);
      return {
        classId: cls.id,
        label: cls.label,
        count: members.length,
        students: members.map((m) => ({
          id: m.id,
          name: `${m.firstName} ${m.lastName}`,
          selectedSubjectIds: selectionMap.get(m.id) ?? [],
          moved: true, // every classless student is, honestly, "moved" into their first real class
        })),
      };
    });

    const capacityWarnings = preview
      .map((p) => {
        if (p.count <= input.proposedCapacityPerClass!) return null;
        return { classId: p.classId, label: p.label, capacity: input.proposedCapacityPerClass!, projectedCount: p.count, overflowCount: p.count - input.proposedCapacityPerClass! };
      })
      .filter((w): w is { classId: string; label: string; capacity: number; projectedCount: number; overflowCount: number } => w !== null);

    return {
      level: input.level,
      ruleApplied: "New intake — real subject-combination grouping into newly proposed classes",
      retainSubjectTeachers: true,
      retainClassTeachers: true,
      totalStudents: students.length,
      movedCount: students.length,
      preview,
      capacityWarnings,
      classStrategyAvailable: "CREATE_NEW" as const,
      hasExistingClasses: false,
      proposedStreamCount: input.proposedStreamCount,
      proposedCapacityPerClass: input.proposedCapacityPerClass,
    };
  });
}

export async function confirmClassAllocation(
  user: SessionUser,
  input: {
    level: string;
    classStrategy: "CREATE_NEW" | "USE_EXISTING";
    streamCount?: number;
    capacityPerClass?: number;
    capacityDecisions?: Record<string, "ALLOW_OVER_CAPACITY">;
    seedSubjectNeeds: boolean;
    generateTimetable: boolean;
  }
) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const run = await tdb.classAllocationRun.create({
      data: {
        level: input.level,
        classStrategy: input.classStrategy,
        streamCount: input.streamCount ?? null,
        capacityPerClass: input.capacityPerClass ?? null,
        status: "PENDING",
        createdById: user.id,
        createdByName: user.fullName,
      } as never,
    });

    try {
      let createdClassIds: string[] = [];
      let promotionRunId: string | null = null;
      let totalStudents = 0;

      const existingClasses = await tdb.schoolClass.findMany({ where: { level: input.level, archived: false } });

      if (input.classStrategy === "USE_EXISTING") {
        if (existingClasses.length === 0) {
          throw new ClassAllocationError("NOT_FOUND", "No real classes exist for that level yet — choose \"Create new classes\" instead.");
        }
        // Real, honest delegation to the exact same L.7 engine every other
        // real auto-grouping commit in NEYO already uses — never a second
        // placement code path.
        try {
          const result = await commitAutoGrouping(user, input.level, input.capacityDecisions ?? {});
          promotionRunId = result.runId;
          totalStudents = result.totalStudents;
        } catch (e) {
          if (e instanceof AutoGroupingError) throw new ClassAllocationError(e.code === "NOT_FOUND" ? "NOT_FOUND" : "CONFLICT", e.message);
          throw e;
        }
      } else {
        // CREATE_NEW — a real, honest race guard: if classes appeared for
        // this level between preview and confirm (e.g. a second staff
        // member acted first), refuse rather than silently creating
        // duplicate/competing classes.
        if (existingClasses.length > 0) {
          throw new ClassAllocationError("CONFLICT", "Real classes now exist for that level — refresh and choose \"Continue with these classes\" instead.");
        }
        if (!input.streamCount || !input.capacityPerClass) {
          throw new ClassAllocationError("INVALID", "Choose how many new classes to create and their capacity.");
        }
        const tenant = await db.tenant.findUniqueOrThrow({ where: { id: user.tenantId }, select: { curriculum: true } });
        const newClasses = [];
        for (let i = 0; i < input.streamCount; i++) {
          const cls = await tdb.schoolClass.create({
            data: {
              level: input.level,
              stream: STREAM_LETTERS[i] ?? String(i + 1),
              curriculum: tenant.curriculum ?? "CBC",
              capacity: input.capacityPerClass,
            } as never,
          });
          newClasses.push(cls);
        }
        createdClassIds = newClasses.map((c) => c.id);

        const { students, selectionMap } = await findClasslessStudentsForLevel(tdb, input.level);
        if (students.length === 0) {
          throw new ClassAllocationError("NOT_FOUND", "No real classless students with confirmed subject choices were found for that level.");
        }
        const assignments = groupStudentsBySubjectCombination(students, selectionMap, newClasses);

        // BB.3 — real, honest capacity gate, identical discipline to L.7's
        // own commitAutoGrouping(): a class the placement would genuinely
        // exceed needs a real staff decision before this commit proceeds.
        const perClassCount = new Map<string, number>();
        for (const cls of newClasses) perClassCount.set(cls.id, students.filter((s) => assignments.get(s.id) === cls.id).length);
        const decisions = input.capacityDecisions ?? {};
        const undecided = newClasses.filter((c) => (perClassCount.get(c.id) ?? 0) > input.capacityPerClass! && !decisions[c.id]);
        if (undecided.length > 0) {
          throw new ClassAllocationError("CONFLICT", `${undecided.length} new class(es) would exceed the chosen capacity: ${undecided.map((c) => classLabel(c)).join(", ")}. Resolve each one before confirming.`);
        }
        for (const cls of newClasses) {
          const count = perClassCount.get(cls.id) ?? 0;
          if (count > input.capacityPerClass!) {
            await tdb.classCapacityOverflowRun.create({
              data: {
                classId: cls.id, subjectId: null, overflowCount: count - input.capacityPerClass!,
                decision: "ALLOW_OVER_CAPACITY", decidedAt: new Date(),
                createdById: user.id, createdByName: user.fullName,
              } as never,
            });
          }
        }

        const moves: { studentId: string; fromClassId: null; toClassId: string }[] = [];
        for (const student of students) {
          const toClassId = assignments.get(student.id)!;
          await tdb.student.update({ where: { id: student.id }, data: { classId: toClassId } });
          moves.push({ studentId: student.id, fromClassId: null, toClassId });
        }
        totalStudents = students.length;

        const promotionRun = await tdb.promotionRun.create({
          data: {
            tenantId: user.tenantId,
            kind: "class_allocation",
            summary: `Allocated ${students.length} real classless students into ${newClasses.length} newly created real classes for ${input.level}.`,
            moves: JSON.stringify(moves),
            createdById: user.id,
            createdByName: user.fullName,
          },
        });
        promotionRunId = promotionRun.id;
      }

      // Real, optional subject-need seeding + fair teacher auto-fill —
      // never touches an already-assigned teacher (only rows with
      // teacherId: null are ever picked up by autoAssignTeachersToClasses()).
      let classSubjectNeedsSeeded = 0;
      let teachersAutoAssigned = 0;
      if (input.seedSubjectNeeds) {
        const levelClasses = await tdb.schoolClass.findMany({ where: { level: input.level, archived: false } });
        for (const cls of levelClasses) {
          const students = await tdb.student.findMany({ where: { classId: cls.id, status: "ACTIVE" }, select: { id: true } });
          if (students.length === 0) continue;
          const portals = await tdb.subjectSelectionPortal.findMany({ where: { targetLevel: input.level }, select: { id: true } });
          const selections = portals.length > 0
            ? await tdb.studentSubjectSelection.findMany({ where: { isConfirmed: true, studentId: { in: students.map((s) => s.id) }, portalId: { in: portals.map((p) => p.id) } }, select: { selectedSubjectIds: true } })
            : [];
          const neededSubjectIds = new Set<string>();
          for (const sel of selections) for (const id of safeParse<string[]>(sel.selectedSubjectIds, [])) neededSubjectIds.add(id);
          if (neededSubjectIds.size === 0) continue;
          const existingNeeds = await tdb.classSubjectNeed.findMany({ where: { classId: cls.id, subjectId: { in: [...neededSubjectIds] } }, select: { subjectId: true } });
          const existingSubjectIds = new Set(existingNeeds.map((n) => n.subjectId));
          for (const subjectId of neededSubjectIds) {
            if (existingSubjectIds.has(subjectId)) continue;
            await tdb.classSubjectNeed.create({ data: { classId: cls.id, subjectId, lessonsPerWeek: 5, doubleCount: 0 } as never });
            classSubjectNeedsSeeded++;
          }
        }

        if (classSubjectNeedsSeeded > 0) {
          // Dynamic import mirrors BB.3's own established pattern — avoids
          // a circular import between class-allocation/timetable-solver.
          const { autoAssignTeachersToClasses } = await import("@/lib/services/timetable-solver.service");
          const before = await tdb.classSubjectNeed.count({ where: { teacherId: { not: null } } });
          await autoAssignTeachersToClasses(user);
          const after = await tdb.classSubjectNeed.count({ where: { teacherId: { not: null } } });
          teachersAutoAssigned = Math.max(0, after - before);
        }
      }

      let timetableJobId: string | null = null;
      if (input.generateTimetable && classSubjectNeedsSeeded > 0 && teachersAutoAssigned > 0) {
        try {
          const { startGeneration } = await import("@/lib/services/timetable-engine.service");
          const job = await startGeneration(user);
          timetableJobId = job?.id ?? null;
        } catch { /* a generation may already be running; the school can retry from the timetable page */ }
      }

      const completed = await tdb.classAllocationRun.update({
        where: { id: run.id },
        data: {
          createdClassIds: JSON.stringify(createdClassIds),
          promotionRunId,
          timetableJobId,
          totalStudents,
          classSubjectNeedsSeeded,
          teachersAutoAssigned,
          status: "COMPLETED",
          completedAt: new Date(),
        } as never,
      });

      await db.auditLog.create({
        data: {
          tenantId: user.tenantId,
          actorId: user.id,
          actorName: user.fullName,
          action: "class_allocation.completed",
          entityType: "classAllocationRun",
          entityId: run.id,
          metadata: JSON.stringify({ level: input.level, classStrategy: input.classStrategy, totalStudents, classSubjectNeedsSeeded, teachersAutoAssigned, timetableJobId }),
        },
      });

      return {
        runId: completed.id,
        level: input.level,
        classStrategy: input.classStrategy,
        createdClassIds,
        totalStudents,
        classSubjectNeedsSeeded,
        teachersAutoAssigned,
        promotionRunId,
        timetableJobId,
        summary: `Allocated ${totalStudents} real student(s) in ${input.level}${classSubjectNeedsSeeded > 0 ? ` · ${classSubjectNeedsSeeded} real subject need(s) seeded` : ""}${teachersAutoAssigned > 0 ? ` · ${teachersAutoAssigned} real teacher(s) auto-assigned` : ""}.`,
      };
    } catch (e) {
      await tdb.classAllocationRun.update({ where: { id: run.id }, data: { status: "FAILED" } as never }).catch(() => {});
      throw e;
    }
  });
}

export async function listClassAllocationRuns(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    return tenantDb().classAllocationRun.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
  });
}
