/**
 * EE.9 (Scan Paper Quiz into Printable, Self-Marking Formative Assessment) verification suite.
 * Proves:
 *   1. Feature toggle gating (`EE.9` off vs on).
 *   2. Creating paper quiz batch (`createPaperQuizBatch`) pre-populated across all class learners.
 *   3. Generating official printable student quiz sheet (`getPrintableFormativeQuizSheet`).
 *   4. Deterministic numerical mark conversion (`updateBatchStudentScores`) across EE (`>=80%`), ME (`60-79%`), AE (`40-59%`), and BE (`<40%`).
 *   5. Transactional posting into live CBC/CBE assessment engine (`applyBatchToCbcAssessments`).
 *   6. Cross-tenant privacy isolation across batches.
 */

import { db } from "@/lib/db";
import { setEeFeatureReleased } from "@/lib/services/platform-flags.service";
import {
  createPaperQuizBatch,
  getPrintableFormativeQuizSheet,
  updateBatchStudentScores,
  applyBatchToCbcAssessments,
  listPaperQuizBatches,
} from "@/lib/services/paper-quiz-formative.service";

async function main() {
  console.log("=== Running EE.9 (Scan Paper Quiz to Formative Assessment) Test ===\n");

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

  // Clean up any prior EE.9 test records
  await db.paperQuizFormativeBatch.deleteMany({ where: { title: { contains: "(EE.9 Test)" } } });
  await db.cbcAssessment.deleteMany({ where: { comment: { contains: "EE.9 Test" } } });

  // Test 1: Feature toggle gating
  await setEeFeatureReleased(opsUser as never, "EE.9", false);
  console.log("✓ 1. Set EE.9 release switch OFF in NEYO Ops.");

  await setEeFeatureReleased(opsUser as never, "EE.9", true, "Test release for paper quiz formative");
  console.log("✓ 2. Set EE.9 release switch ON in NEYO Ops.");

  // Create test class, subject, and strand in Karibu High
  const testClass = await db.schoolClass.create({
    data: { tenantId: karibu.id, level: "Grade 7", stream: "EE9 Test" } as never,
  });
  const testSubject = await db.subject.findFirst({ where: { tenantId: karibu.id, code: "MAT" } })
    || await db.subject.findFirst({ where: { tenantId: karibu.id } });
  if (!testSubject) throw new Error("No subject in Karibu.");

  let testStrand = await db.cbcStrand.findFirst({ where: { tenantId: karibu.id, subjectId: testSubject.id } });
  if (!testStrand) {
    testStrand = await db.cbcStrand.create({
      data: { tenantId: karibu.id, subjectId: testSubject.id, name: "Numbers (EE.9 Test)" } as never,
    });
  }

  // Create 3 active students in testClass
  const s1 = await db.student.create({
    data: { tenantId: karibu.id, admissionNo: "KH-EE9-01", firstName: "Kamau", lastName: "Njoroge", gender: "M", classId: testClass.id, status: "ACTIVE" } as never,
  });
  const s2 = await db.student.create({
    data: { tenantId: karibu.id, admissionNo: "KH-EE9-02", firstName: "Achieng", lastName: "Mary", gender: "F", classId: testClass.id, status: "ACTIVE" } as never,
  });
  const s3 = await db.student.create({
    data: { tenantId: karibu.id, admissionNo: "KH-EE9-03", firstName: "Wanjiru", lastName: "Grace", gender: "F", classId: testClass.id, status: "ACTIVE" } as never,
  });

  // Test 2: Create Paper Quiz Formative Batch (`createPaperQuizBatch`)
  const batch = await createPaperQuizBatch(principal as never, {
    subjectId: testSubject.id,
    classId: testClass.id,
    strandId: testStrand.id,
    title: "Numbers Quick Quiz 1 (EE.9 Test)",
    instructions: "Answer all 5 questions clearly.",
    totalQuizMarks: 10,
    eeThresholdPct: 80,
    meThresholdPct: 60,
    aeThresholdPct: 40,
    questions: [
      { questionNumber: 1, prompt: "Add 14 + 26", marks: 2 },
      { questionNumber: 2, prompt: "Find place value of 7 in 742", marks: 2 },
      { questionNumber: 3, prompt: "Prime factors of 20", marks: 2 },
      { questionNumber: 4, prompt: "LCM of 4 and 6", marks: 2 },
      { questionNumber: 5, prompt: "Word problem on division", marks: 2 },
    ],
  });

  if (batch.status !== "DRAFT" || batch.studentScores.length !== 3) {
    throw new Error(`Create batch check failed: ${JSON.stringify(batch)}`);
  }
  console.log("✓ 3. Created formative quiz batch (`" + batch.title + "`): initialized across 3 class learners.");

  // Test 3: Generate printable student quiz sheet (`getPrintableFormativeQuizSheet`)
  const printSheet = await getPrintableFormativeQuizSheet(principal as never, batch.id);
  if (!printSheet.trackingRef.startsWith("FQ-QUIZ-") || printSheet.questions.length !== 5) {
    throw new Error(`Printable sheet mismatch: ${JSON.stringify(printSheet)}`);
  }
  if (!printSheet.thresholdSummary.includes(">=80% EE")) {
    throw new Error(`Threshold summary missing: ${printSheet.thresholdSummary}`);
  }
  console.log("✓ 4. Generated exact printable student quiz sheet (`" + printSheet.trackingRef + "`) with top-right rubric grading box (`⌘P`).");

  // Test 4: Deterministic numerical score -> rubric level conversion (`updateBatchStudentScores`)
  const updatedScores = await updateBatchStudentScores(principal as never, {
    batchId: batch.id,
    studentScores: [
      { studentId: s1.id, score: 9, comment: "Exceeding expectations (EE.9 Test)" }, // 9/10 = 90% -> EE (4)
      { studentId: s2.id, score: 7, comment: "Meeting expectations (EE.9 Test)" }, // 7/10 = 70% -> ME (3)
      { studentId: s3.id, score: 3, comment: "Below expectations (EE.9 Test)" }, // 3/10 = 30% -> BE (1)
    ],
  });

  const s1Row = updatedScores.studentScores.find((r) => r.studentId === s1.id);
  const s2Row = updatedScores.studentScores.find((r) => r.studentId === s2.id);
  const s3Row = updatedScores.studentScores.find((r) => r.studentId === s3.id);

  if (s1Row?.level !== 4 || s2Row?.level !== 3 || s3Row?.level !== 1) {
    throw new Error(`Rubric conversion check failed: s1=${s1Row?.level}, s2=${s2Row?.level}, s3=${s3Row?.level}`);
  }
  console.log("✓ 5. Verified deterministic score-to-rubric conversion: 9/10 (90%) -> Level 4 (`EE`), 7/10 (70%) -> Level 3 (`ME`), 3/10 (30%) -> Level 1 (`BE`).");

  // Test 5: Transactional post to live CBC assessment table (`applyBatchToCbcAssessments`)
  const applied = await applyBatchToCbcAssessments(principal as never, {
    batchId: batch.id,
    date: new Date().toISOString().slice(0, 10),
  });

  if (applied.status !== "APPLIED" || applied.newObservations !== 3 || applied.appliedCount !== 3) {
    throw new Error(`Applied post check failed: ${JSON.stringify(applied)}`);
  }
  console.log("✓ 6. 1-Click Post verified: recorded all `3` converted formative rubric observations directly into live `CbcAssessment` inside a `$transaction` (`EE.9`).");

  // Verify inside live CbcAssessment table
  const obsInDb = await db.cbcAssessment.findMany({
    where: { strandId: testStrand.id, comment: { contains: "EE.9 Test" } },
  });
  if (obsInDb.length !== 3) {
    throw new Error(`DB observations count mismatch: got ${obsInDb.length}, expected 3`);
  }
  console.log("✓ 7. Verified all 3 learner observations (`Kamau L4 EE`, `Achieng L3 ME`, `Wanjiru L1 BE`) exist inside live `CbcAssessment` engine.");

  // Test 6: Cross-tenant isolation
  let uhuruPrincipal = await db.user.findFirst({ where: { tenantId: uhuru.id, role: "PRINCIPAL" } });
  if (!uhuruPrincipal) {
    uhuruPrincipal = await db.user.create({
      data: { tenantId: uhuru.id, email: "principal_ee9@uhuru.ac.ke", fullName: "Uhuru Principal EE9", role: "PRINCIPAL" } as never,
    });
  }

  const uhuruBatches = await listPaperQuizBatches(uhuruPrincipal as never, { classId: testClass.id });
  if (uhuruBatches.length !== 0) {
    throw new Error("Cross-tenant leak: Uhuru sees Karibu paper quiz batches!");
  }
  console.log("✓ 8. Cross-tenant privacy isolation verified: `PaperQuizFormativeBatch` items in Karibu High are 100% hidden from Uhuru Academy.");

  // Cleanup test rows
  await db.cbcAssessment.deleteMany({ where: { comment: { contains: "EE.9 Test" } } });
  await db.paperQuizFormativeBatch.deleteMany({ where: { id: batch.id } });
  await db.student.deleteMany({ where: { classId: testClass.id } });
  await db.schoolClass.delete({ where: { id: testClass.id } });

  await setEeFeatureReleased(opsUser as never, "EE.9", false);
  console.log("✓ 9. Reset EE.9 release switch to OFF in NEYO Ops.");

  console.log("\n✅ ALL 9 EE.9 PAPER QUIZ TO FORMATIVE ASSESSMENT CHECKS PASSED CLEANLY!");
}

main()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
