# Senior Timetable Phase A — Readiness Gate

**Built:** 20 July 2026  
**Location:** Academics → Smart Timetable → Senior School Phase A

## Purpose

Prevent NEYO from attempting Senior School elective option-block generation with incomplete or invalid inputs. It is deterministic and uses database rules only. It has no Bundi, language model or external provider call.

## Hard blockers

- no active class for selected Senior level;
- no active learners;
- no selection cycle;
- active learner without confirmed choices;
- confirmed learner without exactly three distinct electives;
- selected subject missing/archived;
- selected elective with no qualified TeacherSubject link;
- required Core or Essential Mathematics variant missing;
- effective learner week does not total 40;
- class schedule rules missing;
- recognised core/support subject configured with a double lesson.

## Leadership-review warnings

- learner has no allocated pathway;
- fewer than two electives map to allocated pathway (permitted only as a reviewed exception);
- routine differs from 8 × 40 minutes;
- bell routine differs from reviewed 8:00/8:20 and break/lunch pattern;
- Saturday is enabled even though the reviewed standard 40-lesson week is Monday–Friday.

## Important counting rule

NEYO does not add every elective offering to a learner’s weekly total. Parallel electives count as:

- Block A × 5;
- Block B × 5;
- Block C × 5;

Core and Essential Mathematics similarly share five parallel positions when both groups exist. Effective learner total is core/support + one Mathematics variant + 15 elective periods = 40.

## Result

- `NOT READY`: at least one hard blocker. Phase B must not run.
- `READY FOR PHASE B`: hard checks pass; warnings still require human review.

Both the Whole-School generator and background Master generator call this readiness service server-side and refuse to start when a Senior level has blockers. This is not a cosmetic checklist.

This result is not timetable approval. Phase B must create three conflict-safe option blocks. The timetable committee and Head of Institution still review and approve the generated draft.

## API

`GET /api/academics/timetable/senior-readiness?level=Grade%2010`

Requires `academics.view` and tenant-scopes every query.

## Privacy

Affected learner names appear only to authorised school users in expandable findings. The API must never be public.

## Test cases

1. No Grade 10 class → blocker.
2. Learner without confirmed selection → blocker.
3. Two or four electives → blocker.
4. Duplicate elective ID → blocker.
5. Archived/missing subject → blocker.
6. No TeacherSubject link → blocker.
7. STEM learner without Core Mathematics → blocker.
8. Mixed pathways with both Mathematics variants → pass and split notice.
9. Cross-pathway combination → leadership warning, not automatic rejection.
10. Core subject double → blocker.
11. Effective total 39/41 → blocker.
12. 8 × 40 routine → pass.
13. Different bell routine → warning requiring current school confirmation.
14. Saturday enabled → local-rule warning.
15. All hard checks pass → Ready for Phase B.
