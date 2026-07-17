"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  FileText,
  Printer,
  UploadCloud,
  CheckCircle2,
  Loader2,
  Save,
  Sparkles,
  Layers,
  Send,
  Camera,
} from "lucide-react";
import type {
  PaperQuizStudentScoreItem,
  PrintableFormativeQuizSheetData,
} from "@/lib/validations/paper-quiz-formative";

interface PaperQuizFormativeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: { id: string; name: string; code: string }[];
  classes: { id: string; name: string }[];
  strands: { id: string; name: string; subjectId: string }[];
  defaultSubjectId?: string;
  defaultClassId?: string;
  defaultStrandId?: string;
  onApplied?: () => void;
}

export function PaperQuizFormativeModal({
  open,
  onOpenChange,
  subjects,
  classes,
  strands,
  defaultSubjectId = "",
  defaultClassId = "",
  defaultStrandId = "",
  onApplied,
}: PaperQuizFormativeModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState<"CREATE" | "PRINT" | "SCORES" | "POST">("CREATE");

  const [subjectId, setSubjectId] = React.useState(defaultSubjectId || subjects[0]?.id || "");
  const [classId, setClassId] = React.useState(defaultClassId || classes[0]?.id || "");
  const [strandId, setStrandId] = React.useState(defaultStrandId || "");
  const [title, setTitle] = React.useState("Quick Paper Quiz 1 (Formative)");
  const [instructions, setInstructions] = React.useState("Answer all questions in the spaces provided.");
  const [totalQuizMarks, setTotalQuizMarks] = React.useState(10);
  const [eeThreshold, setEeThreshold] = React.useState(80);
  const [meThreshold, setMeThreshold] = React.useState(60);
  const [aeThreshold, setAeThreshold] = React.useState(40);

  const [batchId, setBatchId] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [savingScores, setSavingScores] = React.useState(false);
  const [posting, setPosting] = React.useState(false);

  const [printData, setPrintData] = React.useState<PrintableFormativeQuizSheetData | null>(null);
  const [printLoading, setPrintLoading] = React.useState(false);

  const [studentScores, setStudentScores] = React.useState<PaperQuizStudentScoreItem[]>([]);
  const [questions, setQuestions] = React.useState<{ questionNumber: number; prompt: string; marks: number }[]>([
    { questionNumber: 1, prompt: "Question 1 prompt...", marks: 5 },
    { questionNumber: 2, prompt: "Question 2 prompt...", marks: 5 },
  ]);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!subjectId && subjects.length > 0) setSubjectId(subjects[0].id);
    if (!classId && classes.length > 0) setClassId(classes[0].id);
    if (!strandId && strands.length > 0) {
      const firstSt = strands.find((st) => st.subjectId === (subjectId || subjects[0]?.id));
      if (firstSt) setStrandId(firstSt.id);
    }
  }, [subjects, classes, strands, subjectId, classId, strandId]);

  async function handleCreateBatch() {
    if (!subjectId || !classId || !strandId || !title.trim()) {
      toast({ title: "Please select Subject, Class, Strand, and enter a Quiz Title.", tone: "error" });
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/academics/paper-quiz-formative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId,
          classId,
          strandId,
          title: title.trim(),
          instructions: instructions.trim() || null,
          totalQuizMarks,
          eeThresholdPct: eeThreshold,
          meThresholdPct: meThreshold,
          aeThresholdPct: aeThreshold,
          questions,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setBatchId(json.data.id);
        setStudentScores(json.data.studentScores || []);
        setActiveTab("SCORES");
        toast({
          title: `Created formative quiz batch across ${json.data.studentScores?.length || 0} learners (EE.9)!`,
          tone: "success",
        });
      } else {
        toast({ title: json.error?.message || "Failed to create formative batch", tone: "error" });
      }
    } catch {
      toast({ title: "Network error creating batch", tone: "error" });
    } finally {
      setCreating(false);
    }
  }

  async function handleScanPaperQuiz(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !subjectId || !classId || !strandId) {
      toast({ title: "Please select Subject, Class, and Strand before scanning.", tone: "error" });
      return;
    }
    setCreating(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch("/api/academics/paper-quiz-formative/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: reader.result as string,
            subjectId,
            classId,
            strandId,
            title: title.trim() || "Scanned Quiz Batch",
            totalQuizMarks,
          }),
        });
        const json = await res.json();
        if (json.ok) {
          setBatchId(json.data.id);
          setQuestions(json.data.questions || []);
          setStudentScores(json.data.studentScores || []);
          setActiveTab("SCORES");
          toast({
            title: `Scanned paper quiz & auto-extracted ${json.data.questions?.length || 0} questions (EE.9)!`,
            tone: "success",
          });
        } else {
          toast({ title: json.error?.message || "Scan failed", tone: "error" });
        }
      } catch {
        toast({ title: "Network error processing scan", tone: "error" });
      } finally {
        setCreating(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
  }

  const loadPrintSheet = React.useCallback(async () => {
    if (!batchId || activeTab !== "PRINT") return;
    setPrintLoading(true);
    try {
      const res = await fetch(`/api/academics/paper-quiz-formative/${batchId}/print`);
      const json = await res.json();
      if (json.ok) setPrintData(json.data);
      else toast({ title: json.error?.message || "Failed to load printable sheet", tone: "error" });
    } catch {
      toast({ title: "Network error loading printable sheet", tone: "error" });
    } finally {
      setPrintLoading(false);
    }
  }, [batchId, activeTab, toast]);

  React.useEffect(() => {
    loadPrintSheet();
  }, [loadPrintSheet]);

  function handleScoreChange(studentId: string, raw: string) {
    setStudentScores((prev) =>
      prev.map((s) => {
        if (s.studentId !== studentId) return s;
        const val = raw === "" ? null : Math.max(0, Math.min(totalQuizMarks, Number(raw)));
        if (val === null || isNaN(val)) {
          return { ...s, score: null, scorePct: null, level: null, rubricLabel: null, comment: null };
        }
        const scorePct = Math.round((val / totalQuizMarks) * 100);
        let level = 1;
        let rubricLabel = "Below Expectations (BE)";
        if (scorePct >= eeThreshold) {
          level = 4;
          rubricLabel = "Exceeding Expectations (EE)";
        } else if (scorePct >= meThreshold) {
          level = 3;
          rubricLabel = "Meeting Expectations (ME)";
        } else if (scorePct >= aeThreshold) {
          level = 2;
          rubricLabel = "Approaching Expectations (AE)";
        }
        const strandName = strands.find((st) => st.id === strandId)?.name || "Topic";
        const comment = `${rubricLabel.split(" (")[0]} in ${strandName} based on paper quiz score of ${scorePct}% (${val}/${totalQuizMarks}).`;

        return {
          ...s,
          score: val,
          scorePct,
          level,
          rubricLabel,
          comment,
        };
      })
    );
  }

  async function handleSaveScoresToBatch() {
    if (!batchId) return;
    setSavingScores(true);
    try {
      const res = await fetch(`/api/academics/paper-quiz-formative/${batchId}/scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentScores: studentScores.map((s) => ({
            studentId: s.studentId,
            score: s.score,
            comment: s.comment,
          })),
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setStudentScores(json.data.studentScores || []);
        toast({ title: "Formative rubric scores saved inside batch (EE.9)!", tone: "success" });
      } else {
        toast({ title: json.error?.message || "Failed to save scores", tone: "error" });
      }
    } catch {
      toast({ title: "Network error saving scores", tone: "error" });
    } finally {
      setSavingScores(false);
    }
  }

  async function handlePostToCbcEngine() {
    if (!batchId) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/academics/paper-quiz-formative/${batchId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: new Date().toISOString().slice(0, 10) }),
      });
      const json = await res.json();
      if (json.ok) {
        setStudentScores(json.data.studentScores || []);
        toast({
          title: `Successfully posted ${json.data.newObservations} formative rubric observations to CBC engine (EE.9)!`,
          tone: "success",
        });
        if (onApplied) onApplied();
        onOpenChange(false);
      } else {
        toast({ title: json.error?.message || "Failed to post observations", tone: "error" });
      }
    } catch {
      toast({ title: "Network error posting observations", tone: "error" });
    } finally {
      setPosting(false);
    }
  }

  const filteredStrands = strands.filter(
    (st) => !subjectId || st.subjectId === subjectId
  );

  const scoredCount = studentScores.filter((s) => s.score !== null).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto rounded-2xl bg-white/95 backdrop-blur-xl dark:bg-navy-900/95">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-xl font-bold text-navy-900 dark:text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-emerald-600" /> Scan Paper Quiz to Formative Assessment (`EE.9`)
              </DialogTitle>
              <p className="text-xs text-navy-500 dark:text-navy-400">
                Bridge physical/paper quizzes directly to official KICD 4-point CBC/CBE rubric observations without manual typing.
              </p>
            </div>
            <div className="flex rounded-full bg-navy-100 p-1 dark:bg-navy-800">
              <button
                type="button"
                onClick={() => setActiveTab("CREATE")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  activeTab === "CREATE"
                    ? "bg-white text-navy-900 shadow-sm dark:bg-navy-700 dark:text-white"
                    : "text-navy-600 hover:text-navy-900 dark:text-navy-400 dark:hover:text-white"
                }`}
              >
                1. Setup / Scan
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("PRINT")}
                disabled={!batchId}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  activeTab === "PRINT"
                    ? "bg-white text-navy-900 shadow-sm dark:bg-navy-700 dark:text-white"
                    : "text-navy-600 hover:text-navy-900 dark:text-navy-400 dark:hover:text-white disabled:opacity-40"
                }`}
              >
                <Printer className="h-3.5 w-3.5" /> 2. Print Sheet (`⌘P`)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("SCORES")}
                disabled={!batchId}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  activeTab === "SCORES"
                    ? "bg-white text-navy-900 shadow-sm dark:bg-navy-700 dark:text-white"
                    : "text-navy-600 hover:text-navy-900 dark:text-navy-400 dark:hover:text-white disabled:opacity-40"
                }`}
              >
                3. Score Grid (`{scoredCount}/${studentScores.length}`)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("POST")}
                disabled={!batchId}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  activeTab === "POST"
                    ? "bg-white text-navy-900 shadow-sm dark:bg-navy-700 dark:text-white"
                    : "text-navy-600 hover:text-navy-900 dark:text-navy-400 dark:hover:text-white disabled:opacity-40"
                }`}
              >
                <Send className="h-3.5 w-3.5 text-emerald-600" /> 4. Post to CBC Engine
              </button>
            </div>
          </div>
        </DialogHeader>

        {activeTab === "CREATE" && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-xl border border-navy-200 bg-warm-50/60 p-4 dark:border-navy-700 dark:bg-navy-800/50">
              <div>
                <label className="text-xs font-bold text-navy-800 dark:text-navy-100">Learning Area / Subject</label>
                <select
                  value={subjectId}
                  onChange={(e) => { setSubjectId(e.target.value); setStrandId(""); }}
                  className="mt-1 w-full rounded-xl border border-navy-300 bg-white p-2 text-xs font-semibold dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                >
                  <option value="">Select Subject...</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-navy-800 dark:text-navy-100">Target Class</label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-navy-300 bg-white p-2 text-xs font-semibold dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                >
                  <option value="">Select Class...</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-navy-800 dark:text-navy-100">Target KICD Strand (`EE.9`)</label>
                <select
                  value={strandId}
                  onChange={(e) => setStrandId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-navy-300 bg-white p-2 text-xs font-semibold dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                >
                  <option value="">Select Strand...</option>
                  {filteredStrands.map((st) => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-navy-200 bg-white p-4 dark:border-navy-700 dark:bg-navy-800 space-y-3">
                <div>
                  <label className="text-xs font-bold text-navy-800 dark:text-navy-100">Paper Quiz Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-navy-300 bg-warm-50 p-2 text-xs font-semibold dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-navy-800 dark:text-navy-100">Instructions to Candidates</label>
                  <input
                    type="text"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-navy-300 bg-warm-50 p-2 text-xs dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-navy-800 dark:text-navy-100">Total Quiz Marks (`Out Of`)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={totalQuizMarks}
                    onChange={(e) => setTotalQuizMarks(parseInt(e.target.value, 10) || 10)}
                    className="mt-1 w-24 rounded-xl border border-navy-300 bg-warm-50 p-2 text-xs font-mono font-bold dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-navy-200 bg-emerald-50/40 p-4 dark:border-navy-700 dark:bg-emerald-950/20 space-y-3">
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-600" /> Rubric Threshold Conversion Scale (`EE.9`)
                </h4>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                  Scores are automatically converted right into KICD 4-point rubric levels as you enter marks:
                </p>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="rounded-lg bg-white p-2 border border-emerald-200 dark:bg-navy-900">
                    <p className="font-bold text-[11px] text-emerald-700">Level 4 (EE)</p>
                    <input
                      type="number"
                      value={eeThreshold}
                      onChange={(e) => setEeThreshold(parseInt(e.target.value, 10) || 80)}
                      className="w-14 rounded border text-center font-mono text-xs font-bold py-0.5 mt-1 mx-auto"
                    />
                    <span className="text-[10px] text-navy-400">% +</span>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-emerald-200 dark:bg-navy-900">
                    <p className="font-bold text-[11px] text-blue-700">Level 3 (ME)</p>
                    <input
                      type="number"
                      value={meThreshold}
                      onChange={(e) => setMeThreshold(parseInt(e.target.value, 10) || 60)}
                      className="w-14 rounded border text-center font-mono text-xs font-bold py-0.5 mt-1 mx-auto"
                    />
                    <span className="text-[10px] text-navy-400">% +</span>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-emerald-200 dark:bg-navy-900">
                    <p className="font-bold text-[11px] text-amber-700">Level 2 (AE)</p>
                    <input
                      type="number"
                      value={aeThreshold}
                      onChange={(e) => setAeThreshold(parseInt(e.target.value, 10) || 40)}
                      className="w-14 rounded border text-center font-mono text-xs font-bold py-0.5 mt-1 mx-auto"
                    />
                    <span className="text-[10px] text-navy-400">% +</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-navy-200 dark:border-navy-700">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 cursor-pointer rounded-full border border-dashed border-emerald-500 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                <Camera className="h-4 w-4" /> Scan Physical Quiz Photo (`Bundi OCR Auto-Setup`)
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleScanPaperQuiz}
                  className="hidden"
                />
              </div>

              <Button
                onClick={handleCreateBatch}
                disabled={creating}
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 px-6 text-xs shadow-md"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}
                Create Formative Batch (`EE.9`)
              </Button>
            </div>
          </div>
        )}

        {activeTab === "PRINT" && (
          <div className="space-y-4 pt-2">
            {printLoading ? (
              <div className="flex h-48 items-center justify-center space-x-2 text-navy-500">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-sm">Generating printable student sheet…</span>
              </div>
            ) : printData ? (
              <>
                <div className="flex items-center justify-between rounded-xl border border-navy-200 bg-warm-50/60 p-3 dark:border-navy-700 dark:bg-navy-800/50">
                  <div>
                    <p className="text-xs font-bold text-navy-900 dark:text-white">
                      Printable Formative Quiz Sheet (`{printData.trackingRef}`)
                    </p>
                    <p className="text-[11px] text-navy-500">
                      Includes official top-right rubric grading box and clear student identification section (`⌘P`).
                    </p>
                  </div>
                  <Button onClick={() => window.print()} className="rounded-full gap-2 text-xs">
                    <Printer className="h-3.5 w-3.5" /> Print Quiz Paper (`⌘P`)
                  </Button>
                </div>

                <div id="printable-formative-quiz" className="rounded-2xl border border-black bg-white p-8 text-black dark:border-navy-700 dark:bg-white dark:text-black">
                  <div className="flex justify-between items-start border-b-2 border-black pb-4 font-sans">
                    <div>
                      <h2 className="text-lg font-bold uppercase">{printData.schoolName}</h2>
                      <h3 className="text-base font-semibold mt-1">{printData.title} ({printData.className})</h3>
                      <p className="text-xs font-medium mt-1">
                        <strong>Learning Area:</strong> {printData.subjectName} · <strong>Strand:</strong> {printData.strandName}
                      </p>
                    </div>
                    <div className="border-2 border-black p-2 rounded text-xs font-mono text-center bg-gray-50 w-64">
                      <p className="font-bold">TEACHER'S FORMATIVE RUBRIC BOX</p>
                      <p className="mt-1 text-sm font-bold">Total Score: _____ / {printData.totalQuizMarks}</p>
                      <div className="mt-1 border-t border-black pt-1 flex justify-around font-bold">
                        <span>[ ] EE</span>
                        <span>[ ] ME</span>
                        <span>[ ] AE</span>
                        <span>[ ] BE</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 border border-black p-3 rounded font-sans text-xs flex justify-between">
                    <span><strong>Student Name:</strong> ____________________________________</span>
                    <span><strong>Admission No.:</strong> ______________</span>
                    <span><strong>Date:</strong> ___/___/2026</span>
                  </div>

                  <p className="mt-3 text-xs italic font-medium"><strong>Instructions:</strong> {printData.instructions}</p>

                  <div className="mt-6 space-y-6 text-sm font-sans">
                    {printData.questions.map((q) => (
                      <div key={q.questionNumber} className="space-y-3 break-inside-avoid">
                        <div className="flex items-start justify-between font-bold">
                          <span>{q.questionNumber}. {q.prompt}</span>
                          <span className="font-mono text-xs font-bold whitespace-nowrap ml-4">[{q.marks} {q.marks === 1 ? "mark" : "marks"}]</span>
                        </div>
                        <div className="pt-1 space-y-3 pl-6">
                          {Array.from({ length: Math.min(6, Math.max(2, q.marks)) }).map((_, lIdx) => (
                            <div key={lIdx} className="border-b border-dotted border-gray-400 w-full h-5"></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 pt-4 border-t border-black text-center font-bold text-xs uppercase tracking-widest">
                    — End of Formative Quiz (`{printData.trackingRef}`) —
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {activeTab === "SCORES" && (
          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 dark:bg-emerald-950/30 dark:border-emerald-800">
              <div>
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-100">
                  Rapid Score Entry Grid — Auto-Converts to KICD 4-Point Rubric in Real Time (`EE.9`)
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  Type any score out of `{totalQuizMarks}`. NEYO instantly assigns Level 4 (`EE`), 3 (`ME`), 2 (`AE`), or 1 (`BE`) and drafts the observation comment!
                </p>
              </div>
              <Button
                onClick={handleSaveScoresToBatch}
                disabled={savingScores}
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs px-5 shadow-sm"
              >
                {savingScores ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save Score Grid
              </Button>
            </div>

            <div className="max-h-80 overflow-y-auto rounded-xl border border-navy-200 dark:border-navy-700">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-navy-100 font-semibold text-navy-700 dark:bg-navy-800 dark:text-navy-200">
                  <tr>
                    <th className="p-2.5">Adm No.</th>
                    <th className="p-2.5">Student Name</th>
                    <th className="p-2.5 text-center w-32">Quiz Score (`/{totalQuizMarks}`)</th>
                    <th className="p-2.5 text-center w-40">Auto Rubric Level (`EE.9`)</th>
                    <th className="p-2.5">Auto-Generated Formative Comment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100 dark:divide-navy-800">
                  {studentScores.map((s) => (
                    <tr key={s.studentId} className={s.score !== null ? "bg-emerald-50/30 dark:bg-emerald-950/10" : ""}>
                      <td className="p-2.5 font-mono font-bold text-navy-900 dark:text-white">{s.admissionNo}</td>
                      <td className="p-2.5 font-medium text-navy-800 dark:text-navy-200">{s.studentName}</td>
                      <td className="p-2.5 text-center">
                        <input
                          type="number"
                          min={0}
                          max={totalQuizMarks}
                          value={s.score !== null ? s.score : ""}
                          onChange={(e) => handleScoreChange(s.studentId, e.target.value)}
                          placeholder={`/${totalQuizMarks}`}
                          className="w-20 rounded border border-navy-300 bg-white px-2 py-1 text-center font-mono text-xs font-bold focus:border-emerald-500 focus:outline-none dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                        />
                      </td>
                      <td className="p-2.5 text-center">
                        {s.level !== null ? (
                          <Badge
                            tone={s.level === 4 ? "green" : s.level === 3 ? "blue" : s.level === 2 ? "amber" : "red"}
                            className="font-bold text-xs px-2.5 py-0.5 shadow-sm"
                          >
                            {s.rubricLabel?.split(" (")[1]?.replace(")", "") || `L${s.level}`} — Level {s.level}
                          </Badge>
                        ) : (
                          <span className="text-navy-400 italic text-[11px]">—</span>
                        )}
                      </td>
                      <td className="p-2.5">
                        {s.comment ? (
                          <span className="text-[11px] text-navy-700 dark:text-navy-300 block truncate max-w-sm">
                            {s.comment}
                          </span>
                        ) : (
                          <span className="text-navy-400 italic text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setActiveTab("POST")}
                variant="secondary"
                className="rounded-full gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
              >
                Continue to Post Observations ({scoredCount} scored) &rarr;
              </Button>
            </div>
          </div>
        )}

        {activeTab === "POST" && (
          <div className="space-y-4 pt-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 text-center dark:border-emerald-800 dark:bg-emerald-950/20 space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg">
                <Send className="h-7 w-7 ml-0.5" />
              </div>
              <h3 className="text-base font-bold text-navy-900 dark:text-white">
                Ready to Post `{scoredCount}` Formative Rubric Observations to CBC Assessment Engine (`EE.9`)
              </h3>
              <p className="text-xs text-navy-600 dark:text-navy-300 max-w-xl mx-auto leading-relaxed">
                When you click the post button below, every scored student's rubric level (`EE/ME/AE/BE`) and observation comment will be recorded directly into our live `CbcAssessment` table inside a clean database `$transaction`.
              </p>
              <div className="pt-4">
                <Button
                  onClick={handlePostToCbcEngine}
                  disabled={posting || scoredCount === 0}
                  className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 px-8 py-3 text-sm font-bold shadow-md"
                >
                  {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Confirm & Post `{scoredCount}` Formative Rubrics to CBC Engine (`EE.9`)
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
