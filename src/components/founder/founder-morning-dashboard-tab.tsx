"use client";

/**
 * U.3 — Founder Morning Dashboard: Platform Operations as "The Operating System for
 * Running NEYO Itself." Four real pieces in one place: the morning
 * snapshot, "Ask Bundi" (internal-only, honestly gated), Product Analytics
 * (DAU/WAU + module adoption), and Compliance (export/deletion queue).
 */
import * as React from "react";
import {
  Sun, TrendingUp, Users, AlertTriangle, ServerCog, Sparkles,
  BarChart3, ShieldCheck, Send, Loader2, RefreshCw, CheckCircle2, XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { useToast } from "@/components/ui/toast";
import { formatKES } from "@/lib/utils";

type SubTab = "Morning Dashboard" | "Ask Bundi" | "Product Analytics" | "Compliance";
const SUB_TABS: SubTab[] = ["Morning Dashboard", "Ask Bundi", "Product Analytics", "Compliance"];

function fmtDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

// ---------------------------------------------------------------------------
// Morning Dashboard
// ---------------------------------------------------------------------------
function MorningDashboardSection() {
  const [data, setData] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/ops/founder-dashboard");
      const json = await res.json();
      if (json.ok) setData(json.data);
      else setError(json.error?.message || "Failed to load");
    } catch { setError("Failed to load"); } finally { setLoading(false); }
  }, []);
  React.useEffect(() => { void load(); }, [load]);

  if (loading && !data) {
    return <div className="space-y-4"><Skeleton className="h-24" /><div className="grid gap-4 sm:grid-cols-3"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div></div>;
  }
  if (error) {
    return <EmptyState icon={AlertTriangle} title="Could not load the dashboard" description={error} primaryAction={{ label: "Retry", onClick: load }} />;
  }
  if (!data) return null;

  const health = data.systemHealth;
  const healthTone = health.status === "operational" ? "green" : health.status === "degraded" ? "amber" : "red";

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-navy-950">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <Sun className="h-6 w-6 text-amber-500" />
            <div>
              <p className="text-xl font-semibold tracking-tight text-navy-900 dark:text-navy-50">{data.greeting}, Founder.</p>
              <p className="text-sm text-navy-500 dark:text-navy-400">Here is real NEYO, right now — {fmtDateTime(data.generatedAt)}.</p>
            </div>
          </div>
          <Button variant="secondary" onClick={load}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={TrendingUp} tone="green" label="Real live MRR" value={formatKES(data.revenue.mrrKes)} hint={data.revenue.latestSnapshotPeriodKey ? `Last manual snapshot: ${formatKES(data.revenue.latestSnapshotMrrKes || 0)} (${data.revenue.latestSnapshotPeriodKey})` : "No manual snapshot logged yet"} />
        <StatCard icon={Users} tone="navy" label="Active schools" value={String(data.schools.active)} hint={`${data.schools.paying} paying • ${data.schools.trial} on free Karibu`} />
        <StatCard icon={AlertTriangle} tone={data.schools.churnRisk > 0 ? "red" : "green"} label="Churn-risk schools" value={String(data.schools.churnRisk)} hint={`${data.schools.inGrace} in grace • ${data.schools.suspended} suspended`} />
        <StatCard icon={Sparkles} tone="green" label="New signups" value={String(data.newSignups.last7Days)} hint={`Last 7 days • ${data.newSignups.last30Days} in last 30 days`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500" />Failed payments (last 14 days)</CardTitle></CardHeader>
          <CardContent>
            {data.failedPayments.length === 0 ? (
              <p className="py-6 text-center text-sm text-navy-400">No failed payments — real, clean state.</p>
            ) : (
              <div className="space-y-2">
                {data.failedPayments.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between rounded-xl border border-navy-100 px-3 py-2 text-sm dark:border-navy-800">
                    <div>
                      <p className="font-medium text-navy-900 dark:text-navy-50">{p.tenantName}</p>
                      <p className="text-xs text-navy-400">{p.resultDesc || "No reason recorded"} · {fmtDateTime(p.createdAt)}</p>
                    </div>
                    <Badge tone="red">{formatKES(p.amount)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ServerCog className="h-4 w-4" />Real system health</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Badge tone={healthTone as any}>{health.status.toUpperCase()}</Badge>
            {health.checks.map((c: any) => (
              <div key={c.name} className="flex items-center justify-between border-b border-navy-100 py-2 text-sm last:border-0 dark:border-navy-800">
                <span className="text-navy-600 dark:text-navy-300">{c.name}</span>
                <Badge tone={c.status === "operational" ? "green" : c.status === "not_configured" ? "neutral" : "red"}>{c.status.replace("_", " ")}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ask Bundi (Founder AI)
// ---------------------------------------------------------------------------
function AskBundiSection() {
  const { toast } = useToast();
  const [history, setHistory] = React.useState<any[]>([]);
  const [question, setQuestion] = React.useState("");
  const [asking, setAsking] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ops/ask-bundi");
      const json = await res.json();
      if (json.ok) setHistory(json.data.history);
    } finally { setLoading(false); }
  }, []);
  React.useEffect(() => { void load(); }, [load]);

  async function ask() {
    if (question.trim().length < 3) {
      toast({ title: "Ask a real question (at least 3 characters)", tone: "error" });
      return;
    }
    setAsking(true);
    try {
      const res = await fetch("/api/ops/ask-bundi", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const json = await res.json();
      if (json.ok) {
        setQuestion("");
        await load();
        if (json.data.status === "NOT_CONFIGURED") {
          toast({ title: "Ask Bundi isn't configured yet — showing the real company data instead", tone: "info" });
        } else {
          toast({ title: "Answered", tone: "success" });
        }
      } else {
        toast({ title: json.error?.message || "Could not ask Bundi", tone: "error" });
      }
    } finally { setAsking(false); }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-green-600" />Ask Bundi</CardTitle>
          <p className="text-sm text-navy-500 dark:text-navy-400">
            Internal-only — never customer-facing. Bundi always shows you the real live NEYO numbers behind every question, whether or not a provider is configured yet.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input placeholder='e.g. "Why did revenue drop this month?"' value={question} onChange={(e: any) => setQuestion(e.target.value)} onKeyDown={(e: any) => { if (e.key === "Enter") void ask(); }} />
            <Button onClick={ask} disabled={asking}>{asking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}<span className="ml-2">Ask</span></Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent questions</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-24" /> : history.length === 0 ? (
            <EmptyState icon={Sparkles} title="No questions asked yet" description='Ask Bundi something real, like "how many schools are at churn risk right now?"' />
          ) : (
            <div className="space-y-4">
              {history.map((h) => (
                <div key={h.id} className="rounded-2xl border border-navy-100 p-4 dark:border-navy-800">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-navy-900 dark:text-navy-50">{h.question}</p>
                    <Badge tone={h.status === "ANSWERED" ? "green" : h.status === "ERROR" ? "red" : "neutral"}>{h.status.replace("_", " ")}</Badge>
                  </div>
                  {h.status === "ANSWERED" ? (
                    <p className="mt-2 text-sm text-navy-600 dark:text-navy-300">{h.answer}</p>
                  ) : (
                    <div className="mt-2 rounded-xl bg-navy-50 p-3 text-xs text-navy-600 dark:bg-navy-900 dark:text-navy-300">
                      <p className="mb-2 font-medium">Real company data (no provider configured yet):</p>
                      <ul className="space-y-0.5">
                        <li>MRR: {formatKES(h.context?.dashboard?.revenue?.mrrKes ?? 0)}</li>
                        <li>Active schools: {h.context?.dashboard?.schools?.active ?? 0} · Churn-risk: {h.context?.dashboard?.schools?.churnRisk ?? 0}</li>
                        <li>New signups (7d): {h.context?.dashboard?.newSignups?.last7Days ?? 0}</li>
                        <li>DAU/WAU: {h.context?.analytics?.dau ?? 0} / {h.context?.analytics?.wau ?? 0}</li>
                        <li>Pending compliance requests: {h.context?.pendingComplianceRequests ?? 0}</li>
                      </ul>
                    </div>
                  )}
                  <p className="mt-2 text-xs text-navy-400">{h.askedByName} · {fmtDateTime(h.createdAt)}</p>
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
// Product Analytics
// ---------------------------------------------------------------------------
function ProductAnalyticsSection() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/ops/product-analytics");
      const json = await res.json();
      if (json.ok) setData(json.data);
      else setError(json.error?.message || "Failed to load");
    } catch { setError("Failed to load"); } finally { setLoading(false); }
  }, []);
  React.useEffect(() => { void load(); }, [load]);

  if (loading && !data) return <Skeleton className="h-64" />;
  if (error) return <EmptyState icon={AlertTriangle} title="Could not load analytics" description={error} primaryAction={{ label: "Retry", onClick: load }} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <p className="text-sm text-navy-500 dark:text-navy-400">{data.definition}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} tone="green" label="DAU (users)" value={String(data.dau)} hint={`${data.dauSchools} real schools active today`} />
        <StatCard icon={Users} tone="green" label="WAU (users)" value={String(data.wau)} hint={`${data.wauSchools} real schools active this week`} />
        <StatCard icon={BarChart3} tone="navy" label="Total schools" value={String(data.totalSchools)} />
        <StatCard icon={TrendingUp} tone="amber" label="Top module adoption" value={data.moduleAdoption[0] ? `${data.moduleAdoption[0].adoptionPct}%` : "—"} hint={data.moduleAdoption[0]?.label} />
      </div>
      <Card>
        <CardHeader><CardTitle>Module adoption</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {data.moduleAdoption.map((m: any) => (
            <div key={m.key} className="flex items-center gap-3">
              <span className="w-40 shrink-0 truncate text-sm text-navy-700 dark:text-navy-300">{m.label}{m.core ? <Badge tone="neutral" className="ml-2">core</Badge> : null}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-navy-100 dark:bg-navy-800">
                <div className="h-full rounded-full bg-green-500" style={{ width: `${Math.min(100, m.adoptionPct)}%` }} />
              </div>
              <span className="w-16 shrink-0 text-right text-sm text-navy-500">{m.adoptionPct}%</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compliance
// ---------------------------------------------------------------------------
function ComplianceSection() {
  const { toast } = useToast();
  const [requests, setRequests] = React.useState<any[]>([]);
  const [statusFilter, setStatusFilter] = React.useState<string>("PENDING");
  const [loading, setLoading] = React.useState(true);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ops/compliance?status=${statusFilter}`);
      const json = await res.json();
      if (json.ok) setRequests(json.data.requests);
    } finally { setLoading(false); }
  }, [statusFilter]);
  React.useEffect(() => { void load(); }, [load]);

  async function resolve(id: string, status: "ACKNOWLEDGED" | "COMPLETED" | "DECLINED") {
    setBusyId(id);
    try {
      const res = await fetch("/api/ops/compliance", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resolve", id, status }),
      });
      const json = await res.json();
      if (json.ok) { toast({ title: "Updated", tone: "success" }); await load(); }
      else toast({ title: json.error?.message || "Failed", tone: "error" });
    } finally { setBusyId(null); }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {["PENDING", "ACKNOWLEDGED", "COMPLETED", "DECLINED", "ALL"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusFilter === s ? "bg-navy-900 text-white dark:bg-white dark:text-navy-950" : "border border-navy-200 text-navy-600 dark:border-navy-800 dark:text-navy-300"}`}>{s}</button>
        ))}
      </div>
      {loading ? <Skeleton className="h-40" /> : requests.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No requests here" description="Every school's real data-export event and any deletion requests will appear here." />
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-navy-900 dark:text-navy-50">{r.tenantName}</p>
                  <p className="text-xs text-navy-500">{r.kind === "EXPORT_DATA" ? "Exported their own data" : "Requested account deletion"} · {r.requestedByName} ({r.requestedByRole}) · {fmtDateTime(r.createdAt)}</p>
                  {r.note ? <p className="mt-1 text-sm text-navy-600 dark:text-navy-300">"{r.note}"</p> : null}
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={r.status === "PENDING" ? "amber" : r.status === "COMPLETED" ? "green" : r.status === "DECLINED" ? "red" : "blue"}>{r.status}</Badge>
                  {r.status === "PENDING" && r.kind === "DELETE_ACCOUNT" && (
                    <>
                      <Button size="sm" variant="secondary" disabled={busyId === r.id} onClick={() => resolve(r.id, "ACKNOWLEDGED")}><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Acknowledge</Button>
                      <Button size="sm" variant="danger" disabled={busyId === r.id} onClick={() => resolve(r.id, "DECLINED")}><XCircle className="mr-1 h-3.5 w-3.5" />Decline</Button>
                    </>
                  )}
                  {r.status === "ACKNOWLEDGED" && (
                    <Button size="sm" onClick={() => resolve(r.id, "COMPLETED")}><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Mark completed</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Top-level tab
// ---------------------------------------------------------------------------
export function FounderMorningDashboardTab() {
  const [sub, setSub] = React.useState<SubTab>("Morning Dashboard");
  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {SUB_TABS.map((t) => (
          <button key={t} onClick={() => setSub(t)} className={`rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition ${sub === t ? "bg-green-600 text-white shadow-card" : "border border-navy-200 bg-white/70 text-navy-600 hover:bg-white dark:border-navy-800 dark:bg-navy-900/60 dark:text-navy-300"}`}>{t}</button>
        ))}
      </div>
      {sub === "Morning Dashboard" && <MorningDashboardSection />}
      {sub === "Ask Bundi" && <AskBundiSection />}
      {sub === "Product Analytics" && <ProductAnalyticsSection />}
      {sub === "Compliance" && <ComplianceSection />}
    </div>
  );
}
