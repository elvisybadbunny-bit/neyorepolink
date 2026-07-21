# NEYO Infrastructure and Running-Cost Minimisation Plan

**Date:** 21 July 2026  
**Goal:** Keep pre-launch and early-pilot cost as close to zero as responsibly possible without pretending production reliability, backups, security and communication are free.

## 1. Current architecture visible in the repository

- Next.js 14 web/API deployment on Vercel.
- PostgreSQL through Prisma.
- Cloudflare R2-compatible object storage when configured; local provider in development.
- Optional Redis/Upstash/BullMQ path; controlled in-process jobs when not configured.
- Optional Resend email.
- Optional Africa's Talking/SMS.
- Optional Sentry, Better Stack and PostHog.
- Optional OAuth, Web Push and online-class infrastructure.
- Vercel Cron calling one `/api/jobs/tick` coordinator.

## 2. Costs that cannot responsibly be zero forever

- commercial production hosting;
- production database and backups;
- domain/DNS;
- object storage after free allowance;
- SMS and WhatsApp messages;
- M-Pesa/provider transaction charges where applicable;
- email after free allowance;
- monitoring/log retention at scale;
- support labour;
- legal/security/compliance work;
- disaster-recovery copies.

A free personal hosting plan must not be assumed valid for commercial production. Check provider terms before launch.

## 3. Near-zero pre-launch stack

Use one preview/demo environment only:

- one Vercel project;
- one small serverless Postgres project;
- one R2 bucket only when uploads are genuinely tested;
- no Redis until background volume requires it;
- no paid observability until real pilot traffic;
- browser/in-app notifications before paid SMS;
- manual payment reconciliation before live provider activation;
- no separate staging database per developer;
- one controlled demo dataset, reset rather than cloned repeatedly.

## 4. Database cost controls

- Keep one tenant database with strict tenant isolation rather than one database per school at early scale.
- Add indexes only for real query patterns; unnecessary indexes duplicate storage and slow writes.
- Paginate lists; never return every learner/document/payment.
- Keep dashboard aggregation bounded by term/date.
- Store counters/summaries for old timetable runs; retain detailed learner proof for latest three only.
- Keep generated timetable draft snapshots for latest three non-published runs and current published run.
- Do not store duplicate PDF output when it can be regenerated.
- Archive only after documented retention rules; never delete medical/legal/audit records merely to save money.
- Monitor table growth by tenant and model monthly.

## 5. Object-storage controls

- Use R2 or another S3-compatible provider with low/zero egress where contract and data requirements fit.
- Encrypt files once and deduplicate by content hash where NEYO's CAS path applies.
- Compress images on upload; reject unnecessarily huge phone originals.
- Use thumbnails for lists instead of downloading originals.
- Stream PDFs instead of permanently storing each print.
- Mark OCR scratch images, failed imports and draft exports Temporary.
- Run Storage Intelligence in report-only mode first.
- Delete Temporary objects only after explicit lifecycle policy.
- Flag unused files; never auto-delete permanent school evidence.
- Avoid storing YouTube copies; store verified metadata/links only.
- Keep interactive simulations as code/data, not videos.

Official Cloudflare R2 pricing and limits must be checked at purchase time: https://developers.cloudflare.com/r2/pricing/

## 6. Bandwidth controls

- Mobile-first pages return compact records.
- Learner-proof list returns summaries; selected learner detail loads on demand.
- Avoid auto-playing video.
- Do not refresh whole dashboards every few seconds.
- Poll only active background jobs; stop when idle.
- Use presigned object links and caching.
- Keep social demo videos outside the product repository and production app.
- Use pagination for messages, audits, payments and histories.

## 7. Compute controls

- Timetable solver is deterministic local code, not a billed model call.
- Run generation only after Phase A–C gates to avoid wasteful impossible attempts.
- Use one background job per generation; block duplicates.
- Cache static curriculum libraries in code/release artifacts where lawful.
- Avoid recomputing old reports on every page load.
- Generate PDFs only when clicked.
- Consolidate scheduled jobs through one tick/registry rather than many cron invocations.
- Scale serverless/database compute to zero while idle where the chosen production plan permits and cold-start trade-offs are acceptable.

## 8. Communication controls

Cheapest order:

1. in-app notification;
2. web push;
3. email within allowance;
4. SMS only for important/offline recipients;
5. WhatsApp only after approved business integration and measured value.

- Deduplicate recipients.
- Enforce quiet hours.
- Batch messages.
- Preview recipient count/cost.
- Do not send both SMS and email automatically without policy.
- Keep delivery reports but prune unnecessary provider payloads according to retention policy.

## 9. Observability controls

Start with:

- structured application logs;
- health endpoint;
- Background Job history;
- audit logs;
- Vercel/provider dashboards.

Activate Sentry/Better Stack/PostHog only when the real need and privacy configuration are clear.

- sample high-volume events;
- never log credentials or full student data;
- short retention for debug logs;
- longer retention only for required audit/security events;
- avoid three tools collecting the same event.

## 10. Timetable-specific cost

A timetable run stores JSON/database rows, not media.

No automatic downloads are created. Print routes stream on demand. The dedicated print page contains no app shell.

Cost controls already implemented:

- latest-three detailed learner proofs;
- lightweight proof list;
- one learner detail on selection;
- latest-three non-published draft snapshots;
- old run summaries retained without bulky rows;
- deterministic quality report summarized by finding;
- no AI/provider fee;
- no automatic PDF persistence.

## 11. Printing cost controls for schools

- Vertical-days layout is default.
- Timetable covers nearly all printable A4 landscape area.
- Break/lunch columns merge vertically.
- Ink-saver B&W mode.
- Separate detailed option roster instead of overcrowding main grid.
- Avoid printing app navigation.
- Class name centred at top.
- Generated time and Powered by NEYO footer.
- Batch print only the required classes/teachers/venues.

True physical edge-to-edge depends on printer borderless support. NEYO can use a 3mm page margin; a normal office printer may impose a larger hardware margin.

## 12. Suggested cost gates

### Before first pilot

Pay only for a commercial-valid web plan, reliable database/backups and domain. Keep optional providers off.

### 1–5 schools

Measure:

- monthly active users;
- DB size;
- stored file GB;
- function requests/CPU;
- PDF count;
- SMS count;
- backup size;
- support time.

### 5–25 schools

Consider Redis/worker only if real jobs time out or overlap. Add paid monitoring only for observed gaps.

### 25+ schools

Compare serverless cost with a small always-on container/VPS plus managed database. Do not migrate based on fear; use measured monthly usage and reliability requirements.

## 13. Cost dashboard NEYO should maintain

Per school and platform total:

- DB bytes/rows;
- object bytes/files;
- temporary bytes;
- downloads/egress;
- function invocations and duration;
- timetable generations;
- PDF generations;
- SMS/email/WhatsApp counts and KES;
- OCR/provider calls and cost;
- backup size;
- support hours;
- revenue and gross margin.

## 14. Rules that prevent false savings

Never reduce cost by:

- disabling backups;
- sharing secrets;
- weakening tenant isolation;
- deleting required records;
- hiding failed jobs;
- using a personal-only free plan commercially;
- storing school data on a founder's personal drive;
- skipping encryption;
- removing monitoring after production incidents;
- sending private data through free unapproved tools.

## 15. Bottom line

At pre-launch, NEYO can remain very inexpensive because timetable/CBE logic is code and database data, not paid model calls. As schools join, files and communication—not timetable JSON—will likely dominate variable cost. Measure first, activate optional providers only when needed, stream regenerable documents, retain bounded detail and preserve security/backups.
