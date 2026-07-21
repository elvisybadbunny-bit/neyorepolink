# Implementation queue from founder research

Founder decisions recorded 21 July 2026:

- Onboarding fee: calculate from school size/data preparation effort, then show the reviewed KES amount before payment.
- Offline: build the remaining safe workflows progressively and keep an explicit matrix; never pretend every action is safe offline.
- Contextual video guidance: provide both a permanent Help action and one dismissible Dynamic Island suggestion per published guide version.

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

- [ ] Add an in-app Offline Capabilities screen generated from the matrix.
- [x] CBE assessment observation outbox with tenant-scoped at-most-once idempotency.
- [x] Teacher record-of-work/coverage outbox with tenant-scoped at-most-once idempotency.
- [x] CBE Delivery session/evidence/support creation outbox with source revalidation and at-most-once replay.
- [x] Add a visible failed-sync review inbox for queued records rejected because their source changed.
- [x] Expand read-only snapshots with merged role-permission filtering and CBE Delivery sessions.
- [ ] Add stale-data timestamps and explicit offline/online-required labels to every supported module.
- [ ] Browser test each action offline → reconnect → exactly-once server result.

### B. Contextual guided help

- [ ] `GuidedHelpVideo` schema and migration.
- [ ] Founder review/publish/version controls.
- [ ] Route + action + role + language mapping.
- [ ] Permanent Help action.
- [ ] One dismissible Dynamic Island offer per published version.
- [ ] Movable PIP player, captions, transcript and slow-network fallback.
- [ ] Never autoplay sound or require a video to finish a workflow.

### C. School-size onboarding fee

- [ ] Founder defines formula inputs and included work.
- [ ] Build quote calculation with Founder review/override.
- [ ] Separate onboarding invoice/payment purpose and audit trail.
- [ ] School approval before M-Pesa initiation.
- [ ] Verified callback and onboarding-checklist activation.
- [ ] Waiver/campaign support without stacking or hidden charges.

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
