"use client";

import * as React from "react";
import { HardDrive, Database, Archive, Sparkles, Loader2, Play, CheckCircle2, Cloud } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { formatKES } from "@/lib/utils";

interface StorageTierSummary {
  tenantId: string;
  tenantName: string;
  hotNvmeFiles: number;
  hotNvmeBytes: number;
  warmCompressedFiles: number;
  warmCompressedBytes: number;
  coldAlumniFiles: number;
  coldAlumniBytes: number;
  totalSavedBytes: number;
}

function formatBytes(bytes: number) {
  if (bytes >= 1_000_000_000) return (bytes / 1_000_000_000).toFixed(2) + " GB";
  if (bytes >= 1_000_000) return (bytes / 1_000_000).toFixed(1) + " MB";
  if (bytes >= 1_000) return Math.round(bytes / 1000) + " KB";
  return bytes + " B";
}

export function StorageArchiveTiersOpsTab() {
  const { toast } = useToast();
  const [summaries, setSummaries] = React.useState<StorageTierSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [running, setRunning] = React.useState(false);

  const fetchTiers = React.useCallback(async () => {
    try {
      const res = await fetch("/api/founder-ops/storage-archive-tiers");
      const json = await res.json();
      if (json.ok && json.data?.summaries) {
        setSummaries(json.data.summaries);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTiers();
  }, [fetchTiers]);

  async function handleRunAll() {
    setRunning(true);
    try {
      const res = await fetch("/api/founder-ops/storage-archive-tiers", { method: "POST" });
      const json = await res.json();
      if (json.ok && json.data?.summaries) {
        setSummaries(json.data.summaries);
        toast({ title: "3-Tier Lifecycle Archival Complete!", description: "Categorized hot, warm, and cold alumni files across all active schools.", tone: "success" });
      }
    } finally {
      setRunning(false);
    }
  }

  const totalHotBytes = summaries.reduce((s, x) => s + x.hotNvmeBytes, 0);
  const totalWarmBytes = summaries.reduce((s, x) => s + x.warmCompressedBytes, 0);
  const totalColdBytes = summaries.reduce((s, x) => s + x.coldAlumniBytes, 0);
  const totalSaved = summaries.reduce((s, x) => s + x.totalSavedBytes, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-navy-950 dark:text-white flex items-center gap-2">
            <Archive className="h-5 w-5 text-green-600" />
            3-Tier Storage Lifecycle &amp; Cold-Vault Offloading Engine
          </h2>
          <p className="text-xs text-navy-500 dark:text-navy-400">
            Automates global storage optimization across schools by migrating files between Hot NVMe (&lt;12 mo), Warm Compressed (1-3 yr, 60% savings), and Alumni Cold Glacier Vault (&gt;3 yr, 85% savings).
          </p>
        </div>
        <Button onClick={handleRunAll} disabled={running} className="rounded-full bg-green-700 hover:bg-green-800 text-white font-semibold shadow-sm">
          {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
          Run Global Lifecycle Sweep Now
        </Button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="rounded-3xl border border-navy-100 dark:border-navy-800 bg-white/80 dark:bg-navy-900/70 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400">Hot NVMe Storage (&lt;12 mo)</span>
          <p className="mt-1 text-2xl font-black text-navy-950 dark:text-white">{formatBytes(totalHotBytes)}</p>
          <p className="text-[10px] text-green-600 font-semibold">Active school year records</p>
        </Card>
        <Card className="rounded-3xl border border-navy-100 dark:border-navy-800 bg-white/80 dark:bg-navy-900/70 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400">Warm Compressed (1-3 yr)</span>
          <p className="mt-1 text-2xl font-black text-blue-600 dark:text-blue-400">{formatBytes(totalWarmBytes)}</p>
          <p className="text-[10px] text-blue-500 font-semibold">60% space compressed</p>
        </Card>
        <Card className="rounded-3xl border border-navy-100 dark:border-navy-800 bg-white/80 dark:bg-navy-900/70 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400">Alumni Cold Vault (&gt;3 yr)</span>
          <p className="mt-1 text-2xl font-black text-purple-600 dark:text-purple-400">{formatBytes(totalColdBytes)}</p>
          <p className="text-[10px] text-purple-500 font-semibold">85% offloaded to low-cost storage</p>
        </Card>
        <Card className="rounded-3xl border border-green-200 bg-green-50/70 dark:border-green-800 dark:bg-green-950/20 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-green-800 dark:text-green-300 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-green-600" /> Total Storage Space Saved
          </span>
          <p className="mt-1 text-2xl font-black text-green-800 dark:text-green-300">{formatBytes(totalSaved)}</p>
          <p className="text-[10px] text-green-700 dark:text-green-400 font-semibold">Cloudflare R2 cost minimized</p>
        </Card>
      </div>

      <Card className="rounded-3xl border border-navy-100 dark:border-navy-800">
        <CardHeader>
          <CardTitle className="text-base">Per-School Storage Tier Allocation Ledger</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>
          ) : summaries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-navy-200 p-8 text-center text-xs text-navy-500 dark:border-navy-800">
              No storage tier data found. Click "Run Global Lifecycle Sweep Now" above to categorize school files.
            </div>
          ) : (
            <div className="space-y-3">
              {summaries.map((s) => (
                <div key={s.tenantId} className="rounded-2xl border border-navy-100 bg-navy-50/40 p-4 dark:border-navy-800 dark:bg-navy-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-navy-950 dark:text-white text-sm">{s.tenantName}</h3>
                    <p className="text-xs text-navy-500 dark:text-navy-400">
                      Total Files: <strong className="font-mono">{s.hotNvmeFiles + s.warmCompressedFiles + s.coldAlumniFiles}</strong> • Net Space Saved: <strong className="text-green-600 font-mono">{formatBytes(s.totalSavedBytes)}</strong>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-mono">
                    <Badge tone="green" className="px-2.5 py-1">Hot: {formatBytes(s.hotNvmeBytes)} ({s.hotNvmeFiles})</Badge>
                    <Badge tone="blue" className="px-2.5 py-1">Warm: {formatBytes(s.warmCompressedBytes)} ({s.warmCompressedFiles})</Badge>
                    <Badge tone="neutral" className="px-2.5 py-1">Cold Alumni: {formatBytes(s.coldAlumniBytes)} ({s.coldAlumniFiles})</Badge>
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
