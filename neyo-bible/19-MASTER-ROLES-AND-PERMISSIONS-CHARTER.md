# Level 19 — Master Roles & Permissions Charter (All 19 Canonical Roles)
**Document Id**: `NEYO-BIB-L19`  
**Owner**: NEYO Executive Leadership & Chief Information Security Officer  
**Status**: Living Institutional Roles & Governance Charter  
**Last Updated**: 2026-07-17  

---

## Executive Summary: The Authorization Matrix

NEYO strictly governs multi-tenant data access across **19 canonical roles** (`src/lib/core/roles.ts`). Every database write, view query, and API endpoint (`src/app/api/...`) verifies user credentials against this single source of truth. 

To ensure absolute operational security across participating schools (`e.g. Karibu High`, `Uhuru Academy`) and internal NEYO company governance (`company: NEYO`), roles are cleanly segregated into **Company Management Tiers (`Y.2`)** and **School Operational Roles (`A.3`)**.

---

## SECTION 1 — Company Management Tiers (`isNeyoCompanyRole`)

These 4 roles belong strictly to **NEYO the Software Company (`company: NEYO`)** and are never assigned to ordinary school personnel.

### 1. `Role: FOUNDER` (`NEYO Founder`)
- **Organizational Tier**: Supreme Company Governance (`100% unrestricted access`).
- **Core Responsibilities**: Overall system architecture, corporate treasury, pricing catalog changes (`Part V`), and master release switch authorization (`PlatformFlag` / `assertEeFeatureReleased`).
- **Database Permissions**: `CREATE`, `READ`, `UPDATE`, `DELETE` across all models and all school tenants (`withTenant` overrides enabled). Sole authority to execute permanent tenant drop or company equity changes (`A.3`).
- **Dashboard Visibility**: Full access to **NEYO Ops -> Master Cockpit (`i48-neyo-business-os-cockpit`)**, Cost Cockpit (`u1`), Unit Economics (`u2`), and Platform Switches (`F.2`).
- **2FA / Security Constraint**: Mandatory Time-based One-Time Password (`TOTP / 2FA G.34`) enrollment required upon first login (`totp.service.ts`).

### 2. `Role: SUPER_ADMIN` (`Legacy NEYO Admin`)
- **Organizational Tier**: Legacy Company Governance (`identical permissions to FOUNDER`).
- **Core Responsibilities**: Kept strictly for backward compatibility with pre-existing demo data (`seed.ts`) and any legacy code path explicitly checking `SUPER_ADMIN`.
- **Database Permissions & Security**: Exactly mirrors `FOUNDER`. `can()` and `permissionsForRole()` treat both roles identically (`full unrestricted access`).

### 3. `Role: NEYO_OPS` (`NEYO Operations Specialist`)
- **Organizational Tier**: Company Operations & System Engineering.
- **Core Responsibilities**: System health monitoring, integration credential management (`StorageVault I.60`), storage health checks (`Storage Intelligence Part W`), and background job runner supervision (`t5`).
- **Database Permissions**: Can toggle release switches (`eefeature:*`), run migration repairs, and execute read-only diagnostic queries (`ViewAs F.3`). Strictly excluded from founder treasury accounts, cap table modifications, and permanent tenant deletion.
- **Dashboard Visibility**: Access to **NEYO Ops -> Diagnostics**, Background Jobs, and Storage Vault. Hidden from founder financial summaries.
- **2FA / Security Constraint**: Mandatory 2FA (`TOTP G.34`) required before accessing encrypted vault keys or flag tables.

### 4. `Role: NEYO_SUPPORT` (`NEYO Customer Support & Onboarding Specialist`)
- **Organizational Tier**: Customer-Facing Company Operations.
- **Core Responsibilities**: School onboarding using `ImportWizard` Step 2 (`BB.4 / DD.4`), guiding bursars through Excel subject mapping (`populateSubjectMap`), conducting live product demonstrations (`seed.ts`), and vetting custom feature requests (`T.3`).
- **Database Permissions**: Can read school public profiles, trigger invitation emails (`A.7`), and view non-confidential operational logs (`AuditLog`). Strictly forbidden from modifying subscription pricing (`Part V`), viewing school bank account credentials, or toggling master platform switches.
- **Dashboard Visibility**: Access to Help Center administration, Demo Provisioning, and Customer Tickets (`I.48 Customer Hub`).

---

## SECTION 2 — School Executive & Academic Leadership Roles

These roles govern individual participating school organizations (`Tenant`) and carry leadership-level deletion and delegation powers within their specific school's `tenantId`.

### 5. `Role: SCHOOL_OWNER` (`Proprietor / Director`)
- **Organizational Tier**: School Board / Proprietorship.
- **Core Responsibilities**: Overall institutional governance, approving annual software subscription budgets (`Capacity Pricing Part V`), signing legal contracts (`i48-contract-signing-test.ts`), and auditing total fee ledger collections (`B.7`).
- **Database Permissions**: Full `READ` across all school financial ledgers (`Invoice`, `Payment`), academic reports (`CbcAssessment`), and HR payroll runs (`PayrollRun`). Can update school branding (`tenantConfig.schoolName`, `liquid_level`).
- **Dashboard Visibility**: Executive Dashboard (`i25 Sparklines`), Cost/Revenue summaries, and BOM Audit Reports (`I.97`).

### 6. `Role: PRINCIPAL` (`Head Teacher`)
- **Organizational Tier**: Executive Academic & Operational Leadership.
- **Core Responsibilities**: Day-to-day school command, teacher duty allocation (`AA.3 / B.12`), duty roster publishing (`i78 generateDutyRoster`), verification of syllabus coverage (`Syllabus Audit I.97`), and principal-to-parent intercom calls (`I.95`).
- **Database Permissions**: Full `READ` and `UPDATE` across all school modules. Carries **Academic Record Immutability Override Powers**: when a teacher enters a fraudulent assessment, `PRINCIPAL` can execute `deleteCbcAssessment()` or `deleteLessonObservation()`, which permanently writes to `AuditLog`. Can delegate specific operational powers to deputies via **Principal Powers Delegation (`I.6`)**.
- **2FA / Security Constraint**: Mandatory 2FA (`TOTP G.34`) enrollment required before accessing staff salary or academic deletion endpoints.

### 7. `Role: DEPUTY_PRINCIPAL` (`Deputy Head Teacher`)
- **Organizational Tier**: Senior Operational Command.
- **Core Responsibilities**: Student discipline management (`DisciplinaryRecord B.1`), attendance oversight (`AttendanceRecord B.3`), and supervision of co-curricular activities (`ActivityCategory I.14`).
- **Database Permissions**: Operates under delegated principal authority (`I.6`). Can approve student gate passes (`GatePass EE.11`) and manage class allocations (`SchoolClass`).

### 8. `Role: DEAN_OF_STUDIES` (`Academic Dean`)
- **Organizational Tier**: Senior Academic Leadership.
- **Core Responsibilities**: Examination management (`Exam B.5`), curriculum template alignment (`Part J`), Senior School pathway placement (`EE.12 / J.10 Grade 10 Electives`), and **Smart Timetable Generation (`Wand2` in `academics-client.tsx`)**.
- **Database Permissions**: Can create and publish exam timetables (`publish_timetable`), trigger 1-click national exam cloning (`EE.6`), and execute academic record corrections (`cant be deleted anyhowly override`).

### 9. `Role: HOD` (`Head of Department`)
- **Organizational Tier**: Departmental Leadership (`e.g. Head of Mathematics / Science`).
- **Core Responsibilities**: Supervising subject teachers (`TeacherSubject`), auditing departmental syllabus coverage (`I.97`), vetting rough exam drafts (`EE.5`), and approving teacher petty cash requests (`TeacherCashPaymentRequest T.10`).
- **Database Permissions**: Scoped by `Department.hodId` (`i2-hod-department-scope-test.ts`). Can review and approve `ExamReleaseApprovalRequest` within their subject domain.

---

## SECTION 3 — Classroom & Subject Teaching Roles

These roles are assigned to the daily educators who interact with students, enter marks, and deliver lesson plans.

### 10. `Role: TEACHER` (`Subject Teacher`)
- **Organizational Tier**: Daily Academic Operations.
- **Core Responsibilities**: Delivering lesson plans (`LessonPlan I.88`), marking daily attendance (`AttendanceRecord`), entering continuous assessment marks (`ExamResult B.5`), using **1-Click Universal Presets (`EE.15`)**, running **Rubric-Driven Comment Auto-Fill (`EE.2`)**, using **STEM Virtual Labs (`EE.13`)**, and scanning paper quizzes (`EE.9`).
- **Database Permissions & Academic Immutability (`cant be deleted anyhowly`)**: Can `CREATE` and `UPDATE` student continuous assessment observations (`CbcAssessment`, `LessonObservation`). Strictly **FORBIDDEN (`HTTP 403`)** from executing `DELETE` queries on any historical student academic or syllabus record. If an error requires deletion, they must submit a correction request to `PRINCIPAL` or `DEAN_OF_STUDIES`.
- **Dashboard Visibility**: Scoped strictly to their assigned subjects and classes inside **My Classes (`B.12`)**. `teacherClassIds()` queries all 4 assignment sources (`SchoolClass.classTeacherId`, `TimetableSlot`, `ClassSubjectNeed`, `TeacherSubject`) ensuring instant data continuity across class transfers.

### 11. `Role: CLASS_TEACHER` (`Stream / Form Teacher`)
- **Organizational Tier**: Stream Pastoral & Academic Care.
- **Core Responsibilities**: Managing a specific stream (`e.g. Form 2 East`), generating term-end master report cards (`report-card-day.service.ts K.5`), tracking student leave/health notes (`Clinic B.1`), and conducting parent-teacher conferences.
- **Database Permissions**: Carries all `TEACHER` permissions plus read/update access to full learner demographic and pastoral profiles (`StudentProfile`) for their assigned `classTeacherId` stream.

---

## SECTION 4 — Financial & Front Office Operations Roles

These roles govern school treasury, gate access, library circulation, and dormitory boarding.

### 12. `Role: BURSAR` (`Chief Financial Officer`)
- **Organizational Tier**: School Financial Gatekeeper.
- **Core Responsibilities**: Fee structure management (`FeeStructure B.7`), invoicing (`Invoice`), M-Pesa STK Push / IPN reconciliation (`Mzazi Direct Pay I.41`), creating flexible installment plans inside the **High-Contrast Installment Plan Dialog (`z-[100]`)**, and processing physical bank deposit receipts (`Receipt Delivery R.5`).
- **Database Permissions**: Full `CREATE`, `READ`, `UPDATE` across school financial ledgers. Can verify M-Pesa transactions via **Biometric Finance Gate (`R.3`)** and issue B2C petty cash disbursements (`T.10`). Cannot alter academic grades (`CbcAssessment`).
- **2FA / Security Constraint**: Mandatory 2FA (`TOTP G.34`) enrollment required upon login.

### 13. `Role: ACCOUNTANT` (`Finance Officer`)
- **Organizational Tier**: Financial Operations.
- **Core Responsibilities**: Daily receipt logging, petty cash bookkeeping (`ReceptionCashBank i91`), and preparing data for KRA statutory payroll processing (`PayrollRun B.8`).
- **Database Permissions**: Scoped financial ledger read and update access under `BURSAR` supervision.

### 14. `Role: RECEPTIONIST` (`Front Desk Officer`)
- **Organizational Tier**: Front Office & Visitor Command.
- **Core Responsibilities**: Visitor check-in (`Visitor Log A.18`), logging physical bank deposit slips delivered by parents (`R.5`), handling incoming calls (`I.69 Intercom`), and issuing temporary visitor/parent gate passes.
- **Database Permissions**: Read access to basic student/parent contact directories (`StudentSearchSelect` `mode: "insensitive"`). Can create pending `GatePass` records awaiting principal sign-off.

### 15. `Role: LIBRARIAN` (`Library Master`)
- **Organizational Tier**: Learning Resource Circulation.
- **Core Responsibilities**: Managing library copies (`LibraryCopy B.15`), scanning book barcodes and student ID cards using the **Universal Barcode Scanner (`IssueTab` `library-client.tsx`)**, and tracking overdue fines.
- **Database Permissions & Auto-Calculation**: When `scan()` reads a barcode, the system automatically fills Book Title, Author, Shelf, and **auto-calculates Due Date (`dueDate`)** (`Today + loanPeriodDays` — default 14 days). Librarian has full write access to `LibraryLoan` records.

### 16. `Role: HOSTEL_MASTER` (`Boarding & Dormitory Master`)
- **Organizational Tier**: Residential & Boarding Care.
- **Core Responsibilities**: Dormitory room/bed automation (`HostelDorm i16`), evening roll-call attendance, monitoring boarding meal cards (`CafeteriaMealCard i18`), and issuing off-campus boarding gate passes (`EE.11`).
- **Database Permissions**: Read/update access scoped to `Hostel` and boarding-assigned learners (`Student.hostelId`).

### 17. `Role: SUPPORT_STAFF` (`Security Guards, Cafeteria & Maintenance`)
- **Organizational Tier**: Physical Campus Operations.
- **Core Responsibilities**: Operating the **Sub-Second QR Gate Checkpoint (`EE.11` in `gate-client.tsx`)**, scanning student ID cards or printed passes (`GP-0001`), and stamping arrival/departure (`usedAt` vs `returnedAt DateTime?` <150ms).
- **Database Permissions**: Restricted strictly to `scanForGatePassStatus()` execution and gate check-in/out stamping. Cannot view student grades or fee ledgers.

---

## SECTION 5 — External Stakeholder Roles

These roles belong to parents and students accessing public or self-service portal boundaries.

### 18. `Role: PARENT` (`Parent / Guardian`)
- **Organizational Tier**: External Stakeholder (`Parent Portal B.10`).
- **Core Responsibilities**: Monitoring multi-kid sibling academic progress (`Part R`), paying fees via **Mzazi Direct Pay 1-Tap SMS links (`I.41`)**, requesting flexible installment schedules (`PromiseToPay I.99`), querying Grade 10 Senior School placements (`EE.12 KNEC SMS lookup 22263 style`), and downloading **A4 PDF Digital Portfolios (`EE.14` `export=pdf not json`)**.
- **Database Permissions**: Strictly read-only access scoped via `Guardian` -> `Student` relationship. Can initiate `POST /api/payments/checkout` to trigger M-Pesa STK Push.

### 19. `Role: STUDENT` (`Learner`)
- **Organizational Tier**: External Stakeholder (`Student Portal B.11`).
- **Core Responsibilities**: Viewing personal timetables (`PrintTimetablePage` / screen view), checking homework assignments (`Homework`), submitting digital project files (`PortfolioItem J.7`), practicing on self-marking quizzes (`EE.8 Question Bank Attempt`), participating in **Inter-School Contests (`EE.10`)**, and exploring **STEM Virtual Labs (`EE.13`)**.
- **Database Permissions**: Strictly read-only on curriculum/timetable data; insert access strictly scoped to their personal `QuestionBankAttempt`, `ContestAttempt`, and `HomeworkSubmission` records (`withTenant` + `studentId` check).
