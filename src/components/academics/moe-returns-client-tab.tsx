"use client";

import * as React from "react";
import { FileText, CheckCircle2, Loader2, Send, Download, Sparkles, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

interface MoeReturnRow {
  id: string;
  termKey: string;
  returnType: string; // FORM_A | FORM_B
  totalBoys: number;
  totalGirls: number;
  totalTeachers: number;
  classroomCount: number;
  textbookCount: number;
  crowdingIndexPct: number;
  textbookRatioStr: string;
  status: string; // DRAFT | SUBMITTED
  submittedAt: string | null;
  createdAt: string;
}

export function MoeReturnsClientTab({ canManage }: { canManage: boolean }) {
  const { toast } = useToast();
  const [returns, setReturns] = React.useState<MoeReturnRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [generating, setGenerating] = React.useState(false);
  const [submittingId, setSubmittingId] = React.useState<string | null>(null);

  const fetchReturns = React.useCallback(async () => {
    try {
      const res = await fetch("/api/academics/moe-returns");
      const json = await res.json();
      if (json.ok && json.data?.returns) {
        setReturns(json.data.returns);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  async function handleGenerate(returnType: "FORM_A" | "FORM_B") {
    setGenerating(true);
    try {
      const res = await fetch("/api/academics/moe-returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnType, termKey: "2026-T2" }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast({ title: json.error?.message || "Could not generate MOE return.", tone: "error" });
        return;
      }
      toast({
        title: `${returnType} Generated!`,
        description: `Auto-aggregated ${json.data.return?.totalBoys + json.data.return?.totalGirls || ""} active students across all classes.`,
        tone: "success",
      });
      await fetchReturns();
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit(id: string) {
    setSubmittingId(id);
    try {
      const res = await fetch("/api/academics/moe-returns/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast({ title: json.error?.message || "Could not submit return.", tone: "error" });
        return;
      }
      toast({ title: "MOE Statutory Return Submitted!", description: "Official statistical report locked and filed.", tone: "success" });
      await fetchReturns();
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-navy-950 dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Ministry of Education (`MOE`) Statutory Returns Generator (`Idea 2`)
          </h2>
          <p className="text-xs text-navy-500 dark:text-navy-400">
            Generate and file official termly Form A &amp; Form B statistical returns mandated by County Education Officers (`CDE / SCDE`). Automatically aggregates exact enrollment (`Boys vs. Girls`), teacher ratios, and textbook distribution directly from your database.
          </p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleGenerate("FORM_A")}
              disabled={generating}
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm"
            >
              {generating ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-1.5 h-3.5 w-3.5" />}
              Generate Form A (`Enrollment & Staff`)
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleGenerate("FORM_B")}
              disabled={generating}
              className="rounded-full font-semibold text-xs"
            >
              Generate Form B (`Facilities & Ratios`)
            </Button>
          </div>
        )}
      </div>

      <Card className="rounded-3xl border border-navy-100 dark:border-navy-800">
        <CardHeader>
          <CardTitle className="text-base">Generated Termly MOE Statistical Returns Ledger</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
          ) : returns.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-navy-200 p-8 text-center text-xs text-navy-500 dark:border-navy-800">
              No MOE returns generated yet for this term. Click "Generate Form A" or "Generate Form B" above to auto-compile your official statistics.
            </div>
          ) : (
            <div className="space-y-4">
              {returns.map((r) => (
                <div key={r.id} className="rounded-2xl border border-navy-100 bg-navy-50/40 p-4 dark:border-navy-800 dark:bg-navy-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-navy-950 dark:text-white text-base">{r.returnType} Report ({r.termKey})</span>
                      <Badge tone={r.status === "SUBMITTED" ? "green" : "amber"}>{r.status}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-navy-700 dark:text-navy-300 font-mono">
                      <span>Boys: <strong className="text-blue-600">{r.totalBoys}</strong></span>
                      <span>Girls: <strong className="text-pink-600">{r.totalGirls}</strong></span>
                      <span>Total Students: <strong>{r.totalBoys + r.totalGirls}</strong></span>
                      <span>Teachers: <strong>{r.totalTeachers}</strong></span>
                      <span>Textbook Ratio: <strong className="text-green-700 dark:text-green-400">{r.textbookRatioStr}</strong></span>
                      <span>Crowding Index: <strong>{r.crowdingIndexPct}%</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" className="rounded-full text-xs" onClick={() => window.print()}>
                      <Download className="mr-1.5 h-3.5 w-3.5" /> Print / PDF (`⌘P`)
                    </Button>
                    {r.status === "DRAFT" && canManage && (
                      <Button
                        size="sm"
                        onClick={() => handleSubmit(r.id)}
                        disabled={submittingId === r.id}
                        className="rounded-full bg-green-700 hover:bg-green-800 text-white font-semibold text-xs"
                      >
                        {submittingId === r.id ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />}
                        Submit to MOE / County
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
