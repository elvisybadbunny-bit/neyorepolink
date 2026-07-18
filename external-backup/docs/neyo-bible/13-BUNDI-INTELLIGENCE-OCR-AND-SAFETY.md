# NEYO Bible — Level 13: Bundi Intelligence, OCR & Safety

*Created 2026-07-18 from the real Bundi services, validations, APIs, UI components, quota/release
controls, and scan consumers. Product-facing language follows the Bundi Rule.*

## 1. Identity and non-dependence rule

Bundi is NEYO's helper and intelligent-workflow brand. School-facing copy says **Bundi**, not “AI,”
and does not expose provider names. Bundi may accelerate extraction, matching, drafting, and review,
but no core school workflow may require Bundi to remain operational.

Manual/rule-based alternatives must exist for attendance, marks, lesson plans, reports, finance,
imports, and every other core workflow. Platform pause or quota exhaustion must not corrupt or
lock existing school records.

## 2. Real Bundi surfaces

Current source surfaces include:

- `/bundi` → `src/components/bundi/bundi-client.tsx`.
- `/students/import/bundi` → `bundi-import-wizard.tsx`.
- `bundi-intelligent-wizard.tsx` for guided intelligent import.
- `bundi-scan-quota-modal.tsx` for quota/top-up state.
- Founder controls: `bundi-ocr-config-tab.tsx` and `/api/founder-ops/bundi-ocr-config`.
- Import session APIs under `/api/bundi-import/sessions/`.
- Scan quota APIs under `/api/bundi/scan-quota/`.
- Scan consumers: mark sheets, exam-paper tidying, paper quizzes, question-bank book scan, and
  relevant import flows.

A route/component existing does not mean global release; release and module controls still apply.

## 3. Three core service layers

### `bundi-intelligent.service.ts`

Owns image/OCR and deterministic intelligence primitives:

- `enhanceImageForOcr()` preprocesses image bytes.
- `runLocalOcr()` returns full text plus positioned words.
- `groupWordsIntoRows()` turns geometry into rows.
- `assignRowToColumns()` maps rows to expected fields.
- `applyNumericOcrFixes()` repairs common numeric glyph confusion.
- `repairAndNormalizePhone()` handles Kenyan phone extraction.
- `matchAgainstKnownValues()` compares OCR text to known school data.
- `validateAgainstSchoolData()` checks extracted values against real tenant records.
- learned correction/template functions reuse prior confirmed layouts/corrections.
- `computePipelineStats()` reports confidence/review behavior.
- `runBundiIntelligentPipeline()` orchestrates the pipeline.

### `bundi-import.service.ts`

Owns provider config/unlock controls and staged import sessions:

- field templates;
- `startImportSession()`/`startIntelligentSession()`;
- extraction;
- review;
- commit;
- cancellation;
- session listing/details;
- usage dashboard;
- time-bound unlock codes controlled by authorized company users.

### `bundi-ocr-quota.service.ts`

Owns company-configurable allowance and top-ups:

- `getBundiOcrConfig()`/`saveBundiOcrConfig()`;
- current period key;
- per-tenant quota status;
- `assertCanScanBundiOcr()` before work;
- `recordBundiOcrScanUsage()` after accepted processing;
- `purchaseScanTopUpBundle()`.

## 4. Deterministic-first pipeline

The preferred order is:

1. Validate file type, size, page count, tenant, permission, and release state.
2. Check quota.
3. Downsample/enhance image safely.
4. Run local OCR.
5. Use geometry and field templates.
6. Apply known safe character/phone repairs.
7. Match against real school rosters, subjects, classes, exams, or admission numbers.
8. Apply previously confirmed tenant/domain corrections.
9. Compute per-cell confidence.
10. Send uncertain cells to human review (or an approved provider escalation where configured).
11. Validate reviewed values with domain Zod/service rules.
12. Commit transactionally.
13. Record usage, audit evidence, and non-sensitive pipeline stats.

This minimizes provider cost and hallucination risk while preserving a review trail.

## 5. Confidence and human review

A cell/row is not trusted merely because OCR returned text. Confidence includes OCR score,
layout/column fit, domain format, known-value match, and consistency with the target record.

Review UI must show:

- original/extracted value;
- normalized proposal;
- confidence/reason;
- matched school record where applicable;
- old database value for updates;
- editable confirmed value;
- skip/reject option;
- total changes before commit.

Uncertain values remain uncommitted. A reviewer correcting one cell must not silently approve every
other uncertain row.

## 6. Import session state

A safe import is staged:

1. **Started/uploaded**—source metadata and intended domain recorded.
2. **Extracted**—candidate rows/cells exist; no production domain commit yet.
3. **Reviewed**—authorized user resolves errors/mapping.
4. **Committed**—validated writes occur through the domain service.
5. **Cancelled/failed**—source session remains evidence; no partial hidden import.

`commitSession()` must be idempotent/race-safe. It cannot trust client-supplied tenant ids or bypass
the normal student/staff/library domain validation and uniqueness rules.

## 7. Scan-specific workflows

### Mark sheets (EE.4)

A tracking reference identifies exam, subject and class. The engine compares extracted marks to
current `ExamResult` values and classifies unchanged, changed delta, new entry, or uncertain review.
Only confirmed deltas are applied transactionally.

### Exam paper tidying (EE.5)

OCR text is segmented into numbered questions, options and marks. Teachers edit structure before
saving `ScannedExamPaper`; LMS export creates real quiz/question rows only from the reviewed paper.

### Question-bank scan (EE.8)

Textbook/worksheet scan creates candidate questions. Correct answer, explanation, scope, copyright
and national-sharing status need review; extraction alone must not publish nationally.

### Paper quiz to rubric (EE.9)

Reviewed question/maximum marks and entered student scores drive deterministic percentage-to-rubric
conversion. Applying creates real CBC assessment evidence in a transaction.

## 8. Data validation and school truth

Bundi cannot invent a class, admission number, subject, student, invoice, or staff identity merely
to make a row pass. Unknown values are:

- mapped by an authorized user;
- created through the normal domain workflow if appropriate; or
- rejected/skipped with a reason.

Fuzzy matching is a suggestion. High-risk financial, medical, discipline, identity, and result data
requires stronger confirmation than low-risk formatting.

## 9. Learned corrections and templates

`BundiLearnedCorrection` and `BundiDocumentTemplate` improve repeated school layouts. Safe rules:

- scope by tenant/domain/layout;
- learn only from confirmed corrections;
- retain source/actor/time/confidence;
- never make one school's names or layout available to another school;
- allow invalid/stale correction retirement;
- re-run current validation after applying a learned correction;
- do not learn secrets or sensitive free-text narratives.

A template accelerates column placement; it does not override current headers or record identity.

## 10. Quota and top-up behavior

Before scanning, `assertCanScanBundiOcr(tenantId, pagesNeeded)` checks remaining allowance/top-up.
After processing, accepted usage is recorded through `recordBundiOcrScanUsage()` using the current
period key. Founder/Ops can edit future allowance/bundle configuration through the real config tab.

UX requirements:

- show included, used, purchased, and remaining pages;
- state required pages before upload where known;
- block before expensive processing when insufficient;
- never double-charge a retry/idempotent replay;
- offer manual entry as the always-working alternative;
- top-up payment must be real before increasing allowance.

## 11. Release and access controls

Bundi surfaces remain subject to:

- company platform pause;
- feature release/pilot whitelist;
- tenant module entitlement;
- role/permission;
- quota;
- domain row scope.

Founder config routes are company-role only. School staff cannot mint global unlock codes or edit
company pricing/allowances. An unlock code must be time-bound, revocable, scoped, and audited.

## 12. Privacy and retention

Images may contain minors, IDs, marks, medical facts, or family contacts.

- Strip EXIF where appropriate.
- Minimize stored source images; retain only for a defined review/audit need.
- Use tenant-prefixed storage and authorization on serve.
- Do not send a full page to an external provider when deterministic/local processing suffices.
- Do not log raw OCR text from sensitive documents.
- Apply domain retention and deletion policy to both source and extracted session.
- National sharing requires separate approval and de-identification checks.

## 13. Provider fallback and outage

If an optional provider is unavailable:

1. Keep the upload/session safe.
2. Report extraction unavailable or local-only result honestly.
3. Preserve manual review/manual entry.
4. Do not fabricate high confidence.
5. Do not repeatedly consume quota on automatic retry.
6. Record a safe error code and provider latency/status without secrets.
7. Reprocess only with user/system idempotency controls.

## 14. Quality metrics

Useful, privacy-safe metrics:

- pages processed by domain;
- local deterministic completion rate;
- cells requiring review;
- correction rate after proposal;
- unmatched record rate;
- commit success/partial/failed counts;
- duplicate/retry avoidance;
- processing time per page;
- quota/top-up usage;
- template reuse and stale-template rejection.

Do not optimize “automatic completion” by lowering review thresholds and corrupting records.

## 15. Bundi safety test matrix

| Test | Required outcome |
|---|---|
| feature paused | no scan/commit; manual workflow remains |
| quota exhausted | blocked before processing; no usage double count |
| wrong tenant/session id | blocked/no data |
| unauthorized role | 403 |
| blurry/low confidence | review, not auto-commit |
| unknown admission number | unmatched/skip, not invented student |
| duplicate upload/retry | idempotent session/commit |
| altered client-reviewed payload | server validation catches invalid values |
| provider outage | safe error/manual route |
| confirmed valid session | exact transactional writes and audit |

## 16. Copy law

Allowed school-facing language: “Ask Bundi,” “Bundi OCR,” “Bundi found 12 rows,” “Review 3 uncertain
cells.” Avoid technical provider/model terms, exaggerated certainty, and claims that Bundi “knows”
a learner. Internal source names may retain technical terms where necessary; rendered product copy
must follow the law.

## 17. Maintenance rule

Add a workflow only when a real source surface exists. Update function inventories when services
change. Keep platform status, quota, manual fallback, privacy, and human confirmation explicit.
Bundi product decisions belong in Level 05; provider activation belongs in Level 12.
