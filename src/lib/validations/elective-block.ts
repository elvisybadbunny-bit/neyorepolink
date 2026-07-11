import { z } from "zod";

// AA.1 — Elective/Options Block engine validation.
// Real design constraint from docs/TEACHER-ALLOCATION-AND-ELECTIVES-ENGINE-DESIGN.md
// Part 7: a block has >=2 real slots is NOT required (a single-slot block is
// a genuinely valid, simpler real shape — e.g. one shared "Options" period),
// but every slot must list at least 2 real subjects (a "choice between
// alternatives" with only 1 option isn't a real choice, and would just be
// an ordinary ClassSubjectNeed instead).

export const electiveBlockModeSchema = z.enum(["MULTI_SLOT", "SINGLE_CHOICE"]);

const slotSubjectSchema = z.object({
  id: z.string().optional(), // present on update, absent on create
  subjectId: z.string().min(1, "Choose a real subject."),
  teacherId: z.string().min(1).optional().or(z.literal("")),
  venueId: z.string().min(1).optional().or(z.literal("")),
  // Real classIds sharing this exact subject inside this slot — defaults to
  // the whole block's class list when omitted (the common case), but can be
  // a genuine subset when a school merges a small cohort across streams.
  classIds: z.array(z.string().min(1)).optional(),
});

const slotSchema = z.object({
  id: z.string().optional(),
  label: z.string().trim().min(1, "Give this slot a real label.").max(80),
  isDouble: z.boolean().optional().default(false),
  sortOrder: z.number().int().min(0).optional().default(0),
  subjects: z.array(slotSubjectSchema).min(2, "A real Options Block slot needs at least 2 subjects for students to genuinely choose between."),
}).refine(
  (slot) => new Set(slot.subjects.map((s) => s.subjectId)).size === slot.subjects.length,
  { message: "The same subject cannot appear twice in one real slot.", path: ["subjects"] },
);

export const electiveBlockSaveSchema = z.object({
  action: z.literal("save_block"),
  id: z.string().optional(), // present on update
  name: z.string().trim().min(2, "Name this block, e.g. \"Humanities Pair\".").max(120),
  mode: electiveBlockModeSchema.default("MULTI_SLOT"),
  preferAfterBreak: z.boolean().optional().default(false),
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
export type ElectiveBlockSaveInput = z.infer<typeof electiveBlockSaveSchema>;

export const electiveBlockDeleteSchema = z.object({
  action: z.literal("delete_block"),
  id: z.string().min(1),
});

export const electiveBlockActionSchema = z.union([electiveBlockSaveSchema, electiveBlockDeleteSchema]);
