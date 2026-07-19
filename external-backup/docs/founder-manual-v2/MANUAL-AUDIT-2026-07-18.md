# Founder Manual V2 — Completion & Freshness Audit (2026-07-18)

## Inventory

- 30 numbered operating modules plus the plan/index.
- Consolidated Markdown and print-ready HTML generated from the canonical chapters.
- 8,978 source lines before consolidation; approximately 306 KB consolidated Markdown.

## Checks performed

- Every numbered module 01–30 exists and is linked from `00-MANUAL-PLAN-AND-MODULE-ORDER.md`.
- Relative Markdown links in the chapter set were checked; no missing local Markdown target found.
- Bible companion index includes every completed module.
- Canonical source remains individual chapter; consolidated outputs are generated copies.
- Each chapter contains real paths/workflows, permission boundaries, failure guidance and verification.
- Gaps discovered during writing were either fixed full-stack or explicitly classified as activation/product-policy decisions.

## Known verification constraints

- Node dependencies were installed successfully.
- Focused ESLint on recent production changes: zero errors; pre-existing warnings remain in large legacy files.
- Prisma Client generation remains blocked by TLS disconnect to `binaries.prisma.sh`.
- Database-backed role tests and trustworthy whole-project type inference cannot run until Prisma Client generation succeeds.
- Production dependency audit reports critical/moderate advisories requiring a separate controlled upgrade/test cycle.

## Regeneration

Update an owning chapter first, then regenerate the consolidated Markdown/HTML. Do not edit the generated consolidated files as the primary source.

## Recommended next verification

1. Restore Prisma engine/client generation in a network-capable environment.
2. Run cache-free typecheck, role suite and affected module regressions.
3. Run the app with seeded Postgres.
4. Capture current 360px and desktop screenshots for each chapter.
5. Render the consolidated HTML to PDF and visually inspect page breaks, tables and confidential examples. A Playwright Chromium installation was attempted in this sandbox but the CDN repeatedly reset TLS, so no false PDF-success claim is made.
