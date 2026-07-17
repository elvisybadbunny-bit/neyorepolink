"use client";

import React from "react";
import { DollarSign, FileSpreadsheet, ShieldCheck, Calculator, Lock } from "lucide-react";

export function PayrollSuite() {
  const [payrolls, setPayrolls] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [staffName, setStaffName] = React.useState("Wanjiru Kamau");
  const [basicPay, setBasicPay] = React.useState(35000);
  const [payPeriod, setPayPeriod] = React.useState("2026-07");
  const [submitting, setSubmitting] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/extensions-v2/payroll?payPeriod=${payPeriod}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setPayrolls(j.data ?? []);
        } else {
          setError(j.error || "Feature paused");
        }
      })
      .catch(() => setError("Network request failed"))
      .finally(() => setLoading(false));
  }, [payPeriod]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleRunPayroll() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/extensions-v2/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffName,
          idNumber: "28401928",
          jobTitle: "BOM Lab Technician",
          bankName: "Equity Bank",
          bankAccount: "01802930192",
          basicPay,
          payPeriod,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        load();
      } else {
        setError(json.error || "Failed to run payroll");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (error && error.toLowerCase().includes("not been released")) {
    return (
      <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-200 space-y-2">
        <h3 className="font-bold flex items-center gap-2 text-base text-amber-300">
          <Lock className="w-5 h-5 text-amber-400" /> Feature Switched OFF in NEYO Ops (EE.16: Statutory Payroll)
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
            <DollarSign className="w-5 h-5 text-emerald-400" />
            BOM Staff & TSC Statutory Payroll Engine
          </h2>
          <p className="text-sm text-slate-400">
            Automated KRA statutory calculations (SHIF 2.75%, NSSF Tier I/II, Housing Levy 1.5%, PAYE) & Bank Direct CSV Manifests.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={payPeriod}
            onChange={(e) => setPayPeriod(e.target.value)}
            className="bg-navy-900 border border-slate-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-400" /> Calculate Monthly BOM Payroll
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Staff Name</label>
              <input
                type="text"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Basic Salary (KES)</label>
              <input
                type="number"
                value={basicPay}
                onChange={(e) => setBasicPay(Number(e.target.value))}
                className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
              />
            </div>
            <button
              onClick={handleRunPayroll}
              disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? "Processing..." : "Run Statutory Engine & Save"}
            </button>
          </div>
        </div>

        <div className="md:col-span-2 glass p-5 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Period Payroll Summary ({payPeriod})
            </h3>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% KRA Compliant
            </span>
          </div>

          {loading ? (
            <div className="h-32 flex items-center justify-center text-slate-500 text-sm">Loading payroll records...</div>
          ) : payrolls.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-slate-500 text-sm">No payroll run for this period yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-white/10 text-slate-400 font-medium">
                  <tr>
                    <th className="py-2 px-3">Staff Member</th>
                    <th className="py-2 px-3">Gross (KES)</th>
                    <th className="py-2 px-3">SHIF (2.75%)</th>
                    <th className="py-2 px-3">NSSF I/II</th>
                    <th className="py-2 px-3">Housing Levy</th>
                    <th className="py-2 px-3">PAYE Tax</th>
                    <th className="py-2 px-3">Net Pay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {payrolls.map((p) => (
                    <tr key={p.id} className="hover:bg-white/5">
                      <td className="py-2.5 px-3 font-medium text-white">{p.staffName} ({p.jobTitle})</td>
                      <td className="py-2.5 px-3">KES {p.grossPay.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-amber-400">KES {p.shifDeduction.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-amber-400">KES {(p.nssfTier1 + p.nssfTier2).toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-amber-400">KES {p.housingLevy.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-amber-400">KES {p.payeTax.toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-400">KES {p.netPay.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
