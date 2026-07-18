# NEYO Bible — Level 01: Company & Product Foundation

*Last verified against the real codebase: 2026-07-18. Every fact below was confirmed by directly
reading the named file/model/migration in `/home/user/neyo`, not recalled from memory.*

## 1. What NEYO is

NEYO is a multi-tenant school-management SaaS built for Kenyan schools, deployed at
`neyo.co.ke`, running on Vercel + Neon Postgres. One codebase serves every school ("tenant");
each school's data is isolated by `tenantId` on every tenant-owned table (see §4).

The product supports both Kenyan curricula:
- **CBC/CBE** (Competency-Based Curriculum/Education) — Grade 1–9 (Junior School), Senior School
  Grade 10–12.
- **8-4-4** — Form 1–4 (the older, still-live-in-many-schools system).

A single school (`Tenant`) can offer more than one of ECDE, PRIMARY, JUNIOR_SCHOOL, or
SENIOR_SCHOOL simultaneously (`Tenant.educationLevelsOffered`, a JSON array), and can run CBC,
8-4-4, or both (`Tenant.curriculum`).

## 2. The real technical foundation

Confirmed directly from `package.json` and `prisma/schema.prisma`:
- **Framework**: Next.js 14.2.5 (App Router), React 18.3.1, TypeScript 5.5.4 (strict mode on).
- **Database**: PostgreSQL via Prisma ORM 5.17.0. `prisma/schema.prisma` is **9,116 lines** and
  defines **341 real models** (confirmed via `grep -c "^model " prisma/schema.prisma`).
- **Migrations**: 19 real, tracked migrations exist in `prisma/migrations/` as of 2026-07-18, most
  recent being `20260718002715_schema_drift_fix_ideas13_24_and_long_index_names`. Every migration
  is applied in strict chronological order via `prisma migrate deploy` — there is no "reset the
  database" shortcut in production.
- **API surface**: 473 real API route files under `src/app/api/` (confirmed via
  `find src/app/api -name "route.ts" | wc -l`).
- **App surface**: 42 real top-level pages/modules under `src/app/(app)/` (dashboard, academics,
  students, exams, finance, hostel, transport, library, cafeteria, clinic, discipline, comms,
  founder, portal, settings, and more — the full list is Level 03's job to document in detail).
- **Service layer**: 198 real service files under `src/lib/services/` — this is where nearly all
  real business logic lives (API routes are thin; they call into services).

## 3. The real role model (`src/lib/core/roles.ts`)

NEYO's roles split cleanly into two families that must never be confused:

**Company-running roles** (run NEYO itself, not a school):
- `SUPER_ADMIN` — legacy, kept only for backward compatibility, treated identically to `FOUNDER`.
- `FOUNDER` — unrestricted, everything in the system. This is the founder's own real account role.
- `NEYO_OPS` — broad internal tooling access, excludes the most sensitive founder-only actions.
- `NEYO_SUPPORT` — customer-facing only: inquiries, quote/demo requests, onboarding guidance —
  never platform flags, pricing, or team management.

**School-running roles** (run one specific school/tenant):
`SCHOOL_OWNER`, `PRINCIPAL`, `DEPUTY_PRINCIPAL`, `DEAN_OF_STUDIES`, `HOD`, `TEACHER`,
`CLASS_TEACHER`, `BURSAR`, `ACCOUNTANT`, `RECEPTIONIST`, `LIBRARIAN`, `HOSTEL_MASTER`,
`SUPPORT_STAFF`, `PARENT`, `STUDENT`.

This split exists because of a real founder directive (documented directly in the source comment
at the top of `roles.ts`, dated `Y.2, 2026-07-09`): the single undifferentiated `SUPER_ADMIN` role
was deliberately split into real distinct company tiers, in the founder's own words, to "start
over" from one all-powerful role into a genuine internal hierarchy.

## 4. Multi-tenancy — how one codebase serves every school safely

Every tenant-scoped Prisma model carries a `tenantId` field and MUST be registered in
`src/lib/core/tenant-tables.ts`'s `TENANT_OWNED_MODELS` array — this is a standing engineering rule
enforced across every session working on this codebase, not just a suggestion. As of this writing
that file is 426 lines long and lists well over 200 real tenant-owned model names (`venue`,
`tenantPricingSnapshot`, `smsMarginLedger`, and so on) — one omission would mean a real
cross-school data leak, so this registration is treated as seriously as a security control, because
it effectively is one.

Not every model is tenant-owned. Some are deliberately company-wide and queried directly, never
through a tenant-scoped helper — `PlatformFlag`, `SchoolQuoteRequest` (a prospective school may not
have a tenant yet), and the pricing-engine configuration are examples.

## 5. The real pricing model (as of 2026-07-18 — corrected this session)

NEYO does **not** sell named subscription tiers (no "Msingi", no "Pro", no "Free Karibu", no
"Elite" — all of these were real, named plans at earlier points in the product's history and have
since been deliberately retired by founder directive). The real, current pricing system is two
selectable models, both computed live from a school's actual real usage, never from a fixed
package:

1. **Capacity Complete** (`pricingMode: "SIZE_BASED_V2"`) — every module unlocked by default
   ("Neyo Complete"), one flat quote per term computed from a real size-score formula
   (`computeSizeScore()` in `src/lib/services/pricing-engine.service.ts`) that factors in real
   student count, staff count, parent count, and an estimated storage/AI-OCR usage component.
2. **Modular User & Module** (`pricingMode: "MODULAR_USERS_V1"`) — pay only for active users
   (`KES` per student, `KES` per staff, both NEYO-Ops-configurable) plus a per-term fee for each
   optional module the school has actually switched on (`computeModularUserModulePrice()`, same
   file). Switching an optional module on mid-term triggers a real midpoint 50%-vs-100% proration
   check (`recalculateTenantModularPricing()`).

A school can switch between these two models at any time via `/settings/billing`'s real "Dual
Pricing Model Selector" (`POST /api/billing/switch-model`). Every new school signup gets a real
30-day free trial (`status: "TRIAL"`, set in `onboarding.service.ts`) before committing to either
model. The subscription lifecycle is real and enforced in `billing.service.ts`:
`TRIAL -> ACTIVE -> GRACE -> SUSPENDED`, with a school's real records never deleted on suspension —
only operational features lock until payment resumes.

*(Historical note: a legacy named-tier plan picker — "Msingi"/"Pro" cards with their own separate
subscribe button — existed inside the same `/settings/billing` page as dead, conflicting leftover
UI until it was removed on 2026-07-18. `src/lib/core/plans.ts`'s `PLANS`/`ADD_ONS` arrays still
exist and are used internally for add-on pricing and `estimateTermCost()` math — see Level 02 for
the exact mechanics — but they are no longer surfaced to a school as a thing to "choose" or
"upgrade" between.)*

## 6. The Bundi Rule — the one branding rule that is never violated

NEYO's OCR/intelligent features are always branded as **"Bundi"** — e.g. "Bundi OCR", "Bundi
Intelligent Import" — Bundi is described in product copy as "the helper," never as "AI." The word
"AI" is never used in user-facing copy, and third-party vendor names (Google Vision, OpenAI,
Tesseract) are never named anywhere a school user can see them. This has been independently
re-verified multiple times across sessions by directly grepping every scan-surface component
(`mark-sheet-modal.tsx`, `exam-paper-tidying-modal.tsx`, `paper-quiz-formative-modal.tsx`,
`question-bank-modal.tsx`, `import-wizard.tsx`, and others) for vendor names and the word "AI" —
confirmed zero leaks every time it has been checked.

## 7. Design DNA

The product's stated design philosophy, carried consistently across every UI surface: **Odoo**
(for structure — dense, real operational software, not a toy), **Apple** (for craft — real
attention to detail, animation, typography), **Linear** (for speed — fast, keyboard-friendly,
no unnecessary friction). The default design system across the app is called "Liquid Glass."

## 8. Kenyan-market specifics that are non-negotiable product requirements

- Currency is always **KES**, formatted for a Kenyan audience.
- Phone numbers follow the **+254 7XX XXX XXX** format.
- Payments run through **M-Pesa Daraja STK Push** (not generic "mobile money" — the specific real
  Safaricom API).
- Every seeded demo school and every generated example uses real Kenyan names, real Kenyan county
  names, and realistic Kenyan school-fee amounts.
- The product assumes many real users are on slow 3G connections and small (360px) phone screens —
  this is a stated engineering constraint, not an afterthought.

## 9. On the original, broader NEYO Bible spec

An earlier, now-compacted conversation with the founder described a more ambitious ~15-level
"NEYO Knowledge System" (Company Foundation, Strategy, Product Documentation/PRDs, Engineering
Documentation, Operations/SOPs, Customer Documentation, Legal, Financial, Sales, Marketing, HR, a
Founder Knowledge Base with a Decision Log, an AI/Bundi Knowledge Base, an Investor Data Room, and
a Master Wiki). That full spec was not re-stated in the session that restarted this rebuild, and
rather than guess at details that can't be verified, this rebuild is starting with the level that
is most immediately useful and most directly groundable in real code — Company & Product
Foundation (this document) — and will build outward from here, one real level at a time, confirming
scope with the founder as each new level begins if there's any doubt about what belongs in it.
