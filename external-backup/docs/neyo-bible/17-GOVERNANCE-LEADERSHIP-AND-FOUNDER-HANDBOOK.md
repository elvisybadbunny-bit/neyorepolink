# NEYO Bible — Level 17: Governance, Leadership & Founder Handbook

*Created 2026-07-18 from the founder-role model, Founder Ops services/models, Level 05 decisions,
Level 16 governance framework, deployment/security controls, and the founder-requested governance
library. This is an internal operating constitution. Formal corporate resolutions and legal
instruments require qualified Kenyan legal/company-secretarial review.*

## 1. Founder handbook: role and duty

The Founder protects NEYO's mission, customer trust, product quality, financial survival, and
institutional continuity. Founder authority is broad but not permission to bypass tenant privacy,
rewrite settled financial evidence, ignore security controls, or represent unverified work as done.

Daily founder responsibilities:

- review production, security, support, revenue, and school-health exceptions;
- assign owners/dates to urgent work;
- protect company credentials and access;
- make product decisions against the Checklist and customer evidence;
- ensure stable work is committed/pushed/documented;
- separate school operations from NEYO company operations;
- record decisions, metrics, interviews, contracts, and incidents in their proper systems.

## 2. Company constitution

### Mission

Build dependable, Kenya-first operational software that helps schools teach, administer, collect,
communicate, and comply without forcing them into generic foreign workflows.

### Non-negotiable principles

1. **Truth over appearance:** real full-stack workflows, no fake completion.
2. **School data belongs within its lawful school context:** tenant isolation and least privilege.
3. **Kenya first:** KES, +254, M-Pesa, Kenyan curricula, 360px/slow-network realities.
4. **Human responsibility:** engines recommend/accelerate; authorized people decide sensitive work.
5. **Bundi rule:** school product copy uses Bundi; core operations never depend on it.
6. **One operational truth:** connected records, not duplicate departmental ledgers.
7. **Evidence:** tests, migrations, audit logs, signed contracts, reconciled payments, and current
   documentation.
8. **Continuity:** the company must survive lost chats, failed infrastructure, and founder absence.
9. **Respect and safety:** protect children, families, staff, and confidential records.
10. **No silent policy change:** durable direction changes enter the Decision Log.

### Reserved founder matters

- company mission and product constitution;
- pricing engine policy and material pricing decreases;
- platform-wide release/kill switches;
- company-role appointment/removal;
- material contracts, financing, equity, IP, litigation and regulatory response;
- production incident severity/notification decisions;
- annual strategy and budget approval (subject to board/shareholder law).

## 3. Decision-making framework

Classify decisions:

| Type | Example | Required method |
|---|---|---|
| Reversible operational | reorder a support queue | owner decides, records action |
| Reversible product | pilot a released feature with one school | preview, flag, measure, reverse path |
| Hard-to-reverse technical | destructive migration/provider lock-in | design review, backup, staged rollout |
| Financial | pricing decrease, major spend | evidence, authority threshold, ledger record |
| Security/privacy | breach notification, sensitive transfer | incident/DPO/legal process |
| Strategic | target segment, funding, major partnership | founder/board decision with written rationale |

Decision record:

1. problem and deadline;
2. facts and unknowns;
3. affected customers/data/cash;
4. options, risks, reversible path;
5. recommendation and dissent;
6. authorized decision maker;
7. decision/date;
8. implementation owner/date;
9. success measure/review date;
10. Level 05 entry when durable.

Use “disagree and commit” only after security/legal objections are resolved; it cannot override law
or conceal material risk.

## 4. Delegation matrix

This matrix describes intended internal authority and must be reconciled with actual company-role
permissions and formal board/bank mandates.

| Action | NEYO Support | NEYO Ops | Founder | Board/external authority |
|---|---:|---:|---:|---:|
| Respond to customer thread | Yes | Yes | Yes | — |
| Send approved formal quote | Yes | Yes | Yes | — |
| Mark onboarding assistance complete | Yes | Yes | Yes | — |
| Update custom-feature request status | Yes | Yes | Yes | — |
| Short-lived read-only diagnostic replay | No unless granted | Yes | Yes | — |
| Schedule maintenance | No | Yes | Yes | — |
| Manage pilot whitelist | No | Yes if permissioned | Yes | — |
| Pause platform feature globally | No | Restricted | Yes | — |
| Edit OCR/trial operational limits | No | Restricted | Yes | — |
| Change pricing coefficients/catalog | No | Restricted delegation | Yes | Board if material policy requires |
| Apply discretionary price decrease | No | Only delegated | Yes | — |
| Resolve compliance request | No | Authorized Ops | Yes | DPO/legal where required |
| Rotate company master secrets | No | Named technical custodian | Yes/dual control | Provider/account owner |
| Production deploy | No | Authorized engineer | Yes/authorized engineer | — |
| Destructive production migration | No | Technical proposal | Approval | Backup/change authority |
| Sign ordinary approved customer contract | No | Prepared by Ops | Authorized signatory | Legal review/template authority |
| Material partnership/MoU | No | Due diligence support | Recommend/sign if mandated | Board/legal as required |
| Hire/terminate employee | No | HR process | Authorized executive | Board where required |
| Equity/funding/cap-table change | No | No | Propose | Board/shareholders/legal |
| Public breach/regulatory notification | No | Incident evidence | Executive approval | DPO/legal/ODPC process |

System permissions remain the technical enforcement. A spreadsheet delegation cannot grant access
the application denies; application access cannot create legal signing authority by itself.

## 5. Board meeting minutes template

**Status:** Template only; not a claim that formal minutes exist.

- Company/legal name, registration number, meeting type.
- Date, time, place/virtual link.
- Chair, secretary, attendees, apologies, quorum confirmation.
- Conflicts of interest declared and handling.
- Prior minutes approval and matters arising.
- CEO/founder report.
- Financial report and cash/runway.
- Product/customer/security/compliance report.
- Resolutions: exact wording, proposer/seconder where required, vote, abstentions.
- Actions: owner, due date, status.
- Reserved/confidential appendix.
- Next meeting.
- Chair/secretary signatures and date.

Index the summary in `NeyoFounderOpsEntry(kind="BOARD_MEETING")`; retain signed legal minutes in a
secure corporate repository.

## 6. Annual strategy document template

1. Mission and three-year direction.
2. Prior-year actuals: product, customer, financial, people, security.
3. Market/competitor evidence.
4. Target school segments and excluded distractions.
5. Annual objectives and measurable key results.
6. Product roadmap themes tied to Features Checklist.
7. Customer success and partnership plan.
8. Pricing, revenue, budget, cash and funding scenarios.
9. Infrastructure/security/compliance plan.
10. Team/capability plan.
11. Risks, assumptions and stop-doing list.
12. Quarterly milestones, owners and review cadence.
13. Board approval/date/version.

`NeyoFounderOpsEntry(kind="ANNUAL_PLANNING")` records the operating summary; detailed financial and
legal schedules remain in controlled source systems.

## 7. Business continuity plan

Priority services:

1. tenant authentication and isolation;
2. school records/read access;
3. payments and callback reconciliation;
4. attendance/communication safety workflows;
5. database/file backups;
6. support and incident communication;
7. deployment/worker/provider recovery.

Continuity roles:

- Incident Commander: Founder or designated alternate.
- Technical Lead: authorized deployment/database custodian.
- Security/DPO lead: privacy assessment/notification.
- Customer Communications: Support lead.
- Finance/Reconciliation: revenue owner.
- Recorder: timeline/actions/evidence.

Continuity pack references Level 14 DR, Level 08 incident response, provider account ownership,
current emergency contacts, last backup/restore drill, and communication templates. It must be
available securely if the main app/database is unavailable.

## 8. Succession plan

### Temporary founder incapacity

- named acting executive and limits;
- emergency access through secure dual-control recovery;
- no automatic equity/legal authority beyond formal mandates;
- daily critical-service review;
- board/stakeholder notification threshold;
- decisions deferred versus permitted.

### Permanent transition

- board/shareholder process;
- transfer of domain, GitHub, Vercel, database, R2, payment, bank, legal and regulatory ownership;
- IP, contracts and staff obligations;
- customer continuity communication;
- revocation of old access;
- signed handover and risk register.

Test continuity annually. Do not put recovery secrets directly in repository docs.

## 9. Leadership cadence

### Daily

Health, incidents, payments, customer escalations, blocked onboarding, deployments, urgent decisions.

### Weekly

Metrics, pipeline, school health, support aging, product quality, cash, compliance, action review.

### Monthly

All-hands, management accounts, roadmap, hiring/access, customer insights, risk movement.

### Quarterly

Board/self-audit, restore drill, access review, pricing/unit economics, strategy progress.

### Annual

Strategy, budget, impact, succession/continuity, contracts/insurance/compliance calendar.

## 10. Founder personal knowledge base

Maintain distinct, dated collections:

- **Decision Log:** Level 05.
- **Lessons Learned:** incident/build/customer lessons with evidence and future rule.
- **Meeting Notes:** attendees, context, decisions, actions; confidential classification.
- **Research Notes:** source, date, reliability, implication; not product fact until validated.
- **School Visit Reports:** consent, observed workflow, pain, quotes, follow-up.
- **Customer Feedback Log:** linked to customer thread/interview and feature request.
- **Competitor Analysis:** public evidence, date, no unlawful access or unsupported claims.
- **Future Ideas Backlog:** `NeyoIdea`/Checklist draft; not promised scope.
- **Vision Journal:** strategic thinking clearly labeled personal/draft.
- **Quarterly Reflection:** outcomes, mistakes, changed assumptions, next experiments.

## 11. Governance document register

For each constitution, strategy, policy, minutes, contract or continuity document record owner,
version, approval authority/date, effective date, next review, classification, evidence location,
and superseded version. A markdown draft is not “approved” until the required authority acts.

## 12. Conflict of interest and ethics

Company leaders disclose personal/financial relationships affecting vendor, school, hiring,
partnership or investment decisions. Record mitigation/recusal. Never use school data for personal
benefit, competitor surveillance, or unapproved model training.

## 13. Maintenance rule

Update authority when roles or legal mandates change. Reconcile this handbook with application
permissions, bank mandates, board resolutions, employment terms and Kenyan law. Preserve signed
history; do not silently edit approved minutes/contracts.
