/**
 * B.1 Bulk Student Import — validation (Chunk 2).
 *
 * WHO MAY IMPORT: anyone with "student.create" (registrar/bursar/leadership).
 * The API enforces this via requirePermission("student.create").
 *
 * Flow: the client sends RAW text (csv/tsv) or an uploaded XLSX converted to
 * rows server-side -> we auto-map columns -> the client may adjust the
 * mapping -> preview -> commit. Caps keep slow-3G payloads sane.
 */
import { z } from "zod";

/** Hard cap per import run (keeps SQLite/dev + request bodies safe). */
export const MAX_IMPORT_ROWS = 1000;

/** The student fields a spreadsheet column can map to. */
export const IMPORT_FIELDS = [
  "firstName",
  "middleName",
  "lastName",
  "fullName", // convenience: "Achieng Mary Otieno" -> split for the school
  "gender",
  "dateOfBirth",
  "className", // "Form 2 East" / "Grade 4 Blue" -> resolved to SchoolClass
  "legacyAdmissionNo", // school's own existing admission number; NEYO still generates its own ID
  "admissionNo", // backwards-compatible import header; treated as legacyAdmissionNo
  "upiNumber",
  "birthCertNo",
  "guardianName",
  "guardianPhone",
  "notes",
  // BB.4 — a real, optional per-student subject-choice column for a fresh
  // intake arriving with subjects already chosen elsewhere (e.g. a Grade 10
  // student's real subject choices made during Junior Secondary). A cell's
  // value is a real, semicolon-OR-comma-delimited list of subject
  // names/codes the school already uses (e.g. "History;CRE;Business
  // Studies" or "HIS, CRE, BST") — matched case-insensitively against the
  // tenant's own real Subject.name/Subject.code. Never required: an import
  // with no Subjects column behaves exactly as before (zero new
  // StudentSubjectSelection rows created).
  "subjects",
  // R.1 — smart create-or-update: a school can add or fix fee/opening-balance
  // info on a re-import without ever touching totals already paid, since
  // this only ever creates a real ARREARS invoice for the DIFFERENCE (see
  // reconcileOpeningBalance() in the service) — never edits an existing one.
  "openingBalanceKes",
  "custom", // M.4 — school-defined extra field (needs customLabel)
  "ignore", // explicit "skip this column"
] as const;
export type ImportField = (typeof IMPORT_FIELDS)[number];

/** Header synonyms for fuzzy auto-mapping (lowercased, stripped). */
export const HEADER_SYNONYMS: Record<Exclude<ImportField, "ignore">, string[]> = {
  firstName: ["firstname", "first", "fname", "givenname", "jina la kwanza"],
  middleName: ["middlename", "middle", "othername", "othernames", "secondname"],
  lastName: ["lastname", "last", "surname", "familyname", "sname", "jina la mwisho"],
  fullName: ["fullname", "name", "studentname", "pupilname", "names", "student", "learner", "learnername", "majina"],
  gender: ["gender", "sex", "jinsia"],
  dateOfBirth: ["dateofbirth", "dob", "birthdate", "birthday", "tarehe ya kuzaliwa"],
  className: ["class", "classname", "grade", "form", "stream", "classstream", "darasa", "level"],
  legacyAdmissionNo: ["schooladmissionno", "schooladmno", "legacyadmissionno", "legacyadmno", "oldadmno", "oldadmission", "admissionno", "admno", "admissionnumber", "adm", "admission", "regno", "registrationno", "nambari"],
  admissionNo: ["neyoadmissionno", "neyoadmno", "neyoid"],
  upiNumber: ["upi", "upinumber", "upino", "nemisupi", "nemis"],
  birthCertNo: ["birthcertno", "birthcert", "birthcertificate", "birthcertificateno", "bcno"],
  guardianName: ["guardianname", "parentname", "guardian", "parent", "mzazi", "fathername", "mothername", "parentguardian"],
  guardianPhone: ["guardianphone", "parentphone", "phone", "phoneno", "phonenumber", "contact", "mobile", "simu", "telephone", "parentcontact", "guardiancontact"],
  notes: ["notes", "remarks", "comment", "comments", "maelezo"],
  openingBalanceKes: ["openingbalance", "balance", "feebalance", "outstandingbalance", "arrears", "balancebroughtforward", "bbf", "salio"],
  subjects: ["subjects", "subjectchoices", "chosensubjects", "electives", "subjectselection", "masomo"],
  // "custom" is never auto-mapped by header text — a school always chooses it
  // explicitly and types its own label, so no synonym guessing applies here.
  custom: [],
};


/** One column mapping decision: spreadsheet column index -> student field. */
/**
 * M.4 — a column can map to one of the fixed IMPORT_FIELDS, OR to "custom"
 * with a school-provided label (e.g. "House", "Sponsor", "Previous School").
 * Custom values are stored as clean labeled StudentCustomField rows — never
 * mixed into the free-text `notes` field. This stays fully deterministic
 * (the school types the label once at mapping time); it never depends on AI.
 */
export const columnMappingSchema = z.array(
  z.object({
    column: z.number().int().min(0),
    field: z.enum(IMPORT_FIELDS),
    customLabel: z.string().trim().min(1).max(60).optional(),
  }).refine((v) => v.field !== "custom" || Boolean(v.customLabel), {
    message: "A custom field mapping needs a label.",
    path: ["customLabel"],
  })
).max(40);
export type ColumnMapping = z.infer<typeof columnMappingSchema>;

/**
 * BB.4 — declared once per import run (not per row): the real, honest list
 * of subject names/codes that are COMPULSORY for every student in this
 * import (e.g. English, Kiswahili, a chosen Mathematics variant, CSL for a
 * fresh CBE Senior School intake) — resolved the same way as the Subjects
 * column, then unioned into EVERY student's own real selectedSubjectIds so
 * a Subjects column only ever needs to list a student's genuine electives,
 * never having to repeat what's compulsory for everyone on every row.
 * Optional — omit entirely for a school that doesn't want NEYO writing any
 * StudentSubjectSelection rows at import time (they can always use the
 * existing SubjectSelectionPortal afterward instead).
 */
export const importCompulsorySubjectsSchema = z.array(z.string().trim().min(1).max(80)).max(20).optional();

/** Preview request: raw pasted/uploaded text (csv or tsv) OR pre-parsed rows. */
export const importPreviewSchema = z.object({
  source: z.enum(["csv", "xlsx", "paste"]),
  fileName: z.string().trim().max(120).optional(),
  /** Raw text for csv/paste. XLSX uploads go through multipart instead. */
  text: z.string().max(2_000_000).optional(),
  /** Pre-parsed rows (used on commit so we don't re-parse). */
  rows: z.array(z.array(z.string().max(300))).max(MAX_IMPORT_ROWS + 1).optional(),
  hasHeader: z.boolean().default(true),
  mapping: columnMappingSchema.optional(), // omit -> server auto-maps
  /** M.4 — when set, EVERY row in this import goes into this one class only,
   * ignoring any className column and never auto-creating a new class. */
  targetClassId: z.string().trim().min(1).optional(),
  /** R.1 — preview under smart create-or-update rules (see importCommitSchema). */
  updateExisting: z.boolean().default(true),
  /** BB.4 — real subjects compulsory for every student in this run, see importCompulsorySubjectsSchema. */
  compulsorySubjects: importCompulsorySubjectsSchema,
}).refine((v) => v.text !== undefined || v.rows !== undefined, {
  message: "Provide pasted text or parsed rows.",
});
export type ImportPreviewInput = z.infer<typeof importPreviewSchema>;

/** Commit request = same shape but mapping is required. */
export const importCommitSchema = z.object({
  source: z.enum(["csv", "xlsx", "paste"]),
  fileName: z.string().trim().max(120).optional(),
  rows: z.array(z.array(z.string().max(300))).min(1).max(MAX_IMPORT_ROWS + 1),
  hasHeader: z.boolean().default(true),
  mapping: columnMappingSchema,
  /** Create per-student joining requirements from the G.9 master list. */
  seedRequirements: z.boolean().default(true),
  /** Skip rows that fail validation (true) or abort whole import (false). */
  skipInvalid: z.boolean().default(true),
  /** M.4 — import every row into this ONE class only (isolation mode). */
  targetClassId: z.string().trim().min(1).optional(),
  /**
   * BB.4 — the real level (e.g. "Grade 10") a fresh intake belongs to when
   * they haven't been placed into any real class yet (the founder's own
   * "hasn't yet enrolled" scenario) — no className column, no
   * targetClassId, just a real declared level so their real subject
   * selections are attached to the right real portal.targetLevel for the
   * "Allocate Class" wizard to find them afterward. Ignored if the row
   * already resolves a real class (className column or targetClassId).
   */
  targetLevel: z.string().trim().min(1).max(60).optional(),
  /**
   * R.1 — "smart import": when a row matches an EXISTING student (by
   * admission no / UPI / birth cert / name+DOB / name+guardian phone), fill
   * in any blank fields on that student and add new info (guardian, custom
   * fields, opening balance) instead of rejecting the whole import as a
   * duplicate. Defaults to true — this is the safer, more useful default
   * for a school re-uploading an updated register; explicitly set false to
   * get the old strict "duplicates are always rejected" behavior.
   */
  updateExisting: z.boolean().default(true),
  /**
   * R.1 — rows the caller has already reviewed and explicitly confirmed
   * should overwrite a field that already had a DIFFERENT value on the
   * existing student (a genuine conflict, e.g. two different birth dates).
   * Without confirmation, a conflicting field is left untouched and
   * reported back for the school to decide — NEYO never silently overwrites
   * real data. Keyed by the row's 1-based sheet row number.
   */
  confirmedConflictRows: z.array(z.number().int().min(1)).max(MAX_IMPORT_ROWS + 1).optional(),
  /**
   * T.5a — when true, this commit runs as a real tracked background job
   * (the school keeps working elsewhere; NEYO notifies them the moment it
   * finishes). Opt-in, defaults false, so every pre-existing caller/test
   * keeps its exact original synchronous behavior unless it explicitly
   * asks for the new mode.
   */
  runInBackground: z.boolean().optional().default(false),
  /** BB.4 — real subjects compulsory for every student in this run, see importCompulsorySubjectsSchema. */
  compulsorySubjects: importCompulsorySubjectsSchema,
});
export type ImportCommitInput = z.infer<typeof importCommitSchema>;

/** A single normalized student candidate after mapping (pre-DB). */
export const importedRowSchema = z.object({
  firstName: z.string().trim().min(2, "First name too short").max(60),
  middleName: z.string().trim().max(60).optional(),
  lastName: z.string().trim().min(2, "Last name too short").max(60),
  gender: z.enum(["M", "F"]),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").optional(),
  className: z.string().trim().max(60).optional(),
  legacyAdmissionNo: z.string().trim().max(40).optional(),
  admissionNo: z.string().trim().max(30).optional(),
  upiNumber: z.string().trim().max(30).optional(),
  birthCertNo: z.string().trim().max(30).optional(),
  guardianName: z.string().trim().max(80).optional(),
  guardianPhone: z.string().trim().max(20).optional(),
  notes: z.string().trim().max(500).optional(),
  openingBalanceKes: z.coerce.number().int().min(0).max(10_000_000).optional(),
  // BB.4 — raw delimited text from the Subjects column, resolved against
  // the tenant's real Subject list at preview/commit time (not here, since
  // this schema has no DB access) — kept as a plain string, never parsed
  // into IDs at this layer.
  subjects: z.string().trim().max(500).optional(),
});
export type ImportedRow = z.infer<typeof importedRowSchema>;
