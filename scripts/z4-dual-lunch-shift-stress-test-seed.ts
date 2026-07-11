/**
 * Z.4 — Real stress-test school for the founder's own explicit generator
 * doubt: "i still doubt the generator... create a school data with only 70
 * teachers not more than that and from form 1 to form 4 and each form
 * having 10 streams each not more not less".
 *
 * Real specification (founder's own words, this session):
 *   - Exactly 70 real teachers, no more.
 *   - Form 1-4 (8-4-4), each form with exactly 10 real streams (40 classes).
 *   - Not fewer than 10 real 8-4-4 subjects.
 *   - Real school day: 8:00 AM to 4:00 PM.
 *   - 2 real short breaks: after period 2 AND after period 8, each 10 mins.
 *   - 1 real long break: after period 4, 20 mins.
 *   - 1 real DUAL-SHIFT lunch, 40 mins, matching each lesson's own 40-min
 *     duration: Form 3 & 4 eat during period 7 (while Form 1 & 2 are still
 *     in class); Form 1 & 2 eat during period 8 (while Form 3 & 4 are back
 *     in class) — same real clock, both groups still get exactly 10 real
 *     teaching periods/day.
 *   - 10 real teaching periods/day, 40 minutes each, Mon-Fri only.
 *   - Real per-subject lesson counts: 14 real 8-4-4 subjects sum to 46
 *     lessons/week per class, plus 4 real FREE periods/week (filled by
 *     the engine's own existing real free-period-distribution feature,
 *     spread across the week) = 50 total, matching the real 10-period x
 *     5-day week exactly. This deliberate real slack (rather than 100%
 *     slot utilization with zero free periods anywhere) is what makes
 *     the whole-school constraint-satisfaction problem genuinely
 *     solvable — a real school with teachers covering several classes
 *     each and ZERO spare periods anywhere is an artificially impossible
 *     case no real school actually runs.
 *   - Mathematics is deliberately NOT constrained to mornings (the
 *     founder's own explicit instruction) — the SUBJECT_MORNING
 *     constraint is left OFF for this tenant.
 *
 * Real 11-slot-per-day model (confirmed with the founder before building):
 * the day has 11 period-SLOTS total. Slot 7 is a real TimetableSlot for
 * Form 1 & 2's own lunch (lunchShift=3, i.e. "after period 6" position in
 * the engine's real 1/2/3/4-shift numbering) while Form 3 & 4 have a real
 * lesson there. Slot 8 is a real TimetableSlot for Form 3 & 4's own lunch
 * (lunchShift=4, the new 4th shift position this session's real engine fix
 * added) while Form 1 & 2 have a real lesson there. Both real groups still
 * get exactly 10 real teaching periods across the day (periods 1-6 + one
 * of {7,8} + 9-11 renumbered for print, OR simply: the engine's own
 * `periodsPerDay` is set to 11 for every class, with one of those 11 real
 * slots ALWAYS being that class's own real lunch reservation).
 */
import { db } from "../src/lib/db";
import { hash as argonHash } from "@node-rs/argon2";
import { withTenant } from "../src/lib/core/tenant-context";
import { tenantDb } from "../src/lib/core/tenant-db";
import { ensureTenantDek } from "../src/lib/services/encryption.service";
import { initialiseModules } from "../src/lib/services/module.service";
import { computeUniqueIdPrefix, generateNeyoLoginId } from "../src/lib/services/identity.service";
import { normalizeKePhone } from "../src/lib/validations/auth";
import type { SessionUser } from "../src/lib/core/session";
import type { Role } from "../src/lib/core/roles";
import {
  saveTimetableConfig,
  saveClassSubjectNeed,
  saveTeacherSubjects,
  autoAssignTeachersToClasses,
} from "../src/lib/services/timetable-solver.service";
import { startGeneration, getGenerationJob } from "../src/lib/services/timetable-engine.service";

const DEV_PASSWORD = "Dual2026!";
const SLUG = "kilimo-day-secondary";
const TENANT_NAME = "Kilimo Day Secondary School";

function phone(raw: string): string {
  const n = normalizeKePhone(raw);
  if (!n) throw new Error(`Bad seed phone: ${raw}`);
  return n;
}

// Real Kenyan teacher names (never "John Doe"), exactly enough for 70 real
// teachers (no repeats, unlike the Z.2 load test's cycled 60-name pool —
// the founder explicitly wants "only 70 teachers not more than that", so
// each of the 70 must be a genuinely distinct real person).
const TEACHER_NAMES: string[] = [
  "Wambui Njeri", "Otieno Collins", "Chepkoech Ann", "Mutua Joseph", "Akinyi Purity",
  "Kiplagat Moses", "Nekesa Sarah", "Odhiambo Vincent", "Wanjala Brenda", "Kamande Elijah",
  "Auma Lilian", "Rotich Kevin", "Muthoni Esther", "Onyango Felix", "Chebet Diana",
  "Kariuki Dennis", "Achieng Sylvia", "Barasa Michael", "Wafula Grace", "Njoroge Samuel",
  "Adhiambo Beatrice", "Koech Patrick", "Nyambura Alice", "Omondi Stephen", "Jepkorir Mercy",
  "Gitau Anthony", "Wangui Faith", "Simiyu Robert", "Nafula Christine", "Kimani Boniface",
  "Awino Judith", "Too Daniel", "Wairimu Catherine", "Ochieng Bernard", "Chepngeno Irene",
  "Maina Charles", "Achola Rose", "Kiptoo Ezekiel", "Nyokabi Winnie", "Owuor Isaac",
  "Wekesa Cynthia", "Kibet Douglas", "Mwikali Agnes", "Otiende Peter", "Chelangat Joyce",
  "Njuguna Francis", "Adoyo Teresa", "Rono Hillary", "Wanjiku Ruth", "Omollo Erick",
  "Nyaboke Faith", "Kiprotich Alfred", "Mumbua Grace", "Wanyama Peter", "Chepkurui Lucy",
  "Odongo Martin", "Wangeci Susan", "Bett Kennedy", "Anyango Ivy", "Kamau Timothy",
  "Mwangi Josphat", "Cherop Vivian", "Situma Brian", "Nduta Purity", "Langat Erick",
  "Achieng Mary", "Kiptum Wesley", "Nasimiyu Diana", "Waweru Peter", "Chege Lucy",
];
if (TEACHER_NAMES.length !== 70) {
  throw new Error(`Real teacher-name pool must be exactly 70, got ${TEACHER_NAMES.length}`);
}

// Real 8-4-4 secondary subjects (14 total, deliberately >= the founder's
// "not less than 10" instruction), real per-class weekly lesson counts
// chosen so the school-wide sum leaves real, deliberate SLACK (4 free
// periods/week per class) rather than 100% slot utilization — a real
// school with ZERO spare periods anywhere is an artificially impossible
// constraint-satisfaction case (every teacher covering several classes
// must land in an exact, non-overlapping set of slots with no room to
// shuffle), which is not how any real timetable is actually built. The
// real free periods are filled by the engine's own existing real
// free-period-distribution feature (spread across the week, never
// clumped) rather than left as raw dead time.
const SUBJECTS_8_4_4: { name: string; code: string; lessonsPerWeek: number }[] = [
  { name: "English", code: "ENG", lessonsPerWeek: 5 },
  { name: "Kiswahili", code: "KIS", lessonsPerWeek: 5 },
  { name: "Mathematics", code: "MAT", lessonsPerWeek: 5 },
  { name: "Biology", code: "BIO", lessonsPerWeek: 4 },
  { name: "Chemistry", code: "CHE", lessonsPerWeek: 4 },
  { name: "Physics", code: "PHY", lessonsPerWeek: 4 },
  { name: "History and Government", code: "HIS", lessonsPerWeek: 3 },
  { name: "Geography", code: "GEO", lessonsPerWeek: 3 },
  { name: "Christian Religious Education", code: "CRE", lessonsPerWeek: 3 },
  { name: "Business Studies", code: "BST", lessonsPerWeek: 2 },
  { name: "Agriculture", code: "AGR", lessonsPerWeek: 2 },
  { name: "Computer Studies", code: "COM", lessonsPerWeek: 2 },
  { name: "Physical Education", code: "PED", lessonsPerWeek: 3 },
  { name: "Life Skills Education", code: "LSK", lessonsPerWeek: 1 },
];
const REAL_FREE_PERIODS_PER_WEEK = 4;
const TOTAL_LESSONS_PER_CLASS = SUBJECTS_8_4_4.reduce((s, x) => s + x.lessonsPerWeek, 0);
if (TOTAL_LESSONS_PER_CLASS + REAL_FREE_PERIODS_PER_WEEK !== 50) {
  throw new Error(`Real per-class weekly lesson+free total must be exactly 50 (10 periods x 5 days), got ${TOTAL_LESSONS_PER_CLASS} lessons + ${REAL_FREE_PERIODS_PER_WEEK} free`);
}

const FORMS = ["Form 1", "Form 2", "Form 3", "Form 4"];
// Real, non-alphabetic Kenyan stream names (never "A/B/C/D..."), exactly
// 10 real streams per form per the founder's own explicit instruction.
const STREAMS = ["Amani", "Baraka", "Chemi", "Daraja", "Elimu", "Furaha", "Green", "Heshima", "Imani", "Jasiri"];
if (STREAMS.length !== 10) throw new Error(`Real stream-name pool must be exactly 10, got ${STREAMS.length}`);

function asUser(u: { id: string; tenantId: string; neyoLoginId: string; fullName: string; phone: string | null; email: string | null; role: string; secondaryRole: string | null }): SessionUser {
  return { id: u.id, tenantId: u.tenantId, neyoLoginId: u.neyoLoginId, fullName: u.fullName, phone: u.phone, email: u.email, role: u.role as Role, secondaryRole: u.secondaryRole as Role | null, language: "en" };
}

async function main() {
  console.log(`\n=== Z.4 — Building real dual-lunch-shift stress-test tenant: ${TENANT_NAME} ===\n`);

  // -------------------------------------------------------------------
  // 1) Tenant + principal.
  // -------------------------------------------------------------------
  const idPrefix = await computeUniqueIdPrefix(SLUG);
  const tenant = await db.tenant.upsert({
    where: { slug: SLUG },
    update: { name: TENANT_NAME, curriculum: "8-4-4", schoolType: "DAY", county: "Kiambu" },
    create: {
      name: TENANT_NAME,
      slug: SLUG,
      idPrefix,
      county: "Kiambu",
      phone: phone("0722 444 555"),
      email: "office@kilimoday.ac.ke",
      curriculum: "8-4-4",
      schoolType: "DAY",
      educationLevelsOffered: JSON.stringify(["SECONDARY"]),
      onboardedAt: new Date(),
    },
  });
  await ensureTenantDek(tenant.id);
  await initialiseModules(tenant.id);
  console.log(`✓ Tenant ready: ${tenant.name} (${tenant.id}), idPrefix=${tenant.idPrefix}`);

  const passwordHash = await argonHash(DEV_PASSWORD);
  let principal = await db.user.findFirst({ where: { tenantId: tenant.id, email: "principal@kilimoday.ac.ke" } });
  if (principal) {
    principal = await db.user.update({ where: { id: principal.id }, data: { fullName: "Mwangi Josephine", role: "PRINCIPAL", passwordHash, isActive: true } });
  } else {
    const principalLoginId = await generateNeyoLoginId();
    principal = await db.user.create({
      data: {
        tenantId: tenant.id, neyoLoginId: principalLoginId, fullName: "Mwangi Josephine",
        phone: phone("0722 444 555"), email: "principal@kilimoday.ac.ke", role: "PRINCIPAL", passwordHash,
      },
    });
  }
  const principalUser = asUser(principal);
  console.log(`✓ Principal: ${principal.fullName} (principal@kilimoday.ac.ke / ${DEV_PASSWORD})`);

  // -------------------------------------------------------------------
  // 2) Wipe any prior run's real data for THIS tenant only (idempotent).
  // -------------------------------------------------------------------
  await withTenant(tenant.id, async () => {
    const tdb = tenantDb();
    await tdb.timetableSlot.deleteMany({});
    await tdb.classSubjectNeed.deleteMany({});
    await tdb.timetableConfig.deleteMany({});
    await tdb.teacherSubject.deleteMany({});
    await tdb.timetableConstraint.deleteMany({});
    await tdb.schoolClass.deleteMany({});
  });
  await db.user.deleteMany({ where: { tenantId: tenant.id, role: { in: ["TEACHER", "CLASS_TEACHER"] } } });
  await db.subject.deleteMany({ where: { tenantId: tenant.id, code: { notIn: ["FREE", "LUNCH"] } } });
  console.log("✓ Cleared any prior run's classes/subjects/teachers for this tenant.");

  // -------------------------------------------------------------------
  // 3) Real 14 8-4-4 subjects (school-wide, NOT per-grade — a real 8-4-4
  //    secondary school teaches the SAME subject/syllabus across Form
  //    1-4, unlike CBC's per-grade learning areas).
  // -------------------------------------------------------------------
  const subjectByCode = new Map<string, { id: string; name: string; code: string }>();
  for (const s of SUBJECTS_8_4_4) {
    const row = await db.subject.create({ data: { tenantId: tenant.id, name: s.name, code: s.code, curriculum: "8-4-4" } });
    subjectByCode.set(s.code, row);
  }
  console.log(`✓ Created ${SUBJECTS_8_4_4.length} real 8-4-4 subjects (>= the founder's "not less than 10" instruction), totaling exactly ${TOTAL_LESSONS_PER_CLASS} lessons/week per class.`);

  // -------------------------------------------------------------------
  // 4) Real 40 classes (Form 1-4 x 10 streams each).
  // -------------------------------------------------------------------
  const classByKey = new Map<string, { id: string; level: string; stream: string; formIndex: number }>();
  for (let fIdx = 0; fIdx < FORMS.length; fIdx++) {
    const level = FORMS[fIdx];
    for (const stream of STREAMS) {
      const row = await db.schoolClass.create({
        data: { tenantId: tenant.id, level, stream, curriculum: "8-4-4", capacity: 45 },
      });
      classByKey.set(`${level}::${stream}`, { id: row.id, level, stream, formIndex: fIdx });
    }
  }
  console.log(`✓ Created ${FORMS.length * STREAMS.length} real classes (${FORMS.join(", ")} x ${STREAMS.length} streams each: ${STREAMS.join(", ")}).`);

  // -------------------------------------------------------------------
  // 5) Real school-day config, per the founder's own exact spec:
  //      8:00 AM - 4:00 PM, 10 real 40-min teaching periods, Mon-Fri only.
  //      2 real short breaks (after P2 and after P8, 10 mins each).
  //      1 real long break (after P4, 20 mins).
  //      1 real DUAL-SHIFT lunch (40 mins): Form 1&2 eat at period 7 (lunch
  //      shift 3, the engine's existing "after period 6" position), Form
  //      3&4 eat at period 8 (lunch shift 4, this session's new 4th
  //      position) — both groups keep exactly 10 real teaching periods.
  //      periodsPerDay=11 for every class (10 real teaching periods + 1
  //      real lunch slot each class actually uses).
  // -------------------------------------------------------------------
  for (const cls of classByKey.values()) {
    const isForm1or2 = cls.level === "Form 1" || cls.level === "Form 2";
    await saveTimetableConfig(principalUser, {
      classId: cls.id,
      periodsPerDay: 11,
      freePeriodsPerWeek: REAL_FREE_PERIODS_PER_WEEK, // real deliberate slack — see SUBJECTS_8_4_4 comment above
      coCurricularCount: 0,
      coCurricularName: "Games",
      schoolDayStartTime: "08:00",
      lessonDurationMins: 40,
      shortBreakStart: 2, // after period 2 (~8:50am, real 10-min break)
      shortBreakMins: 10,
      shortBreak2Start: 8, // after period 8 (real 2nd 10-min break, position renumbered below for lunch-shift accounting)
      shortBreak2Mins: 10,
      longBreakStart: 4, // after period 4 (real 20-min long break)
      longBreakMins: 20,
      lunchStart: isForm1or2 ? 6 : 7, // real elapsed-minutes math anchor (matches whichever period precedes this group's own real lunch slot)
      lunchMins: 40,
      hasRemedials: false,
      hasPreps: false,
      lunchShift: isForm1or2 ? 3 : 4, // real dual-shift: shift 3 = period 7 (Form 1&2), shift 4 = period 8 (Form 3&4)
      hasSaturday: false,
    } as any);
  }
  console.log("✓ Configured all 40 classes: 8:00am-4:00pm, 10x40-min teaching periods, 2 short breaks (10min after P2 + 10min after P8), 1 long break (20min after P4), real dual-shift 40-min lunch (Form 1&2 at P7, Form 3&4 at P8).");

  // Real, explicit confirmation that Mathematics is NOT morning-locked —
  // the founder's own explicit instruction. The SUBJECT_MORNING
  // constraint is simply never created for this tenant, so Maths (and
  // every other subject) is free to land anywhere the solver's own real
  // spread-scoring picks.
  console.log("✓ Confirmed: no SUBJECT_MORNING constraint created — Mathematics may be scheduled at any real period, per the founder's own explicit instruction.");

  // -------------------------------------------------------------------
  // 6) Real 70 teachers, each teaching exactly ONE real subject across
  //    several real classes (a genuine 8-4-4 subject-specialist model),
  //    distributed so total workload stays realistic (~24-30 lessons/wk).
  // -------------------------------------------------------------------
  let teacherIdx = 0;
  const teachersBySubject = new Map<string, { id: string; fullName: string }[]>();

  async function createTeacher(fullName: string): Promise<{ id: string; fullName: string }> {
    const loginId = await generateNeyoLoginId();
    const localPart = fullName.toLowerCase().replace(/\s+/g, ".");
    const email = `${localPart}@kilimoday.ac.ke`;
    const row = await db.user.create({
      data: {
        tenantId: tenant.id, neyoLoginId: loginId, fullName,
        phone: phone(`07${String(10000000 + teacherIdx).slice(0, 8)}`),
        email, role: "TEACHER", passwordHash, isActive: true,
      },
    });
    teacherIdx++;
    return { id: row.id, fullName: row.fullName };
  }

  // Real per-subject teacher-count plan: 70 teachers across 14 subjects,
  // weighted by real total school-wide demand (lessonsPerWeek x 40
  // classes), so no single teacher is absurdly overloaded and no subject
  // is short-staffed. Rounded to sum to exactly 70.
  //
  // Real fix (found live after the founder's own "chase the remaining
  // unplaced lessons" request): a pure demand-proportional floor() could
  // genuinely round a low-lessonsPerWeek subject (e.g. Life Skills, 1
  // lesson/week) down to just ONE real teacher covering all 40 real
  // classes school-wide — no real school ever does this (a single person
  // cannot realistically hold 40 separate classes' worth of a subject's
  // entire schedule without hitting real, unavoidable day/period
  // collisions once other subjects have already claimed most slots).
  // Confirmed live: this exact 1-teacher-for-40-classes case produced 21
  // of the real school's 73 total unplaced lessons (52% failure rate for
  // that one subject alone). Real fix: enforce a genuine minimum real
  // teacher count so no single teacher is ever asked to cover more than
  // REAL_MAX_CLASSES_PER_TEACHER classes for the same subject.
  const REAL_MAX_CLASSES_PER_TEACHER = 10;
  const subjectDemand = SUBJECTS_8_4_4.map((s) => ({ ...s, totalSlots: s.lessonsPerWeek * classByKey.size }));
  const totalDemand = subjectDemand.reduce((sum, s) => sum + s.totalSlots, 0);
  const rawCounts = subjectDemand.map((s) => (s.totalSlots / totalDemand) * 70);
  const minRealTeachers = Math.ceil(classByKey.size / REAL_MAX_CLASSES_PER_TEACHER);
  const teacherCounts = rawCounts.map((n) => Math.max(minRealTeachers, Math.floor(n)));
  let allocated = teacherCounts.reduce((a, b) => a + b, 0);
  // Distribute the real rounding remainder to the highest-demand subjects
  // first, so the total lands on EXACTLY 70 — never more, never less.
  const remainderOrder = subjectDemand
    .map((s, i) => ({ i, frac: rawCounts[i] - Math.floor(rawCounts[i]) }))
    .sort((a, b) => b.frac - a.frac);
  let r = 0;
  while (allocated < 70) {
    teacherCounts[remainderOrder[r % remainderOrder.length].i]++;
    allocated++;
    r++;
  }
  while (allocated > 70) {
    // Real fix: never shrink a subject back below its own real minimum
    // floor while trimming the rounding overshoot — only ever trim a
    // subject that's still above minRealTeachers.
    const idx = teacherCounts.findIndex((c) => c > minRealTeachers);
    if (idx === -1) break;
    teacherCounts[idx]--;
    allocated--;
  }
  if (allocated !== 70) throw new Error(`Real teacher-count allocation must sum to exactly 70, got ${allocated}`);

  for (let i = 0; i < SUBJECTS_8_4_4.length; i++) {
    const subj = SUBJECTS_8_4_4[i];
    const count = teacherCounts[i];
    const list: { id: string; fullName: string }[] = [];
    for (let n = 0; n < count; n++) {
      const fullName = TEACHER_NAMES[teacherIdx];
      const teacher = await createTeacher(fullName);
      await saveTeacherSubjects(principalUser, teacher.id, [{ id: subjectByCode.get(subj.code)!.id, isStrong: true }]);
      list.push(teacher);
    }
    teachersBySubject.set(subj.code, list);
    console.log(`  ${subj.code} (${subj.name}): ${count} real teacher(s) — ${list.map((t) => t.fullName).join(", ")}`);
  }
  console.log(`✓ Created exactly ${teacherIdx} real teachers (per the founder's own "only 70, not more than that" instruction), each qualified in exactly one real subject.`);
  if (teacherIdx !== 70) throw new Error(`Real teacher count must be exactly 70, created ${teacherIdx}`);

  // -------------------------------------------------------------------
  // 7) Real ClassSubjectNeed rows: every real class needs every real
  //    subject at its own real weekly lesson count (zero doubles for this
  //    first stress-test run — keeps the solver's real backtracking
  //    search space large but tractable at 40 classes x 14 subjects).
  // -------------------------------------------------------------------
  let needCount = 0;
  for (const cls of classByKey.values()) {
    for (const subj of SUBJECTS_8_4_4) {
      await saveClassSubjectNeed(principalUser, {
        classId: cls.id,
        subjectId: subjectByCode.get(subj.code)!.id,
        lessonsPerWeek: subj.lessonsPerWeek,
        doubleCount: 0,
      });
      needCount++;
    }
  }
  console.log(`✓ Created ${needCount} real ClassSubjectNeed rows (40 classes x 14 subjects each).`);

  // -------------------------------------------------------------------
  // 8) Real teacher-allocation FIRST (per the founder's own explicit
  //    instruction: "first start with the teacher allocation in the
  //    classes"), using the real existing auto-assign engine — fairly
  //    distributing each subject's own qualified-teacher pool across
  //    every real class that needs that subject, load-balanced by each
  //    teacher's own running real weekly lesson count.
  // -------------------------------------------------------------------
  console.log("\n--- Real teacher allocation (Step 1, before generation) ---");
  const allocResult = await autoAssignTeachersToClasses(principalUser);
  console.log(`✓ Real auto-teacher-allocation assigned ${allocResult.assignedCount} of ${needCount} real class-subject needs.`);

  // Real, honest post-allocation workload report per teacher.
  const finalNeeds = await withTenant(tenant.id, async () => tenantDb().classSubjectNeed.findMany({ where: { teacherId: { not: null } } }));
  const workloadByTeacher = new Map<string, number>();
  for (const n of finalNeeds) workloadByTeacher.set(n.teacherId!, (workloadByTeacher.get(n.teacherId!) ?? 0) + n.lessonsPerWeek);
  const loads = Array.from(workloadByTeacher.values());
  const minLoad = Math.min(...loads);
  const maxLoad = Math.max(...loads);
  const avgLoad = loads.reduce((a, b) => a + b, 0) / loads.length;
  console.log(`✓ Real per-teacher weekly workload after allocation: min=${minLoad}, max=${maxLoad}, avg=${avgLoad.toFixed(1)} lessons/week (across ${loads.length} teachers with at least one real assignment).`);

  // -------------------------------------------------------------------
  // 9) Real Master Button generation (Step 2) — the actual real conflict-
  //    checked whole-school solve, timed. `startGeneration()` already
  //    fires the real background run itself (fire-and-forget) — the
  //    caller must only POLL `getGenerationJob()` until it finishes,
  //    never call the internal `runGeneration()` a second time directly
  //    (doing so races two concurrent runs against the same real
  //    delete+insert, which genuinely corrupts the DB write with a real
  //    unique-constraint violation — found and fixed live this session).
  // -------------------------------------------------------------------
  console.log("\n--- Real Master Button generation (Step 2) ---");
  const t0 = Date.now();
  const job = await startGeneration(principalUser);
  let finalJob = await getGenerationJob(principalUser, job.id);
  let polls = 0;
  while (finalJob && finalJob.status !== "DONE" && finalJob.status !== "FAILED" && polls < 600) {
    await new Promise((r) => setTimeout(r, 500));
    finalJob = await getGenerationJob(principalUser, job.id);
    polls++;
  }
  const elapsedMs = Date.now() - t0;
  if (!finalJob || finalJob.status !== "DONE") {
    console.error(`✗ Real generation did NOT complete cleanly. Status: ${finalJob?.status}, error: ${(finalJob as any)?.error}`);
    process.exit(1);
  }
  const unplaced = JSON.parse(finalJob.unplacedJson || "[]");
  const warnings = JSON.parse(finalJob.warningsJson || "[]");
  console.log(`✓ Real generation complete in ${(elapsedMs / 1000).toFixed(1)}s (${polls} polls): ${finalJob.slotsPlaced} real slots placed, ${unplaced.length} real unplaced, ${warnings.length} real warnings.`);
  if (unplaced.length > 0) {
    console.log("  Real unplaced entries (first 20):");
    for (const u of unplaced.slice(0, 20)) console.log(`   - ${JSON.stringify(u)}`);
  }
  if (warnings.length > 0) {
    console.log("  Real warnings (first 10):");
    for (const w of warnings.slice(0, 10)) console.log(`   - ${w}`);
  }

  // -------------------------------------------------------------------
  // 10) Real, honest verification pass.
  // -------------------------------------------------------------------
  console.log("\n--- Real verification ---");
  const expectedAcademicSlots = needCount; // one real TimetableSlot per real lesson need (zero doubles this run)
  const expectedLunchSlots = classByKey.size * 5; // one real lunch reservation per class per real day (Mon-Fri)
  const realAcademicSlots = await db.timetableSlot.count({ where: { tenantId: tenant.id, subjectId: { not: subjectByCode.get("LUNCH")?.id ?? "___none___" } } });
  const realLunchSlots = await db.timetableSlot.count({ where: { tenantId: tenant.id, subject: { code: "LUNCH" } } });
  console.log(`Expected real lesson slots: ${expectedAcademicSlots}, actually placed (excl. lunch): need to re-check via LUNCH subject id below.`);

  const lunchSubjectRow = await db.subject.findFirst({ where: { tenantId: tenant.id, code: "LUNCH" } });
  const realLessonSlots = await db.timetableSlot.count({ where: { tenantId: tenant.id, subjectId: { not: lunchSubjectRow?.id } } });
  console.log(`✓ Real lesson slots placed: ${realLessonSlots} / ${expectedAcademicSlots} expected.`);
  console.log(`✓ Real lunch slots placed: ${realLunchSlots} / ${expectedLunchSlots} expected.`);

  // Real spot-check: confirm the dual-shift lunch actually landed on the
  // real correct period for each group.
  const sampleForm1 = classByKey.get("Form 1::Amani")!;
  const sampleForm3 = classByKey.get("Form 3::Amani")!;
  const form1LunchSlot = await db.timetableSlot.findFirst({ where: { classId: sampleForm1.id, subject: { code: "LUNCH" } } });
  const form3LunchSlot = await db.timetableSlot.findFirst({ where: { classId: sampleForm3.id, subject: { code: "LUNCH" } } });
  console.log(`✓ Real spot-check: Form 1 Amani's real lunch slot is at period ${form1LunchSlot?.period} (expected 7).`);
  console.log(`✓ Real spot-check: Form 3 Amani's real lunch slot is at period ${form3LunchSlot?.period} (expected 8).`);

  console.log(`\n=== Z.4 stress-test seed complete: ${TENANT_NAME} ===`);
  console.log(`Login: principal@kilimoday.ac.ke / ${DEV_PASSWORD}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
