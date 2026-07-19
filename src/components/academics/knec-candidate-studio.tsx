"use client";

import * as React from "react";
import { Sparkles, Award, Users, CheckCircle2, Loader2, Download, AlertCircle, FileSpreadsheet, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

interface CandidateRow {
  id: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  knecCentreCode: string;
  candidateType: string; // KCSE | KJSEA
  indexNumber: string; // e.g. "20401001/001"
  photo300x300Url: string | null;
  meritRank: number | null;
  status: string;
  createdAt: string;
}

interface ExamOption {
  id: string;
  title: string;
  term: number;
  year: number;
  type: string;
}

export function KnecCandidateStudio({ canManage }: { canManage: boolean }) {
  const { toast } = useToast();
  const [candidates, setCandidates] = React.useState<CandidateRow[]>([]);
  const [exams, setExams] = React.useState<ExamOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [registering, setRegistering] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);

  // Studio form controls
  const [centreCode, setCentreCode] = React.useState("20401001");
  const [candidateType, setCandidateType] = React.useState<"KCSE" | "KJSEA">("KCSE");
  const [indexingMode, setIndexingMode] = React.useState<"ADMISSION_ORDER" | "EXAM_MERIT">("ADMISSION_ORDER");
  const [placementExamId, setPlacementExamId] = React.useState<string>("");

  const fetchData = React.useCallback(async () => {
    try {
      const [candRes, examRes] = await Promise.all([
        fetch(`/api/academics/knec-candidates?candidateType=${candidateType}`).then((r) => r.json()),
        fetch("/api/academics/exams").then((r) => r.json()).catch(() => ({ ok: false })),
      ]);
      if (candRes.ok && candRes.data?.candidates) {
        setCandidates(candRes.data.candidates);
      }
      if (examRes.ok && examRes.data?.exams) {
        setExams(examRes.data.exams);
      }
    } finally {
      setLoading(false);
    }
  }, [candidateType]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleRegister(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!centreCode.trim() || centreCode.trim().length < 5) {
      toast({ title: "Enter a valid KNEC School Centre Code (e.g. 20401001)", tone: "error" });
      return;
    }
    if (indexingMode === "EXAM_MERIT" && !placementExamId) {
      toast({ title: "Please select an exam to rank candidate index numbers by performance merit", tone: "error" });
      return;
    }

    setRegistering(true);
    try {
      const res = await fetch("/api/academics/knec-candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          knecCentreCode: centreCode.trim(),
          candidateType,
          indexingMode,
          placementExamId: indexingMode === "EXAM_MERIT" ? placementExamId : undefined,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast({ title: json.error?.message || "Could not register candidate index numbers.", tone: "error" });
        return;
      }
      toast({
        title: "KNEC Candidate Index Numbers Assigned!",
        description: `Indexed ${json.data.totalRegistered || candidates.length} candidates (${indexingMode === "EXAM_MERIT" ? "By Exam Merit Ranking" : "By Admission Order"}).`,
        tone: "success",
      });
      await fetchData();
    } finally {
      setRegistering(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch(`/api/academics/knec-candidates/export?candidateType=${candidateType}`);
      const json = await res.json();
      if (!json.ok) {
        toast({ title: json.error?.message || "Could not generate KNEC manifest.", tone: "error" });
        return;
      }
      // Download or display manifest summary
      toast({
        title: "KNEC Candidate Manifest Exported!",
        description: `Generated official registration CSV + 300x300 photo manifest for ${json.data.count || candidates.length} candidates.`,
        tone: "success",
      });
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-navy-950 dark:text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-green-600" />
            KNEC / KJSEA Candidate Index Studio
          </h2>
          <p className="text-xs text-navy-500 dark:text-navy-400">
            Enter your official KNEC School Centre Code and assign candidate index numbers either sequentially by student admission order (`/001 → /180`) OR dynamically ranked by performance merit in a selected placement exam. Includes 300x300 photo index imprinting and official KNEC CSV exports.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleExport}
            disabled={exporting || candidates.length === 0}
            className="rounded-full text-xs font-semibold"
          >
            {exporting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Download className="mr-1.5 h-4 w-4 text-green-600" />}
            Export KNEC Manifest CSV &amp; Photos
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="rounded-3xl border border-navy-100 dark:border-navy-800 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-green-600" />
              Configure Candidate Indexing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="centreCode">Official KNEC Centre Code *</Label>
                <Input
                  id="centreCode"
                  placeholder="e.g. 20401001"
                  value={centreCode}
                  onChange={(e) => setCentreCode(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label>Candidate Exam Type *</Label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  {(["KCSE", "KJSEA"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setCandidateType(t)}
                      className={`rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${candidateType === t ? "border-green-500 bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-200" : "border-navy-200 text-navy-500 hover:bg-navy-50 dark:border-navy-700 dark:text-navy-400"}`}
                    >
                      {t} (`{t === "KCSE" ? "Form 4" : "Grade 9"}`)
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Candidate Indexing Order *</Label>
                <div className="mt-1 grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => setIndexingMode("ADMISSION_ORDER")}
                    className={`rounded-xl border p-3 text-left text-xs transition-colors ${indexingMode === "ADMISSION_ORDER" ? "border-green-500 bg-green-50/80 text-green-900 dark:bg-green-950/40 dark:text-green-200" : "border-navy-200 text-navy-600 hover:bg-navy-50 dark:border-navy-700 dark:text-navy-300"}`}
                  >
                    <div className="font-bold">Option A: By Admission / Alphabetical Order</div>
                    <p className="text-[11px] opacity-80 mt-0.5">Assigns /001, /002 sequentially sorted by student admission numbers.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIndexingMode("EXAM_MERIT")}
                    className={`rounded-xl border p-3 text-left text-xs transition-colors ${indexingMode === "EXAM_MERIT" ? "border-blue-500 bg-blue-50/80 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200" : "border-navy-200 text-navy-600 hover:bg-navy-50 dark:border-navy-700 dark:text-navy-300"}`}
                  >
                    <div className="font-bold">Option B: By Exam Merit Ranking (`Performance`)</div>
                    <p className="text-[11px] opacity-80 mt-0.5">Rank 1 in the selected placement exam gets Index /001, Rank 2 gets /002.</p>
                  </button>
                </div>
              </div>

              {indexingMode === "EXAM_MERIT" && (
                <div>
                  <Label htmlFor="placementExamId">Select Merit Placement Exam *</Label>
                  <select
                    id="placementExamId"
                    value={placementExamId}
                    onChange={(e) => setPlacementExamId(e.target.value)}
                    className="w-full h-10 rounded-2xl border border-navy-200 bg-white px-3 text-xs font-semibold dark:border-navy-700 dark:bg-navy-900"
                    required
                  >
                    <option value="">-- Choose past internal exam --</option>
                    {exams.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.title} (Term {ex.term} {ex.year} • {ex.type})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {canManage && (
                <Button
                  type="submit"
                  disabled={registering}
                  className="w-full rounded-full bg-green-700 hover:bg-green-800 text-white font-semibold shadow-sm"
                >
                  {registering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Award className="mr-2 h-4 w-4" />}
                  Assign Index Numbers (`/001 → /{candidates.length || "180"}`)
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-navy-100 dark:border-navy-800 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>{candidateType} Registered Candidate Index Roster ({candidates.length})</span>
              <Badge tone="green" className="font-mono text-xs">{centreCode} Centre</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>
            ) : candidates.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-navy-200 p-8 text-center text-xs text-navy-500 dark:border-navy-800">
                No indexed candidates yet for {candidateType}. Fill in your KNEC School Centre Code (`20401001`) and click Assign above to generate your official candidate roster.
              </div>
            ) : (
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {candidates.map((c) => (
                  <div key={c.id} className="rounded-2xl border border-navy-100 bg-navy-50/40 p-3.5 dark:border-navy-800 dark:bg-navy-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-500/10 font-mono font-black text-green-700 dark:text-green-400 text-xs shrink-0 border border-green-500/20">
                        {c.indexNumber.split("/")[1] || c.indexNumber}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-navy-950 dark:text-white text-sm">{c.studentName}</span>
                          <Badge tone="neutral" className="font-mono text-[10px]">{c.admissionNo}</Badge>
                        </div>
                        <p className="text-xs font-mono text-green-700 dark:text-green-400 font-bold">
                          Index No: {c.indexNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      {c.meritRank !== null && (
                        <Badge tone="blue" className="text-xs">
                          Merit Rank #{c.meritRank}
                        </Badge>
                      )}
                      <Badge tone={c.photo300x300Url ? "green" : "amber"} className="text-[11px]">
                        {c.photo300x300Url ? "✓ 300x300 Photo Imprinted" : "No Photo"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
