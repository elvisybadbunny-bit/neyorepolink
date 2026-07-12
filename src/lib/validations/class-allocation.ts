import { z } from "zod";

/**
 * BB.4 — Grade 10 "Allocate Class" one-click flow.
 *
 * Founder's own real request (verbatim, paraphrased for CBE Senior School
 * intake): a fresh CSV import of newly-joined students (who already chose
 * their real subjects during Junior Secondary), plus the school declaring
 * which subjects are compulsory, should let NEYO analyze the real subject
 * combinations and let the school choose to allocate the classes that
 * weren't allocated with teachers, respecting the school's own real
 * timetable/bell settings and constraints — reusing the ALREADY REAL,
 * ALREADY WORKING L.7 auto-grouping engine (runAutoGroupingPreview /
 * commitAutoGrouping), never inventing a second placement algorithm.
 *
 * Two entry points, ONE underlying wizard/engine (per the founder's own
 * choice): right after a student import completes, or any time later from
 * Students -> Promotion.
 */

/**
 * Preview step: given a level, show the real subject-combination groups
 * this run WOULD produce, honestly distinguishing two real scenarios the
 * founder explicitly described:
 *  - USE_EXISTING: real classes already exist for this level (e.g. already
 *    named in the import file, or created by staff beforehand) — the real
 *    grouping engine is previewed against them as-is.
 *  - a level with ZERO real classes yet needs `proposedStreamCount` +
 *    `proposedCapacityPerClass` so the preview can show what NEW classes
 *    WOULD be created before any are actually written.
 */
export const previewClassAllocationSchema = z.object({
  action: z.literal("preview"),
  level: z.string().trim().min(1, "A real level is required."),
  // Only used when the level currently has zero real active classes — the
  // school's own real choice of how many new streams/sections to create
  // and what real per-class capacity cap to give them (feeds BB.3).
  proposedStreamCount: z.number().int().min(1).max(20).optional(),
  proposedCapacityPerClass: z.number().int().min(1).max(500).optional(),
});
export type PreviewClassAllocationInput = z.infer<typeof previewClassAllocationSchema>;

/**
 * Confirm step: the school's own real, explicit choice of class strategy,
 * matching the founder's own exact clarification — "if a school import has
 * already a list written the class name no issue the system can ask them
 * either to just continue with the classes or regroup based on subjects."
 */
export const classAllocationStrategySchema = z.enum(["CREATE_NEW", "USE_EXISTING"]);

export const confirmClassAllocationSchema = z.object({
  action: z.literal("confirm"),
  level: z.string().trim().min(1, "A real level is required."),
  classStrategy: classAllocationStrategySchema,
  // Required only for CREATE_NEW — the exact real values the school
  // confirmed after seeing the preview (never silently different from what
  // was previewed).
  streamCount: z.number().int().min(1).max(20).optional(),
  capacityPerClass: z.number().int().min(1).max(500).optional(),
  // BB.3 — a real staff decision per flagged class, exactly matching the
  // shape L.7's own commitAutoGrouping() already accepts. Required before
  // confirming if the preview surfaced any real capacityWarnings.
  capacityDecisions: z.record(z.string(), z.literal("ALLOW_OVER_CAPACITY")).optional(),
  // Whether to also seed real ClassSubjectNeed rows from students' actual
  // subject combinations and run the fair teacher auto-assign engine —
  // defaults true (the founder's own described end-to-end flow), but a
  // school can defer this and do it manually via the existing Academics UI.
  seedSubjectNeeds: z.boolean().default(true),
  // Whether to trigger a real Master Button timetable regeneration
  // immediately after allocation. Defaults false — the founder's own
  // explicit BB.3 addendum applies equally here: never fire a real
  // regeneration blindly when subject groups may not be fully configured
  // yet; the school opts in once they're satisfied.
  generateTimetable: z.boolean().default(false),
}).refine(
  (v) => v.classStrategy !== "CREATE_NEW" || (Boolean(v.streamCount) && Boolean(v.capacityPerClass)),
  { message: "Choose how many new classes to create and their capacity before confirming.", path: ["streamCount"] },
);
export type ConfirmClassAllocationInput = z.infer<typeof confirmClassAllocationSchema>;

export const classAllocationActionSchema = z.union([
  previewClassAllocationSchema,
  confirmClassAllocationSchema,
]);
export type ClassAllocationActionInput = z.infer<typeof classAllocationActionSchema>;
