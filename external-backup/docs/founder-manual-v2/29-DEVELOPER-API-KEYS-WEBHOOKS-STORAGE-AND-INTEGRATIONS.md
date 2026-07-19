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
