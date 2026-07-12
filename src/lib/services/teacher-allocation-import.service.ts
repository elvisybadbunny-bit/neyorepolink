/**
 * AA.2 — Teacher Allocation Import: real CSV/TSV/paste/XLSX import (and,
 * via bundi-import.service.ts's existing multi-domain commit path, a real
 * Bundi Intelligent handwritten-photo import) of an existing school's
 * teacher-subject-class allocation at onboarding.
 *
 * Real design (per docs/TEACHER-ALLOCATION-AND-ELECTIVES-ENGINE-DESIGN.md
 * Part 1): one row = "this teacher teaches this subject to this class,
 * this many lessons/week" — matched against the school's OWN real
 * existing data (never trusting a pasted name blindly): a real `User`
 * (TEACHER-ish role) matched by name; a real `Subject` matched by name;
 * a real `SchoolClass` matched by level+stream label. A teacher name with
 * no real match is flagged NEW (never silently created) and only actually
 * created when the school explicitly confirms via `createMissingTeachers`.
 * Two ambiguous real teachers sharing the exact same name are flagged
 * AMBIGUOUS rather than guessing which one is meant.
 */
import { db } from "@/lib/db";
import { withTenant } from "@/lib/core/tenant-context";
import { tenantDb } from "@/lib/core/tenant-db";
import { generateNeyoLoginId } from "@/lib/services/identity.service";
import type { SessionUser } from "@/lib/core/session";
import { parseDelimited, parseXlsx } from "@/lib/services/student-import.service";
import {
  TEACHER_ALLOCATION_HEADER_SYNONYMS,
  type TeacherAllocationImportField,
  type TeacherAllocationImportRow,
  type TeacherAllocationPreviewRow,
  type CommitTeacherAllocationInput,
} from "@/lib/validations/teacher-allocation-import";

export class TeacherAllocationImportError extends Error {
  constructor(public code: "INVALID" | "EMPTY" | "BAD_FILE" | "NOT_FOUND") {
    super(TeacherAllocationImportError.messageFor(code));
    this.name = "TeacherAllocationImportError";
  }
  static messageFor(code: string) {
    if (code === "EMPTY") return "No teacher allocation rows found in the import.";
    if (code === "BAD_FILE") return "Use a .csv, .tsv, .txt or .xlsx teacher allocation file.";
    if (code === "NOT_FOUND") return "Import session not found.";
    return "Invalid teacher allocation import data.";
  }
}

function normHeader(h: string) {
  return h.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, "").trim();
}
function normName(s: string) {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}
function classLabel(c: { level: string; stream: string | null }) {
  return [c.level, c.stream].filter(Boolean).join(" ");
}

function autoMapColumns(header: string[]): TeacherAllocationImportField[] {
  const fields: TeacherAllocationImportField[] = header.map(() => "ignore");
  const used = new Set<TeacherAllocationImportField>();
  const entries = Object.entries(TEACHER_ALLOCATION_HEADER_SYNONYMS) as [Exclude<TeacherAllocationImportField, "ignore">, string[]][];

  header.forEach((raw, index) => {
    const h = normHeader(raw);
    for (const [field, synonyms] of entries) {
      if (used.has(field)) continue;
      if (synonyms.some((s) => normHeader(s) === h)) {
        fields[index] = field;
        used.add(field);
        break;
      }
    }
  });
  header.forEach((raw, index) => {
    if (fields[index] !== "ignore") return;
    const h = normHeader(raw);
    for (const [field, synonyms] of entries) {
      if (used.has(field)) continue;
      if (synonyms.some((s) => h.includes(normHeader(s)) && normHeader(s).length >= 4)) {
        fields[index] = field;
        used.add(field);
        break;
      }
    }
  });
  return fields;
}

export function teacherAllocationRowsFromTable(rows: string[][], hasHeader = true): TeacherAllocationImportRow[] {
  if (!rows.length) throw new TeacherAllocationImportError("EMPTY");
  const fallback: TeacherAllocationImportField[] = ["teacherName", "subjectName", "className", "lessonsPerWeek", "doubleCount"];
  const header = hasHeader ? rows[0] : [];
  const fields = hasHeader ? autoMapColumns(header) : fallback;
  const body = hasHeader ? rows.slice(1) : rows;

  const result = body.map((cells) => {
    const out: Record<string, string> = {};
    fields.forEach((field, index) => {
      if (field === "ignore") return;
      out[field] = cells[index]?.trim() ?? "";
    });
    return {
      teacherName: out.teacherName || "",
      subjectName: out.subjectName || "",
      className: out.className || "",
      lessonsPerWeek: out.lessonsPerWeek ? Math.max(1, Math.trunc(Number(out.lessonsPerWeek)) || 5) : 5,
      doubleCount: out.doubleCount ? Math.max(0, Math.trunc(Number(out.doubleCount)) || 0) : 0,
    } satisfies TeacherAllocationImportRow;
  }).filter((r) => r.teacherName.trim().length > 0 && r.teacherName.trim().toLowerCase() !== "teacher name");

  if (!result.length) throw new TeacherAllocationImportError("EMPTY");
  return result;
}

export function teacherAllocationRowsFromText(text: string, hasHeader = true) {
  return teacherAllocationRowsFromTable(parseDelimited(text), hasHeader);
}

export async function teacherAllocationRowsFromFile(fileName: string, bytes: Buffer, hasHeader = true) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".xlsx")) return teacherAllocationRowsFromTable(await parseXlsx(bytes), hasHeader);
  if (lower.endsWith(".csv") || lower.endsWith(".tsv") || lower.endsWith(".txt")) return teacherAllocationRowsFromText(bytes.toString("utf8"), hasHeader);
  throw new TeacherAllocationImportError("BAD_FILE");
}

/**
 * Real preview: matches every row against the school's OWN live data
 * BEFORE anything is created — the school sees exactly what will happen
 * (existing teacher matched / new teacher will be created / class or
 * subject not found) and can fix a typo'd row before committing.
 */
export async function previewTeacherAllocationImport(user: SessionUser, rows: TeacherAllocationImportRow[]): Promise<TeacherAllocationPreviewRow[]> {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const [teachers, subjects, classes, needs] = await Promise.all([
      tdb.user.findMany({ where: { role: { in: ["TEACHER", "CLASS_TEACHER", "HOD", "DEPUTY_PRINCIPAL", "PRINCIPAL", "DEAN_OF_STUDIES"] }, isActive: true }, select: { id: true, fullName: true } }),
      tdb.subject.findMany({ where: { archived: false }, select: { id: true, name: true, code: true } }),
      tdb.schoolClass.findMany({ where: { archived: false }, select: { id: true, level: true, stream: true } }),
      tdb.classSubjectNeed.findMany({ select: { id: true, classId: true, subjectId: true } }),
    ]);

    return rows.map((r, i) => {
      const rowNo = i + 1;
      if (!r.teacherName || !r.subjectName || !r.className) {
        return {
          row: rowNo, teacherName: r.teacherName, subjectName: r.subjectName, className: r.className,
          lessonsPerWeek: r.lessonsPerWeek, doubleCount: r.doubleCount,
          teacherMatch: "NEW" as const, matchedTeacherId: null, matchedTeacherName: null,
          subjectMatch: "NOT_FOUND" as const, matchedSubjectId: null,
          classMatch: "NOT_FOUND" as const, matchedClassId: null,
          needMatch: null, error: "Teacher name, subject name, and class are all required.",
        };
      }

      const teacherMatches = teachers.filter((t) => normName(t.fullName) === normName(r.teacherName));
      const teacherMatch = teacherMatches.length === 0 ? "NEW" : teacherMatches.length === 1 ? "EXISTING" : "AMBIGUOUS";
      const matchedTeacherId = teacherMatch === "EXISTING" ? teacherMatches[0].id : null;
      const matchedTeacherName = teacherMatch === "EXISTING" ? teacherMatches[0].fullName : null;

      const subject = subjects.find((s) => normName(s.name) === normName(r.subjectName) || normName(s.code) === normName(r.subjectName));
      const subjectMatch = subject ? "EXISTING" : "NOT_FOUND";

      const cls = classes.find((c) => normName(classLabel(c)) === normName(r.className));
      const classMatch = cls ? "EXISTING" : "NOT_FOUND";

      let needMatch: "WILL_CREATE" | "WILL_UPDATE" | null = null;
      let error: string | null = null;
      if (subjectMatch === "NOT_FOUND") error = `Subject "${r.subjectName}" was not found — create it in Academics first, or check the spelling.`;
      else if (classMatch === "NOT_FOUND") error = `Class "${r.className}" was not found — check the spelling matches this school's real class names exactly (e.g. "Form 2 East").`;
      else if (teacherMatch === "AMBIGUOUS") error = `More than one real teacher named "${r.teacherName}" exists — this row needs manual resolution.`;
      else if (cls && subject) {
        const existingNeed = needs.find((n) => n.classId === cls.id && n.subjectId === subject.id);
        needMatch = existingNeed ? "WILL_UPDATE" : "WILL_CREATE";
      }

      return {
        row: rowNo, teacherName: r.teacherName, subjectName: r.subjectName, className: r.className,
        lessonsPerWeek: r.lessonsPerWeek, doubleCount: r.doubleCount,
        teacherMatch, matchedTeacherId, matchedTeacherName,
        subjectMatch, matchedSubjectId: subject?.id ?? null,
        classMatch, matchedClassId: cls?.id ?? null,
        needMatch, error,
      };
    });
  });
}

export interface TeacherAllocationImportResult {
  totalRows: number;
  createdNeeds: number;
  matchedNeeds: number;
  createdTeachers: number;
  failedRows: number;
  errors: { row: number; message: string }[];
  importId: string;
}

/**
 * Real commit: only ever runs off a preview the school has already SEEN
 * (this function re-derives the same real preview internally rather than
 * trusting client-supplied match results, so a stale/tampered preview can
 * never silently create the wrong real row). A NEW teacher is only
 * actually created when `createMissingTeachers` is explicitly true.
 */
export async function commitTeacherAllocationImport(user: SessionUser, input: CommitTeacherAllocationInput): Promise<TeacherAllocationImportResult> {
  return withTenant(user.tenantId, async () => {
    const tdb = tenantDb();
    const preview = await previewTeacherAllocationImport(user, input.rows);

    const errors: { row: number; message: string }[] = [];
    let createdNeeds = 0, matchedNeeds = 0, createdTeachers = 0, failedRows = 0;

    for (const p of preview) {
      if (p.error) {
        failedRows++;
        errors.push({ row: p.row, message: p.error });
        if (!input.skipInvalid) throw new TeacherAllocationImportError("INVALID");
        continue;
      }
      if (p.teacherMatch === "NEW" && !input.createMissingTeachers) {
        failedRows++;
        errors.push({ row: p.row, message: `Teacher "${p.teacherName}" doesn't exist yet — re-import with "create missing teachers" confirmed, or add them to Staff first.` });
        if (!input.skipInvalid) throw new TeacherAllocationImportError("INVALID");
        continue;
      }

      let teacherId = p.matchedTeacherId;
      if (p.teacherMatch === "NEW" && input.createMissingTeachers) {
        const loginId = await generateNeyoLoginId();
        const newTeacher = await tdb.user.create({
          data: { tenantId: user.tenantId, neyoLoginId: loginId, fullName: p.teacherName, role: "TEACHER", isActive: true },
        });
        teacherId = newTeacher.id;
        createdTeachers++;
      }
      if (!teacherId || !p.matchedSubjectId || !p.matchedClassId) {
        failedRows++;
        errors.push({ row: p.row, message: "Could not resolve teacher/subject/class for this row." });
        continue;
      }

      // Real TeacherSubject link (the same real mechanism a multi-subject
      // teacher already uses, per docs Part 3) — idempotent, never
      // duplicated.
      const existingLink = await tdb.teacherSubject.findFirst({ where: { teacherId, subjectId: p.matchedSubjectId } });
      if (!existingLink) await tdb.teacherSubject.create({ data: { tenantId: user.tenantId, teacherId, subjectId: p.matchedSubjectId } });

      const existingNeed = await tdb.classSubjectNeed.findFirst({ where: { classId: p.matchedClassId, subjectId: p.matchedSubjectId } });
      if (existingNeed) {
        await tdb.classSubjectNeed.update({ where: { id: existingNeed.id }, data: { teacherId, lessonsPerWeek: p.lessonsPerWeek, doubleCount: p.doubleCount } });
        matchedNeeds++;
      } else {
        await tdb.classSubjectNeed.create({ data: { tenantId: user.tenantId, classId: p.matchedClassId, subjectId: p.matchedSubjectId, teacherId, lessonsPerWeek: p.lessonsPerWeek, doubleCount: p.doubleCount } });
        createdNeeds++;
      }
    }

    const importRow = await tdb.teacherAllocationImport.create({
      data: {
        tenantId: user.tenantId,
        fileName: input.fileName || null,
        source: input.source,
        totalRows: input.rows.length,
        createdNeeds, matchedNeeds, createdTeachers, failedRows,
        errorRows: errors.length ? JSON.stringify(errors) : null,
        createdById: user.id,
        createdByName: user.fullName,
      },
    });

    await db.auditLog.create({
      data: {
        tenantId: user.tenantId, actorId: user.id, actorName: user.fullName,
        action: "academics.teacher_allocation_imported", entityType: "user", entityId: user.id,
        metadata: JSON.stringify({ createdNeeds, matchedNeeds, createdTeachers, failedRows, source: input.source }),
      },
    });

    return { totalRows: input.rows.length, createdNeeds, matchedNeeds, createdTeachers, failedRows, errors, importId: importRow.id };
  });
}

export async function listTeacherAllocationImports(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    return tenantDb().teacherAllocationImport.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
  });
}
