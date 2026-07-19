"use client";

import * as React from "react";
import { Sparkles, ShieldCheck, Lock, Unlock, Users, CheckCircle2, Loader2, Play, AlertCircle, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

interface FeatureReleaseItem {
  id: string;
  featureKey: string;
  label: string;
  status: string; // PAUSED | EARLY_ACCESS_PILOT | LIVE
  whitelistedTenantIdsJson: string;
  notes: string | null;
  updatedBy: string;
  updatedAt: string;
}

export function FeatureReleaseControlsTab() {
  const { toast } = useToast();
  const [controls, setControls] = React.useState<FeatureReleaseItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [whitelistInput, setWhitelistInput] = React.useState<Record<string, string>>({});

  const fetchControls = React.useCallback(async () => {
    try {
      const res = await fetch("/api/founder-ops/release-controls");
      const json = await res.json();
      if (json.ok && json.data?.controls) {
        setControls(json.data.controls);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchControls();
  }, [fetchControls]);

  async function updateStatus(item: FeatureReleaseItem, newStatus: "PAUSED" | "EARLY_ACCESS_PILOT" | "LIVE") {
    setSavingId(item.featureKey);
    try {
      let whitelisted: string[] = [];
      try { whitelisted = JSON.parse(item.whitelistedTenantIdsJson || "[]"); } catch { whitelisted = []; }

      const res = await fetch("/api/founder-ops/release-controls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featureKey: item.featureKey,
          label: item.label,
          status: newStatus,
          whitelistedTenantIds: whitelisted,
          notes: item.notes,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast({ title: json.error?.message || "Could not update release status.", tone: "error" });
        return;
      }
      toast({
        title: `Feature '${item.label}' set to ${newStatus}`,
        description: newStatus === "LIVE" ? "Mega Button Active — Unlocked for all Kenyan schools!" : newStatus === "EARLY_ACCESS_PILOT" ? "Restricted strictly to whitelisted pilot schools." : "Paused platform-wide.",
        tone: newStatus === "LIVE" ? "success" : "info",
      });
      await fetchControls();
    } finally {
      setSavingId(null);
    }
  }

  async function addWhitelistSchool(item: FeatureReleaseItem) {
    const input = whitelistInput[item.featureKey]?.trim();
    if (!input) return;
    setSavingId(item.featureKey);
    try {
      let whitelisted: string[] = [];
      try { whitelisted = JSON.parse(item.whitelistedTenantIdsJson || "[]"); } catch { whitelisted = []; }
      if (!whitelisted.includes(input)) whitelisted.push(input);

      const res = await fetch("/api/founder-ops/release-controls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featureKey: item.featureKey,
          label: item.label,
          status: item.status,
          whitelistedTenantIds: whitelisted,
          notes: item.notes,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: "School Whitelisted!", description: `Added '${input}' to early access pilot for ${item.label}.`, tone: "success" });
        setWhitelistInput((prev) => ({ ...prev, [item.featureKey]: "" }));
        await fetchControls();
      }
    } finally {
      setSavingId(null);
    }
  }

  async function removeWhitelistSchool(item: FeatureReleaseItem, tenantIdToRemove: string) {
    setSavingId(item.featureKey);
    try {
      let whitelisted: string[] = [];
      try { whitelisted = JSON.parse(item.whitelistedTenantIdsJson || "[]"); } catch { whitelisted = []; }
      whitelisted = whitelisted.filter((id) => id !== tenantIdToRemove);

      const res = await fetch("/api/founder-ops/release-controls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featureKey: item.featureKey,
          label: item.label,
          status: item.status,
          whitelistedTenantIds: whitelisted,
          notes: item.notes,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: "School removed from pilot whitelist.", tone: "info" });
        await fetchControls();
      }
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-navy-950 dark:text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-green-600" />
            Feature Release Controls (`Early Access Pilot vs. Mega Button`)
          </h2>
          <p className="text-xs text-navy-500 dark:text-navy-400">
            Govern rollout access across all unreleased platform features and modules (such as Bundi OCR, quizzes and contests). Toggle between `PAUSED` (`Hidden`), `EARLY_ACCESS_PILOT` (`Whitelist pilot schools like Karibu High`), and `LIVE` (`Mega Button to all schools`).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>
        ) : controls.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-navy-200 p-8 text-center text-xs text-navy-500 dark:border-navy-800">
            No specific feature release overrides stored right now. All unlisted features follow their canonical code launch settings (`default: LIVE`).
          </div>
        ) : (
          controls.map((c) => {
            let whitelisted: string[] = [];
            try { whitelisted = JSON.parse(c.whitelistedTenantIdsJson || "[]"); } catch { whitelisted = []; }

            return (
              <Card key={c.featureKey} className={`rounded-3xl transition-all ${c.status === "EARLY_ACCESS_PILOT" ? "border-blue-200 bg-blue-50/15 dark:border-blue-900/40 dark:bg-blue-950/10" : c.status === "PAUSED" ? "border-amber-200 bg-amber-50/15 dark:border-amber-900/40 dark:bg-amber-950/10" : "border-navy-100 dark:border-navy-800"}`}>
                <CardContent className="p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-navy-950 dark:text-white text-base">{c.label}</span>
                        <Badge tone={c.status === "LIVE" ? "green" : c.status === "EARLY_ACCESS_PILOT" ? "blue" : "amber"}>
                          {c.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-navy-400 font-mono mt-0.5">{c.featureKey}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant={c.status === "PAUSED" ? "primary" : "secondary"}
                        onClick={() => updateStatus(c, "PAUSED")}
                        disabled={savingId === c.featureKey || c.status === "PAUSED"}
                        className="rounded-full text-xs font-semibold"
                      >
                        <Lock className="mr-1 h-3.5 w-3.5" /> Pause
                      </Button>
                      <Button
                        size="sm"
                        variant={c.status === "EARLY_ACCESS_PILOT" ? "primary" : "secondary"}
                        onClick={() => updateStatus(c, "EARLY_ACCESS_PILOT")}
                        disabled={savingId === c.featureKey || c.status === "EARLY_ACCESS_PILOT"}
                        className="rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                      >
                        <Users className="mr-1 h-3.5 w-3.5" /> Early Access Pilot
                      </Button>
                      <Button
                        size="sm"
                        variant={c.status === "LIVE" ? "primary" : "secondary"}
                        onClick={() => updateStatus(c, "LIVE")}
                        disabled={savingId === c.featureKey || c.status === "LIVE"}
                        className="rounded-full bg-green-700 hover:bg-green-800 text-white text-xs font-semibold shadow-sm"
                      >
                        <Play className="mr-1 h-3.5 w-3.5" /> Mega Button (`Launch to All`)
                      </Button>
                    </div>
                  </div>

                  {c.status === "EARLY_ACCESS_PILOT" && (
                    <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900/40 dark:bg-blue-950/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" /> Pilot Whitelisted Schools ({whitelisted.length})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {whitelisted.map((tid) => (
                          <span key={tid} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-mono font-bold text-blue-950 shadow-sm border border-blue-200 dark:bg-navy-900 dark:text-blue-200 dark:border-blue-800">
                            {tid}
                            <button onClick={() => removeWhitelistSchool(c, tid)} className="ml-1 text-red-500 hover:text-red-700 font-bold">×</button>
                          </span>
                        ))}
                        {whitelisted.length === 0 && (
                          <span className="text-xs italic text-blue-700 dark:text-blue-300">No schools whitelisted yet. Enter a tenant ID below (`e.g., cmr... or tenant-karibu-high`) to grant early pilot access.</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 max-w-sm pt-1">
                        <Input
                          placeholder="School Tenant ID (e.g. cmr...)"
                          value={whitelistInput[c.featureKey] || ""}
                          onChange={(e) => setWhitelistInput((prev) => ({ ...prev, [c.featureKey]: e.target.value }))}
                          className="h-8 text-xs font-mono bg-white dark:bg-navy-900"
                        />
                        <Button
                          size="sm"
                          onClick={() => addWhitelistSchool(c)}
                          disabled={savingId === c.featureKey || !whitelistInput[c.featureKey]?.trim()}
                          className="rounded-full bg-blue-700 hover:bg-blue-800 text-white text-xs h-8 px-3"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" /> Add School
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
