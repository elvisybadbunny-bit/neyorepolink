"use client";

import React from "react";
import { Utensils, AlertTriangle, FileCheck, ShoppingCart, Lock } from "lucide-react";

export function KitchenStoreSuite() {
  const [data, setData] = React.useState<{ requisitions: any[]; lpos: any[] }>({ requisitions: [], lpos: [] });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [itemName, setItemName] = React.useState("Dry Maize (90kg Bags)");
  const [issuedQuantityKg, setIssuedQuantityKg] = React.useState(360);
  const [activeStudentCount] = React.useState(850);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/extensions-v2/store")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setData(j.data ?? { requisitions: [], lpos: [] });
        } else {
          setError(j.error || "Feature paused");
        }
      })
      .catch(() => setError("Network request failed"))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleIssueStore() {
    const res = await fetch("/api/extensions-v2/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemName,
        unit: "Kgs",
        stockOnHand: 4500,
        activeStudentCount,
        issuedQuantityKg,
      }),
    });
    const j = await res.json();
    if (j.ok) {
      load();
    } else {
      setError(j.error || "Failed to issue store");
    }
  }

  if (error && error.toLowerCase().includes("not been released")) {
    return (
      <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-200 space-y-2">
        <h3 className="font-bold flex items-center gap-2 text-base text-amber-300">
          <Lock className="w-5 h-5 text-amber-400" /> Feature Switched OFF in NEYO Ops (EE.19: Store Requisitions & Rationing)
        </h3>
        <p className="text-xs text-slate-300">
          This feature can be individually enabled or paused platform-wide in NEYO Ops (/founder).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Utensils className="w-5 h-5 text-orange-400" />
            Dining Hall Rationing & Store Requisitions
          </h2>
          <p className="text-sm text-slate-400">
            Per-capita daily food ration calibrator, storekeeper divergence alerts, and supplier LPO studio.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-orange-400" /> Issue Kitchen Drawdown
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Item Name</label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Quantity Requested (Kgs)</label>
              <input
                type="number"
                value={issuedQuantityKg}
                onChange={(e) => setIssuedQuantityKg(Number(e.target.value))}
                className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
              />
            </div>
            <p className="text-xs text-slate-400">
              Active Headcount: <strong className="text-white">{activeStudentCount} Students</strong> (Theoretical Standard: {(activeStudentCount * 0.35).toFixed(1)} kg)
            </p>
            <button
              onClick={handleIssueStore}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-medium py-2 rounded-xl text-sm transition-colors"
            >
              Issue Stock & Verify Rationing
            </button>
          </div>
        </div>

        <div className="md:col-span-2 glass p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-orange-400" /> Requisition Audit Ledger
          </h3>

          {loading ? (
            <div className="h-32 flex items-center justify-center text-slate-500 text-sm">Loading store data...</div>
          ) : data.requisitions.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-slate-500 text-sm">No requisitions recorded.</div>
          ) : (
            <div className="space-y-3">
              {data.requisitions.map((req) => (
                <div key={req.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-sm block">{req.itemName}</span>
                    <p className="text-xs text-slate-400 mt-1">
                      Issued: {req.issuedQuantityKg} kg • Required: {req.theoreticalRequiredKg} kg
                    </p>
                  </div>
                  <div>
                    {req.divergenceFlagged ? (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Overissue (+{req.divergencePct}%)
                      </span>
                    ) : (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                        Normal ({req.divergencePct}%)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
