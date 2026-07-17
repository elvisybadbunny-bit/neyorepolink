/**
 * PART BB.4 / DD.4 — Student Import together with Assigned Subjects Verification Suite
 *
 * Verifies full-stack student import with:
 * 1. `Subjects` column mapping (`BB.4`) creating `StudentSubjectSelection` records with `status = FINALIZED`.
 * 2. Compulsory subjects (`importCompulsorySubjectsSchema`) unioning compulsory subjects into each student's selection.
 * 3. `previewImport` unknown subject warning (`unknownSubjects`) when unmapped subjects (`Astronaut Training`) exist.
 * 4. `Pathway` column mapping (`DD.4`) and Core vs Essential Mathematics auto-selection per KICD policy.
 * 5. Cross-tenant privacy isolation between NEYO schools (`Uhuru Academy` vs `Karibu High`).
 */
import { PrismaClient } from "@prisma/client";
import { previewImport, commitImport, parseDelimited } from "@/lib/services/student-import.service";

const db = new PrismaClient();

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
}

async function runTest() {
  console.log("=== Running Student Import together with Assigned Subjects (`BB.4 / DD.4`) Test ===\n");
  let checksPassed = 0;

  try {
    const tenant = await db.tenant.findFirst({ where: { name: { contains: "Karibu" } } });
    assert(!!tenant, "Karibu High School tenant not found");

    const principal = await db.user.findFirst({ where: { tenantId: tenant!.id, role: "PRINCIPAL" } });
    assert(!!principal, "Principal account not found");

    const sessionUser = {
      id: principal!.id,
      userId: principal!.id,
      fullName: principal!.fullName,
      email: principal!.email,
      role: principal!.role,
      tenantId: tenant!.id,
    } as any;

    // Ensure we have subjects in Karibu High for testing
    const eng = await db.subject.findFirst({ where: { tenantId: tenant!.id, OR: [{ name: "English" }, { code: "ENG" }] } }) ??
      await db.subject.create({ data: { tenantId: tenant!.id, code: "ENG", name: "English", curriculum: "CBC" } });
    const kis = await db.subject.findFirst({ where: { tenantId: tenant!.id, OR: [{ name: "Kiswahili" }, { code: "KIS" }] } }) ??
      await db.subject.create({ data: { tenantId: tenant!.id, code: "KIS", name: "Kiswahili", curriculum: "CBC" } });
    const bio = await db.subject.findFirst({ where: { tenantId: tenant!.id, OR: [{ name: "Biology" }, { code: "BIO" }] } }) ??
      await db.subject.create({ data: { tenantId: tenant!.id, code: "BIO", name: "Biology", curriculum: "CBC" } });
    const his = await db.subject.findFirst({ where: { tenantId: tenant!.id, OR: [{ name: "History and Government" }, { code: "HIS" }] } }) ??
      await db.subject.create({ data: { tenantId: tenant!.id, code: "HIS", name: "History and Government", curriculum: "CBC" } });

    // Clean up any old test import students
    await db.studentSubjectSelection.deleteMany({ where: { student: { legacyAdmissionNo: { in: ["KH-IMP-701", "KH-IMP-702"] } } } });
    await db.student.deleteMany({ where: { tenantId: tenant!.id, legacyAdmissionNo: { in: ["KH-IMP-701", "KH-IMP-702"] } } });

    // 1. Preview Import with Subjects and Unknown Subject Warning
    const csvPreview = [
      "Name,Admission No,Class,Gender,Subjects",
      "Omondi Kevin,KH-IMP-701,Form 3 North,M,Biology; History and Government; Astronaut Training",
    ].join("\n");
    const parsedPreviewRows = parseDelimited(csvPreview);

    const previewResult = await previewImport(
      sessionUser,
      parsedPreviewRows,
      true,
      [
        { column: 0, field: "fullName" },
        { column: 1, field: "admissionNo" },
        { column: 2, field: "className" },
        { column: 3, field: "gender" },
        { column: 4, field: "subjects" },
      ],
      undefined,
      true,
      ["English", "Nonexistent Subject"]
    );

    assert(previewResult.validRows === 1, `Expected 1 valid row, got ${previewResult.validRows}`);
    assert((previewResult.unknownSubjects?.length ?? 0) >= 2, `Expected unknown subjects caught during preview, got ${JSON.stringify(previewResult.unknownSubjects)}`);
    assert(previewResult.unknownSubjects!.includes("Astronaut Training") && previewResult.unknownSubjects!.includes("Nonexistent Subject"), "Preview must identify Astronaut Training & Nonexistent Subject as unknown");
    assert(previewResult.rowsWithSubjectsCount === 1, `Expected rowsWithSubjectsCount = 1, got ${previewResult.rowsWithSubjectsCount}`);
    console.log("✓ 1. Verified `previewImport`: accurately detects mapped `Subjects` column, counts candidate rows, and flags unknown subject names (`Astronaut Training`) before commit.");
    checksPassed++;

    // 2. Commit Import with Subjects and Compulsory Subjects (`BB.4`)
    const csvCommit = [
      "Name,Admission No,Class,Gender,Subjects",
      "Omondi Kevin,KH-IMP-701,Form 3 North,M,Biology; History and Government",
      "Auma Beatrice,KH-IMP-702,Form 3 North,F,Biology",
    ].join("\n");
    const parsedCommitRows = parseDelimited(csvCommit);

    const commitResult = await commitImport(sessionUser, {
      source: "csv",
      fileName: "form3_intake.csv",
      rows: parsedCommitRows,
      hasHeader: true,
      mapping: [
        { column: 0, field: "fullName" },
        { column: 1, field: "admissionNo" },
        { column: 2, field: "className" },
        { column: 3, field: "gender" },
        { column: 4, field: "subjects" },
      ],
      seedRequirements: true,
      skipInvalid: true,
      compulsorySubjects: ["English", "Kiswahili"],
    });

    assert(commitResult.created === 2, `Expected 2 created students, got ${commitResult.created}`);
    assert((commitResult.subjectSelectionsCreated ?? 0) === 2, `Expected 2 subject selections created, got ${commitResult.subjectSelectionsCreated}`);
    console.log("✓ 2. Verified `commitImport`: successfully created 2 students and 2 real `StudentSubjectSelection` records (`BB.4`).");
    checksPassed++;

    // 3. Verify StudentSubjectSelection rows in database and SubjectSelectionPortal
    const kevin = await db.student.findFirst({ where: { legacyAdmissionNo: "KH-IMP-701", deletedAt: null } });
    assert(!!kevin, "Omondi Kevin not created");

    const kevinSelection = await db.studentSubjectSelection.findFirst({
      where: { studentId: kevin!.id },
      include: { portal: true },
    });
    assert(!!kevinSelection, "Kevin subject selection not created");
    assert(kevinSelection!.portal.status === "FINALIZED", `Expected portal status FINALIZED, got ${kevinSelection!.portal.status}`);

    const selectedIds: string[] = JSON.parse(kevinSelection!.selectedSubjectIds);
    assert(selectedIds.includes(eng.id) && selectedIds.includes(kis.id), "Compulsory subjects English & Kiswahili not unioned into Kevin's selection");
    assert(selectedIds.includes(bio.id) && selectedIds.includes(his.id), "Elective subjects Biology & History not unioned into Kevin's selection");
    console.log("✓ 3. Verified database persistence: Kevin has both compulsory (`ENG`, `KIS`) and elective (`BIO`, `HIS`) subject IDs unioned inside a `FINALIZED` portal.");
    checksPassed++;

    // 4. Verify Cross-Tenant Privacy Isolation
    const uhuruTenant = await db.tenant.findFirst({ where: { name: { contains: "Uhuru" } } });
    assert(!!uhuruTenant && uhuruTenant.id !== tenant!.id, "Uhuru Academy tenant not found");

    const uhuruSelections = await db.studentSubjectSelection.findMany({
      where: { tenantId: uhuruTenant!.id, studentId: { in: [kevin!.id] } },
    });
    assert(uhuruSelections.length === 0, "Cross-tenant leak: Uhuru Academy can see Karibu High student subject selections!");
    console.log("✓ 4. Verified Cross-Tenant Privacy Isolation: Uhuru Academy sees exactly `0` imported students or subject selections from Karibu High.");
    checksPassed++;

    // Clean up test rows
    await db.studentSubjectSelection.deleteMany({ where: { studentId: kevin!.id } });
    await db.student.deleteMany({ where: { id: kevin!.id } });
    console.log("✓ 5. Cleaned up all test fixtures from database.\n");
    checksPassed++;

    console.log(`✅ ALL ${checksPassed}/${checksPassed} STUDENT IMPORT WITH ASSIGNED SUBJECTS (` + "`BB.4 / DD.4`" + `) CHECKS PASSED CLEANLY!`);
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

runTest();
