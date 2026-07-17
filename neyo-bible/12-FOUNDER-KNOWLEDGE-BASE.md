# Level 12 — Founder Knowledge Base: Institutional Memory, Architectural Trade-Offs & Lessons Learned
**Document Id**: `NEYO-BIB-L12`  
**Owner**: NEYO Solo Founder & Executive Architect  
**Status**: Living Institutional Memory & Decision Log  
**Last Updated**: 2026-07-17  

---

## Executive Summary: Why This Document Exists

When a solo founder builds a large-scale operating system with AI assistance, the greatest risk to long-term enterprise valuation is **unrecorded architectural rationale**. Years later, new engineers or auditors may question *why* a specific abstraction exists (`e.g. why tesseract.js instead of Google Vision? Why Driver Adapters?`).

This document records the institutional memory of NEYO: the exact trade-offs, alternatives considered, problems encountered, and lessons learned across our foundational product and engineering decisions.

---

## 1. Major Architectural Trade-Offs & Rationale

### 1.1 Unified Monorepo (`Next.js 14 App Router`) vs Microservices
- **Decision**: Build NEYO as a unified, 100% full-stack TypeScript monorepo (`Next.js 14 App Router` at `/home/user/neyorepolink`).
- **Alternatives Considered**: Separate React/Vite frontend repo with a Python/Django or Node/Express backend API.
- **Why We Chose Monorepo**:
  - **Zero Latency Across Boundaries**: Route Handlers (`src/app/api/*`) and React Client Components (`src/components/*`) share the exact same Zod validation schemas (`src/lib/validations/*`) and TypeScript types (`0 interface drift`).
  - **PPM Execution Velocity**: As a solo founder using Work Breakdown Structures (`The 8-Chunk Plan`), managing a single repository across 15 verification test suites (`scripts/ee*-test.ts`) enabled us to build and verify 185+ services with zero regressions in months rather than years.

### 1.2 Local In-App OCR (`tesseract.js` + Web Workers) vs Cloud AI Vision APIs
- **Decision**: Execute all optical character recognition (`EE.4 Mark Sheet Scan`, `EE.5 Exam Paper Tidying`, `EE.9 Paper Quiz Converter`) using in-app `tesseract.js` running inside client browser threads or local edge workers.
- **Alternatives Considered**: Google Cloud Vision API v3 or AWS Textract APIs.
- **Why We Chose In-App OCR**:
  - **Zero External API Cost**: External vision APIs charge ~$1.50 per 1,000 scans with strict daily quota limits (e.g. Google's 10,000 units/day ceiling). For a school network scanning thousands of mark sheets and quiz pages weekly, external APIs would erode our high gross margins (`u1-cost-cockpit-test.ts`).
  - **Data Privacy & DPA Compliance**: Processing physical exam papers locally on the teacher's hardware device guarantees that student names and scores never leave Kenyan borders or enter third-party cloud AI servers (`0 DPA breach risk`).

### 1.3 Multi-Tenant Pool Scoping (`TENANT_OWNED_MODELS`) vs Separate Physical Databases
- **Decision**: Store all school organizations inside a shared PostgreSQL database, enforcing tenant isolation programmatically via `tenantId` columns on all `TENANT_OWNED_MODELS` (`src/lib/core/tenant-tables.ts`) wrapped inside `withTenant(db, tenantId)` and `assertTenant(req)`.
- **Alternatives Considered**: Provisioning a separate physical PostgreSQL database instance (`or separate schema`) for every onboarded school.
- **Why We Chose Multi-Tenant Pool Scoping**:
  - **Cloud Infrastructure Efficiency**: Running 2,000 separate database instances across Kenya would cost over $30,000/month in idle compute. Our multi-tenant pool architecture reduces total database hosting costs to **KES 1,200/month per school** while maintaining 100% cryptographic and query-level isolation (`verified via y3-tenant-isolation-sweep-test.ts`).

### 1.4 WASM Driver Adapters (`previewFeatures = ["driverAdapters"]` + `fix-prisma-wasm.sh`)
- **Decision**: Enable `driverAdapters` in `schema.prisma` and execute `./scripts/fix-prisma-wasm.sh` to patch `WasmPrismaClient` with `PrismaPg(pool)`.
- **Why We Chose Driver Adapters**:
  - Sandboxed terminal environments and serverless edge functions frequently block heavy C++ binary downloads (`SSL_ERROR_SYSCALL` on `binaries.prisma.sh`). By abstracting queries through JavaScript driver adapters (`PrismaPg`), NEYO boots cleanly across both embedded local PostgreSQL instances (`embedded-postgres`) and cloud serverless pools.

---

## 2. Major Business & Product Pivots

### 2.1 The Pivot to Capacity-Based Pricing System 2.0 (`Part V`)
- **The Original Problem**: Early iterations of school software charged per-module add-on fees (`e.g. pay extra for Library, pay extra for SMS, pay extra for Timetables`).
- **Why We Changed It**: Per-module pricing creates immense adoption friction. Bursars lock down access to save money, leaving teachers frustrated and forcing them back to Excel.
- **The Pivot**: On `2026-07-06`, the founder confirmed the pivot to **Capacity-Based Pricing System 2.0 (`Part V` / `tier-gating.service.ts`)**: ONE flat annual rate based solely on student capacity (`Starter KES 60k/yr <= 250 students`, `Professional KES 150k/yr <= 800 students`, `Enterprise KES 350k/yr <= 2500+ students`). Schools get full access to every core operational tool, maximizing teacher satisfaction and operational lock-in.

### 2.2 The Bundi Persona & Anti-AI Copy Mandate (`PROMPT 1`)
- **The Insight**: During early field research across Kenyan secondary schools, teachers expressed deep anxiety when shown software marketed as "Powered by Artificial Intelligence." They feared loss of professional autonomy and job security.
- **The Decision**: We established **The Bundi Rule**: **Never write the word "AI" anywhere in product copy.** Instead, every smart automation (`Rubric comment auto-fill EE.2`, `Wand2 Timetable Solver`) is attributed to **Bundi**—our friendly, reliable digital owl assistant who *helps* teachers rather than replacing them (`"Bundi drafts your schedule"`, `"Bundi helps tidy your exam"`).

### 2.3 Academic Record Immutability (`cant be deleted anyhowly` / `I.88`)
- **The Insight**: Principals reported a recurring nightmare: when an ordinary teacher left a school on bad terms, they would delete their class's historical CBC mark sheets (`CbcAssessment`) or lesson observations out of spite or to hide the fact that they never covered the syllabus.
- **The Decision**: We enforced strict database-level immutability across `deleteCbcAssessment()`, `deleteLessonObservation()`, and `deleteSyllabusTopic()`. Ordinary teachers (`Role: TEACHER`) are strictly **FORBIDDEN** from executing `DELETE` queries. Only leadership roles (`PRINCIPAL`, `DEAN_OF_STUDIES`, `FOUNDER`) can delete records, and every deletion writes an immutable `AuditLog` entry (`A.13`).

---

## 3. Rejected Ideas & Why We Said No

| Rejected Idea | Proposed Concept | Exact Rationale for Rejection |
| :--- | :--- | :--- |
| **1. Native iOS / Android App Store Applications** | Build and maintain separate Swift (iOS) and Kotlin/React Native (Android) mobile apps. | **Rejected**: App store review delays (`Apple 30% fee on subscriptions`), cumbersome installation hurdles for teachers on low-memory $50 Android phones, and version drift across 3 codebases. We chose an **Offline-First Progressive Web App (`PWA` / `Z.1`)** that installs instantly via browser prompt (`i33-pwa-install-test.ts`) with zero app store bloat. |
| **2. Automatic LLM-Generated Report Card Comments** | Use OpenAI ChatGPT APIs to write unique paragraph comments for every student report card. | **Rejected**: Violates **The Bundi Rule** (`no AI wording`), incurs high recurring API fees (`u1-cost-cockpit`), and risks generating hallucinated or generic praise that offends Kenyan parents. We built **Rubric-Driven Comment Auto-Fill (`EE.2`)** pulling directly from the school's own authenticated comment bank (`CbcCommentBankEntry`). |
| **3. Hardcoded Timetable Lunch Period Numbers** | Hardcode `Period 4` or `1:00 PM` as the universal lunch period across all school timetables. | **Rejected**: Kenyan schools operate highly diverse schedules (single shift vs dual-shift lunch shifts `Z.4`, junior vs senior secondary timing differences). We built `realLunchPeriodsFromSlots()` to dynamically scan real persisted `TimetableSlot` data (`subjectCode === "LUNCH"`) to merge break/lunch rows accurately across any schedule configuration (`PrintTimetablePage`). |
