# NEYO Bible — Level 03: Product Surface Map

*Last verified against the real codebase: 2026-07-18. The 42 top-level app modules and their real
page-guard permission strings below were confirmed directly against `src/app/(app)/` and the
`requirePagePermission(...)` calls inside each module's real `page.tsx`.*

Every one of these 42 real modules lives at `src/app/(app)/<module>/` and is gated by a real
permission string (`requirePagePermission("<permission>")`) or role check
(`requirePageUser`/`requireRole`) — a user who lacks the permission is redirected, never shown a
broken page. Grouped below by real function, not alphabetically, so the shape of the product is
visible at a glance.

## 1. Core school operations
- **`dashboard`** — the real landing page after login; summary cards vary by role.
- **`students`** — student records, admission numbers, transfers, alumni.
- **`admissions`** — application intake, entrance-exam paper vault, interview scheduling.
- **`classes`** — class/stream structure, class-teacher assignment.
- **`attendance`** — daily student + staff attendance, GPS clock-in for staff.
- **`staff`** — HR profile, job postings, applicants.
- **`payroll`** — statutory payroll runs (PAYE, NSSF, NHIF/SHA, TSC deductions).

## 2. Academics & curriculum (the largest, most complex module family)
- **`academics`** — the umbrella module: timetable generation (real solver engine), syllabus
  coverage tracking, duty rosters, exam auto-generator, Record of Work.
- **`cbc`** — CBC/CBE-specific tooling: strands/sub-strands, YouTube Learning Library, Question
  Bank, Universal CBC Presets, Bundi OCR scan surfaces (mark sheets, exam papers, quizzes).
- **`competencies`** — the 7 Universal Core KICD Competencies and star-rating tracking.
- **`portfolio`** — CBC/CBE digital portfolio, PDF project-album export.
- **`assessments`** — flexible assessment foundation underlying CBC grading.
- **`syllabus`** — the real syllabus-coverage audit/verification dashboard (cross-references
  teacher-reported coverage against actual student assessments and delivered lesson plans, so a
  "covered" claim with zero backing evidence is flagged `SELF_REPORTED_ONLY`).
- **`exams`** — exam creation, marks entry, mark-sheet scan-to-enter, exam paper scanning/tidying,
  exam sharing/privacy tiers, results/analytics.
- **`exam-timetable`** — a real, separate generator for exam sitting schedules (distinct from the
  class timetable generator in `academics`), including invigilator assignment.
- **`pathway-guide`** — Senior School pathway guidance (Grade 10-12 subject/career pathway mapping).

## 3. Finance & money
- **`finance`** — fee structures, invoices, payments, M-Pesa reconciliation, activities/trips fee
  collection, treasury check clearing, tournament trip organizer.
- **`cafeteria`** — meal cards, tuck-shop, student pocket-money wallet.
- **`inventory`** — stores, stock, uniform catalogue and ordering.

## 4. Boarding & campus life
- **`hostel`** — dorms, bed allocation, curfew register, boarding fees, exeat/outing passes.
- **`transport`** — routes, fleet compliance, bus shift management.
- **`clinic`** — student health records, ongoing medication plans, daily dosage roll-call.
- **`discipline`** — incident records, photo proof, gate/discipline approvals.
- **`gate`** — QR gate-pass scanning, visitor sign-in.
- **`reception`** — front-office: visitor management, lost & found register.
- **`library`** — book catalogue, barcode/QR issue-and-return, fines.

## 5. Communication & collaboration
- **`comms`** — messaging, class-group chat/voice, intercom calling, notifications.
- **`messages`** — the real inbox surface consuming the comms backend.
- **`online-classes`** — WebRTC live-class signalling, raise-hand/questions.
- **`learning-videos`** — the teacher-facing side of the YouTube Learning Library (submission +
  vetting queue).
- **`lms`** — the Learning Management System: quizzes exported from tidied exam papers, course
  material.

## 6. People-facing portals
- **`portal`** — the real parent portal: child growth dashboard, PTA consultation booking,
  fee/invoice visibility, multi-child/multi-school linking.
- **`teacher`** — the real teacher portal: "My Classes" (instant allocation continuity), lesson
  planning, PTA booking (teacher side), Record of Work.
- **`owner`** — the School Owner's real dashboard (distinct from Principal — an owner may run
  multiple schools).

## 7. Company/NEYO-internal (never seen by a school user)
- **`founder`** — NEYO Ops' own console: pricing engine, tenant health radar, SMS health monitor,
  exam-sharing approval queue, feature release controls, revenue grants, discount campaigns,
  developer center, and every other company-run-the-business tool. Gated to
  `SUPER_ADMIN`/`FOUNDER`/`NEYO_OPS` only — this is the single largest and most sensitive module in
  the app, and the one most actively audited across sessions for genuine full-stack wiring (see
  Level 05, the Founder Decision Log, for the real gaps found and fixed here over time).
- **`neyo-support-console`** — the narrower `NEYO_SUPPORT` role's own tools: customer inquiries,
  demo/quote requests — deliberately excludes pricing, platform flags, and team management, per the
  real role split documented in Level 01 §3.

## 8. Platform/settings (every school configures its own)
- **`settings`** — school profile, curriculum configuration, billing (the real Dual Pricing Model
  Selector — see Level 01 §5), modules on/off, public website content, BOM governance vault, data
  export/recycle bin, developer/API keys, hardware & biometrics, brand, security (2FA enforcement).
- **`brand`** — school branding assets (logo, digital stamp, colors) reused across every generated
  document (Level 02 §6).
- **`bundi`** — the Bundi Intelligent Import surface (bulk data import, always branded "Bundi,"
  never "AI" — see Level 01 §6).
- **`calendar`** — school calendar, recurring events, exam timetable overlay.
- **`print-station`** — a real dedicated kiosk-mode print flow with its own print-limit/quota
  enforcement, separate from the ordinary browser print path used elsewhere.

## Notes for the next person extending this level

This is a map of *what exists and roughly what it does* — it is deliberately not a feature-by-
feature audit (that's what `FEATURES-CHECKLIST.md` and the founder's periodic re-audits are for).
When a module gains or loses a major real capability, the one-line description above should be
corrected in place, not appended to — keeping this document a fast, accurate orientation tool
rather than a growing pile of history.
