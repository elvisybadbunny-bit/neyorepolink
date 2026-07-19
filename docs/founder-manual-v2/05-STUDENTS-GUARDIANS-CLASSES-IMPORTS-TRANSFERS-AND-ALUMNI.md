# NEYO Founder Manual V2 — Module 05: Students, Guardians, Classes, Imports, Transfers & Alumni

**Pages:** `/students`, `/students/[id]`, `/classes`, `/students/import`, `/students/alumni`,
`/students/promotion`  
**Last verified against code:** 2026-07-18

---

## 1. The learner record chain

A reliable learner setup links:

`Student → SchoolClass → Guardian(s) → portal User (optional) → requirements/documents → subjects/
pathway → attendance/exams/invoices/operations`

Do not create duplicate students to fix a wrong class, guardian or status. Edit/transfer/promote the
existing identity so history remains connected.

---

## 2. Who can see Students

`student.view` opens the page, but `scopeWhere()` limits rows:

- leadership/authorized office roles: whole tenant;
- Teacher/Class Teacher: classes genuinely linked through class-teacher, subject need, combination
  or timetable assignment;
- Parent: linked children;
- Student: own linked record where the page is used;
- unrelated tenant: blocked.

`student.create` controls New Student/Import/approvals; `student.edit` controls profile/status/
guardians/transfer; `class.manage` controls classes/new year.

---

## 3. Students header buttons

- **Alumni:** opens graduated directory.
- **Import:** CSV/XLSX/Sheets import (create permission).
- **Manage classes:** class/stream setup (class manage).
- **New year:** promotion, reshuffle, allocation and continuity tools.

Inside toolbar:

- Search name/admission (backend also supports phone through service/API).
- Class, stream, status, gender filters.
- List/Kanban view.
- **Student approvals** (newly restored reachable UI).
- **New student**.
- When records exist: Print ID Cards, Print Newsletters, Print Class List, Student Duties.

---

## 4. Summary and list views

Stats show visible total/active/classes. List rows link name/admission to profile. Checkboxes power
bulk tools. Kanban groups status and can move status through real API where authorized.

Filter combinations are ANDed with server row scope—they cannot reveal another class/child.

### Saved views

Set filters → **Save this view** → name → Save View. Saved pills reapply filters; X deletes saved
view, not student data. **All Students** clears filters.

---

## 5. Register New Student

Press **New student**.

Fields:

- first/last required by validation;
- middle optional;
- gender;
- date of birth;
- class or Unassigned;
- existing school admission number optional;
- UPI/NEMIS optional;
- birth certificate optional;
- primary guardian optional: name/phone/relationship and Create parent portal login.

Buttons: Cancel, **Register student**.

On success:

- Student created in tenant;
- NEYO admission number generated atomically;
- optional existing number preserved separately;
- guardian normalized/reused/linked;
- optional guardian login created;
- School Profile joining requirements copied;
- audit written;
- toast shows admission number and directory reloads.

Registration does not automatically create invoices, subject choices or attendance history.

---

## 6. Student approvals

The component and API existed but were unreachable because `approvalsOpen` was never opened/rendered.
This chapter fixed it: authorized creators now see **Student approvals**.

Modal loads pending approval requests. Buttons:

- **Approve:** changes request to approved through real approvals API.
- **Reject:** rejects.
- Close/backdrop returns and reloads directory.

Approval is not the same as admission unless the specific request workflow creates/updates the
student. Read request details before deciding.

---

## 7. Student profile header and documents

Profile shows identity, class/admission/status and actions:

- ID card
- Transcript
- Mzazi card where permitted
- Portfolio
- Status dropdown
- Transfer out

Documents card **Add** opens label/hardcopy location/File upload. The uploaded file uses tenant
storage; record preserves label/location. Never upload unrelated family IDs or expose files to
unauthorized roles.

Legacy admission number can be edited separately from NEYO id.

---

## 8. Status changes

Statuses include Active, Inactive, Graduated, Transferred, Suspended.

Use meaningfully:

- Active: enrolled/current.
- Inactive: temporarily not active without transfer/graduation.
- Graduated: alumni fields/final class/year handling.
- Transferred: use Transfer workflow, not status dropdown alone, because transfer needs destination,
  date, reason and letter.
- Suspended: temporary learner status; discipline workflow may also hold detailed suspension record.

Status changes are audited. Do not use status to erase balances/results/history.

---

## 9. Guardians

Guardians card supports:

- **Add Guardian:** name, phone, relationship, primary/login choices according to dialog.
- **Edit:** update the existing guardian instead of adding duplicate.
- **Make primary:** controls principal family contact/notification choice.
- **Message:** opens conversation when User account exists.

Guardian may be shared by siblings. Changing shared guardian details can affect all linked children;
confirm identity/phone first. Parent portal access remains row-scoped by links.

---

## 10. Joining requirements

Each requirement appears as a clickable/toggleable row for editors. Toggling records fulfillment on
that student. Master list comes from School Profile at creation time; changing master later does not
silently rewrite historical student copies.

---

## 11. Transfer out

Press **Transfer out…**.

Enter destination school, county/date/reason/note as dialog requires. **Transfer student**:

- creates `StudentTransfer`;
- stores previous class for undo;
- sets Student TRANSFERRED;
- clears class seat;
- audits;
- profile shows amber banner.

Banner actions:

- **Transfer letter:** branded QR-verifiable PDF.
- **Undo:** reverses active transfer and restores previous class if still available.

Do not transfer by only selecting TRANSFERRED status; use workflow.

---

## 12. Classes & Streams

Open **Manage classes**.

Rows show level, stream, curriculum, capacity/student count and class teacher. Authorized actions:

- inline Class Teacher selector;
- edit pencil;
- **New class**;
- **Bulk create streams**.

### New Class

Enter level, stream, curriculum/capacity as current dialog provides → **Create class**. Duplicate
rules apply.

### Bulk Create Streams

Enter level and stream naming/count inputs. Preview computed names; **Create streams** creates only
missing classes and prepares default timetable configuration. It does not add students/subjects or
teachers.

### Edit Class

Edit level, stream, curriculum, capacity and homeroom Class Teacher → Save changes. Subject teachers
are separate in Academics Smart Timetable.

Capacity informs overflow decisions; it does not automatically move learners until allocation/
grouping workflow.

---

## 13. Bulk Student Import — Step 1

Open Import.

Choose:

- automatic class from file; or
- one selected target class.

Provide CSV/XLSX or paste spreadsheet data. Header mapping supports student/guardian/class/subjects
and custom fields. Press file area or **Preview pasted rows**.

Do not commit before preview.

---

## 14. Import — Step 2 Preview

Review:

- total/valid/invalid;
- auto column mapping;
- first sample students;
- duplicate/conflict warnings;
- unknown classes/subjects/custom fields;
- rows carrying subject choices;
- compulsory subject selection;
- declared level for classless intake where required.

Correct mapping/conflicts and refresh preview. Unlabeled custom columns block commit. Choose
skip-invalid policy only after understanding which rows will fail.

Button **Import students** writes valid rows; Back returns upload.

---

## 15. Import — Step 3

Shows created, updated and failed rows with reasons, subject selections count and import history.

Buttons:

- Import more
- View students
- Allocate class when subject selections were written

Import is not proof every row succeeded. Export/correct failed rows and rerun those only.

---

## 16. Alumni

Alumni page groups Class of year and displays final class. **Graduate a class**:

- choose class/year;
- preview count;
- confirm;
- sets Graduated, graduationYear/finalClassLabel;
- clears class seat;
- audits.

Click alumnus opens retained profile. Graduation differs from transfer and does not delete records.

---

## 17. New Year / Promotion

Promotion page contains several advanced panels.

### New academic year

Preview source→destination levels; final level graduates; missing destination classes can be
created. Confirm commits top-level-first and records `PromotionRun`. Run history **Undo** restores
prior class/status once.

### Reshuffle streams

Choose level and strategy (size, gender, alphabetical; performance only where real exam strategy is
implemented). Preview movement, then apply. Do not reshuffle without class capacity/staff impact
review.

### Allocate Class

For imported/selected subject combinations: choose level, use existing or create new classes,
preview groups/capacity warnings, explicitly allow overflow or split, optionally seed subject needs
and generate timetable. Print subject-combination/venue rosters where available.

### Continuity and transfer review

Analyze teacher continuity, keep/auto-assign replacements and regenerate timetable. This is related
to Staff lifecycle but should not duplicate/contradict a completed termination transfer.

---

## 18. Printing and bulk operations

### ID Cards

Choose A4 batch or single-card, dimensions/template/stamp options. Save as school default if
authorized; Print generates server PDF/print flow. Select rows when bulk toolbar appears.

### Newsletters

Title/content, personalization and 1/2/4-up format → server PDF. Preview content for privacy and dates.

### Class List

Uses browser print on current filtered list. Clear filters/select class intentionally.

### Student Duties

Choose class/duty rules and auto-assign through real duty service. Review capacity/gender balancing;
do not treat generated duty as attendance.

---

## 19. Cross-module wiring

| Student action | Downstream |
|---|---|
| Assign class | attendance, timetable, homework, exams, class chat |
| Guardian link/login | portal, SMS, fees, pickup, messages |
| Subjects/pathway | timetable, exams, Senior School grouping |
| Status transfer/graduate | seat, directory, portal and historical reports |
| Joining requirements | admission/profile tracking |
| Invoice/service charge | Finance/Portal |
| Student User | own shared portal |
| Documents/photo | IDs/reports/profile |

---

## 20. Bundi Intelligent and Handwritten Student Import — full operation

You were right to ask for this explicitly. There are two real Bundi paths:

### A. Bundi Intelligent inside the standard import family

The shared `BundiIntelligentWizard` is available for STUDENT imports where surfaced/released. It is
open without the legacy unlock-code flow, but still subject to platform release, permission and scan
quota.

1. **Describe columns:** enter each physical register column label and map it to a NEYO field. Use
   **Add another column** or trash to remove. Optional Context (for example “Grade 7 East register”)
   helps ambiguous reading. **Continue** saves the reusable field template; Cancel closes.
2. **Choose photo/scanned page:** JPG/PNG, one page. Upload is encrypted; a Bundi import session is
   created; extraction runs local/deterministic first.
3. **Review every cell:** colour/source badges mean Please check, Auto-fixed/Remembered, Bundi
   confirmed or Manual. Click/edit any value; trash removes an incorrect row. Back returns upload.
4. **Import N rows:** saves the reviewed session then commits through real Student domain validation.
   Result shows created/failed; **Done** returns.

Bundi cannot invent unknown classes/students/guardians. Uncertain values must be corrected.

### B. Premium handwritten `/students/import/bundi`

1. **Enter unlock code** issued by NEYO Ops → Redeem.
2. **Describe your register's columns** → Add/remove fields → Save template & continue.
3. **Upload scan/photo/PDF** (one page). If provider/extraction is unavailable, the red honest state
   says Bundi cannot read it yet; no fake rows are committed.
4. **Review reading:** edit cells, remove rows, Back or **Import N students**.
5. Result shows created and skipped rows; **View students** opens directory.

An unlock code is not a permission bypass and a scan top-up is not automatic approval of content.
Use standard CSV/manual registration whenever Bundi is paused, quota-limited or uncertain.

---

## 21. New Year page — every tab and button

The page has seven real tabs:

### New academic year

- Expand a class row: inspect destination/learners.
- **Start new academic year:** opens confirmation.
- **Cancel:** closes without writes.
- Final confirm: promotes/moves/graduates and creates PromotionRun.
- Run History **Undo:** reverses one not-yet-undone run.

### Reshuffle streams

- Level dropdown.
- Strategy pills: Balance class sizes, Balance boys & girls, Alphabetical.
- **Preview reshuffle:** calculates without moving.
- **Apply reshuffle:** commits preview.

### Auto grouping

- Level/rule fields configure continuity/grouping behavior.
- **Save continuity rule** persists rule.
- **Preview grouping** shows proposed placements/capacity warnings.
- **Commit grouping** writes only after decisions.
- Capacity warning: **Allow all anyway** or **Split into a new class** → name → Create/Cancel.

### Allocate class

- Enter Level → **Preview class allocation** using existing classes.
- Print buttons open Subject-combination roster and Subject roster.
- If no classes: choose number/capacity/naming and **Preview new classes**.
- Resolve every capacity warning with Allow or Split.
- Checkbox **Generate the timetable now** only runs when real needs/teachers exist.
- **Confirm allocation** writes classes/placements/needs and optional job.

### Teacher continuity

- Select level → **Analyse continuity**.
- Subject rows: **Apply replacement + regenerate timetable**.
- Class-teacher rows: **Apply class teacher + regenerate timetable**.
- Recommendations show fair alternatives; no automatic write before button.

### Teacher allocation review

- Select level → load review.
- For each Subject/Class-teacher row choose **Keep** or **Let NEYO auto-assign**.
- **Apply decisions + regenerate timetable** commits selected decisions.
- Review history can expand; Graduated class history can expand.

### Teacher transfer impact

- Select departing teacher/reason as current fields require.
- **Analyse impact** creates preview/recommendations.
- **Apply best replacements + regenerate** commits. For termination/access revocation use Staff →
  Access lifecycle, which adds session revocation and HR end date.

Never press multiple generation buttons concurrently. Wait for the real background job/result and
review timetable.

---

## 22. Troubleshooting

| Problem | Check |
|---|---|
| New Student button missing | `student.create` |
| Student not visible to teacher | real class/subject/timetable assignment |
| Parent sees wrong/no child | Guardian/User/StudentGuardian links |
| Duplicate guardian | search/reuse by normalized phone; edit existing |
| Class dropdown empty | create classes first; permission/module |
| Import valid=0 | mapping/date/gender/phone/class errors |
| Unknown subject | exact code/name catalog and compulsory mapping |
| Transfer status without banner | status changed manually; use proper transfer workflow |
| Undo cannot restore class | previous class removed/archived; assign manually with audit |
| Graduate wrong class | use PromotionRun Undo promptly, verify history |
| Approval button absent | requires create permission; restored UI in this chapter |
| Print wrong learners | active filters/selection |

---

## 23. Founder verification checklist

1. Principal sees all header management actions; teacher sees scoped roster/no create.
2. Register learner with guardian/login; admission and requirements created.
3. Parent login sees only linked child.
4. Search/filter cannot widen teacher/parent scope.
5. Student approvals opens and approve/reject works.
6. Guardian edit/reuse/primary works without duplicate sibling contact.
7. Document upload/serve cross-tenant blocked.
8. Transfer → letter → seat freed → undo restores.
9. Create/edit class and class teacher.
10. Bulk streams create only missing classes.
11. Import preview catches bad/duplicate/unknown values; commit reports exact results.
12. Subject selections lead to Allocate Class.
13. Graduate class → Alumni → Undo promotion where applicable.
14. ID/newsletter/class list outputs match filter/branding.
15. Cross-tenant direct profile blocked.
16. 360px/glass themes and all four states work.

---

## 24. Product gap fixed during this chapter

`ApprovalsDialog` and `approvalsOpen` existed in `students-client.tsx`, but no button opened it and it
was never rendered—an orphaned real UI workflow. Added permission-aware **Student approvals** and
mounted the existing dialog so authorized staff can reach approve/reject actions.

No other new Student behavior was invented; the manual documents current services/pages.

---

## 25. Edit points

- Students page/list/dialog/approvals/printing: `src/app/(app)/students/page.tsx`,
  `src/components/students/students-client.tsx`
- Student profile/guardian/transfer/docs: `student-profile-client.tsx`
- Classes: `classes-client.tsx`
- Import: `import-wizard.tsx`, `student-import.service.ts`
- Alumni: `alumni-client.tsx`
- Promotion/allocation/continuity: `promotion-client.tsx`
- Student service/scoping: `student.service.ts`
- APIs: `src/app/api/students/`, `/api/classes`, `/api/promotion*`

## Mobile student list

On a 360px phone, the List view keeps its full operational columns instead of squeezing them until unreadable. The card shows **Swipe left or right to view all student fields**. Swipe horizontally inside the student table to reach admission numbers, class, gender and status; normal vertical page scrolling remains available. The table has a deliberate minimum width and its own horizontal overflow area. The Kanban view remains an alternative when the user wants cards rather than columns.

## Suggesting a class teacher for a new class or stream batch

When creating one class, the optional **Class teacher** dropdown places staff who are not currently homeroom teachers under **Suggested — not class teachers yet**. After bulk-creating streams, each new row's Class teacher dropdown shows the same suggested group first, while staff already responsible for another class are clearly separated. The suggestion does not assign anyone automatically: leadership reviews workload and chooses. Saving writes `SchoolClass.classTeacherId`; removing the selection clears it. Subject-teacher allocation remains separate in Academics and Timetable.

Founder verification: assign two existing class teachers, create a new class, and confirm those two do not appear in the suggested group; select an unassigned teacher, save, and verify the teacher is then marked as already assigned when configuring another class.

## Add missing subjects directly from an import preview

When a Subjects column contains names that do not yet exist in the school's catalog, the amber warning now provides **Add all N subjects now**. An authorised academic manager presses it once; NEYO deduplicates the names, generates a unique subject code, creates real tenant-scoped CBE `Subject` records, writes an audit log, reloads the school's subject list and automatically runs the same import preview again. Once resolved, those names are no longer skipped and the warning disappears.

This is not a cosmetic dismissal. It changes the real Academics → Subjects catalog and therefore affects later selection, timetable, grouping, marks and exam workflows. Users without `academics.manage` permission receive a clear refusal and should ask academic leadership. Founder verification: preview a small file with two deliberately absent subject names, press the button, confirm both appear under Academics → Subjects, confirm the preview has no unknown-subject warning, then verify a second press/re-preview does not duplicate them.

## Vercel large-import completion rule

NEYO no longer starts a 50+ row import as an in-process fire-and-forget task on Vercel. Vercel may freeze that invocation immediately after the HTTP response, which left real imports appearing to run at 5% indefinitely. Imports now remain attached to the request with a five-minute route budget and return the real result before the wizard says they are complete. Keep the import tab open during this operation. A future background mode must store a serialised payload in a durable Redis-backed worker before it is re-enabled; a database status row alone is not a worker.

Previously interrupted serverless jobs are automatically marked **FAILED** after 15 minutes instead of remaining permanently `RUNNING`; the task badge and job list then tell the user to retry under the corrected attached-request workflow.
