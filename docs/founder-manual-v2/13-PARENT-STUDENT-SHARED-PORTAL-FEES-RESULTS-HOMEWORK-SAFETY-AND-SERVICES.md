# NEYO Founder Manual V2 — Module 13: Parent & Student Shared Portal

**Page:** `/portal`  
**Related:** `/portal/receipts`  
**Last verified against code:** 2026-07-18

---

## 1. Why one shared portal

Founder decision: Parents and Students share `/portal` because many learners share family devices.

- Parent sees only children linked through Guardian/User/StudentGuardian.
- Student sees only own User-linked Student.
- Every child-detail, payment, health, library, pickup and report request rechecks ownership server-
  side; changing URL/id cannot reveal another family.

---

## 2. My Children home

Loads `myChildren()` and shows child cards with photo/name/admission/class, recent attendance, fee
balance and latest published exam/result indicator.

Press a child card to open detail. **Family Split Payment** card can coordinate amounts across linked
children/invoices; it creates a plan, not a settled payment until real transactions are received.

Empty/error/loading states explain missing links. If correct child absent, school must repair
Guardian/User links—do not create a duplicate learner.

---

## 3. Child header

Buttons:

- Back to children
- **Portfolio** → `/portfolio?studentId=`
- **Class group chat** when child has class

Header shows identity/class/admission. Class Chat calls `/api/class-chat`, syncs real members and opens
Messages. Parents cannot open unrelated class.

---

## 4. Fees card

Lists invoices, descriptions, total/paid/discount/balance/status/due date as returned.

Buttons per open balance:

- **Pay**
- **Commit to Pay**

Paid/Cleared rows do not offer duplicate payment action.

### Pay with M-Pesa

Dialog fields:

- Payer phone (can be guardian/authorized payer)
- Amount, default balance

Button **Pay KES X** calls Portal STK. Server verifies invoice belongs to linked child before
`stkForInvoice()`. Success means prompt initiated—not paid. Approve on phone; callback/reconciliation
updates invoice and receipt.

Never enter M-Pesa PIN in NEYO web form.

### Commit to Pay

Dialog records promised date, amount/note fields in current component. Save creates PromiseToPay.
Commitment does not reduce balance. Scheduled job marks kept/broken from real payment evidence.

---

## 5. Receipts

Sidebar Receipts opens `/portal/receipts`, showing family-owned payment receipts/history and download
where wired. A screenshot/SMS is not ledger proof; use settled Payment/reference/receipt.

---

## 6. Results

Only published exams returned. Shows exam, subjects/marks/average/grade as payload. **Report Card**
download calls report route with child id and ownership/publication gate.

Draft/unreleased exam must not appear. Positions are calculated on cohort but portal reveals only own
child records.

---

## 7. Growth Dashboard and competencies

Growth section and `ParentGrowthTab` summarize multi-term/competency/portfolio signals using
parent-friendly wording. `ParentPathwayCard` shows Senior readiness/preferences where applicable;
`ParentPathwayGuideCard` provides paid/guided pathway service where configured.

`StudentCompetencySummaryWrapper` loads approved competency summary. These are guidance, not final
career labels.

---

## 8. Attendance

Last 60 days shows P/A/L/E badges/date/note. Parent cannot edit. Missing day may mean register not
marked, not automatic absence. Contact school for correction; teacher/leadership uses Attendance
historical correction.

---

## 9. Pickup Safety

### Permanent authorized person

Press **Add authorised person**. Enter full name, relationship, Kenyan phone and National ID.
**Authorise/Add** saves linked PickupPerson. Gate staff can verify list. Trash/remove asks confirmation
and deactivates/removes according to service.

### One-time pickup code

Press **One-time pickup code**. Enter picker name, optional phone/relationship, screenshot proof and
valid hours as dialog provides. Save creates short code/expiry. Share code securely with intended
picker and gate.

Active codes show code, expiry, optional Screenshot and **Cancel**. Cancellation prevents further
use. A screenshot alone does not override code/status/ID checks.

---

## 10. Parent Upload Requests

Card allows **Photo** or **Document** selection and encrypted File Upload. Submission creates
StudentApprovalRequest rather than directly replacing official student record. School sees Student
Approvals (Module 05) and approves/rejects.

Use clear current photo or requested document only; do not upload unrelated family documents.

---

## 11. Transport Request

`TransportRequestCard` loads current route/stop and requests route/stop change with reason/details in
its form. Submission remains pending until school transport staff decide. It does not move bus seat
immediately or create charge without school workflow.

---

## 12. Cafeteria and Meal Card

`CafeteriaRequestCard` shows active meal-card state and request flow. Parent requests enrollment/plan;
school approval/issue creates invoice before active card according to cafeteria service. Do not
assume request equals meal entitlement.

---

## 13. Timetable

Displays class timetable Monday–Friday/periods with subject codes. If today's confirmed substitute
exists, note appears. Parent cannot edit. Missing/wrong schedule is corrected by Academics/Teacher
allocation, not portal.

---

## 14. Homework

Each row shows title, teacher, instructions, due/overdue, attachment and submission state.

Buttons:

- **Hand in**: open submission dialog, typed answer and/or file.
- **Re-submit**: available until graded/locked by LMS rules.
- Attachment link: download teacher material.

After grade, displays percentage and feedback; re-submit is blocked. Late flag is computed after due
date.

---

## 15. Class Notes

Teacher-shared notes show title/subject/file. **Download** serves authorized file. Do not forward
copyrighted/private class material outside school policy.

---

## 16. Uniform Orders

`UniformCard` lists real uniform inventory, sizes and order/payment status.

- Select item and available size; sold-out disabled.
- Choose quantity/details.
- Place order → invoice first under founder rule.
- Supplier notification/status follows workflow.
- Delivered reduces exact size and master stock.

Order is not paid until invoice settles.

---

## 17. Library Card

Shows borrowed/overdue/returned history and fines. Staff issues/returns in Library; parent reads own
child. A billed fine appears on ordinary invoice and can be paid via portal. Class Chat button may
also be provided by library-card component.

---

## 18. Health information

Family-safe child health view can show blood group, allergies and permitted visit/referral/medication
information. It is not the entire confidential clinic/counseling file. Other family blocked.

---

## 19. Talk to School

Contacts resolved for Class Teacher, Principal and Deputy. Press message button to open/direct/create
conversation through Messaging. It does not expose private phone/password. Use urgent emergency
channels where appropriate; chat is not emergency service.

---

## 20. PTA Booking

`PtaBookingSuite` parent mode loads available teacher consultation slots. Choose owned child and
available slot → Book. Server derives real Guardian/student ownership and prevents another child.
Booked/closed/full state changes availability. Cancel/reschedule according to suite controls.

---

## 21. Master School Diary

`MasterDiarySuite` displays school diary/calendar events, categories, reminders and parent RSVP where
available. RSVP may feed catering/headcount forecasts. It does not alter ordinary Calendar unless
service links them.

---

## 22. Alumni Campaign

`AlumniCampaignSuite` shows campaigns/pledges/mentorship features according to role/release. Current
parent/student portal placement may be broad; only eligible alumni actions should be used. Pledge is
not payment until M-Pesa settlement.

---

## 23. Subject Selection and Pathways

Portal subject-selection routes allow eligible learner/family choices during open portal, with draft/
confirmed/finalized rules. Choices feed Senior pathway/elective allocation only after confirmation.
Pathway guide/readiness uses current assessments/preferences and must not guarantee placement/career.

---

## 24. LMS cards

Beyond Homework, shared portal LMS provides:

- published Quizzes → Take Quiz → submit → server self-mark → review;
- Class Discussions → new thread/reply, teacher lock;
- assignment submission/feedback;
- class-scoped access.

Correct answers are not sent before attempt. One-attempt/due rules apply.

---

## 25. Full parent example

1. Parent switches to Karibu High account.
2. Opens Achieng.
3. Reviews attendance and published CAT report.
4. Opens invoice, Pay KES 5,000, approves M-Pesa phone prompt.
5. Waits for callback/receipt; balance updates.
6. Downloads class notes; hands in homework.
7. Adds authorized aunt and creates one-time pickup for another day.
8. Requests transport stop change and meal card.
9. Books PTA slot and messages class teacher.
10. Reviews library fine and portfolio—only linked child data appears.

---

## 26. Common errors

| Problem | Check |
|---|---|
| Child missing | Guardian.userId and StudentGuardian link |
| Another child blocked | expected row scope |
| Pay prompt absent | phone, provider, invoice ownership/status/network |
| Balance unchanged | STK initiated but callback/reconciliation pending |
| Report missing | exam unpublished/no marks/link |
| Homework resubmit blocked | already graded/closed |
| Pickup code rejected | expired/cancelled/wrong tenant/code |
| Transport request not applied | pending school approval |
| Meal card not active | request/approval/invoice workflow |
| Chat forbidden | child class/membership sync |
| Video/quiz missing | published/release/class scope |
| Parent upload not changed | awaiting Student Approval |

---

## 27. Founder verification checklist

1. Parent sees exactly linked children; Student sees self.
2. Multi-school parent switch no data merge/leak.
3. Invoice STK ownership and callback/receipt.
4. Promise does not reduce balance before payment.
5. Published result/report only; other child blocked.
6. Attendance read-only.
7. Permanent/one-time pickup add/cancel/gate visibility.
8. Parent Photo/Document → pending approval → school approve/reject.
9. Transport/meal requests pending and downstream action.
10. Timetable/substitute display.
11. Homework submit/resubmit/grade lock; notes download.
12. Uniform invoice/size stock; library history/fine invoice.
13. Family-safe health only.
14. PTA booking ownership.
15. Class Chat membership sync and unrelated class forbidden.
16. Subject selection/pathway confirmation.
17. LMS quiz hides answer and discussion locks.
18. Mobile 360px, shared-device logout/cache safety.

---

## 28. Gap review

No orphaned parent-portal component was found in this pass: Portfolio, Class Chat, Growth, Pathway,
Uploads, Pickup, Transport, Cafeteria, Timetable, Homework, Notes, Uniform, Library, Talk to School,
PTA, Diary and Alumni Campaign are rendered. Future product review should decide whether Alumni
Campaign belongs on every current-family child page, but it is not technically unwired.

---

## 29. Edit points

- Portal page/client: `src/app/(app)/portal/page.tsx`, `parent-portal-client.tsx`
- Service/API: `parent-portal.service.ts`, `/api/portal/*`
- Payments/promises: Portal STK and promise services
- Pickup: Portal pickup APIs/components
- Homework/LMS: `lms-cards.tsx`, portal LMS API
- Library/Uniform/Transport/Cafeteria/Pathway cards
- PTA/Diary/Alumni extension suites
