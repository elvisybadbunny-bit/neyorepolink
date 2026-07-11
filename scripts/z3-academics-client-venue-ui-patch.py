#!/usr/bin/env python3
"""
Idempotent patch script for the Z.3 real Venue/Lab management UI in
src/components/academics/academics-client.tsx (the "Smart Timetable" tab's
TimetableEngineTab component). This file has been observed reverting to its
pre-Z.3 state during this session's fragile-file wipes (unusual — most
wipes hit src/lib/services, but this UI component was hit at least once
too). Run this any time `grep -c "Venues & Labs"
src/components/academics/academics-client.tsx` returns 0.

Adds:
 - MapPin, Tag icon imports.
 - venues/venueForm/venueSaving state.
 - venues fetched in load().
 - saveVenue()/deleteVenueRow()/setVenueShortCode()/setTeacherShortCode()
   action handlers.
 - venueId wired into saveNeed()'s POST body.
 - venueId field + reset default on combinationForm.
 - a venue-picker <select> on the Combination Group form.
 - a venue-picker on each class-subject-need row.
 - a new "Venues & Labs" management card + a new "Teacher print codes" card.

Safe to re-run: idempotent, no-op on an already-patched file.
"""
import sys

PATH = "src/components/academics/academics-client.tsx"

with open(PATH, "r") as f:
    src = f.read()

applied = []


def must_apply(name, old, new, required=True):
    global src
    if new in src:
        return
    if old not in src:
        if required:
            print(f"FATAL: anchor for patch '{name}' not found — file structure changed unexpectedly.")
            sys.exit(1)
        else:
            print(f"WARNING: anchor for patch '{name}' not found — skipping (already applied differently?).")
            return
    src = src.replace(old, new, 1)
    applied.append(name)


# ---------------------------------------------------------------------------
# PATCH 1 — icon imports.
# ---------------------------------------------------------------------------
must_apply(
    "icon imports",
    """import {
  BookOpen, Building2, CalendarRange, Grid3X3, NotebookPen, Plus,
  AlertCircle, Loader2, X, Sparkles, Trash2, Check, Calendar, Printer, Palette, Sliders, Info, HelpCircle, Save, Trophy,
  Calculator, FileText, Clock3, Wand2, RefreshCw, Link2, Ban, Users, TimerReset, ShieldCheck, RotateCcw, ClipboardList,
  GraduationCap
} from "lucide-react";""",
    """import {
  BookOpen, Building2, CalendarRange, Grid3X3, NotebookPen, Plus,
  AlertCircle, Loader2, X, Sparkles, Trash2, Check, Calendar, Printer, Palette, Sliders, Info, HelpCircle, Save, Trophy,
  Calculator, FileText, Clock3, Wand2, RefreshCw, Link2, Ban, Users, TimerReset, ShieldCheck, RotateCcw, ClipboardList,
  GraduationCap, MapPin, Tag
} from "lucide-react";""",
)

# ---------------------------------------------------------------------------
# PATCH 2 — venue state + combinationForm.venueId.
# ---------------------------------------------------------------------------
must_apply(
    "venue state",
    """  const [combinationForm, setCombinationForm] = React.useState<any>({
    id: "",
    name: "",
    subjectId: "",
    teacherId: "",
    lessonsPerWeek: 4,
    doubleCount: 0,
    scope: "SELECTED",
    source: "MANUAL",
    classIds: [] as string[],
  });""",
    """  const [combinationForm, setCombinationForm] = React.useState<any>({
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
  });
  // Z.3 — real Venue/Lab pool state.
  const [venues, setVenues] = React.useState<any[]>([]);
  const [venueForm, setVenueForm] = React.useState<any>({ id: "", name: "", shortCode: "", capacityPerPeriod: 1, supportsSubjectIds: [] as string[] });
  const [venueSaving, setVenueSaving] = React.useState(false);""",
)

# ---------------------------------------------------------------------------
# PATCH 3 — load() fetches venues too.
# ---------------------------------------------------------------------------
must_apply(
    "load() venues fetch",
    """  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [engineRes, generatorRes, jobRes, teacherRes] = await Promise.all([
        fetch("/api/academics/timetable/engine"),
        fetch("/api/academics/timetable/generator"),
        fetch("/api/academics/timetable/generate-job"),
        fetch("/api/conversations/recipients"),
      ]);
      const [engineJson, generatorJson, jobJson, teacherJson] = await Promise.all([
        engineRes.json(), generatorRes.json(), jobRes.json(), teacherRes.json(),
      ]);
      if (!engineJson.ok || !generatorJson.ok) throw new Error("Failed to load timetable engine data.");
      setPayload(engineJson.data);
      setJob(jobJson.ok ? jobJson.data.job : null);
      setClasses(generatorJson.data.classes ?? []);
      setSubjects((generatorJson.data.subjects ?? []).filter((s: any) => !s.archived));
      setClassNeeds(generatorJson.data.needsByClassId ?? {});
      setTeachers((teacherJson.ok ? teacherJson.data.recipients : []).filter((u: any) => ["TEACHER", "CLASS_TEACHER", "HOD", "DEPUTY_PRINCIPAL", "PRINCIPAL", "SCHOOL_OWNER", "DEAN_OF_STUDIES"].includes(u.role)));
    } catch {
      toast({ title: "Could not load smart timetable settings.", tone: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);""",
    """  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [engineRes, generatorRes, jobRes, teacherRes, venueRes] = await Promise.all([
        fetch("/api/academics/timetable/engine"),
        fetch("/api/academics/timetable/generator"),
        fetch("/api/academics/timetable/generate-job"),
        fetch("/api/conversations/recipients"),
        fetch("/api/academics/timetable/venues"),
      ]);
      const [engineJson, generatorJson, jobJson, teacherJson, venueJson] = await Promise.all([
        engineRes.json(), generatorRes.json(), jobRes.json(), teacherRes.json(), venueRes.json(),
      ]);
      if (!engineJson.ok || !generatorJson.ok) throw new Error("Failed to load timetable engine data.");
      setPayload(engineJson.data);
      setJob(jobJson.ok ? jobJson.data.job : null);
      setClasses(generatorJson.data.classes ?? []);
      setSubjects((generatorJson.data.subjects ?? []).filter((s: any) => !s.archived));
      setClassNeeds(generatorJson.data.needsByClassId ?? {});
      setTeachers((teacherJson.ok ? teacherJson.data.recipients : []).filter((u: any) => ["TEACHER", "CLASS_TEACHER", "HOD", "DEPUTY_PRINCIPAL", "PRINCIPAL", "SCHOOL_OWNER", "DEAN_OF_STUDIES"].includes(u.role)));
      setVenues(venueJson.ok ? venueJson.data.venues ?? [] : []);
    } catch {
      toast({ title: "Could not load smart timetable settings.", tone: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);""",
)

# ---------------------------------------------------------------------------
# PATCH 4 — saveNeed() sends venueId.
# ---------------------------------------------------------------------------
must_apply(
    "saveNeed venueId",
    """      const body = {
        action: "save_need",
        classId,
        subjectId,
        lessonsPerWeek: Number(patch.lessonsPerWeek ?? current.lessonsPerWeek ?? 0),
        teacherId: patch.teacherId ?? current.teacherId ?? null,
        doubleCount: Number(patch.doubleCount ?? current.doubleCount ?? 0),
        allowSplitDouble: Boolean(patch.allowSplitDouble ?? current.allowSplitDouble ?? false),
      };""",
    """      const body = {
        action: "save_need",
        classId,
        subjectId,
        lessonsPerWeek: Number(patch.lessonsPerWeek ?? current.lessonsPerWeek ?? 0),
        teacherId: patch.teacherId ?? current.teacherId ?? null,
        doubleCount: Number(patch.doubleCount ?? current.doubleCount ?? 0),
        allowSplitDouble: Boolean(patch.allowSplitDouble ?? current.allowSplitDouble ?? false),
        venueId: patch.venueId !== undefined ? (patch.venueId || null) : (current.venueId ?? null),
      };""",
)

# ---------------------------------------------------------------------------
# PATCH 5 — saveCombination() resets venueId too.
# ---------------------------------------------------------------------------
must_apply(
    "saveCombination reset venueId",
    """      setCombinationForm({ id: "", name: "", subjectId: "", teacherId: "", lessonsPerWeek: 4, doubleCount: 0, scope: "SELECTED", source: "MANUAL", classIds: [] });
      await load();
      clearDraft(false);
      toast({ title: "Combination group saved", tone: "success" });""",
    """      setCombinationForm({ id: "", name: "", subjectId: "", teacherId: "", lessonsPerWeek: 4, doubleCount: 0, scope: "SELECTED", source: "MANUAL", classIds: [], venueId: "" });
      await load();
      clearDraft(false);
      toast({ title: "Combination group saved", tone: "success" });""",
)

# ---------------------------------------------------------------------------
# PATCH 6 — new venue action handlers, inserted right before runMasterButton.
# ---------------------------------------------------------------------------
must_apply(
    "venue action handlers",
    """  async function deleteCombination(id: string) {
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

  async function runMasterButton() {""",
    """  async function deleteCombination(id: string) {
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
      toast({ title: "Give the venue a real name, e.g. \\"Chemistry Lab\\".", tone: "error" });
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

  async function runMasterButton() {""",
)

# ---------------------------------------------------------------------------
# PATCH 7 — venue-picker on the Combination Group form.
# ---------------------------------------------------------------------------
must_apply(
    "combination form venue picker",
    """                <select value={combinationForm.source} onChange={(e) => setCombinationForm((p: any) => ({ ...p, source: e.target.value }))} className="rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-800">
                  <option value="MANUAL">School-defined classes</option>
                  <option value="SUBJECT_CHOICE">Use student subject choices</option>
                </select>
              </div>
              <div className="max-h-36 overflow-y-auto rounded-2xl border border-navy-100 p-3 dark:border-navy-800">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-navy-400">Member classes</p>""",
    """                <select value={combinationForm.source} onChange={(e) => setCombinationForm((p: any) => ({ ...p, source: e.target.value }))} className="rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-800">
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
              <div className="max-h-36 overflow-y-auto rounded-2xl border border-navy-100 p-3 dark:border-navy-800">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-navy-400">Member classes</p>""",
)

# ---------------------------------------------------------------------------
# PATCH 8 — venue-picker on each class-subject-need row.
# ---------------------------------------------------------------------------
must_apply(
    "class-subject-need row venue picker",
    """                      <div key={subject.id} className="grid grid-cols-[minmax(120px,1.2fr)_84px_84px_130px_1fr_auto] items-center gap-2 rounded-xl border border-navy-50 p-2 text-xs dark:border-navy-800">
                        <div>
                          <p className="font-semibold text-navy-800 dark:text-navy-100">{subject.name}</p>
                          <p className="text-[10px] text-navy-400">{subject.code}</p>
                        </div>
                        <Input type="number" min={0} max={12} defaultValue={current.lessonsPerWeek ?? 0} onBlur={(e) => saveNeed(cls.id, subject.id, { lessonsPerWeek: e.target.value })} />
                        <Input type="number" min={0} max={6} defaultValue={current.doubleCount ?? 0} onBlur={(e) => saveNeed(cls.id, subject.id, { doubleCount: e.target.value })} />
                        <label className="flex items-center gap-2 text-xs text-navy-600 dark:text-navy-300"><input type="checkbox" defaultChecked={Boolean(current.allowSplitDouble)} onChange={(e) => saveNeed(cls.id, subject.id, { allowSplitDouble: e.target.checked })} /> Split double</label>
                        <select defaultValue={current.teacherId ?? ""} onChange={(e) => saveNeed(cls.id, subject.id, { teacherId: e.target.value || null })} className="rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-800">
                          <option value="">Teacher…</option>
                          {teachers.map((t: any) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                        </select>
                        <Badge tone={(current.lessonsPerWeek ?? 0) > 0 ? "green" : "neutral"}>{(current.lessonsPerWeek ?? 0) > 0 ? "Saved" : "Empty"}</Badge>
                      </div>
                    );""",
    """                      <div key={subject.id} className="space-y-1.5 rounded-xl border border-navy-50 p-2 text-xs dark:border-navy-800">
                        <div className="grid grid-cols-[minmax(120px,1.2fr)_84px_84px_130px_1fr_auto] items-center gap-2">
                          <div>
                            <p className="font-semibold text-navy-800 dark:text-navy-100">{subject.name}</p>
                            <p className="text-[10px] text-navy-400">{subject.code}</p>
                          </div>
                          <Input type="number" min={0} max={12} defaultValue={current.lessonsPerWeek ?? 0} onBlur={(e) => saveNeed(cls.id, subject.id, { lessonsPerWeek: e.target.value })} />
                          <Input type="number" min={0} max={6} defaultValue={current.doubleCount ?? 0} onBlur={(e) => saveNeed(cls.id, subject.id, { doubleCount: e.target.value })} />
                          <label className="flex items-center gap-2 text-xs text-navy-600 dark:text-navy-300"><input type="checkbox" defaultChecked={Boolean(current.allowSplitDouble)} onChange={(e) => saveNeed(cls.id, subject.id, { allowSplitDouble: e.target.checked })} /> Split double</label>
                          <select defaultValue={current.teacherId ?? ""} onChange={(e) => saveNeed(cls.id, subject.id, { teacherId: e.target.value || null })} className="rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-800">
                            <option value="">Teacher…</option>
                            {teachers.map((t: any) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                          </select>
                          <Badge tone={(current.lessonsPerWeek ?? 0) > 0 ? "green" : "neutral"}>{(current.lessonsPerWeek ?? 0) > 0 ? "Saved" : "Empty"}</Badge>
                        </div>
                        {venues.length > 0 && (
                          <div className="flex items-center gap-2 pl-1">
                            <MapPin className="h-3 w-3 text-navy-400" />
                            <select defaultValue={current.venueId ?? ""} onChange={(e) => saveNeed(cls.id, subject.id, { venueId: e.target.value || null })} className="rounded-lg border border-navy-100 bg-white px-2 py-1 text-[11px] dark:border-navy-800 dark:bg-navy-900">
                              <option value="">Auto-pick from venue pool</option>
                              {venues.map((v: any) => <option key={v.id} value={v.id}>{v.name} ({v.shortCode})</option>)}
                            </select>
                          </div>
                        )}
                      </div>
                    );""",
)

# ---------------------------------------------------------------------------
# PATCH 9 — new Venue Management card + Teacher print-codes card, inserted
# right after the Combination Groups card closes.
# ---------------------------------------------------------------------------
must_apply(
    "venue management + teacher print-code cards",
    """                    <Button size="sm" variant="ghost" disabled={saving || !canManage} onClick={() => deleteCombination(group.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}""",
    """                    <Button size="sm" variant="ghost" disabled={saving || !canManage} onClick={() => deleteCombination(group.id)}><Trash2 className="h-4 w-4" /></Button>
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
    </div>
  );
}""",
)

# ---------------------------------------------------------------------------
# PATCH 10 — print:hidden on the level-aware banner + the module tabs bar
# (Z.3 print-redesign chrome removal).
# ---------------------------------------------------------------------------
must_apply(
    "banner + tabs-bar print:hidden",
    """      {schoolLevelActivation && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900 dark:border-green-900/30 dark:bg-green-950/20 dark:text-green-200">
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
      <div className="inline-flex max-w-full overflow-x-auto rounded-full border border-navy-200 p-0.5 dark:border-navy-700">""",
    """      {schoolLevelActivation && (
        <div className="print:hidden rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900 dark:border-green-900/30 dark:bg-green-950/20 dark:text-green-200">
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
      <div className="print:hidden inline-flex max-w-full overflow-x-auto rounded-full border border-navy-200 p-0.5 dark:border-navy-700">""",
)

with open(PATH, "w") as f:
    f.write(src)

print(f"Applied {len(applied)} patch(es): {', '.join(applied) if applied else '(none — already up to date)'}")
