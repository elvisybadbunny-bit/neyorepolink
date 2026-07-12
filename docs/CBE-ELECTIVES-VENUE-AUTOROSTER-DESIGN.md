# CBE Senior School Electives, Venue Allocation & Subject-Choice Auto-Rostering — Design Document

**Written: 2026-07-12.** This is a design/scoping document, not a build log. It answers the founder's own detailed real-world brief (verbatim, this session — see "Founder's brief" below) about how NEYO should behave once a CBE Senior School's real elective/venue/roster complexity is fully engaged: what already exists and works today, what's genuinely missing, and a proposed build order (new **Part BB**) for the missing pieces. Written after re-reading the real existing codebase for every single scenario, per standing discipline — nothing below is guessed.

---

## Founder's brief (paraphrased, this session)

A separate AI's explanation of real Kenyan CBE Senior School block-scheduling practice (concurrent Math-split blocks, floating-student elective blocks, subject matrixing, TSC ~20-25 lesson/week workload norms) was shared, followed by the founder's own specific extension requests:
1. Auto-place VENUES for elective subjects: default to each stream's own home classroom, but when an elective has more subjects than the school has streams (e.g. 5 subjects, 4 streams), automatically pull an extra venue from the school's real venue pool (library, labs, etc.) — avoiding venue/teacher/class clashes and any other real timetable rule.
2. Subjects should be added to a block AUTOMATICALLY from real student subject-choice data — the system should compute and show the combined roster of students doing each subject, how many teachers are needed, and their venues, "so that the school can have a smooth run."
3. Check the real CBE Senior School subject allocation research; if a school's own timetable format differs, the system should still know how to place "the other remaining slots."
4. A hardcoded Period 8 lunch is mentioned as one real school's pattern.
5. A school should be able to set a maximum class size; when combining classes into one exceeds it, either a new teacher/section is added, or the school can explicitly choose "allow all in one class anyway" even over capacity.
6. Real CSV import of newly-joined Grade 10 students with their chosen subjects, followed by a one-click "Allocate Class" action that places them into classes by subject combination automatically, asking the school only about things that might genuinely affect placement.
7. Auto-computed venue/teacher progressive short-codes across streams (e.g. a 5-stream level gets teacher codes like AS/HR/VE/FR/JU, one code per stream, in order) — subjects within a block combine into one shared lesson slot but rendered by abbreviation so it's clear.
8. A printable timetable per stream showing subject placements, venues, and teachers, so students/staff know exactly where to go.
9. Venues used for electives (outside normal classrooms) should never clash with any other real timetable rule.
10. Multi-subject import/update support for a single teacher in one import action (not one row per subject).

---

## Part 1 — What already exists and directly answers part of this brief (real, working, no new work needed)

### 1a. Real elective-block scheduling foundation — `ElectiveBlock` (AA.1, built earlier this session)
`src/lib/services/elective-block.service.ts` + the solver integration in `timetable-engine.service.ts` already implement the exact "concurrent block" scheduling pattern the founder's brief describes generically: a school defines a block (e.g. "Humanities Options"), with one or more real slots, each slot listing 2+ parallel real subjects (each with its own real teacher + optional real venue). The solver places every slot at ONE real shared day/period across all member classes, reserving each subject's own teacher/venue at that exact time — this already IS the "Concurrent Block System" and "Math Split" pattern described, generically, for ANY set of parallel subjects, not just Math.

**What already works, confirmed by re-reading the real code**:
- A single slot can already host 5 parallel subjects if 5 real Subject rows + 5 real teachers are configured — the block engine doesn't hardcode "2 subjects," `slotSchema` only requires a **minimum** of 2 (`docs/TEACHER-ALLOCATION-AND-ELECTIVES-ENGINE-DESIGN.md` Part 7 refactor).
- Each parallel subject already carries its OWN real `venueId` — a school can already manually assign the 5th subject to "Library" while the other 4 use their home streams' classrooms.
- The solver's venue-conflict grid (`venueGrid`, `venueAvailableAt`, `pickVenueFor` in `timetable-engine.service.ts`) already prevents ANY two real bookings (elective-block or ordinary lesson) from double-booking the same physical venue at the same time — this is tenant-wide, not block-specific, so a library used for an elective automatically also can't be double-booked by, say, a Computer Studies double lesson that same period. **Venue clash-avoidance already exists and is real.**
- Movement-preference soft scoring (place a block right after a break) already exists (`preferAfterBreak`), reused from AA.1/AA.4's partial seed.
- The live/print renderer already resolves and shows every parallel subject + teacher short-code for a shared Options cell (`getTimetable()` → `slot.electiveBlock`, confirmed live via screenshot last session showing "Options BLOCK — HIS/CRE — NW/AT").

**What's genuinely missing (see Part 2 below)**: nothing about VENUE PICKING is automatic — a school must manually choose each subject's venue in the block-builder UI today. There is no "auto-pick a spare venue when subjects > streams" logic.

### 1b. Real student subject-choice data — `SubjectSelectionPortal` / `StudentSubjectSelection` (L.4, pre-existing, not new this session)
`src/lib/services/subject-selection.service.ts` + `prisma/schema.prisma` models `SubjectSelectionPortal`/`StudentSubjectSelection` are a REAL, ALREADY WORKING system: a school opens a real selection portal for a level (with real `rulesJson` — min/max electives, compulsory subjects), each student submits their real chosen `selectedSubjectIds`, and this data is genuinely queried and used TODAY by two other real features:
- `CombinationGroup.source = "SUBJECT_CHOICE"` (L.7) — a combined-class lesson's member list can already be derived from which students picked a given subject, not just a manually-typed class list (`timetable-engine.service.ts` lines ~433-439).
- `l7-auto-grouping.service.ts`'s `runAutoGroupingPreview()`/`commitAutoGrouping()` — this is a REAL, ALREADY WORKING engine that does almost exactly what the founder describes in brief item #6: it groups every student by their EXACT real subject-choice combination (`selected.join("|")` as the grouping key), distributes them fairly and evenly across a level's real classes (round-robin balancing group sizes), reassigns any real subject/class-teacher whose current holder is inactive, PATCHES already-live `TimetableSlot` rows immediately for the moved students' classes, and triggers a real background timetable regeneration — all in one `commitAutoGrouping()` call.

**Conclusion: the founder's brief items #2 (combined roster from student choices) and #6 (auto-allocate Grade 10 into classes by subject combination) are, at the CLASS-ALLOCATION level, ALREADY REAL AND WORKING TODAY**, built under L.7 in an earlier session, and simply never yet connected to `ElectiveBlock` (AA.1). This is the single most important finding of this audit — the founder is describing a real feature that already exists, just not wired to the newer AA.1 engine.

**What's genuinely missing**: `ElectiveBlock`'s own slot/subject list is still 100% manually built by a school today — there is no button that says "build this block's subjects + rosters FROM the real, confirmed `StudentSubjectSelection` data for this level," even though the raw data and the grouping algorithm both already exist. This is real, valuable, but comparatively small integration work (see Part 2).

### 1c. Real school-configurable timetable structure — `TimetableConfig` (P.5 KICD template, pre-existing)
`TimetableConfig` (one real row per class) already models exactly what the founder describes needing to "know from what they input" — `periodsPerDay`, `lessonDurationMins`, `shortBreakStart`/`shortBreak2Start`/`longBreakStart` (+ minutes), `lunchStart` (which period lunch falls after — a school choosing "lunch after period 7" for an 8-period day is exactly the founder's "lunch hardcoded in period 8" example, just school-configurable rather than hardcoded), `hasSaturday`/`saturdayPeriodsCount`. The solver (`daysForClass`/`maxPeriodsForClass` in `timetable-engine.service.ts`) already reads this PER-CLASS, never a single global constant — a school with 7 periods/day and lunch after period 5 is already handled exactly the same way as one with 8 periods/day and lunch after period 6, with zero code branching needed.

The P.5 `KICD_SENIOR_SCHOOL_TIMETABLE_TEMPLATE` (`src/lib/validations/pathways.ts`) is a real, OPTIONAL one-click preset that fills `TimetableConfig` + `ClassSubjectNeed` with the official 40-lesson/week KICD numbers — but a school is never forced to use it; `periodsPerDay`/lesson counts stay fully custom per school. **This already directly answers "the CBE recommends 40, but the system should know from what the school inputs"**: NEYO already treats 40 lessons/week as one convenient starting preset, not an assumption baked into the engine.

**Conclusion: no new work needed here** — the founder's concern about the engine "knowing" a school's real configured structure (rather than assuming CBE's 40) is already fully real and working.

### 1d. Real teacher short-codes — `User.timetableShortCode` (pre-existing, Z.3-era)
`resolveTeacherShortCode()` (`venue.service.ts`) already auto-generates and persists a real, deduplicated 2-letter short code per teacher (from their initials), used identically in every printed/live timetable cell (including AA.1's Options Block cells). **This partially answers brief item #7** (a real, consistent short-code system already exists) but does NOT implement the specific "progressive per-stream pattern" (AS for stream 1, HR for stream 2, etc.) the founder describes — that's a different, more structured idea (see Part 2).

### 1e. Real multi-curriculum + pathway/allocation foundation (P.1/P.2/J.10, pre-existing)
CBE Senior School pathway groups (`Pathway`, `PathwaySubjectRequirement`, `StudentPathwayPreference`), official KICD taxonomy tagging, and Core/Essential Mathematics variants are all real and already correctly modeled — this is the real "which subjects exist and which pathway they belong to" foundation the founder's brief assumes.

---

## Part 2 — What's genuinely missing (proposed new **Part BB**)

Re-reading the real code confirms these are genuinely new, clearly-scoped gaps — not yet built, not silently broken, just not built yet:

### BB.1 — Auto venue-pool overflow for Elective/Options Blocks
**The real gap**: today, every parallel subject in an `ElectiveBlockSlot` needs its venue picked manually (a dropdown in the block-builder UI). When a block has MORE subjects than the school has home-stream classrooms available at that moment (the founder's "5 subjects, 4 streams" example), a school must manually notice this and manually assign the 5th subject a spare venue — nothing suggests or auto-fills this today.
**Proposed fix**: when a school leaves a slot-subject's venue UNSET, the solver should auto-pick from the tenant's real Venue pool (respecting `supportsSubjectIds`/`capacityPerPeriod`, exactly like `venueCandidatesFor()` already does for ordinary `ClassSubjectNeed` rows) INSTEAD of assuming "no venue needed" — reusing the exact same `venueGrid` conflict-avoidance machinery that already exists, just extending which slot-subjects get a `venueCandidateIds` list built for them. A school can still pin one manually when they want a specific room.

### BB.2 — Elective Block auto-build FROM real student subject-choice data
**The real gap**: `ElectiveBlock`'s subjects/classes/rosters are 100% manually typed today; `l7-auto-grouping.service.ts`'s real subject-combination grouping engine and `StudentSubjectSelection`'s real confirmed choice data are never consulted when building a block.
**Proposed fix**: a new "Build from student choices" action on the Elective Block UI that reads a level's real confirmed `StudentSubjectSelection` rows, computes the real distinct subject set actually chosen (not a fixed assumed list), shows the school a real preview (which subjects, how many students each, how many teachers needed per subject given `TeacherWorkloadRule`, suggested venues), and lets the school confirm/edit before creating the real `ElectiveBlock`+slots+subjects — never silently auto-created without review, matching every other NEYO importer's preview-before-commit discipline. The founder's own follow-up clarified: **a school may still add electives manually if they prefer — this is an optional accelerator, never a forced flow** — and must respect real CBC/CBE subject-allocation rules (via the existing `PathwaySubjectRequirement`/pathway-group data) rather than a generic guess, and must derive available lesson-slot capacity from the school's own real `TimetableConfig` (periods/breaks/lunch) rather than assuming the KICD 40-lesson figure, letting the school decide how to handle any leftover/extra capacity.

### BB.3 — Real class-size cap + overflow decision (new teacher/section vs. explicit "allow all")
**The real gap**: `SchoolClass.capacity` exists as a real field today but is NEVER read/enforced anywhere in the codebase (confirmed by search) — `l7-auto-grouping.service.ts`'s round-robin balancing has no concept of a hard cap.
**Proposed fix**: when auto-grouping/building a block's rosters, if a subject-choice group's real size exceeds its target class's real `capacity`, surface an explicit real choice to the school: (a) split into an additional real class/section with a newly-needed teacher flagged, or (b) explicitly override and allow the whole group into one real class anyway (an honest, logged school decision, never silently forced).

### BB.4 — Grade 10 "Allocate Class" one-click flow (post CSV-import)
**The real gap**: no single guided action exists today connecting "a fresh CSV import of new Grade 10 students with their subjects" → "auto-place them into real classes by subject combination." `l7-auto-grouping.service.ts`'s real engine already does the CORE placement math for existing students — it has just never been offered as a first-onboarding-moment wizard for a brand-new intake with no existing class yet.
**Proposed fix**: a guided wizard step reusing the real, already-working `runAutoGroupingPreview()`/`commitAutoGrouping()` engine, scoped specifically to a freshly-imported cohort, asking the school only for genuinely placement-affecting inputs (target number of classes/sections, per-class capacity cap — feeding BB.3) rather than re-litigating settings the engine can already infer.

### BB.5 — Progressive per-stream teacher/venue short-code pattern
**The real gap**: today's `timetableShortCode` is name-initials-based and assigned once per teacher, tenant-wide — there's no concept of "this specific teacher's code, IN THE CONTEXT of this specific block, should reflect their stream position" (the founder's "AS/HR/VE/FR/JU, one per stream, in order" example).
**Proposed fix**: needs a real design decision from the founder before scoping further — is this instead-of or in-addition-to the existing initials-based code system? A likely resolution: keep the existing persistent per-teacher code (it's simpler, unambiguous, and already proven live), but consider a genuinely separate "stream order" display concept for print layouts specifically, if the founder still wants it after seeing the existing system in action — **not decided yet, flagged as an open design question, not silently assumed**.

### BB.6 — Multi-subject-per-row teacher allocation import
**The real gap**: `teacherAllocationImportRowSchema` (AA.2) models exactly ONE subject per import row today (`teacherName, subjectName, className, lessonsPerWeek, doubleCount`) — a teacher who teaches 3 subjects needs 3 real rows. This already works correctly (proven by AA.2's own regression test, which covers a teacher appearing on multiple rows), but the founder specifically asked for genuine multi-subject-in-one-row support (e.g. a single row listing "Math, Physics, Chemistry" for one teacher).
**Proposed fix**: extend the AA.2 import to accept a real delimited multi-subject cell (e.g. semicolon-separated) per row, expanding it into multiple real `ClassSubjectNeed`/`TeacherSubject` rows server-side — a genuinely small, additive change to the already-real AA.2 pipeline, not a new pipeline.

### BB.7 — Real per-stream printable roster showing subject/venue/teacher placement
**The real gap**: AA.1's live timetable renderer already shows a purple "Options Block" cell with the combined subject/teacher-code breakdown for each class's OWN printed timetable — but there's no separate, dedicated "where do I go for MY chosen subject" student-facing view distinguishing what a printed class timetable already implies. Needs a real design conversation on whether this is a genuinely separate deliverable or whether the existing per-class printed timetable (which already shows the Options Block cell with its full subject/teacher/venue breakdown) already suffices for this founder's exact ask — **flagged as an open question, not yet scoped as its own work item** since it may already be substantially answered by what AA.1 built.

---

## Summary: what's already real vs. genuinely new

### Already real, working, directly answers the brief (no new work needed)
- Concurrent multi-subject block scheduling with per-subject teacher+venue reservation and full venue-conflict-avoidance (AA.1, Part 1a).
- Real confirmed student subject-choice data + a real, working fair auto-grouping/class-allocation engine reading it (L.4 + L.7, Part 1b) — genuinely already answers most of brief items #2 and #6, just not yet wired into AA.1.
- Real, fully school-configurable timetable structure (periods/breaks/lunch/Saturday) already read per-class by the solver, with the KICD 40-lesson figure as one optional preset, never a hardcoded assumption (P.5, Part 1c).
- Real persistent per-teacher short-codes already used identically everywhere including Options Block cells (Part 1d).
- Real CBE pathway/subject-requirement/allocation foundation (P.1/P.2/J.10, Part 1e).

### Genuinely new work, clearly scoped, ready to build as a new **Part BB** (this document's own deliverable)
1. **BB.1 — Auto venue-pool overflow for Elective/Options Blocks.**
2. **BB.2 — Elective Block auto-build FROM real student subject-choice data** (optional accelerator, never forced; CBC/CBE-rule-aware; derives real slot capacity from the school's own `TimetableConfig`, never a hardcoded 40).
3. **BB.3 — Real class-size cap + overflow decision** (new section vs. explicit allow-all-over-capacity).
4. **BB.4 — Grade 10 "Allocate Class" one-click flow**, reusing the already-real L.7 auto-grouping engine.
5. **BB.5 — Progressive per-stream teacher/venue short-code pattern** — open design question, not yet resolved.
6. **BB.6 — Multi-subject-per-row teacher allocation import** — small, additive extension to the already-real AA.2 pipeline.
7. **BB.7 — Dedicated per-stream printable subject/venue/teacher roster** — open question on whether AA.1's existing printed-timetable cell already suffices.

None of the above is required to make NEYO's current real school data work — every currently-onboarded tenant continues to generate correct real timetables today. This document exists, per NEYO's own standing "no code without a real audit first" discipline, so the founder can pick a build order (starting with BB.1 and BB.2, the two items the founder explicitly prioritized) with the standing 8-CHUNK process once ready.
