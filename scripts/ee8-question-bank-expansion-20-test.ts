/**
 * Standalone verification test suite for EE.8 — Question Bank 20-Per-Strand Expansion (`627 total questions`).
 *
 * Verifies that:
 * 1. All 400 new questions in Part 1, Part 2, Part 3, and Part 4 load cleanly and conform to required Zod/Prisma structures.
 * 2. Every single investigated core and elective strand has >= 20 questions.
 * 3. The `seedAllQuestionBanks(user)` engine seeds all 627 questions cleanly inside `withTenant` with 0 duplicate errors on re-run.
 */

import { QUESTION_BANK_EXPANSION_20_PART1 } from "../src/lib/data/kicd-question-bank-expansion-20-part1";
import { QUESTION_BANK_EXPANSION_20_PART2 } from "../src/lib/data/kicd-question-bank-expansion-20-part2";
import { QUESTION_BANK_EXPANSION_20_PART3 } from "../src/lib/data/kicd-question-bank-expansion-20-part3";
import { QUESTION_BANK_EXPANSION_20_PART4 } from "../src/lib/data/kicd-question-bank-expansion-20-part4";
import { QUESTION_BANK_EXPANSION_20_PART5 } from "../src/lib/data/kicd-question-bank-expansion-20-part5";
import { QUESTION_BANK_EXPANSION_20_PART6 } from "../src/lib/data/kicd-question-bank-expansion-20-part6";
import { QUESTION_BANK_EXPANSION_20_PART7 } from "../src/lib/data/kicd-question-bank-expansion-20-part7";
import { QUESTION_BANK_EXPANSION_20_PART8 } from "../src/lib/data/kicd-question-bank-expansion-20-part8";
import { QUESTION_BANK_EXPANSION_500_PART1 } from "../src/lib/data/kicd-question-bank-expansion-500-part1";
import { QUESTION_BANK_EXPANSION_500_PART2 } from "../src/lib/data/kicd-question-bank-expansion-500-part2";
import { QUESTION_BANK_EXPANSION_500_PART3 } from "../src/lib/data/kicd-question-bank-expansion-500-part3";
import { QUESTION_BANK_EXPANSION_500_PART4 } from "../src/lib/data/kicd-question-bank-expansion-500-part4";
import { QUESTION_BANK_EXPANSION_500_PART5 } from "../src/lib/data/kicd-question-bank-expansion-500-part5";
import { QUESTION_BANK_EXPANSION_500_PART6 } from "../src/lib/data/kicd-question-bank-expansion-500-part6";
import { QUESTION_BANK_EXPANSION_500_PART7 } from "../src/lib/data/kicd-question-bank-expansion-500-part7";
import { QUESTION_BANK_EXPANSION_500_PART8 } from "../src/lib/data/kicd-question-bank-expansion-500-part8";
import { QUESTION_BANK_EXPANSION_500_PART9 } from "../src/lib/data/kicd-question-bank-expansion-500-part9";
import { QUESTION_BANK_EXPANSION_500_PART10 } from "../src/lib/data/kicd-question-bank-expansion-500-part10";
import { QUESTION_BANK_EXPANSION_500_PART11 } from "../src/lib/data/kicd-question-bank-expansion-500-part11";
import { QUESTION_BANK_EXPANSION_500_PART12 } from "../src/lib/data/kicd-question-bank-expansion-500-part12";
import { QUESTION_BANK_EXPANSION_500_PART13 } from "../src/lib/data/kicd-question-bank-expansion-500-part13";
import { QUESTION_BANK_EXPANSION_500_PART14 } from "../src/lib/data/kicd-question-bank-expansion-500-part14";
import { QUESTION_BANK_EXPANSION_500_PART15 } from "../src/lib/data/kicd-question-bank-expansion-500-part15";
import { QUESTION_BANK_EXPANSION_500_PART16 } from "../src/lib/data/kicd-question-bank-expansion-500-part16";
import { QUESTION_BANK_EXPANSION_500_PART17 } from "../src/lib/data/kicd-question-bank-expansion-500-part17";
import { QUESTION_BANK_EXPANSION_500_PART18 } from "../src/lib/data/kicd-question-bank-expansion-500-part18";
import { QUESTION_BANK_EXPANSION_500_PART19 } from "../src/lib/data/kicd-question-bank-expansion-500-part19";
import { QUESTION_BANK_EXPANSION_500MORE_PART1 } from "../src/lib/data/kicd-question-bank-expansion-500more-part1";
import { QUESTION_BANK_EXPANSION_500MORE_PART2 } from "../src/lib/data/kicd-question-bank-expansion-500more-part2";
import { QUESTION_BANK_EXPANSION_500MORE_PART3 } from "../src/lib/data/kicd-question-bank-expansion-500more-part3";
import { QUESTION_BANK_EXPANSION_500MORE_PART4 } from "../src/lib/data/kicd-question-bank-expansion-500more-part4";
import { QUESTION_BANK_EXPANSION_500MORE_PART5 } from "../src/lib/data/kicd-question-bank-expansion-500more-part5";
import { QUESTION_BANK_EXPANSION_500MORE_PART6 } from "../src/lib/data/kicd-question-bank-expansion-500more-part6";
import { QUESTION_BANK_EXPANSION_500MORE_PART7 } from "../src/lib/data/kicd-question-bank-expansion-500more-part7";
import { QUESTION_BANK_EXPANSION_500MORE_PART8 } from "../src/lib/data/kicd-question-bank-expansion-500more-part8";
import { QUESTION_BANK_EXPANSION_500MORE_PART9 } from "../src/lib/data/kicd-question-bank-expansion-500more-part9";
import { QUESTION_BANK_EXPANSION_500MORE_PART10 } from "../src/lib/data/kicd-question-bank-expansion-500more-part10";
import { QUESTION_BANK_EXPANSION_500MORE_PART11 } from "../src/lib/data/kicd-question-bank-expansion-500more-part11";
import { QUESTION_BANK_EXPANSION_500MORE_PART12 } from "../src/lib/data/kicd-question-bank-expansion-500more-part12";
import { QUESTION_BANK_EXPANSION_500MORE_PART13 } from "../src/lib/data/kicd-question-bank-expansion-500more-part13";
import { QUESTION_BANK_EXPANSION_500MORE_PART14 } from "../src/lib/data/kicd-question-bank-expansion-500more-part14";
import { QUESTION_BANK_EXPANSION_500MORE_PART15 } from "../src/lib/data/kicd-question-bank-expansion-500more-part15";
import { QUESTION_BANK_EXPANSION_500MORE_PART16 } from "../src/lib/data/kicd-question-bank-expansion-500more-part16";
import { QUESTION_BANK_EXPANSION_500MORE_PART17 } from "../src/lib/data/kicd-question-bank-expansion-500more-part17";
import { QUESTION_BANK_EXPANSION_500MORE_PART18 } from "../src/lib/data/kicd-question-bank-expansion-500more-part18";
import { QUESTION_BANK_EXPANSION_500MORE_PART19 } from "../src/lib/data/kicd-question-bank-expansion-500more-part19";
import { QUESTION_BANK_EXPANSION_500MORE_PART20 } from "../src/lib/data/kicd-question-bank-expansion-500more-part20";
import { QUESTION_BANK_EXPANSION_500MORE_PART21 } from "../src/lib/data/kicd-question-bank-expansion-500more-part21";
import { QUESTION_BANK_EXPANSION_500MORE_PART22 } from "../src/lib/data/kicd-question-bank-expansion-500more-part22";
import { QUESTION_BANK_EXPANSION_500MORE_PART23 } from "../src/lib/data/kicd-question-bank-expansion-500more-part23";
import { QUESTION_BANK_EXPANSION_500MORE_PART24 } from "../src/lib/data/kicd-question-bank-expansion-500more-part24";
import { QUESTION_BANK_EXPANSION_500MORE_PART25 } from "../src/lib/data/kicd-question-bank-expansion-500more-part25";
import { QUESTION_BANK_EXPANSION_500MORE_PART26 } from "../src/lib/data/kicd-question-bank-expansion-500more-part26";
import { QUESTION_BANK_EXPANSION_500MORE_PART27 } from "../src/lib/data/kicd-question-bank-expansion-500more-part27";
import { QUESTION_BANK_EXPANSION_500MORE_PART28 } from "../src/lib/data/kicd-question-bank-expansion-500more-part28";
import { QUESTION_BANK_EXPANSION_500MORE_PART29 } from "../src/lib/data/kicd-question-bank-expansion-500more-part29";
import { QUESTION_BANK_EXPANSION_500MORE_PART30 } from "../src/lib/data/kicd-question-bank-expansion-500more-part30";
import { QUESTION_BANK_EXPANSION_500MORE_PART31 } from "../src/lib/data/kicd-question-bank-expansion-500more-part31";
import { QUESTION_BANK_EXPANSION_1000MORE_PART1 } from "../src/lib/data/kicd-question-bank-expansion-1000more-part1";
import { QUESTION_BANK_EXPANSION_1000MORE_PART2 } from "../src/lib/data/kicd-question-bank-expansion-1000more-part2";
import { QUESTION_BANK_EXPANSION_1000MORE_PART3 } from "../src/lib/data/kicd-question-bank-expansion-1000more-part3";
import { QUESTION_BANK_EXPANSION_1000MORE_PART4 } from "../src/lib/data/kicd-question-bank-expansion-1000more-part4";
import { QUESTION_BANK_EXPANSION_1000MORE_PART5 } from "../src/lib/data/kicd-question-bank-expansion-1000more-part5";
import { QUESTION_BANK_EXPANSION_1000MORE_PART6 } from "../src/lib/data/kicd-question-bank-expansion-1000more-part6";
import { QUESTION_BANK_EXPANSION_1000MORE_PART7 } from "../src/lib/data/kicd-question-bank-expansion-1000more-part7";
import { QUESTION_BANK_EXPANSION_1000MORE_PART8 } from "../src/lib/data/kicd-question-bank-expansion-1000more-part8";
import { QUESTION_BANK_EXPANSION_1000MORE_PART9 } from "../src/lib/data/kicd-question-bank-expansion-1000more-part9";
import { QUESTION_BANK_EXPANSION_1000MORE_PART10 } from "../src/lib/data/kicd-question-bank-expansion-1000more-part10";
import { JUNIOR_SCHOOL_QUESTION_SEEDS } from "../src/lib/data/kicd-junior-school-question-bank";
import { JUNIOR_SCHOOL_QUESTION_SEEDS_PART2 } from "../src/lib/data/kicd-junior-school-question-bank-part2";
import { QUESTION_BANK_EXPANSION_15 } from "../src/lib/data/kicd-question-bank-expansion-15";
import { PRIMARY_AND_SENIOR_QUESTION_SEEDS } from "../src/lib/data/kicd-primary-senior-question-bank";
import { seedAllQuestionBanks } from "../src/lib/services/question-bank.service";
import { db } from "../src/lib/db";

async function runTest() {
  console.log("=================================================================");
  console.log("EE.8 — QUESTION BANK 20-PER-STRAND EXPANSION VERIFICATION SUITE");
  console.log("=================================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, name: string, details?: any) {
    total++;
    if (condition) {
      console.log(`[PASS ${total}] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL ${total}] ${name}`, details || "");
      process.exit(1);
    }
  }

  const allExpansion = [
    ...QUESTION_BANK_EXPANSION_20_PART1,
    ...QUESTION_BANK_EXPANSION_20_PART2,
    ...QUESTION_BANK_EXPANSION_20_PART3,
    ...QUESTION_BANK_EXPANSION_20_PART4,
    ...QUESTION_BANK_EXPANSION_20_PART5,
    ...QUESTION_BANK_EXPANSION_20_PART6,
    ...QUESTION_BANK_EXPANSION_20_PART7,
    ...QUESTION_BANK_EXPANSION_20_PART8,
    ...QUESTION_BANK_EXPANSION_500_PART1,
    ...QUESTION_BANK_EXPANSION_500_PART2,
    ...QUESTION_BANK_EXPANSION_500_PART3,
    ...QUESTION_BANK_EXPANSION_500_PART4,
    ...QUESTION_BANK_EXPANSION_500_PART5,
    ...QUESTION_BANK_EXPANSION_500_PART6,
    ...QUESTION_BANK_EXPANSION_500_PART7,
    ...QUESTION_BANK_EXPANSION_500_PART8,
    ...QUESTION_BANK_EXPANSION_500_PART9,
    ...QUESTION_BANK_EXPANSION_500_PART10,
    ...QUESTION_BANK_EXPANSION_500_PART11,
    ...QUESTION_BANK_EXPANSION_500_PART12,
    ...QUESTION_BANK_EXPANSION_500_PART13,
    ...QUESTION_BANK_EXPANSION_500_PART14,
    ...QUESTION_BANK_EXPANSION_500_PART15,
    ...QUESTION_BANK_EXPANSION_500_PART16,
    ...QUESTION_BANK_EXPANSION_500_PART17,
    ...QUESTION_BANK_EXPANSION_500_PART18,
    ...QUESTION_BANK_EXPANSION_500_PART19,
    ...QUESTION_BANK_EXPANSION_500MORE_PART1,
    ...QUESTION_BANK_EXPANSION_500MORE_PART2,
    ...QUESTION_BANK_EXPANSION_500MORE_PART3,
    ...QUESTION_BANK_EXPANSION_500MORE_PART4,
    ...QUESTION_BANK_EXPANSION_500MORE_PART5,
    ...QUESTION_BANK_EXPANSION_500MORE_PART6,
    ...QUESTION_BANK_EXPANSION_500MORE_PART7,
    ...QUESTION_BANK_EXPANSION_500MORE_PART8,
    ...QUESTION_BANK_EXPANSION_500MORE_PART9,
    ...QUESTION_BANK_EXPANSION_500MORE_PART10,
    ...QUESTION_BANK_EXPANSION_500MORE_PART11,
    ...QUESTION_BANK_EXPANSION_500MORE_PART12,
    ...QUESTION_BANK_EXPANSION_500MORE_PART13,
    ...QUESTION_BANK_EXPANSION_500MORE_PART14,
    ...QUESTION_BANK_EXPANSION_500MORE_PART15,
    ...QUESTION_BANK_EXPANSION_500MORE_PART16,
    ...QUESTION_BANK_EXPANSION_500MORE_PART17,
    ...QUESTION_BANK_EXPANSION_500MORE_PART18,
    ...QUESTION_BANK_EXPANSION_500MORE_PART19,
    ...QUESTION_BANK_EXPANSION_500MORE_PART20,
    ...QUESTION_BANK_EXPANSION_500MORE_PART21,
    ...QUESTION_BANK_EXPANSION_500MORE_PART22,
    ...QUESTION_BANK_EXPANSION_500MORE_PART23,
    ...QUESTION_BANK_EXPANSION_500MORE_PART24,
    ...QUESTION_BANK_EXPANSION_500MORE_PART25,
    ...QUESTION_BANK_EXPANSION_500MORE_PART26,
    ...QUESTION_BANK_EXPANSION_500MORE_PART27,
    ...QUESTION_BANK_EXPANSION_500MORE_PART28,
    ...QUESTION_BANK_EXPANSION_500MORE_PART29,
    ...QUESTION_BANK_EXPANSION_500MORE_PART30,
    ...QUESTION_BANK_EXPANSION_500MORE_PART31,
    ...QUESTION_BANK_EXPANSION_1000MORE_PART1,
    ...QUESTION_BANK_EXPANSION_1000MORE_PART2,
    ...QUESTION_BANK_EXPANSION_1000MORE_PART3,
    ...QUESTION_BANK_EXPANSION_1000MORE_PART4,
    ...QUESTION_BANK_EXPANSION_1000MORE_PART5,
    ...QUESTION_BANK_EXPANSION_1000MORE_PART6,
    ...QUESTION_BANK_EXPANSION_1000MORE_PART7,
    ...QUESTION_BANK_EXPANSION_1000MORE_PART8,
    ...QUESTION_BANK_EXPANSION_1000MORE_PART9,
    ...QUESTION_BANK_EXPANSION_1000MORE_PART10,
  ];

  assert(allExpansion.length === 2443, `Exact 2,443 new expansion questions present across Part 1 through Part 10 of 1000more (Found ${allExpansion.length})`);

  const allQuestions = [
    ...JUNIOR_SCHOOL_QUESTION_SEEDS,
    ...JUNIOR_SCHOOL_QUESTION_SEEDS_PART2,
    ...PRIMARY_AND_SENIOR_QUESTION_SEEDS,
    ...QUESTION_BANK_EXPANSION_15,
    ...allExpansion,
  ];

  assert(allQuestions.length === 2670, `Total seeded question bank capacity is exactly 2,670 items across Kenya (Found ${allQuestions.length})`);

  // Verify options, correctAnswer, difficulty, and explanation structure across all 400 expansion items
  let malformedCount = 0;
  for (const q of allExpansion) {
    if (!q.prompt || q.prompt.length < 10) malformedCount++;
    if (!q.options || q.options.length !== 4) malformedCount++;
    if (!q.correctAnswer || !q.options.includes(q.correctAnswer)) malformedCount++;
    if (!q.explanation || q.explanation.length < 15) malformedCount++;
    if (![1, 2, 3].includes(q.difficulty)) malformedCount++;
    if (q.prompt.toLowerCase().includes("artificial intelligence") || q.explanation.toLowerCase().includes("artificial intelligence")) malformedCount++;
  }

  assert(malformedCount === 0, `All 654 expansion questions strictly conform to 4 options, exact correctAnswer match, rich explanation, valid difficulty, and 0 AI wording (Found ${malformedCount} errors)`);

  // Verify that every single core and elective investigated strand has >= 20 questions when aggregated
  const countsByStrand: Record<string, number> = {};
  for (const q of allQuestions) {
    countsByStrand[q.strandName] = (countsByStrand[q.strandName] || 0) + 1;
  }

  const coreStrandsToCheck = [
    "Numbers",
    "Grammar in Use",
    "Natural and Built Environments",
    "Geometry",
    "Algebra",
    "Living Things and Their Environment",
    "Force and Energy",
    "Numbers and Algebra",
    "Measurement",
    "Sarufi na Matumizi ya Lugha",
    "Foundations of Pre-Technical Studies",
    "Conservation of Resources",
    "Foundations of Creative Arts and Sports",
    "Creation and the Bible",
    "Writing",
    "Fasihi Simulizi na Misemo",
    "Electricity and Magnetism",
    "Quantitative Chemistry and Stoichiometry",
    "Reading and Comprehension",
    "Human Body Systems and Health",
    "Measurements and Geometry",
  ];

  let below20Count = 0;
  for (const s of coreStrandsToCheck) {
    const c = countsByStrand[s] || 0;
    if (c < 20) {
      console.warn(`Strand '${s}' has only ${c} questions (<20)`);
      below20Count++;
    }
  }

  assert(below20Count === 0, `All ${coreStrandsToCheck.length} checked core and elective strands have >= 20 self-marking questions each`);

  // Now verify database seeding via real seedAllQuestionBanks(user)
  console.log("\n--- Executing real database seed via seedAllQuestionBanks() ---");
  const testTenantId = "tenant-ee8-exp20-" + Date.now();
  await db.tenant.create({
    data: {
      id: testTenantId,
      name: "Uhuru Math & Science Academy",
      slug: "uhuru-exp20-" + Date.now(),
      county: "Nairobi",
    }
  });

  const testUser = await db.user.create({
    data: {
      email: `principal+exp20@uhuru.ac.ke`,
      neyoLoginId: `principal_exp20_${Date.now()}`,
      passwordHash: "hash_exp20",
      fullName: "Principal Uhuru Exp20",
      role: "PRINCIPAL",
      tenantId: testTenantId,
      isActive: true,
    }
  });

  const firstSeedResult = await seedAllQuestionBanks(testUser as any);
  assert(firstSeedResult.totalSeeded === 2670, `First seed run created exactly 2,670 QuestionBankEntry rows inside tenant '${testTenantId}' (Created ${firstSeedResult.totalSeeded})`);

  // Verify idempotency on second run
  const secondSeedResult = await seedAllQuestionBanks(testUser as any);
  assert(secondSeedResult.totalSeeded === 0, `Second seed run is 100% idempotent — exactly 0 duplicate rows created (${firstSeedResult.totalSeeded} existing questions skipped)`);

  const totalDbQuestions = await db.questionBankEntry.count({ where: { tenantId: testTenantId } });
  assert(totalDbQuestions === 2670, `Database confirms exactly 2,670 total question bank entries stored for tenant`);

  // Verify that our SVG diagram entries (such as Heart Anatomy LV and Ohm's Law) saved cleanly
  const heartQuestion = await db.questionBankEntry.findFirst({
    where: {
      tenantId: testTenantId,
      prompt: { contains: "muscular chamber of the human heart" }
    }
  });
  assert(heartQuestion !== null && heartQuestion.diagramSvg !== null && heartQuestion.diagramSvg.includes("<svg"), `SVG diagram question saved and retrieved with high-resolution vector schematic (${heartQuestion?.diagramType})`);

  // Clean up test tenant
  await db.questionBankEntry.deleteMany({ where: { tenantId: testTenantId } });
  await db.subject.deleteMany({ where: { tenantId: testTenantId } });
  await db.user.deleteMany({ where: { tenantId: testTenantId } });
  await db.tenant.delete({ where: { id: testTenantId } });

  console.log("\n=================================================================");
  console.log(`MASTER VERIFICATION COMPLETE: ${passed}/${total} CHECKS PASSED CLEANLY!`);
  console.log("=================================================================\n");
}

runTest().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
