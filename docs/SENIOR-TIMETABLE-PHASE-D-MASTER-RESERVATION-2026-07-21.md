# Senior Timetable Phase D — Master Solver block reservation

**Built:** 21 July 2026

## Purpose

Reserve confirmed Senior School structures before ordinary lesson cards:

- Option A × 5;
- Option B × 5;
- Option C × 5;
- Core/Essential Mathematics split × 5 when the level contains STEM and non-STEM learners.

No AI, Bundi, external provider or random choice is used.

## Generation gates

Before the background Master Generator starts:

1. Phase A hard readiness passes.
2. Phase B A/B/C block and learner proof remain current.
3. Phase C teachers/venues/capacities remain valid.
4. Mixed STEM/non-STEM cohort has a confirmed Mathematics split.
5. Mathematics split contains exactly five parallel slots.
6. Each Mathematics slot contains Core and Essential variants.
7. Both variants have different teachers.

## Atomic reservation order

The solver reserves in this order:

1. lunch/non-teaching structures;
2. hard blocked school/level/class slots;
3. Option and Mathematics families;
4. combination groups not owned by Options Blocks;
5. normal class-subject singles/doubles;
6. remaining soft preferences.

Every option slot reserves the same day/period for:

- every member class;
- every parallel subject teacher;
- every pinned/resolved venue.

Ordinary lessons can never overwrite it.

## Weekday spread

For official five-period families, Phase D enforces:

- one occurrence per weekday;
- Monday–Friday only;
- no Saturday spillover;
- deterministic morning/afternoon balancing penalty.

A family cannot be packed five times into Monday merely because Monday has the earliest free periods.

## Morning/afternoon balance

The solver tracks how many placements a family already has in each half of the day. It applies a stable soft penalty when the next candidate would increase the already-heavier half. Hard teacher/class/venue constraints still win.

## Mathematics split

A dedicated server-side gate detects mixed pathway cohorts. It requires the confirmed Mathematics block before generation and checks:

- five slots;
- two subjects/slot;
- Core Mathematics exists;
- Essential Mathematics exists;
- different teachers.

A cohort that needs only one variant does not require the split.

## Duplicate prevention

Options Block subjects remain owned by the atomic block. Their roster Combination Groups and ClassSubjectNeed rows do not create duplicate ordinary cards.

## Failure behaviour

If any required option/Math slot cannot be reserved, the result is not fully solved. NEYO returns a visible warning naming the block and repetition. It never silently drops the period or marks the run complete.

## Output evidence

Generation returns and persists `optionReservationSummary` on the TimetableGenerationJob (migration `20260721010000_senior_phase_d_reservation_summary`) with:

- family label;
- weekdays used;
- morning count;
- afternoon count.

Expected Senior example:

```json
[
  { "family": "Option A", "days": [1,2,3,4,5], "morning": 3, "afternoon": 2 },
  { "family": "Option B", "days": [1,2,3,4,5], "morning": 2, "afternoon": 3 },
  { "family": "Option C", "days": [1,2,3,4,5], "morning": 3, "afternoon": 2 },
  { "family": "Mathematics", "days": [1,2,3,4,5], "morning": 2, "afternoon": 3 }
]
```

## Boundaries

Phase D reserves and places blocks. Phase E must provide a durable personal timetable proof for every learner using their Mathematics variant and A/B/C assignment. Committee and Head approval remain mandatory.
