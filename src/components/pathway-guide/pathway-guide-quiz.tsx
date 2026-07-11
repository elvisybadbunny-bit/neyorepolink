"use client";

/**
 * Y.1 — NEYO Pathway Guide: shared questionnaire + results UI, used by BOTH
 * the in-app student/parent view (`apiBase="/api/pathway-guide"`) and the
 * public no-login page (`apiBase="/api/pathway-guide/public"`). All 4 UX
 * states (loading/empty/error/populated) are handled explicitly.
 */
import * as React from "react";
import { Compass, ChevronRight, ChevronLeft, Sparkles, Lock, CheckCircle2, GraduationCap, Loader2, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

interface QuestionOption { id: string; label: string }
interface Question { id: string; pillar: string; prompt: string; options: QuestionOption[] }
interface SessionData {
  id: string;
  recommendedGroup: string | null;
  recommendedTrack: string | null;
  recommendedSubjectsJson: string;
  careerAreasJson: string;
  unlocked: boolean;
  isPublic: boolean;
}
interface GlimpseCluster { number: number; name: string; description: string | null }
interface MatchedCourse {
  clusterNumber: number;
  clusterName: string;
  courseName: string;
  matchedSlots: number;
  totalSlots: number;
  fullyMatches: boolean;
  minMeanGradeToAimFor: string;
  typicalCutoff: number | null;
}

const GROUP_LABELS: Record<string, string> = {
  STEM: "Science, Technology, Engineering & Mathematics (STEM)",
  SOCIAL_SCIENCES: "Social Sciences",
  ARTS_SPORTS: "Arts & Sports Science",
};

export function PathwayGuideQuiz({
  apiBase,
  isPublic,
  studentId,
  studentName,
}: {
  apiBase: string;
  isPublic: boolean;
  studentId?: string;
  studentName?: string;
}) {
  const { toast } = useToast();
  const [phase, setPhase] = React.useState<"loading" | "unavailable" | "intro" | "quiz" | "results">("loading");
  const [questions, setQuestions] = React.useState<Question[] | null>(null);
  const [feeKes, setFeeKes] = React.useState<number | null>(null);
  const [fullName, setFullName] = React.useState(studentName || "");
  const [phone, setPhone] = React.useState("");
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [session, setSession] = React.useState<SessionData | null>(null);
  const [glimpse, setGlimpse] = React.useState<GlimpseCluster[] | null>(null);
  const [matched, setMatched] = React.useState<MatchedCourse[] | null>(null);
  const [paying, setPaying] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setPhase("loading");
    setError(null);
    try {
      const res = await fetch(apiBase);
      const json = await res.json();
      if (!json.ok) {
        if (res.status === 403) { setPhase("unavailable"); return; }
        setError(json.error?.message || "Could not load the questionnaire.");
        setPhase("unavailable");
        return;
      }
      setQuestions(json.data.questions);
      if (json.data.feeKes) setFeeKes(json.data.feeKes);
      setPhase("intro");
    } catch {
      setError("Network error while loading. Please check your connection.");
      setPhase("unavailable");
    }
  }, [apiBase]);
  React.useEffect(() => { void load(); }, [load]);

  async function startSession() {
    if (isPublic && fullName.trim().length < 2) { toast({ title: "Please enter your name", tone: "error" }); return; }
    try {
      const res = await fetch(apiBase, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", studentId, fullName: fullName || undefined, phone: isPublic ? (phone || undefined) : undefined }),
      });
      const json = await res.json();
      if (json.ok) { setSessionId(json.data.id); setPhase("quiz"); }
      else toast({ title: json.error?.message || "Could not start", tone: "error" });
    } catch { toast({ title: "Network error", tone: "error" }); }
  }

  function selectAnswer(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  async function finishQuiz() {
    if (!sessionId || !questions) return;
    const payload = questions.map((q) => ({ questionId: q.id, optionId: answers[q.id] })).filter((a) => a.optionId);
    try {
      const res = await fetch(apiBase, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "answers", sessionId, answers: payload }),
      });
      const json = await res.json();
      if (json.ok) {
        setSession(json.data);
        setPhase("results");
        await loadGlimpse(sessionId);
        if (!isPublic || json.data.unlocked) await loadFullMatch(sessionId);
      } else toast({ title: json.error?.message || "Failed to compute results", tone: "error" });
    } catch { toast({ title: "Network error", tone: "error" }); }
  }

  async function loadGlimpse(id: string) {
    try {
      const res = await fetch(`${apiBase}/glimpse`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: id }) });
      const json = await res.json();
      if (json.ok) setGlimpse(json.data);
    } catch { /* glimpse is best-effort */ }
  }

  async function loadFullMatch(id: string) {
    try {
      const res = await fetch(apiBase, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "match", sessionId: id }) });
      const json = await res.json();
      if (json.ok) setMatched(json.data);
    } catch { /* handled by unlock gating */ }
  }

  async function payToUnlock() {
    if (!sessionId) return;
    if (!phone || phone.trim().length < 9) { toast({ title: "Enter a valid M-Pesa phone number", tone: "error" }); return; }
    setPaying(true);
    try {
      const res = await fetch(`${apiBase}/payment`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, phone }) });
      const json = await res.json();
      if (!json.ok) { toast({ title: json.error?.message || "Payment could not be started", tone: "error" }); setPaying(false); return; }
      toast({ title: `M-Pesa prompt sent for KES ${json.data.amountKes}. Enter your PIN.`, tone: "success" });
      pollPaymentStatus();
    } catch { toast({ title: "Network error", tone: "error" }); setPaying(false); }
  }

  function pollPaymentStatus() {
    if (!sessionId) return;
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts += 1;
      try {
        const res = await fetch(`${apiBase}/payment?sessionId=${sessionId}`);
        const json = await res.json();
        if (json.ok && json.data.unlocked) {
          clearInterval(interval);
          setPaying(false);
          toast({ title: "Unlocked! Loading your full course match list...", tone: "success" });
          await loadFullMatch(sessionId);
          setSession((prev) => (prev ? { ...prev, unlocked: true } : prev));
        } else if (json.ok && json.data.status === "FAILED") {
          clearInterval(interval);
          setPaying(false);
          toast({ title: "Payment failed or was cancelled. Try again.", tone: "error" });
        }
      } catch { /* keep polling */ }
      if (attempts > 20) { clearInterval(interval); setPaying(false); }
    }, 3000);
  }

  if (phase === "loading") {
    return <div className="space-y-3"><Skeleton className="h-10 w-2/3 rounded-xl" />{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}</div>;
  }

  if (phase === "unavailable") {
    return (
      <EmptyState
        icon={Compass}
        title="The NEYO Pathway Guide is unavailable"
        description={error || "This feature is temporarily switched off. Please check back soon."}
      />
    );
  }

  if (phase === "intro") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Compass className="h-5 w-5 text-indigo-600" /> NEYO Pathway Guide</CardTitle>
          <p className="mt-1 text-sm text-navy-600 dark:text-navy-300">
            Answer a few honest questions about your interests, strengths, values and dreams. NEYO will suggest a Senior School pathway and subject combination, and show you real university courses that combination relates to — {isPublic ? `free for a quick preview, with the full course list unlockable for a small fee (KES ${feeKes ?? "—"})` : "completely free, since your school already uses NEYO"}.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPublic ? (
            <>
              <div className="space-y-1">
                <Label>Your name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Wanjiru Achieng" />
              </div>
              <div className="space-y-1">
                <Label>Phone (optional for now — needed later to unlock the full report)</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XX XXX XXX" />
              </div>
            </>
          ) : null}
          <Button onClick={() => void startSession()} className="w-full sm:w-auto">Start the questionnaire <ChevronRight className="h-4 w-4" /></Button>
        </CardContent>
      </Card>
    );
  }

  if (phase === "quiz" && questions) {
    const q = questions[step];
    const answered = Boolean(answers[q.id]);
    const isLast = step === questions.length - 1;
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge tone="blue">{q.pillar}</Badge>
            <span className="text-xs text-navy-500 dark:text-navy-400">Question {step + 1} of {questions.length}</span>
          </div>
          <CardTitle className="mt-2">{q.prompt}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {q.options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => selectAnswer(q.id, opt.id)}
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${answers[q.id] === opt.id ? "border-indigo-400 bg-indigo-50 font-semibold text-indigo-900 dark:border-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-100" : "border-navy-100 hover:bg-navy-50 dark:border-navy-800 dark:hover:bg-navy-800/50"}`}
            >
              {opt.label}
              {answers[q.id] === opt.id ? <CheckCircle2 className="h-4 w-4 text-indigo-600" /> : null}
            </button>
          ))}
          <div className="flex items-center justify-between pt-2">
            <Button variant="secondary" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}><ChevronLeft className="h-4 w-4" /> Back</Button>
            {isLast ? (
              <Button disabled={!answered} onClick={() => void finishQuiz()}>See my results <Sparkles className="h-4 w-4" /></Button>
            ) : (
              <Button disabled={!answered} onClick={() => setStep((s) => s + 1)}>Next <ChevronRight className="h-4 w-4" /></Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (phase === "results" && session) {
    const subjects: { name: string; code: string }[] = session.recommendedSubjectsJson ? JSON.parse(session.recommendedSubjectsJson) : [];
    const careers: string[] = session.careerAreasJson ? JSON.parse(session.careerAreasJson) : [];
    const showUnlockGate = isPublic && !session.unlocked;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-indigo-600" /> Your recommended pathway</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge tone="green">{GROUP_LABELS[session.recommendedGroup || ""] || session.recommendedGroup}</Badge>
            {session.recommendedTrack ? <p className="text-sm text-navy-600 dark:text-navy-300">Suggested track: <span className="font-semibold text-navy-900 dark:text-white">{session.recommendedTrack}</span></p> : null}
            <div>
              <p className="mb-1 text-xs uppercase tracking-widest text-navy-400">Recommended subject combination</p>
              <div className="flex flex-wrap gap-2">{subjects.map((s) => <Badge key={s.code} tone="blue">{s.name}</Badge>)}</div>
            </div>
            <div>
              <p className="mb-1 text-xs uppercase tracking-widest text-navy-400">Career areas this points toward</p>
              <div className="flex flex-wrap gap-2">{careers.map((c) => <Badge key={c} tone="amber">{c}</Badge>)}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Real KUCCPS degree clusters related to this combination</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {glimpse === null ? (
              <div className="space-y-2">{[0, 1].map((i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}</div>
            ) : glimpse.length === 0 ? (
              <p className="text-sm text-navy-500 dark:text-navy-400">No related clusters found yet — NEYO Ops may still be loading the KUCCPS reference data.</p>
            ) : (
              glimpse.map((c) => (
                <div key={c.number} className="rounded-2xl border border-navy-100 p-3 text-sm dark:border-navy-800">
                  <p className="font-semibold text-navy-900 dark:text-white">Cluster {c.number} — {c.name}</p>
                  {c.description ? <p className="text-xs text-navy-500 dark:text-navy-400">{c.description}</p> : null}
                </div>
              ))
            )}

            {showUnlockGate ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-900/20">
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-200"><Lock className="h-4 w-4" /> See every real course this combination relates to</p>
                <p className="mb-3 text-xs text-amber-700 dark:text-amber-300">Unlock the full matched-course list for a one-time fee of KES {feeKes ?? "—"} via M-Pesa.</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XX XXX XXX" className="w-44" />
                  <Button disabled={paying} onClick={() => void payToUnlock()}>{paying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Pay with M-Pesa"}</Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {!showUnlockGate ? (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-green-600" /> Full matched course list</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {matched === null ? (
                <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>
              ) : matched.length === 0 ? (
                <EmptyState icon={Compass} title="No matched courses yet" description="NEYO Ops may still be loading the KUCCPS reference data — please check back soon." />
              ) : (
                matched.map((m, idx) => (
                  <div key={`${m.clusterNumber}-${m.courseName}-${idx}`} className="rounded-2xl border border-navy-100 p-3 text-sm dark:border-navy-800">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-navy-900 dark:text-white">{m.courseName}</p>
                      <Badge tone={m.fullyMatches ? "green" : "amber"}>{m.matchedSlots}/{m.totalSlots} subjects match</Badge>
                    </div>
                    <p className="text-xs text-navy-500 dark:text-navy-400">Cluster {m.clusterNumber} — {m.clusterName}</p>
                    <p className="mt-1 text-xs text-navy-400 dark:text-navy-500">Grade to aim for: {m.minMeanGradeToAimFor}{m.typicalCutoff ? ` · Typical cluster points: ${m.typicalCutoff}` : ""}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ) : null}
      </div>
    );
  }

  return null;
}
