"use client";

/**
 * Offline fallback (Feature G.2, extended by Z.1). Served by the SW when a
 * page can't load. Now genuinely useful: reads the real Bundle Saver
 * snapshot from this device's own IndexedDB and shows real saved
 * students/balances/calendar/timetable with a clear "you're viewing saved
 * data from [time]" banner, instead of just a generic offline message.
 */
import { OfflineSnapshotViewer } from "@/components/offline/offline-snapshot-viewer";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-warm-100 px-4 dark:bg-navy-950">
      <OfflineSnapshotViewer />
    </div>
  );
}
