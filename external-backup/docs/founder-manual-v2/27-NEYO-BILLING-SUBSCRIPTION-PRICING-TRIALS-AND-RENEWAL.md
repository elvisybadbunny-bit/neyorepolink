# NEYO Founder Manual V2 — Module 27: NEYO Billing, Subscription & Pricing

**Page:** `/settings/billing`  
**Last verified:** 2026-07-18

## 1. Separate from school Finance

This page is what the school pays NEYO. Student invoices/M-Pesa fees are School Finance. Never mix
references or receipts.

Only School Owner/Principal (`owner.dashboard`).

## 2. Current Pricing Model card

Shows real pricing model, status, active term price, renewal date and usage limits. Modes:

- Capacity Complete (`SIZE_BASED_V2`)
- Modular User & Module (`MODULAR_USERS_V1`)

Statuses: Trial, Active, Grace/Past Due, Suspended, Cancelled according to lifecycle.

## 3. Gap fixed: real dual-pricing data

Billing server page previously built only legacy plan/catalog data and never passed `dualPricing` to
BillingManager. Therefore real Capacity/Modular selector was hidden, while Current Plan could show
legacy Msingi/Pro and “Free.” Fixed page to compute real counts, optional modules, pricing config,
Capacity quote, Modular quote, advisor and pass dualPricing. Current card now names real mode and
shows “Price pending current school counts” instead of fake Free.

## 4. Capacity Complete card

Shows active/alternative, quote per term, all modules included, score basis and recommendation.
**Switch to Capacity Complete Model** calls `/api/billing/switch-model`, recalculates subscription,
updates card/toast. Review quote before switch.

## 5. Modular User & Module card

Shows base core fee, student/staff user costs, optional modules count/fee and total. **Switch to
Modular User & Module Model** persists mode/current price. Mid-term optional-module activation uses
before/after midpoint proration; module state controls future recalculation.

## 6. Pricing Advisor

When ≥ configured optional modules make Capacity cheaper, shows recommendation and potential savings.
It is arithmetic advice, not automatic switch. School chooses.

## 7. Usage bars

Students, staff, SMS top-up and other configured metrics: used/limit, normal/over/blocked. SMS is
separate top-up. Trial limits may differ from paid model. Counts come from real records.

## 8. Trial and lifecycle

New school receives 30-day Trial with Ops-configurable limits. At expiry choose model and complete
first NEYO subscription M-Pesa. State machine:

`TRIAL → ACTIVE → GRACE → SUSPENDED`

Suspension preserves data; operational features lock until payment. It never deletes school records.

## 9. Renewal M-Pesa

Central billing computes renewal amount/account reference and initiates STK. Payer approves phone;
central callback confirms SubscriptionPayment/status. Browser success is not payment proof.

Referral, campaign or influencer discount is applied through distinct auditable fields, once.

## 10. Referral and Influencer cards

Referral Card shows school referral code/status/credits. Reward follows qualifying paid school, not
link click. Influencer Code validates eligible code/discount/commission rules. Do not stack where
service forbids.

## 11. Contact NEYO

Fields Subject, Priority, Message → **Send to NEYO** creates real support thread; replies in account.
Do not send passwords, PINs or keys.

## 12. Founder Ops controls

Pricing Engine edits coefficients/rates; Pricing Schools/history/reprice; discounts/influencers/
revenue grants; Trial Limits; lifecycle. Support cannot privately change formulas. Price changes
preserve history and next-renewal notice.

## 13. Example

School has 400 students/30 staff/5 optional modules. Billing shows both real quotes and advisor.
Owner compares, switches Capacity, renewal amount saved. At due date initiates central STK; callback
sets Active. School Finance invoices remain untouched.

## 14. Errors

Selector absent (fixed dualPricing); price pending (counts/config/zero); switch fails (permission/
subscription/state); STK absent (gateway/phone); paid but suspended (callback/reconciliation);
modules fee unexpected (enabled optional modules); referral missing (qualification/payment).

## 15. Founder verification

Real mode labels/no Msingi/Pro/Free fallback; counts and both quotes; model switch/persist; advisor;
module proration; trial limits/expiry; central STK/callback/idempotency; discounts/referral/influencer;
grace/suspension/data preservation; Support thread; denied roles/cross-tenant.

## 16. Edit points

Billing page/manager; billing/pricing/central-billing/catalog/revenue services; billing APIs;
ExpiredCheckoutClient; Founder Ops pricing/trial/campaign controls.
