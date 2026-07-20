# EduPoa research, CBE comparison and NEYO gap analysis

**Date:** 20 July 2026  
**Method:** Public website, public blog/search results, public YouTube demonstration, TikTok search discovery, and direct comparison with NEYO schema, services, reachable pages and Founder Manual V2 Module 11.

## Evidence limits

This is not an authenticated audit of EduPoa. No private EduPoa school account was used. Claims below are limited to public material. Instagram-specific evidence was not reliably discoverable through public web search, so this report does not invent an Instagram feature/content assessment. Public marketing claims such as “KICD Approved,” customer counts, testimonials, security levels and performance are reported as claims made by EduPoa—not independently verified facts.

## Public EduPoa positioning

EduPoa leads with one narrow, measurable teacher problem: teachers spending 8–12 hours on CBE competency forms per term, which it claims to reduce to minutes. Its public site presents CBE as the core product wedge, then attaches finance, SMS, parent engagement and school management.

Its public CBE language repeatedly emphasises:

- the full curriculum design is preconfigured;
- grade → learning area → strand → sub-strand navigation;
- learning outcomes;
- suggested learning experiences;
- core competencies;
- values;
- links to other subjects;
- formative assessment;
- continuous competency tracking;
- digital portfolio evidence;
- parent-friendly competency progress;
- Senior School pathways and learning areas;
- ready-from-day-one teacher use.

The strongest public demonstration found was a 1:39 YouTube video showing Grade 9 Mathematics and comparing the in-product curriculum structure directly with a curriculum-design document. The story is simple: teachers should not print or scroll through a large PDF because the structured curriculum is already in the system.

EduPoa’s public content/search footprint also uses current Kenyan education information—Grade 10 placement, KJSEA/KCSE examiner training, CBE transitions and pathways—to attract parents and teachers before introducing the product. TikTok search results show parent-guide/Grade 10 content carrying EduPoa branding. This is a content-distribution lesson: teach the audience about an urgent education question, then demonstrate the relevant product workflow.

## What NEYO already has

NEYO is not missing the entire CBE chain. Code and schema show:

- CBE strands and sub-strands;
- strand/sub-strand learning outcomes;
- Primary, Junior and Senior curriculum preset libraries;
- CBE observation levels EE/ME/AE/BE;
- append-only CBE assessment history;
- comment bank;
- learner CBE report and PDF path;
- competency groups and configurable competencies;
- competency evidence and approval;
- flexible assessment types/plans/records/evidence/moderation/release;
- rubrics;
- syllabus topics and evidence-based coverage classification;
- goals;
- Skills Passport;
- portfolio items and review;
- Question Bank, self-marking attempts and paper builder;
- learning-video library and a guarded candidate-review process;
- 550 interactive simulations and 1,100 model-derived self-checks;
- pathways and subject preferences;
- parent growth surfaces.

The problem is mainly **integration and teacher workflow**, not absence of isolated features.

## The most important NEYO gap

NEYO’s CBE records are structurally connected in the database and documentation, but the teacher experience still feels like separate workspaces:

- `/cbc`
- `/competencies`
- `/assessments`
- `/syllabus`
- `/portfolio`
- `/learning-videos`
- Question Bank modal
- simulations

A teacher does not yet begin at one sub-strand and move naturally through:

> Curriculum intent → suggested learning experience → lesson delivery → learner evidence → formative assessment → competency judgement → intervention → portfolio → parent explanation.

That is why the founder correctly feels “CBE learning is not tied.”

## Missing or weak areas compared with the public EduPoa idea

### 1. Full curriculum-design object

NEYO’s `CbcStrand` and `CbcSubstrand` models currently store name and learning outcome. Public EduPoa demonstrations show a richer curriculum design around each sub-strand.

NEYO is missing first-class fields/relations for:

- suggested learning experiences;
- key inquiry questions;
- core competencies explicitly mapped to the sub-strand;
- values explicitly mapped to the sub-strand;
- pertinent and contemporary issues (PCIs);
- links to other learning areas;
- community service learning opportunities;
- suggested learning resources;
- assessment rubrics/criteria attached to the curriculum node;
- expected lesson count/time allocation where officially available;
- source/version/page reference and effective curriculum version.

Do not scrape or copy copyrighted curriculum documents blindly. Content requires lawful sourcing, versioning and curriculum review.

### 2. One teacher-facing CBE delivery workspace

NEYO needs a “Teach this sub-strand” workspace, not another global module.

A teacher should see in one compact flow:

1. intended outcome;
2. suggested experience/resources;
3. linked competencies, values and PCIs;
4. lesson plan/record of work;
5. learner roster;
6. quick rubric observation;
7. evidence upload;
8. learners needing support;
9. next action;
10. parent-safe progress summary.

Existing services should be reused rather than rebuilt.

### 3. Delivered-learning record as the joining object

The current chain has LessonPlan, observations, assessments, competency evidence, syllabus topic and portfolio, but there is no single obvious “this lesson/sub-strand was delivered to this class on this date” record joining all outputs.

A future delivery/session record could link:

- class;
- teacher;
- subject/learning area;
- strand/sub-strand;
- timetable slot;
- lesson plan;
- resources;
- attendance context;
- learner observations;
- assessment plan/records;
- competency evidence;
- syllabus coverage;
- portfolio artefacts.

This would make “covered” evidence-based and reduce duplicate teacher entry.

### 4. Automatic but reviewable evidence propagation

NEYO documents some syncing, but the workflow should visibly propose—not silently force—downstream updates:

- assessment result proposes CBE rubric level;
- approved competency evidence proposes Skills Passport update;
- delivered lesson proposes syllabus progress;
- approved artefact proposes portfolio inclusion;
- repeated low evidence proposes intervention/goal;
- released progress proposes parent-safe summary.

Every proposal needs source, date, teacher, confidence/rule and review status.

### 5. Learner intervention loop

Weakness Focus exists around Question Bank, but NEYO needs one broader CBE support loop:

- identify outcome below expectation;
- show evidence causing the conclusion;
- assign differentiated activity/resource/simulation/question set;
- set target and review date;
- reassess;
- show improvement or continued need;
- communicate a parent-friendly next step.

### 6. Curriculum completeness and readiness dashboard

Before term begins, leadership needs:

- grades with curriculum loaded;
- subjects mapped to official curriculum version;
- sub-strands missing rich design fields;
- teacher allocations;
- resources available/missing;
- assessment plans prepared;
- progress by class;
- self-reported vs evidence-verified coverage;
- learners with insufficient evidence;
- moderation backlog.

### 7. Parent explanation, not just levels

A parent should see:

- what the learner can do;
- evidence used;
- progress over time;
- what “EE/ME/AE/BE” means;
- one next action at home;
- teacher/school next action;
- clear distinction between missing evidence and Below Expectation.

### 8. Senior School pathway evidence

NEYO has pathways/preferences and extensive Grade 10 timetable work. The missing tie is evidence-based guidance:

- learner interests;
- performance/competency evidence;
- talents/portfolio;
- subject eligibility/prerequisites;
- pathway preference;
- teacher/counsellor recommendation;
- parent acknowledgement;
- final placement decision and rationale.

No algorithm should decide a learner’s future without human review.

### 9. CBE onboarding story

EduPoa’s “preconfigured and ready” message is easy to understand. NEYO’s richer system can feel empty unless seeded and mapped.

NEYO needs one guided readiness path:

1. select school levels;
2. create/map subjects;
3. apply reviewed curriculum version;
4. install competencies/rubrics/values;
5. map teachers/classes;
6. create first assessment plan;
7. record sample evidence;
8. preview learner/parent report;
9. show readiness status.

### 10. Public demonstration narrative

NEYO should not copy EduPoa’s branding or interface. Borrow the communication structure:

- start with a teacher burden;
- show official curriculum structure;
- demonstrate one sub-strand;
- show the teacher action;
- prove learner/parent outcome;
- promise the next episode.

NEYO can differentiate by showing the whole evidence chain, not only a digitised curriculum document.

## Recommended first CBE series

1. “A PDF is not a CBE workflow” — open one sub-strand and show the intended connected journey.
2. “Missing evidence is not Below Expectation” — show blank vs assessed learner.
3. “One practical task, several kinds of evidence” — assessment, competency, portfolio.
4. “What parents should understand about ME/AE/EE/BE.”
5. “From weakness to intervention and reassessment.”
6. “How Senior School pathway guidance should use evidence without replacing people.”

## What not to copy

Do not copy:

- EduPoa names, visual design, wording or proprietary curriculum data;
- claims such as KICD approval;
- testimonials, prices or customer counts;
- “bank-level security” or integration claims;
- private workflow details not visible publicly.

Borrow only general product lessons: narrow positioning, preconfiguration, curriculum-first navigation, parent explanation, useful educational content and short demonstrations.

## Sources

- EduPoa public website: https://edupoa.com/
- EduPoa YouTube demonstration, “Digitizing the Entire CBE Curriculum”: https://www.youtube.com/watch?v=yBRCDzo_09o
- EduPoa digital-learning article: https://www.edupoa.com/blog/digital-learning-in-kenya-how-technology-is-transforming-education/
- EduPoa pathway article discovered in public search: https://edupoa.com/blog/understanding-cbe-pathways-a-guide-to-kenyas-senior-secondary-education-choices/
- Public TikTok discovery result for EduPoa-branded Grade 10 parent guidance: https://www.tiktok.com/discover/how-to-download-admissions-letter-at-jkuat-portal
- NEYO source of truth: `docs/FEATURES-CHECKLIST.md`
- NEYO CBE manual: `docs/founder-manual-v2/11-CBE-COMPETENCIES-ASSESSMENTS-SYLLABUS-PORTFOLIO-QUESTION-BANK-AND-VIDEOS.md`
- NEYO schema: `prisma/schema.prisma`
