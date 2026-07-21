"use client";

/**
 * Idea 9 (kenyan-extensions.service.ts) — Teacher Record of Work Covered
 * (MOE QASO Inspection Tracker). Real backend existed (TeacherRecordOfWork
 * model, /api/teacher/record-of-work) with ZERO frontend UI until this
 * fix — found during a full-stack audit of a prior AI session's "12
 * operational suites" commit. Tracks real syllabus coverage per
 * teacher/subject/class/week for MOE QASO inspection readiness, flagging
 * BEHIND_SCHEDULE entries.
 */
import * as React from "react";
import { ClipboardCheck, Plus, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { queuedPost } from "@/lib/offline/queue";

interface RecordRow {
  id: string;
  teacherName: string;
  subjectId: string;
  classId: string;
  strandName: string;
  substrandName: string;
  weekNumber: number;
  dateCovered: string;
  status: "COVERED" | "BEHIND_SCHEDULE";
  supervisorComment: string | null;
}
interface SubjectOpt { id: string; name: string; code: string }
interface ClassOpt { id: string; label: string }

export function RecordOfWorkClientTab({ canManage }: { canManage: boolean }) {
  const { toast } = useToast();
  const [records, setRecords] = React.useState<RecordRow[]>([]);
  const [subjects, setSubjects] = React.useState<SubjectOpt[]>([]);
  const [classes, setClasses] = React.useState<ClassOpt[]>([]);
  const [me, setMe] = React.useState<{ id: string; fullName: string } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const [subjectId, setSubjectId] = React.useState("");
  const [classId, setClassId] = React.useState("");
  const [strandName, setStrandName] = React.useState("");
  const [substrandName, setSubstrandName] = React.useState("");
  const [weekNumber, setWeekNumber] = React.useState("1");
  const [dateCovered, setDateCovered] = React.useState("");
  const [status, setStatus] = React.useState<"COVERED" | "BEHIND_SCHEDULE">("COVERED");
  const [supervisorComment, setSupervisorComment] = React.useState("");

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/teacher/record-of-work")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setRecords(j.data.records ?? []);
        else setError(j.error?.message || "Could not load records of work.");
      })
      .catch(() => setError("Network request failed"))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
    fetch("/api/academics/subjects").then((r) => r.json()).then((j) => j.ok && setSubjects(j.data.subjects)).catch(() => {});
    fetch("/api/classes").then((r) => r.json()).then((j) => j.ok && setClasses(j.data.classes.map((c: { id: string; level: string; stream: string | null }) => ({ id: c.id, label: `${c.level}${c.stream ? " " + c.stream : ""}` })))).catch(() => {});
    fetch("/api/auth/me").then((r) => r.json()).then((j) => j.ok && j.data.user && setMe({ id: j.data.user.id, fullName: j.data.user.fullName })).catch(() => {});
  }, [load]);

  async function handleRecord() {
    if (!me || !subjectId || !classId || !strandName.trim() || !weekNumber || !dateCovered) {
      toast({ title: "Subject, class, strand, week, and date are all required", tone: "error" });
      return;
    }
    setSaving(true);
    try {
      const result = await queuedPost(
        "/api/teacher/record-of-work",
        {
          teacherId: me.id,
          teacherName: me.fullName,
          subjectId,
          classId,
          strandName: strandName.trim(),
          substrandName: substrandName.trim(),
          weekNumber: Number(weekNumber),
          dateCovered,
          status,
          supervisorComment: supervisorComment.trim() || undefined,
        },
        `Record of work — ${strandName.trim()}`,
      );
      if (result.ok) {
        toast({
          title: result.queued ? "Coverage saved offline" : "Coverage recorded",
          description: result.queued ? "NEYO will sync this record once the connection returns." : undefined,
          tone: "success",
        });
        setStrandName("");
        setSubstrandName("");
        setSupervisorComment("");
        if (!result.queued) load();
      } else {
        toast({ title: "Could not record coverage. Check the fields and your permission.", tone: "error" });
      }
    } finally {
      setSaving(false);
    }
  }

  const behindCount = records.filter((r) => r.status === "BEHIND_SCHEDULE").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-black tracking-tight text-navy-950 dark:text-white flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-blue-600" />
          Teacher Record of Work Covered
        </h2>
        <p className="text-xs text-navy-500 dark:text-navy-400">
          Real weekly syllabus coverage tracking per subject/class -- ready for MOE QASO inspection.
          {behindCount > 0 && <span className="text-amber-600 font-semibold"> {behindCount} entr{behindCount === 1 ? "y" : "ies"} behind schedule.</span>}
        </p>
      </div>

      {canManage && (
        <Card className="rounded-3xl border border-navy-100 dark:border-navy-800">
          <CardHeader>
            <CardTitle className="text-base">Record coverage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="row-subject">Subject</Label>
                <select id="row-subject" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="w-full h-10 rounded-2xl border border-navy-200 bg-white px-3 text-xs font-semibold dark:border-navy-700 dark:bg-navy-900">
                  <option value="">-- Select subject --</option>
                  {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="row-class">Class</Label>
                <select id="row-class" value={classId} onChange={(e) => setClassId(e.target.value)} className="w-full h-10 rounded-2xl border border-navy-200 bg-white px-3 text-xs font-semibold dark:border-navy-700 dark:bg-navy-900">
                  <option value="">-- Select class --</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="row-strand">Strand</Label>
                <Input id="row-strand" placeholder="e.g. Numbers" value={strandName} onChange={(e) => setStrandName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="row-substrand">Sub-strand</Label>
                <Input id="row-substrand" placeholder="e.g. Whole numbers" value={substrandName} onChange={(e) => setSubstrandName(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="row-week">Week number</Label>
                <Input id="row-week" type="number" min={1} max={14} value={weekNumber} onChange={(e) => setWeekNumber(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="row-date">Date covered</Label>
                <Input id="row-date" type="date" value={dateCovered} onChange={(e) => setDateCovered(e.target.value)} />
              </div>
              <div>
                <Label>Status</Label>
                <div className="mt-1 grid grid-cols-2 gap-1.5">
                  {(["COVERED", "BEHIND_SCHEDULE"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`rounded-xl border px-2 py-2 text-[11px] font-semibold transition-colors ${status === s ? "border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200" : "border-navy-200 text-navy-500 dark:border-navy-700"}`}
                    >
                      {s === "COVERED" ? "Covered" : "Behind"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="row-comment">Supervisor comment (optional)</Label>
              <Input id="row-comment" placeholder="e.g. On track for term plan" value={supervisorComment} onChange={(e) => setSupervisorComment(e.target.value)} />
            </div>
            <Button onClick={handleRecord} disabled={saving} className="rounded-full bg-blue-700 hover:bg-blue-800 text-white">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Record coverage
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-3xl border border-navy-100 dark:border-navy-800">
        <CardHeader>
          <CardTitle className="text-base">Coverage log ({records.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-24 rounded-2xl" />
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">{error}</div>
          ) : records.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-navy-200 p-8 text-center text-xs text-navy-500 dark:border-navy-800">No coverage recorded yet.</div>
          ) : (
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {records.map((r) => (
                <div key={r.id} className="rounded-2xl border border-navy-100 dark:border-navy-800 p-3.5 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-navy-900 dark:text-white text-sm">
                      Week {r.weekNumber} · {r.strandName}{r.substrandName ? ` — ${r.substrandName}` : ""}
                    </p>
                    <p className="text-xs text-navy-400">
                      {r.teacherName} · {new Date(r.dateCovered).toLocaleDateString("en-KE")}
                      {r.supervisorComment ? ` · ${r.supervisorComment}` : ""}
                    </p>
                  </div>
                  <Badge tone={r.status === "COVERED" ? "green" : "amber"} className="flex items-center gap-1">
                    {r.status === "COVERED" ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {r.status === "COVERED" ? "Covered" : "Behind"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
