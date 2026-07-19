"use client";

import React from "react";
import { Bed, ShieldAlert, DollarSign, Lock } from "lucide-react";

export function HostelVandalismSuite() {
  const [data, setData] = React.useState<{ beds: any[]; inspections: any[] }>({ beds: [], inspections: [] });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [studentName, setStudentName] = React.useState("Kamau Driver");
  const [lockerTag, setLockerTag] = React.useState("LK-MARA-104");

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/extensions-v2/hostel")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setData(j.data ?? { beds: [], inspections: [] });
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

  async function handleInspectVandalism() {
    const res = await fetch("/api/extensions-v2/hostel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "INSPECTION",
        studentId: "STU-002",
        studentName,
        lockerTag,
        condition: "VANDALIZED",
        recoveryFeeKes: 1500,
      }),
    });
    const j = await res.json();
    if (j.ok) {
      load();
    } else {
      setError(j.error || "Failed to log inspection");
    }
  }

  if (error && error.toLowerCase().includes("not been released")) {
    return (
      <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-200 space-y-2">
        <h3 className="font-bold flex items-center gap-2 text-base text-amber-300">
          <Lock className="w-5 h-5 text-amber-400" /> This service is currently unavailable: Hostel Matrix & Vandalism
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
            <Bed className="w-5 h-5 text-indigo-400" />
            Hostel Bed Matrix & Damage Recovery Billing
          </h2>
          <p className="text-sm text-slate-400">
            Interactive cubicle roll-call grid, mattress/locker asset tags, and automated fee invoice suspense stamping.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-indigo-400" /> End-Term Hostel Inspection
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Student Name</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Asset Locker Tag</label>
              <input
                type="text"
                value={lockerTag}
                onChange={(e) => setLockerTag(e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
              />
            </div>
            <button
              onClick={handleInspectVandalism}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-xl text-sm transition-colors flex items-center justify-center gap-1"
            >
              <DollarSign className="w-4 h-4" /> Flag Vandalized & Auto-Stamp Fee Invoice (KES 1,500)
            </button>
          </div>
        </div>

        <div className="md:col-span-2 glass p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <Bed className="w-4 h-4 text-indigo-400" /> End-Term Dormitory Inspection Ledger
          </h3>

          {loading ? (
            <div className="h-32 flex items-center justify-center text-slate-500 text-sm">Loading hostel data...</div>
          ) : data.inspections.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-slate-500 text-sm">No inspection records found.</div>
          ) : (
            <div className="space-y-3">
              {data.inspections.map((insp) => (
                <div key={insp.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-sm block">{insp.studentName} ({insp.lockerTag})</span>
                    <p className="text-xs text-slate-400 mt-1">Condition: {insp.condition}</p>
                  </div>
                  {insp.feeInvoiceStamped && (
                    <span className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg font-medium flex items-center gap-1">
                      Stamped KES {insp.recoveryFeeKes.toLocaleString()} to Fee Invoice
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
