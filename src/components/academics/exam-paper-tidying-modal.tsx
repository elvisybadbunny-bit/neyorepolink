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
  FileText,
  Camera,
  UploadCloud,
  CheckCircle2,
  Printer,
  Loader2,
  Plus,
  Trash2,
  Share2,
  BookOpen,
  RefreshCw,
  Save,
  Sparkles,
} from "lucide-react";
import type {
  ScannedExamQuestion,
  TidiedExamPaperResult,
} from "@/lib/validations/exam-paper-scan";

interface ExamPaperTidyingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  examId?: string | null;
  onSaved?: () => void;
}

export function ExamPaperTidyingModal({
  open,
  onOpenChange,
  subjectId,
  subjectName,
  classId,
  className,
  examId,
  onSaved,
}: ExamPaperTidyingModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState<"SCAN" | "TIDY" | "PRINT">("SCAN");
  const [scanLoading, setScanLoading] = React.useState(false);
  const [saveLoading, setSaveLoading] = React.useState(false);
  const [exportLoading, setExportLoading] = React.useState(false);
  const [shareLoading, setShareLoading] = React.useState(false);
  const [savedPaperId, setSavedPaperId] = React.useState<string | null>(null);
  const [privacyTier, setPrivacyTier] = React.useState<"PRIVATE" | "SCHOOL_ONLY" | "PUBLIC_SHARED">("SCHOOL_ONLY");
  const [sharingStatus, setSharingStatus] = React.useState<string>("NONE");

  // Editable paper fields
  const [title, setTitle] = React.useState(`${subjectName} Exam (${className})`);
  const [instructions, setInstructions] = React.useState("Answer all questions in the spaces provided.");
  const [timeAllowedMins, setTimeAllowedMins] = React.useState(120);
  const [questions, setQuestions] = React.useState<ScannedExamQuestion[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);

    try {
      const res = await fetch("/api/academics/exam-papers/scan", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.ok) {
        const data = json.data as TidiedExamPaperResult;
        setTitle(data.titleDetected || title);
        setInstructions(data.instructionsDetected || instructions);
        setTimeAllowedMins(data.timeAllowedMinsDetected || 120);
        setQuestions(data.questions || []);
        setActiveTab("TIDY");
        toast({
          title: `Scan structured: ${data.questions.length} questions extracted across ${data.totalMarksDetected} marks`,
          tone: "success",
        });
      } else {
        // OCR/provider failure must not make the upload a dead end. Preserve a
        // manual paper-vault workflow so the teacher can type the questions.
        setQuestions([{ id: `q-manual-${Date.now()}`, questionNumber: 1, prompt: "Type or paste Question 1 here…", questionType: "STRUCTURED", options: [], marks: 2, confidencePct: 0 }]);
        setActiveTab("TIDY");
        toast({ title: "Automatic scanning is unavailable — manual paper entry opened", description: json.error?.message || "You can still type, save and print this exam paper.", tone: "info" });
      }
    } catch {
      setQuestions([{ id: `q-manual-${Date.now()}`, questionNumber: 1, prompt: "Type or paste Question 1 here…", questionType: "STRUCTURED", options: [], marks: 2, confidencePct: 0 }]);
      setActiveTab("TIDY");
      toast({ title: "Scanning connection failed — manual paper entry opened", description: "You can continue without Bundi and save the paper normally.", tone: "info" });
    } finally {
      setScanLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleAddQuestion() {
    const nextNum = questions.length + 1;
    setQuestions((prev) => [
      ...prev,
      {
        id: `q-new-${Date.now()}`,
        questionNumber: nextNum,
        prompt: `Question ${nextNum} prompt...`,
        questionType: "STRUCTURED",
        options: [],
        marks: 2,
        confidencePct: 100,
      },
    ]);
  }

  function handleUpdateQuestion(index: number, updates: Partial<ScannedExamQuestion>) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, ...updates } : q))
    );
  }

  function handleDeleteQuestion(index: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);

  async function handleSavePaper() {
    if (questions.length === 0) {
      toast({ title: "Please scan or add at least one question before saving.", tone: "error" });
      return;
    }
    setSaveLoading(true);
    try {
      const res = await fetch("/api/academics/exam-papers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: savedPaperId || undefined,
          subjectId,
          classId,
          examId: examId || null,
          title,
          instructions,
          timeAllowedMins,
          totalMarks,
          status: "TIDIED",
          privacyTier,
          questions,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setSavedPaperId(json.data.id);
        setSharingStatus(json.data.sharingApprovalStatus || "NONE");
        toast({ title: "Tidied exam paper saved cleanly to school library!", tone: "success" });
        if (onSaved) onSaved();
      } else {
        toast({ title: json.error?.message || "Failed to save exam paper", tone: "error" });
      }
    } catch {
      toast({ title: "Network error saving tidied paper", tone: "error" });
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleRequestSharing() {
    if (!savedPaperId) {
      toast({ title: "Please save the tidied paper first before requesting national sharing.", tone: "error" });
      return;
    }
    setShareLoading(true);
    try {
      const res = await fetch(`/api/academics/exam-papers/${savedPaperId}/share`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.ok) {
        setSharingStatus(json.data.sharingApprovalStatus || "PENDING");
        toast({
          title: "Public sharing requested! our review team will review it before publishing",
          tone: "success",
        });
      } else {
        toast({ title: json.error?.message || "Sharing request failed", tone: "error" });
      }
    } catch {
      toast({ title: "Network error requesting national sharing", tone: "error" });
    } finally {
      setShareLoading(false);
    }
  }

  async function handleExportToLmsQuiz() {
    if (!savedPaperId) {
      toast({ title: "Please save the tidied paper first before exporting to LMS Quiz.", tone: "error" });
      return;
    }
    setExportLoading(true);
    try {
      const res = await fetch(`/api/academics/exam-papers/${savedPaperId}/export-lms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizTitle: `${title} (Digital Quiz)`,
          publishImmediately: true,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({
          title: `Successfully exported ${json.data.questionsCreated} questions to LMS Quiz Bank!`,
          tone: "success",
        });
      } else {
        toast({ title: json.error?.message || "Export to LMS failed", tone: "error" });
      }
    } catch {
      toast({ title: "Network error exporting to LMS", tone: "error" });
    } finally {
      setExportLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto rounded-2xl bg-white/95 backdrop-blur-xl dark:bg-navy-900/95">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-navy-900 dark:text-white">
                Exam Paper Scanning & Tidying
              </DialogTitle>
              <p className="text-xs text-navy-500 dark:text-navy-400">
                {subjectName} ({className}) · Total Marks: {totalMarks} · Time: {timeAllowedMins} mins
              </p>
            </div>
            <div className="flex rounded-full bg-navy-100 p-1 dark:bg-navy-800">
              <button
                type="button"
                onClick={() => setActiveTab("SCAN")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  activeTab === "SCAN"
                    ? "bg-white text-navy-900 shadow-sm dark:bg-navy-700 dark:text-white"
                    : "text-navy-600 hover:text-navy-900 dark:text-navy-400 dark:hover:text-white"
                }`}
              >
                <Camera className="h-3.5 w-3.5" /> 1. Upload & Scan
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("TIDY")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  activeTab === "TIDY"
                    ? "bg-white text-navy-900 shadow-sm dark:bg-navy-700 dark:text-white"
                    : "text-navy-600 hover:text-navy-900 dark:text-navy-400 dark:hover:text-white"
                }`}
              >
                <FileText className="h-3.5 w-3.5" /> 2. Review & Tidy (`{questions.length}`)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("PRINT")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  activeTab === "PRINT"
                    ? "bg-white text-navy-900 shadow-sm dark:bg-navy-700 dark:text-white"
                    : "text-navy-600 hover:text-navy-900 dark:text-navy-400 dark:hover:text-white"
                }`}
              >
                <Printer className="h-3.5 w-3.5" /> 3. Print / Export
              </button>
            </div>
          </div>
        </DialogHeader>

        {activeTab === "SCAN" && (
          <div className="space-y-4 pt-2">
            {!scanLoading ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-navy-300 bg-warm-50/50 p-12 text-center transition-colors hover:border-emerald-500 hover:bg-emerald-50/10 dark:border-navy-700 dark:bg-navy-800/40"
              >
                <div className="rounded-full bg-emerald-100 p-4 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                  <UploadCloud className="h-8 w-8" />
                </div>
                <p className="mt-4 text-sm font-semibold text-navy-800 dark:text-navy-100">
                  Click or drag handwritten / rough paper exam photo (`enhanceImageForOcr`)
                </p>
                <p className="mt-1 text-xs text-navy-500 dark:text-navy-400">
                  Bundi OCR deterministically extracts question numbering (`1.`, `(a)`), prompts, multiple choice options (`A.`, `B.`), and point allocations (`[4 marks]`).
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelected}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center space-y-3 rounded-2xl border border-navy-200 bg-warm-50/30 p-8 text-center dark:border-navy-700 dark:bg-navy-800/30">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                <p className="text-sm font-semibold text-navy-800 dark:text-navy-100">
                  Bundi Intelligent Engine scanning and structuring handwritten exam…
                </p>
                <p className="text-xs text-navy-500">
                  Enhancing contrast → Running local Bundi OCR Engine → Segmenting numbering → Extracting mark values
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "TIDY" && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-xl border border-navy-200 bg-warm-50/60 p-3 dark:border-navy-700 dark:bg-navy-800/50">
              <div>
                <label className="text-[11px] font-semibold text-navy-600 dark:text-navy-300">Exam Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded border border-navy-300 bg-white px-2 py-1 text-xs font-semibold dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-navy-600 dark:text-navy-300">Instructions</label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full rounded border border-navy-300 bg-white px-2 py-1 text-xs dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-navy-600 dark:text-navy-300">Time (mins)</label>
                  <input
                    type="number"
                    value={timeAllowedMins}
                    onChange={(e) => setTimeAllowedMins(parseInt(e.target.value, 10) || 120)}
                    className="w-20 rounded border border-navy-300 bg-white px-2 py-1 text-xs font-mono dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                  />
                </div>
                <div className="ml-auto flex flex-col items-end">
                  <span className="text-[10px] text-navy-400">Total Marks</span>
                  <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">{totalMarks}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {questions.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="rounded-xl border border-navy-200 bg-white p-3 shadow-sm dark:border-navy-700 dark:bg-navy-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy-100 text-xs font-bold font-mono text-navy-800 dark:bg-navy-700 dark:text-navy-100">
                        {idx + 1}
                      </span>
                      <select
                        value={q.questionType}
                        onChange={(e) =>
                          handleUpdateQuestion(idx, { questionType: e.target.value as any })
                        }
                        className="rounded border border-navy-200 bg-warm-50 px-2 py-0.5 text-[11px] font-semibold text-navy-700 dark:border-navy-600 dark:bg-navy-900 dark:text-navy-200"
                      >
                        <option value="STRUCTURED">Structured / Short Answer</option>
                        <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                        <option value="ESSAY">Essay / Long Answer</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-navy-500 font-mono">Marks:</span>
                      <input
                        type="number"
                        value={q.marks}
                        onChange={(e) =>
                          handleUpdateQuestion(idx, { marks: parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-14 rounded border border-navy-300 bg-warm-50 px-2 py-0.5 text-right font-mono text-xs font-bold dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={q.prompt}
                    onChange={(e) => handleUpdateQuestion(idx, { prompt: e.target.value })}
                    placeholder="Question prompt..."
                    rows={2}
                    className="mt-2 w-full rounded border border-navy-200 bg-warm-50/50 p-2 text-xs font-medium text-navy-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-navy-700 dark:bg-navy-900 dark:text-white"
                  />

                  {q.questionType === "MULTIPLE_CHOICE" && (
                    <div className="mt-2 space-y-1 pl-6 border-l-2 border-emerald-500/40">
                      {(q.options || []).map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-navy-500">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const updated = [...(q.options || [])];
                              updated[optIdx] = e.target.value;
                              handleUpdateQuestion(idx, { options: updated });
                            }}
                            className="flex-1 rounded border border-navy-200 bg-white px-2 py-0.5 text-xs dark:border-navy-700 dark:bg-navy-900 dark:text-white"
                          />
                        </div>
                      ))}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          handleUpdateQuestion(idx, {
                            options: [...(q.options || []), `Option ${String.fromCharCode(65 + (q.options?.length || 0))}`],
                          })
                        }
                        className="mt-1 h-6 text-[10px] rounded-full px-2"
                      >
                        <Plus className="h-3 w-3" /> Add Option
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-navy-200 dark:border-navy-700">
              <div className="flex items-center gap-2">
                <Button onClick={handleAddQuestion} variant="secondary" size="sm" className="rounded-full gap-1.5 text-xs">
                  <Plus className="h-3.5 w-3.5" /> Add Question
                </Button>
                <div className="flex items-center gap-1 border-l border-navy-200 pl-2 dark:border-navy-700">
                  <span className="text-[10px] font-bold text-navy-500">Privacy:</span>
                  <select
                    value={privacyTier}
                    onChange={(e) => setPrivacyTier(e.target.value as any)}
                    className="rounded-full border border-navy-300 bg-white px-2 py-1 text-[11px] font-semibold text-navy-800 dark:border-navy-600 dark:bg-navy-900 dark:text-navy-100"
                  >
                    <option value="PRIVATE">Private (Creator/HOD only)</option>
                    <option value="SCHOOL_ONLY">School-Only (All staff in school)</option>
                    <option value="PUBLIC_SHARED">Public Shared (National Exam Bank)</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={handleSavePaper}
                  disabled={saveLoading}
                  className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-xs shadow-md dark:bg-emerald-600 dark:hover:bg-emerald-700"
                >
                  {saveLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Tidied Exam Paper
                </Button>
                {savedPaperId && (
                  <>
                    {sharingStatus === "PENDING" ? (
                      <Badge tone="amber" className="gap-1 text-xs px-2.5 py-1">
                        <Share2 className="h-3 w-3" /> Awaiting Review
                      </Badge>
                    ) : sharingStatus === "APPROVED" ? (
                      <Badge tone="green" className="gap-1 text-xs px-2.5 py-1">
                        <Share2 className="h-3 w-3" /> Publicly Shared in National Bank
                      </Badge>
                    ) : (
                      <Button
                        onClick={handleRequestSharing}
                        disabled={shareLoading}
                        variant="secondary"
                        size="sm"
                        className="rounded-full gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300"
                      >
                        {shareLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Share2 className="h-3.5 w-3.5" />}
                        Request National Sharing
                      </Button>
                    )}
                    <Button
                      onClick={() => setActiveTab("PRINT")}
                      size="sm"
                      variant="secondary"
                      className="rounded-full gap-1.5 text-xs font-semibold"
                    >
                      <Printer className="h-3.5 w-3.5" /> Preview & Print (`⌘P`)
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "PRINT" && (
          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-navy-200 bg-warm-50/60 p-3 dark:border-navy-700 dark:bg-navy-800/50">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-xs font-bold text-navy-900 dark:text-white">
                    Tidied & Standardized for Print (`{questions.length}` Questions · `{totalMarks}` Marks)
                  </p>
                  <p className="text-[11px] text-navy-500">
                    Handwritten rough notes tidied into an official Kenyan examination layout with dotted answer lines.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={() => window.print()} className="rounded-full gap-2 text-xs">
                  <Printer className="h-3.5 w-3.5" /> Print Exam Paper (`⌘P`)
                </Button>
                {savedPaperId && (
                  <>
                    <Button
                      onClick={handleExportToLmsQuiz}
                      disabled={exportLoading}
                      variant="secondary"
                      className="rounded-full gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
                    >
                      {exportLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                      1-Click Export to LMS Quiz
                    </Button>
                    {sharingStatus !== "PENDING" && sharingStatus !== "APPROVED" && (
                      <Button
                        onClick={handleRequestSharing}
                        disabled={shareLoading}
                        variant="secondary"
                        className="rounded-full gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300"
                      >
                        <Share2 className="h-3.5 w-3.5" /> Request National Sharing
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Printable Exam Paper Layout */}
            <div id="printable-tidied-exam-paper" className="rounded-2xl border border-black bg-white p-8 text-black dark:border-navy-700 dark:bg-white dark:text-black">
              <div className="border-b-2 border-black pb-4 text-center font-sans">
                <h1 className="text-xl font-bold uppercase tracking-wider">{title}</h1>
                <div className="mt-2 flex justify-between text-sm font-semibold border-t border-b border-black py-1.5">
                  <span><strong>Subject:</strong> {subjectName}</span>
                  <span><strong>Class:</strong> {className}</span>
                  <span><strong>Time:</strong> {timeAllowedMins} Minutes</span>
                  <span><strong>Total Marks:</strong> {totalMarks}</span>
                </div>
                <p className="mt-2 text-xs font-medium italic text-left">
                  <strong>Instructions to Candidates:</strong> {instructions}
                </p>
              </div>

              <div className="mt-6 space-y-6 text-sm font-sans">
                {questions.map((q, idx) => (
                  <div key={q.id || idx} className="space-y-2 break-inside-avoid">
                    <div className="flex items-start justify-between font-bold">
                      <span>{idx + 1}. {q.prompt}</span>
                      <span className="font-mono text-xs font-bold whitespace-nowrap ml-4">[{q.marks} {q.marks === 1 ? "mark" : "marks"}]</span>
                    </div>

                    {q.questionType === "MULTIPLE_CHOICE" && (
                      <div className="grid grid-cols-2 gap-2 pl-6 pt-1 text-xs font-medium">
                        {(q.options || []).map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <span className="inline-block h-3.5 w-3.5 rounded border border-black text-center text-[9px] font-bold leading-none pt-0.5"></span>
                            <span><strong>{String.fromCharCode(65 + optIdx)}.</strong> {opt}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {q.questionType === "STRUCTURED" && (
                      <div className="pt-2 space-y-3 pl-6">
                        {Array.from({ length: Math.min(6, Math.max(2, q.marks)) }).map((_, lIdx) => (
                          <div key={lIdx} className="border-b border-dotted border-gray-400 w-full h-4"></div>
                        ))}
                      </div>
                    )}

                    {q.questionType === "ESSAY" && (
                      <div className="pt-2 space-y-4 pl-6">
                        {Array.from({ length: 8 }).map((_, lIdx) => (
                          <div key={lIdx} className="border-b border-dotted border-gray-400 w-full h-4"></div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-4 border-t border-black text-center font-bold text-xs uppercase tracking-widest">
                — End of Examination Paper —
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
