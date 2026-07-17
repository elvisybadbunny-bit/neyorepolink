# NEYO BIBLE: Master Index & Knowledge System
**System Edition**: 2026-07-17 Institutional Release (`Part A` through `Part EE.15` Complete)  
**Target Repository**: `elvisybadbunny-bit/neyorepolink` (`/home/user/neyorepolink`)  
**Primary Architect & Owner**: NEYO Solo Founder (`company: NEYO`, Nairobi, Kenya)  

---

## Executive Summary & Purpose

The **NEYO Bible** is the permanent institutional memory and technical/operational foundation of NEYO — the **Future-Proof Education OS** built to modernize schools across Kenya and the African continent. 

Because NEYO is built using advanced AI collaboration with a solo founder specializing in **Project Planning and Management (PPM)** rather than traditional manual software engineering, the single biggest long-term risk to the enterprise is **knowledge fragmentation** — information residing solely in the founder's mind or scattered across ephemeral AI chat transcripts.

The **NEYO Bible** eliminates this dependency by institutionalizing every architectural choice, database model, permission rule, business model, operational runbook, Standard Operating Procedure (SOP), and legal/financial structure into a **living, version-controlled Knowledge System**. Every document inside this folder directly mirrors the real full-stack codebase (`Next.js 14`, `Prisma ORM`, `PostgreSQL/SQLite`, `tesseract.js`, `Daraja M-Pesa API`, `Africas Talking SMS`) with zero placeholders, mocks, or generic theoretical assumptions.

---

## The NEYO Knowledge System Structure (Levels 1–15 + Decision Log & Runbooks)

```
NEYO BIBLE (neyo-bible/)
│
├── 00-NEYO-BIBLE-INDEX.md                           # Master Navigation & Index (This Document)
├── 01-COMPANY-FOUNDATION.md                         # Level 1: Vision, Mission, Values & Brand Story
├── 02-STRATEGY-AND-GROWTH.md                        # Level 2: Business Plan, Lean Canvas & GTM Roadmap
├── 03-PRODUCT-DOCUMENTATION.md                      # Level 3: Master PRD, Feature Specs (`Part A–EE.15`), UI Specs
├── 04-ENGINEERING-ARCHITECTURE.md                   # Level 4: Architecture, Tech Stack, DB Schema, APIs & AI Guide
├── 05-OPERATIONS-AND-SOPS.md                        # Level 5: Standard Operating Procedures (Hiring, Support, Triage)
├── 06-CUSTOMER-DOCUMENTATION.md                     # Level 6: Help Center, Role Guides (Teacher, Principal, Parent)
├── 07-LEGAL-AND-GOVERNANCE.md                       # Level 7: Terms of Service, Privacy Policy (DPA), SLAs & AI Policy
├── 08-FINANCIAL-MODELS-AND-UNIT-ECONOMICS.md        # Level 8: Budgeting, Cost Cockpit, M-Pesa Ledgers & Pricing
├── 09-SALES-PLAYBOOK-AND-PILOT-GUIDE.md             # Level 9: Sales Scripts, Demo Guide, Objection Handling & Quotes
├── 10-MARKETING-AND-BRAND-GUIDE.md                  # Level 10: Brand DNA, Liquid Glass Standards & Typography
├── 11-HUMAN-RESOURCES-AND-TEAM.md                   # Level 11: Employee Handbook, Role Tiers (`FOUNDER`, `NEYO_OPS`)
├── 12-FOUNDER-KNOWLEDGE-BASE.md                     # Level 12: Institutional Memory, Architectural Trade-offs & Lessons
├── 13-AI-KNOWLEDGE-AND-PROMPT-LIBRARY.md            # Level 13: Prompt Library, 8-Chunk Plan & Zero AI Debt Protocol
├── 14-INVESTOR-DATA-ROOM.md                         # Level 14: Pitch Deck Outline, Technical Due Diligence & Cap Table
├── 15-MASTER-WIKI-AND-CROSS-LINKS.md                # Level 15: The NEYO Master Wiki Interlink Matrix
├── 16-FOUNDERS-DECISION-LOG.md                      # Level 16: Founder's Decision Log (Historical Architectural & Business Pivots)
├── 17-OPERATIONAL-RUNBOOKS-AND-SANDBOX-RECOVERY.md  # Level 17: Operational Runbooks & Sandbox Recovery Recipes
├── 18-MASTER-FEATURES-AND-MODULES-CATALOG.md        # Level 18: Exhaustive Features Catalog (`Part A` through `Part EE.15`)
├── 19-MASTER-ROLES-AND-PERMISSIONS-CHARTER.md       # Level 19: Master Roles & Permissions Charter (All 19 Canonical Roles)
└── 20-MASTER-CONSTITUTION-AND-SAAS-GOVERNANCE-SUITE.md # Level 20: Supreme NEYO Constitution & Complete SaaS Legal Suite
```

---

## Key System Anchors & Conventions

1. **The Bundi Rule (`PROMPT 1`)**: In all customer-facing product copy, feature descriptions, and UI modals, the word **"AI" is strictly forbidden**. All automated intelligence, OCR parsing, timetable generation, and smart data completion is presented under the brand persona: **"Bundi is here to help"**, **"Ask Bundi"**, or **"Bundi drafts..."**. Core school workflows operate fully offline and deterministically; Bundi adds convenience and escalation.
2. **Liquid Glass UI & Apple Craft (`PROMPT 3`)**: The interface follows an Odoo structural hierarchy (left sidebar, breadcrumbs, List/Kanban/Form views) wrapped in Apple craft (`rounded-2xl` cards, `rounded-full` buttons, generous whitespace, 200ms transitions) with a distinct **Liquid Glass aesthetic** (`rounded-2xl` glass cards with customizable opacity controlled by `tenantConfig.liquid_level` (`0–100`)).
3. **Multi-Tenancy & Data Isolation (`A.2`)**: All school operations are tenant-scoped (`tenantId` column on `TENANT_OWNED_MODELS` defined in `src/lib/core/tenant-tables.ts`). Database reads and writes must pass through `withTenant(db, tenantId)` or `assertTenant()` to guarantee absolute school data privacy across participating institutions (`Karibu High School`, `Uhuru Academy`, `Mji Mpya Secondary`, `Mombasa Coast Senior`).
4. **The 19 Roles (`A.3`)**: Defined in `src/lib/core/roles.ts`. Divided into **Company Management Roles** (`FOUNDER`, `NEYO_OPS`, `NEYO_SUPPORT`, plus legacy `SUPER_ADMIN`) and **School Operations Roles** (`SCHOOL_OWNER`, `PRINCIPAL`, `DEPUTY_PRINCIPAL`, `DEAN_OF_STUDIES`, `HOD`, `TEACHER`, `CLASS_TEACHER`, `BURSAR`, `ACCOUNTANT`, `RECEPTIONIST`, `LIBRARIAN`, `HOSTEL_MASTER`, `SUPPORT_STAFF`, `PARENT`, `STUDENT`).
5. **Feature Gating & Release Switches (`EE_FEATURES` / `J_FEATURES`)**: Every major feature (especially Part EE strategic roadmaps `EE.1–EE.15`) is governed by an explicit release switch inside `PlatformFlag` (`platform-flags.service.ts`). Part EE features default to **switched off (`disabled`) platform-wide** (`assertEeFeatureReleased(featureId)`) until NEYO Ops explicitly releases them via the master control switch.

---

## How to Maintain and Sync This Bible

Whenever a new module, migration (`schema.prisma`), or backend service (`src/lib/services/*.ts`) is added:
1. Update the corresponding technical file in Level 3 (`03-PRODUCT-DOCUMENTATION.md`) and Level 4 (`04-ENGINEERING-ARCHITECTURE.md`).
2. If the feature alters pricing, operational workflows, or legal terms, update Levels 5, 7, and 8.
3. Record the architectural rationale and trade-offs in `16-FOUNDERS-DECISION-LOG.md`.
4. Ensure cross-doc continuity by synchronizing key checklists across `docs/FEATURES-CHECKLIST.md` and `external-backup/docs/FEATURES-CHECKLIST.md` via exact byte-for-byte copy verification (`cp` / `md5sum`).
