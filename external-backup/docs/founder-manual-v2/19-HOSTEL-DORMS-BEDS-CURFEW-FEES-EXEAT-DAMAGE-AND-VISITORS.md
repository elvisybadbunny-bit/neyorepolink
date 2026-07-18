# NEYO Founder Manual V2 — Module 19: Hostel

**Page:** `/hostel`  
**Last verified against code:** 2026-07-18

---

## 1. Records and tabs

Hostel → Rooms → Bed Allocations; nightly HostelAttendance; boarding invoices; visitors from
Reception; Exeat passes; vandalism inspections.

Tabs:

1. Dorms & Beds
2. Curfew Register
3. Damage/Allocation inspection suite
4. Exeat Passes

Requires hostel.view; changes hostel.manage. Day School profile automatically disables Hostel module.

---

## 2. Dorms & Beds

**New Hostel** fields:

- Name
- Gender: Boys/Girls/Mixed
- Hostel Master optional
- Boarding fee per term

Save creates hostel; duplicate name blocked. Fee is template for boarder invoicing, not automatic
charge until Invoice Boarders.

Cards show rooms, beds, occupied/free and progress.

Buttons:

- Rooms & Beds
- Invoice Boarders (manager)

---

## 3. Invoice Boarders

Press on hostel; service uses current/selected year/term/due details in workflow and creates ordinary
Finance invoices for active allocations. Description includes Boarding/hostel/term. Rerun skips same
charge. Review created/skipped; parent pays via Portal/M-Pesa.

Releasing bed does not automatically reverse an already-issued boarding invoice; use Finance policy.

---

## 4. Rooms & Beds board

Back **Hostels**; manager buttons:

- **Auto-Allocate Beds**
- **Add Room**

Room card shows occupied/capacity and every Bed number. Empty bed → Allocate. Occupied bed → student/
admission, Visitors, release icon.

---

## 5. Add Room

Fields: room name and capacity/bed count. **Add Room** creates numbered bed positions logically.
Duplicate room in hostel blocked. Capacity should match physical safe beds.

---

## 6. Allocate Bed

Press Allocate on exact bed. Search/select active student → Save/Allocate.

Rules:

- one active bed/student;
- bed not already occupied;
- room capacity;
- student gender matches hostel unless Mixed;
- Day Scholar/boarding type restrictions in auto engine;
- tenant/student existence.

Success reloads board. Do not allocate same student to “reserve” multiple beds.

---

## 7. Release Bed

Press release/person-minus on occupied bed. Service closes allocation and frees bed; double release
blocked. Confirm student genuinely moved/left. Historical curfew/invoice remains.

---

## 8. Auto-Allocate Beds

Dialog strategies:

- **Form/Class grouping**: group learners by form/class where possible.
- **Mixed**: distribute/balance according to engine.

Run previews/allocates eligible unallocated boarders into compatible free beds. Review placement;
full/ineligible students remain unallocated honestly. It does not create hostel capacity.

---

## 9. Boarder Visitors — gap fixed

Backend `boarderVisitors()` and `?visitors=studentId` existed but Hostel UI never exposed them.
Added **Visitors** beside each occupied bed. Modal shows Reception-linked last 30 visitors: name,
phone, purpose, badge, sign-in, on-site/signed-out.

Visitor must first be signed in at Reception and linked to student. Hostel modal is read-only; sign
out/corrections remain Front Desk to preserve one visitor ledger.

---

## 10. Curfew Register

Choose Hostel and date. Sheet lists active boarders sorted room/bed with IN/OUT/LEAVE pills and notes
where available.

Tap status then **Save Curfew Register**. Service upserts one row/student/date.

- IN: present in hostel.
- OUT: missing/out; newly OUT triggers urgent guardian SMS when eligible.
- LEAVE: authorized known leave; note/reference should explain.

Re-saving OUT does not duplicate SMS because previous-status/dedupe check. Quota/provider/guardian
phone required.

Curfew is separate from school Class Attendance and Gate Exeat status.

---

## 11. Exeat Passes

Create/request outing pass with student, reason, leave/return times, escort/details. Pass status flows
Pending/Approved/Used/Returned/Rejected/Cancelled according to suite.

Manager approves/rejects. Approved generates `EXP-...` QR. Gate scan stamps departure/return. Pending
or reused pass is blocked. Review late return.

Do not treat ordinary curfew Leave as approved Exeat unless pass/policy exists.

---

## 12. Damage/Vandalism Inspection

Suite supports bed/cubicle/mattress/locker tags, end-term inspection, condition/damage evidence and
replacement charge. **Stamp damage fee** creates Student invoice once. Review evidence/amount/
responsibility; avoid duplicate Inventory/Hostel charge.

---

## 13. Full boarding example

1. Create Chui House Girls, KES 15,000/term.
2. Add Room 1 capacity 6.
3. Allocate Achieng Bed 1; gender mismatch test blocked for boy.
4. Invoice Boarders Term 2; parent sees invoice.
5. Reception signs/links visitor; Hostel Visitors shows badge/status.
6. Night: mark IN/OUT/LEAVE; OUT guardian SMS once.
7. Student requests weekend Exeat; approve; QR gate exit/return.
8. End term inspect Bed 1; invoice evidenced damage if applicable.
9. Release bed when student leaves hostel.

---

## 14. Common errors

| Problem | Check |
|---|---|
| Hostel missing | School Type DAY/module off/permission/platform pause |
| Gender blocked | student gender vs hostel |
| Student already allocated | release prior active bed |
| Room full | capacity/free bed |
| Auto allocation leaves students | day/ineligible/gender/no capacity |
| Invoice creates 0 | already billed/no active boarders |
| Curfew SMS absent | newly OUT, guardian phone, quota/provider |
| Visitor list empty | Reception VisitorLog not linked to student |
| Exeat blocked at gate | Pending/expired/cancelled/already used |
| Damage fee duplicate | existing invoice/recovery record |

---

## 15. Founder verification checklist

1. Create hostel/duplicate/gender/fee.
2. Add room/capacity.
3. Allocate gender/one-bed/occupied/full rules.
4. Auto allocation strategies/day scholar exclusion.
5. Release/double release.
6. Boarder invoice idempotency/Portal payment.
7. Reception link → Visitors modal (fixed) → sign-out status.
8. Curfew IN/OUT/LEAVE/upsert/urgent SMS dedupe.
9. Exeat request/approve/reject/QR exit/return/reuse.
10. Damage inspection/evidence/invoice no duplicate.
11. Parent/teacher denied administration.
12. Cross-tenant ids blocked.
13. Mobile night curfew usability/glass/empty/error.

---

## 16. Gap fixed

Added Hostel read-only Boarder Visitors entry/modal reusing existing service/API and Reception ledger.
No schema or duplicate visitor workflow.

---

## 17. Edit points

- `hostel-client.tsx`, `hostel.service.ts`, `/api/hostel`
- Exeat suite/routes/Kenyan extensions service
- Vandalism suite/extensions-v2 service
- Reception visitor linkage
- Finance invoice integration
