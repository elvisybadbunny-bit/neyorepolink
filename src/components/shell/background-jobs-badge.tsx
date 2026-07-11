"use client";

/**
 * T.5a — Background Task Runner: real, visible Topbar indicator.
 * Polls the real `/api/background-jobs` status endpoint; shows nothing
 * when there is genuinely nothing running (no permanent chrome for a
 * feature that's idle). Clicking it opens a small panel listing the
 * user's own real recent jobs (QUEUED/RUNNING/DONE/FAILED), so a bulk
 * import/PDF batch/timetable regeneration kicked off earlier is never
 * "lost" just because the user navigated away from that page.
 */
import * as React from "react";
import { Loader2, CheckCircle2, XCircle, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface JobRow {
  id: string; kind: string; label: string; status: string; progress: number;
  result: unknown; error: string | null; startedAt: string; finishedAt: string | null;
}

export function BackgroundJobsBadge() {
  const [open, setOpen] = React.useState(false);
  const [jobs, setJobs] = React.useState<JobRow[]>([]);
  const [activeCount, setActiveCount] = React.useState(0);

  const load = React.useCallback(async () => {
    try {
      const res = await fetch("/api/background-jobs");
      const json = await res.json();
      if (json.ok) { setJobs(json.data.jobs); setActiveCount(json.data.activeCount); }
    } catch { /* silent — never breaks the shell */ }
  }, []);

  React.useEffect(() => { void load(); }, [load]);
  React.useEffect(() => {
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [load]);

  // Nothing running and no recent history worth showing — real, honest
  // "no chrome when idle" behavior, never a permanent empty badge.
  if (activeCount === 0 && jobs.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Background tasks"
        className={cn(
          "flex h-9 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold transition-colors",
          activeCount > 0
            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
            : "text-navy-500 hover:bg-navy-100 dark:text-navy-300 dark:hover:bg-navy-800"
        )}
      >
        {activeCount > 0 ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Clock className="h-3.5 w-3.5" />}
        {activeCount > 0 ? `${activeCount} task${activeCount === 1 ? "" : "s"} running` : "Tasks"}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl border border-navy-100 bg-white p-3 shadow-pop dark:border-navy-800 dark:bg-navy-900">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-navy-400">Background tasks</p>
            <button onClick={() => setOpen(false)} aria-label="Close"><X className="h-4 w-4 text-navy-400" /></button>
          </div>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {jobs.length === 0 ? (
              <p className="py-4 text-center text-xs text-navy-400">No recent tasks.</p>
            ) : jobs.map((j) => (
              <div key={j.id} className="rounded-xl border border-navy-50 p-2.5 dark:border-navy-800">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-navy-800 dark:text-navy-100">{j.label}</p>
                  {j.status === "DONE" ? <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" /> :
                    j.status === "FAILED" ? <XCircle className="h-4 w-4 shrink-0 text-red-600" /> :
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-green-600" />}
                </div>
                {(j.status === "RUNNING" || j.status === "QUEUED") && (
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-navy-100 dark:bg-navy-800">
                    <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${j.progress}%` }} />
                  </div>
                )}
                {j.status === "FAILED" && j.error && <p className="mt-1 text-[10px] text-red-600 dark:text-red-400">{j.error}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
