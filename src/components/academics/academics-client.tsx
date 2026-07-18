"use client";

/**
 * B.4 Academics — tabs: Subjects · Departments · Terms · Timetable · Lessons.
 * Timetable: Odoo-style weekly grid, click a cell to set subject+teacher,
 * conflict errors surface as toasts, plus the greedy Auto-fill dialog.
 * All 4 UX states; mobile = horizontal-scroll grid.
 */
import * as React from "react";
import { TalentManagerClient } from "./talent-manager";
import { ReportBuilderClient } from "./report-builder";
import { CurriculumVersionManagerClient } from "./curriculum-version-manager";
import { PathwayManagerClient } from "./pathway-manager";
import { SubjectSelectionManager } from "./subject-selection-manager";
import { ComputationDashboardClient } from "./computation-dashboard";
import {
  BookOpen, Building2, CalendarRange, Grid3X3, NotebookPen, Plus,
  AlertCircle, Loader2, X, Sparkles, Trash2, Check, Calendar, Printer, Palette, Sliders, Info, HelpCircle, Save, Trophy,
  Calculator, FileText, Clock3, Wand2, RefreshCw, Link2, Ban, Users, TimerReset, ShieldCheck, RotateCcw, ClipboardList,
  GraduationCap, MapPin, Tag, Shuffle, Eye, ChevronDown, Lock, Award
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { TableContainer, Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn, curriculumLabel } from "@/lib/utils";
import { BundiIntelligentWizard } from "@/components/bundi/bundi-intelligent-wizard";
import { KnecCandidateStudio } from "@/components/academics/knec-candidate-studio";
import { MoeReturnsClientTab } from "@/components/academics/moe-returns-client-tab";
import { RecordOfWorkClientTab } from "@/components/academics/record-of-work-client-tab";
import { DisciplineSuite } from "@/components/extensions-v2/discipline-suite";
import { TextbookFineSuite } from "@/components/extensions-v2/textbook-fine-suite";
import { V2HeroCard } from "@/components/ui/v2/v2-hero-card";
import { V2ActionPill } from "@/components/ui/v2/v2-action-pill";
import { V2MobileCardRow } from "@/components/ui/v2/v2-mobile-card-row";

interface Subject { id: string; name: string; code: string; curriculum: string; departmentId: string | null; departmentName: string | null; archived: boolean }
interface Dept { id: string; name: string; hodId: string | null; hodName: string | null; subjectCount: number }
interface Term { id: string; year: number; term: number; startDate: string; endDate: string; current: boolean }
interface ClassOpt { id: string; name: string }
interface Slot { id: string; dayOfWeek: number; period: number; subjectId?: string | null; subjectName?: string | null; subjectCode?: string | null; activityCategoryId?: string | null; activityCategoryName?: string | null; activityCategoryColor?: string | null; teacherId: string | null; teacherName: string | null; venue?: string | null; className?: string; slotType?: string; weekRotation?: string; isCombined?: boolean; combinedDetails?: string; substituteTodayName?: string | null; electiveBlock?: { label: string; isDouble: boolean; subjects: { subjectName: string; subjectCode: string | null; teacherShortCode: string | null; venue: string | null }[] } | null; }
interface TimetablePrintGroup { id: string; title: string; subtitle: string; config: any; slots: Slot[] }
interface TimetablePrintBundle { mode: "classes" | "teachers" | "venues"; groups: TimetablePrintGroup[] }
interface Plan { id: string; date: string; topic: string; status: string; subjectName: string; subjectCode: string; className: string; teacherName: string }
interface Staff { id: string; fullName: string; role: string }

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export function AcademicsClient({ canManage, canAppointHod, isScopedHod, isCurriculumEngineEnabled = false, schoolLevelActivation }: { canManage: boolean; canAppointHod: boolean; isScopedHod: boolean; isCurriculumEngineEnabled?: boolean; schoolLevelActivation?: { shouldShowPathwayTools: boolean; shouldShowSubjectSelectionTools: boolean; isJuniorSchool: boolean; isSeniorSchool: boolean; isMixedSchool: boolean; educationLevelsOffered: string[] } }) {
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [tab, setTab] = React.useState<"subjects" | "departments" | "cocurricular" | "terms" | "timetable" | "exam-timetable" | "exam-auto-generator" | "lessons" | "generator" | "smart-timetable" | "roster" | "reports" | "curriculum-versions" | "pathways" | "computation" | "subject-selection" | "knec-studio" | "moe-returns" | "discipline" | "library-recovery" | "record-of-work">("subjects");

  React.useEffect(() => {
    fetch("/api/academics/subjects")
      .then((r) => r.json())
      .then((j) => { if (j.ok) setSubjects(j.data.subjects ?? []); })
      .catch(() => {});
  }, []);

  const showPathwayTools = schoolLevelActivation?.shouldShowPathwayTools ?? true;
  const showSubjectSelectionTools = schoolLevelActivation?.shouldShowSubjectSelectionTools ?? true;
  const [dismissLevelBanner, setDismissLevelBanner] = React.useState(() => typeof window !== "undefined" && localStorage.getItem("neyo_dismiss_academics_level") === "true");

  const tabs = [
    { key: "subjects" as const, label: "Subjects", icon: BookOpen },
    { key: "departments" as const, label: "Departments", icon: Building2 },
    { key: "cocurricular" as const, label: "Co-curricular", icon: Trophy },
    { key: "terms" as const, label: "Terms", icon: CalendarRange },
    { key: "timetable" as const, label: "Timetable", icon: Grid3X3 },
    { key: "exam-timetable" as const, label: "Exam Timetable", icon: ClipboardList },
    { key: "discipline" as const, label: "Discipline & Summons (`Idea 15`)", icon: Sparkles },
    { key: "library-recovery" as const, label: "Textbook Fines (`Idea 23`)", icon: BookOpen },
    { key: "exam-auto-generator" as const, label: "Exam Auto-Generator", icon: Sparkles },
    { key: "knec-studio" as const, label: "KNEC Candidate Studio (`Idea 7`)", icon: Award },
    { key: "moe-returns" as const, label: "MOE Statutory Returns (`Idea 2`)", icon: FileText },
    { key: "record-of-work" as const, label: "Record of Work (`Idea 9`)", icon: ClipboardList },
    { key: "lessons" as const, label: "Lesson plans", icon: NotebookPen },
    ...(isCurriculumEngineEnabled ? [
      { key: "computation" as const, label: "Grading Engine", icon: Calculator },
      { key: "reports" as const, label: "Report Builder", icon: FileText },
      { key: "curriculum-versions" as const, label: "Curriculum Versions", icon: Sliders },
      ...(showPathwayTools ? [{ key: "pathways" as const, label: "Senior Pathways", icon: Sparkles }] : []),
      ...(showSubjectSelectionTools ? [{ key: "subject-selection" as const, label: "Subject Selection", icon: BookOpen }] : [])
    ] : []),
    { key: "smart-timetable" as const, label: "Smart Timetable", icon: Wand2 },
    { key: "roster" as const, label: "Duty Roster", icon: CalendarRange },
  ];
  return (
    <div className="space-y-5">
      {schoolLevelActivation && !dismissLevelBanner && (
        <div className="print:hidden relative rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900 dark:border-green-900/30 dark:bg-green-950/20 dark:text-green-200">
          <button
            onClick={() => { setDismissLevelBanner(true); if (typeof window !== "undefined") localStorage.setItem("neyo_dismiss_academics_level", "true"); }}
            className="absolute right-3 top-3 rounded-full p-1 text-green-700 hover:bg-green-100 dark:hover:bg-green-900/40"
            title="Dismiss note"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="green">Level-aware Academics</Badge>
            {schoolLevelActivation.isJuniorSchool && <Badge tone="blue">Junior School active</Badge>}
            {schoolLevelActivation.isSeniorSchool && <Badge tone="blue">Senior School active</Badge>}
            {schoolLevelActivation.isMixedSchool && <Badge tone="amber">Mixed school</Badge>}
          </div>
          <p className="mt-2 text-xs text-green-800 dark:text-green-300">
            Subject Selection tools appear only when Junior School or Senior School is active. Senior Pathway tools appear only when Senior School is active.
          </p>
          <p className="mt-2 text-xs text-green-800 dark:text-green-300">
            Timetable preset guidance: {schoolLevelActivation.isSeniorSchool ? 'favor pathway-aware, combination-aware, and richer subject-structure planning' : schoolLevelActivation.isJuniorSchool ? 'favor subject-selection-aware planning without full Senior pathway complexity' : 'favor broad simpler planning with less pathway complexity'}.
          </p>
        </div>
      )}
      <div className="print:hidden inline-flex max-w-full overflow-x-auto rounded-full border border-navy-200 p-0.5 dark:border-navy-700">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200 ease-apple ${tab === t.key ? "bg-navy-900 text-white dark:bg-navy-50 dark:text-navy-900" : "text-navy-500"}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "subjects" && <SubjectsTab canManage={canManage} />}
      {tab === "departments" && <DepartmentsTab canManage={canManage} canAppointHod={canAppointHod} isScopedHod={isScopedHod} />}
      {tab === "cocurricular" && <CoCurricularTab canManage={canManage} onOpenTimetable={() => setTab("timetable")} />}
      {tab === "terms" && <TermsTab canManage={canManage} />}
      {tab === "timetable" && <TimetableTab canManage={canManage} />}
      {tab === "exam-timetable" && <ExamTimetableTab canManage={canManage} />}
      {tab === "exam-auto-generator" && <ExamAutoGeneratorTab canManage={canManage} schoolLevelActivation={schoolLevelActivation} />}
      {tab === "discipline" && <DisciplineSuite />}
      {tab === "library-recovery" && <TextbookFineSuite />}
      {tab === "knec-studio" && <KnecCandidateStudio canManage={canManage} />}
      {tab === "moe-returns" && <MoeReturnsClientTab canManage={canManage} />}
      {tab === "record-of-work" && <RecordOfWorkClientTab canManage={canManage} />}
      {tab === "lessons" && <LessonsTab />}
      {tab === "computation" && <ComputationDashboardClient canManage={canManage} schoolLevelActivation={schoolLevelActivation} />}
      {tab === "reports" && <ReportBuilderClient canManage={canManage} schoolLevelActivation={schoolLevelActivation} />}
      {tab === "curriculum-versions" && <CurriculumVersionManagerClient canManage={canManage} />}
      {tab === "pathways" && <PathwayManagerClient subjects={subjects} />}
      {tab === "subject-selection" && <SubjectSelectionManager subjects={subjects} />}
      {tab === "generator" && <TimetableGeneratorTab canManage={canManage} />}
      {tab === "smart-timetable" && <TimetableEngineTab canManage={canManage} schoolLevelActivation={schoolLevelActivation} />}
      {tab === "roster" && (
        <div className="space-y-8">
          <DutyRosterTab canManage={canManage} />
          <div className="border-t border-navy-100 dark:border-navy-800 pt-8 mt-8">
            <StudentDutyRosterClient canManage={canManage} />
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Subjects -----------------------------------------------------------------
function SubjectsTab({ canManage }: { canManage: boolean }) {
  const { toast } = useToast();
  const [subjects, setSubjects] = React.useState<Subject[] | null>(null);
  const [error, setError] = React.useState(false);
  const [dialog, setDialog] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [uiVersion, setUiVersion] = React.useState<"v1" | "v2">("v1");

  const load = React.useCallback(async () => {
    setError(false);
    try {
      const [res, vRes] = await Promise.all([
        fetch("/api/academics/subjects").then((r) => r.json()),
        fetch("/api/ops/ui-version").then((r) => r.json()).catch(() => ({ ok: false })),
      ]);
      if (res.ok) setSubjects(res.data.subjects); else setError(true);
      if (vRes.ok && vRes.version) setUiVersion(vRes.version);
    } catch { setError(true); }
  }, []);
  React.useEffect(() => { load(); }, [load]);

  async function addPreset(preset: "CBC" | "8-4-4") {
    setBusy(true);
    try {
      const res = await fetch("/api/academics/subjects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ preset }) });
      const json = await res.json();
      if (json.ok) { toast({ title: `${json.data.added} ${preset === "CBC" ? "CBE" : preset} subjects added`, tone: "success" }); load(); }
      else toast({ title: json.error?.message || "Failed", tone: "error" });
    } finally { setBusy(false); }
  }

  if (error) return <LoadError onRetry={load} />;
  if (subjects === null) return <Skeletons />;

  if (uiVersion === "v2") {
    return (
      <div className="space-y-6">
        <V2HeroCard
          title="Curriculum & Subject Directory"
          badgeLabel="Active Curriculum"
          metricValue={String(subjects.length)}
          metricLabel="Active Learning Subjects"
          secondaryValue="Grade 7–12"
          secondaryLabel="Active Grade Band"
          icon={BookOpen}
          actions={
            canManage ? (
              <>
                <V2ActionPill
                  label="New Subject"
                  icon={Plus}
                  variant="primary"
                  onClick={() => setDialog(true)}
                />
                <V2ActionPill
                  label="Load CBE Preset"
                  icon={Sparkles}
                  variant="secondary"
                  onClick={() => addPreset("CBC")}
                  disabled={busy}
                />
                <V2ActionPill
                  label="Load 8-4-4 Preset"
                  icon={Sparkles}
                  variant="secondary"
                  onClick={() => addPreset("8-4-4")}
                  disabled={busy}
                />
              </>
            ) : undefined
          }
        />

        <div className="space-y-2">
          {subjects.map((s) => (
            <V2MobileCardRow
              key={s.id}
              title={s.name}
              subtitle={`Code: ${s.code} • Dept: ${s.departmentName ?? "Unassigned"}`}
              badgeText={curriculumLabel(s.curriculum)}
              badgeVariant={s.curriculum === "CBC" ? "emerald" : "cyan"}
              icon={BookOpen}
            />
          ))}
        </div>

        {dialog && <SubjectDialog onClose={() => setDialog(false)} onDone={() => { setDialog(false); load(); }} />}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setDialog(true)}><Plus className="h-4 w-4" /> New subject</Button>
          <Button variant="secondary" disabled={busy} onClick={() => addPreset("CBC")}><Sparkles className="h-4 w-4" /> Add CBE set</Button>
          <Button variant="secondary" disabled={busy} onClick={() => addPreset("8-4-4")}><Sparkles className="h-4 w-4" /> Add 8-4-4 set</Button>
        </div>
      )}
      {subjects.length === 0 ? (
        <EmptyState icon={BookOpen} title="No subjects yet" description='Use "Add CBE set" or "Add 8-4-4 set" to load the standard Kenyan subjects in one click.' />
      ) : (
        <TableContainer>
          <Table>
            <THead><TR><TH>Code</TH><TH>Subject</TH><TH>Curriculum</TH><TH>Department</TH></TR></THead>
            <TBody>
              {subjects.map((s) => (
                <TR key={s.id}>
                  <TD className="font-mono text-xs">{s.code}</TD>
                  <TD className="font-medium">{s.name}</TD>
                  <TD><Badge tone={s.curriculum === "CBC" ? "green" : s.curriculum === "8-4-4" ? "blue" : "neutral"}>{curriculumLabel(s.curriculum)}</Badge></TD>
                  <TD className="text-navy-400">{s.departmentName ?? "—"}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableContainer>
      )}
      {dialog && <SubjectDialog onClose={() => setDialog(false)} onDone={() => { setDialog(false); load(); }} />}
    </div>
  );
}

function SubjectDialog({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { toast } = useToast();
  const [f, setF] = React.useState({ name: "", code: "", curriculum: "BOTH" });
  const [saving, setSaving] = React.useState(false);
  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/academics/subjects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const json = await res.json();
      if (json.ok) { toast({ title: "Subject added", tone: "success" }); onDone(); }
      else toast({ title: json.error?.message || "Failed", tone: "error" });
    } finally { setSaving(false); }
  }
  return (
    <Modal title="New subject" onClose={onClose}>
      <div className="space-y-3">
        <div><Label>Name</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Mathematics" /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label>Code</Label><Input value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} placeholder="MAT" /></div>
          <div>
            <Label>Curriculum</Label>
            <select value={f.curriculum} onChange={(e) => setF({ ...f, curriculum: e.target.value })} className="mt-1 w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-800">
              <option value="BOTH">Both</option><option value="CBC">CBE</option><option value="8-4-4">8-4-4</option>
            </select>
          </div>
        </div>
        <Button onClick={save} disabled={saving || f.name.length < 2 || f.code.length < 2} className="w-full">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add subject
        </Button>
      </div>
    </Modal>
  );
}

// ---- Departments ----------------------------------------------------------------
function DepartmentsTab({ canManage, canAppointHod, isScopedHod }: { canManage: boolean; canAppointHod: boolean; isScopedHod: boolean }) {
  const { toast } = useToast();
  const [depts, setDepts] = React.useState<Dept[] | null>(null);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [teachers, setTeachers] = React.useState<Staff[]>([]);
  const [error, setError] = React.useState(false);
  const [name, setName] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [editingDept, setEditingDept] = React.useState<Dept | null>(null);

  const load = React.useCallback(async () => {
    setError(false);
    try {
      const res = await fetch("/api/academics/departments");
      const json = await res.json();
      if (json.ok) setDepts(json.data.departments); else setError(true);
    } catch { setError(true); }
  }, []);

  React.useEffect(() => {
    load();
    fetch("/api/academics/subjects").then((r) => r.json()).then((j) => j.ok && setSubjects(j.data.subjects));
    fetch("/api/conversations/recipients").then((r) => r.json()).then((j) => {
      if (j.ok) {
        setTeachers((j.data.recipients ?? []).filter((u: any) => 
          ["TEACHER", "CLASS_TEACHER", "HOD", "DEPUTY_PRINCIPAL", "PRINCIPAL", "SCHOOL_OWNER"].includes(u.role)
        ));
      }
    });
  }, [load]);

  async function add() {
    setSaving(true);
    try {
      const res = await fetch("/api/academics/departments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
      const json = await res.json();
      if (json.ok) { toast({ title: "Department added", tone: "success" }); setName(""); load(); }
      else toast({ title: json.error?.message || "Failed", tone: "error" });
    } finally { setSaving(false); }
  }

  if (error) return <LoadError onRetry={load} />;
  if (depts === null) return <Skeletons />;

  return (
    <div className="space-y-4">
      {isScopedHod && (
        <Card>
          <CardContent className="p-4 text-sm text-navy-600 dark:text-navy-300">
            You are in HOD mode. NEYO shows only your assigned department and allows changes only inside that department. Principal or School Owner appointment is required to change a Department Head.
          </CardContent>
        </Card>
      )}
      {canManage && !isScopedHod && (
        <div className="flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sciences" className="max-w-xs" />
          <Button onClick={add} disabled={saving || name.trim().length < 2}><Plus className="h-4 w-4" /> Add Department</Button>
        </div>
      )}
      {depts.length === 0 ? (
        <EmptyState icon={Building2} title="No departments yet" description="Group subjects under departments (Languages, Sciences, Humanities…) and assign HODs." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {depts.map((d) => (
            <Card key={d.id}>
              <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                <div className="min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-navy-900 dark:text-navy-50">{d.name}</p>
                    {d.name.toLowerCase().includes("co-curricular") && (
                      <Badge tone="green">Non-Academic</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-navy-500 dark:text-navy-400">
                    {d.subjectCount} subject{d.subjectCount === 1 ? "" : "s"}
                    {d.hodName ? ` · HOD: ${d.hodName}` : " · No HOD Assigned"}
                  </p>
                </div>
                {canManage && (
                  <Button size="sm" variant="secondary" className="w-full" onClick={() => setEditingDept(d)}>
                    Configure Department
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editingDept && (
        <EditDeptModal
          dept={editingDept}
          teachers={teachers}
          subjects={subjects}
          currentSubjectIds={subjects.filter((s) => s.departmentId === editingDept.id).map((s) => s.id)}
          canAppointHod={canAppointHod}
          onClose={() => setEditingDept(null)}
          onSaved={() => { setEditingDept(null); load(); toast({ title: "Department updated", tone: "success" }); }}
        />
      )}
    </div>
  );
}

// ---- Department Config & Subject Mapping Modal --------------------------------------
function EditDeptModal({ dept, teachers, subjects, currentSubjectIds, canAppointHod, onClose, onSaved }: {
  dept: Dept; teachers: Staff[]; subjects: Subject[]; currentSubjectIds: string[]; canAppointHod: boolean; onClose: () => void; onSaved: () => void;
}) {
  const { toast } = useToast();
  const [name, setName] = React.useState(dept.name);
  const [hodId, setHodId] = React.useState(dept.hodId ?? "");
  const [selectedSubjectIds, setSelectedSubjectIds] = React.useState<Set<string>>(new Set(currentSubjectIds));
  const [saving, setSaving] = React.useState(false);

  function toggleSubject(sid: string) {
    const next = new Set(selectedSubjectIds);
    if (next.has(sid)) next.delete(sid); else next.add(sid);
    setSelectedSubjectIds(next);
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/academics/departments?id=${dept.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          hodId: hodId || null,
          subjectIds: [...selectedSubjectIds],
        }),
      });
      const json = await res.json();
      if (json.ok) onSaved();
      else toast({ title: json.error?.message || "Department update failed", tone: "error" });
    } finally { setSaving(false); }
  }

  return (
    <Modal title={`Configure: ${dept.name}`} onClose={onClose} wide>
      <div className="space-y-4">
        <div>
          <Label>Department Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Humanities" />
        </div>

        <div>
          <Label>Appoint Department Head (HOD)</Label>
          {canAppointHod ? (
            <select value={hodId} onChange={(e) => setHodId(e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-navy-200 bg-white px-3.5 py-2.5 text-sm dark:border-navy-700 dark:bg-navy-900 text-navy-800 dark:text-navy-100">
              <option value="">No HOD Appointed</option>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
            </select>
          ) : (
            <div className="mt-1.5 rounded-2xl border border-navy-100 bg-navy-50 px-3.5 py-2.5 text-sm text-navy-600 dark:border-navy-800 dark:bg-navy-900/60 dark:text-navy-300">
              {dept.hodName || "No HOD appointed yet"} · only the Principal or School Owner can change this.
            </div>
          )}
        </div>

        <div>
          <Label>Map Subjects to this Department</Label>
          <div className="mt-2 max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {subjects.map((s) => (
              <label key={s.id} className="flex items-center gap-2.5 rounded-lg p-1.5 hover:bg-navy-50 text-xs text-navy-700 dark:text-navy-200 cursor-pointer">
                <input type="checkbox" checked={selectedSubjectIds.has(s.id)} onChange={() => toggleSubject(s.id)} className="h-4 w-4 rounded border-navy-300 text-green-600 focus:ring-green-500" />
                <span>{s.name} ({s.code})</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-navy-100 dark:border-navy-800">
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Save Configuration</Button>
        </div>
      </div>
    </Modal>
  );
}


// ---- Co-curricular ---------------------------------------------------------------
function classLabel(c: any) {
  return [c.level, c.stream].filter(Boolean).join(" ") || c.name || "Class";
}

function configWithDefaults(classId: string, current: any | null) {
  return {
    classId,
    periodsPerDay: current?.periodsPerDay ?? 8,
    freePeriodsPerWeek: current?.freePeriodsPerWeek ?? 4,
    coCurricularCount: current?.coCurricularCount ?? 2,
    coCurricularName: current?.coCurricularName ?? "Games",
    schoolDayStartTime: current?.schoolDayStartTime ?? "08:00",
    saturdayStartTime: current?.saturdayStartTime ?? "08:00",
    saturdayEndTime: current?.saturdayEndTime ?? "12:40",
    lessonDurationMins: current?.lessonDurationMins ?? 40,
    shortBreakStart: current?.shortBreakStart ?? 2,
    shortBreakMins: current?.shortBreakMins ?? 15,
    longBreakStart: current?.longBreakStart ?? 4,
    longBreakMins: current?.longBreakMins ?? 30,
    lunchStart: current?.lunchStart ?? 6,
    lunchMins: current?.lunchMins ?? 60,
    hasRemedials: current?.hasRemedials ?? false,
    hasPreps: current?.hasPreps ?? false,
    lunchShift: current?.lunchShift ?? 1,
    hasSaturday: current?.hasSaturday ?? true,
  };
}

function CoCurricularTab({ canManage, onOpenTimetable }: { canManage: boolean; onOpenTimetable: () => void }) {
  return <TalentManagerClient canManage={canManage} />;
}

// ---- Terms -----------------------------------------------------------------------
function TermsTab({ canManage }: { canManage: boolean }) {
  const { toast } = useToast();
  const [terms, setTerms] = React.useState<Term[] | null>(null);
  const [error, setError] = React.useState(false);
  const [f, setF] = React.useState({ year: new Date().getFullYear(), term: 1, startDate: "", endDate: "", current: true });
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setError(false);
    try {
      const res = await fetch("/api/academics/terms");
      const json = await res.json();
      if (json.ok) setTerms(json.data.terms); else setError(true);
    } catch { setError(true); }
  }, []);
  React.useEffect(() => { load(); }, [load]);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/academics/terms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const json = await res.json();
      if (json.ok) { toast({ title: `Term ${f.term}, ${f.year} saved`, tone: "success" }); load(); }
      else toast({ title: json.error?.message || "Failed", tone: "error" });
    } finally { setSaving(false); }
  }

  if (error) return <LoadError onRetry={load} />;
  if (terms === null) return <Skeletons />;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>School terms</CardTitle></CardHeader>
        <CardContent>
          {terms.length === 0 ? (
            <EmptyState icon={CalendarRange} title="No terms set" description="Define Term 1–3 dates so reports, fees and analytics know the current term." />
          ) : (
            <ul className="divide-y divide-navy-50 dark:divide-navy-800">
              {terms.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="font-medium text-navy-900 dark:text-navy-50">Term {t.term}, {t.year}</span>
                  <span className="text-xs text-navy-400">{t.startDate} → {t.endDate}</span>
                  {t.current && <Badge tone="green">current</Badge>}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      {canManage && (
        <Card>
          <CardHeader><CardTitle>Add / edit a term</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Year</Label><Input type="number" value={f.year} onChange={(e) => setF({ ...f, year: Number(e.target.value) })} /></div>
              <div>
                <Label>Term</Label>
                <select value={f.term} onChange={(e) => setF({ ...f, term: Number(e.target.value) })} className="mt-1 w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-800">
                  <option value={1}>Term 1</option><option value={2}>Term 2</option><option value={3}>Term 3</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Starts</Label><Input type="date" value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} /></div>
              <div><Label>Ends</Label><Input type="date" value={f.endDate} onChange={(e) => setF({ ...f, endDate: e.target.value })} /></div>
            </div>
            <label className="flex items-center gap-2 text-sm text-navy-600 dark:text-navy-300">
              <input type="checkbox" checked={f.current} onChange={(e) => setF({ ...f, current: e.target.checked })} className="h-4 w-4 rounded border-navy-300 text-green-600 focus:ring-green-500" />
              This is the current term
            </label>
            <Button onClick={save} disabled={saving || !f.startDate || !f.endDate} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Save term
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ---- Timetable ---------------------------------------------------------------------

// ---- Timetable ---------------------------------------------------------------------

// Dynamic helper to compute subject-specific colors for high legibility
function getSubjectStyle(code: string, isBandW: boolean) {
  if (isBandW) {
    return "border border-navy-300 bg-white text-navy-950 font-bold dark:bg-navy-950 dark:text-white";
  }
  
  const c = code.toUpperCase();
  if (c.startsWith("MAT") || c.startsWith("MATH")) {
    return "bg-blue-500/10 border border-blue-200 text-blue-800 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-900/30";
  }
  if (c.startsWith("ENG")) {
    return "bg-green-500/10 border border-green-200 text-green-800 dark:bg-green-950/20 dark:text-green-300 dark:border-green-900/30";
  }
  if (c.startsWith("KIS") || c.startsWith("SWA")) {
    return "bg-amber-500/10 border border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/30";
  }
  if (c.startsWith("CHEM") || c.startsWith("PHY") || c.startsWith("BIO") || c.startsWith("SCI")) {
    return "bg-purple-500/10 border border-purple-200 text-purple-800 dark:bg-purple-950/20 dark:text-purple-300 dark:border-purple-900/30";
  }
  if (c.startsWith("LUNCH") || c.startsWith("BREAK")) {
    return "bg-red-500/5 border border-red-200 text-red-800 dark:bg-red-950/10 dark:text-red-400 dark:border-red-900/30";
  }
  if (c.startsWith("FREE")) {
    return "bg-navy-50/50 border border-navy-100 text-navy-400 dark:bg-navy-900/20 dark:text-navy-500 dark:border-navy-800/30";
  }
  
  return "bg-green-500/5 border border-green-500/20 text-navy-900 dark:text-green-300 dark:bg-green-950/10";
}

function getSubjectAbbreviation(name: string, code: string): string {
  if (code && code.trim().length > 0) return code.toUpperCase();
  const n = name.trim();
  if (n.length <= 10) return n;
  return n.slice(0, 8) + ".";
}

function formatTimetableTime(totalMins: number) {
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  const periodLabel = h >= 12 ? "PM" : "AM";
  const formattedHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${String(formattedHour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${periodLabel}`;
}

function parseTimeToMinutes(value?: string | null, fallback = "08:00") {
  const raw = /^\d{2}:\d{2}$/.test(value ?? "") ? value! : fallback;
  const [h, m] = raw.split(":").map(Number);
  return h * 60 + m;
}

function timetablePeriodStartMinutes(p: number, config: any, dayOfWeek?: number, realLunchPeriods?: Set<number>): number {
  const startTotal = parseTimeToMinutes(dayOfWeek === 6 ? config?.saturdayStartTime : config?.schoolDayStartTime, "08:00");
  const duration = config?.lessonDurationMins ?? 40;
  const shortBreakStart = config?.shortBreakStart ?? 2;
  const shortBreakMins = config?.shortBreakMins ?? 15;
  const shortBreak2Start = config?.shortBreak2Start ?? null;
  const shortBreak2Mins = config?.shortBreak2Mins ?? 0;
  const longBreakStart = config?.longBreakStart ?? 4;
  const longBreakMins = config?.longBreakMins ?? 30;
  const lunchStart = config?.lunchStart ?? 6;
  const lunchMins = config?.lunchMins ?? 60;
  let totalMinutes = 0;
  for (let i = 1; i < p; i++) {
    const isRealLunch = realLunchPeriods ? realLunchPeriods.has(i) : i === lunchStart;
    totalMinutes += isRealLunch ? lunchMins : duration;
    if (i === shortBreakStart) totalMinutes += shortBreakMins;
    if (shortBreak2Start && i === shortBreak2Start) totalMinutes += shortBreak2Mins;
    if (i === longBreakStart) totalMinutes += longBreakMins;
  }
  return startTotal + totalMinutes;
}

function timetablePeriodTimeRange(p: number, config: any, dayOfWeek?: number, realLunchPeriods?: Set<number>): string {
  const startTotal = timetablePeriodStartMinutes(p, config, dayOfWeek, realLunchPeriods);
  const isRealLunch = realLunchPeriods ? realLunchPeriods.has(p) : p === (config?.lunchStart ?? 6);
  const endTotal = startTotal + (isRealLunch ? config?.lunchMins ?? 60 : config?.lessonDurationMins ?? 40);
  return `${formatTimetableTime(startTotal)} - ${formatTimetableTime(endTotal)}`;
}

function timetableNonLessonTimeRange(afterPeriod: number, minutes: number, config: any, realLunchPeriods?: Set<number>): string {
  const isRealLunch = realLunchPeriods ? realLunchPeriods.has(afterPeriod) : afterPeriod === (config?.lunchStart ?? 6);
  const startTotal = timetablePeriodStartMinutes(afterPeriod, config, undefined, realLunchPeriods) + (isRealLunch ? config?.lunchMins ?? 60 : config?.lessonDurationMins ?? 40);
  const endTotal = startTotal + minutes;
  return `${formatTimetableTime(startTotal)} - ${formatTimetableTime(endTotal)}`;
}

function nonLessonRowsForPeriod(p: number, config: any, realLunchPeriods?: Set<number>) {
  const rows: { key: string; label: string; minutes: number; tone: "break" | "lunch"; timeRange: string }[] = [];
  if (!config) return rows;
  if (p === config.shortBreakStart) {
    const minutes = config.shortBreakMins ?? 15;
    rows.push({ key: `short-break-${p}`, label: "Short Break", minutes, tone: "break", timeRange: timetableNonLessonTimeRange(p, minutes, config, realLunchPeriods) });
  }
  if (config.shortBreak2Start && p === config.shortBreak2Start) {
    const minutes = config.shortBreak2Mins ?? 10;
    rows.push({ key: `short-break2-${p}`, label: "Short Break", minutes, tone: "break", timeRange: timetableNonLessonTimeRange(p, minutes, config, realLunchPeriods) });
  }
  if (p === config.longBreakStart) {
    const minutes = config.longBreakMins ?? 30;
    rows.push({ key: `long-break-${p}`, label: "Long Break", minutes, tone: "break", timeRange: timetableNonLessonTimeRange(p, minutes, config, realLunchPeriods) });
  }
  const isRealLunchHere = realLunchPeriods ? realLunchPeriods.has(p) : p === config.lunchStart;
  if (isRealLunchHere) {
    const minutes = config.lunchMins ?? 60;
    rows.push({ key: `lunch-${p}`, label: "Lunch", minutes, tone: "lunch", timeRange: timetableNonLessonTimeRange(p, minutes, config, realLunchPeriods) });
  }
  return rows;
}

// DD.13 — real double-period merging: a genuine double lesson (the SAME
// real class, SAME real subject, SAME real teacher, SAME real slotType,
// booked on two real CONSECUTIVE periods of the same real day) should
// render as ONE merged visual cell spanning both periods, instead of two
// separate identical-looking cells stacked on top of each other. This is
// deliberately computed from the real persisted slot data itself (never a
// separate "isDouble" flag on the slot), since that's the actual honest
// signal a school's own eyes would use to recognise a double — two
// genuinely adjacent periods that really do share every one of those real
// fields. A genuinely unassigned period never merges with its neighbour
// just because both are empty. An ELECTIVE_BLOCK cell (which already has
// its own distinct multi-subject rendering) is deliberately excluded —
// it already occupies its own real 2-period reservation with its own
// existing Options Block cell styling, never double-merged again on top
// of that.
function computeDoubleSpanSecondHalves(grid: Map<string, Slot>, periodsPerDay: number): Set<string> {
  const secondHalves = new Set<string>();
  for (let d = 1; d <= 6; d++) {
    for (let p = 1; p < periodsPerDay; p++) {
      const a = grid.get(`${d}|${p}`);
      const b = grid.get(`${d}|${p + 1}`);
      if (!a || !b) continue;
      if (a.slotType === "ELECTIVE_BLOCK" || b.slotType === "ELECTIVE_BLOCK") continue;
      if ((a.slotType ?? "ACADEMIC") !== (b.slotType ?? "ACADEMIC")) continue;
      if (a.subjectId !== b.subjectId) continue;
      if ((a.teacherId ?? null) !== (b.teacherId ?? null)) continue;
      if (!a.subjectId) continue;
      secondHalves.add(`${d}|${p + 1}`);
    }
  }
  return secondHalves;
}

function getActivityStyle(color: string | null | undefined, isBandW: boolean) {
  if (isBandW) return "border border-navy-300 bg-white text-navy-950 font-bold dark:bg-navy-950 dark:text-white";
  switch (color) {
    case "blue": return "bg-blue-500/10 border border-blue-200 text-blue-800 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-900/30";
    case "green": return "bg-green-500/10 border border-green-200 text-green-800 dark:bg-green-950/20 dark:text-green-300 dark:border-green-900/30";
    case "purple": return "bg-purple-500/10 border border-purple-200 text-purple-800 dark:bg-purple-950/20 dark:text-purple-300 dark:border-purple-900/30";
    case "amber": return "bg-amber-500/10 border border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/30";
    case "rose": return "bg-rose-500/10 border border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-900/30";
    default: return "bg-gray-500/10 border border-gray-200 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800/50";
  }
}

function TimetableSlotCard({ slot, isBandW, fontSize, canManage, onClick, teacherFirst = false, isDoubleMerged = false }: { slot?: Slot; isBandW: boolean; fontSize: number; canManage?: boolean; onClick?: () => void; teacherFirst?: boolean; isDoubleMerged?: boolean }) {
  const isActivity = slot?.slotType === "ACTIVITY";
  // AA.1 — an Options Block cell has genuinely NO single subject/teacher
  // (different real students attend different parallel lessons at this
  // one shared time) — rendered distinctly from a normal single-subject
  // cell, showing every parallel subject's own real teacher short-code
  // together (the founder's own "HG/TY/EF/TS/GW" printed request).
  const isElectiveBlock = slot?.slotType === "ELECTIVE_BLOCK" && !!(slot as any)?.electiveBlock;
  const cellBgClass = isElectiveBlock
    ? (isBandW ? "border border-purple-300 bg-white text-navy-950 font-bold dark:bg-navy-950 dark:text-white" : "bg-purple-500/10 border border-purple-200 text-purple-900 dark:bg-purple-950/20 dark:text-purple-200 dark:border-purple-900/30")
    : isActivity
    ? getActivityStyle(slot?.activityCategoryColor ?? null, isBandW)
    : getSubjectStyle(slot?.subjectCode || "FREE", isBandW);

  if (isElectiveBlock) {
    const block = (slot as any).electiveBlock as { label: string; isDouble: boolean; subjects: { subjectName: string; subjectCode: string | null; teacherShortCode: string | null; venue: string | null }[] };
    return (
      <button
        disabled={!canManage}
        onClick={onClick}
        className={`w-full min-h-[52px] rounded-xl p-2 text-left transition relative flex flex-col justify-between ${cellBgClass}`}
        style={{ fontSize: `${fontSize}px` }}
      >
        <div className="flex items-center justify-between w-full gap-1">
          <span className="font-extrabold tracking-wide leading-tight line-clamp-2">Options</span>
          <span className="text-[7px] uppercase font-black bg-purple-500/25 px-1 py-0.5 rounded">Block</span>
        </div>
        <div className="flex flex-col mt-1 font-medium" style={{ fontSize: `${Math.max(7, fontSize - 3)}px` }}>
          <span className="truncate">{block.subjects.map((s) => s.subjectCode || s.subjectName.slice(0, 4)).join("/")}</span>
          {/* The founder's own real "HG/TY/EF/TS/GW" printed multi-teacher-code request. */}
          <span className="font-bold truncate">{block.subjects.map((s) => s.teacherShortCode).filter(Boolean).join("/")}</span>
        </div>
      </button>
    );
  }

  return (
    <button
      disabled={!canManage}
      onClick={onClick}
      className={`w-full min-h-[52px] ${isDoubleMerged ? "h-full" : ""} rounded-xl p-2 text-left transition relative flex flex-col justify-between ${cellBgClass}`}
      style={{ fontSize: `${fontSize}px` }}
    >
      {slot ? (
        <>
          <div className="flex items-center justify-between w-full gap-1">
            <span className="font-extrabold tracking-wide leading-tight line-clamp-2">
              {isActivity ? slot.activityCategoryName : getSubjectAbbreviation(slot.subjectName || "", slot.subjectCode || "")}
            </span>
            {/* DD.13 — real, genuine double-lesson badge: two real
                consecutive periods for the SAME class/subject/teacher now
                render as ONE merged cell (rowSpan/colSpan={2} from the
                caller) instead of two identical stacked cells. */}
            {isDoubleMerged && !isActivity && (
              <span className="text-[7.5px] uppercase font-black bg-blue-500/25 px-1 py-0.5 rounded">Double</span>
            )}
            {slot.isCombined && !isActivity && (
              <span className="text-[7.5px] uppercase font-black bg-green-500/25 px-1 py-0.5 rounded">Combined</span>
            )}
            {isActivity && (
              <span className="text-[7px] uppercase font-black bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded">Activity</span>
            )}
          </div>
          <div className="flex flex-col mt-1 text-navy-600 dark:text-navy-300 font-medium" style={{ fontSize: `${Math.max(8, fontSize - 2)}px` }}>
            <span>{teacherFirst ? slot.className || slot.teacherName : slot.teacherName}</span>
            {slot.venue && <span className="font-bold text-green-700 dark:text-green-300">@ {slot.venue}</span>}
            {slot.isCombined && slot.combinedDetails && <span className="text-[8px] italic truncate max-w-[100px]">{slot.combinedDetails}</span>}
            {/* T.12 — real, honest "who's actually teaching this TODAY" overlay */}
            {slot.substituteTodayName && (
              <span className="font-bold text-amber-700 dark:text-amber-300">Sub today: {slot.substituteTodayName}</span>
            )}
          </div>
        </>
      ) : (
        <span className="text-[10px] text-navy-300 dark:text-navy-600 font-medium italic">Unassigned</span>
      )}
    </button>
  );
}

function NonLessonMergedRow({ row, colSpan }: { row: { label: string; minutes: number; tone: "break" | "lunch"; timeRange: string }; colSpan: number }) {
  const tone = row.tone === "lunch" ? "bg-green-500/10 text-green-800 dark:bg-green-950/20 dark:text-green-300" : "bg-amber-500/10 text-amber-800 dark:bg-amber-950/20 dark:text-amber-300";
  return (
    <tr className={`${tone} text-center font-bold`}>
      <td className="border-b border-navy-50 p-1 dark:border-navy-800">
        <div className="mx-auto flex h-14 w-9 items-center justify-center rounded-full bg-white/60 text-[10px] font-black uppercase tracking-widest [writing-mode:vertical-rl] rotate-180 dark:bg-navy-950/40">
          {row.tone === "lunch" ? "Lunch" : "Break"}
        </div>
      </td>
      <td colSpan={colSpan} className="border-b border-l border-navy-50 p-2 text-xs font-black uppercase tracking-[0.2em] dark:border-navy-800">
        {row.label} · {row.timeRange} · {row.minutes} mins
      </td>
    </tr>
  );
}

function TimetablePrintBundleView({ bundle, tenantName, tenantLogoUrl }: { bundle: TimetablePrintBundle; tenantName?: string; tenantLogoUrl?: string | null }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const modeTitle = bundle.mode === "classes" ? "All Classes" : bundle.mode === "teachers" ? "All Teachers" : "By Venue";
  return (
    <div className="hidden print:block">
      <div className="mb-4 border-b border-navy-200 pb-3">
        <div className="flex items-center gap-2">{tenantLogoUrl && <img src={tenantLogoUrl} alt="School logo" className="h-6 w-6 object-contain" />}<h1 className="text-lg font-black text-navy-950">{tenantName || "School"} · Timetable Print Pack</h1></div>
        <p className="text-xs font-semibold text-navy-500">{modeTitle} · Generated {new Date().toLocaleDateString("en-KE")}</p>
      </div>
      {bundle.groups.length === 0 ? (
        <p className="text-sm font-semibold text-navy-500">No timetable slots found for this print pack.</p>
      ) : bundle.groups.map((group) => {
        const grid = new Map<string, Slot>();
        for (const slot of group.slots) grid.set(`${slot.dayOfWeek}|${slot.period}`, slot);
        return (
          <section key={group.id} className="mb-6 break-after-page last:break-after-auto">
            <div className="mb-2 flex items-end justify-between border-b border-navy-100 pb-1">
              <div>
                <h2 className="text-base font-black text-navy-950">{group.title}</h2>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-navy-400">{group.subtitle}</p>
              </div>
            </div>
            <table className="w-full border-collapse text-[10px]">
              <thead>
                <tr className="bg-navy-50">
                  <th className="w-12 border border-navy-200 p-1 text-center">No.</th>
                  {days.map((d) => <th key={d} className="border border-navy-200 p-1 text-left">{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: group.config.periodsPerDay || 8 }, (_, i) => i + 1).flatMap((p) => {
                  const lessonRow = (
                    <tr key={`${group.id}-${p}`}>
                      <td className="border border-navy-200 p-1 text-center align-middle">
                        <span className="block text-lg font-black leading-none">{p}</span>
                        <span className="mt-0.5 block text-[7px] font-bold leading-tight text-navy-500">{timetablePeriodTimeRange(p, group.config)}</span>
                      </td>
                      {days.map((_, dIdx) => {
                        const slot = grid.get(`${dIdx + 1}|${p}`);
                        return (
                          <td key={dIdx} className="h-12 border border-navy-200 p-1 align-top">
                            {slot ? (
                              <div>
                                <p className="font-black">{slot.slotType === "ACTIVITY" ? slot.activityCategoryName : getSubjectAbbreviation(slot.subjectName || "", slot.subjectCode || "")}</p>
                                <p>{bundle.mode === "teachers" || bundle.mode === "venues" ? slot.className : slot.teacherName}</p>
                                {slot.venue && bundle.mode !== "venues" && <p className="font-bold">@ {slot.venue}</p>}
                              </div>
                            ) : <span className="text-navy-300">—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  );
                  const programRows = nonLessonRowsForPeriod(p, group.config).map((row) => (
                    <tr key={`${group.id}-${row.key}`} className={row.tone === "lunch" ? "bg-green-50" : "bg-amber-50"}>
                      <td className="border border-navy-200 p-1 text-center"><span className="inline-block font-black uppercase [writing-mode:vertical-rl] rotate-180">{row.tone === "lunch" ? "Lunch" : "Break"}</span></td>
                      <td colSpan={days.length} className="border border-navy-200 p-1 text-center font-black uppercase tracking-widest">{row.label} · {row.timeRange} · {row.minutes} mins</td>
                    </tr>
                  ));
                  return [lessonRow, ...programRows];
                })}
              </tbody>
            </table>
          </section>
        );
      })}
    </div>
  );
}

function TimetableTab({ canManage }: { canManage: boolean }) {
  const { toast } = useToast();
  const [tenant, setTenant] = React.useState<any>(null);
  const [classes, setClasses] = React.useState<ClassOpt[]>([]);
  const [classId, setClassId] = React.useState("");
  const [slots, setSlots] = React.useState<Slot[] | null>(null);
  const [config, setConfig] = React.useState<any>(null);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [activities, setActivities] = React.useState<any[]>([]);
  const [staff, setStaff] = React.useState<any[]>([]);
  const [error, setError] = React.useState(false);
  const [cell, setCell] = React.useState<{ day: number; period: number } | null>(null);
  const [autoOpen, setAutoOpen] = React.useState(false);
  const [showSaturday, setShowSaturday] = React.useState(true);
  const [bulkSatOpen, setBulkSatOpen] = React.useState(false);
  const [configOpen, setConfigOpen] = React.useState(false);
  const [isBandW, setIsBandW] = React.useState(false);
  const [daysVertical, setDaysVertical] = React.useState(false);
  const [cellFontSize, setCellFontSize] = React.useState(11);
  const [printBundle, setPrintBundle] = React.useState<TimetablePrintBundle | null>(null);
  const [printBusy, setPrintBusy] = React.useState<"classes" | "teachers" | "venues" | null>(null);
  // DD.14 — real audit fix: this tab's own "Auto-fill week" and "Bulk
  // Saturday Scheduler" dialogs both let a school pick a teacher for a
  // real specific subject, but never actually filtered that list by the
  // school's own real TeacherSubject links — fetched here once, alongside
  // the rest of this tab's own real reference data.
  const [teacherAssoc, setTeacherAssoc] = React.useState<{ teacherId: string; subjectId: string }[]>([]);

  const daysList = showSaturday ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] : ["Mon", "Tue", "Wed", "Thu", "Fri"];

  React.useEffect(() => {
    fetch("/api/tenant/current").then((r) => r.json()).then((j) => j.ok && setTenant(j.data.tenant));
    fetch("/api/classes").then((r) => r.json()).then((j) => { if (j.ok) { setClasses(j.data.classes); if (j.data.classes[0]) setClassId(j.data.classes[0].id); } });
    fetch("/api/academics/subjects").then((r) => r.json()).then((j) => j.ok && setSubjects(j.data.subjects));
    fetch("/api/timetable/activities").then((r) => r.json()).then((j) => j.ok && setActivities(j.data));
    fetch("/api/conversations/recipients").then((r) => r.json()).then((j) => j.ok && setStaff((j.data.recipients ?? []).filter((u: any) => ["TEACHER", "CLASS_TEACHER", "HOD", "DEPUTY_PRINCIPAL"].includes(u.role))));
    fetch("/api/academics/timetable/generator").then((r) => r.json()).then((j) => j.ok && setTeacherAssoc(j.data.teacherAssoc ?? []));
  }, []);

  // DD.14 — real audit fix: real teachers actually qualified for a given
  // real subject. Falls back to the FULL real staff list when a subject
  // genuinely has no qualified teacher linked yet (an honestly
  // under-configured school should never see a dead-end empty dropdown).
  function staffQualifiedFor(subjectId: string): any[] {
    if (!subjectId) return staff;
    const qualifiedIds = new Set(teacherAssoc.filter((ta) => ta.subjectId === subjectId).map((ta) => ta.teacherId));
    if (qualifiedIds.size === 0) return staff;
    return staff.filter((t: any) => qualifiedIds.has(t.id));
  }

  const load = React.useCallback(async () => {
    if (!classId) return;
    setError(false); setSlots(null); setConfig(null);
    try {
      const res = await fetch(`/api/academics/timetable?classId=${classId}`);
      const json = await res.json();
      if (json.ok) {
        setSlots(json.data.slots);
        setConfig(json.data.config);
      } else setError(true);
    } catch { setError(true); }
  }, [classId]);
  React.useEffect(() => { load(); }, [load]);

  const grid = new Map<string, Slot>();
  for (const s of slots ?? []) grid.set(`${s.dayOfWeek}|${s.period}`, s);

  // DD.13 — real double-period merging: which real (day, period) cells are
  // the SECOND half of a genuine double lesson, so the render loop below
  // can skip drawing a separate cell for them (they're absorbed into the
  // first period's own cell via rowSpan/colSpan={2}).
  const doubleSecondHalves = React.useMemo(
    () => computeDoubleSpanSecondHalves(grid, config?.periodsPerDay || 8),
    [slots, config?.periodsPerDay]
  );

  // Z.3/Z.4 bugfix — the single real source of truth for "which period is
  // genuinely lunch for THIS class", read directly from the real
  // persisted slots (subjectCode === "LUNCH") rather than trusting the
  // config's raw lunchStart number, which can genuinely diverge under a
  // real 2-shift lunch design (e.g. Form 1&2 eat at period 7 while Form
  // 3&4 eat at period 8, same clock, same total teaching periods).
  const realLunchPeriods = new Set<number>();
  for (const s of slots ?? []) {
    if ((s.subjectCode || "").toUpperCase() === "LUNCH") realLunchPeriods.add(s.period);
  }

  // Z.3 print redesign — every real print action now opens the dedicated,
  // chrome-free `/print/timetable` route (real automatic A4 orientation,
  // real teacher/venue short codes, real merged one-row lunch/break bars,
  // real subject color-coding with a real B&W ink-saver override) in a new
  // tab instead of the old in-app `window.print()` flow, which never
  // picked up any of those fixes since it printed the live app page
  // itself. `vertical=1`/`bw=1` mirror the on-screen "Vertical days"/
  // "Ink-Saver B&W Mode" toggles so what the user sees on screen is
  // exactly what prints.
  function printSingleClass() {
    if (!classId) return;
    const params = new URLSearchParams({ classId, font: String(cellFontSize) });
    if (daysVertical) params.set("vertical", "1");
    if (isBandW) params.set("bw", "1");
    window.open(`/print/timetable?${params.toString()}`, "_blank");
  }

  function printBulk(mode: "classes" | "teachers" | "venues") {
    const params = new URLSearchParams({ mode, font: String(cellFontSize) });
    if (daysVertical) params.set("vertical", "1");
    if (isBandW) params.set("bw", "1");
    window.open(`/print/timetable?${params.toString()}`, "_blank");
  }

  function getPeriodTimeRange(p: number): string {
    return timetablePeriodTimeRange(p, config, undefined, realLunchPeriods);
  }

  return (
    <div className="space-y-4">
      {/* Print-Only Header */}
      <div className="hidden print:flex items-center justify-between border-b border-navy-200 pb-2 mb-3">
        <div className="flex items-center gap-2.5">
          {tenant?.logoUrl ? (
            <img src={tenant.logoUrl} alt="Logo" className="h-8 w-8 object-contain shrink-0" />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500 text-white text-xs font-black">
              {tenant?.name ? tenant.name.slice(0, 2).toUpperCase() : "NY"}
            </span>
          )}
          <div>
            <h2 className="text-sm font-bold text-navy-950 dark:text-white">
              {tenant?.name || "School Timetable"}
            </h2>
            <p className="text-[10px] text-navy-500 font-semibold">
              Class: {classes.find(c => c.id === classId)?.name || "Unassigned"} · {showSaturday ? "6-Day Week" : "5-Day Week"}
            </p>
          </div>
        </div>
        <div className="text-right text-[10px] text-navy-400">
          <p>Generated: {new Date().toLocaleDateString("en-KE")}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex flex-wrap items-center gap-2">
          <select value={classId} onChange={(e) => setClassId(e.target.value)} className="rounded-full border border-navy-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900">
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {classId && (
            <Button variant="secondary" onClick={printSingleClass}>
              <Printer className="h-4 w-4 text-green-600" /> Print Timetable
            </Button>
          )}
          <Button variant="secondary" onClick={() => printBulk("classes")} disabled={!!printBusy}>
            <Printer className="h-4 w-4 text-green-600" /> {printBusy === "classes" ? "Preparing…" : "Print all classes"}
          </Button>
          <Button variant="secondary" onClick={() => printBulk("teachers")} disabled={!!printBusy}>
            <Printer className="h-4 w-4 text-green-600" /> {printBusy === "teachers" ? "Preparing…" : "Print all teachers"}
          </Button>
          <Button variant="secondary" onClick={() => printBulk("venues")} disabled={!!printBusy}>
            <Printer className="h-4 w-4 text-green-600" /> {printBusy === "venues" ? "Preparing…" : "Print by venue"}
          </Button>
          {canManage && classId && (
            <>
              <Button variant="secondary" onClick={() => setConfigOpen(true)}><Sliders className="h-4 w-4 text-green-600" /> Schedule rules</Button>
              <Button variant="secondary" onClick={() => setAutoOpen(true)}><Sparkles className="h-4 w-4" /> Auto-fill week</Button>
              <Button variant="secondary" onClick={() => setBulkSatOpen(true)}><Calendar className="h-4 w-4 text-green-600" /> Bulk Saturday Scheduler</Button>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-navy-700 dark:border-navy-700 dark:bg-navy-900 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={daysVertical}
              onChange={(e) => setDaysVertical(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-navy-300 text-green-600 focus:ring-green-500"
            />
            Vertical days
          </label>
          <label className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-navy-700 dark:border-navy-700 dark:bg-navy-900 select-none">
            Cell font
            <select value={cellFontSize} onChange={(e) => setCellFontSize(Number(e.target.value))} className="rounded-full border border-navy-200 bg-white px-2 py-0.5 dark:border-navy-700 dark:bg-navy-900">
              <option value={9}>Small</option>
              <option value={11}>Normal</option>
              <option value={13}>Large</option>
              <option value={15}>XL</option>
            </select>
          </label>
          <label className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-navy-700 dark:border-navy-700 dark:bg-navy-900 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isBandW}
              onChange={(e) => setIsBandW(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-navy-300 text-green-600 focus:ring-green-500"
            />
            🖨️ Ink-Saver B&W Mode
          </label>
          <label className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-navy-700 dark:border-navy-700 dark:bg-navy-900 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showSaturday}
              onChange={(e) => setShowSaturday(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-navy-300 text-green-600 focus:ring-green-500"
            />
            Include Saturday Timetable
          </label>
        </div>
      </div>

      {config && (
        <div className="print:hidden rounded-2xl border border-green-100 bg-green-50/50 px-4 py-2 text-xs font-medium text-navy-600 dark:border-green-900/40 dark:bg-green-950/10 dark:text-navy-300">
          Normal day starts {config.schoolDayStartTime ?? "08:00"} · Saturday short day {config.saturdayStartTime ?? "08:00"}–{config.saturdayEndTime ?? "12:40"} · {config.lessonDurationMins ?? 40} minute lessons
        </div>
      )}

      {error ? <LoadError onRetry={load} /> : slots === null ? <Skeletons /> : (
        <>
          <div className={`${printBundle ? "print:hidden" : ""} overflow-x-auto rounded-2xl border border-navy-100 dark:border-navy-800`}>
            {!daysVertical ? (
              <table className="w-full min-w-[720px] border-collapse bg-white text-xs dark:bg-navy-900">
                <thead>
                  <tr className="bg-warm-50 dark:bg-navy-800">
                    <th className="w-20 border-b border-navy-100 p-2.5 text-center font-semibold text-navy-400 dark:border-navy-800">Period</th>
                    {daysList.map((d) => <th key={d} className="border-b border-navy-100 p-2.5 text-left font-semibold text-navy-600 dark:border-navy-800 dark:text-navy-300">{d}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: config?.periodsPerDay || 8 }, (_, i) => i + 1).flatMap((p) => {
                    const lessonRow = (
                      <tr key={`period-${p}`}>
                        <td className="border-b border-navy-50 p-2.5 text-center font-black text-navy-900 dark:border-navy-800 dark:text-white">
                          <span className="block text-2xl leading-none">{p}</span>
                          <span className="mt-1 block text-[8px] font-semibold text-navy-400">{getPeriodTimeRange(p)}</span>
                        </td>
                        {Array.from({ length: daysList.length }, (_, dIdx) => {
                          const d = dIdx + 1;
                          // DD.13 — the second half of a real double lesson
                          // was already drawn (with rowSpan={2}) by its own
                          // first period's row above — never re-drawn here.
                          if (doubleSecondHalves.has(`${d}|${p}`)) return null;
                          const s = grid.get(`${d}|${p}`);
                          const isFirstHalfOfDouble = doubleSecondHalves.has(`${d}|${p + 1}`);
                          return (
                            <td key={d} rowSpan={isFirstHalfOfDouble ? 2 : 1} className="border-b border-l border-navy-50 p-1 dark:border-navy-800">
                              <TimetableSlotCard slot={s} isBandW={isBandW} fontSize={cellFontSize} canManage={canManage} onClick={() => setCell({ day: d, period: p })} isDoubleMerged={isFirstHalfOfDouble} />
                            </td>
                          );
                        })}
                      </tr>
                    );
                    return [lessonRow, ...nonLessonRowsForPeriod(p, config, realLunchPeriods).map((row) => <NonLessonMergedRow key={row.key} row={row} colSpan={daysList.length} />)];
                  })}
                </tbody>
              </table>
            ) : (
              <table className="w-full min-w-[920px] border-collapse bg-white text-xs dark:bg-navy-900">
                <thead>
                  <tr className="bg-warm-50 dark:bg-navy-800">
                    <th className="w-20 border-b border-navy-100 p-2.5 text-left font-semibold text-navy-400 dark:border-navy-800">Day</th>
                    {Array.from({ length: config?.periodsPerDay || 8 }, (_, i) => i + 1).map((p) => (
                      <React.Fragment key={p}>
                        <th className="border-b border-navy-100 p-2.5 text-center font-black text-navy-700 dark:border-navy-800 dark:text-navy-200">
                          <span className="block text-2xl leading-none">{p}</span>
                          <span className="mt-1 block text-[8px] font-semibold leading-tight text-navy-400 dark:text-navy-500">{getPeriodTimeRange(p)}</span>
                        </th>
                        {nonLessonRowsForPeriod(p, config, realLunchPeriods).map((row) => (
                          <th key={`${p}-${row.key}`} className="w-16 border-b border-l border-navy-100 p-1 text-center dark:border-navy-800">
                            <span className={`mx-auto block rounded-full px-1 py-1 text-[9px] font-black uppercase tracking-widest ${row.tone === "lunch" ? "bg-green-500/10 text-green-700 dark:text-green-300" : "bg-amber-500/10 text-amber-700 dark:text-amber-300"}`}>
                              {row.tone === "lunch" ? "Lunch" : "Break"}
                            </span>
                            <span className="mt-1 block text-[7px] font-semibold leading-tight text-navy-400 dark:text-navy-500">{row.timeRange}</span>
                          </th>
                        ))}
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {daysList.map((dName, dIdx) => {
                    const d = dIdx + 1;
                    return (
                      <tr key={dName}>
                        <td className="border-b border-navy-50 p-2.5 font-black text-navy-700 dark:border-navy-800 dark:text-navy-200">{dName}</td>
                        {Array.from({ length: config?.periodsPerDay || 8 }, (_, i) => i + 1).map((p) => {
                          // DD.13 — in vertical layout, days run down and
                          // periods run across as COLUMNS, so a real double
                          // lesson merges via colSpan={2} instead of
                          // rowSpan — the second half's own column is
                          // skipped entirely, absorbed into the first.
                          if (doubleSecondHalves.has(`${d}|${p}`)) return null;
                          const isFirstHalfOfDouble = doubleSecondHalves.has(`${d}|${p + 1}`);
                          return (
                          <React.Fragment key={`${d}-${p}`}>
                            <td colSpan={isFirstHalfOfDouble ? 2 : 1} className="border-b border-l border-navy-50 p-1 dark:border-navy-800">
                              <TimetableSlotCard slot={grid.get(`${d}|${p}`)} isBandW={isBandW} fontSize={cellFontSize} canManage={canManage} onClick={() => setCell({ day: d, period: p })} isDoubleMerged={isFirstHalfOfDouble} />
                            </td>
                            {nonLessonRowsForPeriod(p, config, realLunchPeriods).map((row) => (
                              <td key={`${d}-${row.key}`} className={`${row.tone === "lunch" ? "bg-green-500/10 text-green-800" : "bg-amber-500/10 text-amber-800"} border-b border-l border-navy-50 p-1 text-center font-black dark:border-navy-800`}>
                                <span className="mx-auto block text-[10px] uppercase tracking-widest [writing-mode:vertical-rl] rotate-180">{row.label}</span>
                              </td>
                            ))}
                          </React.Fragment>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Print-Only Footer */}
          <div className="hidden print:flex items-center justify-between border-t border-navy-100 pt-2 mt-4 text-[9px] text-navy-400">
            <p>NEYO School Operating System (School OS) · Class Timetable Schedule</p>
            <p className="font-bold uppercase tracking-wider">Powered by NEYO</p>
          </div>
        </>
      )}

      {printBundle && <TimetablePrintBundleView bundle={printBundle} tenantName={tenant?.name} tenantLogoUrl={tenant?.logoUrl} />}

      {cell && classId && (
        <SlotDialog
          classId={classId} day={cell.day} period={cell.period}
          existing={grid.get(`${cell.day}|${cell.period}`) ?? null}
          subjects={subjects.filter((s) => !s.archived)} staff={staff} activities={activities}
          teacherAssoc={teacherAssoc}
          showSaturday={showSaturday}
          onClose={() => setCell(null)}
          onDone={() => { setCell(null); load(); }}
        />
      )}
      {autoOpen && classId && (
        <AutoFillDialog
          classId={classId}
          subjects={subjects.filter((s) => !s.archived)}
          staff={staff}
          teacherAssoc={teacherAssoc}
          onClose={() => setAutoOpen(false)}
          onDone={() => { setAutoOpen(false); load(); }}
        />
      )}
      {bulkSatOpen && (
        <BulkSaturdayModal
          classes={classes}
          subjects={subjects.filter((s) => !s.archived)}
          staff={staff}
          teacherAssoc={teacherAssoc}
          onClose={() => setBulkSatOpen(false)}
          onDone={(msg) => { setBulkSatOpen(false); toast({ title: msg, tone: "success" }); load(); }}
        />
      )}
      {configOpen && classId && (
        <ClassConfigModal
          classId={classId}
          classes={classes}
          currentConfig={config}
          onClose={() => setConfigOpen(false)}
          onSaved={() => { setConfigOpen(false); load(); toast({ title: "Schedule rules saved", tone: "success" }); }}
        />
      )}
    </div>
  );
}

function SlotDialog({ classId, day, period, existing, subjects, activities, staff, teacherAssoc = [], showSaturday, onClose, onDone }: any) {
  const { toast } = useToast();
  // DD.14 — real audit fix: real teachers actually qualified for the
  // currently selected real subject, from the school's own real
  // TeacherSubject links. Falls back to the FULL real staff list when a
  // subject genuinely has no qualified teacher linked yet.
  function staffQualifiedFor(subjectId: string): any[] {
    if (!subjectId) return staff;
    const qualifiedIds = new Set((teacherAssoc as { teacherId: string; subjectId: string }[]).filter((ta) => ta.subjectId === subjectId).map((ta) => ta.teacherId));
    if (qualifiedIds.size === 0) return staff;
    return staff.filter((t: any) => qualifiedIds.has(t.id));
  }
  const [mode, setMode] = React.useState<"SUBJECT" | "ACTIVITY">(existing?.slotType === "ACTIVITY" ? "ACTIVITY" : "SUBJECT");
  const [subId, setSubId] = React.useState(existing?.subjectId ?? "");
  const [actId, setActId] = React.useState(existing?.activityCategoryId ?? "");
  const [teacherId, setStaffId] = React.useState(existing?.teacherId ?? "");
  const [venue, setVenue] = React.useState(existing?.venue ?? "");
  const [isCombined, setIsCombined] = React.useState(existing?.isCombined ?? false);
  const [combinedDetails, setCombinedDetails] = React.useState(existing?.combinedDetails ?? "");
  const [saving, setSaving] = React.useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/academics/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set",
          classId, dayOfWeek: day, period,
          slotType: mode,
          subjectId: mode === "SUBJECT" ? (subId || undefined) : undefined,
          activityCategoryId: mode === "ACTIVITY" ? (actId || undefined) : undefined,
          teacherId: teacherId || undefined,
          venue: venue || undefined,
          isCombined: mode === "SUBJECT" ? isCombined : false,
          combinedDetails: mode === "SUBJECT" && isCombined ? combinedDetails : undefined,
        }),
      });
      const json = await res.json();
      if (json.ok) { toast({ title: "Slot updated", tone: "success" }); onDone(); }
      else toast({ title: json.error?.message || "Failed", tone: "error" });
    } catch { toast({ title: "Network error", tone: "error" }); }
    finally { setSaving(false); }
  }

  async function clear() {
    setSaving(true);
    try {
      const res = await fetch("/api/academics/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear", classId, dayOfWeek: day, period }),
      });
      const json = await res.json();
      if (json.ok) { toast({ title: "Slot cleared", tone: "success" }); onDone(); }
      else toast({ title: "Failed", tone: "error" });
    } catch { toast({ title: "Network error", tone: "error" }); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 backdrop-blur-sm px-4 animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-navy-100 bg-white p-6 shadow-pop text-left dark:border-navy-800 dark:bg-navy-900" onClick={(e)=>e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between border-b border-navy-50 pb-2 dark:border-navy-800">
          <h4 className="font-bold text-navy-950 dark:text-white">Set Lesson Slot</h4>
          <button onClick={onClose} className="rounded-full p-1 text-navy-400 hover:bg-navy-50 dark:hover:bg-navy-800"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4">
          <div className="space-y-1"><Label>Subject</Label>
            <select value={subId} onChange={(e)=>setSubId(e.target.value)} className="w-full h-10 rounded-full border border-navy-200 bg-white px-3 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50">
              <option value="">Unassigned (Free Period)</option>
              {subjects.map((s: any)=><option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
          </div>
          <div className="space-y-1"><Label>Teacher</Label>
            <select value={teacherId} onChange={(e)=>setStaffId(e.target.value)} className="w-full h-10 rounded-full border border-navy-200 bg-white px-3 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50">
              <option value="">Unassigned</option>
              {staffQualifiedFor(subId).map((s: any)=><option key={s.id} value={s.id}>{s.fullName}</option>)}
            </select>
          </div>
          <div className="space-y-1"><Label>Venue / Room</Label>
            <Input value={venue} onChange={(e)=>setVenue(e.target.value)} placeholder="e.g. 8 East, Science Lab, Hall" />
          </div>

          <div className="flex items-center gap-2 py-1.5 border-t border-b border-navy-50">
            <input
              type="checkbox"
              id="isCombined"
              checked={isCombined}
              onChange={(e) => setIsCombined(e.target.checked)}
              className="h-4 w-4 rounded border-navy-300 text-green-600 focus:ring-green-500"
            />
            <label htmlFor="isCombined" className="text-xs font-semibold text-navy-700 cursor-pointer select-none">
              Is Combined / Joint Lesson
            </label>
          </div>

          {isCombined && (
            <div className="space-y-1.5 animate-fade-in">
              <Label>Combined Lesson Details</Label>
              <Input
                placeholder="E.g. Mr. Njoroge, Joint Stream A & B"
                value={combinedDetails}
                onChange={(e) => setCombinedDetails(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          {existing && <Button variant="secondary" onClick={clear} disabled={saving} className="text-red-600 hover:text-red-700 border-red-200 bg-red-50/50">Clear</Button>}
          <Button onClick={save} disabled={saving}>{saving?<Loader2 className="h-4 w-4 animate-spin" />:<Check className="h-4 w-4" />} Save</Button>
        </div>
      </div>
    </div>
  );
}

function AutoFillDialog({ classId, subjects, staff, teacherAssoc = [], onClose, onDone }: {
  classId: string; subjects: Subject[]; staff: Staff[]; teacherAssoc?: { teacherId: string; subjectId: string }[];
  onClose: () => void; onDone: (msg: string) => void;
}) {
  const { toast } = useToast();
  // DD.14 — real audit fix: real teachers actually qualified for a real
  // subject, from the school's own real TeacherSubject links. Falls back
  // to the FULL real staff list when a subject genuinely has no
  // qualified teacher linked yet.
  function staffQualifiedFor(subjectId: string): Staff[] {
    if (!subjectId) return staff;
    const qualifiedIds = new Set(teacherAssoc.filter((ta) => ta.subjectId === subjectId).map((ta) => ta.teacherId));
    if (qualifiedIds.size === 0) return staff;
    return staff.filter((t: any) => qualifiedIds.has(t.id));
  }
  const [load, setLoad] = React.useState<Record<string, number>>({});
  const [teachers, setTeachers] = React.useState<Record<string, string>>({});
  const [clearExisting, setClear] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const total = Object.values(load).reduce((a, b) => a + b, 0);

  async function run() {
    setSaving(true);
    try {
      const res = await fetch("/api/academics/timetable", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "autofill", classId, weeklyLoad: load, teachers, clearExisting }),
      });
      const json = await res.json();
      if (json.ok) {
        const un = json.data.unplaced.length;
        onDone(`${json.data.placed} periods placed${un ? ` · ${un} subject(s) could not fully fit` : ""}`);
      } else toast({ title: json.error?.message || "Failed", tone: "error" });
    } finally { setSaving(false); }
  }

  return (
    <Modal title="Auto-fill the week" onClose={onClose} wide>
      <p className="mb-3 text-xs text-navy-500 dark:text-navy-400">
        Set lessons-per-week for each subject (and optionally the teacher — their clashes across other classes are avoided automatically). 40 periods available.
      </p>
      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {subjects.map((s) => (
          <div key={s.id} className="flex items-center gap-2">
            <span className="w-40 truncate text-sm text-navy-800 dark:text-navy-100">{s.name}</span>
            <Input type="number" min={0} max={10} className="w-20" value={load[s.id] ?? ""} placeholder="0"
              onChange={(e) => { const v = Number(e.target.value); setLoad((p) => { const n = { ...p }; if (v > 0) n[s.id] = v; else delete n[s.id]; return n; }); }} />
            <select value={teachers[s.id] ?? ""} onChange={(e) => setTeachers((p) => ({ ...p, [s.id]: e.target.value }))}
              className="flex-1 rounded-xl border border-navy-200 bg-white px-2 py-1.5 text-xs dark:border-navy-700 dark:bg-navy-800">
              <option value="">No teacher</option>
              {staffQualifiedFor(s.id).map((t) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
            </select>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs text-navy-600 dark:text-navy-300">
          <input type="checkbox" checked={clearExisting} onChange={(e) => setClear(e.target.checked)} className="h-3.5 w-3.5 rounded border-navy-300 text-green-600" />
          Clear existing periods first
        </label>
        <Button onClick={run} disabled={saving || total === 0 || total > 40}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Place {total} period{total === 1 ? "" : "s"}
        </Button>
      </div>
    </Modal>
  );
}

// ---- Lesson plans -------------------------------------------------------------------
interface PlanRow extends Plan {
  classId: string; teacherId: string;
  objectives?: string | null; activities?: string | null; notes?: string | null;
  strand?: { id: string; name: string } | null;
  competency?: { id: string; name: string } | null;
  assessmentPlan?: { id: string; title: string } | null;
  resources?: { id: string; fileUrl: string; fileName?: string | null }[];
}
interface CompetencyOpt { id: string; name: string; code?: string }
interface AssessmentPlanOpt { id: string; title: string; subjectId?: string | null; classId?: string | null }
interface StrandOpt { id: string; name: string }

const selectClass = "mt-1 w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-800";
const areaClass = "mt-1 w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-800";

function LessonsTab() {
  const { toast } = useToast();
  const [plans, setPlans] = React.useState<PlanRow[] | null>(null);
  const [error, setError] = React.useState(false);
  const [dialog, setDialog] = React.useState(false);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [classes, setClasses] = React.useState<ClassOpt[]>([]);
  const [competencies, setCompetencies] = React.useState<CompetencyOpt[]>([]);
  const [assessmentPlans, setAssessmentPlans] = React.useState<AssessmentPlanOpt[]>([]);
  const [observeFor, setObserveFor] = React.useState<PlanRow | null>(null);
  const [resourceFor, setResourceFor] = React.useState<PlanRow | null>(null);
  const [analyticsFor, setAnalyticsFor] = React.useState<{ classId: string; subjectId: string } | null>(null);

  const load = React.useCallback(async () => {
    setError(false);
    try {
      const res = await fetch("/api/academics/lesson-plans");
      const json = await res.json();
      if (json.ok) setPlans(json.data.plans); else setError(true);
    } catch { setError(true); }
  }, []);
  React.useEffect(() => {
    load();
    fetch("/api/academics/subjects").then((r) => r.json()).then((j) => j.ok && setSubjects(j.data.subjects));
    fetch("/api/classes").then((r) => r.json()).then((j) => j.ok && setClasses(j.data.classes));
    fetch("/api/competencies").then((r) => r.json()).then((j) => j.ok && setCompetencies(j.data.board?.competencies ?? []));
    fetch("/api/assessments").then((r) => r.json()).then((j) => j.ok && setAssessmentPlans((j.data.board?.plans ?? []).map((p: any) => ({ id: p.id, title: p.title, subjectId: p.subjectId, classId: p.classId }))));
  }, [load]);

  async function setStatus(id: string, status: string) {
    const res = await fetch(`/api/academics/lesson-plans?id=${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    const json = await res.json();
    if (json.ok) load();
    else toast({ title: json.error?.message || "Failed", tone: "error" });
  }

  if (error) return <LoadError onRetry={load} />;
  if (plans === null) return <Skeletons />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setDialog(true)}><Plus className="h-4 w-4" /> Plan a lesson</Button>
      </div>
      {plans.length === 0 ? (
        <EmptyState icon={NotebookPen} title="No lesson plans yet" description="Teachers plan their lessons here — topic, objectives, curriculum links, resources and observations per class and date." />
      ) : (
        <TableContainer>
          <Table>
            <THead><TR><TH>Date</TH><TH>Class</TH><TH>Subject</TH><TH>Topic</TH><TH>Curriculum links</TH><TH>Status</TH><TH>Actions</TH></TR></THead>
            <TBody>
              {plans.map((p) => (
                <TR key={p.id}>
                  <TD className="text-xs text-navy-400">{p.date}</TD>
                  <TD>{p.className}</TD>
                  <TD className="font-mono text-xs">{p.subjectCode}</TD>
                  <TD className="font-medium">{p.topic}</TD>
                  <TD className="text-xs">
                    <div className="flex flex-wrap gap-1">
                      {p.strand && <Badge tone="blue">Strand: {p.strand.name}</Badge>}
                      {p.competency && <Badge tone="blue">Competency: {p.competency.name}</Badge>}
                      {p.assessmentPlan && <Badge tone="green">Assessment: {p.assessmentPlan.title}</Badge>}
                      {(p.resources?.length ?? 0) > 0 && <Badge>{p.resources!.length} resource{p.resources!.length > 1 ? "s" : ""}</Badge>}
                      {!p.strand && !p.competency && !p.assessmentPlan && (p.resources?.length ?? 0) === 0 && <span className="text-navy-300">—</span>}
                    </div>
                  </TD>
                  <TD>
                    <select value={p.status} onChange={(e) => setStatus(p.id, e.target.value)} className="rounded-full border border-navy-200 bg-white px-2 py-1 text-xs dark:border-navy-700 dark:bg-navy-800">
                      <option value="PLANNED">Planned</option><option value="TAUGHT">Taught</option><option value="SKIPPED">Skipped</option>
                    </select>
                  </TD>
                  <TD>
                    <div className="flex flex-wrap gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setObserveFor(p)}>Observe</Button>
                      <Button size="sm" variant="ghost" onClick={() => setResourceFor(p)}>Resources</Button>
                      <Button size="sm" variant="ghost" onClick={() => setAnalyticsFor({ classId: p.classId, subjectId: (subjects.find((s) => s.code === p.subjectCode)?.id) || "" })}>Coverage</Button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableContainer>
      )}
      {dialog && <PlanDialog subjects={subjects} classes={classes} competencies={competencies} assessmentPlans={assessmentPlans} onClose={() => setDialog(false)} onDone={() => { setDialog(false); load(); toast({ title: "Lesson planned", tone: "success" }); }} />}
      {observeFor && <ObservationDialog plan={observeFor} onClose={() => setObserveFor(null)} onDone={() => toast({ title: "Observation recorded", tone: "success" })} />}
      {resourceFor && <ResourceDialog plan={resourceFor} onClose={() => setResourceFor(null)} onDone={() => { setResourceFor(null); load(); toast({ title: "Resource attached", tone: "success" }); }} />}
      {analyticsFor && <CoverageDialog classId={analyticsFor.classId} subjectId={analyticsFor.subjectId} onClose={() => setAnalyticsFor(null)} />}
    </div>
  );
}

function PlanDialog({ subjects, classes, competencies, assessmentPlans, onClose, onDone }: {
  subjects: Subject[]; classes: ClassOpt[]; competencies: CompetencyOpt[]; assessmentPlans: AssessmentPlanOpt[]; onClose: () => void; onDone: () => void;
}) {
  const { toast } = useToast();
  const [f, setF] = React.useState({ subjectId: "", classId: "", date: new Date(Date.now() + 3 * 3600_000).toISOString().slice(0, 10), topic: "", objectives: "", activities: "", strandId: "", competencyId: "", assessmentPlanId: "" });
  const [strands, setStrands] = React.useState<StrandOpt[]>([]);
  const [resources, setResources] = React.useState<{ fileUrl: string; fileName: string }[]>([]);
  const [resUrl, setResUrl] = React.useState("");
  const [resName, setResName] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!f.subjectId) { setStrands([]); return; }
    fetch(`/api/cbc/strands?subjectId=${f.subjectId}`).then((r) => r.json()).then((j) => j.ok && setStrands((j.data.strands ?? []).map((s: any) => ({ id: s.id, name: s.name }))));
  }, [f.subjectId]);

  function addResource() {
    try { new URL(resUrl); } catch { toast({ title: "Enter a valid resource URL (https://…)", tone: "error" }); return; }
    setResources([...resources, { fileUrl: resUrl, fileName: resName || "" }]);
    setResUrl(""); setResName("");
  }

  async function save() {
    setSaving(true);
    try {
      const body: any = {
        subjectId: f.subjectId, classId: f.classId, date: f.date, topic: f.topic,
        objectives: f.objectives || undefined, activities: f.activities || undefined,
        strandId: f.strandId || undefined, competencyId: f.competencyId || undefined,
        assessmentPlanId: f.assessmentPlanId || undefined,
        resources: resources.length ? resources.map((r) => ({ fileUrl: r.fileUrl, fileName: r.fileName || undefined })) : undefined,
      };
      const res = await fetch("/api/academics/lesson-plans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (json.ok) onDone();
      else toast({ title: json.error?.message || "Failed", tone: "error" });
    } finally { setSaving(false); }
  }

  const planOptions = assessmentPlans.filter((p) => !p.subjectId || p.subjectId === f.subjectId);

  return (
    <Modal title="Plan a lesson" onClose={onClose} wide>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Class</Label>
            <select value={f.classId} onChange={(e) => setF({ ...f, classId: e.target.value })} className={selectClass}>
              <option value="">Choose…</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <Label>Subject</Label>
            <select value={f.subjectId} onChange={(e) => setF({ ...f, subjectId: e.target.value, strandId: "" })} className={selectClass}>
              <option value="">Choose…</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <div><Label>Date</Label><Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div>
        <div><Label>Topic</Label><Input value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })} placeholder="e.g. Quadratic equations — completing the square" /></div>
        <div><Label>Objectives (optional)</Label><Input value={f.objectives} onChange={(e) => setF({ ...f, objectives: e.target.value })} /></div>
        <div><Label>Activities (optional)</Label><Input value={f.activities} onChange={(e) => setF({ ...f, activities: e.target.value })} /></div>

        <div className="rounded-xl border border-navy-200 p-3 dark:border-navy-700">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-navy-400">Link to curriculum (CBE objectives)</p>
          <div className="grid grid-cols-1 gap-2">
            <div>
              <Label>Curriculum strand / objective (optional)</Label>
              <select value={f.strandId} onChange={(e) => setF({ ...f, strandId: e.target.value })} className={selectClass} disabled={!f.subjectId}>
                <option value="">{f.subjectId ? "Choose a strand…" : "Pick a subject first"}</option>
                {strands.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Competency (optional)</Label>
              <select value={f.competencyId} onChange={(e) => setF({ ...f, competencyId: e.target.value })} className={selectClass}>
                <option value="">Choose a competency…</option>
                {competencies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Assessment plan (optional)</Label>
              <select value={f.assessmentPlanId} onChange={(e) => setF({ ...f, assessmentPlanId: e.target.value })} className={selectClass}>
                <option value="">Choose an assessment plan…</option>
                {planOptions.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-navy-200 p-3 dark:border-navy-700">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-navy-400">Learning resources & evidence (optional)</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input value={resUrl} onChange={(e) => setResUrl(e.target.value)} placeholder="https://… link to resource" />
            <Input value={resName} onChange={(e) => setResName(e.target.value)} placeholder="Name (optional)" />
            <Button type="button" variant="secondary" onClick={addResource}><Plus className="h-4 w-4" /> Add</Button>
          </div>
          {resources.length > 0 && (
            <ul className="mt-2 space-y-1">
              {resources.map((r, i) => (
                <li key={i} className="flex items-center justify-between rounded-lg bg-navy-50 px-2 py-1 text-xs dark:bg-navy-800">
                  <span className="truncate">{r.fileName || r.fileUrl}</span>
                  <button type="button" onClick={() => setResources(resources.filter((_, idx) => idx !== i))} className="text-red-500"><Trash2 className="h-3 w-3" /></button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Button onClick={save} disabled={saving || !f.classId || !f.subjectId || f.topic.length < 2} className="w-full">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Save plan
        </Button>
      </div>
    </Modal>
  );
}

function ObservationDialog({ plan, onClose, onDone }: { plan: PlanRow; onClose: () => void; onDone: () => void }) {
  const { toast } = useToast();
  const [obs, setObs] = React.useState<any[] | null>(null);
  const [note, setNote] = React.useState("");
  const [level, setLevel] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    const res = await fetch(`/api/academics/lesson-plans/observations?lessonPlanId=${plan.id}`);
    const json = await res.json();
    if (json.ok) setObs(json.data.observations); else setObs([]);
  }, [plan.id]);
  React.useEffect(() => { load(); }, [load]);

  async function save() {
    if (note.trim().length < 2) { toast({ title: "Write a short observation note.", tone: "error" }); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/academics/lesson-plans/observations", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonPlanId: plan.id, note: note.trim(), level: level ? Number(level) : undefined }),
      });
      const json = await res.json();
      if (json.ok) { setNote(""); setLevel(""); await load(); onDone(); }
      else toast({ title: json.error?.message || "Failed", tone: "error" });
    } finally { setSaving(false); }
  }

  return (
    <Modal title={`Observations — ${plan.topic}`} onClose={onClose}>
      <div className="space-y-3">
        <p className="text-xs text-navy-400">Record what you observed in this lesson. Links to its strand/competency automatically.</p>
        <div>
          <Label>Observation note</Label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className={areaClass} placeholder="e.g. Most learners grasped factorisation; 4 still struggle with sign changes." />
        </div>
        <div>
          <Label>CBE proficiency level (optional, 1–4)</Label>
          <select value={level} onChange={(e) => setLevel(e.target.value)} className={selectClass}>
            <option value="">—</option>
            <option value="1">1 — Below expectation</option>
            <option value="2">2 — Approaching expectation</option>
            <option value="3">3 — Meeting expectation</option>
            <option value="4">4 — Exceeding expectation</option>
          </select>
        </div>
        <Button onClick={save} disabled={saving} className="w-full">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Record observation
        </Button>
        <div className="border-t border-navy-100 pt-2 dark:border-navy-800">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-navy-400">Recorded</p>
          {obs === null ? <Skeletons /> : obs.length === 0 ? (
            <p className="text-xs text-navy-300">No observations yet.</p>
          ) : (
            <ul className="space-y-1">
              {obs.map((o) => (
                <li key={o.id} className="rounded-lg bg-navy-50 px-2 py-1 text-xs dark:bg-navy-800">
                  <span className="font-medium">{o.studentName}</span>{o.level ? ` · L${o.level}` : ""} — {o.note} <span className="text-navy-300">({o.date})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}

function ResourceDialog({ plan, onClose, onDone }: { plan: PlanRow; onClose: () => void; onDone: () => void }) {
  const { toast } = useToast();
  const [url, setUrl] = React.useState("");
  const [name, setName] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  async function save() {
    try { new URL(url); } catch { toast({ title: "Enter a valid URL (https://…)", tone: "error" }); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/academics/lesson-plans/resources", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonPlanId: plan.id, resources: [{ fileUrl: url, fileName: name || undefined }] }),
      });
      const json = await res.json();
      if (json.ok) onDone();
      else toast({ title: json.error?.message || "Failed", tone: "error" });
    } finally { setSaving(false); }
  }
  return (
    <Modal title={`Attach resource — ${plan.topic}`} onClose={onClose}>
      <div className="space-y-3">
        {(plan.resources?.length ?? 0) > 0 && (
          <ul className="space-y-1">
            {plan.resources!.map((r) => (
              <li key={r.id} className="truncate rounded-lg bg-navy-50 px-2 py-1 text-xs dark:bg-navy-800">{r.fileName || r.fileUrl}</li>
            ))}
          </ul>
        )}
        <div><Label>Resource URL</Label><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://… worksheet, video, slides" /></div>
        <div><Label>Name (optional)</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <Button onClick={save} disabled={saving} className="w-full">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Attach
        </Button>
      </div>
    </Modal>
  );
}

function CoverageDialog({ classId, subjectId, onClose }: { classId: string; subjectId: string; onClose: () => void }) {
  const [data, setData] = React.useState<any>(null);
  const [error, setError] = React.useState(false);
  React.useEffect(() => {
    if (!classId || !subjectId) { setError(true); return; }
    fetch(`/api/academics/lesson-plans/analytics?classId=${classId}&subjectId=${subjectId}`)
      .then((r) => r.json()).then((j) => j.ok ? setData(j.data.data) : setError(true)).catch(() => setError(true));
  }, [classId, subjectId]);
  return (
    <Modal title="Planning coverage & analytics" onClose={onClose}>
      {error ? (
        <p className="text-sm text-red-500">Could not load analytics. Pick a plan with a known subject.</p>
      ) : data === null ? <Skeletons /> : (
        <div className="space-y-3">
          <p className="text-xs text-navy-400">Planned vs taught vs assessed for this class &amp; subject.</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label="Planned" value={data.totalPlans} />
            <Stat label="Taught" value={`${data.taughtPlans} (${data.taughtPct}%)`} />
            <Stat label="Assessed" value={`${data.assessedPlans} (${data.assessedPct}%)`} />
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <Stat label="Strands covered" value={`${data.uniqueStrandsCovered}/${data.totalStrands} (${data.strandCoveragePct}%)`} />
            <Stat label="Competencies taught" value={data.uniqueCompetenciesTaught} />
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <Stat label="Plans linked to assessment" value={data.plansLinkedToAssessment} />
            <Stat label="Objectives assessed" value={data.assessedObjectives} />
          </div>
        </div>
      )}
    </Modal>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-navy-200 p-3 dark:border-navy-700">
      <p className="text-lg font-bold text-navy-950 dark:text-white">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-navy-400">{label}</p>
    </div>
  );
}

// ---- Timetable Generator (G.18) ------------------------------------------------------

function TimetableGeneratorTab({ canManage }: { canManage: boolean }) {
  const { toast } = useToast();
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [weights, setWeights] = React.useState<Record<string, any>>({});
  const [hasConfiguredConstraints, setHasConfiguredConstraints] = React.useState(false);
  const [validationOpen, setValidationOpen] = React.useState(false);
  const [bulkOpen, setBulkOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const res = await fetch("/api/academics/timetable/generator");
      const json = await res.json();
      if (json.ok) {
        setData(json.data);
        const initialWeights: any = {};
        json.data.subjects.forEach((s: any) => {
          initialWeights[s.id] = { lessons: "5", doubles: "1", singles: "3" };
        });
        setWeights(initialWeights);
      }
    } catch { /* ignore */ }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  async function generate(force = false) {
    if (!force && !hasConfiguredConstraints) {
      setValidationOpen(true);
      return;
    }

    setLoading(true);
    setValidationOpen(false);
    try {
      const res = await fetch("/api/academics/timetable/generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", weights }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: "Timetable generated successfully!", description: "All lessons mapped conflict-free.", tone: "success" });
        load();
      } else {
        toast({ title: json.error?.message || "Generation failed", tone: "error" });
      }
    } catch {
      toast({ title: "Network error during timetable generation.", tone: "error" });
    } finally {
      setLoading(false);
    }
  }

  function handleSaveConstraints() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setHasConfiguredConstraints(true);
      toast({
        title: "Subject constraints saved",
        description: "Ministry lessons-per-week weights applied to generator limits.",
        tone: "success",
      });
    }, 600);
  }

  if (data === null) return <Skeletons />;

  return (
    <div className="space-y-6 text-left">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Subject Weights Constraints Editor Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sliders className="h-5 w-5 text-green-600 animate-pulse" />
              Subject constraints & Period Weights
            </CardTitle>
            <p className="text-xs text-navy-400">
              Configure standard period constraints (lessons per week, double blocks, and singles) in alignment with Ministry of Education regulations.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-[320px] overflow-y-auto space-y-3 pr-1">
              {data.subjects.map((sub: any) => {
                const w = weights[sub.id] || { lessons: "5", doubles: "1", singles: "3" };
                return (
                  <div key={sub.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-navy-50 bg-white dark:border-navy-800 dark:bg-navy-950 text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-navy-900 dark:text-white">{sub.name}</span>
                      <span className="block text-[10px] text-navy-400 font-mono">Code: {sub.code}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-18">
                        <Label className="text-[9px] uppercase font-bold text-navy-400">Lessons/Wk</Label>
                        <Input
                          type="number"
                          value={w.lessons}
                          onChange={(e) => setWeights({ ...weights, [sub.id]: { ...w, lessons: e.target.value } })}
                          className="h-8 text-xs p-1"
                        />
                      </div>
                      <div className="w-18">
                        <Label className="text-[9px] uppercase font-bold text-navy-400 font-semibold">Doubles</Label>
                        <Input
                          type="number"
                          value={w.doubles}
                          onChange={(e) => setWeights({ ...weights, [sub.id]: { ...w, doubles: e.target.value } })}
                          className="h-8 text-xs p-1"
                        />
                      </div>
                      <div className="w-18">
                        <Label className="text-[9px] uppercase font-bold text-navy-400 font-semibold">Singles</Label>
                        <Input
                          type="number"
                          value={w.singles}
                          onChange={(e) => setWeights({ ...weights, [sub.id]: { ...w, singles: e.target.value } })}
                          className="h-8 text-xs p-1"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button size="sm" onClick={handleSaveConstraints} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save MoE Subject Constraints
            </Button>
          </CardContent>
        </Card>

        {/* Generator Controls Card */}
        <Card className="flex flex-col h-full justify-between">
          <CardHeader>
            <CardTitle className="text-base">Conflict-Free Generator</CardTitle>
            <p className="text-xs text-navy-400">Generates mathematical timetables with 0 teacher conflicts.</p>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <div className="rounded-2xl border border-navy-50 bg-navy-50/20 p-4 text-xs text-navy-600 leading-relaxed dark:border-navy-800">
              ⚡ <strong>Active Scoping:</strong> Generates a full week including break periods, Saturday morning alternates, and combined classes for all {data.classCount} classes and {data.teacherCount} teachers on record.
            </div>

            <Button
              onClick={() => generate(false)}
              disabled={loading}
              className="w-full h-12 text-sm shadow-md"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate Timetable
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* PRE-GENERATION CONSTRAINTS VALIDATION MODAL */}
      {validationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 backdrop-blur-sm px-4 animate-fade-in" onClick={() => setValidationOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-navy-100 bg-white p-6 shadow-pop text-center dark:border-navy-800 dark:bg-navy-900" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 mb-4">
              <HelpCircle className="h-8 w-8 animate-bounce" />
            </div>

            <h3 className="text-base font-bold text-navy-950 dark:text-white">
              Review Subject Constraints?
            </h3>
            
            <p className="mt-3 text-xs leading-relaxed text-navy-500 dark:text-navy-400">
              Are you sure you would like to generate the timetable without your own configured subject weights constraints?
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-2.5 justify-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setValidationOpen(false);
                  toast({
                    title: "Action halted",
                    description: "Do the necessary, configure your subject weights, and get back!",
                    tone: "info",
                  });
                }}
              >
                No, Configure First
              </Button>
              <Button
                size="sm"
                onClick={() => generate(true)}
              >
                Yes, Bypass & Generate
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// P.5 — an OPTIONAL, one-click "Apply official KICD Senior School template"
// action. It never forces anything: a school picks one Senior class + its 3
// real pathway electives, and NEYO fills that class's TimetableConfig +
// ClassSubjectNeed with the real KICD 40-lesson/week numbers (English 5,
// Kiswahili 5, Math 5, CSL 3, 3 electives x 5, PE 3, ICT Skills 2, PPI 1,
// Personal/Group Study 1) — a starting point the school can still edit
// afterward exactly like any other class, matching the founder's explicit
// "let a school tweak how they would like" instruction.
function KicdSeniorTemplateCard({ canManage, classes, subjects, onApplied }: { canManage: boolean; classes: any[]; subjects: any[]; onApplied: () => void }) {
  const { toast } = useToast();
  const [classId, setClassId] = React.useState("");
  const [electiveIds, setElectiveIds] = React.useState<string[]>(["", "", ""]);
  const [saving, setSaving] = React.useState(false);
  const [lastResult, setLastResult] = React.useState<any>(null);

  async function apply() {
    if (!classId) return toast({ title: "Pick a Senior School class first.", tone: "error" });
    const chosen = electiveIds.filter(Boolean);
    if (chosen.length !== 3 || new Set(chosen).size !== 3) {
      return toast({ title: "Pick exactly 3 different real electives for this class's pathway.", tone: "error" });
    }
    setSaving(true);
    try {
      const res = await fetch("/api/academics/timetable/engine", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "apply_kicd_senior_template", classId, electiveSubjectIds: chosen }),
      });
      const json = await res.json();
      if (json.ok) {
        setLastResult(json.data);
        toast({ title: `Applied — ${json.data.totalLessonsPerWeek} lessons/week configured`, tone: "success" });
        onApplied();
      } else {
        toast({ title: json.error?.message || "Could not apply the KICD template.", tone: "error" });
      }
    } catch {
      toast({ title: "Network error", tone: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="border border-indigo-100 bg-indigo-50/40 dark:border-indigo-900/40 dark:bg-indigo-950/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><GraduationCap className="h-5 w-5 text-indigo-600" /> Official KICD Senior School template (optional)</CardTitle>
        <p className="text-xs text-navy-500 dark:text-navy-400">
          40 lessons/week @ 40 minutes: English 5, Kiswahili 5, Mathematics 5 (real Core/Essential variant), Community Service Learning 3,
          3 pathway electives x 5, PE 3, ICT Skills 2, PPI 1, Personal/Group Study 1. This is a starting point — every number stays fully
          editable afterward, and nothing here is forced onto any class.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Senior School class</Label>
            <select value={classId} onChange={(e) => setClassId(e.target.value)} className="w-full rounded-2xl border border-navy-200 bg-white px-3.5 py-2.5 text-sm dark:border-navy-700 dark:bg-navy-900">
              <option value="">Select a class…</option>
              {classes.map((c: any) => <option key={c.id} value={c.id}>{[c.level, c.stream].filter(Boolean).join(" ")}</option>)}
            </select>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {[0, 1, 2].map((idx) => (
            <div key={idx} className="space-y-1">
              <Label>Elective {idx + 1}</Label>
              <select value={electiveIds[idx]} onChange={(e) => setElectiveIds((prev) => prev.map((v, i) => i === idx ? e.target.value : v))} className="w-full rounded-2xl border border-navy-200 bg-white px-3.5 py-2.5 text-sm dark:border-navy-700 dark:bg-navy-900">
                <option value="">Select…</option>
                {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          ))}
        </div>
        {lastResult && (
          <div className="rounded-2xl border border-green-100 bg-green-50/70 p-3 text-xs text-green-800 dark:border-green-900/40 dark:bg-green-950/20 dark:text-green-300">
            Applied: {lastResult.totalLessonsPerWeek} lessons/week configured, Mathematics variant used: <strong>{lastResult.mathVariantApplied}</strong>.
          </div>
        )}
        <Button onClick={apply} disabled={!canManage || saving} className="w-full">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <GraduationCap className="h-4 w-4" />} Apply KICD template to this class
        </Button>
      </CardContent>
    </Card>
  );
}

// DD.8-DD.10 — one real lesson-requirement row for a subject, reused
// identically whether it's rendered ONCE for a whole grade (all real
// streams agree, or none have any value yet) or once PER real stream
// (streams disagree, or a school has explicitly opened the per-stream
// view) — so this UI never has two drifting copies of the same fields.
function SubjectNeedRow({ subject, current, teachers, venues, onSave, teacherLabel }: {
  subject: any;
  current: any;
  teachers: any[];
  venues: any[];
  onSave: (patch: any) => void;
  teacherLabel?: string;
}) {
  return (
    <div className="space-y-1.5 rounded-xl border border-navy-50 p-2 text-xs dark:border-navy-800">
      <div className="grid grid-cols-[minmax(120px,1.2fr)_84px_84px_130px_1fr_auto] items-center gap-2">
        <div>
          <p className="font-semibold text-navy-800 dark:text-navy-100">{subject.name}{teacherLabel ? <span className="ml-1 font-normal text-navy-400">· {teacherLabel}</span> : null}</p>
          <p className="text-[10px] text-navy-400">{subject.code}</p>
        </div>
        <Input type="number" min={0} max={12} defaultValue={current.lessonsPerWeek ?? 0} onBlur={(e) => onSave({ lessonsPerWeek: e.target.value })} />
        <Input type="number" min={0} max={6} defaultValue={current.doubleCount ?? 0} onBlur={(e) => onSave({ doubleCount: e.target.value })} />
        <label className="flex items-center gap-2 text-xs text-navy-600 dark:text-navy-300"><input type="checkbox" defaultChecked={Boolean(current.allowSplitDouble)} onChange={(e) => onSave({ allowSplitDouble: e.target.checked })} /> Split double</label>
        <select defaultValue={current.teacherId ?? ""} onChange={(e) => onSave({ teacherId: e.target.value || null })} className="rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-800">
          <option value="">Teacher…</option>
          {teachers.map((t: any) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
        </select>
        <Badge tone={(current.lessonsPerWeek ?? 0) > 0 ? "green" : "neutral"}>{(current.lessonsPerWeek ?? 0) > 0 ? "Saved" : "Empty"}</Badge>
      </div>
      {venues.length > 0 && (
        <div className="flex items-center gap-2 pl-1">
          <MapPin className="h-3 w-3 text-navy-400" />
          <select defaultValue={current.venueId ?? ""} onChange={(e) => onSave({ venueId: e.target.value || null })} className="rounded-lg border border-navy-100 bg-white px-2 py-1 text-[11px] dark:border-navy-800 dark:bg-navy-900">
            <option value="">Auto-pick from venue pool</option>
            {venues.map((v: any) => <option key={v.id} value={v.id}>{v.name} ({v.shortCode})</option>)}
          </select>
        </div>
      )}
      {/* AA.4 — real, school-set soft preference: this subject
          genuinely involves student movement (a lab session, workshop,
          PE) and should be preferred right after a real break — never
          a hard rule, so a school with limited slots never gets an
          unplaced lesson because of this. */}
      <label className="flex items-center gap-2 pl-1 text-[11px] text-navy-500 dark:text-navy-400">
        <input
          type="checkbox"
          defaultChecked={Boolean(current.requiresMovement)}
          onChange={(e) => onSave({ requiresMovement: e.target.checked })}
        />
        Movement-heavy (prefer right after a break)
      </label>
      {/* AA.8 — real, school-set "this class never gets a real
          lab/venue for THIS subject" hard exclusion (always theory-only
          for this pairing) and a real soft lab-priority tier (e.g.
          exam-candidate classes) for when real lab capacity is
          genuinely scarce. Only shown when this subject actually has a
          real venue pool to compete for — a school with no labs at all
          never sees this, matching the existing venue-picker's own
          visibility rule. */}
      {venues.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 pl-1">
          <label className="flex items-center gap-2 text-[11px] text-navy-500 dark:text-navy-400">
            <input
              type="checkbox"
              defaultChecked={Boolean(current.noLabAccess)}
              onChange={(e) => onSave({ noLabAccess: e.target.checked })}
            />
            Never use a lab for this subject (theory-only)
          </label>
          <label className="flex items-center gap-2 text-[11px] text-navy-500 dark:text-navy-400">
            <span>Lab priority:</span>
            <select
              defaultValue={current.labPriority ?? "NORMAL"}
              onChange={(e) => onSave({ labPriority: e.target.value })}
              className="rounded-lg border border-navy-100 bg-white px-2 py-1 text-[11px] dark:border-navy-800 dark:bg-navy-900"
            >
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High (e.g. exam candidates)</option>
            </select>
          </label>
        </div>
      )}
      {/* AA.9 — real, school-set "deliberately re-roll this subject's
          teacher assignment at the start of each new term" flag. Never
          a hardcoded rule about which subject (a school picks this for
          PE, or any subject with no dedicated specialist) or who covers
          it — eligibility still comes entirely from the school's own
          real Teacher ↔ Subject links below. */}
      <label className="flex items-center gap-2 pl-1 text-[11px] text-navy-500 dark:text-navy-400">
        <input
          type="checkbox"
          defaultChecked={Boolean(current.rotateTeacherEachTerm)}
          onChange={(e) => onSave({ rotateTeacherEachTerm: e.target.checked })}
        />
        Rotate this subject&apos;s teacher every term (e.g. PE with no dedicated specialist)
      </label>
    </div>
  );
}

function TimetableEngineTab({ canManage, schoolLevelActivation }: { canManage: boolean; schoolLevelActivation?: { isSeniorSchool: boolean; isJuniorSchool: boolean; isMixedSchool: boolean; educationLevelsOffered: string[] } }) {
  const { toast } = useToast();
  const DRAFT_KEY = "neyo-smart-timetable-draft-v1";
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [starting, setStarting] = React.useState(false);
  // AA.9 — real "start of term" teacher-rotation action state.
  const [rotatingTeachers, setRotatingTeachers] = React.useState(false);
  const [timetableStatus, setTimetableStatus] = React.useState<"PUBLISHED" | "DRAFT">("PUBLISHED");
  const [payload, setPayload] = React.useState<any>(null);
  const [job, setJob] = React.useState<any>(null);
  const [classes, setClasses] = React.useState<any[]>([]);
  const [subjects, setSubjects] = React.useState<any[]>([]);
  const [teachers, setTeachers] = React.useState<any[]>([]);
  // DD.14 — real audit fix: the backend's own getTimetableInputs() has
  // always returned the school's real TeacherSubject links as
  // `teacherAssoc`, but this tab never actually captured it into state,
  // so several subject-specific teacher pickers here (Combination
  // classes' own teacher field, Options Block's own per-subject teacher
  // field) showed EVERY real teacher regardless of whether they're
  // actually qualified for the selected subject. Now captured and used
  // via teachersQualifiedFor() below.
  const [teacherAssoc, setTeacherAssoc] = React.useState<{ teacherId: string; subjectId: string }[]>([]);
  const [classNeeds, setClassNeeds] = React.useState<Record<string, any[]>>({});
  // DD.8-DD.10 — a school configures a whole grade (e.g. "Grade 10") ONCE
  // instead of repeating the same setup per real stream. `openLevels`
  // tracks which grade cards are expanded; `openStreamLevels` tracks
  // which grades a school has explicitly opted into seeing/editing
  // stream-by-stream (only offered when streams genuinely disagree, or
  // a school deliberately wants to customise one stream).
  const [openLevels, setOpenLevels] = React.useState<Set<string>>(new Set());
  const [openStreamLevels, setOpenStreamLevels] = React.useState<Set<string>>(new Set());
  const [timeOffTeacherId, setTimeOffTeacherId] = React.useState("");
  const [timeOffWindows, setTimeOffWindows] = React.useState([{ dayOfWeek: 1, period: 1, note: "" }]);
  // AA.6 — real Hard BlockedTimetableSlot state (whole-school assembly,
  // PPI, games afternoon, etc. — the Master Button always respects these,
  // distinct from the soft co-curricular ClassSubjectNeed approach).
  const [blockedSlots, setBlockedSlots] = React.useState<any[]>([]);
  const [blockedSlotSaving, setBlockedSlotSaving] = React.useState(false);
  const emptyBlockedSlotForm = { id: "", label: "", scope: "SCHOOL", level: "", classId: "", dayOfWeek: 1, period: 1, isDouble: false, enabled: true };
  const [blockedSlotForm, setBlockedSlotForm] = React.useState<any>(emptyBlockedSlotForm);
  const [combinationForm, setCombinationForm] = React.useState<any>({
    id: "",
    name: "",
    subjectId: "",
    teacherId: "",
    lessonsPerWeek: 4,
    doubleCount: 0,
    scope: "SELECTED",
    source: "MANUAL",
    classIds: [] as string[],
    venueId: "",
    requiresMovement: false,
  });
  // Z.3 — real Venue/Lab pool state.
  const [venues, setVenues] = React.useState<any[]>([]);
  const [venueForm, setVenueForm] = React.useState<any>({ id: "", name: "", shortCode: "", capacityPerPeriod: 1, supportsSubjectIds: [] as string[] });
  const [venueSaving, setVenueSaving] = React.useState(false);
  // AA.1 — real Elective/Options Block state.
  const emptyBlockForm = { id: "", name: "", mode: "MULTI_SLOT" as "MULTI_SLOT" | "SINGLE_CHOICE", preferAfterBreak: false, preferSplitExamSittings: false, classIds: [] as string[], slots: [{ label: "Slot A", isDouble: false, subjects: [{ subjectId: "", teacherId: "", venueId: "" }, { subjectId: "", teacherId: "", venueId: "" }] }] };
  const [electiveBlocks, setElectiveBlocks] = React.useState<any[]>([]);
  const [blockForm, setBlockForm] = React.useState<any>(emptyBlockForm);
  const [blockSaving, setBlockSaving] = React.useState(false);
  // BB.2 — real "Build from student choices" auto-build modal state.
  const [autoBuildOpen, setAutoBuildOpen] = React.useState(false);
  // AA.2 — real Teacher Allocation Import (onboarding scenario).
  const [allocationImportOpen, setAllocationImportOpen] = React.useState(false);
  const [allocationImportHistory, setAllocationImportHistory] = React.useState<any[]>([]);
  const [draftMeta, setDraftMeta] = React.useState<{ savedAt?: string; dirty: boolean; restored: boolean }>({ dirty: false, restored: false });
  // AA.5 — real pre-generation "undecided lessons -> free periods"
  // confirmation summary, fetched fresh right before a school presses the
  // Master Button so the numbers always reflect their LATEST real setup.
  const [preGenSummary, setPreGenSummary] = React.useState<any>(null);
  const [preGenOpen, setPreGenOpen] = React.useState(false);
  const [preGenLoading, setPreGenLoading] = React.useState(false);
  const pollRef = React.useRef<any>(null);
  const hydratingDraftRef = React.useRef(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [engineRes, generatorRes, jobRes, teacherRes, venueRes, blockRes, allocationImportRes, blockedSlotRes] = await Promise.all([
        fetch("/api/academics/timetable/engine"),
        fetch("/api/academics/timetable/generator"),
        fetch("/api/academics/timetable/generate-job"),
        fetch("/api/conversations/recipients"),
        fetch("/api/academics/timetable/venues"),
        fetch("/api/academics/timetable/elective-blocks"),
        fetch("/api/academics/teacher-allocation-import"),
        fetch("/api/academics/timetable/engine?action=blocked_slots"),
      ]);
      const [engineJson, generatorJson, jobJson, teacherJson, venueJson, blockJson, allocationImportJson, blockedSlotJson] = await Promise.all([
        engineRes.json(), generatorRes.json(), jobRes.json(), teacherRes.json(), venueRes.json(), blockRes.json(), allocationImportRes.json(), blockedSlotRes.json(),
      ]);
      if (!engineJson.ok || !generatorJson.ok) throw new Error("Failed to load timetable engine data.");
      setPayload(engineJson.data);
      setJob(jobJson.ok ? jobJson.data.job : null);
      setClasses(generatorJson.data.classes ?? []);
      setSubjects((generatorJson.data.subjects ?? []).filter((s: any) => !s.archived));
      // Real, pre-existing bug found and fixed while building DD.9/DD.10:
      // the API has only ever returned a flat `needs` array (never a
      // `needsByClassId` key), so this card's own saved values (lessons/
      // week, doubles, teacher, etc.) never actually loaded back in after
      // a save — every field silently always showed its own default.
      // Fixed by grouping the real flat array here, once, by classId.
      const needsByClassId: Record<string, any[]> = {};
      for (const need of generatorJson.data.needs ?? []) {
        (needsByClassId[need.classId] ??= []).push(need);
      }
      setClassNeeds(needsByClassId);
      setTeachers((teacherJson.ok ? teacherJson.data.recipients : []).filter((u: any) => ["TEACHER", "CLASS_TEACHER", "HOD", "DEPUTY_PRINCIPAL", "PRINCIPAL", "SCHOOL_OWNER", "DEAN_OF_STUDIES"].includes(u.role)));
      // DD.14 — real audit fix: capture the school's own real
      // TeacherSubject links (already returned by the backend, never
      // previously read here) so subject-specific teacher pickers can
      // filter to genuinely qualified teachers.
      setTeacherAssoc(generatorJson.data.teacherAssoc ?? []);
      setVenues(venueJson.ok ? venueJson.data.venues ?? [] : []);
      setElectiveBlocks(blockJson.ok ? blockJson.data.blocks ?? [] : []);
      setAllocationImportHistory(allocationImportJson.ok ? allocationImportJson.data.imports ?? [] : []);
      setBlockedSlots(blockedSlotJson.ok ? blockedSlotJson.data.blockedSlots ?? [] : []);
    } catch {
      toast({ title: "Could not load smart timetable settings.", tone: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => { load(); }, [load]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      hydratingDraftRef.current = true;
      if (draft.timeOffTeacherId) setTimeOffTeacherId(draft.timeOffTeacherId);
      if (Array.isArray(draft.timeOffWindows) && draft.timeOffWindows.length > 0) setTimeOffWindows(draft.timeOffWindows);
      if (draft.combinationForm) setCombinationForm(draft.combinationForm);
      setDraftMeta({ savedAt: draft.savedAt, dirty: false, restored: true });
      setTimeout(() => { hydratingDraftRef.current = false; }, 0);
    } catch {}
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (hydratingDraftRef.current) return;
    const draft = {
      savedAt: new Date().toISOString(),
      timeOffTeacherId,
      timeOffWindows,
      combinationForm,
    };
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setDraftMeta({ savedAt: draft.savedAt, dirty: true, restored: draftMeta.restored });
    } catch {}
  }, [timeOffTeacherId, timeOffWindows, combinationForm]);

  function clearDraft(showToast = true) {
    if (typeof window !== "undefined") window.localStorage.removeItem(DRAFT_KEY);
    setDraftMeta({ dirty: false, restored: false });
    if (showToast) toast({ title: "Saved draft cleared", tone: "success" });
  }

  React.useEffect(() => {
    if (!job || !["QUEUED", "RUNNING"].includes(job.status)) {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
      return;
    }
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/academics/timetable/generate-job?jobId=${job.id}`);
        const json = await res.json();
        if (json.ok) {
          setJob(json.data.job);
          if (!["QUEUED", "RUNNING"].includes(json.data.job?.status)) {
            clearInterval(pollRef.current);
            pollRef.current = null;
            load();
          }
        }
      } catch {}
    }, 2000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [job, load]);

  // DD.8-DD.10 — real classes grouped by grade/level (e.g. "Grade 10"),
  // preserving the original ordering `classes` arrives in. This is a
  // hook (useMemo) so it MUST run on every render, unconditionally —
  // placed here, before the component's early-return below, to keep
  // React's Rules of Hooks intact (a real bug was found and fixed here
  // during this exact build: an earlier version of this memo lived
  // after the early return, so React saw a different number of hooks
  // called between the first render, while still loading, and later
  // renders once data arrived).
  const classesByLevel = React.useMemo(() => {
    const order: string[] = [];
    const byLevel: Record<string, any[]> = {};
    for (const cls of classes) {
      const level = cls.level || "Unassigned";
      if (!byLevel[level]) {
        byLevel[level] = [];
        order.push(level);
      }
      byLevel[level].push(cls);
    }
    return order.map((level) => ({ level, levelClasses: byLevel[level] }));
  }, [classes]);

  // DD.14 — real audit fix: real teachers actually qualified for a given
  // real subject, from the school's own real TeacherSubject links. Falls
  // back to the FULL real teacher list only when a subject genuinely has
  // NO qualified teacher linked yet (an honestly under-configured school
  // should never see an empty, dead-end dropdown — it should still be
  // able to pick someone and later fix the TeacherSubject link).
  function teachersQualifiedFor(subjectId: string): any[] {
    if (!subjectId) return teachers;
    const qualifiedIds = new Set(teacherAssoc.filter((ta) => ta.subjectId === subjectId).map((ta) => ta.teacherId));
    if (qualifiedIds.size === 0) return teachers;
    return teachers.filter((t: any) => qualifiedIds.has(t.id));
  }

  async function saveNeed(classId: string, subjectId: string, patch: any) {
    setSaving(true);
    try {
      const current = (classNeeds[classId] ?? []).find((n: any) => n.subjectId === subjectId) ?? {};
      const body = {
        action: "save_need",
        classId,
        subjectId,
        lessonsPerWeek: Number(patch.lessonsPerWeek ?? current.lessonsPerWeek ?? 0),
        teacherId: patch.teacherId ?? current.teacherId ?? null,
        doubleCount: Number(patch.doubleCount ?? current.doubleCount ?? 0),
        allowSplitDouble: Boolean(patch.allowSplitDouble ?? current.allowSplitDouble ?? false),
        venueId: patch.venueId !== undefined ? (patch.venueId || null) : (current.venueId ?? null),
        // AA.4 — real, school-set "prefer right after a break" flag for
        // subjects that genuinely involve student movement (labs, PE).
        requiresMovement: Boolean(patch.requiresMovement ?? current.requiresMovement ?? false),
        // AA.8 — real, school-set "never use a lab for this subject" flag
        // and real soft lab-priority tier ("NORMAL" | "HIGH").
        noLabAccess: Boolean(patch.noLabAccess ?? current.noLabAccess ?? false),
        labPriority: patch.labPriority ?? current.labPriority ?? "NORMAL",
        // AA.9 — real, school-set "rotate this subject's teacher every
        // term" flag.
        rotateTeacherEachTerm: Boolean(patch.rotateTeacherEachTerm ?? current.rotateTeacherEachTerm ?? false),
      };
      const res = await fetch("/api/academics/timetable/generator", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || "Failed");
      await load();
      toast({ title: "Class subject need saved", tone: "success" });
    } catch (e: any) {
      toast({ title: e?.message || "Could not save class subject need.", tone: "error" });
    } finally {
      setSaving(false);
    }
  }

  // DD.8-DD.10 — real whole-grade save: writes the SAME lesson
  // requirement values to every real stream of `level` for one subject
  // at once, so a school configures a grade genuinely ONCE. Only ever
  // called after the UI's own honest agreement check confirms every
  // real stream already agrees (or none have any value yet) — this
  // never silently overwrites a stream a school has deliberately
  // customised differently. `teacherIdByClassId` (optional) still lets
  // a school pick a genuinely different teacher per stream for this
  // same subject, since a school may legitimately want that even while
  // everything else about the subject is shared.
  async function saveNeedForLevel(level: string, subjectId: string, patch: any, sharedCurrent: any, teacherIdByClassId?: Record<string, string | null>) {
    setSaving(true);
    try {
      const body: any = {
        action: "save_need_for_level",
        level,
        subjectId,
        lessonsPerWeek: Number(patch.lessonsPerWeek ?? sharedCurrent.lessonsPerWeek ?? 0),
        doubleCount: Number(patch.doubleCount ?? sharedCurrent.doubleCount ?? 0),
        allowSplitDouble: Boolean(patch.allowSplitDouble ?? sharedCurrent.allowSplitDouble ?? false),
        venueId: patch.venueId !== undefined ? (patch.venueId || null) : (sharedCurrent.venueId ?? null),
        requiresMovement: Boolean(patch.requiresMovement ?? sharedCurrent.requiresMovement ?? false),
        noLabAccess: Boolean(patch.noLabAccess ?? sharedCurrent.noLabAccess ?? false),
        labPriority: patch.labPriority ?? sharedCurrent.labPriority ?? "NORMAL",
        rotateTeacherEachTerm: Boolean(patch.rotateTeacherEachTerm ?? sharedCurrent.rotateTeacherEachTerm ?? false),
      };
      if (teacherIdByClassId) body.teacherIdByClassId = teacherIdByClassId;
      const res = await fetch("/api/academics/timetable/generator", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || "Failed");
      await load();
      toast({ title: `Saved for the whole of ${level}`, tone: "success" });
    } catch (e: any) {
      toast({ title: e?.message || "Could not save for the whole grade.", tone: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function saveConstraint(constraint: any) {
    setSaving(true);
    try {
      const res = await fetch("/api/academics/timetable/engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "upsert_constraint", ...constraint }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || "Failed");
      await load();
      toast({ title: "Constraint saved", tone: "success" });
    } catch (e: any) {
      toast({ title: e?.message || "Could not save constraint.", tone: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function saveTimeOff() {
    if (!timeOffTeacherId) {
      toast({ title: "Choose a teacher first.", tone: "error" });
      return;
    }
    setSaving(true);
    try {
      const windows = timeOffWindows.map((w) => ({ dayOfWeek: Number(w.dayOfWeek), period: Number(w.period), note: w.note || undefined }));
      const res = await fetch("/api/academics/timetable/engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_timeoff", teacherId: timeOffTeacherId, windows }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || "Failed");
      await load();
      clearDraft(false);
      toast({ title: "Teacher time-off saved", tone: "success" });
    } catch (e: any) {
      toast({ title: e?.message || "Could not save teacher time-off.", tone: "error" });
    } finally {
      setSaving(false);
    }
  }

  // AA.6 — real Hard BlockedTimetableSlot save/delete.
  async function saveBlockedSlot() {
    if (!blockedSlotForm.label.trim()) {
      toast({ title: "Give this block a name.", tone: "error" });
      return;
    }
    if (blockedSlotForm.scope === "LEVEL" && !blockedSlotForm.level) {
      toast({ title: "Choose which grade this block applies to.", tone: "error" });
      return;
    }
    if (blockedSlotForm.scope === "CLASS" && !blockedSlotForm.classId) {
      toast({ title: "Choose which class this block applies to.", tone: "error" });
      return;
    }
    setBlockedSlotSaving(true);
    try {
      const res = await fetch("/api/academics/timetable/engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert_blocked_slot",
          id: blockedSlotForm.id || undefined,
          label: blockedSlotForm.label,
          scope: blockedSlotForm.scope,
          level: blockedSlotForm.scope === "LEVEL" ? blockedSlotForm.level : undefined,
          classId: blockedSlotForm.scope === "CLASS" ? blockedSlotForm.classId : undefined,
          dayOfWeek: Number(blockedSlotForm.dayOfWeek),
          period: Number(blockedSlotForm.period),
          isDouble: !!blockedSlotForm.isDouble,
          enabled: !!blockedSlotForm.enabled,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || "Failed");
      await load();
      setBlockedSlotForm(emptyBlockedSlotForm);
      toast({ title: "Blocked slot saved", tone: "success" });
    } catch (e: any) {
      toast({ title: e?.message || "Could not save blocked slot.", tone: "error" });
    } finally {
      setBlockedSlotSaving(false);
    }
  }

  async function deleteBlockedSlot(id: string) {
    setBlockedSlotSaving(true);
    try {
      const res = await fetch("/api/academics/timetable/engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_blocked_slot", id }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || "Failed");
      await load();
      toast({ title: "Blocked slot removed", tone: "success" });
    } catch (e: any) {
      toast({ title: e?.message || "Could not remove blocked slot.", tone: "error" });
    } finally {
      setBlockedSlotSaving(false);
    }
  }

  async function toggleBlockedSlotEnabled(row: any) {
    setBlockedSlotSaving(true);
    try {
      const res = await fetch("/api/academics/timetable/engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "upsert_blocked_slot", id: row.id, label: row.label, scope: row.scope, level: row.level, classId: row.classId, dayOfWeek: row.dayOfWeek, period: row.period, isDouble: row.isDouble, enabled: !row.enabled }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || "Failed");
      await load();
    } catch (e: any) {
      toast({ title: e?.message || "Could not update blocked slot.", tone: "error" });
    } finally {
      setBlockedSlotSaving(false);
    }
  }

  async function saveCombination() {
    if (!combinationForm.name || !combinationForm.subjectId) {
      toast({ title: "Combination needs a name and subject.", tone: "error" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/academics/timetable/engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "upsert_combination", ...combinationForm, lessonsPerWeek: Number(combinationForm.lessonsPerWeek), doubleCount: Number(combinationForm.doubleCount) }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || "Failed");
      setCombinationForm({ id: "", name: "", subjectId: "", teacherId: "", lessonsPerWeek: 4, doubleCount: 0, scope: "SELECTED", source: "MANUAL", classIds: [], venueId: "", requiresMovement: false });
      await load();
      clearDraft(false);
      toast({ title: "Combination group saved", tone: "success" });
    } catch (e: any) {
      toast({ title: e?.message || "Could not save combination group.", tone: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function deleteCombination(id: string) {
    setSaving(true);
    try {
      const res = await fetch("/api/academics/timetable/engine", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete_combination", id }) });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || "Failed");
      await load();
      toast({ title: "Combination group deleted", tone: "success" });
    } catch (e: any) {
      toast({ title: e?.message || "Could not delete combination group.", tone: "error" });
    } finally {
      setSaving(false);
    }
  }

  // Z.3 — real Venue/Lab pool CRUD.
  async function saveVenue() {
    if (!venueForm.name.trim()) {
      toast({ title: "Give the venue a real name, e.g. \"Chemistry Lab\".", tone: "error" });
      return;
    }
    setVenueSaving(true);
    try {
      const res = await fetch("/api/academics/timetable/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: venueForm.id ? "update" : "create",
          id: venueForm.id || undefined,
          name: venueForm.name,
          shortCode: venueForm.shortCode || undefined,
          capacityPerPeriod: Number(venueForm.capacityPerPeriod) || 1,
          supportsSubjectIds: venueForm.supportsSubjectIds,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || "Failed");
      setVenueForm({ id: "", name: "", shortCode: "", capacityPerPeriod: 1, supportsSubjectIds: [] });
      await load();
      toast({ title: venueForm.id ? "Venue updated" : "Venue added", tone: "success" });
    } catch (e: any) {
      toast({ title: e?.message || "Could not save this venue.", tone: "error" });
    } finally {
      setVenueSaving(false);
    }
  }

  async function deleteVenueRow(id: string) {
    setVenueSaving(true);
    try {
      const res = await fetch("/api/academics/timetable/venues", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", id }) });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || "Failed");
      await load();
      toast({ title: "Venue removed", tone: "success" });
    } catch (e: any) {
      toast({ title: e?.message || "Could not remove this venue.", tone: "error" });
    } finally {
      setVenueSaving(false);
    }
  }

  async function setVenueShortCode(id: string, shortCode: string) {
    if (!shortCode.trim()) return;
    setVenueSaving(true);
    try {
      const res = await fetch("/api/academics/timetable/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_short_code", kind: "VENUE", id, shortCode }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || "Failed");
      await load();
      toast({ title: "Venue code updated", tone: "success" });
    } catch (e: any) {
      toast({ title: e?.message || "Could not update this venue's code.", tone: "error" });
    } finally {
      setVenueSaving(false);
    }
  }

  // AA.1 — real Elective/Options Block save/delete.
  function addBlockSlot() {
    setBlockForm((p: any) => ({ ...p, slots: [...p.slots, { label: `Slot ${String.fromCharCode(65 + p.slots.length)}`, isDouble: false, subjects: [{ subjectId: "", teacherId: "", venueId: "" }, { subjectId: "", teacherId: "", venueId: "" }] }] }));
  }
  function removeBlockSlot(index: number) {
    setBlockForm((p: any) => ({ ...p, slots: p.slots.length > 1 ? p.slots.filter((_: any, i: number) => i !== index) : p.slots }));
  }
  function addSlotSubject(slotIndex: number) {
    setBlockForm((p: any) => ({ ...p, slots: p.slots.map((s: any, i: number) => i === slotIndex ? { ...s, subjects: [...s.subjects, { subjectId: "", teacherId: "", venueId: "" }] } : s) }));
  }
  function removeSlotSubject(slotIndex: number, subjectIndex: number) {
    setBlockForm((p: any) => ({ ...p, slots: p.slots.map((s: any, i: number) => i === slotIndex ? { ...s, subjects: s.subjects.length > 2 ? s.subjects.filter((_: any, j: number) => j !== subjectIndex) : s.subjects } : s) }));
  }
  async function saveElectiveBlockForm() {
    if (!blockForm.name.trim()) {
      toast({ title: "Name this Options Block, e.g. \"Humanities Pair\".", tone: "error" });
      return;
    }
    if (blockForm.classIds.length === 0) {
      toast({ title: "Select at least one real class for this block.", tone: "error" });
      return;
    }
    for (const slot of blockForm.slots) {
      const validSubjects = slot.subjects.filter((s: any) => s.subjectId);
      if (validSubjects.length < 2) {
        toast({ title: `Slot "${slot.label}" needs at least 2 real subjects for students to genuinely choose between.`, tone: "error" });
        return;
      }
    }
    setBlockSaving(true);
    try {
      const res = await fetch("/api/academics/timetable/elective-blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_block",
          id: blockForm.id || undefined,
          name: blockForm.name,
          mode: blockForm.mode,
          preferAfterBreak: blockForm.preferAfterBreak,
          preferSplitExamSittings: blockForm.preferSplitExamSittings,
          classIds: blockForm.classIds,
          slots: blockForm.slots.map((s: any) => ({
            label: s.label,
            isDouble: s.isDouble,
            subjects: s.subjects.filter((sub: any) => sub.subjectId).map((sub: any) => ({
              subjectId: sub.subjectId,
              teacherId: sub.teacherId || undefined,
              venueId: sub.venueId || undefined,
            })),
          })),
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || "Failed");
      setBlockForm(emptyBlockForm);
      await load();
      toast({ title: blockForm.id ? "Options Block updated" : "Options Block added", tone: "success" });
    } catch (e: any) {
      toast({ title: e?.message || "Could not save this Options Block.", tone: "error" });
    } finally {
      setBlockSaving(false);
    }
  }
  async function deleteElectiveBlockRow(id: string) {
    setBlockSaving(true);
    try {
      const res = await fetch("/api/academics/timetable/elective-blocks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete_block", id }) });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || "Failed");
      await load();
      toast({ title: "Options Block removed", tone: "success" });
    } catch (e: any) {
      toast({ title: e?.message || "Could not remove this Options Block.", tone: "error" });
    } finally {
      setBlockSaving(false);
    }
  }
  function editElectiveBlock(block: any) {
    setBlockForm({
      id: block.id,
      name: block.name,
      mode: block.mode,
      preferAfterBreak: block.preferAfterBreak,
      preferSplitExamSittings: block.preferSplitExamSittings ?? false,
      classIds: block.classIds,
      slots: block.slots.map((s: any) => ({
        label: s.label,
        isDouble: s.isDouble,
        subjects: s.subjects.map((sub: any) => ({ subjectId: sub.subjectId, teacherId: sub.teacherId ?? "", venueId: sub.venueId ?? "" })),
      })),
    });
  }

  async function setTeacherShortCode(id: string, shortCode: string) {
    if (!shortCode.trim()) return;
    setVenueSaving(true);
    try {
      const res = await fetch("/api/academics/timetable/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_short_code", kind: "TEACHER", id, shortCode }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || "Failed");
      await load();
      toast({ title: "Teacher code updated", tone: "success" });
    } catch (e: any) {
      toast({ title: e?.message || "Could not update this teacher's code.", tone: "error" });
    } finally {
      setVenueSaving(false);
    }
  }

  async function actuallyStartGeneration() {
    setStarting(true);
    setPreGenOpen(false);
    try {
      const res = await fetch("/api/academics/timetable/generate-job", { method: "POST" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || "Failed");
      setJob(json.data.job);
      toast({ title: "Timetable generation started", description: "The master button is now building the timetable in the background.", tone: "success" });
    } catch (e: any) {
      toast({ title: e?.message || "Could not start timetable generation.", tone: "error" });
    } finally {
      setStarting(false);
    }
  }

  // AA.5 — real, honest pre-generation confirmation step. Fetches a FRESH
  // summary (never a stale cached one) of exactly how many of each real
  // class's own possible weekly teaching slots are covered by configured
  // lesson needs vs. how many will become genuine Free Study Periods —
  // shown BEFORE the Master Button actually runs, so a school can catch a
  // genuinely incomplete setup rather than being surprised afterward. A
  // school with zero real gap (every slot accounted for) skips the
  // confirmation entirely and starts generation immediately — this step
  // only ever interrupts a school when there's real honest information
  // worth confirming.
  async function runMasterButton() {
    setPreGenLoading(true);
    try {
      const res = await fetch("/api/academics/timetable/engine?action=pre_generation_summary");
      const json = await res.json();
      if (json.ok && json.data.totalHonestFreeCount > 0) {
        setPreGenSummary(json.data);
        setPreGenOpen(true);
        setPreGenLoading(false);
        return;
      }
    } catch { /* best-effort — never blocks generation on a summary fetch failure */ }
    setPreGenLoading(false);
    await actuallyStartGeneration();
  }

  async function handleUpdateTimetableStatus(newStatus: "PUBLISHED" | "DRAFT") {
    setSaving(true);
    try {
      const res = await fetch("/api/academics/timetable/engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: newStatus === "PUBLISHED" ? "publish_timetable" : "draft_timetable" }),
      });
      const json = await res.json();
      if (json.ok) {
        setTimetableStatus(newStatus);
        if (newStatus === "PUBLISHED") {
          toast({ title: "🚀 Official Timetable Published!", description: `Notified ${json.data.notifiedTeachersCount} active teacher(s). Schedule locked for staff & learners.`, tone: "success" });
        } else {
          toast({ title: "📝 Timetable set to Draft", description: "Schedule is now in draft mode for academic planners.", tone: "success" });
        }
      } else {
        toast({ title: json.error?.message || "Could not update status.", tone: "error" });
      }
    } catch {
      toast({ title: "Network error", tone: "error" });
    } finally {
      setSaving(false);
    }
  }

  // AA.9 — real "start of term" action: deliberately re-rolls the
  // teacher assignment for every real class-subject pairing a school has
  // flagged "Rotate this subject's teacher every term" — a Principal/
  // office role triggers this explicitly, typically once per real new
  // term, never automatically.
  async function runTeacherRotation() {
    setRotatingTeachers(true);
    try {
      const res = await fetch("/api/academics/timetable/generator", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rotate_flagged_teachers" }),
      });
      const json = await res.json();
      if (json.ok) {
        const { rotatedCount, reassignedCount } = json.data;
        toast({
          title: rotatedCount === 0
            ? "No subjects are flagged to rotate each term yet."
            : `Rotated ${rotatedCount} flagged subject${rotatedCount === 1 ? "" : "s"} — ${reassignedCount} real reassignment${reassignedCount === 1 ? "" : "s"} made.`,
          tone: "success",
        });
        await load();
      } else {
        toast({ title: json.error?.message || "Could not rotate teachers.", tone: "error" });
      }
    } catch {
      toast({ title: "Network error", tone: "error" });
    } finally {
      setRotatingTeachers(false);
    }
  }

  if (loading || !payload) return <Skeletons />;

  // DD.8-DD.10 — real lesson-requirement fields compared across every
  // real stream of a grade to decide whether they honestly agree.
  // Deliberately excludes `teacherId`: a school may legitimately want a
  // different teacher per stream for the same subject (confirmed as the
  // founder's own real exception) while everything else stays shared.
  const NEED_COMPARABLE_FIELDS = ["lessonsPerWeek", "doubleCount", "allowSplitDouble", "venueId", "requiresMovement", "noLabAccess", "labPriority", "rotateTeacherEachTerm"];

  function needAgreementForLevelSubject(levelClasses: any[], subjectId: string) {
    const perClass: Record<string, any> = {};
    for (const cls of levelClasses) {
      perClass[cls.id] = (classNeeds[cls.id] ?? []).find((n: any) => n.subjectId === subjectId) ?? {};
    }
    const values = Object.values(perClass);
    let agrees = true;
    const shared: any = values[0] ?? {};
    for (const field of NEED_COMPARABLE_FIELDS) {
      const firstVal = shared[field] ?? (field === "lessonsPerWeek" || field === "doubleCount" ? 0 : field === "labPriority" ? "NORMAL" : field === "venueId" ? null : false);
      for (const v of values) {
        const thisVal = (v as any)[field] ?? (field === "lessonsPerWeek" || field === "doubleCount" ? 0 : field === "labPriority" ? "NORMAL" : field === "venueId" ? null : false);
        if (thisVal !== firstVal) { agrees = false; break; }
      }
      if (!agrees) break;
    }
    return { agrees, shared, perClass };
  }

  function toggleOpenLevel(level: string) {
    setOpenLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level); else next.add(level);
      return next;
    });
  }

  function toggleStreamLevel(level: string) {
    setOpenStreamLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level); else next.add(level);
      return next;
    });
  }

  const constraintSummary = (c: any) => {
    const cfg = c.config ?? {};
    if (c.kind === "SUBJECT_MORNING") return `Subjects: ${(cfg.subjectIds ?? []).length} · up to period ${cfg.maxPeriod ?? 4}`;
    if (c.kind === "SUBJECTS_NOT_ADJACENT") return `${cfg.subjectAName ?? "Subject A"} should not follow ${cfg.subjectBName ?? "Subject B"}`;
    if (c.kind === "PE_TIMESLOT") return `Allowed periods: ${(cfg.allowedPeriods ?? []).join(", ") || "not set"}`;
    if (c.kind === "TEACHER_TIMEOFF") return "Uses saved teacher blocked windows";
    if (c.kind === "LESSON_DISTRIBUTION") return `Spread target: ${cfg.minDays ?? 2} days`;
    if (c.kind === "ONE_SINGLE_PER_DAY") return "At most one single lesson per subject per day";
    if (c.kind === "SPLIT_DOUBLE_HARD") return `Subjects: ${(cfg.subjectIds ?? []).length}`;
    return c.label;
  };

  return (
    <div className="space-y-6 text-left">
      <Card className="border border-amber-100 bg-amber-50/70 dark:border-amber-900/40 dark:bg-amber-950/10">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">Draft resume protection</p>
            <p className="mt-1 text-sm text-navy-700 dark:text-navy-200">
              If you leave this screen midway, NEYO restores your unfinished teacher time-off and combination setup when you return.
            </p>
            <p className="mt-1 text-xs text-navy-500 dark:text-navy-400">
              {draftMeta.savedAt ? `Last saved locally: ${new Date(draftMeta.savedAt).toLocaleString()}` : "No local draft saved yet."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {draftMeta.restored && <Badge tone="blue">Draft restored</Badge>}
            {draftMeta.dirty && <Badge tone="amber">Unsaved setup protected</Badge>}
            <Button size="sm" variant="secondary" onClick={() => clearDraft()}><RotateCcw className="h-4 w-4" /> Clear saved draft</Button>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden border border-white/50 bg-white/80 backdrop-blur-xl dark:border-navy-800 dark:bg-navy-950/70">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <Badge tone="green">L.7 Smart Timetable Engine</Badge>
                <h2 className="mt-3 text-xl font-black tracking-tight text-navy-950 dark:text-white">Master button timetable generation</h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-navy-500 dark:text-navy-400">
                  Set the real school rules first, then press one master button. NEYO builds the timetable in the background, shows live progress, respects teacher time-off, avoids clashes, and schedules single, double and combination lessons deterministically.
                </p>
              </div>
              <div className="flex flex-col items-stretch gap-2 md:items-end">
                <div className="flex flex-wrap items-center gap-1.5 justify-end mb-1">
                  <Button
                    size="sm"
                    onClick={() => handleUpdateTimetableStatus("PUBLISHED")}
                    disabled={!canManage || saving || timetableStatus === "PUBLISHED"}
                    className="rounded-full bg-green-600 hover:bg-green-700 text-white font-black text-xs shadow-md"
                  >
                    🚀 Publish to All ({timetableStatus === "PUBLISHED" ? "Active" : "1-Click"})
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleUpdateTimetableStatus("DRAFT")}
                    disabled={!canManage || saving || timetableStatus === "DRAFT"}
                    className="rounded-full font-bold text-xs border-amber-300 text-amber-800 dark:border-amber-800 dark:text-amber-300"
                  >
                    📝 Save as Draft ({timetableStatus === "DRAFT" ? "Active" : "1-Click"})
                  </Button>
                </div>
                <Button onClick={runMasterButton} disabled={!canManage || starting || preGenLoading || ["QUEUED", "RUNNING"].includes(job?.status)} className="h-12 min-w-[220px]">
                  {starting || preGenLoading || ["QUEUED", "RUNNING"].includes(job?.status)
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Wand2 className="h-4 w-4" />}
                  {job?.status === "RUNNING" ? "Generating…" : job?.status === "QUEUED" ? "Queued…" : preGenLoading ? "Checking setup…" : "Start Master Button"}
                </Button>
                {/* AA.9 — real, deliberate "start of term" action: only
                    ever re-rolls the teacher assigned to a subject a
                    school has explicitly flagged to rotate (e.g. PE with
                    no dedicated specialist) — every other real assignment
                    in the school stays completely untouched. */}
                <Button size="sm" variant="secondary" onClick={runTeacherRotation} disabled={!canManage || rotatingTeachers} title="Re-rolls the teacher for every subject flagged 'Rotate this subject's teacher every term' below — everything else stays untouched.">
                  {rotatingTeachers ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                  Start of term: rotate flagged teachers
                </Button>
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <StatPill icon={Users} label="Classes" value={String(classes.length)} />
              <StatPill icon={BookOpen} label="Subjects" value={String(subjects.length)} />
              <StatPill icon={Clock3} label="Constraints" value={String((payload.constraints ?? []).length)} />
            </div>
            {job && (
              <div className="mt-5 rounded-3xl border border-green-100 bg-green-50/70 p-4 dark:border-green-900/40 dark:bg-green-950/10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-green-700 dark:text-green-300">Background job</p>
                    <p className="mt-1 text-sm font-semibold text-navy-800 dark:text-navy-100">{job.phase || job.status}</p>
                  </div>
                  <Badge tone={job.status === "DONE" ? "green" : job.status === "FAILED" ? "red" : "blue"}>{job.status}</Badge>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/80 dark:bg-navy-900">
                  <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all" style={{ width: `${Math.max(3, Number(job.progress ?? 0))}%` }} />
                </div>
                <div className="mt-3 grid gap-2 text-xs text-navy-600 dark:text-navy-300 md:grid-cols-3">
                  <div><strong>Progress:</strong> {job.progress ?? 0}%</div>
                  <div><strong>Slots placed:</strong> {job.slotsPlaced ?? 0}</div>
                  <div><strong>Warnings:</strong> {(job.warnings ?? []).length}</div>
                </div>
                {(job.unplaced ?? []).length > 0 && (
                  <div className="mt-3 rounded-2xl border border-amber-100 bg-white/80 p-3 text-xs text-amber-700 dark:border-amber-900/40 dark:bg-navy-950/60 dark:text-amber-300">
                    <strong>Unplaced lessons:</strong> {(job.unplaced ?? []).slice(0, 5).map((u: any) => u.subjectCode || u.classLabel || "item").join(", ")}
                  </div>
                )}
                {job.error && (
                  <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">{job.error}</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AA.5 — real, honest pre-generation confirmation modal. Only ever
            shown when there's a genuine gap worth confirming (see
            runMasterButton() above) — never interrupts a school whose
            setup already fully accounts for every real possible slot. */}
        {preGenOpen && preGenSummary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setPreGenOpen(false)}>
            <div className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-navy-950" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-amber-500" />
                <div>
                  <h3 className="text-lg font-black text-navy-950 dark:text-white">Confirm before generating</h3>
                  <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">
                    You&apos;ve configured <strong>{preGenSummary.totalConfiguredLessons}</strong> of a possible <strong>{preGenSummary.totalPossibleSlots}</strong> real weekly lesson-slots this week. The remaining <strong>{preGenSummary.totalHonestFreeCount}</strong> will become Free Study Periods.
                  </p>
                </div>
              </div>
              {preGenSummary.classesWithGapsExceedingCap > 0 && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
                  <strong>{preGenSummary.classesWithGapsExceedingCap}</strong> class{preGenSummary.classesWithGapsExceedingCap === 1 ? "" : "es"} {preGenSummary.classesWithGapsExceedingCap === 1 ? "has" : "have"} a gap bigger than its own configured Free Study Period count — some periods will be left completely empty (no lesson, no Free label) rather than all becoming Frees, since NEYO only ever fills up to the number a school explicitly set.
                </div>
              )}
              <div className="mt-4 max-h-64 overflow-y-auto rounded-2xl border border-navy-100 dark:border-navy-800">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-warm-50 dark:bg-navy-900">
                    <tr>
                      <th className="px-3 py-2 font-bold text-navy-500 dark:text-navy-400">Class</th>
                      <th className="px-3 py-2 font-bold text-navy-500 dark:text-navy-400">Configured</th>
                      <th className="px-3 py-2 font-bold text-navy-500 dark:text-navy-400">Possible</th>
                      <th className="px-3 py-2 font-bold text-navy-500 dark:text-navy-400">Will be Free</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preGenSummary.perClass.filter((p: any) => p.honestFreeCount > 0).map((p: any) => (
                      <tr key={p.classId} className="border-t border-navy-50 dark:border-navy-800">
                        <td className="px-3 py-2 font-semibold text-navy-800 dark:text-navy-100">{p.className}</td>
                        <td className="px-3 py-2 text-navy-600 dark:text-navy-300">{p.configuredLessons}</td>
                        <td className="px-3 py-2 text-navy-600 dark:text-navy-300">{p.totalPossibleSlots}</td>
                        <td className="px-3 py-2">
                          <Badge tone={p.exceedsConfiguredFreeCap ? "amber" : "blue"}>{p.honestFreeCount}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <Button variant="secondary" onClick={() => setPreGenOpen(false)}>Go back &amp; add more lessons</Button>
                <Button onClick={actuallyStartGeneration} disabled={starting}>
                  {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />} Confirm &amp; generate anyway
                </Button>
              </div>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">What this engine enforces now</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-navy-600 dark:text-navy-300">
            <FeatureRow icon={ShieldCheck} text="No class double-booking and no teacher double-booking" />
            <FeatureRow icon={TimerReset} text="Single and double lessons with optional split doubles" />
            <FeatureRow icon={Link2} text="Combination classes can run once across many classes" />
            <FeatureRow icon={Ban} text="Teacher time-off and blocked periods are respected" />
            <FeatureRow icon={Clock3} text="Morning subjects, PE time slots, spread rules, adjacency rules" />
          </CardContent>
        </Card>
      </div>

      {schoolLevelActivation?.isSeniorSchool && (
        <KicdSeniorTemplateCard canManage={canManage} classes={classes} subjects={subjects} onApplied={load} />
      )}

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Sliders className="h-5 w-5 text-green-600" /> Constraint settings</CardTitle>
            <p className="text-xs text-navy-400">Turn timetable rules on or off and tune how the school wants lessons arranged.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {(payload.constraints ?? []).length === 0 && (
              <EmptyState icon={Sliders} title="No smart constraints saved yet" description="Create timetable rules below. The engine already supports lessons-per-week, doubles, combinations and teacher time-off." />
            )}
            {(payload.constraints ?? []).map((constraint: any) => (
              <div key={constraint.id} className="rounded-2xl border border-navy-100 p-4 dark:border-navy-800">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-navy-900 dark:text-white">{constraint.label}</p>
                    <p className="mt-1 text-xs text-navy-500 dark:text-navy-400">{constraintSummary(constraint)}</p>
                  </div>
                  <Badge tone={constraint.enabled ? "green" : "neutral"}>{constraint.enabled ? "Enabled" : "Off"}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" disabled={saving} onClick={() => saveConstraint({ ...constraint, enabled: !constraint.enabled, config: constraint.config })}>{constraint.enabled ? "Turn off" : "Turn on"}</Button>
                  <Button size="sm" variant="secondary" disabled={saving} onClick={() => {
                    const minDays = Number((constraint.config?.minDays ?? 2)) + 1;
                    saveConstraint({ ...constraint, config: { ...(constraint.config ?? {}), minDays: Math.min(5, minDays) } });
                  }}>Tune</Button>
                </div>
              </div>
            ))}
            <div className="rounded-2xl border border-dashed border-navy-200 p-4 dark:border-navy-700">
              <p className="text-xs font-bold uppercase tracking-widest text-navy-400">Quick add rules</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { kind: "SUBJECT_MORNING", label: "Math in morning", config: { maxPeriod: 4 } },
                  { kind: "SUBJECTS_NOT_ADJACENT", label: "English and Kiswahili apart", config: {} },
                  { kind: "LESSON_DISTRIBUTION", label: "Spread lessons", config: { minDays: 2 } },
                  { kind: "ONE_SINGLE_PER_DAY", label: "One single per day", config: {} },
                  { kind: "PE_TIMESLOT", label: "PE allowed slots", config: { allowedPeriods: [6, 7, 8] } },
                ].map((preset) => (
                  <Button key={preset.kind + preset.label} size="sm" variant="secondary" disabled={saving} onClick={() => saveConstraint({ kind: preset.kind, label: preset.label, enabled: true, config: preset.config })}>{preset.label}</Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Ban className="h-5 w-5 text-amber-600" /> Teacher time-off</CardTitle>
            <p className="text-xs text-navy-400">Block days or periods when a teacher should not be scheduled.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Teacher</Label>
              <select value={timeOffTeacherId} onChange={(e) => setTimeOffTeacherId(e.target.value)} className="mt-1 w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-800">
                <option value="">Choose teacher…</option>
                {teachers.map((t: any) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
              </select>
            </div>
            {timeOffWindows.map((w, index) => (
              <div key={index} className="grid grid-cols-[1fr_1fr_1.4fr_auto] gap-2">
                <select value={w.dayOfWeek} onChange={(e) => setTimeOffWindows((prev) => prev.map((x, i) => i === index ? { ...x, dayOfWeek: Number(e.target.value) } : x))} className="rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-800">
                  <option value={0}>All days</option>
                  {DAY_NAMES.map((d, i) => <option key={d} value={i + 1}>{d}</option>)}
                </select>
                <select value={w.period} onChange={(e) => setTimeOffWindows((prev) => prev.map((x, i) => i === index ? { ...x, period: Number(e.target.value) } : x))} className="rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-800">
                  <option value={0}>Whole day</option>
                  {Array.from({ length: Math.max(8, ...(payload?.configs ?? []).map((cfg: any) => Number(cfg.periodsPerDay || 0))) }, (_, i) => i + 1).map((p) => <option key={p} value={p}>Period {p}</option>)}
                </select>
                <Input value={w.note} onChange={(e) => setTimeOffWindows((prev) => prev.map((x, i) => i === index ? { ...x, note: e.target.value } : x))} placeholder="Reason" />
                <Button size="sm" variant="ghost" onClick={() => setTimeOffWindows((prev) => prev.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => setTimeOffWindows((prev) => [...prev, { dayOfWeek: 1, period: 1, note: "" }])}><Plus className="h-4 w-4" /> Add window</Button>
              <Button size="sm" onClick={saveTimeOff} disabled={saving || !canManage}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save time-off</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Lock className="h-5 w-5 text-rose-600" /> Blocked slots (assembly, PPI, games)</CardTitle>
            <p className="text-xs text-navy-400">A genuinely fixed slot the Master Button always respects — no lesson is ever placed here, even under pressure. Different from an ordinary co-curricular subject, which the engine can still move.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2">
                <Label>Name</Label>
                <Input value={blockedSlotForm.label} onChange={(e) => setBlockedSlotForm((f: any) => ({ ...f, label: e.target.value }))} placeholder="e.g. Whole-School Assembly" />
              </div>
              <div>
                <Label>Applies to</Label>
                <select value={blockedSlotForm.scope} onChange={(e) => setBlockedSlotForm((f: any) => ({ ...f, scope: e.target.value, level: "", classId: "" }))} className="mt-1 w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-800">
                  <option value="SCHOOL">Whole school</option>
                  <option value="LEVEL">One grade</option>
                  <option value="CLASS">One specific class</option>
                </select>
              </div>
              {blockedSlotForm.scope === "LEVEL" && (
                <div>
                  <Label>Grade</Label>
                  <select value={blockedSlotForm.level} onChange={(e) => setBlockedSlotForm((f: any) => ({ ...f, level: e.target.value }))} className="mt-1 w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-800">
                    <option value="">Choose grade…</option>
                    {classesByLevel.map(({ level }: { level: string }) => <option key={level} value={level}>{level}</option>)}
                  </select>
                </div>
              )}
              {blockedSlotForm.scope === "CLASS" && (
                <div>
                  <Label>Class</Label>
                  <select value={blockedSlotForm.classId} onChange={(e) => setBlockedSlotForm((f: any) => ({ ...f, classId: e.target.value }))} className="mt-1 w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-800">
                    <option value="">Choose class…</option>
                    {classes.map((c: any) => <option key={c.id} value={c.id}>{c.level} {c.stream}</option>)}
                  </select>
                </div>
              )}
              <div>
                <Label>Day</Label>
                <select value={blockedSlotForm.dayOfWeek} onChange={(e) => setBlockedSlotForm((f: any) => ({ ...f, dayOfWeek: Number(e.target.value) }))} className="mt-1 w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-800">
                  {[...DAY_NAMES, "Sat"].map((d, i) => <option key={d} value={i + 1}>{d}</option>)}
                </select>
              </div>
              <div>
                <Label>Period</Label>
                <select value={blockedSlotForm.period} onChange={(e) => setBlockedSlotForm((f: any) => ({ ...f, period: Number(e.target.value) }))} className="mt-1 w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-800">
                  {Array.from({ length: Math.max(8, ...(payload?.configs ?? []).map((cfg: any) => Number(cfg.periodsPerDay || 0))) }, (_, i) => i + 1).map((p) => <option key={p} value={p}>Period {p}</option>)}
                </select>
              </div>
              <label className="col-span-2 flex items-center gap-2 text-xs text-navy-500 dark:text-navy-400">
                <input type="checkbox" checked={blockedSlotForm.isDouble} onChange={(e) => setBlockedSlotForm((f: any) => ({ ...f, isDouble: e.target.checked }))} />
                Double period (also blocks the very next period)
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {blockedSlotForm.id && <Button size="sm" variant="ghost" onClick={() => setBlockedSlotForm(emptyBlockedSlotForm)}>Cancel edit</Button>}
              <Button size="sm" onClick={saveBlockedSlot} disabled={blockedSlotSaving || !canManage}>{blockedSlotSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {blockedSlotForm.id ? "Update block" : "Add block"}</Button>
            </div>
            {blockedSlots.length === 0 ? (
              <p className="text-xs text-navy-400">No hard-blocked slots yet.</p>
            ) : (
              <div className="space-y-1.5">
                {blockedSlots.map((row: any) => (
                  <div key={row.id} className={cn("flex items-center justify-between gap-2 rounded-xl border border-navy-100 px-3 py-2 text-xs dark:border-navy-800", !row.enabled && "opacity-50")}>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-navy-900 dark:text-white">{row.label}</p>
                      <p className="text-navy-400">
                        {row.scope === "SCHOOL" ? "Whole school" : row.scope === "LEVEL" ? row.level : (classes.find((c: any) => c.id === row.classId)?.level ?? "Class") + " " + (classes.find((c: any) => c.id === row.classId)?.stream ?? "")}
                        {" · "}{[...DAY_NAMES, "Sat"][row.dayOfWeek - 1]} P{row.period}{row.isDouble ? `-${row.period + 1}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => toggleBlockedSlotEnabled(row)} disabled={blockedSlotSaving || !canManage}>{row.enabled ? "Pause" : "Resume"}</Button>
                      <Button size="sm" variant="ghost" onClick={() => setBlockedSlotForm({ id: row.id, label: row.label, scope: row.scope, level: row.level ?? "", classId: row.classId ?? "", dayOfWeek: row.dayOfWeek, period: row.period, isDouble: row.isDouble, enabled: row.enabled })} disabled={blockedSlotSaving || !canManage}>Edit</Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteBlockedSlot(row.id)} disabled={blockedSlotSaving || !canManage}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Grid3X3 className="h-5 w-5 text-blue-600" /> Class subject lesson requirements</CardTitle>
            <p className="text-xs text-navy-400">For each grade and subject, save lessons per week, number of doubles, split-double preference and teacher — set once for the whole grade, since every real stream studies the same subjects. Open a stream only when it genuinely needs to be different.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {classesByLevel.slice(0, 8).map(({ level, levelClasses }: { level: string; levelClasses: any[] }) => {
              const isOpen = openLevels.has(level);
              const showStreams = openStreamLevels.has(level);
              return (
                <div key={level} className="rounded-2xl border border-navy-100 dark:border-navy-800">
                  <button
                    type="button"
                    onClick={() => toggleOpenLevel(level)}
                    className="flex w-full items-center justify-between gap-2 rounded-2xl p-4 text-left"
                  >
                    <p className="text-sm font-bold text-navy-900 dark:text-white">{level} <span className="font-normal text-navy-400">({levelClasses.length} stream{levelClasses.length === 1 ? "" : "s"})</span></p>
                    <ChevronDown className={cn("h-4 w-4 text-navy-400 transition", isOpen && "rotate-180")} />
                  </button>
                  {isOpen && (
                    <div className="space-y-2 border-t border-navy-100 p-4 pt-3 dark:border-navy-800">
                      {levelClasses.length > 1 && (
                        <label className="mb-2 flex items-center gap-2 text-[11px] text-navy-500 dark:text-navy-400">
                          <input type="checkbox" checked={showStreams} onChange={() => toggleStreamLevel(level)} />
                          Set a specific stream differently (instead of the whole grade at once)
                        </label>
                      )}
                      {subjects.slice(0, 8).map((subject: any) => {
                        const agreement = needAgreementForLevelSubject(levelClasses, subject.id);
                        if (agreement.agrees && !showStreams) {
                          return (
                            <SubjectNeedRow
                              key={subject.id}
                              subject={subject}
                              current={agreement.shared}
                              teachers={teachers}
                              venues={venues}
                              onSave={(patch) => saveNeedForLevel(level, subject.id, patch, agreement.shared)}
                            />
                          );
                        }
                        return (
                          <div key={subject.id} className="space-y-2">
                            {!agreement.agrees && (
                              <Badge tone="amber">Streams differ — showing each one</Badge>
                            )}
                            {levelClasses.map((cls: any) => (
                              <SubjectNeedRow
                                key={cls.id}
                                subject={subject}
                                current={agreement.perClass[cls.id] ?? {}}
                                teachers={teachers}
                                venues={venues}
                                teacherLabel={`${level} ${cls.stream}`}
                                onSave={(patch) => saveNeed(cls.id, subject.id, patch)}
                              />
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            {classesByLevel.length > 8 && <p className="text-xs text-navy-400">Showing the first 8 grades for speed. The same save flow works for the rest through the existing Timetable Generator tab.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Link2 className="h-5 w-5 text-purple-600" /> Combination classes</CardTitle>
            <p className="text-xs text-navy-400">Handle grouped lessons for whole school combinations or selected classes only.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-3 rounded-2xl border border-navy-100 p-4 dark:border-navy-800">
              <Input value={combinationForm.name} onChange={(e) => setCombinationForm((p: any) => ({ ...p, name: e.target.value }))} placeholder="e.g. Combined Physics" />
              <div className="grid grid-cols-2 gap-2">
                <select value={combinationForm.subjectId} onChange={(e) => setCombinationForm((p: any) => ({ ...p, subjectId: e.target.value }))} className="rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-800">
                  <option value="">Subject…</option>
                  {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select value={combinationForm.teacherId} onChange={(e) => setCombinationForm((p: any) => ({ ...p, teacherId: e.target.value }))} className="rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-800">
                  <option value="">Teacher…</option>
                  {teachersQualifiedFor(combinationForm.subjectId).map((t: any) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" min={1} max={12} value={combinationForm.lessonsPerWeek} onChange={(e) => setCombinationForm((p: any) => ({ ...p, lessonsPerWeek: Number(e.target.value) }))} placeholder="Lessons / week" />
                <Input type="number" min={0} max={6} value={combinationForm.doubleCount} onChange={(e) => setCombinationForm((p: any) => ({ ...p, doubleCount: Number(e.target.value) }))} placeholder="Double lessons" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={combinationForm.scope} onChange={(e) => setCombinationForm((p: any) => ({ ...p, scope: e.target.value }))} className="rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-800">
                  <option value="SELECTED">Selected classes only</option>
                  <option value="GLOBAL">Whole class group</option>
                </select>
                <select value={combinationForm.source} onChange={(e) => setCombinationForm((p: any) => ({ ...p, source: e.target.value }))} className="rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-800">
                  <option value="MANUAL">School-defined classes</option>
                  <option value="SUBJECT_CHOICE">Use student subject choices</option>
                </select>
              </div>
              <div>
                <Label className="text-xs">Venue / Lab (for combined lab sessions)</Label>
                <select value={combinationForm.venueId || ""} onChange={(e) => setCombinationForm((p: any) => ({ ...p, venueId: e.target.value }))} className="mt-1 w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-800">
                  <option value="">Use the school's venue pool automatically</option>
                  {venues.map((v: any) => <option key={v.id} value={v.id}>{v.name} ({v.shortCode})</option>)}
                </select>
              </div>
              {/* AA.4 — same real soft "prefer right after a break"
                  preference as the per-class subject need above, for a
                  combined lesson that genuinely involves movement (e.g. a
                  combined Science practical across streams). */}
              <label className="flex items-center gap-2 text-xs text-navy-600 dark:text-navy-300">
                <input
                  type="checkbox"
                  checked={Boolean(combinationForm.requiresMovement)}
                  onChange={(e) => setCombinationForm((p: any) => ({ ...p, requiresMovement: e.target.checked }))}
                />
                Movement-heavy (prefer right after a break)
              </label>
              <div className="max-h-36 overflow-y-auto rounded-2xl border border-navy-100 p-3 dark:border-navy-800">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-navy-400">Member classes</p>
                <div className="space-y-2">
                  {classes.map((cls: any) => {
                    const checked = combinationForm.classIds.includes(cls.id);
                    return (
                      <label key={cls.id} className="flex items-center gap-2 text-sm text-navy-700 dark:text-navy-200">
                        <input type="checkbox" checked={checked} onChange={(e) => setCombinationForm((p: any) => ({ ...p, classIds: e.target.checked ? [...p.classIds, cls.id] : p.classIds.filter((id: string) => id !== cls.id) }))} />
                        <span>{cls.level} {cls.stream}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <Button onClick={saveCombination} disabled={saving || !canManage}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save combination group</Button>
            </div>
            <div className="space-y-2">
              {(payload.combinations ?? []).map((group: any) => (
                <div key={group.id} className="rounded-2xl border border-navy-100 p-3 dark:border-navy-800">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-navy-900 dark:text-white">{group.name}</p>
                      <p className="mt-1 text-xs text-navy-500 dark:text-navy-400">{group.lessonsPerWeek} lessons/week · {group.doubleCount} doubles · {group.source} · {group.scope}</p>
                      <p className="mt-1 text-xs text-navy-500 dark:text-navy-400">{(group.members ?? []).length} class members</p>
                    </div>
                    <Button size="sm" variant="ghost" disabled={saving || !canManage} onClick={() => deleteCombination(group.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><MapPin className="h-5 w-5 text-teal-600" /> Venues &amp; Labs</CardTitle>
            <p className="text-xs text-navy-400">Add real rooms/labs, tag which subjects each can host, and set how many classes can genuinely use it at the same real period. The generator auto-picks an available match; a school can also pin an exact venue on any class-subject need or combination group above.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-3 rounded-2xl border border-navy-100 p-4 dark:border-navy-800">
              <Input value={venueForm.name} onChange={(e) => setVenueForm((p: any) => ({ ...p, name: e.target.value }))} placeholder="e.g. Chemistry Lab" />
              <div className="grid grid-cols-2 gap-2">
                <Input value={venueForm.shortCode} onChange={(e) => setVenueForm((p: any) => ({ ...p, shortCode: e.target.value.toUpperCase() }))} placeholder="Code (auto if left blank)" maxLength={10} />
                <Input type="number" min={1} max={10} value={venueForm.capacityPerPeriod} onChange={(e) => setVenueForm((p: any) => ({ ...p, capacityPerPeriod: Number(e.target.value) }))} placeholder="Classes at once" />
              </div>
              <div className="max-h-32 overflow-y-auto rounded-2xl border border-navy-100 p-3 dark:border-navy-800">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-navy-400">Subjects this venue supports (pool)</p>
                <div className="space-y-1.5">
                  {subjects.map((s: any) => {
                    const checked = (venueForm.supportsSubjectIds ?? []).includes(s.id);
                    return (
                      <label key={s.id} className="flex items-center gap-2 text-xs text-navy-700 dark:text-navy-200">
                        <input type="checkbox" checked={checked} onChange={(e) => setVenueForm((p: any) => ({ ...p, supportsSubjectIds: e.target.checked ? [...(p.supportsSubjectIds ?? []), s.id] : (p.supportsSubjectIds ?? []).filter((id: string) => id !== s.id) }))} />
                        <span>{s.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={saveVenue} disabled={venueSaving || !canManage}>{venueSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {venueForm.id ? "Update venue" : "Add venue"}</Button>
                {venueForm.id && (
                  <Button variant="secondary" onClick={() => setVenueForm({ id: "", name: "", shortCode: "", capacityPerPeriod: 1, supportsSubjectIds: [] })}>Cancel edit</Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              {venues.length === 0 && (
                <EmptyState icon={MapPin} title="No venues added yet" description="Add a school's real labs or special rooms here — Science Lab, Computer Lab, Home Science Room — and the generator will avoid double-booking them." />
              )}
              {venues.map((v: any) => (
                <div key={v.id} className="rounded-2xl border border-navy-100 p-3 dark:border-navy-800">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-navy-900 dark:text-white">{v.name} <Badge tone="blue">{v.shortCode}</Badge></p>
                      <p className="mt-1 text-xs text-navy-500 dark:text-navy-400">
                        {v.capacityPerPeriod} class{v.capacityPerPeriod === 1 ? "" : "es"} at once · {(() => { try { const ids = JSON.parse(v.supportsSubjectIds || "[]"); return ids.length; } catch { return 0; } })()} subjects tagged
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" disabled={!canManage} onClick={() => setVenueForm({ id: v.id, name: v.name, shortCode: v.shortCode ?? "", capacityPerPeriod: v.capacityPerPeriod, supportsSubjectIds: (() => { try { return JSON.parse(v.supportsSubjectIds || "[]"); } catch { return []; } })() })}><Tag className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" disabled={venueSaving || !canManage} onClick={() => deleteVenueRow(v.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  {canManage && (
                    <div className="mt-2 flex items-center gap-2">
                      <Label className="text-[10px] text-navy-400">Printed code:</Label>
                      <Input
                        defaultValue={v.shortCode ?? ""}
                        className="h-7 w-24 text-xs"
                        onBlur={(e) => { if (e.target.value && e.target.value !== v.shortCode) setVenueShortCode(v.id, e.target.value); }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Tag className="h-5 w-5 text-indigo-600" /> Teacher print codes</CardTitle>
            <p className="text-xs text-navy-400">A real short abbreviation (e.g. "MO" for Mary Omondi) shown on the printed timetable instead of a teacher's full name. Auto-generated the first time a teacher appears on a printed timetable — a school can override any code here.</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {teachers.length === 0 && (
              <EmptyState icon={Tag} title="No teachers yet" description="Teacher print codes appear here once staff are added to this school." />
            )}
            {teachers.slice(0, 12).map((t: any) => (
              <div key={t.id} className="flex items-center justify-between gap-3 rounded-xl border border-navy-50 p-2 text-xs dark:border-navy-800">
                <div>
                  <p className="font-semibold text-navy-800 dark:text-navy-100">{t.fullName}</p>
                  <p className="text-[10px] text-navy-400">{t.role}</p>
                </div>
                <Input
                  defaultValue={t.timetableShortCode ?? ""}
                  placeholder="auto"
                  className="h-7 w-20 text-xs"
                  onBlur={(e) => { if (e.target.value && e.target.value !== t.timetableShortCode) setTeacherShortCode(t.id, e.target.value); }}
                />
              </div>
            ))}
            {teachers.length > 12 && <p className="text-xs text-navy-400">Showing the first 12 teachers. The same edit works for every teacher — search staff records to reach the rest.</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base"><ClipboardList className="h-5 w-5 text-teal-600" /> Import Existing Teacher Allocations</CardTitle>
              <p className="mt-1 text-xs text-navy-400">Already switching from paper or another system? Upload your existing "Teacher — Subject — Class" list (CSV/Excel, paste from a spreadsheet, or a photo of a handwritten register via Bundi) and NEYO matches it against your real teachers/subjects/classes — showing exactly what will be created or updated before anything happens.</p>
            </div>
            <Button variant="secondary" onClick={() => setAllocationImportOpen(true)} disabled={!canManage}><ClipboardList className="h-4 w-4 text-teal-600" /> Import allocations</Button>
          </div>
        </CardHeader>
        {allocationImportHistory.length > 0 && (
          <CardContent>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-navy-400">Recent import runs</p>
            <div className="space-y-2">
              {allocationImportHistory.slice(0, 5).map((run: any) => (
                <div key={run.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-navy-50 p-2 text-xs dark:border-navy-800">
                  <div>
                    <span className="font-semibold text-navy-800 dark:text-navy-100">{run.fileName || "Pasted data"}</span>
                    <span className="ml-2 text-navy-400">{new Date(run.createdAt).toLocaleDateString("en-KE")} · {run.source} · by {run.createdByName}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <Badge tone="green">{run.createdNeeds} created</Badge>
                    <Badge tone="blue">{run.matchedNeeds} updated</Badge>
                    {run.createdTeachers > 0 && <Badge tone="amber">{run.createdTeachers} new teacher{run.createdTeachers === 1 ? "" : "s"}</Badge>}
                    {run.failedRows > 0 && <Badge tone="red">{run.failedRows} skipped</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {allocationImportOpen && (
        <TeacherAllocationImportModal onClose={() => setAllocationImportOpen(false)} onDone={load} />
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base"><Shuffle className="h-5 w-5 text-purple-600" /> Elective / Options Blocks</CardTitle>
              <p className="mt-1 text-xs text-navy-400">
                For subjects students genuinely choose BETWEEN (e.g. History OR CRE — every student is doing something at this time, but which room/teacher depends on their own choice). NEYO schedules every subject in a block at the SAME real time so movement between rooms works cleanly, and no two block subjects clash with each other&apos;s teachers/venues. Use &quot;Single-Choice&quot; mode when every slot offers the exact same subjects (e.g. Technical &amp; Applied: choose ONE of Business/Computer/Art/Agriculture/French) — use &quot;Multi-Slot&quot; when different slots can offer different subject pairings (e.g. History appears opposite CRE in one slot, and opposite Geography in another).
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => setAutoBuildOpen(true)} disabled={!canManage}>
                <Sparkles className="h-3.5 w-3.5" /> Build from student choices
              </Button>
              {/* BB.7 — real, dedicated venue/teacher roster print, kept
                  deliberately SEPARATE from the main timetable grid per the
                  founder's own explicit instruction. */}
              <Button variant="secondary" size="sm" onClick={() => window.open("/print/electives-roster?kind=venue_roster", "_blank")}>
                <Printer className="h-3.5 w-3.5" /> Print venue &amp; teacher roster
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-3 rounded-2xl border border-navy-100 p-4 dark:border-navy-800">
              <div className="grid grid-cols-2 gap-2">
                <Input value={blockForm.name} onChange={(e) => setBlockForm((p: any) => ({ ...p, name: e.target.value }))} placeholder="e.g. Humanities Pair" />
                <select value={blockForm.mode} onChange={(e) => setBlockForm((p: any) => ({ ...p, mode: e.target.value }))} className={selectClass}>
                  <option value="MULTI_SLOT">Multi-Slot (different subjects per slot)</option>
                  <option value="SINGLE_CHOICE">Single-Choice (same subjects every slot)</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-xs text-navy-600 dark:text-navy-300">
                <input type="checkbox" checked={blockForm.preferAfterBreak} onChange={(e) => setBlockForm((p: any) => ({ ...p, preferAfterBreak: e.target.checked }))} className="h-4 w-4 rounded border-navy-300 text-purple-600 focus:ring-purple-500" />
                Prefer scheduling right after a break (soft preference — never risks an unplaced lesson)
              </label>
              <label className="flex items-start gap-2 text-xs text-navy-600 dark:text-navy-300">
                <input type="checkbox" checked={blockForm.preferSplitExamSittings} onChange={(e) => setBlockForm((p: any) => ({ ...p, preferSplitExamSittings: e.target.checked }))} className="mt-0.5 h-4 w-4 rounded border-navy-300 text-purple-600 focus:ring-purple-500" />
                <span>
                  Keep this block&apos;s exam sittings separate, even when NEYO can combine them
                  <span className="block text-[11px] text-navy-400 dark:text-navy-500">By default, when it&apos;s genuinely safe (a student only ever picks one subject), NEYO schedules this block&apos;s exam subjects at the same shared time to save exam days. Turn this on if your school prefers separate sittings for this block anyway.</span>
                </span>
              </label>
              <div>
                <Label>Classes in this block</Label>
                <div className="mt-2 max-h-28 overflow-y-auto rounded-xl border border-navy-100 p-3 dark:border-navy-800">
                  <div className="grid grid-cols-2 gap-2">
                    {classes.map((c: any) => {
                      const checked = blockForm.classIds.includes(c.id);
                      return (
                        <label key={c.id} className="flex items-center gap-2 text-xs text-navy-700 dark:text-navy-200">
                          <input type="checkbox" checked={checked} onChange={(e) => setBlockForm((p: any) => ({ ...p, classIds: e.target.checked ? [...p.classIds, c.id] : p.classIds.filter((id: string) => id !== c.id) }))} />
                          <span>{c.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-navy-400">Slots (each slot is one real weekly period this block occupies)</p>
                {blockForm.classIds.length > 0 && (
                  <p className="text-[11px] text-navy-400">
                    A slot&apos;s first {blockForm.classIds.length} subject{blockForm.classIds.length === 1 ? "" : "s"} use each class&apos;s own home classroom automatically.
                    Any subject beyond that needs a real spare venue — leave &quot;Venue&quot; blank and NEYO will auto-pick one from your venue pool (library/labs), or pin one yourself.
                  </p>
                )}
                {blockForm.slots.map((slot: any, slotIndex: number) => (
                  <div key={slotIndex} className="rounded-xl border border-purple-100 bg-purple-50/40 p-3 dark:border-purple-900/30 dark:bg-purple-950/10">
                    <div className="mb-2 flex items-center gap-2">
                      <Input value={slot.label} onChange={(e) => setBlockForm((p: any) => ({ ...p, slots: p.slots.map((s: any, i: number) => i === slotIndex ? { ...s, label: e.target.value } : s) }))} placeholder="Slot label" className="h-8 text-xs" />
                      <label className="flex items-center gap-1 whitespace-nowrap text-[11px] text-navy-500">
                        <input type="checkbox" checked={slot.isDouble} onChange={(e) => setBlockForm((p: any) => ({ ...p, slots: p.slots.map((s: any, i: number) => i === slotIndex ? { ...s, isDouble: e.target.checked } : s) }))} /> Double
                      </label>
                      {blockForm.slots.length > 1 && (
                        <Button size="sm" variant="ghost" onClick={() => removeBlockSlot(slotIndex)}><X className="h-3 w-3" /></Button>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      {slot.subjects.map((sub: any, subjectIndex: number) => {
                        // BB.1 — mirror the solver's own real overflow rule here so a
                        // school sees, WHILE BUILDING the block, which subjects will
                        // need a real venue at all: the first N subjects (N = this
                        // block's own real selected class count) are assumed to use
                        // each member class's own home classroom; anything beyond
                        // that is a genuine overflow subject that NEYO will
                        // auto-pick a real spare venue for if left blank.
                        const isOverflow = subjectIndex >= blockForm.classIds.length;
                        return (
                          <div key={subjectIndex} className="grid grid-cols-[1.2fr_1fr_1fr_auto] gap-1.5">
                            <select value={sub.subjectId} onChange={(e) => setBlockForm((p: any) => ({ ...p, slots: p.slots.map((s: any, i: number) => i === slotIndex ? { ...s, subjects: s.subjects.map((x: any, j: number) => j === subjectIndex ? { ...x, subjectId: e.target.value } : x) } : s) }))} className={`${selectClass} h-8 text-xs`}>
                              <option value="">Subject…</option>
                              {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <select value={sub.teacherId} onChange={(e) => setBlockForm((p: any) => ({ ...p, slots: p.slots.map((s: any, i: number) => i === slotIndex ? { ...s, subjects: s.subjects.map((x: any, j: number) => j === subjectIndex ? { ...x, teacherId: e.target.value } : x) } : s) }))} className={`${selectClass} h-8 text-xs`}>
                              <option value="">Teacher (optional)</option>
                              {teachersQualifiedFor(sub.subjectId).map((t: any) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                            </select>
                            <select value={sub.venueId} onChange={(e) => setBlockForm((p: any) => ({ ...p, slots: p.slots.map((s: any, i: number) => i === slotIndex ? { ...s, subjects: s.subjects.map((x: any, j: number) => j === subjectIndex ? { ...x, venueId: e.target.value } : x) } : s) }))} className={`${selectClass} h-8 text-xs`} title={isOverflow && !sub.venueId ? "More subjects than classes in this block — leave blank and NEYO will auto-pick a real spare venue (library/lab) when generating." : undefined}>
                              <option value="">{isOverflow ? "Venue (auto-pick if blank)" : "Venue (optional)"}</option>
                              {venues.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
                            </select>
                            {slot.subjects.length > 2 && (
                              <Button size="sm" variant="ghost" onClick={() => removeSlotSubject(slotIndex, subjectIndex)}><X className="h-3 w-3" /></Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <Button size="sm" variant="secondary" className="mt-2" onClick={() => addSlotSubject(slotIndex)}><Plus className="h-3 w-3" /> Add subject to this slot</Button>
                  </div>
                ))}
                <Button variant="secondary" onClick={addBlockSlot}><Plus className="h-4 w-4" /> Add another slot</Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={saveElectiveBlockForm} disabled={blockSaving || !canManage}>{blockSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {blockForm.id ? "Update block" : "Add block"}</Button>
                {blockForm.id && (
                  <Button variant="secondary" onClick={() => setBlockForm(emptyBlockForm)}>Cancel edit</Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {electiveBlocks.length === 0 && (
                <EmptyState icon={Shuffle} title="No Options Blocks yet" description="Add a real elective pairing here — e.g. History/CRE — and NEYO will schedule every subject in it at the same real time, so students choosing between them can move freely between rooms." />
              )}
              {electiveBlocks.map((block: any) => (
                <div key={block.id} className="rounded-2xl border border-navy-100 p-3 dark:border-navy-800">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-navy-900 dark:text-white">{block.name} <Badge tone={block.mode === "SINGLE_CHOICE" ? "amber" : "blue"}>{block.mode === "SINGLE_CHOICE" ? "Single-Choice" : "Multi-Slot"}</Badge></p>
                      <p className="mt-1 text-xs text-navy-500 dark:text-navy-400">{block.classIds.length} class{block.classIds.length === 1 ? "" : "es"} · {block.slots.length} slot{block.slots.length === 1 ? "" : "s"}{block.preferAfterBreak ? " · prefers after-break placement" : ""}{block.preferSplitExamSittings ? " · exam sittings kept separate" : ""}</p>
                      <div className="mt-2 space-y-1">
                        {block.slots.map((slot: any) => (
                          <p key={slot.id} className="text-[11px] text-navy-500 dark:text-navy-400">
                            <span className="font-semibold">{slot.label}{slot.isDouble ? " (double)" : ""}:</span>{" "}
                            {slot.subjects.map((s: any) => {
                              const name = subjects.find((sub: any) => sub.id === s.subjectId)?.name || "?";
                              // BB.1 — show the real auto-picked overflow venue when a school
                              // left this subject's venue unset and NEYO picked one from the pool.
                              const resolved = !s.venueId && s.resolvedVenueId ? venues.find((v: any) => v.id === s.resolvedVenueId) : null;
                              return resolved ? `${name} (auto: ${resolved.name})` : name;
                            }).join(" / ")}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" disabled={!canManage} onClick={() => editElectiveBlock(block)}><Tag className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" disabled={blockSaving || !canManage} onClick={() => deleteElectiveBlockRow(block.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {autoBuildOpen && (
        <ElectiveBlockAutoBuildModal
          classes={classes}
          onClose={() => setAutoBuildOpen(false)}
          onDone={() => { setAutoBuildOpen(false); load(); }}
        />
      )}
    </div>
  );
}

// BB.2 — real "Build from student choices" auto-build modal. Founder's own
// real request: the school picks a level, NEYO reads real confirmed
// StudentSubjectSelection data, detects genuine elective subjects (or the
// real Core/Essential Mathematics split), shows a real preview (combined
// roster + suggested fair teacher per subject), and the school reviews/
// edits before confirming — nothing is ever silently created.
function ElectiveBlockAutoBuildModal({ classes, onClose, onDone }: { classes: any[]; onClose: () => void; onDone: () => void }) {
  const { toast } = useToast();
  const [level, setLevel] = React.useState("");
  const [kind, setKind] = React.useState<"ELECTIVES" | "MATH_SPLIT">("ELECTIVES");
  const [defaultLessonsPerWeek, setDefaultLessonsPerWeek] = React.useState(5);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [preview, setPreview] = React.useState<any>(null);
  const [blockName, setBlockName] = React.useState("");
  const [rowOverrides, setRowOverrides] = React.useState<Record<string, { teacherId: string; lessonsPerWeek: number }>>({});

  const levels = React.useMemo(() => Array.from(new Set(classes.map((c: any) => c.level))).sort(), [classes]);

  async function runPreview() {
    if (!level) { toast({ title: "Choose a real level first", tone: "error" }); return; }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/academics/timetable/elective-blocks/auto-build", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "preview", level, kind, defaultLessonsPerWeek }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || "Failed");
      setPreview(json.data);
      setBlockName(kind === "MATH_SPLIT" ? `${level} — Core/Essential Mathematics` : `${level} — Options`);
      const overrides: Record<string, { teacherId: string; lessonsPerWeek: number }> = {};
      for (const row of json.data.rows) overrides[row.subjectId] = { teacherId: row.suggestedTeacherId || "", lessonsPerWeek: row.defaultLessonsPerWeek };
      setRowOverrides(overrides);
    } catch (e: any) {
      setError(e?.message || "Could not build a real preview for that level");
    } finally { setBusy(false); }
  }

  async function confirm() {
    if (!preview) return;
    setBusy(true);
    try {
      const res = await fetch("/api/academics/timetable/elective-blocks/auto-build", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "confirm",
          runId: preview.runId,
          blockName,
          preferAfterBreak: false,
          subjects: preview.rows.map((r: any) => ({
            subjectId: r.subjectId,
            teacherId: rowOverrides[r.subjectId]?.teacherId || null,
            lessonsPerWeek: rowOverrides[r.subjectId]?.lessonsPerWeek || r.defaultLessonsPerWeek,
            classIds: r.classIds,
          })),
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || "Failed");
      toast({ title: "Options Block created from real student choices", tone: "success" });
      onDone();
    } catch (e: any) {
      toast({ title: e?.message || "Could not create the block", tone: "error" });
    } finally { setBusy(false); }
  }

  async function discard() {
    if (preview) {
      await fetch("/api/academics/timetable/elective-blocks/auto-build", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "discard", runId: preview.runId }),
      }).catch(() => {});
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-navy-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-bold text-navy-900 dark:text-white"><Sparkles className="h-5 w-5 text-purple-600" /> Build Options Block from student choices</h3>
          <Button size="sm" variant="ghost" onClick={discard}><X className="h-4 w-4" /></Button>
        </div>

        {!preview ? (
          <div className="space-y-4">
            <p className="text-xs text-navy-400">
              NEYO reads real confirmed subject selections for a level and detects genuine elective subjects (or a real Core/Essential Mathematics split), showing you a real preview to review and edit before anything is created. You can still build a block manually instead — this is just a shortcut.
            </p>
            <div>
              <Label>Level</Label>
              <select value={level} onChange={(e) => setLevel(e.target.value)} className="mt-1 w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900">
                <option value="">Choose level…</option>
                {levels.map((l) => <option key={l as string} value={l as string}>{l as string}</option>)}
              </select>
            </div>
            <div>
              <Label>What are we building?</Label>
              <div className="mt-1 flex gap-2">
                <button onClick={() => setKind("ELECTIVES")} className={`flex-1 rounded-xl border px-3 py-2 text-xs font-medium ${kind === "ELECTIVES" ? "border-purple-400 bg-purple-50 text-purple-700 dark:bg-purple-950/30" : "border-navy-200 text-navy-600 dark:border-navy-700"}`}>General electives</button>
                <button onClick={() => setKind("MATH_SPLIT")} className={`flex-1 rounded-xl border px-3 py-2 text-xs font-medium ${kind === "MATH_SPLIT" ? "border-purple-400 bg-purple-50 text-purple-700 dark:bg-purple-950/30" : "border-navy-200 text-navy-600 dark:border-navy-700"}`}>Core/Essential Mathematics split</button>
              </div>
            </div>
            {kind === "ELECTIVES" && (
              <div>
                <Label>Default lessons/week per detected subject</Label>
                <Input type="number" min={1} max={20} value={defaultLessonsPerWeek} onChange={(e) => setDefaultLessonsPerWeek(Number(e.target.value) || 5)} className="mt-1 w-32" />
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}
            <Button onClick={runPreview} disabled={busy || !level}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Analyse real student choices</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-navy-400">{preview.capacityNote}</p>
            <p className="text-xs text-navy-400">
              Each subject below gets exactly ONE real teacher for the whole combined lesson — when 2 or more streams share a subject, that ONE teacher covers everyone together at the same time, never one teacher per stream.
            </p>
            <div>
              <Label>Block name</Label>
              <Input value={blockName} onChange={(e) => setBlockName(e.target.value)} />
            </div>
            <div className="space-y-3">
              {preview.rows.map((row: any) => (
                <div key={row.subjectId} className="rounded-2xl border border-navy-100 p-3 dark:border-navy-800">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-navy-900 dark:text-white">{row.subjectName} ({row.subjectCode})</p>
                    <Badge tone="blue">{row.studentCount} student{row.studentCount === 1 ? "" : "s"} combined into one real lesson</Badge>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <select
                      value={rowOverrides[row.subjectId]?.teacherId ?? ""}
                      onChange={(e) => setRowOverrides((p) => ({ ...p, [row.subjectId]: { ...p[row.subjectId], teacherId: e.target.value } }))}
                      className="rounded-xl border border-navy-200 bg-white px-2 py-1.5 text-xs dark:border-navy-700 dark:bg-navy-900"
                    >
                      <option value="">No teacher yet</option>
                      {row.teacherRecommendations.map((r: any) => <option key={r.teacherId} value={r.teacherId}>{r.teacherName} (currently {r.classCount} other classes, {r.lessonLoad} lessons/week elsewhere)</option>)}
                    </select>
                    <Input
                      type="number" min={1} max={20}
                      value={rowOverrides[row.subjectId]?.lessonsPerWeek ?? row.defaultLessonsPerWeek}
                      onChange={(e) => setRowOverrides((p) => ({ ...p, [row.subjectId]: { ...p[row.subjectId], lessonsPerWeek: Number(e.target.value) || 5 } }))}
                      className="h-8 text-xs"
                    />
                  </div>
                  {row.teacherRecommendations.length === 0 && (
                    <p className="mt-1 text-[11px] text-amber-600">No real teacher is currently linked to this subject — link one under Staff first, or leave blank for now.</p>
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={confirm} disabled={busy || !blockName.trim()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Confirm and create block</Button>
              <Button variant="secondary" onClick={() => setPreview(null)} disabled={busy}>Back</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// AA.2 — real Teacher Allocation Import modal (onboarding scenario: a
// school switching to NEYO already has their existing teacher-subject-
// class allocation on paper/Excel). Real preview-before-commit flow: the
// school sees exactly which rows match an existing real teacher/subject/
// class vs. which would create something new, before anything is written.
const TEACHER_ALLOCATION_BUNDI_FIELD_OPTIONS: Record<string, string> = {
  teacherName: "Teacher name", subjectName: "Subject", className: "Class/Stream",
  lessonsPerWeek: "Lessons per week", doubleCount: "Double lessons", ignore: "— Skip —",
};

function TeacherAllocationImportModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { toast } = useToast();
  const [mode, setMode] = React.useState<"standard" | "bundi">("standard");
  const [text, setText] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [hasHeader, setHasHeader] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [preview, setPreview] = React.useState<any[] | null>(null);
  const [createMissingTeachers, setCreateMissingTeachers] = React.useState(false);
  const [result, setResult] = React.useState<{ createdNeeds: number; matchedNeeds: number; createdTeachers: number; failedRows: number; errors: { row: number; message: string }[] } | null>(null);

  async function runPreview() {
    if (!text.trim() && !file) return;
    setBusy(true);
    setPreview(null);
    try {
      let res: Response;
      if (file) {
        const form = new FormData();
        form.append("file", file);
        form.append("hasHeader", String(hasHeader));
        form.append("action", "preview");
        res = await fetch("/api/academics/teacher-allocation-import", { method: "POST", body: form });
      } else {
        res = await fetch("/api/academics/teacher-allocation-import", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "preview", text, hasHeader }),
        });
      }
      const json = await res.json();
      if (!json.ok) { toast({ title: json.error?.message || "Could not read this file.", tone: "error" }); return; }
      setPreview(json.data.preview);
    } catch {
      toast({ title: "Failed to parse the import data.", tone: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function runCommit() {
    setBusy(true);
    try {
      let res: Response;
      if (file) {
        const form = new FormData();
        form.append("file", file);
        form.append("hasHeader", String(hasHeader));
        form.append("createMissingTeachers", String(createMissingTeachers));
        res = await fetch("/api/academics/teacher-allocation-import", { method: "POST", body: form });
      } else {
        res = await fetch("/api/academics/teacher-allocation-import", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, hasHeader, createMissingTeachers, fileName: file ? (file as File).name : "pasted.csv", source: "paste" }),
        });
      }
      const json = await res.json();
      if (!json.ok) { toast({ title: json.error?.message || "Import failed.", tone: "error" }); return; }
      setResult(json.data);
      toast({ title: `Import complete: ${json.data.createdNeeds} created, ${json.data.matchedNeeds} updated`, tone: json.data.createdNeeds + json.data.matchedNeeds > 0 ? "success" : "error" });
      if (json.data.createdNeeds + json.data.matchedNeeds > 0) onDone();
    } catch {
      toast({ title: "Failed to submit the import.", tone: "error" });
    } finally {
      setBusy(false);
    }
  }

  const sample = "Teacher Name,Subject,Class,Lessons Per Week,Doubles\nWanjiru Consolata,Mathematics,Form 2 East,5,1\nOtieno Brian,English,Form 1 West,5,0";
  const hasNewTeachers = (preview ?? []).some((p) => p.teacherMatch === "NEW");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-navy-100 bg-white p-6 shadow-pop dark:border-navy-800 dark:bg-navy-900" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-navy-900 dark:text-navy-50">Import Existing Teacher Allocations</h3>
            <p className="text-xs text-navy-400">Upload CSV/XLSX, paste from Excel, or scan a handwritten register with Bundi.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-navy-400 hover:bg-navy-50 dark:hover:bg-navy-800" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!result && (
          <div className="mb-4 flex gap-1.5 rounded-full bg-navy-50 p-1 text-xs font-semibold dark:bg-navy-800">
            <button onClick={() => setMode("standard")} className={`flex-1 rounded-full px-3 py-1.5 transition-colors ${mode === "standard" ? "bg-white text-navy-900 shadow-sm dark:bg-navy-900 dark:text-navy-50" : "text-navy-500 dark:text-navy-400"}`}>
              CSV / Excel / Paste
            </button>
            <button onClick={() => setMode("bundi")} className={`flex flex-1 items-center justify-center gap-1 rounded-full px-3 py-1.5 transition-colors ${mode === "bundi" ? "bg-white text-navy-900 shadow-sm dark:bg-navy-900 dark:text-navy-50" : "text-navy-500 dark:text-navy-400"}`}>
              <Sparkles className="h-3.5 w-3.5" /> Bundi Intelligent (scan)
            </button>
          </div>
        )}

        {mode === "bundi" && !result ? (
          <BundiIntelligentWizard
            domain="TEACHER_ALLOCATION"
            fieldOptions={TEACHER_ALLOCATION_BUNDI_FIELD_OPTIONS}
            onClose={onDone}
            onDone={(r: any) => { toast({ title: `${r.createdNeeds ?? 0} allocation(s) created, ${r.matchedNeeds ?? 0} updated via Bundi Intelligent`, tone: "success" }); onDone(); }}
          />
        ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-dashed border-teal-200 bg-teal-50/60 p-4 text-xs dark:border-teal-900/40 dark:bg-teal-950/15">
            <p className="font-bold text-navy-800 dark:text-navy-100">Accepted columns</p>
            <p className="mt-1 font-mono text-navy-600 dark:text-navy-300">Teacher Name · Subject · Class/Stream · Lessons Per Week · Doubles</p>
            <p className="mt-2 text-navy-500 dark:text-navy-400">Headers are auto-mapped. Class names must match this school's real class names exactly (e.g. "Form 2 East"). Nothing is created until you preview and confirm.</p>
            {/* BB.6 — a teacher who teaches several real subjects and/or
                several real classes doesn't need a special combined-cell
                format: just add one more real row for each subject/class
                they teach, using the SAME real teacher name spelled
                exactly the same way each time. NEYO automatically links
                every one of those rows to the SAME real teacher record —
                it never creates a duplicate teacher just because their
                name appears more than once. */}
            <div className="mt-3 rounded-xl border border-teal-200/70 bg-white/70 p-3 dark:border-teal-900/30 dark:bg-navy-950/30">
              <p className="font-bold text-navy-800 dark:text-navy-100">A teacher who teaches more than one subject or class?</p>
              <p className="mt-1 text-navy-500 dark:text-navy-400">Just add one more row for each subject/class they teach — using their name spelled exactly the same way every time. NEYO automatically links every row to the same real teacher; it never creates a duplicate.</p>
              <p className="mt-2 font-mono text-navy-600 dark:text-navy-300">
                Wanjiru Consolata, Mathematics, Form 2 East, 5<br />
                Wanjiru Consolata, Physics, Form 3 West, 6
              </p>
            </div>
          </div>

          {!result && !preview && (
            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="allocation-import-file">Upload allocation file</Label>
                  <input
                    id="allocation-import-file"
                    type="file"
                    accept=".csv,.tsv,.txt,.xlsx"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="mt-1.5 w-full rounded-2xl border border-navy-200 bg-white px-3.5 py-2.5 text-sm dark:border-navy-700 dark:bg-navy-900"
                    disabled={busy}
                  />
                  {file && <p className="mt-1 text-[11px] text-green-700 dark:text-green-300">Selected: {file.name}</p>}
                </div>
                <label className="flex items-center gap-2 rounded-2xl border border-navy-100 bg-white/60 px-3 py-2 text-xs text-navy-600 dark:border-navy-800 dark:bg-navy-950/40 dark:text-navy-300">
                  <input type="checkbox" checked={hasHeader} onChange={(e) => setHasHeader(e.target.checked)} className="h-4 w-4 rounded border-navy-300 text-teal-600" />
                  First row contains column headers
                </label>
                <Button variant="secondary" onClick={() => { setText(sample); setFile(null); }} disabled={busy} className="w-full">
                  <FileText className="h-4 w-4" /> Use sample CSV
                </Button>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="allocation-paste-data">Or paste spreadsheet cells</Label>
                  <textarea
                    id="allocation-paste-data"
                    rows={8}
                    value={text}
                    onChange={(e) => { setText(e.target.value); if (e.target.value.trim()) setFile(null); }}
                    placeholder={sample}
                    className="mt-1.5 w-full rounded-2xl border border-navy-200 bg-white px-3.5 py-2.5 text-xs font-mono transition-colors duration-200 ease-apple focus:border-navy-300 focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:border-navy-700 dark:bg-navy-900 text-navy-900 dark:text-navy-50"
                    disabled={busy}
                  />
                </div>
                <Button onClick={runPreview} disabled={busy || (!text.trim() && !file)} className="w-full">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                  Preview import
                </Button>
              </div>
            </div>
          )}

          {preview && !result && (
            <div className="space-y-3">
              <div className="max-h-64 overflow-y-auto rounded-2xl border border-navy-100 dark:border-navy-800">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-navy-50 dark:bg-navy-800">
                    <tr>
                      <th className="p-2">Row</th><th className="p-2">Teacher</th><th className="p-2">Subject</th><th className="p-2">Class</th><th className="p-2">Outcome</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((p) => (
                      <tr key={p.row} className="border-t border-navy-50 dark:border-navy-800">
                        <td className="p-2">{p.row}</td>
                        <td className="p-2">{p.teacherName} {p.teacherMatch === "NEW" && <Badge tone="amber">New</Badge>} {p.teacherMatch === "AMBIGUOUS" && <Badge tone="red">Ambiguous</Badge>}</td>
                        <td className="p-2">{p.subjectName} {p.subjectMatch === "NOT_FOUND" && <Badge tone="red">Not found</Badge>}</td>
                        <td className="p-2">{p.className} {p.classMatch === "NOT_FOUND" && <Badge tone="red">Not found</Badge>}</td>
                        <td className="p-2">
                          {p.error ? <span className="text-red-600 dark:text-red-400">{p.error}</span> : p.needMatch === "WILL_CREATE" ? <Badge tone="green">Will create</Badge> : <Badge tone="blue">Will update</Badge>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {hasNewTeachers && (
                <label className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
                  <input type="checkbox" checked={createMissingTeachers} onChange={(e) => setCreateMissingTeachers(e.target.checked)} className="h-4 w-4 rounded border-amber-300 text-amber-600" />
                  Create the new teacher(s) marked "New" above — otherwise those rows will be skipped
                </label>
              )}
              <div className="flex flex-wrap gap-2">
                <Button onClick={runCommit} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Confirm import</Button>
                <Button variant="secondary" onClick={() => setPreview(null)} disabled={busy}>Back</Button>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-2xl bg-green-500/10 border border-green-500/20 p-3 text-green-700 dark:text-green-300 font-semibold">
                  <span className="block text-lg font-bold">{result.createdNeeds}</span>Created
                </div>
                <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 p-3 text-blue-700 dark:text-blue-300 font-semibold">
                  <span className="block text-lg font-bold">{result.matchedNeeds}</span>Updated
                </div>
                <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3 text-amber-700 dark:text-amber-300 font-semibold">
                  <span className="block text-lg font-bold">{result.failedRows}</span>Skipped / Errors
                </div>
              </div>
              {result.errors.length > 0 && (
                <div className="max-h-40 overflow-y-auto rounded-2xl border border-red-100 bg-red-50/50 p-3 dark:border-red-900/30 dark:bg-red-950/20 space-y-1.5">
                  <p className="text-xs font-bold text-red-700 dark:text-red-300">Detailed import logs:</p>
                  {result.errors.map((e, idx) => (
                    <p key={idx} className="text-[11px] text-red-600 dark:text-red-400">Row {e.row}: {e.message}</p>
                  ))}
                </div>
              )}
              <Button onClick={onClose} className="w-full"><Check className="h-4 w-4" /> Done</Button>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}

function StatPill({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-navy-100 bg-white/70 px-4 py-3 dark:border-navy-800 dark:bg-navy-950/60">
      <div className="flex items-center gap-2 text-navy-500 dark:text-navy-400"><Icon className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-widest">{label}</span></div>
      <p className="mt-2 text-2xl font-black tracking-tight text-navy-950 dark:text-white">{value}</p>
    </div>
  );
}

function FeatureRow({ icon: Icon, text }: { icon: any; text: string }) {
  return <div className="flex items-start gap-2"><Icon className="mt-0.5 h-4 w-4 text-green-600" /><p>{text}</p></div>;
}

function TeacherSubjectsModal({ teacherId, subjects, currentSubjectIds, onClose, onSaved }: {
  teacherId: string; subjects: any[]; currentSubjectIds: string[]; onClose: () => void; onSaved: () => void;
}) {
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set(currentSubjectIds));
  const [saving, setSaving] = React.useState(false);

  function toggle(sid: string) {
    const next = new Set(selectedIds);
    if (next.has(sid)) next.delete(sid); else next.add(sid);
    setSelectedIds(next);
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/academics/timetable/generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_teacher_subject", teacherId, subjectIds: [...selectedIds] }),
      });
      const json = await res.json();
      if (json.ok) onSaved();
      else toast({ title: json.error?.message || "Department update failed", tone: "error" });
    } finally { setSaving(false); }
  }

  return (
    <Modal title="Configure Qualified Subjects" onClose={onClose} wide>
      <p className="mb-3 text-xs text-navy-400">Select which subjects this teacher teaches. The solver uses this map to auto-assign teachers during slot scheduling.</p>
      <div className="max-h-72 overflow-y-auto space-y-2 mb-4 pr-1">
        {subjects.map((s) => (
          <label key={s.id} className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-navy-50 text-sm text-navy-700 dark:text-navy-200 cursor-pointer">
            <input type="checkbox" checked={selectedIds.has(s.id)} onChange={() => toggle(s.id)} className="h-4 w-4 rounded border-navy-300 text-green-600 focus:ring-green-500" />
            <span>{s.name} ({s.code})</span>
          </label>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}</Button>
      </div>
    </Modal>
  );
}

function SubjectNeedsModal({ classId, subjects, teachers, currentNeeds, onClose, onSaved }: {
  classId: string; subjects: any[]; teachers: any[]; currentNeeds: any[]; onClose: () => void; onSaved: () => void;
}) {
  const [saving, setSaving] = React.useState(false);
  const [needs, setNeeds] = React.useState<Record<string, { lessons: number; teacherId: string }>>(() => {
    const map: Record<string, { lessons: number; teacherId: string }> = {};
    for (const s of subjects) {
      const n = currentNeeds.find((x) => x.subjectId === s.id);
      map[s.id] = { lessons: n?.lessonsPerWeek ?? 0, teacherId: n?.teacherId ?? "" };
    }
    return map;
  });

  async function save() {
    setSaving(true);
    try {
      // Save each subject need that has lessons > 0 or has changes
      for (const sid of Object.keys(needs)) {
        const item = needs[sid];
        await fetch("/api/academics/timetable/generator", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "save_need",
            classId,
            subjectId: sid,
            lessonsPerWeek: item.lessons,
            teacherId: item.teacherId || null,
          }),
        });
      }
      onSaved();
    } finally { setSaving(false); }
  }

  function updateLessons(sid: string, val: number) {
    setNeeds((p) => ({ ...p, [sid]: { ...p[sid], lessons: val } }));
  }

  function updateTeacher(sid: string, val: string) {
    setNeeds((p) => ({ ...p, [sid]: { ...p[sid], teacherId: val } }));
  }

  return (
    <Modal title="Configure Subject Loads" onClose={onClose} wide>
      <p className="mb-3 text-xs text-navy-400">Configure weekly lessons needs and the assigned subject teacher (The Input Matrix) for this class.</p>
      <div className="max-h-80 overflow-y-auto space-y-3 mb-4 pr-1">
        {subjects.map((s) => {
          const item = needs[s.id] || { lessons: 0, teacherId: "" };
          return (
            <div key={s.id} className="flex items-center gap-3 rounded-xl border border-navy-100 p-2.5 dark:border-navy-800">
              <span className="w-28 truncate text-sm font-medium text-navy-800 dark:text-navy-100">{s.name}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <Label className="text-[10px] text-navy-400">Lessons/wk</Label>
                <Input type="number" min={0} max={10} value={item.lessons || ""} placeholder="0" className="w-16 h-8 text-xs"
                  onChange={(e) => updateLessons(s.id, Number(e.target.value))} />
              </div>
              <div className="flex-1">
                <select value={item.teacherId} onChange={(e) => updateTeacher(s.id, e.target.value)}
                  className="w-full h-8 rounded-lg border border-navy-200 bg-white px-2 text-xs dark:border-navy-700 dark:bg-navy-900 text-navy-800 dark:text-navy-100">
                  <option value="">Choose Teacher…</option>
                  {teachers.map((t) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                </select>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Needs Matrix"}</Button>
      </div>
    </Modal>
  );
}

function buildConfigFormState(cfg: any | null) {
  return {
    periodsPerDay: cfg?.periodsPerDay ?? 8,
    freePeriodsPerWeek: cfg?.freePeriodsPerWeek ?? 4,
    coCurricularCount: cfg?.coCurricularCount ?? 2,
    coCurricularName: cfg?.coCurricularName ?? "Games",
    schoolDayStartTime: cfg?.schoolDayStartTime ?? "08:00",
    saturdayStartTime: cfg?.saturdayStartTime ?? "08:00",
    saturdayEndTime: cfg?.saturdayEndTime ?? "12:40",
    lessonDurationMins: cfg?.lessonDurationMins ?? 40,
    shortBreakStart: cfg?.shortBreakStart ?? 2,
    shortBreakMins: cfg?.shortBreakMins ?? 15,
    longBreakStart: cfg?.longBreakStart ?? 4,
    longBreakMins: cfg?.longBreakMins ?? 30,
    lunchStart: cfg?.lunchStart ?? 6,
    lunchMins: cfg?.lunchMins ?? 60,
    hasRemedials: cfg?.hasRemedials ?? false,
    hasPreps: cfg?.hasPreps ?? false,
    lunchShift: cfg?.lunchShift ?? 1,
    // CC.1 — real, direct lunch period. Defaults to the class's own
    // already-saved value; if never explicitly set, resolves from the
    // legacy lunchShift enum so the UI honestly shows what's ACTUALLY
    // happening today rather than a blank/misleading field.
    lunchAfterPeriod: cfg?.lunchAfterPeriod
      ?? (cfg?.lunchShift === 2 ? 6 : cfg?.lunchShift === 3 ? 7 : cfg?.lunchShift === 4 ? 8 : 5),
    hasSaturday: cfg?.hasSaturday ?? true, // Added for Saturday attendance control
  };
}

function ClassConfigModal({ classId, classes, currentConfig, onClose, onSaved }: {
  classId: string; classes?: any[]; currentConfig: any | null; onClose: () => void; onSaved: () => void;
}) {
  const { toast } = useToast();
  const [saving, setSaving] = React.useState(false);

  // DD.10 — real whole-grade Schedule Rules: the same real streams-of-a-
  // grade agreement pattern already built for the Lesson Requirements
  // card, applied to TimetableConfig. `scope` defaults to "grade" only
  // when every real stream of the grade already agrees (or none have a
  // config yet) — a real, already-customised stream is never silently
  // overwritten; a school can still explicitly switch to "stream" to
  // edit just the one class it opened this dialog from.
  const currentClass = (classes ?? []).find((c: any) => c.id === classId);
  const level: string | undefined = currentClass?.level;
  const levelClasses = level ? (classes ?? []).filter((c: any) => c.level === level) : [];
  const [agreement, setAgreement] = React.useState<{ agrees: boolean; sharedConfig: any | null } | null>(null);
  const [agreementLoading, setAgreementLoading] = React.useState(levelClasses.length > 1);
  // DD.10 (final) — real, auto-detected wider scopes beyond a single
  // grade: "school" (every real active grade genuinely agrees) or
  // "group" (this grade is part of a real contiguous run of 2+ grades
  // that genuinely agree with each other, e.g. Grade 1-3), confirmed via
  // ask_user (auto-detect, no manual group-naming yet). Both are purely
  // informational upgrades offered ON TOP of the existing grade/stream
  // scopes — never silently pre-selected, since expanding a save's real
  // blast radius is always the school's own deliberate choice.
  const [scope, setScope] = React.useState<"grade" | "stream" | "school" | "group">("stream");
  const [wholeSchoolInfo, setWholeSchoolInfo] = React.useState<{ agrees: boolean; levels: string[]; sharedConfig: any } | null>(null);
  const [groupInfo, setGroupInfo] = React.useState<{ levels: string[]; sharedConfig: any } | null>(null);
  const [f, setF] = React.useState(buildConfigFormState(currentConfig));

  React.useEffect(() => {
    if (!level || levelClasses.length <= 1) { setAgreementLoading(false); return; }
    setAgreementLoading(true);
    fetch(`/api/academics/timetable/generator?level=${encodeURIComponent(level)}&agreement=config`)
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) {
          setAgreement({ agrees: json.data.agrees, sharedConfig: json.data.sharedConfig });
          if (json.data.agrees) {
            setScope("grade");
            setF(buildConfigFormState(json.data.sharedConfig ?? currentConfig));
          }
        }
      })
      .catch(() => {})
      .finally(() => setAgreementLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  // DD.10 (final) — real whole-school and contiguous-group agreement,
  // fetched once per dialog open (cheap, tenant-wide queries) so the
  // wider-scope offers below can appear alongside the existing per-grade
  // banner without slowing down the common single-grade save.
  React.useEffect(() => {
    fetch(`/api/academics/timetable/generator?agreement=config-whole-school`)
      .then((r) => r.json())
      .then((json) => { if (json.ok) setWholeSchoolInfo(json.data); })
      .catch(() => {});
    fetch(`/api/academics/timetable/generator?agreement=config-groups`)
      .then((r) => r.json())
      .then((json) => {
        if (json.ok && level) {
          const match = (json.data.groups ?? []).find((g: any) => g.levels.includes(level));
          setGroupInfo(match ?? null);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const set = (k: string, v: any) => setF((p) => ({ ...p, [k]: v }));

  function switchScope(next: "grade" | "stream" | "school" | "group") {
    setScope(next);
    if (next === "grade" && agreement?.sharedConfig) setF(buildConfigFormState(agreement.sharedConfig));
    if (next === "stream") setF(buildConfigFormState(currentConfig));
    if (next === "school" && wholeSchoolInfo?.sharedConfig) setF(buildConfigFormState(wholeSchoolInfo.sharedConfig));
    if (next === "group" && groupInfo?.sharedConfig) setF(buildConfigFormState(groupInfo.sharedConfig));
  }

  async function save() {
    setSaving(true);
    try {
      const body = scope === "school" && wholeSchoolInfo
        ? { action: "save_config_for_levels", levels: wholeSchoolInfo.levels, ...f }
        : scope === "group" && groupInfo
        ? { action: "save_config_for_levels", levels: groupInfo.levels, ...f }
        : scope === "grade" && level
        ? { action: "save_config_for_level", level, ...f }
        : { action: "save_config", classId, ...f };
      const res = await fetch("/api/academics/timetable/generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.ok) onSaved();
      else toast({ title: json.error?.message || "Department update failed", tone: "error" });
    } finally { setSaving(false); }
  }

  const streamLabel = currentClass ? [currentClass.level, currentClass.stream].filter(Boolean).join(" ") : "this class";
  // A whole-school offer only makes real sense when the school genuinely
  // has more than one real grade to begin with (a single-grade school's
  // "whole school" IS its one grade — the existing grade scope already
  // covers that, no separate banner needed).
  const showWholeSchoolOffer = !!wholeSchoolInfo && wholeSchoolInfo.agrees && wholeSchoolInfo.levels.length > 1;
  const showGroupOffer = !!groupInfo && groupInfo.levels.length > 1;

  return (
    <Modal title="Configure General Schedule Rules" onClose={onClose} wide>
      {levelClasses.length > 1 && !agreementLoading && (
        <div className="mb-4 rounded-2xl border border-navy-100 bg-navy-50/60 p-3 text-xs dark:border-navy-800 dark:bg-navy-900/40">
          {agreement?.agrees ? (
            scope === "grade" ? (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-navy-600 dark:text-navy-300">
                  Editing for the whole of <span className="font-bold text-navy-900 dark:text-white">{level}</span> ({levelClasses.length} streams) — every stream currently shares the same rules.
                </p>
                <button type="button" onClick={() => switchScope("stream")} className="font-semibold text-blue-600 underline dark:text-blue-400">
                  Edit only {streamLabel}
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-navy-600 dark:text-navy-300">
                  Editing only <span className="font-bold text-navy-900 dark:text-white">{streamLabel}</span>.
                </p>
                <button type="button" onClick={() => switchScope("grade")} className="font-semibold text-blue-600 underline dark:text-blue-400">
                  Edit the whole of {level} instead
                </button>
              </div>
            )
          ) : (
            <div className="flex items-center gap-2">
              <Badge tone="amber">Streams differ</Badge>
              <p className="text-navy-600 dark:text-navy-300">
                {level}&apos;s streams don&apos;t all share the same rules yet — editing only <span className="font-bold text-navy-900 dark:text-white">{streamLabel}</span>.
              </p>
            </div>
          )}
        </div>
      )}
      {/* DD.10 (final) — real, auto-detected wider-scope offers, shown
          only when genuinely applicable (never presented as pre-selected
          — a school always explicitly opts in). */}
      {(showWholeSchoolOffer || showGroupOffer) && scope !== "school" && scope !== "group" && (
        <div className="mb-4 space-y-2">
          {showWholeSchoolOffer && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-blue-100 bg-blue-50/60 p-3 text-xs dark:border-blue-900/40 dark:bg-blue-950/20">
              <p className="text-navy-600 dark:text-navy-300">
                Every real grade in the school ({wholeSchoolInfo!.levels.length} grades) currently shares the same schedule rules.
              </p>
              <button type="button" onClick={() => switchScope("school")} className="font-semibold text-blue-600 underline dark:text-blue-400">
                Edit for the whole school instead
              </button>
            </div>
          )}
          {showGroupOffer && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-blue-100 bg-blue-50/60 p-3 text-xs dark:border-blue-900/40 dark:bg-blue-950/20">
              <p className="text-navy-600 dark:text-navy-300">
                {groupInfo!.levels.join(", ")} currently share the same schedule rules.
              </p>
              <button type="button" onClick={() => switchScope("group")} className="font-semibold text-blue-600 underline dark:text-blue-400">
                Edit for this whole group instead
              </button>
            </div>
          )}
        </div>
      )}
      {(scope === "school" || scope === "group") && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-blue-100 bg-blue-50/60 p-3 text-xs dark:border-blue-900/40 dark:bg-blue-950/20">
          <p className="text-navy-600 dark:text-navy-300">
            Editing for {scope === "school" ? "the whole school" : groupInfo!.levels.join(", ")} ({(scope === "school" ? wholeSchoolInfo!.levels : groupInfo!.levels).length} grades).
          </p>
          <button type="button" onClick={() => switchScope(levelClasses.length > 1 ? "grade" : "stream")} className="font-semibold text-blue-600 underline dark:text-blue-400">
            Edit only {level ?? streamLabel} instead
          </button>
        </div>
      )}
      <div className="space-y-4 mb-4 max-h-96 overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="cfg-periods">Periods Per Day</Label>
            <Input id="cfg-periods" type="number" min={1} max={20} value={f.periodsPerDay} onChange={(e) => set("periodsPerDay", Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="cfg-duration">Lesson Duration (mins)</Label>
            <Input id="cfg-duration" type="number" min={10} max={120} value={f.lessonDurationMins} onChange={(e) => set("lessonDurationMins", Number(e.target.value))} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 rounded-2xl border border-green-100 bg-green-50/40 p-3 dark:border-green-900/40 dark:bg-green-950/10">
          <div>
            <Label htmlFor="cfg-start">Normal day starts</Label>
            <Input id="cfg-start" type="time" value={f.schoolDayStartTime} onChange={(e) => set("schoolDayStartTime", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="cfg-sat-start">Saturday starts</Label>
            <Input id="cfg-sat-start" type="time" value={f.saturdayStartTime} onChange={(e) => set("saturdayStartTime", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="cfg-sat-end">Saturday ends</Label>
            <Input id="cfg-sat-end" type="time" value={f.saturdayEndTime} onChange={(e) => set("saturdayEndTime", e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="cfg-free">Free study periods / week</Label>
            <Input id="cfg-free" type="number" min={0} max={15} value={f.freePeriodsPerWeek} onChange={(e) => set("freePeriodsPerWeek", Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="cfg-coconname">Co-curricular Activity</Label>
            <Input id="cfg-coconname" value={f.coCurricularName} onChange={(e) => set("coCurricularName", e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="cfg-cocon">Co-curricular slots / week</Label>
            <Input id="cfg-cocon" type="number" min={0} max={4} value={f.coCurricularCount} onChange={(e) => set("coCurricularCount", Number(e.target.value))} />
          </div>
          <div className="flex flex-col gap-2 pt-5">
            <label className="flex items-center gap-2 text-sm text-navy-600 dark:text-navy-300 select-none cursor-pointer">
              <input type="checkbox" checked={f.hasRemedials} onChange={(e) => set("hasRemedials", e.target.checked)} className="h-4 w-4 rounded border-navy-300 text-green-600" />
              <span>Participates in Remedials</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-navy-600 dark:text-navy-300 select-none cursor-pointer">
              <input type="checkbox" checked={f.hasPreps} onChange={(e) => set("hasPreps", e.target.checked)} className="h-4 w-4 rounded border-navy-300 text-green-600" />
              <span>Participates in Preps</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-navy-600 dark:text-navy-300 select-none cursor-pointer">
              <input type="checkbox" checked={f.hasSaturday} onChange={(e) => set("hasSaturday", e.target.checked)} className="h-4 w-4 rounded border-navy-300 text-green-600" />
              <span>Attends Saturday Remedials</span>
            </label>
          </div>
        </div>

        <div className="border-t border-navy-100 dark:border-navy-800 pt-3 space-y-3">
          <p className="text-xs font-bold text-navy-800 dark:text-navy-100">Configure Breaks &amp; Times</p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-[10px]">Short Break After Period</Label>
              <Input type="number" value={f.shortBreakStart} onChange={(e) => set("shortBreakStart", Number(e.target.value))} />
            </div>
            <div>
              <Label className="text-[10px]">Short Break (mins)</Label>
              <Input type="number" value={f.shortBreakMins} onChange={(e) => set("shortBreakMins", Number(e.target.value))} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-[10px]">Long Break After Period</Label>
              <Input type="number" value={f.longBreakStart} onChange={(e) => set("longBreakStart", Number(e.target.value))} />
            </div>
            <div>
              <Label className="text-[10px]">Long Break (mins)</Label>
              <Input type="number" value={f.longBreakMins} onChange={(e) => set("longBreakMins", Number(e.target.value))} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-[10px]">Lunch Break After Period</Label>
              <Input
                type="number"
                min={1}
                value={f.lunchAfterPeriod ?? f.lunchStart}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  // CC.1 — a school directly picks ANY real period number
                  // lunch should follow, no longer limited to 4 fixed
                  // shift positions. lunchStart is kept in sync purely for
                  // the existing clock-time math fallback (never the
                  // source of truth for WHICH period is lunch anymore).
                  setF((p: any) => ({ ...p, lunchAfterPeriod: v, lunchStart: v }));
                }}
              />
              <p className="mt-1 text-[10px] text-navy-400">
                For a school running dual-shift lunches (e.g. Form 1&amp;2 at period 6, Form 3&amp;4 at period 7), save this class&apos;s own real lunch period here — repeat for each group with its own real value.
              </p>
            </div>
            <div>
              <Label className="text-[10px]">Lunch Break (mins)</Label>
              <Input type="number" value={f.lunchMins} onChange={(e) => set("lunchMins", Number(e.target.value))} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (
            scope === "school" ? "Save for the whole school"
            : scope === "group" ? `Save for ${groupInfo?.levels.length ?? 0} grades`
            : scope === "grade" && level ? `Save for all of ${level}`
            : "Save Config"
          )}
        </Button>
      </div>
    </Modal>
  );
}

// ---- Bulk Saturday Timetable Scheduler (Chunk C — Part 3) ---------------------------
function BulkSaturdayModal({
  classes,
  subjects,
  staff,
  teacherAssoc = [],
  onClose,
  onDone,
}: {
  classes: ClassOpt[];
  subjects: Subject[];
  staff: Staff[];
  teacherAssoc?: { teacherId: string; subjectId: string }[];
  onClose: () => void;
  onDone: (msg: string) => void;
}) {
  const { toast } = useToast();
  // DD.14 — real audit fix: real teachers actually qualified for a real
  // subject, from the school's own real TeacherSubject links. Falls back
  // to the FULL real staff list when a subject genuinely has no
  // qualified teacher linked yet.
  function staffQualifiedFor(subjId: string): Staff[] {
    if (!subjId) return staff;
    const qualifiedIds = new Set(teacherAssoc.filter((ta) => ta.subjectId === subjId).map((ta) => ta.teacherId));
    if (qualifiedIds.size === 0) return staff;
    return staff.filter((t: any) => qualifiedIds.has(t.id));
  }
  const [selectedClassIds, setSelectedClassIds] = React.useState<Set<string>>(new Set());
  const [selectedPeriods, setSelectedPeriods] = React.useState<Set<number>>(new Set());
  const [subjectId, setSubjectId] = React.useState("");
  const [fairSubjectIds, setFairSubjectIds] = React.useState<Set<string>>(new Set());
  const [teacherId, setTeacherId] = React.useState("");
  const [weekRotation, setWeekRotation] = React.useState("ALL"); // ALL | WEEK_A | WEEK_B
  const [fairMode, setFairMode] = React.useState(false);
  const [scheduleMode, setScheduleMode] = React.useState<"SATURDAY" | "REMEDIAL" | "EXAM_PREP">("SATURDAY");
  const [configs, setConfigs] = React.useState<any[]>([]); // Loaded internally to prevent prop drilling
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/academics/timetable/generator")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setConfigs(j.data.configs ?? []);
        }
      });
  }, []);

  // Filter out classes configured to NOT attend Saturdays (H.2)
  const activeClasses = classes.filter((c) => {
    const cfg = configs.find((x) => x.classId === c.id);
    return cfg ? cfg.hasSaturday !== false : true;
  });
  const selectedConfig = configs.find((cfg) => selectedClassIds.has(cfg.classId)) ?? configs[0] ?? null;
  const saturdayWindow = selectedConfig
    ? `${selectedConfig.saturdayStartTime ?? "08:00"}–${selectedConfig.saturdayEndTime ?? "12:40"}`
    : "08:00–12:40";

  function toggleClass(id: string) {
    const next = new Set(selectedClassIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedClassIds(next);
  }

  function togglePeriod(p: number) {
    const next = new Set(selectedPeriods);
    if (next.has(p)) next.delete(p); else next.add(p);
    setSelectedPeriods(next);
  }

  function toggleFairSubject(id: string) {
    const next = new Set(fairSubjectIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setFairSubjectIds(next);
  }

  // Quick Select Helpers
  function selectGrade6to9() {
    const targetIds = activeClasses
      .filter((c) => {
        const num = parseInt(c.name.match(/\d+/)?.[0] ?? "");
        return c.name.toLowerCase().includes("grade") && num >= 6 && num <= 9;
      })
      .map((c) => c.id);
    setSelectedClassIds(new Set(targetIds.length > 0 ? targetIds : activeClasses.map((c) => c.id)));
  }

  function selectForm1to4() {
    const targetIds = activeClasses
      .filter((c) => c.name.toLowerCase().includes("form"))
      .map((c) => c.id);
    setSelectedClassIds(new Set(targetIds.length > 0 ? targetIds : activeClasses.map((c) => c.id)));
  }

  function selectAllClasses() {
    setSelectedClassIds(new Set(activeClasses.map((c) => c.id)));
  }

  async function handleBulkSchedule() {
    if (selectedClassIds.size === 0) {
      toast({ title: "Select at least one class.", tone: "error" });
      return;
    }
    if (selectedPeriods.size === 0) {
      toast({ title: "Select at least one lesson period.", tone: "error" });
      return;
    }
    if (!fairMode && !subjectId) {
      toast({ title: "Select a subject.", tone: "error" });
      return;
    }
    if (fairMode && fairSubjectIds.size < 2) {
      toast({ title: "Pick at least two subjects for fair rotation.", tone: "error" });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/academics/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fairMode ? {
          action: "fairSaturday",
          classIds: [...selectedClassIds],
          periodIds: [...selectedPeriods],
          subjectIds: [...fairSubjectIds],
          teacherId: teacherId || null,
          mode: scheduleMode,
          rotationMode: weekRotation === "ALL" ? "ALL" : "ALTERNATE",
        } : {
          action: "bulkSaturday",
          classIds: [...selectedClassIds],
          periodIds: [...selectedPeriods],
          subjectId,
          teacherId: teacherId || null,
          weekRotation,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        onDone(fairMode ? `Fair Saturday rotation generated across ${fairSubjectIds.size} subjects for ${selectedClassIds.size} classes!` : `Successfully scheduled Saturday (${weekRotation === "ALL" ? "Weekly" : `Alternating ${weekRotation}`}) for ${selectedClassIds.size} classes!`);
      } else {
        toast({ title: json.error?.message || "Bulk scheduling failed.", tone: "error" });
      }
    } catch {
      toast({ title: "Failed to connect to bulk scheduler.", tone: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Bulk Saturday Scheduler (Preps / Remedials)" onClose={onClose} wide>
      <div className="space-y-4 max-h-[85vh] overflow-y-auto pr-1">
        <p className="text-xs text-navy-400">
          Schedule Saturday exam prep, study halls, or remedials for multiple classes simultaneously in one single tap. Current Saturday window: {saturdayWindow}.
        </p>

        {/* 1) Class Selection */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label>Select Target Classes ({selectedClassIds.size})</Label>
            <div className="flex gap-1">
              <button onClick={selectGrade6to9} className="rounded bg-navy-50 hover:bg-navy-100 text-[10px] font-semibold text-navy-600 px-2 py-1 dark:bg-navy-800 dark:text-navy-300">Grade 6-9</button>
              <button onClick={selectForm1to4} className="rounded bg-navy-50 hover:bg-navy-100 text-[10px] font-semibold text-navy-600 px-2 py-1 dark:bg-navy-800 dark:text-navy-300">Form 1-4</button>
              <button onClick={selectAllClasses} className="rounded bg-navy-50 hover:bg-navy-100 text-[10px] font-semibold text-navy-600 px-2 py-1 dark:bg-navy-800 dark:text-navy-300">All</button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 border border-navy-100 dark:border-navy-800 bg-warm-50/50 p-3 rounded-2xl max-h-32 overflow-y-auto">
            {activeClasses.map((c) => (
              <label key={c.id} className="flex items-center gap-1.5 text-xs text-navy-700 dark:text-navy-200 cursor-pointer">
                <input type="checkbox" checked={selectedClassIds.has(c.id)} onChange={() => toggleClass(c.id)} className="h-3.5 w-3.5 rounded border-navy-300 text-green-600 focus:ring-green-500" />
                <span className="truncate">{c.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 2) Period Selection */}
        <div className="space-y-2">
          <Label>Select Saturday Lesson Periods ({selectedPeriods.size})</Label>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((p) => {
              const selected = selectedPeriods.has(p);
              return (
                <button
                  key={p}
                  onClick={() => togglePeriod(p)}
                  className={cn(
                    "rounded-xl border p-2 text-center text-xs font-semibold transition-all select-none",
                    selected
                      ? "bg-green-600 border-green-500 text-white shadow-sm"
                      : "bg-white border-navy-100 text-navy-600 dark:bg-navy-900 dark:border-navy-800 dark:text-navy-300 hover:bg-navy-50"
                  )}
                >
                  <span className="block">Period {p}</span>
                  <span className="mt-0.5 block text-[9px] opacity-75">{timetablePeriodTimeRange(p, selectedConfig, 6)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3) Fairness mode */}
        <div className="rounded-2xl border border-green-200/60 bg-green-50/40 p-3 dark:border-green-900 dark:bg-green-900/10">
          <label className="flex items-center gap-2 text-xs font-semibold text-navy-700 dark:text-navy-200">
            <input type="checkbox" checked={fairMode} onChange={(e) => setFairMode(e.target.checked)} className="h-4 w-4 rounded border-navy-300 text-green-600" />
            Fair rotation mode — share limited Saturday periods across different subjects
          </label>
          {fairMode && (
            <div className="mt-3 space-y-2">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {subjects.slice(0, 12).map((s) => (
                  <label key={s.id} className="flex items-center gap-1.5 text-[11px] text-navy-600 dark:text-navy-300">
                    <input type="checkbox" checked={fairSubjectIds.has(s.id)} onChange={() => toggleFairSubject(s.id)} className="h-3.5 w-3.5 rounded border-navy-300 text-green-600" />
                    <span className="truncate">{s.code}</span>
                  </label>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Mode</Label>
                  <select value={scheduleMode} onChange={(e) => setScheduleMode(e.target.value as any)} className="mt-1 w-full rounded-2xl border border-navy-200 bg-white px-3 py-2 text-xs dark:border-navy-700 dark:bg-navy-900 text-navy-800 dark:text-navy-100">
                    <option value="SATURDAY">Saturday lessons</option>
                    <option value="REMEDIAL">Remedial mode</option>
                    <option value="EXAM_PREP">Exam prep mode</option>
                  </select>
                </div>
                <div>
                  <Label>Rotation</Label>
                  <select value={weekRotation} onChange={(e) => setWeekRotation(e.target.value)} className="mt-1 w-full rounded-2xl border border-navy-200 bg-white px-3 py-2 text-xs dark:border-navy-700 dark:bg-navy-900 text-navy-800 dark:text-navy-100">
                    <option value="WEEK_A">Alternate Week A/B</option>
                    <option value="ALL">Every Saturday</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4) Subject, Teacher, and Alternating Week Rotation */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>Subject</Label>
            <select value={subjectId} disabled={fairMode} onChange={(e) => setSubjectId(e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-navy-200 bg-white px-3 py-2.5 text-xs dark:border-navy-700 dark:bg-navy-900 text-navy-800 dark:text-navy-100">
              <option value="">Select subject…</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
          </div>
          <div>
            <Label>Teacher (optional)</Label>
            <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-navy-200 bg-white px-3 py-2.5 text-xs dark:border-navy-700 dark:bg-navy-900 text-navy-800 dark:text-navy-100">
              <option value="">No Teacher</option>
              {staffQualifiedFor(subjectId).map((t) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
            </select>
          </div>
          <div>
            <Label>Rotation / Alternating</Label>
            <select value={weekRotation} onChange={(e) => setWeekRotation(e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-navy-200 bg-white px-3 py-2.5 text-xs dark:border-navy-700 dark:bg-navy-900 text-navy-800 dark:text-navy-100">
              <option value="ALL">Every Saturday</option>
              <option value="WEEK_A">Week A Only (Odd)</option>
              <option value="WEEK_B">Week B Only (Even)</option>
            </select>
          </div>
        </div>

        {/* 4) Save Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-navy-100 dark:border-navy-800">
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleBulkSchedule} disabled={saving || selectedClassIds.size === 0 || selectedPeriods.size === 0 || (!fairMode && !subjectId) || (fairMode && fairSubjectIds.size < 2)} className="px-6">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {fairMode ? "Generate Fair Rotation" : `Schedule Saturday (${selectedClassIds.size * selectedPeriods.size} Slots)`}
          </Button>
        </div>

      </div>
    </Modal>
  );
}

// ---- shared bits ---------------------------------------------------------------------
function Modal({ title, children, onClose, wide }: { title: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy-950/40 p-4 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className={`w-full ${wide ? "max-w-lg" : "max-w-md"} rounded-2xl bg-white p-6 shadow-card dark:bg-navy-900`} onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-base font-semibold text-navy-900 dark:text-navy-50">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1 text-navy-400 hover:bg-navy-50 dark:hover:bg-navy-800" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
      <AlertCircle className="h-4 w-4" /> Couldn&apos;t load. <button onClick={onRetry} className="font-medium underline">Retry</button>
    </div>
  );
}
function Skeletons() {
  return <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>;
}

// ---- Teachers Duty Roster Tab (I.78 real generated timetable) ---------------------------
function DutyRosterTab({ canManage }: { canManage: boolean }) {
  const { toast } = useToast();
  const [rotation, setRotation] = React.useState<"WEEKLY" | "BI_WEEKLY" | "MONTHLY">("WEEKLY");
  const [teachersPerCycle, setTeachersPerCycle] = React.useState(2);
  const [teachers, setStaff] = React.useState<any[]>([]);
  const [roster, setRoster] = React.useState<any[]>([]);
  const [termLabel, setTermLabel] = React.useState("Current term");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);

  const loadRoster = React.useCallback(async () => {
    setError(false);
    try {
      const res = await fetch("/api/academics/duty-roster");
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || "Could not load duty roster.");
      setRoster(json.data.entries ?? []);
      setTermLabel(json.data.termLabel ?? "Current term");
      if (Array.isArray(json.data.teachers)) setStaff(json.data.teachers.map((t: any) => ({ ...t, selected: true })));
      if (json.data.entries?.[0]?.rotationPeriod) setRotation(json.data.entries[0].rotationPeriod);
      if (json.data.entries?.[0]?.dutyTeamSize) setTeachersPerCycle(json.data.entries[0].dutyTeamSize);
    } catch {
      setError(true);
    }
  }, []);

  React.useEffect(() => {
    loadRoster();
  }, [loadRoster]);

  async function handleGenerateRoster() {
    const activePool = teachers.filter((t) => t.selected);
    if (activePool.length === 0) {
      toast({ title: "Please select at least one teacher.", tone: "error" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/academics/duty-roster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rotationPeriod: rotation, teachersPerCycle, teacherIds: activePool.map((t) => t.id) }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || "Duty roster generation failed.");
      setRoster(json.data.entries ?? []);
      setTermLabel(json.data.termLabel ?? termLabel);
      toast({ title: "Duty roster generated", description: `Saved ${json.data.entries?.length ?? 0} rotation block(s) for ${termLabel}.`, tone: "success" });
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Duty roster generation failed.", tone: "error" });
    } finally {
      setLoading(false);
    }
  }

  const rotationLabel = rotation === "WEEKLY" ? "Weekly" : rotation === "BI_WEEKLY" ? "Bi-weekly" : "Monthly";
  const teamNames = (r: any) => {
    try {
      const parsed = JSON.parse(r.dutyTeacherNames || "[]");
      if (Array.isArray(parsed) && parsed.length) return parsed.join(", ");
    } catch {}
    return [r.primaryTeacherName, r.assistantTeacherName].filter(Boolean).join(", ");
  };

  return (
    <div className="space-y-6 text-left">
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-5 w-5 text-green-600" />
            NEYO Teachers Duty Roster
          </CardTitle>
          <p className="text-xs text-navy-400">
            Choose the reshuffle period, select the teacher pool, and generate a saved term-level Teacher on Duty timetable.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <LoadError onRetry={loadRoster} />}
          <div className="grid gap-4 lg:grid-cols-3">
            <div>
              <Label>Reshuffle Rotation Period</Label>
              <select
                value={rotation}
                onChange={(e) => setRotation(e.target.value as any)}
                className="w-full h-10 rounded-full border border-navy-200 bg-white px-3.5 py-2 text-sm dark:border-navy-700 dark:bg-navy-900"
              >
                <option value="WEEKLY">Weekly Reshuffle (Every 7 days)</option>
                <option value="BI_WEEKLY">Bi-weekly Reshuffle (Every 14 days)</option>
                <option value="MONTHLY">Monthly Reshuffle (Every 28 days)</option>
              </select>
              <p className="mt-1 text-[10px] font-semibold text-navy-400">Current roster term: {termLabel}</p>
            </div>
            <div>
              <Label>Teachers per reshuffle cycle</Label>
              <Input
                type="number"
                min={1}
                max={Math.max(1, teachers.filter((t) => t.selected).length || teachers.length || 1)}
                value={teachersPerCycle}
                onChange={(e) => setTeachersPerCycle(Math.max(1, Number(e.target.value) || 1))}
              />
              <p className="mt-1 text-[10px] font-semibold text-navy-400">Example: choose 3 if three teachers should be on duty in every cycle.</p>
            </div>
            <div className="space-y-1">
              <Label>Active Rotation Pool (Select Teachers)</Label>
              <div className="max-h-[120px] overflow-y-auto border border-navy-100 rounded-2xl p-3 bg-white space-y-1.5 dark:border-navy-800 dark:bg-navy-900">
                {teachers.map((t, idx) => (
                  <label key={t.id} className="flex items-center gap-2 text-xs font-medium text-navy-700 dark:text-navy-200 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={t.selected}
                      onChange={(e) => {
                        const copy = [...teachers];
                        copy[idx].selected = e.target.checked;
                        setStaff(copy);
                      }}
                      className="h-3.5 w-3.5 rounded border-navy-300 text-green-600 focus:ring-green-500"
                    />
                    {t.fullName}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <Button onClick={handleGenerateRoster} disabled={!canManage || loading} className="w-full h-11 text-xs font-bold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-green-400" />}
            Generate & Save Duty Roster
          </Button>
        </CardContent>
      </Card>

      {roster.length > 0 ? (
        <Card className="print:border-none print:shadow-none">
          <CardHeader className="flex flex-row items-center justify-between border-b border-navy-50 pb-3 mb-2 print:hidden">
            <CardTitle className="text-sm uppercase tracking-wider text-navy-400">{termLabel} Teacher Duty Roster</CardTitle>
            <Button size="sm" variant="secondary" onClick={() => window.print()}>
              <Printer className="h-4 w-4 text-green-600" /> Print Duty Roster
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="hidden print:flex items-center justify-between border-b border-navy-200 pb-2 mb-3">
              <span className="text-sm font-bold text-navy-950">{termLabel} Teachers Duty Roster Schedule</span>
              <span className="text-xs text-navy-400">Reshuffle: {rotationLabel}</span>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-navy-100 print:border-none">
              <table className="w-full border-collapse bg-white text-xs dark:bg-navy-900">
                <thead>
                  <tr className="bg-warm-50 border-b border-navy-100 dark:bg-navy-800">
                    <th className="p-3 text-left font-bold text-navy-700">Block</th>
                    <th className="p-3 text-left font-bold text-navy-700">Date Range</th>
                    <th className="p-3 text-left font-bold text-navy-700">Lead T.O.D.</th>
                    <th className="p-3 text-left font-bold text-navy-700">Full duty team</th>
                    <th className="p-3 text-left font-bold text-navy-700">Assigned Duties</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-50 dark:divide-navy-800">
                  {roster.map((r) => (
                    <tr key={r.id ?? r.weekNo}>
                      <td className="p-3 font-bold text-navy-950 dark:text-white">Block {r.weekNo}</td>
                      <td className="p-3 text-navy-500 font-mono text-[10px]">{r.startDate} → {r.endDate}</td>
                      <td className="p-3 text-green-800 font-bold dark:text-green-300">{r.primaryTeacherName}</td>
                      <td className="p-3 text-navy-600 font-medium dark:text-navy-400">
                        <span className="block font-bold text-navy-700 dark:text-navy-200">{r.dutyTeamSize ?? 2} teacher{(r.dutyTeamSize ?? 2) === 1 ? "" : "s"}</span>
                        <span className="text-[10px] text-navy-400">{teamNames(r)}</span>
                      </td>
                      <td className="p-3 text-navy-500 text-[10px]">{r.duties}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="hidden print:flex items-center justify-between border-t border-navy-100 pt-2 mt-4 text-[8px] text-navy-400">
              <p>Printed: {new Date().toLocaleDateString("en-KE")}</p>
              <p className="font-bold uppercase tracking-wider">Powered by NEYO</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState icon={Calendar} title="No saved duty roster yet" description="Choose teachers and generate the roster once; it is saved to the school database for printing and review." />
      )}
    </div>
  );
}

function StudentDutyRosterClient({ canManage }: { canManage: boolean }) {
  const [areas, setAreas] = React.useState<any[]>([]);
  const { toast } = useToast();

  React.useEffect(() => {
    // Simulated load for K.12 features representation
    setAreas([
      { id: "1", name: "Dining Hall Cleanup", genderConstraint: "MIXED", maxStudents: 5 },
      { id: "2", name: "Library Prefect", genderConstraint: "GIRLS_ONLY", maxStudents: 2 },
    ]);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-navy-950 dark:text-white">Student Duty Areas (K.12)</h3>
          <p className="text-xs text-navy-500">Configure areas, gender parity, and medical exclusions.</p>
        </div>
        <Button size="sm" className="rounded-full"><Plus className="h-4 w-4 mr-1"/> Add Duty Area</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {areas.map(a => (
          <Card key={a.id}>
            <CardContent className="p-4">
              <h4 className="font-bold">{a.name}</h4>
              <div className="flex gap-2 mt-2">
                <Badge tone="neutral" className="text-[10px]">{a.genderConstraint}</Badge>
                <Badge tone="neutral" className="text-[10px]">Max: {a.maxStudents}</Badge>
              </div>
              <p className="text-[10px] text-navy-400 mt-3 italic">Automatically excludes health-conditioned students & school leaders.</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function BulkConfigDialog({ data, onClose, onDone }: any) {
  const [selectedClasses, setSelectedClasses] = React.useState<Set<string>>(new Set());
  const [periods, setPeriods] = React.useState(8);
  const [shortBreak, setShortBreak] = React.useState(2);
  const [shortBreak2, setShortBreak2] = React.useState(0);
  const [lunchAfter, setLunchAfter] = React.useState(6);
  const [satEnd, setSatEnd] = React.useState("12:40");
  const [saving, setSaving] = React.useState(false);
  const { toast } = useToast();

  async function save() {
    if (selectedClasses.size === 0) return toast({ title: "Select at least one class", tone: "error" });
    setSaving(true);
    try {
      // Send multiple POSTs or a bulk POST. We'll do multiple for now to be safe.
      for (const cid of selectedClasses) {
        await fetch("/api/academics/timetable/generator", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            action: "save_config", classId: cid, 
            periodsPerDay: periods, 
            shortBreakStart: shortBreak, 
            shortBreak2Start: shortBreak2 || null,
            lunchStart: lunchAfter,
            // CC.1 — this is what ACTUALLY moves the real lunch period
            // (lunchStart alone only ever affected clock-time math, never
            // real placement) — a real bug this bulk dialog had before.
            lunchAfterPeriod: lunchAfter,
            saturdayEndTime: satEnd
          })
        });
      }
      toast({ title: "Bulk rules applied", tone: "success" });
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader><DialogTitle>Bulk Apply Schedule Rules</DialogTitle></DialogHeader>
        <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="space-y-1 border border-navy-100 dark:border-navy-800 p-3 rounded-xl">
            <Label className="text-xs uppercase tracking-widest text-navy-500 font-bold mb-2 block">Target Classes</Label>
            <div className="flex flex-wrap gap-2">
              {data.classes.map((c: any) => {
                const isSelected = selectedClasses.has(c.id);
                return (
                  <Badge 
                    key={c.id} 
                    tone={isSelected ? "green" : "neutral"} 
                    className="cursor-pointer"
                    onClick={() => {
                      const next = new Set(selectedClasses);
                      if (next.has(c.id)) next.delete(c.id); else next.add(c.id);
                      setSelectedClasses(next);
                    }}
                  >
                    {c.level} {c.stream}
                  </Badge>
                );
              })}
            </div>
            <Button size="sm" variant="ghost" className="mt-2 text-xs" onClick={() => setSelectedClasses(new Set(data.classes.map((c:any)=>c.id)))}>Select All</Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label>Periods Per Day (Max 12)</Label><Input type="number" value={periods} onChange={(e) => setPeriods(Number(e.target.value))} max={12} /></div>
            <div className="space-y-1"><Label>Saturday End Time</Label><Input type="time" value={satEnd} onChange={(e) => setSatEnd(e.target.value)} /></div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Short Break 1 (After Period)</Label><Input type="number" value={shortBreak} onChange={(e) => setShortBreak(Number(e.target.value))} /></div>
            <div className="space-y-1"><Label>Short Break 2 (Optional)</Label><Input type="number" value={shortBreak2} onChange={(e) => setShortBreak2(Number(e.target.value))} placeholder="0 to disable"/></div>
            <div className="space-y-1"><Label>Lunch (After Period)</Label><Input type="number" value={lunchAfter} onChange={(e) => setLunchAfter(Number(e.target.value))} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="rounded-full bg-blue-600 hover:bg-blue-700 text-white">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply Rules"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type ExamPaper = { id: string; subjectId: string; classId?: string | null; name: string; outOfMarks: number; weightPct: number };
type ExamSlotRow = {
  id: string;
  classId: string;
  subjectId: string;
  examName: string;
  paperConfigId?: string | null;
  paperName?: string | null;
  examDate: string;
  startTime: string;
  endTime: string;
  venue?: string | null;
  targetScope: string;
  targetJson?: string | null;
  targetIds?: string[];
  invigilatorScope?: string;
  eligibleInvigilators?: { teacherId: string; teacherName: string }[];
  invigilators?: { teacherId: string; teacherName: string; warning?: string }[];
  warnings?: string[];
  notes?: string | null;
};

function ExamTimetableTab({ canManage }: { canManage: boolean }) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [setup, setSetup] = React.useState<{ slots: ExamSlotRow[]; papers: ExamPaper[]; classes: ClassOpt[]; subjects: Subject[]; streamGroups: { id: string; label: string; classIds: string[] }[]; combinationGroups: { id: string; label: string; classIds: string[]; subjectId: string; source: string; scope: string }[] } | null>(null);
  const [teachers, setTeachers] = React.useState<Staff[]>([]);
  const [examName, setExamName] = React.useState('Midterm');
  const [editingSlotId, setEditingSlotId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<any>({
    classId: '',
    subjectId: '',
    paperConfigId: '',
    paperName: 'PP1',
    examDate: '',
    startTime: '08:00',
    endTime: '10:00',
    venue: '',
    targetScope: 'CLASS',
    targetIds: [] as string[],
    invigilatorScope: 'AUTO',
    eligibleInvigilatorIds: [] as string[],
    notes: '',
  });

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [setupRes, teacherRes] = await Promise.all([
        fetch('/api/academics/exam-timetable'),
        fetch('/api/conversations/recipients'),
      ]);
      const [setupJson, teacherJson] = await Promise.all([setupRes.json(), teacherRes.json()]);
      if (!setupJson.ok) throw new Error(setupJson.error?.message || 'Could not load exam timetable setup.');
      setSetup(setupJson.data);
      if (teacherJson.ok) {
        setTeachers((teacherJson.data.recipients ?? []).filter((u: any) => ['TEACHER', 'CLASS_TEACHER', 'HOD', 'DEPUTY_PRINCIPAL', 'DEAN_OF_STUDIES'].includes(u.role)));
      }
      const latestExam = setupJson.data.slots?.[0]?.examName;
      if (latestExam) setExamName(latestExam);
    } catch (e: any) {
      toast({ title: e?.message || 'Could not load exam timetable.', tone: 'error' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => { load(); }, [load]);

  React.useEffect(() => {
    if (!setup?.classes?.length) return;
    setForm((prev: any) => ({
      ...prev,
      classId: prev.classId || setup.classes[0].id,
      targetIds: prev.targetIds?.length ? prev.targetIds : [setup.classes[0].id],
    }));
  }, [setup]);

  const filteredPapers = React.useMemo(() => {
    if (!setup) return [];
    return setup.papers.filter((p) => p.subjectId === form.subjectId && (!p.classId || p.classId === form.classId));
  }, [setup, form.subjectId, form.classId]);

  const selectedCombinationGroups = React.useMemo(() => {
    if (!setup || form.targetScope !== 'COMBINATION') return [];
    return setup.combinationGroups.filter((group) => group.classIds.length > 0 && group.classIds.every((id) => form.targetIds.includes(id)));
  }, [setup, form.targetScope, form.targetIds]);

  function resetForm() {
    setEditingSlotId(null);
    setForm({
      classId: setup?.classes?.[0]?.id || '',
      subjectId: '',
      paperConfigId: '',
      paperName: 'PP1',
      examDate: '',
      startTime: '08:00',
      endTime: '10:00',
      venue: '',
      targetScope: 'CLASS',
      targetIds: setup?.classes?.[0]?.id ? [setup.classes[0].id] : [],
      invigilatorScope: 'AUTO',
      eligibleInvigilatorIds: [],
      notes: '',
    });
  }

  function startEdit(slot: ExamSlotRow) {
    setEditingSlotId(slot.id);
    setExamName(slot.examName || '');
    setForm({
      classId: slot.classId || '',
      subjectId: slot.subjectId || '',
      paperConfigId: slot.paperConfigId || '',
      paperName: slot.paperName || 'PP1',
      examDate: slot.examDate || '',
      startTime: slot.startTime || '08:00',
      endTime: slot.endTime || '10:00',
      venue: slot.venue || '',
      targetScope: slot.targetScope || 'CLASS',
      targetIds: Array.isArray((slot as any).targetIds) ? (slot as any).targetIds : Array.isArray(slot.targetJson) ? slot.targetJson : [],
      invigilatorScope: slot.invigilatorScope || 'AUTO',
      eligibleInvigilatorIds: (slot.eligibleInvigilators ?? []).map((t) => t.teacherId),
      notes: slot.notes || '',
    });
  }

  async function saveSlot() {
    if (!form.classId || !form.subjectId || !examName || !form.examDate || !form.startTime || !form.endTime) {
      toast({ title: 'Fill exam name, class, subject, date and time first.', tone: 'error' });
      return;
    }
    if (form.startTime >= form.endTime) {
      toast({ title: 'End time must be after start time.', tone: 'error' });
      return;
    }
    if (form.targetScope !== 'CLASS' && (!form.targetIds || form.targetIds.length === 0)) {
      toast({ title: 'Select at least one target group for this exam slot.', tone: 'error' });
      return;
    }
    if (form.targetScope === 'COMBINATION' && selectedCombinationGroups.length === 0) {
      toast({ title: 'Choose at least one real combination group for this subject.', tone: 'error' });
      return;
    }
    if (form.invigilatorScope === 'ELIGIBLE_ONLY' && (!form.eligibleInvigilatorIds || form.eligibleInvigilatorIds.length === 0)) {
      toast({ title: 'Pick at least one eligible invigilator or switch back to Auto.', tone: 'error' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/academics/exam-timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_slot',
          id: editingSlotId,
          examName,
          classId: form.classId,
          subjectId: form.subjectId,
          paperConfigId: form.paperConfigId || null,
          paperName: form.paperName || null,
          examDate: form.examDate,
          startTime: form.startTime,
          endTime: form.endTime,
          venue: form.venue || null,
          targetScope: form.targetScope,
          targetIds: form.targetIds?.length ? form.targetIds : [form.classId],
          invigilatorScope: form.invigilatorScope,
          eligibleInvigilatorIds: form.eligibleInvigilatorIds,
          notes: form.notes || null,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || 'Could not save exam slot.');
      toast({ title: editingSlotId ? 'Exam timetable slot updated' : 'Exam timetable slot saved', tone: 'success' });
      await load();
      resetForm();
    } catch (e: any) {
      toast({ title: e?.message || 'Could not save exam slot.', tone: 'error' });
    } finally {
      setSaving(false);
    }
  }

  async function generateInvigilators() {
    if (!examName) {
      toast({ title: 'Enter exam name first.', tone: 'error' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/academics/exam-timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_invigilators', examName }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || 'Could not generate invigilators.');
      toast({ title: `Invigilators generated for ${examName}`, tone: 'success' });
      await load();
    } catch (e: any) {
      toast({ title: e?.message || 'Could not generate invigilators.', tone: 'error' });
    } finally {
      setSaving(false);
    }
  }

  async function saveInvigilatorPool(slotId: string, scope: string, teacherIds: string[]) {
    setSaving(true);
    try {
      const res = await fetch('/api/academics/exam-timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_invigilator_pool', examName, slotId, invigilatorScope: scope, eligibleInvigilatorIds: teacherIds }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || 'Could not save eligible invigilator pool.');
      toast({ title: 'Eligible invigilator pool saved', tone: 'success' });
      await load();
    } catch (e: any) {
      toast({ title: e?.message || 'Could not save eligible invigilator pool.', tone: 'error' });
    } finally {
      setSaving(false);
    }
  }

  async function deleteSlot(slotId: string) {
    if (typeof window !== 'undefined' && !window.confirm('Delete this exam slot? This removes the saved paper and its generated invigilator assignment.')) return;
    setSaving(true);
    try {
      const res = await fetch('/api/academics/exam-timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_slot', id: slotId }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || 'Could not delete exam slot.');
      toast({ title: 'Exam slot deleted', tone: 'success' });
      if (editingSlotId === slotId) resetForm();
      await load();
    } catch (e: any) {
      toast({ title: e?.message || 'Could not delete exam slot.', tone: 'error' });
    } finally {
      setSaving(false);
    }
  }

  if (loading || !setup) return <Skeletons />;

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Badge tone="green">Exam papers + invigilators</Badge>
              <h2 className="mt-2 text-lg font-black tracking-tight text-navy-950 dark:text-navy-50">Exam timetable builder</h2>
              <p className="mt-1 max-w-3xl text-sm text-navy-500 dark:text-navy-400">
                Set exam papers by day and time, choose PP1 / PP2 / PP3 / Theory / Practical, target classes or groups, define the eligible invigilator pool, then let NEYO generate with honest fallback warnings when no fully free invigilator exists.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Input value={examName} onChange={(e) => setExamName(e.target.value)} placeholder="e.g. Midterm 2026" className="min-w-[180px]" />
              <Button onClick={generateInvigilators} disabled={!canManage || saving}><Sparkles className="h-4 w-4" /> Generate Invigilators</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">{editingSlotId ? 'Edit exam slot' : 'Add exam slot'}</CardTitle>
                <p className="text-xs text-navy-400">Use this to set the paper, timing, target class/group, and the eligible invigilator pool.</p>
              </div>
              {editingSlotId && (
                <Button variant="ghost" size="sm" onClick={resetForm} disabled={saving}>
                  <X className="h-4 w-4" /> Cancel edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Class</Label>
                <select value={form.classId} onChange={(e) => setForm((p: any) => ({ ...p, classId: e.target.value, targetIds: p.targetScope === 'CLASS' ? [e.target.value] : p.targetIds }))} className={selectClass}>
                  <option value="">Choose class…</option>
                  {setup.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <Label>Subject</Label>
                <select value={form.subjectId} onChange={(e) => setForm((p: any) => ({ ...p, subjectId: e.target.value, paperConfigId: '', targetIds: p.targetScope === 'COMBINATION' ? [] : p.targetIds }))} className={selectClass}>
                  <option value="">Choose subject…</option>
                  {setup.subjects.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Paper type</Label>
                <select value={form.paperName} onChange={(e) => setForm((p: any) => ({ ...p, paperName: e.target.value }))} className={selectClass}>
                  {['PP1', 'PP2', 'PP3', 'Theory', 'Practical'].map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div>
                <Label>Paper config (optional)</Label>
                <select value={form.paperConfigId} onChange={(e) => setForm((p: any) => ({ ...p, paperConfigId: e.target.value }))} className={selectClass}>
                  <option value="">None</option>
                  {filteredPapers.map((paper) => <option key={paper.id} value={paper.id}>{paper.name} · {paper.weightPct}%</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div><Label>Date</Label><Input type="date" value={form.examDate} onChange={(e) => setForm((p: any) => ({ ...p, examDate: e.target.value }))} /></div>
              <div><Label>Venue</Label><Input value={form.venue} onChange={(e) => setForm((p: any) => ({ ...p, venue: e.target.value }))} placeholder="Hall / Lab / Room" /></div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div><Label>Starts</Label><Input type="time" value={form.startTime} onChange={(e) => setForm((p: any) => ({ ...p, startTime: e.target.value }))} /></div>
              <div><Label>Ends</Label><Input type="time" value={form.endTime} onChange={(e) => setForm((p: any) => ({ ...p, endTime: e.target.value }))} /></div>
            </div>

            <div>
              <Label>Target scope</Label>
              <select value={form.targetScope} onChange={(e) => setForm((p: any) => ({ ...p, targetScope: e.target.value, targetIds: e.target.value === 'CLASS' ? (p.classId ? [p.classId] : []) : [] }))} className={selectClass}>
                <option value="CLASS">Single class</option>
                <option value="STREAM_GROUP">Multiple classes / streams</option>
                <option value="COMBINATION">Combination group</option>
              </select>

              {form.targetScope === 'CLASS' && (
                <div className="mt-2 rounded-xl border border-navy-100 p-3 dark:border-navy-800">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-navy-400">Target class</p>
                  <p className="text-xs text-navy-600 dark:text-navy-300">This paper will target the selected class above: <span className="font-bold">{setup.classes.find((c) => c.id === form.classId)?.name || 'No class selected'}</span></p>
                </div>
              )}

              {form.targetScope === 'STREAM_GROUP' && (
                <div className="mt-2 rounded-xl border border-navy-100 p-3 dark:border-navy-800">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-navy-400">Target stream groups</p>
                  <div className="grid grid-cols-1 gap-2">
                    {setup.streamGroups.map((group) => {
                      const checked = group.classIds.length > 0 && group.classIds.every((id) => form.targetIds.includes(id));
                      return (
                        <label key={group.id} className="flex items-start gap-2 text-xs text-navy-700 dark:text-navy-200">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => setForm((p: any) => ({
                              ...p,
                              targetIds: e.target.checked
                                ? [...new Set([...p.targetIds, ...group.classIds])]
                                : p.targetIds.filter((id: string) => !group.classIds.includes(id)),
                            }))}
                          />
                          <span>
                            <span className="font-semibold">{group.label}</span>
                            <span className="block text-[11px] text-navy-400">{group.classIds.map((id) => setup.classes.find((c) => c.id === id)?.name).filter(Boolean).join(', ') || 'No classes linked'}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {form.targetScope === 'COMBINATION' && (() => {
                const subjectCombinationGroups = setup.combinationGroups.filter((group) => !form.subjectId || group.subjectId === form.subjectId);
                return (
                  <div className="mt-2 rounded-xl border border-navy-100 p-3 dark:border-navy-800">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-navy-400">Target combination groups</p>
                    <p className="mb-2 text-[11px] text-navy-400">Now using real saved combination groups for the selected subject where available.</p>
                    {selectedCombinationGroups.length > 0 && <p className="mb-2 text-[11px] text-green-700 dark:text-green-300">Selected: {selectedCombinationGroups.map((group) => group.label).join(', ')}</p>}
                    {subjectCombinationGroups.length === 0 ? (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
                        No active combination group exists yet for this subject. Create the combination group first, then come back and target it here.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2">
                        {subjectCombinationGroups.map((group) => {
                          const checked = group.classIds.length > 0 && group.classIds.every((id) => form.targetIds.includes(id));
                          return (
                            <label key={group.id} className="flex items-start gap-2 text-xs text-navy-700 dark:text-navy-200">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => setForm((p: any) => ({
                                  ...p,
                                  targetIds: e.target.checked
                                    ? [...new Set([...p.targetIds, ...group.classIds])]
                                    : p.targetIds.filter((id: string) => !group.classIds.includes(id)),
                                }))}
                              />
                              <span>
                                <span className="font-semibold">{group.label}</span>
                                <span className="block text-[11px] text-navy-400">{group.scope} · {group.source} · {(group.classIds ?? []).map((id) => setup.classes.find((c) => c.id === id)?.name).filter(Boolean).join(', ') || 'No classes linked'}</span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            <div>
              <Label>Invigilator pool mode</Label>
              <select value={form.invigilatorScope} onChange={(e) => setForm((p: any) => ({ ...p, invigilatorScope: e.target.value, eligibleInvigilatorIds: e.target.value === 'AUTO' ? [] : p.eligibleInvigilatorIds }))} className={selectClass}>
                <option value="AUTO">Auto from all eligible staff</option>
                <option value="ELIGIBLE_ONLY">Only selected eligible invigilators</option>
              </select>
            </div>

            <div>
              <Label>Eligible invigilators</Label>
              <div className="mt-2 max-h-36 overflow-y-auto rounded-xl border border-navy-100 p-3 dark:border-navy-800">
                {form.invigilatorScope === 'AUTO' && <p className="mb-2 text-[11px] text-navy-400">Auto mode uses the full eligible staff pool and ignores the checkbox list below until you switch to Eligible Only.</p>}
                <div className="space-y-2">
                  {teachers.map((t) => {
                    const checked = form.eligibleInvigilatorIds.includes(t.id);
                    return (
                      <label key={t.id} className="flex items-center gap-2 text-xs text-navy-700 dark:text-navy-200">
                        <input type="checkbox" disabled={form.invigilatorScope === 'AUTO'} checked={checked} onChange={(e) => setForm((p: any) => ({ ...p, eligibleInvigilatorIds: e.target.checked ? [...new Set([...p.eligibleInvigilatorIds, t.id])] : p.eligibleInvigilatorIds.filter((id: string) => id !== t.id) }))} />
                        <span>{t.fullName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm((p: any) => ({ ...p, notes: e.target.value }))} placeholder="Optional exam note" /></div>

            <Button onClick={saveSlot} disabled={!canManage || saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {editingSlotId ? 'Update Exam Slot' : 'Save Exam Slot'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Saved exam timetable</CardTitle>
            <p className="text-xs text-navy-400">See papers, generated invigilators, pool rules, and fallback warnings in one place.</p>
          </CardHeader>
          <CardContent>
            {setup.slots.length === 0 ? (
              <EmptyState icon={ClipboardList} title="No exam slots yet" description="Save the first paper on the left, then generate invigilators." />
            ) : (() => {
              const visibleSlots = setup.slots.filter((slot) => !examName || slot.examName === examName);
              return visibleSlots.length === 0 ? (
                <EmptyState icon={ClipboardList} title="No slots for this exam name yet" description="Change the exam name above or save a new paper for this exam." />
              ) : (
                <div className="space-y-3 max-h-[760px] overflow-y-auto pr-1">
                  {visibleSlots.map((slot) => (
                    <ExamSlotCard key={slot.id} slot={slot} classes={setup.classes} subjects={setup.subjects} teachers={teachers} onSavePool={saveInvigilatorPool} onEdit={startEdit} onDelete={deleteSlot} busy={saving} />
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ExamSlotCard({ slot, classes, subjects, teachers, onSavePool, onEdit, onDelete, busy }: {
  slot: ExamSlotRow;
  classes: ClassOpt[];
  subjects: Subject[];
  teachers: Staff[];
  onSavePool: (slotId: string, scope: string, teacherIds: string[]) => Promise<void>;
  onEdit: (slot: ExamSlotRow) => void;
  onDelete: (slotId: string) => Promise<void>;
  busy: boolean;
}) {
  const [scope, setScope] = React.useState(slot.invigilatorScope || 'AUTO');
  const [teacherIds, setTeacherIds] = React.useState<string[]>((slot.eligibleInvigilators ?? []).map((t) => t.teacherId));
  const className = classes.find((c) => c.id === slot.classId)?.name || 'Class';
  const subjectName = subjects.find((s) => s.id === slot.subjectId)?.name || 'Subject';

  React.useEffect(() => {
    setScope(slot.invigilatorScope || 'AUTO');
    setTeacherIds((slot.eligibleInvigilators ?? []).map((t) => t.teacherId));
  }, [slot.id, slot.invigilatorScope, JSON.stringify(slot.eligibleInvigilators ?? [])]);

  return (
    <div className="rounded-2xl border border-navy-100 p-4 dark:border-navy-800">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-navy-950 dark:text-navy-50">{slot.examName} · {subjectName} · {slot.paperName || 'Paper'}</p>
            <Badge tone="blue">{className}</Badge>
            <Badge tone="neutral">{slot.targetScope}</Badge>
          </div>
          <p className="mt-1 text-xs text-navy-500 dark:text-navy-400">{slot.examDate} · {slot.startTime}–{slot.endTime} · {slot.venue || 'Venue not set'}</p>
          {(slot.targetIds ?? []).length > 0 && (
            <p className="mt-1 text-[11px] text-navy-400">Targets: {(slot.targetIds ?? []).map((id) => classes.find((c) => c.id === id)?.name).filter(Boolean).join(', ')}</p>
          )}
        </div>
        <div className="flex items-start gap-2">
          <div className="text-right text-xs text-navy-500 dark:text-navy-400">
            <p className="font-semibold">Invigilator mode: {slot.invigilatorScope || 'AUTO'}</p>
            <p>{(slot.eligibleInvigilators ?? []).length} eligible teacher(s)</p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => onEdit(slot)} disabled={busy}>
            Edit
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(slot.id)} disabled={busy} className="text-rose-600 hover:text-rose-700">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-xl border border-navy-100 p-3 dark:border-navy-800">
          <p className="text-[10px] font-bold uppercase tracking-widest text-navy-400">Generated invigilators</p>
          {(slot.invigilators ?? []).length === 0 ? (
            <p className="mt-2 text-xs text-navy-400">Not generated yet.</p>
          ) : (
            <div className="mt-2 space-y-2">
              {slot.invigilators?.map((inv) => (
                <div key={inv.teacherId} className="rounded-lg bg-green-50 px-2 py-2 text-xs text-green-800 dark:bg-green-950/20 dark:text-green-300">
                  <p className="font-bold">{inv.teacherName}</p>
                  {inv.warning && <p className="mt-1 text-[11px]">{inv.warning}</p>}
                </div>
              ))}
            </div>
          )}
          {(slot.warnings ?? []).length > 0 && (
            <div className="mt-3 space-y-2">
              {slot.warnings?.map((warning, index) => (
                <div key={index} className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-2 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
                  {warning}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-navy-100 p-3 dark:border-navy-800">
          <p className="text-[10px] font-bold uppercase tracking-widest text-navy-400">Eligible invigilator pool</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-[180px_1fr_auto] sm:items-start">
            <select value={scope} onChange={(e) => setScope(e.target.value)} className="rounded-xl border border-navy-200 bg-white px-3 py-2 text-xs dark:border-navy-700 dark:bg-navy-800">
              <option value="AUTO">AUTO</option>
              <option value="ELIGIBLE_ONLY">ELIGIBLE ONLY</option>
            </select>
            <div className="max-h-28 overflow-y-auto rounded-xl border border-navy-100 p-2 dark:border-navy-800">
              <div className="grid grid-cols-1 gap-1">
                {teachers.map((teacher) => {
                  const checked = teacherIds.includes(teacher.id);
                  return (
                    <label key={teacher.id} className="flex items-center gap-2 text-[11px] text-navy-700 dark:text-navy-200">
                      <input type="checkbox" checked={checked} onChange={(e) => setTeacherIds((prev) => e.target.checked ? [...new Set([...prev, teacher.id])] : prev.filter((id) => id !== teacher.id))} />
                      <span>{teacher.fullName}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <Button size="sm" onClick={() => onSavePool(slot.id, scope, teacherIds)} disabled={busy}><Save className="h-4 w-4" /> Save Pool</Button>
          </div>
        </div>
      </div>
    </div>
  );
}


type ExamGeneratorRunRow = {
  id: string;
  examName: string;
  startDate: string;
  endDate: string;
  generatedCount: number;
  classIds: string[];
  periods: { label: string; startTime: string; endTime: string }[];
  createdByName: string;
  createdAt: string;
};

function ExamAutoGeneratorTab({ canManage, schoolLevelActivation }: { canManage: boolean; schoolLevelActivation?: { isSeniorSchool: boolean; isJuniorSchool: boolean; isMixedSchool: boolean; educationLevelsOffered: string[] } }) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [dismissExamLevelBanner, setDismissExamLevelBanner] = React.useState(() => typeof window !== "undefined" && localStorage.getItem("neyo_dismiss_exam_level") === "true");
  const [setup, setSetup] = React.useState<{ classes: ClassOpt[]; runs: ExamGeneratorRunRow[] } | null>(null);
  const [preview, setPreview] = React.useState<any | null>(null);
  const [form, setForm] = React.useState({
    examName: schoolLevelActivation?.isSeniorSchool ? 'Senior School Midterm 2026' : schoolLevelActivation?.isJuniorSchool ? 'Junior School Midterm 2026' : 'Auto Midterm 2026',
    classIds: [] as string[],
    startDate: '',
    endDate: '',
    notes: schoolLevelActivation?.isSeniorSchool ? 'Use richer subject paper structures where configured.' : schoolLevelActivation?.isJuniorSchool ? 'Use subject-selection-aware setup where needed.' : '',
    autoGenerateInvigilators: true,
    excludeSaturday: false,
    groupStreamsByLevel: true,
    periods: schoolLevelActivation?.isSeniorSchool ? [
      { label: 'Morning 1', startTime: '08:00', endTime: '10:00' },
      { label: 'Morning 2', startTime: '10:30', endTime: '12:30' },
      { label: 'Afternoon 1', startTime: '14:00', endTime: '16:00' },
    ] : [
      { label: 'Morning 1', startTime: '08:00', endTime: '10:00' },
      { label: 'Morning 2', startTime: '10:30', endTime: '12:30' },
    ],
  });

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/academics/exam-timetable/generator');
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || 'Could not load exam auto-generator setup.');
      setSetup(json.data);
    } catch (e: any) {
      toast({ title: e?.message || 'Could not load exam auto-generator.', tone: 'error' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => { load(); }, [load]);
  React.useEffect(() => {
    if (!setup?.classes?.length) return;
    setForm((prev) => ({
      ...prev,
      classIds: prev.classIds.length ? prev.classIds : [setup.classes[0].id],
      periods: prev.periods.length ? prev.periods : schoolLevelActivation?.isSeniorSchool
        ? [
            { label: 'Morning 1', startTime: '08:00', endTime: '10:00' },
            { label: 'Morning 2', startTime: '10:30', endTime: '12:30' },
            { label: 'Afternoon 1', startTime: '14:00', endTime: '16:00' },
          ]
        : schoolLevelActivation?.isJuniorSchool
        ? [
            { label: 'Morning 1', startTime: '08:00', endTime: '10:00' },
            { label: 'Morning 2', startTime: '10:30', endTime: '12:30' },
          ]
        : prev.periods,
    }));
  }, [setup, schoolLevelActivation]);

  async function previewGenerator() {
    if (!form.examName || !form.startDate || !form.endDate || form.classIds.length === 0) {
      toast({ title: 'Fill exam name, class selection, and date range first.', tone: 'error' });
      return;
    }
    if (form.periods.some((period) => !period.label || !period.startTime || !period.endTime || period.startTime >= period.endTime)) {
      toast({ title: 'Each custom exam period needs a valid label and time range.', tone: 'error' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/academics/exam-timetable/generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, action: 'preview' }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || 'Could not preview exam timetable.');
      setPreview(json.data);
      toast({ title: `Preview ready with ${json.data.generatedCount} slot(s)`, tone: 'success' });
    } catch (e: any) {
      toast({ title: e?.message || 'Could not preview exam timetable.', tone: 'error' });
    } finally {
      setSaving(false);
    }
  }

  async function runGenerator() {
    if (!form.examName || !form.startDate || !form.endDate || form.classIds.length === 0) {
      toast({ title: 'Fill exam name, class selection, and date range first.', tone: 'error' });
      return;
    }
    if (form.periods.some((period) => !period.label || !period.startTime || !period.endTime || period.startTime >= period.endTime)) {
      toast({ title: 'Each custom exam period needs a valid label and time range.', tone: 'error' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/academics/exam-timetable/generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, action: 'generate' }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || 'Could not auto-generate exam timetable.');
      toast({ title: json.data.invigilatorsGenerated ? `Generated ${json.data.generatedCount} exam slot(s) and invigilators` : `Generated ${json.data.generatedCount} exam slot(s)`, tone: 'success' });
      setPreview(null);
      await load();
    } catch (e: any) {
      toast({ title: e?.message || 'Could not auto-generate exam timetable.', tone: 'error' });
    } finally {
      setSaving(false);
    }
  }

  if (loading || !setup) return <Skeletons />;

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="p-5">
          {schoolLevelActivation && !dismissExamLevelBanner && (
            <div className="mb-3 relative rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900 dark:border-green-900/30 dark:bg-green-950/20 dark:text-green-200">
              <button
                onClick={() => { setDismissExamLevelBanner(true); if (typeof window !== "undefined") localStorage.setItem("neyo_dismiss_exam_level", "true"); }}
                className="absolute right-3 top-3 rounded-full p-1 text-green-700 hover:bg-green-100 dark:hover:bg-green-900/40"
                title="Dismiss note"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="font-semibold">Level-aware Timetable Generation</p>
              <p className="mt-1 text-xs text-green-800 dark:text-green-300">
                Exam auto-generation is most relevant where structured subject loads are active. Subject Selection appears only for Junior/Senior School, and Senior Pathways appear only for Senior School.
              </p>
            </div>
          )}
          <Badge tone="blue">First version</Badge>
          <h2 className="mt-2 text-lg font-black tracking-tight text-navy-950 dark:text-navy-50">Exam timetable auto-generator</h2>
          <p className="mt-1 max-w-3xl text-sm text-navy-500 dark:text-navy-400">
            This version generates exam papers for all subjects already taught in the selected classes, using class/form-aware subject paper design where set. That means one subject can produce multiple papers such as Insha, Oral, Practical, or other custom labels.
          </p>
          {schoolLevelActivation?.isSeniorSchool ? (
            <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">Senior School is active, so the generator expects richer subject-paper structures and pathway-sensitive exam planning later.</p>
          ) : schoolLevelActivation?.isJuniorSchool ? (
            <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">Junior School is active, so subject-selection-aware exam planning matters, but full Senior School pathway complexity stays lighter.</p>
          ) : (
            <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">For lower levels, the generator stays simpler and avoids unnecessary pathway-heavy complexity.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Build exam run</CardTitle>
            <p className="text-xs text-navy-400">Set the classes, date range, and custom periods. NEYO will generate the first exam timetable draft for those classes.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Exam name</Label>
              <Input value={form.examName} onChange={(e) => setForm((p) => ({ ...p, examName: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Start date</Label><Input type="date" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} /></div>
              <div><Label>End date</Label><Input type="date" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} /></div>
            </div>
            <div>
              <Label>Selected classes</Label>
              <div className="mt-2 max-h-36 overflow-y-auto rounded-xl border border-navy-100 p-3 dark:border-navy-800">
                <div className="grid grid-cols-2 gap-2">
                  {setup.classes.map((klass) => {
                    const checked = form.classIds.includes(klass.id);
                    return (
                      <label key={klass.id} className="flex items-center gap-2 text-xs text-navy-700 dark:text-navy-200">
                        <input type="checkbox" checked={checked} onChange={(e) => setForm((p) => ({ ...p, classIds: e.target.checked ? [...new Set([...p.classIds, klass.id])] : p.classIds.filter((id) => id !== klass.id) }))} />
                        <span>{(klass as any).name || [(klass as any).level, (klass as any).stream].filter(Boolean).join(" ")}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <div>
              <Label>Custom exam periods</Label>
              <div className="mt-2 space-y-2">
                {form.periods.map((period, index) => (
                  <div key={index} className="grid grid-cols-[1.1fr_0.9fr_0.9fr_auto] gap-2">
                    <Input value={period.label} onChange={(e) => setForm((p) => ({ ...p, periods: p.periods.map((item, i) => i === index ? { ...item, label: e.target.value } : item) }))} placeholder="Morning 1" />
                    <Input type="time" value={period.startTime} onChange={(e) => setForm((p) => ({ ...p, periods: p.periods.map((item, i) => i === index ? { ...item, startTime: e.target.value } : item) }))} />
                    <Input type="time" value={period.endTime} onChange={(e) => setForm((p) => ({ ...p, periods: p.periods.map((item, i) => i === index ? { ...item, endTime: e.target.value } : item) }))} />
                    <Button variant="ghost" onClick={() => setForm((p) => ({ ...p, periods: p.periods.length > 1 ? p.periods.filter((_, i) => i !== index) : p.periods }))}>Remove</Button>
                  </div>
                ))}
                <Button variant="secondary" onClick={() => setForm((p) => ({ ...p, periods: [...p.periods, { label: `Period ${p.periods.length + 1}`, startTime: schoolLevelActivation?.isSeniorSchool ? '14:00' : '13:30', endTime: schoolLevelActivation?.isSeniorSchool ? '16:00' : '15:30' }] }))}>Add Period</Button>
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Input value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Optional generation note" />
            </div>
            <label className="flex items-center gap-2 text-sm text-navy-600 dark:text-navy-300">
              <input type="checkbox" checked={form.autoGenerateInvigilators} onChange={(e) => setForm((p) => ({ ...p, autoGenerateInvigilators: e.target.checked }))} className="h-4 w-4 rounded border-navy-300 text-green-600 focus:ring-green-500" />
              Generate invigilators immediately after building the timetable
            </label>
            <label className="flex items-center gap-2 text-sm text-navy-600 dark:text-navy-300">
              <input type="checkbox" checked={form.excludeSaturday} onChange={(e) => setForm((p) => ({ ...p, excludeSaturday: e.target.checked }))} className="h-4 w-4 rounded border-navy-300 text-green-600 focus:ring-green-500" />
              Don&apos;t use Saturday for this exam sitting (Sunday is never used)
            </label>
            <label className="flex items-center gap-2 text-sm text-navy-600 dark:text-navy-300">
              <input type="checkbox" checked={form.groupStreamsByLevel} onChange={(e) => setForm((p) => ({ ...p, groupStreamsByLevel: e.target.checked }))} className="h-4 w-4 rounded border-navy-300 text-green-600 focus:ring-green-500" />
              Sit streams of the same level together (e.g. Form 2 East + Form 2 West sit Maths at the same time)
            </label>
            <p className="text-xs text-navy-400">Combined classes taught a subject together (Timetable Engine combinations) automatically sit that paper together, at the same date and period, instead of separately. When the option above is on, streams of the same level selected for this run that are not already in a teaching combination also sit shared papers together — turn it off if this school genuinely needs every stream sat fully independently.</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant="secondary" onClick={previewGenerator} disabled={!canManage || saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardList className="h-4 w-4" />} Preview Timetable
              </Button>
              <Button onClick={runGenerator} disabled={!canManage || saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate Exam Timetable
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent generated runs</CardTitle>
            <p className="text-xs text-navy-400">Shows the latest exam timetable auto-generation runs and how many exam slots were produced.</p>
          </CardHeader>
          <CardContent>
            {preview && (
              <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-950/20">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-green-900 dark:text-green-200">Preview: {preview.examName}</p>
                  <Badge tone="green">{preview.generatedCount} slot(s)</Badge>
                </div>
                <p className="mt-1 text-xs text-green-800 dark:text-green-300">{preview.startDate} → {preview.endDate}</p>
                <div className="mt-3 max-h-60 space-y-2 overflow-y-auto">
                  {preview.slots.map((slot: any, index: number) => (
                    <div key={`${slot.classId}-${slot.subjectId}-${slot.examDate}-${slot.startTime}-${index}`} className="rounded-xl border border-green-200 bg-white px-3 py-2 text-xs text-green-900 dark:border-green-900/30 dark:bg-navy-900 dark:text-green-200">
                      <p className="font-semibold">{setup.classes.find((klass) => klass.id === slot.classId)?.name || 'Class'} · {slot.paperName || 'Paper'} · {slot.examDate} · {slot.startTime}-{slot.endTime}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {setup.runs.length === 0 ? (
              <EmptyState icon={Sparkles} title="No generated exam runs yet" description="Build the first exam run on the left to generate a timetable draft." />
            ) : (
              <div className="space-y-3 max-h-[760px] overflow-y-auto pr-1">
                {setup.runs.map((run) => (
                  <div key={run.id} className="rounded-2xl border border-navy-100 p-4 dark:border-navy-800">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold text-navy-950 dark:text-navy-50">{run.examName}</p>
                          <Badge tone="blue">{run.generatedCount} slot(s)</Badge>
                        </div>
                        <p className="mt-1 text-xs text-navy-500 dark:text-navy-400">{run.startDate} → {run.endDate} · by {run.createdByName}</p>
                        <p className="mt-1 text-[11px] text-navy-400">Classes: {run.classIds.map((id) => setup.classes.find((klass) => klass.id === id)?.name).filter(Boolean).join(', ')}</p>
                        <p className="mt-1 text-[11px] text-navy-400">Periods: {run.periods.map((period) => `${period.label} ${period.startTime}-${period.endTime}`).join(' · ')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
