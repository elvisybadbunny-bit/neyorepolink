# NEYO Founder Manual V2 — Module 21: Inventory, Uniforms, Assets, Suppliers, Procurement & Expenses

**Page:** `/inventory`  
**Tabs:** Stock, Uniform Sizes, Assets, Suppliers, Procurement, Expenses  
**Last verified:** 2026-07-18

## 1. Access

inventory.view reads; inventory.manage changes stock/assets/suppliers/requests/expenses. Leadership
`tenant.manage_settings` approves threshold Purchase Orders/Expenses. Student sales create Finance
invoices; stock movement is not payment.

## 2. Stock tab

Buttons **Add Store**, **Add Item**.

Store fields: name/location → Add Store. Item fields: store, name, category, unit, reorder level,
optional sale price, expiry tracking → Add Item.

Item card shows quantity, store/category/unit, reorder/expiry alerts. Click name opens Movement
History. Actions:

- **In**: quantity, reason/reference; expiry-tracked requires batch no/expiry.
- **Out**: quantity + reason; insufficient stock blocked.
- **Sell**: Student, quantity; reduces stock and creates student invoice at configured sale price.

FIFO consumes earliest-expiry batches. Reorder alert when quantity ≤ threshold. Expired batches need
controlled disposal/stock-out reason.

## 3. Uniform Sizes

Only Uniform-category Stock Items appear. Preset size buttons (XS–XXL/numeric) or existing size row
open quantity editor → Save. Per-size totals synchronize master item quantity. Sold-out/low badges
feed Parent Uniform ordering. Delivery decrements exact size and master stock.

## 4. Assets

**Add Asset** fields include name/category/location/custodian/value/acquired date/condition/
depreciation rate/next maintenance. Auto AST tag generated.

Click asset opens drawer:

- edit acquisition/custodian/condition/depreciation/next maintenance;
- current straight-line book value;
- maintenance history and total;
- log maintenance type/date/cost/note and next date.

Book value is management calculation, not audited accounting valuation.

## 5. Suppliers

**Add Supplier**: name, category (food/uniform/cleaning/stationery/transport/services/other), contact,
Kenyan phone, KRA PIN, notes. Duplicate name/invalid phone blocked.

Supplier card:

- 1–5 star rating buttons;
- **Add contract**: title/start/end/value/note;
- active/renew-soon/expired badges;
- Archive supplier through service where action appears.

Rating is internal evidence; do not defame publicly.

## 6. Procurement

**New Purchase Request**: title, details, needed-by → Save.

Request:

- **Add Quote**: select real supplier, amount, note.
- Cheapest quote marked best price but human decides quality/terms.
- **Order** creates PO from chosen quote.

PO workflow:

- Under threshold auto-approved; over threshold Pending Approval.
- **Approve**: leadership, creator cannot self-approve.
- **Send**: marks sent to supplier.
- **Record Delivery**: delivered value/note.
- **Three-Way Match**: supplier invoice no/amount compares PO, delivery, invoice.
- Mismatch shown red; do not pay quietly.
- Cancel/reopen behavior through service when required.

## 7. Expenses

Views include Expenses, Categories, Cost Centers and Reports.

If dimensions absent, **Add Standard Categories** seeds Kenyan presets. Add/archive categories and
cost centers.

**Record Expense** fields:

- Category
- Cost Center optional
- Payee
- Amount KES
- Spent date
- Note
- Receipt photo/PDF

Below threshold auto-approves; above threshold Pending. Leadership **Approve** or **Reject** with
reason; creator cannot self-approve. Reports include approved spend by category/cost center/month;
pending/rejected excluded.

Receipt upload works; automatic extraction remains Bundi-gated where applicable.

## 8. Parent Uniform flow

Parent chooses in-stock size/quantity → Order creates invoice and supplier notification. Payment via
Finance/Portal. Mark Delivered only when physically delivered; then stock decrements. Avoid manual
Sell plus Uniform Order for same items.

## 9. Example

1. Create Main Store and Kitchen Store.
2. Add Rice kg with reorder 6, expiry tracking; stock in Batch R1 20kg.
3. Issue 16kg to Kitchen reason; alert at 4kg.
4. Add Uniform Sweater price KES 1,200, sizes S/M/L.
5. Parent orders 2 M; invoice KES 2,400; deliver decreases M and master.
6. Raise dry-food purchase request, add two quotes, order approved supplier, receive, three-way match.
7. Record approved Food expense against Kitchen cost center with receipt.

## 10. Errors

| Problem | Check |
|---|---|
| Negative/insufficient stock | quantity/current balance |
| Expiry item stock-in blocked | batch/expiry required |
| Uniform size unavailable | size quantity/category Uniform |
| Student sale no invoice | sale price/student/invoice permission |
| Supplier duplicate | existing directory |
| PO pending | approval threshold/creator separation |
| Three-way mismatch | PO/delivery/supplier invoice values |
| Expense pending | threshold/leadership approval |
| Report total low | only approved/month filters |

## 11. Founder verification

Store/item/duplicate; stock in/out/FIFO/alerts; sale→invoice; uniform size/master sync/order/delivery;
asset tag/depreciation/maintenance; supplier/rating/contracts/expiry; request/quotes/PO threshold/self-
approval/send/delivery/match/mismatch; expense presets/approval/reject/reports; tenant/role/mobile.

## 12. Gap review

All six Inventory tabs and their real services/routes are wired. No orphaned action found. Keep
Inventory Asset/Fleet Capital Asset extension boundaries clear to avoid duplicate registers.

## 13. Edit points

`inventory-client.tsx`; inventory/uniform/supplier/procurement/expense services and APIs; Portal
Uniform card; Finance invoices; owner profitability approved-expense integration.
