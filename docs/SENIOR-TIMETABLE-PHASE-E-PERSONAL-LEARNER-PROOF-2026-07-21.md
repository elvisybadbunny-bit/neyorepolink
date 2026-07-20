# Senior Timetable Phase E — durable personal learner proof

**Built:** 21 July 2026

## Purpose

A class grid is not sufficient in Senior School because learners in one administrative class attend different Mathematics variants and electives. Phase E resolves the generated Master timetable into one personal weekly schedule per active Senior learner and persists proof/errors.

No AI, Bundi, external provider or random choice is used.

## Proof construction

For each active Grade/Form 10–12 learner after Master generation:

1. Load their administrative class timetable slots.
2. Add ordinary core/support subjects.
3. For every Option A/B/C slot, intersect the slot’s subjects with that learner’s confirmed choices.
4. Require exactly one match.
5. For Mathematics split, use the learner’s allocated pathway to resolve Core (STEM) or Essential (non-STEM).
6. If no split is required, verify five ordinary periods of the correct Mathematics variant.
7. Store teacher/venue references resolved by the generated block.
8. Detect duplicate day/period rows.
9. Require five consistent personal periods for each A/B/C subject.
10. Require five consistent Mathematics periods.
11. Confirm A/B/C subjects remain in the learner’s confirmed choices.

## Durable records

`SeniorLearnerTimetableProof` stores:

- generation job;
- learner/class/level;
- valid state;
- full personal timetable JSON;
- issue list;
- Option A/B/C subject IDs;
- Mathematics variant;
- creation time.

One proof exists per learner per generation. Re-running creates a new generation’s evidence while retaining old generation history through its job.

## Generation result

`TimetableGenerationJob` stores:

- `learnerProofValid`;
- `learnerProofInvalid`.

Any invalid learner proof makes the Master result not fully solved and adds a visible warning.

## School UI

Smart Timetable includes “Phase E · learner personal timetable proof”:

- valid/invalid counts;
- learner selector;
- admission number;
- personal validity status;
- exact issue list;
- day/period/family/subject table;
- latest generation timestamp.

## Publication gate

A Senior timetable cannot publish unless the latest completed generation has:

- zero invalid learner proofs;
- valid proof count equal to the current active Senior learner count.

Adding/removing a learner after generation therefore requires regeneration before publication.

## Security

The proof API requires `academics.view` and tenant-scopes all records. It is not a public endpoint and does not expose another school’s learners.

## Migration

`20260721013000_senior_phase_e_learner_proofs`

## Tests

- learner receives exactly one A/B/C subject;
- five repetitions remain the same selected subject;
- selected subject absent from slot → invalid;
- two selected subjects in one slot → invalid;
- Core learner resolves Core Mathematics;
- non-STEM learner resolves Essential Mathematics;
- five ordinary Mathematics periods when no split exists;
- duplicate day/period → invalid;
- active learner added after generation blocks publication;
- invalid proof marks run incomplete;
- valid proof persists after refresh;
- publication succeeds only at 100% valid coverage.

## Boundary

Phase E proves personal attendance compatibility. Phase F should add deterministic quality reports (subject spacing, similar-skill adjacency and morning/afternoon distribution) before committee approval.
