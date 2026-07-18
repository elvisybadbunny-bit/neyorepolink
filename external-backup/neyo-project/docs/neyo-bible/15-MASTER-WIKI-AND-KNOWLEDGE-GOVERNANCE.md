# NEYO Bible — Level 15: Master Wiki & Knowledge Governance

*Created 2026-07-18 to make the genuine NEYO Bible maintainable. This level defines ownership,
source precedence, document lifecycle, review, search, synchronization, and archival rules. It does
not duplicate the content of Levels 01–14.*

## 1. Purpose

NEYO must remain operable when a chat ends, a developer changes, or the founder cannot remember a
past implementation detail. Institutional knowledge must answer:

- What is true now?
- Why was that decision made?
- Where is it implemented?
- How is it operated/tested/recovered?
- Who owns updating it?
- What remains incomplete or externally pending?

## 2. Knowledge hierarchy

| Need | Canonical source |
|---|---|
| Feature scope/status | `docs/FEATURES-CHECKLIST.md` |
| Current continuation/history | `docs/CONTEXT-ANCHOR.md` |
| Product/engineering constitution | three prompt files under `external-backup/uploads/` |
| Human institutional orientation | `docs/neyo-bible/` |
| Executable database truth | `prisma/schema.prisma` + tracked migrations |
| Business behavior | `src/lib/services/` |
| API contract implementation | `src/app/api/**/route.ts` + Zod validation |
| UI reachability | `src/app/` pages + `src/components/` consumers |
| Verification evidence | executed `scripts/*-test.ts`, build/HTTP/browser results |
| Deployment procedure | Level 14 + `docs/DEPLOY.md`/Go-Live Checklist |
| Durable founder changes | Level 05 Decision Log |

No one document replaces the others. The Bible explains; code executes; checklist governs scope;
anchor preserves continuity.

## 3. Bible map and ownership

- **00 Index:** navigation and honest built/planned status.
- **01 Foundation:** current company/product identity.
- **02 Engineering:** architecture and core mechanisms.
- **03 Product Surface:** module/page map.
- **04 Operations:** company operational console/SOPs.
- **05 Decisions:** durable founder directives and supersession.
- **06 School Playbook:** role workflows and hand-offs.
- **07 Customer Lifecycle:** quote to offboarding.
- **08 Security/Compliance:** controls, incidents, open obligations.
- **09 Revenue:** NEYO pricing/billing operations.
- **10 Delivery:** feature build/audit protocol.
- **11 Data:** domain model map.
- **12 Integrations:** providers, jobs, storage, observability.
- **13 Bundi:** intelligent workflow safety and quota.
- **14 Deployment/DR:** environment, release, rollback, restore.
- **15 Knowledge Governance:** this maintenance layer.
- **16 Founder/Corporate Governance:** company rhythm, metrics, contracts, investor evidence.

Primary owner is NEYO Founder; technical custodians update implementation-grounded levels; domain
owners validate operational/legal/financial meaning. Ownership does not permit unsupported claims.

## 4. Document status vocabulary

Every substantial document should make its status clear:

- **Current:** reflects verified present behavior.
- **Historical:** useful chronology, not current instructions.
- **Draft:** proposal, not approved/implemented.
- **Operational pending:** code exists but external action/credential/hardware remains.
- **Superseded:** retained for history and points to replacement.
- **Archived:** no longer active; read-only historical evidence.

Avoid “done” where only writing exists.

## 5. Source citation standard

A Bible claim cites the narrowest useful evidence:

- file path and function/model/route;
- migration name for schema history;
- test script and actual pass result/date when claiming verification;
- anchor part/date for historical founder instructions;
- external authority and review date for legal/regulatory facts.

Line numbers are fragile and optional; never fabricate them. Do not cite a 1,000-line service as
proof without naming the relevant function.

## 6. Writing standard

- Correct current sentences in place rather than stacking contradictory update paragraphs.
- Put chronology in Context Anchor/Decision Log, not every reference page.
- Separate current behavior, historical note, and pending work.
- Use exact product terminology and paths.
- Avoid repeated boilerplate and arbitrary line-count goals.
- Explain boundaries and failure behavior, not only happy-path capability.
- Never expose credentials, real private data, or unnecessary personal information.
- Follow the Bundi Rule for product copy examples.

## 7. Change triggers

Update documentation when:

- a feature is added/removed/renamed;
- pricing/role/release/tenant policy changes;
- a model/service/route moves;
- a provider becomes live or is removed;
- a security incident changes controls;
- deployment topology/commands change;
- a checklist claim is disproven by audit;
- a new durable founder decision supersedes an old one;
- tests reveal old counts or workflows are stale.

A code commit that changes these without docs is incomplete under the project protocol.

## 8. Review cadence

### Every feature/change

Update relevant checklist, anchor, Bible level, tests, and edit points.

### Weekly

- broken links/file references;
- unresolved anchor carry-forward items;
- open security/compliance/activation actions;
- new founder decisions not yet logged;
- docs changed in one mirror only.

### Monthly

- inventory counts in architecture/data docs;
- roles/permissions and founder tabs;
- pricing/current package terminology;
- integration activation state;
- deployment commands/environment names;
- external regulatory facts and review date.

### Quarterly

Run a restoration exercise: a new engineer/agent reads index and attempts setup, one feature trace,
one support workflow, and one rollback simulation without relying on chat memory.

## 9. Synchronization

Repository canonical files live under `docs/`. Mirrors currently exist under:

- `external-backup/docs/neyo-bible/`;
- `external-backup/neyo-project/docs/neyo-bible/`;
- Context Anchor also has an upload mirror.

After edits:

1. copy canonical file to tracked mirrors;
2. compare bytes (`cmp`/hash);
3. run `git diff --check`;
4. inspect `git status` for accidental omissions;
5. commit/push the coherent doc unit.

A mirror is backup/convenience, not an independently edited source.

## 10. Search and discoverability

- Use descriptive filenames and one stable heading per concept.
- Index every built level in `00-INDEX.md`.
- Link to the canonical level instead of duplicating long sections.
- Preserve exact feature ids (A.1, G.23, EE.8) where useful for checklist search.
- Preserve function/model names in code font for repository search.
- Add “maintenance rule” to each level to direct future edits.

## 11. Decision handling

When direction changes:

1. Add new dated Level 05 decision.
2. Mark old decision superseded and link new id.
3. Update current-state levels immediately.
4. Update product copy/code/tests/checklist.
5. Preserve migration/commit history; do not pretend the old direction never existed.

Example: named school packages were superseded by the dual pricing models. Level 01/09 describe
current behavior; Level 05 explains the change.

## 12. Audit handling

When documentation overstates implementation:

- do not delete the evidence quietly;
- reproduce and classify gap;
- repair code or downgrade status;
- test the real chain;
- update checklist and anchor;
- update Bible current state;
- commit/push immediately.

When a test is stale rather than product behavior, fix the test and document why; never alter the
product merely to satisfy an outdated assertion.

## 13. Sensitive knowledge

The knowledge base may document secret *names, owners, locations, rotation and activation steps*.
It must never include secret values, OTPs, private keys, production database URLs, recovery codes,
or unmasked personal data. Credential inventories belong in secure external password/secret
management plus the encrypted NEYO vault.

## 14. External evidence register

For obligations outside code, record:

- action/authority;
- owner;
- requested/completed date;
- evidence location (not secret content);
- renewal/expiry;
- status.

Examples: ODPC registration, pen-test report, domain ownership, provider production approval,
insurance, signed contracts, backup restore drill. A checklist sentence is not the evidence itself.

## 15. New-chat/save-game protocol

A continuation should read, in order:

1. prompts 1–3;
2. latest Context Anchor entries;
3. Features Checklist relevant section;
4. Bible index and relevant level;
5. current code/tests/git status.

The next agent summarizes understanding before changing code and independently verifies important
completion claims.

## 16. Archival rules

Archive when a document is fully superseded and keeping it current would confuse operations.
Retain it in a clearly historical location with replacement link. Never delete incident, legal,
migration, decision, or audit history merely to reduce clutter. Remove fabricated/padded material
because it is not evidence; document why it was removed.

## 17. Quality test for a Bible level

A level passes when:

- scope is distinct;
- current claims map to real sources;
- incomplete/external work is explicit;
- no filler/repeated padding;
- no secret/personal data;
- boundaries and failure paths included;
- index and mirrors updated;
- a new reader can perform or trace the described responsibility.

## 18. Maintenance rule

This level changes when the knowledge system itself changes. It should remain short enough to act as
governance, while detailed subject matter stays in its owning level.
