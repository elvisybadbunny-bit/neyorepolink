# Level 2 — Strategy & Growth: Business Plan, Pricing & Go-To-Market
**Document Id**: `NEYO-BIB-L2`  
**Owner**: NEYO Solo Founder & Strategy Operations  
**Status**: Living Institutional Document  
**Last Updated**: 2026-07-17  

---

## 1. Executive Business Plan & Market Opportunity

### 1.1 The Market Deficit in Kenyan & African Education
Kenya has over **10,000 secondary schools** and **30,000 primary/pre-primary schools** (public and private), serving over 15 million learners. Following the historic transition from the 8-4-4 system to the **Competency-Based Curriculum (CBC / CBE)**, schools face an unprecedented operational burden:
- **Formative Rubric Tracking**: Teachers must track multiple formative assessments (`EE, ME, AE, BE` across 4-Point Primary/Junior rubrics and `1 to 8 Points` across Senior CBE rubrics `EE.15 / J.5`).
- **Senior School Pathway Placement (`EE.12` / `Part J.10`)**: As learners enter Grade 10 (January 2026 rollout), schools must allocate students across STEM, Social Sciences, and Arts & Sports pathways based on KJSEA assessment numbers (`22263 style` lookup).
- **Financial Leakage & Fee Default**: Private schools lose up to 18% of potential revenue due to untracked fee balances, fraudulent bank slips, and lack of automated parent payment reminders (`I.99`).

### 1.2 NEYO's Strategic Solution
NEYO delivers a **Curriculum-Independent, Offline-Resilient School Operating System** that unifies academics, finance, student operations, and communication into a single cloud-and-edge software suite. By offering **Capacity-Based Pricing (`Part V`)** alongside zero-hardware-barrier scanning (`tesseract.js` + camera QR checkpoints `EE.11`), NEYO reduces school software expenditures by 40% while doubling administrative productivity.

---

## 2. Lean Canvas & Business Model Canvas

| Segment | Strategic Element | Exact NEYO Implementation |
| :--- | :--- | :--- |
| **Problem** | 1. CBC/CBE administrative overload.<br>2. Fragmented, desktop-only ERP systems.<br>3. Fee leakage and manual M-Pesa reconciliation.<br>4. Unreliable internet blocking rural operations. | Teachers overwhelmed by manual 8-point rubric grading and mark sheet typing.<br>Bursars manually typing transaction IDs from paper deposit slips.<br>Internet outages causing school reception and library check-outs to halt. |
| **Solution** | 1. **Part EE Mega-Suite**: 1-Click Universal Presets (`EE.15`), OCR Mark Sheets (`EE.4`), and Self-Marking Quiz Bank (`EE.8`).<br>2. **Biometric Finance Gate (`R.3`) & M-Pesa STK Push (`I.41`)**.<br>3. **Offline-First PWA (`Z.1`)** with local Service Worker state persistence. | 100% web and mobile PWA operating across smartphones, tablets, and inexpensive laptops without dedicated local servers. |
| **Unique Value Proposition (UVP)** | **"The only Kenyan School OS that turns paper exams and quizzes into digital LMS records with 1-click OCR—powered by Bundi, priced by capacity, built for zero data loss."** | Liquid Glass interface (`rounded-2xl`), sub-second (`<150ms`) QR checkpoint stamping (`EE.11`), and automated A4 PDF Digital Portfolios (`EE.14`). |
| **Unfair Advantage** | 1. **Zero External AI / OCR Cost API Architecture**: In-app `tesseract.js` and `BarcodeDetector` engines run on client hardware or edge workers (`0 per-scan server billing`).<br>2. **Solo Founder PPM Velocity**: Rapid execution and zero institutional bloat. | Proprietary Kenyan seed database (`227 seeded questions` across Grades 1–10, real KICD rationalised strands across PP1 to Grade 12). |
| **Customer Segments** | 1. Private Primary & Junior/Senior Secondary Schools.<br>2. Public High Schools (`Karibu High School` model).<br>3. Multi-School Academies & Groups (`Uhuru Academy`). | Key Decision Makers: School Directors/Proprietors (`SCHOOL_OWNER`), Principals (`PRINCIPAL`), and Bursars (`BURSAR`). |
| **Key Metrics (KPIs)** | 1. Monthly Active Schools (`MAS`).<br>2. Fee Ledger Volume Processed via M-Pesa (`KES`).<br>3. Weekly Scanned Exam Papers & Mark Sheets (`EE.4/EE.5`).<br>4. Sub-second Gate Pass Scans (`EE.11`). | System Reliability: 100% full-stack test suite passage (`126/126 checks`), zero typecheck errors (`0 errors in tsc --noEmit`). |
| **Channels** | 1. Direct School Field Sales (`Nairobi, Kiambu, Mombasa, Nakuru`).<br>2. Kenya Private Schools Association (KPSA) conference sponsorships.<br>3. Mzazi SMS referral loops and parent portal invites. | Interactive Demo Portal (`/login` with pre-seeded seed accounts: `principal@karibuhigh.ac.ke` / `Karibu2026!`). |
| **Cost Structure** | 1. Cloud Hosting (`Vercel` Edge Workers, `PostgreSQL` Database, `Cloudflare R2` Object Storage).<br>2. SMS Gateway (`Africas Talking / Daraja API`).<br>3. Field sales and customer support tier (`NEYO_SUPPORT`). | Ultra-lean server architecture with automatic storage optimization (`Storage Intelligence Engine Part W`). |
| **Revenue Streams** | 1. **Capacity-Based School Subscription (`Part V`)**.<br>2. **KNEC Assessment Placement Lookup Fee (`EE.12` / `KES 30/query`)**.<br>3. **Direct M-Pesa Transaction Conveyance Fee (`0.5%–1%`)**.<br>4. **Alumni Storage & Certificate Verification (`Part W`)**. | Tiered billing: `Core Tier`, `Professional Tier`, and `Enterprise Multi-School Tier` (`tier-gating.service.ts`). |

---

## 3. Revenue Models & Pricing Strategy (`KES`)

### 3.1 NEYO Capacity-Based Pricing System 2.0 (`Part V`)
Instead of charging confusing per-module fees that penalize schools for adopting new tools, NEYO charges a **flat or tiered capacity rate based on active student enrollment**:

| Subscription Tier | Student Capacity | Annual Subscription (`KES`) | Monthly Billing (`KES`) | Included Features |
| :--- | :--- | :--- | :--- | :--- |
| **Starter (Core OS)** | Up to 250 Students | **KES 60,000 / yr** | KES 6,000 / mo | Student Management (`B.1`), Attendance (`B.3`), Basic Finance (`B.7`), Parent Portal (`B.10`), 4-Point CBC Rubrics (`EE.15`). |
| **Professional (Smart OS)** | 251 to 800 Students | **KES 150,000 / yr** | KES 15,000 / mo | All Starter features + **Smart OCR Mark Sheets (`EE.4`)**, Exam Tidying (`EE.5`), Self-Marking Question Bank (`EE.8`), QR Gate Checkpoint (`EE.11`), and M-Pesa STK Push Integration (`I.41`). |
| **Enterprise (Multi-Campus)** | 801 to 2,500+ Students | **KES 350,000 / yr** | KES 35,000 / mo | All Professional features + **Inter-School Contests (`EE.10`)**, STEM Virtual Labs (`EE.13`), Digital Portfolio A4 PDF Booklets (`EE.14`), Advanced Analytics (`J.16`), and Custom Document Branding (`I.43`). |

### 3.2 Micro-Transaction Revenue Streams
1. **KNEC / KJSEA Assessment Number Placement Lookup (`EE.12` / `sms-knec.service.ts`)**:
   - Parents/students query their Grade 9 -> Grade 10 placement via SMS or web (`22263 style`).
   - Billing: **KES 30 per successful lookup**, debited automatically against the school's Mzazi wallet ledger or billed directly via M-Pesa (`transactionType: "KNEC_PLACEMENT_LOOKUP"`).
2. **Mzazi Direct Pay & Fee Reminder Broadcasts (`I.41 / T.11`)**:
   - Automated 1-tap SMS fee reminders containing secure M-Pesa checkout links.
   - Billing: Standard SMS cost (`KES 1.50/SMS`) + optional KES 20 flat convenience fee on direct fee settlements above KES 5,000.

---

## 4. Competitive Analysis (Kenyan Education App Ecosystem)

| Competitor | Primary Focus | Strengths | Weaknesses & NEYO's Strategic Advantage |
| :--- | :--- | :--- | :--- |
| **Zeraki Analytics / Zeraki Finance** | Exam analytics & fee collection for secondary schools. | Strong market recognition in secondary exam analysis; reliable SMS exam reporting. | **Weakness**: Split into separate, fragmented apps (Zeraki Analytics vs Zeraki Finance). Limited Primary/CBC rubric automation.<br>**NEYO Advantage**: Unified 100% full-stack OS where `Exams (`B.5`)`, `Finance (`B.7`)`, and `CBC Rubrics (`EE.15`)` exist inside one exact database with zero sync delays. |
| **EduPoa** | Mobile-first school administration & communication. | Clean mobile UX; popular among urban kindergarten and primary day schools. | **Weakness**: Lacks deep examination generators, OCR paper scanning (`EE.4/EE.5`), and Senior School CBE pathway placement (`EE.12/J.10`).<br>**NEYO Advantage**: Complete physical-to-digital OCR bridge (`tesseract.js`) and 8-point Senior School rubric capabilities (`EE.15`). |
| **Elimu Connect / ElimuShop** | Digital learning content & ERP integrations. | Good access to digital revision materials and past papers. | **Weakness**: High server bandwidth costs; lacks multi-school contest infrastructure and automated timetable solvers.<br>**NEYO Advantage**: Zero-quota YouTube learning library (`EE.7`), embedded self-marking question bank (`EE.8`), and 1-click multi-school contests (`EE.10`). |
| **Sematime** | Bulk SMS communication and parent engagement. | Dominant in bulk SMS alerts and basic fee balance reminders across Kenya. | **Weakness**: Pure communication tool without deep academic or timetable operational infrastructure.<br>**NEYO Advantage**: Fully integrated **Smart Timetable Engine (`Wand2`)**, instant teacher allocation continuity (`B.12`), and QR Gate-Pass security tracking (`EE.11`). |

---

## 5. SWOT Analysis

```
+-------------------------------------------------------+-------------------------------------------------------+
|                       STRENGTHS                       |                      WEAKNESSES                       |
| - 100% Full-Stack Codebase with zero regressions      | - Solo founder bottleneck during rapid scaling        |
|   (126/126 checks passing across 15 verification      |   (mitigated by Level 5 SOPs & Level 13 AI prompts).  |
|   suites; 0 errors in tsc --noEmit).                  | - Reliance on external SMS gateways (Africas Talking/ |
| - Zero-Cost OCR & QR Scanning architecture running    |   Daraja) which can experience carrier delays.        |
|   locally on edge/client hardware.                    | - Need to continuously train non-technical school     |
| - Comprehensive KICD seed library (227 questions,     |   staff during initial onboarding.                    |
|   PP1 to Grade 12 exact strand structures).           |                                                       |
+-------------------------------------------------------+-------------------------------------------------------+
|                     OPPORTUNITIES                     |                        THREATS                        |
| - Massive nationwide demand for Grade 10 Senior       | - Incumbent competitors bundling aggressive discounts |
|   School pathway & elective placement tools (Jan 2026)|   or exclusive county-level vendor lock-ins.          |
| - Expansion into multi-school academy networks needing| - Sudden regulatory shifts in Kenya Data Protection   |
|   centralized billing and cross-school contests.      |   Act (DPA) requiring localized on-premise storage    |
| - Integration with national digital identity and      |   (solved by our multi-tenant SQLite/Postgres         |
|   KNEC examination API endpoints.                     |   adapter abstraction).                               |
+-------------------------------------------------------+-------------------------------------------------------+
```

---

## 6. Target Customer Personas & Journey Maps

### 6.1 Persona 1: Principal Achieng Mary (`PRINCIPAL` / Decision Maker)
- **Profile**: Principal of Karibu High School (`2,100 students`). 48 years old, pragmatic, values discipline and academic excellence.
- **Pain Points**: Terrified of teachers submitting fake or copied CBC rubric reports without covering the real syllabus (`I.97 / B.12`). Frustrated when teachers leave mid-term and their class records get lost or deleted (`cant be deleted anyhowly`).
- **NEYO Journey**: Logs in via `principal@karibuhigh.ac.ke`. Opens **Academics -> Syllabus Audit (`I.97`)** to instantly view real `VERIFIED_COVERED` topics vs `SELF_REPORTED_ONLY` vs `NOT_COVERED`. Uses **Teacher Allocation Continuity (`B.12`)** to transfer a departing teacher's subjects instantly to a substitute without losing a single mark sheet.

### 6.2 Persona 2: Bursar Kamau (`BURSAR` / Financial Gatekeeper)
- **Profile**: Bursar at Uhuru Academy (`850 students`). 36 years old, meticulous, handles cash, cheques, and M-Pesa paybills daily.
- **Pain Points**: Parents claiming they paid school fees via M-Pesa but presenting fake SMS confirmations or unverified transaction IDs.
- **NEYO Journey**: Logs into **Finance -> Fee Ledger (`B.7`)**. Uses **1-Tap Payment Lookup** and **Biometric Finance Gate (`R.3`)** to verify real-time M-Pesa IPN webhooks. Generates structured **Installment Plans (`InstallmentPlanDialog` `z-[100]` high-contrast opaque card)** for parents needing flexible payment schedules (`I.99`).

### 6.3 Persona 3: Teacher Wanjiru (`TEACHER` / Daily Operational User)
- **Profile**: Mathematics & Physics Teacher at Kilimo Day Secondary (`450 students`). 29 years old, tech-comfortable on her smartphone, busy teaching 28 periods a week.
- **Pain Points**: Hates calculating exam percentages by hand and writing repetitive comments on 60 individual student report cards.
- **NEYO Journey**: Opens NEYO on her smartphone browser (`offline-resilient PWA`). Uses **1-Click Universal Presets (`EE.15`)** to apply 4-point rubrics and core competencies. Uses **Rubric-Driven Comment Auto-Fill (`EE.2`)** to auto-generate personalized, non-AI student report comments (`Bundi drafts...`). Uses **STEM Virtual Lab (`EE.13`)** on a classroom projector to show students Ohm's Law and Pythagoras balance simulations live.

---

## 7. Product Roadmap (2026–2027 Execution Horizon)

```
2026 Q3 (CURRENT PRODUCTION RELEASE)
├── Complete Part EE Mega-Suite (`EE.1` through `EE.15`) — FULLY VERIFIED (`126/126 checks`).
├── Senior School Grade 10 Electives & Combinations Engine (`Part AA / Part BB`).
├── Printable Timetable Redesign (`ACHOLA ROSE` exact match, colSpan={2} / rowSpan={days.length}).
└── Universal CBC/CBE Presets (`EE.15`) & Digital Portfolio A4 PDF Booklets (`EE.14`).

2026 Q4 (NATIONAL GO-LIVE & SYSTEM HARDENING)
├── Multi-Kid Family Unified Billing & Sibling Discount Engine (`Part R / R.8`).
├── Biometric Finance Gate (`R.3`) and Centralized Money Reconnect (`I.49`).
├── Automated Term-End Report Card Day Bulk Printing (`report-card-day.service.ts`).
└── Offline-First Service Worker Sync Engine (`Z.1`) field validation across rural sub-counties.

2027 Q1–Q2 (PAN-KENYA EXPANSION & DEVELOPER ECOSYSTEM)
├── Developer Center 2.0 API Launch (`Part X`) allowing third-party bank & transport integrations.
├── Multi-School Contests Arena (`EE.10`) hosting nationwide KJSEA/KCSE preparatory olympiads.
├── Storage Intelligence Engine (`Part W`) auto-archiving graduated alumni records.
└── Integration Credential Vault (`I.60`) self-service portal for school-specific M-Pesa Paybills.
```

---

## 8. Risk Register & Mitigation Strategy

| Risk ID | Risk Description | Likelihood | Impact | Mitigation & Control Protocol |
| :--- | :--- | :--- | :--- | :--- |
| **RSK-01** | **Database Corruption or Unauthorized Mark Deletion** by disgruntled staff. | Medium | Critical | Enforce **Academic Record Immutability (`cant be deleted anyhowly`)**. Ordinary teachers (`Role: TEACHER`) are strictly `FORBIDDEN` in `deleteCbcAssessment()`, `deleteLessonObservation()`, and `deleteSyllabusTopic()`. Every write emits an `AuditLog` (`A.13`). |
| **RSK-02** | **M-Pesa API Webhook Downtime / Daraja Outages** during peak school opening weeks. | High | High | Implement local **Promise-to-Pay Calendar (`I.24 / I.99`)** and manual M-Pesa receipt verification queue (`Receipt Delivery R.5`) with idempotent transaction de-duplication (`transactionReference`). |
| **RSK-03** | **Unmapped Subject Import Errors** when onboarding schools via bulky Excel spreadsheets (`BB.4 / DD.4`). | High | Medium | Build `previewImport()` step in `ImportWizard` to check every unique string against `populateSubjectMap()` (`&` vs `and` normalization), surfacing warning boxes before database insertion. |
| **RSK-04** | **Server Memory Exhaustion or Typecheck Cache Drift** on production build instances. | Low | High | Enforce strict Node memory allocation: `NODE_OPTIONS="--max-old-space-size=6144" npx tsc --noEmit` (`I.60B cache audit`). |
