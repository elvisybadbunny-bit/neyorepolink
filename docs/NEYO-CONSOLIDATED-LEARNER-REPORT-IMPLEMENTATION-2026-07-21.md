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

## Remaining build phases

1. Persisted published report snapshot/version and calculation hash.
2. Consolidated screen with summary cards and subject drill-down.
3. Deviation, subject rank, teacher resolution and deterministic editable comments.
4. Class Teacher and Principal governed remarks.
5. Academic term dates and school-controlled fee visibility.
6. One-page rounded NEYO A4 report, comparison and trend charts, colour/B&W.
7. Exam practical resource feasibility and multi-session generation.
8. Browser, PDF and database-backed computation tests.
