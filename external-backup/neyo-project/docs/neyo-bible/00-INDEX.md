# The NEYO Bible — Real Index

**Status: rebuild started 2026-07-18.** The previous 21-file "NEYO Bible" (built and deleted earlier
in this project's history) was found to be fake — every file repeated an identical boilerplate
paragraph exactly 25 times with fabricated citations. The founder's explicit instruction at the time
was: **"Delete it, rebuild for real."** This is that rebuild.

## Ground rules for every level in this Bible

1. **Every claim must be traceable to a real file, a real line of code, a real migration, or a real
   test result actually run in this session.** No invented statistics, no filler paragraphs, no
   repeated boilerplate.
2. **Built one real level at a time**, grounded in direct inspection of the actual codebase at
   `/home/user/neyo`, not written from memory or assumption.
3. **Updated, not padded, as the product changes.** When a fact in this Bible goes stale (a plan
   is renamed, a feature is removed), the correct fix is to edit the real sentence that's now wrong
   — never to add a new paragraph on top without removing the old one.
4. Synced to all 4 doc locations after every edit, exactly like every other NEYO doc:
   `/home/user/neyo/docs/`, `/home/user/neyo/external-backup/docs/`,
   `/home/user/neyo/external-backup/neyo-project/docs/`, `/home/user/neyo/docs/` (root).

## Levels (built so far)

- **[01 — Company & Product Foundation](./01-COMPANY-AND-PRODUCT-FOUNDATION.md)** — what NEYO is,
  who it's for, the real roles/tenancy model, the real pricing model, the Bundi Rule, the design DNA.
- **[02 — Engineering Architecture](./02-ENGINEERING-ARCHITECTURE.md)** — real folder structure,
  the real 3-layer multi-tenancy enforcement mechanism, auth/session/permission system, the two
  real feature-flag systems, the real cron/job registry, document generation, and the real
  regression-testing culture.
- **[03 — Product Surface Map](./03-PRODUCT-SURFACE-MAP.md)** — all 42 real top-level app modules,
  grouped by real function, each with its real page-guard permission and a grounded one-line
  description of what it actually does.
- **[04 — Operations & SOPs](./04-OPERATIONS-AND-SOPS.md)** — the real production deployment
  pipeline, the real NEYO Ops console tab inventory grouped by function, the sandbox recovery SOP,
  the documentation-sync SOP, and a seed of dated real operational incidents.
- **[05 — Founder Decision Log](./05-FOUNDER-DECISION-LOG.md)** — 16 durable, dated product and
  engineering decisions grounded in the founder prompts, context anchor, checklist, and named real
  implementation files; includes superseded directions and a maintenance protocol for future
  decisions.
- **[06 — School Operations Playbook](./06-SCHOOL-OPERATIONS-PLAYBOOK.md)** — real daily and term
  workflows for leadership, teachers, Finance, Reception, families, Library, Hostel, and Clinic;
  documents shared-record hand-offs, role boundaries, exception handling, and the source services
  behind each workflow.
- **[07 — Customer Success & School Lifecycle](./07-CUSTOMER-SUCCESS-AND-SCHOOL-LIFECYCLE.md)** —
  quote/demo through onboarding, trial activation, rollout milestones, support intake, diagnostic
  replay, tenant health intervention, renewal/recovery, and lawful offboarding/data portability.
- **[08 — Security, Privacy & Compliance](./08-SECURITY-PRIVACY-AND-COMPLIANCE.md)** — implemented
  authentication, authorization, tenant isolation, encryption, audit and payment controls; data
  classification, incident response, secure-development gates, and clearly identified open
  founder/operator compliance obligations.
- **[09 — Pricing, Billing & Revenue Operations](./09-PRICING-BILLING-AND-REVENUE-OPERATIONS.md)** —
  the current dual pricing models, quote-to-customer path, trial/subscription lifecycle, central
  M-Pesa collection, referrals, campaigns, SMS margin, repricing governance, and revenue close SOPs.
- **[10 — Product Management & Feature Delivery](./10-PRODUCT-MANAGEMENT-AND-FEATURE-DELIVERY.md)** —
  idea classification, definition of ready, the 8-chunk build protocol, database/security/UI gates,
  release controls, verification ladder, evidence vocabulary, audit workflow, and documentation
  closeout.
- **[11 — Data Architecture & Domain Model](./11-DATA-ARCHITECTURE-AND-DOMAIN-MODEL.md)** — a
  conceptual map of all 341 Prisma models by real domain, tenancy categories, state/history
  patterns, schema-change protocol, and safe query rules.
- **[12 — Integrations, Jobs, Storage & Observability](./12-INTEGRATIONS-JOBS-STORAGE-AND-OBSERVABILITY.md)** —
  real provider seams and activation/failure runbooks for M-Pesa, communications, R2, OAuth,
  API/webhooks, background jobs, cron, logging, health, analytics, and secret rotation.
- **[13 — Bundi Intelligence, OCR & Safety](./13-BUNDI-INTELLIGENCE-OCR-AND-SAFETY.md)** — real Bundi
  surfaces and services, deterministic-first extraction, staged import/review/commit, learned
  corrections, quota/top-ups, release/access/privacy controls, outage behavior, quality metrics,
  and the Bundi copy law.
- **[14 — Deployment, Environments & Disaster Recovery](./14-DEPLOYMENT-ENVIRONMENTS-AND-DISASTER-RECOVERY.md)** —
  current Vercel/Neon/Fly/R2/Redis topology, environment boundaries, production gates, migration
  policy, smoke tests, web/worker/database rollback, backup/restore, disaster scenarios, and
  incident closeout.
- **[15 — Master Wiki & Knowledge Governance](./15-MASTER-WIKI-AND-KNOWLEDGE-GOVERNANCE.md)** —
  canonical-source hierarchy, level ownership, document status/citation/writing standards, review
  cadence, synchronization, decision/audit handling, sensitive knowledge, archival, and save-game
  continuity.
- **[16 — Founder, Corporate Governance & Investor Readiness](./16-FOUNDER-CORPORATE-GOVERNANCE-AND-INVESTOR-READINESS.md)** —
  real Founder Ops records and cadence, metric definitions, customer interviews, contracts,
  governance/risk/access controls, investor update/data-room evidence, and founder continuity.
- **[17 — Governance, Leadership & Founder Handbook](./17-GOVERNANCE-LEADERSHIP-AND-FOUNDER-HANDBOOK.md)** —
  internal company constitution, founder duties, decision framework, delegation matrix, board and
  annual-strategy templates, business continuity, succession, cadence and personal knowledge base.
- **[18 — Product & Engineering Handbook](./18-PRODUCT-AND-ENGINEERING-HANDBOOK.md)** — product
  vision, PRD/spec/backlog/roadmap/release/deprecation standards plus architecture, database/API,
  coding/Git/testing/QA/deployment/monitoring/integration, AI-assisted development, debt and known
  issues governance.
- **[19 — Security, Operations & Customer Support Manual](./19-SECURITY-OPERATIONS-AND-CUSTOMER-SUPPORT-MANUAL.md)** —
  security/access/password/retention/incident/vulnerability policies, DPIA and Kenya DPA checklists,
  operations cadence, support/bug/feature/change processes, and role-based customer quick guides.
- **[20 — Commercial, Brand, Finance, HR, Legal & AI Library](./20-COMMERCIAL-BRAND-FINANCE-HR-LEGAL-AND-AI-LIBRARY.md)** —
  sales/demo/pilot/onboarding/partnership templates, brand/marketing/customer documentation,
  financial/HR/legal artifact frameworks, internal AI governance library, and founder knowledge
  continuation—with explicit status boundaries where approved artifacts do not yet exist.

## Companion: Founder Manual V2 (button-by-button product operations)

The Bible explains institutional knowledge, architecture, policy and governance. The founder's new
beginner-facing, button-by-button module manual is separate so it can explain every screen without
making this index unreadable:

- **[Manual plan and module order](../founder-manual-v2/00-MANUAL-PLAN-AND-MODULE-ORDER.md)**
- **[Module 01 — Dashboard & Role-Based Home](../founder-manual-v2/01-DASHBOARD-AND-ROLE-BASED-HOME.md)**
- **[Module 02 — Login, Security, User Menu & Navigation](../founder-manual-v2/02-LOGIN-SECURITY-USER-MENU-AND-NAVIGATION.md)**
- **[Module 03 — School Setup, Profile, Modules, Branding & Settings](../founder-manual-v2/03-SCHOOL-SETUP-PROFILE-MODULES-BRANDING-AND-SETTINGS.md)**
- **[Module 04 — Users, Roles, Staff Access & Invitations](../founder-manual-v2/04-USERS-ROLES-STAFF-ACCESS-AND-INVITATIONS.md)**
- **[Module 05 — Students, Guardians, Classes, Imports, Transfers & Alumni](../founder-manual-v2/05-STUDENTS-GUARDIANS-CLASSES-IMPORTS-TRANSFERS-AND-ALUMNI.md)**
- **[Module 06 — Admissions](../founder-manual-v2/06-ADMISSIONS-INQUIRIES-APPLICATIONS-INTERVIEWS-OFFERS-AND-ADMIT.md)**
- **[Module 07 — Attendance](../founder-manual-v2/07-ATTENDANCE-CLASS-REGISTERS-STAFF-GPS-OFFLINE-SMS-AND-INSIGHTS.md)**

## Levels planned

- Levels 01–20 now cover the identified institutional areas. Deepen existing levels when the real
  implementation changes. Add another Bible level only for a genuinely distinct responsibility;
  continue screen-by-screen product instructions in Founder Manual V2.
