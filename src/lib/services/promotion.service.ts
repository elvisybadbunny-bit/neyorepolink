/**
 * G.16 Year-End Promotion Engine + Stream Reshuffle.
 *
 * PROMOTION: builds a preview plan (Form 1 East -> Form 2 East...), commit
 * moves every ACTIVE student up; FINAL-YEAR cohorts graduate via the B.1
 * alumni fields (graduationYear + finalClassLabel). Every move is logged on a
 * PromotionRun row so the whole run can be UNDONE.
 *
 * RESHUFFLE: redistributes one level's students across its streams —
 * strategies: size (round-robin by count) | gender (balanced boy/girl) |
 * alpha (surname A→Z round-robin). "performance" intentionally NOT offered
 * until B.5 exam marks exist (no fake data — Prompt 2).
 *
 * Levels understood (KE): "Form N" (8-4-4, final 4), "Grade N" (CBC, final 9),
 * "PP N" (pre-primary, PP2 -> Grade 1). Unknown level patterns are listed as
 * `unmapped` in the preview and SKIPPED on commit (never guess).
 *
 * T.13 — MANUAL REPEAT-A-LEVEL (founder-confirmed: manual-only, no automatic
 * exam-driven engine). A staff member ticks specific students in the preview
 * before committing. A ticked student's classId is left UNCHANGED (they stay
 * in the exact same class slot — e.g. "Form 2 East" — which is itself a
 * permanent level+stream slot, not a year-bound instance) while everyone else
 * in that class moves up; next year's fresh intake joins them there, so
 * "repeat" naturally means the same LEVEL, reshuffled alongside new peers,
 * never a forced solo re-placement. A repeater at a FINAL-YEAR level (Form 4 /
 * Grade 9) stays ACTIVE instead of graduating. Student.isRepeating /
 * repeatingSinceYear record the real, human decision; every repeat is
 * reversible via the same real PromotionRun undo mechanism as every other
 * move.
 */
import { db } from "@/lib/db";
import { withTenant } from "@/lib/core/tenant-context";
import { tenantDb } from "@/lib/core/tenant-db";
import type { SessionUser } from "@/lib/core/session";

export class PromotionError extends Error {
  constructor(public code: "NOT_FOUND" | "EMPTY" | "CONFLICT", message: string) {
    super(message);
    this.name = "PromotionError";
  }
}

// ---------------------------------------------------------------------------
// Level parsing (KE structures)
// ---------------------------------------------------------------------------

interface ParsedLevel { kind: "form" | "grade" | "pp"; n: number }

export function parseLevel(level: string): ParsedLevel | null {
  const s = level.trim().toLowerCase();
  let m = s.match(/^form\s*(\d{1,2})$/);
  if (m) return { kind: "form", n: Number(m[1]) };
  m = s.match(/^grade\s*(\d{1,2})$/);
  if (m) return { kind: "grade", n: Number(m[1]) };
  m = s.match(/^pp\s*(\d)$/);
  if (m) return { kind: "pp", n: Number(m[1]) };
  return null;
}

/** Next level up, or "graduate" for final years, or null if unknown. */
export function nextLevel(level: string): string | "graduate" | null {
  const p = parseLevel(level);
  if (!p) return null;
  if (p.kind === "form") return p.n >= 4 ? "graduate" : `Form ${p.n + 1}`;
  if (p.kind === "grade") return p.n >= 9 ? "graduate" : `Grade ${p.n + 1}`;
  // PP1 -> PP2 -> Grade 1
  return p.n >= 2 ? "Grade 1" : `PP ${p.n + 1}`;
}

interface Move {
  studentId: string;
  fromClassId: string | null;
  toClassId: string | null;
  graduated?: boolean;
  repeated?: boolean; // T.13 — true when this student was manually marked to repeat
  prevStatus?: string;
  prevGradYear?: number | null;
  prevFinalLabel?: string | null;
  prevIsRepeating?: boolean;
  prevRepeatingSinceYear?: number | null;
}

export interface PlanStudent {
  id: string;
  name: string;
  gender: string;
  admissionNo: string;
  isRepeating: boolean;
}

// ---------------------------------------------------------------------------
// Promotion preview + commit
// ---------------------------------------------------------------------------

export async function promotionPlan(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const classes = await tenantDb().schoolClass.findMany({
      where: { archived: false },
      orderBy: [{ level: "asc" }, { stream: "asc" }],
    });
    const plan: {
      classId: string; from: string; to: string | null; graduate: boolean;
      students: number; toExists: boolean; roster: PlanStudent[];
    }[] = [];
    const unmapped: string[] = [];

    for (const c of classes) {
      const label = [c.level, c.stream].filter(Boolean).join(" ");
      const rosterRows = await tenantDb().student.findMany({
        where: { classId: c.id, status: "ACTIVE" },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        select: { id: true, firstName: true, lastName: true, gender: true, admissionNo: true, isRepeating: true },
      });
      const roster: PlanStudent[] = rosterRows.map((s) => ({
        id: s.id, name: `${s.firstName} ${s.lastName}`, gender: s.gender,
        admissionNo: s.admissionNo, isRepeating: s.isRepeating,
      }));
      const count = roster.length;
      const next = nextLevel(c.level);
      if (next === null) { unmapped.push(label); continue; }
      if (next === "graduate") {
        plan.push({ classId: c.id, from: label, to: null, graduate: true, students: count, toExists: true, roster });
        continue;
      }
      const target = classes.find((t) => t.level === next && (t.stream ?? null) === (c.stream ?? null));
      plan.push({
        classId: c.id,
        from: label,
        to: [next, c.stream].filter(Boolean).join(" "),
        graduate: false,
        students: count,
        toExists: Boolean(target),
        roster,
      });
    }
    return { plan, unmapped, totalStudents: plan.reduce((a, p) => a + p.students, 0) };
  });
}

/**
 * Commit the new academic year. Processes top level first (no collisions).
 *
 * T.13: `repeatStudentIds` is an explicit, staff-picked set of students who
 * stay at their CURRENT level instead of moving up (or graduating, if they
 * were in the final year). Nobody is ever repeated automatically.
 */
export async function commitPromotion(user: SessionUser, graduationYear?: number, repeatStudentIds: string[] = []) {
  return withTenant(user.tenantId, async () => {
    const { plan } = await promotionPlan(user);
    if (plan.length === 0) throw new PromotionError("EMPTY", "No classes to promote.");

    const repeatSet = new Set(repeatStudentIds);
    const classes = await tenantDb().schoolClass.findMany({ where: { archived: false } });
    const byKey = new Map(classes.map((c) => [`${c.level}|${c.stream ?? ""}`, c]));
    const year = graduationYear ?? new Date().getFullYear();
    const moves: Move[] = [];
    let promoted = 0;
    let graduated = 0;
    let repeated = 0;
    const historyIds: string[] = []; // AA.3 — ClassYearHistory rows created this run, linked to the PromotionRun once it exists

    // Highest levels first so we never promote a student twice in one run.
    const ordered = [...plan].sort((a, b) => {
      const pa = parseLevel(classes.find((c) => c.id === a.classId)!.level)!;
      const pb = parseLevel(classes.find((c) => c.id === b.classId)!.level)!;
      const rank = (p: ParsedLevel) => (p.kind === "pp" ? p.n : p.kind === "grade" ? 10 + p.n : 30 + p.n);
      return rank(pb) - rank(pa);
    });

    for (const step of ordered) {
      const students = await tenantDb().student.findMany({
        where: { classId: step.classId, status: "ACTIVE" },
        select: {
          id: true, status: true, graduationYear: true, finalClassLabel: true,
          isRepeating: true, repeatingSinceYear: true,
          firstName: true, lastName: true, gender: true, admissionNo: true,
        },
      });
      if (students.length === 0) continue;

      // T.13: split the roster into repeaters (stay put) vs. everyone else.
      const repeaters = students.filter((s) => repeatSet.has(s.id));
      const movers = students.filter((s) => !repeatSet.has(s.id));

      if (repeaters.length > 0) {
        for (const s of repeaters) {
          moves.push({
            studentId: s.id, fromClassId: step.classId, toClassId: step.classId, repeated: true,
            prevStatus: s.status, prevGradYear: s.graduationYear, prevFinalLabel: s.finalClassLabel,
            prevIsRepeating: s.isRepeating, prevRepeatingSinceYear: s.repeatingSinceYear,
          });
        }
        await tenantDb().student.updateMany({
          where: { id: { in: repeaters.map((s) => s.id) } },
          data: { isRepeating: true, repeatingSinceYear: year },
        });
        repeated += repeaters.length;
      }

      if (movers.length === 0) continue;

      if (step.graduate) {
        for (const s of movers) {
          moves.push({
            studentId: s.id, fromClassId: step.classId, toClassId: null, graduated: true,
            prevStatus: s.status, prevGradYear: s.graduationYear, prevFinalLabel: s.finalClassLabel,
            ...(s.isRepeating ? { prevIsRepeating: s.isRepeating, prevRepeatingSinceYear: s.repeatingSinceYear } : {}),
          });
        }
        await tenantDb().student.updateMany({
          where: { id: { in: movers.map((s) => s.id) } },
          data: { status: "GRADUATED", graduationYear: year, finalClassLabel: step.from, classId: null, isRepeating: false, repeatingSinceYear: null },
        });
        graduated += movers.length;

        // AA.3 — real gap fix: BEFORE this class's own ClassSubjectNeed rows
        // are cleaned up below, freeze a permanent ClassYearHistory snapshot
        // of exactly who was in this class and who taught it, for this real
        // graduation year. This is what makes it safe to keep silently
        // REUSING this same SchoolClass row next year (the class one level
        // down moving up into it) — nothing about "Form 4 North, Class of
        // {year}" is ever lost or blurred with next year's intake.
        {
          const srcClass = classes.find((c) => c.id === step.classId)!;
          const needs = await tenantDb().classSubjectNeed.findMany({ where: { classId: step.classId } });
          const teacherIds = [...new Set(needs.map((n) => n.teacherId).filter((id): id is string => Boolean(id)))];
          const subjectIds = [...new Set(needs.map((n) => n.subjectId))];
          const [teachers, subjects] = await Promise.all([
            teacherIds.length ? db.user.findMany({ where: { id: { in: teacherIds } }, select: { id: true, fullName: true } }) : Promise.resolve([]),
            subjectIds.length ? tenantDb().subject.findMany({ where: { id: { in: subjectIds } }, select: { id: true, name: true } }) : Promise.resolve([]),
          ]);
          const teacherName = (id: string | null) => (id ? teachers.find((t) => t.id === id)?.fullName ?? null : null);
          const subjectTeachers = needs.map((n) => ({
            subjectId: n.subjectId,
            subjectName: subjects.find((s) => s.id === n.subjectId)?.name ?? "Unknown subject",
            teacherId: n.teacherId,
            teacherName: teacherName(n.teacherId),
            lessonsPerWeek: n.lessonsPerWeek,
          }));
          const classTeacherName = srcClass.classTeacherId
            ? (await db.user.findUnique({ where: { id: srcClass.classTeacherId }, select: { fullName: true } }))?.fullName ?? null
            : null;
          const historyRow = await tenantDb().classYearHistory.create({
            data: {
              classId: step.classId,
              level: srcClass.level,
              stream: srcClass.stream,
              curriculum: srcClass.curriculum,
              graduationYear: year,
              studentCount: movers.length,
              roster: JSON.stringify(movers.map((s) => ({
                id: s.id, name: `${s.firstName} ${s.lastName}`, gender: s.gender, admissionNo: s.admissionNo,
              }))),
              subjectTeachers: JSON.stringify(subjectTeachers),
              classTeacherId: srcClass.classTeacherId,
              classTeacherName,
              createdById: user.id,
              createdByName: user.fullName,
            } as never,
          });
          historyIds.push(historyRow.id);
        }
        continue;
      }

      // Resolve/create destination class (same stream, level+1).
      const src = classes.find((c) => c.id === step.classId)!;
      const destLevel = step.to!.replace(src.stream ? ` ${src.stream}` : "", "").trim();
      const key = `${destLevel}|${src.stream ?? ""}`;
      let dest = byKey.get(key);
      if (!dest) {
        dest = await tenantDb().schoolClass.create({
          data: { level: destLevel, stream: src.stream, curriculum: src.curriculum } as never,
        });
        byKey.set(key, dest);
      }
      for (const s of movers) {
        moves.push({
          studentId: s.id, fromClassId: step.classId, toClassId: dest.id,
          ...(s.isRepeating ? { prevIsRepeating: s.isRepeating, prevRepeatingSinceYear: s.repeatingSinceYear } : {}),
        });
      }
      await tenantDb().student.updateMany({
        where: { id: { in: movers.map((s) => s.id) } },
        data: { classId: dest.id, isRepeating: false, repeatingSinceYear: null },
      });
      promoted += movers.length;
    }

    const summary = repeated > 0
      ? `New year: ${promoted} promoted, ${graduated} graduated, ${repeated} repeating (Class of ${year})`
      : `New year: ${promoted} promoted, ${graduated} graduated (Class of ${year})`;
    const run = await tenantDb().promotionRun.create({
      data: { kind: "promotion", summary, moves: JSON.stringify(moves), createdById: user.id, createdByName: user.fullName } as never,
    });
    // AA.3 — link every ClassYearHistory snapshot taken this run to its real PromotionRun.
    if (historyIds.length > 0) {
      await tenantDb().classYearHistory.updateMany({ where: { id: { in: historyIds } }, data: { promotionRunId: run.id } });
    }
    await db.auditLog.create({
      data: {
        tenantId: user.tenantId, actorId: user.id, actorName: user.fullName,
        action: "promotion.committed", entityType: "promotionRun", entityId: run.id,
        metadata: JSON.stringify({ promoted, graduated, repeated, year }),
      },
    });
    return { runId: run.id, promoted, graduated, repeated, year, summary };
  });
}

// ---------------------------------------------------------------------------
// AA.3 — reading back the frozen graduation history
// ---------------------------------------------------------------------------

export async function listClassYearHistory(user: SessionUser, opts: { graduationYear?: number; classId?: string } = {}) {
  return withTenant(user.tenantId, async () => {
    const rows = await tenantDb().classYearHistory.findMany({
      where: {
        ...(opts.graduationYear ? { graduationYear: opts.graduationYear } : {}),
        ...(opts.classId ? { classId: opts.classId } : {}),
      },
      orderBy: [{ graduationYear: "desc" }, { level: "asc" }, { stream: "asc" }],
    });
    return rows.map((r) => ({
      id: r.id,
      classId: r.classId,
      label: [r.level, r.stream].filter(Boolean).join(" "),
      curriculum: r.curriculum,
      graduationYear: r.graduationYear,
      studentCount: r.studentCount,
      roster: JSON.parse(r.roster) as { id: string; name: string; gender: string; admissionNo: string }[],
      subjectTeachers: JSON.parse(r.subjectTeachers) as { subjectId: string; subjectName: string; teacherId: string | null; teacherName: string | null; lessonsPerWeek: number }[],
      classTeacherName: r.classTeacherName,
      createdByName: r.createdByName,
      createdAt: r.createdAt,
    }));
  });
}

// ---------------------------------------------------------------------------
// Stream reshuffle
// ---------------------------------------------------------------------------

export type ReshuffleStrategy = "size" | "gender" | "alpha";

export async function reshufflePlan(user: SessionUser, level: string, strategy: ReshuffleStrategy) {
  return withTenant(user.tenantId, async () => {
    const streams = await tenantDb().schoolClass.findMany({
      where: { level, archived: false },
      orderBy: { stream: "asc" },
    });
    if (streams.length < 2) throw new PromotionError("CONFLICT", "This level has fewer than two streams — nothing to reshuffle.");
    const students = await tenantDb().student.findMany({
      where: { classId: { in: streams.map((s) => s.id) }, status: "ACTIVE" },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      select: { id: true, firstName: true, lastName: true, gender: true, classId: true },
    });
    if (students.length === 0) throw new PromotionError("EMPTY", "No active students in this level.");

    // Order according to strategy, then deal round-robin (snake for gender fairness).
    let ordered = [...students];
    if (strategy === "gender") {
      const boys = students.filter((s) => s.gender === "M");
      const girls = students.filter((s) => s.gender === "F");
      ordered = [];
      const max = Math.max(boys.length, girls.length);
      for (let i = 0; i < max; i++) {
        if (boys[i]) ordered.push(boys[i]);
        if (girls[i]) ordered.push(girls[i]);
      }
    }
    // "alpha" + "size" both use the surname ordering above; the round-robin
    // deal is what balances sizes.

    const assignment = new Map<string, string>(); // studentId -> classId
    ordered.forEach((s, i) => {
      assignment.set(s.id, streams[i % streams.length].id);
    });

    const preview = streams.map((st) => {
      const ids = [...assignment.entries()].filter(([, cid]) => cid === st.id).map(([sid]) => sid);
      const members = students.filter((s) => ids.includes(s.id));
      return {
        classId: st.id,
        label: [st.level, st.stream].filter(Boolean).join(" "),
        count: members.length,
        boys: members.filter((m) => m.gender === "M").length,
        girls: members.filter((m) => m.gender === "F").length,
        students: members.map((m) => ({ id: m.id, name: `${m.firstName} ${m.lastName}`, gender: m.gender, moved: m.classId !== st.id })),
      };
    });
    const movedCount = students.filter((s) => assignment.get(s.id) !== s.classId).length;
    return { level, strategy, streams: preview, movedCount, total: students.length };
  });
}

export async function commitReshuffle(user: SessionUser, level: string, strategy: ReshuffleStrategy) {
  return withTenant(user.tenantId, async () => {
    const plan = await reshufflePlan(user, level, strategy);
    const moves: Move[] = [];
    for (const stream of plan.streams) {
      for (const s of stream.students) {
        if (!s.moved) continue;
        const current = await tenantDb().student.findUnique({ where: { id: s.id }, select: { classId: true } });
        moves.push({ studentId: s.id, fromClassId: current?.classId ?? null, toClassId: stream.classId });
        await tenantDb().student.update({ where: { id: s.id }, data: { classId: stream.classId } });
      }
    }
    const summary = `Reshuffled ${level}: ${moves.length} of ${plan.total} students moved (${strategy})`;
    const run = await tenantDb().promotionRun.create({
      data: { kind: "reshuffle", summary, moves: JSON.stringify(moves), createdById: user.id, createdByName: user.fullName } as never,
    });
    await db.auditLog.create({
      data: {
        tenantId: user.tenantId, actorId: user.id, actorName: user.fullName,
        action: "promotion.reshuffled", entityType: "promotionRun", entityId: run.id,
        metadata: JSON.stringify({ level, strategy, moved: moves.length }),
      },
    });
    return { runId: run.id, moved: moves.length, summary };
  });
}

// ---------------------------------------------------------------------------
// History + undo
// ---------------------------------------------------------------------------

export async function listRuns(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const rows = await tenantDb().promotionRun.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
    return rows.map((r) => ({
      id: r.id, kind: r.kind, summary: r.summary, undoneAt: r.undoneAt,
      createdByName: r.createdByName, createdAt: r.createdAt,
      moves: (JSON.parse(r.moves) as Move[]).length,
    }));
  });
}

/** Undo a run: every move reversed (class restored; graduations reverted). */
export async function undoRun(user: SessionUser, runId: string) {
  return withTenant(user.tenantId, async () => {
    const run = await tenantDb().promotionRun.findUnique({ where: { id: runId } });
    if (!run) throw new PromotionError("NOT_FOUND", "Run not found.");
    if (run.undoneAt) throw new PromotionError("CONFLICT", "This run was already undone.");

    const moves = JSON.parse(run.moves) as Move[];
    for (const m of moves) {
      if (m.graduated) {
        await tenantDb().student.update({
          where: { id: m.studentId },
          data: {
            status: m.prevStatus ?? "ACTIVE",
            graduationYear: m.prevGradYear ?? null,
            finalClassLabel: m.prevFinalLabel ?? null,
            classId: m.fromClassId,
            // T.13: honestly restore a real prior repeat state that a
            // graduating move would otherwise have silently cleared.
            isRepeating: m.prevIsRepeating ?? false,
            repeatingSinceYear: m.prevRepeatingSinceYear ?? null,
          },
        });
      } else if (m.repeated) {
        // T.13: restore the real prior repeat state (usually not-repeating, but
        // honours a student who was ALREADY repeating a level going in).
        await tenantDb().student.update({
          where: { id: m.studentId },
          data: {
            classId: m.fromClassId,
            isRepeating: m.prevIsRepeating ?? false,
            repeatingSinceYear: m.prevRepeatingSinceYear ?? null,
          },
        });
      } else {
        // A normal promotion move. Most students never had a repeat flag, but
        // T.13 records prevIsRepeating/prevRepeatingSinceYear whenever a
        // student who WAS already repeating a level genuinely advances this
        // run (their flag clears on commit) — restore that real prior state.
        await tenantDb().student.update({
          where: { id: m.studentId },
          data: {
            classId: m.fromClassId,
            ...(m.prevIsRepeating !== undefined
              ? { isRepeating: m.prevIsRepeating ?? false, repeatingSinceYear: m.prevRepeatingSinceYear ?? null }
              : {}),
          },
        });
      }
    }
    // AA.3 — an undone graduation is no longer real; remove the ClassYearHistory
    // snapshot(s) this run created so history never shows a "graduation" that
    // was, in truth, reversed the same session.
    await tenantDb().classYearHistory.deleteMany({ where: { promotionRunId: runId } });

    await tenantDb().promotionRun.update({ where: { id: runId }, data: { undoneAt: new Date() } });
    await db.auditLog.create({
      data: {
        tenantId: user.tenantId, actorId: user.id, actorName: user.fullName,
        action: "promotion.undone", entityType: "promotionRun", entityId: runId,
        metadata: JSON.stringify({ reversedMoves: moves.length }),
      },
    });
    return { reversed: moves.length };
  });
}
