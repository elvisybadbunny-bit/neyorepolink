# NEYO Bible — Level 18: Product & Engineering Handbook

*Created 2026-07-18 from Levels 02/10–14, the current codebase, Checklist/Anchor, package scripts,
Prisma schema, API routes, tests and deployment configuration. It consolidates the founder-requested
Product Management and Technical & Engineering library without pretending every proposed roadmap
item is built.*

## 1. Product vision

NEYO is a Kenya-first, multi-tenant operational system for schools. It connects academic,
administrative, financial, family and campus workflows in one tenant-safe record system. Product
quality means a real role completes a real workflow on a phone/slow connection—not a feature count.

Vision principles: workflow integration, human accountability, Liquid Glass craft, Kenyan context,
privacy/tenant safety, modular release, rule-based core with optional Bundi acceleration, and
honest evidence.

## 2. Product requirements document (PRD) template

1. Feature id/name/status/owner.
2. Problem and evidence (interview, incident, checklist directive).
3. Target roles and excluded users.
4. Current workflow and pain.
5. Proposed end-to-end workflow.
6. Functional requirements and business rules.
7. Permissions, row scope, tenant ownership.
8. Data model/migration/retention.
9. APIs/integrations and failure behavior.
10. UI states, mobile, offline, print/accessibility.
11. Notifications, invoices, audits and downstream hand-offs.
12. Release flag/pilot/rollback.
13. Acceptance and negative tests.
14. Metrics and privacy/security review.
15. Out of scope/dependencies/open decisions.
16. Founder approval/date/version.

## 3. Feature specification template

Turn PRD into implementable chunks: exact Prisma fields/constraints; Zod input/output; service
function signatures and errors; routes/methods/permissions; components/pages; seed data; test cases;
release control; migration and rollback. Reuse current service engines and UI patterns.

## 4. Backlog and roadmap

`FEATURES-CHECKLIST.md` is approved feature scope; `DD-BACKLOG-DRAFT.md` and `NeyoIdea` may hold
unapproved ideas. Roadmap views must distinguish committed, discovery, pilot, activation-pending,
deferred and rejected. No date promise without capacity/dependency assessment.

Roadmap horizons:

- **Now:** active verified work and production defects.
- **Next:** ready items with prerequisite/design decisions.
- **Later:** valuable but not ready/committed.
- **External:** credentials, hardware, legal or partnership dependent.

## 5. Changelog and release notes

### Internal changelog entry

Date/version/commit, checklist ids, migrations, behavior change, tests, flags, activation, rollback,
known issues. Context Anchor is detailed history; Build Log is operational summary.

### School-facing release note

Specific user benefit, affected roles, where to find it, whether enabled/pilot, action required,
important behavior/limits, support path. No code jargon, secret names, exaggerated claims, or “AI”
in product copy—use Bundi.

## 6. Product lifecycle policy

Stages: discovery → approved/ready → build → internal verification → pilot → live → maintained →
deprecation → retired. Every stage has owner/evidence. A paused flag is not deletion. A pilot must
have eligibility, feedback, monitoring and exit decision.

## 7. Deprecation policy

1. Inventory users/data/integrations.
2. State replacement and reason.
3. Approve notice/migration/retention plan.
4. Stop new adoption before removing reads.
5. Export/migrate data.
6. Monitor usage and support.
7. Remove UI/API/service/schema in compatible stages.
8. Preserve audit/legal evidence.
9. Update Checklist, docs, contracts and release notes.

Never silently remove an API or school record workflow.

## 8. System architecture

Next.js App Router (`src/app`), thin API routes (`src/app/api`), business services
(`src/lib/services`), Zod validations, Prisma/Postgres, tenant-scoped extension, React components,
provider seams, BullMQ worker/cron, R2 files, Vercel/Fly deployment. Detailed mechanics: Levels 02,
11, 12 and 14.

## 9. Database dictionary policy

Level 11 is conceptual. The executable dictionary is `schema.prisma`. For each model/field document
purpose, ownership, sensitivity, relations, unique/index rules, status values, retention and writing
service. Generate reference output from schema where possible; do not maintain a drifting manual
field copy.

## 10. API documentation policy

Each route needs method/path, auth/permission, tenant behavior, query/body Zod schema, success shape,
error codes, side effects, idempotency, rate limit, example with synthetic Kenyan data, and release
flag. Public APIs additionally document bearer scopes, usage limits, versioning and webhook events.
Never publish secrets or internal-only routes.

## 11. Coding standards

- TypeScript strict; avoid untyped `any` where a real shape exists.
- Server components by default; client components only for interaction/browser APIs.
- Zod at trust boundaries.
- Business logic in services, not route/component.
- `tenantDb()` for tenant-owned data.
- Await guards and side effects.
- Transactions for coupled writes.
- Idempotency for callbacks/retries/batch operations.
- Human domain errors through central responder.
- Existing UI primitives/tokens; Lucide icons; no arbitrary design divergence.
- Comments explain why/invariant, not restate syntax.
- No credentials, fake data path, placeholders or hidden hardcoded policy.

## 12. Git workflow and branching strategy

Work on the assigned branch only. Pull/recover from remote before work; inspect status; make focused
changes; test; commit coherent stable units; push immediately. Use factual conventional commits
(`feat`, `fix`, `docs`, `test`, `refactor`, `chore`). Do not rewrite shared production history or
force-push without explicit policy.

PRs contain why/scope, checklist id, migration, tests, security/tenant impact, screenshots and
activation/rollback. Branch protection/CODEOWNERS must be configured in GitHub; repository files
alone do not enforce settings.

## 13. Testing strategy

Layers:

- pure functions/validation;
- service integration against real Postgres;
- tenant/role negative tests;
- API HTTP round trips;
- browser workflow/mobile screenshots;
- adjacent regression suites;
- typecheck/lint/build;
- provider sandbox/production activation tests;
- load/stress tests for timetable/scale-sensitive paths.

Test data is deterministic, Kenyan, isolated and cleaned/idempotent. Never run destructive test
scripts against production.

## 14. Quality assurance manual

QA verifies requirement traceability, role access, cross-tenant isolation, happy/error/empty/loading,
mobile/light/dark, keyboard/focus, offline/retry/idempotency, print/PDF, notification/payment side
effects, audit, performance and copy. Capture browser console/network errors. A screenshot is visual
evidence, not database/authorization proof.

## 15. Deployment and infrastructure

Level 14 is the deployment runbook; Level 12 provider infrastructure. Current build: migration
resolution → Prisma generate → migrate deploy → Next build on Vercel. Worker runs separately on
Fly; production database/files/queue are managed services. Environment ownership, health checks,
backups and rollback are release requirements.

## 16. Backup, restore and disaster recovery

Follow Level 14. Test actual managed backup/PITR and restore into an isolated database. Reconcile
provider callbacks after restore. Git is source backup, not customer-data backup. Record RTO/RPO
rather than inventing them.

## 17. Monitoring and alerting guide

Monitor health endpoint, error rate, latency, DB connections/locks, job failures/age, webhook
failures, payment pending/suspense, storage quota, provider errors, auth/rate-limit anomalies and
school-health impact. Alerts need severity, owner, runbook, dedupe and escalation. Avoid alerting on
raw personal data.

## 18. Third-party integration guide

Level 12 is canonical. Every integration has owner, purpose, data shared, credential location,
scopes, callback, rate/cost, sandbox, fallback, SLA/status, retention/deletion, security review,
activation evidence and exit plan.

## 19. AI/Bundi development standards

Internal engineering may use AI-assisted tools, but product copy follows Bundi. Standards:

- never send secrets or unapproved school/personal data;
- use smallest necessary context and synthetic data;
- verify generated code against architecture and licenses;
- deterministic core and manual fallback;
- confidence/human review for uncertain extraction;
- prompt/model/version recorded for material evaluated workflows;
- tenant separation, quota/cost and provider failure tests;
- no autonomous financial/medical/discipline/result decision without designed authority.

## 20. AI code review checklist

- Is generated code understood line-by-line?
- Real source/API/version verified?
- No fabricated model/function/field?
- Tenant registration/scope correct?
- Guards awaited and negative tests present?
- Input/output validated?
- Idempotency/transaction/error behavior?
- No secret/PII leakage in prompt/log/test?
- Dependencies/license/supply-chain reviewed?
- UI follows design/Bundi copy law?
- Tests executed, not merely generated?
- Human reviewer named for high-risk change?

## 21. Technical debt register

Each item: id, area, evidence, impact, risk/security, workaround, proposed fix, dependency, owner,
priority, introduced/last reviewed, target, status. Do not label unfinished checklist scope as debt;
debt is a known compromise in implemented systems.

Current examples to track from real docs include placeholder CODEOWNERS, production RLS/monitoring
verification, provider activation, and any documented seed/test/tooling fragility—not inventing
code defects without reproduction.

## 22. Known issues log

Record reproducible current defects with environment, version/commit, steps, expected/actual,
severity, affected roles/tenants, workaround, owner, linked test/fix. Close with verification commit.
Historical resolved issues remain in anchor/build log, not as open known issues.

## 23. Change management

Assess scope/risk/data/provider/user impact; approve; backup; implement/test; communicate; deploy;
monitor; rollback/reconcile if needed; close evidence. Emergency change records the same fields
retrospectively within the incident timeline.

## 24. Maintenance rule

This handbook references canonical deep levels instead of duplicating them. Update policies when the
real architecture/tooling/process changes; keep roadmap aspirations explicitly non-implemented.
