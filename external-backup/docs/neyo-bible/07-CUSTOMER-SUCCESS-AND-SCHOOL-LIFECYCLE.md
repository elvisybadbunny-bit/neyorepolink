# NEYO Bible — Level 07: Customer Success & School Lifecycle

*Created 2026-07-18 from the real quote, demo, onboarding, support, tenant-health, billing, retention,
and export services. This is the operating path from first interest to a healthy live school.*

## 1. Lifecycle map

`Interest → Quote/Demo → Accepted Quote → Tenant Setup → 30-Day Trial → Assisted Rollout → Active
Use → Health Monitoring → Renewal/Grace → Recovery or Lawful Offboarding`

A prospect is not treated as a tenant before a school account actually exists. Public lead/quote
records may therefore be deliberately company-wide and nullable by `tenantId`; school operational
records become tenant-scoped after onboarding.

## 2. Lead, instant quote, and formal quote

Public prospects use `/quote` and the quote APIs:

- `instantQuote()` in `school-quote.service.ts` calculates an immediate estimate from submitted
  school size/requirements.
- `createQuoteRequest()` stores a real follow-up request.
- NEYO Support or Ops uses `listQuoteRequests()`/`getQuoteRequest()` and
  `sendFormalQuote()` rather than composing an untracked price in chat.
- `acceptQuote()` records acceptance; `markQuoteRequestLive()` links the request to the eventual
  tenant; `markOnboardingAssistanceDone()` closes the assisted-onboarding step.

**Operating rule:** the formal quote must reflect the current pricing engine and approved discounts.
A support user can assist and send the approved quote path but cannot privately change platform
pricing formulas.

**Sources:** `src/app/(auth)/quote/page.tsx`, `src/lib/services/school-quote.service.ts`,
`src/app/api/quotes/`, `src/app/api/ops/quotes/`.

## 3. Demo policy

`createDemoSchool()` in `demo.service.ts` creates an isolated Kenyan demo tenant with realistic
sample data and a real session. Standard demos expire after `DEMO_TTL_HOURS = 24`; longer sandbox
handling is separately represented by `SANDBOX_TTL_HOURS`. `purgeExpiredDemos()` is the cleanup
job—demo records are never mixed into a prospect's eventual live school.

The demo must demonstrate workflows honestly:

1. The prospect enters verified contact details through the demo request flow.
2. NEYO creates a sandbox, not a hidden account in another school's tenant.
3. The banner identifies sample data and expiry.
4. “Convert to real school” leads to clean onboarding; it does not rename sample students into a
   production database.

**Sources:** `src/lib/services/demo.service.ts`, `src/app/api/demo/start/route.ts`,
`FEATURES-CHECKLIST.md` G.14.

## 4. Creating the live school

`signupSchool()` in `onboarding.service.ts` is the authoritative tenant-creation workflow. It
creates the tenant, validates its slug, provisions the owner's account/session, initializes
modules and encryption, and establishes the trial state. `inviteStaff()` adds real staff through
an authorized invitation path.

### Assisted onboarding checklist

1. Confirm legal school name, county, phone/email, school type, curriculum, and education levels.
2. Choose a unique, non-reserved tenant slug.
3. Create the real School Owner account; require a private password and security setup.
4. Configure modules and school profile/branding.
5. Import staff, classes, students, guardians, subjects, and existing allocations in dependency
   order.
6. Validate counts and exceptions before timetable, invoice, or result generation.
7. Configure M-Pesa/payment credentials through the encrypted vault/settings path—never in chat.
8. Run a small real workflow: login, one register, one invoice/payment test, one teacher class,
   one family portal login.
9. Mark onboarding assistance done only after the school can perform its own next-day operation.

**Sources:** `src/app/(auth)/get-started/page.tsx`, `src/lib/services/onboarding.service.ts`,
`src/app/api/onboarding/`.

## 5. Trial and activation

Every new school begins in a real 30-day `TRIAL`. Trial limits are company-configurable. At trial
end, the school chooses Capacity Complete or Modular User & Module and completes paid activation.
The billing lifecycle is `TRIAL → ACTIVE → GRACE → SUSPENDED`.

- `ensureSubscription()` guarantees a subscription record exists.
- Central subscription STK uses `initiateCentralSubscriptionStk()` and an authenticated callback.
- `runSubscriptionStateMachine()` advances lifecycle state.
- Suspension locks operational service but preserves school records.

Customer Success must contact a low-usage trial before expiry; it must not silently extend limits
or alter pricing outside approved controls.

**Sources:** `src/lib/services/billing.service.ts`, `src/lib/services/central-billing.service.ts`,
`src/app/(app)/settings/billing/page.tsx`.

## 6. Rollout by operational milestone

A school is not “onboarded” merely because accounts exist. Recommended rollout proof:

- **Identity:** owner and leadership can log in; 2FA/security expectations explained.
- **Structure:** school profile, term, classes, subjects, staff and learners are correct.
- **Teaching:** teachers see owned classes; attendance and homework round-trip works.
- **Finance:** fee structure, one test invoice, and one verified payment/receipt work.
- **Family:** parent sees only linked children and the correct balance/result state.
- **Scheduling:** school reviews real timetable constraints and publishes deliberately.
- **Operations:** Reception, Library, Hostel, Clinic, or Transport are enabled only where used.

Each milestone uses real data and a role-appropriate account. Founder impersonation is not a
substitute for the school proving its own access.

## 7. Support intake and ownership

`/neyo-support-console` is the narrow customer-facing console. `supportConsoleDashboard()` provides
customer requests; Support can send formal quotes, mark assistance complete, and progress custom
feature requests through approved functions. It cannot manage founder-only pricing or release
controls.

School support conversations can also be recorded in the customer hub:

- `createCustomerThread()` creates a tenant-linked support thread.
- `addCustomerThreadMessage()` preserves the conversation.
- `updateCustomerThreadStatus()` records ownership/progress rather than abandoning the issue in a
  private message.

### Minimum ticket evidence

- school/tenant and reporting user;
- exact page and action;
- time and reference id;
- exact error text;
- expected versus actual result;
- whether the issue affects one record, one role, or the whole school;
- screenshots with sensitive information minimized.

**Sources:** `src/app/(app)/neyo-support-console/page.tsx`,
`src/lib/services/neyo-support.service.ts`, `src/lib/services/neyo-customer-hub.service.ts`.

## 8. Diagnostic replay

When ordinary evidence is insufficient, an authorized Ops user may use
`createImpersonationToken()` from `support-impersonation.service.ts`.

Controls:

1. The token is short-lived and scoped to the intended diagnostic session.
2. The user sees a read-only safety banner.
3. `logImpersonationAction()` records actions.
4. `stopImpersonationSession()` closes the session.
5. Support must never request the school's password, OTP, recovery code, or private API secret.

Diagnostic replay is for reproducing visibility and configuration problems, not making routine
school decisions on the school's behalf.

## 9. Health monitoring and intervention

`calculateTenantHealthScore()` combines real operational signals into a 0–100 result;
`recalculateAllTenantsHealth()` refreshes schools for the Founder Ops Tenant Health Radar.

Use health as a triage signal, not an unexplained punishment:

- **Healthy usage:** continue normal check-in and capture feedback.
- **Falling usage:** identify the failing workflow/role and offer targeted retraining.
- **Payment risk:** distinguish adoption trouble from inability/unwillingness to pay.
- **Errors:** investigate product defects before labeling the school as churn risk.
- **Critical:** assign an owner, contact leadership, document actions and next review date.

**Source:** `src/lib/services/tenant-health.service.ts` and
`src/app/api/founder-ops/tenant-health/route.ts`.

## 10. Renewal, grace, and recovery

Before renewal:

1. Confirm real current counts and pricing model.
2. Apply only approved referral credits or campaigns.
3. Send the amount and due date through recorded billing communication.
4. Reconcile the central STK callback.
5. If unpaid, allow the configured grace lifecycle; do not delete tenant data.
6. On payment, restore service through the billing state machine and confirm critical workflows.

A school in `SUSPENDED` remains a customer with preserved records. Recovery communication should
state what is locked, what remains preserved, the amount due, and the authorized payment path.

## 11. Offboarding and data portability

A departing school is entitled to a controlled export. `exportTenantData()` in
`export.service.ts` produces a tenant-scoped export with secrets redacted;
`recordExportAudit()` records the event. Sensitive-module transfers must satisfy
`assertLawfulTransferBasis()` in `retention.service.ts`.

Offboarding steps:

1. Verify the requester's authority.
2. Resolve outstanding commercial/legal obligations without holding lawful data rights hostage.
3. Produce and audit the tenant export.
4. Revoke active sessions/credentials at the agreed closure point.
5. Apply documented retention policy; do not improvise immediate deletion of medical, discipline,
   finance, or audit evidence.
6. Record closure and a lawful contact route for later data-subject/compliance requests.

## 12. Metrics that matter

Customer Success should measure workflow outcomes, not vanity logins alone:

- time from accepted quote to live tenant;
- time to first real attendance register and invoice/payment;
- staff invitation and family activation rates;
- unresolved support threads by age/severity;
- tenant health movement after intervention;
- trial-to-paid activation;
- grace recovery and churn;
- reason-coded offboarding;
- satisfaction/interview findings tied to concrete product work.

## 13. Maintenance rule

Update this level whenever the real lifecycle or support ownership changes. Pricing mechanics belong
in Level 09, legal retention requirements in Level 08, and school role workflows in Level 06.
