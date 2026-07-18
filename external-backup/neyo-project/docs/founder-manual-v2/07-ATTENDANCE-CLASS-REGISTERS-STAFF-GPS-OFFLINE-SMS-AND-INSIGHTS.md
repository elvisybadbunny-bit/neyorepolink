# NEYO Founder Manual V2 — Module 07: Attendance

**Page:** `/attendance`  
**Tabs:** Class Registers, Staff, Insights  
**Last verified against code:** 2026-07-18

---

## 1. Attendance records and meanings

Student daily status:

- **P — Present**
- **A — Absent**
- **L — Late** (counts as in school in percentage)
- **E — Excused**

One `AttendanceRecord` exists per tenant/student/date. Saving again upserts the same daily row rather
than duplicating it, which makes offline replay safe.

Staff attendance is a separate `StaffAttendance` clock-in/out record. Hostel curfew is separate
`HostelAttendance`; QR scans create scan/audit events and may write attendance through their own
station.

---

## 2. Access and scope

Page requires `attendance.view`; editing requires `attendance.record` plus class/service rules.

- Principal/Owner: see school classes, normally view-only outside own class until Master Override.
- Teacher/Class Teacher: service scope restricts assigned/owned classes.
- Hostel Master: attendance permission but class scope/service behavior applies.
- Parent/Student: can view attendance in their portal/history; Insights hidden. They should not mark
  registers.

Server scope is authoritative even if a client button appears.

---

## 3. Tabs

### Class registers

Daily class cards and one-tap register.

### Staff

Personal clock in/out for staff plus leadership day sheet. Tab is rendered for signed-in attendance
users; `canClock` determines whether personal clock card appears.

### Insights

Hidden for Parent/Student. Shows 14-day trends, today by class, chronic absence and anomalies.

---

## 4. Date controls

- Left arrow: previous day.
- Centre: Today or formatted selected date.
- Right arrow: next day, disabled when already Today (no future registers).
- **Jump to today:** shown on historical day.

Changing date reloads overview. Nairobi date is used.

---

## 5. Master Override

Only Principal/School Owner (including recognized secondary role) sees checkbox.

Default OFF:

- leadership can view other classes;
- only own class-teacher class is directly writable.

Turn ON:

- permitted leadership can mark another class;
- payload carries `masterOverride=true`;
- server validates authority;
- use for genuine cover/emergency, not routine bypass of class ownership.

Card shows **View only — Use Master Override to mark** when applicable.

---

## 6. Class overview cards

Each card shows class label, active student total and state:

- Not marked
- In progress (some marked)
- Done with present badge and absent count
- View only for leadership outside own class without override

Press card to open register. If “No classes to mark,” confirm class creation and teacher/class
assignment; do not give broader role just to expose classes.

---

## 7. Register defaults and status cycling

A fresh register loads every active learner and defaults each to Present so a teacher can mark
exceptions quickly. Existing saved statuses replace defaults.

Press status pill cycles:

`Present → Absent → Late → Excused → Present`

Top badges update live. Read-only users cannot cycle.

**Important:** default Present is not saved until **Save register** is pressed. Do not leave page
assuming visible green pills are already recorded.

---

## 8. Save Register

Sticky bar shows:

- SMS guardians of absentees checkbox (default on)
- Offline/queue indicator
- **Save register (N)**

Button is enabled when register is new/dirty. On press:

1. builds every active student id/status;
2. sends class/date/marks/notifyAbsent/masterOverride through `queuedPost`;
3. online: `/api/attendance` validates class/students/permission and upserts rows;
4. optional guardian notifications run after save;
5. toast Register saved and data reloads;
6. offline: action enters IndexedDB outbox and toast says it will sync.

Do not close browser/delete site data before an offline queue syncs.

---

## 9. Absentee SMS

If checkbox selected, service finds today's newly absent rows whose `smsSentAt` is null, resolves
primary guardian, checks SMS quota, sends specific message, records usage and stamps `smsSentAt`.
Re-saving does not repeatedly send the same day's alert.

Requirements:

- primary Guardian with valid +254 phone;
- configured SMS provider or development fallback;
- quota available;
- saved status A.

Late/Excused do not use the absent notification path. A sent SMS is not proof parent read it; use
follow-up workflow for chronic cases.

---

## 10. Offline behavior

Attendance is explicitly offline-first:

- service worker/app shell available;
- `queuedPost` stores action with idempotency key;
- Offline indicator shows queue;
- reconnect triggers sync;
- server unique key/upsert prevents duplicate daily rows.

If server returns a permanent 4xx (permission/invalid student), queue drops/fails according to queue
policy; investigate rather than repeatedly toggling network.

Bundle Saver read snapshot is separate from action outbox.

---

## 11. Historical corrections

Use date arrows, open class, change statuses and Save if authorized. Audit/marked-by values update
through service. Follow school correction policy; do not rewrite history to hide absence.

Attendance History API supports student/class/from/to and row scope; detailed per-child history is
shown in portal/profile where wired.

---

## 12. Staff Attendance tab

### Clock In

If no record, press **Clock in**.

- geofence off: server creates unverified clock-in.
- geofence on: browser requests GPS, sends latitude/longitude; server computes Haversine distance
  from School Profile point and rejects outside radius.

Success says Clocked in / location verified and reloads.

### Clock Out

After clock-in, press **Clock out**. Double clock-in/out or out-before-in is rejected. Completed card
shows in/out Nairobi times and Day complete.

### GPS failure

If location denied/unavailable with geofence on, UI blocks and asks to allow location. HTTPS is
required in production. Fix School Profile coordinates/radius only with authorized settings access.

---

## 13. Leadership Staff Day Sheet

Where service returns sheet, card shows present/expected and each staff name/role:

- not in;
- clock-in → clock-out;
- GPS verified badge and distance tooltip.

GPS verified means device coordinate was within configured radius, not proof the person remained on
campus all day.

Inactive parents/students are not staff clocking roles.

---

## 14. Insights: 14-day trend

Bar per marked school day:

`(Present + Late) ÷ marked × 100`

Colour thresholds: green ≥90, amber ≥75, red below. Tooltip includes marked count. Empty shows No
attendance data yet.

A percentage based on very few marked rows is not a full-class conclusion; inspect marked count.

---

## 15. Insights: Today by Class

Shows percentage/progress for classes with today's marks. No registers → explicit empty message.
Click-through is not currently on each bar; use Class Registers to inspect.

---

## 16. Needs Follow-Up

Lists learners with 3+ absences in analysis window, admission/class and count. Click name opens Student
profile, subject to permission. This is a rule-based signal, not a diagnosis or automatic punishment.
Contact guardian, check health/transport/fees/safeguarding and document follow-up appropriately.

---

## 17. Unusual Days

Flags class-day attendance materially below that class's usual rate, with date, actual and usual.
“Worth a phone call?” prompts investigation. Check event/weather/transport/unmarked register before
acting.

---

## 18. QR Attendance tab

A discoverability gap was found and fixed during this chapter: the real QR attendance engine/station
was only reachable through Security/Gate. Attendance now has a permission-aware **QR attendance**
tab for users who can record attendance. It reuses the same `QrScanStation` with payment and gate-pass
modes disabled, so there is one scanner engine rather than a duplicate.

Operation:

- choose/keep Attendance mode;
- start camera and allow permission, or type/paste scanned code/admission reference;
- scan real student ID QR;
- verify displayed learner/class;
- choose Present or Late behavior supported by station;
- submit/scan marks today's record through `/api/qr-scan/attendance`;
- duplicate cooldown prevents repeated camera reads;
- recent scans provide `QrScanEvent` audit.

The full Security station still offers Gate Pass and Payment Lookup. Attendance tab intentionally
shows only attendance.

---

## 19. Hostel attendance

Hostel curfew lives `/hostel`, not Class Registers. It loads active boarders and statuses IN/OUT/
LEAVE. Newly OUT can trigger urgent guardian SMS with dedupe. Module 19 will explain every curfew
button. Class attendance and curfew answer different questions and must not overwrite each other.

---

## 20. Hardware options

RFID, fingerprint and face attendance remain hardware/vision-dependent where Checklist says
pending/deferred. Staff browser GPS clock-in is real. QR printed-card path is real through QR station.
Never tell a school fingerprint/face hardware works without tested device integration.

---

## 21. Full daily example

1. Class Teacher opens Attendance → Today.
2. Opens Form 2 East (32 active learners).
3. Everyone defaults Present.
4. Tap Kamau → Absent; Atieno → Late; Kiprono cycles to Excused.
5. Keep absentee SMS checked.
6. Press Save register (32).
7. Server upserts 32; guardian SMS only for Kamau; Dashboard refresh shows 31 present/late? Present
   metric counts P+L, while E/A are not present.
8. If offline, confirm queued indicator then reconnect and wait for sync.
9. Leadership Insights later reviews chronic/unusual patterns.

---

## 22. Common errors

| Problem | Response |
|---|---|
| No classes | assign class/subject teacher; verify scope |
| View only | expected; Principal may enable Master Override |
| Save disabled | no unsaved change or read-only |
| SMS not sent | guardian phone/primary/quota/provider/smsSentAt |
| Offline saved but dashboard unchanged | wait for outbox sync/server success |
| GPS required | allow location and use HTTPS |
| Out of range | verify real position and School Profile radius |
| Already clocked | use Clock Out; do not duplicate |
| Insight red bar | inspect marked denominator and source registers |
| QR scan duplicate | cooldown protection; inspect recent scans |
| Parent sees Staff tab empty | canClock/sheet intentionally restricted; use Portal attendance |

---

## 23. Founder verification checklist

1. Teacher sees only assigned classes; unrelated direct id blocked.
2. Fresh register defaults Present but no DB until Save.
3. Cycle P/A/L/E and save exact counts.
4. Re-save idempotent one row/student/date.
5. Absentee SMS one time, quota usage, primary guardian.
6. Historical correction authorized/audited.
7. Principal view-only then Master Override write.
8. Offline queue/reconnect sync with no duplicates.
9. Parent history only own child; parent cannot POST.
10. Staff clock in/out and duplicate guards.
11. Geofence missing GPS/outside/inside paths.
12. Leadership day sheet and GPS badges.
13. Insights trend, class, chronic, anomaly from real records.
14. QR Attendance via Gate station and tenant isolation.
15. Hostel curfew remains separate.
16. Mobile 360px, glass themes, loading/empty/error/populated.

---

## 24. Gap fixed during this chapter

The real QR attendance backend and scanner existed but Attendance offered no route to it. Added a
**QR attendance** tab gated by `canRecord`, reusing `QrScanStation` in attendance-only mode. No schema,
new scanner logic or duplicate API was needed; this is real UI wiring to the existing service.

---

## 25. Edit points

- Page/tabs/register: `src/app/(app)/attendance/page.tsx`, `src/components/attendance/`
- Student attendance service/API: `attendance.service.ts`, `/api/attendance`, history/analytics
- Offline queue: `src/lib/offline/queue.ts`
- Staff/GPS: `staff-attendance.service.ts`, `staff-attendance-client.tsx`, School Profile GPS
- QR: `qr-scan.service.ts`, `/api/qr-scan/attendance`, Security/Gate station
- Hostel curfew: `hostel.service.ts`, Hostel UI
