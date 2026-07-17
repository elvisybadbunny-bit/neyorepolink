/**
 * B.6 CBC Management — service.
 * Strands per subject (with KICD presets), teacher formative assessments on
 * the 4-point rubric (row-scoped like everything else), per-learner
 * competency aggregation, and the KICD-format report data.
 */
import { db } from "@/lib/db";
import { withTenant } from "@/lib/core/tenant-context";
import { tenantDb } from "@/lib/core/tenant-db";
import { can } from "@/lib/core/permissions";
import type { Role } from "@/lib/core/roles";
import { scopeWhere } from "@/lib/services/student.service";
import { LEVEL_LABELS } from "@/lib/validations/cbc";
import type { SessionUser } from "@/lib/core/session";

export class CbcError extends Error {
  constructor(public code: "NOT_FOUND" | "DUPLICATE" | "FORBIDDEN", message: string) {
    super(message);
    this.name = "CbcError";
  }
}

async function audit(user: SessionUser, action: string, entityId: string, metadata?: unknown) {
  await db.auditLog.create({
    data: {
      tenantId: user.tenantId, actorId: user.id, actorName: user.fullName,
      action, entityType: "cbc", entityId,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
}

// ---------------------------------------------------------------------------
// Strands (B.6.1/2)
// ---------------------------------------------------------------------------

export async function listStrands(user: SessionUser, subjectId?: string) {
  return withTenant(user.tenantId, async () => {
    const rows = await tenantDb().cbcStrand.findMany({
      where: subjectId ? { subjectId } : {},
      orderBy: { name: "asc" },
      include: { _count: { select: { assessments: true } } },
    });
    const subjects = await tenantDb().subject.findMany({ where: { id: { in: [...new Set(rows.map((r) => r.subjectId))] } } });
    const sMap = new Map(subjects.map((s) => [s.id, s]));
    return rows.map((r) => ({
      id: r.id, name: r.name, learningOutcome: r.learningOutcome,
      subjectId: r.subjectId, subjectName: sMap.get(r.subjectId)?.name ?? "—",
      subjectCode: sMap.get(r.subjectId)?.code ?? "", assessmentCount: r._count.assessments,
    }));
  });
}

export async function createStrand(user: SessionUser, input: { subjectId: string; name: string; learningOutcome?: string }) {
  return withTenant(user.tenantId, async () => {
    const dup = await tenantDb().cbcStrand.findFirst({ where: { subjectId: input.subjectId, name: input.name } });
    if (dup) throw new CbcError("DUPLICATE", `Strand "${input.name}" already exists for this learning area.`);
    const s = await tenantDb().cbcStrand.create({
      data: { subjectId: input.subjectId, name: input.name, learningOutcome: input.learningOutcome || null } as never,
    });
    await audit(user, "cbc.strand_created", s.id, { name: input.name });
    return s;
  });
}

/** Quick-add KICD strands for a subject (skips existing names). */
export async function addStrandPreset(user: SessionUser, subjectId: string, preset: { name: string; learningOutcome: string }[]) {
  return withTenant(user.tenantId, async () => {
    const existing = new Set((await tenantDb().cbcStrand.findMany({ where: { subjectId }, select: { name: true } })).map((s) => s.name));
    let added = 0;
    for (const p of preset) {
      if (existing.has(p.name)) continue;
      await tenantDb().cbcStrand.create({ data: { subjectId, name: p.name, learningOutcome: p.learningOutcome } as never });
      added++;
    }
    await audit(user, "cbc.preset_added", subjectId, { added });
    return { added, skipped: preset.length - added };
  });
}

// ---------------------------------------------------------------------------
// EE.1 — Sub-strands (real KICD sub-strand under a strand)
// ---------------------------------------------------------------------------

export async function listSubstrands(user: SessionUser, strandId?: string) {
  return withTenant(user.tenantId, async () => {
    const rows = await tenantDb().cbcSubstrand.findMany({
      where: strandId ? { strandId } : {},
      orderBy: { name: "asc" },
      include: { _count: { select: { assessments: true } } },
    });
    return rows.map((r) => ({
      id: r.id, name: r.name, learningOutcome: r.learningOutcome,
      strandId: r.strandId, assessmentCount: r._count.assessments,
    }));
  });
}

export async function createSubstrand(user: SessionUser, input: { strandId: string; name: string; learningOutcome?: string }) {
  return withTenant(user.tenantId, async () => {
    const strand = await tenantDb().cbcStrand.findUnique({ where: { id: input.strandId } });
    if (!strand) throw new CbcError("NOT_FOUND", "Strand not found.");
    const dup = await tenantDb().cbcSubstrand.findFirst({ where: { strandId: input.strandId, name: input.name } });
    if (dup) throw new CbcError("DUPLICATE", `Sub-strand "${input.name}" already exists for this strand.`);
    const s = await tenantDb().cbcSubstrand.create({
      data: { strandId: input.strandId, name: input.name, learningOutcome: input.learningOutcome || null } as never,
    });
    await audit(user, "cbc.substrand_created", s.id, { name: input.name, strandId: input.strandId });
    return s;
  });
}

export async function deleteSubstrand(user: SessionUser, id: string) {
  return withTenant(user.tenantId, async () => {
    await tenantDb().cbcSubstrand.delete({ where: { id } }).catch(() => {});
    return { success: true };
  });
}

/**
 * Immutability Guard (`cant be deleted anyhowly`):
 * Student academic observations and assessments cannot be deleted arbitrarily by ordinary teachers to prevent entering fake records and later removing them.
 * Requires Academics Leadership (`academics.manage`), Principal, Deputy Principal, or Founder authorization.
 */
export async function deleteCbcAssessment(user: SessionUser, id: string) {
  return withTenant(user.tenantId, async () => {
    const primaryCanManage = can(user.role as Role, "academics.manage");
    const secondaryCanManage = user.secondaryRole ? can(user.secondaryRole as Role, "academics.manage") : false;
    const isLeadership = ["PRINCIPAL", "DEPUTY_PRINCIPAL", "FOUNDER", "SUPER_ADMIN", "SCHOOL_OWNER"].includes(user.role);
    if (!primaryCanManage && !secondaryCanManage && !isLeadership) {
      throw new CbcError("FORBIDDEN", "Student academic records cannot be deleted arbitrarily by teachers (\"cant be deleted anyhowly\"). Only the Principal or Academics HOD can authorize deleting or voiding submitted assessments.");
    }
    const row = await tenantDb().cbcAssessment.findUnique({ where: { id } });
    if (!row) throw new CbcError("NOT_FOUND", "Assessment record not found.");
    await tenantDb().cbcAssessment.delete({ where: { id } });
    await audit(user, "cbc.assessment_deleted", row.strandId, { studentId: row.studentId, level: row.level, date: row.date });
    return { success: true, deletedId: id };
  });
}

/** Quick-add real KICD sub-strand presets for a strand (skips existing names). */
export async function addSubstrandPreset(user: SessionUser, strandId: string, preset: { name: string; learningOutcome: string }[]) {
  return withTenant(user.tenantId, async () => {
    const strand = await tenantDb().cbcStrand.findUnique({ where: { id: strandId } });
    if (!strand) throw new CbcError("NOT_FOUND", "Strand not found.");
    const existing = new Set((await tenantDb().cbcSubstrand.findMany({ where: { strandId }, select: { name: true } })).map((s) => s.name));
    let added = 0;
    for (const p of preset) {
      if (existing.has(p.name)) continue;
      await tenantDb().cbcSubstrand.create({ data: { strandId, name: p.name, learningOutcome: p.learningOutcome } as never });
      added++;
    }
    await audit(user, "cbc.substrand_preset_added", strandId, { added });
    return { added, skipped: preset.length - added };
  });
}

// ---------------------------------------------------------------------------
// EE.3 — real KICD Junior School (Grade 7-9) curriculum content: applies a
// full strand + sub-strand set for one grade + subject in a single action.
// ---------------------------------------------------------------------------

/**
 * Applies the real, researched KICD Junior School curriculum preset for one
 * grade + one subject: creates every strand for that grade (grade-prefixed
 * in the strand's own name, e.g. "Grade 7 · Numbers", since a school's
 * `Subject` row is shared across every grade that studies it and
 * `CbcStrand.name` must stay unique per subject — this is the one honest
 * way to keep Grade 7/8/9 Mathematics' own real, genuinely DIFFERENT
 * "Numbers" strand content from silently colliding into a single strand
 * row) together with all of that strand's own real sub-strands, in one
 * step. Idempotent and additive: re-running never duplicates an
 * already-created strand or sub-strand, and never touches a strand a
 * school has already customised under a different name.
 */
export async function applyJuniorSchoolCurriculumPreset(
  user: SessionUser,
  input: { subjectId: string; grade: string; strands: { name: string; learningOutcome: string; substrands: { name: string; learningOutcome: string }[] }[] }
) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const subject = await tdb.subject.findUnique({ where: { id: input.subjectId } });
    if (!subject) throw new CbcError("NOT_FOUND", "Subject not found.");

    let strandsAdded = 0;
    let substrandsAdded = 0;
    let strandsSkipped = 0;
    let substrandsSkipped = 0;

    for (const s of input.strands) {
      const gradedName = `${input.grade} · ${s.name}`;
      let strand = await tdb.cbcStrand.findFirst({ where: { subjectId: input.subjectId, name: gradedName } });
      if (!strand) {
        strand = await tdb.cbcStrand.create({ data: { subjectId: input.subjectId, name: gradedName, learningOutcome: s.learningOutcome } as never });
        strandsAdded++;
      } else {
        strandsSkipped++;
      }
      const existingSubstrands = new Set(
        (await tdb.cbcSubstrand.findMany({ where: { strandId: strand.id }, select: { name: true } })).map((r) => r.name)
      );
      for (const sub of s.substrands) {
        if (existingSubstrands.has(sub.name)) { substrandsSkipped++; continue; }
        await tdb.cbcSubstrand.create({ data: { strandId: strand.id, name: sub.name, learningOutcome: sub.learningOutcome } as never });
        substrandsAdded++;
      }
    }

    await audit(user, "cbc.junior_school_curriculum_preset_applied", input.subjectId, {
      grade: input.grade, strandsAdded, strandsSkipped, substrandsAdded, substrandsSkipped,
    });
    return { strandsAdded, strandsSkipped, substrandsAdded, substrandsSkipped };
  });
}

// ---------------------------------------------------------------------------
// EE.2 — Comment bank (rubric-driven auto-fill, never AI-generated)
// ---------------------------------------------------------------------------

export async function listCommentBank(user: SessionUser, subjectId?: string) {
  return withTenant(user.tenantId, async () => {
    return tenantDb().cbcCommentBankEntry.findMany({
      where: subjectId ? { subjectId } : {},
      orderBy: [{ subjectId: "asc" }, { level: "desc" }],
    });
  });
}

export async function upsertCommentBankEntry(
  user: SessionUser,
  input: { id?: string; subjectId: string; strandId?: string | null; substrandId?: string | null; level: number; text: string; enabled?: boolean }
) {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const data = {
      subjectId: input.subjectId,
      strandId: input.strandId || null,
      substrandId: input.substrandId || null,
      level: input.level,
      text: input.text,
      enabled: input.enabled ?? true,
    };
    if (input.id) {
      const found = await tdb.cbcCommentBankEntry.findUnique({ where: { id: input.id } });
      if (!found) throw new CbcError("NOT_FOUND", "Comment bank entry not found.");
      const row = await tdb.cbcCommentBankEntry.update({ where: { id: input.id }, data });
      await audit(user, "cbc.comment_bank_updated", row.id, { level: row.level });
      return row;
    }
    const row = await tdb.cbcCommentBankEntry.create({ data: { tenantId: user.tenantId, createdById: user.id, ...data } });
    await audit(user, "cbc.comment_bank_created", row.id, { level: row.level });
    return row;
  });
}

export async function deleteCommentBankEntry(user: SessionUser, id: string) {
  return withTenant(user.tenantId, async () => {
    await tenantDb().cbcCommentBankEntry.delete({ where: { id } }).catch(() => {});
    return { success: true };
  });
}

/**
 * Real, deterministic, ZERO-AI auto-fill: given a level a teacher just
 * tapped/typed for a specific student, and the subject/strand/sub-strand
 * that observation belongs to, pick a school-authored comment-bank phrase.
 * Narrower matches always win over broader ones (sub-strand+level beats
 * strand+level beats subject-wide+level), and when more than one phrase
 * ties at the same narrowness, one is genuinely rotated (deterministic hash
 * of studentId+date, not Math.random(), so re-opening the same sheet on the
 * same day shows the same pick rather than flickering) so repeat comments
 * across a class don't all read identically — never an AI model, purely a
 * real lookup + a real, explainable selection rule.
 */
export async function resolveAutoComment(
  user: SessionUser,
  input: { subjectId: string; strandId?: string | null; substrandId?: string | null; level: number; rotateKey?: string }
) {
  return withTenant(user.tenantId, async () => {
    const candidates = await tenantDb().cbcCommentBankEntry.findMany({
      where: { subjectId: input.subjectId, level: input.level, enabled: true },
    });
    if (candidates.length === 0) return { text: null, matchedScope: null as null | "substrand" | "strand" | "subject" };

    function pick(rows: typeof candidates) {
      if (rows.length === 0) return null;
      if (rows.length === 1) return rows[0];
      const key = input.rotateKey ?? "default";
      let hash = 0;
      for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
      return rows[hash % rows.length];
    }

    if (input.substrandId) {
      const narrow = candidates.filter((c) => c.substrandId === input.substrandId);
      const picked = pick(narrow);
      if (picked) return { text: picked.text, matchedScope: "substrand" as const };
    }
    if (input.strandId) {
      const mid = candidates.filter((c) => !c.substrandId && c.strandId === input.strandId);
      const picked = pick(mid);
      if (picked) return { text: picked.text, matchedScope: "strand" as const };
    }
    const wide = candidates.filter((c) => !c.substrandId && !c.strandId);
    const picked = pick(wide);
    if (picked) return { text: picked.text, matchedScope: "subject" as const };
    return { text: null, matchedScope: null };
  });
}

/** Real, human-written starter phrasings per KICD 4-point level — a school
 * can seed these once then edit/add its own; NEVER AI-generated. */
const DEFAULT_COMMENT_BANK: Record<number, string[]> = {
  4: [
    "Consistently exceeds expectations and shows real initiative on this strand.",
    "Goes beyond the basics with confidence and creativity.",
    "Demonstrates exceptional understanding well beyond the expected level.",
  ],
  3: [
    "Meets expectations for this strand and works independently.",
    "Confidently applies the skill as expected at this level.",
    "Shows a solid, reliable grasp of this strand.",
  ],
  2: [
    "Is approaching expectations; a little more guided practice will help.",
    "Attempts the task well but still needs some support to complete it fully.",
    "Making steady progress toward the expected level with continued practice.",
  ],
  1: [
    "Is below expectations and needs close support to build this skill.",
    "Requires focused, guided practice to catch up on this strand.",
    "Still developing this skill; needs regular one-on-one support.",
  ],
};

export async function seedDefaultCommentBank(user: SessionUser, subjectId: string) {
  return withTenant(user.tenantId, async () => {
    const existing = await tenantDb().cbcCommentBankEntry.findMany({ where: { subjectId, strandId: null, substrandId: null } });
    const existingByLevel = new Map<number, Set<string>>();
    for (const e of existing) {
      if (!existingByLevel.has(e.level)) existingByLevel.set(e.level, new Set());
      existingByLevel.get(e.level)!.add(e.text);
    }
    let added = 0;
    for (const [levelStr, phrases] of Object.entries(DEFAULT_COMMENT_BANK)) {
      const level = Number(levelStr);
      const already = existingByLevel.get(level) ?? new Set();
      for (const text of phrases) {
        if (already.has(text)) continue;
        await tenantDb().cbcCommentBankEntry.create({ data: { tenantId: user.tenantId, subjectId, level, text, createdById: user.id } });
        added++;
      }
    }
    await audit(user, "cbc.comment_bank_seeded", subjectId, { added });
    return { added };
  });
}

// ---------------------------------------------------------------------------
// Formative assessments (B.6.5) — teacher row-scoped
// ---------------------------------------------------------------------------

/** Class sheet for one strand: students + their LATEST level on it. */
export async function getAssessSheet(user: SessionUser, strandId: string, classId: string) {
  return withTenant(user.tenantId, async () => {
    const strand = await tenantDb().cbcStrand.findUnique({ where: { id: strandId } });
    if (!strand) throw new CbcError("NOT_FOUND", "Strand not found.");
    // EE.1 — real sub-strands under this strand, offered alongside the
    // strand-level sheet so a teacher can optionally score at the finer
    // sub-strand grain without it ever being required.
    const substrands = await tenantDb().cbcSubstrand.findMany({ where: { strandId }, orderBy: { name: "asc" } });
    const scope = await scopeWhere(user);
    const students = await tenantDb().student.findMany({
      where: { AND: [scope, { classId, status: "ACTIVE" }] },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      select: { id: true, firstName: true, middleName: true, lastName: true, admissionNo: true },
    });
    if (students.length === 0) throw new CbcError("FORBIDDEN", "No students here (or not your class).");
    const latest = await tenantDb().cbcAssessment.findMany({
      where: { strandId, studentId: { in: students.map((s) => s.id) } },
      orderBy: { createdAt: "desc" },
    });
    const seen = new Map<string, { level: number; date: string; comment: string | null; substrandId: string | null }>();
    for (const a of latest) if (!seen.has(a.studentId)) seen.set(a.studentId, { level: a.level, date: a.date, comment: a.comment, substrandId: a.substrandId });
    return {
      strand: { id: strand.id, name: strand.name, learningOutcome: strand.learningOutcome, subjectId: strand.subjectId },
      substrands: substrands.map((s) => ({ id: s.id, name: s.name, learningOutcome: s.learningOutcome })),
      students: students.map((s) => ({
        id: s.id,
        name: [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" "),
        admissionNo: s.admissionNo,
        latest: seen.get(s.id) ?? null,
      })),
    };
  });
}

/** Record a round of observations (one row per student per save — history kept). */
export async function saveAssessments(
  user: SessionUser,
  input: { strandId: string; date: string; entries: { studentId: string; level: number | null; comment?: string; substrandId?: string | null; commentFromBank?: boolean }[] },
  classId: string
) {
  return withTenant(user.tenantId, async () => {
    const strand = await tenantDb().cbcStrand.findUnique({ where: { id: input.strandId } });
    if (!strand) throw new CbcError("NOT_FOUND", "Strand not found.");
    const scope = await scopeWhere(user);
    const allowed = new Set(
      (await tenantDb().student.findMany({ where: { AND: [scope, { classId, status: "ACTIVE" }] }, select: { id: true } })).map((s) => s.id)
    );
    let saved = 0;
    for (const e of input.entries) {
      if (e.level === null || !allowed.has(e.studentId)) continue;
      await tenantDb().cbcAssessment.create({
        data: {
          studentId: e.studentId, strandId: input.strandId, level: e.level,
          substrandId: e.substrandId || null,
          comment: e.comment || null, commentFromBank: !!e.commentFromBank, date: input.date,
          teacherId: user.id, teacherName: user.fullName,
        } as never,
      });
      saved++;
    }
    await audit(user, "cbc.assessed", input.strandId, { date: input.date, saved });
    if (saved > 0) {
      const { syncSyllabusFromAssessment } = await import("@/lib/services/syllabus.service");
      await syncSyllabusFromAssessment(user, {
        classId,
        subjectId: strand.subjectId,
        strandId: strand.id,
        substrandId: input.entries[0]?.substrandId || null,
        topicName: strand.name,
      }).catch(() => {});
    }
    return { saved };
  });
}

// ---------------------------------------------------------------------------
// Competency tracking + reports (B.6.1/3/6)
// ---------------------------------------------------------------------------


/** Per-learner competency profile: latest level per strand, grouped by subject. */
export async function studentCompetencies(user: SessionUser, studentId: string) {
  return withTenant(user.tenantId, async () => {
    const scope = await scopeWhere(user);
    const student = await tenantDb().student.findFirst({ where: { AND: [{ id: studentId }, scope] }, include: { schoolClass: true } });
    if (!student) throw new CbcError("NOT_FOUND", "Student not found.");

    const assessments = await tenantDb().cbcAssessment.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
      include: { strand: true },
    });
    // latest per strand
    const latest = new Map<string, typeof assessments[number]>();
    for (const a of assessments) if (!latest.has(a.strandId)) latest.set(a.strandId, a);

    const subjects = await tenantDb().subject.findMany({
      where: { id: { in: [...new Set([...latest.values()].map((a) => a.strand.subjectId))] } },
    });
    const bySubject = subjects.map((sub) => {
      const strands = [...latest.values()]
        .filter((a) => a.strand.subjectId === sub.id)
        .map((a) => ({
          strandId: a.strandId,
          strand: a.strand.name,
          learningOutcome: a.strand.learningOutcome,
          level: a.level,
          code: LEVEL_LABELS[a.level].code,
          label: LEVEL_LABELS[a.level].label,
          parentFriendly: LEVEL_LABELS[a.level].parent,
          comment: a.comment,
          date: a.date,
          teacherName: a.teacherName,
        }))
        .sort((x, y) => x.strand.localeCompare(y.strand));
      const avg = strands.length ? strands.reduce((s, x) => s + x.level, 0) / strands.length : 0;
      return {
        subjectId: sub.id, subject: sub.name, code: sub.code,
        strands, avgLevel: Math.round(avg * 10) / 10,
        overall: LEVEL_LABELS[Math.max(1, Math.min(4, Math.round(avg)))].code,
      };
    }).filter((s) => s.strands.length > 0)
      .sort((a, b) => b.avgLevel - a.avgLevel);

    return {
      student: {
        id: student.id,
        name: [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" "),
        admissionNo: student.admissionNo,
        className: student.schoolClass ? [student.schoolClass.level, student.schoolClass.stream].filter(Boolean).join(" ") : null,
      },
      subjects: bySubject,
      totalAssessments: assessments.length,
    };
  });
}
