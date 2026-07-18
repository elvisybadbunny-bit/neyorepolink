"use client";

/**
 * Idea 1.2 — School Operational Health & Churn Defcon Radar. Real backend
 * existed (tenantHealthSnapshot model, calculateTenantHealthScore(),
 * /api/founder-ops/tenant-health) with ZERO frontend UI until this fix --
 * found while re-auditing every FEATURES-CHECKLIST.md entry dated
 * 2026-07-17/18 against the actual live app, per founder's explicit
 * request to check keenly whether claimed features are genuinely wired.
 */
import * as React from "react";
import { Activity, RefreshCw, Loader2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

interface Snapshot {
  id: string;
  tenantId: string;
  healthScore: number;
  churnRiskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  attendanceScore: number;
  feeLedgerScore: number;
  leadershipLoginScore: number;
  errorRateScore: number;
  topFrictionReason: string | null;
  calculatedAt: string;
  tenant: { id: string; name: string; slug: string };
}

const RISK_TONE: Record<string, "green" | "amber" | "red" | "neutral"> = {
  LOW: "green",
  MEDIUM: "amber",
  HIGH: "red",
  CRITICAL: "red",
};

export function TenantHealthDefconTab() {
  const { toast } = useToast();
  const [snapshots, setSnapshots] = React.useState<Snapshot[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [recalculating, setRecalculating] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    fetch("/api/founder-ops/tenant-health")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setSnapshots(j.data.snapshots ?? []);
        else toast({ title: j.error?.message || "Could not load tenant health data", tone: "error" });
      })
      .catch(() => toast({ title: "Network request failed", tone: "error" }))
      .finally(() => setLoading(false));
  }, [toast]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleRecalculateAll() {
    setRecalculating(true);
    try {
      const res = await fetch("/api/founder-ops/tenant-health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: `Recalculated health for ${json.data.count} schools`, tone: "success" });
        load();
      } else {
        toast({ title: json.error?.message || "Could not recalculate", tone: "error" });
      }
    } finally {
      setRecalculating(false);
    }
  }

  const critical = snapshots.filter((s) => s.churnRiskLevel === "CRITICAL").length;
  const high = snapshots.filter((s) => s.churnRiskLevel === "HIGH").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-red-400" />
            School Operational Health & Churn Defcon Radar (`Idea 1.2`)
          </h2>
          <p className="text-sm text-slate-400">
            0–100 composite health score per school (attendance cadence, fee ledger velocity, leadership logins,
            error rate). {critical > 0 && <span className="text-red-400 font-semibold">{critical} school(s) at CRITICAL churn risk.</span>}
            {high > 0 && <span className="text-amber-400 font-semibold"> {high} at HIGH risk.</span>}
          </p>
        </div>
        <Button onClick={handleRecalculateAll} disabled={recalculating} variant="secondary">
          {recalculating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Recalculate all schools
        </Button>
      </div>

      <Card className="rounded-3xl border border-white/10">
        <CardHeader>
          <CardTitle className="text-base text-white">Tenants / Schools ({snapshots.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2"><Skeleton className="h-16 rounded-2xl" /><Skeleton className="h-16 rounded-2xl" /></div>
          ) : snapshots.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-xs text-slate-500">
              No health snapshots yet. Click "Recalculate all schools" to generate the first one.
            </div>
          ) : (
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {snapshots.map((s) => (
                <div key={s.id} className="rounded-2xl border border-white/10 p-3.5 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white text-sm">{s.tenant?.name ?? s.tenantId}</p>
                    <p className="text-xs text-slate-400">
                      Attendance {s.attendanceScore} · Fees {s.feeLedgerScore} · Logins {s.leadershipLoginScore} · Errors {s.errorRateScore}
                      {s.topFrictionReason ? ` · ${s.topFrictionReason}` : ""}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Calculated {new Date(s.calculatedAt).toLocaleString("en-KE")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-lg font-black text-white">{s.healthScore}</span>
                    <Badge tone={RISK_TONE[s.churnRiskLevel]} className="flex items-center gap-1">
                      {s.churnRiskLevel === "CRITICAL" && <AlertTriangle className="w-3 h-3" />}
                      {s.churnRiskLevel}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
