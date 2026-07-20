# Senior School CBE timetabling: research, elective explanation and NEYO gap audit

**Date:** 20 July 2026  
**Decision:** NEYO Timetable Engine must remain deterministic and rule-based. It must never call, depend on, advertise or fall back to AI for timetable generation.

## 1. Evidence and source hierarchy

This review used:

1. KICD’s public CBE materials page as the official curriculum-resource index.
2. The Senior School guidelines reproduced by Mwalimu Arena.
3. Additional Kenyan education reporting that reproduces the same Senior School allocation.
4. The supplied 66-minute TimetableMaster demonstration, used as practical workflow evidence—not as an official rule source.
5. NEYO schema, subject selection, pathways, elective-block, timetable solver, UI and testing documentation.

Mwalimu Arena and the video are secondary sources. Any rule implemented as “official” should ultimately be checked against the current KICD/MOE circular or curriculum material used by the school.

Sources:

- KICD CBE materials: https://kicd.ac.ke/cbc-materials/
- Mwalimu Arena Senior School guidelines: https://mwalimuarena.co.ke/post/guidelines-for-timetabling-and-routine-in-senior-school
- Supplied TimetableMaster demonstration: https://www.youtube.com/watch?v=smVaanqFyms
- Education News reproduction: https://educationnews.co.ke/kicd-issues-new-timetabling-guidelines-for-senior-school-under-cbe/

## 2. The official-looking Senior School weekly structure

The reviewed guideline consistently describes:

| Area | Lessons/week |
|---|---:|
| English | 5 |
| Kiswahili/KSL | 5 |
| Core or Essential Mathematics | 5 |
| Community Service Learning | 3 |
| Elective 1 | 5 |
| Elective 2 | 5 |
| Elective 3 | 5 |
| Physical Education | 3 |
| ICT Skills | 2 |
| P/RPI | 1 |
| Personal/Group Study | 1 |
| **Total** | **40** |

The reviewed daily structure says:

- 8 lessons/day;
- 40 lessons/week;
- 40 minutes/lesson;
- reporting at 8:00;
- 8:00–8:20 roll call/assembly/house/class meeting;
- lessons from 8:20 to approximately 3:20;
- health break after every two lessons;
- first break 10 minutes;
- second break 30 minutes;
- lunch 60 minutes;
- non-formal programme after the final lesson.

Plotting guidance says:

- balance subjects between morning and afternoon;
- avoid placing subjects with similar skills/knowledge/concepts consecutively;
- core subjects are single lessons;
- PE and ICT support subjects are single lessons;
- only one double lesson/week for Arts & Sports Science and STEM subjects;
- timetable committee plans/reviews each term;
- Head of Institution approves;
- approved copies are displayed and teachers extract their own timetable.

## 3. Senior School subject choice—plain explanation

Every learner takes four core learning areas:

1. English.
2. Kiswahili or KSL.
3. Core Mathematics or Essential Mathematics.
4. Community Service Learning.

Each learner then chooses three electives.

General pathway guidance from the reviewed material:

- at least two electives should normally come from the learner’s chosen pathway;
- the third may come from another pathway;
- a career need may justify one elective from each of three pathways;
- selection should consider career intent, aptitude, interest and personality, with school guidance;
- STEM learners take Core Mathematics;
- non-STEM learners generally take Essential Mathematics, but an eligible non-STEM learner may take Core Mathematics according to the guidance and assessment evidence.

This flexibility is why the timetable cannot simply create one “STEM class timetable,” one “Social Sciences class timetable” and one “Arts class timetable.” Learners can have combinations that cross those labels.

## 4. The four terms people confuse

### Pathway

A broad learner direction:

- STEM;
- Social Sciences;
- Arts and Sports Science.

A pathway is not itself a timetable block.

### Subject combination

The exact three electives chosen by one learner.

Examples:

- Biology + Chemistry + Physics;
- Agriculture + Computer Studies + Home Science;
- Business Studies + Geography + History and Citizenship;
- Biology + Geography + Fine Arts.

### Stream/class

The learner’s administrative home, e.g. Grade 10 East. One stream may contain learners with many different combinations.

### Option block

A timetable column in which several subjects run in parallel. A learner attends exactly one subject from that block.

These distinctions are essential.

## 5. How elective blocks are actually created

Assume every learner chooses three electives and every elective needs five lessons/week.

The school needs three option blocks:

- Option Block A — runs five times/week;
- Option Block B — runs five times/week;
- Option Block C — runs five times/week.

Every learner’s three selected subjects must be placed in three different blocks.

Example:

| Learner | Choices |
|---|---|
| Amina | Biology, Chemistry, Physics |
| Brian | Biology, Computer Studies, Electricity |
| Chebet | Agriculture, Chemistry, Home Science |
| David | History, Business Studies, Geography |

A possible result:

| Block A | Block B | Block C |
|---|---|---|
| Biology | Chemistry | Physics |
| Agriculture | Computer Studies | Home Science |
| History | Business Studies | Geography |
| Fine Arts | General Science | Electricity |

This works only if no learner needs two subjects in the same column.

If Amina takes Biology and Chemistry, those subjects must have different blocks. In mathematical terms:

- each elective subject is a node;
- draw an edge between two subjects when at least one learner selected both;
- assign one of three block colours to every subject;
- connected subjects cannot share a colour.

This is a deterministic constraint/graph-colouring problem. It does not require AI.

## 6. What happens when three blocks are impossible

Three blocks may fail because:

- learner combinations create a conflict graph needing more than three colours;
- one teacher is assigned to subjects in different parallel groups at the same time;
- a lab/workshop is needed by two parallel subjects but only one exists;
- one subject has too many learners for one room/teacher;
- the school does not offer enough teachers/resources for every selected subject;
- choices were confirmed before checking school offerings.

NEYO must never force a timetable and hide the problem.

It should produce an exception report such as:

> “Three option blocks cannot satisfy all confirmed choices. Biology, Chemistry, Physics and Computer Studies form an unresolved conflict. Affected learners: 7. Review subject offering, teacher allocation or approved learner choices.”

School-led resolutions may include:

- a fourth block, if weekly allocation/rules permit;
- a second teacher/room for a subject;
- splitting a large subject group;
- reviewing an invalid/unavailable combination with learner/parent/career teacher;
- changing the subjects the school offers before choices are confirmed;
- cross-stream combined teaching;
- a school-authorised individual arrangement.

The software must not change learner choices automatically.

## 7. Core versus Essential Mathematics

Core and Essential Mathematics are not ordinary electives. They are alternative core variants.

When a Grade 10 administrative class has both groups:

- Core Mathematics and Essential Mathematics should usually run in parallel;
- every learner belongs to exactly one mathematics group;
- each group has its teacher/room;
- both occupy the same five weekly mathematics positions;
- a teacher cannot teach both variants simultaneously;
- an eligible non-STEM learner taking Core Mathematics must remain in the Core group even if their pathway label is non-STEM.

This should be a dedicated “Mathematics split block,” separate from the three elective option blocks.

## 8. Timetable creation process recommended for a real school

### Governance first

1. Establish timetable committee.
2. Confirm school Senior School pathways/tracks and subjects actually offered.
3. Confirm available staff, rooms, labs/workshops and equipment.
4. Import/record learner choices.
5. Career teacher reviews exceptional combinations.
6. Confirm choices; drafts do not drive generation.
7. Head of Institution approves final timetable.

### Data setup

1. Create Grade 10–12 administrative classes/streams.
2. Create core, support and elective subjects.
3. Mark pathway/track membership and school offering.
4. Assign qualified teachers.
5. Enter teacher availability/time off.
6. Enter room/venue capabilities and capacity.
7. Enter 40-period bell schedule and breaks.
8. Enter blocked school activities.
9. Enter confirmed subject choices.
10. Build Mathematics split.
11. Build three elective option blocks from the choice-conflict graph.
12. Build class/teacher/venue rosters for every parallel subject.

### Generation

1. Reserve assembly and health breaks.
2. Reserve five Maths split positions.
3. Reserve five positions for each of three elective blocks (15 total).
4. Place core single lessons.
5. Place support single lessons.
6. Place permitted practical double lessons.
7. Check teacher, class, learner-group and venue conflicts by real wall-clock time.
8. Optimise morning/afternoon balance and spacing deterministically.
9. Leave unresolved lessons visible.

### Approval

1. View per class.
2. View per teacher.
3. View per room/lab.
4. View per elective group.
5. View each learner’s personal timetable.
6. Resolve exceptions.
7. Committee records review.
8. Head approves.
9. Publish/print.

## 9. What the supplied video contributes

The video usefully demonstrates:

- importing teachers/classes/subjects;
- setting bell schedules;
- mixing 8-4-4 and Senior School in one master timetable;
- building split groups;
- analysing actual learner combinations before deciding parallel groups;
- rooms/labs;
- teacher allocation;
- single/double lesson quantities;
- subject availability restrictions;
- exporting class timetables;
- regenerating after rule changes.

Most importantly, the presenter derives parallel elective groups from actual learner combinations. That is the correct practical insight.

The presenter repeatedly describes the demonstrated product as AI-powered. NEYO will not copy that architectural choice. The educational scheduling problem is solvable using explicit data, deterministic constraints, graph colouring, search/backtracking and scored rules. NEYO should always be able to explain why a slot was chosen or rejected.

## 10. What NEYO already has

### Strong existing foundations

- Classes/streams.
- Subjects/departments.
- Teacher-subject qualification links.
- Class subject weekly needs.
- Singles and doubles.
- Teacher availability/time off.
- Hard blocked slots.
- Venue/lab pools, subject compatibility and capacity.
- Combined classes.
- Elective block data models.
- Multiple parallel subjects per elective slot.
- Confirmed student subject-selection records.
- Auto-build preview from real student choices.
- Per-subject learner rosters.
- Teacher recommendations based on real links/load.
- Core/Essential Mathematics split workflow.
- KICD-style 40-lesson Senior template.
- 8 periods/day and 40-minute duration.
- Assembly, multiple breaks, lunch shifts and Saturday rules.
- Movement-heavy preferences.
- Lab priority/no-lab rules.
- Background generation jobs.
- Class/teacher/venue printing.
- Elective roster printing.
- Draft/publish concepts.
- Conflict warnings and unplaced lessons.
- Grade 10 synthetic scale test with 600 learners, 10 streams, 30 teachers, 17 options and 600 confirmed selections.

### Deterministic engine

NEYO’s timetable service uses explicit constraints, greedy/search placement, deterministic scoring and conflict checks. It does not call a language model or external AI provider. The “Smart Timetable” wording means rule-driven automation, not AI.

## 11. Critical NEYO gaps found

### Gap 1 — Auto-build creates one giant elective slot, not three conflict-safe option blocks

The current `buildElectivesPreview()` groups learners by subject but previews every detected elective together in one slot. That is incorrect for learners choosing three electives: all three choices would collide if every elective runs in the same block.

NEYO needs a real conflict graph and three-block colouring result.

### Gap 2 — No explicit proof that every learner’s three electives occupy three different blocks

The solver stores elective rows, but the generation gate needs a hard per-learner validation:

- exactly one selected subject in Block A;
- exactly one in Block B;
- exactly one in Block C;
- zero same-time conflicts.

Generation must refuse publication when this fails.

### Gap 3 — Selection rules are configurable but official pathway validation is incomplete

Subject Selection supports minimum/maximum electives, but Senior School confirmation needs reviewable rules:

- exactly three electives;
- normally at least two from chosen pathway;
- allow an authorised cross-pathway exception;
- school must actually offer the subject;
- teacher/resource feasibility warning;
- Core/Essential Mathematics eligibility/override record.

### Gap 4 — Senior template does not fully set official daily routine

Current template applies:

- 40 lessons;
- 40 minutes;
- 8 periods;
- weekly subject quantities.

It does not currently apply/review all of:

- 8:00 reporting;
- 8:00–8:20 assembly/roll call;
- 8:20 lesson start;
- health break after every two lessons;
- 10-minute first break;
- 30-minute second break;
- 60-minute lunch;
- end around 3:20;
- non-formal programme after lessons.

These should be an optional reviewed preset, never silently forced onto a school with a newer circular or valid local arrangement.

### Gap 5 — Single/double rules are not enforced by the template

Guidance says core and support subjects are singles, while Arts/Sports and STEM may have only one double/week. Current template writes lesson counts but does not reliably reset/validate `doubleCount` by subject category.

### Gap 6 — Similar-skill adjacency is not modelled

NEYO has morning preferences and spacing, but not a reviewed subject-similarity matrix preventing similar knowledge/skills subjects from following one another.

This should be a soft constraint with transparent penalties, because strict application may make a constrained timetable impossible.

### Gap 7 — Morning/afternoon balance needs a report

NEYO can prefer morning subjects, but Senior review needs a balance report per subject/class showing how many sessions occur morning versus afternoon.

### Gap 8 — Timetable governance/approval is incomplete

NEYO needs explicit statuses and actors:

- Input Draft;
- Generated Draft;
- Committee Reviewed;
- Returned for Correction;
- Head Approved;
- Published;
- Superseded.

Store committee notes and approval date. Do not treat generation as approval.

### Gap 9 — Personal learner timetable is not the central proof

With elective combinations, a class timetable alone is insufficient. NEYO should produce each learner’s personal view from core + Maths variant + three option blocks, proving no clash.

### Gap 10 — Capacity feasibility before choices close

Before confirmed selection, NEYO should show:

- projected learners/subject;
- teacher demand;
- room/lab demand;
- subjects with no eligible teacher;
- combinations that cannot fit three blocks;
- school-offering limits.

This prevents discovering impossible choices only during generation.

### Gap 11 — Mixed 8-4-4/CBE wall-clock review

NEYO supports both data structures, but a school running both needs a master wall-clock conflict report for shared teachers/venues, not only separate class slot numbers.

### Gap 12 — Senior Saturday default is questionable

Current optional template creates/retains Saturday settings. The reviewed 40-lesson official routine is Monday–Friday. Saturday remedial work may exist locally, but should not be implied as part of the standard 40-lesson Senior template.

## 12. What NEYO exceeds

Compared with the workflows visible in the supplied video, NEYO already exceeds in several areas:

- tenant isolation and school-owned records;
- confirmed learner subject-selection portals;
- pathway records and Core/Essential Mathematics model;
- automatic selection-to-roster preview;
- teacher qualification filtering;
- fairness/load-ranked teacher suggestions;
- venue capabilities, lab priority and no-lab exclusions;
- movement-heavy lesson preference;
- multiple lunch shifts;
- school/grade/stream schedule-rule scopes;
- teacher rotation and continuity concepts;
- combined classes and options blocks in one engine;
- class capacity and overflow review;
- background generation tracking;
- dedicated print routes and ink-saver mode;
- per-copy audit/history around inputs and generation;
- 600-learner Grade 10 scale simulation;
- explicit manual workflows when Bundi is unavailable;
- no dependency on an external AI service.

These strengths do not cancel the critical three-block grouping gap.

## 13. Required deterministic implementation

### Phase A — Senior readiness validator

Validate:

- school offering;
- exactly three confirmed electives;
- pathway rule or authorised exception;
- Mathematics variant;
- teacher/venue capacity;
- 40-lesson total;
- unsupported subject choices.

### Phase B — Conflict graph

For each confirmed learner:

- take their three electives;
- create all three pairwise conflict edges;
- aggregate across learners;
- colour subjects into A/B/C using deterministic backtracking;
- use stable subject ordering and tie-break rules;
- return explanation and unresolved set if impossible.

No random or AI output.

### Phase C — Resource feasibility

For every block:

- assign teacher per parallel subject;
- check one teacher is not assigned twice in same block;
- check rooms/labs;
- check subject capacity;
- split teaching group only after school confirmation.

### Phase D — Reserve blocks in master solver

Reserve:

- five A positions;
- five B positions;
- five C positions;
- five Mathematics-split positions where needed.

All parallel subjects inside a block share its positions.

### Phase E — Personal conflict proof

For every learner, generate:

- four cores;
- correct Mathematics variant;
- Elective A/B/C subject;
- support lessons;
- no duplicate wall-clock session.

Publication requires 100% learner proof or an explicit unresolved exception.

### Phase F — guideline quality scoring

Deterministically score:

- morning/afternoon balance;
- repeated subject spacing;
- similar-skill adjacency;
- break placement;
- permitted doubles;
- movement/lab preferences.

Hard constraints block. Soft constraints warn and rank alternatives.

### Phase G — committee approval

Generate → review reports → return/correct → Head approve → publish.

## 14. No-AI timetable constitution

NEYO Timetable Engine must obey these permanent rules:

1. No language model/API call in generation.
2. No “AI-powered timetable” school-facing claim.
3. No Bundi dependency.
4. Same inputs + same rules + same engine version produce the same result.
5. Every rejection has a human-readable reason.
6. Every unplaced lesson remains visible.
7. The school controls overrides.
8. Learner choices are never changed automatically.
9. Hard legal/safety/resource constraints cannot be bypassed silently.
10. Generation is not approval.
11. Manual timetable editing remains available.
12. Provider outage cannot stop timetable work because there is no provider.

Acceptable technical methods:

- constraint satisfaction;
- graph colouring;
- deterministic greedy placement;
- backtracking;
- branch-and-bound;
- integer/constraint programming libraries that run as ordinary algorithms;
- deterministic scoring and local search with a fixed seed/order.

These are algorithms, not AI.

## 15. Founder’s practical test dataset

Use at least 30 Grade 10 learners with varied combinations, including:

- Biology/Chemistry/Physics;
- Agriculture/Computer Studies/Home Science;
- Business/Geography/History;
- Biology/Geography/Fine Arts;
- Chemistry/Computer Studies/Electricity;
- Physics/Home Science/Business;
- one cross-pathway authorised exception;
- Core and Essential Mathematics groups;
- one subject with no teacher;
- one over-capacity lab subject;
- one teacher qualified for two subjects that would otherwise run together.

Expected tests:

1. Every learner has three confirmed electives.
2. Auto-builder produces A/B/C, not one giant block.
3. No learner has two choices in one block.
4. Impossible graph returns affected learners/subjects.
5. Maths split contains every learner exactly once.
6. 40 lessons total.
7. Core/support subjects remain single.
8. At most one permitted double for applicable subject.
9. Break/routine matches reviewed preset.
10. Teacher/venue/class/learner wall-clock conflicts are zero.
11. Personal learner timetable proves choices.
12. Committee approval required before publish.

## 16. Bottom line

NEYO’s timetable engine is already broader than a basic class scheduler and does not need AI. Its most important missing Senior School capability is not “better intelligence”; it is a correct deterministic three-option-block builder from confirmed learner combinations, followed by per-learner conflict proof and governance approval.

Until that is fixed, the existing auto-build should be treated as a preview of subject demand/rosters—not proof that Senior School electives are safely timetabled.
