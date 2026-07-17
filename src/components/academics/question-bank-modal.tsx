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
  BookOpen,
  HelpCircle,
  Play,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Building2,
  Share2,
  Camera,
  UploadCloud,
  Sparkles,
  Printer,
  FileText,
  CheckSquare,
  Eye,
  EyeOff,
} from "lucide-react";
import { StemSimulationStation } from "@/components/academics/stem-simulation-station";
import type {
  QuestionBankItem,
  StudentSuggestedQuestionGroup,
  PrintableQuestionBankExamData,
} from "@/lib/validations/question-bank";

interface QuestionBankModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: { id: string; name: string; code: string }[];
  strands?: { id: string; name: string; subjectId: string }[];
  defaultSubjectId?: string;
  defaultStrandId?: string;
  defaultGrade?: string;
  isStudent?: boolean;
}

export function QuestionBankModal({
  open,
  onOpenChange,
  subjects,
  strands = [],
  defaultSubjectId = "",
  defaultStrandId = "",
  defaultGrade = "",
  isStudent = false,
}: QuestionBankModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState<"BROWSE" | "SCAN_BOOK" | "SUGGESTIONS" | "PRINT_EXAM" | "SIMULATIONS">("BROWSE");

  // Printable Exam Builder (`EE.8`) state
  const [selectedForPrintIds, setSelectedForPrintIds] = React.useState<Set<string>>(new Set());
  const [printExamData, setPrintExamData] = React.useState<PrintableQuestionBankExamData | null>(null);
  const [printExamLoading, setPrintExamLoading] = React.useState(false);
  const [examTitle, setExamTitle] = React.useState("Grade 4 Mathematics Practice Examination");
  const [examTimeMins, setExamTimeMins] = React.useState(60);
  const [showAnswerKey, setShowAnswerKey] = React.useState(false);

  // Browse state
  const [questions, setQuestions] = React.useState<QuestionBankItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [subjectFilter, setSubjectFilter] = React.useState(defaultSubjectId);
  const [strandFilter, setStrandFilter] = React.useState(defaultStrandId);
  const [gradeFilter, setGradeFilter] = React.useState(defaultGrade);
  const [difficultyFilter, setDifficultyFilter] = React.useState("");
  const [scopeFilter, setScopeFilter] = React.useState<"ALL" | "SCHOOL" | "NATIONAL_SHARED">("ALL");

  // Student practice state (self-marking)
  const [selectedAnswers, setSelectedAnswers] = React.useState<Record<string, string>>({});
  const [attemptResults, setAttemptResults] = React.useState<
    Record<string, { isCorrect: boolean; explanation: string; correctAnswer?: string }>
  >({});
  const [attemptingIds, setAttemptingIds] = React.useState<Set<string>>(new Set());

  // Suggestions state
  const [suggestions, setSuggestions] = React.useState<StudentSuggestedQuestionGroup[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = React.useState(false);

  // Scan book state
  const [scanLoading, setScanLoading] = React.useState(false);
  const [extractedCandidates, setExtractedCandidates] = React.useState<any[]>([]);
  const [savingCandidateId, setSavingCandidateId] = React.useState<string | null>(null);
  const [scanGrade, setScanGrade] = React.useState(defaultGrade || "Grade 7");
  const [scanSubjectId, setScanSubjectId] = React.useState(defaultSubjectId || subjects[0]?.id || "");
  const [scanStrandId, setScanStrandId] = React.useState(defaultStrandId || "");
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const loadQuestions = React.useCallback(async () => {
    if (!open) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (subjectFilter) params.set("subjectId", subjectFilter);
      if (strandFilter) params.set("strandId", strandFilter);
      if (gradeFilter) params.set("grade", gradeFilter);
      if (difficultyFilter) params.set("difficulty", difficultyFilter);
      if (scopeFilter) params.set("scope", scopeFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/academics/question-bank?${params.toString()}`);
      const json = await res.json();
      if (json.ok) {
        setQuestions(json.data.questions || []);
      } else {
        toast({ title: json.error?.message || "Failed to load question bank", tone: "error" });
      }
    } catch {
      toast({ title: "Network error querying question bank", tone: "error" });
    } finally {
      setLoading(false);
    }
  }, [open, subjectFilter, strandFilter, gradeFilter, difficultyFilter, scopeFilter, search, toast]);

  const loadSuggestions = React.useCallback(async () => {
    if (!open) return;
    setSuggestionsLoading(true);
    try {
      const params = new URLSearchParams();
      if (subjectFilter) params.set("subjectId", subjectFilter);
      const res = await fetch(`/api/academics/question-bank/student-suggestions?${params.toString()}`);
      const json = await res.json();
      if (json.ok) {
        setSuggestions(json.data.suggestions || []);
      }
    } catch {
      // fallback silent
    } finally {
      setSuggestionsLoading(false);
    }
  }, [open, subjectFilter]);

  React.useEffect(() => {
    if (activeTab === "BROWSE") loadQuestions();
    else if (activeTab === "SUGGESTIONS") loadSuggestions();
  }, [activeTab, loadQuestions, loadSuggestions]);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch("/api/academics/question-bank/scan-book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: base64,
            subjectId: scanSubjectId || subjects[0]?.id || "",
            strandId: scanStrandId || null,
            grade: scanGrade || "Grade 7",
            defaultDifficulty: 2,
          }),
        });
        const json = await res.json();
        if (json.ok) {
          setExtractedCandidates(json.data.questions || []);
          toast({
            title: `Extracted ${json.data.questionCount} candidate questions from book scan (EE.8)`,
            tone: "success",
          });
        } else {
          toast({ title: json.error?.message || "Book scan failed", tone: "error" });
        }
      } catch {
        toast({ title: "Network error processing book scan", tone: "error" });
      } finally {
        setScanLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSaveCandidateToBank(candidate: any) {
    setSavingCandidateId(candidate.id);
    try {
      const res = await fetch("/api/academics/question-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: candidate.subjectId || scanSubjectId,
          strandId: candidate.strandId || scanStrandId || null,
          grade: candidate.grade || scanGrade,
          prompt: candidate.prompt,
          questionType: candidate.questionType || "MULTIPLE_CHOICE",
          options: candidate.options || [],
          correctAnswer: candidate.correctAnswer || candidate.options?.[0] || "Option A",
          explanation: candidate.explanation || "Extracted from book scan.",
          difficulty: candidate.difficulty || 2,
          sourceType: "BOOK_SCAN",
          scope: "NATIONAL_SHARED",
        }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: "Saved candidate question to National Question Bank (EE.8)!", tone: "success" });
        setExtractedCandidates((prev) => prev.filter((q) => q.id !== candidate.id));
        loadQuestions();
      } else {
        toast({ title: json.error?.message || "Failed to save question", tone: "error" });
      }
    } catch {
      toast({ title: "Network error saving question", tone: "error" });
    } finally {
      setSavingCandidateId(null);
    }
  }

  async function handleSubmitStudentAttempt(q: QuestionBankItem) {
    const selected = selectedAnswers[q.id];
    if (!selected) {
      toast({ title: "Please pick an answer first.", tone: "error" });
      return;
    }
    setAttemptingIds((prev) => new Set(prev).add(q.id));
    try {
      const res = await fetch("/api/academics/question-bank/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: q.id,
          selectedAnswer: selected,
          timeTakenSecs: 25,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setAttemptResults((prev) => ({
          ...prev,
          [q.id]: {
            isCorrect: json.data.isCorrect,
            explanation: json.data.explanation,
            correctAnswer: json.data.correctAnswer,
          },
        }));
        if (json.data.isCorrect) {
          toast({ title: "Correct! Outstanding mastery on this question (`EE.8`)!", tone: "success" });
        } else {
          toast({ title: "Not quite! Check the step-by-step working below.", tone: "error" });
        }
      } else {
        toast({ title: json.error?.message || "Self-marking check failed", tone: "error" });
      }
    } catch {
      toast({ title: "Network error checking answer", tone: "error" });
    } finally {
      setAttemptingIds((prev) => {
        const next = new Set(prev);
        next.delete(q.id);
        return next;
      });
    }
  }

  function toggleSelectForPrint(id: string) {
    setSelectedForPrintIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function generatePrintableExam() {
    if (selectedForPrintIds.size === 0) {
      toast({ title: "Please check at least one question card below to build your exam.", tone: "error" });
      return;
    }
    setPrintExamLoading(true);
    setPrintExamData(null);
    try {
      const res = await fetch("/api/academics/question-bank/print-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionIds: Array.from(selectedForPrintIds),
          title: examTitle,
          instructions: "Answer all questions cleanly in the spaces or boxes provided. Show all step-by-step working.",
          timeAllowedMins: examTimeMins,
          grade: gradeFilter || "Grade 4",
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setPrintExamData(json.data);
        setActiveTab("PRINT_EXAM");
        toast({
          title: `Generated official printable exam paper (${json.data.questions.length} questions, ${json.data.totalMarks} marks)!`,
          tone: "success",
        });
      } else {
        toast({ title: json.error?.message || "Failed to generate printable exam", tone: "error" });
      }
    } catch {
      toast({ title: "Network error building printable exam", tone: "error" });
    } finally {
      setPrintExamLoading(false);
    }
  }

  const filteredStrands = strands.filter(
    (st) => !subjectFilter || st.subjectId === subjectFilter
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto rounded-2xl bg-white/95 backdrop-blur-xl dark:bg-navy-900/95">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-xl font-bold text-navy-900 dark:text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-600" /> Self-Marking Question Bank & Book Scanning (`EE.8`)
              </DialogTitle>
              <p className="text-xs text-navy-500 dark:text-navy-400">
                Self-marking practice repository with rich SVG diagrams, textbook OCR scanning, and smart weakness recommendations.
              </p>
            </div>
            <div className="flex rounded-full bg-navy-100 p-1 dark:bg-navy-800">
              <button
                type="button"
                onClick={() => setActiveTab("BROWSE")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  activeTab === "BROWSE"
                    ? "bg-white text-navy-900 shadow-sm dark:bg-navy-700 dark:text-white"
                    : "text-navy-600 hover:text-navy-900 dark:text-navy-400 dark:hover:text-white"
                }`}
              >
                <HelpCircle className="h-3.5 w-3.5" /> 1. Browse & Practice (`{questions.length}`)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("SUGGESTIONS")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  activeTab === "SUGGESTIONS"
                    ? "bg-white text-navy-900 shadow-sm dark:bg-navy-700 dark:text-white"
                    : "text-navy-600 hover:text-navy-900 dark:text-navy-400 dark:hover:text-white"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" /> 2. Weakness Focus (`EE.8`)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("SCAN_BOOK")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  activeTab === "SCAN_BOOK"
                    ? "bg-white text-navy-900 shadow-sm dark:bg-navy-700 dark:text-white"
                    : "text-navy-600 hover:text-navy-900 dark:text-navy-400 dark:hover:text-white"
                }`}
              >
                <Camera className="h-3.5 w-3.5" /> 3. Scan Textbook Page
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("PRINT_EXAM")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  activeTab === "PRINT_EXAM"
                    ? "bg-white text-navy-900 shadow-sm dark:bg-navy-700 dark:text-white"
                    : "text-navy-600 hover:text-navy-900 dark:text-navy-400 dark:hover:text-white"
                }`}
              >
                <Printer className="h-3.5 w-3.5 text-emerald-600" /> 4. Print Exam (`{selectedForPrintIds.size}`)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("SIMULATIONS")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  activeTab === "SIMULATIONS"
                    ? "bg-white text-navy-900 shadow-sm dark:bg-navy-700 dark:text-white"
                    : "text-navy-600 hover:text-navy-900 dark:text-navy-400 dark:hover:text-white"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-blue-500" /> 5. STEM Virtual Labs (`EE.13`)
              </button>
            </div>
          </div>
        </DialogHeader>

        {activeTab === "SIMULATIONS" && (
          <div className="pt-2">
            <StemSimulationStation />
          </div>
        )}

        {activeTab === "BROWSE" && (
          <div className="space-y-4 pt-2">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy-200 bg-warm-50/60 p-3 dark:border-navy-700 dark:bg-navy-800/50">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-navy-400" />
                  <input
                    type="text"
                    placeholder="Search question prompt..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-8 w-52 rounded-full border border-navy-200 bg-white pl-8 pr-3 text-xs outline-none focus:border-emerald-500 dark:border-navy-700 dark:bg-navy-900 dark:text-white"
                  />
                </div>
                <select
                  value={subjectFilter}
                  onChange={(e) => { setSubjectFilter(e.target.value); setStrandFilter(""); }}
                  className="h-8 rounded-full border border-navy-200 bg-white px-3 text-xs font-semibold text-navy-800 dark:border-navy-700 dark:bg-navy-900 dark:text-navy-100"
                >
                  <option value="">All Subjects</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
                <select
                  value={strandFilter}
                  onChange={(e) => setStrandFilter(e.target.value)}
                  className="h-8 rounded-full border border-navy-200 bg-white px-3 text-xs font-semibold text-navy-800 dark:border-navy-700 dark:bg-navy-900 dark:text-navy-100"
                >
                  <option value="">All Strands</option>
                  {filteredStrands.map((st) => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="h-8 rounded-full border border-navy-200 bg-white px-3 text-xs font-semibold text-navy-800 dark:border-navy-700 dark:bg-navy-900 dark:text-navy-100"
                >
                  <option value="">All Grades</option>
                  <optgroup label="Primary School (`Grade 1–6`)">
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 3">Grade 3</option>
                    <option value="Grade 4">Grade 4</option>
                    <option value="Grade 5">Grade 5</option>
                    <option value="Grade 6">Grade 6</option>
                  </optgroup>
                  <optgroup label="Junior School (`Grade 7–9`)">
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                  </optgroup>
                  <optgroup label="Senior School (`Grade 10`)">
                    <option value="Grade 10">Grade 10</option>
                  </optgroup>
                </select>
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="h-8 rounded-full border border-navy-200 bg-white px-3 text-xs font-semibold text-navy-800 dark:border-navy-700 dark:bg-navy-900 dark:text-navy-100"
                >
                  <option value="">All Difficulties</option>
                  <option value="1">Easy (Level 1)</option>
                  <option value="2">Medium (Level 2)</option>
                  <option value="3">Hard (Level 3)</option>
                </select>
              </div>
            </div>

            {!isStudent && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-3 dark:bg-emerald-950/30 dark:border-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <span className="text-xs font-bold text-navy-900 dark:text-white">
                      Custom Exam Builder: `{selectedForPrintIds.size}` Questions Checked
                    </span>
                    <p className="text-[11px] text-navy-500">
                      Check any items across Primary, Junior, or Senior banks to compile your printable test or exam.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedForPrintIds.size > 0 && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedForPrintIds(new Set())}
                      className="h-8 rounded-full text-xs"
                    >
                      Clear
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={generatePrintableExam}
                    disabled={printExamLoading || selectedForPrintIds.size === 0}
                    className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-xs px-5 shadow-sm"
                  >
                    {printExamLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Printer className="h-3.5 w-3.5" />}
                    Build & Print Exam (`{selectedForPrintIds.size}`)
                  </Button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex h-64 flex-col items-center justify-center space-y-3 rounded-2xl border border-navy-200 bg-warm-50/30 p-8 text-center dark:border-navy-700 dark:bg-navy-800/30">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                <p className="text-sm font-semibold text-navy-800 dark:text-navy-100">
                  Loading self-marking practice repository…
                </p>
              </div>
            ) : questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-navy-200 bg-warm-50/30 py-16 text-center dark:border-navy-700 dark:bg-navy-800/30">
                <HelpCircle className="h-10 w-10 text-navy-400" />
                <p className="mt-3 text-sm font-bold text-navy-800 dark:text-navy-100">
                  No questions found matching your filters.
                </p>
                <p className="mt-1 text-xs text-navy-500">
                  Click "Scan Textbook Page" to extract and add questions instantly!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q) => {
                  const result = attemptResults[q.id];
                  const isBusy = attemptingIds.has(q.id);
                  const isChecked = selectedForPrintIds.has(q.id);

                  return (
                    <Card
                      key={q.id}
                      className={`overflow-hidden rounded-2xl border transition-all ${
                        isChecked ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20" : "border-navy-200 bg-white hover:border-emerald-400 dark:border-navy-700 dark:bg-navy-800"
                      }`}
                    >
                      <div className="p-4 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-navy-100 pb-2.5 dark:border-navy-700">
                          <div className="flex items-center gap-2">
                            {!isStudent && (
                              <button
                                type="button"
                                onClick={() => toggleSelectForPrint(q.id)}
                                className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold transition-colors ${
                                  isChecked
                                    ? "bg-emerald-600 text-white"
                                    : "bg-navy-100 text-navy-600 hover:bg-emerald-100 hover:text-emerald-800 dark:bg-navy-700 dark:text-navy-300"
                                }`}
                              >
                                <CheckSquare className="h-3 w-3" />
                                {isChecked ? "Checked for Print" : "Select for Print"}
                              </button>
                            )}
                            <Badge tone="green" className="font-mono font-bold text-[10px]">
                              {q.subjectName || "Learning Area"}
                            </Badge>
                            <Badge tone="neutral" className="text-[10px]">
                              {q.grade}
                            </Badge>
                            {q.strandName && (
                              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                · {q.strandName}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              tone={q.difficulty === 1 ? "green" : q.difficulty === 2 ? "amber" : "red"}
                              className="text-[10px]"
                            >
                              {q.difficulty === 1 ? "Easy" : q.difficulty === 2 ? "Medium" : "Hard"}
                            </Badge>
                            {q.scope === "NATIONAL_SHARED" && (
                              <Badge tone="green" className="gap-1 text-[10px]">
                                <ShieldCheck className="h-3 w-3" /> National Bank
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Prompt & Diagram Block */}
                        <div className="space-y-3">
                          <p className="text-sm font-bold text-navy-900 dark:text-white leading-relaxed">
                            {q.prompt}
                          </p>

                          {q.diagramSvg && (
                            <div
                              className="w-full max-w-sm overflow-hidden rounded-xl border border-navy-200 bg-warm-50/80 p-2 dark:border-navy-700 dark:bg-navy-900"
                              dangerouslySetInnerHTML={{ __html: q.diagramSvg }}
                            />
                          )}
                        </div>

                        {/* Interactive Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = selectedAnswers[q.id] === opt;
                            const isCorrectOpt = result?.correctAnswer?.trim().toLowerCase() === opt.trim().toLowerCase();

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => setSelectedAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                                disabled={Boolean(result)}
                                className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left text-xs font-semibold transition-all ${
                                  result
                                    ? isCorrectOpt
                                      ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 font-bold"
                                      : isSelected
                                      ? "border-red-500 bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-200"
                                      : "border-navy-200 bg-warm-50/40 text-navy-500 dark:border-navy-700 dark:bg-navy-900/40"
                                    : isSelected
                                    ? "border-emerald-500 bg-emerald-50/60 text-navy-900 shadow-sm dark:border-emerald-600 dark:bg-emerald-950/20 dark:text-white"
                                    : "border-navy-200 bg-warm-50/60 text-navy-800 hover:bg-warm-50 dark:border-navy-700 dark:bg-navy-900 dark:text-navy-200 dark:hover:bg-navy-800"
                                }`}
                              >
                                <span className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-mono font-bold ${
                                  result && isCorrectOpt
                                    ? "border-emerald-600 bg-emerald-600 text-white"
                                    : isSelected
                                    ? "border-emerald-600 bg-emerald-600 text-white"
                                    : "border-navy-300 bg-white text-navy-700 dark:border-navy-600 dark:bg-navy-800 dark:text-navy-300"
                                }`}>
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Self-Marking Submit & Working Block */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-navy-100 dark:border-navy-700">
                          {!result ? (
                            <Button
                              size="sm"
                              onClick={() => handleSubmitStudentAttempt(q)}
                              disabled={isBusy || !selectedAnswers[q.id]}
                              className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 px-5 text-xs shadow-sm"
                            >
                              {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                              Check Answer (`Zero Cost`)
                            </Button>
                          ) : (
                            <div className={`w-full rounded-xl p-3 text-xs ${
                              result.isCorrect
                                ? "bg-emerald-50 border border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-100"
                                : "bg-red-50 border border-red-200 text-red-900 dark:bg-red-950/30 dark:border-red-800 dark:text-red-100"
                            }`}>
                              <div className="flex items-center gap-2 font-bold mb-1">
                                {result.isCorrect ? (
                                  <><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Correct! Outstanding mastery.</>
                                ) : (
                                  <><AlertCircle className="h-4 w-4 text-red-600" /> Incorrect. Step-by-step working below:</>
                                )}
                              </div>
                              <p className="font-sans leading-relaxed text-navy-700 dark:text-navy-200 mt-1 pl-6">
                                {result.explanation}
                              </p>
                              <div className="mt-2 flex justify-end">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => setAttemptResults((prev) => { const n = { ...prev }; delete n[q.id]; return n; })}
                                  className="h-6 rounded-full text-[10px] px-3"
                                >
                                  Try Again
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "SUGGESTIONS" && (
          <div className="space-y-4 pt-2">
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-800 dark:bg-amber-950/20">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-sm">
                <Sparkles className="h-4 w-4 text-amber-600" /> Bundi Smart Weakness Focus (`EE.8`)
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                Our algorithm examines existing CBC assessment records and past quiz attempts to suggest specific practice questions on your exact weak areas.
              </p>
            </div>

            {suggestionsLoading ? (
              <div className="flex h-48 items-center justify-center space-x-2 text-navy-500">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-sm">Calculating personalized practice recommendations…</span>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="p-8 text-center text-sm text-navy-500">
                No specific weaknesses detected right now! You are right on track.
              </div>
            ) : (
              <div className="space-y-6">
                {suggestions.map((grp, gIdx) => (
                  <div key={gIdx} className="space-y-3">
                    <div className="flex items-center justify-between rounded-xl bg-navy-100 p-3 dark:bg-navy-800">
                      <div>
                        <span className="text-xs font-bold text-navy-900 dark:text-white">
                          Targeted Focus: {grp.strandName} ({grp.subjectName} · {grp.grade})
                        </span>
                        <p className="text-[11px] text-navy-500 dark:text-navy-400">
                          {grp.reason === "CBC_BELOW_EXPECTATION"
                            ? `You recently scored Level ${grp.assessmentLevel} (Approaching/Below Expectations) in this strand.`
                            : grp.reason === "PAST_INCORRECT_ATTEMPTS"
                            ? "You missed questions on this topic in recent attempts."
                            : "Recommended general grade mastery questions."}
                        </p>
                      </div>
                      <Badge tone="amber" className="text-xs font-bold px-3 py-1">
                        {grp.questions.length} Practice Items
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {grp.questions.map((q) => (
                        <Card key={q.id} className="p-3.5 rounded-2xl border border-navy-200 bg-white dark:border-navy-700 dark:bg-navy-800">
                          <p className="text-xs font-bold text-navy-900 dark:text-white mb-2">{q.prompt}</p>
                          {q.diagramSvg && (
                            <div
                              className="mb-2 max-w-xs overflow-hidden rounded-lg border border-navy-200 bg-warm-50 p-1.5 dark:border-navy-700 dark:bg-navy-900"
                              dangerouslySetInnerHTML={{ __html: q.diagramSvg }}
                            />
                          )}
                          <div className="grid grid-cols-2 gap-1.5 text-xs">
                            {q.options.map((o, i) => (
                              <div key={i} className="rounded border border-navy-100 bg-warm-50/50 px-2 py-1 dark:border-navy-700 dark:bg-navy-900">
                                <strong>{String.fromCharCode(65 + i)}.</strong> {o}
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 flex justify-end">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setActiveTab("BROWSE");
                                setSearch(q.prompt.slice(0, 20));
                              }}
                              className="h-7 text-xs rounded-full text-emerald-700 dark:text-emerald-300"
                            >
                              Practice Now (`EE.8`)
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "SCAN_BOOK" && (
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
                  Snap & Scan Textbook Page, Past Paper, or Worksheet (`Bundi OCR`)
                </p>
                <p className="mt-1 text-xs text-navy-500 dark:text-navy-400">
                  Extracts questions (`1.`, `2.`), multiple-choice options (`A.`, `B.`), and geometric/scientific diagrams automatically!
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
                  Bundi Intelligent Engine scanning textbook page & segmenting options…
                </p>
              </div>
            )}

            {extractedCandidates.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-navy-900 dark:text-white">
                  Extracted Candidates (`{extractedCandidates.length}`) — Verify & Click to Add to Bank:
                </h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {extractedCandidates.map((c) => (
                    <Card key={c.id} className="p-3.5 rounded-2xl border border-navy-200 bg-white dark:border-navy-700 dark:bg-navy-800 flex flex-col justify-between">
                      <div className="space-y-2">
                        <Badge tone="green" className="font-mono text-[10px]">{c.grade}</Badge>
                        <p className="text-xs font-bold text-navy-900 dark:text-white">{c.prompt}</p>
                        <div className="grid grid-cols-2 gap-1 text-[11px]">
                          {(c.options || []).map((o: string, i: number) => (
                            <div key={i} className="rounded bg-warm-50 px-2 py-1 dark:bg-navy-900">
                              <strong>{String.fromCharCode(65 + i)}.</strong> {o}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end pt-2 border-t border-navy-100 dark:border-navy-700">
                        <Button
                          size="sm"
                          onClick={() => handleSaveCandidateToBank(c)}
                          disabled={savingCandidateId === c.id}
                          className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-xs shadow-sm"
                        >
                          {savingCandidateId === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                          Add to National Question Bank (`EE.8`)
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "PRINT_EXAM" && (
          <div className="space-y-4 pt-2">
            <div className="rounded-xl border border-navy-200 bg-warm-50/60 p-4 dark:border-navy-700 dark:bg-navy-800/50 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-navy-700 dark:text-navy-300">Examination Title</label>
                  <input
                    type="text"
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    className="w-full rounded-xl border border-navy-300 bg-white px-2.5 py-1 text-xs font-semibold dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-navy-700 dark:text-navy-300">Time Allowed (mins)</label>
                  <input
                    type="number"
                    value={examTimeMins}
                    onChange={(e) => setExamTimeMins(parseInt(e.target.value, 10) || 60)}
                    className="w-full rounded-xl border border-navy-300 bg-white px-2.5 py-1 text-xs font-mono dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                  />
                </div>
                <div className="flex items-end justify-end gap-2">
                  <Button
                    size="sm"
                    onClick={generatePrintableExam}
                    disabled={printExamLoading || selectedForPrintIds.size === 0}
                    className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs shadow-sm"
                  >
                    {printExamLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Printer className="h-3.5 w-3.5" />}
                    Refresh Printable Exam (`{selectedForPrintIds.size}`)
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-navy-200 pt-2 dark:border-navy-700">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowAnswerKey(!showAnswerKey)}
                    className="rounded-full gap-1 text-xs font-semibold text-blue-700 dark:text-blue-300"
                  >
                    {showAnswerKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {showAnswerKey ? "Hide Marking Guide" : "Show Teacher Answer Key (`EE.8`)"}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  {printExamData && (
                    <Button onClick={() => window.print()} className="rounded-full bg-navy-900 text-white dark:bg-white dark:text-navy-900 gap-1.5 text-xs font-bold">
                      <Printer className="h-3.5 w-3.5" /> Print Examination Paper (`⌘P`)
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {printExamLoading ? (
              <div className="flex h-48 items-center justify-center space-x-2 text-navy-500">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-sm">Assembling verified examination layout from bank entries…</span>
              </div>
            ) : !printExamData ? (
              <div className="p-10 text-center text-sm text-navy-500">
                Click "Build & Print Exam" on any checked questions to preview and print.
              </div>
            ) : (
              <div id="printable-custom-exam-paper" className="rounded-2xl border border-black bg-white p-8 text-black dark:border-navy-700 dark:bg-white dark:text-black">
                <div className="border-b-2 border-black pb-4 text-center font-sans">
                  <h1 className="text-xl font-bold uppercase tracking-wider">{printExamData.schoolName}</h1>
                  <h2 className="text-lg font-semibold mt-1">{printExamData.title}</h2>
                  <div className="mt-2 flex justify-between text-sm font-bold border border-black p-2 rounded">
                    <span><strong>Grade/Level:</strong> {printExamData.grade}</span>
                    <span><strong>Subject:</strong> {printExamData.subjectName}</span>
                    <span><strong>Time Allowed:</strong> {printExamData.timeAllowedMins} Mins</span>
                    <span><strong>Total Marks:</strong> {printExamData.totalMarks}</span>
                  </div>
                  <p className="mt-2 text-xs font-medium italic text-left">
                    <strong>Instructions to Candidates:</strong> {printExamData.instructions}
                  </p>
                  <p className="mt-1 text-[10px] font-mono tracking-tighter text-gray-700 text-right">
                    REF: {printExamData.trackingRef}
                  </p>
                </div>

                <div className="mt-6 space-y-8 text-sm font-sans">
                  {printExamData.questions.map((q) => (
                    <div key={q.id} className="space-y-3 break-inside-avoid border-b border-gray-200 pb-5">
                      <div className="flex items-start justify-between font-bold">
                        <span>{q.questionNumber}. {q.prompt}</span>
                        <span className="font-mono text-xs font-bold whitespace-nowrap ml-4">[{q.marks} {q.marks === 1 ? "mark" : "marks"}]</span>
                      </div>

                      {q.diagramSvg && (
                        <div
                          className="my-2 max-w-sm overflow-hidden rounded border border-gray-400 p-2 bg-gray-50"
                          dangerouslySetInnerHTML={{ __html: q.diagramSvg }}
                        />
                      )}

                      {q.questionType === "MULTIPLE_CHOICE" && (
                        <div className="grid grid-cols-2 gap-3 pl-6 pt-1 text-xs font-medium">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <span className="inline-block h-4 w-4 rounded border border-black text-center text-[10px] font-bold leading-none pt-0.5"></span>
                              <span><strong>{String.fromCharCode(65 + optIdx)}.</strong> {opt}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {q.questionType !== "MULTIPLE_CHOICE" && (
                        <div className="pt-2 space-y-4 pl-6">
                          {Array.from({ length: Math.min(8, Math.max(2, q.marks)) }).map((_, lIdx) => (
                            <div key={lIdx} className="border-b border-dotted border-gray-400 w-full h-5"></div>
                          ))}
                        </div>
                      )}

                      {showAnswerKey && (
                        <div className="mt-2 rounded bg-amber-50 border border-amber-300 p-2.5 text-xs text-amber-950">
                          <p className="font-bold text-[11px] uppercase text-amber-800">Teacher Marking Guide (`EE.8`):</p>
                          <p className="mt-0.5"><strong>Correct Answer:</strong> {q.correctAnswer}</p>
                          {q.explanation && <p className="mt-0.5"><strong>Working/Explanation:</strong> {q.explanation}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {showAnswerKey && (
                  <div className="mt-10 border-t-2 border-black pt-6 font-sans">
                    <h3 className="text-base font-bold uppercase tracking-wider text-center bg-gray-200 p-2 border border-black">
                      Official Teacher Answer Key & Marking Guide (`EE.8`)
                    </h3>
                    <div className="mt-4 space-y-4 text-xs">
                      {printExamData.answerKey.map((ak) => (
                        <div key={ak.questionNumber} className="border-b border-gray-300 pb-2">
                          <p className="font-bold">Q{ak.questionNumber}. {ak.prompt}</p>
                          <p className="font-mono font-bold text-emerald-800 mt-1">Answer: {ak.correctAnswer}</p>
                          {ak.explanation && <p className="text-gray-700 mt-0.5">Explanation: {ak.explanation}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-10 pt-4 border-t border-black text-center font-bold text-xs uppercase tracking-widest">
                  — End of Examination Paper (`{printExamData.trackingRef}`) —
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
