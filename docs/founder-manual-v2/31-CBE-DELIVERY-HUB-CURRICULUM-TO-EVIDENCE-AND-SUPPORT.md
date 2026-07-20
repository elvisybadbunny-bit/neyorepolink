# NEYO Founder Manual V2 — Module 31: CBE Delivery Hub

**Page:** `/cbe-delivery`  
**Purpose:** Join curriculum intent, actual classroom delivery, learner evidence and reviewed support without replacing NEYO’s existing CBE, Assessments, Competencies, Syllabus, Portfolio, Question Bank, simulations or parent workflows.

## 1. Why this module exists

NEYO already stored many parts of CBE, but teachers had to move between separate modules. The Delivery Hub provides one operational spine:

> Reviewed curriculum design → delivered session → learner evidence → support/reassessment.

It does not copy another company’s interface or proprietary curriculum content. It implements general curriculum-first workflow ideas using NEYO’s own design, permissions and data.

## 2. Prerequisites

Before opening the hub:

1. School levels and CBE subjects exist.
2. Classes exist.
3. CBE strands and sub-strands have been loaded or entered.
4. Staff roles and permissions are configured.
5. Active learners are assigned to classes.
6. Competencies/rubrics should be configured if they will be referenced.

`academics.view` opens the board. Curriculum-design and session changes require `academics.manage`. Learner evidence and interventions require `exam.enter_marks`.

## 3. Tab 1 — Curriculum intent

### Fields

- **Sub-strand:** the existing school-owned CBE sub-strand.
- **Suggested learning experiences:** one reviewed activity per line.
- **Key inquiry questions:** one inquiry per line.
- **Competency codes/names:** references to configured competency definitions.
- **Values:** reviewed values relevant to the learning experience.
- **Pertinent and contemporary issues:** contextual issues relevant to delivery.
- **Suggested resources:** materials or links the teacher can use.
- **Assessment criteria:** observable evidence expected from learners.
- **Community service ideas:** optional service-learning connections.
- **Source label/version/reference:** where the school obtained and reviewed the guidance.
- **Lessons:** optional expected allocation.
- **Review state:** Draft, Reviewed or Published for Teachers.

### Save result

NEYO creates or updates one `CbeCurriculumDesign` for the selected sub-strand. Re-saving the same sub-strand updates the same design instead of duplicating it.

### Safety

- Draft content is visibly Draft.
- NEYO does not scrape curriculum documents.
- Publishing records reviewer identity/time.
- Schools must confirm lawful source and curriculum accuracy.

## 4. Tab 2 — Deliver lesson

Choose:

- curriculum design;
- class;
- date;
- Planned/Delivered/Reviewed status;
- what actually happened;
- resources actually used;
- next teaching step.

### Database result

Creates `CbeDeliverySession`, recording the signed-in teacher as the actor. Optional ID fields can connect a real Timetable Slot, Lesson Plan, Syllabus Topic or Assessment Plan once those records exist.

### Meaning

This is the joining record proving that a curriculum intention became a real class event. It does not automatically mark the syllabus verified or create assessment results.

## 5. Tab 3 — Learner evidence

Choose a delivery session. NEYO only offers learners assigned to that session’s class.

Fields:

- learner;
- optional CBE level 1–4;
- observation describing what the learner demonstrated;
- optional evidence URL.

### Database result

Creates append-only `CbeDeliveryEvidence`. It records actor and timestamp.

### Existing workflow links

The model can reference existing:

- `CbcAssessment`;
- `AssessmentRecord`;
- `CompetencyEvidence`;
- `PortfolioItem`.

Those references are not fabricated. Each authoritative workflow must create/review its own record first.

## 6. Tab 4 — Support loop

Fields:

- learner;
- sub-strand;
- evidence-based reason;
- action type: reteach, question set, simulation, resource, goal or other;
- action details;
- target level;
- review date;
- optional parent-safe summary.

### Database result

Creates `CbeIntervention` with status Planned. The record can later move through In Progress, Reviewed and Closed, storing outcome and reviewed level.

### Principle

A low observation must lead to a reviewed support action—not a permanent label. Missing evidence must not be treated as Below Expectation.

## 7. Integration with existing modules

### CBE Management (`/cbc`)

Source of strands, sub-strands, learning outcomes and existing rubric observations. The Delivery Hub enriches a sub-strand; it does not duplicate the strand tree.

### Curriculum Engine and Versions

Curriculum/version configuration remains the authority for school curriculum structure. Source version fields in the hub make enrichment traceable.

### Timetable

A delivery session can reference a Timetable Slot. Future UI linking can pre-fill teacher, class and date from a published lesson. Timetable remains authoritative for scheduling.

### Lesson Plans and Record of Work

A delivery session can reference a Lesson Plan and later Record of Work. The hub records actual delivery context, while those modules retain planning/official record functions.

### Syllabus

A delivery can reference a Syllabus Topic. The hub does not silently label it Verified Covered. Syllabus verification should use delivered and assessment evidence under its own rule.

### Flexible Assessments

A delivery can reference an Assessment Plan. Learner evidence can reference a real Assessment Record. Assessment moderation/release remains unchanged.

### Competencies

Curriculum design stores competency codes/names for teacher context. A learner observation can reference real approved Competency Evidence. The hub does not bypass competency approval.

### Question Bank and simulations

Intervention actions can specify Question Set or Simulation. The teacher uses the released Question Bank/simulation station and later records reassessment outcome.

### Goals, Skills Passport and Portfolio

Support may lead to a Goal. Evidence may reference an approved Portfolio Item. Skills Passport updates should remain reviewed and source-explicit.

### Parent Growth

`parentSummary` is deliberately separate from staff notes. A future parent surface should show only reviewed summaries and never expose confidential raw observation text automatically.

## 8. Records changed

| Action | Record |
|---|---|
| Save curriculum design | create/update `CbeCurriculumDesign` |
| Save delivery session | create `CbeDeliverySession` |
| Record learner evidence | create `CbeDeliveryEvidence` |
| Plan support | create `CbeIntervention` |
| Review support | update `CbeIntervention` while retaining original creation history |

All four models are tenant-owned and registered in NEYO’s tenant isolation registry.

## 9. Corrections

- Curriculum design can be updated by authorised Academics managers.
- Delivery/evidence should not be deleted merely to improve a report. Add a new reviewed record or correction workflow where required.
- Intervention outcome is updated after the review date.
- Incorrect learner/class pair is rejected by the server.
- Level outside 1–4 is rejected.

## 10. Testing

### Curriculum design

1. Create one sub-strand in CBE.
2. Save a Draft design.
3. Refresh and confirm persistence.
4. Update to Reviewed.
5. Confirm reviewer/time appears in data.
6. Save again and confirm no duplicate design.

### Delivery

1. Choose design/class/date.
2. Save Delivered session.
3. Refresh.
4. Verify teacher identity and date.

### Evidence

1. Select session.
2. Confirm learner list only contains the correct class.
3. Record one EE/ME/AE/BE observation.
4. Attempt learner from another class; server must reject.
5. Refresh and confirm evidence count.

### Support

1. Create support for an AE/BE learner.
2. Set review date and target.
3. Run the activity using the relevant module.
4. Reassess.
5. Review/close intervention with outcome.
6. Ensure parent summary is safe and understandable.

## 11. Honest current boundaries

Implemented now:

- rich curriculum design persistence;
- version/source/review metadata;
- delivery sessions;
- learner evidence;
- interventions;
- class-membership validation;
- tenant isolation;
- page navigation and command search;
- phone-adaptable four-step workspace.

Not silently automated:

- copying official curriculum content;
- creating assessment records;
- approving competency evidence;
- marking syllabus verified;
- adding portfolio items;
- publishing parent summaries;
- deciding Senior School pathways.

Those boundaries are deliberate. Future integrations should propose reviewable links rather than create educational judgements without a teacher.

## 12. Founder social demonstration

Recommended story:

> “CBE should not end at selecting EE or ME. Here is how one sub-strand becomes a lesson, learner evidence and a reviewed support action.”

Show:

1. reviewed curriculum intent;
2. actual delivered lesson;
3. evidence for one fictional learner;
4. targeted support and review date;
5. explain that Assessments/Competencies/Portfolio remain reviewed authorities.

Never show copyrighted curriculum pages, real learner data or claim KICD approval.
