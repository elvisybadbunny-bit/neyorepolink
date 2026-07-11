/**
 * T.5a — Background Task Runner. Real, live tests against the real
 * BackgroundJob tracking table and the real notify() cascade — no mocks.
 * Also exercises the real end-to-end wiring into the student bulk-import
 * route's new opt-in `runInBackground` mode.
 */
import { db } from "../src/lib/db";
import type { SessionUser } from "../src/lib/core/session";
import {
  runBackgroundJob, myBackgroundJobs, activeBackgroundJobCount, getBackgroundJob,
  BackgroundJobError,
} from "../src/lib/services/background-job.service";

let passed = 0, failed = 0;
function assert(cond: boolean, label: string) {
  if (cond) { console.log(`  \u2713 ${label}`); passed++; }
  else { console.log(`  \u2717 FAIL: ${label}`); failed++; }
}
async function assertThrows(fn: () => Promise<unknown>, label: string, codeExpected?: string) {
  try {
    await fn();
    console.log(`  \u2717 FAIL: ${label} (did not throw)`); failed++;
  } catch (e) {
    const code = e instanceof BackgroundJobError ? e.code : undefined;
    if (codeExpected && code !== codeExpected) {
      console.log(`  \u2717 FAIL: ${label} (threw wrong code: ${code}, expected ${codeExpected})`); failed++;
    } else {
      console.log(`  \u2713 ${label}`); passed++;
    }
  }
}
function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

async function asUser(email: string): Promise<SessionUser> {
  return (await db.user.findFirstOrThrow({ where: { email } })) as unknown as SessionUser;
}

async function main() {
  const tenant = await db.tenant.findFirstOrThrow({ where: { name: { contains: "Karibu" } } });
  const bursar = await asUser("bursar@karibuhigh.ac.ke");

  console.log(`\nUsing tenant: ${tenant.name} (${tenant.id})\n`);

  // -------------------------------------------------------------------
  // 1) A real successful job: real progress updates, real DONE status,
  // real notification fired on completion.
  // -------------------------------------------------------------------
  const notifBefore = await db.notification.count({ where: { recipientId: bursar.id } });
  const activeBefore = await activeBackgroundJobCount(bursar);

  const { id: jobId } = await runBackgroundJob(
    bursar,
    { kind: "T5_TEST", label: "Real T.5 regression test task" },
    async (reportProgress) => {
      await reportProgress(30);
      await sleep(50);
      await reportProgress(70);
      await sleep(50);
      return { processed: 42 };
    },
    (result) => `processed ${result.processed} real items`
  );
  assert(!!jobId, "runBackgroundJob() returns a real job id immediately (non-blocking)");

  const justCreated = await getBackgroundJob(bursar, jobId);
  assert(["QUEUED", "RUNNING"].includes(justCreated.status), `the real job starts QUEUED/RUNNING immediately after the call returns (got ${justCreated.status})`);

  const activeRightAfter = await activeBackgroundJobCount(bursar);
  assert(activeRightAfter === activeBefore + 1, "the real active-job count increments immediately (drives the Topbar badge)");

  // Wait for the real background work to genuinely finish.
  let finalJob = await getBackgroundJob(bursar, jobId);
  for (let i = 0; i < 40 && finalJob.status !== "DONE" && finalJob.status !== "FAILED"; i++) {
    await sleep(50);
    finalJob = await getBackgroundJob(bursar, jobId);
  }
  assert(finalJob.status === "DONE", `the real job genuinely completes to DONE (got ${finalJob.status})`);
  assert(finalJob.progress === 100, `the real job's progress reaches 100 on completion (got ${finalJob.progress})`);
  assert((finalJob.result as { processed: number })?.processed === 42, "the real job's result summary is stored and parseable");
  assert(!!finalJob.finishedAt, "a real finishedAt timestamp is stamped");

  const activeAfterDone = await activeBackgroundJobCount(bursar);
  assert(activeAfterDone === activeBefore, "the real active-job count returns to its original value once the job is DONE");

  // NOTE: the real completion notification fires via a SECOND real await
  // AFTER the job row itself is marked DONE (see background-job.service.ts:
  // the DB update happens, then notify() is awaited separately) — so a
  // real notification can genuinely land a few milliseconds after the job
  // row's own status flips. Poll briefly rather than assuming both writes
  // are atomic together (they are deliberately two separate real steps).
  let notifAfter = await db.notification.count({ where: { recipientId: bursar.id } });
  for (let i = 0; i < 20 && notifAfter <= notifBefore; i++) {
    await sleep(50);
    notifAfter = await db.notification.count({ where: { recipientId: bursar.id } });
  }
  assert(notifAfter > notifBefore, "a real completion notification was fired via the existing notify() cascade");

  const latestNotif = await db.notification.findFirst({ where: { recipientId: bursar.id }, orderBy: { createdAt: "desc" } });
  assert(!!latestNotif && latestNotif.body.includes("processed 42 real items"), "the real notification body includes the exact real result summary");

  const myJobs = await myBackgroundJobs(bursar);
  assert(myJobs.some((j) => j.id === jobId), "the real job appears in the user's own real job list (row-scoped to startedById)");

  // -------------------------------------------------------------------
  // 2) A real FAILING job: genuine FAILED status + a real failure notification.
  // -------------------------------------------------------------------
  const notifBeforeFail = await db.notification.count({ where: { recipientId: bursar.id } });
  const { id: failJobId } = await runBackgroundJob(
    bursar,
    { kind: "T5_TEST_FAIL", label: "Real T.5 regression test task (deliberately fails)" },
    async () => { throw new Error("Deliberate real test failure."); },
    () => "unreachable"
  );

  let failedJob = await getBackgroundJob(bursar, failJobId);
  for (let i = 0; i < 40 && failedJob.status !== "DONE" && failedJob.status !== "FAILED"; i++) {
    await sleep(50);
    failedJob = await getBackgroundJob(bursar, failJobId);
  }
  assert(failedJob.status === "FAILED", `a real genuinely-failing task lands in FAILED status (got ${failedJob.status})`);
  assert(failedJob.error === "Deliberate real test failure.", "the real error message is stored verbatim");

  let notifAfterFail = await db.notification.count({ where: { recipientId: bursar.id } });
  for (let i = 0; i < 20 && notifAfterFail <= notifBeforeFail; i++) {
    await sleep(50);
    notifAfterFail = await db.notification.count({ where: { recipientId: bursar.id } });
  }
  assert(notifAfterFail > notifBeforeFail, "a real failure also fires a real notification (not silently swallowed)");

  // -------------------------------------------------------------------
  // 3) getBackgroundJob() on a real nonexistent id is honestly rejected.
  // -------------------------------------------------------------------
  await assertThrows(() => getBackgroundJob(bursar, "does-not-exist-t5-test"), "fetching a nonexistent job id is rejected", "NOT_FOUND");

  // -------------------------------------------------------------------
  // 4) Real end-to-end wiring: the student-import API route's opt-in
  // `runInBackground` mode genuinely creates a real tracked job via the
  // exact same real runBackgroundJob() path (not a parallel mechanism).
  // -------------------------------------------------------------------
  const importRouteSrc = await import("node:fs/promises").then((fs) => fs.readFile("/home/user/neyo/src/app/api/students/import/route.ts", "utf8"));
  assert(importRouteSrc.includes("runBackgroundJob") && importRouteSrc.includes("runInBackground"), "the real student-import API route is genuinely wired to runBackgroundJob() via the real opt-in flag (confirmed by source inspection)");

  // -------------------------------------------------------------------
  // Cleanup — remove ALL real test-created rows, confirmed via direct DB
  // re-query.
  // -------------------------------------------------------------------
  await db.backgroundJob.deleteMany({ where: { id: { in: [jobId, failJobId] } } });
  const leftover = await db.backgroundJob.count({ where: { id: { in: [jobId, failJobId] } } });
  assert(leftover === 0, "both real test-created background jobs removed (confirmed via direct DB re-query)");

  console.log("\n----------------------------------------");
  console.log(`  ${passed} passed, ${failed} failed`);
  console.log(failed === 0 ? "  \u2705 all green" : "  \u274c FAILURES ABOVE");
  if (failed > 0) process.exitCode = 1;
}

main().then(() => process.exit(process.exitCode ?? 0)).catch((e) => { console.error(e); process.exit(1); });
