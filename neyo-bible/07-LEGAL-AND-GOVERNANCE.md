# Level 7 — Legal, Governance & AI Ethics Policy
**Document Id**: `NEYO-BIB-L7`  
**Owner**: NEYO Executive Leadership & Legal Counsel  
**Status**: Living Institutional Legal Framework  
**Last Updated**: 2026-07-17  

---

## 1. Privacy Policy (Kenyan Data Protection Act / DPA 2019 Compliance)

NEYO operates under strict compliance with the **Kenya Data Protection Act (2019)** and global education data privacy standards (`GDPR`, `FERPA` equivalents).

### 1.1 Scope & Collection of Student Data
- NEYO collects learner demographics (`full name`, `admission number`, `date of birth`, `parent phone numbers`) solely for the purpose of school administration, academic grading (`CbcAssessment`), and mobile money reconciliation (`Mzazi Direct Pay`).
- **Zero Third-Party Data Selling**: NEYO strictly prohibits selling, renting, or monetizing student, parent, or school staff personal data to advertisers or third parties.
- **Data Minimization & Multi-Tenant Isolation (`A.2`)**: Every student record is strictly bound to its parent school organization (`tenantId` on `TENANT_OWNED_MODELS`). A school cannot view, query, or access data belonging to another school (`Karibu High` data is completely isolated from `Uhuru Academy`).

### 1.2 Biometric & Financial Data Safeguards (`R.3`)
- When schools activate the **Biometric Finance Gate (`R.3`)**, hardware biometric fingerprints or device passkeys (`totp.service.ts` / `WebAuthnChallenge`) are processed locally on the user's hardware device. NEYO never stores raw biometric fingerprints on central cloud servers.

---

## 2. Terms of Service (TOS) & Acceptable Use Policy (AUP)

### 2.1 Subscription Terms (`Part V` Capacity-Based Pricing System 2.0)
- School subscriptions are billed annually or monthly based on **active student capacity tiers** (`Starter <= 250`, `Professional <= 800`, `Enterprise <= 2,500+`).
- If a school exceeds its capacity tier during mid-term enrollment (`class-capacity-overflow.service.ts`), NEYO provides a **14-day grace period (`i48-grace-enforcement-test.ts`)** before requiring a tier upgrade.

### 2.2 Acceptable Use Policy & Academic Immutability (`cant be deleted anyhowly`)
- Schools and staff agree never to tamper with, falsify, or fraudulently delete historical academic records (`CbcAssessment`, `LessonObservation`, `SyllabusTopic`) or financial invoices (`Invoice`, `Payment`).
- Ordinary teachers (`Role: TEACHER`) are strictly denied database deletion rights to prevent grade manipulation upon leaving employment (`FORBIDDEN`). All administrative deletions must be executed by `PRINCIPAL` or `FOUNDER` and are permanently logged in the system `AuditLog` (`A.13`).

---

## 3. Data Processing Agreement (DPA) & SLA Guarantees

### 3.1 Role of NEYO vs School
- Under the Kenyan Data Protection Act, the **Participating School (`Tenant`)** acts as the **Data Controller** (owning and governing student/parent information).
- **NEYO (`company: NEYO`)** acts as the **Data Processor** (processing data solely on the instructions of the school leadership).

### 3.2 Service Level Agreement (SLA) & Uptime Targets
- NEYO targets **99.9% cloud server uptime** across Vercel Edge Workers and PostgreSQL database infrastructure.
- **Offline Resilience Guarantee (`Z.1`)**: Recognizing internet outages in rural Kenyan sub-counties, NEYO provides local Progressive Web App (`PWA`) Service Worker persistence. If cloud connectivity drops, schools can continue marking attendance (`AttendanceRecord`) and scanning QR gate passes (`EE.11`) locally without SLA breach. Local transactions automatically synchronize upon connectivity restoration.

---

## 4. AI Usage & Governance Policy (The Bundi Rule)

As an AI-assisted product featuring **Bundi** (our digital assistant), NEYO enforces explicit AI ethical boundaries:

```
+---------------------------------------------------------------------------------------------------+
|                            THE BUNDI AI GOVERNANCE CONSTITUTION                                   |
|                                                                                                   |
| 1. ZERO AI IN PRODUCT COPY: Never write the word "AI" or "Artificial Intelligence" anywhere in    |
|    customer-facing copy. Teachers use "Bundi"—a helpful digital tool, not a human replacement.    |
|                                                                                                   |
| 2. ZERO MODEL TRAINING ON STUDENT RECORDS: Learner academic scores, CBC rubric ratings, and       |
|    parent M-Pesa numbers are NEVER fed into public or third-party LLMs for model training.        |
|                                                                                                   |
| 3. LOCAL EDGE OCR PRIORITY: When scanning exam papers (`EE.5`), mark sheets (`EE.4`), or paper    |
|    quizzes (`EE.9`), NEYO runs local `tesseract.js` OCR and `BarcodeDetector` engines directly on |
|    the client hardware (`0 external API calls, 0 data privacy leaks`).                            |
|                                                                                                   |
| 4. HUMAN-TEACHER AUTHORITY: Bundi only drafts comment suggestions (`EE.2`) and solves timetable   |
|    schedules (`Wand2`). The human teacher (`TEACHER`) or Principal (`PRINCIPAL`) must review and  |
|    explicitly press [ Save ] or [ Publish ] before any draft enters official school records.      |
+---------------------------------------------------------------------------------------------------+
```

---

## 5. Refund Policy & M-Pesa Reversal Protocol

- **Subscription Refunds**: Annual school software subscriptions (`Capacity-Based Pricing Part V`) may be refunded pro-rata within the first 30 days of onboarding (`SOP-FIN-01`) if the school chooses to discontinue service.
- **M-Pesa Transaction Conveyance (`I.41 / R.5`)**: If a parent accidentally makes a duplicate or excess fee payment via M-Pesa STK Push (`Daraja API`), the school bursar initiates a verified ledger credit or triggers an official B2C reversal via **Central Money Reconnect (`I.49`)**.

---

## 6. Open Source & Third-Party Software Licenses

NEYO incorporates enterprise-grade open-source software libraries under permissive MIT and Apache 2.0 licenses:
- **Next.js 14 & React**: MIT License (`Vercel, Inc.`).
- **Prisma ORM & Driver Adapters (`PrismaPg` / `WasmPrismaClient`)**: Apache 2.0 License (`Prisma Data, Inc.`).
- **Tailwind CSS**: MIT License (`Tailwind Labs`).
- **`lucide-react` (Icons)**: ISC License (`Lucide Contributors`).
- **`tesseract.js` (Optical Character Recognition)**: Apache 2.0 License (`Naptha`).
- **`jsQR` (JavaScript QR Code Scanner)**: Apache 2.0 License (`Cozmo`).

---

## 7. Intellectual Property & Founder IP Assignment

All software source code (`elvisybadbunny-bit/neyorepolink`), architecture designs (`Odoo + Apple + Linear Liquid Glass`), seed curriculum structures (`kicd-question-bank-expansion-15.ts`), and trade secrets ("Bundi" branding) are the exclusive intellectual property of the **NEYO Solo Founder (`company: NEYO`)**. All future employees, software contractors, and AI engineering partners assign 100% of generated code and architectural artifacts directly to the company upon contribution.
