# NEYO Founder Manual V2 — Module 09: Timetable & Smart Timetable

**Page:** `/academics` → Timetable / Smart Timetable  
**Last verified against code:** 2026-07-18  
**Purpose:** prepare, generate, review, publish and print a conflict-aware whole-school timetable.

---

## 1. Do not press Generate before these exist

Required:

1. School Profile education levels.
2. Current Academic Term.
3. Classes/streams with realistic capacity.
4. Subjects with unique codes.
5. Active teacher accounts.
6. Teacher ↔ Subject qualification links.
7. Per-class Subject Lesson Requirements.
8. Bell/schedule rules for every class/grade.
9. Breaks/lunch/Saturday policy.
10. Teacher time-off and hard blocked school/class slots.
11. Venues/labs where required.
12. Combination classes and elective blocks where used.
13. Confirmed student subject choices for choice-driven blocks.

If any are absent, NEYO should report gaps/unplaced periods rather than fabricate a schedule.

---

## 2. Difference between Timetable and Smart Timetable

### Timetable tab

View/edit weekly class grid, click individual cells, schedule rules, simple Auto-fill, Saturday
scheduler, and print class/teacher/venue views.

### Smart Timetable tab

Whole-school constraint engine: teacher qualifications/loads, class needs, doubles, venues,
combinations, electives, blocked slots, time off, constraints, background generation, draft/publish.

Use Smart Timetable for the full school. Use manual grid for deliberate small correction after
review.

---

## 3. Timetable tab — class selector and grid

Choose class. Grid shows days/periods, merged break/lunch rows, subject code, teacher/code, venue,
combination/elective details and substitute overlay where applicable.

Click a lesson cell (manager): modal chooses Subject, Teacher and optional Venue; **Save** calls
`setSlot()` and blocks teacher/class conflict. **Clear** removes existing slot. Cancel/close keeps it.

Manual edits can be overwritten by a later full generation depending engine strategy; record hard
requirements as constraints/blocked slots rather than relying on memory.

---

## 4. Timetable printing buttons

- Print current class
- Print all classes
- Print all teachers
- Print venues

Print output uses plain high-contrast layout, school branding, merged breaks/lunch and compatible
double lessons. Elective venue/teacher details use separate roster print to avoid overcrowding.

Verify selected class/mode, school/year header, teacher codes, venues, double merges and footer before
physical distribution.

---

## 5. Schedule Rules

Press **Schedule rules**.

Core fields persisted in `TimetableConfig` include:

- Periods per day (1–20; every grid/dropdown/generator/print follows the saved class/grade configuration)
- School day start
- Lesson duration minutes
- Short break after period/minutes
- Optional second short break
- Long break after period/minutes
- Lunch after period/minutes
- Free periods per week
- Co-curricular count/name
- Remedials on/off
- Preps on/off
- Saturday on/off and start/end

Save can target one class, every stream in a level, or selected/all levels through real bulk actions.
If stream configs disagree, review rather than silently applying one.

**Lunch after period** is flexible and replaces rigid shift assumptions. Period count semantics must
match current engine: verify preview table before generation.

---

## 6. Auto-fill Week

Simple class-level helper. Enter each subject weekly load/teacher; total must fit the available grid.
**Auto-fill** spreads one-per-day first then doubles while avoiding teacher busy slots. It is not the
full constraint engine and may report unplaced loads.

---

## 7. Bulk Saturday Scheduler

Select classes, periods and subject or Fair mode subjects. Configure Saturday times/rules.

- Standard mode schedules chosen subject.
- Fair mode rotates selected subjects.
- Select All chooses displayed classes.
- **Schedule** writes planned Saturday slots.

Check school genuinely runs Saturday, teacher availability, class scope and subject count. Cancel
closes.

---

## 8. Smart Timetable page structure

Top areas:

1. Draft Resume Protection
2. Publish/Draft controls
3. Start Master Button
4. Rotate flagged teachers
5. Counts/job progress
6. Pre-generation confirmation
7. Constraint settings
8. Teacher time-off
9. Blocked slots
10. Class subject lesson requirements
11. Combination classes
12. Venues & Labs
13. Teacher print codes
14. Teacher allocation import
15. Elective/Options Blocks

---

## 9. Draft Resume Protection

Smart setup saves unfinished time-off/combination configuration locally.

Indicators:

- Draft restored
- Unsaved setup protected
- Last saved locally

**Clear saved draft** removes local draft only, not saved server rules/timetable. Use when stale or
on shared device; do not press expecting to delete timetable.

---

## 10. Publish versus Draft

- **Publish to All:** changes timetable status to PUBLISHED and notifies active teachers through the
  real publish path. Family/teacher views consume published data according to service.
- **Save as Draft:** status DRAFT for internal review; does not mean browser-only save.

Generation and publication are separate. Generate → inspect warnings/unplaced/prints → publish.
Publishing an incomplete timetable does not solve unplaced lessons.

---

## 11. Start Master Button

Pressing first runs `getPreGenerationSummary()`.

If setup has genuine free gaps, modal shows:

- configured lessons;
- possible weekly lesson slots;
- honest Free Study periods;
- classes exceeding configured free-period cap.

Buttons:

- **Go back & add more lessons**
- confirm/start generation

If accepted, `startGeneration()` creates background job. Button shows Checking, Queued, Generating.
Do not start another while QUEUED/RUNNING.

---

## 12. Background job card

Shows:

- phase/status (QUEUED/RUNNING/DONE/FAILED)
- progress percent
- slots placed
- warning count
- first unplaced items
- error message

DONE with warnings still needs review. FAILED does not mean rerun repeatedly; inspect error/config.

---

## 13. Rotate Flagged Teachers

Button **Start of term: rotate flagged teachers** only re-rolls `ClassSubjectNeed` rows where school
explicitly selected Rotate this subject's teacher each term. Other assignments stay untouched.

Use after checking TeacherSubject eligibility/workloads. It is not a general random teacher shuffle.

---

## 14. Constraint Settings

Existing constraint cards show label/summary.

Buttons:

- Turn on / Turn off
- Edit/save configuration according to kind
- Add preset constraint buttons

Kinds include:

- subjects in morning up to period;
- two subjects not adjacent;
- PE allowed periods;
- teacher time-off;
- minimum-day lesson distribution;
- at most one single/subject/day;
- allow split doubles for selected hard subjects;
- stream distribution/class stream conflict where configured/auto-computed.

Hard rules can make schedule impossible. Add only genuine policy; prefer soft preferences where
possible.

---

## 15. Teacher Time-Off

Choose Teacher. Add windows:

- day or All days;
- period or Whole day;
- reason;
- trash removes draft window.

Buttons **Add window**, **Save time-off**. Saved windows block placements. Clear/change when teacher
returns; draft protection is local until Save.

---

## 16. Blocked Slots

For Assembly, PPI, Games or protected event.

Fields:

- Name
- Applies to: Whole school / One grade / One class
- Grade/Class when applicable
- Day
- Period
- Double checkbox

Buttons Add Block/Update Block, Cancel Edit, Pause/Resume, Edit, Delete.

Paused remains recorded but not enforced. Delete removes rule; use carefully. A blocked slot is hard,
so overlapping excessive blocks create unplaced lessons.

---

## 17. Class Subject Lesson Requirements

For each class/level and subject configure:

- lessons per week;
- teacher (may differ by stream);
- double-count;
- allow split double;
- required venue/pool;
- movement-heavy preference after break;
- never use lab for theory-only;
- lab priority Normal/High;
- rotate teacher each term.

Whole-grade save applies comparable need to all streams while allowing per-stream teacher map.
Expand/collapse stream level control where shown.

The sum of academic, activities, free periods and blocked periods must fit schedule.

---

## 18. Teacher ↔ Subject qualifications and allocation

Teacher Subject links say who is eligible/strong for each subject. They do not alone assign class.
ClassSubjectNeed assigns one teacher to class+subject.

Automatic fair allocator considers qualifications, class count, lesson load and rules. If no
qualified active teacher, keep unassigned; do not assign arbitrary staff.

---

## 19. Combination Classes

Use when several classes attend one shared subject lesson with one teacher.

Fields:

- name;
- subject;
- shared teacher;
- lessons/week;
- doubles;
- scope Selected/Global;
- source Manual/Student Subject Choices;
- venue/lab or pool;
- movement preference;
- member classes.

**Save combination group**; trash deletes. This differs from elective blocks: combination is one
shared lesson; elective block runs multiple parallel subjects.

---

## 20. Venues & Labs

Fields:

- venue name;
- short code (auto if blank);
- capacity per period (simultaneous classes);
- supported subjects.

Buttons Add/Update venue, Cancel edit, edit tag, delete. Printed code can be edited through venue
service UI.

Venue conflicts/capacity are real solver resources. Capacity 2 permits two simultaneous bookings;
required subject support/pins/pool priorities apply. Do not use “Classroom” venues unnecessarily for
ordinary home classrooms.

---

## 21. Teacher Print Codes

Each teacher can have short timetable code. Blank means auto-generate initials/de-duplicate. Edit and
save according to inline control. Codes affect print display, not login/identity.

---

## 22. Import Existing Teacher Allocations

Press **Import allocations**.

Upload CSV/XLSX or paste rows. Same teacher may appear on multiple rows, one per subject/class/load.
Preview maps real teacher/subject/class, flags conflicts/unknowns, then **Confirm import**. Back
returns; Done closes. On phones the import opens as a full-height bottom sheet with its own vertical
scroll, sticky heading, safe-area bottom padding and contained overscroll, so Upload, Preview,
Bundi review, Confirm and result controls remain reachable.

Import creates/reuses one User per genuine teacher and writes ClassSubjectNeed/qualification links as
service specifies. Review before generation.

---

## 23. Elective / Options Blocks

Use when learners choose between parallel subjects.

Top buttons:

- **Build from student choices**
- **Print venue & teacher roster**

Fields:

- block name;
- type Multi-Slot or Single-Choice;
- Prefer after break;
- Keep exam sittings separate even if combinable;
- member classes;
- slots, labels and Double;
- per-slot subjects;
- teacher optional;
- venue optional/auto-pick overflow.

Buttons Add Subject to Slot, remove subject, Add Another Slot, remove slot, Add/Update Block, Cancel
Edit, edit/delete existing.

Single-Choice repeats same alternatives each block slot. Multi-Slot allows different sets. Student
choices determine who attends; do not combine subjects merely because names fit.

### Build from Student Choices

Select level/kind/default lessons → **Analyse real student choices**. Preview detected elective/math
split, recommended teachers/workloads; edit block name/teacher/load → **Confirm and create block**;
Back/discard cancels. Requires confirmed `StudentSubjectSelection`.

---

## 24. Overflow venue behavior

When parallel subjects exceed block member home classrooms, extra subjects are overflow. Explicit
venue pin wins; blank lets solver choose real compatible venue respecting capacity/clashes and saves
resolved venue. If no venue, engine reports honestly.

---

## 25. Solver rules enforced

At minimum:

- one class per ordinary slot;
- teacher never double-booked;
- venue capacity/conflict;
- blocked slots/time-off;
- weekly loads and singles/doubles;
- combination/elective parallel structure;
- per-student elective exam conflicts where relevant;
- free-period cap/distribution;
- lunch/break reservations;
- configured constraints/preferences;
- lab priority/rotation history.

No solver can satisfy mathematically impossible input. Unplaced output is correct evidence.

---

## 26. Review before Publish

1. Job DONE and warnings/unplaced reviewed.
2. Every class weekly total and free periods.
3. Teacher timetable conflicts/workload/time-off.
4. Break/lunch/assembly/Games.
5. Labs/venues capacity.
6. Doubles and movement subjects.
7. Elective student combinations/rooms/teacher codes.
8. Saturday/remedial/prep.
9. Print sample class/teacher/venue.
10. Save Draft first, obtain leadership/teacher review, then Publish.

---

## 27. Corrections after generation

- Small one-cell correction: Timetable cell Save/Clear with conflict check.
- Policy issue: update config/constraint/blocked/time-off/need, regenerate.
- Teacher departure: Staff Access/Teacher transfer impact, regenerate.
- New elective choices: rebuild block/group/rosters, regenerate.
- Venue unavailable: update venue/pins/pool and regenerate.

Do not manually fix dozens of cells when source rule is wrong.

---

## 28. Common errors

| Problem | Check |
|---|---|
| Start disabled | manage permission or job already running |
| Lots of Free Study | missing weekly needs or intentional gap |
| Unplaced lessons | impossible loads, time-off, blocks, venue, doubles, teacher shortage |
| Teacher clash manual save | teacher already used same period |
| Lab lesson missing | subject venue requirement/pool/support/capacity |
| Elective wrong | confirmed selections, block type/slots/classes |
| Break/lunch wrong | Schedule Rules/lunchAfterPeriod per level/class |
| Print teacher codes blank | save/auto-generate codes |
| Publish hidden/disabled | manage permission/current status |
| Draft restored unexpectedly | clear local saved draft |
| Streams disagree | use level/group save only after intentional agreement |
| Generation failed | job error, do not spam rerun |

---

## 29. Founder end-to-end test

1. Two classes, subjects and qualified teachers.
2. Save Schedule Rules including flexible lunch.
3. Save per-class needs with singles/doubles.
4. Add teacher time-off and assembly block.
5. Add single-capacity lab and two competing classes.
6. Add combination group.
7. Add elective block from confirmed choices.
8. Pre-generation summary explains free gaps.
9. Start job; verify progress/DONE/unplaced.
10. Confirm no teacher/class/venue clash.
11. Check free-period count/spread and lunch.
12. Draft, print class/teacher/venue/elective rosters.
13. Publish and verify teacher/family notifications/views.
14. Manual edit conflict rejection.
15. Teacher transfer/regeneration.
16. Cross-tenant isolation and denied role.
17. 360px/glass/print.

---

## 30. Gap review

No new orphaned control was found in this timetable pass. Module 08's empty Senior Pathway subject
catalog had already been fixed before reaching timetable. The manual records every visible Smart
Timetable section and routes specialized Exam Timetable/Duty Roster to their own later chapters.

---

## 31. Edit points

- UI: `src/components/academics/academics-client.tsx` (`TimetableTab`, `TimetableEngineTab`)
- Main services: `timetable-engine.service.ts`, `timetable-solver.service.ts`, `academics.service.ts`
- APIs: `/api/academics/timetable/*`
- Teacher import: `teacher-allocation-import.service.ts`
- Electives: `elective-block.service.ts`, `elective-block-auto-build.service.ts`
- Venues: `venue.service.ts`
- Prints: `print-timetable-page.tsx`, elective roster print

## Mobile scrolling — Build Options Block from student choices

The auto-build sheet now opens as a bottom sheet on phones, uses the dynamic viewport, reserves the device safe area, enables vertical touch panning and momentum scrolling, and contains overscroll inside the sheet. The level/kind setup, detected-subject preview, teacher recommendations and final Confirm button must all be reachable by swiping downward inside the sheet. At `sm` and above it returns to a centred rounded dialog with a 90dvh maximum height.

## Lunch display immediately after the selected period

A configured “Lunch after Period N” is rendered as a separate non-lesson row/column after that period, not as a fake subject card. The timetable now falls back to the saved class configuration immediately, even before regeneration creates legacy lunch reservation rows, and filters any such legacy `LUNCH` subject from lesson cells. Period clock calculations include the normal lesson duration first and then the lunch duration, so “after Period 6” no longer replaces Period 6's displayed time.

## Assembly, a second short break and class-specific Saturday times

Schedule Rules now supports an optional **Before-lesson activity** and duration (for example Assembly, Form Time or Morning Briefing). The school-day start is the activity start; Period 1 begins after its duration. A separate blue assembly row appears before Period 1 in screen and print timetable views. Set duration to 0 to disable it.

A real optional **Second Short Break After Period** and duration is now visible alongside the existing first short break, long break and lunch. Clearing its period disables it.

Saturday has a separate, clearly labelled start/end section. Those values affect Saturday independently of Monday–Friday. If different classes use different Saturday hours, first choose **Edit only [stream]** at the top of Schedule Rules, then save that class's Saturday start/end. Grade, group and whole-school scopes remain available only when the school deliberately wants shared rules.
