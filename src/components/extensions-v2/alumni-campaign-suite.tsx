"use client";

import React from "react";
import { GraduationCap, Heart, Award, Lock } from "lucide-react";

export function AlumniCampaignSuite() {
  const [campaigns, setCampaigns] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState("2026 Science Lab & Library Complex Fund");
  const [targetAmount, setTargetAmount] = React.useState(8000000);
  const [alumniName, setAlumniName] = React.useState("Dr. Njuguna Chemist");
  const [pledgeAmount, setPledgeAmount] = React.useState(150000);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/extensions-v2/alumni")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setCampaigns(j.data ?? []);
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

  async function handleCreateCampaign() {
    const res = await fetch("/api/extensions-v2/alumni", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, targetAmountKes: targetAmount }),
    });
    const j = await res.json();
    if (j.ok) {
      load();
    } else {
      setError(j.error || "Failed to create campaign");
    }
  }

  async function handleAddPledge(campaignId: string) {
    const res = await fetch("/api/extensions-v2/alumni", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "PLEDGE",
        campaignId,
        alumniName,
        cohortYear: "2014",
        amountKes: pledgeAmount,
      }),
    });
    const j = await res.json();
    if (j.ok) {
      load();
    } else {
      setError(j.error || "Failed to add pledge");
    }
  }

  if (error && error.toLowerCase().includes("not been released")) {
    return (
      <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-200 space-y-2">
        <h3 className="font-bold flex items-center gap-2 text-base text-amber-300">
          <Lock className="w-5 h-5 text-amber-400" /> This service is currently unavailable: Alumni Campaigns
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
            <GraduationCap className="w-5 h-5 text-yellow-400" />
            Alumni Association & Endowment Campaign Hub
          </h2>
          <p className="text-sm text-slate-400">
            Class of YYYY cohort directory, career mentorship slot scheduler, and live M-Pesa campaign progress thermometer.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <Heart className="w-4 h-4 text-yellow-400" /> Launch Endowment Campaign
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Campaign Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Target Amount (KES)</label>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(Number(e.target.value))}
                className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
              />
            </div>
            <button
              onClick={handleCreateCampaign}
              className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-medium py-2 rounded-xl text-sm transition-colors"
            >
              Launch Campaign & Publish
            </button>
          </div>
        </div>

        <div className="md:col-span-2 glass p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-400" /> Live Campaign Progress Thermometer
          </h3>

          {loading ? (
            <div className="h-32 flex items-center justify-center text-slate-500 text-sm">Loading campaigns...</div>
          ) : campaigns.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-slate-500 text-sm">No campaigns active.</div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((camp) => {
                const pct = Math.min(100, Math.round((camp.raisedAmountKes / camp.targetAmountKes) * 100));
                return (
                  <div key={camp.id} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-white">{camp.title}</span>
                      <span className="text-xs text-yellow-400 font-bold">{pct}% Raised</span>
                    </div>

                    <div className="w-full bg-navy-950 rounded-full h-3 overflow-hidden border border-white/10">
                      <div className="bg-gradient-to-r from-yellow-500 to-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Raised: <strong className="text-white">KES {camp.raisedAmountKes.toLocaleString()}</strong></span>
                      <span>Target: <strong className="text-white">KES {camp.targetAmountKes.toLocaleString()}</strong></span>
                    </div>

                    <button
                      onClick={() => handleAddPledge(camp.id)}
                      className="text-xs bg-yellow-600/30 hover:bg-yellow-600/50 text-yellow-300 px-3 py-1.5 rounded-lg font-medium border border-yellow-500/30 transition-colors"
                    >
                      Record M-Pesa Alumni Pledge (+ KES {pledgeAmount.toLocaleString()})
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
