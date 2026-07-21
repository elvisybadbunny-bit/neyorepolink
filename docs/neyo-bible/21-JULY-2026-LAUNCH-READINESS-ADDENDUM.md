# 21 — July 2026 launch-readiness addendum

**Current through:** 21 July 2026
**Status:** Source-grounded addendum; unchecked research-queue work remains pending

This level updates the Bible for the major implementation work completed after the earlier handbook levels. It does not turn an instruction or a design idea into a completion claim.

## Public company website

The root website is School-OS-first. Its canonical promise is “Run your entire school from one operating system.” Farm, Business and Creator directions receive a small future mention rather than equal promotion. The page contains real product images, school outcomes, CBE/timetable/operations/security sections, Elvis Malimbe’s founder story, honest pilot pricing language, FAQ structured data and governed demo intake.

The public site is deliberately isolated from signed-in Liquid Glass/dark preferences. First-time NEYO appearance defaults to light; an explicit saved choice may still win later. The public demo creates a pending request only.

Sources: `src/components/public-site/neyo-landing-client.tsx`, `src/app/public-landing.css`, `src/lib/services/landing-content.service.ts`, `src/app/api/demo/start/route.ts`.

## Senior School deterministic timetable

The permanent rule remains: no Bundi, language model or external timetable provider generates a timetable. Implemented phases include readiness, deterministic Option A/B/C graph construction, teacher/venue/capacity validation, protected reservations, per-learner proofs, quality/cost controls, governance review/approval/publication, teacher staffing reports and real parallel same-subject teaching groups.

Generation is not approval. Confirmed learner choices are not silently changed. Unplaced lessons remain visible. Personal proof and governance protect publication.

Sources: `docs/SENIOR-SCHOOL-TIMETABLE-COMPLETE-OPERATIONS-GUIDE-2026-07-21.md`, `src/lib/services/senior-*`, `src/lib/services/timetable-governance.service.ts`, `src/lib/services/teacher-elective-staffing.service.ts`.

## Timetable print

The dedicated `/print/timetable` route is outside app chrome. Vertical days are default; landscape A4 uses 3mm CSS margins; break/lunch columns are distinct; black-and-white remains plain; the footer shows generation time and Powered by NEYO. Actual physical borderlessness still depends on printer hardware.

## CBE Delivery Hub

CBE Delivery connects reviewed curriculum intent, real delivery, learner evidence and support/intervention. Its API establishes tenant context for every read/write. Bounded delivery-session, evidence and support creation can queue offline with at-most-once replay; publication/review edits remain online to avoid stale overwrites.

## Learning Videos

The curated, strand-linked YouTube Learning Library now lives inline in `/learning-videos`, not as a CBC popup. Search/playback still requires connectivity/provider availability. Candidate discovery and national publication remain separate human-governed stages.

## Offline architecture

The shared local database is `neyo-offline` version 3:

- `outbox` — pending safe writes;
- `bundleCache` — bounded read-only role-permitted snapshot;
- `failedOutbox` — permanently rejected sync actions retained for review.

Implemented queued workflows include attendance, exam marks, CBE observations, records of work, bounded CBE Delivery creates, supported gate-pass/visitor/manual-cash paths. Bundle sections are filtered server-side by merged permissions. `/settings/offline` explains capabilities. Snapshots show save age and a red warning after 24 hours.

No paid offline provider, Redis or cloud queue is introduced. One small server idempotency receipt protects against duplicate side effects. Deployed browser/database exactly-once verification remains required evidence.

## Library

Library supports QR and Code 39 labels, selectable QR/barcode/both A4 output, copy-first scan lookup, due-date policy and local confirmation audio. No paid barcode or audio service is required.

## Legal and public claims

Terms and Privacy are versioned effective 21 July 2026 and ignore stale live-policy settings. Unsupported ODPC registration and DPO claims were removed. Qualified Kenyan legal/privacy review, registration assessment and external agreements remain actions—not repository facts.

## Demo, identity and recovery governance

Public demo intake creates `PENDING` only. Founder approval creates a governed tenant; temporary credentials are one-time output to authorised operations and are not written to notes/audit. Curated NEYO identities are generated on supported account creation/login paths. Initial-password activation is explicit. Recovery OTPs use secure random generation, keyed digest storage, expiry, rate limits and session revocation.

## Founder Operations

Credentials & Secrets Vault is the canonical encrypted company integration store. The vault loads the settings payload, not the summary dashboard payload. Unsupported government credential slots were removed. Demo requests, discount capacity, storage intelligence and other company operations remain separated by Founder/Ops/Support permissions.

## Active founder decisions still pending implementation

1. Contextual guided help is implemented with a governed model, Founder review/versioning, route/role mapping, permanent Help action, one dismissible Dynamic Island offer per version, movable mini-player and transcript fallback. Deployed browser/video verification remains required.
2. Founder-controlled onboarding pricing is implemented: operational factor toggles, real school/submission calculation, reviewed override/FREE waiver, separate school-approved onboarding payment, protected callback and checklist activation. Deployment/payment-provider verification remains required.
3. Public asset operations are implemented: Founder-only sanitised/versioned logo and media upload, preview, activation/rollback, audit, friendly social/FAQ/media editors and public rendering. Deployment verification remains required.
4. CBC leadership: verify and, only where absent, connect completeness/readiness, report review governance, human-reviewed appraisal evidence and secure family report access.
5. WWDC26 refinement: use existing reversible appearance controls for navigation/contextual controls and selected surfaces; do not blanket-convert dense content to glass.

The authoritative work queue is `docs/IMPLEMENTATION-QUEUE-FROM-FOUNDER-RESEARCH-2026-07-21.md`.
