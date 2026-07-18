# NEYO Bible — Level 06: School Operations Playbook

*Created 2026-07-18 from the current application routes, permission matrix, and service functions.
This level explains how real work moves between school roles. It does not replace feature-specific
instructions or `docs/FEATURES-CHECKLIST.md`.*

## 1. Operating model: one record, many responsible roles

NEYO is organized around hand-offs rather than isolated screens. A teacher records attendance; a
parent receives the resulting notification. Reception records a payment; Finance sees it in the
same ledger. Hostel staff invoice boarders through the ordinary student invoice system; parents pay
through the same portal and M-Pesa path as tuition. This prevents each department from keeping a
separate version of the same student, balance, or event.

Three rules govern every hand-off:

1. **The originating role owns accurate entry.** A teacher must not report a lesson as delivered
   when it was not taught; a receptionist must not invent an M-Pesa reference; a librarian must
   return the exact issued copy.
2. **The service layer owns downstream effects.** Notifications, invoice status, audit records,
   fine calculations, and row scoping belong in `src/lib/services/`, not in a browser-only button.
3. **The receiving role reads the same underlying record.** Parents, bursars, teachers, and school
   leaders see permission-filtered views of shared data, not copied spreadsheets.

The canonical permission strings are in `src/lib/core/permissions.ts`. UI visibility is helpful but
never the security boundary; API routes and services enforce access again on the server.

---

## 2. Principal, School Owner, and Deputy Principal

### Primary responsibility

Leadership configures the school, approves sensitive actions, monitors exceptions, and makes the
final decision where an operational engine only recommends. Leadership is not expected to re-enter
every teacher, bursar, or receptionist transaction.

### Start-of-day workflow

1. Open `/dashboard` for role-specific school status.
2. Review `/owner` when holding `owner.dashboard`: enrollment, fee collection, outstanding aging,
   staff cost, expenses, and academic trend indicators.
3. Review urgent attendance, health, discipline, security, and payment exceptions from the
   notification bell and relevant operational module.
4. Use read-only diagnostic/view-as tools when checking what another staff member can see; do not
   share staff credentials.

### Approval responsibilities

- Release or reject exam results after teachers finish marks entry (`requestExamRelease()` and
  `decideExamRelease()` in `src/lib/services/exam.service.ts`).
- Approve high-value expenses and purchase orders when they cross configured thresholds.
- Decide sensitive boarding, gate, discipline, or staffing actions where the workflow requires
  leadership.
- Configure fee structures, timetable rules, class capacity, modules, branding, security, and
  billing through the appropriate Settings or operational page.

### Term opening

1. Confirm school profile, academic term, levels, classes, streams, and class teachers.
2. Import or update students and staff before generating downstream schedules.
3. Confirm subject-teacher-class requirements and elective choices.
4. Preview the timetable before generating; resolve honest unplaced loads rather than hiding them.
5. Publish only after checking teacher, room, lab, lunch, and elective constraints.
6. Confirm fee structures and batch invoicing for the correct year/term.

### Term closing

1. Ensure attendance, marks, CBC observations, and Record of Work are complete.
2. Approve result release only after exception review.
3. Review fee aging and promises before sending final reminders.
4. Run promotion/graduation previews; commit only after verifying destination classes and capacity.
5. Preserve the generated audit/history records rather than deleting evidence to “start clean.”

### Escalation boundary

A school leader cannot change NEYO company pricing formulas, platform-wide release controls, or
another school's data. Those belong to NEYO company roles and `/founder`.

**Grounded sources:** `src/app/(app)/owner/page.tsx`, `src/app/(app)/settings/`,
`src/lib/services/owner-dashboard.service.ts`, `src/lib/services/exam.service.ts`,
`src/lib/core/permissions.ts`.

---

## 3. Teacher and Class Teacher

### Primary responsibility

Teachers maintain the academic truth for classes and subjects they genuinely teach. Access is
computed from real links—not merely a role label—including class-teacher assignment,
`ClassSubjectNeed`, combination groups, and timetable slots.

### Daily teaching loop

1. Open `/teacher` (“My Classes”) to see allocated classes and the personal timetable.
2. Before or at the lesson, open `/attendance` and mark the class register P/A/L/E.
3. If permitted by school policy, request absentee notifications when saving the register.
4. Teach from the current lesson plan and update the lesson's real status after delivery.
5. Record syllabus/Record of Work progress against the real strand or topic.
6. Assign homework or upload class notes from `/teacher`.
7. Enter marks through `/exams` for owned classes/subjects, or record CBC observations through
   `/cbc`.
8. Review the per-class report for missing attendance, weak results, or unsubmitted work.

### Attendance hand-off

`markRegister()` in `src/lib/services/attendance.service.ts` performs idempotent upserts against
`AttendanceRecord`; replaying an offline action does not create duplicate rows. When absence SMS is
requested, the service selects the primary guardian, checks quota, records usage, and stamps the
notification so re-saving does not send a duplicate for the same day.

### Academic-record hand-off

- `saveMarks()` writes only allowed students in the requested class and subject.
- Exam release is a separate leadership workflow; marks entry does not automatically publish
  results to families.
- CBC assessment or delivered lesson-plan evidence can update syllabus coverage. Leadership's
  coverage report distinguishes verified evidence from `SELF_REPORTED_ONLY` claims.
- Homework and notes written through `teacher-portal.service.ts` appear in the shared family portal
  without a second manual publication copy.

### Teacher boundaries

- A teacher must not see unrelated classes simply by changing a URL or request id.
- Teachers cannot publish private counseling notes, make company-level changes, or approve their
  own leadership-gated actions.
- A newly assigned subject teacher inherits access to the existing class records; allocation does
  not create a fresh student history.

### When something is wrong

- **Missing class:** check class-teacher, subject-need, combination-group, or timetable assignment;
  do not create a duplicate class as a workaround.
- **Cannot enter marks:** confirm the exam includes the subject and the teacher has a genuine class
  link.
- **Timetable clash:** report the real constraint to academics leadership; do not manually maintain
  a private timetable outside the published version.
- **Uncertain scanned mark:** correct it in the review grid before applying the transaction.

**Grounded sources:** `src/app/(app)/teacher/page.tsx`, `src/app/(app)/attendance/page.tsx`,
`src/app/(app)/exams/page.tsx`, `src/lib/services/teacher-portal.service.ts`,
`src/lib/services/attendance.service.ts`, `src/lib/services/exam.service.ts`,
`src/lib/services/student.service.ts` (`teacherOwnedClassIds()`/`scopeWhere()`).

---

## 4. Bursar and Accountant

### Primary responsibility

Finance owns fee configuration, invoice accuracy, payment allocation, discounts/waivers,
reconciliation, arrears follow-up, and financial evidence. It does not own academic marks or
student-health decisions.

### Invoice workflow

1. Configure a fee structure by level/class, year, term, and item in `/finance`.
2. Preview the target cohort before batch invoicing.
3. Run `batchInvoice()` once; the service is idempotent and skips an already-invoiced student for
   the same structure.
4. Use `createManualInvoice()` only for a legitimate student-specific charge.
5. Chargeable modules—hostel, transport, library fines, uniforms, damages, activities—must post to
   this same invoice ledger.

### Payment workflow

- **M-Pesa STK:** `stkForInvoice()` creates a linked payment request. The provider callback reaches
  `onPaymentPaid()`, which applies a successful payment to the invoice and triggers the receipt
  workflow.
- **Cash/manual:** `applyPaymentToInvoice()` updates the ledger with permission and biometric
  safeguards where configured.
- **Reception payment:** the front desk records through its own permitted workflow, but Finance
  receives the same payment record and invoice impact.
- **Suspense item:** investigate the real phone/reference/student evidence and confirm allocation;
  never force a low-confidence match silently.

### Daily controls

1. Review new payments and unresolved M-Pesa suspense entries.
2. Reconcile provider status and invoice balances.
3. Check aging buckets through `arrearsAging()`.
4. Review promises to pay before sending another reminder.
5. Confirm that discounts have a reason and that approval requirements were met.
6. Print or reprint invoices through `buildInvoicePdf()`; print counts and audit evidence must stay
   intact.

### Period controls

- Confirm every fee structure targets the intended term and level.
- Review collection against billed totals, not against manually maintained estimates.
- Run reminders through configured grace and dedupe settings.
- Export reports from the real ledger rather than editing downloaded totals and treating them as
  the new source of truth.

### Finance boundaries

Finance may see school financial data according to `finance.view`, `finance.record_payment`, and
`finance.manage_structure`. It must not widen parent/student row scope or use a deleted/hidden
invoice to conceal a payment discrepancy.

**Grounded sources:** `src/app/(app)/finance/page.tsx`, `src/app/(app)/finance/payments/page.tsx`,
`src/lib/services/finance.service.ts`, `src/lib/services/payment.service.ts`,
`src/lib/core/permissions.ts`.

---

## 5. Receptionist / Front Office

### Primary responsibility

Reception is the school's fast operational intake desk: visitors, inquiries, calls, student lookup,
walk-in payments, lost-and-found, and end-of-day reporting.

### Visitor workflow

1. Search before creating a duplicate person or student link.
2. Capture visitor name, phone, ID, purpose, and host through `/reception`.
3. `signInVisitor()` assigns the real badge and timestamp.
4. Print the badge where needed.
5. `signOutVisitor()` closes the visit; do not delete the row when someone leaves.

### Admission inquiry workflow

1. Capture parent, prospective student, phone, desired grade/curriculum, and notes.
2. The inquiry enters the Admissions workflow rather than becoming an enrolled student immediately.
3. Admissions staff convert and progress it through review/interview/offer/admit.
4. Student and guardian records are created only at the legitimate admission step.

### Payment-at-desk workflow

1. Search the student and retrieve real open invoices through `/api/reception/fees`.
2. For STK, use the payer's real phone and the selected invoice balance.
3. For walk-in cash/manual M-Pesa, record the real method and reference.
4. Never invent an M-Pesa reference to make the desk balance.
5. Give the family the generated receipt; Finance sees the same underlying payment.

### Phone-message workflow

`relayPhoneMessage()` records the caller and message, then opens/reuses the real conversation path
for the intended staff recipient. Reception does not need the recipient's password or private
account access.

### Day-end close

Use `dayEndSummary()` to review visitors, on-site visitors, inquiries, relayed calls, and payments.
Resolve obvious omissions (for example, a visitor still marked on-site) by completing the real
record, not deleting it.

**Grounded sources:** `src/app/(app)/reception/page.tsx`, `src/lib/services/reception.service.ts`,
`src/app/api/reception/`, `src/lib/core/permissions.ts` (`reception.operate`).

---

## 6. Parent and Student — the shared family portal

### Primary responsibility

Families consume published school records, make authorized payments and requests, submit work, and
communicate with the school. They do not edit the school's source academic or financial records.

### Portal workflow

1. Sign in and open `/portal`.
2. Parent accounts see linked children; student accounts see only their own linked student record.
3. Open a child to view attendance, published results, invoices, timetable, homework, notes,
   library/health information, and other enabled modules.
4. Pay an owned invoice through `parentStk()`.
5. Submit homework, subject selections, PTA bookings, pickup authorizations, promise-to-pay, or
   transport requests through their dedicated workflows.
6. Use Messages/Class Chat for school communication rather than sharing staff credentials or
   sending records to an unrelated account.

### Privacy boundary

`myChildren()` and `childDetail()` in `parent-portal.service.ts` use server-side ownership checks.
Supplying another student's id must not reveal that student's details. The same rule applies to
invoice payment, health, reading history, pickup people, and downloadable reports.

### Publication boundary

Families see published exam results. A teacher's draft marks or an exam awaiting leadership release
must remain unavailable. Payment status comes from the real invoice/payment ledger; a screenshot or
SMS alone does not override it.

**Grounded sources:** `src/app/(app)/portal/page.tsx`, `src/lib/services/parent-portal.service.ts`,
`src/app/api/portal/`, `src/lib/core/permissions.ts` (`portal.parent`).

---

## 7. Librarian

### Primary responsibility

The librarian owns catalogue accuracy, physical-copy identity, issue/return state, and fine
follow-up.

### Issue/return workflow

1. Search or scan ISBN/copy code in `/library`.
2. Confirm the exact student and that a copy is available.
3. `issueBook()` enforces availability, due date, duplicate/open-loan limits, and copy state.
4. On return, use `returnBook()` so the copy is released and the fine is frozen correctly.
5. Mark a fine paid only when payment evidence exists, or use `billFineToInvoice()` to move it to
   the student's ordinary invoice ledger.

### Calculation rule

The current service exports `FINE_PER_DAY_KES = 10` and `MAX_OPEN_ISSUES = 3`; the actual policy may
also be school-configurable through `libraryPolicy()`/`setLibraryPolicy()`. `overdueDays()` excludes
Sundays. Operational staff must use the calculated value rather than a private spreadsheet formula.

### Exception handling

Lost, damaged, retired, and available are real copy statuses. Do not “return” a lost copy merely to
make availability look correct. Use the status workflow and invoice any legitimate charge through
the common student ledger.

**Grounded sources:** `src/app/(app)/library/page.tsx`, `src/lib/services/library.service.ts`,
`src/app/api/library/`, `src/lib/core/permissions.ts` (`library.view`, `library.manage`).

---

## 8. Hostel Master

### Primary responsibility

Hostel staff own dorm/room/bed truth, nightly curfew, boarding incidents, and the operational
boarding roster.

### Allocation workflow

1. Confirm hostel gender/type and room capacities.
2. Allocate through `allocateBed()`; it enforces student gender rules, one active bed per student,
   room capacity, and occupied-bed conflicts.
3. Release through `releaseBed()` when a student leaves; do not overwrite another allocation.
4. Use `autoAllocateHostelBeds()` only after checking the resulting real assignments.

### Nightly curfew workflow

1. Open the relevant hostel/date through `/hostel`.
2. Load `curfewSheet()`—the real active boarder roster.
3. Mark each student IN, OUT, or LEAVE with an honest note where needed.
4. `markCurfew()` upserts the register and sends an urgent guardian notification only for a newly
   marked missing/out state, preventing duplicate alerts on re-save.
5. Escalate unexplained absence under the school's security/emergency procedure.

### Billing and visitor hand-offs

`invoiceBoarders()` creates ordinary student invoices and is idempotent for the same hostel/term
charge. `boarderVisitors()` reads linked reception visitor records. Hostel staff should not keep a
second fee balance or a separate visitor identity list.

**Grounded sources:** `src/app/(app)/hostel/page.tsx`, `src/lib/services/hostel.service.ts`,
`src/app/api/hostel/`, `src/lib/core/permissions.ts` (`hostel.view`, `hostel.manage`).

---

## 9. Clinic / Authorized Support Staff

### Primary responsibility

Clinic users maintain medical profiles, visit records, allergy warnings, active medication plans,
and dose evidence. Confidential health access must remain narrower than ordinary student access.

### Visit workflow

1. Search the student and review `medicalFile()` before administering treatment.
2. Check allergy warnings and chronic conditions.
3. Record complaint, treatment, medication, referral, and notes through `recordVisit()`.
4. A referral may notify the guardian through the service workflow.
5. Do not place confidential medical details into general class chat or unrestricted notes.

### Medication workflow

1. Start a real medication plan with schedule/instructions through `startMedication()`.
2. Record each administered dose through `giveDose()`; this preserves who gave it and when.
3. Use `stopMedication()` to close a plan rather than deleting its history.
4. A medication matching a recorded allergy must be blocked and escalated for clinical review.

### Reporting

`healthReport()` supports school-level trends; `childHealth()` provides a family-safe, row-scoped
view. The family view is not automatically the entire confidential staff medical file.

**Grounded sources:** `src/app/(app)/clinic/page.tsx`, `src/lib/services/clinic.service.ts`,
`src/app/api/clinic/`.

---

## 10. Cross-role hand-off matrix

| Event | Originating role | System record/action | Receiving role or next step |
|---|---|---|---|
| Student absent | Teacher | `AttendanceRecord`; optional deduped guardian notification | Parent; leadership attendance insight |
| Homework assigned | Teacher | `Homework` through teacher portal service | Parent/student shared portal |
| Marks completed | Teacher | `ExamResult` through `saveMarks()` | Leadership release decision, then family |
| Fee structure approved | Leadership/Finance | `FeeStructure` + batch invoices | Bursar collection; parent portal |
| STK paid | Parent/Reception | linked `Payment` callback | Invoice ledger, receipt, Finance reconciliation |
| Library fine billed | Librarian | invoice line through `billFineToInvoice()` | Finance and parent portal |
| Boarder invoiced | Hostel Master | invoice through `invoiceBoarders()` | Finance and parent portal |
| Visitor arrives | Reception | `VisitorLog` sign-in and badge | Host/security; reception sign-out |
| Prospective family enquires | Reception | `AdmissionInquiry` | Admissions review pipeline |
| Student referred medically | Clinic | `ClinicVisit` referral + notification | Guardian and school follow-up |
| Exam release requested | Teacher/Academics | release approval record | Leadership approve/reject |
| Timetable cannot place a load | Academics engine | honest unplaced result | Leadership adjusts real constraints |

---

## 11. School-wide exception protocol

When a workflow fails, use this order:

1. **Read the exact error.** A forbidden, not-found, conflict, quota, or validation error means
   different things; do not flatten them into “the system is broken.”
2. **Confirm identity and scope.** Is the user in the correct school, role, class, child, invoice,
   or module?
3. **Confirm prerequisite records.** Examples: exam subject mapping, teacher assignment, current
   term, active invoice, available library copy, active hostel allocation.
4. **Retry only idempotent actions safely.** Attendance, batch invoices, callbacks, and several
   generators have explicit replay protection; do not assume every arbitrary mutation does.
5. **Preserve evidence.** Keep reference numbers, timestamps, audit rows, and the exact message.
6. **Escalate through authorized support.** Use NEYO Support/diagnostic replay rather than sharing a
   password or granting a permanent founder impersonation session.
7. **Never repair a production mismatch by deleting history.** Use reversal, cancellation,
   release, return, restore, or reconciliation workflows where provided.

## 12. Maintenance rule for this playbook

When a real workflow changes, update the relevant role section and hand-off matrix in place. Add a
new role section only when the role has a distinct operational responsibility. Feature completion
belongs in `FEATURES-CHECKLIST.md`; durable changes in founder direction belong in Level 05; API
and architecture mechanics belong in Level 02.
