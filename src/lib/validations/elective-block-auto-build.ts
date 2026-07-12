import { z } from "zod";

/**
 * BB.2 — Elective Block auto-build FROM real student subject-choice data.
 *
 * Founder's own real request: "the adding of subjects should be automatic
 * from the students data of subjects they choose and then give the
 * combined list of students doing the subjects and the teachers too and
 * as well how many teachers too." Founder-confirmed design: a school may
 * still build a block manually if preferred (this is an accelerator, never
 * forced), the engine must respect real CBC/CBE subject-allocation rules
 * (compulsory-vs-elective detected from real Pathway data for CBE, or a
 * school's own configured compulsory list for 8-4-4), and available
 * lesson-slot capacity must come from the school's own real TimetableConfig
 * rather than assuming the KICD 40-lesson figure.
 *
 * Two real scenarios (`kind`):
 *   - ELECTIVES: general elective auto-detection from real student choices.
 *   - MATH_SPLIT: the real Core-vs-Essential Mathematics split for a class
 *     with a genuine mix of STEM/non-STEM pathway students.
 */

export const electiveBlockAutoBuildKindSchema = z.enum(["ELECTIVES", "MATH_SPLIT"]);

export const previewAutoBuildSchema = z.object({
  action: z.literal("preview"),
  level: z.string().trim().min(1, "Choose a real level to analyse."),
  kind: electiveBlockAutoBuildKindSchema.default("ELECTIVES"),
  // Real default lessons-per-week suggestion for a newly-detected elective
  // subject (founder-confirmed: a simple, editable default — not derived
  // from a lookup). A school edits this per-subject in the preview before
  // confirming; never silently applied without review.
  defaultLessonsPerWeek: z.coerce.number().int().min(1).max(20).default(5),
});
export type PreviewAutoBuildInput = z.infer<typeof previewAutoBuildSchema>;

const confirmedSubjectSchema = z.object({
  subjectId: z.string().min(1),
  teacherId: z.string().min(1).nullable().optional(),
  lessonsPerWeek: z.coerce.number().int().min(1).max(20).default(5),
  // Real classIds actually offering this subject inside the confirmed
  // block — a school may narrow this from the full preview if, e.g., one
  // stream's students all picked something else.
  classIds: z.array(z.string().min(1)).min(1, "At least one real class must offer this subject."),
});

export const confirmAutoBuildSchema = z.object({
  action: z.literal("confirm"),
  runId: z.string().min(1, "A real preview run is required before confirming."),
  blockName: z.string().trim().min(2, "Name this block.").max(120),
  preferAfterBreak: z.boolean().optional().default(false),
  subjects: z.array(confirmedSubjectSchema).min(2, "A real Options Block needs at least 2 subjects for students to genuinely choose between."),
}).refine(
  (input) => new Set(input.subjects.map((s) => s.subjectId)).size === input.subjects.length,
  { message: "The same subject cannot appear twice in one confirmed block.", path: ["subjects"] },
);
export type ConfirmAutoBuildInput = z.infer<typeof confirmAutoBuildSchema>;

export const discardAutoBuildSchema = z.object({
  action: z.literal("discard"),
  runId: z.string().min(1),
});

export const electiveBlockAutoBuildActionSchema = z.union([
  previewAutoBuildSchema,
  confirmAutoBuildSchema,
  discardAutoBuildSchema,
]);
