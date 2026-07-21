# NEYO Bible — Level 05: Founder Decision Log

*Created 2026-07-18 from founder directives preserved in `docs/CONTEXT-ANCHOR.md`, the three
operating prompts in `external-backup/uploads/`, and the implementation evidence named below.
This is a decision log, not a feature-completion ledger. `docs/FEATURES-CHECKLIST.md` remains the
source of truth for feature status.*

## How to use this log

A decision belongs here when it changes product direction, engineering policy, naming, pricing,
security posture, or the way future work must be performed. Each entry records:

- **Decision** — what must remain true.
- **Reason/context** — why the choice was made.
- **Implementation consequence** — where the decision affects the real product.
- **Evidence** — the source files or dated anchor entry that preserve it.

Do not silently rewrite an old decision when direction changes. Mark it **Superseded**, name the
new entry, and update the current-state documents. This preserves why old code or terminology may
still exist without presenting it as current policy.

---

## FD-001 — The Master Features Checklist controls product scope

**Date:** 2026-06 onward (standing rule)
**Status:** Active

**Decision:** `docs/FEATURES-CHECKLIST.md` is the only feature source of truth. Do not invent or
build off-list features. A checkbox becomes `[x]` only after the relevant database, validation,
service, API, reachable UI, UX states, seed data, permissions, and tests genuinely exist.

**Reason/context:** The founder is building a large platform across many sessions and needs one
stable definition of scope and completion. Prose, screenshots, and commit messages are not enough
to establish that a workflow is complete.

**Implementation consequence:** Every feature audit traces the real path from schema to a page a
user can reach. The 2026-07-18 audit found multiple services and APIs whose checklist descriptions
claimed visible functionality even though no UI consumed them; those claims were repaired rather
than accepted.

**Evidence:** `PROMPT-1-SYSTEM-IDENTITY.md`; `PROMPT-3-DESIGN-CONTINUITY.md` §Source of Truth;
`FEATURES-CHECKLIST.md` opening completion rule; `CONTEXT-ANCHOR.md` parts 24–26.

## FD-002 — Full-stack means real data, never a decorative mock

**Date:** 2026-06 onward (standing rule)
**Status:** Active

**Decision:** No placeholder backend, fake authentication, hard-coded demo response, or UI-only
feature may be presented as shipped. Business workflows use real Prisma records from their first
implementation.

**Reason/context:** A school must be able to perform the workflow, not merely view a design.

**Implementation consequence:** The normal build order is database/migration, validation and
permissions, service, API, UI, page integration, four UX states, and realistic Kenyan seed data.
When an existing database layer already exists, an audit may reuse it, but it must still prove the
remaining layers and real create/read or state-transition behavior.

**Evidence:** `PROMPT-2-EXECUTION-PROTOCOL.md`; the real regression-script convention documented in
`02-ENGINEERING-ARCHITECTURE.md` §7.

## FD-003 — Liquid Glass is the platform default, controlled only by NEYO

**Date:** 2026-06-13
**Status:** Active

**Decision:** Liquid Glass is the default visual system in both light and dark appearances. The
liquidity level is a company-level setting; individual schools cannot redesign the system shell.
Printing and generated documents are always plain, high-contrast, and non-glass.

**Reason/context:** The founder approved one coherent product identity rather than tenant-by-tenant
interface fragmentation. Printed school records need reliability and legibility over screen
styling.

**Implementation consequence:** New surfaces must work in glass-light and glass-dark, preserve the
navy/green/warm-white palette, give the sidebar its own frosted pane, and provide reduced-motion and
reduced-transparency fallbacks. PDFs and print CSS must not carry translucency.

**Evidence:** `PROMPT-1-SYSTEM-IDENTITY.md` §Liquid Glass; `PROMPT-3-DESIGN-CONTINUITY.md` §Complete
Visual Styling; `src/app/globals.css`; `src/lib/services/platform-appearance.service.ts`.

## FD-004 — The Bundi Rule governs intelligent product copy

**Date:** 2026-06-13
**Status:** Active

**Decision:** School-facing product copy calls the helper **Bundi**, never “AI,” and never exposes
third-party model or OCR vendor names. Bundi is additive convenience only: no core school workflow
may depend on it.

**Reason/context:** The founder chose a safe, recognizable product helper instead of technical or
vendor-centric language, while requiring the School OS to remain operational if that layer is
paused or unavailable.

**Implementation consequence:** Bundi is controlled by platform release flags. Rule-based engines
must remain complete. Scan/import surfaces use names such as “Bundi OCR” and provide human review
for uncertain results. Copy changes must be checked for forbidden terminology before release.

**Evidence:** `PROMPT-1-SYSTEM-IDENTITY.md` §The Bundi Rule; `PROMPT-3-DESIGN-CONTINUITY.md`;
`FEATURES-CHECKLIST.md` B.23; scan components named in `01-COMPANY-AND-PRODUCT-FOUNDATION.md` §6.

## FD-005 — Kenya-first behavior is not optional localization

**Date:** Project foundation
**Status:** Active

**Decision:** NEYO is designed around Kenyan schools: KES, +254 telephone numbers, M-Pesa Daraja,
CBC/CBE and 8-4-4 structures, Kenyan seed identities, slow 3G, and 360px screens.

**Reason/context:** Generic global-SaaS defaults create operational mistakes in fees, identity,
curriculum, and parent communication.

**Implementation consequence:** New money fields and documents use KES; phone validation
normalizes Kenyan numbers; seed/test records use Kenyan names and institutions; mobile loading and
error behavior are mandatory; school workflows must reflect actual Kenyan education structures.

**Evidence:** `PROMPT-1-SYSTEM-IDENTITY.md` §Kenyan Context;
`01-COMPANY-AND-PRODUCT-FOUNDATION.md` §§1,8.

## FD-006 — School pricing uses two live models, not named packages

**Date:** 2026-07-17 to 2026-07-18
**Status:** Active; supersedes the former Free Karibu/Msingi/Pro/Elite school-facing plan model

**Decision:** The school-facing choice is between **Capacity Complete** (`SIZE_BASED_V2`) and
**Modular User & Module** (`MODULAR_USERS_V1`). Retired package names must not return as selectable
school plans.

**Reason/context:** The founder moved from package labels to pricing based on a school’s real size
or its active users and modules. A stale plan picker later contradicted this direction and was
removed.

**Implementation consequence:** `/settings/billing` exposes the Dual Pricing Model Selector.
Capacity Complete unlocks all operational modules and derives a quote from size; Modular pricing
uses active users and enabled modules, including the midpoint proration rule. New schools receive a
30-day trial before paid activation. Suspension preserves school records.

**Evidence:** `CONTEXT-ANCHOR.md` parts 25–26 and the 2026-07-18 pricing incident;
`FEATURES-CHECKLIST.md` G.23/V.3; `src/lib/services/pricing-engine.service.ts`;
`src/lib/services/billing.service.ts`; `01-COMPANY-AND-PRODUCT-FOUNDATION.md` §5.

## FD-007 — Schools choose; timetable engines advise rather than hard-code policy

**Date:** 2026-07-12 to 2026-07-14
**Status:** Active

**Decision:** Timetable, teacher-allocation, electives, venue, lunch, and exam-sitting behavior must
be derived from each school’s real configuration. The system may recommend a safe arrangement, but
the school retains explicit override choices where educational policy differs.

**Reason/context:** Kenyan schools differ in staffing, subject combinations, class-teacher usage,
lunch shifts, venue capacity, and whether technically combinable elective exams should be split.
The founder repeatedly rejected hard-coded assumptions.

**Implementation consequence:** Examples include per-block `preferSplitExamSittings`, flexible
`lunchAfterPeriod`, school-selected class teachers, teacher eligibility from real subject links,
per-class/subject lab controls, and explicit capacity-overflow decisions. Overrides are persisted
and auditable, not hidden client-side preferences.

**Evidence:** `CONTEXT-ANCHOR.md` parts 14–19; `FEATURES-CHECKLIST.md` AA.8–AA.10, BB.3, CC.1;
`docs/TEACHER-ALLOCATION-AND-ELECTIVES-ENGINE-DESIGN.md`.

## FD-008 — Chargeable student services feed the student invoice

**Date:** 2026-06-12
**Status:** Active

**Decision:** Chargeable school services do not maintain disconnected payment balances. Boarding,
transport, cafeteria/store sales, library fines, uniforms, damages, trips, and future chargeable
student services post to the real B.7 invoice ledger.

**Reason/context:** Families and bursars need one authoritative balance and one set of payment rails,
not independent module balances that can disagree.

**Implementation consequence:** New chargeable workflows must create or update real invoice data
and therefore inherit M-Pesa STK, payment reconciliation, receipts, discounts, reminders, and parent
portal visibility.

**Evidence:** `FEATURES-CHECKLIST.md` B.18 standing rule and connected B.16–B.25 entries;
`CONTEXT-ANCHOR.md` historical B-module entries.

## FD-009 — Parents and students share the family portal

**Date:** 2026-06-12
**Status:** Active

**Decision:** Parents and students use the shared `/portal` experience instead of requiring a
separate student application.

**Reason/context:** Many students do not have their own phones; a family may share one device.

**Implementation consequence:** `PARENT` and `STUDENT` receive appropriately scoped portal access.
A student sees only the linked student record; a guardian sees only linked children. Homework,
results, fees, notes, timetable, health, and other child data remain server-side row-scoped.

**Evidence:** `FEATURES-CHECKLIST.md` B.10–B.11; `CONTEXT-ANCHOR.md` B.11 entry;
`src/lib/services/parent-portal.service.ts`.

## FD-010 — NEYO company roles are separate from school roles

**Date:** 2026-07-09
**Status:** Active

**Decision:** Company operations use `FOUNDER`, `NEYO_OPS`, and `NEYO_SUPPORT` with distinct reach;
`SUPER_ADMIN` remains only as a legacy equivalent of `FOUNDER`. School leadership roles cannot
enter NEYO’s company console, and support staff do not automatically receive pricing or platform
control.

**Reason/context:** A single all-powerful internal role did not represent real operational duties or
least privilege.

**Implementation consequence:** Founder/Ops routes use explicit company-role guards. The narrower
support console is separate from `/founder`. Any new internal tool must declare which company role
needs it rather than defaulting to unrestricted access.

**Evidence:** source comment in `src/lib/core/roles.ts`; `01-COMPANY-AND-PRODUCT-FOUNDATION.md` §3;
`03-PRODUCT-SURFACE-MAP.md` §7.

## FD-011 — Tenant isolation is a release-blocking security control

**Date:** Project foundation; reinforced 2026-07-12 and 2026-07-18
**Status:** Active

**Decision:** Every tenant-owned model is registered in `TENANT_OWNED_MODELS`, every tenant workflow
runs in tenant context, and cross-tenant access is tested. Permissions must be awaited and enforced
server-side; UI hiding is never authorization.

**Reason/context:** Real audits found unregistered tenant models and un-awaited permission checks
that permitted cross-school or unauthorized access. These were genuine security defects, not code
style issues.

**Implementation consequence:** Any migration introducing `tenantId` must update the registry in
the same stable unit. New endpoints require negative-role and cross-tenant tests. Parent-owned
identifiers are derived from the authenticated session rather than trusted from request bodies.

**Evidence:** `CONTEXT-ANCHOR.md` parts 24–25 and Y.3 history; `src/lib/core/tenant-tables.ts`;
`src/lib/core/tenant-db.ts`; `02-ENGINEERING-ARCHITECTURE.md` §2.

## FD-012 — A scan or automatic decision always has an honest review path

**Date:** 2026-07-16 onward
**Status:** Active

**Decision:** OCR and automated matching may accelerate work, but uncertain marks, questions,
identities, and financial matches are surfaced for human confirmation instead of being silently
written as fact.

**Reason/context:** Handwriting, photographs, and fuzzy identity/payment matches can be ambiguous.
Operational speed must not corrupt academic or financial records.

**Implementation consequence:** The mark-sheet engine distinguishes unchanged, changed, new, and
uncertain rows; exam/question extraction permits editing before save; suspense-ledger matching
shows a score and requires allocation confirmation. Confirmed writes are transactional and audited.

**Evidence:** `FEATURES-CHECKLIST.md` EE.4, EE.5, EE.8 and G.23 Idea 1.1;
`src/lib/services/mark-sheet.service.ts`; `src/lib/services/exam-paper-scan.service.ts`.

## FD-013 — Printed timetable details remain readable, with separate reference prints

**Date:** 2026-07-12 to 2026-07-17
**Status:** Active

**Decision:** The main timetable print must not be overcrowded with every options-block teacher,
venue, and student-combination detail. Those details belong in separate venue/teacher and
subject-combination roster prints.

**Reason/context:** The founder explicitly chose separate supporting prints over a dense timetable
cell that becomes unreadable on paper.

**Implementation consequence:** `/print/timetable` remains the daily schedule. Dedicated elective
roster print services and `/print/electives-roster` explain parallel subject teachers, venues, and
student combinations. Break/lunch cells and double lessons may merge for clarity, while printed
output remains high contrast.

**Evidence:** `FEATURES-CHECKLIST.md` BB.7 and Z.3; `CONTEXT-ANCHOR.md` parts 13 and 22;
`src/components/academics/electives-roster-print-view.tsx`;
`src/components/academics/print-timetable-page.tsx`.

## FD-014 — The NEYO Bible must be evidence, not volume

**Date:** 2026-07-18
**Status:** Active

**Decision:** Institutional documentation is built one grounded level at a time. Repeated filler,
fabricated citations, line-count targets, and claims copied from summaries without source
inspection are forbidden.

**Reason/context:** A previous 21-file Bible repeated the same paragraph 25 times per file and used
fabricated source references. The founder chose deletion and a genuine rebuild.

**Implementation consequence:** Every Bible level names its sources, distinguishes current behavior
from historical decisions, and is edited when facts become stale. The index shows only levels that
actually exist; planned levels are not represented as completed.

**Evidence:** `CONTEXT-ANCHOR.md` part 24; commit history described there (`95481a9` deletion);
`docs/neyo-bible/00-INDEX.md` ground rules.

## FD-015 — Stable work is committed and pushed immediately

**Date:** Reinforced 2026-07-18
**Status:** Active operating policy

**Decision:** Once one coherent unit is verified, commit and push it before beginning another unit.
Do not hold multiple completed fixes uncommitted while doing screenshots or unrelated follow-up.

**Reason/context:** Repeated sandbox wipes destroyed uncommitted work, forcing complete rebuilds and
costing time. Work already pushed survived every wipe.

**Implementation consequence:** Migrations, code, test fixes, UI wiring, documentation, and
screenshots may be separate commits when that keeps each stable unit protected. A successful local
test is not considered durable preservation.

**Evidence:** `CONTEXT-ANCHOR.md` parts 14–26; `04-OPERATIONS-AND-SOPS.md` §3.

## FD-016 — Audit the implementation, not the completion claim

**Date:** 2026-07-01; reinforced 2026-07-18
**Status:** Active operating policy

**Decision:** A green checkbox, zero-error cached typecheck, old screenshot, or confident commit
message is not sufficient proof. Re-audits inspect and execute the current implementation.

**Reason/context:** Committed `.tsbuildinfo` files once hid 224 real TypeScript errors. Later audits
found working services and APIs with no reachable UI, stale test assertions, and incorrect question
counts.

**Implementation consequence:** Remove/ignore incremental caches before a trust-building typecheck;
trace schema → service → route → consuming UI; run the named regression suite; verify negative
permissions and tenant isolation; distinguish a product defect from a stale test defect.

**Evidence:** `FEATURES-CHECKLIST.md` opening 2026-07-01 audit warning;
`docs/I60B-TYPECHECK-CACHE-AUDIT-2026-07-01.md`; `CONTEXT-ANCHOR.md` parts 24–26.

---

## FD-016 — Offline support is progressive, local-first and evidence-labelled

**Date:** 2026-07-21
**Status:** Active

**Decision:** Use device IndexedDB and the existing bounded API paths instead of buying a separate
offline provider. Queue only mutations with an at-most-once server contract; retain permanent
rejections for user review; filter saved snapshots by merged role permissions. Treat the currently
listed workflows as code-complete while deployed browser/database exactly-once evidence remains
pending.

**Reason/context:** Kenyan schools may use small phones and unreliable connectivity, but stale
permissions, duplicate money and conflicting publication actions are more harmful than an honest
online-required label.

**Implementation consequence:** `neyo-offline` schema version 3 contains `outbox`, `bundleCache`
and `failedOutbox`; Settings exposes the capability matrix; old snapshots are visibly labelled;
M-Pesa, identity, publication and sensitive settings remain online-only.

**Evidence:** `src/lib/offline/queue.ts`, `src/lib/offline/bundle-cache.ts`,
`src/app/(app)/settings/offline/page.tsx`, `docs/OFFLINE-SUPPORT-MATRIX-2026-07-21.md`.

---

## FD-017 — Guided help uses approved videos through Help and Dynamic Island

**Date:** 2026-07-21
**Status:** Active; implementation pending

**Decision:** A published contextual guide may be opened from a permanent Help action and offered
once per guide version through a dismissible Dynamic Island suggestion. It must remain optional,
role/route/version aware, captioned, dismissible and backed by a transcript/slow-network path.

**Implementation consequence:** Build governed video mapping and Founder review before PIP UI.
Candidate YouTube discovery never equals publication; videos never become required to finish work.

---

## FD-018 — Onboarding fee is a Founder-governed Pricing Engine result

**Date:** 2026-07-21
**Status:** Active; formula implementation pending

**Decision:** NEYO Ops controls which school-size, migration, configuration and support inputs are
operational. The Pricing Engine calculates from real school records or reviewed submissions, then
the Founder may review/override/waive it. A zero quote displays `FREE`. A demo request creates no
charge.

**Implementation consequence:** Keep onboarding purpose separate from subscription payments;
show scope and KES amount before school approval/M-Pesa initiation; audit formula version,
overrides and waivers.

---

## FD-019 — WWDC26-inspired refinement is reversible and readability-first

**Date:** 2026-07-21
**Status:** Active

**Decision:** Apply refined material primarily to navigation/contextual controls and selected
hero/dashboard surfaces. Control activation and intensity from NEYO Ops. Preserve the existing
NEYO design; solid forms, tables, print and contrast fallbacks remain authoritative.

**Reason/context:** Apple’s own refinement prioritised separation/readability. “Glass everywhere”
would repeat the public landing contrast failure and damage dense school work.

---

## Superseded decisions at a glance

| Previous direction | Current decision | Superseded by |
|---|---|---|
| Free Karibu / Msingi / Pro / Elite as school-selectable packages | Capacity Complete or Modular User & Module | FD-006 |
| One undifferentiated internal super-admin role | Founder, NEYO Ops, and NEYO Support separation | FD-010 |
| Rigid lunch-shift choices | Any real school-configured lunch period | FD-007 / CC.1 |
| Automatically combine every technically compatible elective exam | Combine by default, but permit a per-block school override | FD-007 / AA.10 |
| Put all elective details inside the timetable print | Keep separate venue/teacher and combination roster prints | FD-013 |
| Generate a large Bible in one pass | Build one source-grounded level at a time | FD-014 |

## Maintenance rule for future decisions

When the founder makes a new durable decision:

1. Record it here in the same session, with a date and active/superseded status.
2. Name the exact affected source files and checklist sections.
3. Update any older entry whose status changed.
4. Update the relevant current-state Bible level; this log alone must not leave another level stale.
5. Add implementation evidence only after it exists—do not turn an instruction into a false
   completion claim.
