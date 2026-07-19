# NEYO Founder Manual V2 — Module 25: Bundi Imports, OCR, Review, Quotas & Safety

**Surfaces:** `/bundi`, Student/Staff/Library imports, mark sheets, exam papers, paper quizzes,
question books  
**Last verified:** 2026-07-18

## 1. Bundi rule

School copy says Bundi, not AI/provider names. Bundi accelerates work; core manual/rule-based workflow
must remain. Human reviewer owns final record.

## 2. Main Bundi page

Platform flag controls navigation/direct page. Paused shows calm locked note and preview cards:

- Ask Bundi
- Report remarks
- Early flags
- Lesson plan starters

These are previews, not fake active buttons. No other module depends on them.

## 3. Shared Bundi Intelligent Import

Domains: Student, Staff, Library, Teacher Allocation.

### Step 1 — Describe columns

For each physical register column enter label and NEYO target field. **Add Another Column**, trash.
Optional Context such as “Grade 7 East 2026.” **Continue** saves field template; Cancel.

### Step 2 — Upload

Choose JPG/PNG scanned page. File is encrypted/tenant stored; session starts; image enhanced, local OCR
runs, words grouped into rows/columns, safe numeric/phone fixes and school-data matching applied.
Back returns mappings. Extraction error commits nothing.

### Step 3 — Review

Every cell has source badge:

- Please Check — uncertain OCR
- Auto-fixed/Remembered — deterministic or confirmed prior correction
- Bundi Confirmed — approved secondary correction path
- Manual — edited by reviewer

Edit cells, remove wrong rows, Back or **Import N Rows**. Server saves reviewed rows then commits
through domain validation. Result shows created/failed; Done closes.

## 4. Premium Handwritten Student Import

`/students/import/bundi` adds:

1. If no code, press **Request code from NEYO**. This creates a real school support thread.
2. NEYO Support/Ops reviews intended use; Founder Ops → Bundi Import enters Tenant ID (blank only for an intentionally company-wide code), Max Uses and internal note, presses **Mint Code**, then shares it securely. Ops list shows Active/Used Up/Expired/Revoked and can **Revoke**.
3. Enter received code → Redeem/Continue.
4. Describe columns → Add/remove → Save Template.
5. Upload JPG/PNG/PDF one page.
6. Honest unavailable/error state if provider not configured.
7. Review rows/cells/remove.
8. Import N Students.
9. Result skipped/created → View Students.

Unlock code is time-bound/revocable, not authorization bypass.

## 5. Scan Quota

Before scan `assertCanScanBundiOcr(tenantId,pages)` checks included+top-up balance/current term. After
accepted processing `recordBundiOcrScanUsage()` records pages/idempotency context.

Quota modal shows included, used, purchased, remaining and bundles. **Purchase** starts real top-up
order/payment; allowance increases only after confirmed payment. Close cancels. Manual entry remains.

## 6. Mark Sheet OCR

Print tracking sheet → scan → match class/admission → Unchanged/Delta/New/Uncertain → edit → Confirm
and Save. Only confirmed differences transactionally update marks.

## 7. Exam Paper and Paper Quiz

Exam Paper: scan rough questions → edit structure/options/marks → save/print/LMS export.
Paper Quiz: scan questions → print → enter scores → deterministic rubric → review → post CBE.

## 8. Question Book Scan

Scan textbook/worksheet → candidate questions/options → review answer/explanation/scope/copyright →
add school bank or submit national approval. Extraction is not publishing permission.

## 9. Learned Corrections/Templates

Only learn from confirmed reviewer changes; scope tenant/domain/layout; revalidate every use. Never
share one school's names/layout corrections with another tenant or learn secrets/free-text medical
content.

## 10. Privacy and provider behavior

Bundi is local/deterministic first. Some genuinely uncertain cells may use an approved protected
processing provider when company configuration permits. Access, minimization, encrypted storage,
retention and human review still apply.

**Copy gap fixed:** main Bundi page previously promised “Nothing leaves your school,” which was too
absolute given optional approved provider escalation. Replaced with accurate local-first/protected-
processing language without exposing vendor names.

## 11. What Bundi must never do

Invent student/class/subject/payment; bypass tenant/permission; auto-approve low confidence; expose
vendor secrets; make autonomous medical/discipline/financial/result decisions; consume quota twice
on retry; make core workflow unavailable.

## 12. Errors

Paused/release denied; quota exhausted; invalid/revoked code; unsupported file; unreadable page;
unknown column/value; duplicate row; provider outage; commit validation. Response: review/manual
fallback, never lower safety threshold.

## 13. Founder verification

Pause/manual fallback; domain permission/tenant; template mapping; encrypted upload; local OCR;
confidence badges/manual edit/remove; commit exact rows; retry idempotency; quota/top-up payment;
unlock expiry/revoke; mark delta; paper/quiz/question scan; learned correction isolation; provider
outage; sensitive log/storage retention.

## 14. Gap fixed

Corrected misleading absolute privacy sentence on Bundi preview to match real optional approved
processing architecture while retaining school-facing Bundi copy law.

## 15. Edit points

Bundi client/wizards/quota modal; Bundi import/intelligent/quota services; session APIs; encrypted
files; each scan consumer; Founder Ops config/release controls.

## Requesting a Bundi handwritten-import access code

A school user who has no code presses **Request an access code** in the first step. This creates a real support thread; it does not pretend that a code was issued automatically. After success the button changes to **Request submitted** and cannot create repeated requests in the same session. The school can continue with standard student import while the request is reviewed. If approved, the school administrator receives the code through the secure support workflow.

On a phone, the Bundi review grid keeps the full imported columns and shows a swipe instruction. The user swipes left/right inside the grid to review and correct every field before committing. The standard import **Recent imports** table follows the same mobile pattern and exposes all audit columns by horizontal swipe.
