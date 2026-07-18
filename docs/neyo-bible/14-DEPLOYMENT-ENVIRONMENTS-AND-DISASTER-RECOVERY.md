# NEYO Bible — Level 14: Deployment, Environments & Disaster Recovery

*Created 2026-07-18 from `vercel.json`, `fly.toml`, `Dockerfile.worker`, Prisma migrations,
`docs/DEPLOY.md`, the Go-Live Checklist, package scripts, and the recovery history. Commands and
provider settings must be rechecked before production use.*

## 1. Runtime topology

NEYO's intended production topology is:

- **Web/API:** Next.js 14 on Vercel, region `fra1`.
- **Database:** managed PostgreSQL (Neon in the current deployment plan).
- **Background worker:** separate Fly.io app `neyo-worker`, primary region `fra`, no public HTTP
  service, running `npx tsx scripts/worker.ts`.
- **Queue/cache:** Redis/Upstash when activated; development can run controlled in-process jobs.
- **Files:** Cloudflare R2 in production; local provider in development.
- **DNS:** `neyo.co.ke` root plus wildcard school subdomains.
- **Scheduled trigger:** Vercel Cron calls `/api/jobs/tick` daily; the registry determines which
  Nairobi-time jobs are due.

The web process must not be relied on as a permanent queue worker. Long-running jobs belong in the
separate worker when Redis/BullMQ is enabled.

## 2. Environments

### Local development

Purpose: code changes, migrations, seed data, feature tests, screenshots. Never connects to the
production database by default. `.env` is local and untracked.

Typical commands:

```bash
npm install
npm run prisma:generate
npm run migrate:deploy
npm run db:seed
npm run dev
```

Use the exact repository guide for the current database setup; old anchor sections describing
SQLite are historical and superseded by the current PostgreSQL schema.

### Preview/branch

Purpose: review a branch/PR against non-production services. Preview must use isolated data or a
safe staging database. It must never auto-run destructive tests against production.

### Production

Purpose: real schools. Production uses managed secrets, real provider callbacks, production RLS,
backups, monitoring, and controlled releases. Seeding demo credentials into production requires an
explicit go-live procedure, not an automatic developer convenience.

## 3. Current build and deploy commands

`vercel.json` defines:

```text
node scripts/auto-resolve-failed-migrations.js && prisma generate && prisma migrate deploy && next build
```

Order matters:

1. Resolve only recognized failed-migration conditions through the documented script.
2. Generate Prisma Client for the current schema.
3. Apply pending tracked migrations.
4. Build Next.js only after the database migration step succeeds.

The `package.json` equivalents are `prisma:generate`, `migrate:deploy`, `typecheck`, `build`, and
`worker`.

## 4. Required configuration classes

### Database

- pooled runtime `DATABASE_URL`;
- non-pooling/direct migration URL such as `POSTGRES_URL_NON_POOLING`, because Prisma migration
  advisory locks should not use a transaction pooler.

### Application security

- `NEYO_MASTER_KEK`;
- `APP_BASE_URL`, `ROOT_DOMAIN`;
- `CRON_SECRET`;
- WebAuthn RP id/origin;
- webhook verification secrets.

### Optional providers

Daraja, R2, Redis, OAuth providers, communications, observability and analytics. Many can be saved
through the encrypted company integration vault; environment fallbacks remain server-only.

Never copy real values into this document. `.env.example` lists names, not production truth.

## 5. Pre-deployment gate

Before production deployment:

1. Confirm clean branch and reviewed diff.
2. Confirm no `.env`, token, credential, local DB, cache, or sensitive screenshot is staged.
3. Run `git diff --check`.
4. Validate Prisma schema and migration status.
5. Run cache-free typecheck.
6. Run role/security tests and feature-specific regression suites.
7. Run production build.
8. Review additive/destructive migration risk and backup status.
9. Confirm required secrets in the target environment.
10. Confirm callback/DNS changes are coordinated.
11. Record rollback owner and expected health checks.

The PR template under `.github/pull_request_template.md` captures the minimum checks. CODEOWNERS is
a template and still contains `@your-github-username`; repository settings must be configured with
the real owner before treating automatic review as active.

## 6. Migration policy

- Migrations are forward-only, tracked, chronological artifacts.
- Never run `prisma migrate reset` in production.
- Never edit an already-applied migration to change production history.
- Prefer additive columns/tables and staged backfills.
- For destructive changes: backup, deploy compatibility code, migrate/backfill, verify, then remove
  old structure in a later release.
- `auto-resolve-failed-migrations.js` is not permission to mark arbitrary broken SQL successful.
  Investigate P3009/P1002 and verify actual schema state.

Current tracked migration count at this level's creation: 19.

## 7. Deployment sequence

1. Push reviewed branch/merge according to repository policy.
2. Vercel starts the configured build.
3. Watch migration output—do not ignore warnings because Next build later succeeds.
4. Confirm deployment URL and `/api/health`.
5. Test login and tenant resolution.
6. Test a read-only school dashboard.
7. Test one safe write in a designated production test tenant.
8. Verify scheduled endpoint authorization.
9. Verify worker/Redis where enabled.
10. Verify provider callbacks and file access.
11. Monitor errors, latency, and database connections during the initial window.

## 8. Post-deploy smoke matrix

- root/marketing and `/status` load;
- login/session/logout;
- school subdomain resolves only its tenant;
- principal dashboard and one scoped list;
- parent sees only linked child;
- teacher sees assigned class;
- finance list loads without mutation;
- R2 upload/download in a test category;
- M-Pesa credential status and callback endpoint health (do not charge unintentionally);
- notification test to approved internal recipient;
- `/api/jobs/tick` rejects missing secret;
- founder/support consoles reject school roles.

## 9. Web rollback

Per `docs/DEPLOY.md`, Vercel can promote a previous deployment. Use this for code/runtime regression
when the previous version is schema-compatible.

Steps:

1. Stop further rollout/action.
2. Identify last known-good deployment and migration compatibility.
3. Promote previous deployment.
4. Verify health/login/critical workflows.
5. Keep incident open until database/job/provider side effects are reconciled.
6. Revert/fix code in Git; do not leave production permanently detached from repository history.

## 10. Worker rollback

Fly worker has no public service. A bad worker can still damage data or repeat notifications.

1. Scale/stop worker if ongoing side effects are unsafe.
2. Inspect `JobRun`, webhook deliveries, and provider references.
3. Roll back Fly release or deploy a fixed image.
4. Ensure queued jobs are idempotent before resuming.
5. Reconcile partially completed work and notifications.

The current Dockerfile installs BullMQ/ioredis during image build and copies
`scripts/worker.ts.example` to `scripts/worker.ts`; verify this generated entrypoint still matches
the committed worker implementation before deployment.

## 11. Database incident and restore

A code rollback does not reverse an applied migration. For database corruption/loss:

1. Declare incident and stop writes/jobs if needed.
2. Preserve current database and provider logs.
3. Identify restore point and acceptable data-loss window (RPO).
4. Restore into a separate database first.
5. Apply required migrations and integrity checks.
6. Compare critical counts/references (tenants, users, students, invoices, payments, audit rows).
7. Reconcile provider events after restore cutoff.
8. Switch application only after approval.
9. Retain old database read-only until incident closure.

Never “fix” production by seeding over missing real records.

## 12. Backup policy to establish/verify

- Automated managed Postgres backups/PITR.
- R2 object versioning/lifecycle as appropriate.
- Encrypted export of critical company configuration.
- GitHub as source/document history—not a database backup.
- Secret recovery/rotation procedure stored outside the application database.
- Quarterly restore drill with measured recovery time.

Record actual provider retention and successful restore-test dates; desired policy is not evidence.

## 13. Disaster scenarios

### Database unavailable

Fail health checks, stop mutation retries that could duplicate provider operations, communicate
status, monitor provider callbacks for later reconciliation.

### R2 unavailable

Keep database metadata consistent, pause new uploads if confirmation cannot complete, preserve
manual non-file workflows, retry only idempotently.

### Redis/worker unavailable

Web app remains available where possible; queueable work waits or controlled fallback runs. Do not
silently lose jobs. Restore worker and inspect due/failed runs.

### Payment provider unavailable

Do not mark invoices/subscriptions paid. Preserve pending requests and offer legitimate alternative
recording/reconciliation flow.

### Secret compromise

Rotate at provider, update vault/environment, revoke old value, redeploy/restart workers, audit use,
and follow Level 08 incident procedure.

### DNS/domain failure

Verify Vercel project/domain and wildcard DNS. Do not weaken tenant checks to make an incorrect host
work.

## 14. Recovery objectives

NEYO must formally approve RTO/RPO per service tier. Until approved, incident owners must state:

- last verified backup;
- estimated restore time;
- data potentially created since backup;
- provider events requiring replay;
- school communication cadence.

Never publish invented uptime/recovery guarantees.

## 15. Sandbox recovery versus production DR

The repeated sandbox recovery procedure (reclone, install, rebuild local Postgres, migrate, seed)
is for disposable development environments only. Production DR restores real data from managed
backups and reconciles external events; it never seeds demo schools as recovery.

## 16. Incident closeout

- timeline and owner;
- root cause and contributing controls;
- tenants/data/actions affected;
- communication sent;
- rollback/restore evidence;
- reconciliation results;
- tests and monitoring added;
- follow-up owner/date;
- durable decision added to Level 05 if direction changed.

## 17. Maintenance rule

Update commands/topology immediately when deployment config changes. Keep provider aspirations
separate from verified production configuration. Cross-reference Level 12 for integration failure
and Level 08 for security incidents.
