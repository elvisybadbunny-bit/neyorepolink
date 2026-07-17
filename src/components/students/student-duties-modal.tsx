"use client";

/**
 * PART K.2 / K.12 — Student Duties 1-Click Auto-Assignment Modal.
 * "Where a school can create duties for students by a click and with the rules set too."
 */
import * as React from "react";
import { Sparkles, CheckCircle2, Loader2, CalendarRange, Plus, X, Trash2, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

interface StudentDutiesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classes: { id: string; name: string }[];
  currentClassId?: string;
  canManage: boolean;
}

export function StudentDutiesModal({ open, onOpenChange, classes, currentClassId = "", canManage }: StudentDutiesModalProps) {
  const { toast } = useToast();
  const [data, setData] = React.useState<{ areas: any[]; assignments: any[] } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [showAddArea, setShowAddArea] = React.useState(false);

  // New duty area form
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [genderConstraint, setGenderConstraint] = React.useState("MIXED");
  const [maxStudents, setMaxStudents] = React.useState("4");

  const load = React.useCallback(async () => {
    if (!open) return;
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (currentClassId) p.set("classId", currentClassId);
      const res = await fetch(`/api/students/duties?${p}`);
      const json = await res.json();
      if (json.ok) setData(json.data);
    } finally {
      setLoading(false);
    }
  }, [open, currentClassId]);

  React.useEffect(() => { load(); }, [load]);

  async function handleAutoAssign() {
    setBusy(true);
    try {
      const res = await fetch("/api/students/duties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "auto_assign", classId: currentClassId || undefined }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: "✓ Student Duties Auto-Assigned!", description: json.data.result.summary, tone: "success" });
        load();
      } else {
        toast({ title: json.error?.message || "Could not auto-assign duties", tone: "error" });
      }
    } catch {
      toast({ title: "Network error during assignment", tone: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateArea() {
    if (!name.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/students/duties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_area",
          area: {
            name: name.trim(),
            description: description.trim() || undefined,
            genderConstraint,
            maxStudents: Number(maxStudents) || 4,
            targetClassIds: currentClassId ? [currentClassId] : [],
          },
        }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: "Duty Area Saved", tone: "success" });
        setName("");
        setDescription("");
        setShowAddArea(false);
        load();
      } else {
        toast({ title: json.error?.message || "Failed to create duty area", tone: "error" });
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleRemoveAssignment(id: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/students/duties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove_assignment", id }),
      });
      if (res.ok) {
        toast({ title: "Assignment removed", tone: "success" });
        load();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[88vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader className="border-b border-navy-100 pb-4 dark:border-navy-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-xl font-black text-navy-950 dark:text-white flex items-center gap-2">
                <CalendarRange className="h-6 w-6 text-amber-500" />
                Student Leadership &amp; Duty Roster Engine (`K.2`)
              </DialogTitle>
              <p className="text-xs font-semibold text-navy-500 dark:text-navy-400 mt-1">
                &ldquo;Where a school can create duties for students by a click and with the rules set too.&rdquo;
              </p>
            </div>
            {canManage && (
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => setShowAddArea(!showAddArea)} disabled={busy} className="rounded-full text-xs font-bold">
                  <Plus className="h-4 w-4 mr-1" /> Add Duty Rule / Area
                </Button>
                <Button onClick={handleAutoAssign} disabled={busy || loading} className="rounded-full bg-amber-600 hover:bg-amber-700 text-white font-black text-xs px-5 py-2.5 shadow-md">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Sparkles className="h-4 w-4 mr-1.5" />}
                  Auto-Assign Student Duties (`1-Click`)
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        {showAddArea && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 space-y-3 dark:border-amber-900/40 dark:bg-amber-950/20">
            <h4 className="text-sm font-bold text-navy-900 dark:text-navy-50">Create Student Duty Area &amp; Assignment Rules (`K.2`)</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <Label>Duty Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dining Hall Monitor / Class Prefect" className="bg-white dark:bg-navy-900" />
              </div>
              <div>
                <Label>Gender Rule</Label>
                <select value={genderConstraint} onChange={(e) => setGenderConstraint(e.target.value)} className="w-full h-10 rounded-xl border border-navy-200 bg-white px-3 text-xs font-bold dark:border-navy-700 dark:bg-navy-900">
                  <option value="MIXED">Mixed (Any Gender)</option>
                  <option value="BOYS_ONLY">Boys Only</option>
                  <option value="GIRLS_ONLY">Girls Only</option>
                </select>
              </div>
              <div>
                <Label>Max Students</Label>
                <Input type="number" min={1} max={50} value={maxStudents} onChange={(e) => setMaxStudents(e.target.value)} className="bg-white dark:bg-navy-900" />
              </div>
            </div>
            <div>
              <Label>Rule Description / Duties</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Inspects classroom cleanliness and reports morning attendance" className="bg-white dark:bg-navy-900" />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button size="sm" variant="secondary" onClick={() => setShowAddArea(false)}>Cancel</Button>
              <Button size="sm" onClick={handleCreateArea} disabled={busy || !name.trim()} className="bg-amber-600 hover:bg-amber-700 text-white font-bold">Save Duty Rule</Button>
            </div>
          </div>
        )}

        {loading || !data ? (
          <div className="py-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-navy-400" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Left: Active Duty Areas & Rules */}
            <div className="md:col-span-1 space-y-3">
              <h4 className="text-sm font-black text-navy-900 dark:text-navy-50 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-blue-500" /> Active Duty Rules (`{data.areas.length}`)
              </h4>
              {data.areas.length === 0 ? (
                <p className="text-xs text-navy-400 italic">No duty areas set up yet. Click &ldquo;Add Duty Rule&rdquo; or apply EE.15 universal presets.</p>
              ) : (
                <ul className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
                  {data.areas.map((a) => (
                    <li key={a.id} className="rounded-xl border border-navy-100 bg-navy-50/50 p-3 space-y-1 dark:border-navy-800 dark:bg-navy-900/50">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-navy-900 dark:text-navy-50">{a.name}</span>
                        <Badge tone={a.genderConstraint === "MIXED" ? "blue" : "amber"} className="text-[10px]">{a.genderConstraint}</Badge>
                      </div>
                      <p className="text-xs text-navy-500 line-clamp-2">{a.description || "No specific duty instructions recorded."}</p>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-navy-600 dark:text-navy-400 pt-1">
                        <span>Capacity Cap: {a.maxStudents} learners</span>
                        <span>{a.isActive ? "Active Rule" : "Paused"}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Right: Current Student Duty Roster */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-sm font-black text-navy-900 dark:text-navy-50 flex items-center justify-between">
                <span>Assigned Student Duties Roster (`{data.assignments.length}`)</span>
                {currentClassId && <Badge tone="neutral">Class Filter Active</Badge>}
              </h4>
              {data.assignments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-navy-200 p-8 text-center dark:border-navy-800">
                  <p className="text-sm font-bold text-navy-600 dark:text-navy-300">No learners currently assigned to duties.</p>
                  <p className="text-xs text-navy-400 mt-1">Click the golden &ldquo;Auto-Assign Student Duties (`1-Click`)&rdquo; button above to generate assignments instantly.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-navy-100 dark:border-navy-800">
                  <table className="w-full border-collapse bg-white text-xs dark:bg-navy-900">
                    <thead>
                      <tr className="bg-warm-50 border-b border-navy-100 text-left font-bold text-navy-700 dark:bg-navy-800 dark:border-navy-700 dark:text-navy-200">
                        <th className="p-3">Learner</th>
                        <th className="p-3">Class</th>
                        <th className="p-3">Duty Post / Role</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.assignments.map((as) => (
                        <tr key={as.id} className="border-b border-navy-100 hover:bg-navy-50/50 dark:border-navy-800 dark:hover:bg-navy-800/50">
                          <td className="p-3 font-bold text-navy-950 dark:text-white">
                            {as.studentName} <span className="font-mono font-normal text-navy-400">({as.admissionNo})</span>
                          </td>
                          <td className="p-3 font-medium text-navy-600 dark:text-navy-300">{as.className}</td>
                          <td className="p-3">
                            <Badge tone="green" className="font-extrabold">{as.dutyAreaName}</Badge>
                          </td>
                          <td className="p-3 text-right">
                            {canManage && (
                              <button onClick={() => handleRemoveAssignment(as.id)} disabled={busy} className="text-red-500 hover:text-red-700 p-1" title="Remove assignment">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
