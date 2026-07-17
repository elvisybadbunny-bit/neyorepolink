"use client";

import React from "react";
import { BookOpen, AlertCircle, DollarSign, Lock } from "lucide-react";

export function TextbookFineSuite() {
  const [data, setData] = React.useState<{ allocations: any[]; recoveries: any[] }>({ allocations: [], recoveries: [] });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [studentName, setStudentName] = React.useState("Kamau Driver");
  const [bookTitle, setBookTitle] = React.useState("KLB Secondary Mathematics Form 3");
  const [copyBarcode, setCopyBarcode] = React.useState("C-MARA-108");

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/extensions-v2/library-recovery")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setData(j.data ?? { allocations: [], recoveries: [] });
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

  async function handleDeclareLost() {
    const res = await fetch("/api/extensions-v2/library-recovery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "DECLARE_LOST",
        studentId: "STU-003",
        studentName,
        bookTitle,
        copyBarcode,
        replacementCostKes: 1000,
      }),
    });
    const j = await res.json();
    if (j.ok) {
      load();
    } else {
      setError(j.error || "Failed to declare book lost");
    }
  }

  if (error && error.toLowerCase().includes("not been released")) {
    return (
      <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-200 space-y-2">
        <h3 className="font-bold flex items-center gap-2 text-base text-amber-300">
          <Lock className="w-5 h-5 text-amber-400" /> Feature Switched OFF in NEYO Ops (EE.26: Textbook Fine Recovery)
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
            <BookOpen className="w-5 h-5 text-purple-400" />
            Textbook Ratio 1:1 & Lost Book Fine Recovery Engine
          </h2>
          <p className="text-sm text-slate-400">
            Real-time 1:1 coursebook allocation matrix, daily overdue fine engine, and 1-click lost book fee stamping to fee invoice.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-purple-400" /> Declare Book Lost & Charge
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
              <label className="text-xs text-slate-400 block mb-1">Book Title & Barcode</label>
              <input
                type="text"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
              />
            </div>
            <button
              onClick={handleDeclareLost}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 rounded-xl text-sm transition-colors flex items-center justify-center gap-1"
            >
              <DollarSign className="w-4 h-4" /> Declare Lost & Stamp Fee Invoice (KES 1,000)
            </button>
          </div>
        </div>

        <div className="md:col-span-2 glass p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-400" /> Textbook Recovery & Fee Stamping Ledger
          </h3>

          {loading ? (
            <div className="h-32 flex items-center justify-center text-slate-500 text-sm">Loading coursebook data...</div>
          ) : data.recoveries.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-slate-500 text-sm">No fine recovery records logged.</div>
          ) : (
            <div className="space-y-3">
              {data.recoveries.map((rec) => (
                <div key={rec.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-sm block">{rec.studentName} ({rec.copyBarcode})</span>
                    <p className="text-xs text-slate-400 mt-1">Lost Coursebook: {rec.bookTitle}</p>
                  </div>
                  <span className="text-xs bg-purple-600 text-white px-3 py-1 rounded-lg font-medium">
                    Stamped KES {rec.replacementCostKes.toLocaleString()} to Fee Invoice
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
