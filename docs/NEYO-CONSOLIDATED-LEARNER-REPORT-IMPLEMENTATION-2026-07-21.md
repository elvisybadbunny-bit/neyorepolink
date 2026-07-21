# NEYO Consolidated Learner Report implementation

Founder decisions:

- Missing papers/assessments are omitted. Consolidated marks average only work the school actually conducted; no “provisional” label is required solely because an unconducted component is absent.
- Contribution strategy is school-controlled: custom weights or equal average of available work.
- Assessment names are school-authored through Exam names and Assessment Plan titles (CAT, Assignment, Group Work, Project, or any name).
- Rankings are school-controlled in the later report-presentation phase.
- Fee visibility is school-controlled in the later report-presentation phase.
- Subject-teacher invigilation has one school-wide default and optional per-subject/per-paper override.

## Phase 1 implemented

- `TermAggregationRule.weightingStrategy`: CUSTOM_WEIGHTS or EQUAL_AVAILABLE.
- `TermAggregationRule.missingComponentPolicy`: AVAILABLE_AVERAGE.
- AssessmentPlan records now participate alongside formal Exam results.
- Every source is normalized to percentage before contribution.
- Only available sources are renormalized to the effective 100% contribution.
- Paper-level missing components are also renormalized from available paper weight.
- Grading Engine has a reachable term computation-law editor with global/class/subject specificity.
- Exam timetable paper setup now includes duration mode, required invigilator count, preparation/cleanup buffers and subject-teacher policy.
- Invigilation has a tenant default, subject override and paper override.

## Phase 2 implemented

- School report-presentation law now controls `SHOW_RANKINGS`, `HIDE_RANKINGS` or `BANDS_ONLY` without changing computed marks.
- Fee visibility and colour/black-and-white print preferences are explicit school-owned settings.
- The Master report now returns dynamic assessment components, each normalised mark, effective contribution and weighted result.
- The learner drill-down shows final mark, grade/CBE level, class mean, deviation and policy-governed subject/overall rank.
- Release freezes one immutable learner payload per publication version with `AVAILABLE_WORK_V1` and a SHA-256 calculation hash. Existing publication evidence is never overwritten.
- The controls are reachable at `Academics → Grading Engine → Consolidated learner report policy`; the detailed report is reachable from a released marks portal through `Master report`, then by selecting a learner.

## Phase 3 implemented

- Each subject receives a deterministic, rule-based starting comment using the learner mark and deviation from the class mean. No Bundi or external provider is required.
- Subject teachers resolve deterministically from the class's real timetable slots; unresolved teachers remain visibly unresolved rather than guessed.
- Comment provenance is explicit: `AUTO`, `TEACHER_EDITED`, or `LOCKED`, with editor and lock timestamps retained.
- Class Teacher and Principal remarks are always human-authored. Class Teacher ownership is checked against the assigned class, while Principal remarks are restricted to authorised leadership.
- The learner drill-down exposes save/lock controls and blocks edits after locking. Corrections must use the governed result-correction workflow.

## Phase 4 implemented

- Report dates resolve from the configured academic term: school closing date and the next configured term's opening date. Missing next-term setup is shown honestly as not configured.
- Fee balance and next-term fee are omitted unless the school enables fee visibility. When enabled, the learner ledger balance and exact-class, level, or all-level next-term structure are resolved in that priority order.
- The learner screen now includes a subject-by-subject learner/class comparison and a bounded six-term performance trend.
- A compact rounded one-page A4 consolidated PDF includes dynamic available assessments, effective weights, deviation, grade/CBE level, policy-controlled rank, resolved teacher, comments, human remarks, dates, optional fees and trend.
- The same renderer supports school-controlled colour and black-and-white output. A published report carries the latest calculation-hash evidence; an unreleased preview is labelled as a live computed preview.

## Exam practical and multi-session phase implemented

- Schools can register labs, workshops, venues and equipment with quantity, learner capacity and availability dates.
- Saving a practical paper checks active resources, date availability, learner capacity and overlapping reservations. Multiple physical units permit only that many simultaneous reservations.
- `MULTI_SESSION` requires total candidates, per-session capacity, session length and gap. NEYO creates stable numbered candidate ranges and concrete session rows; it rejects plans that run past the selected end time.
- The exam timetable API now accepts the duration, preparation/cleanup, required-invigilator and subject-teacher-policy fields already shown by the UI instead of silently stripping them.
- All scheduling remains deterministic and provider-independent. Generation is not approval, and infeasible work is never hidden.

## Remaining verification phase

- Browser, PDF and database-backed computation tests, including migrated preview verification and 360px/A4 inspection.
