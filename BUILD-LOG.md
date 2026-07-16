# NEYO Build Log

> F.1 Founder Operations makes this file a human-readable mirror of what NEYO now tracks inside the product at `/founder`.

## 2026-07-16 — EE.3 continued: all 9 Junior School subjects now covered + first Senior School grade band (Grade 10)

**Shipped**

- Closed out the remaining 4 Junior School (Grade 7-9) compulsory learning areas EE.3 hadn't reached yet: Pre-Technical Studies, Agriculture & Nutrition, Creative Arts & Sports, and Christian Religious Education. Every one of the 9 real KICD-rationalised Junior School subjects now has real, researched strand and sub-strand content ready to load into any school's own curriculum.
- Opened the first Senior School (Grade 10) grade band: English, Kiswahili, Core Mathematics, Essential Mathematics, and Community Service Learning — the 4 core subjects every Senior School learner takes no matter which pathway they choose.
- Both stay OFF platform-wide until released from NEYO Ops, exactly like the rest of EE.3.
- Zero regressions: full existing test suite re-confirmed green, plus 14 new tests for this addition.

**Proof**

- `scripts/ee3-followup-senior-and-remaining-junior-curriculum-test.ts` — 14/14 passing.
- Full detail in `docs/CONTEXT-ANCHOR.md` (2026-07-16, part 22) and `docs/FEATURES-CHECKLIST.md` (`## EE.3 (continued)`).

---

## 2026-06-13 — G.11 corrected and F.1 Founder Operations started

**Shipped**

- Corrected G.11 Public School Landing Site after founder asked if it was truly done.
- Rebuilt the public landing site as a real database-backed, editable, tenant-aware feature.
- Added public news detail pages, settings editor, gallery, leadership, testimonials, activities, SEO, map and seed content.
- Started F.1 Founder Operations so NEYO runs NEYO inside the product itself.

**Proof screenshots**

- `screenshots/137-g11-public-landing-final.png`
- `screenshots/138-g11-news-detail-final.png`
- `screenshots/139-g11-public-site-settings-final.png`
- `screenshots/140-f1-founder-ops-page.png`
- `screenshots/141-f1-founder-overview-tested.png`
- `screenshots/142-f1-build-log-tab-tested.png`

