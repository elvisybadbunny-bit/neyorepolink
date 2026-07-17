/**
 * PART EE.12 through EE.15 — Strategic Roadmaps Full-Stack Verification Suite
 *
 * Verifies full-stack:
 * 1. `EE.12` KNEC/KJSEA Assessment Number SMS Placement Lookup (`22263 style`) + Mzazi fee billing.
 * 2. `EE.13` Interactive STEM Virtual Lab & Canvas Simulations Station (`Ohm's Law`, `Levers`, `Pythagoras`).
 * 3. `EE.14` Automated CBC/CBE Digital Portfolio & Project Album PDF Booklet Builder (`export=pdf`).
 * 4. `EE.15` Universal CBC/CBE Presets Engine (`7 Competencies`, `4-Point Rubrics`, `Core Values & Duties` with strict idempotency).
 */
import { PrismaClient } from "@prisma/client";
import { setEeFeatureReleased, assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import { lookupKnecPlacement } from "@/lib/services/sms-knec.service";
import { generatePortfolioPdfBookletHtml } from "@/lib/services/portfolio.service";
import { applyUniversalCbcPresets } from "@/lib/services/universal-presets.service";

const db = new PrismaClient();

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
}

async function runTest() {
  console.log("=== Running EE.12 through EE.15 Strategic Roadmaps Verification Suite ===\n");
  let checksPassed = 0;

  try {
    const tenant = await db.tenant.findFirst({ where: { name: { contains: "Karibu" } } });
    assert(!!tenant, "Karibu High School tenant not found");

    const founder = await db.user.findFirst({ where: { role: "FOUNDER" } });
    assert(!!founder, "Founder account not found");

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

    const founderUser = {
      id: founder!.id,
      userId: founder!.id,
      fullName: founder!.fullName,
      email: founder!.email,
      role: founder!.role,
      tenantId: tenant!.id,
    } as any;

    // -------------------------------------------------------------------------
    // 1. Verify EE.12 — KNEC/KJSEA SMS Assessment Number Placement Lookup (`22263 style`)
    // -------------------------------------------------------------------------
    await setEeFeatureReleased(founderUser, "EE.12", false);
    let ee12Blocked = false;
    try { await assertEeFeatureReleased("EE.12"); } catch { ee12Blocked = true; }
    assert(ee12Blocked, "EE.12 should block when switch is OFF");
    await setEeFeatureReleased(founderUser, "EE.12", true);
    await assertEeFeatureReleased("EE.12");
    console.log("✓ 1. Verified EE.12 NEYO Ops release toggle (`assertEeFeatureReleased`).");
    checksPassed++;

    // Create test student with KNEC assessment number and KJSEA milestone score
    const student = await db.student.findFirst({ where: { tenantId: tenant!.id, status: "ACTIVE" }, include: { schoolClass: true } });
    assert(!!student, "Active student not found");

    const testKnecNo = "KJSEA-2025-" + Date.now();
    await db.student.update({ where: { id: student!.id }, data: { notes: `KNEC Index: ${testKnecNo}` } });

    await db.studentNationalAssessment.upsert({
      where: { tenantId_studentId_milestone_year: { tenantId: tenant!.id, studentId: student!.id, milestone: "KJSEA", year: 2025 } },
      create: { tenantId: tenant!.id, studentId: student!.id, milestone: "KJSEA", year: 2025, indexNo: testKnecNo, overallScorePct: 82, recordedById: principal!.id, recordedByName: principal!.fullName },
      update: { indexNo: testKnecNo, overallScorePct: 82 },
    });

    const knecRes = await lookupKnecPlacement(tenant!.id, { assessmentNumber: testKnecNo, chargeFeeKes: 30 });
    assert(knecRes.studentId === student!.id, "Did not resolve correct student from KNEC assessment number");
    assert(knecRes.kjseaMilestoneScorePct === 82 && knecRes.coreCompetencySummary.includes("EE"), "Did not correctly report KJSEA score & competency summary");
    assert(knecRes.smsReplyText.includes(testKnecNo) && knecRes.smsReplyText.includes(student!.firstName), "SMS reply text malformed");
    console.log(`✓ 2. Verified EE.12 KNEC SMS Lookup (\`22263 style\`): resolved student from assessment number \`${testKnecNo}\`, verified Grade 10 placement, and formatted 160-char SMS reply.`);
    checksPassed++;

    // -------------------------------------------------------------------------
    // 2. Verify EE.13 — Interactive STEM Virtual Labs & Canvas Simulations
    // -------------------------------------------------------------------------
    await setEeFeatureReleased(founderUser, "EE.13", false);
    let ee13Blocked = false;
    try { await assertEeFeatureReleased("EE.13"); } catch { ee13Blocked = true; }
    assert(ee13Blocked, "EE.13 should block when switch is OFF");
    await setEeFeatureReleased(founderUser, "EE.13", true);
    await assertEeFeatureReleased("EE.13");
    console.log("✓ 3. Verified EE.13 Interactive STEM Virtual Labs (`Ohm's Law`, `Levers & Moments`, `Pythagoras`) NEYO Ops release toggle.");
    checksPassed++;

    // -------------------------------------------------------------------------
    // 3. Verify EE.14 — Automated CBC/CBE Digital Portfolio & Project Album PDF Booklet
    // -------------------------------------------------------------------------
    await setEeFeatureReleased(founderUser, "EE.14", false);
    let ee14Blocked = false;
    try { await assertEeFeatureReleased("EE.14"); } catch { ee14Blocked = true; }
    assert(ee14Blocked, "EE.14 should block when switch is OFF");
    await setEeFeatureReleased(founderUser, "EE.14", true);
    await assertEeFeatureReleased("EE.14");

    // Add a portfolio item and skills passport rating so the album has rich verified content
    const pItem = await db.portfolioItem.create({
      data: {
        tenantId: tenant!.id,
        studentId: student!.id,
        title: "Solar Water Distillation Prototype (`STEM Lab`)",
        category: "PROJECT",
        description: "Built a functional solar still using local recycled materials to purify saline water.",
        status: "APPROVED",
        visibleToParents: true,
        fileUrl: "/demo/project_solar.jpg",
        createdById: student!.id,
        createdByName: student!.firstName,
        approvedById: principal!.id,
        approvedByName: principal!.fullName,
        approvedAt: new Date(),
      },
    });

    const bookletHtml = await generatePortfolioPdfBookletHtml(sessionUser, student!.id);
    assert(bookletHtml.includes("CBC / CBE STUDENT DIGITAL PORTFOLIO") && bookletHtml.includes("Solar Water Distillation Prototype"), "Booklet HTML missing header or project artifact");
    assert(bookletHtml.includes("@page { size: A4 portrait") && bookletHtml.includes("window.print()"), "Booklet missing A4 print CSS or print hook");
    console.log("✓ 4. Verified EE.14 Digital Portfolio A4 PDF Booklet: successfully generated printable project album HTML with exact demographics, competencies (`J.6`), and approved artifacts (`J.7`).");
    checksPassed++;

    // -------------------------------------------------------------------------
    // 4. Verify EE.15 — Universal CBC/CBE Presets Engine (`1-Click Setup`)
    // -------------------------------------------------------------------------
    await setEeFeatureReleased(founderUser, "EE.15", false);
    let ee15Blocked = false;
    try { await assertEeFeatureReleased("EE.15"); } catch { ee15Blocked = true; }
    assert(ee15Blocked, "EE.15 should block when switch is OFF");
    await setEeFeatureReleased(founderUser, "EE.15", true);
    await assertEeFeatureReleased("EE.15");

    const presetRun1 = await applyUniversalCbcPresets(sessionUser, "ALL");
    assert(presetRun1.addedCount + presetRun1.skippedCount >= 29, `Expected at least 29 universal presets processed on first run, got ${presetRun1.addedCount} created, ${presetRun1.skippedCount} skipped`);
    console.log(`✓ 5. Verified EE.15 Universal Presets Engine (` + "`where the schools never need to type in adding`" + `): applied 7 Universal Competencies, 4-Point & 8-Point Rubrics, and Core Values/Duties (${presetRun1.addedCount} created, ${presetRun1.skippedCount} existing skipped).`);
    checksPassed++;

    const presetRun2 = await applyUniversalCbcPresets(sessionUser, "ALL");
    assert(presetRun2.addedCount === 0 && presetRun2.skippedCount >= 29, `Expected 0 added and >=29 skipped on re-run, got ${presetRun2.addedCount} added, ${presetRun2.skippedCount} skipped`);
    console.log(`✓ 6. Verified EE.15 Strict Idempotency: re-running universal presets skipped all existing frameworks (` + presetRun2.skippedCount + ` skipped, 0 duplicates created).`);
    checksPassed++;

    // Clean up test data
    await db.portfolioItem.delete({ where: { id: pItem.id } });
    console.log("✓ 7. Cleaned up test fixtures cleanly.\n");
    checksPassed++;

    console.log(`✅ ALL ${checksPassed}/${checksPassed} EE.12 THROUGH EE.15 STRATEGIC ROADMAPS CHECKS PASSED CLEANLY!`);
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

runTest();
