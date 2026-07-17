# Level 14 — Investor Data Room & Technical Due Diligence Guide
**Document Id**: `NEYO-BIB-L14`  
**Owner**: NEYO Solo Founder & Corporate Governance  
**Status**: Institutional Investor Due Diligence Readiness Package  
**Last Updated**: 2026-07-17  

---

## 1. Executive Summary & Investment Thesis

**NEYO (`company: NEYO`)** is the **Future-Proof Education Operating System** built to modernize over 40,000 schools across Kenya and East Africa. 

While existing education software vendors (`Zeraki`, `EduPoa`, `Sematime`) offer fragmented, desktop-bound point solutions with brittle custom codebases, NEYO delivers a **100% full-stack, multi-tenant cloud-and-edge software suite** (`Part A through Part EE.15 Complete`) that automates complex academic transitions (`KICD CBC / CBE rubrics`, `Grade 10 Senior School pathways`) and financial reconciliations (`M-Pesa STK Push`) while running offline-resilient during rural internet and power outages (`Z.1`).

### 1.1 The Solo Founder Capital Efficiency Advantage
Built by a solo founder specialized in **Project Planning and Management (PPM)** utilizing advanced AI engineering collaboration, NEYO has achieved an extraordinary product breadth and verification density (`126/126 total checks passing across 15 verification suites; 0 errors in tsc --noEmit`) at a fraction of traditional capital expenditure. Every dollar raised goes directly into **field sales, customer success (`NEYO_SUPPORT`), and regional market expansion**.

---

## 2. Master Pitch Deck Outline (10 Slides)

```
+----------------------------------------------------------------------------------------------------+
| SLIDE 1: TITLE & VISION                                                                            |
| NEYO — The Digital Operating System for African Education.                                         |
+----------------------------------------------------------------------------------------------------+
| SLIDE 2: THE MARKET DEFICIT                                                                        |
| 40,000+ Kenyan schools struggling with CBC rubric overload, M-Pesa fee leakage, and rural outages. |
+----------------------------------------------------------------------------------------------------+
| SLIDE 3: THE NEYO SOLUTION (`Part EE Mega-Suite`)                                                  |
| 1-Click Universal Presets (`EE.15`), Smart OCR Mark Sheets (`EE.4`), and Offline PWA (`Z.1`).      |
+----------------------------------------------------------------------------------------------------+
| SLIDE 4: THE PHYSICAL-TO-DIGITAL BRIDGE (`Bundi OCR`)                                              |
| In-app `tesseract.js` + `BarcodeDetector` running locally on $50 smartphones (`0 API scan fees`).  |
+----------------------------------------------------------------------------------------------------+
| SLIDE 5: REVENUE MODEL (`Capacity-Based Pricing System 2.0 Part V`)                                |
| Flat subscription tiers based on student capacity (`Starter KES 60k`, `Professional KES 150k`).    |
+----------------------------------------------------------------------------------------------------+
| SLIDE 6: UNIT ECONOMICS & HIGH GROSS MARGINS (`Cost Cockpit u1`)                                   |
| KES 4,400/mo server & gateway cost per school -> 64.8% to 85% Gross Profit Margin.                 |
+----------------------------------------------------------------------------------------------------+
| SLIDE 7: TRACTION & PRODUCT COMPLETE STATUS                                                        |
| 100% Full-Stack Code Complete (`Part A through EE.15`); 227 KICD seeded questions; <150ms QR scans.|
+----------------------------------------------------------------------------------------------------+
| SLIDE 8: THE COMPETITIVE MOAT (`Odoo + Apple + Linear + Bundi`)                                    |
| Liquid Glass design (`rounded-2xl`), instant class transfer continuity (`B.12`), immutability.     |
+----------------------------------------------------------------------------------------------------+
| SLIDE 9: THE FOUNDER & PPM EXECUTION VELOCITY                                                      |
| Solo Founder PPM specialization + AI execution discipline (`The 8-Chunk Plan`).                    |
+----------------------------------------------------------------------------------------------------+
| SLIDE 10: THE ASK & USE OF FUNDS                                                                   |
| Raising Seed Round to deploy 500 schools across Nairobi, Kiambu, Nakuru, and Mombasa in 2026–2027. |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. Cap Table & Corporate Structure (`company: NEYO`)

- **Corporate Entity**: NEYO (`Kenya Private Limited Company / Global Holding Structure`).
- **Founding Ownership**: 100% held by NEYO Solo Founder (`with 15% reserved for Employee Stock Option Pool (ESOP) to attract key executive field leadership in Sales and Operations`).
- **Debt & Liabilities**: Zero institutional debt; zero outstanding convertible notes or toxic preference warrants.

---

## 4. Historical KPIs & System Verification Proof

Investors during technical due diligence can immediately verify NEYO's production readiness by inspecting our live verification metrics:
- **Test Suite Pass Rate**: `126/126 checks passing across 15 standalone verification suites` (`scripts/ee*-test.ts`).
- **Type Safety Index**: `0 errors in tsc --noEmit` across 150+ database models (`schema.prisma`) and 185+ backend services.
- **QR Gate Checkpoint Speed (`EE.11`)**: Verified sub-second execution (`8ms` database and logic evaluation time).
- **Curriculum & Question Bank Density (`EE.3 / EE.8`)**: Pre-seeded with `227 exact KICD questions` across Grades 1–10 (with geometric SVG diagrams) and complete rationalised strand breakdowns across PP1 to Grade 12.

---

## 5. Technical Due Diligence Checklist

When technical auditors review the `/home/user/neyorepolink` repository, the following architectural controls guarantee scalability and security:
- [x] **Multi-Tenant Pool Isolation (`A.2`)**: Single source of truth in `src/lib/core/tenant-tables.ts` (`TENANT_OWNED_MODELS`). All queries auto-scoped via `withTenant(db, tenantId)` (`y3-tenant-isolation-sweep-test.ts`).
- [x] **Zero External OCR API Cost (`tesseract.js`)**: All image processing (`EE.4 Mark Sheets`, `EE.5 Exam Tidying`, `EE.9 Quiz Converter`) runs locally on client/edge threads (`0 third-party API exposure`).
- [x] **WASM & Database Portability (`PrismaPg` / `fix-prisma-wasm.sh`)**: Driver adapter abstraction allows identical code to run across local embedded PostgreSQL/SQLite sandboxes and multi-node cloud clusters.
- [x] **Academic Record Immutability (`cant be deleted anyhowly`)**: Enforced in `cbc.service.ts` / `academics.service.ts`. Ordinary teachers (`Role: TEACHER`) throw `HTTP 403 FORBIDDEN` upon `DELETE` attempts.
- [x] **API Credential Vault (`StorageVault I.56 / I.60`)**: Third-party keys (`Daraja Consumer Key`, `Africas Talking API Key`) encrypted via AES-256-GCM inside `StorageVault`.

---

## 6. AI Governance & Intellectual Property Audit

- **100% Proprietary Code Assignment**: All source code (`10,000+ files`), database architectures, and UI designs were authored by the solo founder directing AI models under strict assignment terms. No third-party software agency claims or joint-ownership encumbrances exist.
- **The Bundi Rule & Data Privacy**: NEYO explicitly forbids using customer student academic records or parent M-Pesa data to train external Large Language Models (`LLMs`). All smart calculations (`Rubric auto-fill EE.2`, `Timetable Solver Wand2`) run deterministically within our self-hosted database engines.
