# MOE Grade 10 Selection Portal — NEYO change-readiness audit

**Reviewed:** 22 July 2026 (Africa/Nairobi)  
**Official public source:** https://selection.education.go.ke/  
**Boundary:** Public pages only. No Ministry credentials were used, no authenticated workflow was probed, and NEYO must not claim direct Ministry submission or placement integration without a documented official interface and approval.

## 1. What the official platform says it does

The Ministry public About page describes the system as a Grade 9-to-Senior-School choice platform. It records preferred pathways, subject combinations and senior schools. It explicitly says it **does not handle placements**; choices are submitted for review by education officials and schools. The homepage now links separately to the placement platform.

Public navigation currently exposes:

- About;
- Pathways;
- Possible Careers;
- Schools;
- Downloads;
- Login;
- My Selections;
- a separate Placement link.

The public pathway catalogue currently presents this hierarchy:

1. pathway group;
2. track;
3. a three-subject combination;
4. an official-looking combination code;
5. schools offering that combination.

The visible groups/tracks are:

- STEM: Pure Sciences, Applied Sciences, Technical Studies;
- Social Sciences: Languages & Literature, Humanities & Business Studies;
- Arts & Sports Science: Arts, Sports.

The public school search exposes dimensions that matter for learner guidance:

- region;
- county;
- sub-county;
- institution name;
- sex;
- KNEC code;
- cluster;
- accommodation type;
- school information.

The official public site also offers downloadable resources and confirmation slips, although its file list is loaded dynamically and was not visible to the text-only review.

## 2. Important interpretation

NEYO and the Ministry portal have different jobs.

### Ministry platform

- national pathway/combination/school choice;
- official public catalogue;
- official submission/confirmation;
- separate placement outcome platform.

### NEYO

- school operating system;
- learner guidance and evidence;
- the subjects one school genuinely offers;
- teacher, room and capacity feasibility;
- confirmed internal subject choices;
- deterministic Option A/B/C construction;
- timetable and learner proof;
- reports and governance.

NEYO must **support preparation and reconciliation**, not impersonate the Ministry portal. A school should still complete official submission on the official platform unless the Ministry later provides and authorises a formal integration.

## 3. What NEYO already supports well

The repository currently has:

- official/custom `Pathway` rows with `pathwayGroup`, `trackName` and `isOfficial`;
- `PathwaySubjectRequirement` for pathway-to-subject rules;
- ordered `StudentPathwayPreference` rows, recommendation and allocation state;
- a school-owned Subject Selection portal;
- confirmed learner subject choices;
- exactly-three-elective Senior readiness checks;
- Core and Essential Mathematics distinction;
- Community Service Learning and compulsory-pathway tagging;
- learner-specific subject combination proofs;
- deterministic A/B/C conflict-graph construction;
- teacher qualification, workload, venue and capacity checks;
- school-controlled review and publication;
- national assessment records kept distinct from internal exams;
- manual/export-oriented KNEC processes that do not claim direct government submission.

This means a Ministry catalogue change does not require rewriting NEYO's timetable engine. The engine reads school-owned subjects and confirmed learner choices rather than hardcoding one national list into scheduling logic.

## 4. Confirmed gaps

NEYO is **not yet fully change-ready** for the national selection catalogue.

### Gap A — no versioned national combination catalogue

`Pathway` and `PathwaySubjectRequirement` can represent a school's offering, but there is no immutable catalogue version containing:

- Ministry combination code, for example `ST1004`;
- effective year;
- pathway group and track;
- exact three subject names/identifiers;
- source URL/document;
- review status;
- checksum;
- activated/superseded date.

Without versioning, changing an official combination could silently alter historical learner records.

### Gap B — no national senior-school choice model

There is no governed learner record for:

- school KNEC code;
- school cluster;
- sex category;
- day/boarding accommodation;
- county/sub-county;
- preference order;
- selected combination code;
- official submission/confirmation reference.

`StudentPathwayPreference` is a pathway preference, not a complete national school-selection submission.

### Gap C — no reconciliation workflow

NEYO does not yet compare:

- learner's internal confirmed three subjects;
- Ministry combination code;
- subjects this school offers;
- eventual placement school/outcome;
- admitted learner's actual Grade 10 subjects.

No learner choice should be silently changed during reconciliation.

### Gap D — no governed public-catalogue refresh

There is no Founder/Ops workflow to:

1. capture a candidate public catalogue version;
2. show additions, removals, spelling changes and code changes;
3. require human review;
4. activate for a future cohort;
5. preserve the old cohort version;
6. roll back.

A scheduled scraper alone would be unsafe because public page structure and labels can change.

### Gap E — school directory dimensions are incomplete

NEYO's own school profile and pathway tools are not a national directory of region/county/sub-county, KNEC code, cluster, sex and accommodation offerings linked to each official combination.

### Gap F — no official API evidence

The public site review did not establish an authorised submission API, webhook, data-sharing agreement or stable machine-readable catalogue endpoint. NEYO must not request Ministry passwords, automate login, scrape authenticated learner pages or claim official submission.

## 5. Required change-safe design

### 5.1 Version the external catalogue

Add a national catalogue version with states:

```text
CANDIDATE → REVIEWED → ACTIVE → SUPERSEDED
```

Every version should retain:

- effective cohort/year;
- official source;
- retrieval date;
- source file/hash;
- reviewer;
- change summary;
- combination rows.

Never edit an active historical version in place.

### 5.2 Separate national references from school offerings

Use three layers:

1. national catalogue combination;
2. school says it genuinely offers that combination;
3. learner chooses/receives that combination.

A catalogue row must not automatically create teachers, subjects, rooms or timetable capacity.

### 5.3 Add explicit reconciliation states

Recommended learner states:

```text
DRAFT
INTERNALLY_CONFIRMED
READY_FOR_OFFICIAL_ENTRY
OFFICIALLY_SUBMITTED_MANUAL
CONFIRMATION_IMPORTED
PLACEMENT_RECEIVED
RECONCILED
EXCEPTION_REVIEW
```

“Submitted” must require a human-entered confirmation or imported official slip until a formal approved integration exists.

### 5.4 Preserve learner choice

When the Ministry changes a code or subject combination:

- show the difference;
- identify affected future-cohort learners;
- do not rewrite historical records;
- do not switch a learner automatically;
- require school/learner/guardian review where applicable;
- regenerate timetable readiness only after confirmation.

### 5.5 Keep timetable independence

The timetable engine should continue consuming confirmed local subject IDs. A national-catalogue change should make readiness stale and trigger review, not alter the deterministic solver or force an external dependency into generation.

### 5.6 Human-reviewed monitoring

Founder/Ops monitoring should record:

- homepage/navigation change;
- pathway/track count change;
- combination additions/removals/code changes;
- school-directory field changes;
- download/document changes;
- selection-vs-placement wording changes.

Publication into school workflows must remain a separate human action.

## 6. How a school should use NEYO with the current portal

1. Use NEYO evidence, interests, competencies and guidance to discuss pathway direction.
2. Check the current official Ministry catalogue on the official portal.
3. Confirm the three-subject combination and schools on the official portal.
4. Download/save the official confirmation slip according to school policy.
5. Record or import the confirmed result into NEYO when the governed reconciliation workflow exists.
6. Compare it with the school's subjects, teachers, rooms and capacity.
7. Resolve discrepancies with people; never auto-change the learner's official choice.
8. Build A/B/C and the timetable only from confirmed local records.
9. After placement/admission, reconcile the actual school and subjects again.

## 7. Founder verification checklist

- [ ] Open the official About page and confirm the “selection, not placement” boundary.
- [ ] Open Pathways and inspect codes under every pathway/track, not only STEM Pure Sciences.
- [ ] Open Schools and verify region/county/sub-county, sex, KNEC code, cluster and accommodation filters.
- [ ] Open Downloads in a browser and record the current official files and dates.
- [ ] Confirm whether the Ministry publishes an authorised API or import format; do not infer one from browser network calls.
- [ ] Obtain written legal/technical approval before any authenticated integration.
- [ ] Build and test versioned catalogue + reconciliation before saying NEYO is fully integrated.

## 8. Current readiness conclusion

NEYO is **architecturally strong for local Senior School delivery** because pathways, school offerings, learner choices, resources and deterministic scheduling are separated. It is **partially prepared, not complete**, for changes to the Ministry selection platform.

The next implementation should be a versioned, human-reviewed national catalogue and learner reconciliation layer. It must remain optional, preserve historical cohorts, never require Ministry credentials inside NEYO, and never make timetable generation depend on the external portal being online.
