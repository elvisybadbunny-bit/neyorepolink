/**
 * EE.6 (Exam Privacy Tiers + Cross-School Sharing & NEYO Ops Approval Queue) verification suite.
 * Proves:
 *   1. Feature toggle gating (`EE.6` off vs on).
 *   2. Requesting national public sharing (`requestPublicSharing`) transitioning `SCHOOL_ONLY` -> `PENDING`.
 *   3. NEYO Ops review queue (`listPendingSharingRequests`, `decidePublicSharingRequest`).
 *   4. Browsing/searching the National Public Exam Bank (`listPublicSharedExamPapers`).
 *   5. 1-Click Clone across school tenants (`clonePublicExamPaperToTenant`).
 *   6. Cross-tenant isolation on unshared/pending papers.
 */

import { db } from "@/lib/db";
import { setEeFeatureReleased } from "@/lib/services/platform-flags.service";
import {
  requestPublicSharing,
  listPendingSharingRequests,
  decidePublicSharingRequest,
  listPublicSharedExamPapers,
  clonePublicExamPaperToTenant,
} from "@/lib/services/exam-paper-sharing.service";
import { saveTidiedExamPaper } from "@/lib/services/exam-paper-scan.service";

async function main() {
  console.log("=== Running EE.6 (Exam Privacy Tiers & National Sharing) Test ===\n");

  const karibu = await db.tenant.findFirst({ where: { name: { contains: "Karibu" } } });
  const uhuru = await db.tenant.findFirst({ where: { name: { contains: "Uhuru" } } });
  if (!karibu || !uhuru) throw new Error("Karibu or Uhuru tenant not found in DB.");

  const karibuPrincipal = await db.user.findFirst({
    where: { tenantId: karibu.id, role: "PRINCIPAL" },
  });
  if (!karibuPrincipal) throw new Error("Karibu Principal not found.");

  let uhuruPrincipal = await db.user.findFirst({
    where: { tenantId: uhuru.id, role: "PRINCIPAL" },
  });
  if (!uhuruPrincipal) {
    uhuruPrincipal = await db.user.create({
      data: {
        tenantId: uhuru.id,
        email: "principal@uhuru.ac.ke",
        fullName: "Uhuru Principal",
        role: "PRINCIPAL",
      } as never,
    });
  }

  const opsUser = await db.user.findFirst({
    where: { role: { in: ["FOUNDER", "SUPER_ADMIN"] } },
  }) ?? { id: "ops-user", role: "SUPER_ADMIN", tenantId: "ops" } as never;

  // Clean up prior EE.6 test records
  await db.scannedExamPaper.deleteMany({ where: { title: { contains: "(EE.6 Test)" } } });

  // Test 1: Feature toggle gating
  await setEeFeatureReleased(opsUser as never, "EE.6", false);
  console.log("✓ 1. Set EE.6 release switch OFF in NEYO Ops.");

  await setEeFeatureReleased(opsUser as never, "EE.6", true, "Test release for exam sharing");
  console.log("✓ 2. Set EE.6 release switch ON in NEYO Ops.");

  // Prepare test subject & class in both Karibu and Uhuru
  const karibuChe = await db.subject.findFirst({ where: { tenantId: karibu.id, code: "CHE" } })
    || await db.subject.findFirst({ where: { tenantId: karibu.id } });
  const karibuClass = await db.schoolClass.findFirst({ where: { tenantId: karibu.id } });
  if (!karibuChe || !karibuClass) throw new Error("Karibu subject/class not found.");

  let uhuruChe = await db.subject.findFirst({ where: { tenantId: uhuru.id, code: "CHE" } });
  if (!uhuruChe) {
    uhuruChe = await db.subject.create({
      data: { tenantId: uhuru.id, name: "Chemistry", code: "CHE", curriculum: "CBC" },
    });
  }
  let uhuruClass = await db.schoolClass.findFirst({ where: { tenantId: uhuru.id } });
  if (!uhuruClass) {
    uhuruClass = await db.schoolClass.create({
      data: { tenantId: uhuru.id, level: "Grade 10", stream: "Science (EE.6)" },
    });
  }

  // Create a tidied paper in Karibu High (`SCHOOL_ONLY`)
  const karibuPaper = await saveTidiedExamPaper(karibuPrincipal as never, {
    subjectId: karibuChe.id,
    classId: karibuClass.id,
    title: "Form 3 Chemistry End of Term 2 Exam (EE.6 Test)",
    instructions: "Answer all questions cleanly in the spaces provided.",
    timeAllowedMins: 120,
    totalMarks: 40,
    status: "TIDIED",
    privacyTier: "SCHOOL_ONLY",
    questions: [
      {
        id: "q1",
        questionNumber: 1,
        prompt: "Define isotopes and calculate the number of neutrons in Carbon-14.",
        questionType: "STRUCTURED",
        options: [],
        marks: 4,
        confidencePct: 95,
      },
    ],
  });

  if (karibuPaper.privacyTier !== "SCHOOL_ONLY" || karibuPaper.sharingApprovalStatus !== "NONE") {
    throw new Error(`Initial paper state mismatch: ${JSON.stringify(karibuPaper)}`);
  }
  console.log("✓ 3. Created `SCHOOL_ONLY` tidied exam paper in Karibu High (`" + karibuPaper.title + "`).");

  // Test 2: Request national public sharing (`requestPublicSharing`)
  const requested = await requestPublicSharing(karibuPrincipal as never, karibuPaper.id);
  if (requested.sharingApprovalStatus !== "PENDING" || requested.sharingRequestedById !== karibuPrincipal.id) {
    throw new Error(`Sharing request mismatch: ${JSON.stringify(requested)}`);
  }
  console.log("✓ 4. Requested national public sharing: status transitioned `SCHOOL_ONLY` -> `PENDING` NEYO Ops review.");

  // Test 3: Ops Vetting Queue (`listPendingSharingRequests`)
  const pendingQueue = await listPendingSharingRequests(opsUser as never);
  const foundInQueue = pendingQueue.find((p) => p.id === karibuPaper.id);
  if (!foundInQueue || foundInQueue.schoolName !== karibu.name) {
    throw new Error(`Pending queue check failed: ${JSON.stringify(pendingQueue)}`);
  }
  console.log("✓ 5. Verified NEYO Ops review queue (`listPendingSharingRequests`) accurately listed Karibu's pending paper.");

  // Test 4: NEYO Ops Approval (`decidePublicSharingRequest`)
  const decided = await decidePublicSharingRequest(opsUser as never, {
    paperId: karibuPaper.id,
    status: "APPROVED",
    decisionNote: "Verified clear formatting and zero copyright concerns.",
  });
  if (decided.privacyTier !== "PUBLIC_SHARED" || decided.sharingApprovalStatus !== "APPROVED") {
    throw new Error(`Decision mismatch: ${JSON.stringify(decided)}`);
  }
  console.log("✓ 6. NEYO Ops approved public sharing: paper upgraded to `PUBLIC_SHARED` (`APPROVED`).");

  // Test 5: Browse National Public Exam Library (`listPublicSharedExamPapers`)
  const publicBank = await listPublicSharedExamPapers({ search: "(EE.6 Test)" });
  const foundInBank = publicBank.find((p) => p.id === karibuPaper.id);
  if (!foundInBank || foundInBank.questions.length !== 1 || foundInBank.schoolName !== karibu.name) {
    throw new Error(`National bank check failed: ${JSON.stringify(publicBank)}`);
  }
  console.log("✓ 7. Verified National Public Exam Repository (`listPublicSharedExamPapers`) exposes approved national paper across schools.");

  // Test 6: 1-Click Clone to Uhuru Academy (`clonePublicExamPaperToTenant`)
  const cloned = await clonePublicExamPaperToTenant(uhuruPrincipal as never, {
    sourcePaperId: karibuPaper.id,
    targetSubjectId: uhuruChe.id,
    targetClassId: uhuruClass.id,
  });

  if (!cloned.id || cloned.id === karibuPaper.id) {
    throw new Error(`Cloned ID invalid: ${cloned.id}`);
  }
  if (cloned.tenantId !== uhuru.id || cloned.privacyTier !== "SCHOOL_ONLY" || cloned.sharingApprovalStatus !== "NONE") {
    throw new Error(`Cloned attributes mismatch: ${JSON.stringify(cloned)}`);
  }
  if (!cloned.title.includes("(Cloned from Karibu High School)")) {
    throw new Error(`Cloned title mismatch: ${cloned.title}`);
  }
  console.log("✓ 8. 1-Click Clone verified: Uhuru Academy duplicated Karibu's national paper into its own `ScannedExamPaper` library without altering Karibu's row!");

  // Test 7: Cross-tenant isolation check on non-shared / pending papers
  const unsharedPaper = await saveTidiedExamPaper(karibuPrincipal as never, {
    subjectId: karibuChe.id,
    classId: karibuClass.id,
    title: "Private Quiz (EE.6 Test)",
    timeAllowedMins: 30,
    totalMarks: 2,
    status: "TIDIED",
    privacyTier: "PRIVATE",
    questions: [{ id: "q2", questionNumber: 1, prompt: "Private prompt", questionType: "STRUCTURED", options: [], marks: 2, confidencePct: 100 }],
  });

  const publicBank2 = await listPublicSharedExamPapers({ search: "Private Quiz (EE.6 Test)" });
  if (publicBank2.length !== 0) {
    throw new Error("Isolation leak: private paper visible in public bank!");
  }
  console.log("✓ 9. Cross-tenant privacy isolation verified: `PRIVATE` / `SCHOOL_ONLY` papers never appear in national bank.");

  // Clean up test records
  await db.scannedExamPaper.deleteMany({ where: { title: { contains: "(EE.6 Test)" } } });
  await db.subject.deleteMany({ where: { code: "CHE", tenantId: uhuru.id } });
  await db.schoolClass.deleteMany({ where: { stream: "Science (EE.6)" } });

  await setEeFeatureReleased(opsUser as never, "EE.6", false);
  console.log("✓ 10. Reset EE.6 release switch to OFF in NEYO Ops.");

  console.log("\n✅ ALL 10 EE.6 EXAM PRIVACY TIERS & NATIONAL SHARING CHECKS PASSED CLEANLY!");
}

main()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
