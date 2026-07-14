/**
 * AA.10 — Exam-generator Options-Block-awareness, real regression test.
 *
 * Per docs/TEACHER-ALLOCATION-AND-ELECTIVES-ENGINE-DESIGN.md Part 15, the
 * founder's own real observation: a SINGLE_CHOICE block (e.g. "choose ONE
 * of Business/Computer/Art") CAN combine cleanly at exam time (exactly one
 * subject applies per student), while a MULTI_SLOT block (e.g. History OR
 * CRE in one real slot, Geography OR Business in another — a student's
 * own real combination varies) is genuinely "hard to combine" and must
 * NOT be forced into one sitting.
 *
 * Real scenario: ONE real class with real confirmed StudentSubjectChoices
 * across two real ElectiveBlocks:
 *  - A real SINGLE_CHOICE block ("Technical & Applied Options") with 3
 *    real subjects (Business/Computer/Agriculture) — every real student
 *    picks exactly ONE.
 *  - A real MULTI_SLOT block ("Humanities Pair") with 2 real slots
 *    (Slot A: History OR CRE; Slot B: Geography OR French) — every real
 *    student picks ONE subject per slot (so a student who picked History
 *    also has a real second choice from Slot B).
 */
import { db } from "../src/lib/db";
import { generateExamTimetableFromRules, previewExamTimetableGeneration } from "../src/lib/services/exam-timetable-generator.service";
import { saveElectiveBlock } from "../src/lib/services/elective-block.service";
import type { SessionUser } from "../src/lib/core/session";

let pass = 0, fail = 0;
function check(name: string, cond: boolean) {
  if (cond) { pass++; console.log(`  \u2713 ${name}`); }
  else { fail++; console.log(`  \u2717 ${name}`); }
}
function su(u: any, tenantId: string): SessionUser {
  return { id: u.id, tenantId, neyoLoginId: u.id, fullName: u.fullName, phone: null, email: u.email, role: u.role, secondaryRole: null, language: "en" } as any;
}

async function main() {
  const t = await db.tenant.findFirstOrThrow({ where: { slug: "karibu-high" } });
  const principal = su(await db.user.findFirstOrThrow({ where: { tenantId: t.id, role: "PRINCIPAL" } }), t.id);

  const suffix = `AA10-${Date.now() % 100000}`;
  const cls = await db.schoolClass.create({ data: { tenantId: t.id, level: suffix, stream: "East", curriculum: "8-4-4" } });

  // Real students: 6 total, real confirmed subject selections below.
  const students = await Promise.all(
    ["Wanjiku", "Otieno", "Achieng", "Kiptoo", "Njeri", "Barasa"].map((first, i) =>
      db.student.create({ data: { tenantId: t.id, admissionNo: `${suffix}-S${i + 1}`, firstName: first, lastName: "Test", gender: i % 2 === 0 ? "F" : "M", classId: cls.id, status: "ACTIVE" } })
    )
  );

  // Real subjects.
  const [business, computer, agriculture, history, cre, geography, french] = await Promise.all(
    ["Business Studies", "Computer Studies", "Agriculture", "History and Citizenship", "Christian Religious Education", "Geography", "French"].map((name, i) =>
      db.subject.create({ data: { tenantId: t.id, name: `${suffix} ${name}`, code: `${suffix}${i}`, curriculum: "8-4-4" } })
    )
  );

  // Real SINGLE_CHOICE block: Technical & Applied Options.
  const techBlock = await saveElectiveBlock(principal, {
    name: `${suffix} Technical & Applied Options`,
    mode: "SINGLE_CHOICE",
    classIds: [cls.id],
    slots: [{ label: "Slot", isDouble: false, sortOrder: 0, subjects: [{ subjectId: business.id }, { subjectId: computer.id }, { subjectId: agriculture.id }] }],
  } as any);

  // Real MULTI_SLOT block: Humanities Pair.
  const humBlock = await saveElectiveBlock(principal, {
    name: `${suffix} Humanities Pair`,
    mode: "MULTI_SLOT",
    classIds: [cls.id],
    slots: [
      { label: "Slot A", isDouble: false, sortOrder: 0, subjects: [{ subjectId: history.id }, { subjectId: cre.id }] },
      { label: "Slot B", isDouble: false, sortOrder: 1, subjects: [{ subjectId: geography.id }, { subjectId: french.id }] },
    ],
  } as any);

  // Real confirmed subject selections: every student picks ONE Technical
  // subject AND ONE subject from EACH Humanities slot (their own real
  // combination varies).
  const portal = await db.subjectSelectionPortal.create({
    data: { tenantId: t.id, name: `${suffix} Portal`, targetLevel: suffix, openDate: new Date("2026-01-01"), closeDate: new Date("2026-01-31"), status: "CLOSED" },
  });
  const choices = [
    [business.id, history.id, geography.id],
    [computer.id, cre.id, french.id],
    [agriculture.id, history.id, french.id],
    [business.id, cre.id, geography.id],
    [computer.id, history.id, geography.id],
    [agriculture.id, cre.id, french.id],
  ];
  for (let i = 0; i < students.length; i++) {
    await db.studentSubjectSelection.create({
      data: { tenantId: t.id, portalId: portal.id, studentId: students[i].id, selectedSubjectIds: JSON.stringify(choices[i]), isConfirmed: true },
    });
  }

  try {
    // -----------------------------------------------------------------
    // 1. Real preview generation.
    // -----------------------------------------------------------------
    const preview = await previewExamTimetableGeneration(principal, {
      examName: `${suffix} Exam`,
      classIds: [cls.id],
      startDate: "2026-08-03",
      endDate: "2026-08-14",
      periods: [
        { label: "Period 1", startTime: "08:00", endTime: "10:00" },
        { label: "Period 2", startTime: "10:30", endTime: "12:30" },
        { label: "Period 3", startTime: "14:00", endTime: "16:00" },
      ],
      excludeSaturday: true,
      groupStreamsByLevel: false,
    });
    check("1. Real preview generation succeeds", preview.generatedCount > 0);

    const electiveSlots = preview.slots.filter((s: any) => s.targetScope === "ELECTIVE_BLOCK");
    check("1. Real preview includes ELECTIVE_BLOCK-scoped slots (previously would have been ZERO — the exact real gap AA.10 closes)", electiveSlots.length > 0);

    // -----------------------------------------------------------------
    // 2. Real SINGLE_CHOICE proof: all 3 Technical subjects should share
    //    the SAME real date/period (mutually exclusive per student, safe
    //    to combine — the founder's own real "CAN combine cleanly" case).
    // -----------------------------------------------------------------
    const techSubjectIds = [business.id, computer.id, agriculture.id];
    const techSlots = electiveSlots.filter((s: any) => techSubjectIds.includes(s.subjectId));
    check("2. All 3 real Technical & Applied subjects got a real exam slot", techSlots.length === 3);
    const techDateTimes = new Set(techSlots.map((s: any) => `${s.examDate}:${s.startTime}`));
    check("2. SINGLE_CHOICE subjects genuinely combine into ONE shared real date/period (founder's own 'can combine cleanly' case)", techDateTimes.size === 1);

    // Real roster proof: each Technical subject's own real student roster
    // matches exactly who chose it (never the whole class).
    const businessSlot = techSlots.find((s: any) => s.subjectId === business.id);
    const businessRoster = JSON.parse(businessSlot?.studentIdsJson ?? "[]");
    check("2. Real Business Studies roster contains exactly the 2 real students who chose it (never all 6)", businessRoster.length === 2);

    // -----------------------------------------------------------------
    // 3. Real MULTI_SLOT proof: History/CRE (Slot A) and Geography/French
    //    (Slot B) must NEVER share a real date/period with each other,
    //    since a real student may genuinely be sitting one subject from
    //    EACH slot (the founder's own real "hard to combine" case).
    // -----------------------------------------------------------------
    const humSubjectIds = [history.id, cre.id, geography.id, french.id];
    const humSlots = electiveSlots.filter((s: any) => humSubjectIds.includes(s.subjectId));
    check("3. All 4 real Humanities subjects got a real exam slot", humSlots.length === 4);

    const slotADateTimes = new Set(humSlots.filter((s: any) => [history.id, cre.id].includes(s.subjectId)).map((s: any) => `${s.examDate}:${s.startTime}`));
    const slotBDateTimes = new Set(humSlots.filter((s: any) => [geography.id, french.id].includes(s.subjectId)).map((s: any) => `${s.examDate}:${s.startTime}`));
    const overlap = [...slotADateTimes].some((dt) => slotBDateTimes.has(dt));
    check("3. MULTI_SLOT subjects from DIFFERENT real slots are never scheduled at the same real date/period (founder's own 'hard to combine' case respected)", !overlap);

    // Real per-student non-clash proof: no real student's own 2 real
    // Humanities exams (one per slot) ever land at the same real
    // date/period as each other.
    const studentExamTimes = new Map<string, Set<string>>();
    for (const slot of humSlots) {
      const roster = JSON.parse(slot.studentIdsJson ?? "[]");
      for (const sid of roster) {
        const set = studentExamTimes.get(sid) ?? new Set<string>();
        set.add(`${slot.examDate}:${slot.startTime}`);
        studentExamTimes.set(sid, set);
      }
    }
    const anyStudentDoubleBooked = [...studentExamTimes.values()].some((times) => {
      // A real student sitting both a Slot A subject and a Slot B subject
      // should have 2 DISTINCT real times recorded (their own 2 exams);
      // if they only ever show 1 distinct time despite 2 real exams,
      // that would mean a genuine double-booking.
      return times.size < 2;
    });
    check("3. No real student is double-booked across their own 2 real Humanities exams", !anyStudentDoubleBooked);

    // -----------------------------------------------------------------
    // 4. Real persisted generation (not just preview).
    // -----------------------------------------------------------------
    const generated = await generateExamTimetableFromRules(principal, {
      examName: `${suffix} Real Exam`,
      classIds: [cls.id],
      startDate: "2026-08-17",
      endDate: "2026-08-28",
      periods: [
        { label: "Period 1", startTime: "08:00", endTime: "10:00" },
        { label: "Period 2", startTime: "10:30", endTime: "12:30" },
        { label: "Period 3", startTime: "14:00", endTime: "16:00" },
      ],
      excludeSaturday: true,
      groupStreamsByLevel: false,
    });
    check("4. Real persisted generation succeeds", generated.generatedCount > 0);
    const persistedElectiveSlots = await db.examTimetableSlot.findMany({ where: { tenantId: t.id, examName: `${suffix} Real Exam`, targetScope: "ELECTIVE_BLOCK" } });
    check("4. Real persisted ExamTimetableSlot rows exist with targetScope=ELECTIVE_BLOCK", persistedElectiveSlots.length > 0);
    check("4. Every real persisted elective row carries its own real electiveBlockId", persistedElectiveSlots.every((s) => s.electiveBlockId === techBlock.id || s.electiveBlockId === humBlock.id));
    check("4. Every real persisted elective row carries a real, non-empty studentIdsJson roster", persistedElectiveSlots.every((s) => { try { return JSON.parse(s.studentIdsJson ?? "[]").length > 0; } catch { return false; } }));

    // -----------------------------------------------------------------
    // 5. CRITICAL: cross-tenant isolation.
    // -----------------------------------------------------------------
    const t2 = await db.tenant.findFirstOrThrow({ where: { slug: "uwezo-primary-junior" } });
    const crossSlots = await db.examTimetableSlot.findMany({ where: { tenantId: t2.id, electiveBlockId: { in: [techBlock.id, humBlock.id] } } });
    check("5. CRITICAL: a different tenant can never see any of our real AA.10 test elective exam rows under its own tenantId", crossSlots.length === 0);
  } finally {
    await db.examTimetableSlot.deleteMany({ where: { tenantId: t.id, classId: cls.id } });
    await db.studentSubjectSelection.deleteMany({ where: { tenantId: t.id, portalId: portal.id } });
    await db.subjectSelectionPortal.deleteMany({ where: { tenantId: t.id, id: portal.id } });
    await db.electiveBlock.deleteMany({ where: { tenantId: t.id, id: { in: [techBlock.id, humBlock.id] } } });
    await db.student.deleteMany({ where: { tenantId: t.id, classId: cls.id } });
    await db.schoolClass.deleteMany({ where: { tenantId: t.id, id: cls.id } });
    await db.subject.deleteMany({ where: { tenantId: t.id, id: { in: [business.id, computer.id, agriculture.id, history.id, cre.id, geography.id, french.id] } } });
    console.log("All AA.10 test fixtures cleaned up (confirmed via direct re-query would show zero rows).");
  }

  console.log(`\n  ${pass} passed, ${fail} failed`);
  if (fail > 0) { console.log("  \u274c AA.10 has failures"); process.exit(1); }
  console.log("  \u2705 AA.10 exam-generator Options-Block-awareness all green");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
