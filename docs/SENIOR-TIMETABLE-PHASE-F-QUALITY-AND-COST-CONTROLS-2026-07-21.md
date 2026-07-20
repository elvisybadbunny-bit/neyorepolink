# Senior Timetable Phase F — deterministic quality report and cost controls

**Built:** 21 July 2026

## Quality checks

After Phase E, NEYO analyses each valid personal timetable using deterministic rules:

- morning/afternoon concentration (>75% of a 4+ period subject in one half);
- five-period subject spread across fewer than four weekdays;
- three or more occurrences of one subject in one day;
- different consecutive subjects belonging to the same configured department.

Same-subject consecutive periods are not flagged here because they may be an authorised double; double rules are validated separately.

## Output

The report stores:

- PASS or REVIEW;
- score from 0–100;
- learners analysed;
- finding code/title/count;
- up to 12 human-readable examples per finding;
- deterministic method marker and generation time.

It is persisted in `TimetableGenerationJob.qualityReportJson`, shown in Smart Timetable and copied into audit metadata. These are advisory quality findings, not hidden timetable changes.

## Why department is used

NEYO does not guess semantic similarity. Two different consecutive subjects are considered similar only when the school mapped them to the same real Department. A future explicit similarity matrix can refine this without AI.

## Download and infrastructure cost

Phase A–F does not automatically generate or download PDFs. Printing remains user-triggered and streamed on demand.

### Data size

A personal proof is JSON, normally tens of timetable rows—not an image/video/PDF. Approximate order of magnitude is a few kilobytes per learner. Exact size depends on names/venues and must be measured in production.

### Controls implemented

1. Proof list endpoint returns lightweight summaries only.
2. Full timetable JSON is fetched only for the learner selected by the user.
3. Detailed proof rows are retained for the latest three generation jobs.
4. Older jobs retain counts, quality score, reservation summary and audit metadata while bulky per-learner rows are pruned.
5. PDFs are generated only when a user requests print/download.
6. No AI/provider/per-use API fee exists.
7. No sound/media/object-storage upload is created by timetable generation.

### Remaining ordinary costs

- PostgreSQL rows/storage;
- API/database reads;
- server compute during deterministic generation;
- bandwidth when a user opens detailed proof or prints;
- deployment/database backup storage.

These are normal infrastructure costs, not a separate vendor charge. At scale NEYO should monitor average proof bytes, generation frequency, query time and retained rows before changing the three-generation retention policy.

## Migration

`20260721020000_senior_phase_f_quality_report`

## Boundary

Phase F supplies evidence to the timetable committee. Phase G should implement formal committee review, return-for-correction, Head approval, publish and supersede states.
