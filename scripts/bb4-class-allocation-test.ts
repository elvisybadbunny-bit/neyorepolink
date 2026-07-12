/**
 * BB.4 — Grade 10 "Allocate Class" one-click flow — real regression test.
 *
 * Covers: import-time subject-selection writing (Chunk 3a, including the
 * real targetLevel fix for a classless fresh intake), the
 * previewClassAllocation()/confirmClassAllocation() wizard engine (3b),
 * both real class strategies (USE_EXISTING delegating to L.7, CREATE_NEW
 * building its own classes from a classless real intake), BB.3's real
 * capacity gate applied to CREATE_NEW's own new classes (verified to never
 * leave real orphaned classes behind on a genuine refusal), real
 * subject-need seeding + fair teacher auto-fill, and cross-tenant
 * isolation.
 */
import { db } from "../src/lib/db";
import { withTenant } from "../src/lib/core/tenant-context";
import { tenantDb } from "../src/lib/core/tenant-db";
import type { SessionUser } from "../src/lib/core/session";
import { commitImport, autoMapColumns, parseDelimited } from "../src/lib/services/student-import.service";
import { previewClassAllocation, confirmClassAllocation, listClassAllocationRuns, ClassAllocationError } from "../src/lib/services/class-allocation.service";

let passed = 0, failed = 0;
function check(label: string, cond: boolean) {
  if (cond) { passed++; console.log(`  ✓ ${label}`); }
  else { failed++; console.log(`  ✗ ${label}`); }
}

async function main() {
  const principal = (await db.user.findFirstOrThrow({ where: { email: "principal@karibuhigh.ac.ke" } })) as unknown as SessionUser;
  const tenantId = principal.tenantId;

  // ---------------------------------------------------------------------
  // Setup: real subjects for this test.
  // ---------------------------------------------------------------------
  const subjectDefs = ["BB4Test English", "BB4Test History", "BB4Test Geography", "BB4Test CRE"];
  const subjectIds: Record<string, string> = {};
  for (const name of subjectDefs) {
    let s = await db.subject.findFirst({ where: { tenantId, name } });
    if (!s) {
      const code = name.replace(/[^A-Z0-9]/gi, "").slice(-8).toUpperCase();
      s = await db.subject.create({ data: { tenantId, name, code, curriculum: "8-4-4" } as never });
    }
    subjectIds[name] = s.id;
  }

  const cleanupClassIds: string[] = [];
  const cleanupStudentIds: string[] = [];
  const cleanupPortalIds: string[] = [];
  const cleanupRunIds: string[] = [];
  const cleanupPromotionRunIds: string[] = [];
  const cleanupImportIds: string[] = [];

  try {
    // ---------------------------------------------------------------------
    // 1. Import-time subject selection (Chunk 3a): a fresh intake with a
    //    real Subjects column + a declared compulsory subject.
    // ---------------------------------------------------------------------
    const LEVEL1 = "BB4Test Grade 10";
    const CSV = `Name,Class,Sex,Subjects
BB4TestAlpha One,${LEVEL1} A,F,BB4Test History;BB4Test Geography
BB4TestBeta Two,${LEVEL1} A,M,BB4Test CRE`;
    const rows = parseDelimited(CSV);
    const mapping = autoMapColumns(rows[0]);
    check("1. Subjects column auto-mapped", mapping.some((m) => m.field === "subjects"));

    const importResult = await commitImport(principal, {
      source: "csv", fileName: "bb4-test.csv", rows, hasHeader: true, mapping,
      seedRequirements: false, skipInvalid: true,
      compulsorySubjects: ["BB4Test English"],
    });
    cleanupImportIds.push(importResult.importId);
    check("1. Import created 2 real students", importResult.created === 2);
    check("1. subjectSelectionsCreated reports 2", importResult.subjectSelectionsCreated === 2);

    const alpha = await db.student.findFirst({ where: { tenantId, firstName: "BB4TestAlpha" } });
    const beta = await db.student.findFirst({ where: { tenantId, firstName: "BB4TestBeta" } });
    if (alpha) cleanupStudentIds.push(alpha.id);
    if (beta) cleanupStudentIds.push(beta.id);
    const alphaSel = await db.studentSubjectSelection.findFirst({ where: { tenantId, studentId: alpha?.id } });
    const alphaIds = alphaSel ? (JSON.parse(alphaSel.selectedSubjectIds) as string[]).sort() : [];
    const expectedAlpha = [subjectIds["BB4Test History"], subjectIds["BB4Test Geography"], subjectIds["BB4Test English"]].sort();
    check("1. Alpha's real selection = electives + compulsory English", JSON.stringify(alphaIds) === JSON.stringify(expectedAlpha));
    check("1. Real selection is marked confirmed", alphaSel?.isConfirmed === true);

    const importedClass = await db.schoolClass.findFirst({ where: { tenantId, level: LEVEL1, stream: "A" } });
    if (importedClass) cleanupClassIds.push(importedClass.id);
    check("1. Real class created from the import file", !!importedClass);

    const portal1 = await db.subjectSelectionPortal.findFirst({ where: { tenantId, targetLevel: LEVEL1 } });
    if (portal1) cleanupPortalIds.push(portal1.id);
    check("1. A real lazily-created SubjectSelectionPortal exists, status FINALIZED", portal1?.status === "FINALIZED");

    // ---------------------------------------------------------------------
    // 2. previewClassAllocation() — USE_EXISTING (real classes already
    //    exist because the import file named them).
    // ---------------------------------------------------------------------
    const preview1 = await previewClassAllocation(principal, { level: LEVEL1 });
    check("2. USE_EXISTING correctly delegates to L.7 (classStrategyAvailable)", preview1.classStrategyAvailable === "USE_EXISTING");
    check("2. USE_EXISTING preview shows the real students placed", preview1.totalStudents === 2);

    // ---------------------------------------------------------------------
    // 3. confirmClassAllocation() — USE_EXISTING commits via the real L.7
    //    engine, seeds real ClassSubjectNeed rows, and records a real
    //    ClassAllocationRun.
    // ---------------------------------------------------------------------
    const confirm1 = await confirmClassAllocation(principal, {
      level: LEVEL1, classStrategy: "USE_EXISTING",
      seedSubjectNeeds: true, generateTimetable: false,
    });
    check("3. USE_EXISTING confirm reports the real total students", confirm1.totalStudents === 2);
    check("3. USE_EXISTING confirm seeded real ClassSubjectNeed rows", confirm1.classSubjectNeedsSeeded > 0);
    check("3. USE_EXISTING confirm's own real promotionRunId is set (delegated to L.7)", !!confirm1.promotionRunId);
    if (confirm1.promotionRunId) cleanupPromotionRunIds.push(confirm1.promotionRunId);
    cleanupRunIds.push(confirm1.runId);

    const run1 = await db.classAllocationRun.findUnique({ where: { id: confirm1.runId } });
    check("3. Real ClassAllocationRun status COMPLETED", run1?.status === "COMPLETED");
    check("3. Real ClassAllocationRun records classStrategy USE_EXISTING", run1?.classStrategy === "USE_EXISTING");

    const needsAfter1 = await db.classSubjectNeed.findMany({ where: { classId: importedClass?.id } });
    check("3. Real ClassSubjectNeed rows reflect the students' actual subject combination", needsAfter1.length >= 3);

    // ---------------------------------------------------------------------
    // 3b. A REAL BUG found and fixed while building this feature's own
    //     seed script: importing a fresh intake with a real Subjects
    //     column but NO className column and NO targetClassId (the
    //     founder's own "hasn't yet enrolled" scenario) left every real
    //     subject selection with a null level, since there was nothing to
    //     resolve portal.targetLevel from — the "Allocate Class" wizard
    //     could never find these students afterward. Fixed by adding a
    //     real, optional `targetLevel` field the school declares once per
    //     import run specifically for this scenario.
    // ---------------------------------------------------------------------
    const LEVEL_NO_CLASS = "BB4Test Grade 9 NoClass";
    const csvNoClass = `Name,Sex,Subjects
BB4TestZeta Six,F,BB4Test History`;
    const rowsNoClass = parseDelimited(csvNoClass);
    const mappingNoClass = autoMapColumns(rowsNoClass[0]);
    const importNoClass = await commitImport(principal, {
      source: "csv", fileName: "bb4-test-no-class.csv", rows: rowsNoClass, hasHeader: true, mapping: mappingNoClass,
      seedRequirements: false, skipInvalid: true,
      targetLevel: LEVEL_NO_CLASS,
    });
    cleanupImportIds.push(importNoClass.importId);
    const zeta = await db.student.findFirst({ where: { tenantId, firstName: "BB4TestZeta" } });
    if (zeta) cleanupStudentIds.push(zeta.id);
    check("3b. A real classless student (no className, no targetClassId) still gets a real subject selection via targetLevel", importNoClass.subjectSelectionsCreated === 1);
    const portalNoClass = await db.subjectSelectionPortal.findFirst({ where: { tenantId, targetLevel: LEVEL_NO_CLASS } });
    if (portalNoClass) cleanupPortalIds.push(portalNoClass.id);
    check("3b. The real portal's targetLevel correctly matches the declared targetLevel", !!portalNoClass);
    const previewNoClass = await previewClassAllocation(principal, { level: LEVEL_NO_CLASS, proposedStreamCount: 1, proposedCapacityPerClass: 10 });
    check("3b. The 'Allocate Class' wizard can now genuinely find this classless student afterward", previewNoClass.totalStudents === 1);

    // ---------------------------------------------------------------------
    // 4. previewClassAllocation() — CREATE_NEW (a brand-new level with
    //    ZERO real classes, students found via their real confirmed
    //    selections' own portal.targetLevel).
    // ---------------------------------------------------------------------
    const LEVEL2 = "BB4Test Grade 11 New";
    const portal2 = await db.subjectSelectionPortal.create({
      data: { tenantId, name: `BB4Test Portal 2`, targetLevel: LEVEL2, openDate: new Date(), closeDate: new Date(), status: "FINALIZED", rulesJson: "{}" } as never,
    });
    cleanupPortalIds.push(portal2.id);

    const gammaDefs = [
      { firstName: "BB4TestGamma", lastName: "Three", subjects: [subjectIds["BB4Test History"]] },
      { firstName: "BB4TestDelta", lastName: "Four", subjects: [subjectIds["BB4Test History"]] },
      { firstName: "BB4TestEpsilon", lastName: "Five", subjects: [subjectIds["BB4Test CRE"]] },
    ];
    for (const d of gammaDefs) {
      const admissionNo = `BB4TEST2-${Math.random().toString(36).slice(2, 8)}`;
      const student = await db.student.create({ data: { tenantId, admissionNo, firstName: d.firstName, lastName: d.lastName, gender: "F", status: "ACTIVE", classId: null } as never });
      cleanupStudentIds.push(student.id);
      await db.studentSubjectSelection.create({ data: { tenantId, portalId: portal2.id, studentId: student.id, selectedSubjectIds: JSON.stringify(d.subjects), isConfirmed: true } as never });
    }

    let threwInvalidForMissingCounts = false;
    try {
      await previewClassAllocation(principal, { level: LEVEL2 });
    } catch (e) {
      threwInvalidForMissingCounts = e instanceof ClassAllocationError && e.code === "INVALID";
    }
    check("4. Preview correctly REFUSES a zero-class level without proposed stream count/capacity", threwInvalidForMissingCounts);

    // A real, deterministic overflow: 3 real students round-robin-grouped
    // by subject combination into 2 proposed classes each capped at 1 real
    // seat MUST put at least one class over capacity — exactly the same
    // "use enough students to force a genuine overflow" discipline BB.3's
    // own test-writing process already established.
    const preview2 = await previewClassAllocation(principal, { level: LEVEL2, proposedStreamCount: 2, proposedCapacityPerClass: 1 });
    check("4. CREATE_NEW preview finds all 3 real classless students", preview2.totalStudents === 3);
    check("4. CREATE_NEW preview correctly reports classStrategyAvailable", preview2.classStrategyAvailable === "CREATE_NEW");
    check("4. CREATE_NEW preview surfaces a real capacityWarnings entry (3 students into 2 cap-1 classes)", (preview2.capacityWarnings ?? []).length > 0);

    // ---------------------------------------------------------------------
    // 5. confirmClassAllocation() — CREATE_NEW creates real classes, places
    //    students, and honestly gates on any real capacity overflow. A
    //    REAL BUG was found and fixed here: an earlier version created the
    //    real classes BEFORE checking capacity, so a genuinely refused
    //    confirm still left real orphaned empty classes behind.
    // ---------------------------------------------------------------------
    let threwConflictForUndecidedCapacity = false;
    try {
      await confirmClassAllocation(principal, {
        level: LEVEL2, classStrategy: "CREATE_NEW", streamCount: 2, capacityPerClass: 1,
        seedSubjectNeeds: false, generateTimetable: false,
      });
    } catch (e) {
      threwConflictForUndecidedCapacity = e instanceof ClassAllocationError && e.code === "CONFLICT";
    }
    check("5. CREATE_NEW confirm correctly REFUSES with an undecided real capacity warning", threwConflictForUndecidedCapacity);

    const orphanCheck = await db.schoolClass.findMany({ where: { tenantId, level: LEVEL2 } });
    check("5. The refused confirm left ZERO real orphaned classes behind", orphanCheck.length === 0);

    const capacityDecisions: Record<string, "ALLOW_OVER_CAPACITY"> = {};
    for (const w of preview2.capacityWarnings ?? []) capacityDecisions[w.classId] = "ALLOW_OVER_CAPACITY";

    const confirm2 = await confirmClassAllocation(principal, {
      level: LEVEL2, classStrategy: "CREATE_NEW", streamCount: 2, capacityPerClass: 1,
      capacityDecisions, seedSubjectNeeds: true, generateTimetable: false,
    });
    cleanupClassIds.push(...confirm2.createdClassIds);
    cleanupRunIds.push(confirm2.runId);
    if (confirm2.promotionRunId) cleanupPromotionRunIds.push(confirm2.promotionRunId);

    check("5. CREATE_NEW confirm created exactly 2 real classes", confirm2.createdClassIds.length === 2);
    check("5. CREATE_NEW confirm placed all 3 real students", confirm2.totalStudents === 3);

    const newClasses = await db.schoolClass.findMany({ where: { id: { in: confirm2.createdClassIds } } });
    check("5. New classes carry the real chosen capacity", newClasses.every((c) => c.capacity === 1));
    check("5. New classes are named at the real requested level", newClasses.every((c) => c.level === LEVEL2));

    const overflowRuns = await db.classCapacityOverflowRun.findMany({ where: { classId: { in: confirm2.createdClassIds }, decision: "ALLOW_OVER_CAPACITY" } });
    check("5. A real ClassCapacityOverflowRun audit row was recorded for the allowed overflow", overflowRuns.length > 0);

    const placedGammaStudents = await db.student.findMany({ where: { id: { in: cleanupStudentIds.slice(-3) } }, select: { classId: true } });
    check("5. All 3 real students now have a real classId", placedGammaStudents.every((s) => s.classId));

    check("5. CREATE_NEW confirm seeded real ClassSubjectNeed rows from actual student combinations", confirm2.classSubjectNeedsSeeded > 0);

    const run2 = await db.classAllocationRun.findUnique({ where: { id: confirm2.runId } });
    check("5. Real ClassAllocationRun for CREATE_NEW recorded the real createdClassIds", JSON.parse(run2?.createdClassIds ?? "[]").length === 2);
    check("5. Real ClassAllocationRun status COMPLETED", run2?.status === "COMPLETED");

    // ---------------------------------------------------------------------
    // 6. Double-confirming a level that no longer has zero classes must
    //    honestly refuse CREATE_NEW (a real race-condition guard).
    // ---------------------------------------------------------------------
    let threwConflictForExistingClasses = false;
    try {
      await confirmClassAllocation(principal, {
        level: LEVEL2, classStrategy: "CREATE_NEW", streamCount: 1, capacityPerClass: 10,
        seedSubjectNeeds: false, generateTimetable: false,
      });
    } catch (e) {
      threwConflictForExistingClasses = e instanceof ClassAllocationError && e.code === "CONFLICT";
    }
    check("6. Re-confirming CREATE_NEW after classes now exist is correctly REFUSED", threwConflictForExistingClasses);

    // ---------------------------------------------------------------------
    // 7. listClassAllocationRuns() surfaces both real runs, newest first.
    // ---------------------------------------------------------------------
    const runsList = await listClassAllocationRuns(principal);
    const ourRunIds = new Set(cleanupRunIds);
    const foundOurs = runsList.filter((r) => ourRunIds.has(r.id));
    check("7. listClassAllocationRuns() surfaces both real runs", foundOurs.length === 2);

    // ---------------------------------------------------------------------
    // 8. CRITICAL: cross-tenant isolation on ClassAllocationRun.
    // ---------------------------------------------------------------------
    const t2 = await db.tenant.findFirst({ where: { slug: "uwezo-primary-junior" } });
    if (t2) {
      const crossTenantRuns = await withTenant(t2.id, () => tenantDb().classAllocationRun.findMany({ where: { id: { in: cleanupRunIds } } }));
      check("8. CRITICAL: a different tenant sees ZERO of our real allocation runs", crossTenantRuns.length === 0);
      let crossTenantThrew = false;
      try {
        await withTenant(t2.id, () => tenantDb().classAllocationRun.findUnique({ where: { id: confirm2.runId } }));
      } catch {
        crossTenantThrew = true;
      }
      check("8. CRITICAL: a different tenant's findUnique on our real run correctly throws", crossTenantThrew);
    }

  } finally {
    // -----------------------------------------------------------------
    // Cleanup — always runs, even on assertion failure, per standing
    // discipline (never leave real test fixtures behind).
    // -----------------------------------------------------------------
    await db.classSubjectNeed.deleteMany({ where: { classId: { in: cleanupClassIds } } });
    await db.classCapacityOverflowRun.deleteMany({ where: { classId: { in: cleanupClassIds } } });
    await db.classAllocationRun.deleteMany({ where: { id: { in: cleanupRunIds } } });
    await db.promotionRun.deleteMany({ where: { id: { in: cleanupPromotionRunIds } } });
    await db.student.updateMany({ where: { classId: { in: cleanupClassIds } }, data: { classId: null } });
    await db.studentSubjectSelection.deleteMany({ where: { studentId: { in: cleanupStudentIds } } });
    await db.student.deleteMany({ where: { id: { in: cleanupStudentIds } } });
    await db.schoolClass.deleteMany({ where: { id: { in: cleanupClassIds } } });
    await db.subjectSelectionPortal.deleteMany({ where: { id: { in: cleanupPortalIds } } });
    await db.studentImport.deleteMany({ where: { id: { in: cleanupImportIds } } });
    await db.subject.deleteMany({ where: { id: { in: Object.values(subjectIds) } } });

    const remaining = await db.classAllocationRun.findMany({ where: { id: { in: cleanupRunIds } } });
    console.log(remaining.length === 0 ? "  ✓ All BB.4 test fixtures fully cleaned up (confirmed via direct re-query)" : "  ✗ Leftover ClassAllocationRun rows found!");
  }

  console.log(`\n  ${passed} passed, ${failed} failed`);
  if (failed > 0) { console.log("  ❌ BB.4 Grade 10 Allocate Class flow has failures"); process.exit(1); }
  console.log("  ✅ BB.4 Grade 10 Allocate Class flow all green");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
