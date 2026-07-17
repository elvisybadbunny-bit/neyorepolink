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
  Search,
  Sparkles,
  Copy,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Building2,
  Clock,
} from "lucide-react";

interface PublicExamPaperItem {
  id: string;
  title: string;
  instructions: string | null;
  timeAllowedMins: number;
  totalMarks: number;
  schoolName: string;
  className: string;
  subject: { id: string; name: string; code: string };
  questions: { id: string; questionNumber: number; prompt: string; marks: number }[];
  sharingDecidedAt: string;
}

interface PublicExamLibraryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: { id: string; name: string; code: string }[];
  classes: { id: string; name: string }[];
  onCloned?: () => void;
}

export function PublicExamLibraryModal({
  open,
  onOpenChange,
  subjects,
  classes,
  onCloned,
}: PublicExamLibraryModalProps) {
  const { toast } = useToast();
  const [papers, setPapers] = React.useState<PublicExamPaperItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [selectedSubjectCode, setSelectedSubjectCode] = React.useState("");
  const [cloningId, setCloningId] = React.useState<string | null>(null);

  // Target assignment when cloning
  const [targetSubjectId, setTargetSubjectId] = React.useState(subjects[0]?.id || "");
  const [targetClassId, setTargetClassId] = React.useState(classes[0]?.id || "");

  const loadLibrary = React.useCallback(async () => {
    if (!open) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedSubjectCode) params.set("subjectCode", selectedSubjectCode);
      const res = await fetch(`/api/academics/exam-papers/public-library?${params.toString()}`);
      const json = await res.json();
      if (json.ok) {
        setPapers(json.data.papers || []);
      } else {
        toast({ title: json.error?.message || "Could not load national exam library", tone: "error" });
      }
    } catch {
      toast({ title: "Network problem connecting to national repository", tone: "error" });
    } finally {
      setLoading(false);
    }
  }, [open, search, selectedSubjectCode, toast]);

  React.useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  async function handleClonePaper(paper: PublicExamPaperItem) {
    if (!targetSubjectId || !targetClassId) {
      toast({ title: "Please select a target subject and class from your school above.", tone: "error" });
      return;
    }
    setCloningId(paper.id);
    try {
      const res = await fetch("/api/academics/exam-papers/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourcePaperId: paper.id,
          targetSubjectId,
          targetClassId,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({
          title: `Successfully cloned "${paper.title}" into your school library!`,
          tone: "success",
        });
        if (onCloned) onCloned();
        onOpenChange(false);
      } else {
        toast({ title: json.error?.message || "Failed to clone exam paper", tone: "error" });
      }
    } catch {
      toast({ title: "Network error during cloning", tone: "error" });
    } finally {
      setCloningId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto rounded-2xl bg-white/95 backdrop-blur-xl dark:bg-navy-900/95">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-xl font-bold text-navy-900 dark:text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-600" /> National Public Exam Bank (`EE.6`)
              </DialogTitle>
              <p className="text-xs text-navy-500 dark:text-navy-400">
                Browse vetted, high-quality examination papers shared across Kenyan NEYO schools (`Karibu High`, `Kilimo Day`, `Uwezo`).
              </p>
            </div>
            <Badge tone="green" className="gap-1.5 text-xs px-3 py-1 font-semibold">
              <ShieldCheck className="h-4 w-4" /> NEYO Ops Vetted & Verified
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Target Selector & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy-200 bg-warm-50/60 p-3 dark:border-navy-700 dark:bg-navy-800/50">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-navy-400" />
                <input
                  type="text"
                  placeholder="Search exam title or instructions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 w-60 rounded-full border border-navy-200 bg-white pl-8 pr-3 text-xs outline-none focus:border-emerald-500 dark:border-navy-700 dark:bg-navy-900 dark:text-white"
                />
              </div>
              <select
                value={selectedSubjectCode}
                onChange={(e) => setSelectedSubjectCode(e.target.value)}
                className="h-9 rounded-full border border-navy-200 bg-white px-3 text-xs font-semibold text-navy-800 dark:border-navy-700 dark:bg-navy-900 dark:text-navy-100"
              >
                <option value="">All Subjects</option>
                <option value="CHE">Chemistry (CHE)</option>
                <option value="PHY">Physics (PHY)</option>
                <option value="BIO">Biology (BIO)</option>
                <option value="MAT">Mathematics (MAT / MATC)</option>
                <option value="ENG">English (ENG)</option>
                <option value="KIS">Kiswahili (KIS)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 border-l border-navy-200 pl-3 dark:border-navy-700">
              <span className="text-[11px] font-bold text-navy-600 dark:text-navy-300">1-Click Clone Target:</span>
              <select
                value={targetSubjectId}
                onChange={(e) => setTargetSubjectId(e.target.value)}
                className="h-8 rounded-full border border-navy-300 bg-white px-2.5 text-xs font-semibold dark:border-navy-600 dark:bg-navy-900 dark:text-white"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
              <select
                value={targetClassId}
                onChange={(e) => setTargetClassId(e.target.value)}
                className="h-8 rounded-full border border-navy-300 bg-white px-2.5 text-xs font-semibold dark:border-navy-600 dark:bg-navy-900 dark:text-white"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Exam Paper Grid */}
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center space-y-3 rounded-2xl border border-navy-200 bg-warm-50/30 p-8 text-center dark:border-navy-700 dark:bg-navy-800/30">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <p className="text-sm font-semibold text-navy-800 dark:text-navy-100">
                Querying National Public Exam Repository…
              </p>
            </div>
          ) : papers.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-navy-200 bg-warm-50/30 py-16 text-center dark:border-navy-700 dark:bg-navy-800/30">
              <BookOpen className="h-10 w-10 text-navy-400" />
              <p className="mt-3 text-sm font-bold text-navy-800 dark:text-navy-100">
                No national public exam papers found matching your filters.
              </p>
              <p className="mt-1 text-xs text-navy-500">
                Be the first to share! Tidy an exam paper in (`EE.5`) and click "Request National Sharing (`EE.6`)".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {papers.map((paper) => (
                <Card
                  key={paper.id}
                  className="flex flex-col justify-between rounded-2xl border border-navy-200 bg-white p-4 shadow-sm transition-all hover:border-emerald-500 dark:border-navy-700 dark:bg-navy-800"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {paper.subject.code} · {paper.subject.name}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-navy-500">
                        <Building2 className="h-3.5 w-3.5" /> {paper.schoolName}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-navy-900 dark:text-white">
                      {paper.title}
                    </h3>

                    <p className="text-xs font-medium text-navy-600 dark:text-navy-300">
                      Class: {paper.className} · {paper.questions.length} Questions · {paper.totalMarks} Marks · {paper.timeAllowedMins} mins
                    </p>

                    <div className="rounded-xl border border-navy-100 bg-warm-50/60 p-2.5 text-xs text-navy-700 dark:border-navy-700/60 dark:bg-navy-900/60 dark:text-navy-300">
                      <p className="font-bold text-[11px] text-navy-500 uppercase">Sample Questions:</p>
                      <ul className="mt-1 list-disc pl-4 space-y-1 text-[11px] line-clamp-2">
                        {paper.questions.slice(0, 2).map((q) => (
                          <li key={q.id}>
                            <strong>Q{q.questionNumber}.</strong> {q.prompt} [{q.marks} marks]
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-navy-100 pt-3 dark:border-navy-700">
                    <span className="flex items-center gap-1 font-mono text-[10px] text-navy-400">
                      <Clock className="h-3 w-3" /> Shared {new Date(paper.sharingDecidedAt || Date.now()).toLocaleDateString("en-KE")}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleClonePaper(paper)}
                      disabled={cloningId === paper.id}
                      className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs shadow-sm"
                    >
                      {cloningId === paper.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      1-Click Clone (`EE.6`)
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
