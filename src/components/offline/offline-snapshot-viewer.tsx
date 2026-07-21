"use client";

/**
 * Z.1 — Real Offline-First Resilience: the read-side fix.
 *
 * The I.84 Bundle Saver already saved a real snapshot of students, fee
 * balances, calendar and timetable to this device's IndexedDB — but until
 * now nothing in the app actually READ it back when the network was down;
 * the service worker's own "network-first" fallback just showed a generic
 * "you're offline" message with real data sitting unused right there on
 * the device. This component makes the existing `/offline` fallback page
 * genuinely useful: it reads the SAME real bundle the Bundle Saver card
 * writes, and shows students/balances/calendar/timetable with a clear,
 * honest "you're viewing saved data from [time]" banner — founder's own
 * explicit choice, so nobody ever mistakes stale data for live data.
 */
import * as React from "react";
import { WifiOff, Users, Wallet, Calendar, Clock3, RefreshCw, BookOpenCheck } from "lucide-react";
import { readBundle } from "@/lib/offline/bundle-cache";

const CACHE_KEY = "school-core";

interface BundleData {
  tenant: { name: string; slug: string; county: string | null } | null;
  capabilities?: { students: boolean; finance: boolean; calendar: boolean; timetable: boolean; cbeDelivery: boolean };
  students: { id: string; name: string; admissionNo: string; className: string; status: string }[];
  invoices: { id: string; invoiceNo: string; studentId: string; balanceKes: number; status: string; dueDate: string }[];
  calendarEvents: { id: string; title: string; date: string; type: string }[];
  timetableSlots: { id: string; classId: string; className: string; dayOfWeek: number; period: number; subjectName: string | null }[];
  notifications: { id: string; title: string; body: string; read: boolean; createdAt: string }[];
  cbeDeliverySessions?: { id: string; className: string; teacherName: string; deliveredOn: string; status: string; deliveryNotes: string | null; nextSteps: string | null; strandName: string; substrandName: string }[];
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function OfflineSnapshotViewer() {
  const [bundle, setBundle] = React.useState<BundleData | null>(null);
  const [savedAt, setSavedAt] = React.useState<string | null>(null);
  const [loaded, setLoaded] = React.useState(false);
  const [tab, setTab] = React.useState<"students" | "finance" | "calendar" | "timetable" | "cbe">("students");

  React.useEffect(() => {
    readBundle<BundleData>(CACHE_KEY)
      .then((row) => {
        if (row) {
          setBundle(row.data);
          setSavedAt(row.savedAt);
        }
      })
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded) return null;

  if (!bundle) {
    // Real, honest fallback — no saved snapshot exists on this device yet.
    return (
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
          <WifiOff className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-lg font-semibold text-navy-900 dark:text-navy-50">You&apos;re offline</h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">
          NEYO needs a connection to load this page. No saved data exists on this device yet — turn on Bundle Saver
          from the Dashboard next time you&apos;re online, and it will be available here during an outage.
        </p>
      </div>
    );
  }

  const savedLabel = savedAt
    ? new Date(savedAt).toLocaleString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : "unknown time";
  const ageHours = savedAt ? Math.max(0, Math.floor((Date.now() - new Date(savedAt).getTime()) / 3_600_000)) : null;
  const freshness = ageHours == null ? "Age unknown" : ageHours < 1 ? "Saved less than 1 hour ago" : ageHours < 24 ? `Saved ${ageHours} hours ago` : `Saved ${Math.floor(ageHours / 24)} day${Math.floor(ageHours / 24) === 1 ? "" : "s"} ago`;
  const isOld = ageHours != null && ageHours >= 24;
  const capabilities = bundle.capabilities ?? { students: true, finance: true, calendar: true, timetable: true, cbeDelivery: false };
  const availableTabs = [
    capabilities.students ? { key: "students" as const, label: `Students (${bundle.students.length})`, icon: Users } : null,
    capabilities.finance ? { key: "finance" as const, label: `Balances (${bundle.invoices.length})`, icon: Wallet } : null,
    capabilities.calendar ? { key: "calendar" as const, label: `Calendar (${bundle.calendarEvents.length})`, icon: Calendar } : null,
    capabilities.timetable ? { key: "timetable" as const, label: `Timetable (${bundle.timetableSlots.length})`, icon: Clock3 } : null,
    capabilities.cbeDelivery ? { key: "cbe" as const, label: `CBE Delivery (${bundle.cbeDeliverySessions?.length ?? 0})`, icon: BookOpenCheck } : null,
  ].filter(Boolean) as { key: "students" | "finance" | "calendar" | "timetable" | "cbe"; label: string; icon: typeof Users }[];
  const activeTab = availableTabs.some((item) => item.key === tab) ? tab : availableTabs[0]?.key;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className={`mb-5 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${isOld ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300" : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300"}`}>
        <WifiOff className="mt-0.5 h-4.5 w-4.5 shrink-0" />
        <div>
          <p className="font-semibold">You&apos;re offline — showing saved data from {savedLabel}</p>
          <p className="mt-0.5 text-xs font-bold">{freshness}{isOld ? " · Treat as old until you reconnect." : ""}</p>
          <p className="mt-0.5 text-xs opacity-90">
            {bundle.tenant?.name ?? "Your school"}&apos;s records may have changed since then. This screen never presents saved data as live.
          </p>
        </div>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto">
        {availableTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition ${
              activeTab === t.key
                ? "bg-navy-900 text-white dark:bg-white dark:text-navy-950"
                : "border border-navy-200 bg-white text-navy-600 dark:border-navy-800 dark:bg-navy-900 dark:text-navy-300"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-navy-100 bg-white dark:border-navy-800 dark:bg-navy-950">
        {activeTab === "students" && (
          <div className="divide-y divide-navy-100 dark:divide-navy-800">
            {bundle.students.length === 0 ? (
              <p className="p-6 text-center text-sm text-navy-400">No saved students.</p>
            ) : (
              bundle.students.slice(0, 200).map((s) => (
                <div key={s.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-navy-900 dark:text-navy-50">{s.name}</p>
                    <p className="text-xs text-navy-400">{s.admissionNo} · {s.className}</p>
                  </div>
                  <span className="text-xs text-navy-400">{s.status}</span>
                </div>
              ))
            )}
          </div>
        )}
        {activeTab === "finance" && (
          <div className="divide-y divide-navy-100 dark:divide-navy-800">
            {bundle.invoices.length === 0 ? (
              <p className="p-6 text-center text-sm text-navy-400">No saved balances.</p>
            ) : (
              bundle.invoices.slice(0, 200).map((i) => (
                <div key={i.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-navy-900 dark:text-navy-50">{i.invoiceNo}</p>
                    <p className="text-xs text-navy-400">Due {new Date(i.dueDate).toLocaleDateString("en-KE")}</p>
                  </div>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    KES {i.balanceKes.toLocaleString("en-KE")}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
        {activeTab === "calendar" && (
          <div className="divide-y divide-navy-100 dark:divide-navy-800">
            {bundle.calendarEvents.length === 0 ? (
              <p className="p-6 text-center text-sm text-navy-400">No saved calendar events.</p>
            ) : (
              bundle.calendarEvents.slice(0, 100).map((e) => (
                <div key={e.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <p className="font-medium text-navy-900 dark:text-navy-50">{e.title}</p>
                  <span className="text-xs text-navy-400">
                    {new Date(e.date).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
        {activeTab === "timetable" && (
          <div className="divide-y divide-navy-100 dark:divide-navy-800">
            {bundle.timetableSlots.length === 0 ? (
              <p className="p-6 text-center text-sm text-navy-400">No saved timetable.</p>
            ) : (
              bundle.timetableSlots.slice(0, 200).map((t) => (
                <div key={t.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-navy-900 dark:text-navy-50">{t.subjectName ?? "—"}</p>
                    <p className="text-xs text-navy-400">{t.className} · Period {t.period}</p>
                  </div>
                  <span className="text-xs text-navy-400">{DAY_NAMES[t.dayOfWeek] ?? t.dayOfWeek}</span>
                </div>
              ))
            )}
          </div>
        )}
        {activeTab === "cbe" && (
          <div className="divide-y divide-navy-100 dark:divide-navy-800">
            {(bundle.cbeDeliverySessions?.length ?? 0) === 0 ? (
              <p className="p-6 text-center text-sm text-navy-400">No saved CBE delivery sessions.</p>
            ) : (
              bundle.cbeDeliverySessions!.map((session) => (
                <div key={session.id} className="px-4 py-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold text-navy-900 dark:text-navy-50">{session.strandName} · {session.substrandName}</p><span className="text-xs font-bold text-green-700 dark:text-green-300">{session.status}</span></div>
                  <p className="mt-1 text-xs text-navy-400">{session.className} · {session.teacherName} · {new Date(session.deliveredOn).toLocaleDateString("en-KE")}</p>
                  {session.deliveryNotes ? <p className="mt-2 text-xs leading-5 text-navy-600 dark:text-navy-300">{session.deliveryNotes}</p> : null}
                  {session.nextSteps ? <p className="mt-1 text-xs text-blue-700 dark:text-blue-300"><strong>Next:</strong> {session.nextSteps}</p> : null}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => window.location.reload()}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-navy-200 bg-white py-2.5 text-sm font-semibold text-navy-600 dark:border-navy-800 dark:bg-navy-900 dark:text-navy-300"
      >
        <RefreshCw className="h-4 w-4" /> Try reconnecting
      </button>
    </div>
  );
}
