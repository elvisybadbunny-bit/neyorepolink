"use client";

/**
 * Idea 3 (kenyan-extensions.service.ts) — Post-Dated Checks & Bank Deposit
 * Clearing Grid. Real backend existed (TreasuryCheckAndBankSlip model,
 * /api/finance/treasury-checks[/clear]) with ZERO frontend UI until this
 * fix — found during a full-stack audit of a prior AI session's "12
 * operational suites" commit. Lets the bursar record a post-dated check or
 * a bank deposit slip a parent has handed in, then mark it cleared once
 * the bank confirms — automatically posting a real student payment when
 * a check is linked to a student.
 */
import * as React from "react";
import { Banknote, Plus, Loader2, CheckCircle2, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { StudentSearchSelect, type StudentSearchOption } from "@/components/students/student-search-select";

const kes = (n: number) => `KES ${n.toLocaleString("en-KE")}`;

interface CheckRow {
  id: string;
  checkOrSlipNo: string;
  bankName: string;
  maturityDate: string;
  amountKes: number;
  studentId: string | null;
  status: "PENDING_CLEARANCE" | "CLEARED" | "BOUNCED";
  clearedAt: string | null;
  clearedBy: string | null;
}

const STATUS_TONE: Record<string, "amber" | "green" | "red"> = { PENDING_CLEARANCE: "amber", CLEARED: "green", BOUNCED: "red" };

export function TreasuryCheckSuite({ students }: { students: StudentSearchOption[] }) {
  const { toast } = useToast();
  const [checks, setChecks] = React.useState<CheckRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [clearingId, setClearingId] = React.useState<string | null>(null);

  const [checkOrSlipNo, setCheckOrSlipNo] = React.useState("");
  const [bankName, setBankName] = React.useState("");
  const [maturityDate, setMaturityDate] = React.useState("");
  const [amountKes, setAmountKes] = React.useState("");
  const [studentId, setStudentId] = React.useState("");

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/finance/treasury-checks")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setChecks(j.data.checks ?? []);
        else setError(j.error?.message || "Could not load treasury checks.");
      })
      .catch(() => setError("Network request failed"))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleCreate() {
    if (!checkOrSlipNo.trim() || !bankName.trim() || !maturityDate || !amountKes) {
      toast({ title: "Check/slip number, bank, maturity date, and amount are required", tone: "error" });
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/finance/treasury-checks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkOrSlipNo: checkOrSlipNo.trim(),
          bankName: bankName.trim(),
          maturityDate,
          amountKes: Number(amountKes),
          studentId: studentId || undefined,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: "Check / bank slip recorded", tone: "success" });
        setCheckOrSlipNo("");
        setBankName("");
        setMaturityDate("");
        setAmountKes("");
        setStudentId("");
        load();
      } else {
        toast({ title: json.error?.message || "Could not record check", tone: "error" });
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleClear(id: string) {
    setClearingId(id);
    try {
      const res = await fetch("/api/finance/treasury-checks/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: "Marked cleared — payment posted", tone: "success" });
        load();
      } else {
        toast({ title: json.error?.message || "Could not clear check", tone: "error" });
      }
    } finally {
      setClearingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-navy-950 dark:text-white flex items-center gap-2">
          <Banknote className="h-5 w-5 text-green-600" />
          Treasury Bank Clearing &amp; Check Vault
        </h2>
        <p className="text-sm text-navy-500 dark:text-navy-400">
          Record a post-dated check or bank deposit slip a parent has handed in, track it until the bank confirms
          clearance, then mark it cleared to automatically post the payment to the student's fee balance.
        </p>
      </div>

      <Card className="rounded-3xl border border-navy-100 dark:border-navy-800">
        <CardHeader>
          <CardTitle className="text-base">Record a check / bank slip</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="tc-no">Check / slip number</Label>
              <Input id="tc-no" placeholder="e.g. 004521" value={checkOrSlipNo} onChange={(e) => setCheckOrSlipNo(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="tc-bank">Bank name</Label>
              <Input id="tc-bank" placeholder="e.g. Equity Bank" value={bankName} onChange={(e) => setBankName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="tc-maturity">Maturity date</Label>
              <Input id="tc-maturity" type="date" value={maturityDate} onChange={(e) => setMaturityDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="tc-amount">Amount (KES)</Label>
              <Input id="tc-amount" type="number" min={1} placeholder="e.g. 15000" value={amountKes} onChange={(e) => setAmountKes(e.target.value)} />
            </div>
          </div>
          <StudentSearchSelect students={students} value={studentId} onChange={setStudentId} label="Link to a student (optional)" required={false} />
          <Button onClick={handleCreate} disabled={creating} className="rounded-full bg-green-700 hover:bg-green-800 text-white">
            {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Record check / slip
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border border-navy-100 dark:border-navy-800">
        <CardHeader>
          <CardTitle className="text-base">Clearing grid ({checks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-24 rounded-2xl" />
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">{error}</div>
          ) : checks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-navy-200 p-8 text-center text-xs text-navy-500 dark:border-navy-800">
              No checks or bank slips recorded yet.
            </div>
          ) : (
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {checks.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-navy-100 dark:border-navy-800 px-4 py-3 text-sm">
                  <div>
                    <p className="font-semibold text-navy-900 dark:text-white">{c.checkOrSlipNo} · {c.bankName}</p>
                    <p className="text-xs text-navy-400">
                      Matures {new Date(c.maturityDate).toLocaleDateString("en-KE")}
                      {c.clearedAt ? ` · cleared ${new Date(c.clearedAt).toLocaleDateString("en-KE")} by ${c.clearedBy}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-navy-900 dark:text-white">{kes(c.amountKes)}</span>
                    <Badge tone={STATUS_TONE[c.status]} className="flex items-center gap-1">
                      {c.status === "CLEARED" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />} {c.status.replace("_", " ")}
                    </Badge>
                    {c.status === "PENDING_CLEARANCE" && (
                      <Button size="sm" onClick={() => handleClear(c.id)} disabled={clearingId === c.id}>
                        {clearingId === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        Mark cleared
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
