# NEYO Founder Manual V2 — Module 14: Finance

**Pages:** `/finance`, `/finance/payments`, `/finance/activities`  
**Last verified against code:** 2026-07-18

---

## 1. One student invoice ledger

Tuition, boarding, transport, meal cards, uniforms, library fines, damages and activities should feed
`Invoice`. `Payment` settles invoice. Promise, STK initiation, suspense receipt and teacher cash
request are not settled payment until confirmed/reconciled.

All values use KES.

---

## 2. Permissions

- `finance.view`: view scoped finance.
- `finance.create_invoice`: manual/batch invoice.
- `finance.record_payment`: cash/STK/reconciliation/reminders as UI permits.
- `finance.manage_structure`: structures/discounts.
- `tenant.manage_settings`: sibling discount/policies.

Parent sees own invoices in Portal, not staff Finance.

---

## 3. Finance navigation

Tabs/links:

1. Overview
2. Invoices
3. Fee Structures
4. Promises Calendar
5. M-Pesa Suspense Reconciler
6. Bank Clearing
7. BOM Payroll
8. School Farm
9. Cash & Reminders (record permission)
10. M-Pesa Payments link
11. Trips & Activities link

Payroll here is BOM statutory extension; full school Payroll page remains separate.

---

## 4. Overview

Cards:

- Outstanding Fees
- Collected (invoiced)
- Collection Rate

Actions:

- **Send Fee SMS Reminders**: sends eligible open-invoice guardian reminders with schedule/quota/
  dedupe.
- **Daily Digest** / **Weekly Digest**: leadership/bursar summary notification.

Class/stream leaderboard shows learners, billed, collected, outstanding, rate and class teacher.
Arrears Aging buckets:

- Current/not overdue
- 1–30
- 31–60
- 60+

Use source invoices; percentages do not replace provider reconciliation.

---

## 5. Fee Structures

Press **New Fee Structure**.

Fields:

- Level or Apply to all levels
- Specific class where supported
- Year
- Term
- Fee item label and amount
- **+ Add item**
- Total calculated
- Save/Create

Examples: Tuition, Activity, Boarding. Duplicate level/year/term structure blocked according to
service. Structure is template, not invoice until batch action.

### Sibling Discount

Authorized settings manager enters percent → Save. Rule applies only through explicit sibling-
discount service/action; setting percentage does not retroactively alter every invoice silently.

### Invoice the Level

On structure press **Invoice the level**. Choose due date → Run. `batchInvoice()` creates for active
matching learners and skips already invoiced same structure, making rerun idempotent. Review
created/skipped.

---

## 6. Invoices tab

Search/filter invoices by student/admission/invoice/status. Columns show student, invoice,
description, total, paid, discount, balance, due, status, print count.

Actions by permission:

- **Manual invoice**
- **M-Pesa**
- **Cash**
- **Discount**
- **Print**

Paid rows should not accept overpayment through normal action.

---

## 7. Manual Invoice

Press **Manual invoice**.

1. Search student and select.
2. Description.
3. Total KES.
4. Due date.
5. Year/term.
6. Save.

Use for legitimate one-off charge; prefer module-specific action where it carries richer context.

---

## 8. Invoice M-Pesa STK

Press **M-Pesa** on invoice.

Fields:

- Kenyan payer phone
- Amount (default remaining balance)

Press Send/Initiate. Service creates linked pending Payment and provider checkout. Payer approves on
phone. Callback `onPaymentPaid()` applies amount/status and sends receipt SMS.

Never mark paid from client success. Pending/failed requires status query/reconciliation.

---

## 9. Cash Payment

Press **Cash**.

Enter amount → Submit. Optional biometric finance security may require passkey action ticket. Service
updates paid/status, audits. Count cash physically and follow receipt/day-close policy.

Reception desk cash uses Reception route but same ledger. Teacher cash is pending request until office
confirm.

---

## 10. Discount / Bursary / Waiver

Press **Discount**. Enter KES amount and reason (minimum meaningful text). Submit may require
biometric. Service blocks over-discount, updates effective balance/status and audits. Full waiver can
mark paid/settled with zero due.

Never use discount to hide missing cash. Use approved bursary/scholarship reason/evidence.

---

## 11. Invoice Print

Press **Print** → `/api/finance/invoices/[id]/pdf`.

PDF includes status stamp, items, discounts, payments/references, guardian, QR and copy number. Every
render increments print count/last printer and audit. Reprint is evidence, not duplicate invoice.

---

## 12. M-Pesa Payments page

Lists Payment rows/status/reference/phone/amount/link. Actions according to component include status
query, receipt PDF, export and soft delete where authorized. Globally unique `mpesaRef` and checkout
id prevent duplicate settlement.

Use provider verification for disputed pending/paid; do not edit reference.

---

## 13. M-Pesa Suspense Reconciler

Suspense contains real provider receipts not matched to Student/Invoice.

Tab lists receipt, phone/reference/amount/time and match score/candidates. Authorized user reviews and
**Allocate** to correct student/invoice. Fuzzy score is suggestion; confirm phone/guardian/reference/
amount. Allocation creates/applies Payment exactly once and audits. Wrong allocation needs controlled
reversal, not deletion.

---

## 14. Promises Calendar

Shows promises with parent/student/invoice, promised date/amount/status. **Create installment plan**
opens invoice/lines schedule form; **Save plan** creates payment split/plan.

Promise statuses become kept/broken from real payment evidence/job. Plans do not alter invoice total
or mark paid.

---

## 15. Cash & Reminders

### Teacher Cash Payments

Policy button **Turn On/Off** controls whether Teacher Portal Cash tab appears.

Pending request **Decide** opens:

- **Confirm — cash received**: office physically confirms, applies invoice.
- **Reject**: requires reason.
- Cancel.

Teacher entry alone never counts paid.

### Reminder Schedule

Configure grace days and dedupe days → **Save**. This controls eligibility/frequency.

### Parents Never Logged In

Shows count/list; **Send** onboarding nudge through configured channel. `lastLoginAt` distinguishes
never logged in. Respect quota.

### SMS Spend Alert

Configure threshold/recipients/settings → Save. Alert monitors communication cost, not fee debt.

---

## 16. Bank Clearing

Treasury Check suite logs post-dated checks/bank slips, student, amount, maturity/reference/status.
When cleared, one-click clearing creates/applies real Payment. Three-day reminders may apply. Do not
clear before bank evidence; bounced/uncleared stays outstanding.

---

## 17. Trips & Activities

Link opens `/finance/activities`.

Top tabs:

- Fee Collection
- Tournament Trips

Create Activity fields include title/type/date/amount/classes/roster details. Button creates activity
and builds participants. Activity detail tracks required/paid/consent/status and produces PDF. Record
payments through real invoice/payment workflow.

Tournament Trips additionally manage trip, bus seats, fee-clearance flags, parent consent and
participants. Adding a participant does not mean consent/payment complete.

---

## 18. BOM Payroll and School Farm

BOM Payroll extension calculates statutory deductions and bank CSV manifest using configured staff
inputs. Full Payroll module governs ordinary payroll records/runs.

School Farm records yield/ledger/internal kitchen transfer/staff sales. Internal transfer pricing
must remain auditable; it is not student fee unless explicitly invoiced.

---

## 19. Reminder and digest jobs

- Fee reminders scheduled daily in Nairobi time and deduped.
- Manual Send All Open Reminders remains deliberate action.
- Daily/weekly finance digest sends leadership summary.
- Promise checker marks kept/broken.

Jobs need configured cron/worker/provider; existence in code does not prove production scheduler ran.

---

## 20. Full fee workflow example

1. Create Form 2 Term 2 structure: Tuition 18,500 + Activity 2,500.
2. Invoice level due 30 June; rerun skips duplicates.
3. Parent initiates STK 10,000; callback changes invoice Partial and receipt.
4. CDF bursary 5,000 approved through Discount with reason.
5. Balance 6,000 appears Portal/aging.
6. Parent commits date; promise does not change balance.
7. Payment received before date; promise job marks kept, invoice Paid.
8. Print tracked paid invoice and reconcile provider reference/cash day close.

---

## 21. Common errors

| Problem | Check |
|---|---|
| Finance forbidden | finance.view |
| Manual/structure button missing | create/manage permission |
| Batch creates 0 | already invoiced or no active matching students |
| STK no prompt | phone/provider/credentials/network |
| Invoice unchanged | callback pending/failed/suspense |
| Duplicate reference | existing Payment; reconcile, do not recreate |
| Cash requires biometric | school finance security/passkey |
| Discount rejected | amount > due or missing reason/permission |
| SMS reminder sends 0 | due/grace/dedupe/guardian/quota/provider |
| Teacher cash missing | policy off |
| Suspense uncertain | human confirmation required |
| Promise marked broken | no qualifying payment by due date |
| Activity charge absent | participant/invoice workflow not completed |

---

## 22. Founder verification checklist

1. Structure item/total/duplicate/all-level behavior.
2. Batch invoice create/skip idempotency.
3. Manual invoice and tenant/student scope.
4. STK pending→callback paid→invoice/receipt/SMS.
5. Duplicate callback/reference safe.
6. Cash/biometric/audit.
7. Discount/waiver/over-limit.
8. Parent own invoice STK; other family blocked.
9. Reception/teacher cash paths reach same ledger only after confirmation.
10. Aging/leaderboard/collection math.
11. Reminder schedule/dedupe/quota/digest.
12. Promise plan/kept/broken.
13. Suspense allocation exact once.
14. Treasury clearing bank evidence.
15. Invoice PDF copy tracking/QR.
16. Activities/tournament fee/consent/roster.
17. Cross-tenant direct ids and denied roles.
18. Mobile/glass/print/loading/empty/error states.

---

## 23. Gap review

Finance tabs, Payments and Trips & Activities links are rendered; Teacher Cash, Suspense, Treasury,
Promises, Payroll and Farm components are connected. No orphaned Finance UI was found in this pass.

---

## 24. Edit points

- `finance-client.tsx`, `finance.service.ts`, `/api/finance/*`
- Payments: `payments-list.tsx`, `payment.service.ts`, `/api/payments/*`
- Suspense: `mpesa-suspense-client-tab.tsx`, suspense service/routes
- Activities: `activities-client.tsx`, activity routes/services
- Teacher cash, promises, reminders, treasury extension services/routes
- Documents: invoice/receipt PDFs and verification
