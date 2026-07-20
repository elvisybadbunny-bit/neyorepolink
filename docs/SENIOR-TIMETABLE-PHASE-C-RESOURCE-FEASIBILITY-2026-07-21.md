# Senior Timetable Phase C — teacher, venue and learner-capacity feasibility

**Built:** 21 July 2026

## Purpose

Phase B proves learner subject combinations fit A/B/C. Phase C proves the school has a real qualified teacher and physically adequate teaching location for every parallel group before confirmation/generation.

No AI, Bundi or external provider is used.

## Venue model improvement

`Venue.learnerCapacity` stores physical learner seats separately from `capacityPerPeriod`:

- `learnerCapacity`: how many learners physically fit;
- `capacityPerPeriod`: how many genuinely independent groups/bays can operate simultaneously.

The school edits both under Smart Timetable → Venues & Labs. Null learner capacity means “not measured,” never unlimited.

## Preview checks per subject

- confirmed learner count;
- member classes/streams;
- maximum home-class capacity;
- whether a shared venue is required;
- qualified TeacherSubject recommendations;
- tagged venue recommendations;
- verified learner capacity;
- resource blockers.

A shared venue is required when a subject combines learners across streams and the group cannot be proven to fit a home classroom.

## Confirmation checks

The server re-reads live records and requires:

1. one teacher per subject;
2. selected teacher has real TeacherSubject qualification;
3. one teacher is not assigned to two parallel subjects in the same block;
4. required shared venue is selected;
5. venue is active;
6. venue supports the subject;
7. learner-seat capacity is set;
8. learner-seat capacity covers the group;
9. simultaneous groups do not exceed venue `capacityPerPeriod`;
10. total learners sharing a multi-bay venue do not exceed its learner capacity.

Selected venue IDs are persisted on every repeated option slot.

## Generation-time revalidation

Before Master generation, NEYO rechecks:

- no confirmed choice changed after Phase B/C confirmation;
- learner proof count equals current active learner count;
- A/B/C each still has five slots;
- teachers remain assigned and qualified;
- required venues remain present, active, tagged and large enough.

If resources change, NEYO stops and requires a rebuild. It never trusts a stale preview.

## UI

Each preview row now shows:

- option block;
- learner count;
- home-class capacity;
- shared-venue requirement;
- qualified teacher selector;
- venue selector with seat capacity;
- hard resource messages;
- fixed five weekly lessons.

Confirmation remains disabled while blockers or required selections remain unresolved.

## Boundaries

Phase C verifies known teachers and physical capacities. The Master solver still determines actual wall-clock positions while enforcing teacher, class and venue collisions/time-off. Final committee/Head approval remains outside generation.

## Migration

`20260721003000_senior_phase_c_venue_capacity`

## Required tests

- no qualified teacher;
- teacher not linked to selected subject;
- same teacher selected for two subjects in one block;
- combined group fits home classroom;
- combined group exceeds home classroom;
- required venue missing;
- venue capacity unset;
- venue too small;
- venue not tagged for subject;
- one venue over simultaneous-group count;
- multi-bay learner total over capacity;
- teacher/venue changed after confirmation;
- learner choice changed after confirmation;
- active learner added after confirmation;
- successful revalidation unlocks Master generation.
