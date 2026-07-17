# Level 4 — Engineering Architecture, Tech Stack & AI Development Guide (Exhaustive Edition)
**Document Id**: `NEYO-BIB-L4-EXHAUSTIVE`  
**Owner**: Senior Technical Architect & Lead Engineering Partner  
**Status**: Living Institutional Technical Specification (Exhaustive Edition)  
**Last Updated**: 2026-07-17  

---

## Executive Summary: The Engineering Constitution

The **Level 4 Engineering Bible** institutionalizes the software architecture of NEYO (`/home/user/neyorepolink`). Built on a 100% full-stack **Next.js 14 App Router** monorepo (`TypeScript`) backed by **Prisma ORM (`PostgreSQL` / `SQLite` via WASM Driver Adapters)**, the system is engineered to scale across 40,000+ Kenyan educational institutions while operating with zero latency across frontend and backend boundaries.

This specification documents our exact database schemas (`schema.prisma`), cryptographic multi-tenant pool scoping (`withTenant`), physical-to-digital OCR pipelines (`tesseract.js`), sub-second QR status engines (`<150ms`), and our strict **AI Development Guide (`Zero AI Debt Protocol`)**.

---

## SECTION 1 — System Architecture & High-Level Topology

NEYO operates as a **hybrid cloud-and-edge multi-tenant operating system** designed for extreme resilience across both fiber-connected urban academies and cellular-dependent rural secondary schools (`Z.1 Offline Resilience`).

```
+----------------------------------------------------------------------------------------------------+
|                                      CLIENT LAYER (WEB & PWA)                                      |
| - Next.js 14 App Router React Client Components (`lucide-react`, Liquid Glass `rounded-2xl`)       |
| - Progressive Web App Service Worker (`Z.1`) for local offline roster caching & queue stamping     |
| - In-App Edge OCR & Barcode Engines (`tesseract.js` + `BarcodeDetector` + `jsQR` canvas fallback)  |
+----------------------------------------------------------------------------------------------------+
                                                 | HTTPS / JSON / WebSockets
                                                 v
+----------------------------------------------------------------------------------------------------+
|                                    API ROUTING & SECURITY GATE                                     |
| - Next.js 14 Server Actions & Route Handlers (`src/app/api/*`)                                     |
| - Session JWT Middleware (`auth.service.ts` validating userId, role, and tenantId)                 |
| - Multi-Tenant Isolation Enforcement (`assertTenant(req)` / `requirePermission()`)                 |
| - Feature Switch Gating (`assertEeFeatureReleased(featureId)` via `platform-flags.service.ts`)     |
+----------------------------------------------------------------------------------------------------+
                                                 | Real-Time Prisma Queries
                                                 v
+----------------------------------------------------------------------------------------------------+
|                                     BUSINESS SERVICES LAYER                                        |
| - 185+ Domain Services (`src/lib/services/*.service.ts`): Academics, Finance, CBC, Timetables      |
| - Universal Presets (`EE.15`), QR Gate (`EE.11`), KNEC SMS (`EE.12`), Portfolio (`EE.14`)          |
| - Multi-Tenant Query Scoping (`withTenant(db, tenantId)` reading `TENANT_OWNED_MODELS` registry)   |
+----------------------------------------------------------------------------------------------------+
                       |                                                     |
                       v                                                     v
+--------------------------------------------+         +---------------------------------------------+
|             DATABASE PERSISTENCE           |         |            EXTERNAL INTEGRATIONS            |
| - PostgreSQL 18.4 (`EmbeddedPostgres`)     |         | - M-Pesa STK Push / B2C (`Daraja API`)      |
| - Prisma ORM 5.x (`driverAdapters` WASM)   |         | - SMS Gateways (`Africas Talking` / Daraja) |
| - `_prisma_migrations` exact checksum tracking|      | - Cloudflare R2 / Object Storage Adapter    |
+--------------------------------------------+         +---------------------------------------------+
```

---

## SECTION 2 — Tech Stack & Architectural Rationale

| Layer | Technology | Exact Why & Rationale |
| :--- | :--- | :--- |
| **Full-Stack Framework** | **Next.js 14 App Router (`TypeScript`)** | Unifies frontend React components and backend API route handlers into one exact repository (`0 latency across API boundaries`). Enables Server-Side Rendering (SSR) for high SEO (`Landing Page I.52`) alongside interactive React Client Components (`Liquid Glass workspaces`). |
| **ORM & Database Layer** | **Prisma ORM 5.x (`PostgreSQL` / `SQLite`) with WASM Driver Adapters** | Prisma provides strict compile-time TypeScript type safety across our 150+ models (`schema.prisma`). By enabling `previewFeatures = ["driverAdapters"]` and patching `WasmPrismaClient` with `PrismaPg(pool)` (`fix-prisma-wasm.sh`), NEYO runs seamlessly across standard PostgreSQL cloud databases and local embedded SQLite/Postgres sandboxes. |
| **In-App OCR Pipeline** | **`tesseract.js` + Web Workers** | Eliminates external Google Vision or AWS Textract API quota ceilings and per-scan fees (`EE.4 Mark Sheet Scan`, `EE.5 Exam Tidying`, `EE.9 Quiz Converter`). Runs entirely inside client browser threads or local edge workers (`0 server billing`). |
| **Barcode & QR Scanning** | **`BarcodeDetector` (Web API) + `jsQR` Polyfill Fallback** | Sub-second (`<150ms`) scanning for `library-client.tsx` (`IssueTab`) and `gate-client.tsx` (`EE.11` QR Gate Passes). If the native browser `BarcodeDetector` lacks `qr_code` support or throws `InvalidStateError`, the pipeline auto-falls back to pure JavaScript `jsQR` canvas inspection. |
| **UI Components & Icons** | **Tailwind CSS + `lucide-react` + Apple Craft** | Zero CSS bloat. Utility-first Tailwind guarantees exact responsive breakpoints (`max-h-[88vh] sticky bottom-0 mobile layouts`). `lucide-react` provides standardized, crisp SVG icons (`Wand2`, `Printer`, `QrCode`, `Sparkles`). |
| **Financial & SMS Gateways** | **Safaricom Daraja API + Africas Talking SMS** | Native integration with Kenyan mobile money (`KES` M-Pesa Paybills, STK Push `I.41`, B2C Petty Cash `T.10`) and nationwide SMS carrier networks (`EE.12` KNEC placement lookup, fee reminders `I.99`). |

---

## SECTION 3 — Repository Folder Structure Breakdown (`/home/user/neyorepolink`)

```
neyorepolink/
├── prisma/
│   ├── schema.prisma                 # Master database schema: all 16/19 roles, models, and relations
│   ├── seed.ts                       # Production seed script: 4 schools, Principal & Founder accounts (Karibu2026!)
│   └── migrations/                   # Chronological SQL migration files (`20260713174433` to `20260717050000`)
├── src/
│   ├── app/
│   │   ├── (app)/                    # Authenticated app route-group layout (sidebar, topbar, AppGrid switcher)
│   │   ├── api/                      # Backend API route handlers (`/api/academics/*`, `/api/qr-scan/*`, etc.)
│   │   ├── print/timetable/          # Chrome-free printing route (`⌘P`: ACHOLA ROSE exact match layout)
│   │   └── page.tsx                  # Public homepage (`I.52 Landing Polish & SEO`)
│   ├── components/                   # Interactive UI Components (Liquid Glass rounded-2xl workspaces & modals)
│   │   ├── academics/                # QuestionBankModal (`EE.8`), StemSimulationStation (`EE.13`), PrintTimetablePage
│   │   ├── cbc/                      # UniversalPresetsModal (`EE.15`), CbcClient
│   │   ├── students/                 # StudentDutiesModal (`K.2 / K.12`), ImportWizard (`BB.4 / DD.4`)
│   │   └── library/                  # LibraryClient (`IssueTab` scan auto-fill due date)
│   └── lib/
│       ├── core/                     # Core registries: `roles.ts`, `ee-features.ts`, `tenant-tables.ts`
│       ├── data/                     # Seeded libraries: `kicd-question-bank-expansion-15.ts` (227 Qs), KICD strands
│       ├── services/                 # 185+ business domain backend services (`*.service.ts`)
│       └── validations/              # Strict Zod input schemas (`qr-gate-pass.ts`, `question-bank.ts`, etc.)
├── scripts/                          # Automated standalone integration test verification suites (`15 standalone suites`)
│   ├── ee1-ee2-cbc-substrand-comment-bank-test.ts
│   ├── ee11-qr-gate-pass-test.ts     # 11/11 checks passing (<150ms QR status verification)
│   ├── ee12-ee15-strategic-roadmaps-test.ts # 7/7 checks passing (KNEC SMS, STEM labs, A4 PDF, Universal Presets)
│   └── fix-prisma-wasm.sh            # WASM query engine & PrismaPg driver adapter patcher
├── docs/                             # Master internal documentation (`FEATURES-CHECKLIST.md`, `CONTEXT-ANCHOR.md`)
├── external-backup/                  # Byte-identical synchronized doc backup mirrors (`external-backup/docs/`)
└── neyo-bible/                       # The NEYO Knowledge System (This 21-Level Bible directory)
```

---

## SECTION 4 — Exhaustive Database Schema Documentation (`schema.prisma`)

### 4.1 Multi-Tenant Pool Abstraction (`withTenant` & `TENANT_OWNED_MODELS`)
Every database table belonging directly to a school carries a non-nullable `tenantId String` column (`indexed alongside primary search keys`). The canonical registry of all tenant-scoped tables resides inside `src/lib/core/tenant-tables.ts`:

```typescript
export const TENANT_OWNED_MODELS = [
  "user", "staffProfile", "leaveRequest", "substituteAssignment", "jobPosting", "jobApplication", "appraisal",
  "disciplinaryRecord", "trainingRecord", "staffSalary", "payrollRun", "payslip", "feeStructure", "feeItem",
  "invoice", "teacherCashPaymentRequest", "cbcStrand", "cbcSubstrand", "cbcAssessment", "cbcCommentBankEntry",
  "exam", "examReleaseApprovalRequest", "examSubject", "examResult", "assessmentType", "assessmentPlan",
  "assessmentRecord", "assessmentEvidence", "competencyGroup", "competency", "competencyEvidence", "curriculum",
  "educationLevel", "gradeBand", "learningArea", "activityCategory", "department", "subject", "academicTerm",
  "dutyRosterEntry", "timetableSlot", "lessonPlan", "homework", "classNote", "homeworkSubmission", "student",
  "schoolClass", "studentSubjectSelection", "libraryBook", "libraryCopy", "libraryLoan", "gatePass", "qrScanEvent",
  "scannedExamPaper", "questionBankEntry", "questionBankAttempt", "paperQuizFormativeBatch", "interSchoolContest",
  "contestQuestion", "contestRegistration", "contestAttempt", "syllabusTopic", "lessonObservation",
  "studentDutyArea", "studentDutyAssignment", "rubric", "rubricLevel", "skillsPassportEntry", "portfolioItem"
];
```

Whenever `withTenant(db, tenantId)` is invoked inside any domain service (`*.service.ts`), a Prisma client proxy automatically intercepts query payloads and appends `where: { tenantId }` or injects `data: { tenantId }`.

### 4.2 Detailed Model Breakdown across All Core Domains
- **Organization & Configuration**: `Tenant` (`id, name, slug, country, tenantConfig JSON`), `TenantModule` (`moduleKey, isEnabled`).
- **Users & Identities**: `User` (`email, neyoLoginId, passwordHash, role, active`), `StaffProfile` (`idNumber, kraPin, basicSalaryKes`), `IdSequence` (`sequenceKey, lastValue`).
- **Academic Structure & Core vs Essential Mathematics (`P.2`)**: `EducationLevel`, `GradeBand`, `SchoolClass` (`level, stream, classTeacherId`), `Subject` (`isCompulsory, pathwayVariant: "MATC" | "MATE" | null`).
- **Syllabus Coverage & Immutability (`I.97 / I.88`)**: `SyllabusTopic` (`classId, subjectId, topicName, status: "COVERED" | "NOT_COVERED" | "IN_PROGRESS"`), `LessonPlan`, `LessonObservation`. Ordinary teachers (`Role: TEACHER`) are strictly `FORBIDDEN` from deleting historical records (`deleteCbcAssessment()`).
- **Continuous Assessment & Rubrics (`Part EE`)**: `CbcStrand`, `CbcSubstrand`, `CbcAssessment`, `CbcCommentBankEntry`, `Rubric` (`scaleType: "4_POINT" | "8_POINT_SENIOR"`), `RubricLevel` (`levelNumber: 1..8, code: "EE" | "ME" | "AE" | "BE" | "EE+"..`).
- **Exams, Tidying & Question Bank (`EE.5, EE.8`)**: `Exam`, `ExamSubject`, `ExamResult`, `ScannedExamPaper`, `QuestionBankEntry` (`diagramSvg`), `QuestionBankAttempt`.
- **Finance, M-Pesa Ledgers & Installment Plans (`B.7, I.99`)**: `FeeStructure`, `FeeItem`, `Invoice` (`balanceKes`), `Payment` (`method: "MPESA_STK" | "BANK_DEPOSIT"`), `PromiseToPay` (`installments JSON`).
- **Library & QR Gate Checkpoint (`B.15, EE.11`)**: `LibraryBook`, `LibraryCopy`, `LibraryLoan`, `GatePass` (`code: "GP-0001", issuedAt, usedAt, returnedAt DateTime?`), `QrScanEvent` (`scanDurationMs`).

---

## SECTION 5 — Master API Reference & Route Topology (`src/app/api/*`)

Every API endpoint operates inside a Next.js 14 Route Handler (`route.ts`). All requests pass through a strict 5-part execution pipeline:
1. Session JWT authorization (`authService.getSession(req)`).
2. Permission verification (`requirePermission(user, "ACADEMICS_MANAGE")`).
3. Feature switch checking (`assertEeFeatureReleased("EE.15")`).
4. Strict Zod input body validation (`src/lib/validations/*.ts`).
5. Transactional query execution (`withTenant(db, tenantId)`).

### 5.1 Comprehensive Endpoint Registry Table

| Endpoint Route | Governing Service & Method | Input Validation Schema (`Zod`) | Security Authorization | Return Payload & Performance Target |
| :--- | :--- | :--- | :--- | :--- |
| `POST /api/qr-scan/gate-pass` | `scanForGatePassStatus()` (`qr-scan.service.ts`) | `z.object({ code: z.string(), action: z.enum(["EXIT", "RETURN"]).optional() })` | `assertEeFeatureReleased("EE.11")` + Role check | `{ status: "ALLOWED" \| "NOT_ALLOWED".., pass: GatePass, canExit: boolean }` (`<150ms`) |
| `POST /api/webhooks/sms-knec` | `lookupKnecPlacement()` (`sms-knec.service.ts`) | `z.object({ from: z.string(), text: z.string() })` (`22263 style`) | `assertEeFeatureReleased("EE.12")` + HMAC Signature | `{ reply: "Student Kamau placed in Grade 10 STEM...", billed: KES 30 }` |
| `GET /POST /api/cbc/universal-presets` | `applyUniversalCbcPresets()` (`universal-presets.service.ts`) | `z.object({ tenantId: z.string().optional() })` | `assertEeFeatureReleased("EE.15")` + `requirePermission("CBC_MANAGE")` | `{ success: true, competenciesApplied: 7, rubricsApplied: 4, skippedDuplicates: 21 }` |
| `GET /api/portfolio` | `generatePortfolioPdfBookletHtml()` (`portfolio.service.ts`) | `?studentId=123&export=pdf&print=1` | `assertEeFeatureReleased("EE.14")` + Guardian scope check | Formatted A4 HTML document string with `window.print()` auto-trigger (`not JSON`). |
| `POST /api/students/import/preview` | `previewImport()` (`student-import.service.ts`) | `z.object({ rows: z.array(z.any()), classId: z.string() })` | `requirePermission("STUDENTS_IMPORT")` | `{ unknownSubjects: ["Agric & Nutr"], rowsWithSubjectsCount: 45, hasCompulsory: true }` |
| `POST /api/academics/timetable/engine` | `publish_timetable()` / `draft_timetable()` (`timetable-engine.service.ts`) | `z.object({ action: z.enum(["publish_timetable", "draft_timetable"]), planId: z.string() })` | `requirePermission("TIMETABLE_MANAGE")` | `{ success: true, status: "PUBLISHED", notificationsDispatched: 18 }` |

---

## SECTION 6 — Environment Variables Definition Guide (`.env`)

```bash
# 1. DATABASE CONNECTION URL (PostgreSQL or Embedded Postgres)
DATABASE_URL="postgres://postgres:postgres@127.0.0.1:5432/neyo"

# 2. NEXTAUTH / SESSION SECURITY SECRET
NEXTAUTH_SECRET="super_secret_enterprise_jwt_token_key_2026"
NEXTAUTH_URL="http://localhost:3000"

# 3. SAFARICOM DARAJA API (M-PESA STK PUSH & B2C PETTY CASH)
DARAJA_CONSUMER_KEY="Encrypted_Or_Plain_Consumer_Key"
DARAJA_CONSUMER_SECRET="Encrypted_Or_Plain_Consumer_Secret"
DARAJA_PASSKEY="Safaricom_Daraja_Passkey"
DARAJA_SHORTCODE="174379"

# 4. AFRICAS TALKING (SMS GATEWAY FOR KNEC LOOKUPS & REMINDERS)
AFRICASTALKING_API_KEY="Africas_Talking_Prod_Key"
AFRICASTALKING_USERNAME="neyo_education"

# 5. CLOUDFLARE R2 OBJECT STORAGE (STORAGE VAULT & EXAM PAPERS)
R2_ACCOUNT_ID="Cloudflare_Account_Id"
R2_ACCESS_KEY_ID="R2_Access_Key"
R2_SECRET_ACCESS_KEY="R2_Secret_Key"
R2_BUCKET_NAME="neyo-uploads-prod"

# 6. NODE EXECUTION SETTINGS (PREVENTING MEMORY EXHAUSTION DURING TYPECHECK)
NODE_OPTIONS="--max-old-space-size=6144"
```

---

## SECTION 7 — AI Development Guide & Zero AI Debt Protocol

Because NEYO is architected through high-speed human-AI engineering collaboration led by a solo founder specialized in **Project Planning and Management (PPM)**, AI models operate as senior engineering partners executing precise Work Breakdown Structures (`The 8-Chunk Plan`).

To eliminate "AI Debt" (`hallucinated imports, missing withTenant boundaries, unverified mocks, or unescaped JSX syntax errors`), all AI interactions must adhere to our strict institutional execution protocol:

### 7.1 The 8-Chunk Plan (Execution WBS)
Whenever an AI starts building a feature or completing a backlog (`PROMPT 2`), it must strictly execute and document the **8-Chunk Plan**:
1. **Database & Migrations (`schema.prisma`)**: Define precise tables, enums, indexes, and run migration recovery (`SOP-SEC-01` / `_prisma_migrations`) if needed.
2. **Security & Validation (`zod`)**: Create strict Zod input schemas inside `src/lib/validations/*.ts`.
3. **Backend Services (`*.service.ts`)**: Build full-stack queries inside `withTenant(db, tenantId)` and `assertTenant()`.
4. **API Endpoints (`src/app/api/...`)**: Create Route Handlers enforcing `requirePermission()` and `assertEeFeatureReleased()`.
5. **UI Components (`src/components/...`)**: Build Liquid Glass (`rounded-2xl`) React components with `lucide-react` icons.
6. **Frontend Pages (`src/app/...`)**: Wire components into Odoo/Apple/Linear page layouts (`AppGrid` + breadcrumbs).
7. **The 4 UX States**: Explicitly verify and render Loading (`skeleton pulse`), Empty (`icon + action pill`), Error (`high-contrast banner`), and Populated states.
8. **Kenyan Seed Data & Verification Suite (`scripts/`)**: Seed real Kenyan data (`Karibu High`, `KES`, `+254`) and write a standalone integration test script verifying 100% full-stack logic.

### 7.2 The Bundi Rule (`PROMPT 1`)
- **NEVER write the word "AI" anywhere in product copy.**
- The AI must always use: *"Bundi is here to help"*, *"Bundi drafts..."*, or *"Ask Bundi"*.
- Core features must never depend on external AI/LLM API calls to function during routine school hours (`0 API running costs`).

### 7.3 Pre-Merge Human Code Review Checklist
Before merging any AI patch set into `arena/019f6b74-neyorepolink`:
- [ ] **Typecheck**: Does `NODE_OPTIONS="--max-old-space-size=6144" npx tsc --noEmit` return 0 errors?
- [ ] **Test Verification**: Do all 15 standalone verification suites run with zero failures (`126/126 passing`)?
- [ ] **No Placeholders**: Are there any TODOs, fake `return {}` mocks, or hardcoded dummy arrays?
- [ ] **Doc-Sync Continuity**: Are `docs/FEATURES-CHECKLIST.md` and `docs/CONTEXT-ANCHOR.md` updated and byte-identical (`md5sum`) across all backup mirrors (`external-backup/docs/`)?
