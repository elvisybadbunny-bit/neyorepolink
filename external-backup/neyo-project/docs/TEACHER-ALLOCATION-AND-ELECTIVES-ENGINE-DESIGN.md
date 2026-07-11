# Teacher Allocation, Onboarding Import & Electives/Combinations — Design Document

**Written: 2026-07-12.** This is a design/scoping document, not a build log. It answers the founder's own long list of real-world scenarios (verbatim, this session) about how NEYO's Timetable Generator and Teacher Allocation system should behave when a school first joins NEYO, when an academic year turns over, and when a school runs a genuinely complex real electives/combinations system (especially the new CBE Senior School). It is written in plain language first, with a technical "how this maps to NEYO today" section for each topic, and ends with an honest list of what's already built vs. genuinely new work — followed by a proposed build order (a new **Part AA**) for what's not yet built.

---

## Part 1 — Onboarding a school that already has teacher-subject-class allocations

### The real-world problem
A school switching to NEYO from paper/Excel/another system almost never starts from zero — they already know "Mrs. Wanjiru teaches Form 2 East Mathematics and Form 3 West Mathematics," often written in a register, a spreadsheet, or literally handwritten in an exercise book. Re-typing all of that by hand, one row at a time, into NEYO would be exhausting and error-prone, and would put schools off switching.

### What NEYO should do (and what already exists)
NEYO should let a school import their EXISTING teacher-to-class-to-subject allocation the same way it already imports students and staff — through one of 3 real input paths:

1. **Excel/CSV upload** — a school's existing spreadsheet, uploaded as-is.
2. **Paste from Excel** — copy cells directly from an open spreadsheet and paste into NEYO.
3. **Bundi (the helper) reads a handwritten register** — a photo of a handwritten allocation sheet, read automatically.

**What already exists in NEYO today (real, working, not proposed):**
- A universal rule-based import engine (`staff-import.service.ts`) already handles CSV/TSV/XLSX/paste for staff records themselves (name, phone, TSC number, role, etc.) — this is the proven pattern to extend.
- **Bundi Intelligent** (`bundi-intelligent.service.ts`) already reads handwritten registers for Students, Staff, and Library — a real, working, local-first OCR pipeline (not a stub) that reads ruled exercise-book-style tables, auto-corrects common misreads, cross-checks values against the school's own real data (e.g. "is this really one of our class names?"), remembers corrections a school makes so it gets smarter the more a school uses it, and only escalates to a paid AI service for the specific handful of characters it genuinely can't read with confidence — never a whole-page AI call. This exact pipeline is built to be **domain-generic** already (it takes a `domain` parameter) — adding a 4th domain (`TEACHER_ALLOCATION`) reuses ~90% of the existing machinery.
- The underlying database model that would receive this data (`TeacherSubject` — which teacher teaches which subject, `ClassSubjectNeed` — which class needs how many lessons of which subject taught by whom) already exists and is already the exact real engine input the Timetable Generator itself consumes. This is a genuinely important point: **importing allocation data isn't a new destination, it's a new front door into data structures that already exist and are already fully wired into the live generator.**

**What's genuinely new work (not yet built):**
- A dedicated **Teacher Allocation Import** flow — its own import template (columns like `Teacher Name`, `Subject`, `Class/Level`, `Lessons per Week`), its own Zod validation, its own preview-before-commit screen (matching every other NEYO importer's UX), and wiring `TEACHER_ALLOCATION` as a 4th real Bundi Intelligent domain.
- **Smart matching during import**: when a school pastes "Mrs. Wanjiru — Mathematics — Form 2 East, Form 3 West," NEYO needs to (a) find or create the teacher's real `User`/`StaffProfile` record, (b) find or create the real `Subject` record, (c) find the real `SchoolClass` records for "Form 2 East" and "Form 3 West," and (d) create the real `TeacherSubject` + `ClassSubjectNeed` rows — all in one commit, with a clear preview showing exactly what will be created vs. matched to something that already exists, so nothing is silently duplicated.
- A genuinely useful real safety net: if the import can't confidently match a class or subject name (e.g. a typo, or a name the school hasn't set up yet in NEYO), it should show that row as "needs your confirmation" rather than either failing the whole import or guessing wrong.

---

## Part 2 — What happens when the academic year turns over (graduation, promotion, reshuffle)

### The real-world problem (the founder's own scenario)
When Form 4 graduates, their classes (Form 4 East, Form 4 West, etc.) genuinely cease to exist. The Form 3 students become the new Form 4, Form 2 becomes Form 3, and so on, and a brand-new Form 1 intake arrives. A school then needs to decide, for teachers: do we keep the SAME teacher-to-class pairings (the class "moves up" with its teachers), reshuffle everything fresh, or a mix — keep most things the same but let the school explicitly edit anything they want changed, and then allocate teachers to the brand-new incoming Form 1?

### What already exists in NEYO today
This is one of the most mature parts of NEYO already — the founder's scenario maps almost exactly onto real, already-built machinery:
- **`promotionPlan()`/`commitPromotion()`** (`promotion.service.ts`) — a real, already-working academic year turnover engine. It correctly identifies which classes graduate (Form 4 → no next level, students marked `GRADUATED` with a real `graduationYear` and `finalClassLabel`), which move up a level (Form 1 → Form 2, keeping the same stream), and supports individual students being marked to REPEAT their current level instead of moving up (a real, staff-picked list, never automatic). Real audit-logged, with a full run history and an undo path.
- **The L.7 Continuity Engine** (`l7-continuity-engine.service.ts`) — this is the piece that answers the founder's exact "should the teacher stay with the class or not" question. It already models a real `TeacherContinuityAssignment` per level+stream (e.g. "Form 2 East's Mathematics teacher continuity policy"), and when a teacher becomes unavailable (left, or simply not reappointed to that class), it produces REAL ranked replacement recommendations, factoring in workload fairness (`TeacherWorkloadRule` — max classes/max lessons per teacher, already real), "strong subject" preference, and existing timetable conflicts (`autoAssignTeachersToClasses()` in `timetable-solver.service.ts`, which already avoids double-booking a teacher into two classes at the same real timetable slot).
- **`autoAssignTeachersToClasses()`** — this is the real engine that fills in `ClassSubjectNeed.teacherId = null` gaps (exactly what a brand-new incoming Form 1 needs) by finding eligible teachers (those linked to that subject via `TeacherSubject`), preferring their "strong" subjects, and balancing workload fairly by lowest-current-load, while respecting existing timetable conflicts.

**What this means practically, mapped onto the founder's own words:**
- *"a school may choose to either reshuffle or let them stay the current"* → this is a real, already-existing choice. If a school does nothing after promotion, `ClassSubjectNeed` rows simply "move up" with their class ID unchanged in spirit (the new Form 2 East class inherits the demand structure a school sets up for it) — a school can also explicitly invoke the Continuity Engine to review and reassign per level.
- *"allocate for new classes the incoming form and the available teachers"* → this is exactly what `autoAssignTeachersToClasses()` already does for any `ClassSubjectNeed` missing a teacher, which a newly-created Form 1 class's needs would be by default.
- *"a school can edit what they want changed for the remaining ones any time"* → already true today; a school can edit any `ClassSubjectNeed.teacherId` directly at any time via Academics → Smart Timetable, and the timetable can be regenerated to reflect it.

**What's genuinely new work (a real, small gap found during this audit):**
- **No automatic cleanup of ORPHANED `ClassSubjectNeed`/`TimetableSlot`/`CombinationGroup` rows when a class graduates and its own class-row is never actually deleted.** Right now, `SchoolClass` has a real `archived` boolean, but `commitPromotion()` does not appear to set it, nor does it clean up the graduated class's own `ClassSubjectNeed` rows. A graduated Form 4 class's old subject-needs and old timetable slots may silently sit around as "orphan" data that no longer means anything real — not dangerous, but not clean, and could confuse a future report or a re-generation run if not explicitly excluded by an `archived: false` filter everywhere (most queries do already filter by `archived: false`, which is a mitigating factor, but the underlying class row itself should probably be formally archived, not silently left active-but-empty).
- **No single "New Academic Year — Teacher Allocation Review" wizard** that walks a Principal through, level by level: "here is who taught this class last year, keep them / replace them / let NEYO suggest" — the underlying pieces (Continuity Engine + auto-assign) exist, but there's no single guided UI screen tying them together specifically for the "just finished promotion, now let's sort out teachers" moment. This is a real, comparatively small, high-value UI/workflow feature to build.

---

## Part 3 — Teachers who teach 2+ subjects, and the timetable checking availability

### The real-world problem
A teacher might teach both Mathematics AND Business Studies. The allocation system needs to assign both subjects to that one teacher across whichever classes need them, and the timetable generator needs to make sure the SAME teacher is never double-booked at the same time for their two different subjects across two different classes.

### What already exists in NEYO today
This is **already fully real and working**, and is in fact one of the best-tested parts of the whole system:
- `TeacherSubject` is a real many-to-many table — one teacher can be linked to as many subjects as they genuinely teach (e.g. Mrs. Wanjiru → Mathematics AND Business Studies), each optionally marked `isStrong` for a real, weighted preference.
- `autoAssignTeachersToClasses()` naturally handles a multi-subject teacher correctly: for each `ClassSubjectNeed` still needing a teacher, it looks at all teachers linked to THAT subject and picks the fairest available one — a teacher linked to 2 subjects simply appears as an eligible candidate for both, independently, and their running workload total (`workload` map, keyed by teacher, summing `lessonsPerWeek` across ALL their assignments regardless of subject) is what keeps things fair, exactly addressing the founder's "checking maybe the availability" concern.
- The actual Timetable Generator's solver (`timetable-engine.service.ts`) tracks teacher busy-ness per (day, period) slot GLOBALLY across every class and subject that teacher is assigned to — a teacher can never be placed into two different lessons (even for two totally different subjects/classes) at the same real time. This is core, foundational, always-on behavior, not an opt-in constraint — proven by the `l7-timetable-engine-test.ts` regression suite's "No teacher double-booked" assertion, which has been re-verified dozens of times this project across every major engine change.

**Conclusion: no new work needed here — already fully real and working today.**

---

## Part 4 — Split subjects (e.g. Kiswahili → Fasihi ya Lugha + Fasihi ya Riwaya), same or different teachers

### The real-world problem
Some subjects aren't really "one subject" for timetabling purposes — Kiswahili at Senior School level genuinely splits into distinct examinable components (e.g. Fasihi/Lugha), which may be taught by the same teacher or two different specialist teachers, and need their own distinct timetable slots.

### What already exists in NEYO today
NEYO's `Subject` model is already just a plain, flexible row (`name`, `code`, `curriculum`) — there is nothing stopping a school from creating "Kiswahili Fasihi" and "Kiswahili Lugha" as two entirely separate real `Subject` rows today, each with its own `ClassSubjectNeed` (own lesson count, own teacher assignment, own optional venue). The engine does not need to "know" that these two subjects are secretly related — as far as the solver is concerned they are just two independent subjects, which is exactly correct behavior: it will happily assign the SAME teacher to both if that's what the school sets up (since a teacher can be linked to multiple subjects, per Part 3 above), or two different teachers, with zero extra work.

**What's genuinely new work (real, worth building, not urgent)**:
- **A "subject family" grouping label is currently missing** — right now nothing marks "Kiswahili Fasihi" and "Kiswahili Lugha" as belonging to the same real parent subject for REPORTING purposes (e.g. a report card that wants to show one combined "Kiswahili" grade computed from both components, or a KNEC-style export that needs to know these are sub-papers of one subject). This is a genuine gap, but it's a grading/reporting-engine concern more than a timetabling one — the exam system already has an analogous real concept (`SubjectPaperConfig` — multiple named "papers" under one subject, e.g. Paper 1/Paper 2/Insha/Oral) which could plausibly be extended or reused to model this exact "one subject, multiple real examinable components" shape more explicitly, rather than requiring a school to create two fully separate top-level Subject rows that only coincidentally share a name prefix.

---

## Part 5 — Multiple curricula in one school (CBC Grade 10 + 8-4-4 Forms, different subject sets)

### The real-world problem
A school may run both an old 8-4-4 stream (Form 1-4) and the new CBE stream (Grade 10-12) simultaneously during the national transition years, each with completely different subject lists, lesson structures, and (per the founder's research) a totally different Senior School electives/pathway system.

### What already exists in NEYO today
This is already a real, deliberately-designed part of the system:
- `SchoolClass.curriculum` is a real field (`"CBC"` / `"8-4-4"`, and `Subject.curriculum` similarly supports `"BOTH"`) — a school's classes and subjects are already explicitly tagged by curriculum, so an 8-4-4 Form 3's subject list and a CBE Grade 10's subject list are naturally kept completely separate; nothing forces them to share a subject just because they coexist in the same tenant.
- The Timetable Generator's own "level-aware presets" (`timetable-engine.service.ts`'s `isSeniorSchool`/`isJuniorSchool` detection, driven by the school's own configured `educationLevelsOffered`) already changes real solver behavior for CBE Senior School specifically — richer combination scheduling bias, stronger morning-academic-density preference — versus a plainer preset for lower/8-4-4 levels. This proves the underlying architecture already treats "this class belongs to a different curriculum system" as a first-class distinction the solver reasons about, not an afterthought.
- The **KICD Senior School 40-lesson template** (Part P.5, already built) can auto-populate a Grade 10-12 class's exact real subject list (English 5, Kiswahili 5, Core/Essential Mathematics 5, Community Service Learning 3, 3 real pathway electives × 5 = 15, PE 3, ICT Skills 2, PPI 1, Personal/Group Study 1 = 40) in one action, matching the real, current (2026) national structure researched fresh for this document — see Part 7 below for full detail.

**Conclusion: this scenario is already correctly supported today.** A school running both an 8-4-4 Form 3 and a CBE Grade 10 in the same tenant, each with their own real subjects, own real teacher allocations, and own real generated timetables, works with zero extra engineering — this is proven architecture, not a gap.

---

## Part 6 — Electives placed in ONE shared timetable slot, with different teachers per subject (the founder's real high-school scenario)

### The real-world problem, in the founder's own words
A school's electives (e.g. History and CRE) are placed at the SAME timetable slot for the whole form/grade — every student in that form is doing SOMETHING during that slot, but which room/teacher they go to depends on which elective they personally chose. Movement happens: students physically leave their home class and go to whichever elective classroom matches their choice. The timetable needs to show, for that one slot, a set of teacher codes (e.g. "HG/TY/EF/TS/GW") meaning "these 5 teachers are all teaching electives during this one slot, across however many separate elective groups exist." When 2 classes are small enough to combine for the SAME elective (e.g. Form 2 East + Form 2 West both send their small CRE-choosing group into one shared lesson), the SAME shared teacher covers both, and the system (or the school, confirming a suggestion) decides that combination.

### What already exists in NEYO today
This maps closer to existing machinery than it might first appear:
- **`CombinationGroup`** (with `source: "SUBJECT_CHOICE"`) is EXACTLY the mechanism for "students who chose this elective, regardless of which home class they started in, get grouped into one shared teaching lesson." `deriveClassesFromSubjectChoice()` already reads real `StudentSubjectSelection` rows (a student's confirmed elective picks) and automatically finds every real class that has at least one student who picked that subject — this is the real, working version of "the system... automatically placed that based on the number and the school confirms."
- The solver already schedules a `CombinationGroup`'s lesson at ONE shared period across every member class simultaneously (proven by the `l7-timetable-engine-test.ts`'s "Combination scheduled at SAME periods across member classes" + "Combination uses the shared teacher" assertions) — this is precisely the founder's "always placed in one slot coz of combined classes."
- **Z.6 (built this session, see `FEATURES-CHECKLIST.md`)** extends this further for the EXAM side: real `STREAM_GROUP` auto-targeting so multiple streams of the same level sitting the same subject automatically sit together, with an explicit `CombinationGroup` always taking priority when one exists.
- Teacher/venue print short-codes (`teacherShortCode`, Z.3) are ALREADY exactly the founder's "HG/TY/EF/TS/GW" mechanism — printed timetables already show a small 2-letter teacher code in the corner of each lesson cell (e.g. "MO" for Mary Omondi).

**What's genuinely new work (the real gap this scenario exposes):**
- **The engine does not currently model "one shared TIME SLOT containing several DIFFERENT elective lessons happening in parallel" as a single first-class concept.** Today, each `CombinationGroup` is scheduled independently — the solver happens to often place several unrelated electives at similar times because they compete for the same scarce "everyone is busy with an elective right now" pressure, but there's no explicit rule saying "History-choosers and CRE-choosers must be in DIFFERENT lessons happening at the EXACT SAME period, because they are alternatives to each other, not just coincidentally similar in size." This needs a genuinely new concept: an **"Elective Slot" / "Options Block"** — a school-defined group of 2 or more subjects (e.g. {History, CRE}) that the solver is told MUST occupy the exact same period, every time, specifically because students choosing between them are mutually exclusive alternatives. This is the single most important new concept this document identifies — see Part 7 for the full electives-block design, since the founder's later scenarios (Physics-vs-2-Humanities, Technical & Applied options) are really the SAME underlying concept at different levels of complexity.
- **The one printed row showing multiple teacher codes together** ("HG/TY/EF/TS/GW meaning these 5 teachers are the ones teaching those subjects and classes") is a genuine print/UI gap — today's print renderer shows one teacher code per lesson CELL, but an Elective/Options Block cell (spanning potentially 3-5 parallel lessons happening at once) would need its own distinct visual treatment showing ALL the parallel teacher codes together in one cell, since a single class's "home" timetable can't show 5 different subjects in the one physical cell it owns — this needs real, new print-rendering work once the underlying Elective Block concept exists.

---

## Part 7 — The full Elective/Options Block design (covering every scenario the founder described)

This section directly answers the founder's most detailed scenario: their own high school's real "Physics OR 2 Humanities" system, plus the CBE Senior School pathway electives, plus a Technical & Applied single-choice block. All three are, underneath, the SAME real concept — **a school-defined "Options Block": a set of subjects that occupy IDENTICAL timetable slot(s), where a student attends exactly one of them (or is genuinely free during that slot if none of the block's subjects apply to their own choices) — with each subject in the block potentially taught by a different teacher, in a different room, possibly to a combined group of classes.**

### Worked example (the founder's own scenario, modeled exactly)
Options Block "Humanities Pair", used across 2 real timetable SLOTS per week:
- Slot A = "Hist/CRE": History (for History-choosers) + CRE (for CRE-choosers) run in parallel.
- Slot B = "Hist/Geo": History (for the SAME History-choosers, a 2nd lesson) + Geography (for Geography-choosers) run in parallel.
- Real students, mapped exactly as the founder described:
  - A student who chose **Geography + Physics**: attends Geography in Slot B, is genuinely FREE (a real, non-fabricated free period — see Part 9) in Slot A (since they take neither History nor CRE), and attends Physics in its own separate dedicated Physics slot (not part of this block at all).
  - A student who chose **History + CRE**: attends CRE in Slot A, attends History in Slot B (their 2nd History lesson), and is free during the dedicated Physics slot.
  - A student who chose **Geography + CRE**: attends CRE in Slot A, Geography in Slot B, free during Physics.
  - Biology is compulsory for everyone in this founder's real school and sits in its own separate, non-block slot entirely, attended by all students regardless of their Options Block choices.

This is a genuinely intricate, real scheduling shape — not every subject in the block appears in every slot the block occupies (History appears in slot B only in this example, not slot A), and a student's real free/attend pattern differs based on the SPECIFIC pair of subjects they picked, not just "which block did they join."

### Proposed real data model (new, not yet built)
- **`ElectiveBlock`** — `tenantId`, `name` (e.g. "Humanities Pair"), `scope` (which classes/levels this block applies to), `slotsPerWeek` (how many real timetable slots this block occupies, e.g. 2 for the Hist/CRE + Hist/Geo example above).
- **`ElectiveBlockSlot`** — one row per real slot the block occupies (e.g. "Slot A", "Slot B"), each listing which real Subject(s) run in parallel during that specific slot (History+CRE in Slot A; History+Geography in Slot B) — this is what lets History legitimately appear in only one of the block's slots rather than every slot.
- **`ElectiveBlockSubjectTeacher`** — per (block, subject), the real assigned teacher (and optionally venue) — reuses the exact same teacher-assignment machinery as `ClassSubjectNeed` today, just scoped to a block-subject pair instead of a class-subject pair.
- A student's real elective choice remains exactly `StudentSubjectSelection` (already real, already exists) — the block engine reads it to know, per real student, which of the block's subjects they attend in which of the block's slots, and infers genuine FREE periods for any block-slot where none of the student's own chosen subjects appear.

### How the solver would place an Options Block (design, not yet built)
1. The solver treats an `ElectiveBlock`'s slots as a genuine SINGLE placement unit — all subjects across ALL of a block's slots must occupy real periods that are consistent with each other (e.g. if "History" appears in Slot B, and the same History teacher/room needs 2 real periods across the week for their 2 History groups per the worked example, those 2 periods must not clash with anything else that same teacher or room is doing).
2. Real, non-fabricated per-class free periods are computed AFTER placement, per real student (or realistically, per real "choice combination" group of students, since students sharing the exact same elective picks share the exact same free/attend pattern) — never assumed at the class level, since two students in the "same" home class can have genuinely different free periods depending on their own personal choices.
3. **A real Bundi-style optimization heuristic** (deterministic, not AI — matching NEYO's zero-AI-dependency Timetable Generator design principle) would try to place an Options Block during a period that is ALREADY a natural movement-friendly time — see Part 8.

### How the CBE Senior School's 3-elective system maps onto this same design
The 2026 KICD structure (researched fresh for this document): every Senior School learner takes exactly 3 real pathway electives (from `STEM` / `Social Sciences` / `Arts & Sports Science`), each worth 5 real lessons/week, alongside 4 compulsory subjects (English 5, Kiswahili 5, Core/Essential Mathematics 5, Community Service Learning 3) plus PE 3, ICT Skills 2, PPI 1, Personal/Group Study 1 = 40 total. KICD explicitly allows a learner to pick electives ACROSS pathways (e.g. mostly STEM plus one Social Sciences elective) — this is architecturally identical to the founder's own "Physics vs 2 Humanities" scenario: a genuinely large, school-defined Options Block (potentially 8-15+ real subjects wide across STEM/Social Sciences/Arts, not just a simple 2-subject pair) where each real student attends exactly the 3 slots matching their own 3 choices and is free during every other block-slot that doesn't include one of their choices. **The SAME `ElectiveBlock` design above cleanly generalizes from the founder's own 2-subject high-school pair up to the CBE's full 3-elective, many-subject Senior School system — this is a genuinely important design validation, not two separate features.**

### How Technical & Applied (single-choice-of-5) maps onto this same design
The founder's own "choose ONE of Business/Computer/Art/Agriculture/French" scenario is the SAME `ElectiveBlock` shape again, just with `slotsPerWeek` potentially = however many real lessons/week that single chosen subject needs (e.g. if Business Studies needs 4 lessons/week, the block occupies 4 real slots, and in EVERY one of those 4 slots, all 5 subjects run in parallel — unlike the Humanities Pair example where different subjects appeared in different slots). The data model already supports this distinction (`ElectiveBlockSlot` lets each slot independently list which subjects run then) — this case is actually the SIMPLER special case where every slot lists the exact same subject set.

---

## Part 8 — Placing electives/movement-heavy slots sensibly (after break/lunch, but never at the cost of unplaced lessons)

### The real-world problem
Movement-heavy lessons (electives, labs) are more pleasant scheduled right after a break/short-break/lunch, since students are already up and moving anyway rather than interrupting a settled lesson block. But this should be a soft PREFERENCE, never a hard rule that could cause classes to go unplaced if the school has limited slots.

### What already exists in NEYO today
The solver already has a real, proven pattern for exactly this shape of rule — SOFT preference scoring that never blocks placement, only prefers one option over another when multiple are available. `preferMorningAcademicDensity` (Senior School preset) and the free-period distribution logic (`freeTarget`/`freeDayCount`/`freePeriodUsage`, Z.3) are both real, already-built examples of "try to put this here, but if there's genuinely no room, place it wherever's actually free rather than fail."

### What's genuinely new work
- A new **soft scoring bonus** in the solver's candidate-period-scoring step (the same real mechanism `candidatePlacements` in `timetable-engine.service.ts` already uses for other preferences) that gives a small preference bump to periods immediately following a real break/short-break/lunch, specifically for cards belonging to an `ElectiveBlock` (Part 7) or any `ClassSubjectNeed` explicitly flagged as "requires movement." This is a genuinely small, well-scoped addition once the scoring infrastructure it plugs into already exists (it does).
- A new boolean flag, e.g. `ClassSubjectNeed.requiresMovement` or an `ElectiveBlock`-level flag, so a school can mark which subjects/blocks this preference should apply to (not every subject needs it — Mathematics doesn't need to be near a break, but a Chemistry Lab session or an Options Block does).

---

## Part 9 — Handling "undecided" lesson counts honestly (never silently fabricating placement)

### The real-world problem
If a school specifies e.g. Mathematics 5, English 5, but leaves some lessons genuinely undecided/unassigned, the system should clearly tell the school "these will become free study periods" rather than either failing silently or inventing content.

### What already exists in NEYO today
This is **already real and working** — `FREE` is a real `Subject` row (auto-created, code `"FREE"`, name "Free Study Period") and `freePeriodsPerWeek` (a real `TimetableConfig` field) already tells the solver exactly how many of a class's weekly slots should deliberately be left as genuine Free Study Periods rather than silently under-filled. The Z.3 free-period distribution fix (this session's earlier work) already spreads these fairly across the week instead of clumping them at the end, and this behavior is honestly reported, never hidden.

**What's genuinely new work**: the founder specifically asks for a clear MESSAGE/confirmation shown to a school BEFORE generation — "you've only specified 35 of a possible 40 lesson-slots this week; the remaining 5 will become Free Study Periods, confirm?" — this is a real, small, valuable UI/UX addition (a pre-generation summary/confirmation step) rather than a new engine capability, since the underlying free-period math already exists and already works correctly.

---

## Part 10 — Co-curricular / PPI blocked slots (the generator must never place a lesson there)

### The real-world problem
A school may set aside a fixed slot (e.g. Friday afternoon PPI/Games) for the whole school or specific classes, and the generator must treat that slot as completely off-limits for regular academic lessons.

### What already exists in NEYO today
Partially — `TimetableConfig.coCurricularCount`/`coCurricularName` exist as real fields, and the KICD Senior School template already creates a real PPI `ClassSubjectNeed` row (1 lesson/week) that the solver places like any other subject. What's less clear is whether there's currently a hard, always-respected "this exact period is co-curricular/PPI for this class/whole-school, never place an academic lesson here" BLOCK, as opposed to PPI just being treated as one more subject the solver schedules wherever convenient.

**What's genuinely new work**: a real `BlockedTimetableSlot` concept (`tenantId`, `dayOfWeek`, `period`, `scope`: whole-school / specific level / specific class) that the solver checks as a hard exclusion BEFORE attempting to place any academic `Card` there — distinct from (and stackable with) the existing PPI-as-a-subject approach, for schools that want a genuinely fixed, non-negotiable co-curricular slot rather than a floating one.

---

## Part 11 — School-defined lunch shifts affecting only the classes/times genuinely overlapping

### The real-world problem
A school decides its own lunch shift structure (which groups eat when), and this should only "apply" — i.e. only actually block/replace a lesson period — for the specific classes and specific real clock-time that genuinely overlaps a lesson period, avoiding confusion for classes whose lunch doesn't clash with anyone's lesson time.

### What already exists in NEYO today
This is **already real, fully built, and proven at scale** — the Z.4 dual-shift lunch work this session is EXACTLY this scenario, at real 40-class scale: Form 1&2's lunch (period 7) genuinely overlaps Form 3&4's normal lesson time, and vice-versa for period 8, with both groups still getting their full real 10 teaching periods. `lunchShift` (now supporting 4 real shift positions) is a real, per-class-config field, so different classes/levels can have their OWN lunch shift timing without affecting each other, and the print/live renderers correctly do real wall-clock math (not double-counting lunch as extra time) so the printed timetable genuinely reflects real clock times per class.

**Conclusion: no new work needed — already real, working, and stress-tested at 40-class scale this session.**

---

## Part 12 — Constraints that should just be "on" by default, without a school configuring them

### The real-world problem
Some constraints are so universally sensible (never bunch too many streams of a subject on the same day, never double-book a teacher across combined classes) that a school shouldn't need to manually discover and enable them — NEYO should just know.

### What already exists in NEYO today (and the real nuance the founder should know)
`STREAM_DISTRIBUTION` and `CLASS_STREAM_CONFLICT` are currently OPT-IN (`TimetableConstraint` rows a school must explicitly create) — and this was actually the deliberate, correct design choice, not an oversight, for a specific real reason surfaced during THIS session's own Z.4 work: `STREAM_DISTRIBUTION`'s own configured number (`maxSameDayPerLevel`) must genuinely match a school's real stream count, or the constraint becomes mathematically IMPOSSIBLE to satisfy and starts blocking legitimate placements (a real, live-discovered bug pattern, documented in Z.3's "Not Solved" section). If this were switched to always-on with a hardcoded default number, a school with, say, 10 real streams per level (like the Kilimo Day stress-test school) could see lessons wrongly fail to place if the hardcoded default didn't match their real stream count.

**Proposed real fix that satisfies BOTH the founder's "should just work" wish AND the discovered mathematical-mismatch risk**: make `STREAM_DISTRIBUTION` and `CLASS_STREAM_CONFLICT` genuinely **on by default, but auto-computed from the school's own real data** rather than a school manually configuring a number:
- `STREAM_DISTRIBUTION`'s `maxSameDayPerLevel` auto-set to the REAL number of streams that level actually has (computed live from `SchoolClass` rows), not asked of the school and not a fixed default — this exact fix was already identified as the correct value during Z.2's own load test ("this session's own load test simply used the correct real value (`STREAMS.length`) once the issue was diagnosed") — turning that manual insight into an automatic default closes a real, already-identified gap.
- `CLASS_STREAM_CONFLICT`'s `teacherIds` auto-computed live from which real teachers are ACTUALLY shared across 2+ streams of the same level right now (rather than a school manually listing teacher IDs) — if no teacher is shared, the constraint has nothing to do and stays a harmless no-op (matching the exact performance-fix logic from Z.4: an empty/no-op constraint must cost nothing).
- `LESSON_DISTRIBUTION` is arguably ALREADY effectively on-by-default in spirit (the Z.2 day-spread fix and Z.3 free-period distribution work already bias the solver toward healthy spreading even without an explicit constraint row) — worth explicitly confirming/documenting rather than assuming, in a future build session.

This is real, genuinely valuable follow-up work — auto-computing sensible defaults from a school's own real data is a strictly better design than either "always off, school must discover it" (today) or "always on with one hardcoded number for every school" (would reintroduce the exact bug Z.3/Z.4 found and fixed).

---

## Part 13 — Lab/venue session length, reshuffle for classes that missed a session, and lab priority/blocking

### The real-world problem
Not every class needs a lab session every time a subject with a lab component is scheduled — a school might want e.g. a double lab session every 2 weeks rather than every lesson, and if the school has more classes than lab capacity allows in one cycle, the classes that missed out last time should be prioritized next time ("lab reshuffle"). A school may also want to block certain classes from labs entirely, or give lab priority to a specific group (e.g. exam candidates).

### What already exists in NEYO today
The real Venue/Lab system (Z.3) already has: a per-class-subject optional required venue (`ClassSubjectNeed.venueId`), real singles/doubles session-length awareness (the solver already respects whether a class-subject's lessons are configured as doubles or singles, and applies that to the venue booking exactly like a teacher's own schedule), and real capacity/conflict-checking (two classes can never double-book the same real venue at the same real period, `Venue.capacityPerPeriod` configurable for genuinely larger multi-bay facilities).

**What's genuinely new work (all 3 founder-named capabilities are currently missing)**:
- **Lab reshuffle / rotation memory**: a real, small new tracking concept — something like `VenueSessionHistory` (which class last got a real lab session for which subject, and when) — so that when venue capacity is tight and not every class can get a session in a given generation cycle, the solver can genuinely prioritize classes that were skipped last time, rather than always favoring the same classes cycle after cycle. This is a real, well-scoped addition to the existing venue-booking logic.
- **Per-class lab blocking**: a real new field, e.g. `ClassVenueBlock` or a simple `blockedClassIds` list on `Venue` (or on the class-subject need), letting a school explicitly say "this specific class never gets a lab session for this subject, always theory-only" — a real, small, additive rule.
- **Lab priority tiers**: a real, small priority field (e.g. `labPriority: NORMAL | HIGH`, settable per class, e.g. for exam-candidate classes) that the solver's existing candidate-scoring step (Part 8's same mechanism) would weight when lab capacity is genuinely scarce — again a soft preference, never a hard guarantee that could cause unplaced lessons.

---

## Part 14 — PE without a dedicated teacher (any/all teachers can cover it), and periodic PE-teacher reshuffling

### The real-world problem
Some schools have no dedicated PE specialist — any teacher (or a school-chosen subset) can be assigned to cover a PE lesson, and some schools deliberately rotate WHICH teacher covers PE periodically (e.g. every term) rather than keeping one fixed assignment. Other schools DO have a dedicated PE teacher and should keep that simpler, fixed model.

### What already exists in NEYO today
The underlying mechanism (`TeacherSubject` — link ANY teacher to the PE subject, not just specialists) already technically supports "any of these teachers can cover PE" — a school could already link 10 general teachers to the PE subject today and let `autoAssignTeachersToClasses()` fairly distribute PE coverage across them by workload, exactly like any other subject. This is a genuine case of existing generic machinery already covering a scenario the founder specifically asked about, without new engineering.

**What's genuinely new work**:
- **A real, explicit "rotate this subject's teacher periodically" setting** — today, once `autoAssignTeachersToClasses()` picks a teacher for a `ClassSubjectNeed`, that assignment is STICKY (it stays that way until manually changed or the teacher becomes unavailable) — there's no concept of "deliberately re-roll this specific subject's teacher assignment every term even though nothing forced a change." This would be a real, small, genuinely new feature: a per-subject (or per-class-subject) `rotateTeacherEachTerm: boolean` flag, and a real "start of term" action a Principal can trigger that re-runs the fair-assignment logic specifically for flagged subjects, deliberately ignoring the existing sticky assignment for just those rows.

---

## Part 15 — Exam timetable interaction with electives (combine where possible, don't force where genuinely impossible)

### The real-world problem, in the founder's own words
Technical & Applied subjects (single-choice-of-5 style) CAN combine cleanly at exam time (since only one subject per student, the exam slot naturally maps to "everyone choosing subject X sits together, at the same time as everyone choosing subject Y"), but Humanities-style electives (History/CRE/Geography, where a student's OWN combination of 2 choices varies) are genuinely harder to combine cleanly for exams, and the system should recognize that difference rather than forcing a bad fit.

### What already exists in NEYO today (post-Z.6, this session)
Z.6 (built earlier this session) already gives the exam generator real STREAM_GROUP + COMBINATION-aware auto-targeting — a real `CombinationGroup` (an explicit teaching group) already takes correct priority, and same-level streams sharing a real subject need auto-group correctly. This is the right foundation.

**What's genuinely new work**: once the `ElectiveBlock` concept (Part 7) exists for the TIMETABLE side, the exam generator would need its own equivalent real logic: for a "Technical & Applied" single-choice block, generate one real combined exam sitting per subject in the block (clean, since exactly one applies per student). For a genuinely mixed-choice Humanities-style block (the founder's own honest "its hard to combine cause of different choices of students" observation), the exam generator should NOT try to force a single combined sitting — instead, generate the real, correct INDEPENDENT exam slots per subject (History exam, CRE exam, Geography exam, each at its own time, each only including the real students who actually chose that subject) and let the natural per-student non-overlap (a student never has to sit 2 exams for subjects they're not both taking) resolve itself, exactly matching what the founder already correctly intuited. This is best framed as **the exam generator "knowing" not to try to combine an Options Block's subjects into one slot when the block's own real slot-design (Part 7) shows subjects vary per-slot rather than being simple single-choice alternatives** — a real, moderately-sized but well-scoped addition once Part 7 exists.

---

## Summary: what's already real & built vs. genuinely new work

### Already real, working, and directly answers the founder's scenario (no new work needed)
- Multi-subject teachers + fair workload-balanced allocation + zero-double-booking across all their subjects/classes (Part 3).
- Split subjects as independent `Subject` rows, same-or-different teacher, zero extra engine work (Part 4).
- Multiple curricula (8-4-4 + CBE) coexisting cleanly in one tenant with fully separate subject/teacher/timetable structures (Part 5).
- `CombinationGroup` + `SUBJECT_CHOICE` derivation — the real foundation for elective-group scheduling and shared-teacher combined classes (Part 6, foundation).
- Real dual/multi-shift lunch, only affecting genuinely overlapping classes/times, proven at 40-class scale (Part 11).
- Honest, non-fabricated Free Study Period handling for undecided lesson counts (Part 9, engine side).
- Real Venue/Lab singles/doubles session-length + capacity/conflict-checking foundation (Part 13, foundation).
- Real academic-year promotion/graduation + Continuity Engine + fair auto-assignment for new classes (Part 2, foundation).

### Genuinely new work, clearly scoped, ready to build as a new Part (proposed **Part AA**)
1. **Teacher Allocation Import** — CSV/paste/Bundi-photo import of existing teacher-subject-class allocations, reusing the proven Staff Import + Bundi Intelligent patterns, as a 4th Bundi domain.
2. **New Academic Year — Teacher Allocation Review wizard** — a guided UI tying together the already-real Continuity Engine + auto-assignment specifically for the post-promotion moment, plus fixing the real orphaned-`ClassSubjectNeed`/class-archival gap found during this audit.
3. **`ElectiveBlock` / Options Block engine** — the single most significant new concept in this document: school-defined subject groups that must occupy identical timetable slot(s), correctly modeling both the founder's own "Physics vs 2 Humanities" scenario AND the CBE Senior School's 3-elective pathway system AND single-choice Technical & Applied blocks, as one unified design (Parts 6-7).
4. **Movement-aware soft placement preference** — prefer scheduling Options Blocks/lab sessions right after a break, as a soft scoring bonus, never a hard rule (Part 8).
5. **Pre-generation "undecided lessons" confirmation summary** — a small, valuable UI addition surfacing what the engine already correctly does silently today (Part 9).
6. **Hard `BlockedTimetableSlot` concept** for genuinely fixed co-curricular/PPI slots, distinct from PPI-as-a-subject (Part 10).
7. **Auto-computed, on-by-default `STREAM_DISTRIBUTION`/`CLASS_STREAM_CONFLICT`** — closing the exact real gap this session's own Z.3/Z.4 work identified but didn't fully close (Part 12).
8. **Lab reshuffle/rotation memory, per-class lab blocking, lab priority tiers** (Part 13).
9. **Per-subject "rotate teacher each term" flag + a real re-roll action**, for schools without a dedicated PE (or any other) specialist (Part 14).
10. **Exam-generator Options-Block-awareness** — combine cleanly where the block structure allows (single-choice), correctly stay independent where it doesn't (multi-choice humanities-style) — built on top of #3 (Part 15).

None of the above 10 items is required to make NEYO's CURRENT real school data work — every currently-onboarded tenant (Karibu High, Uwezo Primary & Junior, Kilimo Day Secondary) continues to generate correct, real timetables today. This document exists so that when the founder is ready to build the next real chunk of work, there is a single, grounded, already-audited reference — matching NEYO's own standing "no code without a real audit first" discipline — rather than starting from a blank page.
