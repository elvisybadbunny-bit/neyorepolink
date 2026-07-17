"use client";

import * as React from "react";
import { DollarSign, Search, CheckCircle2, AlertCircle, Loader2, UserCheck, Smartphone, ArrowRight, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { formatKES } from "@/lib/utils";

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
            M-Pesa Suspense Ledger & Auto-Reconciler (`Orphan IPN Inbox`)
          </h2>
          <p className="text-xs text-navy-500 dark:text-navy-400">
            Automatically catches M-Pesa payments sent with typos or wrong admission numbers. Our AI & Phone fuzzy matching engine suggests top parent/student matches for instant 1-click allocation.
          </p>
        </div>
        <Badge tone={unmatchedCount > 0 ? "amber" : "green"} className="px-3 py-1 text-xs">
          {unmatchedCount} Unmatched Receipts
        </Badge>
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
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <Input
                            placeholder="Target Student ID (e.g. cmr...)"
                            value={studentIdInput[r.id] || ""}
                            onChange={(e) => setStudentIdInput((prev) => ({ ...prev, [r.id]: e.target.value }))}
                            className="h-9 text-xs font-mono max-w-[200px]"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAllocate(r.id)}
                            disabled={allocatingId === r.id || !studentIdInput[r.id]?.trim()}
                            className="rounded-full bg-green-700 hover:bg-green-800 text-white font-semibold text-xs"
                          >
                            {allocatingId === r.id ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="mr-1 h-3.5 w-3.5" />}
                            Allocate
                          </Button>
                        </div>
                      )}
                    </div>

                    {r.status === "UNMATCHED" && reasons.length > 0 && (
                      <div className="mt-3 rounded-xl border border-green-200 bg-green-50/70 p-3 dark:border-green-800 dark:bg-green-950/30">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-green-800 dark:text-green-300 flex items-center gap-1.5">
                            <Smartphone className="h-3.5 w-3.5" /> AI & Phone Fuzzy Match Suggestions ({r.matchScore}% confidence)
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
