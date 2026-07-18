# NEYO Bible — Level 10: Product Management & Feature Delivery

*Created 2026-07-18 from the three operating prompts, Features Checklist, Context Anchor, release
services, repository scripts, migrations, and repeated audit evidence. This is the required path
from an idea to a trustworthy shipped workflow.*

## 1. Sources of authority

In descending order for product work:

1. A current explicit founder decision.
2. `docs/FEATURES-CHECKLIST.md`—feature scope and completion state.
3. `docs/CONTEXT-ANCHOR.md`—history, current state, unresolved work, and recovery context.
4. `external-backup/uploads/PROMPT-1..3`—identity, execution, and design rules.
5. Domain design/audit documents under `docs/`.
6. Current code, migrations, and executable tests—the final evidence of implementation truth.

When prose and implementation conflict, investigate. Do not silently choose the more convenient
version. Correct stale documentation and fix real product gaps separately.

## 2. Idea intake

Every request is classified before code:

- **Existing checklist item:** continue/audit the named item.
- **Founder-approved enhancement:** add it to the correct checklist section before claiming it.
- **Bug:** preserve intended feature scope; record the defect and regression proof.
- **Security defect:** prioritize containment and authorization/tenant tests.
- **External activation:** code may already exist; distinguish “implemented” from “live with real
  credentials/hardware/legal action.”
- **Research/design question:** answer from real requirements before creating schema.

A request is not automatically a feature. Copy edits, test corrections, documentation, production
configuration, and verification may be independent work units.

## 3. Definition of ready

Before implementation, confirm:

- user/role and exact workflow;
- Kenyan operational context;
- upstream records and downstream effects;
- permissions and row scope;
- whether a platform/module/release flag applies;
- database ownership and tenant isolation;
- mobile, offline, print, and slow-network needs;
- ambiguous school policy choices;
- acceptance tests and failure cases;
- whether external credentials/hardware are required.

Use clarification only for material ambiguity. Do not ask the founder to decide an implementation
detail that the existing architecture already answers.

## 4. Chunk plan

The default full-stack order from Prompt 2:

1. **Database and migration**—additive where possible; model relations, uniqueness, indexes,
   `tenantId`, retention and audit implications.
2. **Validation and security**—Zod schemas, types, permission matrix, owner/denied roles, row scope.
3. **Service**—real Prisma queries, transactions, idempotency, human errors, downstream effects.
4. **API**—thin handler, auth, tenant context, validation, service call, standardized response.
5. **Components**—reusable UI primitives, Liquid Glass screen surfaces, Lucide icons.
6. **Page integration**—a reachable route/tab/action, not an orphan component.
7. **Four states**—loading, empty, error/retry, populated; plus disabled/offline where relevant.
8. **Kenyan seed/test data**—idempotent and realistic.

Existing foundations may make a chunk “reuse/no schema change,” but the plan must say why. Never
invent an unnecessary second engine.

## 5. Database checklist

For each model:

- Is it tenant-owned, company-wide, or legitimately nullable before tenant creation?
- If tenant-owned, is it added to `TENANT_OWNED_MODELS` in the same unit?
- Are unique constraints scoped correctly (often tenant + business key)?
- Are retries safe through an idempotency key or unique business reference?
- Does deletion mean hard delete, soft delete, cancel, reverse, archive, or immutable history?
- Does a sensitive relation need narrow permissions/retention?
- Can migration deploy safely on populated Postgres?
- Is rollback code-only, compensating data migration, or restore-from-snapshot?

Current production migrations live in `prisma/migrations/` (19 directories at this verification).
Production uses `prisma migrate deploy`, never `migrate reset`.

## 6. Service-layer standard

Business truth belongs in `src/lib/services/`:

- Services accept a `SessionUser` where actor scope matters.
- Tenant queries run under `withTenant()`/`tenantDb()`.
- Transactions group state changes that must succeed together.
- Human-readable domain errors distinguish forbidden, not found, conflict, invalid, quota, and
  locked states.
- Side effects (notification, invoice, audit, usage) occur in the service path, not only in UI.
- External callbacks are idempotent.
- Recommendations remain distinct from confirmed writes.
- Existing functions are reused rather than duplicated in a new route/component.

`src/lib/api/respond.ts` is the central error-response boundary; new domain errors must be mapped so
routine conflicts do not become generic 500s.

## 7. Authorization test matrix

At minimum:

| Case | Expected |
|---|---|
| intended role, owning tenant/record | succeeds |
| signed out | 401/login redirect |
| wrong role | 403/forbidden redirect |
| correct role, wrong tenant id | no data/blocked |
| parent, unrelated child | blocked |
| teacher, unrelated class/subject | blocked |
| read-only view-as, mutation | blocked |
| company support, founder-only control | blocked |

Authorization must be awaited. Client-supplied guardian/student/tenant ids are validated against the
session rather than trusted.

## 8. UI and design acceptance

- Odoo structure, Apple restraint, Linear speed.
- Liquid Glass light and dark; sidebar remains a distinct pane.
- 360px-first layout; no hidden primary action below an unusable modal.
- One primary CTA per state.
- Real, specific copy; no generic SaaS slogans.
- Bundi naming law on intelligent surfaces.
- Inputs have labels/errors; destructive actions confirm.
- Keyboard and focus behavior work.
- Print/PDF output is plain, high contrast, branded, and not glass.
- Loading skeletons terminate; empty states explain the next real action.

A component file existing is not page integration. Verify a user can navigate/click to it.

## 9. Release controls

Two controls must not be confused:

- `PlatformFlag` in `platform-flags.service.ts`: company-wide pause/kill switch.
- `FeatureReleaseControl`: `PAUSED`, `EARLY_ACCESS_PILOT`, or `LIVE`, including whitelisted schools.

EE features use `assertEeFeatureReleased(featureId)`. Kenyan extension suites use their real
`assertFeatureUnlocked()` checks. A released UI without service enforcement is insufficient; a
service gate with no reachable UI is also incomplete.

## 10. Verification ladder

Run the narrowest evidence first, then broaden:

1. Static source trace: schema → registry → service → route → consuming component/page.
2. `git diff --check`.
3. Prisma validation/generation/migration status where schema changed.
4. Cache-free `npm run typecheck` (confirm no tracked `*.tsbuildinfo`).
5. Named feature regression script against real Postgres.
6. `npm run test:roles` for permission-sensitive changes.
7. Adjacent regression suites for shared engines.
8. Real HTTP round-trip with intended and denied roles.
9. Browser workflow and mobile width.
10. Screenshot of the populated and important exception state.
11. Production build when change scope warrants it.

The repository currently has 390 `*-test.ts` scripts and 631 scripts total; existence is not proof
of passing. Record the command and actual result.

## 11. Evidence vocabulary

Use precise status:

- **Built:** implementation exists.
- **Wired:** reachable UI calls the real API/service.
- **Tested:** named test was executed now.
- **Verified live:** real database/HTTP/browser workflow observed.
- **Activation pending:** implementation exists but credentials/hardware/external action absent.
- **Deferred:** intentionally not implemented.
- **Blocked:** prerequisite prevents work.

Do not convert activation-pending or partial seams into `[x]` unless the checklist definition is
fully satisfied and evidence supports it.

## 12. Bug and audit workflow

1. Reproduce before changing code.
2. Identify intended behavior from checklist/decision log.
3. Trace root cause, including test and seed state.
4. Distinguish product bug, test bug, stale docs, environment failure, and seed artifact.
5. Add/repair regression proof.
6. Verify no wider permission/tenant regression.
7. Commit the smallest stable unit immediately.
8. Update checklist evidence and anchor honestly.

The July 2026 audits demonstrated why this matters: missing UI behind “full-stack” claims,
un-awaited authorization, unregistered tenant models, stale assertions, and cached typechecks were
all different defect classes needing different fixes.

## 13. Commit and push discipline

- Work only on the session branch.
- Commit one coherent, verified unit.
- Push immediately before screenshots or another feature.
- Never commit `.env`, credentials, generated caches, local DB noise, `node_modules`, or large
  throwaway artifacts.
- Use conventional, factual commit messages.
- After push, verify clean status and remote result.

## 14. Documentation closeout

At completion:

1. Update only the relevant checklist lines; preserve original wording where policy requires.
2. Add evidence: paths, tests, screenshots, date, limitations.
3. Add a top Context Anchor entry: request, work, schema, tests, commits, unresolved/next.
4. Update the relevant Bible current-state level if architecture/workflow changed.
5. Add a Founder Decision Log entry only for a durable direction change.
6. Sync repository backup copies and byte-compare.

## 15. Definition of done

A feature is done when the intended role can complete the real workflow with real records; denied
roles and other tenants cannot; retries/errors are safe; UX states and mobile layout work; tests
were executed; downstream hand-offs are real; documentation matches; and the stable unit is pushed.
