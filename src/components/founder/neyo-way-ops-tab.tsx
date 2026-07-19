"use client";

import * as React from "react";
import { AlertTriangle, BookOpenCheck, CheckCircle2, Loader2, Plus, RefreshCw, ShieldCheck, Target, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

type Task = { id: string; category: string; title: string; why: string | null; nextAction: string | null; status: "TODO"|"DOING"|"BLOCKED"|"DONE"|"NOT_NOW"; priority: "CRITICAL"|"HIGH"|"MEDIUM"|"LOW"; cadence: "DAILY"|"WEEKLY"|"MONTHLY"|"QUARTERLY"|"ONCE"; dueDate: string | null; evidence: string | null; owner: string };
const empty = { category: "Strategy", title: "", why: "", nextAction: "", status: "TODO" as const, priority: "MEDIUM" as const, cadence: "ONCE" as const, dueDate: "", evidence: "", owner: "Founder" };
const priorityTone = (p: string) => p === "CRITICAL" ? "red" : p === "HIGH" ? "amber" : p === "MEDIUM" ? "blue" : "neutral";

export function NeyoWayOpsTab() {
  const { toast } = useToast();
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [filter, setFilter] = React.useState("ACTIVE");
  const [form, setForm] = React.useState(empty);

  const load = React.useCallback(async () => {
    setLoading(true);
    try { const res = await fetch("/api/ops/founder-system"); const json = await res.json(); if (json.ok) setTasks(json.data.tasks); }
    finally { setLoading(false); }
  }, []);
  React.useEffect(() => { void load(); }, [load]);

  async function seed() {
    setSaving(true);
    try { const res = await fetch("/api/ops/founder-system", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "seed" }) }); const json = await res.json(); if (json.ok) { toast({ title: "NEYO Way operating plan installed", description: `${json.data.seeded} controls are now tracked without duplicating existing ones.`, tone: "success" }); await load(); } }
    finally { setSaving(false); }
  }
  async function saveTask(task: Partial<Task> & { title: string; category: string }) {
    setSaving(true);
    try {
      const payload = { ...empty, ...task, dueDate: task.dueDate || null };
      const res = await fetch("/api/ops/founder-system", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "save", task: payload }) });
      const json = await res.json();
      if (!json.ok) { toast({ title: json.error?.message || "Could not save", tone: "error" }); return; }
      setForm(empty); await load();
    } finally { setSaving(false); }
  }
  async function remove(id: string) {
    if (!confirm("Delete this operating task?")) return;
    await fetch("/api/ops/founder-system", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", id }) });
    await load();
  }

  const visible = tasks.filter((task) => filter === "ALL" ? true : filter === "ACTIVE" ? !["DONE", "NOT_NOW"].includes(task.status) : task.status === filter);
  const counts = { active: tasks.filter((t) => !["DONE","NOT_NOW"].includes(t.status)).length, blocked: tasks.filter((t) => t.status === "BLOCKED").length, done: tasks.filter((t) => t.status === "DONE").length, critical: tasks.filter((t) => t.priority === "CRITICAL" && t.status !== "DONE").length };

  return <div className="space-y-6 text-navy-900 dark:text-navy-100">
    <Card className="border-green-200 bg-green-50/40 dark:border-green-900/40 dark:bg-green-950/10"><CardContent className="p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="flex items-center gap-2 text-xl font-black"><Target className="h-5 w-5 text-green-600"/>The NEYO Way</h2><p className="mt-1 max-w-3xl text-sm text-navy-600 dark:text-navy-300">Your internal operating system: what must happen, why it matters, the next physical action, proof, owner and cadence. It is designed for a solo university founder; it does not assume you must personally be the lawyer, accountant, school operator and security specialist.</p></div><Button onClick={seed} disabled={saving} variant="secondary">{saving ? <Loader2 className="h-4 w-4 animate-spin"/> : <BookOpenCheck className="h-4 w-4"/>}Install/refresh playbook</Button></div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><Metric label="Active" value={counts.active}/><Metric label="Critical open" value={counts.critical} danger={counts.critical > 0}/><Metric label="Blocked" value={counts.blocked} danger={counts.blocked > 0}/><Metric label="Completed" value={counts.done}/></div>
    </CardContent></Card>

    <Card className="border-navy-200 bg-warm-50/80 dark:border-navy-700 dark:bg-navy-900"><CardHeader><CardTitle className="text-base">Founder guardrails</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-3"><Guard icon={ShieldCheck} title="Do not claim what is unproven" text="No live-school, compliance, credential, payment or reliability claim without evidence."/><Guard icon={Target} title="Three active priorities" text="One reliability priority, one school-value priority and one revenue priority at a time."/><Guard icon={AlertTriangle} title="Protect founder capacity" text="University, sleep and health are constraints. Document emergency access and build an advisor circle."/></CardContent></Card>

    <Card className="border-navy-200 bg-warm-50/80 dark:border-navy-700 dark:bg-navy-900"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Plus className="h-4 w-4"/>Add a company action</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Input placeholder="Task title" value={form.title} onChange={(e) => setForm((f) => ({...f,title:e.target.value}))}/><Input placeholder="Area, e.g. Pilots" value={form.category} onChange={(e) => setForm((f) => ({...f,category:e.target.value}))}/><Input placeholder="Next physical action" value={form.nextAction} onChange={(e) => setForm((f) => ({...f,nextAction:e.target.value}))}/><Input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({...f,dueDate:e.target.value}))}/>
      <select value={form.priority} onChange={(e) => setForm((f) => ({...f,priority:e.target.value as typeof f.priority}))} className="h-11 rounded-xl border px-3 dark:bg-navy-900"><option>CRITICAL</option><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select><select value={form.cadence} onChange={(e) => setForm((f) => ({...f,cadence:e.target.value as typeof f.cadence}))} className="h-11 rounded-xl border px-3 dark:bg-navy-900"><option>ONCE</option><option>DAILY</option><option>WEEKLY</option><option>MONTHLY</option><option>QUARTERLY</option></select><Input placeholder="Why this matters" value={form.why} onChange={(e) => setForm((f) => ({...f,why:e.target.value}))}/><Button disabled={saving || !form.title.trim()} onClick={() => saveTask(form)}>Save Action</Button>
    </CardContent></Card>

    <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex flex-wrap gap-2">{["ACTIVE","TODO","DOING","BLOCKED","DONE","NOT_NOW","ALL"].map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${filter === item ? "bg-navy-900 text-white dark:bg-white dark:text-navy-900" : "border border-navy-200"}`}>{item.replace("_"," ")}</button>)}</div><Button size="sm" variant="secondary" onClick={load}><RefreshCw className="h-3.5 w-3.5"/>Refresh</Button></div>

    {loading ? <div className="flex justify-center p-12"><Loader2 className="h-7 w-7 animate-spin"/></div> : visible.length === 0 ? <Card className="border-navy-200 bg-warm-50/80 dark:border-navy-700 dark:bg-navy-900"><CardContent className="py-10 text-center text-sm text-navy-400">No actions in this view. Install the playbook or add the first action.</CardContent></Card> : <div className="grid gap-3 lg:grid-cols-2">{visible.map((task) => <Card key={task.id}><CardContent className="space-y-3 p-4"><div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap gap-1.5"><Badge tone={priorityTone(task.priority) as any}>{task.priority}</Badge><Badge tone="neutral">{task.category}</Badge><Badge tone="blue">{task.cadence}</Badge></div><h3 className="mt-2 font-bold text-navy-950 dark:text-white">{task.title}</h3></div><button onClick={() => remove(task.id)} className="text-navy-300 hover:text-red-600"><Trash2 className="h-4 w-4"/></button></div>{task.why && <p className="text-xs text-navy-500"><strong>Why:</strong> {task.why}</p>}{task.nextAction && <p className="rounded-xl bg-warm-50 p-2 text-sm dark:bg-navy-900"><strong>Next:</strong> {task.nextAction}</p>}<div className="flex flex-wrap items-center gap-2"><select value={task.status} onChange={(e) => saveTask({...task,status:e.target.value as Task["status"]})} className="rounded-xl border px-2 py-1.5 text-xs dark:bg-navy-900"><option>TODO</option><option>DOING</option><option>BLOCKED</option><option>DONE</option><option>NOT_NOW</option></select><span className="text-xs text-navy-400">Owner: {task.owner}{task.dueDate ? ` • Due ${new Date(task.dueDate).toLocaleDateString("en-KE")}` : ""}</span>{task.status === "DONE" && <CheckCircle2 className="h-4 w-4 text-green-600"/>}</div><Input placeholder="Evidence, result or blocker" value={task.evidence ?? ""} onChange={(e) => setTasks((rows) => rows.map((row) => row.id === task.id ? {...row,evidence:e.target.value} : row))} onBlur={() => saveTask(task)}/></CardContent></Card>)}</div>}
  </div>;
}
function Metric({label,value,danger=false}:{label:string;value:number;danger?:boolean}) { return <div className="rounded-xl border bg-white p-3 dark:border-navy-800 dark:bg-navy-900"><p className="text-xs text-navy-400">{label}</p><p className={`text-2xl font-black ${danger?"text-red-600":"text-navy-950 dark:text-white"}`}>{value}</p></div>; }
function Guard({icon:Icon,title,text}:{icon:any;title:string;text:string}) { return <div className="rounded-xl border border-navy-100 p-3 dark:border-navy-800"><Icon className="h-4 w-4 text-green-600"/><p className="mt-2 text-sm font-bold">{title}</p><p className="mt-1 text-xs text-navy-500">{text}</p></div>; }
