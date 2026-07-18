# NEYO Bible — Level 12: Integrations, Jobs, Storage & Observability

*Created 2026-07-18 from provider interfaces, vault-backed transports, API/webhook routes, job
registry, storage services, and observability modules. It documents activation and failure behavior
without exposing credentials.*

## 1. Integration principle

Every external system sits behind a NEYO service/provider seam. Core school workflows must fail
safely or use a documented local fallback; provider-specific code must not spread through UI and
domain services. Credentials live in encrypted NEYO Ops vault settings or environment variables.

Never paste a key into chat, commit it, seed it, or put it in a client bundle.

## 2. Integration inventory

| Capability | Real implementation | Activation |
|---|---|---|
| M-Pesa | `payments/provider.ts`, `daraja-provider.ts`, `payment.service.ts` | tenant Daraja credentials + webhook token/base URL |
| SMS | `notifications/sms.ts` | Africa's Talking vault credentials |
| Email | `notifications/email.ts` | Resend vault credentials |
| WhatsApp | `notifications/whatsapp.ts` | WhatsApp Business token/phone id |
| Push | `notifications/push.ts` | VAPID keys/subject |
| Object storage | `storage/provider.ts`, `r2-provider.ts` | Cloudflare R2 credentials/bucket |
| Local dev files | `storage/local-provider.ts` | automatic non-production fallback |
| Redis/jobs | `jobs/bullmq-adapter.ts` | vault/env Redis URL + worker |
| OAuth | `/api/oauth/start|callback|disconnect/[provider]` | provider client id/secret + callback registration |
| YouTube | YouTube library live-search route/service | API key; repository browsing remains zero-quota |
| Error/analytics/logging | `observability/vault-observability.ts` | Sentry/Better Stack/PostHog credentials |
| Public API/webhooks | API key and webhook services/routes | school-created key/subscription |
| iCal | `/api/calendar/ics` | no external credential |

## 3. M-Pesa Daraja

`PaymentProvider` defines provider behavior. `DarajaProvider` performs real OAuth/STK/status calls;
`MockProvider` is development-only. `payment.service.ts` selects/configures the provider, encrypts
per-tenant credentials, creates pending payments, handles callbacks idempotently, queries status,
and reconciles.

### Activation checklist

1. Obtain legal Safaricom credentials through the proper account owner.
2. Save per-tenant credentials through the encrypted settings flow.
3. Set public `APP_BASE_URL` and webhook verification token.
4. Register/verify callback URL `/api/payments/webhook/[slug]`.
5. Test a low-value STK in sandbox, then production.
6. Confirm callback, unique reference, invoice application, receipt, and duplicate replay.
7. Monitor pending/failed/suspense records.

### Failure rules

- A browser success is not settlement.
- Retry/reconcile pending status; do not create a second invoice/payment blindly.
- Duplicate callbacks must return safely without double credit.
- Unmatched receipts go to suspense/human review.
- Provider downtime must not corrupt invoice totals.

## 4. Notification cascade

`notification.service.ts` orchestrates channel behavior. The real transport functions are
`sendPush()`, `sendWhatsApp()`, `sendSms()`, and `sendEmail()`. In-app notification is the primary
record; user preferences, channel configuration, cost/quota, and fallback determine external
attempts.

Activation verification per channel:

- valid secret read from vault;
- one authorized test recipient;
- normalized +254 phone where applicable;
- sender/from identity approved;
- delivery response recorded;
- opt-out honored;
- school-name prefix and template rendering correct;
- no key or full sensitive payload in logs.

`buildBrandedEmailHtml()` applies school identity. `renderTemplate()` substitutes approved
variables; never accept arbitrary executable template content.

## 5. File storage

`StorageProvider` abstracts file operations. Development uses `LocalProvider`; production uses
`R2Provider`. `storage.service.ts` owns key construction, tenant prefix, presign, confirmation,
image processing, reads, and deletion.

### Upload flow

1. Authenticated client requests presigned upload metadata.
2. Server validates category/type/size and builds `tenants/<tenantId>/...` key.
3. Browser uploads directly where supported.
4. Client confirms; server records `StoredFile` metadata.
5. Serve/download rechecks tenant/permission.
6. Images may be resized and EXIF stripped before storage.

Content-addressable storage (`storage-cas.service.ts`, `StorageVaultBlob`) hashes content to avoid
physical duplicates. Reference counts must be updated transactionally; deleting one reference must
not remove bytes still used elsewhere.

Lifecycle services classify hot/warm/cold storage. Optimizers default to reporting/flagging unless
explicit safe deletion is enabled. Medical/legal/audit retention overrides storage-cost pressure.

## 6. OAuth

Google, Apple, and Microsoft routes share start/callback/disconnect patterns:

- signed state binds the login attempt and prevents callback forgery;
- provider tokens/profile are exchanged server-side;
- connected identity links to an existing NEYO user under controlled rules;
- disconnect must not strand the user's only login method;
- callback URLs must exactly match provider console registration;
- secrets stay server-side in the integration vault.

Test both account linking and a different-person collision; matching email alone must not casually
merge two real users without the designed verification path.

## 7. Public API keys and webhooks

`api-key.service.ts` creates a plaintext token once, stores only its hash/prefix, resolves bearer
tokens, applies scopes/expiry/revocation, and records usage. API keys are tenant credentials, not
user passwords.

`webhook.service.ts` stores subscriptions/events/signing secret, dispatches deliveries, HMAC-signs
payloads, records response/error, and retries due deliveries with backoff.

Consumer verification:

1. Read raw request body.
2. Parse `X-NEYO-Signature` timestamp/signature.
3. Recompute HMAC with the subscription secret.
4. Compare safely and enforce replay-age policy.
5. Return 2xx only after accepting/idempotently recording the event.

NEYO must not retry permanent 4xx indefinitely; temporary failures follow bounded backoff.

## 8. Background-job architecture

`src/lib/jobs/registry.ts` is the single registry. `JOBS` currently includes:

- subscription state machine;
- pricing reprice check;
- recycle purge;
- webhook delivery;
- fee reminders;
- demo purge;
- term pulse;
- data retention;
- promise check;
- message fallback/delivery reports;
- daily/weekly finance digest;
- storage health and optimizer.

`jobs.service.ts` creates `JobRun`, reports progress, retries, and stores result/error. BullMQ is
used when Redis is configured; otherwise controlled in-process behavior supports development.
The separate `scripts/worker.ts` drains queued jobs in deployed worker environments.

### Adding a job

1. Write an idempotent handler.
2. Report meaningful progress.
3. Add it to `JOBS`.
4. Add Nairobi cron definition if recurring.
5. Define per-tenant versus company-wide iteration explicitly.
6. Handle one tenant failure without hiding the rest where appropriate.
7. Add a real test for due-time and replay behavior.
8. Confirm `/api/jobs/tick` authorization and worker deployment.

## 9. Cron and timezone

Vercel calls `GET /api/jobs/tick` with `CRON_SECRET`. Registry schedules are interpreted in
Africa/Nairobi (UTC+3, no daylight-saving shift). A job may be daily or day-of-week specific.
Manual POST/run-now is company-role protected.

Do not assume Vercel's UTC schedule equals each job's business time; the tick decides what is due in
Nairobi time. Handlers must tolerate a repeated tick.

## 10. Observability

- `logger.ts`: pino structured logs with secret redaction.
- `capture.ts`/`vault-observability.ts`: Sentry event seam.
- `analytics.ts`: PostHog event seam.
- Better Stack log transport and public health endpoint.
- `health.ts`: database and configured infrastructure checks.
- `alerts.ts`: routes operations alerts through notification channels.
- `/status`: public current status surface.

### Logging fields

Prefer event/action, request/job id, tenant id (not school secret), actor id/role, entity type/id,
duration, outcome, and safe error code. Do not log passwords, OTPs, tokens, KEK/DEK, raw provider
secrets, full medical narratives, or unnecessary message bodies.

## 11. Integration incident runbook

1. Determine one tenant, one provider, or platform-wide.
2. Check `/api/health`, provider status, recent deploy, job/webhook delivery rows.
3. Stop destructive/repeated side effects if idempotency is uncertain.
4. Preserve request/reference ids and masked provider response.
5. Use fallback only if it preserves business truth.
6. Communicate scope/workaround to affected schools.
7. Reconcile queued/pending transactions after recovery.
8. Add a regression/monitoring improvement.

## 12. Environment and secret inventory

`.env.example` is the key-name template, never a credential source. Critical deployment values
include database URLs, master KEK, app/root domains, cron secret, WebAuthn origin/RP id, payment
webhook secret, and any provider fallback variables. Most operational providers can also read from
the encrypted NEYO Ops Integration Credential Vault.

On rotation:

1. create new provider secret;
2. save through vault/environment;
3. deploy/test;
4. revoke old secret;
5. verify callbacks/workers;
6. record actor/time without recording secret value.

## 13. Maintenance rule

Update provider rows, routes, activation steps, and failure behavior in place. External activation
must remain labeled pending until tested with real provider evidence. Security response belongs in
Level 08; commercial provider cost belongs in Level 09.
