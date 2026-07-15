# DD — Founder's New Backlog (2026-07-14), Draft for Confirmation

Founder's real message, broken into discrete, numbered items so nothing gets lost or misbuilt. Each item below needs to be confirmed/clarified before building (see questions at the bottom).

## Student Import (`/students/import`)

**DD.1 — Compulsory subjects as buttons, not typed text.**
Currently a school types compulsory subject names/codes into a free-text field before importing. Replace with clickable subject buttons — showing the real CBE subject list when importing into a CBE class, and the real 8-4-4 subject list when importing into an 8-4-4 class. A school clicks to select, never types (avoids typos/misspellings). "After one confirms the others get removed after import is done too" — needs clarification: does this mean (a) the selection resets after the import completes (so the next import starts fresh), or (b) once a subject is clicked/selected as compulsory it's removed from the remaining clickable list (so it can't be double-added)?

**DD.2 — Custom field bug: a school can't actually add their own custom field.**
Confirmed live via direct testing: selecting "Custom field" on a column and typing a label triggers a real `422 "Please check the form."` error and the import preview breaks. This is a real, reproduced bug — needs a real fix.

**DD.3 — Import should read ALL subjects in a student's row and avoid duplicating compulsory subjects.**
If a school's own file already lists a compulsory subject (e.g. English) inside that row's own Subjects column, and English is also declared compulsory for the whole run, NEYO should not create two separate subject-selection entries for it — it should recognize the overlap and keep exactly one.

## Combination Engine

**DD.4 — Auto-group students into elective combinations from up to 3 electives declared in the import.**
When a student's row lists their elective choices (up to 3), the system should group students into real combinations from those choices (not just from a manual portal). If a Mathematics variant (e.g. Core vs Essential) is explicitly mentioned in the row, use it. If not mentioned, the system should check the student's own declared pathway (STEM vs the other CBE pathways) and auto-assign the correct required Maths variant for that pathway. Compulsory subjects (done by everyone) are excluded from this combination logic entirely.

**DD.5 — Combination print should be A4 and printable.**
The existing subject-combination roster print (from BB.7) should render cleanly on A4 for physical printing.

## Confirm → Auto-Allocate Flow

**DD.6 — Once students confirm their combination is correct, the system may proceed to allocate classes AND assign teachers automatically.**
After a human confirms a student's combination is correct, NEYO should be allowed to (a) allocate the student to a class (this already exists via BB.4's "Allocate Class" flow) and (b) auto-assign teachers to the resulting subject/class combinations, respecting a real minimum-number-of-lessons-per-teacher fairness rule (similar to the existing fair-allocation logic already used elsewhere, e.g. AA.9's `autoAssignTeachersToClasses()`).

**DD.7 — After that analysis, combinations should appear automatically in the "Combination" tab, and electives automatically in the "Electives" tab — no manual re-entry.**
Needs clarification on which exact screens "Combination tab" and "Electives tab" refer to (likely inside Academics / Smart Timetable, but needs confirming).

## Smart Timetable / Lesson Requirements Configuration

**DD.8 — Lesson-requirement counts (compulsory, elective, or other) should show inside the "doubles and singles" configuration tab, so a school can set them there.**

**DD.9 — Class-subject/lesson-requirement configuration should show per GRADE as a whole, not per individual stream.**
E.g. "Grade 10 Lesson Requirements" as one combined config screen, not "Grade 10 East", "Grade 10 West" etc. rendered and configured separately — since all streams of a grade normally study the same amount. A school should still be able to open a SPECIFIC stream to configure it differently, but the default/normal view should be the whole grade combined into one input.

**DD.10 — Same grouping logic should apply to time-slot/period configuration.**
If the whole school uses one method, render/configure it once for the whole school. If a specific group of grades shares the same config (e.g. Grade 1–3), render/configure that group once rather than repeating the same setup for every individual class/stream.

## Prints

**DD.11 — A new print showing teacher allocation and the subjects each teacher covers.**

## Cross-Cutting Bugs

**DD.12 — Generic "Please check the form." error appears on several pages when saving, hiding the real problem.**
Root cause confirmed: `src/lib/api/respond.ts`'s `handleError()` catches every `ZodError` and always returns the same generic message ("Please check the form.") — the real per-field reasons ARE included in the response's `error.fields` object, but many pages' UI never reads or displays them, just shows the generic toast. Needs a real, systematic fix so the ACTUAL field-level problem is shown to the school, not just a generic message.

**DD.13 — Double-period lessons should render as one merged cell.**
If a lesson is scheduled as a genuine double (two consecutive periods, e.g. Period 1 and Period 2, same subject/class/teacher), the timetable display should merge them into a single visual cell instead of showing two identical adjacent cells.

**DD.14 — Teacher allocation should always be driven by each teacher's own real `TeacherSubject` links.**
This principle was already built for AA.9's scope fix and class-teacher assignment, but the founder is flagging it again — needs investigation into whether there's a remaining screen/flow where teacher-allocation dropdowns are NOT filtered by a teacher's own real declared subjects.

---

## Open Questions Before Building (see `ask_user`) — RESOLVED 2026-07-14
1. DD.1 — confirmed: BOTH behaviors. A subject button disappears from the remaining pick-list the moment it's selected as compulsory (can't be double-added), AND the whole selection resets once an import run completes (next import starts fresh).
2. DD.7 — confirmed: "the Combination tab" and "the Electives tab" are screens inside **Smart Timetable** (not the existing Academics-section Combination Groups/Elective Block manual-build screens — those may need to gain a "generated automatically, no manual input needed" real read-only/auto-populated state instead, to be confirmed further when DD.4-DD.7 are actually built).
3. Order of work confirmed: fix the 2 already-reproduced concrete bugs first (DD.2 custom-field-in-import, DD.12 generic "Please check the form" error), then Import improvements (DD.1, DD.3), then Combination engine (DD.4-DD.7), then Smart Timetable UI regrouping (DD.8-DD.10), then prints (DD.5, DD.11), then double-period rendering (DD.13) and the TeacherSubject audit (DD.14).

**Status**: DD.2 and DD.12 (the confirmed bugs) are FIXED, tested, committed (`ea6d8b4`), and pushed. DD.1 (compulsory-subject buttons) is FIXED, tested, committed (`3d4ddf8`), and pushed. DD.3 (avoid duplicating a subject already listed compulsorily) was investigated and found to ALREADY work correctly — confirmed via a real live test, no code change needed. DD.4 part 1 (pathway-aware Core/Essential Mathematics auto-selection during import, with the real official STEM-always-Core exception rule confirmed via research) is FIXED, tested, committed (`89ff151`), and pushed. DD.5 (confirmed the pre-existing combination roster is already A4-printable, no code change needed) and DD.11 (new per-subject roster print with each student's real class) are FIXED, tested, committed (`596ef1c`), and pushed. Next: DD.6-DD.7 (auto-allocate class+teacher after confirmation; combinations/electives auto-appearing in Smart Timetable tabs).
