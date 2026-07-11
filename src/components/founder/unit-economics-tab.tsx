"use client";

/**
 * U.2 — A Genuine Unit-Economics Dashboard. Real, live company-wide and
 * per-school revenue/cost/margin, real CAC, real (early-stage) LTV.
 */
import * as React from "react";
import {
  TrendingUp, Users, DollarSign, Save, Trash2, Loader2, RefreshCw,
  School, MessageSquare, HardDrive, AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { useToast } from "@/components/ui/toast";
import { formatKES } from "@/lib/utils";

type SubTab = "Summary" | "Per-School" | "Cost Entry" | "Cost Cockpit" | "Trends";
const SUB_TABS: SubTab[] = ["Summary", "Per-School", "Cost Entry", "Cost Cockpit", "Trends"];

function fmtDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-KE", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}
function fmtBytes(bytes: number) {
  if (bytes === 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}
function thisMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function monthBounds(key: string) {
  const [y, m] = key.split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
function SummarySection() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/ops/unit-economics?view=summary");
      const json = await res.json();
      if (json.ok) setData(json.data);
      else setError(json.error?.message || "Failed to load");
    } catch { setError("Failed to load"); } finally { setLoading(false); }
  }, []);
  React.useEffect(() => { void load(); }, [load]);

  if (loading && !data) return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div>;
  if (error) return <EmptyState icon={AlertTriangle} title="Could not load unit economics" description={error} primaryAction={{ label: "Retry", onClick: load }} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="secondary" onClick={load}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={TrendingUp} tone="green" label="Real live MRR" value={formatKES(data.mrrKes)} hint={`${formatKES(data.mrrPerSchoolKes)}/school avg`} />
        <StatCard icon={School} tone="navy" label="MRR per student" value={formatKES(data.mrrPerStudentKes)} hint="Real, computed live" />
        <StatCard icon={DollarSign} tone={data.cac.cacKes ? "amber" : "green"} label="Real CAC" value={data.cac.cacKes !== null ? formatKES(data.cac.cacKes) : "—"} hint={`${data.cac.newSignups30d} new signups (30d)`} />
      </div>

      {data.cac.note && (
        <p className="rounded-2xl border border-navy-100 bg-navy-50 p-3 text-sm text-navy-600 dark:border-navy-800 dark:bg-navy-900 dark:text-navy-300">{data.cac.note}</p>
      )}

      <Card>
        <CardHeader><CardTitle>Real, early-stage LTV (Lifetime Value)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {data.ltv.ltvKes === null ? (
            <EmptyState icon={Users} title="No real churn data yet" description={data.ltv.note} />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard icon={DollarSign} tone="green" label="LTV" value={formatKES(data.ltv.ltvKes)} />
                <StatCard icon={Users} tone="navy" label="Cancelled schools" value={String(data.ltv.cancelledSubscriptionCount)} />
                <StatCard icon={TrendingUp} tone="amber" label="Avg tenure" value={`${data.ltv.avgTenureMonths} mo`} />
              </div>
              {data.ltv.note && <p className="text-sm text-amber-600 dark:text-amber-400">{data.ltv.note}</p>}
              <p className="text-xs text-navy-400">Real historical churn rate: {data.ltv.historicalChurnRatePct}%</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Per-School
// ---------------------------------------------------------------------------
function PerSchoolSection() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/ops/unit-economics?view=schools");
      const json = await res.json();
      if (json.ok) setData(json.data);
      else setError(json.error?.message || "Failed to load");
    } catch { setError("Failed to load"); } finally { setLoading(false); }
  }, []);
  React.useEffect(() => { void load(); }, [load]);

  if (loading && !data) return <Skeleton className="h-64" />;
  if (error) return <EmptyState icon={AlertTriangle} title="Could not load per-school data" description={error} primaryAction={{ label: "Retry", onClick: load }} />;
  if (!data) return null;

  if (data.rows.length === 0) {
    return <EmptyState icon={School} title="No real schools yet" description="Per-school revenue/cost will appear here once schools sign up." />;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-navy-500 dark:text-navy-400">{data.note}</p>
      {!data.latestCostSnapshot && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
          No cost snapshot entered yet — estimated infra cost per school will show KES 0 until you add one under "Cost Entry".
        </p>
      )}
      <div className="overflow-x-auto rounded-2xl border border-navy-100 dark:border-navy-800">
        <table className="w-full text-sm">
          <thead className="bg-navy-50 text-left text-xs uppercase tracking-wide text-navy-500 dark:bg-navy-900 dark:text-navy-400">
            <tr>
              <th className="px-4 py-3">School</th>
              <th className="px-4 py-3">Revenue/mo</th>
              <th className="px-4 py-3">Students</th>
              <th className="px-4 py-3">Rev/student</th>
              <th className="px-4 py-3">SMS sent</th>
              <th className="px-4 py-3">SMS margin</th>
              <th className="px-4 py-3">Storage</th>
              <th className="px-4 py-3">Est. infra cost</th>
              <th className="px-4 py-3">Est. net margin</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r: any) => (
              <tr key={r.tenantId} className="border-t border-navy-100 dark:border-navy-800">
                <td className="px-4 py-3 font-medium text-navy-900 dark:text-navy-50">{r.name}<div className="text-xs font-normal text-navy-400">{r.planKey}</div></td>
                <td className="px-4 py-3">{formatKES(r.revenueKes)}</td>
                <td className="px-4 py-3">{r.studentCount}</td>
                <td className="px-4 py-3">{r.revenuePerStudentKes !== null ? formatKES(r.revenuePerStudentKes) : "—"}</td>
                <td className="px-4 py-3"><span className="inline-flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5 text-navy-400" />{r.smsMessageCount}</span></td>
                <td className="px-4 py-3">{formatKES(r.smsMarginKes)}</td>
                <td className="px-4 py-3"><span className="inline-flex items-center gap-1"><HardDrive className="h-3.5 w-3.5 text-navy-400" />{fmtBytes(r.storageBytes)}</span></td>
                <td className="px-4 py-3">{formatKES(r.estimatedInfraCostKes)}</td>
                <td className="px-4 py-3"><Badge tone={r.estimatedNetMarginKes >= 0 ? "green" : "red"}>{formatKES(r.estimatedNetMarginKes)}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cost Entry
// ---------------------------------------------------------------------------
function CostEntrySection() {
  const { toast } = useToast();
  const [snapshots, setSnapshots] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState(() => {
    const key = thisMonthKey();
    const { start, end } = monthBounds(key);
    return { periodKey: key, periodStart: start, periodEnd: end, infraCostKes: "0", marketingSpendKes: "0", notes: "" };
  });

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ops/unit-economics?view=cost-snapshots");
      const json = await res.json();
      if (json.ok) setSnapshots(json.data.snapshots);
    } finally { setLoading(false); }
  }, []);
  React.useEffect(() => { void load(); }, [load]);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/ops/unit-economics", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert_cost_snapshot",
          periodKey: form.periodKey, periodStart: form.periodStart, periodEnd: form.periodEnd,
          infraCostKes: Number(form.infraCostKes), marketingSpendKes: Number(form.marketingSpendKes),
          notes: form.notes,
        }),
      });
      const json = await res.json();
      if (json.ok) { toast({ title: "Cost snapshot saved", tone: "success" }); await load(); }
      else toast({ title: json.error?.message || "Failed to save", tone: "error" });
    } finally { setSaving(false); }
  }

  async function remove(id: string) {
    const res = await fetch("/api/ops/unit-economics", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_cost_snapshot", id }),
    });
    const json = await res.json();
    if (json.ok) { toast({ title: "Deleted", tone: "success" }); await load(); }
    else toast({ title: json.error?.message || "Failed", tone: "error" });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Enter this month's real cost</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div><Label>Period key</Label><Input value={form.periodKey} onChange={(e: any) => setForm((p) => ({ ...p, periodKey: e.target.value }))} /></div>
            <div><Label>Start</Label><Input type="date" value={form.periodStart} onChange={(e: any) => setForm((p) => ({ ...p, periodStart: e.target.value }))} /></div>
            <div><Label>End</Label><Input type="date" value={form.periodEnd} onChange={(e: any) => setForm((p) => ({ ...p, periodEnd: e.target.value }))} /></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label>Real infra cost (KES)</Label><Input type="number" value={form.infraCostKes} onChange={(e: any) => setForm((p) => ({ ...p, infraCostKes: e.target.value }))} /></div>
            <div><Label>Real marketing spend (KES)</Label><Input type="number" value={form.marketingSpendKes} onChange={(e: any) => setForm((p) => ({ ...p, marketingSpendKes: e.target.value }))} /></div>
          </div>
          <div><Label>Notes</Label><textarea rows={3} value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} className="w-full rounded-2xl border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-300 focus:border-navy-300 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50" /></div>
          <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save cost snapshot</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Cost snapshot history</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-32" /> : snapshots.length === 0 ? (
            <EmptyState icon={DollarSign} title="No cost snapshots yet" description="Enter your first real monthly cost to start seeing per-school allocations." />
          ) : (
            <div className="space-y-2">
              {snapshots.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-xl border border-navy-100 px-3 py-2 text-sm dark:border-navy-800">
                  <div>
                    <p className="font-medium text-navy-900 dark:text-navy-50">{s.periodKey}</p>
                    <p className="text-xs text-navy-400">Infra: {formatKES(s.infraCostKes)} · Marketing: {formatKES(s.marketingSpendKes)} · {fmtDateTime(s.createdAt)}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => remove(s.id)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cost Cockpit (U.1) — real live Vercel/Cloudflare R2/Africa's Talking data.
// ---------------------------------------------------------------------------
function ProviderCard({ title, result }: { title: string; result: any }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent>
        {!result.configured ? (
          <p className="text-sm text-navy-400">{result.error || "Not configured yet."}</p>
        ) : result.error ? (
          <p className="text-sm text-red-500">{result.error}</p>
        ) : (
          <div className="space-y-1 text-sm">
            {Object.entries(result.data || {}).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-navy-500">{k}</span>
                <span className="font-medium text-navy-900 dark:text-navy-50">{String(v)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CostCockpitSection() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/ops/cost-cockpit?view=live");
      const json = await res.json();
      if (json.ok) setData(json.data);
      else setError(json.error?.message || "Failed to load");
    } catch { setError("Failed to load"); } finally { setLoading(false); }
  }, []);
  React.useEffect(() => { void load(); }, [load]);

  if (loading && !data) return <div className="grid gap-4 sm:grid-cols-3"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div>;
  if (error) return <EmptyState icon={AlertTriangle} title="Could not load the cost cockpit" description={error} primaryAction={{ label: "Retry", onClick: load }} />;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-navy-500 dark:text-navy-400">Real, live figures from each provider's own API — honestly "not configured" until a real key exists, never a fabricated number.</p>
        <Button variant="secondary" onClick={load}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <ProviderCard title="Vercel (hosting)" result={data.vercel} />
        <ProviderCard title="Cloudflare R2 (storage)" result={data.cloudflareR2} />
        <ProviderCard title="Africa's Talking (SMS balance)" result={data.africasTalking} />
      </div>
      <p className="text-xs text-navy-400">Checked at {fmtDateTime(data.checkedAt)}. Add real credentials under NEYO Ops → Developer Center → Integration Credentials to activate any of these.</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Trends (U.1) — real chart over U.2's own NeyoCostSnapshot history.
// ---------------------------------------------------------------------------
function TrendsSection() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/ops/cost-cockpit?view=trends");
      const json = await res.json();
      if (json.ok) setData(json.data);
      else setError(json.error?.message || "Failed to load");
    } catch { setError("Failed to load"); } finally { setLoading(false); }
  }, []);
  React.useEffect(() => { void load(); }, [load]);

  if (loading && !data) return <Skeleton className="h-64" />;
  if (error) return <EmptyState icon={AlertTriangle} title="Could not load cost trends" description={error} primaryAction={{ label: "Retry", onClick: load }} />;
  if (!data) return null;

  const snapshots = data.snapshots || [];
  if (snapshots.length === 0) {
    return <EmptyState icon={TrendingUp} title="No real cost history yet" description='Enter monthly cost snapshots under "Cost Entry" to see a real trend here.' />;
  }

  const maxVal = Math.max(1, ...snapshots.map((s: any) => Math.max(s.infraCostKes, s.marketingSpendKes)));

  return (
    <div className="space-y-4">
      <p className="text-sm text-navy-500 dark:text-navy-400">Real infra + marketing cost over time, from your own entered cost snapshots.</p>
      <Card>
        <CardContent className="space-y-3 p-6">
          {snapshots.map((s: any) => (
            <div key={s.periodKey} className="space-y-1">
              <div className="flex justify-between text-xs text-navy-500">
                <span>{s.periodKey}</span>
                <span>Infra {formatKES(s.infraCostKes)} · Marketing {formatKES(s.marketingSpendKes)}</span>
              </div>
              <div className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-navy-100 dark:bg-navy-800">
                <div className="h-full bg-green-500" style={{ width: `${Math.min(100, (s.infraCostKes / maxVal) * 100)}%` }} />
                <div className="h-full bg-amber-500" style={{ width: `${Math.min(100, (s.marketingSpendKes / maxVal) * 100)}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Top-level tab
// ---------------------------------------------------------------------------
export function UnitEconomicsTab() {
  const [sub, setSub] = React.useState<SubTab>("Summary");
  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {SUB_TABS.map((t) => (
          <button key={t} onClick={() => setSub(t)} className={`rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition ${sub === t ? "bg-green-600 text-white shadow-card" : "border border-navy-200 bg-white/70 text-navy-600 hover:bg-white dark:border-navy-800 dark:bg-navy-900/60 dark:text-navy-300"}`}>{t}</button>
        ))}
      </div>
      {sub === "Summary" && <SummarySection />}
      {sub === "Per-School" && <PerSchoolSection />}
      {sub === "Cost Entry" && <CostEntrySection />}
      {sub === "Cost Cockpit" && <CostCockpitSection />}
      {sub === "Trends" && <TrendsSection />}
    </div>
  );
}

