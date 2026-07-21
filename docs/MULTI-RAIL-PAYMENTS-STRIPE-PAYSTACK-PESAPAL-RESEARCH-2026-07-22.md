# NEYO multi-rail payments research — Stripe, Paystack, Pesapal and school collections

**Reviewed:** 22 July 2026 (Africa/Nairobi)  
**Status:** Research and architecture recommendation only. No provider is activated by this document.

## 1. Executive recommendation

NEYO has two different payment businesses and must never mix them:

1. **Money paid to NEYO** — onboarding fees and NEYO subscriptions.
2. **Money paid to a school** — learner fees, activities, transport, cafeteria and other school invoices.

Recommended order:

### NEYO company payments

1. Keep central M-Pesa/Daraja.
2. Add a hosted card checkout through **Paystack Kenya or Pesapal**, after NEYO completes merchant onboarding and confirms current commercial terms.
3. Do not build direct Stripe as the first Kenya card rail. Stripe's current global availability page labels Kenya as **Extended network** and links Kenya to Paystack, rather than showing ordinary direct Stripe account registration.
4. Keep a future direct Stripe adapter for the day NEYO has a supported-country Stripe entity/account or Stripe changes direct Kenyan availability.

### School fee collection

1. Every school connects **its own merchant account**.
2. Payments settle directly to that school's contracted provider/bank destination.
3. NEYO records invoice intent, provider reference, verified webhook/IPN result, allocation and receipt.
4. NEYO must not pool or hold school funds in NEYO's merchant account.
5. Support Daraja first; add Pesapal/Paystack as optional school-owned connectors.

## 2. Current provider findings

### Stripe

Official global availability currently lists Kenya as **Extended network** and links to Paystack. Kenya appearing in Stripe Tax, identity-document or cross-border-payout documentation does not prove an ordinary Kenyan business can open a direct Stripe Payments merchant account.

Implication:

- do not advertise “Stripe Kenya connected” merely because Stripe can recognise Kenya, calculate Kenyan tax, verify Kenyan documents, or send cross-border payouts;
- direct Stripe Payments should remain conditional on successful merchant onboarding for NEYO's actual legal entity;
- overseas Visa/Mastercard customers do not require the checkout brand to be Stripe—Paystack or Pesapal hosted checkout can still accept eligible cards, subject to merchant approval and card issuer/provider rules.

Official source: https://stripe.com/global

### Paystack Kenya

Stripe's own global page directs Kenya to Paystack as its extended network. Paystack's Kenya terms state that Paystack Payments Kenya Limited is incorporated in Kenya and licensed by the Central Bank of Kenya as a payment service provider. Its public payment-channel documentation describes Kenya M-Pesa charging and webhook/verification behaviour.

Potential role:

- NEYO central card/M-Pesa checkout;
- school-owned card/M-Pesa connector;
- hosted checkout so NEYO does not collect card numbers;
- transaction verification and webhook processing.

Commercial onboarding, settlements, reserves, card acceptance, currencies, refunds and current fees must be confirmed directly before launch.

Official sources:

- https://paystack.com/ke/terms
- https://paystack.com/docs/payments/payment-channels/

### Pesapal API 3.0

Pesapal's official API 3.0 documentation provides:

- bearer-token authentication;
- IPN URL registration;
- mandatory `notification_id` for orders;
- unique merchant reference;
- ISO currency and amount;
- callback/cancellation URL;
- billing address;
- hosted redirect URL/iframe;
- order tracking ID;
- transaction-status query;
- refund endpoint in the API navigation;
- recurring card documentation for Visa/Mastercard.

The hosted URL presents the payment methods enabled for that merchant. NEYO should display methods returned/available for the connected merchant rather than hardcoding “bank, card and M-Pesa are always available.”

Pesapal says IPN is mandatory because browser callback can be lost when the customer closes the page, loses connection or encounters an error. A redirect to NEYO must therefore never mark an invoice paid.

Official sources:

- https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/submitorderrequest
- https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/registeripnurl
- https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/gettransactionstatus
- https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/recurringpayments

## 3. Product design

### Parent/school payer experience

On an invoice:

```text
Pay KES 26,500

• M-Pesa STK — School Daraja
• Card / available mobile money — School Pesapal
• Card / M-Pesa — School Paystack
• Bank/manual reference — if configured by the school
```

Only configured and healthy rails appear. The payer chooses one. NEYO creates one payment attempt with one immutable amount and reference.

For hosted checkout:

1. NEYO creates a `PENDING` attempt.
2. Server requests a hosted checkout URL.
3. Browser redirects to provider.
4. Provider handles card/mobile-money details.
5. Browser returns to a **status page**, not a success page.
6. NEYO waits for verified webhook/IPN and queries provider status if needed.
7. Only verified `PAID` status applies the invoice ledger and generates the receipt.

### NEYO subscription experience

NEYO Ops enables central rails:

- Central Daraja;
- central Paystack hosted checkout;
- central Pesapal hosted checkout;
- future direct Stripe hosted checkout if legally available.

The school chooses the rail at renewal. All rails activate the same subscription period and preserve monthly/termly/yearly cadence.

## 4. Required architecture changes

The existing `PaymentProvider` interface is M-Pesa-STK-shaped (`phone`, `stkPush`, `mpesaRef`, Daraja-specific credentials). Do not force card redirect providers into that shape.

Recommended provider-neutral contracts:

```ts
type PaymentRail = "MPESA_STK" | "HOSTED_CHECKOUT" | "MANUAL_BANK";

type Money = {
  currency: "KES" | "USD" | "GBP" | "EUR";
  amountMinor: number;
};

type CheckoutRequest = {
  merchantReference: string;
  money: Money;
  payer: { name?: string; email?: string; phone?: string };
  description: string;
  returnUrl: string;
  cancelUrl?: string;
  webhookUrl: string;
  metadata: Record<string, string>;
};

type CheckoutResult = {
  providerReference: string;
  redirectUrl?: string;
  customerAction?: string;
};
```

Separate capabilities:

- create hosted checkout;
- initiate STK;
- verify webhook signature/IPN notification;
- query transaction;
- refund request;
- recurring mandate/subscription, if enabled;
- settlement/reconciliation import.

### Credential model

Replace the single Daraja-shaped credential assumption with provider connections:

```text
PaymentProviderConnection
- tenantId nullable for NEYO central
- provider: DARAJA | PAYSTACK | PESAPAL | STRIPE
- environment: SANDBOX | LIVE
- merchant/account label
- encrypted credential fields
- webhook/IPN registration ID
- connection status
- capabilities JSON
- settlement currency
- last health check
- activated/revoked timestamps
```

Secrets remain encrypted and write-only in UI. Never store card numbers, CVV or provider passwords.

### Payment attempt model

One invoice can have multiple attempts, but only verified paid value may be allocated:

```text
PaymentAttempt
- invoice/subscription/onboarding target
- provider connection
- merchant reference (unique)
- provider reference (unique per provider)
- currency + amountMinor
- status: CREATED | PENDING | ACTION_REQUIRED | PAID | FAILED | CANCELLED | EXPIRED | REFUND_PENDING | REFUNDED | DISPUTED
- raw verified event audit
- paid/refunded/disputed timestamps
```

Keep `PaymentAllocation` separate so one verified payment can be split across siblings/invoices without pretending it was multiple provider transactions.

## 5. Security and accounting rules

1. Use hosted checkout; NEYO should not process raw card fields.
2. Never trust the return URL as proof of payment.
3. Verify Stripe/Paystack webhook signatures where applicable.
4. For Pesapal IPN, receive the tracking/reference, then query transaction status server-to-server before posting money.
5. Require HTTPS and environment-specific webhook URLs.
6. Use unique merchant references and provider-reference uniqueness.
7. Handle duplicate and out-of-order events idempotently.
8. Record amount and currency from provider verification; reject mismatch.
9. Preserve raw event evidence with secret/card data redacted.
10. Never log API keys, authorization headers, card details or full sensitive payloads.
11. Refunds and disputes must reverse/adjust the school ledger through governed accounting entries—never delete the original payment.
12. Reconcile provider settlements separately from customer payment success; a paid transaction and a bank settlement are related but not identical events.

## 6. Bank payments

“Bank payment” can mean several different things:

- debit/credit card issued by a bank;
- bank transfer to a static school account;
- temporary/virtual account generated per invoice;
- mobile banking app presented by a gateway;
- POS card payment;
- manually imported bank statement.

NEYO must label the exact mechanism. Do not show one generic “Bank” button unless the connected provider confirms the method for that merchant.

For ordinary direct bank transfers, retain/import:

- bank transaction reference;
- value date;
- amount/currency;
- payer narration;
- destination account;
- matched learner/invoice;
- reviewer and reconciliation state.

A bank CSV/import or open-banking integration is a separate connector from card checkout.

## 7. Recurring payments

### NEYO subscription

Recurring card payment can be useful, but only with explicit mandate/consent, advance notice, cancellation and failed-payment recovery. Pesapal documents recurring Visa/Mastercard support; exact frequencies and merchant enablement need confirmation.

### School fees

Do not default school fees to recurring card charges. Fees can change by term, learner, discount, transport, boarding and activity. Safer default:

- school issues invoice;
- parent chooses payment method;
- optional payment plan;
- each charge is clearly authorised;
- recurring mandate is a later school opt-in with legal/provider review.

## 8. Commercial and legal questions before implementation

For each provider obtain written/current answers for:

- Is NEYO's legal entity eligible?
- Can a sole proprietor/startup onboard, or is a company required?
- KYC documents and settlement account requirements?
- KES and foreign-currency acceptance?
- Visa, Mastercard, Amex, M-Pesa, Airtel Money, bank-transfer availability?
- Domestic/international card fees?
- Fixed fee, VAT and cross-border/FX markup?
- Settlement timing and minimums?
- Rolling reserves/holds?
- Refund and chargeback fees?
- Recurring/tokenisation eligibility?
- Schools as sub-merchants: permitted or prohibited?
- Marketplace/aggregator/Connect-style product availability?
- Can each school contract directly and connect API credentials?
- Data-processing terms and PCI responsibilities?
- Sandbox, webhook signing and support SLA?

Do not copy pricing from old blog posts into NEYO. Fees change and may be merchant-specific.

## 9. Phased implementation recommendation

### Phase 0 — commercial validation

- Apply for NEYO merchant test accounts with Paystack Kenya and Pesapal sandbox.
- Confirm entity/KYC, fees, settlement and permitted use.
- Confirm whether connecting independent school merchant accounts is allowed.
- Do not collect credentials in chat.

### Phase 1 — provider-neutral foundation

- Generalise connection, checkout, attempt, event and allocation models.
- Preserve Daraja behaviour and migrations.
- Add sandbox-only adapters and contract tests.

### Phase 2 — NEYO central hosted card checkout

- Add Paystack **or** Pesapal, not both simultaneously.
- Use onboarding/subscription invoices.
- Verify webhooks/IPN, amount, currency and idempotency.
- Add refund/dispute and settlement visibility before live activation.

### Phase 3 — school-owned connector pilot

- One consenting pilot school with its own merchant contract.
- Card/M-Pesa hosted invoice checkout.
- Direct settlement to school.
- Parent receipt and finance reconciliation.
- No production activation without provider approval and live callback evidence.

### Phase 4 — second provider and routing

- Add second connector only after operational evidence.
- School chooses default/fallback; NEYO never silently retries a payer on another provider.

### Phase 5 — future direct Stripe

- Implement Stripe Checkout only when NEYO has a verified eligible Stripe merchant account/legal structure.
- Do not create a foreign company solely to bypass onboarding without legal, tax and banking advice.

## 10. Recommended decision now

For a Kenya-first, zero-revenue startup:

- **Do not start with direct Stripe.** Kenya is currently shown by Stripe as an extended-network market through Paystack.
- Compare **Paystack Kenya versus Pesapal** using written merchant offers and sandbox quality.
- Pick one for NEYO's central card checkout.
- Keep Daraja for direct M-Pesa.
- Design school fee connectors as school-owned merchant connections, not NEYO-held funds.
- Build provider neutrality before a second gateway.

This gives Visa/Mastercard and potentially other merchant-enabled methods without creating a false “Stripe integration,” increasing PCI exposure, or turning NEYO into an unapproved payment aggregator.
