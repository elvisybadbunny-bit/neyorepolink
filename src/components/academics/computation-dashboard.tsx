"use client";

import * as React from "react";
import { Loader2, PlayCircle, CheckCircle2, Lock, Unlock, Mail, Bell, Settings2, Calculator, Table2, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { Progress } from "@/components/ui/progress";
import { SubjectPaperGradingCard } from "@/components/academics/subject-paper-grading-card";
import { TermAssessmentWeightCard } from "@/components/academics/term-assessment-weight-card";

export function ComputationDashboardClient({ canManage, schoolLevelActivation }: { canManage: boolean; schoolLevelActivation?: { isSeniorSchool: boolean; isJuniorSchool: boolean; educationLevelsOffered: string[] } }) {
  const [portals, setPortals] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [reportPortal, setReportPortal] = React.useState<any | null>(null);
  const [sendSmsOnRelease, setSendSmsOnRelease] = React.useState(false);
  const [terms, setTerms] = React.useState<Array<{ id: string; year: number; term: number }>>([]);
  const [newPortal, setNewPortal] = React.useState({ termId: "", name: "", closeDate: "" });
  const [gradeBoundaries, setGradeBoundaries] = React.useState<Array<{ grade: string; min: number }>>([]);
  const { toast } = useToast();

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/academics/grading/portals");
      const json = await res.json();
      if (json.ok) setPortals(json.data);
    } catch {
      toast({ title: "Failed to load portals", tone: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void load();
    fetch("/api/academics/terms").then((r) => r.json()).then((json) => { if (json.ok) setTerms(json.data.terms ?? []); }).catch(() => {});
    fetch("/api/academics/grading/scale").then((r) => r.json()).then((json) => { if (json.ok) setGradeBoundaries(json.data.boundaries ?? []); }).catch(() => {});
  }, [load]);

  async function saveGradingScale() {
    const res = await fetch("/api/academics/grading/scale", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ boundaries: gradeBoundaries }) });
    const json = await res.json();
    toast({ title: json.ok ? "Grading scale saved" : json.error?.message || "Could not save grading scale.", tone: json.ok ? "success" : "error" });
    if (json.ok) setGradeBoundaries(json.data.boundaries);
  }

  async function portalAction(action: "OPEN" | "CLOSE" | "REOPEN_CORRECTION", portalId?: string) {
    const body = action === "OPEN" ? { action, ...newPortal } : { action, portalId };
    const res = await fetch("/api/academics/grading/portals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json();
    if (!json.ok) { toast({ title: json.error?.message || "Could not update marks entry.", tone: "error" }); return; }
    toast({ title: action === "OPEN" ? "Marks entry opened" : action === "CLOSE" ? "Marks entry closed" : "Correction window opened", tone: "success" });
    setNewPortal({ termId: "", name: "", closeDate: "" });
    await load();
  }

  // Poll for progress if computing
  React.useEffect(() => {
    const isComputing = portals.some(p => p.status === "COMPUTING");
    if (!isComputing) return;

    const interval = setInterval(() => {
      fetch("/api/academics/grading/portals").then(r => r.json()).then(j => {
        if (j.ok) setPortals(j.data);
      });
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [portals]);

  const triggerCompute = async (id: string) => {
    try {
      const res = await fetch("/api/academics/grading/computation", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "COMPUTE", portalId: id })
      });
      if (res.ok) {
        toast({ title: "Computation started", tone: "success" });
        load();
      } else {
        const json = await res.json();
        toast({ title: json.error?.message || "Failed", tone: "error" });
      }
    } catch {
      toast({ title: "Network error", tone: "error" });
    }
  };

  const releaseResults = async (id: string) => {
    if (!confirm(`Release and lock these results?${sendSmsOnRelease ? " Parent SMS notifications will also be sent." : " No SMS will be sent."}`)) return;
    try {
      const res = await fetch("/api/academics/grading/computation", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RELEASE", portalId: id, sendSms: sendSmsOnRelease })
      });
      if (res.ok) {
        toast({ title: "Results Released Successfully!", tone: "success" });
        load();
      } else {
        const json = await res.json();
        toast({ title: json.error?.message || "Failed. You might need Principal privileges.", tone: "error" });
      }
    } catch {
      toast({ title: "Network error", tone: "error" });
    }
  };

  if (loading) return <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-navy-400" /></div>;

  return (
    <div className="space-y-6">
      {schoolLevelActivation ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900 dark:border-green-900/30 dark:bg-green-950/20 dark:text-green-200">
          <p className="font-semibold">Level-aware Grading Engine</p>
          <p className="mt-1 text-xs text-green-800 dark:text-green-300">
            Active levels: {schoolLevelActivation.educationLevelsOffered.length > 0 ? schoolLevelActivation.educationLevelsOffered.join(', ') : 'None selected yet'}.
            {schoolLevelActivation.isSeniorSchool ? ' Senior School is active, so subject-selection and pathway-sensitive grading workflows should be expected.' : ' Senior School grading complexity stays limited until Senior School is activated.'}
          </p>
        </div>
      ) : null}
      <div className="flex items-center justify-between border-b border-navy-100 pb-4 dark:border-navy-800">
        <div>
          <h2 className="text-xl font-black text-navy-950 dark:text-white flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" /> Grading Engine & Result Release
          </h2>
          <p className="text-sm font-medium text-navy-500">Close marks entry, review raw marks, compute weighted averages, and optionally notify parents by SMS.</p>
        </div>
      </div>

      <SubjectPaperGradingCard canManage={canManage} />
      <TermAssessmentWeightCard terms={terms} canManage={canManage} />

      {canManage && gradeBoundaries.length > 0 && <Card><CardHeader><CardTitle className="text-base">School grading scale</CardTitle></CardHeader><CardContent><p className="mb-3 text-xs text-navy-500">Set the minimum percentage for each grade. The saved scale is used during the next computation.</p><div className="flex flex-wrap gap-2">{gradeBoundaries.map((boundary, index) => <div key={`${boundary.grade}-${index}`} className="flex items-center gap-1 rounded-xl border border-navy-200 p-2 dark:border-navy-700"><input aria-label="Grade" value={boundary.grade} onChange={(e) => setGradeBoundaries((rows) => rows.map((row, i) => i === index ? { ...row, grade: e.target.value } : row))} className="w-12 bg-transparent text-sm font-bold outline-none"/><span className="text-xs">from</span><input aria-label={`Minimum mark for ${boundary.grade}`} type="number" min="0" max="100" value={boundary.min} onChange={(e) => setGradeBoundaries((rows) => rows.map((row, i) => i === index ? { ...row, min: Number(e.target.value) } : row))} className="w-14 rounded border px-1 py-0.5 text-sm dark:bg-navy-900"/><span className="text-xs">%</span></div>)}</div><Button className="mt-3" variant="secondary" onClick={saveGradingScale}>Save Grading Scale</Button></CardContent></Card>}

      {canManage && <Card><CardHeader><CardTitle className="text-base">Open marks entry from the exam timetable</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-4">
        <select value={newPortal.termId} onChange={(e) => setNewPortal((old) => ({ ...old, termId: e.target.value }))} className="h-11 rounded-xl border border-navy-200 bg-white px-3 text-sm dark:border-navy-700 dark:bg-navy-900"><option value="">Academic term…</option>{terms.map((term) => <option key={term.id} value={term.id}>Term {term.term}, {term.year}</option>)}</select>
        <input value={newPortal.name} onChange={(e) => setNewPortal((old) => ({ ...old, name: e.target.value }))} placeholder="For example: Term 2 marks entry" className="h-11 rounded-xl border border-navy-200 px-3 text-sm dark:border-navy-700 dark:bg-navy-900" />
        <input type="datetime-local" value={newPortal.closeDate} onChange={(e) => setNewPortal((old) => ({ ...old, closeDate: e.target.value }))} className="h-11 rounded-xl border border-navy-200 px-3 text-sm dark:border-navy-700 dark:bg-navy-900" />
        <Button onClick={() => portalAction("OPEN")} disabled={!newPortal.termId || !newPortal.name || !newPortal.closeDate}>Open Marks Entry</Button>
        <p className="text-xs text-navy-500 sm:col-span-4">NEYO uses the published exam timetable to prepare only the scheduled subjects. Teachers can enter marks until the closing time.</p>
      </CardContent></Card>}

      {portals.length === 0 ? (
        <EmptyState
          icon={Settings2}
          title="No Marks Portals Found"
          description="Open a marks portal to allow teachers to enter exam data."
        />
      ) : (
        <div className="space-y-4">
          {portals.map((p) => {
            const isClosed = new Date(p.closeDate) < new Date();
            return (
              <Card key={p.id} className={`overflow-hidden ${p.status === "COMPUTING" ? "border-blue-300 ring-2 ring-blue-500/20" : ""}`}>
                <CardContent className="p-0">
                  <div className="p-4 bg-white dark:bg-navy-950 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge tone={p.status === "OPEN" ? "green" : "neutral"}>
                          {p.status}
                        </Badge>
                        <span className="text-xs font-semibold text-navy-500">Close Date: {new Date(p.closeDate).toLocaleString()}</span>
                      </div>
                      <h3 className="font-black text-lg text-navy-950 dark:text-white">{p.name}</h3>
                    </div>
                    <div>
                      {(p.status === "OPEN" || p.status === "CORRECTION_OPEN") && canManage && (
                        <div className="flex flex-wrap justify-end gap-2">
                          <div className="flex items-center text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200"><Unlock className="h-4 w-4 mr-2" />{p.status === "CORRECTION_OPEN" ? "Correction Window Open" : isClosed ? "Closing Time Reached" : "Marks Entry Live"}</div>
                          <Button variant="secondary" onClick={() => portalAction("CLOSE", p.id)}><Lock className="h-4 w-4 mr-1"/>Close & Review Raw Marks</Button>
                        </div>
                      )}
                      {p.status === "CLOSED" && canManage && (
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button variant="secondary" onClick={() => window.open(`/api/academics/grading/raw-marks?portalId=${p.id}`, "_blank")}><Table2 className="h-4 w-4 mr-1"/>Print Raw Marks</Button>
                          <Button variant="secondary" onClick={() => portalAction("REOPEN_CORRECTION", p.id)}><Unlock className="h-4 w-4 mr-1"/>Open Corrections</Button>
                          <Button onClick={() => triggerCompute(p.id)} className="bg-blue-600 hover:bg-blue-700 rounded-full text-white"><PlayCircle className="h-4 w-4 mr-2"/>Start Computation</Button>
                        </div>
                      )}
                      {p.status === "PENDING_RELEASE" && (
                        <div className="flex flex-col items-end gap-2">
                          <label className="flex items-center gap-2 text-xs text-navy-600 dark:text-navy-300">
                            <input type="checkbox" checked={sendSmsOnRelease} onChange={(e) => setSendSmsOnRelease(e.target.checked)} />
                            Send SMS notification to parents
                          </label>
                          <Button onClick={() => releaseResults(p.id)} className="bg-green-600 hover:bg-green-700 rounded-full shadow-pop text-white">
                            <Mail className="h-4 w-4 mr-2" /> Release Results
                          </Button>
                        </div>
                      )}
                      {p.status === "RELEASED" && (
                        <div className="flex items-center gap-2">
                          <Button variant="secondary" onClick={() => setReportPortal(p)} className="rounded-full"><Table2 className="h-4 w-4 mr-2" /> Master report</Button>
                          <div className="flex items-center text-sm font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                            <CheckCircle2 className="h-4 w-4 mr-2" /> Released to Parents
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {p.status === "COMPUTING" && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 border-t border-blue-100 dark:border-blue-900/50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center"><Loader2 className="h-3 w-3 animate-spin mr-1"/> Aggregating Term Results...</span>
                        <span className="text-xs font-black text-blue-700 dark:text-blue-300">{p.computationProgress}%</span>
                      </div>
                      <Progress value={p.computationProgress} className="h-2 bg-blue-200 dark:bg-blue-950" indicatorClassName="bg-blue-600" />
                      <p className="text-[10px] text-blue-500 mt-2 italic">Computing micro-weights (PP1/PP2), macro-weights (CAT+Exam), and mapping CBE rubrics. Please wait.</p>
                    </div>
                  )}

                  {p.status === "PENDING_RELEASE" && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 border-t border-amber-100 dark:border-amber-900/50 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-300">
                        <Bell className="h-4 w-4" /> Computation finished. {p.computationTotalRows} records processed.
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Awaiting Principal Approval</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      {reportPortal && <MasterReportModal portal={reportPortal} onClose={() => setReportPortal(null)} />}
    </div>
  );
}

/** K.5 — Master Term Report viewer: pick a class, see each student's aggregated
 *  subject marks + overall mean and class position. */
function MasterReportModal({ portal, onClose }: { portal: any; onClose: () => void }) {
  const { toast } = useToast();
  const [classes, setClasses] = React.useState<{ id: string; level: string; stream: string | null }[]>([]);
  const [classId, setClassId] = React.useState("");
  const [data, setData] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/classes").then((r) => r.json()).then((j) => { if (j.ok) { setClasses(j.data.classes); if (j.data.classes[0]) setClassId(j.data.classes[0].id); } });
  }, []);

  React.useEffect(() => {
    if (!classId || !portal.termId) return;
    setLoading(true);
    fetch(`/api/academics/grading/computation?termId=${portal.termId}&classId=${classId}`)
      .then((r) => r.json())
      .then((j) => { if (j.ok) setData(j.data); else toast({ title: j.error?.message || "Could not load report", tone: "error" }); })
      .finally(() => setLoading(false));
  }, [classId, portal.termId, toast]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden bg-navy-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div className="max-h-[calc(100dvh-0.5rem)] w-full max-w-4xl overflow-y-auto overscroll-contain rounded-t-3xl border border-navy-200 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-pop dark:border-navy-700 dark:bg-navy-950 sm:max-h-[90dvh] sm:rounded-2xl sm:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-black text-lg">Master report — {portal.name}</h3>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="mb-3">
          <select value={classId} onChange={(e) => setClassId(e.target.value)} className="rounded-full border border-navy-200 bg-white px-3 py-1.5 text-sm dark:border-navy-700 dark:bg-navy-900">
            {classes.map((c) => <option key={c.id} value={c.id}>{c.level} {c.stream ?? ""}</option>)}
          </select>
        </div>
        {loading ? (
          <div className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>
        ) : !data || data.students.length === 0 ? (
          <p className="py-6 text-center text-sm italic text-navy-400">No computed master report for this class yet. Run computation first.</p>
        ) : (
          <div className="max-h-[60vh] overflow-auto">
            <table className="w-full min-w-[720px] text-xs">
              <thead className="sticky top-0 bg-white dark:bg-navy-950">
                <tr className="text-left text-navy-400">
                  <th className="p-2">Pos</th>
                  <th className="p-2">Student</th>
                  {data.subjects.map((s: any) => <th key={s.id} className="p-2" title={s.name}>{s.code}</th>)}
                  <th className="p-2 font-bold">Mean</th>
                  <th className="p-2">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50 dark:divide-navy-800">
                {data.students.map((st: any) => (
                  <tr key={st.admissionNo}>
                    <td className="p-2 font-mono">{st.overall?.rank ?? "—"}</td>
                    <td className="p-2 font-semibold">{st.name} <span className="text-navy-400">({st.admissionNo})</span></td>
                    {data.subjects.map((s: any) => {
                      const cell = st.subjects.find((x: any) => x.subjectId === s.id);
                      return <td key={s.id} className="p-2">{cell ? Math.round(cell.finalMark) : "—"}</td>;
                    })}
                    <td className="p-2 font-black">{st.overall ? Math.round(st.overall.finalMark) : "—"}</td>
                    <td className="p-2">{st.overall?.letterGrade ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
