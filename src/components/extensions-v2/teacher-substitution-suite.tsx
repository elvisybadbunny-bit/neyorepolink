"use client";

import React from "react";
import { UserCheck, Calendar, MessageSquare, Award, Lock } from "lucide-react";

export function TeacherSubstitutionSuite() {
  const [substitutions, setSubstitutions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [teacherName, setTeacherName] = React.useState("Mr. Otieno Chem");
  const [substituteTeacherName, setSubstituteTeacherName] = React.useState("Mrs. Wanjiru Math");

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/extensions-v2/substitutions")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setSubstitutions(j.data ?? []);
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

  async function handleCreateSubstitution() {
    const res = await fetch("/api/extensions-v2/substitutions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teacherId: "TCH-001",
        teacherName,
        leaveType: "SICK",
        startDate: "2026-07-20",
        endDate: "2026-07-23",
        affectedLessonsCount: 8,
        substituteTeacherId: "TCH-002",
        substituteTeacherName,
      }),
    });
    const j = await res.json();
    if (j.ok) {
      load();
    } else {
      setError(j.error || "Failed to create substitution");
    }
  }

  if (error && error.toLowerCase().includes("not been released")) {
    return (
      <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-200 space-y-2">
        <h3 className="font-bold flex items-center gap-2 text-base text-amber-300">
          <Lock className="w-5 h-5 text-amber-400" /> This service is currently unavailable: Teacher Substitution
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
            <UserCheck className="w-5 h-5 text-teal-400" />
            Teacher Leave & Lesson Substitution Studio
          </h2>
          <p className="text-sm text-slate-400">
            Clash-free lesson substitution auto-matcher, automated substitute SMS alerts, and 1-click TSC TPAD appraisal dossier export.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-400" /> Match Lesson Substitute
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Absent Teacher Name</label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Assigned Substitute Teacher</label>
              <input
                type="text"
                value={substituteTeacherName}
                onChange={(e) => setSubstituteTeacherName(e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
              />
            </div>
            <button
              onClick={handleCreateSubstitution}
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-medium py-2 rounded-xl text-sm transition-colors flex items-center justify-center gap-1"
            >
              <MessageSquare className="w-4 h-4" /> Match & Broadcast Substitute SMS
            </button>
          </div>
        </div>

        <div className="md:col-span-2 glass p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-teal-400" /> Substitution & TSC TPAD Readiness Tracker
          </h3>

          {loading ? (
            <div className="h-32 flex items-center justify-center text-slate-500 text-sm">Loading substitutions...</div>
          ) : substitutions.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-slate-500 text-sm">No substitutions recorded.</div>
          ) : (
            <div className="space-y-3">
              {substitutions.map((sub) => (
                <div key={sub.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-sm block">Absent: {sub.teacherName} ({sub.leaveType} Leave)</span>
                    <p className="text-xs text-slate-400 mt-1">
                      Substitute: <strong className="text-teal-400">{sub.substituteTeacherName}</strong> • {sub.affectedLessonsCount} Lessons Covered
                    </p>
                  </div>
                  <span className="text-xs bg-teal-500/20 text-teal-400 px-3 py-1 rounded-full font-medium">
                    SMS Broadcast Sent
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
