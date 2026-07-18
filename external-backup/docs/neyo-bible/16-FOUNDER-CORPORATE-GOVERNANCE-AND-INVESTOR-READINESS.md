# NEYO Bible — Level 16: Founder, Corporate Governance & Investor Readiness

*Created 2026-07-18 from the real Founder Ops services/models, contracts, customer interviews,
metrics, build logs, compliance queue, pricing/revenue operations, and existing founder manuals.
This is an operating evidence framework—not legal, accounting, or investment advice.*

## 1. Founder operating principle

The company must run from recorded evidence rather than founder memory or chat history. `/founder`
is the company control plane; school modules remain separate. Founder work includes product/release,
customer, revenue, security/compliance, team/access, infrastructure, and strategic review.

## 2. Real corporate records in the product

- `NeyoBuildLog`: what shipped, status, evidence.
- `NeyoMetricSnapshot`: periodic revenue/customer/usage snapshot.
- `NeyoFounderOpsEntry`: cadence events such as all-hands, audit, planning, demo, investor update,
  board meeting, impact report.
- `NeyoCustomerInterview`: customer discovery evidence.
- `NeyoIdea`: product/strategy ideas.
- `NeyoTeamMember`: internal team/access data.
- `NeyoContract`: company contracts and signing status.
- `NeyoCustomerThread`/`NeyoCustomerMessage`: customer support history.
- `ComplianceRequest`: tracked privacy/compliance request.
- `NeyoCostSnapshot`: company cost evidence.
- `SchoolQuoteRequest`, `DemoRequest`: sales pipeline records.
- `FounderAiQuery`: internal founder assistant query history (internal source naming; school product
  copy still follows the Bundi Rule).

These records support governance but do not replace signed statutory documents, bank statements,
tax filings, or board resolutions stored in appropriate secure systems.

## 3. Founder Ops service responsibilities

`founder-ops.service.ts` provides:

- `founderOpsDashboard()`;
- build log list/upsert/delete;
- metric snapshot list/upsert/delete;
- founder cadence entry list/upsert/delete;
- customer interview list/create/update/delete.

`founder-dashboard.service.ts` provides founder metrics/analytics access, morning dashboard,
compliance request lifecycle, and internal assistant configuration/history.

Sensitive operations require `FOUNDER`/authorized company roles. School principals cannot access
company-wide records simply because they lead a tenant.

## 4. Daily founder dashboard

Daily review should answer:

1. Is production healthy?
2. Are payments/callbacks/jobs/providers failing?
3. Which schools are in trial, grace, suspended, or critical health?
4. Which support/compliance/security issues require ownership today?
5. Which accepted quote/onboarding is blocked?
6. What code/release/maintenance change is active?
7. Are any platform flags/pilots exposing unfinished work?
8. What cash/revenue obligation is due?

Use `founderMorningDashboard()` and source ledgers. Assign owner/date; do not merely observe a red
metric.

## 5. Weekly operating review

Minimum agenda:

- production uptime/incidents and unresolved remediation;
- deployments, migrations, failed tests, security findings;
- active/paying/trial/grace/suspended schools;
- MRR/collections and payment reconciliation;
- sales pipeline and onboarding time;
- tenant-health interventions and aged customer threads;
- product delivery against Features Checklist;
- Bundi/provider quota and cost;
- top customer feedback/interviews;
- team/access changes;
- decisions requiring Level 05 update.

Record the snapshot in `NeyoMetricSnapshot` and actions in the appropriate operational record.

## 6. Monthly all-hands / company review

`NeyoFounderOpsEntry` supports a `MONTHLY_ALL_HANDS` cadence. Include:

- wins and misses with evidence;
- product quality/security/customer impact;
- financial actual versus plan;
- support SLA and churn reasons;
- roadmap changes;
- hiring/contractor/access needs;
- risks and decisions;
- named actions and due dates.

Do not inflate activity counts into outcomes. “390 test files exist” is not “390 tests passed this
month”; record executed results.

## 7. Quarterly self-audit and board meeting

Quarterly review combines:

- security/compliance obligations and incidents;
- tenant isolation/permission regression;
- backup restore and DR exercise;
- pricing fairness/margin;
- customer concentration/churn;
- roadmap/checklist integrity;
- contract renewal/expiry;
- team access and founder key-person risk;
- financial statements/tax status from qualified accounting records;
- strategic risks and approved decisions.

Board minutes/resolutions must be signed/retained in a legally appropriate repository. The
`BOARD_MEETING` Founder Ops entry indexes summary, decisions and actions; it is not automatically a
legal minute book.

## 8. Annual planning and impact

Annual planning should set:

- mission and target Kenyan school segments;
- product/reliability/security objectives;
- pricing and revenue targets;
- hiring/partner/infrastructure plan;
- legal/compliance calendar;
- customer success and impact measures;
- capital requirements and runway scenarios;
- major risks and stop-doing decisions.

Impact claims must be measurable (active schools, learners served, collection/attendance workflow
outcomes) and must not expose school/student identities without lawful approval.

## 9. Build log governance

`upsertBuildLog()` stores real build entries. Every entry should include:

- date and checklist/feature id;
- user/workflow problem;
- implementation scope;
- migration/security impact;
- tests actually run/results;
- release/activation status;
- commit/deployment reference;
- unresolved items.

Delete only erroneous duplicate administrative entries; do not erase a failed release history to
make performance appear better.

## 10. Metrics dictionary

Every metric needs formula, source, period, timezone, owner, and exclusions.

Core examples:

- **Paying schools:** subscriptions settled/active under the agreed definition.
- **MRR:** normalized recurring NEYO subscription revenue; distinguish term cash receipts.
- **Trial conversion:** paid activations ÷ eligible expired/mature trials.
- **Churn:** define logo/revenue churn and observation window.
- **Collection:** settled subscription payments, not initiated STKs.
- **School health:** current tenant-health algorithm, not customer satisfaction.
- **Support age:** time from thread/request creation to resolved state.
- **Deployment quality:** incidents/rollback/escaped defects, not commit count alone.

`upsertMetricSnapshot()` preserves periodic values. Do not rewrite an old snapshot when the formula
changes; document the new definition/version.

## 11. Customer interview discipline

`NeyoCustomerInterview` records school/contact/channel/status, pain points, quotes, opportunities and
follow-up. Process:

1. obtain appropriate consent and minimize personal data;
2. ask about actual recent workflows, not feature wish-list only;
3. record verbatim quote separately from interpretation;
4. connect opportunity to checklist/idea without promising delivery;
5. close the loop with the customer;
6. aggregate patterns before changing platform policy.

One loud request does not automatically override cross-school product strategy.

## 12. Contract lifecycle

`neyo-contract.service.ts` provides schema, default body, list/upsert/status, public token view/sign,
and deletion. `signPublicContract()` records signer input and optional IP through a token flow.

Controls:

- use approved legal template/version;
- bind correct legal entities, pricing, term, services, data terms and signatories;
- tokens are unguessable, expiring/revocable where implemented;
- status follows real signature, not email intent;
- preserve signed copy/hash/evidence outside mutable draft flow;
- amendments supersede with linkage; do not edit signed terms silently;
- obtain Kenyan legal review before relying on default text.

## 13. Investor-ready data room index

A secure external data room should contain current, access-controlled evidence:

### Corporate

- incorporation/ownership/director records;
- cap table and option/convertible instruments;
- board/shareholder resolutions;
- material contracts and IP assignments.

### Financial

- management accounts and bank/provider reconciliation;
- revenue by customer/cohort;
- costs, runway and forecasts with assumptions;
- tax/statutory filings from qualified records;
- pricing and unit economics.

### Product/technology

- product overview and roadmap/checklist summary;
- architecture/security/DR documentation (Bible Levels 02, 08, 11, 12, 14);
- deployment and test evidence;
- incident register and remediation;
- third-party provider inventory.

### Commercial/customer

- pipeline, contracts, retention/churn definitions;
- anonymized customer references/interview synthesis;
- support/health metrics;
- concentration and receivables.

### Legal/privacy

- privacy/terms/data-processing agreements;
- ODPC/DPO evidence when completed;
- pen-test/security reports;
- compliance request/incident process;
- insurance and regulatory matters.

The repository may index these documents but must not contain private cap-table, bank, identity, or
secret material unless explicitly secured and appropriate.

## 14. Investor update structure

A periodic update should include:

1. headline and period;
2. metrics with definitions/comparatives;
3. product shipped and quality evidence;
4. customers/revenue/pipeline;
5. wins and misses;
6. cash/runway (from real accounts);
7. key risks/incidents;
8. priorities until next update;
9. specific asks.

Mark estimates and unaudited figures. Do not call a demo request a customer or an initiated STK
revenue.

## 15. Access governance and key-person risk

- Keep company roles least-privileged.
- Review `NeyoTeamMember` and GitHub/Vercel/Neon/Fly/Cloudflare/provider access quarterly.
- Remove departed access promptly.
- Require 2FA and recovery process.
- Store credentials in organizational accounts/vault, not only founder devices.
- Maintain domain, repository, database, payment and backup ownership records.
- Test another authorized person can execute incident recovery without receiving secrets in chat.

## 16. Compliance and risk register

At minimum track:

- data/privacy and child-data handling;
- cross-tenant authorization;
- payment/reconciliation fraud;
- provider/vendor concentration;
- database/storage loss;
- founder/key-person dependency;
- regulatory/statutory obligations;
- customer concentration and affordability;
- inaccurate product/completion claims;
- Bundi extraction/correction risk;
- uptime/scaling and cost.

Each risk needs likelihood, impact, control, residual risk, owner, review date, and trigger.

## 17. Decision and action integrity

- Decisions go to Level 05 with supersession links.
- Actions have owner/date/status in the real cadence/project system.
- Metrics remain snapshots.
- Build logs remain implementation evidence.
- Interviews remain customer evidence.
- Contracts remain legal evidence.

Do not use one model as a generic dumping ground for all governance.

## 18. Founder succession/continuity pack

Maintain an encrypted, access-controlled continuity pack containing:

- organization/provider account ownership;
- emergency contacts;
- domain/DNS and deployment ownership;
- backup/restore procedure and last drill;
- current high-severity risks/incidents;
- company calendar and statutory deadlines;
- key contracts/customer obligations;
- secure secret-recovery process;
- this Bible/index and current Anchor/Checklist.

The pack references secrets but does not embed them in repository docs.

## 19. Maintenance rule

Update this level as company cadence, metrics, contract flow, or governance records change. Legal
and financial evidence requires qualified review. Never turn an aspirational investor-data-room
item into a completed claim merely because it is listed here.
