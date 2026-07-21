# Timetable print and real parallel teaching-group upgrade

## Real same-subject split groups

When a school sets a subject maximum and confirmed demand exceeds it, Phase B/C now creates deterministic learner partitions:

- exact group count = ceiling(learners / maximum);
- learners sorted by admission number/id;
- balanced round-robin partitions;
- exact student IDs stored per group;
- separate qualified teacher per group;
- separate/home venue per group;
- all groups run in parallel in the same option family;
- personal learner proof resolves only the group containing that learner.

Database fields on `ElectiveBlockSlotSubject`:

- `teachingGroupKey`;
- `teachingGroupLabel`;
- `studentIdsJson`.

The old uniqueness rule `(slotId, subjectId)` is now `(slotId, subjectId, teachingGroupKey)`.

NEYO rejects duplicate/missing learners, insufficient teachers, unqualified teachers, duplicate parallel teachers, and capacity/venue failures. It no longer pretends a second teacher name creates a split—the partition is persisted.

## Print output

- Dedicated `/print/timetable` route remains outside app shell.
- Vertical days is now default on screen and print.
- Horizontal alternative explicitly sends `vertical=0`.
- A4 landscape vertical-days grid.
- Class/teacher/venue title centred before table.
- 3mm page margin (printer hardware may impose more).
- Break and lunch are inserted merged vertical columns after configured periods; lunch does not replace a numbered lesson.
- Master solver no longer stores Lunch as a fake ACADEMIC period; staggered lunch safety remains in wall-clock overlap calculations.
- B&W ink-saver remains supported.
- Generated timestamp and Powered by NEYO appear as a compact right-aligned footer below the timetable.
- On-demand streaming only; no automatic stored PDF.
