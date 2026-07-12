import { z } from "zod";

/**
 * AA.2 — Teacher Allocation Import (standard CSV/paste/Bundi engine).
 *
 * Founder's own real onboarding scenario (verbatim, this session): "if a
 * school enrolls into neyo and they already have their teachers subject
 * already allocated subjects how can an import that can read that be
 * entered either in excel csv or the bundi intelligent if they are
 * handwritten." Mirrors the exact CSV/TSV/paste/XLSX pattern already
 * proven by the Staff (B.9), Student (B.1), and Library (Q.1) importers —
 * a genuinely new domain reusing the SAME proven engine shape, not a
 * fourth parallel implementation.
 *
 * One real row = "this teacher teaches this subject to this class/stream,
 * this many lessons per week" — the exact real shape `ClassSubjectNeed`
 * (the Timetable Generator's own live input) already expects. A teacher
 * name that doesn't yet exist in NEYO is a real, honest "would create a
 * new teacher" case (flagged in the preview, never silently skipped);
 * a teacher name that already exists is matched by name (case/whitespace
 * -insensitive) to the real existing `User` row.
 */

export const TEACHER_ALLOCATION_IMPORT_FIELDS = [
  "teacherName",
  "subjectName",
  "className",
  "lessonsPerWeek",
  "doubleCount",
  "ignore",
] as const;
export type TeacherAllocationImportField = (typeof TEACHER_ALLOCATION_IMPORT_FIELDS)[number];

export const TEACHER_ALLOCATION_HEADER_SYNONYMS: Record<Exclude<TeacherAllocationImportField, "ignore">, string[]> = {
  teacherName: ["teacher name", "teacher", "staff name", "staff", "name", "mwalimu", "jina la mwalimu"],
  subjectName: ["subject", "subject name", "course", "somo"],
  className: ["class", "class name", "stream", "class/stream", "form", "grade", "darasa"],
  lessonsPerWeek: ["lessons per week", "lessons/week", "lessons", "periods per week", "periods", "no of lessons"],
  doubleCount: ["doubles", "double lessons", "double count", "no of doubles"],
};

export const teacherAllocationImportRowSchema = z.object({
  teacherName: z.string().trim().min(1, "Teacher name is required"),
  subjectName: z.string().trim().min(1, "Subject name is required"),
  className: z.string().trim().min(1, "Class/stream is required"),
  lessonsPerWeek: z.coerce.number().int().min(1).max(20).default(5),
  doubleCount: z.coerce.number().int().min(0).max(10).default(0),
});
export type TeacherAllocationImportRow = z.infer<typeof teacherAllocationImportRowSchema>;

/** One real row's PREVIEW outcome — shown to the school before commit, so
 * nothing is silently created/matched without the school seeing it first
 * (the same real "preview-before-commit" discipline every other NEYO
 * importer already follows). */
export const teacherAllocationPreviewRowSchema = z.object({
  row: z.number().int(),
  teacherName: z.string(),
  subjectName: z.string(),
  className: z.string(),
  lessonsPerWeek: z.number(),
  doubleCount: z.number(),
  teacherMatch: z.enum(["EXISTING", "NEW", "AMBIGUOUS"]),
  matchedTeacherId: z.string().nullable(),
  matchedTeacherName: z.string().nullable().optional(),
  subjectMatch: z.enum(["EXISTING", "NOT_FOUND"]),
  matchedSubjectId: z.string().nullable(),
  classMatch: z.enum(["EXISTING", "NOT_FOUND"]),
  matchedClassId: z.string().nullable(),
  needMatch: z.enum(["WILL_CREATE", "WILL_UPDATE"]).nullable(),
  error: z.string().nullable(),
});
export type TeacherAllocationPreviewRow = z.infer<typeof teacherAllocationPreviewRowSchema>;

export const commitTeacherAllocationSchema = z.object({
  rows: z.array(teacherAllocationImportRowSchema).min(1).max(2000),
  fileName: z.string().trim().max(200).optional(),
  source: z.enum(["csv", "xlsx", "paste", "bundi"]).default("paste"),
  // A row whose teacher genuinely doesn't exist yet is only actually
  // created when the school explicitly confirms it here — never silently,
  // since creating a real new staff User is a bigger, more consequential
  // action than matching an existing one.
  createMissingTeachers: z.boolean().default(false),
  skipInvalid: z.boolean().default(true),
});
export type CommitTeacherAllocationInput = z.infer<typeof commitTeacherAllocationSchema>;
