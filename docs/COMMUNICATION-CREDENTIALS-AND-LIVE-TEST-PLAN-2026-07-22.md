# NEYO communication credentials and live-test plan

**Prepared:** 22 July 2026 (Africa/Nairobi)  
**Scope:** SMS, email, OTP, magic links, notifications and safe provider redundancy.  
**Status:** Test plan and architecture recommendation. No external provider is considered live until a real delivery receipt is captured.

## 1. Credentials currently supported

### Africa's Talking SMS

Obtain from the Africa's Talking dashboard for the correct sandbox/live application:

```text
africas_talking_api_key
Africas Talking username
approved sender ID, if available
```

Store in NEYO Ops Integration Credential Vault as:

```text
africas_talking_api_key
africas_talking_username
africas_talking_sender_id
```

Environment fallbacks:

```text
AT_API_KEY
AT_USERNAME
AT_SENDER_ID
```

Sandbox and production credentials must not be mixed. A sender ID appearing in configuration is not proof that Safaricom/Airtel will deliver it; use only the provider-approved value.

### Resend email

Create a Resend account, add `neyo.co.ke` or a dedicated sending subdomain, and complete the DNS records Resend provides. After Resend marks the domain verified, create a restricted API key.

Store in NEYO Ops:

```text
resend_api_key
resend_from_email
```

Environment fallbacks:

```text
RESEND_API_KEY
RESEND_FROM_EMAIL="NEYO <no-reply@neyo.co.ke>"
APP_BASE_URL="https://your-production-domain"
```

`APP_BASE_URL` is essential for magic links and callbacks. Do not leave production at localhost.

DNS evidence to verify:

- SPF supplied by provider;
- DKIM supplied by provider;
- DMARC policy/reporting for the domain;
- From address exactly under the verified domain.

### YouTube

Already documented separately:

```text
youtube_api_key
```

### Payments and OAuth

Do not add credentials merely to make status cards green. Add one provider at a time and execute its sandbox checklist. See:

- `docs/INTEGRATION-KEYS-GUIDE.md`
- `docs/MULTI-RAIL-PAYMENTS-STRIPE-PAYSTACK-PESAPAL-RESEARCH-2026-07-22.md`

## 2. OTP system behaviour to test

Current login OTP constitution:

- six numeric digits;
- five-minute expiry;
- code is sent through the shared SMS transport;
- production without valid SMS credentials must not expose the code;
- development may show/log the code only because `SHOW_DEV_OTP` is non-production gated.

Test with a dedicated +254 number owned by the tester. Never use a learner/parent number without consent.

### OTP test matrix

1. Valid active user and valid +254 phone receives one code.
2. Correct code before five minutes signs in once.
3. Incorrect code is rejected.
4. Expired code is rejected.
5. A newly requested code invalidates or supersedes the old code according to the service behaviour.
6. Reusing a successful code is rejected.
7. Unknown phone does not leak whether a privileged account exists more than necessary.
8. Rate limits block repeated request abuse.
9. `07...` and `+254...` normalise to one identity.
10. Production response never contains the OTP.
11. SMS provider failure does not create a false “sent” claim.
12. Audit/security event is recorded where implemented.

Record:

- request timestamp;
- provider message ID;
- delivery timestamp/status;
- expiry result;
- rate-limit result;
- redacted recipient (`+2547***123`), never full public evidence.

## 3. Email test matrix

Use test inboxes you control on at least Gmail and Outlook; add a school-domain inbox only with permission.

1. Plain-text notification.
2. Branded HTML email.
3. Magic-link/recovery email.
4. Correct From display and verified domain.
5. Reply-to behaviour, if configured.
6. Links use HTTPS production domain.
7. Mobile rendering at narrow width.
8. Dark-mode readability.
9. Gmail inbox/spam result.
10. Outlook inbox/junk result.
11. Delivery/bounce event handling—currently a gap if not wired.
12. Invalid recipient and provider failure remain visible.
13. No secrets, OTPs or private learner data in logs.
14. Unsubscribe/consent mechanism for promotional email; transactional school messages remain correctly classified.

Do not call email production-ready only because Resend returns an ID. Confirm delivery to real controlled inboxes.

## 4. Alternative SMS provider research

### Twilio

Twilio has mature APIs and global reach, but its official Kenya SMS guidance says alphanumeric Sender ID pre-registration is required/advised for full coverage, especially Safaricom. Generic IDs such as `INFO` or `VERIFY` should be avoided. Registration can take time.

Official guidance:

```text
https://www.twilio.com/en-us/guidelines/ke/sms
```

Good fit:

- documented secondary/global provider;
- international recipient coverage;
- independent delivery route for disaster recovery.

Risks:

- likely higher Kenya cost than a local route;
- sender-registration lead time;
- international billing/FX;
- must test Safaricom, Airtel and Telkom separately.

Credentials, if selected later:

```text
twilio_account_sid
twilio_auth_token
twilio_messaging_service_sid OR approved sender ID
```

### Local Kenyan provider candidate

Celcom Africa publicly offers a Kenya SMS API, sender-ID registration and OTP/transactional messaging. Those are provider claims and must be validated through:

- legal entity and Communications Authority status;
- API documentation quality;
- signed commercial quote;
- sender-ID approval process;
- delivery reports/webhooks;
- Safaricom/Airtel/Telkom tests;
- support escalation and data-processing terms.

Public API page:

```text
https://celcomafrica.com/sms-gateway
```

Other candidates for a written comparison include Infobip, Mobitech and a direct Safaricom enterprise route. Do not integrate based only on a “top provider” blog ranking.

### Recommendation

For the next engineering provider, use **Twilio as the reference adapter** because its API and Kenya restrictions are documented, while separately requesting a local commercial/API offer from Celcom Africa or another licensed local provider. Choose the live secondary route only after measured Kenya delivery and cost tests.

## 5. Provider-neutral SMS architecture

The current `sendSms()` function is hardwired to Africa's Talking. Add a provider contract:

```ts
type SmsPurpose = "OTP" | "TRANSACTIONAL" | "REMINDER" | "MARKETING";

type SmsRequest = {
  idempotencyKey: string;
  to: string;
  body: string;
  purpose: SmsPurpose;
  tenantId?: string;
};

type SmsResult = {
  accepted: boolean;
  provider: string;
  providerMessageId?: string;
  status: "ACCEPTED" | "DELIVERED" | "FAILED" | "UNKNOWN";
};
```

Needed providers:

```text
DEV_CONSOLE
AFRICAS_TALKING
TWILIO
LOCAL_KENYA_PROVIDER
```

### Routing policy

- school/NEYO chooses an approved primary provider;
- secondary provider is configured independently;
- OTP failover is **not automatic immediately** because the first provider may have accepted the message and delayed its receipt;
- query/wait for a delivery failure or defined timeout before offering “Send another code”;
- generate a new OTP for a resend and invalidate the old one;
- use one idempotency key per attempt;
- never charge the school twice for one accepted message;
- preserve provider message IDs and delivery callbacks;
- marketing traffic must never consume the OTP route or priority queue.

### Delivery states

```text
CREATED → ACCEPTED → DELIVERED
                 ↘ FAILED
                 ↘ UNKNOWN / EXPIRED
```

An HTTP 200/202 means provider acceptance, not handset delivery.

## 6. Sender ID and consent

For Kenya:

- apply for a brand-specific sender ID such as `NEYO` through each provider;
- do not assume approval across all networks;
- use registered transactional templates where required;
- obtain consent for promotional SMS;
- maintain opt-out/suppression records;
- separate school operational messages from NEYO marketing;
- do not send campaign SMS to scraped school contacts;
- preserve quiet-hour rules and provider/network requirements.

## 7. Complete external-system test order

### Priority 0 — deployment/database

- Prisma generate/validate;
- all pending migrations in preview;
- production build;
- health check;
- backup/restore evidence.

### Priority 1 — identity and communication

- password login;
- SMS OTP matrix;
- password-recovery OTP;
- magic-link email;
- email notification;
- in-app notification;
- SMS delivery callback/status;
- rate limiting and replay protection.

### Priority 2 — payments

- Daraja sandbox STK;
- callback authentication;
- duplicate callback;
- wrong amount/reference;
- sibling split;
- receipt;
- failed/cancelled timeout;
- central subscription and onboarding payment;
- no live activation claim without evidence.

### Priority 3 — storage/documents

- encrypted upload/download;
- magic-byte and size rejection;
- barcode/QR PDF;
- A4 consolidated report;
- public asset hardening;
- temporary-file cleanup dry run.

### Priority 4 — browser/offline/mobile

- 360px priority pages;
- teacher current-period timetable;
- offline attendance exactly once;
- offline marks/CBE supported paths;
- rejected-sync review;
- service-worker update;
- slow-network state.

### Priority 5 — external content/OAuth

- YouTube live search and embed;
- owner-disabled embed fallback;
- Google OAuth only after provider exchange is verified;
- Apple/Microsoft status only after real account setup;
- no private channel access with an API key.

### Priority 6 — hardware/manual evidence

- physical USB/Bluetooth barcode scanner;
- phone camera QR/barcode;
- A4 printer and margins;
- POS/biometric integrations only with actual devices;
- no fabricated hardware PASS.

## 8. Live-test evidence sheet

For every test record:

```text
Feature
Environment
Commit
Date/time
Tester
Test recipient/device
Expected result
Actual result
Provider reference (redacted)
Screenshot/log location
PASS / FAIL / BLOCKED
Follow-up owner/date
```

Never put raw API keys, OTPs, reset links, full phone numbers or access tokens in screenshots or documentation.

## 9. Immediate founder actions

1. Create/verify Resend account and sending domain.
2. Create restricted Resend API key.
3. Save `resend_api_key` and `resend_from_email` in the NEYO Ops vault.
4. Confirm `APP_BASE_URL` in Vercel.
5. Create Africa's Talking sandbox app and test number.
6. Request live sender ID/commercial onboarding separately.
7. Run OTP in sandbox/dev first, then one consented live number.
8. Request Twilio Kenya sender-registration requirements and current quote.
9. Request one local provider's API/commercial pack.
10. Do not provide any secret in chat.
