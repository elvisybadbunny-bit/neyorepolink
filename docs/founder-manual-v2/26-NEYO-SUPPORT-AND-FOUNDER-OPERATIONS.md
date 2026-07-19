# NEYO Founder Manual V2 — Module 26: NEYO Support & Founder Operations

**Pages:** `/neyo-support-console`, `/founder`  
**Last verified:** 2026-07-18

## 1. Role separation

- NEYO Support: customer requests, demos, quotes, onboarding guidance and custom requests.
- NEYO Ops: same safe baseline plus individually granted extra permissions.
- Founder/legacy Super Admin: complete company control.
- School Owner/Principal: school settings only; never company control.

## 2. Support Console

Support dashboard shows school/customer threads, demo/quote requests, onboarding and custom feature
requests according to service.

Actions:

- Open request/thread and read history.
- Reply through recorded channel.
- Send approved Formal Quote.
- Mark Onboarding Assistance Done only after real milestone.
- Update Custom Feature Request status/notes.

Support must never ask for password, OTP, recovery code, PAT or private key. Use short-lived read-only
diagnostic replay only when authorized.

## 3. Founder Ops tabs

Current 34 tabs:

Overview; Founder Dashboard; Credentials & Secrets Vault; Demo Requests; Diagnostic Replay;
Maintenance Ops; Trial Limits; Release Whitelists; Bundi OCR Quotas; Tenant Health Radar; SMS Health
Monitor; Exam Sharing Approval; Unit Economics; Build Log; Metrics; Cadence; Interviews; Platform
Flags; Feature Toggles; Revenue Grants; Custom Feature Requests; Discount Campaigns; Influencer
Codes; Pathway Guide; Revenue Ops; Pricing Engine; Storage Intelligence; Storage Archive Tiers;
Developer Center; Bundi Import; Curriculum Library; Business Operations; Ecosystem Trends; Team &
Access.

## 4. Operational use

### Overview/Founder Dashboard

Review production/customer/revenue/trial/grace/health/support signals; assign owner/date. Dashboard
numbers are summaries; source ledgers settle truth.

### Credentials Vault

Store integration secret values encrypted. Never copy to chat/code/manual. Rotate with provider and
verify after update.

### Demo Requests/Quotes

Approve/track demo, send formal quote, link live tenant and close onboarding assistance. Demo data
never becomes production school data.

### Diagnostic Replay

Create short-lived read-only token for one school/user; log actions; stop session. No standing
backdoor or writes.

### Maintenance

Schedule window/countdown/read-only behavior; communicate affected schools and rollback.

### Trial/Release/Flags

Edit trial limits; whitelist pilot; FeatureReleaseControl Paused/Pilot/Live; PlatformFlag global
kill switch. Service gate and UI must agree. Release does not imply provider/hardware activation.

### Bundi OCR/Import

OCR config/free allowance/top-up pricing; usage. Bundi Import provider config/usage and unlock codes:
Tenant ID, Max Uses, note → Mint; monitor Active/Used Up/Expired/Revoked; Revoke. School requests arrive
as Support threads.

### Health/SMS/Exam Sharing

Recalculate Tenant Health; investigate causes; SMS telemetry/DND fallback; approve/reject national
exam sharing after privacy/copyright/format review.

### Revenue/Pricing

Unit Economics, grants, campaigns, influencer/referral, Revenue Ops and Pricing Engine. Preserve
snapshots/history; Support cannot privately change formulas.

### Build/Metrics/Cadence/Interviews

Record actual builds/tests/deploy, metric definitions/snapshots, all-hands/audit/board/investor
cadence, customer interview evidence/actions.

### Storage/Developer/Curriculum

Storage duplicate/lifecycle/archive controls; API partner/developer operations; national curriculum
library. Deletion requires retention/safety, not cost-only pressure.

### Team & Access

Create/suspend company accounts and individual extra permissions. Quarterly review; remove departed
access; 2FA. Never create company role as school staff account.

## 5. Daily checklist

Health/incidents; payments/callbacks; failed jobs/webhooks; customer/compliance; trials/grace/health;
deployments/maintenance/flags; provider/storage alerts; owners/next update.

## 6. Errors and verification

If tab missing: company role/extra permission. If school user can access Founder: critical security
defect. Verify Support cannot pricing/flags/team/impersonation by default; diagnostic read-only; code
scope/revoke; flag/pilot behavior; quote/onboarding; metrics/build evidence; cross-tenant company
queues only where deliberate.

## 7. Gap review

All listed Founder Ops tabs are rendered in the real client; Support functions have dedicated console.
No orphaned tab identified in this pass. High-risk controls require live role/negative tests before
production changes.

## 8. Edit points

Founder/Support pages; `founder-ops-client.tsx`; neyo-support/founder dashboard/ops/team/pricing/
release/storage/Bundi services and routes; role/extra permission matrix.

## The NEYO Way — internal founder operating system

Open **Platform Operations → The NEYO Way**. This company-only tab stores real operating actions in `FounderOperatingTask`; it is not visible to schools. Press **Install/refresh playbook** once to idempotently create the researched baseline without duplicating existing preset tasks. The baseline covers strategy, pilot recruitment and conversion, customer interviews, support triage, release gates, system alerts, restore tests, incidents, unit costs, runway, bookkeeping, Kenyan professional/legal review, privacy readiness, access reviews, providers, truth metrics, roadmap limits, university/founder capacity, advisors, founder-dependency reduction and monthly governance reporting.

Each record requires a category, title, priority, cadence, status and owner, and can hold the reason, next physical action, due date and evidence. Use **TODO**, **DOING**, **BLOCKED**, **DONE** or **NOT NOW** honestly. Completing a task without evidence should be avoided. The dashboard separates open critical work and blockers from completed work. Custom company actions can be added rather than changing source code.

### Solo student-founder rhythm

- **Daily (15–30 minutes):** system/security alerts and urgent school support.
- **Twice weekly:** protected university study blocks; do not schedule routine support over lectures.
- **Weekly (60–90 minutes):** pilots, sales pipeline, user interviews, truth metrics, three active priorities and founder capacity.
- **Monthly:** cash/runway, company reconciliation, cost per school, statutory calendar, privileged access, vendors, restore test and founder report.
- **Quarterly:** ideal-school profile, advisors and an incident drill.

The operating system deliberately recommends professional help for legal, accounting, privacy and security decisions. It does not describe the founder's age or degree as a weakness; it turns limited time and specialist knowledge into explicit controls, owners and escalation paths.
