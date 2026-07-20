# NEYO Social Demonstration, Feature Testing and 30-Day Campaign Playbook

**Prepared:** 20 July 2026  
**Audience:** NEYO founder  
**Purpose:** A serious, evidence-based operating guide for testing NEYO, demonstrating it publicly, and turning social attention into school conversations.

---

## 1. Executive decision

NEYO should not be marketed as “a system with hundreds of features.” That is difficult to understand and impossible to prove in one video.

Market NEYO as a connected Kenyan school operating system:

> **One school event enters once, then the right people, records, money, documents and follow-up workflows update together.**

The campaign should demonstrate short, believable school stories. Each story begins with a real problem, shows a small workflow, proves the saved outcome, and ends by showing one connected downstream effect.

Examples:

- A parent pays → the payment is matched → the learner balance changes → a receipt becomes available.
- A learner arrives → attendance is recorded → the class register changes → an absence follow-up can be triggered.
- A teacher records marks → results remain controlled → review/release happens → the parent sees only released results.
- A school configures subjects and teacher allocations → the timetable engine generates → clashes are checked → the timetable is printed.
- A library book is issued → a physical copy is tracked → return/overdue state changes → a fine or recovery workflow can follow.

This is stronger than showing disconnected menus.

---

## 2. Evidence standard for every public claim

Before posting a feature, classify it:

### Green — safe to demonstrate

Use when you have personally completed the workflow in the deployed preview and seen the saved result after refreshing.

Required evidence:

1. The button exists and is reachable for the correct role.
2. The workflow completes without a hidden manual database edit.
3. The saved record remains after refresh.
4. A downstream screen shows the expected result.
5. No private learner, parent, staff or credential data appears.

Public language:

- “Here is how NEYO records…”
- “In this demo school…”
- “The bursar can…”
- “The record is now saved and visible here…”

### Amber — demonstrate with a limitation statement

Use for workflows that work in code but depend on environment configuration, external services, release flags or an unverified device.

Examples:

- M-Pesa credentials not live-tested with a school shortcode.
- OCR/Bundi scan fallback where real OCR is not configured.
- GPS clock-in without a controlled real-device field test.
- online classes without a multi-device connectivity test.
- YouTube candidates not yet reviewed and published.

Public language:

- “This environment is in manual reconciliation mode.”
- “When the school connects its provider…”
- “If scanning is unavailable, the teacher can continue manually.”
- “This is a test record, not a live payment.”

### Red — do not market as complete

Do not publicly claim:

- a real school is using NEYO unless it has agreed;
- live M-Pesa success without evidence;
- legal, regulatory or security certification that does not exist;
- hardware integration verified without the hardware;
- a production deployment is successful based only on local code;
- YouTube videos are approved when they remain candidates;
- Bundi is required for a workflow;
- real learner outcomes or money savings without measured customer evidence.

---

## 3. The NEYO feature map for demonstrations

The repository contains over 70 school-facing page routes and more than 200 persisted database models. Do not attempt to show all of them equally. Organise them into nine demonstration pillars.

## Pillar A — School setup, identity and access

### Main capabilities

- School profile, logo, type and education levels.
- Module activation and visibility controls.
- Users, staff, roles and permissions.
- owner/principal/deputy/HOD/teacher/bursar/reception/parent/student experiences.
- passkeys, biometric action gates, TOTP/recovery/device controls where enabled.
- audit records and critical-action controls.
- school branding and public-site configuration.

### Best social story

“Why a bursar should not see or change the same things as a teacher.”

### Test data

Create these users using fictional Kenyan names:

| Role | Demo user | Purpose |
|---|---|---|
| School Owner | Peter Mwangi | subscription, ownership and high-level approval |
| Principal | Grace Wanjiku | school control, releases and delegation |
| Deputy Principal | Daniel Otieno | attendance/discipline/operations |
| HOD Sciences | Mercy Chebet | department subjects and review |
| Teacher | Brian Ouma | attendance, lessons, marks, homework |
| Bursar | Faith Njeri | invoices, payments and reconciliation |
| Receptionist | Amina Hassan | visitors, inquiries and report-card day |
| Librarian | John Kamau | catalog, copies, issue/return |
| Parent | Ruth Achieng | learner portal and payments |
| Student | Kevin Kiptoo | practice, homework and released information |

Use separate browser profiles or private windows. Never show passwords on screen.

### Proof points

- Login as two different roles.
- Show that navigation and actions differ.
- Perform one restricted action and show the server rejects an unauthorised role.
- Return to the authorised role and complete it.

### Connected features

Identity connects to audit logs, approvals, messages, notifications, payment accountability, marks release, printing and every tenant-owned record.

---

## Pillar B — Admissions, students, guardians and classes

### Main capabilities

- inquiries and applications;
- interview/entrance-paper records;
- admission workflow and student creation;
- generated admission numbers and preserved legacy numbers;
- guardian linking and optional parent login;
- joining requirements and documents;
- student directory, filters and saved views;
- imports with preview/review;
- classes, streams, capacity and allocation;
- promotion, reshuffle, transfer, alumni and year history;
- student profile, documents, approvals and certificate handling.

### Best social story

“From admission application to a learner appearing in the correct class.”

### Test dataset

Use a small but varied cohort:

| Admission No. | Learner | Gender | Class | Guardian | Phone | Status |
|---|---|---|---|---|---|---|
| KHS/2026/001 | Kevin Kiptoo | M | Grade 7 East | Ruth Achieng | +254712345601 | ACTIVE |
| KHS/2026/002 | Mary Wambui | F | Grade 7 East | James Mwangi | +254712345602 | ACTIVE |
| KHS/2026/003 | Ali Hassan | M | Grade 7 West | Amina Noor | +254712345603 | ACTIVE |
| KHS/2026/004 | Faith Chebet | F | Grade 8 North | Lucy Chebet | +254712345604 | ACTIVE |
| KHS/2026/005 | Brian Otieno | M | Grade 8 North | Rose Atieno | +254712345605 | ACTIVE |
| KHS/2026/006 | Zawadi Juma | F | Grade 9 South | Hamisi Juma | +254712345606 | ACTIVE |

Add edge cases:

- one learner with two guardians;
- two siblings sharing one guardian;
- one missing optional birth certificate;
- one legacy admission number;
- one transfer request;
- one inactive/alumni learner;
- a class close to capacity.

### Test sequence

1. Create an inquiry.
2. Convert or create an application.
3. Add interview/entrance details if enabled.
4. Admit the learner.
5. Confirm the Student row exists.
6. Confirm guardian linkage.
7. Confirm class assignment.
8. Upload a fictional requirement document.
9. Refresh and confirm persistence.
10. Open the parent portal and confirm only the linked learner appears.

### Connected features

Students connect to attendance, invoices, payments, cafeteria, transport, hostel, library, discipline, clinic, exams, competencies, portfolio, messages, printing and the parent portal.

---

## Pillar C — Attendance, safety, gate, clinic and discipline

### Main capabilities

- class attendance registers;
- staff attendance and optional GPS controls;
- offline/PWA action concepts;
- absence follow-up and attendance visibility;
- visitor logs and reception;
- pickup persons and alternative pickup authorisation;
- gate passes and QR scan events;
- panic/safety records where enabled;
- discipline incidents, suspensions and counselling;
- student medical profile, clinic visits, medication plans and dose logs.

### Best social story

“A learner is marked absent, the school records the reason, and authorised staff can follow up without exposing medical details to everyone.”

### Test data

For one school day:

- 6 present learners;
- 1 absent — illness;
- 1 late — transport delay;
- 1 excused — competition;
- one clinic visit for a headache;
- one medication plan with a clearly fictional non-sensitive instruction;
- one minor discipline incident;
- one authorised pickup person;
- one visitor signed in and later signed out.

Never invent a serious medical diagnosis for social content. Use mild fictional scenarios and hide phone numbers.

### Proof points

- total present/absent changes;
- named learner’s attendance history updates;
- visitor status changes from on-site to signed out;
- role restriction prevents unrelated users from seeing confidential notes;
- gate/pickup record is associated with the correct learner.

### Connected features

Attendance links to parents, teacher portal, notifications, calendar and reports. Clinic and discipline link to student profiles and controlled role access. Reception links visitors, inquiries, documents and report-card day workflows.

---

## Pillar D — Academics, timetable and teacher work

### Main capabilities

- subjects, departments, HOD assignment and terms;
- teacher-subject allocation;
- lesson requirements and weekly loads;
- lesson plans, observations and resources;
- record of work and syllabus coverage;
- co-curricular activities and duty rosters;
- timetable configuration, breaks, lunch, Saturday and assembly;
- smart timetable generation, constraints, venues, combinations and options blocks;
- exam timetable and invigilators;
- timetable printing by class, teacher or venue.

### Recommended dataset

Create:

- Grade 7 East, Grade 7 West, Grade 8 North, Grade 9 South;
- Mathematics, English, Kiswahili, Integrated Science, Social Studies, CRE, Agriculture, Pre-Technical Studies, PE;
- 8 teachers with at least two subject links each;
- one science lab and one computer lab;
- Monday–Friday, 8 periods/day;
- 40-minute lessons;
- short break after Period 2;
- long break after Period 4;
- lunch after Period 6 for one grade group and after Period 7 for another test group;
- Saturday 08:00–12:40 for selected classes;
- 15-minute assembly before Period 1;
- one teacher time-off constraint;
- one whole-school blocked assembly slot;
- one double Mathematics requirement;
- one movement-heavy Science lesson;
- one combined lesson or options block.

### Timetable engine test protocol

Before generation:

1. Every required subject exists.
2. Every subject has an eligible teacher or an honest unassigned state.
3. Class weekly loads do not exceed available periods.
4. Teacher time off is entered.
5. venues are created and subject support is mapped.
6. lunch/break/Saturday rules are saved for the intended scope.

After generation, verify:

- no teacher appears in two classes at the same wall-clock time;
- no class has two lessons in one slot;
- venue capacity is respected;
- blocked slots are empty;
- double lessons are consecutive;
- lunch displays as a non-teaching row;
- teachers are not assigned to a class while that class is at lunch;
- different lunch shifts do not create hidden teacher clashes;
- Saturday starts/ends at the saved time;
- print view contains only the timetable document.

Repository evidence includes `npm run test:grade10-scale`, which exercises a synthetic 600-learner Grade 10 scenario. Use that as engineering evidence, not as a claim that a real 600-learner school has adopted NEYO.

### Best social story

“We gave NEYO classes, subjects, teacher availability and school-day rules—then checked whether the generated timetable had clashes.”

### Connected features

Teacher allocation affects timetable generation, exam invigilation, lesson plans and workload. Student subject selections affect options blocks. Schedule rules affect screen and print output. Terms affect exams, reports and academic history.

---

## Pillar E — Exams, assessment, CBE and learning

### Main capabilities

- exams and subject papers;
- marks entry and controlled review/release;
- paper-specific results;
- grading computation and report building;
- exam timetable and invigilator generation;
- exam paper scan/tidy/manual fallback;
- assessment types, plans, records and evidence;
- competencies and competency evidence;
- curriculum versions, grade bands and learning areas;
- rubrics and levels;
- syllabus topics and coverage;
- skills passport, goals and portfolio;
- Question Bank and self-marking attempts;
- interactive CBE simulations;
- vetted learning-video workflow.

### Test dataset

Create one Grade 7 Mathematics exam:

- title: Term 2 Mathematics Assessment;
- out of: 50;
- 6 learners;
- marks: 45, 39, 31, 25, 18, absent;
- one mark corrected before release;
- one moderation/review action;
- one approval request;
- release only after verification.

Create one CBE assessment:

- type: Practical Investigation;
- learning area: Integrated Science;
- competency: Critical Thinking and Problem Solving;
- rubric levels: Below, Approaching, Meeting, Exceeding;
- attach one fictional evidence image/file;
- one narrative observation;
- one portfolio item;
- one learner goal.

Question Bank test:

1. Open with no library and verify the Prepare Library state.
2. Prepare the library with an authorised role.
3. Filter by grade and subject.
4. deliberately choose filters with no match.
5. press Clear All Filters.
6. answer one self-marking item correctly and one incorrectly.
7. verify attempt feedback and persistence.
8. build a small printable paper.

### Important public limitation

The repository contains 150 hidden YouTube candidates across three review batches. Candidate discovery is not publication. Do not show them as approved until live availability, full human review, curriculum mapping and publication are complete.

The repository also contains 550 interactive CBE simulations and 1,100 self-checks. Demonstrate a real interaction—moving controls, observing output, answering and resetting—not only a count.

### Best social story

“A teacher records marks, corrects a mistake, and parents still cannot see anything until the school releases the result.”

### Connected features

Exam results feed computation, report cards, competency evidence and portals only through the controlled workflow. Question Bank supports practice and paper building. Portfolio, goals, skills and competency evidence combine into a broader learner story.

---

## Pillar F — Finance, M-Pesa and accountability

### Main capabilities

- fee structures by school/level/class;
- invoices, items, balances and receipts;
- cash payment requests and controlled recording;
- M-Pesa connection modes;
- manual reconciliation and statement imports;
- suspense transactions, matching and exact-once allocation;
- payment credentials and honest connection statuses;
- promises to pay;
- activities/trips and instalments;
- subscriptions and school billing;
- receipts and print station.

### Safe test data

Use fictional amounts and clearly label them DEMO:

| Learner | Invoice | Amount | Payment event |
|---|---:|---:|---|
| Kevin Kiptoo | Term 2 Tuition | KES 35,000 | M-Pesa demo transaction KES 20,000 |
| Mary Wambui | Term 2 Tuition | KES 35,000 | Cash request KES 10,000 |
| Ali Hassan | Trip | KES 4,500 | Promise KES 2,000 due in 7 days |
| Faith Chebet | Lunch Plan | KES 8,000 | fully paid |

Statement-import sample fields:

- Receipt No: DEMOQK12345;
- Completion Time: a current fictional date;
- Details: School Fees Kevin Kiptoo;
- Transaction Status: Completed;
- Paid In: 20,000;
- Balance: fictional;
- student admission reference where appropriate.

Never use a real M-Pesa receipt number or phone number in public content.

### Finance engine tests

1. Create fee structure.
2. generate invoice.
3. verify opening balance.
4. import a statement row into suspense.
5. verify duplicate import protection.
6. search and select the learner.
7. confirm allocation.
8. verify suspense status changes once.
9. verify learner balance decreases once.
10. retry the same action and confirm no duplicate allocation.
11. print/download the resulting receipt.
12. open parent portal and confirm the updated balance.

### Best social story

“A payment arrives without a perfect reference. NEYO holds it safely in suspense instead of guessing the learner.”

### Public limitation

Do not show “Credentials Verified” unless the environment genuinely verified them. “Saved — Not Tested,” “Manual Reconciliation,” and “Action Required” are valid honest states.

### Connected features

Finance connects to students, guardians, activities, cafeteria, hostel, transport, receipts, notifications, owner oversight, audit logs and the parent portal.

---

## Pillar G — Communication, LMS and parent experience

### Main capabilities

- conversations, participants and messages;
- acknowledgements/read information where enabled;
- bulk communication and delivery reports;
- teacher communication approvals;
- notifications and preferences;
- shared calendar;
- homework, class notes, submissions, quizzes and attempts;
- forums;
- online class sessions and questions;
- parent/student portal;
- class voice/internet-room foundations where released.

### Test dataset

- teacher posts Mathematics homework due Friday;
- learner submits a short fictional answer;
- teacher adds one class note;
- create a 3-question quiz;
- parent sees homework but not staff-only notes;
- send a class announcement;
- parent acknowledges it;
- create a calendar event for Parents Day;
- verify role visibility.

### Best social story

“A teacher posts homework once. The learner sees the task, the parent sees the deadline, and the school keeps one record.”

### Connected features

Class membership determines message and homework audiences. Calendar events support operations. Parent identity controls learner visibility. Notifications surface changes without replacing the underlying workflow.

---

## Pillar H — Physical operations

### Main capabilities

- library catalog, copies, issue/return and fines;
- hostel rooms, beds, allocations, attendance, exeat, damage and visitors;
- transport routes, shifts, riders, vehicles, drivers, fuel and maintenance;
- inventory stores, stock, batches and movements;
- assets and maintenance;
- suppliers, contracts, purchase requests, quotes and orders;
- cafeteria menus, tables, queues, cards, plans and requests;
- uniforms and orders;
- expenses and cost centres;
- reception and report-card day;
- print station and document verification.

### Cross-module demonstration story

“Follow one learner through a normal school day.”

1. Arrives and attendance is recorded.
2. Uses a meal card at lunch.
3. Borrows a library copy.
4. Boards an assigned transport route.
5. Parent receives the correct information.

### Test data

Library:

- 3 titles;
- 2–5 physical copies each;
- one issue, one return, one overdue;
- one damaged copy.

Hostel:

- one hostel, two rooms, four beds;
- two allocated boarders;
- one visitor and one exeat scenario.

Transport:

- route: Rongai–School;
- AM and PM shifts;
- one vehicle, one driver;
- six rider assignments;
- one route-change request;
- one maintenance and fuel record.

Inventory/procurement:

- exercise books, printer paper and laboratory gloves;
- opening stock, issue and adjustment movements;
- reorder threshold;
- two suppliers and two quotes;
- purchase request → quote comparison → purchase order.

Cafeteria:

- Monday lunch menu;
- one table;
- one meal plan;
- three meal cards;
- one queue check-in;
- one dietary note using non-sensitive fictional wording.

### Connected features

Every physical operation links back to real people, money, approvals, documents, notifications and audit history. That connection should be the demonstration, not merely the inventory list.

---

## Pillar I — Founder operations and platform controls

### Main capabilities

- feature release controls;
- support and customer threads;
- demo requests;
- customer interviews;
- NEYO Way operating tasks;
- school visits CRM;
- credentials vault;
- pricing and unit economics tools;
- storage, jobs, health and platform operations;
- YouTube candidate review and publication gate.

### Public treatment

Most founder operations should not be shown in early public videos. They contain internal commercial, credential, customer or operational information.

Safe founder story:

“I am building NEYO in Nairobi and documenting school problems before claiming product success.”

Do not screen-record the credentials vault, private customer threads, environment configuration, school contacts, pricing internals or secret values.

---

## 4. The tied-feature journeys to prioritise

A “tied feature” is a feature whose value appears only when another workflow uses its record. These journeys are NEYO’s strongest differentiator.

## Journey 1 — Admission to first school day

Inquiry → Application → Admission → Student → Guardian → Class → Joining documents → Attendance → Parent portal.

**Test proof:** every screen refers to the same fictional learner ID and no duplicate learner is created.

## Journey 2 — Fee to parent receipt

Fee structure → Invoice → Statement/suspense → Learner match → Payment allocation → Balance → Receipt → Parent portal.

**Test proof:** money changes exactly once and the audit trail identifies the actor.

## Journey 3 — Teacher work to parent result

Subject/teacher allocation → Timetable → Lesson plan → Assessment/exam → Marks → Review/release → Report → Parent portal.

**Test proof:** unreleased marks stay hidden; released results become visible.

## Journey 4 — CBE learner growth

Curriculum → Learning area → Strand/sub-strand → Assessment → Competency evidence → Goal → Skills Passport → Portfolio → Parent growth view.

**Test proof:** the evidence is attached to the correct learner and curriculum context.

## Journey 5 — Safe learner movement

Guardian → Pickup person → Alternative authorisation → Gate verification → Visitor/pickup record → Notification/audit.

**Test proof:** an unauthorised person cannot be silently accepted.

## Journey 6 — Timetable to daily execution

Classes → Subjects → Teacher eligibility → Lesson requirements → Constraints → Generation → Clash review → Publish/print → Teacher portal.

**Test proof:** screen and print agree, and no hidden wall-clock clash exists.

## Journey 7 — Procurement accountability

Low stock → Purchase request → Supplier quotes → Comparison → Purchase order → Stock receipt → Movement history → Expense/accountability.

**Test proof:** stock increases only when receipt is recorded, not when a quote is merely selected.

## Journey 8 — Homework communication

Class membership → Homework → Notification/message → Learner submission → Teacher feedback → Parent visibility.

**Test proof:** only the correct class and linked guardian receive access.

---

## 5. Standard demo-school dataset

Use one stable fictional school in every video so viewers recognise the story.

### School

- Name: Karibu High School — Demo
- County: Nairobi
- Type: Mixed Day and Boarding
- Currency: KES
- Phone: +254 700 000 000 (clearly fictional display number)
- Academic year: 2026
- Current term: Term 2
- Never use a real school logo without permission.

### Classes

- Grade 7 East — capacity 40
- Grade 7 West — capacity 40
- Grade 8 North — capacity 45
- Grade 9 South — capacity 45
- Grade 10 STEM — capacity 40

### Minimum students

Use 12–20 fictional learners for normal videos. This is enough to make tables and charts credible without making recording slow.

Include:

- gender variety;
- siblings;
- day and boarding learners;
- different fee balances;
- different attendance outcomes;
- one transport rider;
- one cafeteria enrolment;
- one library borrower;
- one CBE portfolio record.

### Staff

Use 10–12 fictional staff with clear roles and subject mappings. Ensure every public screen contains fictional names only.

### Data naming rule

Prefix risky external-looking identifiers with `DEMO`:

- DEMO-MPESA-001
- DEMO-PO-001
- DEMO-INV-001
- DEMO-VISITOR-001

This prevents a screenshot from being mistaken for a real transaction.

---

## 6. Founder testing method

Use this exact evidence sheet for every workflow:

| Field | What to record |
|---|---|
| Test ID | e.g. FIN-001 |
| Date/environment | preview URL and date |
| Role | exact account role |
| Starting records | learner, invoice, class or other prerequisites |
| Action | buttons and fields used |
| Expected result | visible and database/business outcome |
| Actual result | what happened |
| Refresh proof | whether result remains after refresh |
| Downstream proof | second module showing the effect |
| Mobile proof | result at 360px |
| Print proof | if applicable |
| Evidence | private screenshot/video filename |
| Status | Pass / Partial / Fail / Blocked |
| Limitation | credentials, hardware, release flag, data gap |

### Pass criteria

A test passes only when:

- the expected role can complete it;
- the wrong role cannot bypass permission;
- required data persists after refresh;
- duplicate submission does not create incorrect duplicates;
- the downstream module agrees;
- errors are understandable;
- phone controls remain reachable.

---

## 7. First video recommendation

## Video concept

**“A Kenyan school payment should not disappear because the parent typed the wrong reference.”**

This is a strong first video because:

- the problem is immediately understandable;
- it is Kenyan and operational;
- it shows money accountability rather than decorative software;
- it connects several NEYO modules;
- it can be demonstrated honestly in manual statement/suspense mode without claiming live Daraja credentials;
- principals, bursars and parents can all understand the value.

## Required preparation

Before recording:

1. Create Kevin Kiptoo with admission number KHS/2026/001.
2. Create a Term 2 invoice for KES 35,000.
3. Confirm opening balance is KES 35,000.
4. Prepare a fictional statement row for KES 20,000 with receipt `DEMOQK12345`.
5. Make sure no real phone numbers, credentials or browser bookmarks are visible.
6. Test the complete allocation once, then reset/reseed the demo data for recording.
7. Record vertically at 1080 × 1920.
8. Increase browser zoom only if necessary; do not crop away status messages.

## 35–45 second script

### 0–3 seconds — hook

Face camera or use bold text over the suspense screen:

> “What happens when a parent pays school fees but enters the wrong student reference?”

Do not begin with the NEYO logo.

### 3–8 seconds — problem

Show the fictional statement row entering suspense.

Voiceover:

> “The school should not guess where the money belongs—and it should not lose it.”

On-screen text:

> DEMO PAYMENT · NOT LIVE MONEY

### 8–20 seconds — action

Show:

- suspense transaction;
- learner search;
- Kevin Kiptoo selected;
- amount and reference confirmation;
- allocation action.

Voiceover:

> “NEYO holds the payment safely, lets the bursar find the learner, and asks for confirmation before allocation.”

### 20–30 seconds — proof

Show:

- suspense status changed;
- learner balance reduced from KES 35,000 to KES 15,000;
- receipt record.

Voiceover:

> “Once confirmed, the learner’s balance changes exactly once and the school keeps the record.”

### 30–38 seconds — tied feature

Open the parent portal balance or receipt view.

Voiceover:

> “The same update can then appear in the parent’s account—without entering the payment again.”

### 38–45 seconds — call to action

Face camera:

> “I’m building NEYO for Kenyan school operations. If you work in a school, what payment problem wastes your time most?”

On-screen CTA:

> Comment your school workflow problem — no private details.

## Caption

> A fee payment with the wrong reference should not disappear or be allocated by guesswork. This is a fictional demo of NEYO’s manual statement and suspense workflow—not a live M-Pesa transaction. I’m documenting real Kenyan school administration problems as I build. Which finance workflow should I test next? #KenyanSchools #EdTechKenya #SchoolManagement #BuildInPublic #NairobiTech

## Three hook variants to test

1. “A parent paid—but the school cannot tell which learner the money belongs to.”
2. “This is how schools accidentally allocate the same payment twice.”
3. “Wrong M-Pesa reference? The bursar should not have to guess.”

Post only one version first. Keep the other openings for later edits or repost tests.

---

## 8. Why this video structure follows current platform guidance

TikTok’s official creative guidance says that 90% of ad-recall impact is captured in the first six seconds, recommends communicating value early, showing the product, ending with a clear action, using vertical high-resolution footage and respecting the interface safe area. TikTok also recommends testing different hooks and using analytics such as watch time and engagement rather than relying only on views.

Sources:

- TikTok for Business, “Creative Best Practices for TikTok Ads”: https://ads.tiktok.com/business/en/blog/creative-best-practices-top-performing-ads
- TikTok for Business, “Creative advertising guide”: https://ads.tiktok.com/business/en/guides/what-is-ad-creative-guide

Apply this to organic NEYO content carefully: these sources discuss advertising and do not guarantee organic performance. The useful principles are early clarity, native vertical production, real people/product, captions, a clear close and iterative testing.

---

## 9. 30-day content campaign

Use four repeatable formats:

- **Problem → workflow → proof** (primary).
- **Founder learning** (human trust).
- **Myth or mistake** (education).
- **Build/test evidence** (credibility).

### Week 1 — establish the problem and founder

| Day | Video |
|---|---|
| 1 | Wrong-reference fee payment → suspense → balance proof |
| 2 | Founder introduction: 19-year-old University of Nairobi student building NEYO; ask school staff what wastes time |
| 3 | One learner, one record: admission → class → parent linkage |
| 4 | Role comparison: teacher vs bursar access |
| 5 | Attendance register in under 30 seconds |
| 6 | Honest limitation video: what NEYO does manually when an external integration is unavailable |
| 7 | Answer the best comment from Days 1–6 |

### Week 2 — academics and teacher work

| Day | Video |
|---|---|
| 8 | Teacher allocation → timetable input |
| 9 | Timetable generation and clash checklist |
| 10 | Different lunch shifts and why wall-clock conflicts matter |
| 11 | Lesson plan → record of work |
| 12 | Marks entered but not yet visible to parents |
| 13 | Principal/reviewer releases results |
| 14 | Parent sees released result only |

### Week 3 — learner and parent experience

| Day | Video |
|---|---|
| 15 | Homework posted once → learner and parent views |
| 16 | Question Bank empty state → prepare → filter → self-mark |
| 17 | One interactive CBE simulation with self-check |
| 18 | Competency evidence → Skills Passport |
| 19 | Portfolio item → parent growth view |
| 20 | Library physical-copy issue and return |
| 21 | Answer a school staff comment with a live workflow test |

### Week 4 — school operations and trust

| Day | Video |
|---|---|
| 22 | Visitor sign-in → sign-out |
| 23 | Safe pickup authorisation story |
| 24 | Clinic confidentiality and role access—use mild fictional data |
| 25 | Low stock → request → quote → stock receipt |
| 26 | Transport route and rider assignment |
| 27 | Cafeteria meal card and queue entry |
| 28 | Print Station: clean document vs printing the app screen |
| 29 | “What failed in my testing this month” honest founder report |
| 30 | Monthly recap and invitation for pilot-school conversations |

Do not record all 30 before posting. Batch 5–7 at a time, then adjust based on comments and retention.

---

## 10. Recording standard operating procedure

### Before recording

- Use the preview/demo environment, never a production school account.
- Reset notifications that expose internal details.
- Close email, WhatsApp, password manager and developer consoles.
- Enable Do Not Disturb.
- Use fictional records.
- Verify the workflow from start to finish.
- Write the expected final proof before recording.
- Prepare a 9:16 screen layout and keep critical controls away from platform UI edges.

### During recording

- Show a face or movement in the opening when possible.
- State the problem in the first sentence.
- Keep one video to one main outcome.
- Use captions because many viewers watch without sound.
- Zoom into only the relevant region; do not make viewers read a full dashboard.
- Keep loading time out of the final edit unless it is part of an honest performance test.
- Show the success/status message and the persisted record.
- Avoid exaggerated claims such as “revolutionary,” “perfect,” or “zero errors.”

### After recording

- Review frame by frame for names, phone numbers, emails, keys and balances.
- Add “DEMO DATA” when money or personal records appear.
- Export without watermarks so each platform receives a clean native upload.
- Use platform-native captions where practical.
- Save the source file with a test ID, e.g. `FIN-001-wrong-reference-v1.mp4`.
- Record the post URL and metrics after 2 hours, 24 hours, 72 hours and 7 days.

---

## 11. Campaign measurement

Track more than followers.

| Metric | What it teaches |
|---|---|
| 3-second hold | whether the hook is clear |
| average watch time | whether the story maintains interest |
| completion rate | whether pacing and length work |
| rewatches | whether the workflow is useful or too fast |
| saves | educational usefulness |
| shares | relevance to school staff/parents |
| comments from school roles | problem validation |
| profile visits | interest in NEYO, not only the topic |
| qualified DMs | potential interviews or demos |
| school conversations booked | movement toward market learning |
| pilot requests | commercial intent |
| recurring objections | product/positioning work |

Create a weekly decision:

- **Continue:** strong retention and qualified comments.
- **Change hook:** useful comments but weak opening retention.
- **Simplify:** repeated confusion about what happened.
- **Investigate product:** repeated real school problem not handled.
- **Stop:** views without relevant audience or learning after several tests.

Do not buy ads in the first week. First learn which organic story produces qualified school conversations. If a post performs organically and remains accurate, paid promotion can be considered later.

---

## 12. Social comment and lead handling

When someone comments with a school problem:

1. Thank them.
2. Ask their role and school type, not private learner information.
3. Ask how they handle it today.
4. Ask where the delay/error occurs.
5. Offer a short demo only when relevant.
6. Record the insight in School Visits/customer interview operations.
7. Never promise a build date publicly.

Suggested reply:

> “Thank you—are you seeing this as a bursar, teacher, parent or administrator? Please don’t post learner details. I’d like to understand how your school handles it today.”

---

## 13. What not to show

Never expose:

- `DATABASE_URL`, encryption keys or environment variables;
- seed passwords or login credentials;
- founder credentials vault values;
- private GitHub or Vercel settings;
- real M-Pesa credentials or transaction data;
- real learner medical, discipline or identity documents;
- staff salaries tied to real names;
- school contracts, customer threads or internal pricing decisions;
- unpublished YouTube candidates;
- API keys, webhook secrets or QR tokens that grant access.

Blur is not enough for secrets. Do not record them in the first place.

---

## 14. Final campaign position

The founder’s strongest position is not pretending NEYO is already a market leader. It is:

> “I am building and testing a connected Kenyan School OS in public. I will show the workflow, the result, the limitation and what school staff teach me.”

That positioning is credible, human and appropriate before launch. The campaign’s goal for the first 30 days is not viral fame. It is to discover which school problems produce trust, conversation, demonstrations and potential pilot relationships.

---

## 15. Repository references for deeper operation

Use these existing manuals when preparing each video:

- `docs/FEATURES-CHECKLIST.md` — source of truth for feature status.
- `docs/founder-manual-v2/05-STUDENTS-GUARDIANS-CLASSES-IMPORTS-TRANSFERS-AND-ALUMNI.md`
- `docs/founder-manual-v2/07-ATTENDANCE-CLASS-REGISTERS-STAFF-GPS-OFFLINE-SMS-AND-INSIGHTS.md`
- `docs/founder-manual-v2/09-TIMETABLE-AND-SMART-TIMETABLE-COMPLETE-GUIDE.md`
- `docs/founder-manual-v2/10-EXAMS-MARKS-REPORTS-PAPER-SCANS-AND-EXAM-TIMETABLE.md`
- `docs/founder-manual-v2/11-CBE-COMPETENCIES-ASSESSMENTS-SYLLABUS-PORTFOLIO-QUESTION-BANK-AND-VIDEOS.md`
- `docs/founder-manual-v2/14-FINANCE-FEES-INVOICES-MPESA-CASH-RECONCILIATION-AND-ACTIVITIES.md`
- `docs/founder-manual-v2/16-COMMUNICATION-MESSAGES-NOTIFICATIONS-AND-CALENDAR.md`
- `docs/founder-manual-v2/18-LIBRARY-CATALOG-COPIES-ISSUE-RETURN-FINES-IMPORT-AND-QR.md`
- `docs/founder-manual-v2/19-HOSTEL-DORMS-BEDS-CURFEW-FEES-EXEAT-DAMAGE-AND-VISITORS.md`
- `docs/founder-manual-v2/20-TRANSPORT-ROUTES-SHIFTS-RIDERS-FLEET-DRIVERS-FUEL-AND-REQUESTS.md`
- `docs/founder-manual-v2/21-INVENTORY-UNIFORMS-ASSETS-SUPPLIERS-PROCUREMENT-AND-EXPENSES.md`
- `docs/founder-manual-v2/22-CAFETERIA-MENUS-MEAL-CARDS-TABLES-QUEUE-RATIONING-AND-POCKET-WALLET.md`
- `docs/founder-manual-v2/23-DISCIPLINE-CLINIC-SECURITY-GATE-AND-RECEPTION.md`
- `docs/founder-manual-v2/24-DOCUMENTS-PRINT-STATION-EXPORTS-VERIFICATION-AND-DYNAMIC-PERIODS.md`
- `docs/founder-manual-v2/30-MASTER-DAILY-WEEKLY-TERM-AND-YEAR-END-CHECKLISTS.md`
