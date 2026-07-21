"use client";

import * as React from "react";
import { BookOpenText, Loader2, Save, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

const EMPTY = { id: "", title: "", youtubeUrlOrId: "", routePattern: "/dashboard", actionKey: "", roles: "", language: "en", durationSeconds: "", transcript: "", thumbnailUrl: "", status: "DRAFT" };

export function GuidedHelpOpsTab() {
  const { toast } = useToast();
  const [rows, setRows] = React.useState<any[]>([]);
  const [form, setForm] = React.useState<any>(EMPTY);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const load = React.useCallback(async () => { setLoading(true); try { const json=await fetch("/api/guided-help?mode=manage").then(r=>r.json()); if(json.ok)setRows(json.data.guides??[]); } finally { setLoading(false); } },[]);
  React.useEffect(()=>{void load();},[load]);

  function edit(row:any){ setForm({ id:row.id,title:row.title,youtubeUrlOrId:row.youtubeId,routePattern:row.routePattern,actionKey:row.actionKey||"",roles:JSON.parse(row.rolesJson||"[]").join(", "),language:row.language,durationSeconds:row.durationSeconds||"",transcript:row.transcript||"",thumbnailUrl:row.thumbnailUrl||"",status:row.status }); }
  async function save(){ setSaving(true); try { const res=await fetch("/api/guided-help",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,roles:form.roles.split(",").map((x:string)=>x.trim()).filter(Boolean),durationSeconds:form.durationSeconds?Number(form.durationSeconds):null})}); const json=await res.json(); if(!json.ok)throw new Error(json.error?.message||"Could not save guide"); toast({title:"Guided help saved",tone:"success"}); setForm(EMPTY); await load(); } catch(error){toast({title:error instanceof Error?error.message:"Could not save guide",tone:"error"});} finally{setSaving(false);} }

  return <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><BookOpenText className="h-5 w-5 text-green-600"/>Guided Help publisher</CardTitle><p className="text-xs text-navy-500 dark:text-navy-400">A discovered video is never public automatically. Map one reviewed YouTube guide to a route, optional action and roles; then publish a specific version.</p></CardHeader><CardContent className="space-y-3">
      <Field label="Title"><Input value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></Field>
      <Field label="YouTube URL or 11-character ID"><Input value={form.youtubeUrlOrId} onChange={e=>setForm({...form,youtubeUrlOrId:e.target.value})}/></Field>
      <div className="grid gap-3 sm:grid-cols-2"><Field label="Route pattern"><Input value={form.routePattern} onChange={e=>setForm({...form,routePattern:e.target.value})} placeholder="/attendance or /settings/*"/></Field><Field label="Action key (optional)"><Input value={form.actionKey} onChange={e=>setForm({...form,actionKey:e.target.value})}/></Field></div>
      <div className="grid gap-3 sm:grid-cols-3"><Field label="Roles, comma-separated"><Input value={form.roles} onChange={e=>setForm({...form,roles:e.target.value})} placeholder="TEACHER, PRINCIPAL"/></Field><Field label="Language"><Input value={form.language} onChange={e=>setForm({...form,language:e.target.value})}/></Field><Field label="Seconds"><Input type="number" value={form.durationSeconds} onChange={e=>setForm({...form,durationSeconds:e.target.value})}/></Field></div>
      <Field label="Transcript / slow-network guide"><textarea className="min-h-36 w-full rounded-2xl border border-navy-200 bg-white p-3 text-sm dark:border-navy-700 dark:bg-navy-900" value={form.transcript} onChange={e=>setForm({...form,transcript:e.target.value})}/></Field>
      <Field label="Thumbnail URL (optional)"><Input value={form.thumbnailUrl} onChange={e=>setForm({...form,thumbnailUrl:e.target.value})}/></Field>
      <Field label="Publication state"><select className="h-11 w-full rounded-xl border border-navy-200 bg-white px-3 dark:border-navy-700 dark:bg-navy-900" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>DRAFT</option><option>REVIEWED</option><option>PUBLISHED</option><option>ARCHIVED</option></select></Field>
      <div className="flex gap-2"><Button onClick={save} disabled={saving||form.title.length<3||!form.youtubeUrlOrId||!form.routePattern}>{saving?<Loader2 className="h-4 w-4 animate-spin"/>:<Save className="h-4 w-4"/>}Save guide</Button>{form.id?<Button variant="secondary" onClick={()=>setForm(EMPTY)}>Cancel edit</Button>:null}</div>
    </CardContent></Card>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Video className="h-5 w-5 text-red-600"/>Guide catalogue</CardTitle></CardHeader><CardContent>{loading?<Loader2 className="h-5 w-5 animate-spin"/>:rows.length===0?<p className="text-sm text-navy-500">No contextual guides yet.</p>:<div className="space-y-2">{rows.map(row=><button key={row.id} onClick={()=>edit(row)} className="w-full rounded-2xl border border-navy-100 p-4 text-left dark:border-navy-800"><div className="flex items-center justify-between gap-3"><p className="font-bold text-navy-950 dark:text-white">{row.title}</p><span className="text-xs font-black text-green-700 dark:text-green-300">{row.status} · v{row.version}</span></div><p className="mt-1 text-xs text-navy-500">{row.routePattern}{row.actionKey?` · ${row.actionKey}`:""} · {row.language}</p></button>)}</div>}</CardContent></Card>
  </div>;
}
function Field({label,children}:{label:string;children:React.ReactNode}){return <div><Label className="mb-1 block">{label}</Label>{children}</div>}
