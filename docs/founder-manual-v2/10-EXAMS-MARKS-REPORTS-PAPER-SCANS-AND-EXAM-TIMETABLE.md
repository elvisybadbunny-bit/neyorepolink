# NEYO Founder Manual V2 — Module 10: Exams & Exam Timetable

**Pages:** `/exams`, `/exam-timetable`, Academics → Exam Timetable / Exam Auto-Generator  
**Last verified against code:** 2026-07-18

---

## 1. Exam workflow

`Create exam → map subjects → enter/scan marks → inspect results/analytics → request release →
Principal approve/return → publish → family report cards`

Exam scheduling is separate:

`Define exam periods/classes/papers → preview/generate slots → invigilator pools/generate → materials
check → print/publish operational schedule`

---

## 2. Access

- `exam.view`: view permitted exams/results.
- `exam.manage`: create/configure schedules/materials.
- `exam.enter_marks`: marks tab/save scans.
- `exam.publish`: publish/unpublish according to policy.
- HOD/Dean/Deputy/Principal/Owner can request release by current role list.
- Principal/Owner/legacy Super Admin can approve/return release.
- Teacher marks remain class/subject scoped.
- Parent/Student see only published own results through Portal.

---

## 3. Exams page top analytics

### Multi-term performance analytics

Cards: Term Trend, Subject Performance, Teacher-Linked Performance. Teacher link depends on real
ClassSubjectNeed teacher assignment; missing assignments produce honest empty guidance.

### Advanced analytics

Attendance vs performance, assessment balance, talent/wellbeing indicators, pathway readiness and
other grouped insights. Ordinary teachers may not have leadership permission; client hides expected
permission failures rather than showing a broken toast.

Signals are descriptive, not automatic promotion/discipline decisions.

### Bulk Print Exam Results — restored gap

`ExamPrintClient` was imported in the page but never rendered, so its real API and Print Stream-Wise
Report button were unreachable. This chapter fixes it by rendering the component after analytics.

It loads `/api/academics/exams/print-roster`. **Print Stream-Wise Report** uses print-only table with
school, class, learner, admission and average.

---

## 4. Exam list and New Exam

Managers press **New exam**.

Fields:

- Exam name (e.g. End of Term 2)
- Year
- Term
- Type (Exam/CAT according to options)
- Maximum marks
- Subject checkboxes

At least one subject and name required. **Create exam** writes Exam + ExamSubject mappings. Cancel/X
closes.

Exam card shows name/type/year/term/draft/published. Press card to open.

---

## 5. Results and Enter Marks tabs

Inside exam:

- Back returns exam list.
- Results: summaries, positions, means, report links and release controls.
- Enter marks: only `exam.enter_marks`.

Published/pending approval badges appear at top.

---

## 6. Marks selectors and grid

Choose Class and mapped Subject. Service returns only allowed active learners and existing marks.

Each input accepts number up to exam max; blank clears/deletes result. Changes autosave after delay;
**Save now** forces immediate save. Status indicates Saving/Saved/time/error.

Server validates class roster, subject mapped to exam, teacher scope and mark range. Never paste a
whole class into wrong subject to “move faster.”

---

## 7. Paper Sheet / Scan (EE.4)

Button opens Mark Sheet modal for selected exam/class/subject.

### Print

Generates tracking reference `MS-EXAM-...-SUB-...-CLS-...`, learner names/admission and baseline
marks. Print clean sheet; keep reference/header visible.

### Scan

Upload/camera paper. Bundi OCR extracts table geometry, repairs common digits and matches real class
roster. Review classifications:

- Unchanged
- Changed Delta
- New Entry
- Uncertain Review

Edit uncertain cells; **Confirm & Save N Score Changes** applies confirmed deltas transactionally.
Unchanged rows are skipped. Never accept uncertain handwriting without checking paper.

---

## 8. Tidy Scanned Exam (EE.5)

Button opens Exam Paper Tidying modal.

1. Scan/upload rough paper.
2. Bundi structures title, time, numbered questions, options and marks.
3. Edit questions/options/marks, add/remove as needed.
4. Save Tidied Paper to library.
5. Print official paper with answer spaces.
6. **Export to LMS Quiz** creates real Quiz/QuizQuestion rows from reviewed paper.

OCR result is draft, not automatically published.

---

## 9. National Exam Library (EE.6)

Button opens approved public papers. Search/filter, inspect metadata and **1-Click Clone** into your
school. Clone creates separate school paper; it does not mutate original.

A school's paper moves School-only → sharing request Pending → NEYO Ops approval → Public Shared.
Teachers cannot self-approve national publication. Ops approval queue is in Founder Ops.

---

## 10. Inter-School Contests (EE.10)

Button opens contest arena: browse/register team, timed attempt, live podium, create contest where
permitted. Questions use Question Bank, deterministic marking and time tie-break. Print standings/
certificates where available. Invite-only contests remain private.

---

## 11. Results Summary

Shows student rows with total, average, grade/level, overall and class position. Positions computed
on full cohort before row-scoping so family sees truthful own rank without other learner details.

Subject means and class/stream/level comparisons are displayed. Ties share position. CBC/CBE uses
rubric level rules; 8-4-4 uses configured grade bands.

Report Card PDF link is per learner and gated by role/publication.

---

## 12. Release Approval and Publish controls

### Request release

Eligible HOD/Dean/Deputy/leadership presses **Request Principal approval** when results exist. Creates
`ExamReleaseApprovalRequest` Pending.

### Principal decision

Pending shows:

- **Return**: Reject/return for corrections; optional decision note where workflow collects.
- **Approve & release**: approves and publishes through release endpoint.

### Direct Publish/Unpublish

Users with `exam.publish` see Release Results/Unpublish where status allows. Publication exposes
results to families; unpublish hides but does not delete marks.

Review missing marks, max marks, class/subject means and report sample before release.

---

## 13. Exam Timetable — standalone page

`/exam-timetable` shows scheduled table: Date, Time, Class, Subject, Exam, Venue. Empty state directs
to timetable tools/API. Operational creation controls live in Academics → Exam Timetable and Auto-
Generator; standalone page is read/materials hub.

Below: Exam Materials and KNEC Aggregation.

---

## 14. Academics → Exam Timetable manual slot

Manager can Add/Edit exam slot with fields from setup:

- exam name;
- class;
- subject;
- date;
- start/end;
- venue/notes;
- target scope/stream/combination where shown;
- invigilator settings.

Buttons Save Slot, Reset/Cancel edit, edit pencil, delete. Service blocks class/subject/teacher or
student elective clashes according to generator rules.

---

## 15. Invigilator pools

Each slot/exam can define scope and eligible teacher ids. **Save Pool** persists. **Generate
Invigilators** assigns eligible available staff while avoiding clashes. Review every assignment;
absence/leave changes require regeneration/manual correction.

---

## 16. Exam Auto-Generator

Build Exam Run fields:

- exam name/year/term/date range;
- selected classes/stream groups/combination groups;
- periods with label/start/end;
- Add Period/Remove;
- subjects/papers and placement rules;
- options-block awareness automatically includes active elective papers for selected classes;
- prefer-split per block controls whether compatible single-choice papers share sitting.

Buttons:

- Preview Generator: no final writes, shows clashes/unplaced.
- Generate: persists run/slots.
- Recent Runs: inspect status/result.

Per-student elective occupancy prevents a learner being scheduled for two chosen papers at once.

---

## 17. Exam Materials

On standalone page:

- **Add record**
- Exam name/material type/title
- Exam date/deadline/status
- Checklist (one item/line)
- Hardcopy location required
- Notes
- Upload soft copy/proof
- **Save exam material record**
- Status dropdown updates planned/received/checked etc.

This tracks application packs/papers/proof and physical location. Do not upload confidential scripts
into broadly visible material category.

---

## 18. KNEC Aggregation

- **New batch**: name/year/level/description as dialog provides → Create Batch.
- **Check completeness**: aggregates candidate document readiness.
- **Export**: allowed when complete.
- **Force export (partial)**: danger action when incomplete; only with documented reason/authority.

Export status locks/reports accordingly. KNEC Candidate Studio in Academics is separate registration/
index/photo manifest workflow.

---

## 19. Worked example

1. Create `Term 2 Form 2 CAT`, max 100, MAT/ENG/KIS.
2. Enter/scan marks per class+subject; resolve uncertain deltas.
3. Inspect all missing rows and means.
4. HOD requests release.
5. Principal samples report PDFs, returns if errors or approves.
6. Publish; Parent sees only own child/report.
7. Build Exam Timetable separately with dates/periods/venues.
8. Generate invigilators; log materials; print operational schedule.

---

## 20. Troubleshooting

| Problem | Check |
|---|---|
| New Exam missing | `exam.manage` |
| Subject absent in marks | map it during exam creation |
| Teacher sees no class | real class/subject assignment |
| Marks rejected | range, roster, mapping, scope |
| Scan uncertain | manually review; do not force |
| Release request absent | role and results exist |
| Principal approve absent | Principal/Owner role/secondary role |
| Parent cannot see | exam unpublished/release incomplete/link scope |
| Rank seems wrong | full cohort/ties/missing marks |
| Bulk print absent | gap fixed: component now rendered; API must have active data |
| Exam timetable clashes | periods/classes/electives/venues/invigilators |
| KNEC export incomplete | run completeness, fix documents; avoid force unless authorized |

---

## 21. Founder verification checklist

1. Create exam and subject mappings; duplicate/invalid blocked.
2. Teacher own class/subject marks only.
3. Autosave/Save now/null clear/range validation.
4. Mark sheet print/scan delta/apply transaction.
5. Tidied paper edit/save/print/LMS export.
6. Public paper request/Ops approval/clone isolation.
7. Results positions/ties/means/stream-level comparison.
8. Request → Return → re-request → Approve/Publish.
9. Parent unpublished blocked, published own report only.
10. Bulk stream-wise print renders (fixed entry).
11. Manual exam slot conflict checks.
12. Generator preview/generate/options-block per-student safety.
13. Invigilator pool/generation no clash.
14. Materials status/file/hardcopy location.
15. KNEC completeness/export/partial warning.
16. Cross-tenant direct ids blocked.
17. Mobile/glass/print/loading/empty/error states.

---

## 22. Gap fixed

`ExamPrintClient` was imported by Exams page but never rendered anywhere, leaving Bulk Print Exam
Results and its real roster endpoint unreachable. Added `<ExamPrintClient />` after analytics and
removed its unused Search import. No schema/service/API work was required because they already
existed.

---

## 23. Edit points

- Exams page/client: `src/app/(app)/exams/page.tsx`, `src/components/exams/exams-client.tsx`
- Analytics/print: `exam-analytics-client.tsx`, `advanced-analytics-client.tsx`,
  `exam-print-client.tsx`
- Core: `exam.service.ts`, `/api/exams*`
- Mark sheet/tidy/share/contest components and services
- Exam timetable: Academics client, `exam-timetable*.service.ts`, timetable APIs
- Materials/KNEC: `exam-materials-client.tsx` and services/routes

## Real term workflow: timetable to confirmed raw marks to released results

This is the order a real school should use. Do not compute first and attempt to correct raw marks later.

1. **Academic office creates the exam and publishes the exam timetable.** Each timetable row identifies the real class, scheduled subject and paper. This timetable is the source used to prepare marks-entry subjects; a teacher does not receive every subject in the school.
2. **Academic leadership opens marks entry:** go to **Academics → Grading Engine**, choose the academic term, enter a clear portal name and closing date, then press **Open Marks Entry**. NEYO checks that an exam and timetable exist, and attaches the scheduled subjects to the matching exam.
3. **Teacher enters marks:** go to **Exams**, open the exam, select **Enter marks**, then select the class. The Subject list now contains only subjects scheduled for that class in that exam timetable. Marks autosave, but only while the portal is open and before its closing time.
4. **Leadership closes entry:** press **Close & Review Raw Marks**. This immediately blocks further saves.
5. **Print learner-confirmation data:** press **Print Raw Marks**. The printout explicitly shows unweighted marks as entered, before grades, weighting, means or positions. Learners check the rows and report discrepancies using the final column.
6. **Corrections, when genuinely required:** leadership presses **Open Corrections**. This creates a controlled correction window; teachers correct only the reported entries. Leadership then closes the portal again and prints/rechecks the raw sheet.
7. **Compute:** only a closed portal can be computed. NEYO normalises configured papers, applies term aggregation rules, uses the school's saved grading scale, calculates subject and overall positions, and writes idempotent master-report rows.
8. **Review and release:** leadership reviews the master report. Principal or Deputy chooses whether to tick **Send SMS notification to parents**, then presses **Release Results**. Releasing works without SMS; SMS is an optional notification channel, not a condition of release.

### What each action changes

- **Open Marks Entry:** creates a real `MarksPortal` record and synchronises `ExamSubject` records from the existing timetable.
- **Teacher autosave:** upserts `ExamResult` rows for allowed learners, exam and subject. Closed portals reject writes.
- **Close & Review:** changes the portal to `CLOSED`; it does not compute or publish anything.
- **Open Corrections:** changes the unreleased portal to `CORRECTION_OPEN`, resets stale computation progress and permits time-limited edits.
- **Start Computation:** reads raw `ExamResult` rows and writes/updates `MasterReportCard` rows. It cannot run while entry is open.
- **Release Results:** marks the portal released and makes the relevant exams visible. Parent SMS is sent only when leadership explicitly selected it.

### Founder verification

1. Build an exam timetable containing two of a class's subjects.
2. Open marks entry and sign in as that class's assigned teacher.
3. Confirm the marks Subject dropdown shows those two subjects, not the full catalog.
4. Save a mark, close the portal, and confirm another save is rejected.
5. Print raw marks and verify that it contains the original mark and no computed grade.
6. Reopen corrections, change the mark, close again, and print again.
7. Compute and check the master report.
8. Release once with SMS unticked in a safe test tenant; confirm release does not require SMS.

## School grading scale

In **Academics → Grading Engine**, academic leadership can edit each grade and its minimum percentage, then press **Save Grading Scale**. This writes one tenant-scoped `GradingScale` record; it does not alter historical raw marks. The next computation reads this scale. Grade labels and minimum marks must be unique, between 0 and 100. If the school has never saved a scale, NEYO uses the displayed Kenyan default. To change it later, edit the boundary, save, reopen/close the correction workflow if needed, and recompute before release. Founder test: change one boundary in a test school, compute a learner near that boundary, and verify the master report uses the test school's scale without changing another tenant.
