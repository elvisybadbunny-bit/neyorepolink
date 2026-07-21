# NEYO August 2026 Campaign — Fictional Demo Data Bible

All names, contacts, identifiers, transactions and schools below are fictional. Never mix photographed reports, real school records or real phone numbers into campaign tenants.

## 1. Demo tenant family

### Primary tenant

```text
School: Karibu Hills Mixed Secondary School
Slug: karibu-hills-demo
County: Nakuru
Sub-county: Naivasha
Type: Mixed · Day and Boarding
Curriculum: 8-4-4 transition + CBE Junior/Senior
Motto: Learn. Build. Serve.
Brand: Navy #17233B · Green #15945D
```

Use this for ordinary campaign recording.

### Scale tenant

```text
School: Kilimo Day Secondary School — Stress Test
Purpose: dedicated 40-class/70-teacher timetable evidence
Command after migration: npm run seed:40-stream-demo
```

Never claim the scale tenant is a customer. Label it **Fictional Stress-Test School** on screen.

## 2. Users

| Role | Fictional name | Demonstrates |
|---|---|---|
| School Owner | Grace Wanjiku | dashboard, pricing, governance |
| Principal | Josephine Mwangi | release, approval, leadership |
| Deputy Principal | David Otieno | attendance, timetable committee |
| Director of Studies | Peter Kiptoo | timetable, exams, reports |
| Bursar | Mercy Naliaka | invoices, payments, receipts |
| Registrar | Amina Hassan | admissions, imports, transfers |
| Class Teacher | Faith Chebet | attendance, assessments, remarks |
| Mathematics Teacher | Samuel Kiptoo | marks, Core Mathematics |
| Kiswahili Teacher | Zawadi Muthoni | Kiswahili comments |
| Librarian | Lucy Achieng | books, copy labels, fines |
| Nurse | Ruth Atieno | clinic permissions |
| Security | John Maina | gate and visitor records |
| Parent | Mary Wambui | two-child portal |
| Learner | Kevin Kiptoo | STEM choice and report |

Use `example.test` email addresses and reserved demo numbers that are never dialled. Do not show passwords in videos.

## 3. Classes

```text
Grade 7 East · 36 learners · CBC
Grade 7 West · 34 learners · CBC
Grade 8 East · 38 learners · CBC
Grade 9 East · 35 learners · CBC
Grade 10 East · 35 capacity · CBE
Grade 10 West · 35 capacity · CBE
Form 2 East · 42 learners · 8-4-4
Form 2 West · 40 learners · 8-4-4
Form 4 East · 39 learners · 8-4-4
```

## 4. Learners and guardians

| Learner | Admission | Class | Guardian | Scenario |
|---|---|---|---|---|
| Kevin Kiptoo | KH-S-000247 | Grade 10 East | Mary Wambui | STEM, Core Math |
| Mary Wanjiru | KH-S-000248 | Grade 10 East | Mary Wambui | Social Sciences, sibling payment |
| Aisha Hassan | KH-S-000249 | Grade 9 East | Omar Hassan | pathway guidance |
| Brian Ochieng | KH-S-000250 | Grade 10 West | Beatrice Achieng | Arts/film |
| Faith Naliaka | KH-S-000251 | Form 2 East | Peter Wafula | weighted marks report |
| Musa Abdalla | KH-S-000252 | Grade 8 East | Halima Musa | competency evidence |
| Neema Atieno | KH-S-000253 | Grade 7 East | Rose Atieno | attendance QR |
| Kamau Maina | KH-S-000254 | Form 4 East | Jane Maina | exam papers |

Use 30+ additional generated learners for class grids, but keep these eight consistent for narrative videos.

## 5. Subjects

### Common/core

```text
ENG English
KIS Kiswahili
MATC Core Mathematics
MATE Essential Mathematics
CSL Community Service Learning
PE Physical Education
ICT ICT Skills
```

### Electives

```text
BIO Biology
CHE Chemistry
PHY Physics
AGR Agriculture
CMP Computer Studies
HSC Home Science
BST Business Studies
GEO Geography
HIS History & Citizenship
FIN Fine Arts
THF Theatre & Film
SPR Sports & Recreation
```

## 6. Senior learner choices

| Learner | Pathway | Three selected subjects | Mathematics |
|---|---|---|---|
| Kevin Kiptoo | STEM | Biology, Chemistry, Physics | Core |
| Mary Wanjiru | Social Sciences | Business, Geography, History | Essential |
| Brian Ochieng | Arts & Sports | Theatre & Film, Fine Arts, Business | Essential |
| Aisha Hassan | Undecided | Agriculture, Computer Studies, Geography candidate set | Review |

Include one explicit cross-pathway exception requiring review. Do not let the system silently change it.

## 7. Timetable

```text
Start: 08:00
Assembly: 20 minutes
Lesson: 40 minutes
Short break: after P2, 10 minutes
Long break: after P4, 20 minutes
Lunch: after P7, 40 minutes
Second short break: after P8, 10 minutes
```

Required demonstration cases:

- Chemistry double P3–P4 with Peter Njoroge;
- break after P4 remains locked;
- attempt Chemistry P5 with a different teacher only if separated by break;
- teacher clash across Form 2 East/West;
- Chemistry Lab capacity 30 versus group 35;
- one visible unplaced lesson;
- one draft returned for correction;
- one approved/published generation in a safe test database.

## 8. Assessments and marks

### Assessment names

```text
CAT 2
Holiday Assignment
Oral Presentation
Agriculture Project
Chemistry Practical
End-Term Examination
```

### Contribution rule

```text
CAT 2: 30%
End-Term: 70%
Missing component policy: available work only
```

Key proof:

```text
Faith Naliaka CAT: 60/75 = 80%
End-Term not conducted
Consolidated result: 80%, not 24%
```

### Class marks

Create distributions that produce:

- 84% above class mean;
- 71% near/above mean;
- 58% slightly below mean;
- 43% needing support;
- equal grade bands with different stable comments;
- Kiswahili subject comments in Kiswahili.

## 9. Competency evidence

```text
Learner: Musa Abdalla
Competency: Communication
Evidence: Presented a group water-conservation proposal and answered questions
Level: 3 / Meeting Expectations
State: Teacher recorded → HOD approved → visible to parent
```

Also create one draft/unapproved evidence row to prove parents cannot see drafts.

## 10. Finance

### Fee structure

```text
Tuition: KES 18,000
Activity: KES 2,500
Lunch: KES 6,000
Boarding (boarders only): KES 12,000
```

### Scenarios

- Mary Wambui pays KES 15,000 split between Kevin and Mary;
- one sibling discount with recorded reason;
- one pending teacher-cash request of KES 5,000;
- one partial invoice;
- one fully paid invoice;
- one QR-verifiable receipt;
- no real M-Pesa reference unless produced by an authorised sandbox/live test.

## 11. Exam timetable

```text
Exam: Term 2 Consolidated Assessment 2026
Chemistry Practical candidates: 120
Session capacity: 30
Session length: 60 minutes
Gap: 15 minutes
Resource: Chemistry Lab · capacity 30 · quantity 1
Required invigilators: 2
Preparation: 30 minutes
Cleanup: 20 minutes
```

Create one feasible day and one deliberately infeasible end-time preview.

## 12. Library

```text
The River and the Source · 7 copies
Blossoms of the Savannah · 5 copies
KLB Mathematics Form 2 · 12 copies
Longhorn Secondary Biology · 8 copies
```

Each demonstration copy gets a fictional `COPY-KH-...` code. Include one open loan, one overdue return and one cleared fine. Generate PNG Code 39 + QR labels.

## 13. Attendance and safety

- one class attendance session with 35 expected;
- 32 present, 2 absent, 1 late;
- one offline queued update and one rejected review example;
- one expiring QR session;
- one visitor expected/checked-in/checked-out lifecycle;
- no simulated emergency presented as a real emergency.

## 14. Communication

- direct message;
- class announcement;
- acknowledgement-required message;
- one optional SMS fallback configuration, not sent live;
- one PDF attachment under the test size limit;
- one expired voice-room metadata example with no recording.

## 15. Operations

- hostel: two dorms, six sample beds, one open bed;
- transport: two routes, AM/PM shifts, one full route;
- cafeteria: five-day menu and two enrolment states;
- uniforms: shirt/skirt/trouser sizes and low stock;
- assets: laptop issued to ICT lab and projector under repair;
- clinic: one access-controlled non-sensitive fictional visit;
- procurement: request → approval → received.

## 16. Campaign reset discipline

At the end of each recording day:

1. delete camera recordings that expose secrets;
2. reset records changed during destructive demonstrations;
3. keep fixture IDs stable for tomorrow's script;
4. never reseed an unknown production tenant;
5. record migration version and build commit;
6. mark each clip `RECORDED`, `PRIVACY_CHECKED`, `CAPTIONED`, `SCHEDULED`, `PUBLISHED` in the calendar.

## 17. Evidence labels for captions

Use one:

```text
LIVE DEMO — migrated test environment
LOCAL DEMO — browser-tested locally
STATIC PROOF — database/browser verification pending
SIMULATOR — no live payment sent
DESIGN PREVIEW — not production active
```

Never crop the evidence label out when cross-posting.
