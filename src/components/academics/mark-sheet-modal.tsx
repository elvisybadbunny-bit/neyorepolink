"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  Printer,
  Camera,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Loader2,
  RefreshCw,
  HelpCircle,
  Save,
} from "lucide-react";
import type {
  MarkSheetPrintData,
  MarkSheetScanResult,
  MarkSheetDeltaRow,
} from "@/lib/validations/mark-sheet";

interface MarkSheetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examId: string;
  examName: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  maxMarks?: number;
  onApplied?: () => void;
}

export function MarkSheetModal({
  open,
  onOpenChange,
  examId,
  examName,
  subjectId,
  subjectName,
  classId,
  className,
  maxMarks = 100,
  onApplied,
}: MarkSheetModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState<"PRINT" | "SCAN">("PRINT");

  // Print state
  const [printData, setPrintData] = React.useState<MarkSheetPrintData | null>(null);
  const [printLoading, setPrintLoading] = React.useState(false);

  // Scan state
  const [scanResult, setScanResult] = React.useState<MarkSheetScanResult | null>(null);
  const [scanLoading, setScanLoading] = React.useState(false);
  const [applyLoading, setApplyLoading] = React.useState(false);
  const [editedDeltas, setEditedDeltas] = React.useState<Map<string, number | null>>(new Map());
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (open && examId && subjectId && classId && activeTab === "PRINT") {
      setPrintLoading(true);
      fetch(
        `/api/academics/mark-sheets/print?examId=${encodeURIComponent(examId)}&subjectId=${encodeURIComponent(subjectId)}&classId=${encodeURIComponent(classId)}`
      )
        .then((r) => r.json())
        .then((j) => {
          if (j.ok) {
            setPrintData(j.data);
          } else {
            toast({ title: j.error?.message || "Failed to load printable mark sheet", tone: "error" });
          }
        })
        .catch(() => {
          toast({ title: "Network error loading printable sheet", tone: "error" });
        })
        .finally(() => setPrintLoading(false));
    }
  }, [open, examId, subjectId, classId, activeTab, toast]);

  function handleTriggerPrint() {
    window.print();
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanLoading(true);
    setScanResult(null);
    setEditedDeltas(new Map());

    const formData = new FormData();
    formData.append("file", file);
    formData.append("examId", examId);
    formData.append("subjectId", subjectId);
    formData.append("classId", classId);

    try {
      const res = await fetch("/api/academics/mark-sheets/scan", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.ok) {
        setScanResult(json.data);
        const initialEdits = new Map<string, number | null>();
        for (const row of json.data.rows) {
          initialEdits.set(row.studentId, row.newMark);
        }
        setEditedDeltas(initialEdits);
        toast({
          title: `Scan processed: ${json.data.changedDeltaCount} deltas detected`,
          tone: "success",
        });
      } else {
        toast({ title: json.error?.message || "Scan failed", tone: "error" });
      }
    } catch {
      toast({ title: "Network error during scan processing", tone: "error" });
    } finally {
      setScanLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleRowMarkChange(studentId: string, val: string) {
    const clean = val.trim();
    if (clean === "") {
      setEditedDeltas((prev) => new Map(prev).set(studentId, null));
      return;
    }
    const num = parseInt(clean, 10);
    if (!isNaN(num) && num >= 0 && num <= maxMarks) {
      setEditedDeltas((prev) => new Map(prev).set(studentId, num));
    }
  }

  async function handleApplyConfirmedDeltas() {
    if (!scanResult) return;
    setApplyLoading(true);

    const payloadDeltas = scanResult.rows.map((r) => {
      const currentVal = editedDeltas.get(r.studentId) ?? r.newMark;
      let status = r.status;
      if (currentVal !== r.oldMark && currentVal !== null) {
        status = "CHANGED_DELTA";
      } else if (currentVal === r.oldMark && currentVal !== null) {
        status = "UNCHANGED";
      }
      return {
        studentId: r.studentId,
        oldMark: r.oldMark,
        newMark: currentVal,
        status,
      };
    });

    try {
      const res = await fetch("/api/academics/mark-sheets/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId,
          subjectId,
          classId,
          deltas: payloadDeltas,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({
          title: `Successfully applied ${json.data.updatedCount} updated scores (${json.data.newCount} new)`,
          tone: "success",
        });
        if (onApplied) onApplied();
        onOpenChange(false);
      } else {
        toast({ title: json.error?.message || "Failed to apply mark deltas", tone: "error" });
      }
    } catch {
      toast({ title: "Network error saving marks", tone: "error" });
    } finally {
      setApplyLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto rounded-2xl bg-white/95 backdrop-blur-xl dark:bg-navy-900/95">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-navy-900 dark:text-white">
                Physical Mark Sheet & Scan-to-Enter
              </DialogTitle>
              <p className="text-xs text-navy-500 dark:text-navy-400">
                {examName} · {subjectName} ({className}) · Max Marks: {maxMarks}
              </p>
            </div>
            <div className="flex rounded-full bg-navy-100 p-1 dark:bg-navy-800">
              <button
                type="button"
                onClick={() => setActiveTab("PRINT")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  activeTab === "PRINT"
                    ? "bg-white text-navy-900 shadow-sm dark:bg-navy-700 dark:text-white"
                    : "text-navy-600 hover:text-navy-900 dark:text-navy-400 dark:hover:text-white"
                }`}
              >
                <Printer className="h-3.5 w-3.5" /> Print Sheet
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("SCAN")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  activeTab === "SCAN"
                    ? "bg-white text-navy-900 shadow-sm dark:bg-navy-700 dark:text-white"
                    : "text-navy-600 hover:text-navy-900 dark:text-navy-400 dark:hover:text-white"
                }`}
              >
                <Camera className="h-3.5 w-3.5" /> Scan & Auto-Enter
              </button>
            </div>
          </div>
        </DialogHeader>

        {activeTab === "PRINT" && (
          <div className="space-y-4 pt-2">
            {printLoading ? (
              <div className="flex h-48 items-center justify-center space-x-2 text-navy-500">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-sm">Generating printable sheet…</span>
              </div>
            ) : printData ? (
              <>
                <div className="flex items-center justify-between rounded-xl border border-navy-200 bg-warm-50/60 p-3 dark:border-navy-700 dark:bg-navy-800/50">
                  <div>
                    <p className="text-xs font-semibold text-navy-800 dark:text-navy-200">
                      Document Tracking Code: <code className="font-mono text-emerald-600 dark:text-emerald-400">{printData.trackingRef}</code>
                    </p>
                    <p className="text-[11px] text-navy-500 dark:text-navy-400">
                      When teachers fill out and scan this exact paper, NEYO auto-detects the class and subject immediately.
                    </p>
                  </div>
                  <Button onClick={handleTriggerPrint} className="rounded-full gap-2">
                    <Printer className="h-4 w-4" /> Print (`⌘P`)
                  </Button>
                </div>

                {/* Printable HTML Sheet Box */}
                <div id="printable-mark-sheet" className="rounded-xl border border-navy-300 bg-white p-6 text-black dark:border-navy-700 dark:bg-white dark:text-black">
                  <div className="border-b-2 border-black pb-4 text-center font-sans">
                    <h2 className="text-xl font-bold uppercase tracking-wider">{printData.schoolName}</h2>
                    <h3 className="text-lg font-semibold mt-1">{printData.examName} ({printData.year} - Term {printData.term})</h3>
                    <div className="mt-2 flex justify-between text-sm font-medium border border-black p-2 rounded">
                      <span><strong>Class:</strong> {printData.className}</span>
                      <span><strong>Subject:</strong> {printData.subjectName} ({printData.subjectCode})</span>
                      <span><strong>Max Marks:</strong> {printData.maxMarks}</span>
                    </div>
                    <p className="mt-1 text-[10px] font-mono tracking-tighter text-gray-700">
                      REF: {printData.trackingRef}
                    </p>
                  </div>

                  <table className="w-full mt-4 border-collapse border border-black text-sm">
                    <thead>
                      <tr className="bg-gray-100 font-bold border-b border-black">
                        <th className="border border-black px-2 py-2 text-center w-12">No.</th>
                        <th className="border border-black px-3 py-2 text-left w-36">Adm No.</th>
                        <th className="border border-black px-3 py-2 text-left">Student Full Name</th>
                        <th className="border border-black px-3 py-2 text-center w-32">Current Mark</th>
                        <th className="border border-black px-3 py-2 text-center w-36 bg-white">New Score / Mark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {printData.students.map((s, idx) => (
                        <tr key={s.studentId} className="border-b border-black h-10">
                          <td className="border border-black px-2 py-1 text-center font-mono">{idx + 1}</td>
                          <td className="border border-black px-3 py-1 font-mono font-semibold">{s.admissionNumber}</td>
                          <td className="border border-black px-3 py-1 font-medium">{s.fullName}</td>
                          <td className="border border-black px-3 py-1 text-center text-gray-500 font-mono">
                            {s.currentMark !== null ? `${s.currentMark} / ${maxMarks}` : "—"}
                          </td>
                          <td className="border border-black px-3 py-1 text-center font-bold bg-white"></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="mt-6 flex justify-between text-xs pt-4 border-t border-gray-400 font-sans">
                    <span><strong>Teacher Name:</strong> ___________________________</span>
                    <span><strong>Signature:</strong> ___________________</span>
                    <span><strong>Date:</strong> ___ / ___ / {printData.year}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-sm text-navy-500">No print data available.</div>
            )}
          </div>
        )}

        {activeTab === "SCAN" && (
          <div className="space-y-4 pt-2">
            {!scanResult && !scanLoading && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-navy-300 bg-warm-50/50 p-10 text-center transition-colors hover:border-emerald-500 hover:bg-emerald-50/10 dark:border-navy-700 dark:bg-navy-800/40"
              >
                <div className="rounded-full bg-emerald-100 p-4 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                  <UploadCloud className="h-8 w-8" />
                </div>
                <p className="mt-4 text-sm font-semibold text-navy-800 dark:text-navy-100">
                  Click to choose image or drop physical mark sheet scan
                </p>
                <p className="mt-1 text-xs text-navy-500 dark:text-navy-400">
                  Supports JPG, PNG, or mobile phone camera photos (`enhanceImageForOcr` auto-straightens & boosts contrast)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelected}
                  className="hidden"
                />
              </div>
            )}

            {scanLoading && (
              <div className="flex h-64 flex-col items-center justify-center space-y-3 rounded-2xl border border-navy-200 bg-warm-50/30 p-8 text-center dark:border-navy-700 dark:bg-navy-800/30">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                <p className="text-sm font-semibold text-navy-800 dark:text-navy-100">
                  Bundi Intelligent Engine scanning sheet & detecting deltas…
                </p>
                <p className="text-xs text-navy-500">
                  Enhancing contrast → Running local Bundi OCR Engine → Aligning columns → Matching admission numbers
                </p>
              </div>
            )}

            {scanResult && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-emerald-50 p-3 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-xs font-bold text-emerald-900 dark:text-emerald-100">
                        Scan Complete (`{scanResult.pipelineStats.ocrWordsDetected}` words aligned across `{scanResult.rows.length}` students)
                      </p>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                        {scanResult.changedDeltaCount} updated scores · {scanResult.unchangedCount} unchanged · {scanResult.uncertainCount} flagged for quick review
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setScanResult(null);
                      fileInputRef.current?.click();
                    }}
                    className="rounded-full gap-1 text-xs"
                  >
                    <RefreshCw className="h-3 w-3" /> Re-scan
                  </Button>
                </div>

                {/* Delta review table */}
                <div className="max-h-72 max-w-full overflow-auto overscroll-x-contain rounded-xl border border-navy-200 dark:border-navy-700">
                  <table className="w-full min-w-[720px] text-left text-xs">
                    <thead className="sticky top-0 bg-navy-100 font-semibold text-navy-700 dark:bg-navy-800 dark:text-navy-200">
                      <tr>
                        <th className="p-2">Adm No.</th>
                        <th className="p-2">Student Name</th>
                        <th className="p-2 text-center">Stored Mark</th>
                        <th className="p-2 text-center">OCR Detected</th>
                        <th className="p-2 text-center">Status</th>
                        <th className="p-2 text-center">Final Score (`/ ${maxMarks}`)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-100 dark:divide-navy-800">
                      {scanResult.rows.map((row) => {
                        const currentVal = editedDeltas.get(row.studentId) ?? row.newMark;
                        const isChanged = currentVal !== row.oldMark && currentVal !== null;
                        const isReview = row.status === "UNCERTAIN_REVIEW";

                        return (
                          <tr
                            key={row.studentId}
                            className={
                              isReview
                                ? "bg-amber-50/60 dark:bg-amber-950/20"
                                : isChanged
                                ? "bg-emerald-50/40 dark:bg-emerald-950/10"
                                : ""
                            }
                          >
                            <td className="p-2 font-mono font-bold text-navy-900 dark:text-white">
                              {row.admissionNumber}
                            </td>
                            <td className="p-2 font-medium text-navy-800 dark:text-navy-200">
                              {row.studentName}
                            </td>
                            <td className="p-2 text-center font-mono text-navy-500">
                              {row.oldMark !== null ? row.oldMark : "—"}
                            </td>
                            <td className="p-2 text-center font-mono">
                              {row.rawOcrText && row.rawOcrText !== "(Not detected on scan)" ? (
                                <span className="rounded bg-navy-100 px-1.5 py-0.5 text-[11px] dark:bg-navy-800">
                                  `{row.rawOcrText}`
                                </span>
                              ) : (
                                <span className="text-navy-400 italic">Not read</span>
                              )}
                            </td>
                            <td className="p-2 text-center">
                              {isReview ? (
                                <Badge tone="amber" className="gap-1 text-[10px]">
                                  <AlertTriangle className="h-3 w-3" /> Review
                                </Badge>
                              ) : isChanged ? (
                                <Badge tone="green" className="gap-1 text-[10px]">
                                  Delta ({row.oldMark ?? 0} → {currentVal})
                                </Badge>
                              ) : (
                                <Badge tone="neutral" className="text-[10px]">
                                  Unchanged
                                </Badge>
                              )}
                            </td>
                            <td className="p-2 text-center">
                              <input
                                type="number"
                                min={0}
                                max={maxMarks}
                                value={currentVal !== null && currentVal !== undefined ? currentVal : ""}
                                onChange={(e) => handleRowMarkChange(row.studentId, e.target.value)}
                                placeholder="—"
                                className={`w-16 rounded border text-center font-mono text-xs font-bold py-1 focus:outline-none focus:ring-2 ${
                                  isReview
                                    ? "border-amber-400 bg-amber-50 focus:ring-amber-400 dark:bg-amber-900/30"
                                    : isChanged
                                    ? "border-emerald-400 bg-white focus:ring-emerald-400 dark:bg-navy-900"
                                    : "border-navy-200 bg-warm-50 dark:border-navy-700 dark:bg-navy-800"
                                }`}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleApplyConfirmedDeltas}
                    disabled={applyLoading}
                    className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 px-6 shadow-md dark:bg-emerald-600 dark:hover:bg-emerald-700"
                  >
                    {applyLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Confirm & Save `{scanResult.rows.filter((r) => (editedDeltas.get(r.studentId) ?? r.newMark) !== r.oldMark && (editedDeltas.get(r.studentId) ?? r.newMark) !== null).length}` Score Changes
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
