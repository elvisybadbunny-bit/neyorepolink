# NEYO Bible — Level 02: Engineering Architecture

*Last verified against the real codebase: 2026-07-18. Every fact below was confirmed by directly
reading the named file in `/home/user/neyo`.*

## 1. Real folder structure (`src/`)

- `src/app/` — Next.js 14 App Router. `(app)/` route group holds the 42 real signed-in app modules
  (dashboard, academics, students, exams, finance, hostel, transport, library, cafeteria, clinic,
  discipline, comms, founder, portal, settings, and more). `(auth)/` holds `login`, `get-started`,
  and public marketing/onboarding pages. `api/` holds all 473 real API route handlers.
- `src/lib/core/` — the foundational, cross-cutting engine: roles, permissions, sessions, tenancy,
  page guards, feature flags, plans. 22 real files. This is the layer every other layer depends on.
- `src/lib/services/` — 198 real service files. This is where nearly all real business logic lives.
  API routes are intentionally thin — they parse/validate input, call one or more service
  functions, and format the response. A service function is the real source of truth for "what
  actually happens," never the route handler.
- `src/lib/validations/` — Zod schemas, one file per domain, imported by both API routes (server
  validation) and, where relevant, forms (client validation) — never duplicated by hand.
- `src/components/` — React client components, organized by domain (e.g.
  `src/components/academics/`, `src/components/founder/`, `src/components/settings/`).
- `src/lib/jobs/` — the real scheduled-job/cron system (see §5).
- `prisma/` — `schema.prisma` (9,116 lines, 341 real models), `migrations/` (19 real tracked
  migrations as of 2026-07-18), `seed.ts` (idempotent, seeds 4 real demo schools), `rls/` (raw SQL
  Row-Level-Security policies — see §3).

## 2. Multi-tenancy — the real mechanism, in detail

NEYO is a single Next.js application and a single Postgres database serving every school. Tenant
isolation is enforced at three real, independent layers (defense in depth — not one mechanism
trusted alone):

**Layer 1 — `AsyncLocalStorage` request-scoped tenant context** (`src/lib/core/tenant-context.ts`,
39 lines). `withTenant(tenantId, fn)` runs a function with a `tenantId` bound to that specific
async call chain — every `await` inside automatically carries it, with zero need to thread a
`tenantId` parameter through every function signature. `requireTenantId()` throws immediately if
code that needs a tenant runs outside this scope, rather than silently defaulting to "no tenant"
(which would be a data leak waiting to happen).

**Layer 2 — `tenantDb()`, an auto-scoping Prisma Client extension** (`src/lib/core/tenant-db.ts`).
For every model registered in `TENANT_OWNED_MODELS`:
- Every read (`findMany`, `findFirst`, `count`, `aggregate`, `groupBy`, `updateMany`,
  `deleteMany`) has `tenantId: <current tenant>` force-injected into its `where` clause — a
  developer cannot forget this, because they never write it by hand.
- Every create (`create`, `createMany`) has `tenantId` auto-stamped onto the row being written.
- `findUnique`/`update`/`delete` (which can't take `tenantId` inside a Prisma unique `where`) are
  wrapped to verify the row's real tenant matches BEFORE the mutation runs, throwing
  `TenantIsolationError` on any mismatch — a real, previously-fixed security bug (documented
  directly in the source comment) used to check this AFTER the mutation had already happened,
  meaning a cross-tenant write could occur before being detected; this was fixed to check first.
- Soft-delete-enabled models (`G.6`) have `delete`/`deleteMany` transparently rewritten into an
  `UPDATE ... SET deletedAt = now()` instead of a real row deletion, so deleted records land in a
  real Recycle Bin rather than vanishing — and reads automatically exclude soft-deleted rows unless
  `includeDeleted: true` is explicitly passed.

**Layer 3 — Postgres Row-Level Security** (`prisma/rls/policies.sql`, plus `audit-immutable.sql`
and `search.sql` in the same folder) — real, database-enforced SQL policies as a second,
independent backstop in production, so even a hypothetical bug in the application-level `tenantDb()`
layer cannot leak data across schools at the database level.

**The standing engineering rule**: any new Prisma model with a `tenantId` field must be added to
`TENANT_OWNED_MODELS` in `src/lib/core/tenant-tables.ts` (426 lines, well over 200 real model names
registered as of 2026-07-18) the moment it's created — this is treated as a security control, not a
style preference, because an unregistered tenant-owned model gets none of Layer 2's protection.

## 3. Authentication, sessions, and authorization

- **Session/identity**: `src/lib/core/session.ts` (327 lines) — `requireRole(...roles)` and
  `requirePermission(...permissions)` are the two real guard functions every API route calls before
  doing anything sensitive. `requireRole` throws a 403 if the signed-in user's role isn't in the
  allowed list; `requirePermission` checks a granular permission string via `can(role, permission)`
  (`src/lib/core/permissions.ts`, a real role→permission matrix, not a database table).
- **Page-level guards**: `src/lib/core/page-guards.ts` — unlike the API guards (which throw), page
  guards (`requirePagePermission`, `requirePageUser`) **redirect** a user who lacks access to
  `/forbidden` or `/login`, so a real user never sees a raw error screen, only a calm redirect.
- **Two-factor enforcement**: a session can carry `twoFactorEnforcedMissing`, which forces a
  redirect to `/settings/security?enforce2fa=1` before any other page loads, for accounts where 2FA
  has been made mandatory (`G.34`).
- **Company vs. school roles**: see Level 01 §3 — `requireRole` call sites across the founder-ops
  namespace explicitly check for `SUPER_ADMIN`/`FOUNDER`/`NEYO_OPS`, never a school role, and vice
  versa for school-scoped routes.

## 4. The real feature-flag / release-control system

Two independent, real flag systems exist, each solving a different problem — an important
distinction, not two names for the same thing:

- **`PlatformFlag`** (`src/lib/services/platform-flags.service.ts`) — a company-wide, deliberately
  NOT tenant-owned kill switch. When NEYO Ops pauses a module here, it is disabled for every school
  simultaneously, overriding whatever a specific school's own subscription/module settings say —
  used for "we're still building this, nobody should see it yet."
- **`FeatureReleaseControl`** — a more granular per-feature rollout gate supporting
  `PAUSED | EARLY_ACCESS_PILOT | LIVE` states, used for staged rollouts to specific whitelisted
  pilot schools (e.g. Karibu High, Uhuru Academy) before a full public "Mega Button" launch. The
  `EE.*`-prefixed features (exam/CBC tooling built in mid-2026) are gated this way via
  `assertEeFeatureReleased("EE.6")`-style checks.

## 5. Background jobs — real, scheduled, cron-driven

`src/lib/jobs/registry.ts` defines every real recurring job NEYO runs, each with a real fixed daily
(or weekly) time in East Africa Time. As of 2026-07-18, real scheduled jobs include (not an
exhaustive list, but every one of these is real and currently registered):
- `subscription-state-machine` (01:00 daily) — advances every subscription through its real
  `TRIAL -> ACTIVE -> GRACE -> SUSPENDED` lifecycle.
- `pricing-reprice-check` (05:00 daily) — Capacity-Based Pricing 2.0's real usage-growth check
  against NEYO-Ops-configured thresholds (Level 01 §5).
- `recycle-purge` (02:00 daily) — purges soft-deleted records older than 30 days.
- `fee-reminders` (09:00 daily) — SMS overdue-fee reminders, deduped so a parent isn't spammed.
- `demo-purge` (03:00 daily) — hard-deletes expired demo-mode tenants (`G.14`).
- `term-pulse` (07:00 Mondays) — a weekly digest of real term trends to school leadership (`G.15`).
- `storage-optimizer-run` (02:30 daily) — the Storage Intelligence Engine's real duplicate-file
  detection and cleanup pass (`W.1`).

A job is enqueue-able and cron-schedulable automatically the moment it's added to `JOBS` in this
registry file — there is no separate scheduler configuration to maintain in a second place.

## 6. Documents, PDFs, and printing

Every generated document (invoices, admission letters, report cards, exam papers, timetables) uses
one real, consistent system: `@react-pdf/renderer`. There is deliberately no second PDF library or
ad-hoc HTML-to-PDF path anywhere in the codebase — every new document type reuses the same
rendering approach as every document type that came before it.

## 7. Testing culture — real, executable regression scripts, not just claims

This codebase's real verification discipline is `scripts/*-test.ts` — standalone TypeScript files
run via `npx tsx scripts/<name>-test.ts` that exercise real service functions against a real
Postgres database (never mocks), print a pass/fail line per check, and end with an aggregate
"`N passed, 0 failed`" summary. As of 2026-07-18 there are 60+ of these real test scripts covering
individual features (e.g. `ee6-exam-sharing-approval-test.ts`, `z3-venue-lab-system-test.ts`), plus
`test-roles.ts` (27 checks covering the core role/permission/tenancy engine) and
`founder-batch-test.ts` (a broader smoke test across many G./J. features at once). The standing
practice across every session working on this codebase is to actually RUN these scripts live before
trusting a claim that a feature "still works," rather than trusting a prior commit message or
checklist entry at face value — this Bible itself follows that same standard: every fact above was
confirmed by reading the real file, not recalled from an earlier summary.
