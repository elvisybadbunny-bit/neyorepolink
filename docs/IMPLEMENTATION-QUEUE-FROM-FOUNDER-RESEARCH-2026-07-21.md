# Implementation queue from founder research

Founder decisions recorded 21 July 2026:

- Onboarding fee: NEYO Ops controls every formula input and active component. The Pricing Engine calculates from real school data/submissions, Founder reviews/overrides it, and a fully waived quote must display `FREE` rather than inventing a charge.
- Offline: build the remaining safe workflows progressively and keep an explicit matrix; never pretend every action is safe offline. Current implementation is code-complete for the listed workflows; deployed browser/database exactly-once verification remains explicit follow-up evidence.
- Contextual video guidance: provide both a permanent Help action and one dismissible Dynamic Island suggestion per published guide version.
- WWDC26 refinement: apply to navigation/contextual controls and selected dashboard/hero surfaces, controlled from NEYO Ops. Preserve the existing design and solid readable forms/tables; the control changes activation/intensity rather than deleting the current system.

## Completed

- [x] Default first-time NEYO appearance to light instead of device dark preference.
- [x] Remove public hero “Built for Kenyan school operations” pill.
- [x] Force public guided-demo dialog to a readable solid panel.
- [x] Repair Founder Credentials Vault settings request.
- [x] Render configured landing social links.
- [x] Present real landing screenshots in a responsive laptop frame.
- [x] Repair CBE Delivery API tenant context for reads and writes.
- [x] Move curated YouTube Learning Library from CBC popup to an inline Learning Videos screen.
- [x] Extend service-worker caching to previously loaded Next.js RSC page responses.
- [x] Document the current offline support/safety matrix.

## Next safe implementation phases

### A. Offline reliability

- [x] Add an in-app Offline Capabilities screen linked from Settings and Bundle Saver.
- [x] CBE assessment observation outbox with tenant-scoped at-most-once idempotency.
- [x] Teacher record-of-work/coverage outbox with tenant-scoped at-most-once idempotency.
- [x] CBE Delivery session/evidence/support creation outbox with source revalidation and at-most-once replay.
- [x] Add a visible failed-sync review inbox for queued records rejected because their source changed.
- [x] Expand read-only snapshots with merged role-permission filtering and CBE Delivery sessions.
- [~] Stale-data timestamp and 24-hour old-data warning completed on the offline viewer; module-level labels remain to be audited progressively.
- [~] Offline code contracts are complete for listed workflows; deployed browser → reconnect → exactly-once database evidence remains pending and must not be claimed.

### B. Contextual guided help

- [x] `GuidedHelpVideo` schema and migration.
- [x] Founder review/publish/version controls.
- [x] Route + optional action + role + language mapping.
- [x] Permanent screen-level Help action.
- [x] One dismissible Dynamic Island offer per published version.
- [x] Movable inline mini-player and transcript/slow-network fallback; YouTube supplies available captions.
- [x] No autoplay sound and no workflow requires a video.

### C. School-size onboarding fee

- [x] Founder-controlled formula factors/rates, minimum/maximum and operational toggles live in Pricing Engine.
- [x] Draft quote calculation uses real linked-school counts or reviewed submission inputs, with Founder review/override and audited FREE waiver.
- [x] Separate onboarding quote/payment purpose and history; it never masquerades as a subscription payment.
- [x] School approval is required before M-Pesa initiation.
- [x] Verified onboarding callback activates the role-owned onboarding checklist; PAID and FREE paths converge safely.
- [x] Founder FREE waiver is supported and onboarding never auto-stacks subscription campaigns/referrals/influencer discounts.

### D. Public asset and content operations

- [x] Founder-only public logo/media upload with SVG sanitisation, raster validation, versioning, preview, rollback and audit.
- [x] Friendly social-link editor with public footer rendering.
- [x] Friendly FAQ editor with public rendering and structured-data parity.
- [x] Editable approved screenshots/media gallery using hardened public asset URLs.

### E. CBC leadership workflow audit

- [x] One leadership view covers attendance completion, syllabus coverage, assessment activity, CBE delivery and report readiness.
- [x] Existing ExamReleaseApprovalRequest governance verified and surfaced: request → reject/return with note → approve → publish; no duplicate schema added.
- [x] Delivery/assessment/coverage evidence connects to the existing human appraisal screen without calculating an automated teacher score.
- [x] CBE parent reports remain authenticated and row-scoped to the guardian's child; every JSON/PDF access now creates an audit record.

Every unchecked item requires code, permissions, failure handling, mobile/browser testing and documentation. It must not be called complete merely because a card or button exists.

### F. WWDC26-inspired reversible refinement

- [x] Founder/Ops master Liquid Glass control preserved.
- [x] Independent navigation/contextual-control scope toggle.
- [x] Independent selected dashboard/hero-surface scope toggle.
- [x] Server-rendered scope attributes avoid deleting or rewriting the existing design.
- [x] Solid forms/cards fallback, contrast controls and plain print remain available.
- [x] Smart Timetable progressive loading prevents optional endpoint failure from blanking the entire screen.
- [~] Deployed visual review at 360px and representative modules remains evidence pending after Vercel rate-limit reset.
