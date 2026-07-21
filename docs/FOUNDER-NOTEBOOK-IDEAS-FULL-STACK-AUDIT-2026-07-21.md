# Founder notebook ideas — full-stack reachability audit

Date: 21 July 2026

Status meanings:

- **FULL STACK / REACHABLE** — persisted model/service/API and a reachable user interface were found.
- **PARTIAL** — useful foundation exists, but the notebook’s complete workflow is not reachable.
- **NOT BUILT** — no complete current-branch implementation was found.
- **EXTERNAL / MANUAL** — NEYO deliberately cannot claim an automated external action.

## Timetable and classes

| Notebook idea | Status | Reachable location / evidence | Remaining gap |
|---|---|---|---|
| Add streams and rebalance overpopulated streams | FULL STACK / REACHABLE | Students → Promotion / Allocate Class; class setup; stream reshuffle preview/commit | Performance strategy requires real exam data. |
| Assign teachers/classes even when staff lack phones | FULL STACK / REACHABLE | Academics → Smart Timetable; teacher allocation/import | A staff account still needs a NEYO identity; phone is not required. |
| Per-class Saturday start/end and HOME blocks | FULL STACK / REACHABLE | Academics → Smart Timetable → Schedule rules / Saturday scheduler | Must verify current deployment migration. |
| Per-class free periods | FULL STACK / REACHABLE | Class TimetableConfig / Schedule rules | None found in code; deployment test pending. |
| Configure a grade/range once | FULL STACK / REACHABLE | Smart Timetable grade grouping, whole-grade/contiguous-level save, Grade 6–9/Form 1–4 bulk Saturday | Arbitrary hand-picked non-contiguous class set is not available for every rule. |
| Enter/arrow moves to next marks cell | NOT BUILT | Main marks grids do not implement spreadsheet keyboard navigation | Add focus-grid keyboard behaviour and accessibility rules. |
| Lunch selected as “after period N” | FULL STACK / REACHABLE | `lunchAfterPeriod`; Schedule Rules | Migration/deployed verification pending. |
| Two short breaks | FULL STACK / REACHABLE | `shortBreak2Start` / `shortBreak2Mins` | Deployment verification pending. |
| Games/PE for whole school, level or class at chosen time | FULL STACK / REACHABLE | Smart Timetable blocked slots + co-curricular configuration | Activity-category UI and co-curricular config remain separate surfaces. |
| Period count reflects configured 10 rather than fixed 8 | FULL STACK / REACHABLE | `periodsPerDay`; timetable and print derive ranges | Real browser regression still required. |
| Activity timetable linkage and class ranges | PARTIAL | Academics → Co-curricular; activity categories; blocked-slot scopes | No single arbitrary range picker covers every activity workflow. |
| Fair automatic teacher-to-class allocation with strengths | FULL STACK / REACHABLE | Smart Timetable teacher-subject strengths, auto assignment, staffing report | Human review remains required. |
| Recompute when teacher joins/transfers or settings change | FULL STACK / REACHABLE | transfer-impact/continuity services, allocation review, regeneration | Never automatically publishes changed timetable. |
| Exam PP1/PP2/PP3 and grouped classes | FULL STACK / REACHABLE | Exam Timetable, paper configs, combination/elective targeting | Grading paper UI was unreachable; repaired in this audit. |
| Each teacher receives personal timetable with venue | FULL STACK / REACHABLE | Teacher portal/timetable print bundles | Deployment print verification pending. |
| Lab venue displayed and capacity checked | FULL STACK / REACHABLE | Venue pool, pinned/resolved venue, print cells | Learner capacity requires latest migration. |
| Teacher-in-practice/trainee scenario | NOT BUILT | No dedicated trainee/practice-teacher workflow found | Define permissions, supervision and timetable ownership first. |

## Grading Engine repair in this audit

The Grading Engine existed at Academics → Grading Engine, but it was hidden whenever the curriculum-engine feature flag was off. The paper-aware marks grid also existed as an orphan component with no reachable mount. The ordinary Exams screen used one `Exam.maxMarks` for every subject, which explains why different subject papers/weights were not visible.

Repairs:

1. Grading Engine is now always visible in Academics.
2. Main navigation links directly to `/academics?tab=grading`.
3. New reachable paper configuration supports per subject or per class override.
4. Each paper has its own `outOfMarks` and `weightPct`; weights must total 100%.
5. The paper-aware marks grid is mounted on the Grading Engine screen.
6. Unconfigured subjects inherit the selected exam’s actual maximum instead of a hardcoded 100.
7. Multi-paper weighted scores are converted back to the exam’s declared final scale.
8. Term aggregation normalizes exams with different maxima to percentages before applying macro weights.

## Duties, opening day and welfare

| Idea | Status | Evidence / route | Remaining gap |
|---|---|---|---|
| Editable staff duty roster | FULL STACK / REACHABLE | Academics → Duty Roster | None identified. |
| Configurable student duty areas/classes/gender/capacity | FULL STACK / REACHABLE | Academics → Duty Roster → Student Duties | Current auto assignment uses random shuffling; deterministic fairness should replace it. |
| One active duty per learner | FULL STACK / REACHABLE | Assignment engine excludes already assigned learners | Verify term transition. |
| Exclude leaders if school chooses | NOT BUILT | No leadership-exclusion setting in student duty engine | Add explicit school rule. |
| Exclude medically restricted learners / easier duty after approved letter | NOT BUILT | Clinic records exist, but duty engine does not consume an approved restriction | Requires consent, expiry, severity and safe disclosure design. |
| School may opt out of student duties | PARTIAL | No assignment occurs unless areas are configured | Add explicit Disabled state/explanation. |
| Opening-day attendance sets unknown transfers and excludes duties | FULL STACK / REACHABLE | Opening Day service removes no-show learners from duty assignment and records UNKNOWN | Browser evidence pending. |

## Subject selection, imports and progression

| Idea | Status | Evidence / route | Remaining gap |
|---|---|---|---|
| School-configured compulsory/elective selection portal | FULL STACK / REACHABLE | Academics → Subject Selection | Current Senior readiness enforces confirmed choices. |
| Student saves selections during open dates; report after close | FULL STACK / REACHABLE | Subject portal/selection records/reports | Verify student-facing holiday flow deployed. |
| Class planning from selected-subject numbers | FULL STACK / REACHABLE | Allocate Class, elective auto-build, capacity decisions | Human confirmation required. |
| Teacher subject bulk import | FULL STACK / REACHABLE | Smart Timetable → Teacher Allocation Import | None identified in source. |
| Duplicate-safe import and custom fields | FULL STACK / REACHABLE | Student import preview/mapping/dedupe | Keep testing varied files. |
| Import school admission number and class-labelled lists | FULL STACK / REACHABLE | Admission number/class mapping/import templates | Verify exact source header mappings per school. |
| Promote, graduate and approved repeat | FULL STACK / REACHABLE | Students → Promotion/New Year Review | Pass-mark policy is available through promotion review; final approval is human. |
| Opening attendance catches unknown transfer | FULL STACK / REACHABLE | Opening Day workflow | See welfare section. |

## Families, communication and events

| Idea | Status | Evidence / route | Remaining gap |
|---|---|---|---|
| Class teacher updates guardian number/adds guardian | PARTIAL | Student profile/guardian management and scoped student permissions exist | Confirm class-teacher button/action in deployed UI; role-specific denial has not been browser-proven. |
| Phone-calendar event feed; audience-specific events; parents cannot add | FULL STACK / REACHABLE | Calendar feed token, role/audience permissions | Native calendar subscription depends on user device. |
| Message composer/header should not hide sent content | NEEDS BROWSER REPRODUCTION | Messaging is implemented, but the described scroll/overlay defect is not proven from source alone | Capture 360px screen/video and fix first reproducible layout defect. |
| SMS margin configurable for NEYO revenue | FULL STACK / REACHABLE | SMS margin ledger/configuration and Founder revenue operations | Provider cost/price must remain real and editable. |
| Monthly/termly/yearly billing and storage/SMS costs | PARTIAL | Pricing models, term/month period fields, cost/unit economics, SMS/storage accounting | A single customer-facing cadence selector across every model is not uniformly evidenced. |
| Referral code, mutual first-invoice benefits and post-payment prompt | FULL STACK / REACHABLE | Referral/revenue Ops services and payment hooks | Deployment payment test pending. |
| Company YouTube/TikTok links and feature marketing | PARTIAL | Landing social links + Founder editor completed | External accounts/content calendar still need real account creation and approved posts. |

## Parent/student portal

| Idea | Status | Evidence / route | Remaining gap |
|---|---|---|---|
| Result release notifications to teachers/parents | FULL STACK / REACHABLE | Exam release + in-app/SMS options | SMS depends on configured provider/credits. |
| Multi-child portal and choose learner for payment | FULL STACK / REACHABLE | Parent portal sibling switcher/payment | Cross-school children under one identity is not proven. |
| Split one payment across siblings | PARTIAL | Family payment allocation/intelligence exists | Verify explicit parent-facing split control. |
| Compact mobile cards for fees/results/attendance/safety/homework/library | PARTIAL | Responsive portal modules exist | Full 360px card-density audit remains. |
| Download notes and see videos shown in class | FULL STACK / REACHABLE | Parent/student portal, LMS, Learning Videos class sessions | Video requires internet/provider. |

## Documents, identity and reporting

| Idea | Status | Evidence / route | Remaining gap |
|---|---|---|---|
| Student photo/document upload requires school approval | FULL STACK / REACHABLE | Student approval request models/workflows | Role/browser verification pending. |
| Principal signature and digital school stamp | FULL STACK / REACHABLE | Document service/stamp/signature settings | External legal acceptance varies by recipient. |
| Transfer blocked by library arrears/unreturned books | FULL STACK / REACHABLE | Library clearance in transfer service | Replacement-book/payment workflow should be browser tested. |
| Parent/teacher uploads exam application documents | PARTIAL | Exam materials/KNEC Candidate Studio and storage exist | Parent-originated application upload to an exact package is not fully evidenced. |
| Automatically send documents to KNEC | EXTERNAL / MANUAL | Export/manual workflow only; phantom KNEC gateway removed | Do not claim live KNEC submission without approval/integration evidence. |
| Newsletter layout removes blank spaces/cut lines | NOT VERIFIED | Document/print systems exist | Requires exact newsletter template and print reproduction. |
| Bulk student IDs with names, photos, school logo and cut layout | FULL STACK / REACHABLE | Student ID bulk print/templates | Physical cut accuracy depends on printer/settings. |
| QR on ID for attendance and fees | PARTIAL | QR identity/payment lookup and QR scan infrastructure exist | `docs/FEATURES-CHECKLIST.md` still marks printed-card QR attendance deferred; one-QR-per-session attendance is not complete. |
| Custom names, stamp, student number on IDs | FULL STACK / REACHABLE/PARTIAL | ID templates include identity fields/logo/photo | Exact optional stamp switch requires template verification. |

## Other business and academic ideas

| Idea | Status | Evidence / route | Remaining gap |
|---|---|---|---|
| YouTube asks for API key | FULL STACK / REACHABLE | Founder Credentials Vault; curated zero-quota library fallback | Live search requires key; curated playback does not require search quota. |
| Sibling discount optional | FULL STACK / REACHABLE | Finance sibling intelligence/config | Verify school-specific disabled state. |
| Boarding medical letter changes/removes duty | NOT BUILT | Hostel/clinic/duty exist separately | Needs approved cross-module restriction model. |
| Heavy marketing and sales | OPERATING ACTION | School Visits, demo requests, website/social fields | Real campaigns and evidence are external founder work, not a software checkbox. |

## Priority gaps found

1. Student duties: medical restriction/easier duty and leader exclusion.
2. Spreadsheet keyboard navigation in marks grids.
3. Arbitrary class-range selection for every shared timetable/activity rule.
4. Teacher-in-practice role/supervision.
5. Parent-originated exam-application package upload.
6. Printed ID QR attendance with one session token and duplicate-scan protection.
7. Newsletter pagination/blank-space reproduction.
8. Messaging 360px scroll/overlay reproduction.
9. Parent-facing split-payment verification.
10. Deployed browser evidence for many already-built workflows.

No row marked PARTIAL/NOT BUILT should be presented as completed in marketing or the NEYO Bible.
