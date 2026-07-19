"use client";

import React from "react";
import { ShieldCheck, UserCheck, AlertTriangle, QrCode, Lock } from "lucide-react";

export function GateSecuritySuite() {
  const [logs, setLogs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [visitorName, setVisitorName] = React.useState("Wanjiru Mary");
  const [nationalId, setNationalId] = React.useState("38491029");
  const [phone, setPhone] = React.useState("+254 712 345 678");
  const [purpose, setPurpose] = React.useState("Parent Consultation with Form 3 Class Teacher");

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/extensions-v2/visitors")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setLogs(j.data ?? []);
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

  async function handleCheckIn() {
    const res = await fetch("/api/extensions-v2/visitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitorName,
        nationalId,
        phone,
        purpose,
        hostStaffName: "Mr. Otieno",
      }),
    });
    const j = await res.json();
    if (j.ok) {
      load();
    } else {
      setError(j.error || "Failed gate check in");
    }
  }

  if (error && error.toLowerCase().includes("not been released")) {
    return (
      <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-200 space-y-2">
        <h3 className="font-bold flex items-center gap-2 text-base text-amber-300">
          <Lock className="w-5 h-5 text-amber-400" /> This service is currently unavailable: Visitor Gate Security
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
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Visitor & Vendor Gate Security Access Suite
          </h2>
          <p className="text-sm text-slate-400">
            Rapid gate sign-in, instant host SMS entry alerts, Custody Dispute Red-Flag Radar, and printable QR visitor security passes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" /> Rapid Gate Sign-In (&lt;15s)
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Visitor Full Name</label>
              <input
                type="text"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">National ID / Phone</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  className="bg-navy-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
                  placeholder="ID Number"
                />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-navy-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
                  placeholder="Phone"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Purpose of Visit</label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
              />
            </div>
            <button
              onClick={handleCheckIn}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-xl text-sm transition-colors flex items-center justify-center gap-1"
            >
              <QrCode className="w-4 h-4" /> Check In & Print Visitor Security Badge
            </button>
          </div>
        </div>

        <div className="md:col-span-2 glass p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Active Campus Visitors & Security Audit Log
          </h3>

          {loading ? (
            <div className="h-32 flex items-center justify-center text-slate-500 text-sm">Loading gate logs...</div>
          ) : logs.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-slate-500 text-sm">No active visitors checked in today.</div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{log.visitorName} (ID: {log.nationalId})</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        {log.qrBadgePassId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Purpose: {log.purpose} • Phone: {log.phone}</p>
                  </div>
                  <div>
                    {log.custodyAlertTriggered ? (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Custody Alert Blocked
                      </span>
                    ) : (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                        Approved Checked In
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
