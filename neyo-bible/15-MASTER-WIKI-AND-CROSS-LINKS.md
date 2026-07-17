# Level 15 — The NEYO Master Wiki & Cross-Link Matrix
**Document Id**: `NEYO-BIB-L15`  
**Owner**: NEYO Executive Leadership & Systems Architect  
**Status**: Living Institutional Master Index  
**Last Updated**: 2026-07-17  

---

## 1. The NEYO Master Wiki Topology

The **NEYO Master Wiki** is the central connective tissue of our entire knowledge system. It interlinks our 15 foundational knowledge levels, operational runbooks, decision logs, and physical codebase paths (`/home/user/neyorepolink`) into one unified map:

```
NEYO KNOWLEDGE SYSTEM MASTER TREE
│
├── Company            -> [Level 1: Company Foundation & Brand Philosophy](01-COMPANY-FOUNDATION.md)
├── Vision             -> [Level 1: Long-Term Horizon (2026–2046)](01-COMPANY-FOUNDATION.md#1-vision-statement)
├── Product            -> [Level 3: Master PRD & Part EE Mega-Suite](03-PRODUCT-DOCUMENTATION.md)
├── Design             -> [Level 3: Odoo + Apple + Linear & Liquid Glass](03-PRODUCT-DOCUMENTATION.md#12-the-odoo--apple--linear-design-system)
├── Engineering        -> [Level 4: Architecture, Tech Stack & DB Schema](04-ENGINEERING-ARCHITECTURE.md)
├── Operations         -> [Level 5: Standard Operating Procedures (SOPs)](05-OPERATIONS-AND-SOPS.md)
├── Sales              -> [Level 9: Sales Playbook, Pitch Scripts & Demo Guide](09-SALES-PLAYBOOK-AND-PILOT-GUIDE.md)
├── Marketing          -> [Level 10: Brand Guidelines, Typography & SEO](10-MARKETING-AND-BRAND-GUIDE.md)
├── Legal              -> [Level 7: Terms of Service, Privacy Policy & DPA](07-LEGAL-AND-GOVERNANCE.md)
├── Finance            -> [Level 8: Financial Models, Unit Economics & COGS](08-FINANCIAL-MODELS-AND-UNIT-ECONOMICS.md)
├── HR                 -> [Level 11: Employee Handbook, Role Tiers & OKRs](11-HUMAN-RESOURCES-AND-TEAM.md)
├── AI                 -> [Level 13: Prompt Library, 8-Chunk Plan & Bundi Rule](13-AI-KNOWLEDGE-AND-PROMPT-LIBRARY.md)
├── Investors          -> [Level 14: Investor Data Room & Technical Due Diligence](14-INVESTOR-DATA-ROOM.md)
├── Support            -> [Level 6: Customer Help Center & Role Guides](06-CUSTOMER-DOCUMENTATION.md)
├── Roadmap            -> [Level 2: Strategic Product Roadmap (2026–2027)](02-STRATEGY-AND-GROWTH.md#7-product-roadmap-20262027-execution-horizon)
├── Features Catalog   -> [Level 18: Exhaustive Features Catalog (`Part A–EE.15`)](18-MASTER-FEATURES-AND-MODULES-CATALOG.md)
├── Roles Charter      -> [Level 19: Master Roles & Permissions Charter (19 Roles)](19-MASTER-ROLES-AND-PERMISSIONS-CHARTER.md)
├── SaaS Governance    -> [Level 20: Supreme Constitution & SaaS Legal Suite](20-MASTER-CONSTITUTION-AND-SAAS-GOVERNANCE-SUITE.md)
└── Archive & Runbooks -> [Level 16: Decision Log](16-FOUNDERS-DECISION-LOG.md) | [Level 17: Sandbox Runbooks](17-OPERATIONAL-RUNBOOKS-AND-SANDBOX-RECOVERY.md)
```

---

## 2. Codebase-to-Bible Cross-Link Matrix

Every physical file in `/home/user/neyorepolink` links directly to a governing chapter in the NEYO Bible:

| System Layer & Exact File Path | Primary Function & Model | Governing Bible Chapter & Section |
| :--- | :--- | :--- |
| `prisma/schema.prisma` | Master database schema (`16/19 roles`, `Tenant`, `Student`, `CbcAssessment`, `GatePass`). | [Level 4: Database Documentation](04-ENGINEERING-ARCHITECTURE.md#4-database-documentation-schemaprisma-master-breakdown) |
| `src/lib/core/roles.ts` | Single source of truth for the 19 canonical roles (`FOUNDER`, `NEYO_OPS`, `PRINCIPAL`, `TEACHER`). | [Level 4: Roles Architecture](04-ENGINEERING-ARCHITECTURE.md#6-authentication--roles-architecture-roles-registry) & [Level 11: Role Tiers](11-HUMAN-RESOURCES-AND-TEAM.md#1-company-organizational-structure--role-tiers-y2) |
| `src/lib/core/ee-features.ts` | Master Part EE feature registry (`EE.1` through `EE.15`). | [Level 3: CBC / CBE Mega-Suite](03-PRODUCT-DOCUMENTATION.md#23-module-3-cbc--cbe-mega-suite--universal-presets-part-ee-ee1ee15-part-j-part-p) & [Level 5: SOP-DEV-01](05-OPERATIONS-AND-SOPS.md#sop-dev-01-feature-flag-release-via-neyo-ops-platform-switches-platform-flagsservicets) |
| `src/lib/core/tenant-tables.ts` | `TENANT_OWNED_MODELS` multi-tenant query isolation registry. | [Level 4: Multi-Tenant Pool Scoping](04-ENGINEERING-ARCHITECTURE.md#41-multi-tenant-abstraction--tenant_owned_models) & [Level 12: Architecture Trade-Offs](12-FOUNDER-KNOWLEDGE-BASE.md#13-multi-tenant-pool-scoping-tenant_owned_models-vs-separate-physical-databases) |
| `src/lib/services/universal-presets.service.ts` | 1-Click universal setup for `EE.15` (7 competencies, rubrics, core values). | [Level 3: Module 3 (`EE.15`)](03-PRODUCT-DOCUMENTATION.md#23-module-3-cbc--cbe-mega-suite--universal-presets-part-ee-ee1ee15-part-j-part-p) & [Level 6: Teacher Guide](06-CUSTOMER-DOCUMENTATION.md#31-how-to-1-click-apply-universal-cbccbe-presets-ee15) |
| `src/lib/services/qr-scan.service.ts` | Sub-second (`<150ms`) QR Gate Checkpoint evaluation (`EE.11` status cards). | [Level 3: Module 8 (`EE.11`)](03-PRODUCT-DOCUMENTATION.md#28-module-8-library-scan-auto-fill--qr-checkpoint-b15-ee11-library-clienttsx-qr-scanservicets) & [Level 6: Security Guard Guide](06-CUSTOMER-DOCUMENTATION.md#61-how-to-operate-the-sub-second-qr-gate-checkpoint-ee11) |
| `src/lib/services/sms-knec.service.ts` | KNEC / KJSEA Assessment Number placement lookup (`EE.12` `22263 style` + KES 30 fee). | [Level 3: Module 9 (`EE.12`)](03-PRODUCT-DOCUMENTATION.md#29-module-9-strategic-roadmaps-ee12-ee13-ee14-ee15) & [Level 8: Micro-Transactions](08-FINANCIAL-MODELS-AND-UNIT-ECONOMICS.md#3-micro-transaction--high-margin-ancillary-revenue) |
| `src/lib/services/portfolio.service.ts` | Automated A4 PDF Digital Portfolio booklet generator (`EE.14` `export=pdf not json`). | [Level 3: Module 9 (`EE.14`)](03-PRODUCT-DOCUMENTATION.md#29-module-9-strategic-roadmaps-ee12-ee13-ee14-ee15) & [Level 6: Parent Guide](06-CUSTOMER-DOCUMENTATION.md#72-how-to-download-your-childs-a4-pdf-digital-portfolio-ee14) |
| `src/lib/services/student-import.service.ts` | Excel student onboarding with `previewImport()` unmapped subject warnings (`populateSubjectMap`). | [Level 3: Module 5 (`BB.4 / DD.4`)](03-PRODUCT-DOCUMENTATION.md#25-module-5-admissions--student-import-b2-bb4--dd4-student-importservicets) & [Level 5: SOP-CS-01](05-OPERATIONS-AND-SOPS.md#sop-cs-01-school-onboarding--excel-student-import-importwizard--populatesubjectmap) |
| `src/lib/services/syllabus.service.ts` | Syllabus coverage linking (`CbcAssessment` DELIVERED -> `COVERED`) & audit report (`I.97`). | [Level 3: Module 3 (`I.97`)](03-PRODUCT-DOCUMENTATION.md#23-module-3-cbc--cbe-mega-suite--universal-presets-part-ee-ee1ee15-part-j-part-p) & [Level 6: Principal Guide](06-CUSTOMER-DOCUMENTATION.md#21-how-to-conduct-a-syllabus-coverage-audit-i97) |
| `src/lib/services/teacher-portal.service.ts` | Instant `My Classes` transfer continuity (`B.12`) querying all 4 allocation sources. | [Level 3: Module 7 (`B.12`)](03-PRODUCT-DOCUMENTATION.md#27-module-7-teacher-portal--instant-assignment-continuity-b12-teacher-portalservicets) & [Level 6: Principal Guide](06-CUSTOMER-DOCUMENTATION.md#22-how-to-transfer-classes-without-losing-academic-records-b12-continuity) |
| `src/components/academics/print-timetable-page.tsx` & `src/app/print/timetable/page.tsx` | Dedicated chrome-free timetable printing (`⌘P`: `ACHOLA ROSE` exact match layout). | [Level 3: Module 6 (`Printable Timetable`)](03-PRODUCT-DOCUMENTATION.md#26-module-6-timetable-engine-smart-solver--exact-print-redesign-smart-timetable-wand2-achola-rose-format-p) & [Level 10: Print Standards](10-MARKETING-AND-BRAND-GUIDE.md#4-printable-document-standards-achola-rose-format--p) |
| `src/components/academics/stem-simulation-station.tsx` | Interactive STEM Virtual Labs (`EE.13` Ohm's Law, Levers, Pythagoras). | [Level 3: Module 9 (`EE.13`)](03-PRODUCT-DOCUMENTATION.md#29-module-9-strategic-roadmaps-ee12-ee13-ee14-ee15) & [Level 6: Teacher Guide](06-CUSTOMER-DOCUMENTATION.md#33-how-to-use-the-interactive-stem-virtual-lab-projector-ee13) |
| `src/components/library/library-client.tsx` | Universal barcode circulation station (`IssueTab` scan auto-fill & auto `dueDate`). | [Level 3: Module 8 (`Library`)](03-PRODUCT-DOCUMENTATION.md#28-module-8-library-scan-auto-fill--qr-checkpoint-b15-ee11-library-clienttsx-qr-scanservicets) & [Level 6: Librarian Guide](06-CUSTOMER-DOCUMENTATION.md#51-how-to-check-out-books-in-1-tap-issuetab--library-clienttsx) |
| `scripts/fix-prisma-wasm.sh` | WASM query engine and `PrismaPg` driver adapter auto-patcher. | [Level 4: Tech Stack](04-ENGINEERING-ARCHITECTURE.md#2-tech-stack--architectural-rationale) & [Level 17: Operational Runbooks](17-OPERATIONAL-RUNBOOKS-AND-SANDBOX-RECOVERY.md#3-runbook-2-wasm-query-engine--driver-adapter-patching-fix-prisma-wasmsh) |
| `docs/FEATURES-CHECKLIST.md` | Master ~150+ features checklist across `Part A` through `Part EE.15`. | [Level 18: Features & Modules Catalog](18-MASTER-FEATURES-AND-MODULES-CATALOG.md) & [Level 3: PRD](03-PRODUCT-DOCUMENTATION.md) |
| `src/lib/core/roles.ts` (All 19 Roles) | Canonical definitions for `FOUNDER`, `PRINCIPAL`, `TEACHER`, `BURSAR`, etc. | [Level 19: Roles Charter (19 Roles)](19-MASTER-ROLES-AND-PERMISSIONS-CHARTER.md) & [Level 11: HR Manual](11-HUMAN-RESOURCES-AND-TEAM.md) |
| `Security.md` & `AUTH-ACCOUNT-SECURITY-GUIDE.md` | Enterprise infosec, multi-tenant isolation (`A.2`), and 2FA defense (`G.34`). | [Level 20: Supreme Constitution & SaaS Legal Suite](20-MASTER-CONSTITUTION-AND-SAAS-GOVERNANCE-SUITE.md) & [Level 7: Legal](07-LEGAL-AND-GOVERNANCE.md) |
