# NEYO Bible — Level 08: Security, Privacy & Compliance

*Created 2026-07-18 from the real security code, Prisma RLS SQL, legal pages, retention/export
services, and `SECURITY.md`. This document distinguishes implemented controls from founder/operator
obligations that remain open.*

## 1. Responsibility model

Schools are custodians/controllers of learner, guardian, staff, academic, financial, medical, and
discipline information in their operations. NEYO operates the SaaS platform and must protect the
data it processes, maintain tenant separation, support lawful requests, and document incidents.
This operational summary is not a substitute for advice from Kenyan legal/privacy professionals.

## 2. Implemented security controls

### Authentication

- Passwords use Argon2id (`@node-rs/argon2`).
- Phone OTP, magic links, passkeys/WebAuthn, and TOTP 2FA are implemented.
- Session cookies are HttpOnly, Secure in production, and SameSite=Lax.
- Logout-everywhere invalidates a user's sessions.
- Rate limits protect OTP, magic-link, signup, public and API-key paths.

**Sources:** `src/lib/core/session.ts`, authentication services under `src/lib/services/`,
`src/lib/security/rate-limit.ts`, `docs/AUTH-ACCOUNT-SECURITY-GUIDE.md`.

### Authorization

- `requireRole()` and `requirePermission()` protect API operations.
- `requirePagePermission()`/`requirePageUser()` redirect unauthorized page access.
- Parent/student/teacher access receives row-level ownership scoping in service queries.
- Company roles and school roles are separated.

A hidden button is not authorization. Every sensitive handler must await its server guard before
reading or changing data.

### Tenant isolation

NEYO uses three layers:

1. `withTenant()` request context (`tenant-context.ts`).
2. `tenantDb()` automatic query/create/mutation scoping for every model registered in
   `TENANT_OWNED_MODELS` (`tenant-db.ts`, `tenant-tables.ts`).
3. Postgres policies in `prisma/rls/policies.sql`.

Any new non-null `tenantId` model must enter the registry in the same migration unit and receive a
cross-tenant negative test.

### Encryption and secrets

- Sensitive tenant values use AES-256-GCM envelope encryption.
- Each tenant has a DEK wrapped by the NEYO master KEK.
- `encryptForTenant()`, `decryptForTenant()`, and `rotateKek()` live in
  `encryption.service.ts`.
- M-Pesa and integration credentials belong in encrypted settings/vault storage or deployment
  environment variables—not source, screenshots, commits, or chat.

### Network/browser controls

`next.config.mjs` defines CSP, frame denial, MIME sniff protection, referrer policy, permissions
policy, and production HSTS. Production deployment must verify CSP against the actual R2, payment,
analytics, and communication endpoints rather than weakening it broadly when one asset fails.

### Audit integrity

Application code treats `AuditLog` as append-only. `prisma/rls/audit-immutable.sql` blocks database
UPDATE/DELETE in production. Security fixes, support impersonation, data exports, permission
changes, and sensitive business actions should leave durable evidence.

## 3. Data classification

| Classification | Examples | Minimum handling |
|---|---|---|
| Public | marketing pages, public school contact details | approved publication; integrity controls |
| Internal | product metrics, non-sensitive operating notes | company-role access; no public sharing |
| School confidential | rosters, attendance, marks, invoices | tenant + role + row scope; audited exports |
| Highly sensitive | medical, counseling, discipline, national IDs | narrowly authorized; encrypted where appropriate; lawful transfer basis |
| Secret | passwords, OTPs, recovery codes, KEK, API/payment keys | never displayed after setup where avoidable; never logged/shared |

`retention.service.ts` explicitly identifies `MEDICAL` and `DISCIPLINE` as sensitive modules. New
sensitive domains should receive equivalent explicit treatment rather than relying on a generic
student-view permission.

## 4. Privacy by workflow

- **Parents:** only linked children, owned invoices, and family-safe records.
- **Students:** only their own linked record in the shared portal.
- **Teachers:** classes/subjects genuinely assigned to them.
- **Clinic/counseling:** narrower confidential permission than ordinary student access.
- **NEYO Support:** customer-facing requests without founder pricing/release power.
- **Diagnostic replay:** short-lived, read-only, logged—not credential sharing.
- **Exports:** tenant-scoped with secrets redacted and export action audited.
- **Public QR/lookup pages:** reveal only the minimum required; sensitive values require an
  additional challenge where designed (for example the Mzazi fee-balance flow).

## 5. Data-subject and school requests

A request for access, correction, portability, restriction, or deletion must be authenticated and
tracked. Do not act on an unauthenticated email containing only a name.

Recommended process:

1. Record the request and requester identity/authority.
2. Identify affected tenant, user, student, modules, and data categories.
3. Check legal/contractual retention obligations.
4. Export or correct through the real service path.
5. For deletion, distinguish reversible operational deletion, statutory retention, anonymization,
   and lawful hard deletion.
6. Record who approved and completed the response.
7. Communicate the result without exposing another person's records.

`fileComplianceRequest()`, `listComplianceRequests()`, and `resolveComplianceRequest()` in
`founder-dashboard.service.ts` provide the company compliance queue. Tenant export uses
`exportTenantData()` and `recordExportAudit()`.

## 6. Retention and lawful transfer

`enforceDataRetentionPolicies()` applies configured policy; `assertLawfulTransferBasis()` guards
sensitive-module transfer. Retention is not “delete everything old.” Audit, finance, medical,
discipline, contractual, and security evidence may have distinct lawful periods.

Rules:

- Never copy a school's production database into a demo tenant.
- Never transfer medical/discipline data merely because two records have similar names.
- Preserve tenant and subject identity mapping during an authorized transfer.
- Use soft delete/recycle workflows where the domain requires reversibility.
- Hard purge only through an authorized, documented policy/job.

## 7. Security incident response

The standing process in `SECURITY.md`:

1. **Detect and contain:** stop active exposure without destroying evidence.
2. **Assess:** identify data, tenants, roles, time range, and continuing risk.
3. **Notify the DPO/incident owner.**
4. **Notify ODPC within 72 hours** when the legal threshold applies.
5. **Notify affected schools without undue delay** so controllers can fulfill their duties.
6. **Remediate:** fix root cause, rotate affected credentials, invalidate sessions/tokens, verify
   tenant boundaries, and run regression tests.
7. **Record and review:** timeline, decisions, impact, communication, and control improvements.

### First-hour evidence

- exact discovery time and reporter;
- affected endpoint/model/tenant(s);
- request ids, logs, audit rows, deployment commit;
- whether unauthorized reads, writes, exports, or credential exposure occurred;
- containment actions and their timestamps;
- named incident owner.

Do not paste sensitive production rows or secrets into general chat while investigating.

## 8. Secure development gate

Before shipping a sensitive change:

1. Validate input with Zod on the server.
2. Await role/permission guards.
3. Run inside the correct tenant context.
4. Register new tenant models.
5. Add owner-role and denied-role tests.
6. Add a cross-tenant direct-id test.
7. Verify errors do not disclose other tenants or secrets.
8. Confirm audit behavior.
9. Run cache-free typecheck and the relevant real Postgres regression suite.
10. Review UI copy/screenshots for personal information and secret leakage.

A test failure must not be waived because the UI “looks right.”

## 9. Production controls and open obligations

### Implemented/documented

- Privacy Policy at `/privacy`.
- Terms at `/terms`.
- Cookie-consent banner.
- Security headers, encryption, audit controls, rate limiting, tenant scoping.
- Public `/status` and `/api/health` surfaces.

### Founder/operator actions still open in `SECURITY.md`

- ODPC registration as applicable.
- Formal Data Protection Officer designation and published contact.
- Independent penetration test and tracked remediation.
- Confirm production RLS/audit SQL is applied and tested—not merely present in the repository.
- Move distributed rate limiting to Redis and activate production monitoring/alerts.
- Verify retention schedules and data-processing contracts with qualified counsel.

These remain open until there is external/production evidence. Documentation alone is not
completion.

## 10. Account compromise runbook

1. Invalidate all sessions for the user.
2. Reset password and require 2FA recovery/re-enrollment as appropriate.
3. Revoke passkeys, API keys, OAuth connections, and recovery codes that may be compromised.
4. Review login/audit history and affected actions.
5. If a secret entered source/chat, rotate the secret at the provider; deleting the message or
   commit is not sufficient.
6. Check whether the compromise crossed tenant or company-role boundaries.
7. Notify the affected school and follow incident assessment.

## 11. Payment and webhook security

- Webhook routes verify the configured token/signature mechanism.
- M-Pesa references and checkout ids are unique/idempotent.
- Callback success must reconcile to the intended payment/invoice; a client-side success screen is
  not financial proof.
- Payment credentials are encrypted per tenant.
- Suspense allocation requires human confirmation when matching is uncertain.
- Logs and screenshots must mask phone numbers, tokens, and credentials where possible.

**Sources:** `src/lib/services/payment.service.ts`, `src/lib/services/central-billing.service.ts`,
`docs/PAYMENTS-DEVELOPER-GUIDE.md`.

## 12. Maintenance rule

Update this level when controls or obligations change. Record a security incident's durable product
decision in Level 05, implementation architecture in Level 02, and customer communication/repair
ownership in Level 07. Never mark an external compliance action complete without evidence.
