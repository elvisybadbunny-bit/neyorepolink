# NEYO Founder Manual V2 — Module 22: Cafeteria & Pocket Wallet

**Page:** `/cafeteria`  
**Last verified:** 2026-07-18

## 1. Tabs

1. Kitchen Today
2. Week Menu
3. Store & Rationing
4. Pocket Wallet
5. Meal Cards (when enabled)
6. Fee Plans (manager + cards enabled)
7. Requests (manager)
8. Table Allocations
9. Meal Queue

cafeteria.view reads; cafeteria.manage changes. Bursar/leadership manage; support staff may view
kitchen. Student charges use Finance invoices.

## 2. Meal Model policy

Policy controls meal cards enabled and scope/model. If disabled, manager sees **Enable Meal Cards**
which saves HYBRID/current scope. Enabling does not issue cards/invoices automatically.

## 3. Kitchen Today

Breakfast/Lunch/Supper cards show real headcount and today's menu. Headcount combines active meal
cards and boarders according to policy; boarding fee covers boarders. Kitchen Store section shows
stock/alerts and **Issue food for meal**.

Issue fields: Inventory item, quantity, meal/reason → Save. This calls Inventory stock-out and
preserves movement. Insufficient stock blocked.

## 4. Week Menu

Seven-day × meal grid. Click a cell to edit dish; Save upserts unique day/meal, Cancel closes. Missing
shows menu not set. Menu planning does not deduct stock until Issue Food.

## 5. Meal Cards

**Issue Meal Card**:

- Day-scholar Student
- Selected meals (Breakfast/Lunch/Supper)
- Term fee
- Plan/details

Save creates Invoice first and then active card tied to invoice. One active card/student/term.
Boarders should not receive duplicate day-scholar meal invoice.

Card actions:

- Sync to Live Plan Cost: computes difference and updates through service, not silently.
- Cancel Card: stops entitlement; invoice reversal/refund requires Finance policy.

## 6. Fee Plans

**New Fee Plan** fields: name, level, year/term, selected meals, term fee → Save. Card **Bulk Issue to
Class** previews/executes cards/invoices for eligible students, skips existing.

`followsLiveDefault` cards can sync when plan changes; fixed-price cards retain original unless
explicit Sync.

## 7. Parent Requests

Manager toggles whether family can request Cafeteria enrollment. Requests show ENROLL/CANCEL,
learner, plan/reason/status.

**Decide**:

- Approve enroll requires Fee Plan; creates card/invoice.
- Approve cancel follows service cancellation.
- Decline with reason.
- Cancel closes decision modal.

Request alone provides no meal entitlement.

## 8. Table Allocations

Choose meal session and table size. **Generate Seating Plan** assigns eligible learners to tables;
**Clear Plan** removes generated plan. Table cards show seats/learners. Review allergies, age,
boarding/day scope and accessibility; algorithmic seating is operational aid.

## 9. Meal Queue

Choose session/date. Search/add learner → **Add to Queue**. Rows show waiting order/status.

- **Serve** marks served.
- **Cancel** removes/cancels entry.

Queue is service evidence, not fee payment. Verify active entitlement according to service/policy.

## 10. Store & Rationing

Kitchen Store suite creates requisitions and supplier LPOs, per-capita ration calculations and
>15% divergence alerts. Inputs/headcount/quantities must reflect real units. LPO is procurement
document, not settled expense/payment. Avoid duplicating Inventory Kitchen Store movement.

## 11. Pocket Wallet

Digital Student Pocket Wallet:

- select/search learner;
- create/open wallet;
- parent M-Pesa/top-up transaction according to suite;
- barcode/canteen debit;
- transaction history/balance;
- insufficient-balance protection.

Wallet money is distinct from fee invoice balance. Every credit/debit must retain reference, actor,
amount and resulting balance; never manually edit balance to reconcile cash.

## 12. Full example

1. Set week menu Monday lunch Githeri.
2. Create Grade 7 Breakfast+Lunch plan KES 9,500.
3. Parent requests Achieng; approve with plan → invoice/card.
4. Kitchen Today includes Achieng plus boarders.
5. Issue 4kg maize from Kitchen Store for lunch.
6. Generate 8-seat table plan; add learners to queue, Serve.
7. Parent tops up pocket wallet KES 1,000; canteen debit KES 80; balance/history remain.

## 13. Errors

| Problem | Check |
|---|---|
| Meal Card tabs absent | policy disabled |
| Headcount wrong | active cards/boarders/date/session |
| Issue food fails | stock/units/quantity |
| Card duplicate | existing active card term |
| Parent request not active | pending school decision |
| Bulk issue skips | existing/ineligible/no students |
| Wallet debit fails | balance/status/student/reference |
| Table empty | eligible headcount/session |
| Queue duplicate | existing active queue entry |
| Ration divergence | actual issue vs calibrated headcount |

## 14. Founder verification

Policy on/off; menu upsert; headcount; Kitchen stock movement; meal card invoice-first/duplicate/cancel/
sync; fee plan bulk issue; parent request decision; table generation/clear; queue add/serve/cancel;
wallet credit/debit/insufficient/idempotency; ration/LPO; Portal and tenant/role/mobile states.

## 15. Gap review

All nine tabs are conditionally rendered and connected. No orphaned Cafeteria action found. Inventory
Kitchen Store vs extension Store & Rationing must share/coordinate movement to avoid double issue;
this is an operational consolidation rule, not missing UI.

## 16. Edit points

`cafeteria-client.tsx`, `cafeteria.service.ts`, `/api/cafeteria`; Portal cafeteria card; Inventory
Kitchen Store; Kitchen Store/Pocket Wallet extension services/routes; Finance invoice/payment.
