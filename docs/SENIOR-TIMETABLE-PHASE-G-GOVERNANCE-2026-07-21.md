# Senior Timetable Phase G — committee review, Head approval and publication

**Built:** 21 July 2026

## Core correction

A generated draft no longer replaces the currently published timetable. During generation NEYO temporarily builds/validates slots, stores them in `draftSlotsJson`, then restores the existing live timetable. Only explicit publication applies the approved draft.

## States

1. `GENERATED_DRAFT`
2. `COMMITTEE_REVIEWED`
3. `RETURNED`
4. `HEAD_APPROVED`
5. `PUBLISHED`
6. `SUPERSEDED`

## Workflow

### Generate

Master generation creates draft slots, Phase D reservation evidence, Phase E learner proofs and Phase F quality report. Existing published timetable remains visible to staff/learners.

### Preview

Committee loads the draft slot table without changing live slots. It shows class, day, period, subject/block and teacher.

### Committee reviewed

Principal, School Owner, Deputy, HOD, Dean of Studies or Super Admin may record review. Invalid learner proofs block review.

### Return for correction

Committee leadership must write a correction note. Returned draft cannot be approved; a corrected Master generation creates a new draft.

### Head approve

Only Principal, School Owner or Super Admin. Requires Committee Reviewed and valid Senior proofs.

### Publish

Only after Head approval. NEYO transactionally replaces governed live slot types (Academic, Elective Block, Blocked), preserves separate Remedial/Prep/Activity rows, marks previous published generation Superseded, records actor/time/note and notifies active academic staff.

Active substitute assignments are carried only when the new official draft has the same class/day/period/original-teacher slot. Unmatched substitutions are counted for leadership review instead of being attached to the wrong lesson. Draft generation itself snapshots and restores published substitute IDs and history.

## Decision ledger

`TimetableGovernanceDecision` stores every decision, note, actor, role and timestamp. Decisions are append-only.

## Security

- View: `academics.view`.
- Actions: `academics.manage` plus role checks.
- Head approval/publication cannot be performed by ordinary teachers/HOD/deputy unless they also genuinely hold Principal/Owner role.
- Direct old `publish_timetable` action is rejected with Governance Required.

## Publication gate

Latest draft must cover every current active Senior learner with zero invalid proofs. A stale learner cohort blocks publishing even after an earlier approval.

## Cost controls

Draft slots are JSON, not PDFs/images. Full snapshots are retained for latest three non-published jobs and the current published job. Older returned/superseded draft rows are pruned while summaries, proof counts, quality reports, decisions and audit metadata remain.

## Migration

`20260721023000_senior_phase_g_governance`

## Required tests

- draft generation leaves current published slots unchanged;
- committee preview reads draft slots;
- ordinary teacher cannot decide;
- committee review blocked by invalid proofs;
- return requires note;
- returned draft cannot receive Head approval;
- Head approval requires committee state;
- publish requires Head approval;
- publish atomically replaces only governed slot types;
- remedial/prep/activity survive publish;
- prior published job becomes superseded;
- teacher notifications happen only after publish, not generation;
- stale learner proof blocks publication;
- decision history persists;
- old draft snapshots prune according to retention.
