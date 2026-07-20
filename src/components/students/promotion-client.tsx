"use client";

/**
 * G.16 Promotion wizard + stream reshuffle (Chunks 5/6/7).
 * Tab 1 — New academic year: mapping preview table -> confirm -> result.
 * Tab 2 — Reshuffle streams: pick level + strategy -> preview balance -> commit.
 * History card with one-click Undo. All 4 UX states.
 */
import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpRight, GraduationCap, Shuffle, AlertCircle, Loader2,
  Undo2, History, Check, Sparkles, Wand2, UserCheck, Replace,
  Users, RefreshCw, ClipboardCheck, LayoutGrid,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { TableContainer, Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatCard } from "@/components/ui/stat-card";

interface PlanRosterStudent { id: string; name: string; gender: string; admissionNo: string; isRepeating: boolean }
interface PlanStep { classId: string; from: string; to: string | null; graduate: boolean; students: number; toExists: boolean; roster: PlanRosterStudent[] }
interface RunRow { id: string; kind: string; summary: string; undoneAt: string | null; createdByName: string; createdAt: string; moves: number }
interface ReshuffleStream { classId: string; label: string; count: number; boys: number; girls: number; students: { id: string; name: string; gender: string; moved: boolean }[] }
interface ReshuffleData { level: string; strategy: string; streams: ReshuffleStream[]; movedCount: number; total: number }
interface ClassOpt { id: string; level: string; stream: string | null; name: string }

export function PromotionClient() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  // BB.4 — a real deep link into this exact page, e.g. right after a
  // student import completes: /students/promotion?tab=allocate-class&level=Grade%2010
  // so the founder's own "both entry points, one engine" choice works
  // without any separate second wizard/page.
  const requestedTab = searchParams?.get("tab");
  const initialTab = (["allocate-class", "review-wizard", "continuity", "transfer-impact", "reshuffle", "auto-grouping"] as const).includes(requestedTab as any)
    ? requestedTab as "allocate-class" | "review-wizard" | "continuity" | "transfer-impact" | "reshuffle" | "auto-grouping"
    : "promote";
  const initialLevel = searchParams?.get("level") ?? "";
  const [tab, setTab] = React.useState<"promote" | "reshuffle" | "auto-grouping" | "allocate-class" | "continuity" | "transfer-impact" | "review-wizard">(initialTab);
  const [plan, setPlan] = React.useState<PlanStep[] | null>(null);
  const [unmapped, setUnmapped] = React.useState<string[]>([]);
  const [history, setHistory] = React.useState<RunRow[]>([]);
  const [error, setError] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);
  const [year, setYear] = React.useState(new Date().getFullYear());
  // T.13 — manual repeat-a-level: staff-picked set of student ids that stay at their current level.
  const [repeatIds, setRepeatIds] = React.useState<Set<string>>(new Set());
  const [expandedClassId, setExpandedClassId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setError(false);
    try {
      const res = await fetch("/api/promotion");
      const json = await res.json();
      if (json.ok) { setPlan(json.data.plan); setUnmapped(json.data.unmapped); setHistory(json.data.history); }
      else setError(true);
    } catch { setError(true); }
  }, []);
  React.useEffect(() => { load(); }, [load]);

  function toggleRepeat(studentId: string) {
    setRepeatIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId); else next.add(studentId);
      return next;
    });
  }

  async function commit() {
    setBusy(true);
    try {
      const res = await fetch("/api/promotion", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ year, repeatStudentIds: [...repeatIds] }) });
      const json = await res.json();
      if (json.ok) { toast({ title: json.data.summary, tone: "success" }); setConfirming(false); setRepeatIds(new Set()); load(); }
      else toast({ title: json.error?.message || "Failed", tone: "error" });
    } finally { setBusy(false); }
  }

  async function undo(runId: string) {
    if (!window.confirm("Undo this run? Every student goes back to where they were.")) return;
    setBusy(true);
    try {
      const res = await fetch("/api/promotion/undo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ runId }) });
      const json = await res.json();
      if (json.ok) { toast({ title: `${json.data.reversed} students restored`, tone: "success" }); load(); }
      else toast({ title: json.error?.message || "Failed", tone: "error" });
    } finally { setBusy(false); }
  }

  const graduating = plan?.filter((p) => p.graduate) ?? [];
  const promoting = plan?.filter((p) => !p.graduate) ?? [];
  const totalGrad = graduating.reduce((a, p) => a + p.students, 0);
  const totalProm = promoting.reduce((a, p) => a + p.students, 0);

  return (
    <div className="space-y-6">
      {/* tabs */}
      <div className="flex max-w-full gap-1 overflow-x-auto overscroll-x-contain rounded-2xl border border-navy-200 p-1 touch-auto dark:border-navy-700" aria-label="Promotion and allocation tools">
        <button onClick={() => setTab("promote")} className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${tab === "promote" ? "bg-navy-900 text-white dark:bg-navy-50 dark:text-navy-900" : "text-navy-500"}`}>
          New academic year
        </button>
        <button onClick={() => setTab("reshuffle")} className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${tab === "reshuffle" ? "bg-navy-900 text-white dark:bg-navy-50 dark:text-navy-900" : "text-navy-500"}`}>
          Reshuffle streams
        </button>
        <button onClick={() => setTab("auto-grouping")} className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${tab === "auto-grouping" ? "bg-navy-900 text-white dark:bg-navy-50 dark:text-navy-900" : "text-navy-500"}`}>
          Auto-grouping
        </button>
        <button onClick={() => setTab("allocate-class")} className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${tab === "allocate-class" ? "bg-navy-900 text-white dark:bg-navy-50 dark:text-navy-900" : "text-navy-500"}`}>
          Allocate class
        </button>
        <button onClick={() => setTab("continuity")} className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${tab === "continuity" ? "bg-navy-900 text-white dark:bg-navy-50 dark:text-navy-900" : "text-navy-500"}`}>
          Continuity engine
        </button>
        <button onClick={() => setTab("review-wizard")} className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${tab === "review-wizard" ? "bg-navy-900 text-white dark:bg-navy-50 dark:text-navy-900" : "text-navy-500"}`}>
          New year teacher review
        </button>
        <button onClick={() => setTab("transfer-impact")} className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${tab === "transfer-impact" ? "bg-navy-900 text-white dark:bg-navy-50 dark:text-navy-900" : "text-navy-500"}`}>
          Teacher transfer impact
        </button>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
          <AlertCircle className="h-4 w-4" /> Couldn&apos;t load. <button onClick={load} className="font-medium underline">Retry</button>
        </div>
      ) : plan === null ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
      ) : tab === "promote" ? (
        <>
          {plan.length === 0 ? (
            <EmptyState icon={ArrowUpRight} title="No classes yet" description="Create classes under Students → Manage classes first." />
          ) : (
            <Card>
              <CardHeader><CardTitle>Promotion plan</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <TableContainer>
                  <Table>
                    <THead><TR><TH>Current class</TH><TH>Students</TH><TH>Moves to</TH><TH>Repeating</TH></TR></THead>
                    <TBody>
                      {plan.map((p) => {
                        const repeatingHere = p.roster.filter((s) => repeatIds.has(s.id)).length;
                        const isOpen = expandedClassId === p.classId;
                        return (
                          <React.Fragment key={p.classId}>
                            <TR>
                              <TD className="font-medium">{p.from}</TD>
                              <TD>{p.students}</TD>
                              <TD>
                                {p.graduate ? (
                                  <Badge tone="blue"><GraduationCap className="mr-1 h-3 w-3" /> Graduates — Class of {year}</Badge>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5">
                                    {p.to}
                                    {!p.toExists && <Badge tone="neutral">will be created</Badge>}
                                  </span>
                                )}
                              </TD>
                              <TD>
                                {p.roster.length === 0 ? (
                                  <span className="text-xs text-navy-400">—</span>
                                ) : (
                                  <button
                                    onClick={() => setExpandedClassId(isOpen ? null : p.classId)}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-navy-200 px-2.5 py-1 text-xs font-medium text-navy-600 hover:bg-warm-50 dark:border-navy-700 dark:text-navy-300 dark:hover:bg-navy-800"
                                  >
                                    <UserCheck className="h-3.5 w-3.5" />
                                    {repeatingHere > 0 ? `${repeatingHere} repeating` : "Mark repeats"}
                                  </button>
                                )}
                              </TD>
                            </TR>
                            {isOpen && p.roster.length > 0 && (
                              <TR>
                                <TD colSpan={4} className="bg-warm-50/60 dark:bg-navy-900/40">
                                  <p className="mb-2 text-xs text-navy-500">
                                    Tick any learner who should repeat {p.from} instead of {p.graduate ? "graduating" : "moving up"} this year. Everyone else moves as planned.
                                  </p>
                                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                                    {p.roster.map((s) => (
                                      <label key={s.id} className="flex cursor-pointer items-center gap-2 rounded-xl border border-navy-100 bg-white px-3 py-1.5 text-sm dark:border-navy-800 dark:bg-navy-950">
                                        <input
                                          type="checkbox"
                                          checked={repeatIds.has(s.id)}
                                          onChange={() => toggleRepeat(s.id)}
                                          className="h-4 w-4 rounded border-navy-300 text-navy-900 focus:ring-navy-500"
                                        />
                                        <span className="flex-1 truncate">{s.name}</span>
                                        <span className="text-xs text-navy-400">{s.admissionNo}</span>
                                        {s.isRepeating && !repeatIds.has(s.id) && (
                                          <Badge tone="amber">already repeating</Badge>
                                        )}
                                      </label>
                                    ))}
                                  </div>
                                </TD>
                              </TR>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </TBody>
                  </Table>
                </TableContainer>

                {unmapped.length > 0 && (
                  <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                    Skipped (level name not understood): {unmapped.join(", ")}. Rename them like &ldquo;Form 2&rdquo; or &ldquo;Grade 4&rdquo; to include them.
                  </p>
                )}

                <div className="flex flex-col gap-3 rounded-2xl bg-warm-50 p-4 dark:bg-navy-800 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-navy-700 dark:text-navy-200">
                    <span className="font-semibold">{totalProm - repeatIds.size}</span> students move up · <span className="font-semibold">{totalGrad}</span> graduate
                    {repeatIds.size > 0 && <> · <span className="font-semibold text-amber-600">{repeatIds.size} repeating</span></>}
                  </p>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-navy-500">Class of</label>
                    <input type="number" value={year} min={1990} max={2100} onChange={(e) => setYear(Number(e.target.value))} className="w-24 rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900" />
                    {confirming ? (
                      <>
                        <Button variant="secondary" onClick={() => setConfirming(false)} disabled={busy}>Cancel</Button>
                        <Button onClick={commit} disabled={busy}>
                          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Yes, start the year
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setConfirming(true)} disabled={busy || (totalProm + totalGrad === 0)}>
                        <ArrowUpRight className="h-4 w-4" /> Start new academic year
                      </Button>
                    )}
                  </div>
                </div>
                {confirming && (
                  <p className="text-xs text-amber-600">
                    This moves every active student{repeatIds.size > 0 ? `, except the ${repeatIds.size} marked to repeat their level` : ""}. You can undo it from the history below.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </>
      ) : tab === "reshuffle" ? (
        <ReshufflePanel onDone={load} />
      ) : tab === "auto-grouping" ? (
        <AutoGroupingPanel onDone={load} />
      ) : tab === "allocate-class" ? (
        <AllocateClassPanel onDone={load} initialLevel={initialLevel} />
      ) : tab === "continuity" ? (
        <ContinuityEnginePanel />
      ) : tab === "review-wizard" ? (
        <TeacherAllocationReviewPanel />
      ) : (
        <TeacherTransferImpactPanel />
      )}

      {/* history */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><History className="h-4 w-4 text-navy-400" /> Run history</CardTitle></CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <EmptyState icon={History} title="No runs yet" description="Promotions and reshuffles appear here with one-click undo." />
          ) : (
            <ul className="divide-y divide-navy-50 dark:divide-navy-800">
              {history.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-navy-800 dark:text-navy-100">
                      {r.kind === "promotion" ? <ArrowUpRight className="mr-1 inline h-3.5 w-3.5 text-green-600" /> : <Shuffle className="mr-1 inline h-3.5 w-3.5 text-navy-400" />}
                      {r.summary}
                    </p>
                    <p className="text-xs text-navy-400">
                      {new Date(r.createdAt).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" })} · {r.createdByName}
                      {r.undoneAt && <Badge tone="neutral" className="ml-2">undone</Badge>}
                    </p>
                  </div>
                  {!r.undoneAt && (
                    <Button size="sm" variant="secondary" onClick={() => undo(r.id)} disabled={busy}>
                      <Undo2 className="h-3.5 w-3.5" /> Undo
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ---- reshuffle panel ---------------------------------------------------------
const STRATEGIES = [
  { value: "size", label: "Balance class sizes", hint: "Deal students evenly across streams (A→Z)." },
  { value: "gender", label: "Balance boys & girls", hint: "Alternate boys/girls so each stream is mixed." },
  { value: "alpha", label: "Alphabetical", hint: "Surname A→Z dealt across streams." },
];

function ReshufflePanel({ onDone }: { onDone: () => void }) {
  const { toast } = useToast();
  const [classes, setClasses] = React.useState<ClassOpt[]>([]);
  const [level, setLevel] = React.useState("");
  const [strategy, setStrategy] = React.useState("size");
  const [preview, setPreview] = React.useState<ReshuffleData | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/classes").then((r) => r.json()).then((j) => j.ok && setClasses(j.data.classes));
  }, []);

  // Levels that have 2+ streams.
  const levels = React.useMemo(() => {
    const byLevel = new Map<string, number>();
    for (const c of classes) byLevel.set(c.level, (byLevel.get(c.level) ?? 0) + 1);
    return [...byLevel.entries()].filter(([, n]) => n >= 2).map(([l]) => l);
  }, [classes]);

  async function run(commit: boolean) {
    setBusy(true);
    try {
      const res = await fetch("/api/promotion/reshuffle", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, strategy, commit }),
      });
      const json = await res.json();
      if (!json.ok) { toast({ title: json.error?.message || "Failed", tone: "error" }); return; }
      if (commit) { toast({ title: json.data.summary, tone: "success" }); setPreview(null); onDone(); }
      else setPreview(json.data);
    } finally { setBusy(false); }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Shuffle className="h-4 w-4 text-navy-400" /> Reshuffle a level&apos;s streams</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {levels.length === 0 ? (
          <EmptyState icon={Shuffle} title="No multi-stream levels" description="Reshuffling needs a level with two or more streams (e.g. Form 2 East and Form 2 West)." />
        ) : (
          <>
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="text-xs font-medium text-navy-600 dark:text-navy-300">Level</label>
                <select value={level} onChange={(e) => { setLevel(e.target.value); setPreview(null); }} className="mt-1 block rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900">
                  <option value="">Choose…</option>
                  {levels.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-navy-600 dark:text-navy-300">Strategy</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {STRATEGIES.map((s) => (
                    <button key={s.value} onClick={() => { setStrategy(s.value); setPreview(null); }} title={s.hint}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium ${strategy === s.value ? "bg-navy-900 text-white dark:bg-navy-50 dark:text-navy-900" : "border border-navy-200 text-navy-600 dark:border-navy-700 dark:text-navy-300"}`}>
                      {s.label}
                    </button>
                  ))}
                  <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-navy-200 px-3 py-1.5 text-xs text-navy-400 dark:border-navy-700" title="Activates when exams provide mean scores.">
                    <Sparkles className="h-3 w-3" /> By performance — coming with Exams
                  </span>
                </div>
              </div>
              <Button variant="secondary" onClick={() => run(false)} disabled={busy || !level}>
                {busy && !preview ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Preview
              </Button>
            </div>

            {preview && (
              <>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {preview.streams.map((st) => (
                    <div key={st.classId} className="rounded-2xl border border-navy-100 p-4 dark:border-navy-800">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-semibold text-navy-900 dark:text-navy-50">{st.label}</p>
                        <Badge tone="neutral">{st.count} · {st.boys}B/{st.girls}G</Badge>
                      </div>
                      <ul className="max-h-40 space-y-0.5 overflow-y-auto text-xs">
                        {st.students.map((s) => (
                          <li key={s.id} className={s.moved ? "font-medium text-green-700 dark:text-green-400" : "text-navy-500 dark:text-navy-400"}>
                            {s.name} {s.moved && "← moves here"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-warm-50 p-4 dark:bg-navy-800">
                  <p className="text-sm text-navy-700 dark:text-navy-200">
                    <span className="font-semibold">{preview.movedCount}</span> of {preview.total} students change stream
                  </p>
                  <Button onClick={() => run(true)} disabled={busy}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shuffle className="h-4 w-4" />} Apply reshuffle
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}


function AutoGroupingPanel({ onDone }: { onDone: () => void }) {
  const { toast } = useToast();
  const [setup, setSetup] = React.useState<any>(null);
  const [level, setLevel] = React.useState("");
  const [preview, setPreview] = React.useState<any>(null);
  const [busy, setBusy] = React.useState(false);
  const [ruleName, setRuleName] = React.useState("Subject-choice continuity rule");
  const [maxClasses, setMaxClasses] = React.useState("4");
  // BB.3 — real, staff-confirmed resolution per real classId the preview's
  // own capacityWarnings flagged as exceeding its configured capacity.
  const [capacityDecisions, setCapacityDecisions] = React.useState<Record<string, "ALLOW_OVER_CAPACITY">>({});
  const [splittingClassId, setSplittingClassId] = React.useState<string | null>(null);
  const [newClassName, setNewClassName] = React.useState("");

  const load = React.useCallback(async () => {
    const res = await fetch('/api/promotion/auto-grouping');
    const json = await res.json();
    if (json.ok) setSetup(json.data);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const levels: string[] = React.useMemo(() => Array.from(new Set<string>((setup?.classes ?? []).map((c: any) => c.level as string))).sort(), [setup]);

  async function saveRule() {
    setBusy(true);
    try {
      const res = await fetch('/api/promotion/auto-grouping', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_rule', name: ruleName, targetLevel: level || null, ruleType: 'SCHOOL_DEFINED', priority: 10, active: true, config: { retainSubjectTeachers: true, retainClassTeachers: true, maxClassesPerTeacher: Number(maxClasses) } })
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || 'Failed');
      const workload = await fetch('/api/promotion/auto-grouping', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_workload', maxClasses: Number(maxClasses), retainSubjectLoads: true, retainClassTeacher: true })
      });
      const workloadJson = await workload.json();
      if (!workloadJson.ok) throw new Error(workloadJson.error?.message || 'Failed');
      toast({ title: 'Auto-grouping rules saved', tone: 'success' });
      load();
    } catch (e: any) {
      toast({ title: e?.message || 'Could not save auto-grouping rule', tone: 'error' });
    } finally { setBusy(false); }
  }

  async function runPreview(commit = false) {
    if (!level) { toast({ title: 'Choose a level first', tone: 'error' }); return; }
    setBusy(true);
    try {
      const res = await fetch('/api/promotion/auto-grouping', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: commit ? 'commit' : 'preview', level, ...(commit ? { capacityDecisions } : {}) })
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || 'Failed');
      if (commit) {
        toast({ title: json.data.summary, tone: 'success' });
        if (json.data.timetableJob) {
          toast({ title: 'Whole-school timetable regeneration started in the background to reflect the reassigned teachers.', tone: 'success' });
        }
        setPreview(null);
        setCapacityDecisions({});
        onDone();
      } else { setPreview(json.data); setCapacityDecisions({}); }
    } catch (e: any) {
      toast({ title: e?.message || 'Could not run auto-grouping', tone: 'error' });
    } finally { setBusy(false); }
  }

  // BB.3 — real, explicit, staff-confirmed split: creates a genuinely new
  // real class/section named from the school's own real input, then
  // re-runs the preview so the new class appears as a real extra
  // destination the grouping naturally spreads students into.
  async function splitOverflowClass(classId: string, subjectId: string | null) {
    if (!newClassName.trim()) { toast({ title: 'Name the new class/section first', tone: 'error' }); return; }
    setBusy(true);
    try {
      const checkRes = await fetch('/api/academics/class-capacity-overflow', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check', classId, subjectId, studentIds: (preview?.preview.find((g: any) => g.classId === classId)?.students ?? []).map((s: any) => s.id) }),
      });
      const checkJson = await checkRes.json();
      if (!checkJson.ok) throw new Error(checkJson.error?.message || 'Failed');
      if (!checkJson.data.overflow) { toast({ title: 'This class is no longer over capacity', tone: 'success' }); return; }
      const decideRes = await fetch('/api/academics/class-capacity-overflow', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decide', runId: checkJson.data.runId, decision: 'SPLIT_NEW_CLASS', newClassName }),
      });
      const decideJson = await decideRes.json();
      if (!decideJson.ok) throw new Error(decideJson.error?.message || 'Failed');
      toast({ title: `Real new class "${newClassName}" created — re-run preview to see students spread into it.`, tone: 'success' });
      setSplittingClassId(null);
      setNewClassName('');
      await runPreview(false);
    } catch (e: any) {
      toast({ title: e?.message || 'Could not split into a new class', tone: 'error' });
    } finally { setBusy(false); }
  }

  if (!setup) return <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wand2 className="h-5 w-5 text-green-600" /> Bulk admissions auto-grouping</CardTitle>
          <p className="text-xs text-navy-400">Place learners by school rules first, then keep subject-combination continuity, retain teachers where possible, and replace transferred teachers fairly.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <Label>Level</Label>
              <select value={level} onChange={(e) => setLevel(e.target.value)} className="mt-1 w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900">
                <option value="">Choose level…</option>
                {levels.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <Label>Rule name</Label>
              <Input value={ruleName} onChange={(e) => setRuleName(e.target.value)} />
            </div>
            <div>
              <Label>Max classes per teacher</Label>
              <Input type="number" value={maxClasses} onChange={(e) => setMaxClasses(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <StatCard icon={Users} label="Active classes" value={String((setup.classes ?? []).length)} />
            <StatCard icon={Check} label="Confirmed subject choices" value={String(setup.confirmedSelections ?? 0)} />
            <StatCard icon={RefreshCw} label="Saved rules" value={String((setup.rules ?? []).length)} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={saveRule} disabled={busy}><Check className="h-4 w-4" /> Save continuity rule</Button>
            <Button variant="secondary" onClick={() => runPreview(false)} disabled={busy}><Wand2 className="h-4 w-4" /> Preview grouping</Button>
            <Button variant="secondary" onClick={() => runPreview(true)} disabled={busy}><ArrowUpRight className="h-4 w-4" /> Commit grouping</Button>
          </div>
        </CardContent>
      </Card>

      {preview && (preview.capacityWarnings ?? []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400"><AlertCircle className="h-5 w-5" /> Real class capacity exceeded</CardTitle>
            <p className="text-xs text-navy-400">
              These real classes have their own configured maximum size — this grouping would put more real students into them than that. Resolve each one before committing.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {preview.capacityWarnings.map((w: any) => (
              <div key={w.classId} className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/40 dark:bg-amber-950/10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-navy-900 dark:text-white">{w.label}</p>
                    <p className="text-xs text-navy-500 dark:text-navy-400">{w.projectedCount} real students would be placed here · maximum is {w.capacity} · {w.overflowCount} over</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {capacityDecisions[w.classId] === "ALLOW_OVER_CAPACITY" ? (
                      <Badge tone="amber">Will allow over capacity</Badge>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => setCapacityDecisions((p) => ({ ...p, [w.classId]: "ALLOW_OVER_CAPACITY" }))} disabled={busy}>
                        Allow all in this class anyway
                      </Button>
                    )}
                    {splittingClassId === w.classId ? (
                      <>
                        <Input value={newClassName} onChange={(e) => setNewClassName(e.target.value)} placeholder="e.g. Geo" className="h-8 w-32 text-xs" />
                        <Button size="sm" onClick={() => splitOverflowClass(w.classId, null)} disabled={busy}>Create</Button>
                        <Button size="sm" variant="ghost" onClick={() => { setSplittingClassId(null); setNewClassName(""); }}>Cancel</Button>
                      </>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => setSplittingClassId(w.classId)} disabled={busy}>Split into a new class</Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {preview && (
        <Card>
          <CardHeader>
            <CardTitle>Grouping preview · {preview.level}</CardTitle>
            <p className="text-xs text-navy-400">Rule: {preview.ruleApplied} · {preview.movedCount} learners will move · subject-choice continuity applied first.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {(preview.preview ?? []).map((group: any) => (
                <div key={group.classId} className="rounded-2xl border border-navy-100 p-4 dark:border-navy-800">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-navy-900 dark:text-white">{group.label}</p>
                    <Badge tone="blue">{group.count} students</Badge>
                  </div>
                  <div className="mt-3 space-y-2">
                    {group.students.slice(0, 8).map((student: any) => (
                      <div key={student.id} className="flex items-center justify-between gap-3 rounded-xl border border-navy-50 px-3 py-2 text-xs dark:border-navy-800">
                        <div>
                          <p className="font-medium text-navy-800 dark:text-navy-100">{student.name}</p>
                          <p className="text-navy-400">{student.selectedSubjectIds.length > 0 ? `${student.selectedSubjectIds.length} chosen subjects` : 'No confirmed subject choice yet'}</p>
                        </div>
                        {student.moved ? <Badge tone="amber">Moved</Badge> : <Badge tone="green">Stays</Badge>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * BB.4 — real "Allocate Class" one-click flow. Founder's own real intake
 * scenario: a fresh Grade 10 cohort arrives with real subject choices
 * already made (imported via the Students import wizard's own new
 * Subjects column), and this panel is the guided next step that reads the
 * real subject combinations and offers the school an explicit real choice
 * — continue with classes already named in the import file (USE_EXISTING,
 * delegating straight to the real L.7 engine), or create brand-new real
 * classes from scratch (CREATE_NEW, the "hasn't yet enrolled grade 10"
 * case) — never assuming either way.
 */
function AllocateClassPanel({ onDone, initialLevel }: { onDone: () => void; initialLevel?: string }) {
  const { toast } = useToast();
  const [level, setLevel] = React.useState(initialLevel ?? "");
  const [busy, setBusy] = React.useState(false);
  const [preview, setPreview] = React.useState<any>(null);
  const [previewError, setPreviewError] = React.useState<string | null>(null);
  const [proposedStreamCount, setProposedStreamCount] = React.useState("2");
  const [proposedCapacityPerClass, setProposedCapacityPerClass] = React.useState("40");
  const [classStrategy, setClassStrategy] = React.useState<"CREATE_NEW" | "USE_EXISTING">("USE_EXISTING");
  const [capacityDecisions, setCapacityDecisions] = React.useState<Record<string, "ALLOW_OVER_CAPACITY">>({});
  const [seedSubjectNeeds, setSeedSubjectNeeds] = React.useState(true);
  const [generateTimetable, setGenerateTimetable] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);

  React.useEffect(() => {
    if (initialLevel) runPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runPreview() {
    if (!level.trim()) { toast({ title: "Enter a real level first, e.g. Grade 10", tone: "error" }); return; }
    setBusy(true);
    setPreviewError(null);
    setResult(null);
    try {
      const body: Record<string, unknown> = { action: "preview", level: level.trim() };
      const res = await fetch("/api/academics/class-allocation", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.ok) {
        // A level with zero real classes yet needs proposed stream count +
        // capacity before a real preview can run — an honest, in-context
        // message, never a raw stack trace.
        if (json.error?.code === "INVALID" && json.error.message?.includes("no real classes yet")) {
          setPreview(null);
          setClassStrategy("CREATE_NEW");
          setPreviewError("This level has no real classes yet. Choose how many new classes to create and their capacity, then preview again.");
          return;
        }
        throw new Error(json.error?.message || "Could not preview.");
      }
      setPreview(json.data);
      setClassStrategy(json.data.classStrategyAvailable);
      setCapacityDecisions({});
    } catch (e: any) {
      setPreviewError(e?.message || "Could not preview.");
    } finally { setBusy(false); }
  }

  async function runPreviewCreateNew() {
    if (!level.trim()) { toast({ title: "Enter a real level first, e.g. Grade 10", tone: "error" }); return; }
    const streamCount = Number(proposedStreamCount);
    const capacityPerClass = Number(proposedCapacityPerClass);
    if (!streamCount || !capacityPerClass) { toast({ title: "Enter a real number of streams and capacity", tone: "error" }); return; }
    setBusy(true);
    setPreviewError(null);
    setResult(null);
    try {
      const res = await fetch("/api/academics/class-allocation", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "preview", level: level.trim(), proposedStreamCount: streamCount, proposedCapacityPerClass: capacityPerClass }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || "Could not preview.");
      setPreview(json.data);
      setClassStrategy("CREATE_NEW");
      setCapacityDecisions({});
    } catch (e: any) {
      setPreviewError(e?.message || "Could not preview.");
    } finally { setBusy(false); }
  }

  async function confirm() {
    if (!level.trim()) return;
    setBusy(true);
    try {
      const body: Record<string, unknown> = {
        action: "confirm", level: level.trim(), classStrategy,
        seedSubjectNeeds, generateTimetable, capacityDecisions,
      };
      if (classStrategy === "CREATE_NEW") {
        body.streamCount = Number(proposedStreamCount);
        body.capacityPerClass = Number(proposedCapacityPerClass);
      }
      const res = await fetch("/api/academics/class-allocation", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || "Could not allocate classes.");
      setResult(json.data);
      setPreview(null);
      setCapacityDecisions({});
      toast({ title: json.data.summary, tone: "success" });
      if (json.data.timetableJobId) {
        toast({ title: "Whole-school timetable regeneration started in the background.", tone: "success" });
      }
      onDone();
    } catch (e: any) {
      toast({ title: e?.message || "Could not allocate classes.", tone: "error" });
    } finally { setBusy(false); }
  }

  const capacityWarnings = preview?.capacityWarnings ?? [];
  const undecidedWarnings = capacityWarnings.filter((w: any) => !capacityDecisions[w.classId]);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><LayoutGrid className="h-5 w-5 text-green-600" /> Allocate class</CardTitle>
          <p className="text-xs text-navy-400">
            For a fresh intake (e.g. a new Grade 10 cohort) with real subject choices already made — reads the real subject combinations and places students into real classes, filling any missing teacher automatically.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label>Level</Label>
              <Input value={level} onChange={(e) => setLevel(e.target.value)} placeholder="e.g. Grade 10" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={runPreview} disabled={busy || !level.trim()}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />} Preview
            </Button>
            {/* BB.7 — real, dedicated print of the subject-combination groups
                the system generated for this level, kept as its own
                separate reference print per the founder's own explicit
                instruction. */}
            {level.trim() && (
              <Button
                variant="secondary"
                onClick={() => window.open(`/print/electives-roster?kind=combination_roster&level=${encodeURIComponent(level.trim())}`, "_blank")}
              >
                <ClipboardCheck className="h-4 w-4" /> Print subject-combination roster
              </Button>
            )}
            {/* DD.4/DD.11 — real, dedicated per-subject roster print: every
                real subject at this level with its own full real student
                list and each student's own real current class, so a school
                can physically place students from one print. */}
            {level.trim() && (
              <Button
                variant="secondary"
                onClick={() => window.open(`/print/electives-roster?kind=subject_roster&level=${encodeURIComponent(level.trim())}`, "_blank")}
              >
                <ClipboardCheck className="h-4 w-4" /> Print per-subject roster (with classes)
              </Button>
            )}
          </div>

          {previewError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
              {previewError}
            </div>
          )}

          {classStrategy === "CREATE_NEW" && !preview && (
            <div className="space-y-3 rounded-2xl border border-navy-100 bg-warm-50 p-4 dark:border-navy-800 dark:bg-navy-900">
              <p className="text-xs font-semibold text-navy-700 dark:text-navy-200">No real classes exist yet for this level — choose how many to create:</p>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label>Number of new classes/streams</Label>
                  <Input type="number" min={1} value={proposedStreamCount} onChange={(e) => setProposedStreamCount(e.target.value)} />
                </div>
                <div>
                  <Label>Capacity per class</Label>
                  <Input type="number" min={1} value={proposedCapacityPerClass} onChange={(e) => setProposedCapacityPerClass(e.target.value)} />
                </div>
              </div>
              <Button onClick={runPreviewCreateNew} disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />} Preview new classes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {preview && undecidedWarnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400"><AlertCircle className="h-5 w-5" /> Real class capacity exceeded</CardTitle>
            <p className="text-xs text-navy-400">Resolve each one before confirming.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {capacityWarnings.map((w: any) => (
              <div key={w.classId} className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/40 dark:bg-amber-950/10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-navy-900 dark:text-white">{w.label}</p>
                    <p className="text-xs text-navy-500 dark:text-navy-400">{w.projectedCount} real students would be placed here · maximum is {w.capacity} · {w.overflowCount} over</p>
                  </div>
                  {capacityDecisions[w.classId] === "ALLOW_OVER_CAPACITY" ? (
                    <Badge tone="amber">Will allow over capacity</Badge>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => setCapacityDecisions((p) => ({ ...p, [w.classId]: "ALLOW_OVER_CAPACITY" }))} disabled={busy}>
                      Allow all in this class anyway
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {preview && (
        <Card>
          <CardHeader>
            <CardTitle>Allocation preview · {preview.level}</CardTitle>
            <p className="text-xs text-navy-400">
              {preview.classStrategyAvailable === "USE_EXISTING"
                ? "Real classes already exist for this level — continuing with them."
                : `${preview.proposedStreamCount ?? Number(proposedStreamCount)} new real class(es) will be created.`}
              {" "}{preview.totalStudents} real student(s) · {preview.movedCount} will be placed.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {preview.classStrategyAvailable === "USE_EXISTING" && (
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-navy-100 bg-warm-50 px-3 py-2.5 dark:border-navy-800 dark:bg-navy-900">
                <input
                  type="radio" checked={classStrategy === "USE_EXISTING"}
                  onChange={() => setClassStrategy("USE_EXISTING")}
                  className="mt-0.5 h-4 w-4 border-navy-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-xs text-navy-600 dark:text-navy-300">
                  <span className="block font-semibold text-navy-900 dark:text-navy-50">Continue with these classes</span>
                  Group real students into the real classes already named in your import file.
                </span>
              </label>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              {(preview.preview ?? []).map((group: any) => (
                <div key={group.classId} className="rounded-2xl border border-navy-100 p-4 dark:border-navy-800">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-navy-900 dark:text-white">{group.label}</p>
                    <Badge tone="blue">{group.count} students</Badge>
                  </div>
                  <div className="mt-3 space-y-2">
                    {group.students.slice(0, 8).map((student: any) => (
                      <div key={student.id} className="flex items-center justify-between gap-3 rounded-xl border border-navy-50 px-3 py-2 text-xs dark:border-navy-800">
                        <div>
                          <p className="font-medium text-navy-800 dark:text-navy-100">{student.name}</p>
                          <p className="text-navy-400">{student.selectedSubjectIds.length > 0 ? `${student.selectedSubjectIds.length} chosen subjects` : "No confirmed subject choice yet"}</p>
                        </div>
                        <Badge tone="amber">Placed</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 rounded-xl border border-navy-100 bg-warm-50 p-3 dark:border-navy-800 dark:bg-navy-900">
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" checked={seedSubjectNeeds} onChange={(e) => setSeedSubjectNeeds(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-navy-300 text-green-600 focus:ring-green-500" />
                <span className="text-xs text-navy-600 dark:text-navy-300">
                  <span className="block font-semibold text-navy-900 dark:text-navy-50">Set up subject teaching needs and auto-fill teachers</span>
                  Creates the real subject-teaching records each class needs based on students&apos; actual choices, then fills any missing teacher fairly — never overriding a teacher you&apos;ve already assigned.
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" checked={generateTimetable} onChange={(e) => setGenerateTimetable(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-navy-300 text-green-600 focus:ring-green-500" />
                <span className="text-xs text-navy-600 dark:text-navy-300">
                  <span className="block font-semibold text-navy-900 dark:text-navy-50">Generate the timetable now</span>
                  Only runs if real subject needs were set up and a real teacher was found — you can always generate later from the Timetable page instead.
                </span>
              </label>
            </div>

            <Button onClick={confirm} disabled={busy || undecidedWarnings.length > 0}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />} Confirm allocation
            </Button>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
              <Check className="h-7 w-7 text-green-600" />
            </span>
            <h2 className="text-lg font-semibold text-navy-900 dark:text-navy-50">{result.summary}</h2>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ContinuityEnginePanel() {
  const { toast } = useToast();
  const [classes, setClasses] = React.useState<ClassOpt[]>([]);
  const [level, setLevel] = React.useState("");
  const [snapshot, setSnapshot] = React.useState<any>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    fetch('/api/classes').then((r) => r.json()).then((j) => j.ok && setClasses(j.data.classes));
  }, []);

  const levels = React.useMemo(() => Array.from(new Set(classes.map((c) => c.level))).sort(), [classes]);

  async function loadSnapshot(target = level) {
    if (!target) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/promotion/continuity-engine?level=${encodeURIComponent(target)}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || 'Failed');
      setSnapshot(json.data);
    } catch (e: any) {
      toast({ title: e?.message || 'Could not load continuity snapshot', tone: 'error' });
    } finally { setBusy(false); }
  }

  async function applyChange(item: any, roleType: 'SUBJECT' | 'CLASS_TEACHER') {
    const candidate = item.recommendations?.[0];
    if (!candidate) {
      toast({ title: 'No replacement recommendation available', tone: 'error' });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/promotion/continuity-engine', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'apply_change', classId: item.classId, subjectId: item.subjectId ?? null, teacherId: candidate.teacherId, roleType, regenerateTimetable: true })
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || 'Failed');
      toast({ title: 'Teacher change applied and timetable regeneration started', tone: 'success' });
      loadSnapshot();
    } catch (e: any) {
      toast({ title: e?.message || 'Could not apply teacher change', tone: 'error' });
    } finally { setBusy(false); }
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5 text-green-600" /> Teacher continuity engine</CardTitle>
          <p className="text-xs text-navy-400">Keep class groups with their teachers across years, recommend fair replacements when teachers transfer, and regenerate timetable after approved changes.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[220px]">
              <Label>Level</Label>
              <select value={level} onChange={(e) => setLevel(e.target.value)} className="mt-1 w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900">
                <option value="">Choose level…</option>
                {levels.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <Button onClick={() => loadSnapshot()} disabled={busy || !level}><Sparkles className="h-4 w-4" /> Analyse continuity</Button>
          </div>
        </CardContent>
      </Card>

      {snapshot && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Subject teacher continuity · {snapshot.level}</CardTitle>
              <p className="text-xs text-navy-400">Next level: {snapshot.nextLevel ?? 'Final level / no next level'}.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {(snapshot.subjectAssignments ?? []).map((item: any, idx: number) => (
                <div key={`${item.classId}-${item.subjectId}-${idx}`} className="rounded-2xl border border-navy-100 p-4 dark:border-navy-800">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-navy-900 dark:text-white">{item.classLabel}</p>
                      <p className="text-xs text-navy-400">Subject {item.subjectId}</p>
                    </div>
                    {item.needsReplacement ? <Badge tone="amber">Needs replacement</Badge> : <Badge tone="green">Teacher retained</Badge>}
                  </div>
                  <div className="mt-3 text-xs text-navy-600 dark:text-navy-300">
                    {item.recommendations?.length > 0 ? (
                      <div className="space-y-2">
                        <p><strong>Best replacement:</strong> {item.recommendations[0].teacherName} · {item.recommendations[0].classCount} classes · {item.recommendations[0].lessonLoad} lessons</p>
                        <div className="rounded-xl bg-navy-50/60 p-3 dark:bg-navy-900/60">
                          <p><strong>Impact:</strong> {item.impact?.lessonsPerWeek ?? 0} lessons/week · {item.impact?.doubleCount ?? 0} doubles · {item.impact?.splitAllowed ? 'split doubles allowed' : 'consecutive doubles only'}</p>
                          <p className="mt-1"><strong>Why this teacher:</strong> {(item.recommendations[0].reasons ?? []).join(' · ')}</p>
                        </div>
                        <Button size="sm" className="mt-2" onClick={() => applyChange(item, 'SUBJECT')} disabled={busy}><Check className="h-4 w-4" /> Apply replacement + regenerate timetable</Button>
                      </div>
                    ) : <p>No change needed.</p>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Class teacher continuity · {snapshot.level}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(snapshot.classTeacherAssignments ?? []).map((item: any, idx: number) => (
                <div key={`${item.classId}-${idx}`} className="rounded-2xl border border-navy-100 p-4 dark:border-navy-800">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-navy-900 dark:text-white">{item.classLabel}</p>
                    </div>
                    {item.needsReplacement ? <Badge tone="amber">Needs replacement</Badge> : <Badge tone="green">Teacher retained</Badge>}
                  </div>
                  <div className="mt-3 text-xs text-navy-600 dark:text-navy-300">
                    {item.recommendations?.length > 0 ? (
                      <div className="space-y-2">
                        <p><strong>Best replacement:</strong> {item.recommendations[0].teacherName} · {item.recommendations[0].classCount} classes · {item.recommendations[0].lessonLoad} lessons</p>
                        <div className="rounded-xl bg-navy-50/60 p-3 dark:bg-navy-900/60">
                          <p><strong>Impact:</strong> {item.impact?.reason}</p>
                          <p className="mt-1"><strong>Why this teacher:</strong> {(item.recommendations[0].reasons ?? []).join(' · ')}</p>
                        </div>
                        <Button size="sm" className="mt-2" onClick={() => applyChange(item, 'CLASS_TEACHER')} disabled={busy}><Check className="h-4 w-4" /> Apply class teacher + regenerate timetable</Button>
                      </div>
                    ) : <p>No change needed.</p>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}


// ---- AA.3 New Academic Year Teacher Allocation Review wizard --------------
interface ReviewSubjectRow {
  classId: string; classLabel: string; subjectId: string; subjectName: string; subjectCode: string;
  lessonsPerWeek: number; currentTeacherId: string | null; currentTeacherName: string | null;
  currentTeacherValid: boolean; recommendations: { teacherId: string; teacherName: string; classCount: number; lessonLoad: number }[];
}
interface ReviewClassTeacherRow {
  classId: string; classLabel: string; currentTeacherId: string | null; currentTeacherName: string | null;
  currentTeacherValid: boolean; recommendations: { teacherId: string; teacherName: string; classCount: number; lessonLoad: number }[];
}
type ReviewDecisionKind = "KEEP" | "REPLACE" | "AUTO";
interface ReviewRunRow { id: string; level: string; status: string; appliedCount: number; autoFilledCount: number; decisionCount: number; createdByName: string; createdAt: string; completedAt: string | null }
interface ClassYearHistoryRow {
  id: string; classId: string; label: string; curriculum: string; graduationYear: number; studentCount: number;
  roster: { id: string; name: string; gender: string; admissionNo: string }[];
  subjectTeachers: { subjectId: string; subjectName: string; teacherId: string | null; teacherName: string | null; lessonsPerWeek: number }[];
  classTeacherName: string | null; createdByName: string; createdAt: string;
}

function TeacherAllocationReviewPanel() {
  const { toast } = useToast();
  const [classes, setClasses] = React.useState<ClassOpt[]>([]);
  const [level, setLevel] = React.useState("");
  const [snapshot, setSnapshot] = React.useState<{ level: string; subjectRows: ReviewSubjectRow[]; classTeacherRows: ReviewClassTeacherRow[]; needsAttentionCount: number } | null>(null);
  const [reviewRunId, setReviewRunId] = React.useState<string | null>(null);
  const [subjectDecisions, setSubjectDecisions] = React.useState<Record<string, { decision: ReviewDecisionKind; teacherId: string }>>({});
  const [classTeacherDecisions, setClassTeacherDecisions] = React.useState<Record<string, { decision: ReviewDecisionKind; teacherId: string }>>({});
  const [runs, setRuns] = React.useState<ReviewRunRow[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [classHistory, setClassHistory] = React.useState<ClassYearHistoryRow[]>([]);
  const [expandedHistoryId, setExpandedHistoryId] = React.useState<string | null>(null);

  const loadHistory = React.useCallback(async () => {
    try {
      const res = await fetch("/api/promotion/teacher-allocation-review?action=history");
      const json = await res.json();
      if (json.ok) setRuns(json.data.runs);
    } catch { /* history is a nice-to-have; snapshot errors are surfaced separately */ }
  }, []);

  const loadClassHistory = React.useCallback(async () => {
    try {
      const res = await fetch("/api/promotion/class-year-history");
      const json = await res.json();
      if (json.ok) setClassHistory(json.data.history);
    } catch { /* nice-to-have; not a review-blocking error */ }
  }, []);

  React.useEffect(() => {
    fetch("/api/classes").then((r) => r.json()).then((j) => j.ok && setClasses(j.data.classes));
    loadHistory();
    loadClassHistory();
  }, [loadHistory, loadClassHistory]);

  const levels = React.useMemo(() => Array.from(new Set(classes.map((c) => c.level))).sort(), [classes]);

  function keyFor(classId: string, subjectId: string) { return `${classId}::${subjectId}`; }

  async function loadSnapshot(target = level) {
    if (!target) return;
    setBusy(true);
    setError(false);
    try {
      const res = await fetch(`/api/promotion/teacher-allocation-review?level=${encodeURIComponent(target)}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || "Failed");
      setSnapshot(json.data);
      setSubjectDecisions({});
      setClassTeacherDecisions({});
      const startRes = await fetch("/api/promotion/teacher-allocation-review", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", level: target }),
      });
      const startJson = await startRes.json();
      if (startJson.ok) setReviewRunId(startJson.data.reviewRunId);
    } catch (e: any) {
      setError(true);
      toast({ title: e?.message || "Could not load the review", tone: "error" });
    } finally { setBusy(false); }
  }

  function setSubjectDecision(row: ReviewSubjectRow, decision: ReviewDecisionKind, teacherId = "") {
    setSubjectDecisions((prev) => ({ ...prev, [keyFor(row.classId, row.subjectId)]: { decision, teacherId } }));
  }
  function setClassTeacherDecision(row: ReviewClassTeacherRow, decision: ReviewDecisionKind, teacherId = "") {
    setClassTeacherDecisions((prev) => ({ ...prev, [row.classId]: { decision, teacherId } }));
  }

  const totalDecided = Object.keys(subjectDecisions).length + Object.keys(classTeacherDecisions).length;
  const totalSlots = (snapshot?.subjectRows.length ?? 0) + (snapshot?.classTeacherRows.length ?? 0);

  async function apply() {
    if (!snapshot || !reviewRunId) return;
    const decisions: any[] = [];
    for (const row of snapshot.subjectRows) {
      const d = subjectDecisions[keyFor(row.classId, row.subjectId)];
      if (!d) continue;
      decisions.push({ classId: row.classId, subjectId: row.subjectId, roleType: "SUBJECT", decision: d.decision, teacherId: d.decision === "REPLACE" ? d.teacherId : null });
    }
    for (const row of snapshot.classTeacherRows) {
      const d = classTeacherDecisions[row.classId];
      if (!d) continue;
      decisions.push({ classId: row.classId, roleType: "CLASS_TEACHER", decision: d.decision, teacherId: d.decision === "REPLACE" ? d.teacherId : null });
    }
    if (decisions.length === 0) { toast({ title: "Make at least one decision first", tone: "error" }); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/promotion/teacher-allocation-review", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "apply", reviewRunId, decisions, regenerateTimetable: true }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || "Failed");
      toast({ title: `${json.data.appliedCount} replaced · ${json.data.autoFilledCount} auto-filled · timetable regenerating`, tone: "success" });
      setSnapshot(null);
      setReviewRunId(null);
      setSubjectDecisions({});
      setClassTeacherDecisions({});
      loadHistory();
    } catch (e: any) {
      toast({ title: e?.message || "Could not apply the review", tone: "error" });
    } finally { setBusy(false); }
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-green-600" /> New academic year — teacher allocation review</CardTitle>
          <p className="text-xs text-navy-400">
            Right after promoting to a new academic year, walk through one level at a time: keep each teacher, replace with a specific
            person, or let NEYO auto-assign fairly. Nothing changes until you apply.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[220px]">
              <Label>Level</Label>
              <select value={level} onChange={(e) => setLevel(e.target.value)} className="mt-1 w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900">
                <option value="">Choose level…</option>
                {levels.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <Button onClick={() => loadSnapshot()} disabled={busy || !level}>
              {busy && !snapshot ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Review this level
            </Button>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
          <AlertCircle className="h-4 w-4" /> Couldn&apos;t load that level&apos;s review. <button onClick={() => loadSnapshot()} className="font-medium underline">Retry</button>
        </div>
      ) : busy && !snapshot ? (
        <div className="space-y-3">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
      ) : snapshot && totalSlots === 0 ? (
        <EmptyState icon={ClipboardCheck} title="Nothing to review yet" description="This level has no subject loads or class teachers assigned yet." />
      ) : snapshot ? (
        <>
          <div className="flex items-center justify-between rounded-2xl bg-warm-50 p-4 dark:bg-navy-800">
            <p className="text-sm text-navy-700 dark:text-navy-200">
              <span className="font-semibold">{snapshot.needsAttentionCount}</span> of {totalSlots} slots need attention ·
              <span className="ml-1 font-semibold">{totalDecided}</span> decided so far
            </p>
            <Button onClick={apply} disabled={busy || totalDecided === 0}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Apply decisions + regenerate timetable
            </Button>
          </div>

          <Card>
            <CardHeader><CardTitle>Subject-teacher slots · {snapshot.level}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {snapshot.subjectRows.map((row) => {
                const d = subjectDecisions[keyFor(row.classId, row.subjectId)];
                return (
                  <div key={keyFor(row.classId, row.subjectId)} className="rounded-2xl border border-navy-100 p-4 dark:border-navy-800">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-navy-900 dark:text-white">{row.classLabel} · {row.subjectName} ({row.subjectCode})</p>
                        <p className="text-xs text-navy-400">
                          Current: {row.currentTeacherName ?? "— none —"} · {row.lessonsPerWeek} lessons/week
                        </p>
                      </div>
                      {row.currentTeacherValid ? <Badge tone="green">Teacher active</Badge> : <Badge tone="amber">Needs attention</Badge>}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button onClick={() => setSubjectDecision(row, "KEEP")} className={`rounded-full px-3 py-1.5 text-xs font-medium ${d?.decision === "KEEP" ? "bg-navy-900 text-white dark:bg-navy-50 dark:text-navy-900" : "border border-navy-200 text-navy-600 dark:border-navy-700 dark:text-navy-300"}`}>Keep</button>
                      <button onClick={() => setSubjectDecision(row, "AUTO")} className={`rounded-full px-3 py-1.5 text-xs font-medium ${d?.decision === "AUTO" ? "bg-navy-900 text-white dark:bg-navy-50 dark:text-navy-900" : "border border-navy-200 text-navy-600 dark:border-navy-700 dark:text-navy-300"}`}>Let NEYO auto-assign</button>
                      <select
                        value={d?.decision === "REPLACE" ? d.teacherId : ""}
                        onChange={(e) => setSubjectDecision(row, "REPLACE", e.target.value)}
                        className="rounded-full border border-navy-200 bg-white px-3 py-1.5 text-xs dark:border-navy-700 dark:bg-navy-900"
                      >
                        <option value="">Replace with…</option>
                        {row.recommendations.map((r) => <option key={r.teacherId} value={r.teacherId}>{r.teacherName} · {r.classCount} classes · {r.lessonLoad} lessons</option>)}
                      </select>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Class-teacher slots · {snapshot.level}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {snapshot.classTeacherRows.map((row) => {
                const d = classTeacherDecisions[row.classId];
                return (
                  <div key={row.classId} className="rounded-2xl border border-navy-100 p-4 dark:border-navy-800">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-navy-900 dark:text-white">{row.classLabel}</p>
                        <p className="text-xs text-navy-400">Current: {row.currentTeacherName ?? "— none —"}</p>
                      </div>
                      {row.currentTeacherValid ? <Badge tone="green">Teacher active</Badge> : <Badge tone="amber">Needs attention</Badge>}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button onClick={() => setClassTeacherDecision(row, "KEEP")} className={`rounded-full px-3 py-1.5 text-xs font-medium ${d?.decision === "KEEP" ? "bg-navy-900 text-white dark:bg-navy-50 dark:text-navy-900" : "border border-navy-200 text-navy-600 dark:border-navy-700 dark:text-navy-300"}`}>Keep</button>
                      <button onClick={() => setClassTeacherDecision(row, "AUTO")} className={`rounded-full px-3 py-1.5 text-xs font-medium ${d?.decision === "AUTO" ? "bg-navy-900 text-white dark:bg-navy-50 dark:text-navy-900" : "border border-navy-200 text-navy-600 dark:border-navy-700 dark:text-navy-300"}`}>Let NEYO auto-assign</button>
                      <select
                        value={d?.decision === "REPLACE" ? d.teacherId : ""}
                        onChange={(e) => setClassTeacherDecision(row, "REPLACE", e.target.value)}
                        className="rounded-full border border-navy-200 bg-white px-3 py-1.5 text-xs dark:border-navy-700 dark:bg-navy-900"
                      >
                        <option value="">Replace with…</option>
                        {row.recommendations.map((r) => <option key={r.teacherId} value={r.teacherId}>{r.teacherName} · {r.classCount} classes · {r.lessonLoad} lessons</option>)}
                      </select>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </>
      ) : (
        <EmptyState icon={ClipboardCheck} title="Choose a level to begin" description="Pick a level above (usually right after promoting to a new academic year) to review its teacher allocation." />
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><History className="h-4 w-4 text-navy-400" /> Review history</CardTitle></CardHeader>
        <CardContent>
          {runs.length === 0 ? (
            <EmptyState icon={History} title="No reviews yet" description="Completed reviews appear here." />
          ) : (
            <ul className="divide-y divide-navy-50 dark:divide-navy-800">
              {runs.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-navy-800 dark:text-navy-100">
                      {r.level} — {r.decisionCount} decisions ({r.appliedCount} replaced, {r.autoFilledCount} auto-filled)
                    </p>
                    <p className="text-xs text-navy-400">
                      {new Date(r.createdAt).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" })} · {r.createdByName}
                    </p>
                  </div>
                  <Badge tone={r.status === "COMPLETED" ? "green" : "neutral"}>{r.status === "COMPLETED" ? "Completed" : "In progress"}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-navy-400" /> Graduated class history</CardTitle>
          <p className="text-xs text-navy-400">
            A permanent record of each class&apos;s real roster and subject-teacher allocation, frozen the moment it graduated —
            kept forever even though the same class slot is reused for next year&apos;s intake.
          </p>
        </CardHeader>
        <CardContent>
          {classHistory.length === 0 ? (
            <EmptyState icon={GraduationCap} title="No graduations recorded yet" description="Once a class graduates during a new academic year, its final roster and teacher allocation will appear here permanently." />
          ) : (
            <ul className="divide-y divide-navy-50 dark:divide-navy-800">
              {classHistory.map((h) => {
                const isOpen = expandedHistoryId === h.id;
                return (
                  <li key={h.id} className="py-2.5">
                    <button onClick={() => setExpandedHistoryId(isOpen ? null : h.id)} className="flex w-full items-center justify-between gap-3 text-left">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-navy-800 dark:text-navy-100">{h.label} — Class of {h.graduationYear}</p>
                        <p className="text-xs text-navy-400">{h.studentCount} students · Class teacher: {h.classTeacherName ?? "— none —"}</p>
                      </div>
                      <Badge tone="blue">{h.subjectTeachers.length} subjects</Badge>
                    </button>
                    {isOpen && (
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-warm-50/60 p-3 dark:bg-navy-900/60">
                          <p className="mb-1 text-xs font-semibold text-navy-600 dark:text-navy-300">Subject-teacher allocation</p>
                          <ul className="space-y-0.5 text-xs text-navy-600 dark:text-navy-300">
                            {h.subjectTeachers.map((s) => (
                              <li key={s.subjectId}>{s.subjectName}: {s.teacherName ?? "— unassigned —"} ({s.lessonsPerWeek}/wk)</li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-xl bg-warm-50/60 p-3 dark:bg-navy-900/60">
                          <p className="mb-1 text-xs font-semibold text-navy-600 dark:text-navy-300">Final roster</p>
                          <ul className="max-h-40 space-y-0.5 overflow-y-auto text-xs text-navy-600 dark:text-navy-300">
                            {h.roster.map((s) => <li key={s.id}>{s.name} · {s.admissionNo}</li>)}
                          </ul>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TeacherTransferImpactPanel() {
  const { toast } = useToast();
  const [teachers, setTeachers] = React.useState<any[]>([]);
  const [teacherId, setTeacherId] = React.useState("");
  const [reason, setReason] = React.useState("Transferred / left school");
  const [impact, setImpact] = React.useState<any>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    fetch('/api/conversations/recipients').then((r) => r.json()).then((j) => {
      if (j.ok) setTeachers((j.data.recipients ?? []).filter((u: any) => ["TEACHER", "CLASS_TEACHER", "HOD", "DEPUTY_PRINCIPAL", "DEAN_OF_STUDIES"].includes(u.role)));
    });
  }, []);

  async function analyse() {
    if (!teacherId) { toast({ title: 'Choose a teacher first', tone: 'error' }); return; }
    setBusy(true);
    try {
      const res = await fetch('/api/promotion/teacher-transfer-impact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'analyse', teacherId, reason }) });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || 'Failed');
      setImpact(json.data);
    } catch (e: any) {
      toast({ title: e?.message || 'Could not analyse teacher transfer impact', tone: 'error' });
    } finally { setBusy(false); }
  }

  async function apply() {
    if (!impact?.impactId) return;
    setBusy(true);
    try {
      const res = await fetch('/api/promotion/teacher-transfer-impact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'apply', impactId: impact.impactId }) });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || 'Failed');
      toast({ title: 'Replacement applied and timetable regeneration started', tone: 'success' });
      setImpact(null);
    } catch (e: any) {
      toast({ title: e?.message || 'Could not apply teacher transfer replacement', tone: 'error' });
    } finally { setBusy(false); }
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Replace className="h-5 w-5 text-amber-600" /> Teacher transfer impact</CardTitle>
          <p className="text-xs text-navy-400">Analyse what breaks when a teacher leaves, see fair replacements, then apply and regenerate the timetable.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label>Teacher</Label>
              <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className="mt-1 w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900">
                <option value="">Choose teacher…</option>
                {teachers.map((t) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
              </select>
            </div>
            <div>
              <Label>Reason</Label>
              <Input value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={analyse} disabled={busy}><Sparkles className="h-4 w-4" /> Analyse impact</Button>
            {impact && <Button variant="secondary" onClick={apply} disabled={busy}><Check className="h-4 w-4" /> Apply best replacements + regenerate</Button>}
          </div>
        </CardContent>
      </Card>

      {impact && (
        <Card>
          <CardHeader>
            <CardTitle>Impact summary</CardTitle>
            <p className="text-xs text-navy-400">{impact.summary}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {(impact.recommendations ?? []).map((row: any, idx: number) => (
              <div key={`${row.type}-${row.classId}-${idx}`} className="rounded-2xl border border-navy-100 p-4 dark:border-navy-800">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-navy-900 dark:text-white">{row.classLabel}</p>
                    <p className="text-xs text-navy-400">{row.type === 'SUBJECT' ? `Subject ${row.subjectId}` : 'Class teacher role'}</p>
                  </div>
                  <Badge tone="amber">Needs replacement</Badge>
                </div>
                <div className="mt-3 rounded-xl bg-navy-50/60 p-3 text-xs text-navy-700 dark:bg-navy-900/60 dark:text-navy-200">
                  <p><strong>Best replacement:</strong> {row.best?.teacherName}</p>
                  <p><strong>Projected classes:</strong> {row.best?.projectedClassCount} · <strong>Current lessons:</strong> {row.best?.lessonLoad}</p>
                  <p><strong>Max classes:</strong> {row.best?.maxClasses ?? 'No limit set'} · <strong>Max lessons:</strong> {row.best?.maxLessonsPerWeek ?? 'No limit set'}</p>
                  <p className="mt-1"><strong>Why this teacher:</strong> {(row.best?.reasons ?? []).join(' · ')}</p>
                  <p className="mt-1"><strong>Timetable impact:</strong> timetable will regenerate for affected classes and subjects.</p>
                </div>
                {row.comparison?.length > 0 && (
                  <div className="mt-3 overflow-x-auto rounded-2xl border border-navy-100 dark:border-navy-800">
                    <table className="w-full min-w-[640px] text-xs">
                      <thead className="bg-white/70 dark:bg-navy-950/40">
                        <tr>
                          <th className="px-3 py-2 text-left">Rank</th>
                          <th className="px-3 py-2 text-left">Teacher</th>
                          <th className="px-3 py-2 text-left">Classes</th>
                          <th className="px-3 py-2 text-left">Lessons</th>
                          <th className="px-3 py-2 text-left">Projected</th>
                          <th className="px-3 py-2 text-left">Safety</th>
                        </tr>
                      </thead>
                      <tbody>
                        {row.comparison.map((candidate: any) => {
                          const safe = (candidate.maxClasses == null || candidate.projectedClassCount <= candidate.maxClasses) && (candidate.maxLessonsPerWeek == null || candidate.lessonLoad <= candidate.maxLessonsPerWeek);
                          return (
                            <tr key={candidate.teacherId} className="border-t border-navy-100 dark:border-navy-800">
                              <td className="px-3 py-2 font-bold">#{candidate.rank}</td>
                              <td className="px-3 py-2">{candidate.teacherName}</td>
                              <td className="px-3 py-2">{candidate.classCount}</td>
                              <td className="px-3 py-2">{candidate.lessonLoad}</td>
                              <td className="px-3 py-2">{candidate.projectedClassCount} classes</td>
                              <td className="px-3 py-2">{safe ? <Badge tone="green">Safest</Badge> : <Badge tone="amber">Risk</Badge>}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
