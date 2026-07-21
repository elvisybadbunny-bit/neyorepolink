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

## Remaining build phases

1. Academic dates and safe fee-data resolution when fee visibility is enabled.
2. One-page rounded NEYO A4 report, comparison and trend charts.
3. Exam practical resource feasibility and multi-session generation.
4. Browser, PDF and database-backed computation tests.
