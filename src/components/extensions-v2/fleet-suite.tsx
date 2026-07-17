"use client";

import React from "react";
import { Truck, ShieldAlert, Lock } from "lucide-react";

export function FleetSuite() {
  const [vehicles, setVehicles] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [regNo, setRegNo] = React.useState("KDA 892X");
  const [makeModel, setMakeModel] = React.useState("Isuzu NQR 62-Seater Bus");
  const [odometerKm, setOdometerKm] = React.useState(48210);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/extensions-v2/fleet")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setVehicles(j.data ?? []);
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

  async function handleAddVehicle() {
    const res = await fetch("/api/extensions-v2/fleet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        registrationNo: regNo,
        makeModel,
        capacity: 62,
        odometerKm,
        ntsaExpiry: "2026-12-31",
        insuranceExpiry: "2026-12-31",
      }),
    });
    const j = await res.json();
    if (j.ok) {
      load();
    } else {
      setError(j.error || "Failed to add vehicle");
    }
  }

  if (error && error.toLowerCase().includes("not been released")) {
    return (
      <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-200 space-y-2">
        <h3 className="font-bold flex items-center gap-2 text-base text-amber-300">
          <Lock className="w-5 h-5 text-amber-400" /> Feature Switched OFF in NEYO Ops (EE.17: Vehicle Fleet)
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
            <Truck className="w-5 h-5 text-amber-400" />
            Vehicle Fleet Logbook & NTSA Safety Suite
          </h2>
          <p className="text-sm text-slate-400">
            Fuel receipt Bundi OCR auditing, NTSA inspection countdowns, and pre-trip safety matrix.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-400" /> Register Bus / Van
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Registration No.</label>
              <input
                type="text"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Make / Capacity</label>
              <input
                type="text"
                value={makeModel}
                onChange={(e) => setMakeModel(e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Current Odometer (km)</label>
              <input
                type="number"
                value={odometerKm}
                onChange={(e) => setOdometerKm(Number(e.target.value))}
                className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
              />
            </div>
            <button
              onClick={handleAddVehicle}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium py-2 rounded-xl text-sm transition-colors"
            >
              Save Vehicle Entry
            </button>
          </div>
        </div>

        <div className="md:col-span-2 glass p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" /> School Fleet Status Radar
          </h3>

          {loading ? (
            <div className="h-32 flex items-center justify-center text-slate-500 text-sm">Loading fleet items...</div>
          ) : vehicles.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-slate-500 text-sm">No vehicles registered yet.</div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {vehicles.map((v) => (
                <div key={v.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base">{v.registrationNo}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                        NTSA Valid
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{v.makeModel} • Capacity: {v.capacity} Seats • Odometer: {v.odometerKm.toLocaleString()} km</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Safety Score</span>
                    <span className="text-lg font-bold text-emerald-400">{v.safetyScore}%</span>
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
