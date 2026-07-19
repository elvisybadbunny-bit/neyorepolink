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
  Trophy,
  Award,
  Medal,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Search,
  Building2,
  Users,
  Play,
  Printer,
  FileText,
  ShieldCheck,
} from "lucide-react";
import type {
  ContestItem,
  ContestLeaderboardItem,
  ContestSchoolTeamRank,
} from "@/lib/validations/inter-school-contest";

interface InterSchoolContestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects?: { id: string; name: string; code: string }[];
  canManage?: boolean;
}

export function InterSchoolContestModal({
  open,
  onOpenChange,
  subjects = [],
  canManage = true,
}: InterSchoolContestModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState<"ARENA" | "TAKE" | "PODIUM" | "CREATE">("ARENA");

  const [contests, setContests] = React.useState<ContestItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [categoryFilter, setCategoryFilter] = React.useState("");
  const [search, setSearch] = React.useState("");

  // Active contest / attempt state
  const [activeContestId, setActiveContestId] = React.useState<string | null>(null);
  const [activeContestData, setActiveContestData] = React.useState<any | null>(null);
  const [takingLoading, setTakeLoading] = React.useState(false);
  const [selectedAnswers, setSelectedAnswers] = React.useState<Record<string, string>>({});
  const [submittingAttempt, setSubmittingAttempt] = React.useState(false);
  const [attemptOutcome, setAttemptOutcome] = React.useState<any | null>(null);

  // Leaderboard state
  const [leaderboardData, setLeaderboardData] = React.useState<{
    title: string;
    totalMarks: number;
    individualLeaderboard: ContestLeaderboardItem[];
    schoolTeamRankings: ContestSchoolTeamRank[];
  } | null>(null);
  const [leaderboardLoading, setLeaderboardLoading] = React.useState(false);

  // Create state
  const [title, setTitle] = React.useState("National Junior School Mathematics Olympiad 2026");
  const [category, setCategory] = React.useState("MATHEMATICS");
  const [targetGradeBand, setTargetGradeBand] = React.useState("Grade 7–9 (Junior School)");
  const [timeLimitMins, setTimeLimitMins] = React.useState(45);
  const [createQuestions, setCreateQuestions] = React.useState<any[]>([
    { order: 1, prompt: "Calculate: 14 + 26 x 2 - 10", options: ["56", "70", "46", "36"], correctAnswer: "56", marks: 4 },
    { order: 2, prompt: "What is the LCM of 12 and 18?", options: ["36", "72", "6", "24"], correctAnswer: "36", marks: 4 },
  ]);
  const [creating, setCreating] = React.useState(false);

  const loadContests = React.useCallback(async () => {
    if (!open) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter) params.set("category", categoryFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/academics/contests?${params.toString()}`);
      const json = await res.json();
      if (json.ok) setContests(json.data.contests || []);
      else toast({ title: json.error?.message || "Could not load arena", tone: "error" });
    } catch {
      toast({ title: "Network error loading contests", tone: "error" });
    } finally {
      setLoading(false);
    }
  }, [open, categoryFilter, search, toast]);

  React.useEffect(() => {
    if (activeTab === "ARENA") loadContests();
  }, [activeTab, loadContests]);

  async function handleRegisterSchool(contestId: string) {
    try {
      const res = await fetch(`/api/academics/contests/${contestId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolTeamName: "School Competition Team" }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: "School team registered successfully!", tone: "success" });
        loadContests();
      } else {
        toast({ title: json.error?.message || "Registration failed", tone: "error" });
      }
    } catch {
      toast({ title: "Network error registering team", tone: "error" });
    }
  }

  async function handleOpenContestForAttempt(contestId: string) {
    setActiveContestId(contestId);
    setTakeLoading(true);
    setAttemptOutcome(null);
    setSelectedAnswers({});
    try {
      const res = await fetch(`/api/academics/contests/${contestId}`);
      const json = await res.json();
      if (json.ok) {
        setActiveContestData(json.data);
        setActiveTab("TAKE");
      } else {
        toast({ title: json.error?.message || "Failed to load contest questions", tone: "error" });
      }
    } catch {
      toast({ title: "Network error loading contest", tone: "error" });
    } finally {
      setTakeLoading(false);
    }
  }

  async function handleSubmitContestAnswers() {
    if (!activeContestId) return;
    setSubmittingAttempt(true);
    try {
      const res = await fetch(`/api/academics/contests/${activeContestId}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: selectedAnswers,
          timeTakenSecs: 1420, // simulated 23m 40s completion speed
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setAttemptOutcome(json.data);
        toast({
          title: `Contest self-marked: ${json.data.score}/${json.data.totalMarks} (${json.data.scorePct}%) in ${json.data.timeFormatted}!`,
          tone: "success",
        });
      } else {
        toast({ title: json.error?.message || "Submission failed", tone: "error" });
      }
    } catch {
      toast({ title: "Network error submitting attempt", tone: "error" });
    } finally {
      setSubmittingAttempt(false);
    }
  }

  async function handleOpenLeaderboard(contestId: string) {
    setActiveContestId(contestId);
    setLeaderboardLoading(true);
    setActiveTab("PODIUM");
    try {
      const res = await fetch(`/api/academics/contests/${contestId}/leaderboard`);
      const json = await res.json();
      if (json.ok) {
        setLeaderboardData(json.data);
      } else {
        toast({ title: json.error?.message || "Failed to load leaderboard", tone: "error" });
      }
    } catch {
      toast({ title: "Network error loading podium", tone: "error" });
    } finally {
      setLeaderboardLoading(false);
    }
  }

  async function handleCreateContestSubmit() {
    if (!title.trim() || createQuestions.length === 0) {
      toast({ title: "Please enter a Title and at least one question.", tone: "error" });
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/academics/contests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          targetGradeBand,
          timeLimitMins,
          questions: createQuestions,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: "Inter-school contest created across Kenya!", tone: "success" });
        setActiveTab("ARENA");
        loadContests();
      } else {
        toast({ title: json.error?.message || "Failed to create contest", tone: "error" });
      }
    } catch {
      toast({ title: "Network error creating contest", tone: "error" });
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto rounded-2xl bg-white/95 backdrop-blur-xl dark:bg-navy-900/95">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-xl font-bold text-navy-900 dark:text-white flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" /> Inter-School Contests Arena & Podium
              </DialogTitle>
              <p className="text-xs text-navy-500 dark:text-navy-400">
                Nationwide competitions across schools (`Karibu High`, `Kilimo Day`, `Uhuru`) with speed tie-breaking & trophies.
              </p>
            </div>
            <div className="flex rounded-full bg-navy-100 p-1 dark:bg-navy-800">
              <button
                type="button"
                onClick={() => setActiveTab("ARENA")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  activeTab === "ARENA"
                    ? "bg-white text-navy-900 shadow-sm dark:bg-navy-700 dark:text-white"
                    : "text-navy-600 hover:text-navy-900 dark:text-navy-400 dark:hover:text-white"
                }`}
              >
                <Trophy className="h-3.5 w-3.5" /> 1. Contests Arena (`{contests.length}`)
              </button>
              <button
                type="button"
                onClick={() => activeContestId && handleOpenContestForAttempt(activeContestId)}
                disabled={!activeContestId}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  activeTab === "TAKE"
                    ? "bg-white text-navy-900 shadow-sm dark:bg-navy-700 dark:text-white"
                    : "text-navy-600 hover:text-navy-900 dark:text-navy-400 dark:hover:text-white disabled:opacity-40"
                }`}
              >
                <Play className="h-3.5 w-3.5 text-emerald-600" /> 2. Take Contest
              </button>
              <button
                type="button"
                onClick={() => activeContestId && handleOpenLeaderboard(activeContestId)}
                disabled={!activeContestId}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  activeTab === "PODIUM"
                    ? "bg-white text-navy-900 shadow-sm dark:bg-navy-700 dark:text-white"
                    : "text-navy-600 hover:text-navy-900 dark:text-navy-400 dark:hover:text-white disabled:opacity-40"
                }`}
              >
                <Award className="h-3.5 w-3.5 text-amber-500" /> 3. Live Podium
              </button>
              {canManage && (
                <button
                  type="button"
                  onClick={() => setActiveTab("CREATE")}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                    activeTab === "CREATE"
                      ? "bg-white text-navy-900 shadow-sm dark:bg-navy-700 dark:text-white"
                      : "text-navy-600 hover:text-navy-900 dark:text-navy-400 dark:hover:text-white"
                  }`}
                >
                  <Plus className="h-3.5 w-3.5" /> 4. Create Contest
                </button>
              )}
            </div>
          </div>
        </DialogHeader>

        {activeTab === "ARENA" && (
          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy-200 bg-warm-50/60 p-3 dark:border-navy-700 dark:bg-navy-800/50">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-navy-400" />
                  <input
                    type="text"
                    placeholder="Search contest title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-8 w-52 rounded-full border border-navy-200 bg-white pl-8 pr-3 text-xs outline-none focus:border-amber-500 dark:border-navy-700 dark:bg-navy-900 dark:text-white"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-8 rounded-full border border-navy-200 bg-white px-3 text-xs font-semibold text-navy-800 dark:border-navy-700 dark:bg-navy-900 dark:text-navy-100"
                >
                  <option value="">All Categories</option>
                  <option value="MATHEMATICS">Mathematics Olympiad</option>
                  <option value="SCIENCE">Science Congress & Lab</option>
                  <option value="CODING_ICT">Coding & ICT Hackathon</option>
                  <option value="DEBATE">National Debate Championship</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex h-64 flex-col items-center justify-center space-y-3 rounded-2xl border border-navy-200 bg-warm-50/30 p-8 text-center dark:border-navy-700 dark:bg-navy-800/30">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                <p className="text-sm font-semibold text-navy-800 dark:text-navy-100">
                  Querying national inter-school contest arena…
                </p>
              </div>
            ) : contests.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-navy-200 bg-warm-50/30 py-16 text-center dark:border-navy-700 dark:bg-navy-800/30">
                <Trophy className="h-10 w-10 text-navy-400" />
                <p className="mt-3 text-sm font-bold text-navy-800 dark:text-navy-100">
                  No inter-school contests found matching your filters.
                </p>
                {canManage && (
                  <Button size="sm" onClick={() => setActiveTab("CREATE")} className="mt-4 rounded-full gap-1.5 text-xs">
                    <Plus className="h-3.5 w-3.5" /> Launch National Contest
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {contests.map((c) => (
                  <Card key={c.id} className="p-4 rounded-2xl border border-navy-200 bg-white dark:border-navy-700 dark:bg-navy-800 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge tone="amber" className="font-mono font-bold text-[10px]">{c.category}</Badge>
                        <Badge tone={c.visibility === "OPEN_NATIONAL" ? "green" : "blue"} className="text-[10px]">
                          {c.visibility === "OPEN_NATIONAL" ? "Open National" : "Invite Only"}
                        </Badge>
                      </div>
                      <h3 className="text-base font-bold text-navy-900 dark:text-white">{c.title}</h3>
                      <p className="text-xs text-navy-500 font-semibold">
                        Host: {c.hostSchoolName} · Level: {c.targetGradeBand}
                      </p>
                      <div className="grid grid-cols-3 gap-1 rounded-xl bg-warm-50 p-2 text-center text-xs dark:bg-navy-900">
                        <div>
                          <p className="font-bold text-navy-900 dark:text-white font-mono">{c.timeLimitMins}m</p>
                          <span className="text-[10px] text-navy-400">Time Limit</span>
                        </div>
                        <div>
                          <p className="font-bold text-navy-900 dark:text-white font-mono">{c.totalMarks}</p>
                          <span className="text-[10px] text-navy-400">Total Marks</span>
                        </div>
                        <div>
                          <p className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{c.registeredSchoolCount}</p>
                          <span className="text-[10px] text-navy-400">Schools</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-navy-100 pt-3 dark:border-navy-700">
                      {c.isRegistered ? (
                        <Badge tone="green" className="gap-1 text-xs">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Registered ({c.myTeamName})
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleRegisterSchool(c.id)}
                          className="rounded-full text-xs font-semibold gap-1.5"
                        >
                          <Building2 className="h-3.5 w-3.5 text-blue-600" /> Register My School Team
                        </Button>
                      )}

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleOpenContestForAttempt(c.id)}
                          disabled={!c.isRegistered && c.hostTenantId !== "Karibu High"}
                          className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs shadow-sm"
                        >
                          <Play className="h-3.5 w-3.5" /> Enter / Take (`{c.questionCount}`)
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenLeaderboard(c.id)}
                          className="rounded-full gap-1 text-xs font-semibold text-amber-700 dark:text-amber-300"
                        >
                          <Trophy className="h-3.5 w-3.5 text-amber-500" /> Podium (`{c.attemptCount}`)
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "TAKE" && activeContestData && (
          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-3 dark:bg-emerald-950/30 dark:border-emerald-800">
              <div>
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-100">
                  {activeContestData.title} — Official Contest Roster
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  Total Marks: {activeContestData.totalMarks} · Time Limit: {activeContestData.timeLimitMins} mins · Fast completion breaks ties!
                </p>
              </div>
              {!attemptOutcome ? (
                <Button
                  onClick={handleSubmitContestAnswers}
                  disabled={submittingAttempt}
                  className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 px-6 text-xs shadow-md"
                >
                  {submittingAttempt ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Submit Contest Attempt (`0 Cost Self-Marking`)
                </Button>
              ) : (
                <Badge tone="green" className="text-xs font-bold px-3 py-1">
                  Completed in {attemptOutcome.timeFormatted} · Score: {attemptOutcome.score}/{attemptOutcome.totalMarks} ({attemptOutcome.scorePct}%)
                </Badge>
              )}
            </div>

            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {activeContestData.questions.map((q: any, idx: number) => {
                const selected = selectedAnswers[q.id];
                const resItem = attemptOutcome?.questionResults?.find((r: any) => r.questionId === q.id);

                return (
                  <Card key={q.id} className="p-4 rounded-2xl border border-navy-200 bg-white dark:border-navy-700 dark:bg-navy-800 space-y-3">
                    <div className="flex items-start justify-between font-bold text-sm">
                      <span>{idx + 1}. {q.prompt}</span>
                      <span className="font-mono text-xs font-bold whitespace-nowrap ml-4">[{q.marks} marks]</span>
                    </div>

                    {q.diagramSvg && (
                      <div
                        className="my-2 max-w-sm overflow-hidden rounded border border-navy-200 bg-warm-50 p-2 dark:border-navy-700 dark:bg-navy-900"
                        dangerouslySetInnerHTML={{ __html: q.diagramSvg }}
                      />
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt: string, optIdx: number) => (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={Boolean(attemptOutcome)}
                          onClick={() => setSelectedAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                          className={`flex items-center gap-2.5 rounded-xl border p-2 text-left text-xs font-semibold transition-all ${
                            attemptOutcome
                              ? resItem?.isCorrect && selected === opt
                                ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold"
                                : selected === opt
                                ? "border-red-500 bg-red-50 text-red-900"
                                : "border-navy-200 bg-warm-50/40 text-navy-500"
                              : selected === opt
                              ? "border-emerald-500 bg-emerald-50/60 text-navy-900 shadow-sm"
                              : "border-navy-200 bg-warm-50/60 text-navy-800 hover:bg-warm-50"
                          }`}
                        >
                          <span className="flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-mono font-bold">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "PODIUM" && (
          <div className="space-y-4 pt-2">
            {leaderboardLoading ? (
              <div className="flex h-48 items-center justify-center space-x-2 text-navy-500">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-sm">Calculating real-time individual speeds and school trophy standings…</span>
              </div>
            ) : leaderboardData ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-800 dark:bg-amber-950/20">
                  <div>
                    <h3 className="text-base font-bold text-navy-900 dark:text-white flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-amber-500" /> {leaderboardData.title} — National Leaderboard
                    </h3>
                    <p className="text-xs text-navy-500">
                      Ties in score are broken deterministically by completion speed (`timeTakenSecs ASC`).
                    </p>
                  </div>
                  <Button onClick={() => window.print()} className="rounded-full gap-2 text-xs">
                    <Printer className="h-3.5 w-3.5" /> Print Certificate / Standings (`⌘P`)
                  </Button>
                </div>

                {/* Top 3 School Team Trophies Box */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-navy-400">
                    School Team Trophy Standings (Top 3 Aggregate Scores)
                  </h4>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    {leaderboardData.schoolTeamRankings.slice(0, 3).map((sr) => (
                      <Card
                        key={sr.schoolName}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                          sr.trophy === "GOLD_TROPHY"
                            ? "border-amber-400 bg-amber-50/60 dark:bg-amber-950/30"
                            : sr.trophy === "SILVER_TROPHY"
                            ? "border-slate-300 bg-slate-50 dark:bg-slate-900"
                            : "border-orange-300 bg-orange-50/40 dark:bg-orange-950/20"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm font-bold text-base font-mono">
                            {sr.rank === 1 ? "🥇" : sr.rank === 2 ? "🥈" : "🥉"}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-navy-900 dark:text-white">{sr.schoolName}</p>
                            <p className="text-[10px] text-navy-500 font-semibold">{sr.schoolTeamName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-bold font-mono text-emerald-600">{sr.teamScore}</p>
                          <span className="text-[10px] text-navy-400">Team Points</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Individual Top Contestants Table */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-navy-400">
                    Individual National Contestants (Top 50)
                  </h4>
                  <div className="max-h-64 max-w-full overflow-auto overscroll-x-contain rounded-xl border border-navy-200 dark:border-navy-700">
                    <table className="w-full min-w-[640px] text-left text-xs">
                      <thead className="sticky top-0 bg-navy-100 font-semibold text-navy-700 dark:bg-navy-800 dark:text-navy-200">
                        <tr>
                          <th className="p-2.5 w-14 text-center">Rank</th>
                          <th className="p-2.5">Contestant Name</th>
                          <th className="p-2.5">School Team</th>
                          <th className="p-2.5 text-center">Score (`/ {leaderboardData.totalMarks}`)</th>
                          <th className="p-2.5 text-center">Speed (`Time`)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-navy-100 dark:divide-navy-800">
                        {leaderboardData.individualLeaderboard.map((item) => (
                          <tr key={item.studentId} className={item.rank <= 3 ? "bg-amber-50/30 dark:bg-amber-950/10 font-bold" : ""}>
                            <td className="p-2.5 text-center font-mono font-bold">
                              {item.medal === "GOLD" ? "🥇 #1" : item.medal === "SILVER" ? "🥈 #2" : item.medal === "BRONZE" ? "🥉 #3" : `#${item.rank}`}
                            </td>
                            <td className="p-2.5 font-medium text-navy-900 dark:text-white">
                              {item.studentName} ({item.admissionNo})
                            </td>
                            <td className="p-2.5 text-navy-600 dark:text-navy-300">
                              {item.schoolName}
                            </td>
                            <td className="p-2.5 text-center font-mono font-bold text-emerald-600">
                              {item.score} ({item.scorePct}%)
                            </td>
                            <td className="p-2.5 text-center font-mono text-navy-500">
                              {item.timeFormatted}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {activeTab === "CREATE" && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-navy-200 bg-warm-50/60 p-4 dark:border-navy-700 dark:bg-navy-800/50">
              <div>
                <label className="text-xs font-bold text-navy-800 dark:text-navy-100">Contest Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-navy-300 bg-white p-2 text-xs font-semibold dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-navy-800 dark:text-navy-100">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-navy-300 bg-white p-2 text-xs font-semibold dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                  >
                    <option value="MATHEMATICS">Mathematics Olympiad</option>
                    <option value="SCIENCE">Science Congress</option>
                    <option value="CODING_ICT">Coding & ICT</option>
                    <option value="DEBATE">National Debate</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-navy-800 dark:text-navy-100">Time Limit (mins)</label>
                  <input
                    type="number"
                    value={timeLimitMins}
                    onChange={(e) => setTimeLimitMins(parseInt(e.target.value, 10) || 45)}
                    className="mt-1 w-full rounded-xl border border-navy-300 bg-white p-2 text-xs font-mono dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-navy-200 dark:border-navy-700">
              <Button
                onClick={handleCreateContestSubmit}
                disabled={creating}
                className="rounded-full bg-amber-500 hover:bg-amber-600 text-white gap-2 px-6 text-xs shadow-md"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trophy className="h-4 w-4" />}
                Launch National Contest across Kenya
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
