# NEYO Founder Manual V2 — Module 23: Discipline, Clinic, Security/Gate & Reception

**Pages:** `/discipline`, `/clinic`, `/gate`, `/reception`  
**Last verified:** 2026-07-18

## 1. Safety principle

These modules hold sensitive child, health, behavior, pickup, visitor and emergency data. Use least
privilege, factual notes and audit trails. Never put counseling/medical details into general chat.

# Part A — Discipline

## 2. Tabs

Incidents, Behavior, Suspensions, Counseling. discipline.view reads; discipline.manage reports/
proposes; Principal/Deputy/Owner approve; counseling restricted.

## 3. Report Incident

**Report Incident**: learner, category, severity Minor/Major/Severe, date/time/location, description,
action/evidence file → Save. Teacher scope limits learners. Major/Severe can SMS primary Guardian.
Incident may be Pending approval; leadership **Approve Case** or **Reject**.

Demerit points derive severity and feed annual Behavior board (Good/Watch/At Risk). Signal is not
automatic punishment.

## 4. Suspensions

**Issue/Propose Suspension**: learner, start/end, reason, return conditions. Teacher proposal requires
leadership approval; authorized leadership issues/approves. Active overlap blocked. **Complete/
Close** ends suspension; guardian SMS according to service. Preserve history.

## 5. Counseling

Confidential holders press **New Session Note**: learner/date/note/follow-up → Save. Content excluded
from broad audit metadata/family payload. Do not use discipline notes as counseling substitute.

# Part B — Clinic

## 6. Tabs and visits

Visits, Allergies, Medications, Dosage Log, Health Report.

**Record Visit**: learner, complaint, treatment, medication, referral and notes. Referral triggers
Guardian SMS. Check allergy warning before treatment.

## 7. Medical Profile and Allergies

**Update Medical Profile**: learner, blood group, allergies, chronic conditions, SHA/NHIF, notes.
Allergy register feeds Clinic and Kitchen safety. Medication matching allergy is blocked.

## 8. Medication

**Start Medication Plan**: learner, drug, dosage, frequency/instructions → Save. Active card:
**Give Dose** records who/when/note; **Stop** closes. Dose after stopped blocked.

Dosage Log extension records ADMINISTERED/MISSED/REFUSED at scheduled times. It complements core
plan; avoid duplicate dose record.

## 9. Health Report

Year totals: visits, referrals, allergic learners, active medication and Frequent Visitors ≥3.
Follow-up signal, not diagnosis. Portal gets family-safe health only.

# Part C — Security/Gate

## 10. Tabs

Gate Passes, Pickup Authorization, Panic Alerts, QR Checkpoint.

## 11. Gate Passes

**Issue/Propose Pass**: learner, reason, leave/return, escort → Save. HOD/Dean may propose;
Principal/Deputy/Owner approves/rejects. Check pass number with **Check**; valid active unused pass
stamps/use according to workflow. Cancel closes. QR station returns Allowed/Not Allowed/Didn't Pass/
Invalid and Stamp Exit/Return.

## 12. Pickup Authorization

Search learner/admission → **Look Up**. Shows permanent authorized persons. **Add Authorized Person**:
name/relationship/phone/ID. **Confirm Pickup** records gate confirmation. Remove/cancel through
service.

Alternate pickup: enter code → Verify; **New Alternate Pickup** with learner/picker/phone/relation/
proof/expiry; Cancel code. Expired/cancelled blocked.

## 13. Panic Alerts

Any staff with panic.raise: choose Fire/Medical/Intruder/Other, location/details → red Raise. Creates
active alert, in-app staff alerts and leadership SMS; never parents/students. Leadership **Resolve**.
Use only genuine emergency; call public emergency services where needed.

## 14. QR Checkpoint

Universal scanner modes:

- Gate pass status/stamp
- Attendance P/L
- Payment lookup

Permissions control modes. Camera + manual code + jsQR fallback + recent audit. Duplicate cooldown
prevents repeated scan.

# Part D — Reception

## 15. Front Desk actions

- Sign In Visitor
- Record Payment
- Import Bank Statement
- M-Pesa Fees
- Report-Card Day
- New Inquiry
- Relay Call
- Day-End Summary

Dashboard shows today's visitors/on-site, inquiries, calls and payments.

## 16. Visitors

**Sign In Visitor**: name, phone, ID, purpose, host and optional linked student; generates daily badge.
Print Badge; **Sign Out** stamps time. Hostel Visitors reads linked rows. Do not delete to mark exit.

## 17. Payments

Record Payment supports real cash/manual M-Pesa reference through authorized finance path. M-Pesa
Fees searches learner/open invoice then sends STK. Bank Statement import parses CSV and reconciles;
review unmatched/duplicates. Never fabricate references.

## 18. Admission Inquiry and Calls

**New Inquiry**: parent, phone, learner, grade, curriculum, notes → Admissions banner. **Relay Call**:
caller/name/phone/recipient/message → real conversation/inbox plus PhoneMessage log.

## 19. Report-Card Day

Search learner, Guardian check-in, one-tap report print according to component. Verify guardian/
student before release. This does not publish an unpublished exam.

## 20. Day-End Summary

Download/open summary of visitors/on-site, inquiries, calls, payments. Resolve visitors still on-site
and reconcile cash; do not delete rows.

## 21. Reception extensions

Reception also renders Lost & Found and Fleet/Gate safety suites in current layouts: record item/
photo/status/claim with verified Student ID; fleet fuel/safety/compliance. Coordinate with Transport
Fleet to avoid duplicate vehicle truth.

## 22. Example

1. Reception signs visitor for hostel learner; badge/host alert; signs out.
2. Teacher reports Major bullying incident; leadership approves, parent SMS.
3. Counselor records confidential session separately.
4. Clinic records allergy and referral; guardian SMS.
5. Parent creates one-time pickup; gate verifies code/person.
6. Leadership approves Gate Pass; QR stamps exit/return.
7. Medical emergency: staff raises Panic, leadership resolves after response.
8. Reception closes day summary/reconciles payment.

## 23. Errors

Wrong learner scope; approval role; allergy block; stopped medication; pass Pending/used/expired;
pickup code invalid; visitor already signed out; duplicate M-Pesa; panic permissions; unpublished
report; cross-tenant direct id—all must fail safely.

## 24. Founder verification

Incident scope/approval/SMS/demerits; suspension proposal/approve/close; counseling confidentiality;
clinic profile/allergy/referral/medication/doses/report; pass proposal/approval/QR reuse; pickup
permanent/alternate; panic staff-only notification/resolve; Reception visitor/badge/signout/inquiry/
call/cash/STK/bank/day summary/report day; lost-found claim; tenant/role/mobile.

## 25. Gap review

Core tabs/actions and Reception extensions are wired. No orphaned component found. The remaining
organizational risk is duplicate Fleet truth between Reception extension and Transport core; this
requires product consolidation policy, not a missing button.

## 26. Edit points

Discipline/Clinic/Gate/Reception clients and services; QR service/station; extension suites; Finance,
Admissions, Messages, Hostel and Portal integrations.
