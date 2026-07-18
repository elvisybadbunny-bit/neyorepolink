"use client";

/**
 * Idea 5 (kenyan-extensions.service.ts) — Digital Boarding Exeat & Weekend
 * Outing Pass Engine. Real backend existed (BoardingExeatPass model,
 * /api/hostel/exeat-passes[/approve][/gate]) with ZERO frontend UI until
 * this fix — found during a full-stack audit of a prior AI session's "12
 * operational suites" commit. Lets a housemaster request a pass for a
 * boarder, a principal/deputy approve or reject it, and the gate guard
 * check the student out/in with a real generated QR pass number.
 */
import * as React from "react";
import { DoorOpen, Plus, Loader2, CheckCircle2, XCircle, LogOut, LogIn, QrCode } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { StudentSearchSelect, type StudentSearchOption } from "@/components/students/student-search-select";

interface ExeatRow {
  id: string;
  studentName: string;
  passNo: string;
  reason: string;
  departureTime: string;
  expectedReturnTime: string;
  actualDepartureTime: string | null;
  actualReturnTime: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "OFF_CAMPUS" | "RETURNED";
  qrDataUrl: string;
}

const STATUS_TONE: Record<string, "amber" | "green" | "red" | "blue" | "neutral"> = {
  PENDING: "amber",
  APPROVED: "green",
  REJECTED: "red",
  OFF_CAMPUS: "blue",
  RETURNED: "neutral",
};

export function ExeatPassSuite({ students, canApprove, canGate }: { students: StudentSearchOption[]; canApprove: boolean; canGate: boolean }) {
  const { toast } = useToast();
  const [passes, setPasses] = React.useState<ExeatRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [studentId, setStudentId] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [departureTime, setDepartureTime] = React.useState("");
  const [expectedReturnTime, setExpectedReturnTime] = React.useState("");
  const [requesting, setRequesting] = React.useState(false);

  const [gatePassNo, setGatePassNo] = React.useState("");
  const [gating, setGating] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [viewQr, setViewQr] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/hostel/exeat-passes")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setPasses(j.data.passes ?? []);
        else setError(j.error?.message || "Could not load exeat passes.");
      })
      .catch(() => setError("Network request failed"))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleRequest() {
    if (!studentId || !reason.trim() || !departureTime || !expectedReturnTime) {
      toast({ title: "Student, reason, departure, and expected return are required", tone: "error" });
      return;
    }
    setRequesting(true);
    try {
      const res = await fetch("/api/hostel/exeat-passes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, reason: reason.trim(), departureTime, expectedReturnTime }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: `Exeat pass requested — ${json.data.pass.passNo}`, tone: "success" });
        setReason("");
        setDepartureTime("");
        setExpectedReturnTime("");
        setStudentId("");
        load();
      } else {
        toast({ title: json.error?.message || "Could not request pass", tone: "error" });
      }
    } finally {
      setRequesting(false);
    }
  }

  async function handleApprove(id: string, status: "APPROVED" | "REJECTED") {
    setBusyId(id);
    try {
      const res = await fetch("/api/hostel/exeat-passes/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: status === "APPROVED" ? "Pass approved" : "Pass rejected", tone: "success" });
        load();
      } else {
        toast({ title: json.error?.message || "Could not update pass", tone: "error" });
      }
    } finally {
      setBusyId(null);
    }
  }

  async function handleGate(action: "CHECK_OUT" | "CHECK_IN") {
    if (!gatePassNo.trim()) {
      toast({ title: "Enter or scan a pass number", tone: "error" });
      return;
    }
    setGating(true);
    try {
      const res = await fetch("/api/hostel/exeat-passes/gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passNo: gatePassNo.trim(), action }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: action === "CHECK_OUT" ? "Checked out of campus" : "Checked back in", tone: "success" });
        setGatePassNo("");
        load();
      } else {
        toast({ title: json.error?.message || "Gate check failed", tone: "error" });
      }
    } finally {
      setGating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-navy-950 dark:text-white flex items-center gap-2">
          <DoorOpen className="h-5 w-5 text-blue-600" />
          Digital Boarding Exeat &amp; Weekend Outing Passes (`Idea 5`)
        </h2>
        <p className="text-sm text-navy-500 dark:text-navy-400">
          Request a real exeat pass for a boarder, get it approved, then use the generated QR pass number at the
          school gate to check out and back in.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-3xl border border-navy-100 dark:border-navy-800">
          <CardHeader>
            <CardTitle className="text-base">Request a pass</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StudentSearchSelect students={students} value={studentId} onChange={setStudentId} label="Boarder" />
            <div>
              <Label htmlFor="ep-reason">Reason</Label>
              <Input id="ep-reason" placeholder="e.g. Weekend home visit" value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ep-dep">Departure</Label>
                <Input id="ep-dep" type="datetime-local" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="ep-ret">Expected return</Label>
                <Input id="ep-ret" type="datetime-local" value={expectedReturnTime} onChange={(e) => setExpectedReturnTime(e.target.value)} />
              </div>
            </div>
            <Button onClick={handleRequest} disabled={requesting} className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white">
              {requesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Request pass
            </Button>
          </CardContent>
        </Card>

        {canGate && (
          <Card className="rounded-3xl border border-navy-100 dark:border-navy-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <QrCode className="h-4 w-4 text-navy-400" /> Gate check
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="gate-passno">Pass number</Label>
                <Input id="gate-passno" placeholder="e.g. EXP-1234" value={gatePassNo} onChange={(e) => setGatePassNo(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => handleGate("CHECK_OUT")} disabled={gating} variant="secondary">
                  {gating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                  Check out
                </Button>
                <Button onClick={() => handleGate("CHECK_IN")} disabled={gating} variant="secondary">
                  {gating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                  Check in
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="rounded-3xl border border-navy-100 dark:border-navy-800">
        <CardHeader>
          <CardTitle className="text-base">Exeat passes ({passes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-24 rounded-2xl" />
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">{error}</div>
          ) : passes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-navy-200 p-8 text-center text-xs text-navy-500 dark:border-navy-800">No exeat passes yet.</div>
          ) : (
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {passes.map((p) => (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-navy-100 dark:border-navy-800 px-4 py-3 text-sm">
                  <div>
                    <p className="font-semibold text-navy-900 dark:text-white">
                      {p.studentName} · <span className="font-mono text-xs">{p.passNo}</span>
                    </p>
                    <p className="text-xs text-navy-400">
                      {p.reason} · out {new Date(p.departureTime).toLocaleString("en-KE")} → back {new Date(p.expectedReturnTime).toLocaleString("en-KE")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge tone={STATUS_TONE[p.status]}>{p.status.replace("_", " ")}</Badge>
                    <Button size="sm" variant="secondary" onClick={() => setViewQr(viewQr === p.id ? null : p.id)}>
                      <QrCode className="h-3.5 w-3.5" />
                    </Button>
                    {canApprove && p.status === "PENDING" && (
                      <div className="flex gap-1">
                        <Button size="sm" onClick={() => handleApprove(p.id, "APPROVED")} disabled={busyId === p.id}>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => handleApprove(p.id, "REJECTED")} disabled={busyId === p.id}>
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {viewQr === p.id && (
                    <div className="w-full flex justify-center pt-2">
                      <img src={p.qrDataUrl} alt={`QR for ${p.passNo}`} className="h-32 w-32 rounded-xl border border-navy-200" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
