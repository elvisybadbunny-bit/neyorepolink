# NEYO Founder Manual V2 — Module 04: Users, Roles, Staff Access & Invitations

**Main page:** `/staff`  
**Related:** `/settings/security`, `/teacher`, `/academics`, `/payroll`, `/attendance`, Founder Ops
Team & Access  
**Last verified against code:** 2026-07-18

---

## 1. Understand the four separate records

A common mistake is assuming “adding a teacher” completes everything. NEYO separates:

1. **User account:** identity, email/phone, role, login, active state and security.
2. **HR profile:** TSC, ID, KRA, qualifications, employment/contract/emergency contact.
3. **Academic assignment:** teacher-subject qualification, class-subject need, class teacher,
   timetable/combination/elective assignment.
4. **Payroll salary:** salary/allowances/deductions and payroll runs.

Creating the account does not automatically decide subjects/classes/salary. This prevents dangerous
assumptions.

---

## 2. Company roles versus school roles

### NEYO company roles

- Founder
- Legacy Super Admin
- NEYO Operations
- NEYO Support

These run NEYO the company. They are created/managed through Founder Ops Team & Access, not the
school Staff directory.

### School roles

- School Owner
- Principal
- Deputy Principal
- Dean of Studies
- HOD
- Teacher
- Class Teacher
- Bursar
- Accountant
- Receptionist
- Librarian
- Hostel Master
- Support Staff
- Parent
- Student

Parents/students are linked through family/student workflows, not Staff HR.

---

## 3. What each school role does

| Role | Main responsibility | Important access boundary |
|---|---|---|
| School Owner | school oversight/settings/owner dashboard | all school leadership, never NEYO company control |
| Principal | daily leadership, staff, finance, academics, approvals | broad school access; cannot access another tenant |
| Deputy Principal | students, academics, welfare, discipline, clinic | no owner-only Dashboard money cards |
| Dean of Studies | academics/exams/attendance/teacher work | not full finance/settings |
| HOD | department academics, marks, teacher work | learners/classes tied to teaching/oversight design |
| Teacher | own classes/subjects, attendance, homework, marks | row-scoped; no unrelated learners |
| Class Teacher | teacher work plus own-class student editing/reporting | not school-wide leadership by title alone |
| Bursar | fees, invoices, payments, stores/cafeteria money | no owner-only summary or academics management |
| Accountant | finance read/invoices/payments/reports | narrower than Bursar |
| Receptionist | front desk, student intake, desk payments, gate | not HR/academic leadership |
| Librarian | library and student lookup | no finance/staff administration |
| Hostel Master | hostel, curfew and student lookup | no general HR/finance authority |
| Support Staff | assigned clinic/cafeteria and panic | no school administration by default |
| Parent | linked children/own family portal | no other family/school records |
| Student | own shared portal | own record only |

Permissions are defined in `src/lib/core/permissions.ts`. Secondary role/individual company-team
permissions can extend effective access; review both when diagnosing visibility.

---

## 4. Who can open Staff

`/staff` requires `staff.view`.

- School Owner/Principal: view and manage.
- Deputy: current matrix gives Staff view, not full manage.
- Other roles: usually no Staff page unless individually granted.

`staff.manage` controls editing HR records, leave approvals, recruitment and sensitive staff changes.
`user.manage_roles` separately controls account invitations. The new Invite button appears only with
that permission, so a user who can edit HR but cannot create accounts does not see it.

---

## 5. Staff tabs

Top pills:

- Directory
- Leave
- Recruitment

Pressing a pill changes the visible workflow without leaving `/staff`.

---

## 6. Directory: search and table

Search field matches staff name, role or TSC number in loaded directory.

Columns:

- Staff: name, role, phone
- TSC No.
- Contract: permanent/contract or no record
- Since: employment date
- Actions

Buttons:

- **File:** opens full HR drawer.
- Message icon/button: opens direct conversation.
- **Invite staff:** only `user.manage_roles`.
- **Bulk Import Staff:** only `staff.manage`.

If table is empty, accounts may not exist in current tenant. Retry on load error; do not create
another school/user merely because search has a typo.

---

## 7. Invite one staff account

This real UI was added during this manual chapter because `/api/onboarding/invite` and
`inviteStaff()` existed but no reachable school page called them.

Press **Invite staff**.

Fields:

1. Full name
2. Work email
3. School role

Button: **Create staff account**.

What happens:

- POST `/api/onboarding/invite` with one invite;
- server requires `user.manage_roles`;
- validates email/name, checks an existing global email, generates NEYO login id and creates User in
  current tenant;
- no shared/default password is created;
- duplicate email returns created=0 and UI warns email already belongs to NEYO account.

### First access instruction

Tell invited person:

1. Open Login.
2. Choose **Email me a sign-in link**.
3. Enter invited email.
4. Open one-time email link.
5. First Login Activation asks for a secure password.
6. Then configure passkey/2FA in Security.

Phone OTP/password recovery is not available until a valid phone is later attached through an
appropriate account/staff workflow. Do not promise an SMS to an email-only invited account.

### After invitation

Open File and complete HR profile. Then configure subjects/classes/allocations. Invitation alone does
not make the teacher appear in a timetable requirement.

---

## 8. Bulk Import Staff

Press **Bulk Import Staff**.

Modes:

- CSV / Excel / Paste
- Bundi Intelligent scan (only when released/authorized/quota)

Accepted standard columns include Full Name, Role, Phone, Email, TSC Number, National ID, KRA PIN,
Qualifications, Employment Date, Contract Type, Emergency Contact.

Controls:

- Upload `.csv`, `.tsv`, `.txt`, `.xlsx`.
- First row contains headers checkbox.
- Use sample CSV.
- Paste spreadsheet cells.
- **Run Rule-Based Staff Import**.

Expected result: created and skipped/error counts plus detailed row logs. Phone normalization and
duplicate checks occur server-side. Correct source data and re-import only failed rows; do not import
everyone again blindly.

Bundi path stages extraction/review/commit and must not auto-approve uncertain identity/role fields.

---

## 9. Staff File drawer

Press **File**.

Header shows identity/role/contact and **Message this person**.

Managers see:

- Edit record
- Change role
- Appraise
- Training
- Disciplinary

Sections show HR record, annual leave balances/history, appraisals, CPD/training and disciplinary
history.

Close X or backdrop returns and reloads directory.

---

## 10. Edit HR record

Fields:

- TSC number
- National ID
- KRA PIN
- Qualifications
- Employed since
- Contract type: Permanent, Contract, BOM, Intern
- Contract end
- Emergency contact

Button **Save record** → `/api/hr` action `profile` → `upsertProfile()`.

This does not change login email/phone/role, subject allocation or salary.

Handle National ID/KRA/emergency data as confidential; do not put it in chat/screenshots.

---

## 11. Change role

Press **Change role**.

Fields:

- New role
- Confirmation note for audit trail

Button enabled only when role differs. **Confirm role change** → action `promote` →
`promoteStaff()`.

Server blocks self-promotion and invalid company/parent/student transitions according to HR rules.
A role change immediately affects permissions/navigation after refreshed session/permission load.

Before confirming:

1. Verify appointment authority.
2. Choose minimum required role.
3. Record meaningful note.
4. Review old/new access.
5. Separately update academic assignments if job duties changed.

Role does not equal legal employment promotion by itself.

---

## 12. Appraisal, training and disciplinary buttons

### Appraise

Period, score 1–5, strengths, improvements → Save. Stored with reviewer.

### Training

Title, provider, date, days → Save. Certificate URL exists in backend but current dialog does not
show upload; record separately until UI supports it.

### Disciplinary

Date, verbal/written/suspension/other, details, action → Save. This is employee HR discipline,
different from student Discipline module. Restrict access and follow employment procedure.

---

## 13. Leave tab — every staff user

**My leave** shows allowance and remaining days plus applications.

Press **Apply for leave**:

- type;
- From/To;
- reason optional;
- **Submit request**.

Server calculates days/balance and blocks invalid/over-balance requests. Application becomes
Pending.

---

## 14. Leave approvals and substitute teachers

Managers see Approvals.

- **Approve:** changes status, creates Calendar event and triggers date-scoped substitute proposals
  for real timetable slots.
- **Reject:** closes request as rejected.
- Approved leave shows **Substitutes**.

Substitutes drawer states:

- Proposed
- Confirmed
- Declined
- Unfilled
- Reverted

Buttons:

- Assign/Change teacher
- Confirm
- Decline with optional reason
- Restore original teacher (with confirmation)

Auto-proposal is not live timetable truth until a human confirms. An Unfilled slot needs a real
qualified/free teacher or honest operational decision.

---

## 15. Recruitment tab

Managers press **Post a job**:

- title required;
- description/deadline optional;
- Post job.

On posting press **Log applicant**:

- name;
- phone;
- optional email/notes;
- Log applicant.

Applicant status dropdown: New, Shortlisted, Interviewed, Hired, Rejected.

Changing to Hired does not automatically create User/HR/salary/academic assignment. After hiring,
use Invite or Staff Import and complete onboarding deliberately.

---

## 16. Academic access after account creation

For a teacher to work correctly, configure:

1. Teacher account and role.
2. HR profile (employment truth).
3. `TeacherSubject` qualification links.
4. Class teacher if homeroom role.
5. `ClassSubjectNeed.teacherId` assignments or fair allocator.
6. Combination/elective teacher assignments where used.
7. Generate/publish timetable.

Student row scope recognizes real class-teacher, class-subject, combination and timetable links.
Do not give leadership role merely to make missing class access disappear; fix assignments.

---

## 17. Role effects by workflow

- Attendance requires view/record and class scope.
- Marks requires exam view/enter and class/subject scope.
- Homework/My Classes requires teacher portal/homework permission and assignments.
- Finance roles do not imply academic access.
- Staff HR manage does not necessarily imply `user.manage_roles` invitation authority.
- Menu Visibility can hide a link but cannot grant/replace permission.
- View As is read-only and does not act as staff.

---

## 18. Deactivation, departure and access removal

Current Staff UI focuses records/role, not a clear terminate/deactivate button. Do not “solve” a
departure by changing person into an unrelated low role or deleting HR history.

Proper future/authorized offboarding should:

- mark User inactive through a dedicated controlled workflow;
- invalidate sessions/passkeys/OAuth/API access;
- transfer classes/tasks/approvals;
- close leave/substitute responsibilities;
- preserve HR/payroll/audit/legal records;
- revoke external provider/company access;
- return assets and document exit.

This is a known manual/product gap to address in a dedicated staff access lifecycle feature rather
than using direct database edits.

---

## 19. NEYO company Team & Access

Founder Ops has separate `NeyoTeamMember` controls for Founder/NEYO Ops/Support accounts and extra
permissions. Never create company staff as a school Staff user to give Founder console access.
Company-role permissions include customer requests, metrics, flags, pricing/billing, developer ops,
impersonation and team management, with safer defaults.

---

## 20. Troubleshooting

| Problem | What to check |
|---|---|
| Invite button missing | requires `user.manage_roles`, not only staff.manage |
| Invite says email exists | email is globally associated; verify account/school, do not duplicate |
| Invited person cannot OTP | invite created email-only account; use magic link first |
| Teacher sees no class | teacher-subject/class/timetable assignment, not role escalation |
| User sees too much | role, secondary role, extra permission, assignments, View As/impersonation |
| Role change not visible | refresh/re-login permission context; inspect audit |
| HR field save fails | date format/length/permission |
| Leave approval finds no substitute | no real slot or qualified/free teacher |
| Hired applicant not in directory | recruitment status does not create User |
| Staff import skipped | inspect per-row duplicate/validation log |
| Parent/student in Staff | wrong workflow; create/link through Student/Guardian |
| Former employee still logs in | dedicated deactivation/session revocation required; escalate securely |

---

## 21. Founder verification checklist

1. Principal/Owner sees Invite and Bulk Import.
2. Deputy with staff view but no role-manage does not see Invite/Edit.
3. Teacher cannot open Staff by direct URL if no permission.
4. Invite creates one real tenant account with chosen role and no shared password.
5. Duplicate email yields warning/no duplicate.
6. Magic link → first-password flow works for invited account.
7. HR profile saves independently from account.
8. Role change audits, self-promotion blocked, permissions change.
9. Teacher with no assignment sees no unrelated learners.
10. Add subject/class assignment and verify owned learner access.
11. Bulk CSV import reports created/skipped accurately and is idempotent enough for rerun handling.
12. Leave application/balance/approval/calendar works.
13. Substitute proposal requires human confirmation.
14. Recruitment status does not silently create account.
15. Company roles remain separate from school roles.
16. Cross-tenant staff/User access blocked.
17. Mobile and glass themes usable; confidential data not exposed in screenshots.

---

## 22. Product gaps found/handled in this chapter

### Fixed

The real invite backend existed but no reachable Staff UI used it. Added permission-aware **Invite
staff** button/modal wired to `/api/onboarding/invite`, with role/email/name, duplicate-email feedback
and accurate first-login magic-link instruction.

### Still open

A dedicated staff deactivate/terminate/reactivate access lifecycle UI is not present in the current
Staff client. It should be designed with session revocation, assignment transfer, HR retention and
audit rather than improvised role changes/deletion.

---

## 23. Edit points

- Staff page/permissions: `src/app/(app)/staff/page.tsx`
- Staff UI: `src/components/hr/staff-client.tsx`
- HR API/service: `src/app/api/hr/route.ts`, `src/lib/services/hr.service.ts`
- Invitation API/service/schema: `src/app/api/onboarding/invite/route.ts`,
  `src/lib/services/onboarding.service.ts`, `src/lib/validations/onboarding.ts`
- Staff import: `staff-import.service.ts`, `/api/hr/import`
- Roles/permissions/session: `src/lib/core/roles.ts`, `permissions.ts`, `session.ts`
- Teacher/class scope: `src/lib/services/student.service.ts`, `teacher-portal.service.ts`
- Company Team: `neyo-team.service.ts`, `neyo-team-ops-tab.tsx`
