# NEYO Founder Manual V2 — Module 29: Developer APIs, Webhooks, Storage & Integrations

**Pages:** `/settings/developer`, `/settings/storage`, Founder Ops Credentials  
**Last verified:** 2026-07-18

## 1. Access and safety

Developer requires `api.manage`; Storage/settings require authorized school settings. API keys,
webhook secrets and provider credentials are passwords—never chat, screenshots, browser client code
or Git.

## 2. API Keys

Card shows usage last 7 days, existing key prefix/name/scopes/status/last used/expiry/environment.

Create:

- Name
- Scopes
- Expiry where offered
- Environment Test/Live
- **Create Key**

Plain token appears once. **Copy** into secure server vault. NEYO stores hash/prefix, not recoverable
plaintext. **Revoke** immediately blocks. Rotate by create/test/switch/revoke old.

Bearer clients send `Authorization: Bearer ...`; scopes/rate limit/tenant apply. Never use Live key in
mobile/browser public bundle.

## 3. API Usage

Shows requests, successes/errors, latency/endpoints/status over current period. Usage logs are
operational evidence and retained under policy. Unexpected traffic → revoke/investigate.

## 4. Webhooks

Create fields:

- Destination HTTPS URL
- Event selections

**Create Webhook** generates signing secret. Existing row:

- Copy Secret
- Send Test
- Pause/Resume
- Remove

NEYO signs raw body (`X-NEYO-Signature` timestamp/HMAC), includes event/delivery ids. Receiver must
verify signature before parsing/processing, enforce replay age and idempotency, then return 2xx.
Failures create WebhookDelivery and bounded retry/backoff job.

## 5. Events

Current catalog includes payment/subscription/user/notification events according to validation.
Subscribe only needed events and minimize data. Test event is synthetic; it does not perform real
business action.

## 6. Storage Vault

Shows provider, encryption, usage/action required, recent files.

Actions:

- Run Health Check
- Configure provider → Save Storage Vault
- Request Google Workspace Upgrade
- Request NEYO Managed Add-on
- Link External Storage: label + URL → Link
- Re-check Link
- Remove external link

R2/local provider stores NEYO files; external Drive/Dropbox/OneDrive URL linking is a verified link,
not full API sync unless integration activated. Presigned upload → upload → confirm; tenant key prefix
and serve permission apply. Images resize/strip EXIF.

## 7. Content-addressable/lifecycle

SHA-256 dedup prevents duplicate bytes while preserving references. Hot/Warm/Cold archive and
optimizer may flag/compress/delete only under configured retention; one reference deletion must not
remove bytes still used.

## 8. Integration Credentials

Founder Ops Credentials & Secrets Vault stores encrypted statuses/values for Daraja, Africa's
Talking, Resend, WhatsApp, VAPID, Redis, R2, OAuth, YouTube, Sentry/Better Stack/PostHog and Bundi
provider. School Daraja credentials are per-tenant Payments settings; company central billing is
separate.

Activation checklist: provider account/consent; least scopes; callback/domain; vault save; sandbox;
one real safe test; error/idempotency; monitoring/cost; rotation/exit.

## 9. Common errors

Lost plaintext key → revoke/create; 401 invalid/revoked/expired; 403 scope; 429 limit; webhook test
fails DNS/TLS/non-2xx/signature receiver; repeated deliveries require idempotency; upload denied type/
size/tenant; external link unreachable; provider “configured” without real credentials.

## 10. Founder verification

Create/copy-once/hash/revoke key; Test vs Live; scopes/rate/tenant; usage log; webhook HMAC/test/pause/
retry/remove; R2 presign-confirm-serve/cross-tenant; image processing; dedup references; health/link/
unlink/upgrade; vault secret redaction/rotation; worker/Redis callback monitoring.

## 11. Gap review

Developer and Storage actions are wired. External linked-storage provisioning and provider delivery
remain activation-dependent and must not be called live without credentials/consent. No orphaned
component found.

## 12. Edit points

Developer panel/API key/webhook services/routes; bearer auth; Storage Vault/storage providers/CAS/
lifecycle; integration credentials and activation docs; jobs/observability.

## One-time Vercel preview database bootstrap

An empty database has no founder or school login. For an explicitly disposable Preview/demo database, set Vercel environment variables `SEED_DEMO_DATA=true` and `NEYO_SEED_PASSWORD` to a strong private password, then use the repository's `npm run vercel-build` build command. The command generates Prisma, deploys migrations, conditionally runs the idempotent demo seed, and builds Next.js. The seed creates `founder@neyo.co.ke` and the documented Kenyan demo schools. It never prints the password.

Immediately after one successful bootstrap, change `SEED_DEMO_DATA` to `false` and redeploy. Do not leave automatic demo seeding enabled, and do not use this process on a real live-school production database. Every demo account initially receives the private seed password, so change/disable demo access before public launch. If an existing database contains encrypted credentials, preserve its original `NEYO_MASTER_KEK`.

The green trial/pricing banner has a dismiss button. Dismissal is stored on that browser. The new founder operating pages explicitly set readable navy text and tinted card backgrounds in light mode, with corresponding dark-mode colours.

## Build repair — all-grade Question Bank type

The 500-question expansion originally passed `grade` through a broad `string`, while the seed contract accepts a strict grade union. The generator now preserves the literal union from its `GRADES` tuple. The shared `PrimaryOrSeniorGrade` contract was also expanded to include PP1, PP2, Grade 11 and Grade 12; without that, an honest all-grade dataset could not type-check even though those are real requested levels. This fixes the Vercel error at `kicd-question-bank-expansion-500-all-grades.ts` without disabling TypeScript or ESLint rules.
