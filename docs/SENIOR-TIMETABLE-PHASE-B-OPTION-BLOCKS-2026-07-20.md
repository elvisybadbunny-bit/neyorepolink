# Senior Timetable Phase B — deterministic Option A/B/C builder

**Built:** 20 July 2026  
**Location:** Academics → Smart Timetable → Build Options Block from student choices

## Purpose

Convert confirmed three-elective learner choices into three conflict-safe option columns. Phase B never changes a learner’s selection and never calls AI/Bundi/external providers.

## Algorithm

1. Read confirmed selections only.
2. Remove subjects that are genuinely compulsory for the learner/pathway.
3. Require exactly three distinct electives per learner.
4. Create one graph node per elective subject.
5. Connect two subjects when any learner selected both.
6. Deterministically colour the graph with A, B or C.
7. Connected subjects may not share a colour.
8. Produce per-learner proof: exactly one selected subject in A, B and C.
9. If impossible, stop and list the conflict core and affected learners.

Tie-breaking is stable: subject IDs, graph degree and least-used block order. There is no random seed.

## Preview

The preview displays:

- Option A subject count;
- Option B subject count;
- Option C subject count;
- five periods/block;
- number of learners whose A/B/C proof passed;
- option assignment on every subject;
- real learner roster;
- real qualified-teacher recommendations.

## Confirmation safety

Confirmation revalidates:

- every previewed subject remains included;
- every subject stays at five lessons/week;
- learner proof exists and remains valid;
- each A/B/C block contains at least one subject;
- same teacher is not assigned to two parallel subjects in the same block;
- class and subject IDs remain valid.

The school may choose teachers, but cannot use the confirmation screen to silently remove a learner-selected subject or alter the official five-period block allocation.

## Persisted timetable shape

One ElectiveBlock is created with 15 weekly atomic slots:

- Option A · 1/5 through 5/5;
- Option B · 1/5 through 5/5;
- Option C · 1/5 through 5/5.

Every subject assigned to a block repeats in parallel in all five slots for that block. Singleton blocks are allowed because a valid conflict colouring can leave one column with one offered subject; the reserved block periods and learner proof remain necessary.

The Master solver treats the active Options Block as the scheduling owner for those subjects. Auto-created Combination Groups remain available for rosters but do not create duplicate ordinary lessons. Normal class-subject cards for those same electives are also skipped. The older Whole-School generator is deliberately blocked when Senior levels exist because it does not understand atomic parallel option blocks.

Combination groups and rosters continue to be created through NEYO’s existing reviewed services.

## Impossible combinations

If no three-colour solution exists, NEYO returns:

- explanation;
- unresolved subject IDs/names;
- affected learners.

It does not:

- add a fourth block silently;
- change a learner’s subjects;
- ignore a clash;
- assign a subject randomly.

Leadership decides whether to review offerings, resources, an authorised choice or a future separately approved fourth-block design.

## Server-side generation gate

Both the Whole-School generator and background Master generator now require a confirmed Phase B run with:

- an active created elective block;
- A × 5, B × 5 and C × 5 slots;
- no empty slot;
- complete valid learner proof.

A preview alone cannot unlock generation.

## Boundaries

Phase B proves learner subject compatibility. Phase C must still prove simultaneous teacher, room, laboratory and capacity feasibility across every parallel subject. Final timetable committee and Head approval remain mandatory.

## Tests

1. One learner’s three subjects form a triangle and receive A/B/C.
2. Shared combinations aggregate conflicts across learners.
3. Same input produces same assignment.
4. Duplicate/two/four choices fail.
5. K4-style conflict graph fails with affected subjects/learners.
6. Every learner proof has A, B and C exactly once.
7. Confirmation creates exactly 15 weekly slots.
8. Every block repeats exactly five times.
9. Same teacher in two parallel subjects is rejected.
10. Singleton option column persists and reaches the solver.
11. Removed preview subject is rejected.
12. Non-five lesson count is rejected.
