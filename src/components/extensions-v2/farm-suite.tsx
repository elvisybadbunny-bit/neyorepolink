"use client";

import React from "react";
import { Sprout, ArrowRightLeft, TrendingUp, Lock } from "lucide-react";

export function FarmSuite() {
  const [ledger, setLedger] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [enterprise, setEnterprise] = React.useState("DAIRY");
  const [dailyYield, setDailyYield] = React.useState(120);
  const [kitchenQty, setKitchenQty] = React.useState(100);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/extensions-v2/farm")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setLedger(j.data ?? []);
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

  async function handleRecordYield() {
    const res = await fetch("/api/extensions-v2/farm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enterprise,
        dailyYield,
        unit: enterprise === "DAIRY" ? "Liters" : enterprise === "POULTRY" ? "Trays" : "Kgs",
        kitchenTransferQuantity: kitchenQty,
        mpesaStaffSalesKes: (dailyYield - kitchenQty) * 60,
        internalRateKes: 60,
      }),
    });
    const j = await res.json();
    if (j.ok) {
      load();
    } else {
      setError(j.error || "Failed to log yield");
    }
  }

  if (error && error.toLowerCase().includes("not been released")) {
    return (
      <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-200 space-y-2">
        <h3 className="font-bold flex items-center gap-2 text-base text-amber-300">
          <Lock className="w-5 h-5 text-amber-400" /> This service is currently unavailable: School Farm Accounting
        </h3>
        <p className="text-xs text-slate-300">
          This service is available by request. Ask your school administrator for access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sprout className="w-5 h-5 text-lime-400" />
            School Farm & Enterprise Accounting
          </h2>
          <p className="text-sm text-slate-400">
            Double-entry farm accounting, kitchen sell-back transfers, and direct M-Pesa staff sales counter.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-lime-400" /> Log Farm Production & Transfer
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Enterprise Type</label>
              <select
                value={enterprise}
                onChange={(e) => setEnterprise(e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
              >
                <option value="DAIRY">Dairy Cattle (Milk Liters)</option>
                <option value="POULTRY">Poultry Unit (Egg Trays)</option>
                <option value="CROPS">Vegetable Greenhouse (Kgs Sukuma)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Daily Total Yield</label>
              <input
                type="number"
                value={dailyYield}
                onChange={(e) => setDailyYield(Number(e.target.value))}
                className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Transfer to Dining Kitchen</label>
              <input
                type="number"
                value={kitchenQty}
                onChange={(e) => setKitchenQty(Number(e.target.value))}
                className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
              />
            </div>
            <button
              onClick={handleRecordYield}
              className="w-full bg-lime-600 hover:bg-lime-500 text-white font-medium py-2 rounded-xl text-sm transition-colors"
            >
              Log Production & Sell-Back Transfer
            </button>
          </div>
        </div>

        <div className="md:col-span-2 glass p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-lime-400" /> Inter-Departmental Credit Ledger
          </h3>

          {loading ? (
            <div className="h-32 flex items-center justify-center text-slate-500 text-sm">Loading farm ledger...</div>
          ) : ledger.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-slate-500 text-sm">No farm entries recorded.</div>
          ) : (
            <div className="space-y-3">
              {ledger.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-sm block">{item.enterprise} Yield: {item.dailyYield} {item.unit}</span>
                    <p className="text-xs text-slate-400 mt-1">
                      Kitchen Transfer: {item.kitchenTransferQuantity} {item.unit} @ KES {item.internalRateKes}/{item.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Kitchen Saving Credit</span>
                    <span className="text-sm font-bold text-lime-400">KES {item.totalInternalCreditKes.toLocaleString()}</span>
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
