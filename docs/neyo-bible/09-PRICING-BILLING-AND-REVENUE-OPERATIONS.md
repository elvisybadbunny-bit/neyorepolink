# NEYO Bible — Level 09: Pricing, Billing & Revenue Operations

*Created 2026-07-18 from the current pricing engine, pricing catalog, subscription billing, central
M-Pesa gateway, quote, referral, discount, SMS-margin, and Founder Ops services. This describes
NEYO charging schools—not a school's own student-fee ledger.*

## 1. Separate the two money systems

NEYO contains two distinct financial domains:

1. **School Finance:** a school invoices students/families and collects school fees in `/finance`.
2. **NEYO Revenue:** NEYO quotes and bills schools for using the platform.

Never allocate a parent's student-fee payment to a NEYO subscription, and never present NEYO's
subscription receipt as a school-fee receipt. The models, payment references, permissions, and
reconciliation paths are separate.

## 2. Current pricing choice

The active school-facing models are:

### Capacity Complete (`SIZE_BASED_V2`)

Every operational module is available as “Neyo Complete.” `computeSizeScore()` and
`quotePriceForCounts()` in `pricing-engine.service.ts` derive pricing from real/current school
counts and configured weighting, including students, staff, estimated parents, storage, and OCR
usage assumptions.

### Modular User & Module (`MODULAR_USERS_V1`)

`computeModularUserModulePrice()` charges configured active-user rates plus enabled optional-module
fees. `recalculateTenantModularPricing()` applies real module state and midpoint proration.
`checkPricingOptimizationAdvisor()` may recommend Capacity Complete when modular usage becomes more
expensive.

**Retired school-facing choices:** Free Karibu, Msingi, Pro, and Elite are historical names and must
not return as selectable plans. Legacy catalog/core definitions may remain where old records or
add-on calculations still require them, but they do not override the current dual-model decision.

## 3. Pricing governance

`PRICING_ENGINE_SETTING_KEY = "pricing_engine_v2"` identifies the live engine configuration.
`getPricingEngineConfig()` reads it; `savePricingEngineConfig()` is a founder/authorized Ops action.

Governance rules:

- Pricing coefficients are company controls, not school settings.
- A configuration change needs a named actor and audit evidence.
- Preview impact across real school sizes before activation.
- Preserve pricing history/snapshots; do not rewrite old invoices to the new formula.
- Use discretionary decreases only through `applyDiscretionaryDecrease()` and its delegation rule.
- A support agent may explain or send an approved quote but cannot create a private formula.

**Sources:** `src/lib/services/pricing-engine.service.ts`,
`src/app/api/platform/pricing-engine/route.ts`, `src/app/api/ops/pricing-*`.

## 4. Quote-to-customer flow

1. Prospect obtains `instantQuote()`.
2. `createQuoteRequest()` records contact and requirements.
3. Authorized Support/Ops sends a formal quote.
4. Prospect accepts through the token/id-specific quote flow.
5. Onboarding creates and links the tenant.
6. Trial starts.
7. Before activation, current counts and chosen pricing mode are confirmed.
8. First paid subscription activation transitions the real subscription state.

A quote is an offer, not a received payment. Acceptance does not mark a subscription paid.

## 5. Trial, subscription, and lifecycle

`ensureSubscription()` creates/returns the real subscription. The lifecycle is:

- `TRIAL`: 30-day evaluation under configured limits.
- `ACTIVE`: paid operational service.
- `GRACE`: overdue but temporarily recoverable under configured policy.
- `SUSPENDED`: operations lock after grace; records remain preserved.

`runSubscriptionStateMachine()` owns transitions. Manual database edits must not be used to make a
school appear paid or bypass trial safeguards.

## 6. Central M-Pesa collection

NEYO subscription payments use the central billing gateway:

- `centralAccountRef(slug)` creates the school-specific account reference.
- `subscriptionRenewalAmount(tenantId)` calculates the payable amount from current billing state.
- `initiateCentralSubscriptionStk()` initiates the real STK request.
- `handleCentralSubscriptionCallback()` validates and applies callback state.

Controls:

1. Show school, amount, period, and phone before initiating.
2. Treat callback/reconciliation—not browser success—as payment truth.
3. Enforce idempotency for provider references and repeated callbacks.
4. Apply approved credits/discounts once, with traceable ledger evidence.
5. Restore suspended service only after the real payment transition succeeds.

**Sources:** `src/lib/services/central-billing.service.ts`, `src/app/api/billing/central-callback/`,
`src/app/api/billing/public-stk/`.

## 7. Renewal amount construction

A renewal may include:

- base result from the chosen pricing model;
- approved module proration;
- referral credit;
- active discount campaign;
- SMS top-up/margin ledger or other approved add-on;
- grandfathering/history rules that are still contractually valid.

Every adjustment must retain its reason and source. Never collapse adjustments into a manually
edited final number that cannot be reconstructed.

## 8. Referrals

`revenue-ops.service.ts` provides the referral system:

- `ensureReferralCode()` creates a school code.
- `applyReferralCode()` links an eligible new tenant.
- `processReferralRewardsForPayment()` creates rewards only after qualifying payment.
- `pendingReferralDiscountKes()` calculates applicable credit.
- `markReferralCreditsApplied()` prevents re-use.
- `expireReferralCredit()` is an explicit, audited Ops action.

Referral rules are loaded/saved through `getReferralRules()`/`saveReferralRules()`. A referral is
not earned merely because a prospect clicked a link; qualifying paid behavior is required.

## 9. Discount campaigns

`discount-campaign.service.ts` supports controlled campaigns:

- `createDiscountCampaign()` creates dated eligibility and discount terms.
- `currentActiveCampaign()` selects an eligible active campaign.
- `newSignupDiscountKes()`/`allSchoolsDiscountKes()` calculate the real amount.
- `markFirstTermDiscountClaimed()` prevents repeated first-term claims.
- `endDiscountCampaign()` stops future use without erasing historical claims.

Campaign checklist:

1. Name, purpose, eligible population, start/end, cap, and approver.
2. Preview revenue effect.
3. Ensure discounts do not stack accidentally.
4. Verify first-term/one-time claims are idempotent.
5. Keep claimed invoices/payments unchanged when a campaign ends.

## 10. SMS margin and top-ups

`getSmsMarginConfig()`/`saveSmsMarginConfig()` control company SMS-margin rules.
`smsMarginDashboard()` shows current activity; `markSmsLedgerInvoiced()` closes the relevant ledger
period. School communication features check quota before sending, while NEYO Revenue tracks the
commercial top-up/margin separately.

Do not allow a school to exceed a paid quota silently, and do not mark the margin invoiced without
an underlying ledger period.

## 11. Pricing review and reprice controls

`checkTenantForReprice()` compares a tenant's current real counts/usage with pricing thresholds;
`checkAllTenantsForReprice()` performs the scheduled portfolio pass.

A reprice should:

1. use current count evidence;
2. retain before/after snapshots;
3. follow notice/contract rules;
4. avoid retroactively changing a closed paid period;
5. permit only authorized decrease delegation;
6. provide a human-readable explanation to the school.

A health or churn score must not secretly alter a school's price. Pricing inputs and customer-health
signals serve different purposes.

## 12. Revenue Operations dashboard

Founder/Ops revenue work includes:

- quote pipeline and accepted/not-live follow-up;
- trials nearing expiry;
- active, grace, and suspended subscriptions;
- payment reconciliation and failed callbacks;
- referral credit liability;
- active campaign exposure;
- SMS margin not yet invoiced;
- pricing-mode mix and optimization opportunities;
- discretionary decrease history;
- MRR/collections/customer counts from real payment/subscription data.

`founderMorningDashboard()` and the `/founder` operational tabs aggregate these signals. Dashboard
numbers are decision aids; settlement truth remains the payment and subscription ledgers.

## 13. Daily revenue SOP

1. Check central billing gateway health.
2. Reconcile callbacks and unresolved payments.
3. Review trials/grace schools requiring communication.
4. Process accepted quotes waiting for onboarding.
5. Review active campaigns/referral credits for anomalies.
6. Review SMS margin/top-up state.
7. Assign owners and follow-up dates to exceptions.
8. Record significant pricing/support decisions in the appropriate audit/decision log.

## 14. Month/term close SOP

1. Freeze the reporting cutoff and timezone.
2. Reconcile subscription payment totals to provider references.
3. Reconcile ACTIVE/GRACE/SUSPENDED states to paid periods.
4. Apply/close valid referral and campaign adjustments.
5. Close SMS margin ledgers already invoiced.
6. Review MRR, paying customers, trial conversion, grace recovery, churn, and discount impact.
7. Investigate anomalies before publishing founder/investor metrics.
8. Preserve the snapshot; do not recalculate historical reports using future pricing settings.

## 15. Refunds, reversals, and disputes

Where a refund/reversal path is required:

- verify the original provider payment and tenant;
- record reason and approver;
- reverse benefits/credits only where contractually valid;
- never delete the original payment;
- ensure subscription state reflects the net settled position;
- communicate the result and reference to the school;
- escalate suspected fraud/security incidents under Level 08.

A manual bank/mobile-money reversal outside NEYO still needs a matching internal adjustment record.

## 16. Revenue access boundaries

- **FOUNDER/SUPER_ADMIN:** pricing governance and highest-sensitivity revenue controls.
- **NEYO_OPS:** broad operational execution within granted permissions.
- **NEYO_SUPPORT:** quotes/onboarding/customer requests, not unrestricted pricing configuration.
- **School leadership:** sees and chooses its pricing model and payment status, not other schools'
  prices or company-wide formulas.
- **School finance staff:** school-fee finance does not imply NEYO company-revenue access.

## 17. Current evidence and verification

Core source files:

- `src/lib/services/pricing-engine.service.ts`
- `src/lib/services/pricing-catalog.service.ts`
- `src/lib/services/billing.service.ts`
- `src/lib/services/central-billing.service.ts`
- `src/lib/services/school-quote.service.ts`
- `src/lib/services/revenue-ops.service.ts`
- `src/lib/services/discount-campaign.service.ts`
- `src/lib/services/founder-dashboard.service.ts`

Regression evidence named in project history includes `scripts/i48-pricing-catalog-test.ts` and the
G.23 checks in `scripts/founder-batch-test.ts`. Re-run current tests before relying on old totals.

## 18. Maintenance rule

Pricing changes require coordinated updates to this level, Level 01 current product foundation,
Level 05 decision history, school-facing billing copy, tests, and the Features Checklist evidence.
Never append a contradictory new paragraph while leaving a retired package presented as current.
