# NEYO launch-first product and growth plan

**Decision date:** 20 July 2026  
**Status:** Founder direction — active

## Founder decision

NEYO will not keep redesigning large parts of the product before it has real users. A broad visual redesign does not create revenue by itself when the product has not launched.

The detailed Dashboard, Students workspace and larger ecosystem-navigation ideas are preserved in this document for later. They are **not current build requirements**.

The immediate product priorities are:

1. **Phase 1 — launch readiness and visibility**
   - Fix text, controls, tabs, cards, menus and status colours that are difficult to see in light or dark mode.
   - Fix real broken workflows and launch blockers.
   - Keep print and PDF output readable and free from app navigation.
   - Do not add decorative charts or redesign stable workflows without user evidence.

2. **Phase 3 — practical mobile adaptability**
   - Make every important workflow usable at 360px width.
   - Replace very long mobile action/tab rows with one primary action plus a compact **More** or section selector.
   - Keep wide operational tables horizontally scrollable where a table is genuinely necessary.
   - Use compact rows, readable text and touch targets without making cards taller unnecessarily.
   - Avoid forcing users to swipe through many module tabs just to find a section.

The product rule is now: **repair, simplify and launch; redesign later from real school feedback.**

## What is implemented now

The Academics workspace, including Timetable, previously exposed a very long row of sections on mobile. Mobile now shows one compact **Current section** selector. It keeps the active location visible and places all other Academics destinations in the same selector. Desktop retains the fast tab row.

## Deferred design ideas (keep for post-launch evidence)

### Dashboard

Possible later replacement for the large collection trend chart:

- **My Next Actions** — real role-specific tasks linked to the correct workflow.
- **Today’s School Pulse** — current operational exceptions and status, not decorative analytics.

Do not implement this until real users or the founder confirm the current Dashboard is slowing work.

### Students workspace

Possible later improvements:

- One compact student directory workspace.
- Search, Filters, Saved Views/Presets and optional Columns.
- Keep Add Student and Import visible; put secondary actions under More.
- Compact mobile rows with an optional table view.
- Reduce redundant breadcrumbs on small screens while keeping the page title and active navigation visible.

Do not perform a full Students redesign before launch without evidence from school use.

### Larger ecosystem navigation

Possible later workspace groups:

- Home
- People
- Academics
- Finance
- Operations
- Communication
- Reports
- Settings

Possible contextual mobile action bars should be module-specific, not one giant global bar. This remains research material, not an immediate build instruction.

## 30-day community-building priority

The founder should spend the next 30 days building awareness and learning from potential users on TikTok and Instagram rather than repeatedly changing the interface based only on internal opinion.

A simple operating rhythm:

- Post one useful, honest piece of content each day.
- Show a real Kenyan school problem and a short NEYO workflow that addresses it.
- Never claim a feature, integration or customer result that has not been verified.
- Ask viewers one clear question and record repeated pain points.
- Track: posts published, views, profile visits, direct messages, school conversations, demos requested and recurring objections.
- Convert repeated feedback into small repair tickets; do not turn every comment into a redesign.

Suggested weekly themes:

1. **Week 1:** school administration problems and founder story.
2. **Week 2:** short real workflow demonstrations on a phone.
3. **Week 3:** Kenyan school-specific operations such as attendance, fees, M-Pesa reconciliation, exams and timetables.
4. **Week 4:** answers to recurring questions, behind-the-scenes progress and invitations for pilot-school conversations.

## Build decision test

Before starting any visual change, ask:

1. Is this unreadable, broken or unusable on mobile?
2. Does it block a school from completing a real task?
3. Has a real user raised it, or can it be demonstrated at 360px?
4. Can it be repaired without expanding page length or replacing the whole workspace?
5. Is the expected benefit more valuable than community building, demos and launch preparation this week?

If the answer is no, document the idea and defer it.

## Phase 1 and Phase 3 implementation log

### Shared foundation

- Strengthened shared table headings and cell contrast in light and dark mode.
- Strengthened labels, field text and placeholders globally.
- Prevented disruptive iPhone form zoom by using 16px controls on small screens.
- Allowed long operational values to wrap inside the mobile viewport.

### Academics and Timetable

- Replaced the excessive mobile tab strip with one current-section selector.
- Converted the local Academics modal system to scroll-safe mobile bottom sheets with dynamic viewport and safe-area support.

### Students

- Tightened the three summary cards on narrow phones without increasing their height.
- Made ID-card printing, newsletter printing, student registration and approvals dialogs fit and scroll within 360px mobile screens.
- Added mobile safe-area spacing while retaining centred desktop dialogs.

### Finance and Exams

- Changed three-column setup fields to stack on phones and return to three columns on larger screens.
- Made the New Exam dialog a scroll-safe mobile bottom sheet.

This is an active route-by-route audit. A route is not marked complete merely because it inherits the shared CSS fixes.

## Current engineering order

1. Visibility and contrast audit of high-use launch routes.
2. Mobile adaptability: long tabs/actions, overflowing forms and touch access.
3. Real functional blockers from the founder audit, including timetable lunch correctness, print routes, Question Bank empty states and Exam Paper Vault verification.
4. Launch and pilot feedback.
5. Larger redesign only after behaviour and feedback provide evidence.
