# NEYO Bible — Level 04: Operations & SOPs

*Last verified against the real codebase: 2026-07-18. Every fact below was confirmed by directly
reading the named file or by having actually performed the described procedure this session.*

## 1. Production deployment (real, current pipeline)

- **Hosting**: Vercel. **Database**: Neon Postgres. **Domain**: `neyo.co.ke`.
- **Real build command** (`vercel.json`):
  `node scripts/auto-resolve-failed-migrations.js && prisma generate && prisma migrate deploy && next build`
  — migrations are auto-resolved and deployed as part of every single production build; there is no
  separate manual "run migrations" step a human has to remember.
- **Real cron entry point**: Vercel Cron hits `GET /api/jobs/tick` once daily
  (`vercel.json`: `"schedule": "0 3 * * *"`), authorized by a shared `CRON_SECRET` bearer token
  (never a session) — this single endpoint then runs every real due job from the registry
  described in Level 02 §5. `POST /api/jobs/tick` is the same underlying job runner, but
  session-authenticated (`SUPER_ADMIN` only) for manually forcing a specific job.
- **Required environment variables** (confirmed from `.env.example` / real recovery procedure):
  `DATABASE_URL`, `POSTGRES_URL_NON_POOLING` (required — `prisma/schema.prisma`'s datasource block
  uses `directUrl = env("POSTGRES_URL_NON_POOLING")`; without it, `prisma generate`/`migrate
  deploy` throws `P1012`), `NEYO_MASTER_KEK` (tenant data-encryption key), `APP_BASE_URL`,
  `ROOT_DOMAIN`, `DARAJA_WEBHOOK_TOKEN` (M-Pesa), `CRON_SECRET`, `WEBAUTHN_RP_ID`/`WEBAUTHN_ORIGIN`
  (passkey support).

## 2. The real NEYO Ops console (`/founder`) — how the company actually runs day to day

The `founder-ops-client.tsx` component's real `TABS` array (confirmed live, 2026-07-18) is the
single most accurate list of what NEYO Ops actually does operationally, because every tab
corresponds to a real, working tool, not an aspiration:

`Overview`, `Founder Dashboard`, `Credentials & Secrets Vault`, `Demo Requests`,
`Diagnostic Replay`, `Maintenance Ops`, `Trial Limits`, `Release Whitelists`, `Bundi OCR Quotas`,
`Tenant Health Radar`, `SMS Health Monitor`, `Exam Sharing Approval`, `Unit Economics`,
`Build log`, `Metrics`, `Cadence`, `Interviews`, `Platform Flags`, `Feature Toggles`,
`Revenue Grants`, `Custom Feature Requests`, `Discount Campaigns`, `Influencer Codes`,
`Pathway Guide`, `Revenue Ops`, `Pricing Engine`, `Storage Intelligence`, `Storage Archive Tiers`,
`Developer Center`, `Bundi Import`, `Curriculum Library`, `Business Operations`,
`Ecosystem Trends`, `Team & Access`.

Grouped by real operational function:
- **Company health monitoring**: Tenant Health Radar (a real 0-100 Defcon score per school —
  attendance, fee velocity, leadership logins, errors), SMS Health Monitor (delivery ratio vs DND
  rejection tracking with auto-fallback), Unit Economics (real MRR/CAC/LTV).
- **Revenue & pricing control**: Pricing Engine (the real, live-editable weights behind both dual
  pricing models — see Level 01 §5), Revenue Grants, Discount Campaigns, Influencer Codes, Revenue
  Ops.
- **Support & diagnostics**: Diagnostic Replay (15-minute read-only impersonation tokens for
  debugging a specific school's issue without a standing admin backdoor), Maintenance Ops
  (scheduled maintenance windows with a real countdown/lock-screen for affected schools),
  Credentials & Secrets Vault.
- **Rollout control**: Release Whitelists, Feature Toggles, Platform Flags, Trial Limits (see
  Level 02 §4 for the real distinction between the two flag systems).
- **Cross-school moderation**: Exam Sharing Approval (the real queue for approving/rejecting a
  school's request to publicly share a tidied exam paper nationally — built and wired during this
  session's own audit, see the Founder Decision Log entries at the bottom of this document).
- **Sales pipeline**: Demo Requests, Custom Feature Requests.
- **Company knowledge**: Curriculum Library, Business Operations, Ecosystem Trends, Build log,
  Metrics, Cadence, Interviews, Team & Access, Developer Center, Bundi Import, Pathway Guide,
  Storage Intelligence, Storage Archive Tiers.

## 3. Sandbox recovery SOP (this development environment's own real, repeated procedure)

This sandbox has wiped its filesystem (git repo, `node_modules`, Postgres installation, even the
swapfile) many dozens of times across the many sessions that have built NEYO. The exact, proven
recovery sequence — used and confirmed working every single time — is:

```bash
sudo fallocate -l 4G /swapfile; sudo chmod 600 /swapfile; sudo /sbin/mkswap /swapfile; sudo /sbin/swapon /swapfile
cd /home/user/neyo && npm install
git init -q && git config user.email "build@neyo.local" && git config user.name "NEYO Build"
git remote add origin https://github.com/elvisybadbunny-bit/neyorepolink.git
git fetch origin main && git symbolic-ref HEAD refs/heads/main && git reset --hard origin/main
```
Then Postgres is reinstalled (`apt-get install postgresql`), a fresh `neyo_test`/`neyo_test_db`
role+database created, `.env` rewritten from a fixed template, stray untracked migration folders
cleaned (keeping only what's actually tracked in git), `prisma migrate deploy` + `prisma generate`
+ `npx tsx prisma/seed.ts` run in that order, and `tsc --noEmit` used to confirm a clean baseline
before any new work begins.

**The one real lesson this SOP has taught, repeatedly and expensively**: because this sandbox can
wipe *mid-task*, the only real defense is committing and pushing to GitHub the moment any single
unit of work is stable and verified — never batching multiple fixes into one pending commit. Every
wipe that has ever hit *before* a push has cost real, already-completed work that had to be
re-typed from memory. Every wipe that hit *after* a push cost nothing. This is not a style
preference; it is the single most important operational rule for anyone continuing to build NEYO in
this environment.

## 4. Documentation-sync SOP

Every doc file that matters (`FEATURES-CHECKLIST.md`, `CONTEXT-ANCHOR.md`, everything under
`docs/neyo-bible/`) is kept identical across 4 real locations: `/home/user/neyo/docs/`,
`/home/user/neyo/external-backup/docs/`, `/home/user/neyo/external-backup/neyo-project/docs/`, and
`/home/user/docs/` (outside the git repo entirely, a true off-repo backup). Every doc edit is
followed by copying the change to all 4 locations and running `md5sum` across all 4 to confirm they
are byte-identical before committing — this has caught real accidental partial-syncs in the past
and is treated as a mandatory step, not an optional nicety.

## 5. Real, dated operational incidents worth remembering (Founder Decision Log seed)

*(This section is the seed of what Level 05 — the Founder Decision Log — will grow into as a
dedicated document. Recorded here for now since Level 05 doesn't exist yet.)*

- **2026-07-18**: Founder directive — the named subscription tiers "Msingi" and "Pro" (along with
  the already-earlier-retired "Free Karibu" and "Elite") are fully removed from the school-facing
  product. Only the two real Dual Pricing Models remain: Capacity Complete (pay for every module,
  one flat quote) and Modular User & Module (pay only for active users + specific modules opened).
  A leftover legacy "Plan picker" UI showing Msingi/Pro cards was found and deleted from
  `/settings/billing` the same day it was reported.
- **2026-07-18**: A real, previously-unbuilt gap was found in the EE.6 (Exam Privacy Tiers) feature
  — a fully working backend approval-queue endpoint (`/api/ops/exam-sharing`) existed with zero UI
  anywhere calling it. Built and wired `ExamSharingApprovalTab` into the real `/founder` console the
  same day.
- **2026-07-18**: The real, live-verified EE.8 question-bank count was confirmed as exactly 2,670
  unique questions (not the stale "227" figure that had been left in `FEATURES-CHECKLIST.md` from
  an earlier draft) — corrected the same day, via a real seed run against a live database, not a
  static count.
