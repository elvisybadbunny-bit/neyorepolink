# NEYO Founder Manual V2 — Module 18: Library

**Page:** `/library`  
**Last verified against code:** 2026-07-18

---

## 1. Library records

- LibraryBook: title-level catalog and total copies.
- LibraryBookCopy: exact physical copy/QR/status.
- BookIssue: borrower, issue/due/return/fine.
- Digital file: optional authorized PDF/DOC.
- Invoice: optional billed fine.

Title count tracking can work without per-copy codes; per-copy tracking is safer for physical stock.

---

## 2. Access and tabs

`library.view` opens; `library.manage` adds/edits/issues/returns/fines/import/copies.

Tabs:

1. Catalog
2. Out Now
3. Issue a Book (manager only)

Parents/students read own history through Portal, not Library administration.

---

## 3. Catalog search and cards

Search title, author, ISBN/category. Cards show title/author/ISBN/category/shelf, total/out/available,
digital file and copy tracking.

Buttons:

- **Add Book**
- **Import Books**
- **Digital Copy** download
- **Manage Copies**

Empty search suggests another query; empty catalog offers Add Book.

---

## 4. Add Book

Fields include:

- Title required
- Author
- ISBN/barcode
- Category
- Shelf
- Total copies
- Digital copy optional upload

**Add/Save Book** validates total/title and tenant ISBN uniqueness. Upload file is authorized storage.
Do not upload copyrighted digital books without rights.

---

## 5. Import Books

Modes:

- Standard CSV/XLSX/Paste
- Bundi Intelligent scan

Standard accepts catalog columns, header flag, file/paste, **Import**, result created/updated/skipped/
row errors, Done. Correct failed rows only.

Bundi Intelligent follows describe columns/context → encrypted image → extraction → review every cell
→ commit. It cannot invent ISBN/copy counts; uncertain cells require correction.

---

## 6. Per-Copy Tracking

Press **Manage Copies**.

If none: **Generate Copy Codes** creates up to total copies. Existing count is not duplicated. Each
copy has Copy No, code, status and current holder.

Statuses:

- Available
- Out
- Lost
- Damaged
- Retired

Change status through selector/action. Do not mark Out manually instead of issuing; holder/due need
BookIssue.

**Print A4 Label Sheet** opens `/api/library/labels/[bookId]`: QR, title, copy number. Print/cut/apply
to matching physical copy. Reprinting keeps stable code.

---

## 7. Issue a Book — scanning

Input accepts:

- ISBN barcode
- typed ISBN/title lookup
- exact copy QR/code

Buttons:

- **Find**
- **Built-in Scanner**
- **Stop Scanner**
- Quick test ISBN/copy buttons in current UI

Scanner uses BarcodeDetector and jsQR canvas fallback. Allow camera/HTTPS. Exact copy resolves title,
copy number/status and auto due date; unavailable copy is blocked.

---

## 8. Issue form

After book:

- select borrower by student name/admission; supported staff borrower indicated as Staff;
- due date auto-calculated from policy/default, editable as allowed;
- review availability/shelf/author;
- **Issue Book**.

Service enforces future due, availability, exact copy, duplicate/open loan and max-open issues. Clear
X resets book/borrower. Successful issue changes copy Out/count and appears Out Now/Portal history.

---

## 9. Out Now

Shows title/copy, learner/admission, issue date, due date, overdue days and live fine.

**Return** closes issue, frees copy, freezes final fine. Double return blocked. Confirm physical
condition; mark damaged/lost through copy workflow rather than pretending normal return.

---

## 10. Fine policy

Service default exports KES 10/day and max 3 open issues, but school policy can configure fines on/off
and amount through Policy controls in Out/Library UI where rendered.

Overdue days exclude Sundays. Live fine = chargeable overdue days × configured amount. On-time return
zero/paid. Never rely on old page text; this chapter corrected Library subtitle from hard-coded
“KES 10” to school-configured policy wording.

---

## 11. Unpaid Fines

Actions:

- **Collect Cash**: marks fine paid after real cash collection; follow receipt/day-close.
- **Add to Invoice**: posts fine to student's ordinary Finance invoice. Double billing blocked.

Once billed, family pays through Finance/Portal rails. Do not both collect cash and invoice without
reconciliation.

---

## 12. Reading History and Portal

`readingHistory()` is row-scoped. Portal Library Card shows out/overdue/returned/fine status for own
child. Library staff can inspect authorized borrower. Another parent/student blocked.

Digital download and history do not grant redistribution rights.

---

## 13. Lost Book and Coursebook Recovery

Academics Textbook Fines extension handles 1:1 coursebook allocation and lost replacement fee.
Library copy Lost status and coursebook recovery must not bill same loss twice; use correct owning
workflow and inspect invoice history.

---

## 14. Full example

1. Import KLB Mathematics Form 2, ISBN, shelf, 12 copies.
2. Generate 12 copy codes and print labels.
3. Scan Copy 4; choose Achieng; due +14 days; Issue.
4. Portal shows borrowed book.
5. Return after 9 chargeable days overdue; fine calculated by policy.
6. Choose Add to Invoice; family sees fine and pays by M-Pesa.
7. Copy becomes Available; history retained.

---

## 15. Common errors

| Problem | Check |
|---|---|
| Add/Issue hidden | library.manage |
| Duplicate ISBN | existing title; update/use copy codes |
| All copies out | return/availability; don't increase count falsely |
| Copy unavailable | Lost/Damaged/Retired/Out status |
| Borrower blocked | max open/duplicate/row scope |
| Due rejected | must be future/valid |
| Scanner fails | HTTPS/camera/browser; type code fallback |
| Fine differs | school policy, Sundays, due/return dates |
| Add to invoice fails | already billed/no invoice/service permission |
| Parent sees other child | security defect; must be blocked |
| Label sheet empty | generate copy codes first |

---

## 16. Founder verification checklist

1. Add/search/duplicate ISBN.
2. Import standard and Bundi review/result.
3. Generate codes idempotently and label print.
4. Copy statuses and holder.
5. ISBN versus exact copy scan.
6. Issue availability/max-open/duplicate/due rules.
7. Return/double return/copy free.
8. Fine on-time/overdue/Sunday/configured policy.
9. Collect cash versus invoice/double bill.
10. Parent own history/other blocked.
11. Digital file auth.
12. Lost/damaged/coursebook double-charge review.
13. Cross-tenant copy/book ids blocked.
14. Mobile/glass/print/loading/empty/error states.

---

## 17. Gap fixed

Library page subtitle hard-coded “KES 10 per day late” even though `setLibraryPolicy()` supports a
school-configured fine amount/on-off state. Updated subtitle to describe configured policy. No
calculation change required.

---

## 18. Edit points

- `library-client.tsx`, `library.service.ts`, `/api/library*`
- Import: `library-import.service.ts`, `/api/library/import`
- Labels: label route/PDF
- Portal: `portal/library-card.tsx`
- Coursebook recovery: Textbook Fine extension
