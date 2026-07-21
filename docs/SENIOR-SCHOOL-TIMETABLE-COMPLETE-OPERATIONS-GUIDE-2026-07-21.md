# NEYO Senior School Timetable — Complete Operations, Generation, Review and Change Guide

**Prepared:** 21 July 2026  
**Audience:** School Owner, Principal, Deputy Principal, Director/Dean of Studies, HOD, Timetable Committee, Class Teachers, Subject Teachers, Reception/Print staff and NEYO founder/testers  
**Scope:** From an empty school account to a working, approved, published and printable Senior School timetable—with safe changes later.

---

# 1. What NEYO’s timetable system is

NEYO’s timetable is not only a coloured class grid. It is a connected operating workflow built from:

- school day and bell rules;
- academic terms;
- classes and streams;
- subjects and pathway offerings;
- learner pathway allocations;
- confirmed learner elective choices;
- teacher qualifications;
- teacher workloads and continuity;
- rooms, laboratories and workshops;
- learner and room capacities;
- blocked school events;
- teacher time off;
- class-subject weekly requirements;
- Core/Essential Mathematics groups;
- Option A/B/C groups;
- deterministic scheduling;
- personal learner timetable proofs;
- quality reports;
- timetable committee review;
- Head approval;
- controlled publication;
- class, teacher, venue and learner outputs.

The final timetable is therefore the result of several linked school decisions.

NEYO never uses AI to generate a timetable. The engine uses explicit constraints, graph colouring, stable ordering, backtracking and deterministic scoring. The same saved inputs and engine version should produce the same result.

---

# 2. Key Senior School concepts

## 2.1 Administrative class

The learner’s home class or stream:

- Grade 10 East;
- Grade 10 West;
- Grade 11 North.

Learners in one administrative class may take different electives.

## 2.2 Pathway

The broad learner direction:

- STEM;
- Social Sciences;
- Arts and Sports Science.

A pathway is not a timetable block.

## 2.3 Subject combination

The exact three electives selected by one learner:

```text
Biology + Chemistry + Physics
```

or:

```text
Business Studies + Geography + History and Citizenship
```

## 2.4 Core subject

A subject taken by all or a defined pathway group:

- English;
- Kiswahili/KSL;
- Core or Essential Mathematics;
- Community Service Learning.

## 2.5 Mathematics split

Core and Essential Mathematics run in parallel when one cohort contains STEM and non-STEM learners.

## 2.6 Option block

One timetable family in which several elective subjects run simultaneously.

A learner attends exactly one subject in:

- Option A;
- Option B;
- Option C.

Each block runs five times each week.

## 2.7 Combination group

Several classes/streams share one subject lesson with one teacher.

This is different from an Option Block:

- Combination Group = one shared subject.
- Option Block = several different subjects in parallel.

## 2.8 Venue

A real room or facility:

- Chemistry Lab;
- Computer Lab;
- Workshop;
- Home Science Room;
- Art Studio;
- School Hall.

## 2.9 Draft versus published timetable

- Generated Draft: available for review, not live.
- Published: official timetable visible to users.

Generation is not approval.

---

# 3. Recommended Senior School weekly structure

The reviewed Senior School guidance uses:

| Learning area | Weekly lessons |
|---|---:|
| English | 5 |
| Kiswahili/KSL | 5 |
| Core/Essential Mathematics | 5 |
| Community Service Learning | 3 |
| Elective Option A | 5 |
| Elective Option B | 5 |
| Elective Option C | 5 |
| Physical Education | 3 |
| ICT Skills | 2 |
| P/RPI | 1 |
| Personal/Group Study | 1 |
| **Total** | **40** |

Typical reviewed routine:

- reporting: 8:00;
- roll call/assembly: 8:00–8:20;
- lessons begin: 8:20;
- eight lessons/day;
- 40 minutes/lesson;
- first health break after Period 2: 10 minutes;
- second break after Period 4: 30 minutes;
- lunch after Period 6: 60 minutes;
- regular lessons end around 3:20;
- non-formal programme after regular lessons.

Schools must confirm current official guidance and their approved local routine before applying a preset.

---

# 4. Roles and responsibility

## School Owner

- confirms school offering and resources;
- can Head-approve and publish;
- reviews staffing/infrastructure gaps.

## Principal

- final academic authority;
- Head-approves and publishes;
- accepts or rejects committee recommendations.

## Deputy Principal / Director or Dean of Studies

- usually chairs timetable work;
- configures rules;
- reviews readiness, resources and quality;
- records committee review or return for correction.

## HOD

- confirms teacher qualifications;
- confirms subject offerings;
- reviews subject loads and group sizes;
- joins committee review.

## Class Teacher / Career Teacher

- checks learner pathway and elective records;
- reviews exceptions;
- ensures every learner has confirmed choices.

## Subject Teacher

- confirms availability and venue needs;
- later receives published timetable and group roster.

## Timetable Committee

Recommended members:

- Deputy/Director of Studies;
- Senior Masters responsible for pathways;
- HODs/Heads of Subjects;
- Grade 10–12 Class Teachers.

The committee reviews; the Head approves.

---

# 5. Complete setup order

Do not begin by pressing Generate. Follow this dependency order.

1. School profile and Senior School activation.
2. Academic year and current term.
3. Classes/streams and capacities.
4. Departments.
5. Subjects.
6. Pathways/tracks and subjects offered.
7. Teachers and roles.
8. Teacher-subject qualifications.
9. Venues/labs/workshops and capacities.
10. Active learners assigned to classes.
11. Learner pathway allocations.
12. Subject Selection portal.
13. Confirmed three-elective choices.
14. Class-subject weekly requirements.
15. Schedule rules and bell routine.
16. Teacher time off and hard blocked slots.
17. Phase A readiness.
18. Core/Essential Mathematics split.
19. Phase B Option A/B/C.
20. Phase C teacher/venue feasibility.
21. Teacher staffing report.
22. Master generation and Phase D reservations.
23. Phase E personal learner proofs.
24. Phase F quality report.
25. Phase G committee/Head governance.
26. Publish and print.

---

# 6. Step 1 — school profile and levels

Open School Settings.

Confirm:

- curriculum includes CBE;
- Senior School is active;
- school type is Day, Boarding or Both;
- pathway offering is configured;
- school offers one, two or three pathway groups according to its real capacity.

Do not activate a pathway merely because it appears in a menu. The school must have subjects, teachers and facilities.

### Result

Senior Pathways, Subject Selection and Senior timetable tools become relevant in Academics.

---

# 7. Step 2 — term

Open Academics → Terms.

Create:

- academic year;
- term number;
- start date;
- end date;
- current term flag.

The term connects timetable work to other academic processes and operating dates.

---

# 8. Step 3 — classes and streams

Create the real administrative classes:

```text
Grade 10 East — capacity 35
Grade 10 West — capacity 35
Grade 10 North — capacity 30
```

Capacity matters because Phase C compares elective-group demand with possible home-class space.

Do not create streams named after every possible subject combination. One stream can contain several combinations.

### Verify

- no duplicate level/stream;
- capacities are realistic;
- archived classes are not used;
- learners are attached to the correct class.

---

# 9. Step 4 — departments and subjects

Create departments, for example:

- Languages;
- Mathematics;
- Sciences;
- Humanities;
- Technical and Applied;
- Creative Arts and Sports.

Create or apply the school’s reviewed subjects.

Ensure unique codes:

```text
ENG  — English
KIS  — Kiswahili
MATC — Core Mathematics
MATE — Essential Mathematics
CSL  — Community Service Learning
BIO  — Biology
CHE  — Chemistry
PHY  — Physics
```

Map every subject to its real Department. Phase F uses departments as the transparent similarity source when checking consecutive subjects.

### Common mistakes

- creating “Mathematics” instead of separate Core and Essential variants;
- duplicate subject names;
- missing subject code;
- subject archived after learners selected it;
- subject not mapped to its department.

---

# 10. Step 5 — teachers

Create active teacher accounts.

For every teacher record:

- full name;
- role;
- department/HOD where applicable;
- class-teacher assignment where applicable;
- subject qualifications;
- availability/time off;
- timetable short code.

## Teacher-subject qualification

Map:

```text
Mercy Chebet → Biology, Chemistry
Samuel Kiptoo → Core Mathematics, Advanced Mathematics
Amina Hassan → English, Literature
```

This is not cosmetic. Phase A/C and the Staffing Report use these links.

A teacher not linked to Biology cannot be confirmed for Biology in Phase C.

---

# 11. Teacher workload recommendations

NEYO ranks qualified teachers using:

```text
(class count × 10) + weekly lesson load
```

It also checks school and teacher-specific maximums.

The recommendation shows:

- teacher name;
- existing classes;
- existing lessons/week;
- allowed/not allowed under workload rules.

The recommendation is guidance. Leadership confirms the teacher.

---

# 12. Teacher continuity

Use continuity rules when the school wants the same teacher to continue with a class/subject.

A change shows impact:

- lessons affected;
- timetable regeneration required;
- continuity chain;
- replacement recommendation.

Do not change teachers after Head approval without creating a corrected draft and new governance cycle.

---

# 13. Step 6 — venues and laboratories

Open Smart Timetable → Venues & Labs.

Add:

- venue name;
- short printed code;
- simultaneous groups/bays;
- learner-seat capacity;
- supported subjects.

Example:

```text
Chemistry Lab
Code: CHEM
Groups at once: 1
Learner seats: 30
Supports: Chemistry
```

```text
School Hall
Code: HALL
Groups at once: 2
Learner seats: 120
Supports: History, Business, CSL
```

## Two capacity meanings

### Groups at once

How many independent teaching groups genuinely operate there simultaneously.

### Learner seats

How many learners physically fit.

Missing capacity is not treated as unlimited.

---

# 14. Step 7 — learners and pathway allocation

Every active Senior learner must have:

- class;
- pathway allocation;
- confirmed subject choices.

Example:

```text
Kevin Kiptoo
Class: Grade 10 East
Pathway: STEM
Electives: Biology, Chemistry, Physics
Mathematics: Core
```

```text
Mary Wambui
Class: Grade 10 East
Pathway: Social Sciences
Electives: Business, Geography, History
Mathematics: Essential
```

The school may approve a valid cross-pathway exception. NEYO warns; it does not change the choice.

---

# 15. Step 8 — Subject Selection portal

Open Academics → Subject Selection.

Create a portal for the level.

Set:

- name;
- target level;
- open/close dates;
- elective subjects offered;
- minimum 3;
- maximum 3;
- compulsory references where applicable.

Learners submit choices.

Leadership reviews and confirms them.

Draft choices never drive the timetable.

### Before confirmation

Check:

- school offers the subject;
- eligible teacher exists;
- room/equipment exists;
- pathway pattern or approved exception;
- the learner understands the choice;
- career guidance is recorded where needed.

---

# 16. Step 9 — weekly requirements

For ordinary class subjects, save:

- lessons/week;
- doubles/week;
- split-double permission;
- teacher;
- venue/pool;
- movement-heavy preference;
- practical/lab settings.

For Senior core/support structure:

- English 5 singles;
- Kiswahili/KSL 5 singles;
- Mathematics 5 singles;
- CSL 3 singles;
- PE 3 singles;
- ICT 2 singles;
- P/RPI 1 single;
- Personal/Group Study 1 single.

Elective A/B/C is created from choices—not entered as ordinary full-class subjects.

---

# 17. Step 10 — bell routine and schedule rules

Set:

- periods/day;
- lesson duration;
- school/reporting start;
- pre-lesson assembly label/minutes;
- breaks;
- lunch;
- Saturday settings;
- remedial/prep participation.

Recommended reviewed Senior template:

```text
Reporting: 08:00
Assembly/roll call: 20 mins
Period 1: 08:20
8 periods/day
40 mins/period
Break after P2: 10 mins
Break after P4: 30 mins
Lunch after P6: 60 mins
```

Saturday is a separate school-approved programme, not part of the standard 40 Monday–Friday periods.

Schedule rules can apply to:

- stream;
- grade;
- group of grades;
- whole school,

only when the school deliberately chooses the scope.

---

# 18. Step 11 — teacher time off

Record windows when a teacher cannot teach.

Example:

```text
Mercy Chebet
Tuesday Periods 1–2 unavailable
Reason: Department meeting
```

The solver checks actual wall-clock overlap, including classes whose period structures differ.

---

# 19. Step 12 — hard blocked slots

Use hard blocks for:

- whole-school assembly;
- fixed games afternoon;
- PPI;
- official meeting;
- class-specific event.

Scope can be:

- School;
- Level;
- Class.

A hard block cannot be overwritten by a normal lesson.

---

# 20. Phase A — readiness gate

Select the Senior level and press **Check readiness**.

## Hard blockers

- no active class;
- no active learners;
- no Subject Selection cycle;
- learner without confirmed choices;
- not exactly three distinct electives;
- missing/archived subject;
- elective without qualified teacher link;
- missing Core/Essential Mathematics variant;
- effective learner week not 40;
- missing schedule rules;
- core/support subject configured as a double.

## Warnings requiring leadership review

- pathway missing;
- cross-pathway exception;
- routine differs from guidance;
- bell/break/lunch difference;
- Saturday local programme.

The Master Generator cannot start when hard blockers exist.

---

# 21. Mathematics split

When a cohort contains STEM and non-STEM learners:

1. Open Build from Student Choices.
2. Choose Mathematics Split.
3. Select level.
4. Preview Core and Essential groups.
5. Confirm different qualified teachers.
6. Confirm venues/capacities if required.
7. Save five parallel Mathematics slots.

NEYO checks:

- both variants exist;
- five slots;
- two different teachers;
- teachers remain qualified;
- pathway allocations have not changed.

---

# 22. Phase B — deterministic Option A/B/C

Press **Build deterministic Option A/B/C from learner choices**.

NEYO:

1. reads confirmed choices;
2. removes genuine compulsory subjects;
3. creates subject conflict graph;
4. connects subjects selected together;
5. assigns each subject to A, B or C;
6. proves every learner has one selected subject in each block;
7. stops if three blocks are impossible.

Example:

| Option A | Option B | Option C |
|---|---|---|
| Biology | Chemistry | Physics |
| Agriculture | Computer Studies | Home Science |
| History | Business | Geography |

No learner may have two choices in one column.

## Impossible graph

NEYO reports:

- conflicting subjects;
- affected learners;
- no forced change.

Leadership reviews offerings, resources or authorised choices.

---

# 23. Phase C — teacher and venue feasibility

For every elective row, select:

- one qualified teacher;
- venue when required.

NEYO shows:

- learner count;
- classes involved;
- home-class capacity;
- shared-venue requirement;
- teacher recommendations/load;
- tagged venues and seats;
- hard resource messages.

The server revalidates live records.

It rejects:

- missing teacher;
- unqualified teacher;
- same teacher in two parallel subjects;
- missing required venue;
- venue not tagged for subject;
- unknown capacity;
- insufficient seats;
- excessive simultaneous groups.

---

# 24. Teacher Elective Load & Staffing Report

This report shows, per teacher:

- groups;
- weekly lessons;
- unique learners;
- learner-subject enrolments;
- weekly learner contacts;
- largest group;
- practical groups;
- groups needing split;
- timetable gaps;
- continuity assignments;
- substitution exposure.

## Three workload meanings

### Unique learners

Different people taught.

### Learner-subject enrolments

Learner counted once per subject.

### Weekly learner contacts

```text
learner count × lessons/week
```

## Group-size policies

School sets:

- general/theory maximum;
- practical maximum;
- practical-heavy flag.

Example:

```text
Biology practical maximum: 24
Confirmed learners: 58
Required groups: 3
```

When demand exceeds the school-set maximum, NEYO now creates balanced, deterministic same-subject teaching groups. Every group stores exact learner IDs, its own qualified teacher and its own home room/venue while all groups run in parallel.

---

# 25. Starting the Master Generator

Press **Start Master Button** only after A/B/C/resources are ready.

The background job shows:

- Queued;
- Running;
- phase;
- percentage;
- slots placed;
- warnings;
- unplaced lessons;
- reservation summary;
- learner-proof counts;
- quality score.

The engine has no paid timetable provider.

---

# 26. Phase D — atomic block reservation

Before ordinary lessons, NEYO reserves:

- Option A × 5;
- Option B × 5;
- Option C × 5;
- Mathematics split × 5 where required.

Each family occurs once Monday–Friday.

No official five-period family spills into Saturday.

Every slot reserves:

- all member classes;
- all parallel teachers;
- all venues.

Ordinary lessons cannot overwrite it.

The engine applies soft morning/afternoon balance while respecting hard constraints.

---

# 27. Ordinary lesson placement

After block reservation, the solver places:

- combination groups not owned by Options Blocks;
- core/support lessons;
- singles;
- authorised doubles;
- venue lessons;
- other classes;
- non-Senior subjects.

Checks include:

- class collision;
- teacher collision;
- venue collision;
- time off;
- blocked slots;
- lunch/break structure;
- day spread;
- movement/lab preferences.

Unplaced lessons remain visible.

---

# 28. Phase E — personal learner proof

For every active Senior learner, NEYO resolves:

- ordinary subjects;
- correct Mathematics variant;
- exact Option A subject;
- exact Option B subject;
- exact Option C subject;
- teacher;
- venue;
- day/period.

The proof requires:

- five A periods;
- five B periods;
- five C periods;
- five correct Mathematics periods;
- no subject change inside one family;
- no day/period collision;
- subject remains in confirmed choices.

Smart Timetable displays learner selector, issues and personal table.

Any invalid proof makes the generation incomplete and blocks publication.

---

# 29. Phase F — quality report

After structural proof, NEYO checks quality:

- morning/afternoon concentration;
- five-period subject weekday spread;
- three appearances in one day;
- different consecutive subjects in same Department.

It produces:

- PASS or REVIEW;
- score 0–100;
- finding counts;
- examples.

These are advisory. The committee decides whether constraints justify the result.

---

# 30. Phase G — governance

## Generated Draft

The draft is stored separately. The currently published timetable remains live.

## Preview draft slots

Committee loads class/day/period/subject/teacher table.

## Committee Reviewed

Allowed leadership records review after learner proofs pass.

## Return for Correction

Requires written note. Generate a corrected new draft.

## Head Approved

Principal/Owner only, after Committee Reviewed.

## Publish Official

Explicit action applies approved slots transactionally.

Previous published generation becomes Superseded.

Teachers are notified only after publication.

---

# 31. Substitute protection

Draft generation snapshots and restores existing substitute assignment IDs and history.

At publication, active substitute assignments carry forward only when the new timetable has the same:

- class;
- day;
- period;
- original teacher.

Unmatched substitutions are counted for review rather than attached to the wrong lesson.

---

# 32. What users see before and after publication

## Before publication

Teachers/learners continue seeing the old official timetable.

Committee sees the new protected draft through Phase G preview and evidence cards.

## After publication

Live screens and print routes use the newly approved timetable.

---

# 33. Printing and outputs

NEYO supports:

- one class timetable;
- all-class pack;
- teacher timetables;
- venue timetables;
- elective block roster/reference print;
- subject-combination roster;
- personal learner proof on screen;
- ink-saver/B&W modes where available.

Printing is on demand. No PDF is generated automatically.

Main timetable stays readable; detailed option teacher/venue rosters can be separate to avoid overcrowding.

---

# 34. How to tweak the timetable safely

Schools will always need changes. Do not edit a published timetable casually.

## Change bell time

1. Open Schedule Rules.
2. Choose correct scope.
3. Change time/duration/break.
4. Run Phase A.
5. Regenerate.
6. Review learner proofs/quality.
7. Committee/Head approve.
8. Publish.

## Change teacher

1. Verify teacher is qualified.
2. Check workload/staffing report.
3. Update allocation/continuity.
4. Regenerate.
5. Check affected option blocks and personal proofs.
6. Governance cycle.

## Teacher goes on temporary leave

Use substitute workflow instead of changing the permanent timetable.

## Change learner elective

1. Reopen authorised choice workflow.
2. Record reason/approval.
3. Confirm updated choice.
4. Phase A becomes stale.
5. Rebuild A/B/C.
6. Recheck teachers/venues.
7. Regenerate and govern.

## Add learner

Assign class, pathway and confirmed choices. Latest learner proof coverage no longer matches active cohort, so publication is blocked until regeneration.

## Add/remove subject

Review all affected learners and school offering. Do not delete a selected subject without a transition decision.

## Change venue capacity

Update learner seats. Generation revalidates Phase C. Reduced capacity may block the draft.

## Change subject maximum group size

Update Teacher Staffing Report rule. Review required teaching groups and staff/facilities.

## Move one lesson manually

Use supported timetable editing only with conflict validation. After material changes, regenerate proofs/quality and repeat governance.

## Add Saturday remedial

Use separate Saturday/remedial tools. Do not move official 40 Senior periods to Saturday merely to hide an impossible weekday setup.

---

# 35. Scope safety when changing rules

Before saving, confirm whether editing:

- this stream only;
- every stream in the grade;
- group of grades;
- entire school.

NEYO detects agreement and offers wider scopes, but a user must explicitly choose the blast radius.

When streams differ, edit only the intended stream.

---

# 36. Common blockers and corrections

## “Learners without confirmed choices”

Complete/confirm selection portal records.

## “Not exactly three electives”

Review duplicates/missing choices. Do not fill randomly.

## “No qualified teacher”

Add real TeacherSubject link only after confirming qualification, or change staffing/offering.

## “Core Mathematics missing”

Apply/create correct Senior Mathematics variants.

## “Effective week not 40”

Review core/support requirements. Elective offerings count as three parallel blocks, not every offered subject.

## “Cannot fit three blocks”

Review conflict subjects and affected learners. Three-block graph is impossible under current choices.

## “Venue too small”

Choose larger tagged venue, revise grouping or add facility. Do not inflate capacity to pass.

## “Same teacher in two parallel subjects”

Assign another qualified teacher or review offering.

## “Needs 3 teaching groups”

Staffing threshold indicates current one-group configuration is pedagogically/resource constrained. Do not ignore merely because a hall fits physically.

## “Math split missing”

Build confirmed five-period Core/Essential split.

## “Learner proof 0/5”

The block was not placed, learner choice does not match slot, or generation is stale.

## “Quality REVIEW”

Open examples. Decide whether to alter constraints or accept with committee note.

## “Governance required”

Use Phase G. Direct one-click publishing is intentionally disabled.

---

# 37. Database records changed by stage

| Stage | Main records |
|---|---|
| Classes | `SchoolClass` |
| Subjects | `Subject`, `Department` |
| Teacher qualification | `TeacherSubject` |
| Weekly allocation | `ClassSubjectNeed` |
| Schedule rules | `TimetableConfig` |
| Teacher availability | `TeacherTimeOff` |
| Blocked events | `BlockedTimetableSlot` |
| Learner choices | `SubjectSelectionPortal`, `StudentSubjectSelection` |
| Pathways | `Pathway`, `StudentPathwayPreference` |
| Option A/B/C | `ElectiveBlock`, slots and slot subjects |
| Teacher staffing rules | Subject group-size fields |
| Venues | `Venue` |
| Generation | `TimetableGenerationJob` |
| Generated draft | `draftSlotsJson` |
| Personal proof | `SeniorLearnerTimetableProof` |
| Quality | `qualityReportJson` |
| Governance | `TimetableGovernanceDecision`, job governance fields |
| Publication | live `TimetableSlot` rows |
| Substitute | `SubstituteAssignment` |

---

# 38. Cost and infrastructure

No timetable phase uses a paid AI/provider.

Normal costs:

- database rows;
- server compute;
- API reads;
- backups;
- on-demand print bandwidth.

Cost controls:

- lightweight learner proof list;
- one learner detail loaded on selection;
- latest three detailed proof generations;
- latest three non-published draft snapshots plus current published;
- older bulky details pruned while summaries/audits remain;
- no automatic PDF generation;
- no automatic downloads;
- no media uploads.

Timetable JSON is normally much smaller than uploaded scans/photos/videos.

---

# 39. Founder test scenario

Use at least 30 fictional Grade 10 learners with combinations including:

- Biology/Chemistry/Physics;
- Agriculture/Computer/Home Science;
- Business/Geography/History;
- Biology/Geography/Fine Arts;
- Chemistry/Computer/Electricity;
- Physics/Home Science/Business.

Include:

- Core and Essential Mathematics;
- cross-pathway reviewed exception;
- subject without teacher;
- over-capacity practical group;
- one teacher suggested for two same-block subjects;
- teacher time off;
- lab too small;
- stale choice after Phase B;
- new learner after generation;
- return-for-correction governance case.

Test every phase and save evidence.

---

# 40. Final successful outcome

A timetable is truly working when:

- every active learner has confirmed valid choices;
- A/B/C conflict graph is valid;
- teachers are qualified and not simultaneous;
- venues fit groups;
- weekly allocation totals 40;
- option/Math blocks occur five times Monday–Friday;
- no class/teacher/venue wall-clock collision;
- every learner has a valid personal timetable;
- quality findings are reviewed;
- committee records review;
- Head approves;
- explicit publication succeeds;
- teacher/class/venue outputs agree;
- currently published timetable remains stable until replacement;
- future changes repeat the governed process.

That is the complete NEYO Senior School timetable lifecycle.

---

# 41. Same-subject parallel teaching groups

When a subject exceeds its school-set theory/practical maximum, NEYO calculates the group count, sorts learners deterministically, partitions them evenly, and requires a separate qualified teacher and capacity-safe room for every group. The exact learner IDs are persisted on each repeated Option slot, so personal proofs and teacher staffing counts resolve the real group rather than merely adding another teacher name.
