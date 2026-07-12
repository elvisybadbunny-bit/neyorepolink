import { z } from "zod";

// AA.3 — New Academic Year Teacher Allocation Review wizard validation.
//
// The wizard walks a Principal through ONE level at a time, right after a
// real promotion has been committed, showing every subject-teacher slot and
// every class-teacher slot for that level and asking for an explicit real
// decision on each:
//   - KEEP     — leave the current teacher exactly as-is (the common case —
//                 the class simply "moved up" with the same teacher).
//   - REPLACE  — a human deliberately picks a specific different teacher
//                 (usually one of the Continuity Engine's own ranked
//                 recommendations, but never forced — a school can name
//                 anyone eligible).
//   - AUTO     — let NEYO's own fair auto-assign (`autoAssignTeachersToClasses`)
//                 fill this one slot, exactly the same fairness logic used
//                 for a brand-new incoming Form 1 class.
//
// Nothing is ever silently guessed — every slot needs an explicit decision
// before "Apply" is enabled, mirroring the Continuity Engine's own
// staff-confirms-first pattern.

export const reviewRoleTypeSchema = z.enum(["SUBJECT", "CLASS_TEACHER"]);
export const reviewDecisionKindSchema = z.enum(["KEEP", "REPLACE", "AUTO"]);

export const reviewDecisionSchema = z
  .object({
    classId: z.string().min(1, "A real class is required."),
    subjectId: z.string().min(1).nullable().optional(), // null/omitted for CLASS_TEACHER rows
    roleType: reviewRoleTypeSchema,
    decision: reviewDecisionKindSchema,
    // Required only when decision === "REPLACE" — validated by refine below.
    teacherId: z.string().min(1).nullable().optional(),
  })
  .refine(
    (d) => d.roleType !== "SUBJECT" || Boolean(d.subjectId),
    { message: "A SUBJECT decision needs a real subjectId.", path: ["subjectId"] },
  )
  .refine(
    (d) => d.decision !== "REPLACE" || Boolean(d.teacherId),
    { message: "Choosing 'Replace' needs a real teacher to replace with.", path: ["teacherId"] },
  );

export type ReviewDecision = z.infer<typeof reviewDecisionSchema>;

export const startReviewSchema = z.object({
  level: z.string().trim().min(1, "Choose a real level to review."),
  promotionRunId: z.string().min(1).nullable().optional(),
});

export const applyReviewSchema = z.object({
  reviewRunId: z.string().min(1, "A real review session is required."),
  decisions: z.array(reviewDecisionSchema).min(1, "Make at least one real decision before applying."),
  regenerateTimetable: z.boolean().optional().default(true),
});

export type ApplyReviewInput = z.infer<typeof applyReviewSchema>;

// AA.3 — listing / reading a graduated class's frozen history snapshot.
export const classYearHistoryQuerySchema = z.object({
  graduationYear: z.coerce.number().int().min(1990).max(2100).optional(),
  classId: z.string().min(1).optional(),
});
