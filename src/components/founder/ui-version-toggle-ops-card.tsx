"use client";

import React from "react";
import { Smartphone, Monitor, Sparkles, Check, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export function UiVersionToggleOpsCard() {
  const { toast } = useToast();
  const [version, setVersion] = React.useState<"v1" | "v2">("v1");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ops/ui-version");
      const json = await res.json();
      if (json.ok) {
        setVersion(json.version);
      }
    } catch {
      toast({ title: "Failed to load UI version setting", tone: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleToggle(targetVersion: "v1" | "v2") {
    if (targetVersion === version) return;
    setSaving(true);
    try {
      const res = await fetch("/api/ops/ui-version", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version: targetVersion }),
      });
      const json = await res.json();
      if (json.ok) {
        setVersion(targetVersion);
        toast({
          title: `Platform UI switched to ${targetVersion === "v2" ? "NEYO UI 2.0 (Native Mobile Mode)" : "Classic Web Dashboard (v1)"}`,
          tone: "success",
        });
      } else {
        toast({ title: json.error || "Failed to switch UI version", tone: "error" });
      }
    } catch {
      toast({ title: "Network error switching UI version", tone: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="glass p-6 rounded-3xl border border-white/10 space-y-4 text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            NEYO System-Wide UI Mode Switcher (v1 ↔ v2.0 Native App)
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Toggle between Classic Web Dashboard (v1) and NEYO UI 2.0 Native Mobile Experience. Changes apply platform-wide to all schools and users instantly.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-navy-950/60 p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => handleToggle("v1")}
            disabled={saving || loading}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              version === "v1"
                ? "bg-white text-navy-950 shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Monitor className="w-4 h-4" /> Classic Web (v1)
            {version === "v1" && <Check className="w-3.5 h-3.5 text-emerald-600" />}
          </button>

          <button
            onClick={() => handleToggle("v2")}
            disabled={saving || loading}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              version === "v2"
                ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-4 h-4" /> Native App 2.0
            {version === "v2" && <Check className="w-3.5 h-3.5 text-slate-950" />}
          </button>
        </div>
      </div>

      <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-slate-300">
        <span>Current Active System Mode:</span>
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
        ) : version === "v2" ? (
          <span className="font-bold text-emerald-400 flex items-center gap-1">
            🟢 NEYO UI 2.0 Active (Hero Cards, Action Pills & Mobile Card Feed)
          </span>
        ) : (
          <span className="font-semibold text-slate-300">
            ⚪ Classic Web Dashboard v1 Active
          </span>
        )}
      </div>
    </div>
  );
}
