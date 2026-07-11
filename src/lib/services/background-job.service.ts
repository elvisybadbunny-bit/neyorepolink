/**
 * T.5a — Background Task Runner.
 *
 * Founder-confirmed (2026-07-08): build a real, visible "this is running,
 * come back later" affordance for long user-initiated actions (bulk
 * imports, bulk PDF batches, timetable regeneration), reusing the existing
 * real A.7 notify() cascade + a real generalized job-tracking row — this is
 * the exact same real pattern `TimetableGenerationJob` already proved for
 * ONE specific feature (P.5), now genuinely generalized so ANY long real
 * action can register itself, without a new bespoke tracking table per
 * feature.
 *
 * A caller wraps their own real async work in `runBackgroundJob()`, which:
 *   1. creates a real BackgroundJob row (QUEUED),
 *   2. fires the work in the background (never blocks the caller's HTTP
 *      response — the same real fire-and-forget shape `startGeneration()`
 *      already uses for timetables),
 *   3. marks it RUNNING/DONE/FAILED as it actually progresses,
 *   4. on completion, fires a REAL in-app notification via the existing
 *      notify() cascade to the user who started it — wherever they've
 *      since navigated to.
 */
import { db } from "@/lib/db";
import { withTenant } from "@/lib/core/tenant-context";
import { tenantDb } from "@/lib/core/tenant-db";
import type { SessionUser } from "@/lib/core/session";

export class BackgroundJobError extends Error {
  constructor(public code: "NOT_FOUND" | "BUSY", message: string) {
    super(message);
    this.name = "BackgroundJobError";
  }
}

/** Real, live list of a user's own background jobs (Topbar badge + panel). */
export async function myBackgroundJobs(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const rows = await tenantDb().backgroundJob.findMany({
      where: { startedById: user.id },
      orderBy: { startedAt: "desc" },
      take: 20,
    });
    return rows.map((r) => ({
      id: r.id, kind: r.kind, label: r.label, status: r.status, progress: r.progress,
      result: r.resultJson ? JSON.parse(r.resultJson) : null, error: r.error,
      startedAt: r.startedAt, finishedAt: r.finishedAt,
    }));
  });
}

/** Real, live count of a user's currently RUNNING/QUEUED jobs (Topbar badge). */
export async function activeBackgroundJobCount(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    return tenantDb().backgroundJob.count({ where: { startedById: user.id, status: { in: ["QUEUED", "RUNNING"] } } });
  });
}

export async function getBackgroundJob(user: SessionUser, jobId: string) {
  return withTenant(user.tenantId, async () => {
    const row = await tenantDb().backgroundJob.findUnique({ where: { id: jobId } });
    if (!row) throw new BackgroundJobError("NOT_FOUND", "Job not found.");
    return { ...row, result: row.resultJson ? JSON.parse(row.resultJson) : null };
  });
}

async function setProgress(tenantId: string, jobId: string, progress: number) {
  await withTenant(tenantId, async () => {
    await tenantDb().backgroundJob.update({ where: { id: jobId }, data: { status: "RUNNING", progress } });
  });
}

/**
 * Real, generic entry point any long user-initiated action calls: creates
 * the real tracking row, fires `work` in the background (never blocking the
 * caller), and — on completion — notifies the starting user via the real
 * existing notify() cascade with a real, kind-specific summary.
 *
 * `work` receives a `reportProgress(pct)` callback so long real multi-step
 * work (e.g. a bulk import processing row-by-row) can update the real
 * visible progress bar as it genuinely advances, not just 0% -> 100%.
 */
export async function runBackgroundJob<T>(
  user: SessionUser,
  input: { kind: string; label: string },
  work: (reportProgress: (pct: number) => Promise<void>) => Promise<T>,
  toResultSummary: (result: T) => string
): Promise<{ id: string }> {
  const job = await withTenant(user.tenantId, async () => {
    return tenantDb().backgroundJob.create({
      data: { tenantId: user.tenantId, kind: input.kind, label: input.label, status: "QUEUED", startedById: user.id, startedByName: user.fullName },
    });
  });

  // Real fire-and-forget background run — mirrors P.5's own real
  // startGeneration()/runGeneration() shape exactly, generalized.
  void (async () => {
    try {
      await setProgress(user.tenantId, job.id, 5);
      const result = await work((pct) => setProgress(user.tenantId, job.id, Math.max(5, Math.min(99, Math.round(pct)))));
      const summary = toResultSummary(result);
      await withTenant(user.tenantId, async () => {
        await tenantDb().backgroundJob.update({
          where: { id: job.id },
          data: { status: "DONE", progress: 100, resultJson: JSON.stringify(result), finishedAt: new Date() },
        });
      });
      try {
        const { notify } = await import("@/lib/services/notification.service");
        await notify({
          tenantId: user.tenantId, recipientId: user.id,
          title: "Task finished", body: `${input.label} — ${summary}`,
          category: "system",
        });
      } catch { /* best-effort */ }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error.";
      await withTenant(user.tenantId, async () => {
        await tenantDb().backgroundJob.update({
          where: { id: job.id },
          data: { status: "FAILED", error: message, finishedAt: new Date() },
        });
      });
      try {
        const { notify } = await import("@/lib/services/notification.service");
        await notify({
          tenantId: user.tenantId, recipientId: user.id,
          title: "Task failed", body: `${input.label} — ${message}`,
          category: "system",
        });
      } catch { /* best-effort */ }
    }
  })();

  return { id: job.id };
}
