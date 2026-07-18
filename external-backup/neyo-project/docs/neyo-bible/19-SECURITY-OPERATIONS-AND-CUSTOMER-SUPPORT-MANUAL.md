# NEYO Bible — Level 19: Security, Operations & Customer Support Manual

*Created 2026-07-18 from Levels 06–08/12/14, `SECURITY.md`, permission/tenant controls, support and
customer-thread services, and the founder-requested Security & Compliance, Operations, and Customer
Documentation library. Templates are operational starting points, not proof of external compliance.*

## 1. Information security policy

NEYO protects confidentiality, integrity, availability, privacy and auditability of company and
school data. Controls follow least privilege, tenant separation, encryption, secure change,
monitoring, incident response, retention and provider governance. All workers/contractors/providers
with access must be authorized and accountable.

## 2. Password policy

- Long unique passwords; password manager recommended.
- Argon2id storage; never plaintext/reversible encryption.
- 2FA mandatory for company/high-privilege accounts and encouraged/enforced by policy for schools.
- Never share password, OTP, recovery code or passkey assertion.
- Reset on compromise/evidence, not arbitrary frequent rotation that encourages reuse.
- Recovery verifies identity and invalidates exposed sessions/codes.
- Default/demo passwords never used for real production users.

## 3. Access control policy

Joiner/mover/leaver workflow; role-based permissions; company/school role separation; parent/teacher
row scope; time-bound diagnostic replay; quarterly access review; rapid departure revocation;
separate provider/database/GitHub/Vercel access. Privileged actions leave audit evidence. Shared
accounts are prohibited where individual attribution is possible.

## 4. Data retention policy framework

Classify public/internal/confidential/highly-sensitive/secret. Define owner, purpose, lawful basis,
retention, archive and deletion per data class. `retention.service.ts` governs implemented policy;
medical/discipline require special handling. Backups, logs, exports, source uploads and provider
copies are included. Legal hold overrides normal purge with documented authority.

## 5. Incident response plan

Severity examples:

- **SEV-1:** cross-tenant/secret breach, broad outage, payment corruption.
- **SEV-2:** one tenant unavailable/material workflow or provider failure.
- **SEV-3:** limited defect/workaround, no sensitive exposure.
- **SEV-4:** question/minor cosmetic issue.

Process: detect → assign commander → contain → preserve evidence → assess scope/privacy → communicate
→ eradicate → restore/reconcile → monitor → post-incident actions. ODPC/school notification follows
Level 08 and qualified DPO/legal assessment.

## 6. Vulnerability management

Intake from tests, dependency alerts, researchers, staff and customers. Triage exploitability,
exposure, tenant/data/financial impact. Restrict disclosure, reproduce safely, patch smallest stable
unit, add regression/tenant/role tests, rotate secrets if relevant, deploy/monitor, communicate and
close evidence. Commission independent pen-test; track findings to verified remediation.

## 7. Security audit checklist

- Auth/session/2FA/recovery.
- Role/permission and read-only enforcement.
- Tenant-owned registry and direct-id isolation.
- Parent/teacher row scope.
- Encryption and secret redaction/rotation.
- RLS/audit immutability production verification.
- Public endpoints/rate limits/input validation.
- Upload type/size/EXIF/serve authorization.
- Webhook/API signature/scopes/idempotency.
- Payment callback/reconciliation.
- Jobs/diagnostic tokens/feed tokens expiry.
- Provider/data-sharing inventory.
- Logs/backups/retention/deletion.
- Dependency/build pipeline.
- Incident/restore/access-review evidence.

## 8. Privacy Impact Assessment template

Feature/purpose/owner; roles/data subjects; data fields/classification; source; lawful basis/consent;
processing and decisions; recipients/providers/countries; tenant/row access; retention/deletion;
children/sensitive risk; security controls; alternatives/minimization; human review; data-subject
rights; residual risk; DPO/legal decision; approval/review date.

## 9. Kenya Data Protection Act compliance checklist

Operational checklist requiring professional confirmation:

- controller/processor roles and contracts;
- ODPC registration applicability/evidence;
- DPO designation/contact;
- lawful, fair, transparent purpose;
- minimization/accuracy/retention;
- child and sensitive data safeguards;
- data-subject request process;
- processor/vendor agreements and transfer basis;
- security/incident records and 72-hour assessment;
- privacy notices/cookies;
- DPIAs for high-risk processing;
- staff training/audits;
- deletion/export/correction evidence.

`SECURITY.md` still lists ODPC, DPO and independent pen-test as external actions; do not mark them
complete without evidence.

## 10. Risk register template

ID/category/risk statement/cause/consequence/assets or schools; inherent likelihood/impact; controls;
control evidence; residual rating; treatment/owner/deadline; trigger; last/next review; status. Link
security incidents, technical debt and corporate risks without duplicating incompatible ratings.

## 11. Standard operating procedure format

Purpose, scope, roles, prerequisites, inputs, exact steps, decision points, outputs/records, errors and
escalation, security/privacy, checks, frequency, owner/version/approval/review. Level 06 contains
school-role SOPs; Level 07 customer lifecycle; Levels 12/14 technical operations.

## 12. NEYO daily checklist

- health/errors/incidents;
- payment/provider/callback/suspense;
- failed/aged jobs/webhooks;
- urgent customer/compliance threads;
- critical tenant health/trial/grace;
- deployments/maintenance/flags;
- backup/provider alerts;
- named owners and next update.

## 13. Weekly checklist

Metrics and reconciliation; support aging/SLA; onboarding/pipeline; security findings/access
changes; release quality/known issues; provider cost/quota; backup/job health; customer interviews;
risk/actions/decisions.

## 14. Monthly checklist

Management accounts; subscription close; campaign/referral/SMS margin; all-hands; roadmap and debt;
access review; restore sample; contracts/renewals; privacy/compliance actions; vendor register;
strategy/risk movement; documentation freshness.

## 15. Customer support manual

### Intake

Use customer threads/support console. Capture tenant, role, page, timestamp, reference, exact error,
expected/actual, scope and safe screenshot. Never ask for passwords, OTPs, PATs, private keys or full
sensitive exports.

### Triage

Classify how-to, configuration, data correction, bug, outage, security/privacy, billing, feature
request, provider/external. Set severity/owner/next response. Check known issues and health.

### Resolve

Reproduce with safe data/read-only replay; explain workaround honestly; make authorized correction
through real workflow; escalate code/security/billing; verify with customer; record resolution.

### Communication

Specific, calm, timestamped, no blame or false ETA. For incidents state impact, workaround, next
update and resolution/reconciliation. Never expose another school.

## 16. Bug escalation process

Support records evidence → product/engineering reproduces → security escalation if data/access →
severity/owner → regression test → fix/review/deploy → support verifies affected workflow → close
customer thread and known issue. One-off manual DB correction requires authorization/audit and does
not replace root-cause fix.

## 17. Feature request process

Record problem, role, frequency, current workaround, affected schools, desired outcome—not just
requested screen. Link to `CustomFeatureRequest`/customer evidence. Product checks Checklist,
duplication, architecture, safety, commercial terms and dependencies. Status updates do not promise
a release date unless approved.

## 18. Change management policy

Normal changes follow Level 10/14. Emergency changes require incident owner, scoped approval,
backup/rollback, minimum safety tests, deployment monitoring and retrospective record. Platform
flags can contain exposure but must not become permanent undocumented configuration.

## 19. Administrator manual — quick map

School administrators use Settings for profile/modules/security/billing; Students/Admissions for
records/intake; Classes/Academics/CBC/Exams for teaching structure; Finance/Payroll/Staff for
business administration; operational modules where enabled. Configure structure before generation,
use role accounts, review approvals and audit changes. Full workflow: Level 06.

## 20. Teacher user guide — quick map

Open `/teacher`; confirm My Classes/timetable; mark attendance; teach/update plan and Record of Work;
assign homework/notes; enter marks/CBC evidence; review class report; communicate through approved
channels. Report missing assignment instead of creating duplicate class. Draft marks remain private
until release.

## 21. Student user guide — quick map

Use shared `/portal`; student sees own attendance, published results, timetable, fees, homework,
notes and enabled learning functions. Submit work/choices through their designated flows. Never
share login/OTP; report incorrect linkage to school.

## 22. Parent user guide — quick map

Use `/portal`; choose linked child; view published records and invoice history; initiate M-Pesa STK
for an owned invoice; manage permitted pickup/transport/PTA/homework interactions; communicate via
Messages/Class Chat. Verify payment in ledger/receipt, not screenshot alone.

## 23. Finance Office guide — quick map

Configure term fee structure; batch invoice idempotently; record/reconcile payments; review suspense,
promises, discounts and aging; run reminders; print tracked documents; close period against provider
references. Student service charges feed the same invoice. Level 06 §Finance and Level 09 separate
school finance from NEYO revenue.

## 24. ICT Administrator guide

Own school user invitations/roles, devices/network/browser, domain/contact coordination, security
settings, approved integration credentials with NEYO, exports and first-line troubleshooting. ICT
admin does not receive database/company secrets by default. Keep browsers updated, enforce 2FA,
revoke departed users, test backup/export and escalate provider/security issues.

## 25. Help Centre article template

Task title; who can do it; before you start; numbered browser steps; expected result; common errors;
mobile note; privacy/safety; related articles; last verified version/date. Use real screenshots with
safe sample data and alt text.

## 26. Video tutorial script template

Audience/outcome/duration; opening context; prerequisites; shot-by-shot narration and exact clicks;
mobile variation; error/recovery; recap; support path. Do not show passwords/OTP/real student data;
avoid fast unexplained cursor movement.

## 27. Troubleshooting guide

Order: exact error → internet/status → correct URL/tenant → login/role → prerequisite records/module/
release → retry idempotently → browser console/network for technical owner → support evidence.
Never clear/delete real records or switch tenant ids as a generic fix.

## 28. Maintenance rule

Deep security truth remains Level 08; provider incidents Level 12; DR Level 14. Expand customer
guides with verified screenshots/steps as workflows change, and label external legal compliance
pending until evidence exists.
