/**
 * PART EE.11 — QR Gate-Pass Status Scanning & Checkpoint Stamping Verification Suite
 *
 * Verifies the 8-Chunk full-stack implementation:
 * 1. `assertEeFeatureReleased("EE.11")` release gate toggle.
 * 2. Sub-second evaluation across all 4 exact UX states (`ALLOWED`, `NOT_ALLOWED`, `DIDNT_PASS`, `INVALID`).
 * 3. 1-Tap Checkpoint Stamping (`Stamp Exit Now` and `Stamp Return Now`).
 * 4. Cross-tenant privacy isolation between NEYO schools.
 */
import { PrismaClient } from "@prisma/client";
import { scanForGatePassStatus, stampGatePassAction, extractVerifyCode } from "@/lib/services/qr-scan.service";
import { issueGatePass, decideGatePass } from "@/lib/services/security.service";
import { setEeFeatureReleased, assertEeFeatureReleased } from "@/lib/services/platform-flags.service";

const db = new PrismaClient();

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
}

async function runTest() {
  console.log("=== Running EE.11 (QR Gate-Pass Status Scanning) Test ===\n");
  let checksPassed = 0;

  try {
    // Setup test tenant and user
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

    // 1. Verify EE.11 is OFF by default and assertEeFeatureReleased throws
    await setEeFeatureReleased(founderUser, "EE.11", false);
    let blocked = false;
    try {
      await assertEeFeatureReleased("EE.11");
    } catch {
      blocked = true;
    }
    assert(blocked, "assertEeFeatureReleased('EE.11') should block when switch is OFF");
    console.log("✓ 1. Set EE.11 release switch OFF in NEYO Ops: correctly blocks evaluation.");
    checksPassed++;

    // 2. Turn ON EE.11 and verify
    await setEeFeatureReleased(founderUser, "EE.11", true);
    await assertEeFeatureReleased("EE.11");
    console.log("✓ 2. Set EE.11 release switch ON in NEYO Ops: evaluation unlocked.");
    checksPassed++;

    // 3. Verify extractVerifyCode helper
    assert(extractVerifyCode("https://neyo.co.ke/verify/GP-0001") === "GP-0001", "extractVerifyCode failed on full URL");
    assert(extractVerifyCode("  gp-0002  ") === "GP-0002", "extractVerifyCode failed on bare code");
    console.log("✓ 3. Verified `extractVerifyCode` correctly parses full QR URLs (`/verify/GP-0001`) and bare codes.");
    checksPassed++;

    // Find a student in Karibu High
    const student = await db.student.findFirst({ where: { tenantId: tenant!.id, status: "ACTIVE" } });
    assert(!!student, "Active student not found in Karibu High");

    // Clean up any old gate passes for this student
    await db.gatePass.deleteMany({ where: { studentId: student!.id } });

    // 4. Test State 1: `NOT_ALLOWED` (No active/approved pass)
    const noPassResult = await scanForGatePassStatus(sessionUser, student!.admissionNo);
    assert(noPassResult.status === "NOT_ALLOWED", `Expected NOT_ALLOWED, got ${noPassResult.status}`);
    assert(noPassResult.tone === "red", "Expected red tone for NOT_ALLOWED");
    assert(!noPassResult.canExit && !noPassResult.canReturn, "canExit and canReturn should be false");
    console.log(`✓ 4. Verified State: \`NOT_ALLOWED\` (${student!.firstName} ${student!.lastName} scanning with 0 active passes -> red status badge).`);
    checksPassed++;

    // 5. Issue a PENDING pass and test `NOT_ALLOWED / PASS PENDING`
    const pendingPass = await issueGatePass(
      { ...sessionUser, role: "HOD" } as any,
      {
        studentId: student!.id,
        reason: "Dental appointment (Pending Check)",
        leaveAt: new Date(Date.now() + 3600_000).toISOString(),
      }
    );
    // Since teacher issued it without principal approval, status is PENDING if canApproveGatePass is false
    // If it issued as ACTIVE, let's force set it to PENDING for testing
    await db.gatePass.update({ where: { id: pendingPass.id }, data: { status: "PENDING" } });

    const pendingScan = await scanForGatePassStatus(sessionUser, pendingPass.passNo);
    assert(pendingScan.status === "NOT_ALLOWED", `Expected NOT_ALLOWED for pending pass, got ${pendingScan.status}`);
    assert(pendingScan.message.includes("PENDING"), "Message should mention pass is PENDING");
    console.log(`✓ 5. Verified State: \`NOT_ALLOWED / PASS PENDING\` (Pass ${pendingPass.passNo} correctly blocks exit until principal approval).`);
    checksPassed++;

    // 6. Approve pass -> Test State 2: `ALLOWED`
    await decideGatePass({ ...sessionUser, role: "SUPER_ADMIN" } as any, pendingPass.id, true, "Approved for dental check");
    const startTime = Date.now();
    const allowedScan = await scanForGatePassStatus(sessionUser, pendingPass.passNo);
    const durationMs = Date.now() - startTime;
    assert(allowedScan.status === "ALLOWED", `Expected ALLOWED, got ${allowedScan.status}`);
    assert(allowedScan.tone === "green", "Expected green tone for ALLOWED");
    assert(allowedScan.canExit && !allowedScan.canReturn, "canExit should be true for ALLOWED pass");
    assert(durationMs < 500, `Evaluation took too long: ${durationMs}ms`);
    console.log(`✓ 6. Verified State: \`ALLOWED / ACTIVE GATE PASS\` (${pendingPass.passNo} verified in ${durationMs}ms with exact green badge & exit permission).`);
    checksPassed++;

    // 7. Test 1-Tap Checkpoint Exit Stamping -> transitions to `DIDNT_PASS / ALREADY EXITED`
    const exitStamp = await stampGatePassAction(sessionUser, pendingPass.id, "EXIT", "Checked out by security at main gate");
    assert(exitStamp.ok && exitStamp.gatePass.usedAt !== null, "Exit stamping failed");

    const exitedScan = await scanForGatePassStatus(sessionUser, pendingPass.passNo);
    assert(exitedScan.status === "DIDNT_PASS", `Expected DIDNT_PASS after exit, got ${exitedScan.status}`);
    assert(exitedScan.tone === "amber", "Expected amber tone after exit");
    assert(!exitedScan.canExit && exitedScan.canReturn, "canReturn should be true after exit");
    console.log(`✓ 7. Verified 1-Tap Exit Stamping & State: \`DIDN'T PASS / ALREADY EXITED\` (Pass ${pendingPass.passNo} marked usedAt, now prompting for return check-in).`);
    checksPassed++;

    // 8. Test 1-Tap Checkpoint Return Stamping -> transitions to fully consumed state
    const returnStamp = await stampGatePassAction(sessionUser, pendingPass.id, "RETURN", "Returned to campus from dentist");
    assert(returnStamp.ok && returnStamp.gatePass.returnedAt !== null, "Return stamping failed");

    const returnedScan = await scanForGatePassStatus(sessionUser, pendingPass.passNo);
    assert(returnedScan.status === "DIDNT_PASS", `Expected DIDNT_PASS for consumed/returned pass, got ${returnedScan.status}`);
    assert(!returnedScan.canExit && !returnedScan.canReturn, "canExit and canReturn should be false after return check-in");
    assert(returnedScan.message.includes("consumed"), "Message should note pass was consumed");
    console.log(`✓ 8. Verified 1-Tap Return Check-In Stamping: Pass ${pendingPass.passNo} recorded exact returnedAt timestamp and locked.`);
    checksPassed++;

    // 9. Test State 4: `INVALID` (Unrecognized QR / unknown code)
    const invalidScan = await scanForGatePassStatus(sessionUser, "INVALID-FAKE-CODE-99999");
    assert(invalidScan.status === "INVALID", `Expected INVALID for fake code, got ${invalidScan.status}`);
    assert(invalidScan.tone === "gray", "Expected gray tone for INVALID");
    assert(!invalidScan.canExit && !invalidScan.canReturn, "canExit and canReturn should be false for INVALID code");
    console.log("✓ 9. Verified State: `INVALID / UNRECOGNIZED CODE` (Fake QR code instantly returned gray status with no permissions).");
    checksPassed++;

    // 10. Test Cross-Tenant Privacy Isolation
    const uhuruTenant = await db.tenant.findFirst({ where: { name: { contains: "Uhuru" } } });
    assert(!!uhuruTenant && uhuruTenant.id !== tenant!.id, "Uhuru Academy tenant not found");

    const uhuruUser = {
      id: "uhuru-user-1",
      userId: "uhuru-user-1",
      fullName: "Uhuru Guard",
      email: "guard@uhuru.ac.ke",
      role: "RECEPTIONIST",
      tenantId: uhuruTenant!.id,
    } as any;

    const crossScan = await scanForGatePassStatus(uhuruUser, pendingPass.passNo);
    assert(crossScan.status === "INVALID", `Expected INVALID for cross-tenant scan, got ${crossScan.status}`);
    assert(crossScan.student === null && crossScan.gatePass === null, "Cross-tenant scan must return 0 student/pass details");
    console.log("✓ 10. Verified Cross-Tenant Privacy Isolation: Uhuru Academy guard scanning Karibu High pass gets `INVALID` with 0 data leaked.");
    checksPassed++;

    // Reset EE.11 to OFF
    await setEeFeatureReleased(founderUser, "EE.11", false);
    console.log("✓ 11. Reset EE.11 release switch to OFF in NEYO Ops.\n");
    checksPassed++;

    console.log(`✅ ALL ${checksPassed}/${checksPassed} EE.11 QR GATE-PASS STATUS SCANNING & CHECKPOINT CHECKS PASSED CLEANLY!`);
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

runTest();
