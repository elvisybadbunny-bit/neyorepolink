# Level 3 — Product Documentation: Master PRD, Feature Specs & Design System (Exhaustive Edition)
**Document Id**: `NEYO-BIB-L3-EXHAUSTIVE`  
**Owner**: NEYO Solo Founder & Lead Technical Architect  
**Status**: Living Institutional Product Bible (Exhaustive Edition)  
**Last Updated**: 2026-07-17  

---

## Executive Summary & Architectural Identity

The **Level 3 Product Bible** is the master specification document of NEYO (`company: NEYO`). It bridges our product vision, institutional operational boundaries (`A.3 Roles & Immutability`), physical classroom reality (`handwritten exams, paper mark sheets, student ID cards`), and our cloud-and-edge software architecture (`Next.js 14 App Router`, `Prisma ORM`).

Every module, interface, and user workflow detailed below is fully implemented across our full-stack codebase (`/home/user/neyorepolink`), verified across 15 standalone integration verification suites (`126/126 checks passing`), and typecheck-clean (`0 errors in tsc --noEmit`).

---

## SECTION 1 — The Odoo + Apple + Linear + Liquid Glass Design Constitution

Every screen, card, modal, and printed sheet in NEYO strictly conforms to our four-pillar architectural constitution (`PROMPT 1, 3` & `Part O`):

### 1.1 Odoo Structural Hierarchy
- **AppGrid Module Switcher**: Top-left 9-dot grid launcher (`lucide-react Grid icon`) providing instant context switching across `Academics`, `Finance & Billing`, `Students & Admissions`, `HR & Payroll`, `Library`, `Security Gate Checkpoint`, `Communication`, and `NEYO Ops (`F.1`)`.
- **Sidebar Navigation (`SidebarNav`)**: Left-hand structural navigation bar supporting deep multi-level breadcrumbs (`Academics -> CBC Strands -> Universal Presets (`EE.15`)`). Automatically hides restricted options based on `tenantConfig.hiddenNavByRole` (`H.2 Role-Based Settings & Module Visibility Control`).
- **Multi-View Engine**: Every major table supports 4 instantaneous view toggles: **List View** (`compact tabular data`), **Kanban Board** (`drag-and-drop state transitions`), **Form View** (`deep Liquid Glass editing`), and **Print Station (`⌘P`)** (`chrome-free exact layout`).

### 1.2 Apple Craft & Generous Whitespace
- **Geometry & Padding**: Minimum `p-6` card internal padding (`space-y-6`), `rounded-2xl` card corner radius (`16px`), `rounded-full` action pills (`9999px`), and high-contrast border definition (`border border-slate-200 dark:border-slate-800`).
- **Standardized Motion**: Minimum `200ms ease-in-out` transitions across all state changes, tab switches, and modal appearances (`zero jarring layout shifts`).

### 1.3 Linear Speed & Keyboard Mastery
- **Command Palette (`⌘K / Ctrl+K`)**: Global keyboard shortcut opening instant quick-navigation search (`CommandPalette`), allowing educators to jump to any student, invoice, or class instantly.
- **Case-Insensitive Type-to-Search (`StudentSearchSelect` / `mode: "insensitive"`)**: All selectors across `MarkSheetModal`, `ExamPaperTidyingModal`, `PaperQuizFormativeModal`, `QuestionBankModal`, and `GateClient` replace long 500-item `<select>` dropdowns with instant type-to-search input pickers querying Postgres with `mode: "insensitive"`.

### 1.4 Liquid Glass Visual System (`Part O` / `liquid_level`)
To eliminate visual monotony and accommodate varying hardware capabilities (`from iPad Pros to $50 Android devices`), NEYO implements **Liquid Glass**—a customizable translucent frosted-glass UI system controlled via `tenantConfig.liquid_level` (`0 to 100`):

```
+----------------------------------------------------------------------------------------------------+
|                                    LIQUID GLASS INTENSITY MATRIX                                   |
+----------------------------------------------------------------------------------------------------+
| LEVEL 0 (Pure Flat White Mode - Maximum Performance & Battery Saver)                               |
| - CSS Classes: bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm  |
| - Target Environment: Older hardware, low-memory browser tabs, or extreme battery preservation.    |
+----------------------------------------------------------------------------------------------------+
| LEVEL 50 (Balanced Frosted Glass - Standard Default)                                               |
| - CSS Classes: bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/60        |
| - Target Environment: Standard school tablets, laptops, and modern smartphones.                    |
+----------------------------------------------------------------------------------------------------+
| LEVEL 100 (Crystal Liquid Glass - Apple Craft Showcase)                                            |
| - CSS Classes: bg-white/75 dark:bg-slate-900/75 backdrop-blur-md shadow-xl border border-white/20  |
| - Target Environment: Executive dashboards, parent portals, and high-resolution displays.          |
+----------------------------------------------------------------------------------------------------+
```

---

## SECTION 2 — Master Product Requirements Document (`PRD`) Across Core Modules

### 2.1 Module 1: Student Management, Admissions & Excel Onboarding (`B.1, B.2, BB.4 / DD.4`)
- **Purpose**: Provides deep 360-degree learner profiles while enabling sub-second Excel/CSV bulk onboarding without unmapped subject text drift (`BB.4 / DD.4`).
- **Exact Models**: `Student` (`id, tenantId, admissionNumber, legacyAdmissionNo, firstName, lastName, dateOfBirth, gender, classId, stream, upiNumber, birthCertNumber, photoUrl, isActive, parentId`), `AdmissionApplication`, `EntranceExamPaper`, `StudentSubjectSelection`.
- **Core Requirements & Operational Workflows**:
  1. **Student Import with Assigned Subjects (`BB.4 / DD.4` in `ImportWizard`)**:
     - Step 2 (`Preview Tab`) calls `previewImport()` (`POST /api/students/import/preview`), scanning every unique subject string against the school's active subject catalog using `populateSubjectMap()` (`normalizing & vs and, e.g. Agriculture & Nutrition -> Agriculture and Nutrition`).
     - Surfaces high-contrast warning boxes: `unknownSubjects` (`unmapped subject warning`), `rowsWithSubjectsCount`, and `hasCompulsorySubjects`.
     - Automatically places learners into Core vs Essential Mathematics (`P.2` / `MATC` vs `MATE`) based on selected Senior School electives (`pathway-aware-math-variant-import-test.ts`).
  2. **Entrance Exam Paper Vault (`I.11` in `entrance-exam.ts`)**: Unlocked from rigid single-file Zod restrictions, allowing multi-format PDF and image upload for prospective student evaluations (`upsert without .strict() errors`).
- **API Endpoints & Error Codes**:
  - `POST /api/students/import/preview`: Returns `{ unknownSubjects: string[], rowsWithSubjectsCount: number, hasCompulsorySubjects: boolean }`. Throws `HTTP 403` (`requirePermission("STUDENTS_IMPORT")`).
  - `POST /api/students/import/commit`: Commits normalized records inside `$transaction`. Throws `HTTP 409 Conflict` if `admissionNumber` already exists (`duplicate-import-test.ts`).

### 2.2 Module 2: Attendance, QR Gate Checkpoint & Medical Clinic (`B.3, EE.11, Clinic`)
- **Purpose**: Automates stream attendance (`Present, Absent, Late, Excused`) and physical security check-in/out via **Sub-Second QR Gate-Pass Status Scanning (`EE.11`)** (<150ms check-in/out stamping).
- **Exact Models**: `AttendanceRecord`, `StaffAttendance`, `GatePass` (`id, tenantId, studentId, code: "GP-0001", reason, validUntil, issuedAt, usedAt, returnedAt DateTime?`), `QrScanEvent`, `MedicalRecord`.
- **Sub-Second Status Engine (`EE.11` in `gate-client.tsx` & `qr-scan.service.ts`)**:
  - Universal camera scanner reads `/verify/GP-0001` or student admission QR codes (`BarcodeDetector` + `jsQR` fallback). Evaluates queries inside `scanForGatePassStatus()` in under 150ms (`8ms` verified), rendering exact status cards:
    - 🟢 **ALLOWED / ACTIVE GATE PASS**: Pass is approved (`status = APPROVED`, `validUntil > now`, `usedAt = null`). Renders green badge and `canExit: true`. Displays 1-tap button: **[ Stamp Gate Exited Now ]** (sets `usedAt = now`).
    - 🟡 **DIDNT_PASS / ALREADY EXITED CAMPUS**: Pass already stamped exited earlier (`usedAt != null`). Displays 1-tap button: **[ Stamp Gate Returned Now ]** (sets `returnedAt DateTime? = now` to record check-in return from trip).
    - 🔴 **NOT_ALLOWED / PASS PENDING**: Pass exists but `status = PENDING` (`awaiting Principal / HOD sign-off`). Blocks exit with exact explanation.
    - 🔴 **INVALID / NOT FOUND**: QR code unrecognized or forged.
- **API Endpoints & Error Codes**:
  - `POST /api/qr-scan/gate-pass`: Accepts `{ code: string, action?: "EXIT" | "RETURN" }`. Throws `HTTP 403` (`assertEeFeatureReleased("EE.11")` check failure).

### 2.3 Module 3: CBC / CBE Mega-Suite, Syllabus Audit & Immutability (`Part EE: EE.1–EE.15`, `I.97 / B.12 / I.88`)
- **Purpose**: Provides Kenya's most advanced, full-stack KICD Competency-Based Curriculum (CBC) and Competency-Based Education (CBE) assessment engine, eliminating manual rubric calculations and AI text generation (`The Bundi Rule`).
- **Exact Models**: `CbcStrand`, `CbcSubstrand`, `CbcAssessment`, `CbcCommentBankEntry`, `Rubric`, `RubricLevel`, `CompetencyGroup`, `Competency`, `SyllabusTopic` (`id, tenantId, classId, subjectId, topicName, status: "COVERED" | "NOT_COVERED" | "IN_PROGRESS", coveredAt`), `LessonPlan`, `LessonObservation`.
- **Core Requirements & Operational Workflows**:
  1. **1-Click Universal Presets Engine (`EE.15` in `universal-presets.service.ts`)**:
     - `UniversalPresetsModal` (`Universal Presets (EE.15)` button inside CBC Strands / Exams top bar).
     - **1-Click Applies**: (a) **7 Universal Core Competencies (`J.6`)** (`Communication & Collaboration, Critical Thinking, Imagination, Citizenship, Digital Literacy, Learning to Learn, Self-Efficacy`); (b) **Official KICD 4-Point Formative Rubrics (`EE, ME, AE, BE`)** across Level 1–4 descriptors AND **8-Point Senior CBE Rubrics (`KICD_8POINT_RUBRICS` `1 to 8 Points` `EE.15 / J.5`)** for Grade 10–12; and (c) **Core Values & Student Duties** (`autoAssignStudentDuties()`). 100% idempotent (`21 skipped on re-run`).
  2. **Real-Time Syllabus Auto-Linking & Audit (`I.97 / EE.8 / I.88` in `syllabus.service.ts`)**:
     - `syncSyllabusFromAssessment()` automatically updates `SyllabusTopic.status = "COVERED"` whenever a teacher marks a `CbcAssessment`, `LessonObservation`, or `LessonPlan` as `DELIVERED`.
     - **Academics Audit Dashboard (`SyllabusClient` `I.97` tab)**: Cross-references teacher updates against real assessment entries, categorizing exactly into: `VERIFIED_COVERED` (backed by real student assessments) vs `SELF_REPORTED_ONLY` (`0 student assessments entered`) vs `NOT_COVERED ("0 Assessments Entered — Assumed Never Covered")`.
  3. **Academic Record Immutability (`cant be deleted anyhowly`)**:
     - Ordinary classroom teachers (`Role: TEACHER`) are strictly **FORBIDDEN (`HTTP 403 / FORBIDDEN`)** from deleting existing `CbcAssessment`, `LessonObservation`, or `SyllabusTopic` records. Deletion attempts fail cleanly, preventing departing staff from voiding school academic records out of spite. Only `PRINCIPAL`, `DEAN_OF_STUDIES`, or `FOUNDER` can void records, emitting an immutable `AuditLog` (`A.13`).
  4. **Rubric-Driven Comment Auto-Fill (`EE.2`)**:
     - Pulls authentic personalized comments directly from `CbcCommentBankEntry` based on rubric level distribution (`never using generic AI text`).
- **API Endpoints & Error Codes**:
  - `GET /POST /api/cbc/universal-presets`: Throws `HTTP 403` if `assertEeFeatureReleased("EE.15")` is false. Returns `{ success: true, competenciesApplied: 7, rubricsApplied: 4, skippedDuplicates: 21 }`.
  - `POST /api/syllabus/sync`: Updates `SyllabusTopic` status inside `$transaction`.

### 2.4 Module 4: Smart OCR & Physical-to-Digital Bridge (`EE.4, EE.5, EE.9, Bundi OCR`)
- **Purpose**: Transforms paper mark sheets, rough handwritten exam drafts, and classroom quizzes directly into structured digital records using zero-external-cost in-app optical character recognition (`tesseract.js`).
- **Exact Models**: `ScannedExamPaper`, `PaperQuizFormativeBatch`, `ExamResult`, `CbcAssessment`.
- **Core Requirements & Operational Workflows**:
  1. **Printable Mark Sheets & OCR Delta Detection (`EE.4` in `mark-sheet.service.ts`)**: Teachers print a class mark sheet (`⌘P`), fill grades by hand, and scan the sheet back. `runMarkSheetScan()` parses cells, detects score deltas against existing database entries, and commits exact updates inside `$transaction`.
  2. **Exam Paper Tidying (`EE.5` in `exam-paper-scan.service.ts`)**: Teachers upload rough handwritten exam drafts. `runExamPaperScanAndTidy()` (`enhanceImageForOcr`) extracts questions, normalizes formatting into standardized KICD layout, and allows 1-click export to **Printable PDF** or **LMS Online Quiz**.
  3. **Scan Paper Quiz to Formative Assessment (`EE.9` in `paper-quiz-formative.service.ts`)**: Scans classroom multiple-choice/short-answer quizzes and automatically converts raw scores into official KICD 4-point rubrics (`EE / ME / AE / BE`) linked to specific sub-strands (`CbcAssessment`).
- **API Endpoints & Error Codes**:
  - `POST /api/academics/mark-sheets/scan`: Runs local OCR pipeline (`0 third-party API billing`). Returns exact delta extraction report (`ee4-mark-sheet...test.ts`).

### 2.5 Module 5: Timetable Engine, Smart Solver & Exact Print Redesign (`Smart Timetable Wand2`, `ACHOLA ROSE` format `⌘P`)
- **Purpose**: Solves multi-stream, double-period (`colSpan={2}`), and lab rotation (`AA.8`) schedules with zero teacher conflicts, and renders edge-to-edge printable schedules exact-matching Kenyan school standards.
- **Exact Models**: `TimetableSlot`, `TimetableConfig`, `Subject`, `SchoolClass`, `ElectiveBlock`.
- **Core Requirements & Operational Workflows**:
  1. **Smart Timetable Generator (`Wand2` inside `academics-client.tsx`)**: Consolidated into a single intelligent modal (`tab === "generator"` consolidated). Includes **Pre-generation summary (`AA.5`)**, **Venue/Lab rotation (`AA.8`)**, and 1-click action buttons: **🚀 Publish to All (`status = PUBLISHED`)** (dispatches instant teacher notifications via `db.notification.create`) and **📝 Save as Draft (`status = DRAFT`)**.
  2. **Printable Timetable Exact-Match Redesign (`PrintTimetablePage` in `print-timetable-page.tsx` & `page.tsx`)**:
     - **Exact Header Layout**: Displays `RATIBA YA SCHOOL MWAKA 2026` (`tenantConfig.schoolName` + Academic Year) uppercase and centered at the top, above bold Class/Teacher titles (`ACHOLA ROSE` / `FORM 2 EAST`).
     - **Vertical Break & Lunch Merging**: `rowSpan={days.length}` merges LUNCH and BREAK periods across all days (`Mo–Fr`) into a single continuous vertical column reading `B R E A K` or `L U N C H`, computed via `realLunchPeriodsFromSlots()`. Ordinary lessons never merge vertically.
     - **Horizontal Double-Period Merging**: `colSpan={2}` merges consecutive periods of identical subjects when context identity rules match (`class mode matches teacher+subject; teacher mode matches class+subject`).
     - **Wall-Clock Period Headers**: Every period header (`1, 2, BREAK, 3...`) calls `periodTimeRange(p, config)` to display exact school times (`e.g. 8:00 AM–8:40 AM`) directly beneath the period number.
     - **Bottom Corners & Edge-to-Edge Layout**: Removes "Teacher timetable" text from bottom-left, displaying clean `Generated: <Date/Time>`. Displays `Powered by NEYO` in bottom-right. Defaults to `daysVertical = true` landscape `margin: 6mm` edge-to-edge layout (`print=1`). Full subject color support (`bw=1` strips to high-contrast ink-saver).

### 2.6 Module 6: Finance, M-Pesa Ledgers & Installment Dialogs (`B.7, Part V, I.41, I.99, R.3`)
- **Purpose**: Eliminates school financial leakage by automating fee structures, STK Push payments (`Mzazi Direct Pay I.41`), bank deposit receipts (`R.5`), and parent fee promises (`PromiseToPay I.99`).
- **High-Contrast Installment Plan Portal (`InstallmentPlanDialog` in `finance-client.tsx`)**: High z-index (`z-[100] bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl`) opaque layout where bursars create multi-part fee schedules that auto-sync with the **Fee Promise Calendar (`I.24`)**.
- **Biometric Finance Gate (`R.3`) & Direct Pay (`I.41`)**: Direct Safaricom Daraja IPN verification (`/api/webhooks/mpesa`). `partial-payment-friendly-test.ts` guarantees partial payments reduce balances across items cleanly (`0 double-counting`).

### 2.7 Module 7: Teacher Portal & Instant Assignment Continuity (`B.12`, `teacher-portal.service.ts`)
- **Purpose**: Empowers teachers with instant access to assigned classes while guaranteeing zero data friction upon class transfers.
- **Core Requirements**: `teacherClassIds()` and `getTeacherHomeData()` simultaneously query all 4 assignment sources (`SchoolClass.classTeacherId`, `TimetableSlot`, `ClassSubjectNeed`, `TeacherSubject`). When a class is reallocated (`AA.3 Teacher Allocation Review`), all student rosters, attendance sheets, and CBC mark entry tables appear instantly inside **My Classes** (`0 data loss, ordinary teachers forbidden from deleting records`).

### 2.8 Module 8: Library Circulation & QR Checkpoint (`B.15, EE.11`, `library-client.tsx`)
- **Purpose**: Automates book inventory (`LibraryBook`, `LibraryCopy`) and student check-out/return loops.
- **IssueTab Scanner Auto-Fill & Auto-Due Date (`library-client.tsx`)**: Universal camera scanner reads `BK-0001` and student ID QR codes (`/verify/ADM-001`). Instantly populates Book Title, Author, Shelf, and **auto-calculates Due Date (`dueDate`)** (`Today + loanPeriodDays` — default 14 days). Librarian presses **[ Issue Book Now ]** (`1-tap checkout`).

### 2.9 Module 9: Strategic Roadmaps (`EE.12, EE.13, EE.14, EE.15`)
- **`EE.12` — KNEC / KJSEA Assessment Number SMS & Webhook Placement Lookup (`sms-knec.service.ts`)**: Queries Grade 9 -> Grade 10 Senior School pathway placement and KJSEA milestone scores (`82% L4 EE`) via SMS or portal (`22263 style` lookup). Debits KES 30 lookup fee (`transactionType: "KNEC_PLACEMENT_LOOKUP"`).
- **`EE.13` — Interactive STEM Virtual Lab & Canvas Simulations Station (`stem-simulation-station.tsx`)**: Integrated into `QuestionBankModal` (`Tab 5: STEM Virtual Labs`). Features physical sliders and live Canvas rendering across: (a) **Ohm's Law (`I = V/R`)** adjusting Voltage (`1–24V`) and Resistance (`1–50Ω`) with glowing bulb intensity; (b) **Levers & Moments (`Principle of Moments`)** balancing effort/load weights across adjustable distances (`0.5–3.0m`); (c) **Pythagoras Right Triangle (`c = √(a² + b²)`)**.
- **`EE.14` — Automated CBC/CBE Digital Portfolio & Project Album A4 PDF Booklet Builder (`portfolio.service.ts`)**: Upgraded `/api/portfolio?export=pdf&print=1` to generate a formatted A4 PDF/HTML project album (`export=pdf not json`). Includes learner demographics, 7 Universal Competencies (`★`.repeat(ratingLevel)), and high-resolution grid of approved `PortfolioItem` project photos with teacher rubric verifications. Includes native auto-print hook (`window.print()`).
- **`EE.15` — Universal CBC/CBE Presets Engine**: 1-Click universal setup applying 7 competencies, 4-point & 8-point rubrics (`KICD_8POINT_RUBRICS`), and student values/duties (`autoAssignStudentDuties()`).

---

## SECTION 3 — User Stories & Acceptance Tests Matrix (All 19 Roles)

| User Story ID | Role | User Story Text | Acceptance Test Protocol & Verification Command |
| :--- | :--- | :--- | :--- |
| **US-01** | `PRINCIPAL` | As a Principal, I want to verify real syllabus coverage across all classes so teachers cannot submit fake rubric reports. | 1. Open `Academics -> Syllabus Audit (`I.97`)`.<br>2. Verify exact categorization into `VERIFIED_COVERED` vs `SELF_REPORTED_ONLY` vs `NOT_COVERED`.<br>3. Verify teacher delete attempts throw `HTTP 403` (`ee-syllabus-teacher-classes-immutability-test.ts`). |
| **US-02** | `TEACHER` | As a Teacher, I want to scan a paper class quiz so NEYO automatically converts raw marks into 4-point CBC rubrics (`EE, ME, AE, BE`). | 1. Upload scanned quiz image (`EE.9 Paper Quiz Formative`).<br>2. Run `runPaperQuizScanAndConvert()`.<br>3. Verify exact score-to-rubric threshold mapping inside `CbcAssessment` (`ee9-paper-quiz-formative-test.ts`). |
| **US-03** | `BURSAR` | As a Bursar, I want to create a multi-part installment promise for a parent inside a high-contrast modal so it never blurs or gets lost. | 1. Open `Finance -> Installment Plan Dialog`.<br>2. Verify `z-[100] bg-white dark:bg-slate-900 shadow-2xl` opaque layout.<br>3. Save plan and verify auto-sync with `PromiseToPay` calendar (`i99-installment-plans-test.ts`). |
| **US-04** | `LIBRARIAN` | As a Librarian, I want scanning a book barcode to automatically fill the book info and calculate the exact return due date. | 1. Open `Library -> Issue Tab (`scan`)`.<br>2. Scan barcode `BK-001`.<br>3. Verify Title, Author, Shelf populate instantly and `dueDate` calculates as `today + loanPeriodDays` (`library-client.tsx`). |
| **US-05** | `SUPPORT_STAFF` | As a Security Guard, I want to scan a student's gate pass QR code and get an instant red/green status card in under 150ms. | 1. Open `Security -> QR Checkpoint (`EE.11`)`.<br>2. Scan QR code `/verify/GP-0001`.<br>3. Verify response in `<150ms` (`8ms` verified) displaying `ALLOWED / ACTIVE GATE PASS` (`ee11-qr-gate-pass-test.ts`). |
| **US-06** | `DEAN_OF_STUDIES` | As a Dean of Studies, I want options block electives (`AA.1`) included automatically in exam runs without separate checkboxes. | 1. Run `buildGenerationPlan()` (`exam-timetable-generator.service.ts`).<br>2. Verify `StudentSubjectSelection.selectedSubjectIds` pulls active electives into shared single-choice sittings (`aa10-exam-elective-block-awareness-test.ts`). |
| **US-07** | `FOUNDER` | As the Founder, I want every new Part EE idea to launch switched OFF platform-wide by default until I release it in NEYO Ops. | 1. Check `platform-flags.service.ts` (`assertEeFeatureReleased`).<br>2. Verify missing row defaults to `false` for `eefeature:*` keys.<br>3. Toggle ON and verify instant unlock (`ee12-ee15-strategic-roadmaps-test.ts`). |

---

## SECTION 4 — UI Specifications & The 4 UX States

Every workspace and modal strictly implements all four UX states (`Loading`, `Empty`, `Error`, `Populated`):

```
+-----------------------------------------------------------------------------------+
| 1. LOADING STATE                                                                  |
| - High-contrast animated skeleton pulses (bg-slate-200 dark:bg-slate-800 rounded) |
| - Zero layout shift upon hydration. No generic spinning wheels where possible.    |
+-----------------------------------------------------------------------------------+
| 2. EMPTY STATE                                                                    |
| - Centered Lucide icon (<FolderOpen className="h-12 w-12 text-slate-400" />)      |
| - Clear explanatory headline: "No Exam Papers Found in Vault"                     |
| - 1-Click Action Pill: [ + Upload Paper ] or [ ⚡ Apply Universal Presets (`EE.15`) ]|
+-----------------------------------------------------------------------------------+
| 3. ERROR STATE                                                                    |
| - High-contrast red/amber banner (bg-red-50 dark:bg-red-950/50 border-red-200)    |
| - Exact technical diagnostics ("EE.11 is switched off in NEYO Ops")               |
| - Actionable remedy button: [ Ask Bundi to Diagnose ] or [ Retry Connection ]     |
+-----------------------------------------------------------------------------------+
| 4. POPULATED STATE                                                                |
| - Apple Craft rounded-2xl Liquid Glass cards with 200ms motion transitions.       |
| - Odoo breadcrumbs and List / Kanban / Form view switcher.                        |
| - Case-insensitive type-to-search input boxes (StudentSearchSelect).             |
+-----------------------------------------------------------------------------------+
```
