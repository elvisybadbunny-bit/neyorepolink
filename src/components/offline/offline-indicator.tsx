"use client";

import * as React from "react";
import { WifiOff, CloudUpload, AlertTriangle, X } from "lucide-react";
import { useOnline } from "@/lib/offline/use-online";
import { listFailedQueued, queueCount, removeFailedQueued, syncQueue, type FailedQueuedAction } from "@/lib/offline/queue";

/**
 * Top-bar indicator (Feature G.2): shows "Offline" when disconnected, or a
 * "N queued" pill with pending offline actions. Hidden when online & empty.
 */
export function OfflineIndicator() {
  const online = useOnline();
  const [count, setCount] = React.useState(0);
  const [failed, setFailed] = React.useState<FailedQueuedAction[]>([]);
  const [reviewOpen, setReviewOpen] = React.useState(false);

  const refresh = React.useCallback(() => {
    queueCount().then(setCount).catch(() => setCount(0));
    listFailedQueued().then(setFailed).catch(() => setFailed([]));
  }, []);

  React.useEffect(() => {
    refresh();
    window.addEventListener("neyo:queue-changed", refresh);
    window.addEventListener("neyo:queue-failed-changed", refresh);
    return () => {
      window.removeEventListener("neyo:queue-changed", refresh);
      window.removeEventListener("neyo:queue-failed-changed", refresh);
    };
  }, [refresh]);

  if (online && count === 0 && failed.length === 0) return null;

  return (
    <>
      <div className="flex items-center gap-1.5">
        {!online ? (
          <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            <WifiOff className="h-3.5 w-3.5" /> Offline{count > 0 ? ` · ${count}` : ""}
          </span>
        ) : count > 0 ? (
          <button onClick={() => syncQueue().then(refresh)} className="flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300">
            <CloudUpload className="h-3.5 w-3.5" /> Sync {count}
          </button>
        ) : null}
        {failed.length > 0 ? (
          <button onClick={() => setReviewOpen(true)} className="flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-bold text-red-700 dark:bg-red-900/40 dark:text-red-300">
            <AlertTriangle className="h-3.5 w-3.5" /> Review {failed.length}
          </button>
        ) : null}
      </div>

      {reviewOpen ? (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-navy-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setReviewOpen(false)}>
          <div className="max-h-[88dvh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-pop dark:bg-navy-900 sm:rounded-3xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div><p className="text-xs font-black uppercase tracking-wider text-red-600">Offline sync review</p><h2 className="mt-1 text-lg font-black text-navy-950 dark:text-white">Records that need your attention</h2><p className="mt-1 text-xs text-navy-500 dark:text-navy-400">NEYO did not discard these rejected actions. Refresh the source screen, correct the record and save it again.</p></div>
              <button onClick={() => setReviewOpen(false)} className="rounded-full p-2 text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-800" aria-label="Close sync review"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              {failed.map((item) => (
                <article key={item.id} className="rounded-2xl border border-red-200 bg-red-50/50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
                  <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-navy-900 dark:text-white">{item.label}</p><p className="mt-1 text-xs leading-5 text-red-700 dark:text-red-300">{item.reason}</p><p className="mt-2 text-[10px] text-navy-400">Rejected {new Date(item.failedAt).toLocaleString("en-KE")} · HTTP {item.status}</p></div><button onClick={() => removeFailedQueued(item.id).then(refresh)} className="shrink-0 rounded-full border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700 dark:border-red-800 dark:text-red-300">Dismiss</button></div>
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
