"use client";

import * as React from "react";
import { Sparkles, CheckCircle2, AlertCircle, Loader2, Zap, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { formatKES } from "@/lib/utils";

interface ScanBundleOption {
  key: "SCAN_500" | "SCAN_1500" | "SCAN_5000";
  label: string;
  scans: number;
  priceKes: number;
}

interface QuotaStatus {
  tenantId: string;
  periodKey: string;
  freeAllowance: number;
  freeAllowanceUsed: number;
  topUpScansPurchased: number;
  topUpScansUsed: number;
  totalScansAvailable: number;
  totalScansUsed: number;
  remainingScans: number;
  canScan: boolean;
  requiresTopUp: boolean;
  bundles: ScanBundleOption[];
}

export function BundiScanQuotaModal({
  open,
  onClose,
  onPurchased,
}: {
  open: boolean;
  onClose: () => void;
  onPurchased?: () => void;
}) {
  const { toast } = useToast();
  const [status, setStatus] = React.useState<QuotaStatus | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [purchasingKey, setPurchasingKey] = React.useState<string | null>(null);

  const fetchStatus = React.useCallback(async () => {
    if (!open) return;
    setLoading(true);
    try {
      const res = await fetch("/api/bundi/scan-quota");
      const json = await res.json();
      if (json.ok && json.data?.quota) {
        setStatus(json.data.quota);
      }
    } finally {
      setLoading(false);
    }
  }, [open]);

  React.useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  async function handlePurchase(bundleKey: "SCAN_500" | "SCAN_1500" | "SCAN_5000") {
    setPurchasingKey(bundleKey);
    try {
      const res = await fetch("/api/bundi/scan-quota/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bundleKey }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast({ title: json.error?.message || "Could not purchase scan top-up bundle.", tone: "error" });
        return;
      }
      toast({
        title: "Bundi OCR Scan Bundle Unlocked!",
        description: `Added ${json.data.result?.order?.scansAdded || ""} scan pages to your school balance. Billed to your term ledger.`,
        tone: "success",
      });
      if (onPurchased) onPurchased();
      onClose();
    } finally {
      setPurchasingKey(null);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center overflow-y-auto p-4 sm:p-6 animate-fade-in">
      <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 my-auto mx-auto w-full max-w-lg rounded-3xl border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-navy-800 dark:bg-navy-900/95">
        <div className="flex items-center justify-between border-b border-navy-100 pb-3 dark:border-navy-800">
          <div className="flex items-center gap-2 font-bold text-navy-950 dark:text-white">
            <Sparkles className="h-5 w-5 text-green-600 animate-pulse" />
            <span>Bundi OCR Scan Quota Top-Up Portal</span>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-800">✕</button>
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>
        ) : !status ? (
          <div className="p-8 text-center text-xs text-navy-500">Could not load scan balance right now.</div>
        ) : (
          <div className="mt-4 space-y-5">
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/40 dark:bg-amber-950/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 dark:text-amber-200 text-sm">Scan Quota Status ({status.periodKey})</span>
                <Badge tone={status.requiresTopUp ? "amber" : "green"}>
                  {status.requiresTopUp ? "Top-Up Required" : "Active Quota Available"}
                </Badge>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                Your school has utilized <strong className="font-mono">{status.totalScansUsed}</strong> out of <strong className="font-mono">{status.totalScansAvailable}</strong> total available Bundi OCR scan pages this term (`{status.freeAllowance} Free Allowance + {status.topUpScansPurchased} Top-Up`).
              </p>
              <div className="flex justify-between text-xs font-semibold pt-1 border-t border-amber-200/60 dark:border-amber-900/40">
                <span>Remaining Auto-Scan Pages:</span>
                <span className="font-mono text-base font-black text-amber-950 dark:text-white">{status.remainingScans} pages</span>
              </div>
            </div>

            <p className="text-xs text-navy-600 dark:text-navy-300">
              Pick a Scan Top-Up Bundle below to continue auto-scanning mark sheets, paper quizzes, and student forms without re-typing. Bundles roll over within the term and are billed to your school fee ledger:
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {status.bundles.map((b) => (
                <Card key={b.key} className="rounded-2xl border border-navy-100 hover:border-green-300 transition dark:border-navy-800 flex flex-col justify-between p-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-navy-400 font-mono">{b.label}</span>
                    <p className="text-xl font-black text-navy-950 dark:text-white">{formatKES(b.priceKes)}</p>
                    <p className="text-[10px] text-green-600 font-semibold">{Math.round((b.priceKes / b.scans) * 100) / 100} KES / scan</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handlePurchase(b.key)}
                    disabled={purchasingKey !== null}
                    className="mt-4 w-full rounded-full bg-green-700 hover:bg-green-800 text-white font-semibold text-xs"
                  >
                    {purchasingKey === b.key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="mr-1 h-3.5 w-3.5" />}
                    Unlock Bundle
                  </Button>
                </Card>
              ))}
            </div>

            <div className="rounded-xl bg-navy-50/60 p-3 text-[11px] text-navy-500 dark:bg-navy-900/40 dark:text-navy-400 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-green-600" />
              <span>Bundi OCR runs client/edge image compression and CAS deduplication automatically to minimize storage and scan consumption.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
