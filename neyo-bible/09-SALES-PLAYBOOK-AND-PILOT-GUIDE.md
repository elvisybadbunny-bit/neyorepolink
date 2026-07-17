# Level 9 — Sales Playbook, Demo Guide & Objection Handling
**Document Id**: `NEYO-BIB-L9`  
**Owner**: NEYO Head of Sales & Growth Executive (`NEYO_SUPPORT`)  
**Status**: Living Institutional Sales Playbook  
**Last Updated**: 2026-07-17  

---

## 1. Executive Sales Philosophy: Selling the Solution, Not "AI"

When pitching NEYO to Kenyan school principals, directors, and bursars, **never sell "Artificial Intelligence" (`The Bundi Rule`)**. Kenyan educators are deeply skeptical of complex, over-hyped tech that promises to replace teachers.

Instead, sell **speed, precision, physical-to-digital convenience (`OCR`), and zero data loss**:
- **Pitch to Principals**: *"We stop teachers from typing fake CBC reports at 2:00 AM (`Syllabus Coverage I.97`) and ensure that when a teacher leaves, their class records transfer instantly (`My Classes B.12`)."*
- **Pitch to Bursars**: *"We eliminate M-Pesa reconciliation headaches with instant STK Push (`I.41`) and give you a high-contrast Installment Plan Dialog (`z-[100]`) so fee promises never get lost."*
- **Pitch to School Owners**: *"We charge a flat capacity rate (`Part V`) that costs 40% less than fragmented competitors while running 100% offline-resilient during power cuts (`Z.1`)."*

---

## 2. Exact Elevator Pitches & Sales Scripts

### 2.1 The 30-Second Elevator Pitch
> *"Hello Principal! NEYO is the complete cloud operating system built specifically for Kenyan secondary and primary schools. Instead of making your teachers type out CBC rubric comments one by one, NEYO lets them click once (`Universal Presets EE.15`) or scan a paper mark sheet (`EE.4`) with their phone camera to enter grades automatically—with zero data loss and full offline functionality when the power goes off."*

### 2.2 The Cold Call Script (To School Bursars / Accounts Office)
> **Sales Rep**: *"Good morning, may I speak with the Bursar or Accountant? My name is [Name] calling from NEYO Education Systems right here in Nairobi."*  
> **Bursar**: *"Yes, I am the Bursar. How can I help you?"*  
> **Sales Rep**: *"I'm calling briefly because we know that when schools re-open, your office gets overwhelmed with parents presenting M-Pesa confirmation SMS messages and bank deposit slips that take hours to reconcile against student ledgers. NEYO has built a direct M-Pesa verification gate (`Biometric Finance Gate R.3`) where parents pay via 1-tap SMS link (`Mzazi Direct Pay I.41`), and the system updates your fee ledger automatically with zero double-counting (`0 partial payment friction`). Would you be open to a 10-minute live demonstration on your phone this Thursday?"*

---

## 3. Live Interactive Demo Guide (Using Seed Schools `Karibu2026!`)

Whenever running a live product demonstration for a school board or principal, **never use fake mocks or static presentations (`PROMPT 2`)**. Always log directly into our production seeded database (`prisma/seed.ts`):

```
+----------------------------------------------------------------------------------------------------+
|                                    DEMO ENVIRONMENT LOGIN CREDENTIALS                              |
| Password for ALL accounts below: Karibu2026!                                                       |
+----------------------------------------------------------------------------------------------------+
| 1. KARIBU HIGH SCHOOL (Large 2,100-student National High School Model)                             |
|    - Principal / Director: principal@karibuhigh.ac.ke (`Role: PRINCIPAL`)                          |
|    - Founder Account:      founder@karibuhigh.ac.ke (`Role: FOUNDER`)                              |
+----------------------------------------------------------------------------------------------------+
| 2. UHURU ACADEMY (Medium 850-student Multi-Stream Academy Model)                                   |
|    - Principal / Director: principal@uhuruacademy.ac.ke (`Role: PRINCIPAL`)                        |
|    - Founder Account:      founder@uhuruacademy.ac.ke (`Role: FOUNDER`)                            |
+----------------------------------------------------------------------------------------------------+
| 3. MJI MPYA SECONDARY SCHOOL & MOMBASA COAST SENIOR SCHOOL                                         |
|    - Principal Logins: principal@mjimpya.ac.ke | principal@mombasacoast.ac.ke                      |
+----------------------------------------------------------------------------------------------------+
```

### 3.1 The 4-Step Magic Demo Walkthrough
1. **Show Odoo + Apple Craft Navigation & Liquid Glass (`Part O`)**: Log into `principal@karibuhigh.ac.ke`. Show the clean left sidebar, the top-left **AppGrid switcher (9 dots)**, and open **Settings -> Liquid Level (`0–100`)**. Adjust the slider and let them watch the cards turn into glowing frosted glass right before their eyes!
2. **Show Universal CBC Presets (`EE.15`)**: Go to **Academics -> CBC Strands tab**. Click **[ ⚡ Universal Presets (`EE.15`) ]**. Explain: *"Watch this: instead of your teachers typing 7 KICD competencies and 8-point rubrics (`KICD_8POINT_RUBRICS`), they just press one button and Bundi sets up the entire school catalog instantly!"*
3. **Show Sub-Second QR Gate Checkpoint (`EE.11`)**: Go to **Security -> QR Checkpoint (`EE.11`)**. Click **[ ⚡ Simulate Scan (`GP1`) ]**. Let them see the high-contrast green status card (`ALLOWED / ACTIVE GATE PASS`) appear in **under 150 milliseconds (`8ms`)**!
4. **Show Syllabus Coverage Audit (`I.97`)**: Go to **Academics -> Syllabus Audit (`I.97`)**. Show the exact classification table: `VERIFIED_COVERED` vs `SELF_REPORTED_ONLY` vs `NOT_COVERED`. Explain: *"This is how you ensure teachers actually taught the syllabus before marking report cards."*

---

## 4. Objection Handling Matrix

| Objection | Underlying Fear | Exact Strategic Rebuttal & Demonstration |
| :--- | :--- | :--- |
| **"Our teachers are not good with computers or complicated software."** | Fear of staff resistance, training overhead, and software abandonment. | *"That is exactly why NEYO was built following Apple's design principles (`rounded-2xl`, generous spacing, type-to-search `StudentSearchSelect`). If a teacher knows how to send a WhatsApp message or take a photo on their phone, they can use NEYO. Watch how easy it is to auto-fill report comments (`EE.2`) with one tap!"* |
| **"Our school is in a rural area where internet and electricity go off frequently."** | Fear of administrative paralysis during power cuts (`Sematime / EduPoa dependency`). | *"NEYO is built with offline-first Progressive Web App (`PWA` / `Z.1`) technology. When the internet drops, your security guards can still scan QR gate passes (`EE.11`) and teachers can still mark attendance (`AttendanceRecord`). The data saves on the phone locally and uploads automatically when connection returns."* |
| **"We already have a contract with Zeraki / EduPoa / another software."** | Inertia, migration dread, and fear of duplicate spending. | *"We respect your existing systems! That is why we built **Bundi Intelligent Multi-Domain Import (`M.5 / Part Q`)**. We can import your entire student and subject spreadsheet (`ImportWizard` with `populateSubjectMap` handling `&` vs `and`) in under 5 minutes without typing a single name by hand. Let us run a 30-day free parallel pilot alongside your current system so your board can compare directly."* |
| **"Your capacity pricing (`Part V`) might be expensive if our student numbers grow."** | Fear of surprise billing or punitive module add-on fees. | *"Unlike competitors who charge extra every time you want to use the library module or SMS alerts, NEYO charges ONE flat rate for all modules (`Starter KES 60k/yr`, `Professional KES 150k/yr`). Plus, if your school grows past a tier limit mid-term, we give you an automatic **14-day grace period (`i48-grace-enforcement`)** without blocking your access."* |

---

## 5. 30-Day Risk-Free School Pilot Onboarding (`SOP-SALES-01`)

To close large high school networks (`Karibu High model`), NEYO offers a structured 30-Day Risk-Free Pilot:
1. **Week 1 (Catalog Provisioning & Import)**: Set up the school's `Tenant` organization. Upload their student list via `ImportWizard` Step 2 (`BB.4 / DD.4`). Verify 0 unmapped subject warnings.
2. **Week 2 (Leadership & Bursar Walkthrough)**: Enroll `PRINCIPAL` and `BURSAR` in 2FA (`TOTP G.34`). Demonstrate M-Pesa STK Push (`I.41`) and Installment Plan creation (`I.99`).
3. **Week 3 (Teacher Presets Activation)**: Run a 30-minute teacher orientation. Click **[ ⚡ Universal Presets (`EE.15`) ]** to activate all 4-point/8-point rubrics and let teachers test **Rubric-Driven Comment Auto-Fill (`EE.2`)**.
4. **Week 4 (Syllabus & Gate Checkpoint Audit)**: Activate the QR Gate Checkpoint (`EE.11`) for school security staff. At day 30, present the **Syllabus Coverage Audit Report (`I.97`)** and exact fee collection metrics to the Board of Management (`BOM`) for contract signing (`i48-contract-signing-test.ts`).
