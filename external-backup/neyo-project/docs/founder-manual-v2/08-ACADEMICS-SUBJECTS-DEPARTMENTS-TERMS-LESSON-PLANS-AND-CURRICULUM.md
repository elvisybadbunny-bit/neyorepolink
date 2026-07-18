# NEYO Founder Manual V2 — Module 08: Academics Foundation

**Page:** `/academics`  
**Foundation covered deeply:** Subjects, Departments, Co-curricular, Terms, Lesson Plans, Curriculum
Versions, Senior Pathways, Subject Selection and Record of Work  
**Last verified against code:** 2026-07-18

---

## 1. Why Academics must precede timetable

A timetable engine needs real classes (Module 05), staff (Module 04), terms, subjects, teacher
qualifications, weekly needs, venues and bell rules. This chapter creates the academic foundation.
Module 09 will explain every Timetable/Smart Timetable control.

---

## 2. Access

`academics.view` opens page. `academics.manage` allows configuration. Principal/Owner can appoint
HOD. HOD mode is scoped to assigned department and cannot appoint a different HOD. Secondary role
may contribute manage permission.

The Level-Aware banner reads School Profile levels. X dismisses it on this browser via localStorage;
it does not disable level-aware behavior.

---

## 3. Every Academics tab currently visible

Core tabs:

1. Subjects
2. Departments
3. Co-curricular
4. Terms
5. Timetable
6. Exam Timetable
7. Discipline & Summons
8. Textbook Fines
9. Exam Auto-Generator
10. KNEC Candidate Studio
11. MOE Statutory Returns
12. Record of Work
13. Lesson Plans
14. Smart Timetable
15. Duty Roster

When Curriculum Engine is released:

16. Grading Engine
17. Report Builder
18. Curriculum Versions
19. Senior Pathways (Senior School only)
20. Subject Selection (Junior/Senior according to activation)

The old hidden `generator` state remains a legacy internal branch; users use Smart Timetable.
Specialized tabs are documented in their owning manual chapter; none are being omitted.

---

## 4. Subjects tab

Buttons for managers:

- **New subject**
- **Add CBE set**
- **Add 8-4-4 set**

Preset buttons create missing standard Kenyan subjects and skip existing codes; they do not delete
custom subjects.

### New Subject dialog

Fields:

- Name
- Code (short unique school code)
- Curriculum: CBE/CBC, 8-4-4 or both according to current options
- Department optional

**Add subject** validates name/code and duplicate code. Close/Cancel abandons.

Subject table shows code/name/curriculum/department. Subject identity feeds teacher qualifications,
class needs, exams, strands, pathways, electives and timetable. Do not create “Math” and
“Mathematics” duplicates to solve mapping.

---

## 5. Departments tab

Manager enters department name (e.g. Sciences) → **Add Department**.

Cards show subject count and HOD. **Configure Department** opens:

- editable department name;
- HOD selector (only Principal/Owner appoints);
- subjects mapped to department;
- **Save Configuration**;
- Cancel.

HOD mode shows only assigned department and permits changes only there; HOD cannot appoint self/new
HOD through restricted control.

Departments organize oversight; they do not themselves assign teachers to classes.

---

## 6. Co-curricular tab

This configures activity categories/blocks used by timetable and school operations. Use it for Games,
Clubs, Assembly and other non-academic categories rather than fake Subjects where the real activity
engine applies.

Buttons/fields vary by category configuration; save creates real activity category/rules. **Open
Timetable** switches to Timetable tab. Confirm day/time and affected classes before reserving blocks.

---

## 7. Terms tab

### School Terms list

Shows Term/year, start→end and Current badge.

### Add/Edit Term card

Fields:

- Year
- Term 1/2/3
- Start date
- End date
- This is current term checkbox

**Save term** upserts unique tenant/year/term. Setting current clears current flag on other terms.
End must follow start.

Current term drives Dashboard term/week, invoices, reports, attendance windows, grading and term
operations. Configure it before finance/timetable/exams.

---

## 8. Lesson Plans tab

Button **Plan a lesson** opens form with class, subject, date, topic and supporting fields/resources
in current dialog. **Save** creates teacher-owned plan.

Plan rows expose status and actions:

- status Planned/Taught/Skipped through status control;
- **Observe**: record lesson observation/evidence;
- **Resources**: add links/files/resources;
- **Coverage**: view planning/delivery/assessment analytics for class+subject.

Marking Taught can feed syllabus coverage. Ordinary teachers see/modify own plans; leadership has
oversight. Do not mark Taught merely to improve coverage numbers.

### Resources

**Add** adds resource row; Save stores lesson resources. Validate link/file/description and copyright.

### Observation

Record observer/date/notes/rating/evidence through dialog → Save. Confidential personnel issues
belong HR, not casual lesson note.

---

## 9. Record of Work

Tracks what was actually covered by teacher, class, subject, strand/topic and date. Use after lesson,
not as future plan. Buttons create/update rows according to release/permission. This feeds QASO/
syllabus audit and complements Lesson Plans/CBC assessments.

Difference:

- Lesson Plan = intended lesson.
- Record of Work = teacher's dated coverage statement.
- Syllabus verification = compares statements with delivered plans/student assessment evidence.

---

## 10. Curriculum Versions

When Curriculum Engine enabled, manage named curriculum versions/effective periods/status rather
than overwriting historical structure. Buttons create/edit/activate according to client. Map existing
subjects/classes/terms rather than duplicating them. Archive/supersede old version only after
migration review.

School Profile active levels decide which complexity appears.

---

## 11. Senior Pathways

Visible only when Senior School active and Curriculum Engine enabled. It defines pathways and
subject requirements/options.

**Gap fixed in this chapter:** `AcademicsClient` fetched real Subjects but passed `subjects={[]}` to
`PathwayManagerClient`, leaving its subject choices empty. It now passes the loaded `subjects` state,
so pathway requirements can select the school's real catalog.

Pathway setup does not assign an individual student; Student Pathway/Subject Selection handles that.

---

## 12. Subject Selection

Visible for active Junior/Senior levels according to activation. Receives real loaded Subjects.
Configure/open portals, compulsory/choice rules and review selections through its current buttons.
Confirmed selections feed elective grouping, Allocate Class, timetable and exams. Draft/unconfirmed
choices must not be treated as final.

---

## 13. Grading Engine and Report Builder

Curriculum-enabled tabs:

- Grading Engine: assessment scales/computation configuration and current result calculations.
- Report Builder: templates/sections/data rules and generated reports.

They depend on subjects, terms, assessment types and real marks/evidence. Full button-by-button
coverage belongs Exams/CBE reporting chapter; do not configure before foundational terms/subjects.

---

## 14. Specialized tabs inventory

Nothing is being left out:

- **Timetable:** manual weekly grid, schedule rules, auto-fill, printing—Module 09.
- **Smart Timetable:** teacher/class needs, venues, constraints, electives, Master generation—Module
  09.
- **Exam Timetable / Auto-Generator:** exam scheduling—Exams module chapter.
- **Duty Roster:** teacher and student duty generation—Timetable/Operations chapter.
- **Discipline & Summons:** campus discipline extension—Discipline chapter.
- **Textbook Fines:** coursebook recovery—Library chapter.
- **KNEC Studio:** candidate registration/index/export—Exams/Compliance chapter.
- **MOE Returns:** statutory forms—Reporting/Compliance chapter.

This chapter states their location/dependency; later chapters enumerate every control.

---

## 15. Correct foundation setup example

1. School Profile: Junior + Senior active; save.
2. Academics → Terms: create current Term 2 2026 with dates.
3. Subjects: Add CBE set; inspect codes; add missing school electives only once.
4. Departments: Sciences, Languages, Humanities, Technical/Applied; assign subjects and authorized
   HODs.
5. Curriculum Versions: confirm applicable version where enabled.
6. Senior Pathways: create/pathway requirements using now-visible real Subjects.
7. Subject Selection: configure choices and obtain confirmations.
8. Co-curricular: define Assembly/Games/Clubs.
9. Lesson Plans/Record of Work begin after class/teacher assignment.
10. Only then open Smart Timetable.

---

## 16. How foundation wires to timetable

| Foundation | Timetable use |
|---|---|
| Active levels | shows pathway/selection complexity |
| Subject | class need, teacher eligibility, cells/exams |
| Department/HOD | oversight, not direct placement |
| Term | reporting context, not weekly period grid itself |
| Co-curricular | reserved activity blocks |
| Subject selections | elective blocks/groups |
| Pathway requirements | Senior combinations/compulsory choices |
| Lesson plans | consume published timetable class/subject context |

---

## 17. Troubleshooting

| Problem | Fix/check |
|---|---|
| Academics forbidden | `academics.view` |
| Buttons missing | `academics.manage` or scoped HOD |
| Pathways missing | Senior School active + Curriculum Engine released |
| Subject Selection missing | Junior/Senior activation flags |
| Pathway subjects empty | fixed: reload; verify Subjects API/catalog |
| Duplicate subject | reuse/update existing code; preset skips existing |
| HOD selector disabled | only Principal/Owner appoints |
| Dashboard wrong term | mark correct Academic Term current |
| Plan class/subject absent | create/assign foundational records |
| Coverage says self-reported | add real delivered/assessment evidence |
| Too many tabs on phone | horizontal scroll tab strip |

---

## 18. Founder verification checklist

1. Read-only role sees tabs/data but no manage actions.
2. Add preset twice: no duplicate codes.
3. Add custom subject and map department.
4. Principal appoints HOD; HOD cannot appoint/change outside scope.
5. Create terms and verify only one current.
6. Dashboard header uses current term/week.
7. Active levels hide/show Pathway/Selection correctly.
8. Senior Pathways receives real subject list (fixed gap).
9. Subject selection confirmed data feeds later allocation.
10. Lesson Plan create/status/resources/observation/coverage scope.
11. Record of Work remains distinct from plan.
12. Cross-tenant subject/department/term blocked.
13. Mobile/glass/loading/empty/error states.

---

## 19. Gap fixed

Replaced `<PathwayManagerClient subjects={[]}>` with the already-loaded real `subjects`. This was a
real UI wiring defect: Pathway manager could render but had no subject catalog. No schema/API change
was needed because Subjects fetch and Pathway component already existed.

---

## 20. Edit points

- Academics page/tab shell: `src/app/(app)/academics/page.tsx`,
  `src/components/academics/academics-client.tsx`
- Services/APIs: `academics.service.ts`, `/api/academics/subjects|departments|terms|lesson-plans`
- Curriculum: `curriculum-engine-client.tsx`, curriculum services/routes
- Pathways/selection: `pathway-manager-client.tsx`, `subject-selection-manager.tsx`
- Record of Work: `record-of-work-client-tab.tsx`, Kenyan extensions service
