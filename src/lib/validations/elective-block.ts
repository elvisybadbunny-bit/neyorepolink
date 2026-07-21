import { z } from "zod";

// AA.1 — Elective/Options Block engine validation.
// Real design constraint from docs/TEACHER-ALLOCATION-AND-ELECTIVES-ENGINE-DESIGN.md
// Part 7: a block has >=2 real slots is NOT required (a single-slot block is
// a genuinely valid, simpler real shape — e.g. one shared "Options" period),
// and a slot may contain one subject. A singleton is necessary when the
// deterministic Senior School A/B/C colouring leaves one option column with
// only one offered subject; it still reserves the correct five block periods
// and preserves every learner's one-subject-per-column proof.

export const electiveBlockModeSchema = z.enum(["MULTI_SLOT", "SINGLE_CHOICE"]);

const slotSubjectSchema = z.object({
  id: z.string().optional(), // present on update, absent on create
  subjectId: z.string().min(1, "Choose a real subject."),
  teacherId: z.string().min(1).optional().or(z.literal("")),
  // BB.1 — left blank ("" or omitted) means "let NEYO auto-pick a real
  // venue from the pool if this subject genuinely needs one" (a school's
  // own explicit pin here always wins over the solver's own pick — see
  // ElectiveBlockSlotSubject.resolvedVenueId in the DB layer). This is a
  // deliberately UNCHANGED validation shape from AA.1 (blank was already
  // valid) — BB.1's real new behaviour lives entirely in the solver
  // (timetable-engine.service.ts), not in this input contract.
  venueId: z.string().min(1).optional().or(z.literal("")),
  // Real classIds sharing this exact subject inside this slot — defaults to
  // the whole block's class list when omitted (the common case), but can be
  // a genuine subset when a school merges a small cohort across streams.
  classIds: z.array(z.string().min(1)).optional(),
  teachingGroupKey: z.string().trim().min(1).max(30).optional().default("MAIN"),
  teachingGroupLabel: z.string().trim().max(80).optional(),
  studentIds: z.array(z.string().min(1)).optional().default([]),
});

const slotSchema = z.object({
  id: z.string().optional(),
  label: z.string().trim().min(1, "Give this slot a real label.").max(80),
  isDouble: z.boolean().optional().default(false),
  sortOrder: z.number().int().min(0).optional().default(0),
  subjects: z.array(slotSubjectSchema).min(1, "An Options Block slot needs at least one real subject."),
}).refine(
  (slot) => new Set(slot.subjects.map((s) => `${s.subjectId}:${s.teachingGroupKey ?? "MAIN"}`)).size === slot.subjects.length,
  { message: "The same subject teaching-group key cannot appear twice in one slot.", path: ["subjects"] },
).refine(
  (slot) => {
    // Real, physically-necessary rule: one teacher cannot teach two
    // PARALLEL subjects at the exact same real time — a genuine gap found
    // during this feature's own real regression testing (a school could
    // otherwise save an impossible request that the solver would then
    // have to silently misplace or double-book). Two subjects in the SAME
    // slot sharing the same real teacherId is only valid if their
    // real classIds don't overlap (e.g. the same teacher genuinely
    // covers History for Stream A and Geography for Stream B
    // simultaneously in two different real rooms is still impossible for
    // ONE person — so this is a hard, always-invalid combination
    // regardless of classIds, matching how a real school actually works).
    const teacherIds = slot.subjects.map((s) => s.teacherId).filter(Boolean) as string[];
    return new Set(teacherIds).size === teacherIds.length;
  },
  { message: "The same real teacher cannot be assigned to two subjects in the SAME slot — one person cannot teach two parallel lessons at once.", path: ["subjects"] },
);

export const electiveBlockSaveSchema = z.object({
  action: z.literal("save_block"),
  id: z.string().optional(), // present on update
  name: z.string().trim().min(2, "Name this block, e.g. \"Humanities Pair\".").max(120),
  mode: electiveBlockModeSchema.default("MULTI_SLOT"),
  preferAfterBreak: z.boolean().optional().default(false),
  // AA.10 follow-up — a school's own override: keep this block's exam
  // sittings genuinely independent even when the system would otherwise
  // advise combining them (only ever changes anything for a SINGLE_CHOICE
  // block — see prisma/schema.prisma for the full real design note).
  preferSplitExamSittings: z.boolean().optional().default(false),
  classIds: z.array(z.string().min(1)).min(1, "Select at least one real class for this block."),
  slots: z.array(slotSchema).min(1, "A block needs at least one real slot."),
}).refine(
  (block) => {
    if (block.mode !== "SINGLE_CHOICE") return true;
    // SINGLE_CHOICE means every real slot lists the SAME subject set —
    // enforced here so the simpler UI mode can't silently drift into an
    // inconsistent MULTI_SLOT-shaped block without the school realizing.
    const signature = (slot: typeof block.slots[number]) =>
      [...slot.subjects.map((s) => s.subjectId)].sort().join(",");
    const first = signature(block.slots[0]);
    return block.slots.every((slot) => signature(slot) === first);
  },
  { message: "In Single-Choice mode, every slot must offer the exact same set of subjects.", path: ["slots"] },
);
// Real, pre-existing type-strictness gap found and fixed while working on
// DD.1 (an unrelated feature, but this broke `tsc --noEmit` cleanliness):
// `z.infer` resolves to a Zod schema's OUTPUT type, where every
// `.optional().default(...)` field becomes non-optional (since parsing
// always fills it in) — but callers of `saveElectiveBlock()` genuinely
// experience the INPUT shape, where `preferAfterBreak`/
// `preferSplitExamSittings`/etc. are still genuinely optional. `z.input`
// is the correct type here; several pre-existing call sites (aa1-*,
// aa5-*, elective-block-auto-build.service.ts) never passed
// `preferSplitExamSittings` at all, which `z.infer`'s output type wrongly
// demanded once AA.10's follow-up added that field.
export type ElectiveBlockSaveInput = z.input<typeof electiveBlockSaveSchema>;

export const electiveBlockDeleteSchema = z.object({
  action: z.literal("delete_block"),
  id: z.string().min(1),
});

export const electiveBlockActionSchema = z.union([electiveBlockSaveSchema, electiveBlockDeleteSchema]);
