"use client";

import React from "react";
import { AlertCircle, FileText, ShieldAlert, Lock } from "lucide-react";

export function DisciplineSuite() {
  const [data, setData] = React.useState<{ incidents: any[]; counseling: any[] }>({ incidents: [], counseling: [] });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [studentName, setStudentName] = React.useState("Achieng Mary");
  const [description, setDescription] = React.useState("Sneaking out during prep time");
  const [severityLevel, setSeverityLevel] = React.useState(3);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/extensions-v2/discipline")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setData(j.data ?? { incidents: [], counseling: [] });
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

  async function handleLogIncident() {
    const res = await fetch("/api/extensions-v2/discipline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: "STU-001",
        studentName,
        severityLevel,
        category: "Sneaking",
        demerits: severityLevel * 5,
        description,
      }),
    });
    const j = await res.json();
    if (j.ok) {
      load();
    } else {
      setError(j.error || "Failed to log incident");
    }
  }

  if (error && error.toLowerCase().includes("not been released")) {
    return (
      <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-200 space-y-2">
        <h3 className="font-bold flex items-center gap-2 text-base text-amber-300">
          <Lock className="w-5 h-5 text-amber-400" /> Feature Switched OFF in NEYO Ops (EE.18: Discipline & Counseling)
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
            <ShieldAlert className="w-5 h-5 text-red-400" />
            Campus Discipline & Guidance Counseling Dossier
          </h2>
          <p className="text-sm text-slate-400">
            Tiered conduct matrix, watermarked Parent Summons PDF letter generator, and role-locked guidance counselor vault.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" /> Log Indiscipline Incident
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
              <label className="text-xs text-slate-400 block mb-1">Severity Level (1 to 4)</label>
              <select
                value={severityLevel}
                onChange={(e) => setSeverityLevel(Number(e.target.value))}
                className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
              >
                <option value={1}>Level 1 (Minor - 2 Demerits)</option>
                <option value={2}>Level 2 (Moderate - 5 Demerits)</option>
                <option value={3}>Level 3 (Major - 15 Demerits & Summons)</option>
                <option value={4}>Level 4 (Severe - 30 Demerits & Expulsion Risk)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Incident Details</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-white text-sm h-20"
              />
            </div>
            <button
              onClick={handleLogIncident}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-medium py-2 rounded-xl text-sm transition-colors"
            >
              Log Incident & Auto-Generate Summons
            </button>
          </div>
        </div>

        <div className="md:col-span-2 glass p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-red-400" /> Active Student Demerit Ledger & Summons
          </h3>

          {loading ? (
            <div className="h-32 flex items-center justify-center text-slate-500 text-sm">Loading incident records...</div>
          ) : data.incidents.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-slate-500 text-sm">No discipline incidents logged.</div>
          ) : (
            <div className="space-y-3">
              {data.incidents.map((inc) => (
                <div key={inc.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base">{inc.studentName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${inc.severityLevel >= 3 ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"}`}>
                        Level {inc.severityLevel} ({inc.demerits} Demerits)
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{inc.description}</p>
                  </div>
                  {inc.summonsLetterPdfUrl && (
                    <span className="text-xs bg-red-600 text-white px-3 py-1 rounded-lg font-medium flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" /> Summons Issued
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
