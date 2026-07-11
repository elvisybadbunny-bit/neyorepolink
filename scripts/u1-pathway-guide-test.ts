/**
 * U.1 — NEYO Pathway Guide (Career & Subject Selection Guidance) regression
 * test. Founder request 2026-07-09: NEYO version of EduPoa's Career Compass,
 * with a correction the SAME day: no KCSE-style grade entry (CBE uses
 * BE/AE/ME/EE) — course matching is purely by real subject combination.
 * Covers: in-app free flow, public free-glimpse + paid-unlock flow, Ops
 * flags/fee, KUCCPS seeding idempotency, and row-scoping/security guards.
 */
import { db } from "../src/lib/db";
import type { SessionUser } from "../src/lib/core/session";
import {
  isPathwayGuideInAppEnabled,
  isPathwayGuidePublicEnabled,
  getPathwayGuideFeeKes,
  setPathwayGuideInAppEnabled,
  setPathwayGuidePublicEnabled,
  setPathwayGuideFeeKes,
  startGuideSession,
  submitGuideAnswers,
  getKuccpsGlimpse,
  getFullMatchedCourses,
  matchKuccpsCoursesForSubjects,
  seedKuccpsClusters,
  listKuccpsClusters,
  startGuidePayment,
  handleGuidePaymentCallback,
  getGuidePaymentStatus,
  myGuideSessionsForStudent,
  guideUsageSummary,
  PathwayGuideError,
} from "../src/lib/services/pathway-guide.service";

let passed = 0, failed = 0;
function assert(cond: boolean, label: string) {
  if (cond) { console.log(`  \u2713 ${label}`); passed++; }
  else { console.log(`  \u2717 FAIL: ${label}`); failed++; }
}
async function assertThrows(fn: () => Promise<unknown>, label: string) {
  try { await fn(); console.log(`  \u2717 FAIL: ${label} (did not throw)`); failed++; }
  catch { console.log(`  \u2713 ${label}`); passed++; }
}

async function asUser(email: string): Promise<SessionUser> {
  return (await db.user.findFirstOrThrow({ where: { email } })) as unknown as SessionUser;
}

async function main() {
  const tenant = await db.tenant.findFirstOrThrow({ where: { name: { contains: "Karibu" } } });
  const superAdmin = await asUser("founder@neyo.co.ke");
  const parent = await asUser("parent@karibuhigh.ac.ke");
  const student = await db.student.findFirstOrThrow({ where: { tenantId: tenant.id, admissionNo: "KHS1" } });

  console.log(`\nUsing tenant: ${tenant.name} (${tenant.id})\n`);

  // -------------------------------------------------------------------
  // 1) Ops flags default ON, fee defaults to 10, both independently settable.
  // -------------------------------------------------------------------
  assert(await isPathwayGuideInAppEnabled(), "in-app flag defaults ON with no PlatformSetting row");
  assert(await isPathwayGuidePublicEnabled(), "public flag defaults ON with no PlatformSetting row");
  const defaultFee = await getPathwayGuideFeeKes();
  assert(defaultFee === 10, `default fee is KES 10 (got ${defaultFee})`);

  await setPathwayGuideFeeKes(superAdmin, 15);
  assert((await getPathwayGuideFeeKes()) === 15, "fee is genuinely editable by NEYO Ops (now KES 15)");
  await assertThrows(() => setPathwayGuideFeeKes(superAdmin, 0), "fee of 0 is rejected");
  await assertThrows(() => setPathwayGuideFeeKes(superAdmin, 5000), "fee above 1000 is rejected");

  await setPathwayGuidePublicEnabled(superAdmin, false);
  assert(!(await isPathwayGuidePublicEnabled()), "public flag can be switched OFF independently");
  await setPathwayGuidePublicEnabled(superAdmin, true);
  assert(await isPathwayGuidePublicEnabled(), "public flag can be switched back ON independently");
  assert(await isPathwayGuideInAppEnabled(), "in-app flag was untouched while toggling the public flag (independent switches)");

  // -------------------------------------------------------------------
  // 2) Real KUCCPS reference data seeds idempotently (20 real clusters).
  // -------------------------------------------------------------------
  const seed1 = await seedKuccpsClusters(superAdmin);
  assert(seed1.clusters === 20, `all 20 real KUCCPS clusters are in the seed data (got ${seed1.clusters})`);
  const clustersAfterFirst = await listKuccpsClusters();
  assert(clustersAfterFirst.length === 20, "exactly 20 real clusters exist in the DB after seeding");
  const totalCoursesFirst = clustersAfterFirst.reduce((sum, c) => sum + c.courses.length, 0);
  assert(totalCoursesFirst > 40, `a genuinely large real course catalog exists (${totalCoursesFirst} courses)`);

  const seed2 = await seedKuccpsClusters(superAdmin);
  assert(seed2.coursesCreated === 0, "re-seeding creates ZERO new courses (idempotent)");
  const clustersAfterSecond = await listKuccpsClusters();
  assert(clustersAfterSecond.length === 20, "still exactly 20 clusters after re-seeding (no duplicates)");
  const totalCoursesSecond = clustersAfterSecond.reduce((sum, c) => sum + c.courses.length, 0);
  assert(totalCoursesSecond === totalCoursesFirst, "course count unchanged after re-seeding (no duplicates)");

  // -------------------------------------------------------------------
  // 3) NO grade-entry step anywhere — course matching is purely by subject
  // combination (the founder's own correction: CBE uses BE/AE/ME/EE, not
  // KCSE letters, so this feature must never ask for a grade).
  // -------------------------------------------------------------------
  const mathPhysicsChemistry = await matchKuccpsCoursesForSubjects(["MAT", "PHY", "CHE"]);
  assert(mathPhysicsChemistry.length > 0, "a real STEM subject combination (Math/Physics/Chemistry) matches real courses");
  assert(mathPhysicsChemistry.some((c) => c.courseName.includes("Engineering")), "Math/Physics/Chemistry genuinely matches real Engineering courses");
  assert(mathPhysicsChemistry.some((c) => c.courseName.includes("Medicine") || c.courseName.includes("Clinical")), "Math/Physics/Chemistry genuinely matches real Medicine-cluster courses (Biology is compulsory-core-adjacent but Chem/Math/Phy alone still relates)");
  const noMatchCombo = await matchKuccpsCoursesForSubjects([]);
  assert(noMatchCombo.length > 0, "even an empty elective combination still matches SOME courses (via the compulsory ENG/KIS/MAT core)");

  // -------------------------------------------------------------------
  // 4) In-app (logged-in NEYO) session: always free/unlocked immediately.
  // -------------------------------------------------------------------
  const inAppSession = await startGuideSession({ tenantId: tenant.id, studentId: student.id, isPublic: false, fullName: "Achieng Mary Otieno" });
  assert(inAppSession.unlocked === true, "an in-app (NEYO school) session is unlocked immediately, no payment ever required");
  assert(inAppSession.tenantId === tenant.id, "in-app session carries the real tenantId");
  assert(inAppSession.studentId === student.id, "in-app session is linked to the real Student");

  const stemAnswers = [
    { questionId: "int_1", optionId: "sci" },
    { questionId: "int_2", optionId: "build" },
    { questionId: "skl_1", optionId: "math" },
    { questionId: "skl_2", optionId: "logic" },
    { questionId: "val_1", optionId: "impact_health" },
    { questionId: "asp_1", optionId: "engineer" },
  ];
  const afterAnswers = await submitGuideAnswers({ sessionId: inAppSession.id, answers: stemAnswers });
  assert(afterAnswers.recommendedGroup === "STEM", `heavily-STEM-signalling answers recommend the real STEM group (got ${afterAnswers.recommendedGroup})`);
  assert(Boolean(afterAnswers.recommendedTrack), "a real official KICD track is recommended alongside the group");
  const recommendedSubjects = JSON.parse(afterAnswers.recommendedSubjectsJson);
  assert(Array.isArray(recommendedSubjects) && recommendedSubjects.length > 0, "a real recommended subject combination (from the official KICD taxonomy) is returned");
  assert(!("gradesJson" in afterAnswers) && !("meanGrade" in afterAnswers), "the session row has NO grade-entry fields at all (founder correction honoured)");

  const inAppMatched = await getFullMatchedCourses(inAppSession.id);
  assert(inAppMatched.length > 0, "a logged-in NEYO session can see the FULL matched-course list with zero payment");

  const parentView = await myGuideSessionsForStudent(parent, student.id);
  assert(parentView.some((s) => s.id === inAppSession.id), "the parent can see their real child's guide session via the row-scoped lookup");

  // A genuinely unrelated parent (own guardian record, no link to this real
  // student) must NOT be able to read this student's guide sessions — a real
  // disposable stranger user, same pattern as T.14's own row-scoping test
  // (never reuse an unrestricted staff role like BURSAR here, which would
  // give a false-negative since scopeWhere() intentionally leaves staff
  // roles unrestricted).
  const strangerGuardian = await db.guardian.create({ data: { tenantId: tenant.id, fullName: "U1 Stranger Guardian (disposable)", phone: "0700999777" } });
  const strangerUser = await db.user.create({
    data: {
      tenantId: tenant.id, neyoLoginId: `U1STRANGER${Date.now()}`, fullName: "U1 Stranger Guardian (disposable)",
      email: `u1-stranger-${Date.now()}@example.test`, role: "PARENT", isActive: true, passwordHash: "x",
    },
  });
  await db.guardian.update({ where: { id: strangerGuardian.id }, data: { userId: strangerUser.id } });
  const strangerParent = strangerUser as unknown as SessionUser;

  await assertThrows(
    () => myGuideSessionsForStudent(strangerParent, student.id),
    "a real UNRELATED parent (no guardian link to this student) cannot read this family's guide sessions (row-scoped)"
  );

  // Cleanup the disposable stranger immediately.
  await db.user.delete({ where: { id: strangerUser.id } });
  await db.guardian.delete({ where: { id: strangerGuardian.id } });
  const strangerGone = await db.user.count({ where: { id: strangerUser.id } });
  assert(strangerGone === 0, "the disposable stranger test user was cleaned up and confirmed removed");

  // -------------------------------------------------------------------
  // 5) Public (no NEYO account) session: free glimpse, but full match list
  // is genuinely payment-gated.
  // -------------------------------------------------------------------
  const publicSession = await startGuideSession({ isPublic: true, fullName: "Wanjiku Kariuki", phone: "0712345678" });
  assert(publicSession.unlocked === false, "a public outsider session starts LOCKED (not free)");
  assert(publicSession.tenantId === null, "a public session has no tenantId (genuine outsider, no NEYO account)");

  await submitGuideAnswers({ sessionId: publicSession.id, answers: stemAnswers });
  const glimpse = await getKuccpsGlimpse(publicSession.id);
  assert(glimpse.length > 0, "a public outsider gets a real free glimpse of related KUCCPS clusters");
  assert(glimpse.length <= 3, `the free glimpse is genuinely limited (not the full list) — got ${glimpse.length} clusters`);

  await assertThrows(
    () => getFullMatchedCourses(publicSession.id),
    "an UNPAID public session cannot see the full matched-course list (PAYMENT_REQUIRED)"
  );

  // -------------------------------------------------------------------
  // 6) Real M-Pesa STK unlock flow (mock provider in dev), single-use.
  // -------------------------------------------------------------------
  const paymentStart = await startGuidePayment({ sessionId: publicSession.id, phone: "0712345678" });
  assert(Boolean(paymentStart.checkoutRequestId), "starting the unlock payment returns a real checkoutRequestId (mock STK)");
  assert(paymentStart.amountKes === 15, `the STK amount matches the current NEYO-Ops-set fee (got ${paymentStart.amountKes})`);

  const statusBeforePay = await getGuidePaymentStatus(publicSession.id);
  assert(statusBeforePay.unlocked === false && statusBeforePay.status === "PENDING", "payment status is PENDING/locked before the callback fires");

  const callbackResult = await handleGuidePaymentCallback({ checkoutRequestId: paymentStart.checkoutRequestId, success: true, mpesaRef: `MOCKU1${Date.now()}` });
  assert(callbackResult.paid === true, "the mock M-Pesa callback marks the payment PAID");

  const statusAfterPay = await getGuidePaymentStatus(publicSession.id);
  assert(statusAfterPay.unlocked === true, "the session is genuinely unlocked after a real successful payment callback");

  const unlockedMatch = await getFullMatchedCourses(publicSession.id);
  assert(unlockedMatch.length > 0, "after unlocking, the public outsider can see the FULL matched-course list");
  assert(unlockedMatch.some((c) => c.fullyMatches), "at least one course FULLY matches the recommended STEM subject combination");

  // A second payment attempt on an already-unlocked session must be rejected.
  await assertThrows(
    () => startGuidePayment({ sessionId: publicSession.id, phone: "0712345678" }),
    "cannot start a second payment on an already-unlocked session"
  );

  // A duplicate callback (double-processing) must be a safe no-op, never a double-charge/double-unlock error.
  const duplicateCallback = await handleGuidePaymentCallback({ checkoutRequestId: paymentStart.checkoutRequestId, success: true, mpesaRef: "DUPLICATE" });
  assert(duplicateCallback.alreadyProcessed === true, "a duplicate M-Pesa callback for the same payment is a safe idempotent no-op");

  // -------------------------------------------------------------------
  // 7) A logged-in NEYO user attempting to "pay" is rejected (already free).
  // -------------------------------------------------------------------
  await assertThrows(
    () => startGuidePayment({ sessionId: inAppSession.id, phone: "0700000000" }),
    "a logged-in NEYO session cannot be charged (already free — rejected as INVALID)"
  );

  // -------------------------------------------------------------------
  // 8) Real usage summary reflects the sessions/payments created here.
  // -------------------------------------------------------------------
  const usage = await guideUsageSummary();
  assert(usage.totalSessions >= 2, `usage summary counts real sessions (got ${usage.totalSessions})`);
  assert(usage.publicSessions >= 1, "usage summary counts real public sessions");
  assert(usage.unlockedPublicSessions >= 1, "usage summary counts real unlocked public sessions");
  assert(usage.totalRevenueKes >= 15, `usage summary reflects real collected revenue (got KES ${usage.totalRevenueKes})`);

  // -------------------------------------------------------------------
  // 9) Restore the fee to its original default so this test never leaves a
  // permanent side effect on NEYO Ops settings for future sessions/tests.
  // -------------------------------------------------------------------
  await setPathwayGuideFeeKes(superAdmin, 10);
  assert((await getPathwayGuideFeeKes()) === 10, "fee restored to KES 10 after the test (no permanent side effect)");

  // -------------------------------------------------------------------
  // Cleanup: remove every real row this test created, confirm removal.
  // -------------------------------------------------------------------
  await db.pathwayGuideSession.deleteMany({ where: { id: { in: [inAppSession.id, publicSession.id] } } });
  await db.pathwayGuidePayment.deleteMany({ where: { id: paymentStart.payment.id } });
  const remainingSessions = await db.pathwayGuideSession.count({ where: { id: { in: [inAppSession.id, publicSession.id] } } });
  const remainingPayments = await db.pathwayGuidePayment.count({ where: { id: paymentStart.payment.id } });
  assert(remainingSessions === 0, "all real test sessions were cleaned up and confirmed removed via direct DB re-query");
  assert(remainingPayments === 0, "the real test payment was cleaned up and confirmed removed via direct DB re-query");

  console.log(`\n${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
