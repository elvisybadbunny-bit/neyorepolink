# Grade 10 CBE timetable and teacher-allocation scale test

Date: 19 July 2026

## Scope

A deterministic, Kenyan-context capacity simulation was run with 600 synthetic learners, 10 Grade 10 streams of 60, 30 named teachers, 17 CBE subject options, 600 confirmed subject selections, 10 pathway/subject combinations, 88 class-subject requirements, five days and eight periods daily. No real learner data or production database was used.

This tests the scale assumptions, selection-to-stream requirements, qualification-aware teacher allocation and conflict-free timetable construction. It is not a substitute for the database-backed NEYO production-engine regression because this Arena checkout has no `.env`, database connection or installed Prisma Client.

## Result

- 600/600 learners had confirmed selections.
- 30 teachers were considered.
- 0 unqualified teacher assignments.
- 322 lessons placed.
- 0 unplaced lessons.
- 0 class double bookings.
- 0 teacher double bookings.
- Maximum same class-subject occurrence in one day: 1.
- Teacher Grade-10 load: minimum 8, maximum 14, average 10.7 periods/week.
- Stream load: 29–33 periods/week, leaving 7–11 periods for additional school-defined learning, pastoral, clubs, prep or free study.

The teacher loads are Grade 10 workload only; they do not imply that the teachers have no Grade 7–9 or Grade 11–12 responsibilities.

## Important design conclusion

Thirty teachers are numerically sufficient for this scenario because the Grade 10 demand is 322 teacher-periods against 1,200 theoretical teacher-periods. Sufficiency still depends on subject qualifications. A school can have 30 teachers and remain infeasible if, for example, only one Physics teacher is assigned more than 40 periods or if time-off/lab constraints remove the required capacity.

The scenario groups learners into streams by ten coherent subject combinations. If a real school mixes several combinations inside every stream, the production timetable must use elective blocks and per-student rosters; ordinary one-subject-per-whole-class rows would be incorrect.

## Re-run

```bash
npm run test:grade10-scale
```

Detailed generated output is written outside Git to:

- `/tmp/neyo-grade10-scale-result.json`
- `/tmp/neyo-grade10-timetable.csv`

## Production-engine test still required

Against an isolated non-production PostgreSQL database, run a second test that creates real Prisma rows, invokes NEYO's actual class allocation, automatic teacher assignment and whole-school timetable services, verifies tenant isolation and constraints, then cleans up. Never run a destructive generator test against a live school tenant.
