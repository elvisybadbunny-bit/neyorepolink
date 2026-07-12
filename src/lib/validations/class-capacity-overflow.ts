import { z } from "zod";

/**
 * BB.3 — Real class-size cap + overflow decision.
 *
 * Founder's own real request: "again the school can add their maximum
 * number for a class so that when the system combines different classes
 * into one class and their is a big number remaining a new teacher is
 * added or a school can just press allow all in that one class even if
 * they surpass the number." Follow-up design: a new split section is
 * named after the real subject that caused the split (e.g. "Form 3 Geo"),
 * and the fair teacher auto-assign for the new section runs LAST — only
 * filling gaps a school hasn't already manually decided, never
 * overriding a real manual choice, and never triggering a blind
 * timetable regeneration if a tenant has no real subject groups
 * configured yet.
 */

export const overflowDecisionKindSchema = z.enum(["SPLIT_NEW_CLASS", "ALLOW_OVER_CAPACITY"]);

export const checkCapacitySchema = z.object({
  action: z.literal("check"),
  classId: z.string().min(1, "A real class is required."),
  // The real student ids a school is about to place into this class (from
  // L.7 auto-grouping, BB.2/BB.4 auto-build, or any other real placement
  // flow) — checked against the class's own real configured capacity.
  studentIds: z.array(z.string().min(1)).min(1, "At least one real student is required."),
  subjectId: z.string().min(1).nullable().optional(),
});
export type CheckCapacityInput = z.infer<typeof checkCapacitySchema>;

export const decideOverflowSchema = z.object({
  action: z.literal("decide"),
  runId: z.string().min(1, "A real overflow check is required first."),
  decision: overflowDecisionKindSchema,
  // Real, school-chosen name for the new class/section — required only
  // when splitting (a real school-facing name, e.g. "Form 3 Geo"), never
  // silently auto-applied without the school seeing/editing it first.
  newClassName: z.string().trim().min(1).max(80).optional(),
  newClassStream: z.string().trim().max(60).optional(),
}).refine(
  (input) => input.decision !== "SPLIT_NEW_CLASS" || Boolean(input.newClassName?.trim()),
  { message: "Name the new class/section before splitting.", path: ["newClassName"] },
);
export type DecideOverflowInput = z.infer<typeof decideOverflowSchema>;

export const classCapacityOverflowActionSchema = z.union([
  checkCapacitySchema,
  decideOverflowSchema,
]);
