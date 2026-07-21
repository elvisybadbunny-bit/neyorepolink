# Teacher Elective Load and Staffing Report

**Built:** 21 July 2026

## Purpose

Turn teacher allocation from a dropdown into a staffing decision supported by confirmed learner demand.

## Counts

For every assigned elective teacher:

- groups;
- weekly lessons;
- unique learners;
- learner-subject enrolments;
- weekly learner contacts (`group learners × lessons/week`);
- largest group;
- practical-heavy groups;
- groups exceeding school threshold;
- current published timetable gaps;
- continuity links;
- active substitution exposure.

Unique learners and learner-subject enrolments are deliberately separate. A learner taking two subjects with one teacher is one unique learner but two enrolments.

## Subject staffing rules

School can set per subject:

- recommended maximum general/theory group size;
- recommended maximum practical group size;
- practical-heavy flag.

These are school planning rules, not invented national legal limits. NEYO calculates required teaching groups with `ceil(confirmed learners / applicable maximum)`.

Example: Biology practical, 58 learners, practical maximum 24 → 3 teaching groups required.

## Data sources

- active ElectiveBlocks and A/B/C families;
- confirmed StudentSubjectSelection rows;
- active learners in member classes;
- selected teacher per block subject;
- five repeated block slots;
- current published TimetableSlots;
- teacher continuity assignments;
- active substitute assignments.

No AI, prediction service or external provider is used.

## Problems surfaced

- option subject with no teacher;
- teacher carrying unusually high weekly contacts;
- physical group too large for school’s pedagogical/practical threshold;
- need for additional teaching groups;
- teacher with many timetable gaps;
- continuity/substitution exposure;
- imbalance hidden by raw lesson count alone.

## Real split-group integration

When more than one group is required, NEYO now partitions confirmed learners deterministically and persists each group with its own key, learner IDs, qualified teacher and venue/home room. Teacher counts therefore represent the real group rather than repeating the full subject roster. Confirmation rejects missing/duplicate learners and parallel teacher or venue conflicts.

## API

- `GET /api/academics/timetable/teacher-staffing`
- `POST /api/academics/timetable/teacher-staffing` to save subject limits.

## Migration

`20260721030000_teacher_elective_staffing_rules`
