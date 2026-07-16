# EE — CBC/CBE Deep Integration + Smart Scanning + Learning Library + Quiz Bank + Contests
## Research & feasibility analysis (2026-07-16), BEFORE any building

This document answers the founder's own question directly: **"will this system be powered and be able to operate or will it be hard?"**

**Short answer: it is absolutely buildable, and roughly 60% of the hard infrastructure it needs already exists and is already live in NEYO today.** The remaining 40% is real, non-trivial work — but nothing in the request is science fiction. The two genuinely hard constraints are not technical, they are **cost and quota ceilings set by Google, not by NEYO** — and those need an honest design decision from you before a single line of new code is written. That decision is what the `ask_user` at the end of this document is for.

---

## PART 1 — What NEYO already has today (audited by reading the real source code, not guessed)

Before proposing anything new, I read every existing CBC/CBE-adjacent service file, the QR scanning system, the module kill-switch system, and the existing OCR pipeline. Here is exactly what is already live:

### 1.1 CBC/CBE curriculum data — **partially exists, real gap identified**
- `CbcStrand` (per subject) and `CbcAssessment` (one teacher observation of one learner on one strand, 4-point KICD rubric EE/ME/AE/BE) — **already live** (`cbc.service.ts`, Part B.6).
- `Competency` + `CompetencyGroup` + learner evidence — **already live** (`competency.service.ts`, Part J.4), with 7 real default cross-curricular competencies seeded (Communication, Critical Thinking, Problem Solving, Creativity, Citizenship, Digital Literacy, Learning to Learn).
- `Rubric` + `RubricLevel` — a **configurable, school-editable** rubric engine already exists (Part J.5), not hardcoded to one 4-point scale — a school can define its own levels/descriptors/points. This is a genuinely good foundation for your "auto-fill from rubric" request.
- `SkillsPassportEntry` (Part J.6) and `PortfolioItem` (Part J.7) already exist for tracking learner growth/evidence over time.
- **The real gap**: there is currently **no `CbcSubstrand` model at all** — strands exist, sub-strands do not. Every teacher-facing strand-level tool in NEYO today works at the strand level only. Adding sub-strands is real, additive schema work, not a redesign.
- **The real gap**: KICD's actual PP1–Grade 12 strand/sub-strand curriculum content for every subject is **not in the database at all** — only strand *names* a school types in themselves exist today. Loading the real, KICD-designed curriculum content is a genuine, large, one-time data-entry/research project (see Part 3.1 below for the honest size of this).

### 1.2 Auto-fill marks/comments from rubrics — **not built, but the exact right foundation exists**
`Rubric`/`RubricLevel` already lets a school define e.g. "3 = Meeting Expectation, descriptor: ...". `CbcAssessment.level` already stores a 1-4 (or school-configured) score. What's missing is the actual auto-fill logic: given a `level` a teacher just entered, look up that rubric level's own `descriptor` and offer it as one-tap comment text — genuinely simple, deterministic, **zero AI involved**, exactly matching your "never AI powered" instruction. A school can maintain a bank of several comment variants per level per strand so it doesn't feel robotic (e.g. 3-5 phrasings NEYO rotates or a teacher picks from) — this is just data + a dropdown, not a language model.

### 1.3 OCR / scanning — **a full, working, real pipeline already exists and is already live in production** (this is the biggest finding)
This is not a proposal — it is running code today, called **"Bundi Intelligent"** (Parts M.5/N.1), used for handwritten student/staff/library register imports:
1. **Stage 1 (free)**: `sharp` image enhancement — auto-rotate from EXIF, grayscale, contrast-normalize, sharpen. *This is exactly your "change it into grayscale for accuracy... make it even in all sides" request — already built.*
2. **Stage 2 (free)**: `tesseract.js` — real, open-source, MIT-licensed local OCR, running server-side today, returning genuine per-word confidence scores.
3. **Stage 2b (free)**: geometry-based row/column detection — groups OCR words into table rows/columns by pixel position, tuned for the exact kind of ruled exercise-book register a Kenyan school actually uses.
4. **Stage 4 (free)**: validates OCR output against real school data (e.g. does this look like a real admission number already in the database?) to raise confidence with zero API cost.
5. **Stage 5 (free)**: learns from every human correction, per-tenant, so the same handwriting/format gets recognized better over time without ever calling a paid API again.
6. **Stage 6 (free)**: template memoization — once a school's own register layout is learned, later scans of the same layout skip straight to high confidence.
7. **Stage 7 (paid, LAST resort only)**: Google Cloud Vision API is called **only for the individual cells that are still uncertain after all six free stages above** — batched, field-level, never a whole-page call. The API key is a single company-wide credential in NEYO Ops (Integration Credential Vault), not per-school.
8. Every session records **real** provider/model/cost numbers for NEYO Ops visibility — this already feeds directly into the live pricing engine (`weightAiOcrUsage`, `avgAiOcrUsagePerStudent` — Bundi/OCR usage is already one of the 5 real inputs to what a school pays).
9. Uploaded images are read via `readObject(fileKey)` from the Storage Vault and are **already** subject to NEYO's existing storage-optimizer, which auto-deletes "genuinely TEMPORARY working files (failed imports, **OCR scratch images**, draft exports)" after their real age — this is very close to your "never store the uploads" requirement, just needs the retention window tightened/confirmed for this specific feature (see decision point below).

**What this means concretely: the mark-sheet scanning and exam-paper scanning features you're asking for are not a new system — they are a new front-end/workflow layered on an existing, already-tested, already-cost-tracked backend.** This dramatically lowers both the real engineering risk and the real cost risk, because the expensive part (accuracy pipeline design) is already solved.

### 1.4 YouTube learning library — **exists, and is architecturally already exactly what you're asking for**
- `LearningVideo` model (Part I.27) — a school **saves only the link + metadata** (title, description, channel, thumbnail URL), never the video file itself. Playback is via `youtube-nocookie.com/embed/...` — the video is always streamed live from YouTube, inside a NEYO page, never downloaded or re-hosted. **This already satisfies your "never store any video" requirement exactly as designed.**
- `searchLearningVideos()` already does the sensible thing: it returns **saved** NEYO videos first (zero API cost, zero quota use), and only calls the real YouTube Data API v3 `search.list` endpoint if a company-wide API key has been configured in NEYO Ops **and** a school actually types a live search query.
- There is also a separate, distinct `NeyoYoutubePost` system (Part I.48) for NEYO's own company YouTube channel/marketing posts — not the same thing as the school learning library, worth keeping separate.
- **The real gap**: there is no strand-to-video linking table yet, no teacher "paste a link for ops review" submission flow, and no NEYO Ops approval queue for submitted links yet — these are all real, additive, straightforward pieces to add onto this existing foundation.

### 1.5 QR scanning — **a full, working, real system already exists** (Part N.2)
- `QrScanEvent` model, already tenant-scoped correctly, with a full audit trail (who scanned, when, what action, what result).
- Already resolves a scanned QR (or a USB handheld barcode scanner's typed input, or manual paste) to a real student in under a database round-trip.
- Already has a **duplicate-scan guard** (15-second cooldown) so the same card can't be scanned twice by accident.
- Already returns clear, real statuses — this is very close to your "allowed / not allowed / didn't pass / invalid" requirement; it currently covers ATTENDANCE and PAYMENT_LOOKUP actions specifically, and would need a genuinely new "gate pass" style status set added, not a new scanning engine built from scratch.
- **Sub-second response**: because this is a single indexed database lookup (no external API call, no OCR, no AI), sub-second response is realistic and already how the existing system behaves — this is the easiest part of your entire request from a performance standpoint.

### 1.6 The "release button" (kill-switch) — **already exists, twice over, exactly as you described**
You said: *"remember that every idea must have a release button to be fully released."* NEYO already has **two** real, live mechanisms for exactly this, and every new EE feature below should plug into one of them rather than invent a third:
1. **`TenantModule`** — per-school module on/off (e.g. a specific school can have "hostel" off). Good for a feature a school opts into individually.
2. **`PlatformFlag`** — a single NEYO-Ops-wide pause switch per feature key, already used for the entire Bundi layer ("PAUSED platform-wide... until NEYO launches it") and, since Part J, generalized into a whole **`J_FEATURES` registry** where *every* Part-J feature (Portfolio, Transfer Passport, Report Builder, Career Discovery, Curriculum Versioning, etc.) has its own stable ID and can be paused/released platform-wide from one NEYO Ops screen, defaulting to OFF until you explicitly flip it on. **This is precisely the "off in NEYO ops before launch" mechanism you're asking for, already built and already in daily use.**

**Every single sub-feature in this EE backlog will get its own entry in this exact registry** — so before EE launches at all, every piece ships fully OFF platform-wide, and you personally switch each one on, one at a time, from NEYO Ops, whenever you're ready — no new mechanism needs to be invented for this.

---

## PART 2 — The two real cost/quota constraints (the honest part of this answer)

Everything in Part 1 is genuinely solvable. These two constraints are not about NEYO's engineering — they are hard limits **Google itself imposes**, and no amount of clever code removes them. You explicitly asked for honesty here, so here it is, with current 2026 numbers I looked up live rather than guessed:

### 2.1 Google Cloud Vision API is **not** free at real scale
- First **1,000 units/month are free**, per feature (a "unit" = one image sent to one detection feature — text detection is its own 1,000/month bucket).
- After that: **$1.50 per 1,000 units** (≈ KES 195 per 1,000 scans, at today's exchange rate) for both `TEXT_DETECTION` and `DOCUMENT_TEXT_DETECTION`.
- This directly contradicts a literal "KES 0 to run" framing **only if Vision is called on every scan**. It does **not** contradict it under the existing Bundi Intelligent architecture (Part 1.3 above), because Vision is the *last* resort, called only on the small percentage of cells the free stages couldn't confidently read. In practice, most clean, well-lit, well-written mark sheets should resolve almost entirely for free through Tesseract + rules + school-data validation — real cost only shows up for genuinely messy handwriting, which is honest and expected.
- **Recommendation**: keep OCR entirely on the existing Bundi Intelligent pipeline (Tesseract-first, Vision-as-last-resort, already cost-tracked per tenant, already feeds the pricing engine) rather than building a second, separate "always call Vision" path for mark sheets. This is both cheaper and less new code.

### 2.2 YouTube Data API v3 has a genuinely hard wall, not a soft one
- The API itself is free in dollars — Google does not bill for it.
- But every project gets a fixed **10,000 quota units/day**, and a single `search.list` call costs **100 units** — meaning a **hard ceiling of ~100 live searches per day, platform-wide, for the entire NEYO company**, not per school. This cannot be paid around; Google's own quota-extension process is manual, requires an audit, and is not guaranteed.
- This means a literal "every teacher can search YouTube live, any time" design would run out of quota before lunchtime on a single day, across all of NEYO's schools combined.
- **The good news: you already half-solved this in your own message** — you specifically proposed a curated library where "the searching comes from the library where NEYO can save on the links" with ops approval before a link goes live. That is exactly the right architecture given this real constraint: **the vast majority of student-facing video access should come from the pre-approved, already-saved `LearningVideo` library (zero quota cost, since it's just a database read + a free YouTube embed player), and live `search.list` calls should be reserved for the much rarer case of a teacher/ops-team member curating NEW links** — not something every student does every time they open a strand.
- Playback itself (a student actually *watching* an embedded video) **never touches the Data API's quota at all** — embedding and playing a video is not a metered API call, it is just a webpage loading a YouTube iframe. Quota is only consumed by *searching/discovering* new videos, not by watching already-saved ones. This is an important distinction that makes your library-first design fully viable at unlimited student scale.

### 2.3 What this means for your "0 shillings" framing
- **The quiz/assessment bank, strand/sub-strand curriculum browsing, auto-fill marks/comments, QR scanning, and watching already-curated YouTube videos can all genuinely run at ~KES 0 marginal cost** — none of these call any paid API at all in their normal path.
- **OCR scanning has a real, small, usage-based cost** for the fraction of scans that need Google Vision fallback — this should be transparently tracked (it already is, via the existing Bundi cost-tracking) and can be folded into your existing per-school pricing exactly like it already is for Bundi imports, rather than promised as literally free.
- **Live YouTube searching for new videos has a hard daily ceiling that is not about money, it's about a fixed number of searches Google allows per day** — solved by the curate-once-reuse-many-times library design, not by spending more.

---

## PART 3 — Sizing the genuinely large pieces honestly

### 3.1 Full KICD strand/sub-strand curriculum data entry (PP1–Grade 12, all subjects)
This is a real, large, one-time content project, not a coding problem. KICD publishes official CBC/CBE curriculum designs per grade per subject, each listing every strand and sub-strand for that subject/grade. Loading all of this for PP1, PP2, Grade 1–9 (Junior School) and the Senior School pathway subjects (Grade 10–12) across every subject is genuinely dozens of subjects × multiple grades × several strands/sub-strands each — realistically several hundred to over a thousand individual strand/sub-strand rows once fully populated. This is absolutely doable, but it should be phased (e.g. start with core subjects for 2-3 grades, expand from there) rather than attempted as one single data dump, and it is fundamentally a research/transcription task against KICD's own published curriculum designs, which I can do progressively, grade-band by grade-band, once you confirm the phased order you want.

### 3.2 Printable/re-scannable mark sheets with delta-detection
Genuinely new work (no direct existing equivalent), but every individual piece it needs already exists elsewhere in NEYO to be reused: PDF/print generation (used everywhere already, e.g. timetables, report cards, ID cards with school badge), the Bundi Intelligent OCR pipeline (Part 1.3), and a real "what changed since last time" diff is a standard, well-understood pattern (compare newly-OCR'd cell values against already-persisted marks, only write the ones that changed). This is a solid, medium-sized, self-contained feature.

### 3.3 Exam privacy tiers + cross-school sharing with ops approval
Straightforward, additive: a visibility enum (PRIVATE / SCHOOL_ONLY / PUBLIC_SHARED) on exam papers plus an ops-approval queue — this is the same shape as the already-existing `ExamReleaseApprovalRequest` workflow (Part I.2) and the `CustomFeatureRequest` ops-review pattern, both already live. Low risk, reuses proven patterns.

### 3.4 In-app quiz/question bank with self-marking
Genuinely new content-and-UI work, but technically simple (multiple-choice questions per strand/sub-strand, a student picks an answer, NEYO compares it to the stored correct answer — no AI, no external cost, purely a database comparison). The LMS module (Part B.13, "notes, quizzes, assignments") already exists as a home for this.

### 3.5 Inter-school contests
A genuinely new feature but a natural extension of the quiz bank above (same question/answer engine, scoped to a timed multi-school event with a leaderboard) plus NEYO's existing multi-tenant-safe patterns for anything that spans schools.

---

## PART 4 — Direct answer to "will this system be powered and be able to operate, or will it be hard?"

**It will be powered and will operate.** Nothing in this request requires anything NEYO doesn't already have a proven pattern for — real OCR, real QR scanning, real curated video links, real module kill-switches, real ops-approval workflows, and real per-tenant cost tracking are all already running in production today, used by other features. The two genuinely hard limits are Google's own Vision API per-request cost and YouTube's own daily search quota — both are real, both are avoidable-in-practice through the exact "curate once, reuse many times, escalate to paid only as a last resort" design you already proposed yourself, and both are already partially solved by existing NEYO infrastructure.

The realistic difficulty is **scope, not technology**: this is genuinely 8-10 separate features bundled into one request. Building it well means treating it like the DD and AA backlogs before it — one clearly-scoped item at a time, each with its own real test, its own commit, and its own release-button entry — not one giant undifferentiated build.

---

## PART 5 — Proposed EE backlog (pending your confirmation)

`grep -n "^## [A-Z][A-Z]\." docs/FEATURES-CHECKLIST.md` confirms letters in use today: A, AA, B, BB, C, CC, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z. **`DD` is a separate lightweight draft doc, not a Part letter in the main checklist. `EE` is confirmed free.**

Proposed breakdown, in a sensible build order (each gets its own release-button entry in the `J_FEATURES`-style registry from day one, OFF by default):

- **EE.1** — `CbcSubstrand` model + cross-linking every existing CBC/CBE section (Strands, Rubrics, Competencies, Portfolio, Skills Passport) so a student's full academic record is visible from one place.
- **EE.2** — Rubric-driven auto-fill for marks/comments (deterministic, bank of phrasings per rubric level, zero AI).
- **EE.3** — KICD strand/sub-strand curriculum data load, phased by grade band (starting with a grade band you choose).
- **EE.4** — Printable class mark sheets + scan-to-enter with delta/re-scan detection, built on the existing Bundi Intelligent pipeline.
- **EE.5** — Exam-paper scanning ("teacher writes on paper, NEYO tidies it into a professional exam"), same OCR foundation.
- **EE.6** — Exam privacy tiers (private / school-only / public-shared) + ops approval for sharing.
- **EE.7** — YouTube learning library: strand-to-video linking, teacher link-submission + ops approval queue.
- **EE.8** — In-app quiz/question bank per strand/sub-strand, self-marking, zero cost.
- **EE.9** — Scan-a-paper-quiz into formative-assessment format.
- **EE.10** — Inter-school contests (built on EE.8's engine).
- **EE.11** — QR "gate pass" style status scanning (allowed/not-allowed/didn't-pass/invalid), extending the existing N.2 QR system.

---

## Questions for you before any building starts
