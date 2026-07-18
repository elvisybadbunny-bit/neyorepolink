# NEYO Founder Manual V2 — Module 01: Dashboard & Role-Based Home

**Page:** `/dashboard`  
**Real page:** `src/app/(app)/dashboard/page.tsx`  
**Last verified against code:** 2026-07-18  
**Audience:** Founder, school leadership, teachers, finance staff, front office, operational staff,
parents and students.

---

## 1. What the Dashboard is

The Dashboard is the first summary page for a signed-in school user. It does not store a separate
copy of school totals. Every time the page loads, it reads fresh records from the current school's
database because the page is configured as `force-dynamic`.

The Dashboard answers:

- Who am I signed in as?
- What am I allowed to see?
- What needs attention today?
- What are the current student, attendance, fee, event and subscription numbers?
- Which module should I open next?
- Are there delegated tasks, staff calls, saved offline data, or recent activity?

**Important:** The Dashboard is permission-based. Two users from the same school may see very
different cards. This is intentional and protects confidential information.

---

## 2. What happens immediately after login

1. NEYO checks the session and identifies the real user, tenant/school, primary role, secondary role
   and any extra permissions.
2. If there is no valid current user, the protected app layout sends the person to Login.
3. If the role is `FOUNDER` or legacy `SUPER_ADMIN`, `/dashboard` immediately redirects to
   `/founder`. The founder does not use the ordinary school dashboard as the company home.
4. Other roles remain on `/dashboard` and receive only cards allowed by their effective
   permissions.
5. All school database queries run inside the signed-in tenant context.

### Company roles

- **Founder / legacy Super Admin:** redirected to Founder Ops.
- **NEYO Support:** should normally use `/neyo-support-console`; it may see a minimal ordinary
  dashboard if it reaches this route because it does not have school operational permissions by
  default.
- **NEYO Ops:** starts with a narrow safe baseline and receives extra company permissions per
  account. It should use the authorized company console, not act like school leadership.

---

## 3. Role-by-role Dashboard visibility

The following table reflects `permissions.ts` and the actual card checks in `dashboard/page.tsx`.
“Common tools” means Calendar summary, Intercom panel, Bundle Saver and Activity area can render,
subject to their own API scope and available records.

| Role | Money cards | Attendance card/action | Student count | Staff count | Subscription card | Delegation behavior |
|---|---|---|---|---|---|---|
| School Owner | Yes | Yes | Yes | Yes | Yes | Can assign/cancel; can close tasks |
| Principal | Yes | Yes | Yes | Yes | Yes | Can assign/cancel; can close tasks |
| Deputy Principal | No | Yes | Yes | Yes | No | Only own assigned tasks if any |
| Dean of Studies | No | Yes | Yes | No | No | Target/assignee; sees own tasks |
| HOD | No | Yes | Yes | No | No | Target/assignee; sees own tasks |
| Teacher | No | Yes | Yes, scoped through student services in destination module | No | No | Sees own assigned tasks, marks done |
| Class Teacher | No | Yes | Yes | No | No | Sees own assigned tasks, marks done |
| Bursar | No on Dashboard | No | Yes | No | No | Hidden if no assigned tasks |
| Accountant | No on Dashboard | No | No | No | No | Hidden if no assigned tasks |
| Receptionist | No | No | Yes | No | No | Hidden if no assigned tasks |
| Librarian | No | No | Yes | No | No | Hidden if no assigned tasks |
| Hostel Master | No | Yes | Yes | No | No | Hidden if no assigned tasks |
| Support Staff | No | No | No | No | No | Hidden if no assigned tasks |
| Parent | No | Attendance permission exists | Own-child access occurs in destination portal | No | No | Hidden |
| Student | No | Attendance view permission exists | No total-student card | No | No | Hidden |

### Why the Bursar does not see Dashboard money cards

The code deliberately requires `owner.dashboard`, which belongs to the School Owner and Principal.
A Bursar or Accountant still has the detailed Finance module according to their finance permissions,
but does not receive school-wide owner money cards on the home Dashboard. This is a product choice
recorded in the source comment as “school-wide money / My School metrics belong only to School Owner
+ Principal.”

### Secondary roles

A user's effective permission list can include a configured secondary role. The attendance master
check specifically recognizes Principal/School Owner/Super Admin in either primary or secondary
role. If a user sees an unexpected card, check both role fields and any individual extra permissions
before assuming there is a leak.

---

## 4. Before the Dashboard can show meaningful numbers

The page can load on a new school, but many values will be zero or blank until these prerequisites
exist:

1. A school/tenant and valid user account.
2. Current Academic Term with year, term number, start and end dates.
3. Active student records.
4. Active staff user records.
5. Classes and teacher/class assignments.
6. Today's attendance records.
7. Fee structures and current-term invoices.
8. Paid `Payment` records with a real `paidAt` timestamp.
9. Calendar events and unread notifications.
10. Subscription record and current period dates.

### If the term is missing

The Dashboard falls back to the current Nairobi year for invoices and uses a roughly 90-day window
for the collection graph. For accurate term reporting, configure the real current Academic Term in
Academics rather than relying on fallback behavior.

---

## 5. Header: greeting, date and attendance action

At the top you see a time-aware greeting such as:

> Good morning, Wanjiru

The first name comes from the signed-in user's `fullName`. Time is interpreted in Nairobi time
(UTC+3):

- 04:00–11:59: Good morning
- 12:00–16:59: Good afternoon
- otherwise: Good evening

Below it is a live line such as:

> Term 2 · Week 6 · Monday, 18 July

The term comes from the current `AcademicTerm`. The week is calculated from the term's real
`startDate` in seven-day blocks, with Week 1 as the minimum. If the school has not marked any term
as current, the Dashboard says **“No current term configured”** instead of inventing a term. Open
Academics → Terms to create/correct dates or choose the current term.

### Attendance button

The button appears only if the user has `attendance.view` or `attendance.record`.

Possible label:

- **Mark today's attendance** — user can record attendance and is not a master leadership user with
  no own class.
- **View attendance** — read-only or leadership overview behavior.

**When pressed:** browser goes to `/attendance`.

**What should appear next:** attendance overview/register appropriate to role and scope. The
Dashboard button does not itself mark anyone present.

**If nothing appears:** check Attendance module enabled, user permission, class assignment, current
session and browser network.

---

## 6. Kenyan holiday greeting card

The Dashboard may show a special banner on:

- June 1: Madaraka Day
- October 20: Mashujaa Day
- December 12: Jamhuri Day
- December 15–26: Christmas/holiday greeting

This is a visual greeting only. It does not create a Calendar event, close school operations, or
change attendance/timetable rules. Public holiday scheduling belongs in Calendar and the school's
own term configuration.

---

## 7. Primary metric cards

### 7.1 Outstanding Fees

**Visible to:** School Owner and Principal.  
**Source:** current-term invoices.  
**Calculation:** for each invoice:

`totalKes - discountKes - paidKes`

The values are summed for the selected current term/year.

**Press the card:** opens `/finance`.

**What Finance should show:** invoice and collection records explaining the total. The number can
change after payments, discounts, waivers, or new invoices.

**Bundi speaker button:** reads the outstanding balance aloud using the browser's speech engine. It
does not call a remote model or change data.

**If incorrect:**

1. Check current Academic Term.
2. Check invoice year/term.
3. Check discount and paid amounts.
4. Reconcile pending M-Pesa callbacks.
5. Do not manually edit the Dashboard number; fix the source invoice/payment.

### 7.2 Fees Collected Today

**Visible to:** School Owner and Principal.  
**Source:** `Payment` rows where status is `PAID` and `paidAt` is after Nairobi midnight.  
**Press:** opens `/finance`.

The card says “M-Pesa sync active,” but its amount sums paid payment records generally; operational
staff should still reconcile provider/manual methods in Finance.

The small sparkline uses cumulative term collection points, not only today's value.

**If zero after payment:** check callback/settlement status, `paidAt`, tenant, and provider
reconciliation. An initiated STK is not paid revenue.

### 7.3 Collection Rate

**Visible to:** School Owner and Principal.  
**Formula:**

`collected current-term invoice amount ÷ billed current-term amount × 100`

Paid value per invoice is capped at the net invoice amount after discount. The target comes from
`Tenant.collectionTargetPct`, defaulting to 85% when absent.

**Press:** opens `/finance`.

**To change target:** use the authorized owner/settings workflow that updates the collection target;
do not edit source code or browser text.

### 7.4 Students Present

**Visible to:** users with attendance view/record permission.  
**Source:** all today's tenant attendance rows.  
**Present definition:** `P` (Present) plus `L` (Late).  
**Display:** “N present” and “M marked today.” If no rows, it displays a dash and active enrollment.

**Press:** opens `/attendance`.

**Sparkline:** the latest seven dates (within the recent 20-day window) that actually contain
attendance rows. Weekends, holidays and unmarked dates are omitted rather than falsely displayed as
0% attendance. A genuine submitted register with zero present learners still correctly displays
0%.

---

## 8. Secondary count cards

### 8.1 Total Enrolled

**Visible to:** `student.view`.  
**Source:** active students for the headline.  
**Press:** `/students`.  
**Sparkline:** count of non-deleted students admitted by each month-end across six months.

The headline uses the same student row scope as the destination module:

- Teacher/Class Teacher: **My Learners** in genuinely assigned classes.
- Parent: **My Children** linked through the guardian record.
- Leadership/authorized office roles: **Total Enrolled** for the school.

The six-month enrollment sparkline uses that same scope, so the card and destination no longer
disagree.

### 8.2 Total Staff

**Visible to:** `staff.view` or `staff.manage`.  
**Source:** active users excluding Parent, Student and Super Admin roles.  
**Press:** `/staff`.

The subtitle says **“Active school staff,”** matching the query's broader count of active school
users while excluding Parent, Student and legacy Super Admin accounts.

### 8.3 Events & Reminders

**Visible to:** every user on the Dashboard.  
**Source:**

- Calendar events dated today through 30 days ahead.
- Unread notifications belonging to the signed-in user.

**Press:** opens `/calendar`.

The combined number is not only Calendar events. The subtitle separates event and reminder counts.
Use the notification bell for individual unread notifications.

### 8.4 Subscription

**Visible to:** School Owner and Principal.  
**Source:** the real tenant subscription `pricingMode` and status.
**Press:** `/settings/billing`.

Current labels are:

- `SIZE_BASED_V2` → **Capacity Complete**
- `MODULAR_USERS_V1` → **Modular User & Module**
- no subscription row → **Not configured · Open Billing to finish setup**

The Dashboard no longer invents legacy `pro / ACTIVE` values when the subscription row is missing.

### Expiry notification

When the subscription period ends within 0–14 days, Dashboard loading creates an in-app notification
for active School Owner/Principal accounts if today's matching notification does not already exist.
The body includes an internal dedupe key. Pressing it opens Billing.

---

## 9. Tuition Collections vs Expected graph

**Visible to:** School Owner and Principal only.

The dashed navy line is expected billed progress; the green line is actual paid payment progress.
The page creates four points between term start and end. The last point is forced to current term
collected versus total billed.

### How to read it

- Green near dashed: collections near expected billing trajectory.
- Green below dashed: collections lag the displayed expected line.
- Green reaching total: current term invoices largely settled.

### What it is not

- It is not a bank statement.
- It is not a cash-flow forecast.
- It does not prove every payment is reconciled.
- It does not account for an unrecorded invoice or provider transaction.

**To investigate:** click Finance cards, inspect invoices/payments/aging/suspense and current term.

---

## 10. Staff Intercom panel

**Component:** `dashboard-intercom-client.tsx`  
**API:** `/api/intercom`

The panel loads the staff directory and active calls, refreshing approximately every three seconds.
Staff shown offline cannot be called from the button.

### Buttons

- **Refresh:** reload directory/call board.
- **Call:** starts a call to the selected online staff member.
- **Accept:** target accepts a ringing call.
- **Mute/unmute:** changes local call audio state.
- **End:** finishes active/outgoing call.
- **Decline:** rejects an incoming ringing call.
- **Pop out / bring back:** uses document Picture-in-Picture when the browser supports it.

### Expected states

- queued;
- ringing;
- accepted/connected with duration;
- declined/ended/error.

### If call does not work

1. Confirm browser microphone permission.
2. Confirm both users are online in the correct school.
3. Check HTTPS/secure browser requirements.
4. Refresh the board.
5. Check browser/WebRTC support and network restrictions.
6. Use Messages/phone fallback; do not repeatedly start duplicate calls.

---

## 11. Principal Delegation card

**Component:** `principal-delegation-card.tsx`  
**Service:** `delegation.service.ts`  
**API:** `/api/delegations`

### Who can assign

- Principal
- School Owner
- Legacy Super Admin

Targets are active users with Teacher, Class Teacher, HOD or Dean of Studies role.

Teachers/HODs/Deans cannot assign through this card. They see their own tasks and can mark them
done. Other users with no relevant tasks see no delegation card after loading.

### Assign a task fields

1. **Teacher:** required target.
2. **Task:** required; minimum practical title length enforced by the button state.
3. **Category:** choose the operational category.
4. **Due date:** optional date.
5. **Details:** optional; keep non-sensitive.
6. **Assign task:** creates the record, writes audit evidence, notifies the target and reloads board.

### Buttons

- **Assign task:** expected toast “Task assigned to teacher.”
- **Done:** assignee or leadership marks task completed; expected “Task marked done.”
- **Cancel:** assigner/leadership cancels; expected “Task cancelled.”
- **Retry:** shown when loading fails.

### What must not be delegated here

Passwords, payment approval authority, confidential counseling/medical records, legal signing,
platform controls, or a responsibility the target lacks permission to perform. This board is for
non-sensitive operational follow-up.

---

## 12. NEYO Bundle Saver Mode

**Component:** `pwa-data-saver.tsx`  
**Preference API:** `/api/me/bundle-saver`  
**Data API:** `/api/offline/bundle`

Bundle Saver stores a read-only snapshot on the current device in browser IndexedDB. It can include
learners, balances, calendar events and timetable slots. It is on by default and may automatically
sync on first login when no local snapshot exists.

### Controls

- **Checkbox on:** saves preference server-side and syncs now.
- **Checkbox off:** pauses future saving; already saved local data remains until cleared.
- **Sync saved data now:** downloads a fresh authorized snapshot and updates size/time/counts.
- **Clear:** removes the local device snapshot only; it does not delete server records.

### What it does not do

- It does not buy or create a mobile-data bundle.
- It does not make every operation editable offline.
- It does not replace server backup.
- It does not transfer the snapshot to a new device automatically.

### Shared-device safety

Because a local snapshot is stored on the device, use Clear before handing a shared/public device
to an unauthorized person, sign out properly, and follow school device policy.

---

## 13. Recent activity logs

**Component:** `ActivityFeed`  
**API:** `/api/activity`

Shows recent audit-derived actions the user is allowed to view. It helps answer what changed and who
performed it. It is not a general chat and should not be edited to conceal mistakes.

If empty:

- the school may have no recent applicable audit rows;
- the role may not have visibility;
- a filter/entity scope may apply;
- API loading may have failed.

Use domain records and detailed audit tools for formal investigation.

---

## 14. Bundi audio buttons

Small speaker buttons on selected financial cards use the browser `speechSynthesis` API to read the
statistic aloud. Pressing one:

1. stops any current speech;
2. prepares English (`en-KE`) speech at configured rate/pitch;
3. reads the supplied number;
4. toggles speaking state.

If the browser lacks speech synthesis, a toast explains that voice read-out is unavailable. No data
is changed.

---

## 15. How Dashboard data connects to other modules

| Dashboard item | Source record | Destination |
|---|---|---|
| Outstanding/collection | Invoice + Payment + AcademicTerm | Finance |
| Attendance | AttendanceRecord + Student | Attendance |
| Student count | Student | Students |
| Staff count | User | Staff |
| Events/reminders | CalendarEvent + Notification | Calendar / bell |
| Subscription | Subscription + Tenant | Settings → Billing |
| Delegation | PrincipalDelegationTask + Notification/Audit | Dashboard assignee |
| Intercom | IntercomCall and staff presence | Dashboard call panel |
| Bundle Saver | authorized server snapshot + User preference | current device IndexedDB |
| Activity | AuditLog | Activity feed/audit |

Always correct the source module rather than trying to edit a Dashboard card.

---

## 16. Common problems and exact response

| Problem | Likely reason | What to do |
|---|---|---|
| Founder sees no school Dashboard | Founder intentionally redirects | Use `/founder`; use authorized diagnostic/view-as for a school |
| Bursar cannot see money cards | Cards require `owner.dashboard` | Open Finance; this is current permission design |
| Money total wrong | term/invoice/payment/discount mismatch | Verify Terms then Finance and reconciliation |
| Attendance shows dash | no register rows today | Open Attendance and mark/inspect register |
| Attendance trend has fewer than seven points | fewer than seven marked dates exist in the recent 20-day window | Complete missing registers; unmarked/weekend dates are intentionally omitted |
| Term/week wrong | current term dates/current flag are wrong or absent | Correct Academics → Terms; refresh Dashboard |
| Staff count unexpected | active school user role/status differs | Check Staff user status/role; subtitle now matches the broad count |
| Subscription says Not configured | no real Subscription row | Open Billing and complete authorized setup |
| Delegation card missing | not assigner and no own tasks | Expected; ask Principal to assign if appropriate |
| Teacher missing from delegation list | inactive or wrong role | Fix User role/status through authorized user management |
| Intercom Call disabled | target offline/busy | Refresh, confirm presence/network |
| Bundle Saver not syncing | API/network/storage/permission | retry online; check browser storage; do not clear server data |
| Activity empty | no visible recent audit events | Verify API/role and domain records |

---

## 17. Role-specific first action after login

- **School Owner/Principal:** review exceptions and cards, then open the module behind the problem;
  do not make decisions from summary alone.
- **Deputy:** review attendance/students/staff welfare; use specialist modules.
- **Dean/HOD:** go to My Classes/Academics/Attendance/Exams according to duty.
- **Teacher/Class Teacher:** press Mark today's attendance or open My Classes; complete delegated
  tasks.
- **Bursar/Accountant:** use Finance from sidebar, not owner-only Dashboard cards.
- **Receptionist:** use Front Desk.
- **Librarian:** use Library.
- **Hostel Master:** use Hostel and Attendance/curfew.
- **Support Staff:** use assigned Cafeteria/Clinic function.
- **Parent/Student:** use My Children/shared Portal; Dashboard is not the main family workspace.
- **NEYO Support:** use Support Console.
- **Founder:** use Founder Ops.

---

## 18. Founder test checklist for Dashboard

Test with separate real role accounts:

1. Founder redirects to `/founder`.
2. Principal sees four primary cards, student/staff/event/subscription, graph and assignment form.
3. Bursar does not see owner money cards but can open Finance from sidebar.
4. Teacher sees attendance/student cards and only own delegated tasks.
5. Parent cannot see school-wide finance/student/staff counts and can open shared portal.
6. Clicking each card opens the named destination.
7. Today's settled test payment changes Fees Collected Today after refresh.
8. Today's register changes Students Present after refresh.
9. Delegation create → target notification/task → Done works.
10. Bundle Saver sync and clear affect only local snapshot.
11. Mobile width 360px keeps cards/actions usable.
12. Glass-light and glass-dark are readable.
13. No other tenant's values appear.

---

## 19. Dashboard accuracy fixes completed after the first manual audit

The founder requested all five audit findings be fixed before continuing the manual. The Dashboard
now:

1. derives Term and Week from the real current `AcademicTerm` and reports when none is configured;
2. labels the staff card “Active school staff,” matching its query;
3. shows the current dual pricing mode/status or “Not configured,” never fake legacy `pro/ACTIVE`;
4. omits unmarked/weekend/holiday dates from attendance trend instead of treating them as 0%;
5. applies `scopeWhere()` to the learner headline and six-month trend, with role-aware labels.

These corrections live in `src/app/(app)/dashboard/page.tsx` and are included in the founder test
checklist.

---

## 20. Edit points

- Main Dashboard cards/calculations/header: `src/app/(app)/dashboard/page.tsx`
- Role permission visibility: `src/lib/core/permissions.ts`
- Role names: `src/lib/core/roles.ts`
- Sidebar links: `src/lib/core/navigation.ts`
- Delegation UI/service: `src/components/dashboard/principal-delegation-card.tsx`,
  `src/lib/services/delegation.service.ts`
- Intercom: `src/components/dashboard/dashboard-intercom-client.tsx`
- Bundle Saver: `src/components/dashboard/pwa-data-saver.tsx`
- Audio: `src/components/dashboard/bundi-audio-button.tsx`
- Activity: `src/components/activity/activity-feed.tsx`

Do not change a visible label without checking the calculation, destination and role behavior it
describes.
