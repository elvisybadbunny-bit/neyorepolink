# Level 20 — The Supreme NEYO Constitution & Comprehensive SaaS Legal Suite
**Document Id**: `NEYO-BIB-L20`  
**Owner**: NEYO Executive Leadership, Chief Legal Counsel & Systems Architect  
**Status**: Supreme Institutional Governance & SaaS Legal Suite  
**Last Updated**: 2026-07-17  

---

## PART I — THE SUPREME NEYO MASTER CONSTITUTION

### Preamble
We, the leadership and engineers of NEYO (`company: NEYO`), in order to establish a permanent, immutable, and future-proof digital operating system for educational institutions across Kenya and the African continent, do hereby ordain and establish this **Supreme Master Constitution**. This charter binds every line of code (`schema.prisma`, `*.service.ts`), every API handler (`src/app/api/...`), every user interface (`src/components/...`), and every operational workflow across our enterprise.

---

### Article I: Sovereignty, Identity & Scope
- **Section 1 (Corporate Identity)**: NEYO (`company: NEYO`) is an independent software engineering enterprise headquartered in Nairobi, Kenya (`currency: KES`, phone format `+254 7XX XXX XXX`).
- **Section 2 (System Scope)**: NEYO is a **Curriculum-Independent, Offline-Resilient School Operating System (`Part J / Part Z`)**. It shall govern academic assessment (`CbcAssessment`), financial ledgers (`Invoice`, `Payment`), multi-stream timetables (`Wand2`), and physical campus security (`GatePass EE.11`) across participating institutions (`Tenant`).

---

### Article II: The 10 Product Principles (`The Build Constitution`)
Every software module built inside `/home/user/neyorepolink` shall strictly adhere to our 10 architectural commandments:
1. **Odoo + Apple + Linear Structural Hierarchy**: Modules must feature a top-left `AppGrid` switcher, left sidebar (`SidebarNav`), and multi-view toggles (`List/Kanban/Form/Print`), wrapped in Apple craft (`rounded-2xl`, 200ms motion) and Linear keyboard speed (`⌘K CommandPalette`, case-insensitive type-to-search `StudentSearchSelect`).
2. **Liquid Glass Aesthetic (`Part O`)**: Workspaces must wrap inside `rounded-2xl` frosted glass cards with dynamic background blurs controlled by `tenantConfig.liquid_level` (`0 flat white to 100 crystal glass`).
3. **Zero Data Loss (`cant be deleted anyhowly`)**: Historical financial invoices and academic observations (`CbcAssessment`, `LessonObservation`) are legal institutional evidence. They must never be deleted by unauthorized staff (`Role: TEACHER`).
4. **Offline-First Resilience (`Z.1`)**: Recognizing rural internet disconnections, critical daily loops (marking attendance, scanning gate passes `<150ms`) must execute locally via PWA Service Workers and synchronize upon connection restoration.
5. **Human-First Automation (`The Bundi Rule`)**: **Never write the word "AI" in customer-facing product copy.** Teachers reject anonymous "Artificial Intelligence" that claims to replace them; they embrace **Bundi**—our friendly digital owl who assists them with heavy computation (`"Bundi drafts your schedule"`, `"Bundi helps OCR scan your quiz EE.9"`).
6. **Zero External OCR & Vision API Costs**: All optical character recognition (`Mark Sheets EE.4`, `Exam Tidying EE.5`, `Paper Quizzes EE.9`) and barcode scanning (`Library IssueTab B.15`, `QR Gate EE.11`) must run locally using in-app `tesseract.js` and `BarcodeDetector / jsQR` engines (`0 third-party API fee`).
7. **Total Fiscal Transparency (`Biometric Finance Gate R.3`)**: Every Kenyan Shilling (`KES`) paid via M-Pesa STK Push (`Mzazi Direct Pay I.41`) or bank deposit (`R.5`) must reconcile automatically against student ledgers with zero double-counting (`partial-payment-friendly-test.ts`).
8. **Chrome-Free Document Printing (`⌘P`)**: Printed artifacts (`Timetables ACHOLA ROSE format`, `Digital Portfolios EE.14`, `Report Cards`) must render on dedicated outside-app routes (`/print/*`) covering A4 paper edge-to-edge (`margin: 6mm`) with merged break/lunch columns (`rowSpan={days.length}`) and bottom-right `Powered by NEYO` watermarks.
9. **Multi-Domain & Multi-Kid Adaptation**: NEYO must cleanly handle multi-kid siblings (`Part R / R.8`) under single guardian billing and parse messy school spreadsheets (`BB.4 / DD.4`) using `populateSubjectMap()` (`&` vs `and` normalization).
10. **The 8-Chunk WBS Discipline**: All engineering features must follow our 8-Chunk Plan (`schema.prisma` -> Zod -> `withTenant` -> Route Handler -> `lucide-react` UI -> Page -> 4 UX States -> Standalone integration test `scripts/ee*-test.ts`).

---

### Article III: Multi-Tenant Data Sovereignty (`A.2`)
- **Section 1 (Cryptographic Tenant Isolation)**: Every model belonging directly to a school must reside inside `export const TENANT_OWNED_MODELS = [...]` (`src/lib/core/tenant-tables.ts`) and carry a non-nullable `tenantId String` column.
- **Section 2 (Query Scoping Mandate)**: All backend queries and mutations inside domain services (`*.service.ts`) must wrap inside `withTenant(db, tenantId)` or `assertTenant(req)`, injecting strict `.where({ tenantId })` boundaries (`y3-tenant-isolation-sweep-test.ts`). A school's data is inviolable and inaccessible by any other school.

---

### Article IV: Academic & Financial Immutability (`I.88`)
- **Section 1 (Teacher Deletion Prohibition)**: Ordinary classroom educators (`Role: TEACHER`) are strictly **FORBIDDEN (`HTTP 403`)** from executing database `DELETE` queries on `CbcAssessment`, `LessonObservation`, or `SyllabusTopic` (`cant be deleted anyhowly`).
- **Section 2 (Leadership Voiding & Audit)**: Only `PRINCIPAL`, `DEAN_OF_STUDIES`, or `FOUNDER` can void or delete erroneous records. Every deletion writes an immutable entry into `AuditLog` (`A.13`), recording exact timestamps, prior values, and justification.

---

### Article V: The Bundi AI Ethics Charter (`PROMPT 1`)
- **Section 1 (Copy Restriction)**: No engineer, contractor, or AI assistant shall commit code containing the words `"AI"`, `"Artificial Intelligence"`, or `"AI-generated"` inside user-facing React components or alert banners.
- **Section 2 (Zero Student Data Training)**: Learner continuous assessment marks, parent M-Pesa phone numbers, and school financial ledgers shall **never** be transmitted to external public Large Language Models (`LLMs`) for model training or prompt embedding. All computations execute within our private self-hosted database engines and local Web Workers.

---

### Article VI: Capacity-Based Pricing System 2.0 Charter (`Part V`)
- **Section 1 (Flat Tier Pricing)**: NEYO repudiates per-module add-on fees. Schools subscribe to single all-inclusive annual or monthly capacity tiers (`Starter KES 60k/yr <= 250 students`, `Professional KES 150k/yr <= 800 students`, `Enterprise KES 350k/yr <= 2500+ students`).
- **Section 2 (Grace Enforcement)**: When a school exceeds its capacity tier mid-term (`class-capacity-overflow.service.ts`), the system shall grant an automatic **14-day grace period (`i48-grace-enforcement`)** without blocking operational access.

---

### Article VII: Founder Authority & Role Governance (`Y.2`)
- **Section 1 (Supreme Treasury & Flag Authority)**: Only accounts holding `Role: FOUNDER` (`or legacy SUPER_ADMIN`) can modify subscription tier pricing (`Part V`), alter corporate cap tables, or toggle master platform release switches (`eefeature:*` inside `PlatformFlag`).
- **Section 2 (Mandatory Two-Factor Defense)**: All company and school leadership roles (`FOUNDER`, `NEYO_OPS`, `PRINCIPAL`, `BURSAR`) must enroll in Time-based One-Time Password (`TOTP / 2FA G.34`) defense upon initial login.

---
---

## PART II — COMPREHENSIVE SAAS LEGAL, SECURITY & COMPLIANCE SUITE

In accordance with international enterprise software engineering standards (`SOC2 Type II`, `ISO 27001`) and Kenyan statutory law (`Kenya Data Protection Act 2019 / DPA`), NEYO maintains the following exhaustive legal and operational charters:

### 1. Master Services Agreement (`MSA` — Enterprise School Networks)
- **Scope & Term**: Governs multi-year software deployments across participating primary, junior secondary, and senior secondary schools. Incorporates our **Capacity-Based Pricing System 2.0 (`Part V`)**.
- **Intellectual Property Rights**: NEYO retains 100% ownership of the operating system software (`elvisybadbunny-bit/neyorepolink`), our `Odoo + Apple + Linear Liquid Glass` UI system, and the `Bundi` brand identity. The participating school (`Tenant`) retains 100% ownership of its entered student demographics, exam marks, and financial ledgers.
- **Warranties & Disclaimers**: NEYO warrants that the software contains no intentional backdoors or malicious code. Software is provided with a 99.9% uptime target and local offline resilience (`Z.1`), but NEYO disclaims liability for carrier-side Safaricom Daraja API network outages or third-party Africas Talking SMS delivery delays.

---

### 2. Data Processing Agreement (`DPA` — Kenya DPA 2019 & GDPR Compliance)
- **Roles of Parties**: The **Participating School (`Tenant`)** is the statutory **Data Controller** (determining the purpose and means of processing learner/parent data). **NEYO (`company: NEYO`)** is the **Data Processor** (executing computations and data storage strictly on school instructions).
- **Processing Categories & Purpose**: Processing is limited strictly to: (a) Student academic assessment (`CbcAssessment`, `ExamResult`); (b) Fee structure invoicing and M-Pesa IPN reconciliation (`Payment`); and (c) School gate security check-in/out tracking (`GatePass EE.11`).
- **Data Subject Rights & Breach Notification**: NEYO assists schools in responding to parent/student requests for data access or deletion (`subject to academic record immutability statutory retention laws`). In the unlikely event of a confirmed database breach, NEYO shall notify the Data Controller (`Principal / School Owner`) within **72 hours** alongside full technical forensics.

---

### 3. Service Level Agreement (`SLA`) & System Maintenance Charter
- **Uptime Commitment**: NEYO targets **99.9% monthly server availability** (`allowing no more than 43.8 minutes of unplanned cloud server downtime per month`).
- **SLA Credits**: If cloud server uptime drops below 99.0% in a given calendar month (`excluding planned maintenance or carrier SMS/M-Pesa outages`), participating schools receive a **10% subscription fee credit** applied to their next billing cycle (`Cost Cockpit u1`).
- **Planned Maintenance & Shutdown Charter (`i48-maintenance-shutdown`)**: Scheduled system upgrades must occur during off-peak Kenyan night hours (`1:00 AM to 4:00 AM EAT`). NEYO dispatches system-wide top-bar notification warnings (`I.34`) at least 48 hours prior to maintenance windows.
- **Offline Resilience Protection (`Z.1`)**: Because NEYO's Progressive Web App (`PWA`) Service Worker enables local attendance marking and `<150ms` QR gate checkpoint stamping during rural internet blackouts, local connectivity drops do not constitute an SLA service interruption.

---

### 4. Information Security Policy (`Infosec / SOC2 Type II Readiness Charter`)
- **Encryption at Rest & in Transit**: All network communications must pass through `HTTPS / TLS 1.3`. Sensitive third-party API credentials (`Daraja Consumer Secret`, `Africas Talking API Key`) are encrypted using **AES-256-GCM** inside our confidential `StorageVault` (`I.56 / I.60`), never stored as plain text in Postgres.
- **Authentication & Role-Based Access Control (`RBAC`)**: Access to endpoints requires valid session JWTs (`authService.getSession`). Roles are strictly evaluated via `requirePermission()` and bounded by `TENANT_OWNED_MODELS` multi-tenant scoping (`withTenant`). Mandatory 2FA (`TOTP G.34`) is enforced for all leadership tiers.
- **Audit Logging & Forensics (`A.13`)**: Every database write, fee ledger modification, `ViewAs` impersonation session (`F.3`), and leadership deletion logs an immutable entry inside `AuditLog`, retaining exact user IPs, user IDs, and payload diffs for statutory compliance.

---

### 5. Incident Response Plan (`IRP` & Database Corruption Protocol `SOP-SEC-01`)
- **Triage & Severity Classification**:
  - `Severity 1 (Critical)`: Database corruption or multi-tenant query isolation drift. Immediate notification to `FOUNDER` and Lead Technical Architect.
  - `Severity 2 (High)`: Safaricom Daraja M-Pesa IPN webhook failure (`Mzazi Direct Pay I.41`). Switch to manual `Receipt Delivery R.5` and invoke **Central Money Reconnect (`I.49`)**.
  - `Severity 3 (Medium/Low)`: Minor UI layout shift or unmapped subject warning (`unknownSubjects` during Excel import `BB.4`).
- **Emergency Database Recovery Protocol**: If sandboxed environment nodes lose compiled query binaries (`SSL_ERROR_SYSCALL` on `binaries.prisma.sh`), immediately execute our exact raw SQL recovery runbook (`Runbook 2` inside `17-OPERATIONAL-RUNBOOKS.md`), applying all 14 chronological migrations against `postgres://postgres:postgres@127.0.0.1:5432/neyo` and patching WASM driver adapters (`fix-prisma-wasm.sh`) in under 60 seconds (`restoring 100% full-stack operation with zero data loss`).

---

### 6. Business Continuity & Disaster Recovery Plan (`BCDR`)
- **Backup Frequency & Retention**: The primary database (`PostgreSQL 18.4`) undergoes continuous WAL (`Write-Ahead Log`) archiving plus **immutable daily snapshots** stored across geographically distributed cloud storage nodes (`Cloudflare R2`).
- **Recovery Time Objective (`RTO`) & Recovery Point Objective (`RPO`)**:
  - `RTO (Maximum acceptable downtime during total cloud region failure)`: **4 Hours** (`achieved by booting our self-contained WASM PrismaPg driver adapter shims on secondary serverless regions`).
  - `RPO (Maximum acceptable data loss)`: **15 Minutes** (`protected by WAL streaming and local Service Worker queue persistence`).

---

### 7. Vulnerability Management & Responsible Disclosure Policy (`Security.md` Expansion)
- **Reporting Channel**: Security researchers and participating school IT officers can submit discovered vulnerabilities directly to `founder@neyo.co.ke` or via our secure **Developer Center (`Part X`)** security portal.
- **Responsible Disclosure Pledge**: NEYO pledges not to initiate legal action against researchers who discover and report vulnerabilities in good faith without exfiltrating or modifying live school data, disrupting system uptime (`DDOS`), or accessing other tenants' records (`A.2`).
- **Remediation SLAs**: Critical cryptographic or isolation vulnerabilities are patched within **24 hours**. High-severity authorization bypasses are patched within **7 days**.

---

### 8. Sub-Processor Registry (Exhaustive Third-Party Vendors)
In compliance with DPA and GDPR transparency rules, NEYO registers the following audited sub-processors:

| Sub-Processor Vendor | Service Provided | Processing Location | Security Certification & Safeguards |
| :--- | :--- | :--- | :--- |
| **Vercel, Inc.** | Next.js 14 App Router Edge Hosting & Serverless Route Handlers (`src/app/api/*`). | Global / AWS Cloud Regions | SOC2 Type II, ISO 27001, TLS 1.3 Encryption. |
| **Prisma Data / PostgreSQL (`EmbeddedPostgres`)** | Relational Database Engine (`schema.prisma` / `TENANT_OWNED_MODELS`). | Cloud Regions / Local Edge | Multi-Tenant Scoping (`withTenant`), AES-256 Vault. |
| **Cloudflare, Inc. (R2 Storage)** | Object Storage (`ScannedExamPaper`, `PortfolioItem J.7`, `Document A.9`). | Global CDN / Storage Nodes | SOC2 Type II, Zero-Egress Encryption at Rest. |
| **Safaricom PLC (Daraja API)** | M-Pesa STK Push (`Mzazi Direct Pay I.41`) & B2C Petty Cash (`T.10`). | Nairobi, Kenya (Safaricom Cloud) | Statutory Kenyan Banking & Communications Regulation. |
| **Africas Talking Ltd.** | Bulk SMS Carrier Gateways (`EE.12` KNEC Lookups, `I.99` Fee Reminders). | Nairobi, Kenya | Statutory Communications Authority of Kenya (`CAK`) license. |

---

### 9. Developer Center & API Terms of Use (`Part X Developer Center 2.0`)
- **API Key Governance (`x1-developer-center-test.ts`)**: Schools on our Professional and Enterprise tiers can generate scoped API keys (`ApiKey` model) to connect custom biometric hardware or external accounting systems (`Tally / QuickBooks`).
- **Rate Limiting & Abuse Prevention**: Standard API keys are rate-limited to **600 requests per minute per tenant**. Exceeding rate limits triggers `HTTP 429 Too Many Requests`.
- **HMAC Webhook Signatures**: All outgoing webhooks (`/api/webhooks/*`) signed with `HMAC-SHA256` headers using the school's secret webhook key. Third-party consumers must verify signatures before processing payloads.

---

### 10. Partner, Reseller & Affiliate Commission Agreement (`t6-influencer-codes`)
- **Referral Tracking**: Independent educational consultants and regional sales partners can enroll in our **Influencer & Referral Code Engine (`t6-influencer-codes-test.ts` / `Referral` model)**.
- **Commission Remittance**: Partners earn a **20% recurring revenue share** on every onboarded school's annual subscription (`Capacity Pricing Part V`) for the first 2 years of active service, settled automatically to their M-Pesa or bank account via our revenue operations ledger (`revenue-ops.service.ts`).
