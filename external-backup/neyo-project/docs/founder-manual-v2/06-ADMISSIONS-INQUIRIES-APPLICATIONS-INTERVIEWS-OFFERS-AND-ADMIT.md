# NEYO Founder Manual V2 — Module 06: Admissions

**Pages:** `/admissions`, public `/apply`  
**Last verified against code:** 2026-07-18  
**Workflow:** inquiry/application → review → interview → offer/deposit → admit → Student.

---

## 1. What Admissions does

Admissions manages prospective learners before they become Students. It preserves source, stage,
guardian contact, interview, offer/deposit and decision history. Only **Admit** creates the real
Student/Guardian/requirements record.

Do not manually register an applicant as Student before completing the required admission workflow
unless it is a deliberate walk-in direct-registration policy.

---

## 2. Access

`/admissions` requires `student.create`. Leadership/registrar/front-office roles with that permission
can operate; teachers/parents/students cannot. Public `/apply` accepts a school-resolved application
without staff login and is rate-limited.

Every staff action is tenant-scoped and state-transition validated.

---

## 3. Sources

Applications identify source such as:

- online public form;
- walk-in staff application;
- converted Reception inquiry.

Source helps measure intake but does not change safeguarding/approval requirements.

---

## 4. Page top actions

Header summary: total applications and admitted count.

- **Entrance Exam Paper Vault:** opens class-based exam-paper storage/print.
- **New application:** opens walk-in form.

A New Reception inquiry banner appears for inquiry rows with status NEW. Each has **Start
application**, converting inquiry to application and marking inquiry contacted/processed according to
service.

If loading fails, press **Retry**. Empty state offers New application.

---

## 5. Pipeline columns

Current Kanban stages include:

- Applied
- Review
- Interview
- Offer
- Waitlisted

Closed statuses (Admitted, Rejected, Withdrawn) appear in a separate closed strip. Click any card or
closed pill to open its drawer.

Moving is done by stage buttons, not drag-and-drop. The service transition map blocks invalid jumps.

---

## 6. Public online application

On school domain open `/apply`.

The form collects applicant and guardian details required by `apply-form.tsx`/validation, including
learner name, gender/date details, grade wanted and guardian name/phone/email where shown. Submit:

1. resolves school from host/dev tenant override;
2. normalizes Kenyan guardian phone;
3. rate-limits public request;
4. blocks duplicate open application for same learner/contact;
5. creates application number;
6. shows success/application reference.

Applicant does not receive staff Dashboard access. Staff sees new Applied card.

---

## 7. Walk-in New Application

Press **New application**.

Fill required learner first/last name, gender/date where present, grade wanted, guardian name and
phone plus optional email/notes/source fields displayed. Button creates application through
`/api/admissions`.

The button stays disabled until required name/grade/guardian/phone fields exist. Close X/backdrop
cancels unsaved input.

Expected: card appears in Applied with generated reference.

---

## 8. Converting Reception inquiry

Reception captures parent name, phone, learner/grade/curriculum notes. Admissions banner shows it.
Press **Start application**:

- service creates AdmissionApplication linked to inquiry;
- inquiry changes from NEW to contacted state;
- placeholder applicant details must be reviewed/corrected before offer/admit.

Conversion is not admission and should not silently guess gender/birth data.

---

## 9. Application drawer

Click card. Header shows name/application number and close X. Details show grade, guardian phone,
source and current status. Actions change by stage.

### Applied → Start review

Button **Start review** sends action `review`. Expected toast “Moved to review,” card moves column.
Use review to verify names, age/grade, contacts, documents and available capacity.

### Schedule interview

Available from Applied/Review/Waitlisted according to UI.

Fields:

- Interview date
- Interview time

Button **Schedule interview** sends `schedule_interview`. Service creates/links a real Calendar event.
Expected toast says interview scheduled/added to school calendar; stage becomes Interview.

Changing interview requires the supported update/transition; do not create unrelated Calendar event
and leave application date stale.

### Make offer

From Review/Interview/Waitlisted.

Field: deposit required KES (0 allowed). Button **Make offer** sends `offer`. Stage Offer; offer letter
available. Deposit requirement is frozen on application until updated through real action.

### Record deposit

On Offer:

- Amount KES
- Reference
- **Record deposit**

This records admission deposit evidence/progress. It is not the same as ordinary Student invoice
payment because Student may not exist yet. Use real reference; do not fabricate M-Pesa proof.

### Admit

On Offer select optional destination class and press **Admit**. Disabled until required deposit is
met.

Service:

- rechecks stage/deposit;
- creates Student via normal student service;
- generates admission number;
- creates/reuses primary Guardian;
- copies joining requirements;
- links selected class;
- links application/student;
- marks inquiry enrolled if relevant;
- returns admitted state/profile link.

Expected toast: admitted/student record created. Never press twice; state/unique guards prevent
re-admission.

---

## 10. Letters and profile

Offer/Admitted stages show **Download offer/admission letter**. GET `/api/admissions/[id]/letter`
generates branded, QR-verifiable PDF using School Profile, deposit/requirements and applicant status.

Admitted shows **Open student profile**. This is the new source record for attendance, fees, exams,
etc. Corrections after admit belong Student/Profile, while application remains admission history.

---

## 11. Waitlist, Reject and Withdrawn

For open application:

- **Waitlist:** keeps prospect active without offer; can later re-enter review/interview/offer.
- **Reject:** closes rejected.
- **Withdrawn:** closes because applicant withdrew.

Confirm school policy/reason; current quick buttons may not collect a decision note in UI even though
service fields support decision notes in broader model. Do not use Reject for incomplete info when
Review/Waitlist is appropriate.

Closed status should not be deleted to improve admission statistics.

---

## 12. Entrance Exam Paper Vault

Press top button. Modal lists real classes and any saved entrance exam paper.

Per class you can:

- view/download existing uploaded paper;
- **Print** through `/api/admissions/entrance-exams/[id]/print` where record exists;
- open Upload/Replace area;
- enter title;
- enter hardcopy location;
- upload file through storage;
- cancel upload editor.

The vault stores paper/template, not candidate score. Protect copyrighted exam content and do not
upload learner answer sheets as a generic paper.

---

## 13. State machine reference

Typical valid path:

`APPLIED → REVIEW → INTERVIEW → OFFER → ADMITTED`

Alternatives:

- Review/Interview → WAITLISTED → review/interview/offer
- open stages → REJECTED
- open stages → WITHDRAWN

Deposit record only on Offer. Admit only on Offer and deposit condition. Invalid transitions return
422 rather than silently rewriting history.

---

## 14. Full example

1. Wanjiru applies publicly for Baraka, Grade 4.
2. Staff sees Applied, opens drawer, verifies contact and starts Review.
3. Enter interview date/time → Schedule; Calendar event appears.
4. After interview, deposit required KES 5,000 → Make offer.
5. Download offer letter and send through approved channel.
6. Family pays; staff records real amount/reference.
7. Deposit met; select Grade 4 Blue → Admit.
8. Open Student profile; confirm guardian, admission number, class and joining requirements.
9. Finance creates normal fee invoice in its own workflow.

---

## 15. Connections

| Admission event | Connected module |
|---|---|
| inquiry | Reception |
| interview | Calendar |
| entrance paper | Files/Documents |
| offer/admission letter | Document verification/School Profile |
| admit | Students/Guardians/Classes |
| joining requirements | School Profile → Student |
| later fees | Finance (after Student exists) |
| parent login | Portal/Authentication |

---

## 16. What Admissions does not automatically do

- It does not guarantee class capacity/timetable teacher.
- It does not create full term invoice unless separate downstream workflow does.
- It does not assign elective subjects/pathway unless imported/selected separately.
- It does not mark entrance exam results merely from an uploaded paper.
- It does not notify every channel unless configured workflow does.
- It does not validate birth certificates/NEMIS externally without real integration.

---

## 17. Troubleshooting

| Problem | Check |
|---|---|
| Admissions missing | need `student.create` |
| Public form wrong school | domain/tenant resolution |
| Duplicate blocked | existing open application same learner/contact |
| Inquiry not shown | only NEW inquiries, correct tenant/status |
| Interview not Calendar | action failed/date invalid/calendar permission/service |
| Admit disabled | deposit required not met |
| Deposit entered but still blocked | amount/reference/save response/cumulative paid |
| Student not created | stage must Offer, class valid, uniqueness/service error |
| Letter unavailable | only Offer/Admitted; profile/requirements data |
| Wrong class | correct Student profile/class after admit with audit |
| Entrance upload fails | file type/size/storage permission/config |

---

## 18. Founder verification checklist

1. Public application rate/tenant/duplicate behavior.
2. Walk-in required fields/create.
3. Reception inquiry conversion.
4. Applied → Review.
5. Schedule interview creates correct Calendar event.
6. Offer with 0 and positive deposit.
7. Admit blocked before deposit.
8. Record real deposit; admit unlocks.
9. Admit creates exactly one Student/Guardian/requirements/class link.
10. Parent contact normalized +254.
11. Offer/admission PDF branding and QR.
12. Waitlist/re-enter pipeline.
13. Reject/Withdraw close without deleting.
14. Entrance paper upload/download/print tenant scope.
15. Teacher/parent direct staff route blocked.
16. Cross-tenant application/id blocked.
17. Mobile/glass/loading/empty/error/populated states.

---

## 19. Manual completeness correction

Module 05 has now been expanded with both real Bundi import flows and every New Year tab/button. The
manual series will continue this stricter standard: each chapter must enumerate all visible tabs and
actions, not only summarize the largest workflow.

---

## 20. Edit points

- Admissions page/client: `src/app/(app)/admissions/page.tsx`,
  `src/components/admissions/admissions-client.tsx`
- Public form: `src/components/admissions/apply-form.tsx`, `/api/admissions/apply`
- API/service/validation: `src/app/api/admissions/`, `admission.service.ts`, `admission.ts`
- Entrance vault: client section + `/api/admissions/entrance-exams/`, `entrance-exam.service.ts`
- Letters: admissions letter document/service route
