"use client";

import React from "react";
import { QrCode, Wrench, AlertCircle, Cpu, Lock } from "lucide-react";

export function AssetMaintenanceSuite() {
  const [data, setData] = React.useState<{ assets: any[]; reagents: any[] }>({ assets: [], reagents: [] });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [assetName, setAssetName] = React.useState("50kVA Standby Diesel Generator");
  const [category, setCategory] = React.useState("GENERATOR");
  const [runningHours, setRunningHours] = React.useState(242);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/extensions-v2/assets")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setData(j.data ?? { assets: [], reagents: [] });
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

  async function handleAddAsset() {
    const res = await fetch("/api/extensions-v2/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assetName,
        category,
        location: "Main Utility Shed",
        runningHours,
        nextServiceHours: 250,
      }),
    });
    const j = await res.json();
    if (j.ok) {
      load();
    } else {
      setError(j.error || "Failed to add asset");
    }
  }

  if (error && error.toLowerCase().includes("not been released")) {
    return (
      <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-200 space-y-2">
        <h3 className="font-bold flex items-center gap-2 text-base text-amber-300">
          <Lock className="w-5 h-5 text-amber-400" /> Feature Switched OFF in NEYO Ops (EE.23: Capital Asset & Reagents)
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
            <Cpu className="w-5 h-5 text-cyan-400" />
            Capital Assets & Lab Reagent Maintenance Register
          </h2>
          <p className="text-sm text-slate-400">
            QR code asset tagging, lab reagent hazmat safety registry, and running-hour telemetry service alerts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <QrCode className="w-4 h-4 text-cyan-400" /> Register Capital Asset
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Asset Name</label>
              <input
                type="text"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
              >
                <option value="GENERATOR">Standby Generator</option>
                <option value="BOREHOLE">Water Borehole Submersible Pump</option>
                <option value="SOLAR">Solar Power Inverter Grid</option>
                <option value="ICT">Computer Lab PC / Projector</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Current Running Hours</label>
              <input
                type="number"
                value={runningHours}
                onChange={(e) => setRunningHours(Number(e.target.value))}
                className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
              />
            </div>
            <button
              onClick={handleAddAsset}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 rounded-xl text-sm transition-colors"
            >
              Generate QR Asset Tag & Track
            </button>
          </div>
        </div>

        <div className="md:col-span-2 glass p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <Wrench className="w-4 h-4 text-cyan-400" /> Running-Hour Telemetry & Asset Status
          </h3>

          {loading ? (
            <div className="h-32 flex items-center justify-center text-slate-500 text-sm">Loading assets...</div>
          ) : data.assets.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-slate-500 text-sm">No capital assets registered.</div>
          ) : (
            <div className="space-y-3">
              {data.assets.map((asset) => (
                <div key={asset.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{asset.assetName}</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                        {asset.qrTag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Location: {asset.location} • Telemetry: {asset.runningHours} / {asset.nextServiceHours} hrs</p>
                  </div>
                  <div>
                    {asset.runningHours >= 240 ? (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Oil Service Due
                      </span>
                    ) : (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                        Operational
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
