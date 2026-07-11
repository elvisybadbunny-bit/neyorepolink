"use client";

/**
 * Y.1 — NEYO Ops "Pathway Guide" tab. Two independent on/off switches (in-app
 * vs public), an editable small unlock fee, real usage/revenue numbers and a
 * one-click KUCCPS reference-data loader. Founder's own words: "it should be
 * on but in neyo ops i can switch it off or on any moment i would like".
 */
import * as React from "react";
import { Compass, ToggleLeft, ToggleRight, Coins, Database, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

interface OpsData {
  settings: { inAppEnabled: boolean; publicEnabled: boolean; feeKes: number };
  clusters: { id: string; number: number; name: string; courses: unknown[] }[];
  sessions: { id: string; isPublic: boolean; fullName: string | null; recommendedGroup: string | null; unlocked: boolean; createdAt: string }[];
  usage: { totalSessions: number; publicSessions: number; unlockedPublicSessions: number; totalRevenueKes: number };
}

export function PathwayGuideOpsTab() {
  const { toast } = useToast();
  const [data, setData] = React.useState<OpsData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [feeInput, setFeeInput] = React.useState("");

  const load = React.useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/ops/pathway-guide");
      const json = await res.json();
      if (json.ok) { setData(json.data); setFeeInput(String(json.data.settings.feeKes)); }
      else setError(json.error?.message || "Failed to load");
    } catch { setError("Failed to load"); }
  }, []);
  React.useEffect(() => { void load(); }, [load]);

  async function post(body: Record<string, unknown>, successMsg: string) {
    setBusy(String(body.action));
    try {
      const res = await fetch("/api/ops/pathway-guide", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.ok) { toast({ title: successMsg, tone: "success" }); await load(); }
      else toast({ title: json.error?.message || "Failed", tone: "error" });
    } finally { setBusy(null); }
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-900/20">
        {error} <Button size="sm" variant="secondary" className="ml-2" onClick={() => void load()}>Retry</Button>
      </div>
    );
  }

  if (!data) {
    return <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}</div>;
  }

  const { settings, clusters, sessions, usage } = data;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Compass className="h-5 w-5 text-indigo-600" /> NEYO Pathway Guide</CardTitle>
          <p className="mt-1 text-xs text-navy-500 dark:text-navy-400">
            A real interest/skills/values/aspirations questionnaire that recommends a CBE Senior School pathway + subject combination, and shows real KUCCPS courses that combination relates to. Works free inside NEYO for real school students/parents, and separately for outsiders with no NEYO account (a small paid unlock for the full course match list).
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-2xl border border-navy-100 p-4 dark:border-navy-800">
              <div>
                <p className="text-sm font-semibold text-navy-900 dark:text-white">In-app (NEYO students/parents)</p>
                <p className="text-xs text-navy-500 dark:text-navy-400">Always free. Toggling this hides/shows the feature inside NEYO.</p>
              </div>
              <Button
                size="sm"
                variant={settings.inAppEnabled ? "primary" : "secondary"}
                disabled={busy === "set_in_app"}
                onClick={() => void post({ action: "set_in_app", enabled: !settings.inAppEnabled }, settings.inAppEnabled ? "In-app guide switched off" : "In-app guide switched on")}
              >
                {settings.inAppEnabled ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />} {settings.inAppEnabled ? "ON" : "OFF"}
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-navy-100 p-4 dark:border-navy-800">
              <div>
                <p className="text-sm font-semibold text-navy-900 dark:text-white">Public (no NEYO account)</p>
                <p className="text-xs text-navy-500 dark:text-navy-400">Toggling this hides/shows the outsider-facing page entirely.</p>
              </div>
              <Button
                size="sm"
                variant={settings.publicEnabled ? "primary" : "secondary"}
                disabled={busy === "set_public"}
                onClick={() => void post({ action: "set_public", enabled: !settings.publicEnabled }, settings.publicEnabled ? "Public guide switched off" : "Public guide switched on")}
              >
                {settings.publicEnabled ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />} {settings.publicEnabled ? "ON" : "OFF"}
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-navy-100 p-4 dark:border-navy-800">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-navy-900 dark:text-white"><Coins className="h-4 w-4 text-amber-600" /> Public unlock fee (KES)</p>
            <p className="mb-3 text-xs text-navy-500 dark:text-navy-400">The small one-time fee an outsider pays via M-Pesa STK to unlock their full matched-course report. Never charged to a real NEYO school user.</p>
            <div className="flex items-center gap-2">
              <Input type="number" min={1} max={1000} value={feeInput} onChange={(e) => setFeeInput(e.target.value)} className="w-28" />
              <Button size="sm" disabled={busy === "set_fee"} onClick={() => void post({ action: "set_fee", amountKes: Number(feeInput) }, "Fee updated")}>Save fee</Button>
              <span className="text-xs text-navy-500 dark:text-navy-400">Current: KES {settings.feeKes}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-navy-100 p-4 dark:border-navy-800">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-navy-900 dark:text-white"><Database className="h-4 w-4 text-blue-600" /> Real KUCCPS reference data</p>
            <p className="mb-3 text-xs text-navy-500 dark:text-navy-400">{clusters.length} of 20 real degree-programme clusters loaded, {clusters.reduce((sum, c) => sum + c.courses.length, 0)} courses. Safe to re-run any time — never duplicates.</p>
            <Button size="sm" variant="secondary" disabled={busy === "seed_kuccps"} onClick={() => void post({ action: "seed_kuccps" }, "KUCCPS reference data loaded")}>Load / refresh KUCCPS data</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-green-600" /> Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Total sessions" value={usage.totalSessions} />
            <Stat label="Public (outsider) sessions" value={usage.publicSessions} />
            <Stat label="Unlocked (paid)" value={usage.unlockedPublicSessions} />
            <Stat label="Revenue collected" value={`KES ${usage.totalRevenueKes.toLocaleString()}`} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-navy-600" /> Recent sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-sm text-navy-500 dark:text-navy-400">No sessions yet.</p>
          ) : (
            <div className="space-y-2">
              {sessions.slice(0, 15).map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-xl border border-navy-100 px-3 py-2 text-sm dark:border-navy-800">
                  <span className="font-medium text-navy-900 dark:text-white">{s.fullName || (s.isPublic ? "Public visitor" : "NEYO user")}</span>
                  <span className="flex items-center gap-2">
                    {s.recommendedGroup ? <Badge tone="blue">{s.recommendedGroup}</Badge> : null}
                    {s.isPublic ? <Badge tone={s.unlocked ? "green" : "neutral"}>{s.unlocked ? "Unlocked" : "Free preview"}</Badge> : <Badge tone="green">NEYO (free)</Badge>}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-navy-100 p-3 dark:border-navy-800">
      <p className="text-xs text-navy-500 dark:text-navy-400">{label}</p>
      <p className="text-lg font-bold text-navy-900 dark:text-white">{value}</p>
    </div>
  );
}
