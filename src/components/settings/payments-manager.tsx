"use client";

import * as React from "react";
import { Loader2, Smartphone, Building2, ShieldCheck, Upload, ReceiptText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

type Mode = "STK_PAYBILL" | "STK_TILL" | "PAYBILL_ONLY" | "MANUAL";
interface ConfigStatus {
  configured: boolean;
  shortcode: string | null;
  environment: string;
  connectionMode: Mode;
  connectionStatus: string;
  accountReferenceFormat: string | null;
}

const choices: Array<{ value: Mode; title: string; detail: string }> = [
  { value: "STK_PAYBILL", title: "Paybill with STK Push credentials", detail: "Parents receive an M-Pesa prompt on their phone." },
  { value: "PAYBILL_ONLY", title: "Paybill only", detail: "Parents pay manually and the school reconciles the payment." },
  { value: "STK_TILL", title: "Till with STK Push credentials", detail: "For an approved Buy Goods Till/store number with Online Passkey." },
  { value: "MANUAL", title: "No API credentials yet", detail: "Continue with statement import and manual payment recording." },
];

export function PaymentsManager({ initial }: { initial: ConfigStatus }) {
  const { toast } = useToast();
  const [status, setStatus] = React.useState(initial);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    connectionMode: initial.connectionMode,
    shortcode: initial.shortcode ?? "",
    environment: initial.environment ?? "sandbox",
    accountReferenceFormat: initial.accountReferenceFormat ?? "Student admission number",
    consumerKey: "", consumerSecret: "", passkey: "",
  });
  const usesStk = form.connectionMode === "STK_PAYBILL" || form.connectionMode === "STK_TILL";
  const needsNumber = form.connectionMode !== "MANUAL";
  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) { setForm((old) => ({ ...old, [key]: value })); }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch("/api/payments/credentials", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const json = await res.json();
      if (!json.ok) {
        toast({ title: json.error?.fields ? Object.values(json.error.fields)[0] as string : json.error?.message || "Could not save payment settings.", tone: "error" });
        return;
      }
      setStatus(json.data);
      setForm((old) => ({ ...old, consumerKey: "", consumerSecret: "", passkey: "" }));
      toast({ title: usesStk ? "Credentials saved securely — connection not yet tested" : "Payment method saved", tone: "success" });
    } finally { setLoading(false); }
  }

  const statusLabel = status.connectionStatus === "CREDENTIALS_VERIFIED" ? "Credentials verified" : status.connectionStatus === "ACTION_REQUIRED" ? "Action required" : status.connectionStatus === "MANUAL" ? "Manual reconciliation mode" : status.configured ? "Saved — not tested" : "Not set up";
  return <Card>
    <CardHeader className="flex flex-row items-center justify-between gap-3"><CardTitle>M-Pesa collection</CardTitle><Badge tone={status.connectionStatus === "CREDENTIALS_VERIFIED" ? "green" : "amber"}>{statusLabel}</Badge></CardHeader>
    <CardContent>
      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-navy-100 bg-warm-50 p-4 dark:border-navy-800 dark:bg-navy-950"><Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-green-600"/><p className="text-sm text-navy-600 dark:text-navy-300">Choose what your school currently has. You can keep recording payments even without Daraja credentials. Existing credentials are not deleted when you view this page.</p></div>
      <div className="mb-5 grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-green-200 bg-green-50/60 p-4 text-sm text-green-900 dark:border-green-900/50 dark:bg-green-950/20 dark:text-green-100"><p className="flex items-center gap-2 font-bold"><Building2 className="h-4 w-4"/>School fee credentials</p><p className="mt-1 text-xs">Money goes directly to the school&apos;s own Paybill or Till.</p></div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100"><p className="flex items-center gap-2 font-bold"><ShieldCheck className="h-4 w-4"/>Company billing stays separate</p><p className="mt-1 text-xs">NEYO subscription credentials are never entered here.</p></div>
      </div>
      <form onSubmit={save} className="space-y-5">
        <fieldset><legend className="mb-2 text-sm font-semibold">What does your school have?</legend><div className="grid gap-2 sm:grid-cols-2">{choices.map((choice) => <label key={choice.value} className={`cursor-pointer rounded-2xl border p-3 ${form.connectionMode === choice.value ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-navy-200 dark:border-navy-700"}`}><input className="mr-2" type="radio" name="mode" checked={form.connectionMode === choice.value} onChange={() => set("connectionMode", choice.value)}/><span className="text-sm font-semibold">{choice.title}</span><span className="mt-1 block pl-5 text-xs text-navy-500">{choice.detail}</span></label>)}</div></fieldset>
        {needsNumber && <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="shortcode">{form.connectionMode === "STK_TILL" ? "Till/store number" : "Paybill number"}</Label><Input id="shortcode" value={form.shortcode} onChange={(e) => set("shortcode", e.target.value)} disabled={loading}/></div>{usesStk && <div><Label htmlFor="env">Environment</Label><select id="env" value={form.environment} onChange={(e) => set("environment", e.target.value)} className="h-12 w-full rounded-2xl border border-navy-200 bg-white px-3.5 dark:border-navy-700 dark:bg-navy-900"><option value="sandbox">Sandbox (testing)</option><option value="production">Production (live)</option></select></div>}</div>}
        {form.connectionMode === "PAYBILL_ONLY" && <div><Label htmlFor="reference">Payment account reference</Label><Input id="reference" value={form.accountReferenceFormat} onChange={(e) => set("accountReferenceFormat", e.target.value)} placeholder="For example: student admission number"/><p className="mt-1 text-xs text-navy-500">Tell parents what to enter in the M-Pesa Account field.</p></div>}
        {usesStk && <div className="space-y-4"><div><Label htmlFor="ck">Consumer key</Label><PasswordInput id="ck" value={form.consumerKey} onChange={(e) => set("consumerKey", e.target.value)} placeholder={status.configured ? "Enter again to update" : "From Daraja portal"}/></div><div><Label htmlFor="cs">Consumer secret</Label><PasswordInput id="cs" value={form.consumerSecret} onChange={(e) => set("consumerSecret", e.target.value)} placeholder={status.configured ? "Enter again to update" : "From Daraja portal"}/></div><div><Label htmlFor="pk">Online Passkey</Label><PasswordInput id="pk" value={form.passkey} onChange={(e) => set("passkey", e.target.value)} placeholder="Required for STK Push only"/></div><p className="text-xs text-navy-500">Saving encrypts these credentials. It does not prove the connection works; NEYO will not label it connected until verification succeeds.</p></div>}
        {form.connectionMode === "MANUAL" && <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950/20 dark:text-blue-100">Your school can continue recording payments and importing statements while the connection is being prepared.</div>}
        <div className="flex flex-wrap gap-2"><Button type="submit" disabled={loading}>{loading && <Loader2 className="h-4 w-4 animate-spin"/>}Save payment setup</Button><Button type="button" variant="secondary" onClick={() => { window.location.href = "/reception"; }}><Upload className="h-4 w-4"/>Import statement</Button><Button type="button" variant="secondary" onClick={() => { window.location.href = "/finance"; }}><ReceiptText className="h-4 w-4"/>Record payment</Button></div>
      </form>
    </CardContent>
  </Card>;
}
