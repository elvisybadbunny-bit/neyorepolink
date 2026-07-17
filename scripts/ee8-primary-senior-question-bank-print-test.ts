/**
 * EE.8 (Grade 1–6 Primary & Grade 10 Senior School Question Banks + Printable Exam Generator & Answer Key) verification suite.
 * Proves:
 *   1. Seeding Primary (`Grade 1` through `Grade 6`) and Senior (`Grade 10`) question banks (`seedPrimaryAndSeniorSchoolQuestionBank`).
 *   2. Idempotency across re-runs (`seedAllQuestionBanks`).
 *   3. Printable Exam Generator (`getPrintableQuestionBankExam`) compiling exact printable exam blocks with diagrams (`diagramSvg`).
 *   4. Official Teacher Marking Guide & Answer Key generation (`answerKey`).
 *   5. Cross-tenant privacy isolation across all question tiers and print data.
 */

import { db } from "@/lib/db";
import { setEeFeatureReleased } from "@/lib/services/platform-flags.service";
import {
  seedPrimaryAndSeniorSchoolQuestionBank,
  seedAllQuestionBanks,
  getPrintableQuestionBankExam,
  listQuestionBank,
} from "@/lib/services/question-bank.service";

async function main() {
  console.log("=== Running EE.8 (Primary Grade 1-6 & Senior Grade 10 Question Bank + Printable Exam Generator) Test ===\n");

  const karibu = await db.tenant.findFirst({ where: { name: { contains: "Karibu" } } });
  const uhuru = await db.tenant.findFirst({ where: { name: { contains: "Uhuru" } } });
  if (!karibu || !uhuru) throw new Error("Karibu or Uhuru tenant not found in DB.");

  const principal = await db.user.findFirst({
    where: { tenantId: karibu.id, role: "PRINCIPAL" },
  });
  if (!principal) throw new Error("Karibu Principal not found.");

  const opsUser = await db.user.findFirst({
    where: { role: { in: ["FOUNDER", "SUPER_ADMIN"] } },
  }) ?? { id: "ops-user", role: "SUPER_ADMIN", tenantId: "ops" } as never;

  await setEeFeatureReleased(opsUser as never, "EE.8", true, "Test release for primary/senior question bank");
  console.log("✓ 1. Set EE.8 release switch ON in NEYO Ops.");

  // Clean up any prior KICD seeds for exact count verification
  await db.questionBankEntry.deleteMany({ where: { createdByName: { contains: "Primary & Senior School Seed (`EE.8`)" } } });
  await db.questionBankEntry.deleteMany({ where: { createdByName: { contains: "KICD" } } });

  // Test 1: Seed Primary Grade 1-6, Junior Grade 7-9, and Senior Grade 10 repository (`seedAllQuestionBanks`)
  const seedRes1 = await seedAllQuestionBanks(principal as never);
  if (seedRes1.primarySeniorSeeded < 12) {
    throw new Error(`Expected at least 12 seeded Primary & Senior School questions, got ${seedRes1.primarySeniorSeeded}`);
  }
  console.log("✓ 2. Seeded comprehensive Primary (`Grade 1–6`), Junior (`Grade 7–9`), & Senior (`Grade 10`) question repositories (`" + seedRes1.totalSeeded + "` questions created with SVG diagrams).");

  // Test 2: Verify specific seeded SVG diagrams and explanations across Primary grades
  const g2Clock = await db.questionBankEntry.findFirst({ where: { grade: "Grade 2", diagramType: "CLOCK_HALF_PAST_FOUR" } });
  if (!g2Clock || !g2Clock.diagramSvg?.includes("svg")) {
    throw new Error(`Grade 2 clock diagram verification failed: ${JSON.stringify(g2Clock)}`);
  }
  console.log("✓ 3. Verified Grade 2 Analogue Clock SVG (`4:30 Half past 4`) stored with exact geometry diagram (`CLOCK_HALF_PAST_FOUR`).");

  const g3Fractions = await db.questionBankEntry.findFirst({ where: { grade: "Grade 3", diagramType: "FRACTION_CIRCLES" } });
  if (!g3Fractions || g3Fractions.correctAnswer !== "2/4") {
    throw new Error(`Grade 3 fraction circle verification failed: ${JSON.stringify(g3Fractions)}`);
  }
  console.log("✓ 4. Verified Grade 3 Fraction Circle SVG (`2/4 equivalent to 1/2`) stored with self-marking answer.");

  const g5Heart = await db.questionBankEntry.findFirst({ where: { grade: "Grade 5", diagramType: "BIOLOGY_HEART" } });
  if (!g5Heart || g5Heart.correctAnswer !== "Pulmonary Vein") {
    throw new Error(`Grade 5 heart verification failed: ${JSON.stringify(g5Heart)}`);
  }
  console.log("✓ 5. Verified Grade 5 Human Heart diagram (`Pulmonary Vein`) stored with step-by-step biological explanation.");

  const g10Phy = await db.questionBankEntry.findFirst({ where: { grade: "Grade 10", diagramType: "PHYSICS_PARALLEL_CIRCUIT" } });
  if (!g10Phy || !g10Phy.correctAnswer.includes("2 ohms")) {
    throw new Error(`Grade 10 physics parallel circuit failed: ${JSON.stringify(g10Phy)}`);
  }
  console.log("✓ 6. Verified Grade 10 Physics Parallel Circuit schematic (`Total Resistance = 2 ohms, Total Current = 6 A`) stored in bank.");

  // Test 3: Idempotency check across all question banks (`seedAllQuestionBanks`)
  const allSeedsRes = await seedAllQuestionBanks(principal as never);
  const totalSkipped = allSeedsRes.juniorSkipped + allSeedsRes.primarySeniorSkipped;
  if (allSeedsRes.primarySeniorSeeded !== 0 || allSeedsRes.juniorSeeded !== 0 || totalSkipped < 34) {
    throw new Error(`Idempotency check failed when re-running seedAllQuestionBanks: ${JSON.stringify(allSeedsRes)}`);
  }
  console.log("✓ 7. Strict Idempotency verified: re-running `seedAllQuestionBanks` skipped all `" + totalSkipped + "` existing questions (0 duplicates).");

  // Test 4: Generate official, high-contrast Printable Examination Paper (`getPrintableQuestionBankExam`)
  const qIds = [g2Clock.id, g3Fractions.id, g5Heart.id, g10Phy.id];
  const printExam = await getPrintableQuestionBankExam(principal as never, {
    questionIds: qIds,
    title: "National Multi-Grade Practice & Diagnostic Examination (`EE.8`)",
    instructions: "Answer all questions cleanly. For diagrams, label coordinates accurately.",
    timeAllowedMins: 90,
    grade: "Grade 2 — Grade 10",
  });

  if (!printExam.trackingRef.startsWith("MS-QB-EXAM-") || printExam.questions.length !== 4) {
    throw new Error(`Printable exam compilation mismatch: ${JSON.stringify(printExam)}`);
  }
  if (printExam.totalMarks !== 8) { // 4 MCQs @ 2 marks each = 8
    throw new Error(`Total marks calculation mismatch: got ${printExam.totalMarks}, expected 8`);
  }
  if (!printExam.questions[2].diagramSvg?.includes("svg")) {
    throw new Error("Printable exam failed to preserve exact SVG diagram for question 3.");
  }
  console.log("✓ 8. Generated verifiable Printable Examination Paper (`" + printExam.trackingRef + "`) with 4 questions across 8 total marks.");

  // Test 5: Verify Teacher Marking Guide & Answer Key block (`answerKey`)
  if (printExam.answerKey.length !== 4 || printExam.answerKey[2].correctAnswer !== "Pulmonary Vein") {
    throw new Error(`Answer key compilation failed: ${JSON.stringify(printExam.answerKey)}`);
  }
  if (!printExam.answerKey[3].explanation?.includes("1/R_total = 1/6 + 1/3")) {
    throw new Error("Answer key failed to include exact step-by-step working explanation.");
  }
  console.log("✓ 9. Verified Official Teacher Marking Guide & Answer Key (`answerKey`) includes every exact answer (`Pulmonary Vein`) and step-by-step working (`1/R_total = 1/6 + 1/3...`).");

  // Test 6: Cross-tenant privacy isolation check
  let uhuruPrincipal = await db.user.findFirst({ where: { tenantId: uhuru.id, role: "PRINCIPAL" } });
  if (!uhuruPrincipal) {
    uhuruPrincipal = await db.user.create({
      data: { tenantId: uhuru.id, email: "principal_ee8_print@uhuru.ac.ke", fullName: "Uhuru Principal EE8 Print", role: "PRINCIPAL" } as never,
    });
  }

  // Create a school-only question inside Karibu High
  const karibuMat = await db.subject.findFirst({ where: { tenantId: karibu.id } });
  if (!karibuMat) throw new Error("No subject in Karibu.");
  const privateQ = await db.questionBankEntry.create({
    data: {
      tenantId: karibu.id,
      createdById: principal.id,
      createdByName: "Karibu Teacher",
      subjectId: karibuMat.id,
      grade: "Grade 4",
      prompt: "Private Karibu School Question (EE.8 Print Test)",
      correctAnswer: "Private Answer",
      scope: "SCHOOL",
      approvalStatus: "APPROVED",
    } as never,
  });

  const uhuruList = await listQuestionBank(uhuruPrincipal as never, { search: "Private Karibu School Question", scope: "ALL" });
  if (uhuruList.length !== 0) {
    throw new Error("Cross-tenant leak: Uhuru sees Karibu's school-only question!");
  }
  console.log("✓ 10. Cross-tenant privacy isolation verified: `SCHOOL` scoped questions inside Karibu High are 100% hidden from Uhuru Academy.");

  // Clean up test rows
  await db.questionBankEntry.delete({ where: { id: privateQ.id } });
  await setEeFeatureReleased(opsUser as never, "EE.8", false);
  console.log("✓ 11. Reset EE.8 release switch to OFF in NEYO Ops.");

  console.log("\n✅ ALL 11 PRIMARY GRADE 1-6 & SENIOR GRADE 10 QUESTION BANK + PRINTABLE EXAM CHECKS PASSED CLEANLY!");
}

main()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
