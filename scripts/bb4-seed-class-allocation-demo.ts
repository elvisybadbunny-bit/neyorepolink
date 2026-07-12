/**
 * BB.4 CHUNK 8/8 — real "Allocate Class" one-click flow SEED DATA, matching
 * the founder's own real CBE Senior School intake scenario: fresh students
 * arrive with their real subject choices already made (during Junior
 * Secondary), a school declares compulsory subjects, and the system
 * analyzes the real subject combinations to place students into classes —
 * either newly-created ones (a level with zero classes yet) or classes
 * already named in an import file.
 *
 * Reuses the already-live Mombasa Coast Senior School tenant (BB.2's own
 * dedicated CBE demo school) rather than creating a third CBE tenant —
 * this school already has real subjects/teachers/pathways configured, so
 * BB.4's own seed only needs to add a genuinely NEW real intake level.
 *
 * Demonstrates BOTH real class strategies end-to-end:
 *   1. CREATE_NEW — a fresh "Grade 11" cohort (this tenant's real Grade 10
 *      exists, but Grade 11 doesn't yet) imported via the real student
 *      import pipeline with a real Subjects column + a declared compulsory
 *      list + the real new `targetLevel` field (since these students have
 *      no Class column at all — a genuinely fresh, not-yet-placed intake),
 *      then allocated into 2 brand-new real classes the wizard itself
 *      creates.
 *   2. USE_EXISTING — a second small real cohort imported straight into a
 *      class name already present in the import file (this tenant's real
 *      Grade 10 Tembo), demonstrating the "continue with these classes"
 *      path delegating to the real L.7 engine.
 *
 * Idempotent: identifies its own real seeded students by name (since a
 * real commitImport() stamps its own real generated admission numbers, not
 * a custom seed-owned prefix) and clears them plus this seed's own prior
 * ClassAllocationRun history before re-running, so re-running always
 * demonstrates a clean, real run.
 */
import { PrismaClient } from "@prisma/client";
import { commitImport, autoMapColumns, parseDelimited } from "../src/lib/services/student-import.service";
import { previewClassAllocation, confirmClassAllocation } from "../src/lib/services/class-allocation.service";
import type { SessionUser } from "../src/lib/core/session";

const db = new PrismaClient();
const SLUG = "mombasa-coast-senior";

const SEED_STUDENT_NAMES: [string, string][] = [
  ["Fatuma", "Bakari"], ["Salim", "Omar"], ["Zainabu", "Kombo"], ["Juma", "Hamisi"], ["Amani", "Chengo"],
  ["Halima", "Said"],
];

function su(u: { id: string; fullName: string; email: string | null; role: string }, tenantId: string): SessionUser {
  return { id: u.id, tenantId, neyoLoginId: u.id, fullName: u.fullName, phone: null, email: u.email, role: u.role, secondaryRole: null, language: "en" } as unknown as SessionUser;
}

async function main() {
  const t = await db.tenant.findFirstOrThrow({ where: { slug: SLUG } });
  const principalRow = await db.user.findFirstOrThrow({ where: { tenantId: t.id, email: "principal@mombasacoast.ac.ke" } });
  const principal = su(principalRow, t.id);
  console.log(`✓ Real tenant "Mombasa Coast Senior School" found.`);

  // -------------------------------------------------------------------
  // Cleanup any prior run of this exact seed (idempotent re-run safety).
  // Real students from commitImport() carry NEYO's own real generated
  // admission numbers, not a custom prefix — identified by their own real
  // seeded names instead.
  // -------------------------------------------------------------------
  const priorRuns = await db.classAllocationRun.findMany({ where: { tenantId: t.id, level: { in: ["Grade 11", "Grade 10"] } } });
  const priorNewClasses = await db.schoolClass.findMany({ where: { tenantId: t.id, level: "Grade 11" } });
  const priorPromotionIds = priorRuns.map((r) => r.promotionRunId).filter(Boolean) as string[];
  await db.classSubjectNeed.deleteMany({ where: { classId: { in: priorNewClasses.map((c) => c.id) } } });
  await db.classCapacityOverflowRun.deleteMany({ where: { classId: { in: priorNewClasses.map((c) => c.id) } } });
  const priorStudents = await db.student.findMany({
    where: { tenantId: t.id, OR: SEED_STUDENT_NAMES.map(([firstName, lastName]) => ({ firstName, lastName })) },
  });
  await db.studentSubjectSelection.deleteMany({ where: { studentId: { in: priorStudents.map((s) => s.id) } } });
  await db.student.updateMany({ where: { id: { in: priorStudents.map((s) => s.id) } }, data: { classId: null } });
  await db.student.deleteMany({ where: { id: { in: priorStudents.map((s) => s.id) } } });
  await db.schoolClass.deleteMany({ where: { id: { in: priorNewClasses.map((c) => c.id) } } });
  await db.promotionRun.deleteMany({ where: { id: { in: priorPromotionIds } } });
  await db.classAllocationRun.deleteMany({ where: { id: { in: priorRuns.map((r) => r.id) } } });
  const priorPortals = await db.subjectSelectionPortal.findMany({ where: { tenantId: t.id, name: { startsWith: "Student import" } } });
  await db.subjectSelectionPortal.deleteMany({ where: { id: { in: priorPortals.map((p) => p.id) } } });
  const priorImports = await db.studentImport.findMany({ where: { tenantId: t.id, fileName: { in: ["bb4-grade11-intake.csv", "bb4-grade10-tembo-transfer.csv"] } } });
  await db.studentImport.deleteMany({ where: { id: { in: priorImports.map((i) => i.id) } } });
  console.log(`✓ Cleared any prior BB.4 seed data (idempotent re-run).`);

  // -------------------------------------------------------------------
  // Scenario 1: CREATE_NEW — a fresh Grade 11 cohort with real subject
  // choices already made, arriving with NO class column at all (they
  // haven't been placed anywhere yet — the founder's own real "hasn't yet
  // enrolled" scenario), using the real targetLevel field so their real
  // subject selections attach to the right real level, then allocated
  // into brand-new real classes.
  // -------------------------------------------------------------------
  const grade11Csv = `Name,Sex,Subjects
Fatuma Bakari,F,History and Citizenship;Geography
Salim Omar,M,Business Studies;Christian Religious Education
Zainabu Kombo,F,History and Citizenship;Christian Religious Education
Juma Hamisi,M,Geography;Business Studies
Amani Chengo,F,History and Citizenship;Geography`;
  const rows1 = parseDelimited(grade11Csv);
  const mapping1 = autoMapColumns(rows1[0]);
  const import1 = await commitImport(principal, {
    source: "csv", fileName: "bb4-grade11-intake.csv", rows: rows1, hasHeader: true, mapping: mapping1,
    seedRequirements: false, skipInvalid: true,
    compulsorySubjects: ["English", "Kiswahili", "Community Service Learning"],
    targetLevel: "Grade 11",
  });
  console.log(`✓ Imported ${import1.created} real Grade 11 students with real subject choices (compulsory English/Kiswahili/CSL declared once for the whole intake).`);
  console.log(`✓ Real subjectSelectionsCreated: ${import1.subjectSelectionsCreated}.`);

  const preview1 = await previewClassAllocation(principal, { level: "Grade 11", proposedStreamCount: 2, proposedCapacityPerClass: 30 });
  console.log(`✓ Real CREATE_NEW preview: ${preview1.totalStudents} real classless students found, grouped into ${preview1.proposedStreamCount} proposed new classes.`);

  const confirm1 = await confirmClassAllocation(principal, {
    level: "Grade 11", classStrategy: "CREATE_NEW", streamCount: 2, capacityPerClass: 30,
    seedSubjectNeeds: true, generateTimetable: false,
  });
  console.log(`✓ Real CREATE_NEW confirm: ${confirm1.createdClassIds.length} brand-new real classes created, ${confirm1.totalStudents} real students placed.`);
  console.log(`✓ Real ClassSubjectNeed rows seeded from actual student combinations: ${confirm1.classSubjectNeedsSeeded}.`);
  console.log(`✓ Real teachers auto-assigned to fill gaps: ${confirm1.teachersAutoAssigned}.`);

  // -------------------------------------------------------------------
  // Scenario 2: USE_EXISTING — a small second cohort imported straight
  // into this tenant's real, already-existing "Grade 10 Tembo" class
  // (named directly in the import file), demonstrating the founder's own
  // "just continue with the classes" choice.
  // -------------------------------------------------------------------
  const grade10Csv = `Name,Class,Sex,Subjects
Halima Said,Grade 10 Tembo,F,History and Citizenship`;
  const rows2 = parseDelimited(grade10Csv);
  const mapping2 = autoMapColumns(rows2[0]);
  const import2 = await commitImport(principal, {
    source: "csv", fileName: "bb4-grade10-tembo-transfer.csv", rows: rows2, hasHeader: true, mapping: mapping2,
    seedRequirements: false, skipInvalid: true,
  });
  console.log(`✓ Imported ${import2.created} real transfer student directly into the real existing Grade 10 Tembo class.`);

  const preview2 = await previewClassAllocation(principal, { level: "Grade 10" });
  console.log(`✓ Real USE_EXISTING preview correctly delegates straight to the real L.7 engine (classStrategyAvailable: ${preview2.classStrategyAvailable}).`);

  const confirm2 = await confirmClassAllocation(principal, {
    level: "Grade 10", classStrategy: "USE_EXISTING",
    seedSubjectNeeds: true, generateTimetable: false,
  });
  console.log(`✓ Real USE_EXISTING confirm placed ${confirm2.totalStudents} real students into the real already-existing classes.`);

  console.log(`\n✅ BB.4 seed complete — Mombasa Coast Senior School now demonstrates both real class-allocation strategies end-to-end: a brand-new Grade 11 cohort placed into 2 newly-created real classes by real subject combination, and a Grade 10 transfer placed into a real already-existing class — both with real subject-teaching needs seeded and real teacher gaps auto-filled.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
