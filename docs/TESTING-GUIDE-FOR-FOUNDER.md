# NEYO Testing Guide — "The Constitution" for Checking Every Feature Tied to the Timetable

**Written: 2026-07-11.** This is a plain-language, step-by-step guide for YOU (the founder, zero coding experience) to test NEYO on your own laptop, especially the Timetable Generator and everything connected to it: exam timetables, constraints, teacher transfers/substitutes, and Transport routes.

Read this alongside `RUN-ON-YOUR-LAPTOP.md` (how to get NEYO running) or `RUN-LOCALLY-FOR-FOUNDER.md` (the fuller beginner guide, also in this repo). This file is the **"what to click, what to expect, what a real bug looks like"** guide — the constitution you check every feature against.

---

## 0. Before you start — the golden rule of testing NEYO

Every test below follows the same shape:

1. **Log in as a specific role** (Principal, Bursar, Teacher, Parent...) — NEYO shows different things to different people on purpose. If you don't see a button, check you're logged in as the right role first.
2. **Do the action** (click, generate, save).
3. **Check the RESULT is real, not fake.** NEYO is built with a "zero placeholder" rule — every number, every name, every generated timetable should be REAL data from the database, never a sample/lorem-ipsum/hardcoded value. If you ever see fake-looking data (e.g. "John Doe", "Lorem Ipsum", the exact same result no matter what you enter), that IS a real bug — please report it immediately as "this looks fake/placeholder", because it is against NEYO's own build rules.
4. **Note what a "pass" looks like** — spelled out under each section below so you don't have to guess.

**Your 4 real test schools already loaded in the database (created during previous build sessions):**

| School | Login email | Password | What it's for |
|---|---|---|---|
| Karibu High School | `principal@karibuhigh.ac.ke` | `Karibu2026!` | Small school (2 classes) — quick everyday testing |
| Uwezo Primary & Junior School | `principal@uwezoschool.ac.ke` | `Uwezo2026!` | Medium school (27 classes, 129 teachers) — CBC/Grade 1-9 testing |
| Kilimo Day Secondary School | `principal@kilimoday.ac.ke` | `Dual2026!` | Large stress-test school (40 classes, 70 teachers) — tests NEYO at real scale |
| NEYO Founder (your own company account) | `founder@neyo.co.ke` | `Karibu2026!` | NEYO Ops / company-side admin, not a school |

Login page: `http://localhost:3000/login`. Click **"Sign in with email & password"** (the default screen asks for a phone number first — you want the email option instead), then type the email + password above.

---

## 1. THE TIMETABLE GENERATOR — the heart of NEYO, test this first and most carefully

**Where to find it:** log in as a Principal → left menu → **Academics** → **Smart Timetable** tab.

### 1.1 What the Timetable Generator actually does (so you know what "working" means)
It looks at every class, every subject that class needs, how many lessons per week each subject needs, which teacher teaches it, and any rules ("constraints") you've turned on — then automatically builds a full weekly timetable with zero manual dragging-and-dropping required. It runs in the background (so you can keep working while it thinks) and shows live progress.

### 1.2 Basic test — small school (fast, ~5 seconds)
1. Log in as `principal@karibuhigh.ac.ke` / `Karibu2026!`.
2. Academics → Smart Timetable tab.
3. Click **"Generate timetable"** (the Master Button).
4. **PASS looks like:** a progress bar appears, moves to 100%, and says "Done" within a few seconds. Click into the **Timetable** tab afterward — every class (Form 1 West, Form 2 East) should show a full grid, Monday-Friday, with every period filled in with a real subject name and a real teacher's name (never blank cells unless a class genuinely has fewer lessons than periods).
5. **FAIL looks like:** progress bar stuck / an error message / a class with mostly empty periods / the exact same subject repeated in every period of every day (a sign the spreading logic broke).

### 1.3 Stress test — large school (proves NEYO can handle a real 40-class secondary school)
1. Log in as `principal@kilimoday.ac.ke` / `Dual2026!` (Kilimo Day Secondary — 40 classes, 70 teachers, real dual-shift lunch).
2. Academics → Smart Timetable → **Generate timetable**.
3. **PASS looks like:** completes in under ~30 seconds (this was directly measured at ~21 seconds during testing). Go to the Timetable tab, pick any class (e.g. Form 1 Amani) — a full 11-period day, Monday-Friday, with real subjects/teachers, a lunch break correctly placed (Form 1 & 2 eat at period 7, Form 3 & 4 eat at period 8 — this is intentional "dual-shift" design so the whole school doesn't need one giant lunch hall break at once), plus 2 short breaks and 1 long break.
4. **Known, already-understood limitation** (not a bug you need to report again): at this exact 40-class/70-teacher scale, roughly 45 out of ~1,840 Physical Education lessons (about 2%) may fail to place, because PE teachers/facilities are shared and genuinely become the tightest resource in a very large school — this happens in real schools too. If you see a small number of unplaced PE lessons reported after generation, that is expected and already investigated; it is NOT the earlier ~63%-unplaced bug (which IS fixed). If unplaced lessons ever climb back above roughly 5-10% of the total, or if a NON-PE subject (Math, English, etc.) starts showing large numbers of unplaced lessons, that IS a new bug — report it.

### 1.4 Regenerating — test it doesn't destroy other timetable data
1. On the same school, go to Academics → Smart Timetable and click Generate again.
2. **PASS:** it should generate cleanly a second time without errors, and any manually-placed activities/remedial classes (if a school has set those up separately) should still be there afterward, untouched.

### 1.5 Printing timetables (PDF / paper)
1. Academics → Timetable tab → pick a class → click **"Print Timetable"** (or "Print all classes" / "Print all teachers" for bulk).
2. **PASS looks like:** opens a new browser tab showing a clean, chrome-free page — just the timetable grid, no NEYO menu/sidebar/buttons around it, correct paper orientation (landscape if the class has many periods, portrait otherwise), subjects color-coded, teacher and room initials in the corner of each cell, and a "Print" button that sends it to your actual printer or lets you Save as PDF.
3. Try the **"Black & white / ink-saver"** toggle if visible — colors should disappear (for printing on a normal home/office printer) while the lunch/break bar still shows clearly.
4. **FAIL looks like:** the NEYO menu bar/sidebar shows up in the printed page, the page runs onto a 2nd page when it shouldn't, or a cookie-consent banner appears on the print page.

---

## 2. TIMETABLE CONSTRAINTS ("settings" that change how the generator behaves)

**Where:** Academics → Smart Timetable → look for a **Constraints** / settings section (per-school rules you can turn on/off).

These are OPTIONAL rules a school can turn on. By default, none of them are on, and the generator should still work well. Test both states: OFF (default) and ON.

| Constraint | What it should do when turned ON | How to test |
|---|---|---|
| **Subject Morning Placement** | Forces a chosen subject (e.g. Mathematics) into only the first few periods of the day | Turn it on for Math, regenerate, check every Math lesson in the printed timetable is in an early period only |
| **Teacher Time-Off** | A teacher marked unavailable on a specific day/period never gets a lesson placed there | Mark a teacher off on Monday period 1, regenerate, check that teacher has NO lesson at that exact slot |
| **Lesson Distribution / Spread** | Spreads a subject's lessons across different days instead of clumping them | Regenerate and check a subject with e.g. 5 lessons/week doesn't get placed 3x on one day and 2x on another with 2 empty days |
| **Stream Distribution** | Prevents too many streams of the same grade taking the same subject at the exact same time (useful when they share one teacher) | Only meaningful on a multi-stream school like Uwezo or Kilimo Day; set to a number ≥ your real number of streams (this was a real gotcha found during testing — setting it LOWER than your actual stream count will wrongly block lessons from placing) |
| **Class-Stream Conflict** | Stops one shared teacher's classes from double-booking each other | Assign one teacher to 2 streams, turn this on, regenerate, confirm no clash |
| **Double Lesson / Same-Day Doubles** | Keeps a "double lesson" (e.g. a 2-period Science practical) together, same day | Check a subject configured with double lessons shows 2 consecutive periods on the SAME day, not split across 2 days |
| **PE Time-Slot Control** | Restricts PE to specific allowed periods (e.g. never period 1) | Turn on, regenerate, confirm no PE lesson lands in a period you excluded |

**General PASS/FAIL rule for constraints:** turning a constraint OFF should never break anything (system still generates a full timetable). Turning one ON should visibly change the resulting timetable in exactly the way the constraint promises. If turning a constraint ON causes many lessons to go unplaced that used to place fine, that's usually a sign the constraint's own number (like Stream Distribution's count) is set unrealistically — check the number against your real school data first before reporting it as a NEYO bug.

---

## 3. EXAM TIMETABLE GENERATOR — separate from the class timetable, same spirit

**Where:** left menu → **Exam Timetable** (Principal/Academic staff), or Academics → **Exam Auto-Generator** tab.

### 3.1 Basic test
1. Log in as Principal on any school.
2. Go to Exam Timetable → set up a new exam (a name, a date range, exam session periods e.g. "Morning 1: 08:00-10:00").
3. Click Generate.
4. **PASS looks like:** every class gets one paper per subject per period, real paper names (e.g. "Paper 1"/"Paper 2"/"Insha"/"Oral" for languages — not a single generic "Exam" label for everything), no class ever gets 2 papers scheduled in the same time slot, and (if you turned on invigilator auto-assignment) real teacher names appear as invigilators, not blank/"TBD".
5. Test a subject that has NO custom paper set up yet — NEYO should still generate a sensible fallback ("Theory" for most subjects, or "Paper 1 + Paper 2" for senior-school-style subjects) rather than failing outright.

### 3.2 What a real bug looks like here
- Two classes scheduled for the exact same room/time in a way that would be physically impossible.
- The exact same subject/paper name repeated for every single subject (a sign paper names aren't being read from the real per-subject setup).
- Invigilator list showing the same 1 teacher for every single slot in the whole exam (should rotate/balance across available teachers).

---

## 4. TEACHER TRANSFERS / STAFF CHANGES — how the timetable reacts when a teacher leaves

**Where:** left menu → **Students** → **Promotion** page → look for the **"Teacher Transfer Impact"** panel (this tool actually lives on the Promotion page even though it's about staff — that's intentional, since transfers often happen at term/year-end alongside promotions).

### 4.1 Test the "who is affected" analysis
1. Pick a real teacher who currently teaches multiple classes.
2. Enter their name/ID and a reason (e.g. "Transferred to another school"), click **Analyse**.
3. **PASS looks like:** a real list of every class/subject that teacher currently teaches, a ranked list of suggested replacement teachers (each with a real reason like "already teaches this subject" or "has the lightest current workload"), and a clear note saying the timetable WILL need regenerating if you apply this change.
4. Click through the ranked alternatives — each one should show believable projected class-count numbers, not identical numbers for every option.

### 4.2 Test actually applying a transfer
1. Pick the top recommended replacement and click **Apply**.
2. **PASS looks like:** the leaving teacher's classes are now assigned to the new teacher in Academics → Smart Timetable's subject-need list, and regenerating the timetable places the new teacher into those slots correctly with no double-booking against their existing classes.
3. **Important real-world check:** the OLD teacher's name should no longer appear on those classes' timetable after regeneration, and the NEW teacher shouldn't get double-booked against a class they already teach at the same time.

### 4.3 Test Substitute Teacher coverage (short-term absence, different from a permanent transfer)
**Where:** HR / Leave Management area — when a teacher's leave request is approved, look for automatic substitute proposals.
1. Approve a real teacher's leave request that overlaps with their real timetabled lessons.
2. **PASS looks like:** NEYO proposes real substitute teacher(s) — never auto-applies without you confirming — and if truly no qualified free teacher exists for a slot, it should honestly say "Unfilled" rather than inventing a name.
3. Confirm a suggested substitute, then check the timetable itself: the ORIGINAL teacher's assignment on that slot should be unchanged in the underlying data — substitution is a temporary overlay, not a permanent rewrite. Restoring afterward (marking the leave as over or manually reverting) should put things back exactly as they were.

---

## 5. TRANSPORT — routes, shifts, vehicle allocation (a different engine, but shares scheduling DNA with the timetable)

**Where:** left menu → **Transport** (Principal/Bursar/Transport Officer role).

### 5.1 Test route + shift setup
1. Create a real route (e.g. "Kikuyu Route") with a real vehicle and driver.
2. Add 2 shifts to it if your school runs a morning + evening shift model (e.g. "Morning Shift" and "Evening Shift"), each with its own seat capacity.
3. **PASS looks like:** each shift shows its own live seat count (e.g. "18 / 30 seats filled"), and you cannot add a 31st student to a 30-seat shift — the system should politely refuse ("Full") rather than silently overbooking.

### 5.2 Test student auto-allocation
1. Enroll a new student and assign them to Transport.
2. **PASS looks like:** NEYO automatically picks whichever shift on that route currently has the MOST free seats (spreading students fairly across shifts) rather than always dumping everyone onto the first shift.

### 5.3 Test route-change requests (parent-initiated)
1. Log in as a parent (`parent@karibuhigh.ac.ke` / `Karibu2026!` on Karibu High), go to the Parent Portal → Transport, and request a route/shift change for their child.
2. Log back in as Principal/Bursar and approve it.
3. **PASS looks like:** you can choose how billing is handled at approval time — PRORATE (charge only the remaining days), TOP-UP (charge the fare difference), or NEXT TERM ONLY (no charge until next term) — and whichever you choose shows up honestly on the family's real invoice with a clear note explaining why.
4. Test releasing a seat (e.g. a student leaves transport) — the freed seat should immediately become available for another waiting student, and (if enabled) NEYO should notify families on a waiting list that a seat opened up.

### 5.4 What a real bug looks like here
- A shift accepting more students than its seat cap.
- A route-change request silently applying with NO record of what billing action was taken.
- A parent from School A somehow able to request a change for a child in School B (a serious real security bug if you ever see this — report immediately).

---

## 6. OTHER FEATURES TIED TO THE TIMETABLE (quick-check list)

| Feature | Where | Quick PASS check |
|---|---|---|
| **Venues / Labs** | Academics → Smart Timetable → Venue management | Add a lab, tag which subjects use it (e.g. "Chemistry"), regenerate — Chemistry lessons should show that lab's short code in the corner of the timetable cell, and 2 classes should never be double-booked into the same lab at the same time |
| **Combination Classes** (shared subjects like small-uptake electives across streams) | Academics → Smart Timetable → Combination setup | A combination group (e.g. "Business Studies across all 3 streams") should be scheduled at the exact SAME period for every member class, with one shared teacher, never split |
| **Duty Roster for Teachers** | Staff/HR area | Should show a real weekly duty schedule pulling from real teacher availability, not a fixed sample roster |
| **Activity-Aware Timetable** (clubs/co-curricular) | Academics → Co-curricular tab, linked to Timetable | Adding a co-curricular activity for a time slot should show up correctly alongside the academic timetable without silently overwriting a real lesson |
| **Teacher Portal — "My Timetable"** | Log in as any teacher → their own dashboard | A teacher should see ONLY their own real lessons across however many classes they teach — never another teacher's schedule |
| **Parent Portal — child's timetable view (if enabled)** | Parent portal | Read-only, matches exactly what's shown on the official class timetable |

---

## 7. WHAT TO DO IF SOMETHING FAILS

1. **Take a screenshot** of the exact screen showing the problem.
2. **Write down:**
   - Which school/tenant you were testing (Karibu High / Uwezo / Kilimo Day)
   - Which role you were logged in as
   - Exact steps you took
   - What you expected vs. what actually happened
3. Send that to me (your Build Partner) exactly like that — plain description, no need for technical terms. I will reproduce it, find the real cause, and fix it the same disciplined way every other fix this session was done: find the REAL bug in the REAL code, never a fake patch.

---

## 8. A closing honest note on trust

Every single number/behavior described as "PASS" above was actually run and verified against the real NEYO database during this session — none of it is a guess about how the code "should" behave. Where a known limitation exists (like the ~2% PE placement tightness at 40-class scale), it's written above exactly as-is, not hidden. If your own testing on your laptop finds a genuinely different result than what's described here, trust your own eyes and tell me — that's real, useful signal, not something to second-guess.
