# NEYO Founder Manual V2 — Module 24: Documents, Print Station, Exports, Verification & Dynamic Periods

**Pages:** `/print-station`, document endpoints, `/verify/[code]`  
**Last verified:** 2026-07-18

## 1. Document types

NEYO generates receipts, invoices, report cards, CBE reports, admission/transfer letters, ID/Mzazi
cards, transcripts, payslips, timetables, exam papers, rosters, portfolio booklets and operational
exports. Important documents use School Profile branding and QR verification.

## 2. Print Station access

Reception or Finance viewers can open `/print-station`. Keep open on authorized reception printer
computer. It loads queue/polling and separates pending/printing/printed/failed according to component.

Controls include printer selection/management, reconnect/test where shown, retry/print actions and
**Add Printer** name. Browser printing still depends on OS printer setup; NEYO cannot install driver.

## 3. Automatic queue

Paid invoice/receipt or approved print job may enter PrintJob. Online station receives/prints;
offline jobs wait and flush. Verify exact school/learner/document before reprint. Failed job should be
retried once after printer cause fixed, not duplicated repeatedly.

## 4. Whole Class printing

Card **Print a Whole Class**: choose Fee Structure and Class → **Queue Class Invoices**. Creates one
print job per eligible invoice. Review count and printer paper; it does not create invoices—batch
invoice first.

## 5. Print limits and approvals

Settings → Printing Limits sets daily per-user/school limit. Excess creates PrintApprovalRequest.
Leadership Approve/Reject. Approval permits job; it does not bypass document ownership/tenant scope.

## 6. Browser print versus PDF

- Browser print: timetable/class lists/badges/labels where CSS print view.
- PDF: server-rendered file with stable branding/layout/QR.
- Print Station: queued operational printing.

Printing/re-downloading does not duplicate financial transaction, though invoice print count tracks
copies.

## 7. CSV and XLSX exports

Reusable Export Menu buttons:

- CSV
- XLSX

Server `/api/export` validates permission/entity, creates tenant-scoped rows. CSV escapes and includes
UTF-8 BOM; XLSX uses structured workbook. Export is sensitive data—store/delete securely.

## 8. QR verification

Important document issuance creates `DocumentVerification` code/payload hash. QR points public
`/verify/[code]`, showing genuine/not found/minimal metadata. Verification proves NEYO issued matching
record; it does not guarantee later payment/status unless page explicitly reads live state.

## 9. Branding and plain print

Documents use name/logo/motto/brand colours/address/signature/stamp where configured. Print/PDF is
always plain high-contrast—not Liquid Glass. Fix School Profile source rather than editing one PDF.

## 10. Dynamic timetable periods — gap fixed

Founder reported periods were hard-coded to 8. Audit found main Smart Engine already uses each
class's `TimetableConfig.periodsPerDay`, but several surrounding paths still capped/assumed 8:

- manual slot Zod max 8;
- legacy/simple Auto-Fill iterated exported eight-period constant;
- fair Saturday accepted only period ≤8;
- Smart Time-Off dropdown always 8;
- print fallback forced minimum 8;
- schedule input limited 4–10;
- old solver retained unused MAX_PERIODS=8.

Repairs:

1. Manual slot validation accepts periods 1–20.
2. Simple Auto-Fill loads selected class TimetableConfig and generates exactly its periods/day.
3. Fair Saturday accepts period ids up to 20; class Saturday config still governs eligibility.
4. Time-Off and Blocked Slot dropdown lengths derive maximum real configured periods (fallback 8).
5. Schedule Rules permits 1–20 periods/day.
6. Print fallback uses configured period count or highest real slot, no forced eight columns.
7. Removed obsolete fixed PERIODS and unused solver MAX_PERIODS constants.

Default 8 remains only a fallback for new/unconfigured classes/templates; once school saves real
periods, grids/generation/dropdowns/prints follow it. Saturday has its own configured count.

## 11. Changing a school's period count

1. Academics → Timetable/Smart Timetable → Schedule Rules.
2. Select class, whole grade or level group deliberately.
3. Enter Periods per Day (1–20), lesson duration, start, breaks and flexible lunch-after-period.
4. Save.
5. Ensure break/lunch period numbers do not exceed count.
6. Review class subject weekly needs versus new capacity.
7. Review time-off/blocked slots/doubles/Saturday.
8. Regenerate Draft.
9. Inspect grid and class/teacher/venue prints.
10. Publish after review.

Reducing count can leave old slots above new maximum; clear/regenerate and inspect warnings. Increasing
count does not automatically add lesson needs—extra periods become honest free capacity.

## 12. Common errors

Printer not found: OS/browser setup. Queue duplicated: repeated click/retry; reconcile PrintJob.
Wrong branding: School Profile. QR not found: wrong/stale code. Export forbidden: permission. Period
selector missing P9+: save config/reload. Print still 8: verify selected class config and regenerate.
Unplaced after reducing periods: loads/blocks exceed capacity.

## 13. Founder verification

Receipt/invoice/report/timetable/Payslip PDFs; QR genuine/not found; class print queue/limit/approval/
retry; CSV/XLSX scope; dynamic classes with 6, 8, 10 and 12 periods; manual P12 save; time-off/block P12;
simple and Smart generation; print exact columns; Saturday separate; cross-tenant document/export.

## 14. Edit points

Print Station client/services/routes; document renderers; export route/menu; verification service/page;
Timetable config/UI/academics validation/autoFill/solver/print page.

## Print Station configuration and browser limitations

A real school user opens **Print Station** and may add their own printer/station labels instead of choosing from fictional preset printer models. **System print dialog** remains the safe default. A browser cannot silently select a physical printer, tray or paper size; the operating-system print dialog makes that final choice. Labels are organisational and are stored on that browser only.

The daily limit is not restricted to preset dropdown values. An authorised Principal, Deputy, Dean, HOD or Owner enters any number from 1–1000, or selects **Unlimited**, then presses **Save**. This writes through the existing school-wide print-limit API; it is not merely a setting on one reception computer.

When a queued document opens the browser print dialog, NEYO asks **Did this document print successfully?** Pressing OK marks the real queue record printed and increments the count. Pressing Cancel keeps it in the queue and pauses automatic processing. This avoids losing a job when the user cancels, the printer jams or paper is unavailable.

Founder verification: add and remove a station label; set a non-preset limit such as 37 and reload on another authorised session; open one queued document, cancel the success confirmation and verify it remains queued; then print and confirm it disappears only after confirmation.

## Mobile wide-card and table behaviour

NEYO's shared operational table card now has a universal mobile rule: it stays inside the phone viewport, preserves the table's useful width, and scrolls horizontally with touch when the columns cannot fit. This applies across academics, assessments, competencies, finance, staff, payroll, classes, imports, promotion, settings jobs and other modules that use the shared table. Dense specialist grids—including marks, scan review, contest results, formative scores, subject-selection responses, payment lists, reception queues, payroll extensions, syllabus and exam timetable—also declare a practical minimum width inside a horizontal scroll surface. Vertical page scrolling remains available.

Founder verification at 360px: open each role's main list and any dense review modal, swipe inside the card, confirm the rightmost action/field is reachable, then swipe vertically outside and inside the card to confirm the page is not trapped. Also verify the desktop table remains fully visible and print-only documents retain their print layout.
