"use client";

/**
 * Idea 1.5 — SMS Gateway Route & DND Health Monitor. Real backend existed
 * (TenantSmsTelemetry model, /api/founder-ops/sms-telemetry) with ZERO
 * frontend UI until this fix -- found while re-auditing every
 * FEATURES-CHECKLIST.md entry dated 2026-07-17/18 against the actual live
 * app, per founder's explicit request to check keenly whether claimed
 * features are genuinely wired.
 */
import * as React from "react";
import { MessageSquareWarning, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

interface TelemetryRow {
  id: string;
  tenantId: string;
  periodKey: string;
  totalAttempted: number;
  totalDelivered: number;
  totalRejected: number;
  totalDndBlocked: number;
  dndRatePct: number;
  autoFallbackEnabled: boolean;
  tenant: { id: string; name: string; phone: string | null };
}

export function SmsHealthMonitorTab() {
  const { toast } = useToast();
  const [rows, setRows] = React.useState<TelemetryRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [togglingId, setTogglingId] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    fetch("/api/founder-ops/sms-telemetry")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setRows(j.data.telemetry ?? []);
        else toast({ title: j.error?.message || "Could not load SMS telemetry", tone: "error" });
      })
      .catch(() => toast({ title: "Network request failed", tone: "error" }))
      .finally(() => setLoading(false));
  }, [toast]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleToggle(tenantId: string, current: boolean, rowId: string) {
    setTogglingId(rowId);
    try {
      const res = await fetch("/api/founder-ops/sms-telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, autoFallbackEnabled: !current }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: `Auto-fallback ${!current ? "enabled" : "disabled"}`, tone: "success" });
        load();
      } else {
        toast({ title: json.error?.message || "Could not update", tone: "error" });
      }
    } finally {
      setTogglingId(null);
    }
  }

  const highDnd = rows.filter((r) => r.dndRatePct >= 20).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageSquareWarning className="h-5 w-5 text-amber-400" />
          SMS Gateway Route & DND Health Monitor
        </h2>
        <p className="text-sm text-slate-400">
          Delivery ratios vs DND rejections per school this term. Auto-fallback switches a school to In-App/WhatsApp
          notifications when its DND rate gets too high.
          {highDnd > 0 && <span className="text-amber-400 font-semibold"> {highDnd} school(s) currently above 20% DND rate.</span>}
        </p>
      </div>

      <Card className="rounded-3xl border border-white/10">
        <CardHeader>
          <CardTitle className="text-base text-white">Schools this term ({rows.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2"><Skeleton className="h-16 rounded-2xl" /><Skeleton className="h-16 rounded-2xl" /></div>
          ) : rows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-xs text-slate-500">
              No SMS telemetry recorded yet this term.
            </div>
          ) : (
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {rows.map((r) => (
                <div key={r.id} className="rounded-2xl border border-white/10 p-3.5 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white text-sm">{r.tenant?.name ?? r.tenantId}</p>
                    <p className="text-xs text-slate-400">
                      {r.totalAttempted} attempted · {r.totalDelivered} delivered · {r.totalRejected} rejected · {r.totalDndBlocked} DND-blocked
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge tone={r.dndRatePct >= 20 ? "red" : r.dndRatePct >= 10 ? "amber" : "green"}>
                      {r.dndRatePct}% DND
                    </Badge>
                    <button
                      onClick={() => handleToggle(r.tenantId, r.autoFallbackEnabled, r.id)}
                      disabled={togglingId === r.id}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${r.autoFallbackEnabled ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-slate-300"}`}
                    >
                      {togglingId === r.id ? <Loader2 className="w-3 h-3 animate-spin inline" /> : r.autoFallbackEnabled ? "Auto-fallback ON" : "Auto-fallback OFF"}
                    </button>
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
