"use client";

/**
 * Idea 6 (kenyan-extensions.service.ts) — Infirmary Nurse Daily Medication
 * Roll-Call Ledger. Real backend existed (InfirmaryDosageLog model,
 * /api/clinic/dosage-logs) with ZERO frontend UI until this fix — found
 * during a full-stack audit of a prior AI session's "12 operational
 * suites" commit. Separate from B.21's existing "start a medication plan +
 * give a dose" flow: this is a real, dated roll-call grid the school nurse
 * fills for TODAY across morning/lunch/evening doses, including
 * MISSED/REFUSED (not just administered), for QASO-style inspection.
 */
import * as React from "react";
import { Syringe, Plus, Loader2, Lock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { StudentSearchSelect, type StudentSearchOption } from "@/components/students/student-search-select";

interface DosageRow {
  id: string;
  studentId: string;
  studentName: string;
  doseName: string;
  scheduledTime: string;
  status: "ADMINISTERED" | "MISSED" | "REFUSED";
  administeredAt: string | null;
  administeredBy: string;
  notes: string | null;
  createdAt: string;
}

const STATUS_TONE: Record<string, "green" | "red" | "amber"> = {
  ADMINISTERED: "green",
  MISSED: "amber",
  REFUSED: "red",
};
const STATUS_ICON: Record<string, typeof CheckCircle2> = {
  ADMINISTERED: CheckCircle2,
  MISSED: AlertTriangle,
  REFUSED: XCircle,
};

export function DosageLogSuite({ students }: { students: StudentSearchOption[] }) {
  const { toast } = useToast();
  const [dosages, setDosages] = React.useState<DosageRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const [studentId, setStudentId] = React.useState("");
  const [doseName, setDoseName] = React.useState("");
  const [scheduledTime, setScheduledTime] = React.useState<"Morning" | "Lunch" | "Evening">("Morning");
  const [status, setStatus] = React.useState<"ADMINISTERED" | "MISSED" | "REFUSED">("ADMINISTERED");
  const [notes, setNotes] = React.useState("");

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/clinic/dosage-logs")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setDosages(j.data.dosages ?? []);
        else setError(j.error?.message || "Could not load today's dosage roll-call.");
      })
      .catch(() => setError("Network request failed"))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleRecord() {
    if (!studentId || !doseName.trim()) {
      toast({ title: "Select a student and enter the dose name", tone: "error" });
      return;
    }
    const student = students.find((s) => s.id === studentId);
    setSaving(true);
    try {
      const res = await fetch("/api/clinic/dosage-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          studentName: student?.name ?? "",
          doseName: doseName.trim(),
          scheduledTime,
          status,
          notes: notes.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: "Dosage recorded on today's roll-call", tone: "success" });
        setDoseName("");
        setNotes("");
        load();
      } else {
        toast({ title: json.error?.message || "Could not record dosage", tone: "error" });
      }
    } finally {
      setSaving(false);
    }
  }

  if (error && error.toLowerCase().includes("paused")) {
    return (
      <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-200 space-y-2">
        <h3 className="font-bold flex items-center gap-2 text-base text-amber-300">
          <Lock className="w-5 h-5 text-amber-400" /> Feature switched off in NEYO Ops (Dosage Roll-Call Ledger)
        </h3>
        <p className="text-xs text-slate-300">
          This feature can be individually enabled or paused platform-wide in NEYO Ops.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-navy-950 dark:text-white flex items-center gap-2">
          <Syringe className="h-5 w-5 text-red-500" />
          Infirmary Daily Medication Roll-Call (`Idea 6`)
        </h2>
        <p className="text-sm text-navy-500 dark:text-navy-400">
          A dated roll-call grid the nurse fills in for every scheduled dose today — Administered, Missed, or Refused
          — separate from starting a new ongoing medication plan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="rounded-3xl border border-navy-100 dark:border-navy-800 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Log a dose</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StudentSearchSelect students={students} value={studentId} onChange={setStudentId} label="Learner" />
            <div>
              <Label htmlFor="dose-name">Medication / dose</Label>
              <Input id="dose-name" placeholder="e.g. Amoxicillin 250mg" value={doseName} onChange={(e) => setDoseName(e.target.value)} />
            </div>
            <div>
              <Label>Scheduled time</Label>
              <div className="mt-1 grid grid-cols-3 gap-1.5">
                {(["Morning", "Lunch", "Evening"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setScheduledTime(t)}
                    className={`rounded-xl border px-2 py-1.5 text-xs font-semibold transition-colors ${scheduledTime === t ? "border-red-500 bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200" : "border-navy-200 text-navy-500 dark:border-navy-700"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Outcome</Label>
              <div className="mt-1 grid grid-cols-1 gap-1.5">
                {(["ADMINISTERED", "MISSED", "REFUSED"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors ${status === s ? "border-navy-900 bg-navy-50 dark:border-white dark:bg-navy-800" : "border-navy-200 text-navy-500 dark:border-navy-700"}`}
                  >
                    {s === "ADMINISTERED" ? "✓ Administered" : s === "MISSED" ? "⚠ Missed (student absent/unavailable)" : "✕ Refused by student"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="dose-notes">Notes (optional)</Label>
              <Input id="dose-notes" placeholder="e.g. Gave with food" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <Button onClick={handleRecord} disabled={saving} className="w-full rounded-full bg-red-600 hover:bg-red-700 text-white">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Record on roll-call
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-navy-100 dark:border-navy-800 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Today's roll-call ({dosages.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2"><Skeleton className="h-16 rounded-2xl" /><Skeleton className="h-16 rounded-2xl" /></div>
            ) : dosages.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-navy-200 p-8 text-center text-xs text-navy-500 dark:border-navy-800">
                No doses recorded yet today. Use the form to log the first one.
              </div>
            ) : (
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {dosages.map((d) => {
                  const Icon = STATUS_ICON[d.status];
                  return (
                    <div key={d.id} className="rounded-2xl border border-navy-100 dark:border-navy-800 p-3.5 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-navy-900 dark:text-white text-sm">{d.studentName}</p>
                        <p className="text-xs text-navy-400">
                          {d.doseName} · {d.scheduledTime} · by {d.administeredBy}
                        </p>
                        {d.notes && <p className="text-xs text-navy-500 mt-0.5">{d.notes}</p>}
                      </div>
                      <Badge tone={STATUS_TONE[d.status]} className="flex items-center gap-1">
                        <Icon className="w-3 h-3" /> {d.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
