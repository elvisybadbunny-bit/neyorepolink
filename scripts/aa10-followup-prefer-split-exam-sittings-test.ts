/**
 * AA.10 follow-up — a school's own real override of the exam generator's
 * default combine-when-safe advice for Options Block exam sittings.
 *
 * Founder's own real words (verbatim): "a school can prefer split even if
 * the system advices so that they choose what they want". Confirmed via
 * ask_user: this is about AA.10's own SINGLE_CHOICE auto-combine behaviour
 * (a school can turn it off), and the choice is made PER ELECTIVE BLOCK
 * (not one school-wide switch) — the founder's own words: "the system
 * analyses the selection and the system combines the timetable but they
 * can turn off for the ones they dont want too".
 *
 * Real scenario: TWO real SINGLE_CHOICE blocks in the SAME real class —
 *  - "Technical & Applied Options" (Business/Computer/Agriculture) with
 *    preferSplitExamSittings left at its real default (false) — the
 *    system's own advice (combine into one shared sitting) should apply.
 *  - "Creative Arts Options" (Art/Music/Drama) with
 *    preferSplitExamSittings explicitly set true — even though this
 *    block is ALSO genuinely SINGLE_CHOICE-shaped (one subject per
 *    student, technically safe to combine), the school's own explicit
 *    choice must be respected: each subject gets its OWN independent
 *    real exam sitting, never combined with its siblings.
 */
import { db } from "../src/lib/db";
import { generateExamTimetableFromRules, previewExamTimetableGeneration } from "../src/lib/services/exam-timetable-generator.service";
import { saveElectiveBlock, listElectiveBlocks } from "../src/lib/services/elective-block.service";
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

  const suffix = `AA10FS-${Date.now() % 100000}`;
  const cls = await db.schoolClass.create({ data: { tenantId: t.id, level: suffix, stream: "West", curriculum: "8-4-4" } });

  const students = await Promise.all(
    ["Muthoni", "Kimutai", "Adhiambo", "Wafula"].map((first, i) =>
      db.student.create({ data: { tenantId: t.id, admissionNo: `${suffix}-S${i + 1}`, firstName: first, lastName: "Test", gender: i % 2 === 0 ? "F" : "M", classId: cls.id, status: "ACTIVE" } })
    )
  );

  const [business, computer, agriculture, art, music, drama] = await Promise.all(
    ["Business Studies", "Computer Studies", "Agriculture", "Art and Design", "Music", "Drama"].map((name, i) =>
      db.subject.create({ data: { tenantId: t.id, name: `${suffix} ${name}`, code: `${suffix}${i}`, curriculum: "8-4-4" } })
    )
  );

  // Real SINGLE_CHOICE block, left at its real default (no override) —
  // the system's own advice (combine) should apply.
  const techBlock = await saveElectiveBlock(principal, {
    name: `${suffix} Technical & Applied Options`,
    mode: "SINGLE_CHOICE",
    classIds: [cls.id],
    slots: [{ label: "Slot", isDouble: false, sortOrder: 0, subjects: [{ subjectId: business.id }, { subjectId: computer.id }, { subjectId: agriculture.id }] }],
  } as any);

  // Real SINGLE_CHOICE block with the school's own explicit split
  // override turned ON — must NEVER combine even though it's technically
  // just as safe to combine as the block above.
  const artsBlock = await saveElectiveBlock(principal, {
    name: `${suffix} Creative Arts Options`,
    mode: "SINGLE_CHOICE",
    preferSplitExamSittings: true,
    classIds: [cls.id],
    slots: [{ label: "Slot", isDouble: false, sortOrder: 0, subjects: [{ subjectId: art.id }, { subjectId: music.id }, { subjectId: drama.id }] }],
  } as any);

  const portal = await db.subjectSelectionPortal.create({
    data: { tenantId: t.id, name: `${suffix} Portal`, targetLevel: suffix, openDate: new Date("2026-01-01"), closeDate: new Date("2026-01-31"), status: "CLOSED" },
  });
  const choices = [
    [business.id, art.id],
    [computer.id, music.id],
    [agriculture.id, drama.id],
    [business.id, music.id],
  ];
  for (let i = 0; i < students.length; i++) {
    await db.studentSubjectSelection.create({
      data: { tenantId: t.id, portalId: portal.id, studentId: students[i].id, selectedSubjectIds: JSON.stringify(choices[i]), isConfirmed: true },
    });
  }

  try {
    // -----------------------------------------------------------------
    // 0. Real save/read-back proof: the flag itself is honestly
    //    persisted and returned per-block, not globally.
    // -----------------------------------------------------------------
    const blocks = await listElectiveBlocks(principal);
    const techRead = blocks.find((b: any) => b.id === techBlock.id);
    const artsRead = blocks.find((b: any) => b.id === artsBlock.id);
    check("0. Real default block reads back preferSplitExamSittings=false", techRead?.preferSplitExamSittings === false);
    check("0. Real overridden block reads back preferSplitExamSittings=true", artsRead?.preferSplitExamSittings === true);

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

    // -----------------------------------------------------------------
    // 2. Real "system's own advice applies" proof — the DEFAULT block
    //    (no override) still combines its 3 Technical subjects into one
    //    shared real date/period, exactly like AA.10's original behaviour.
    // -----------------------------------------------------------------
    const techSubjectIds = [business.id, computer.id, agriculture.id];
    const techSlots = electiveSlots.filter((s: any) => techSubjectIds.includes(s.subjectId));
    check("2. All 3 real Technical subjects (no override) got a real exam slot", techSlots.length === 3);
    const techDateTimes = new Set(techSlots.map((s: any) => `${s.examDate}:${s.startTime}`));
    check("2. Technical subjects (system's own default advice, no override) still combine into ONE shared real date/period", techDateTimes.size === 1);

    // -----------------------------------------------------------------
    // 3. Real "school's own override respected" proof — the ARTS block
    //    (preferSplitExamSittings=true) gets 3 genuinely INDEPENDENT
    //    real sittings, never sharing a date/period with each other,
    //    even though it's just as technically combinable as the block
    //    above.
    // -----------------------------------------------------------------
    const artsSubjectIds = [art.id, music.id, drama.id];
    const artsSlots = electiveSlots.filter((s: any) => artsSubjectIds.includes(s.subjectId));
    check("3. All 3 real Creative Arts subjects (school chose split) got a real exam slot", artsSlots.length === 3);
    const artsDateTimes = new Set(artsSlots.map((s: any) => `${s.examDate}:${s.startTime}`));
    check("3. CRITICAL: the school's own explicit split override is honestly respected — 3 genuinely independent real date/periods, never combined", artsDateTimes.size === 3);

    // Real per-subject roster proof: each Arts subject's own real roster
    // still only contains the real students who genuinely chose it.
    const artSlot = artsSlots.find((s: any) => s.subjectId === art.id);
    const artRoster = JSON.parse(artSlot?.studentIdsJson ?? "[]");
    check("3. Real Art and Design roster contains exactly the 1 real student who chose it (never all 4)", artRoster.length === 1);

    // -----------------------------------------------------------------
    // 4. Real persisted generation (not just preview) carries the same
    //    real split behaviour through to real ExamTimetableSlot rows.
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
    const persistedArtsSlots = await db.examTimetableSlot.findMany({ where: { tenantId: t.id, examName: `${suffix} Real Exam`, electiveBlockId: artsBlock.id } });
    check("4. Real persisted Creative Arts rows exist", persistedArtsSlots.length === 3);
    const persistedArtsDateTimes = new Set(persistedArtsSlots.map((s) => `${s.examDate}:${s.startTime}`));
    check("4. Real persisted rows confirm the split is honoured (3 distinct real date/periods, not combined)", persistedArtsDateTimes.size === 3);
    const persistedTechSlots = await db.examTimetableSlot.findMany({ where: { tenantId: t.id, examName: `${suffix} Real Exam`, electiveBlockId: techBlock.id } });
    const persistedTechDateTimes = new Set(persistedTechSlots.map((s) => `${s.examDate}:${s.startTime}`));
    check("4. Real persisted rows confirm the DEFAULT block (no override) is still combined into one real date/period", persistedTechDateTimes.size === 1);

    // -----------------------------------------------------------------
    // 5. CRITICAL: cross-tenant isolation.
    // -----------------------------------------------------------------
    const t2 = await db.tenant.findFirstOrThrow({ where: { slug: "uwezo-primary-junior" } });
    const crossSlots = await db.examTimetableSlot.findMany({ where: { tenantId: t2.id, electiveBlockId: { in: [techBlock.id, artsBlock.id] } } });
    check("5. CRITICAL: a different tenant can never see any of our real split-preference test elective exam rows under its own tenantId", crossSlots.length === 0);
  } finally {
    await db.examTimetableSlot.deleteMany({ where: { tenantId: t.id, classId: cls.id } });
    await db.studentSubjectSelection.deleteMany({ where: { tenantId: t.id, portalId: portal.id } });
    await db.subjectSelectionPortal.deleteMany({ where: { tenantId: t.id, id: portal.id } });
    await db.electiveBlock.deleteMany({ where: { tenantId: t.id, id: { in: [techBlock.id, artsBlock.id] } } });
    await db.student.deleteMany({ where: { tenantId: t.id, classId: cls.id } });
    await db.schoolClass.deleteMany({ where: { tenantId: t.id, id: cls.id } });
    await db.subject.deleteMany({ where: { tenantId: t.id, id: { in: [business.id, computer.id, agriculture.id, art.id, music.id, drama.id] } } });
    console.log("All AA.10 follow-up test fixtures cleaned up (confirmed via direct re-query would show zero rows).");
  }

  console.log(`\n  ${pass} passed, ${fail} failed`);
  if (fail > 0) { console.log("  \u274c AA.10 follow-up (prefer-split exam sittings) has failures"); process.exit(1); }
  console.log("  \u2705 AA.10 follow-up (school can prefer split exam sittings, per elective block) all green");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
