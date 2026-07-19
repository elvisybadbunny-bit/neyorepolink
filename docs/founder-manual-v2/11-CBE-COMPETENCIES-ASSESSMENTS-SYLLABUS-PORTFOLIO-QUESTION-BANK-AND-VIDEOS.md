# NEYO Founder Manual V2 — Module 11: CBE, Competencies, Assessments & Learning Evidence

**Pages:** `/cbc`, `/competencies`, `/assessments`, `/syllabus`, `/portfolio`, `/learning-videos`  
**Last verified against code:** 2026-07-18

---

## 1. How the evidence system connects

- Curriculum/Subject → Strand → Sub-strand
- Class/Learner + strand → CBE observation (EE/ME/AE/BE)
- Configurable Competency → evidence → approval → learner summary/heatmap
- Flexible Assessment Plan → records/evidence/moderation/release
- Lesson/Record of Work/assessment → Syllabus verification
- Portfolio item → review/approval → family-safe timeline/PDF
- Question Bank/Paper Quiz/Videos → practice/teaching/formative evidence

These are connected but not interchangeable. A video watched is not an assessment; a teacher saying
Covered is not automatically verified evidence.

---

## 2. CBE access and three tabs

`/cbc` requires `academics.view`. Manage requires `academics.manage`; Assess requires
`exam.enter_marks`.

Tabs:

1. Strands
2. Assess (only assess permission)
3. Learner Report

---

## 3. Strands tab actions

Managers see:

- **New strand**
- per-subject KICD preset buttons
- YouTube Video Library
- Question Bank & Book Scan
- Inter-School Contests
- Universal Presets

Subjects group cards. Click strand header expands learning outcome/sub-strands. Strand-row actions
open videos/practice where released. Managers can add/delete sub-strands.

### New Strand

Choose Subject, enter Strand name and Learning Outcome → Save. Duplicate subject/name blocked.

### Sub-strands

Expand strand, enter new name/outcome → Add. Trash removes only with authorized immutability rules;
assessment-linked deletion may be blocked.

---

## 4. Curriculum libraries

Cards:

- Primary & Pre-Primary PP1–Grade 6
- Junior Grade 7–9
- Senior Grade 10–12

For each: select Grade, choose matching school Subject, preview exact KICD strands/sub-strands, press
Apply. Re-applying is idempotent/skips existing grade-prefixed rows.

**Gap fixed:** Senior card displayed two contradictory headings—Grade 10–12 and stale Grade 10.
Removed stale duplicate and merged accurate explanation.

Libraries add content to selected Subject; they do not create school Subject automatically or assign
classes/teachers.

---

## 5. Universal Presets

Opens one-click setup for seven core competencies, official four-point rubrics and core values/duty
areas. Preview/count then Apply; rerun idempotent. Release flag controls availability.

---

## 6. Assess tab

Select Class and Strand (and sub-strand where current UI supports). Sheet loads scoped learners and
latest observation.

For each learner press rubric pill:

- EE / Level 4 — Exceeding Expectations
- ME / Level 3 — Meeting Expectations
- AE / Level 2 — Approaching Expectations
- BE / Level 1 — Below Expectations

Enter/comment where available. **Record N observations** creates append-only CbcAssessment rows;
latest drives summary, history remains. Do not overwrite evidence simply to improve report.

### Paper Quiz to Rubrics (EE.9)

Button opens:

1. Setup/Create or Scan quiz.
2. Print student sheet with rubric box.
3. Enter numerical scores; deterministic thresholds convert to EE/ME/AE/BE.
4. Review drafted comments.
5. **Confirm & Post N Formative Rubrics** transactionally creates CBE observations.

A scanned question/score must be reviewed before posting.

---

## 7. Comment Bank

Default/subject comment entries map level/strand/sub-strand to parent-friendly language. Seed default
bank, add/edit/delete entries, and auto-resolve comments during assessment/report workflow. Comments
must describe evidence, not label a child permanently.

---

## 8. Learner Report

Search/select learner. Loads grouped subject competencies, latest strand levels, averages/overall and
parent-friendly lines.

**KICD Report PDF** produces branded QR-verifiable report. Parent/student access remains own child/
own record. A missing assessment should remain blank, not be interpreted BE.

---

## 9. Competency Framework page

Ensures default framework and loads board.

Buttons by permission:

- **New Group**: create group/category, ordering/scope fields in modal.
- Add/edit competency inside group through group/competency forms.
- **Record Evidence**: learner, competency, level/rating, date, description and attachment/reference.
- Edit Evidence.
- Approve/Reject Evidence for authorized reviewer.
- Heatmap filters by class/grade band.
- Learner Summary: enter/paste Student ID → Load.

Evidence approval separates teacher submission from verified learner record. Do not approve your own
unclear evidence merely to finish a report.

---

## 10. Flexible Assessments page

Supports projects, practicals, oral work, observation and portfolio-linked assessment without
replacing Exams/CBE/LMS.

Main objects/buttons:

- Assessment Types: create/update scale/category.
- Assessment Plans: class/subject/type/title/dates/rubric/status; create/update.
- Open Assessment Sheet.
- Score learner record; update score/level/comment.
- Attach Evidence.
- Moderate record (approve/return/notes).
- Release Plan after review.

Released assessment becomes visible according to portal/report integration. Draft records remain
staff workflow.

---

## 11. Syllabus Coverage

Buttons:

- **Add scope topic**
- Toggle **Academics Report** / Topics view
- Filters class/subject/status
- Topic buttons **In Progress**, **Covered**

Add dialog: Class, Subject, Term optional, Topic, scope reference, Deadline, Teacher, Notes → **Save
topic**.

Academics Report classifications:

- VERIFIED_COVERED: real assessment/delivered evidence supports.
- SELF_REPORTED_ONLY: teacher marked covered but no learner evidence.
- IN_PROGRESS
- NOT_COVERED

Assessments and delivered lesson plans can auto-sync topic status. Delete is leadership-restricted to
preserve academic history.

---

## 12. Question Bank & Book Scan (EE.8)

From CBE Strands open Question Bank.

Tabs/workflows include:

- Browse/Practice: filter grade/subject/strand/difficulty, diagrams, check answer.
- Select for Print: choose questions.
- Print Custom Exam: title, time, answer-key toggle → official paper/teacher guide.
- Weakness Focus: recommendations from low CBE levels/incorrect attempts, with reason.
- Scan Textbook Page: image/camera → Bundi candidate extraction → review → add school/national
  submission according to scope.
- Seed All/Junior/Primary-Senior where authorized/released.

Current verified seeded repository count in project history is 2,670 unique questions. Do not use
that historical count as live tenant row count without checking seeding/current database.

National-sharing and copyright require Ops approval; OCR extraction does not grant rights.

---

## 13. YouTube Learning Library (EE.7)

From Strand or `/learning-videos`:

- Search query and **Search** (live API only when key/quota).
- Suggested idea buttons fill/run search.
- Paste YouTube link/ID → **Save Link**.
- Results: **Watch**, **Save**, **Cast**.
- Embedded player uses privacy-enhanced YouTube domain where library modal specifies.
- **Videos shown in class** opens history; select to watch again.

School-saved videos are tenant-private; National submissions go Pending Ops and approved videos can
be reused zero-search-quota. Cast records class session/history; ensure projector/display and content
appropriateness.

---

## 14. Portfolio page

Search/select learner or enter through `?studentId=`. Timeline includes projects, creative work,
certificates, coding and community activities.

Actions according to role:

- Submit/Add portfolio item: title/type/date/description/file/evidence links.
- Edit own/pending item.
- Approve or Reject with note.
- Delete under service rules.
- Filter/search review queue; Clear Filters.
- Export portfolio pack / PDF booklet with approved items and competencies.

Student uploads remain encrypted/private until school review determines family visibility. Rejecting
does not imply learner failure; use constructive reason.

---

## 15. Learning Videos standalone page

Search/saved library; watch inside NEYO; cast; shown-in-class history. It is a teacher presentation
surface, while CBE modal additionally links videos to grade/subject/strand and national vetting.

No YouTube API key: paste/save and approved repository still work; live search should fail gracefully.

---

## 16. Full formative workflow example

1. Apply Grade 7 Mathematics curriculum preset to correct Subject.
2. Open Numbers strand/sub-strand.
3. Link approved video and show class.
4. Create/scan paper quiz; review 10 marks.
5. Print, administer, enter scores.
6. Review deterministic rubric conversions, post to CBE.
7. Add competency evidence from project, reviewer approves.
8. Mark syllabus topic Covered; Academics Report verifies assessment evidence.
9. Approve portfolio artifact.
10. Generate learner CBE report and portfolio PDF.

---

## 17. Common errors

| Problem | Check |
|---|---|
| CBE Assess missing | `exam.enter_marks` |
| Curriculum card unavailable | EE.3 release and real matching subject code |
| Duplicate strands | use grade-prefixed preset/idempotent apply |
| Senior heading wrong | fixed stale Grade 10 duplicate |
| No learners | class assignment/scope |
| Paper quiz cannot post | scores/batch/strand/status/release |
| Question bank empty | filters/seed/release/scope |
| Weakness suggestions empty | no low-level/incorrect evidence |
| Live video search unavailable | YouTube key/quota; paste/repository fallback |
| Portfolio item not family-visible | pending/rejected, privacy review |
| Syllabus self-reported | add delivered/assessment evidence |
| Competency evidence unapproved | authorized reviewer decision |

---

## 18. Founder verification checklist

1. CBE presets across Primary/Junior/Senior and idempotency.
2. Senior card one correct Grade 10–12 heading (fixed).
3. Create strand/sub-strand and deletion guard.
4. Teacher own-class Assess; append-only history.
5. Paper quiz score→rubric→transactional observations.
6. Learner report/PDF own-child scope.
7. Universal Presets idempotent.
8. Competency group/item/evidence/approval/heatmap/summary.
9. Assessment type/plan/sheet/evidence/moderation/release.
10. Syllabus topic and verified/self-reported classifications.
11. Question Bank practice/print/scan/weakness/cross-tenant.
12. Video search fallback/save/watch/cast/history/national privacy.
13. Portfolio submit/review/approve/reject/export privacy.
14. Cross-tenant direct ids and denied roles.
15. Mobile/glass/print/loading/empty/error states.

---

## 19. Gap fixed

Removed contradictory duplicate Senior curriculum title/description. The card now has one accurate
Grade 10–12 heading and combined explanation. No schema/API/service change required.

---

## 20. Edit points

- CBE: `cbc-client.tsx`, `cbc.service.ts`, `/api/cbc/*`
- Competencies: `competency-framework-client.tsx`, `competency.service.ts`
- Assessments: `assessment-engine-client.tsx`, `assessment.service.ts`
- Syllabus: `syllabus-client.tsx`, `syllabus.service.ts`
- Question Bank/Paper Quiz/Video modals and corresponding services
- Portfolio: `portfolio-client.tsx`, `portfolio.service.ts`
- Standalone videos: `learning-videos-client.tsx`, `youtube-learning.service.ts`


## Interactive CBE simulation roadmap

The founder clarified that the target is 500 genuinely interactive Grade 7–12 CBE simulations, not 500 static lesson ideas. The earlier blueprint catalog was removed. Delivery now proceeds in scientifically reviewable batches of 50. Eleven batches now contain 550 live, variable-driven simulations built from 110 distinct models and five challenge contexts. The founder deliberately raised the delivery from the original 500 target to 550, prioritising technical and practical subjects for the final 200. Batch 2 added Business Studies, Geography, Agriculture, Computer Science, English, History and Citizenship, Creative Arts and Health Education. Batch 3 adds quadratic and wave models, inheritance probability, map scale, construction materials, English comprehension, Kiswahili oral fluency, civic decisions, ethical reasoning and visual-design scale. Batch 4 adds percentage change, simple interest, gear ratios, transformers, mechanical advantage, recipe scaling, fabric cost, media storage, Indigenous Language accuracy and fisheries sustainability. Batch 5 adds gas pressure and reaction-rate indices, cardiac output, osmosis gradient, feed cost, data-transfer time, break-even quantity, training load, solar energy and rainwater harvesting. Batches 6–7 add energy, efficiency, pressure, concentration, molarity, half-life, microscopy, respiration, biodiversity, agriculture input rates, transport cost, exchange, tax-inclusive pricing and further Mathematics/wave models. Every displayed item has sliders, immediate calculated output, reset, visual response, grade band and learning outcome. The existing detailed Ohm’s Law, Levers/Moments and Pythagoras SVG labs remain separate.

The interface truthfully states 550 are complete, exceeding the original 500 target. The final technical batches cover Electrical Technology, Power Mechanics, Building and Construction, Metal Technology, Wood Technology, Media Technology and additional Physics, Chemistry and Biology models. Future batches should broaden from core STEM into the founder-selected all-CBE scope, using interactive learning experiences where a non-STEM learning area does not have a legitimate laboratory equation. Each batch requires curriculum review, mobile testing, scientific/pedagogical checks and explicit status before release.


### Simulation self-check questions

Every one of the 550 simulations now includes two additional interactive questions. **Self-check calculation** asks the learner to calculate the current output and accepts a numerical answer within 2% tolerance. **Prediction question** asks what happens when the first variable increases one step while the second stays fixed; NEYO derives the correct answer from the same live model at the current values, including non-linear and capped cases. This adds 1,100 contextual checks without storing duplicate static question text. Changing a slider resets feedback; learners can verify predictions by moving the control.
