"use client";

import * as React from "react";
import { Wrench, ShieldAlert, Clock, AlertTriangle, ExternalLink, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MaintenanceWindow {
  id: string;
  title: string;
  description: string;
  scheduledStartAt: string;
  scheduledEndAt: string;
  status: string;
  isReadOnlyLock: boolean;
  isActiveNow: boolean;
}

export function PlatformMaintenanceAndDiagnosticBanner() {
  const [windowData, setWindowData] = React.useState<MaintenanceWindow | null>(null);
  const [isDiagnostic, setIsDiagnostic] = React.useState(false);
  const [subStatus, setSubStatus] = React.useState<string | null>(null);
  const [trialBannerDismissed, setTrialBannerDismissed] = React.useState(() =>
    typeof window !== "undefined" && localStorage.getItem("neyo_trial_banner_dismissed") === "true"
  );

  React.useEffect(() => {
    // Check if diagnostic impersonate token is present in document.cookie
    if (typeof document !== "undefined" && document.cookie.includes("NEYO_DIAGNOSTIC_TOKEN=")) {
      setIsDiagnostic(true);
    }

    // Check for active or upcoming maintenance windows
    fetch("/api/platform/maintenance/active")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok && j.data?.window) {
          setWindowData(j.data.window);
        }
      })
      .catch(() => {});

    // Check if user/school is currently on 30-Day Free Trial
    fetch("/api/billing")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok && j.data?.subscription?.status) {
          setSubStatus(j.data.subscription.status);
        }
      })
      .catch(() => {});
  }, []);

  if (!isDiagnostic && !windowData && subStatus !== "TRIAL") return null;

  return (
    <>
      {/* 30-Day Free Trial & Pricing Model Choice Welcome Banner */}
      {subStatus === "TRIAL" && !trialBannerDismissed && (
        <div className="sticky top-0 z-[104] flex flex-col sm:flex-row items-center justify-between gap-3 bg-green-700 px-4 py-2 text-xs font-bold text-white shadow-md animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 animate-pulse text-amber-300" />
            <span>
              ⚡ WELCOME TO YOUR 30-DAY FREE TRIAL ACROSS NEYO OS! All modules are unlocked with Platform Operations trial safety limits.
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href="/settings/billing"
              className="rounded-full bg-white px-3.5 py-1 text-[11px] font-black text-green-900 shadow-sm hover:bg-green-100 transition-transform active:scale-95"
            >
              Go to Settings → Billing to Choose Pricing Model ↗
            </a>
            <button
              type="button"
              onClick={() => {
                localStorage.setItem("neyo_trial_banner_dismissed", "true");
                setTrialBannerDismissed(true);
              }}
              className="rounded-full border border-white/40 p-1.5 text-white hover:bg-white/15"
              aria-label="Dismiss trial pricing banner"
              title="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Diagnostic Impersonation Top Banner */}
      {isDiagnostic && (
        <div className="sticky top-0 z-[110] flex items-center justify-between gap-2 bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-md animate-pulse">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>DIAGNOSTIC VIEW-AS REPLAY ACTIVE (`READ-ONLY SAFETY LOCK ON`) — All actions logged for statutory audit.</span>
          </div>
          <button
            onClick={() => {
              fetch("/api/founder-ops/impersonation", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "stop" }) })
                .finally(() => { window.location.assign("/founder"); });
            }}
            className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-amber-900 hover:bg-amber-100"
          >
            End Diagnostic Session ✕
          </button>
        </div>
      )}

      {/* Scheduled / Active Maintenance Banner */}
      {windowData && (
        <div className={`sticky top-0 z-[105] flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-2.5 text-xs font-bold shadow-md ${windowData.isActiveNow ? "bg-red-600 text-white animate-pulse" : "bg-blue-600 text-white"}`}>
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 shrink-0" />
            <span>
              {windowData.isActiveNow
                ? `⚡ MAINTENANCE ACTIVE: ${windowData.title} — ${windowData.description} (Read-only mode to preserve data integrity)`
                : `🗓 UPCOMING UPGRADE: ${windowData.title} starting ${new Date(windowData.scheduledStartAt).toLocaleString("en-KE", { dateStyle: "short", timeStyle: "short" })}.`}
            </span>
          </div>
          <span className="font-mono text-[11px] bg-white/20 px-2 py-0.5 rounded-full shrink-0">
            {windowData.isActiveNow ? "Unlocks shortly" : "Scheduled"}
          </span>
        </div>
      )}
    </>
  );
}
