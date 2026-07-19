"use client";

import * as React from "react";
import { DollarSign, CheckCircle2, Loader2, Smartphone, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { formatKES } from "@/lib/utils";

interface StudentMatch { id: string; admissionNo: string; firstName: string; lastName: string }

interface SuspenseReceipt {
  id: string;
  transId: string;
  transTime: string;
  transAmount: number;
  billRefNumber: string;
  mpesaSenderPhone: string;
  mpesaSenderName: string;
  status: string; // UNMATCHED | ALLOCATED | REFUNDED
  allocatedToStudentId: string | null;
  matchScore: number;
  matchReasonsJson: string;
  createdAt: string;
}

export function MpesaSuspenseClientTab({ canManage }: { canManage: boolean }) {
  const { toast } = useToast();
  const [receipts, setReceipts] = React.useState<SuspenseReceipt[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [allocatingId, setAllocatingId] = React.useState<string | null>(null);
  const [studentIdInput, setStudentIdInput] = React.useState<Record<string, string>>({});
  const [studentQueries, setStudentQueries] = React.useState<Record<string, string>>({});
  const [studentMatches, setStudentMatches] = React.useState<Record<string, StudentMatch[]>>({});
  const [importing, setImporting] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const fetchSuspense = React.useCallback(async () => {
    try {
      const res = await fetch("/api/finance/mpesa-suspense");
      const json = await res.json();
      if (json.ok && json.data?.receipts) {
        setReceipts(json.data.receipts);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSuspense();
  }, [fetchSuspense]);

  async function importStatement(file: File) {
    setImporting(true);
    try {
      const res = await fetch("/api/finance/mpesa-suspense/import", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: await file.text() }),
      });
      const json = await res.json();
      if (!json.ok) { toast({ title: json.error?.message || "Could not import statement.", tone: "error" }); return; }
      toast({ title: `${json.data.imported} receipt(s) imported for review`, description: `${json.data.duplicates} duplicate(s) skipped; ${json.data.rejected} row(s) rejected.`, tone: "success" });
      await fetchSuspense();
    } finally { setImporting(false); if (fileRef.current) fileRef.current.value = ""; }
  }

  async function searchStudents(suspenseId: string, query: string) {
    setStudentQueries((old) => ({ ...old, [suspenseId]: query }));
    if (query.trim().length < 2) { setStudentMatches((old) => ({ ...old, [suspenseId]: [] })); return; }
    const res = await fetch(`/api/finance/mpesa-suspense/student-search?q=${encodeURIComponent(query)}`);
    const json = await res.json();
    setStudentMatches((old) => ({ ...old, [suspenseId]: json.ok ? json.data.students : [] }));
  }

  async function handleAllocate(suspenseId: string) {
    const stId = studentIdInput[suspenseId]?.trim();
    if (!stId) {
      toast({ title: "Please enter the target Student ID or select a suggested match.", tone: "error" });
      return;
    }
    setAllocatingId(suspenseId);
    try {
      const res = await fetch("/api/finance/mpesa-suspense/allocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suspenseId, targetStudentId: stId }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast({ title: json.error?.message || "Could not allocate receipt.", tone: "error" });
        return;
      }
      toast({ title: "M-Pesa Receipt Allocated!", description: `KES ${json.data.receipt?.transAmount || ""} credited to student ledger.`, tone: "success" });
      await fetchSuspense();
    } finally {
      setAllocatingId(null);
    }
  }

  const unmatchedCount = receipts.filter((r) => r.status === "UNMATCHED").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-navy-950 dark:text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            M-Pesa suspense and reconciliation
          </h2>
          <p className="text-xs text-navy-500 dark:text-navy-400">
            Import Paybill statements, review uncertain references and confirm each payment before it reaches a student ledger.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canManage && <><input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importStatement(file); }}/><Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()} disabled={importing}>{importing ? <Loader2 className="h-4 w-4 animate-spin"/> : <Upload className="h-4 w-4"/>}Import M-Pesa CSV</Button></>}
          <Badge tone={unmatchedCount > 0 ? "amber" : "green"} className="px-3 py-1 text-xs">{unmatchedCount} unmatched receipts</Badge>
        </div>
      </div>

      <Card className="rounded-3xl border border-navy-100 dark:border-navy-800">
        <CardHeader>
          <CardTitle className="text-base">Suspense & Reconciled Receipts Ledger</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>
          ) : receipts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-navy-200 p-8 text-center text-xs text-navy-500 dark:border-navy-800">
              No unmatched suspense receipts found right now. All M-Pesa Paybill/STK receipts are cleanly reconciled.
            </div>
          ) : (
            <div className="space-y-4">
              {receipts.map((r) => {
                let reasons: string[] = [];
                try {
                  reasons = JSON.parse(r.matchReasonsJson || "[]");
                } catch {
                  // ignore
                }

                return (
                  <div key={r.id} className={`rounded-2xl border p-4 transition-all ${r.status === "UNMATCHED" ? "border-amber-200 bg-amber-50/20 dark:border-amber-900/40 dark:bg-amber-950/10" : "border-navy-100 bg-navy-50/30 dark:border-navy-800 dark:bg-navy-900/30"}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-navy-950 dark:text-white font-mono text-base">{r.transId}</span>
                          <Badge tone={r.status === "ALLOCATED" ? "green" : "amber"}>{r.status}</Badge>
                          <span className="font-black text-green-700 dark:text-green-400 font-mono text-base">{formatKES(r.transAmount)}</span>
                        </div>
                        <p className="text-xs text-navy-700 dark:text-navy-300">
                          Sender: <strong className="font-mono">{r.mpesaSenderName}</strong> ({r.mpesaSenderPhone}) • BillRef/Admission Entered: <strong className="font-mono text-amber-600 dark:text-amber-400">{r.billRefNumber}</strong>
                        </p>
                        <p className="text-[11px] text-navy-400 font-mono">
                          Received: {r.transTime || new Date(r.createdAt).toLocaleString("en-KE")}
                        </p>
                      </div>

                      {r.status === "UNMATCHED" && canManage && (
                        <div className="w-full space-y-2 sm:w-80">
                          <div className="flex items-center gap-2">
                            <Input placeholder="Search name or admission number" value={studentQueries[r.id] || ""} onChange={(e) => void searchStudents(r.id, e.target.value)} className="h-9 text-xs" />
                            <Button size="sm" onClick={() => handleAllocate(r.id)} disabled={allocatingId === r.id || !studentIdInput[r.id]} className="rounded-full bg-green-700 text-xs font-semibold text-white hover:bg-green-800">{allocatingId === r.id ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin"/> : <CheckCircle2 className="mr-1 h-3.5 w-3.5"/>}Confirm</Button>
                          </div>
                          {(studentMatches[r.id]?.length || 0) > 0 && <div className="rounded-xl border bg-white p-1 shadow-sm dark:border-navy-700 dark:bg-navy-900">{studentMatches[r.id].map((student) => <button type="button" key={student.id} onClick={() => { setStudentIdInput((old) => ({ ...old, [r.id]: student.id })); setStudentQueries((old) => ({ ...old, [r.id]: `${student.firstName} ${student.lastName} — ${student.admissionNo}` })); setStudentMatches((old) => ({ ...old, [r.id]: [] })); }} className="block w-full rounded-lg px-2 py-1.5 text-left text-xs hover:bg-green-50 dark:hover:bg-navy-800"><strong>{student.firstName} {student.lastName}</strong><span className="ml-2 font-mono text-navy-500">{student.admissionNo}</span></button>)}</div>}
                        </div>
                      )}
                    </div>

                    {r.status === "UNMATCHED" && reasons.length > 0 && (
                      <div className="mt-3 rounded-xl border border-green-200 bg-green-50/70 p-3 dark:border-green-800 dark:bg-green-950/30">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-green-800 dark:text-green-300 flex items-center gap-1.5">
                            <Smartphone className="h-3.5 w-3.5" /> Possible phone and reference matches ({r.matchScore}% confidence)
                          </span>
                        </div>
                        <ul className="mt-1.5 space-y-1 text-[11px] text-green-700 dark:text-green-400 font-mono">
                          {reasons.map((reasonStr, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span>•</span>
                              <span>{reasonStr}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
