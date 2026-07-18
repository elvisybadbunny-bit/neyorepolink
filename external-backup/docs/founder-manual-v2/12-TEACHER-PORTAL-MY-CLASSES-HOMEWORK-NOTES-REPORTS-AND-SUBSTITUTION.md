# NEYO Founder Manual V2 — Module 12: Teacher Portal

**Page:** `/teacher`  
**Last verified against code:** 2026-07-18

---

## 1. How a teacher gets classes

`teacherClassIds()` unions real links:

- SchoolClass.classTeacherId;
- direct ClassSubjectNeed teacher;
- CombinationGroup teacher/member classes;
- TimetableSlot teacher.

Leadership oversight can be unrestricted. A teacher with no real links sees no classes. Fix
assignment—do not promote to leadership.

---

## 2. Access and tabs

Page requires `portal.teacher`; assignment actions require `homework.assign`.

Tabs:

1. Overview
2. Homework
3. Notes
4. Class Report
5. Record of Work (restored in this chapter)
6. Leave & Substitution
7. PTA Booking
8. Cash Payments (only when school policy enables)

Top right **Mwalimu Day-Pack** downloads `/api/teacher/day-one-pack` for the teacher's current work.

---

## 3. Overview — substitute alert

If teacher is confirmed to cover a class today, amber card lists class/subject/day/period/date. This
comes from date-scoped SubstituteAssignment overlay; it does not permanently replace base timetable.

Teacher should confirm schedule/room and report conflict to leadership.

---

## 4. Today's Lessons

Shows today's timetable slots, including substitute overlay. Each item displays period/time, class,
subject and venue where available. Empty means no scheduled lessons today—not automatically absent
from school.

---

## 5. My Class cards

Each real assigned class shows label, student count, subjects taught, today's lessons/open homework
according to payload.

Buttons:

- **Register** → `/attendance`; class scope applies.
- **Marks** → `/exams`; choose exam/class/subject.
- **Roster** → `/students?classId=...`; server scope remains.

These are links, not automatic writes.

---

## 6. My Weekly Timetable

Grid Monday–Friday/periods from `/api/teacher/timetable`, including class/subject and date-aware
substitute overlays. Use published/current timetable. Wrong/missing slot means correct teacher
allocation/timetable source, not private spreadsheet.

---

## 7. Lesson Plans link

Current Portal note sends teacher to **Academics → Lesson Plans**. There, Plan Lesson, status,
resources, observation and coverage work as Module 08. Bundi assist remains optional/release-gated;
manual planning always works.

---

## 8. Homework tab

Top **Assign homework** only with `homework.assign`.

Dialog fields:

- Class (owned)
- Subject
- Title
- Instructions
- Due date
- Optional file upload

**Assign homework** creates Homework; family portal sees immediately. Past due date rejected. Close/X
or Cancel discards.

Rows show title/class/subject/due, teacher, attachment. **Download** opens attachment. Trash removes
only if assigning teacher or leadership; graded submission can lock relevant changes according to LMS
service.

Homework is assignment; student submissions/grading live LMS.

---

## 9. Notes tab

**Upload notes** dialog:

- Class
- Subject
- Title
- Required uploaded file
- Save/Upload

Families download through Portal. Supported file types follow storage policy. Trash removes owned
note under permission; confirm before deletion because linked learners lose access.

---

## 10. Class Report

Select class. Loads `/api/teacher/report`.

Summary tiles:

- Students and boys/girls
- Attendance last 30 days
- Latest exam mean and released/unreleased note
- Whether current teacher is class teacher/curriculum

Table lists learner, admission, attendance %, absences, exam average. Red/amber highlight follow-up.
This is operational summary; open source modules before correcting.

---

## 11. Record of Work — gap fixed

Backend `/api/teacher/record-of-work`, real `TeacherRecordOfWork` service and Academics component
existed, but Teacher Portal had no tab despite its role being the natural user.

Added **Record of Work** tab reusing `RecordOfWorkClientTab` with teacher assignment permission. It
lets teachers list/create/update dated coverage by class/subject/strand as the existing component
provides. It remains separate from Lesson Plan and verified Syllabus report.

---

## 12. Leave & Substitution

`TeacherSubstitutionSuite` covers teacher-side leave/substitution workflow:

- view relevant leave/substitution records;
- apply/record leave according to suite;
- see proposed/confirmed coverage;
- substitute acceptance/status actions exposed by component;
- TPAD/readiness export/features where extension provides.

Core Staff Leave tab remains authoritative for leadership approval. Proposed substitute is not live
until confirmed.

---

## 13. PTA Booking

`PtaBookingSuite forTeacher` uses current authenticated id/name. Teacher creates/lists consultation
slots and sees bookings according to extension UI. Parent books owned child from Portal.

Use real date/time, capacity/status; avoid double-booking with lessons. Parent cannot book as another
guardian because route derives ownership from session.

---

## 14. Cash Payments tab

Only appears when school policy `allowTeacherCashPayments` is true.

Teacher cash is never immediately counted paid.

Press **Record cash received**:

1. Search learner by name/admission.
2. Select learner.
3. Load owned/open invoices.
4. Choose invoice.
5. Enter amount and note.
6. Submit.

Creates `TeacherCashPaymentRequest` Pending. School office confirms/rejects before invoice/payment
ledger changes. Row badges Pending/Confirmed/Rejected and reject reason.

Never record an M-Pesa screenshot as teacher cash; use Finance reconciliation.

---

## 15. Mwalimu Day-Pack

Download combines current teacher operational information provided by endpoint. Treat as temporary
working document; do not leave learner data on shared device/printer. If stale, refresh source records
and download again.

---

## 16. One day example

1. Login → My Classes.
2. Check substitute alert/today timetable.
3. Open Register and mark class.
4. Teach planned lesson; update plan Taught.
5. Record Work covered.
6. Assign homework and upload notes.
7. Enter marks/CBE evidence.
8. Review Class Report/chronic absence.
9. Attend booked PTA slots.
10. If cash policy on, submit real cash to office pending confirmation.

---

## 17. Scope and continuity

When class transfers to new teacher, existing students, attendance, marks, homework, notes and
coverage remain with class/student records. New teacher inherits permitted view; history is not
reset. Teacher departure workflow transfers assignments and regenerates timetable.

---

## 18. Common problems

| Problem | Check |
|---|---|
| My Classes empty | class teacher/need/combination/timetable link |
| Register forbidden | attendance.record and class scope |
| Marks class absent | exam subject mapping and assignment |
| Homework button missing | homework.assign |
| Wrong subject list | school Subjects and teacher/class assignment |
| Note upload fails | type/size/storage/file required |
| Report no exam | no latest exam/marks or scope |
| Record of Work missing | fixed tab; refresh and verify permission |
| Substitute absent | leave approval/proposal/confirmation/date |
| PTA slot conflict | timetable/date/capacity; adjust real slot |
| Cash tab absent | school policy disabled |
| Cash remains pending | expected until office confirms |

---

## 19. Founder verification checklist

1. Teacher with direct need, combination and timetable links sees correct union.
2. Unrelated teacher sees none.
3. Today/weekly timetable and substitute overlay.
4. Register/Marks/Roster links preserve scope.
5. Homework create/file/delete and portal visibility.
6. Notes upload/download/delete and family visibility.
7. Class Report counts/attendance/exam and denied other class.
8. Record of Work tab create/update and syllabus link (fixed).
9. Leave proposal/confirmation/return behavior.
10. PTA teacher/parent booking ownership.
11. Cash policy hidden/shown, pending→office decision.
12. Day-Pack download authorization.
13. Transfer teacher continuity.
14. Cross-tenant direct ids blocked.
15. Mobile/glass/loading/empty/error states.

---

## 20. Gap fixed

Added reachable Record of Work tab to Teacher Portal by reusing the existing real component/service/
route. No schema or duplicate logic. This closes the backend/Academics-only wiring gap for the role
that records work daily.

---

## 21. Edit points

- Page/client: `src/app/(app)/teacher/page.tsx`, `teacher-portal-client.tsx`
- Service/APIs: `teacher-portal.service.ts`, `/api/teacher/*`
- Scope: `teacherClassIds`, `student.service.ts`
- Record of Work: `record-of-work-client-tab.tsx`, teacher route/Kenyan extension service
- Leave/substitute: `teacher-substitution-suite.tsx`, `substitute.service.ts`
- PTA: `pta-booking-suite.tsx`, Portal/teacher APIs
- Cash: teacher cash routes/service and Finance confirmation
