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

- [ ] Founder-only public logo upload with sanitisation, versioning, preview, rollback and audit.
- [ ] Friendly social-link editor (storage already exists; footer rendering is complete).
- [ ] Friendly FAQ editor with visible structured-data parity.
- [ ] Editable approved screenshots and media without exposing private storage.

### E. CBC leadership workflow audit

- [ ] One leadership view for attendance completion, syllabus coverage, assessment completeness and report readiness.
- [ ] Confirm whether existing report governance fully supports draft → review → return → approve → publish before adding schema.
- [ ] Connect delivery/assessment evidence to human-reviewed appraisal without automated teacher judgement.
- [ ] Verify secure parent report sharing and access audit.

Every unchecked item requires code, permissions, failure handling, mobile/browser testing and documentation. It must not be called complete merely because a card or button exists.
