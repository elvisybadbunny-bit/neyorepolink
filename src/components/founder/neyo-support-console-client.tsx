"use client";

/**
 * Y.2 — NEYO Support Console. Reachable by FOUNDER (unrestricted) and by
 * NEYO_OPS/NEYO_SUPPORT accounts with the real "neyo.customer_requests"
 * permission. Surfaces quote requests, custom feature requests, and
 * demo/waitlist entries — the founder's own named "inquiries, requests,
 * demo requests, quotation requests, onboarding, planning and guidance."
 */
import * as React from "react";
import { Inbox, Sparkles, ListChecks, Compass, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { formatKES } from "@/lib/utils";

interface QuoteRequest {
  id: string; schoolName: string; contactName: string; contactEmail: string; contactPhone: string;
  declaredStudentCount: number | null; declaredStaffCount: number | null;
  instantQuotedPriceKes: number | null; finalQuotedPriceKes: number | null;
  status: string; formalQuoteRequested: boolean;
  onboardingAssistanceRequested: boolean; onboardingAssistanceNote: string | null; onboardingAssistanceDoneAt: string | null;
  createdAt: string;
}
interface FeatureRequest {
  id: string; title: string; description: string; requestedByName: string; status: string;
  quotedPriceKes: number | null; quotedBillingCycle: string | null; createdAt: string;
}
interface WaitlistEntry { id: string; periodKey: string | null; summary: string | null; title: string; createdAt: string }

export function NeyoSupportConsoleClient() {
  const { toast } = useToast();
  const [data, setData] = React.useState<{ quoteRequests: QuoteRequest[]; customFeatureRequests: FeatureRequest[]; waitlistEntries: WaitlistEntry[]; counts: Record<string, number> } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [quotePrice, setQuotePrice] = React.useState<Record<string, string>>({});

  const load = React.useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/ops/support-console");
      const json = await res.json();
      if (json.ok) setData(json.data);
      else setError(json.error?.message || "Failed to load");
    } catch { setError("Failed to load"); }
  }, []);
  React.useEffect(() => { void load(); }, [load]);

  async function sendFormalQuote(requestId: string) {
    const priceStr = quotePrice[requestId];
    const finalQuotedPriceKes = Number(priceStr);
    if (!priceStr || !Number.isFinite(finalQuotedPriceKes) || finalQuotedPriceKes <= 0) {
      toast({ title: "Enter a valid quote amount in KES", tone: "error" });
      return;
    }
    setBusyId(requestId);
    try {
      const res = await fetch("/api/ops/support-console", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_formal_quote", requestId, finalQuotedPriceKes }),
      });
      const json = await res.json();
      if (json.ok) { toast({ title: "Formal quote sent", tone: "success" }); await load(); }
      else toast({ title: json.error?.message || "Failed", tone: "error" });
    } finally { setBusyId(null); }
  }

  async function markOnboardingDone(id: string) {
    setBusyId(id);
    try {
      const res = await fetch("/api/ops/support-console", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_onboarding_done", id }),
      });
      const json = await res.json();
      if (json.ok) { toast({ title: "Marked as helped", tone: "success" }); await load(); }
      else toast({ title: json.error?.message || "Failed", tone: "error" });
    } finally { setBusyId(null); }
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-900/20">
        {error} <Button size="sm" variant="secondary" className="ml-2" onClick={() => void load()}>Retry</Button>
      </div>
    );
  }

  if (!data) {
    return <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={Sparkles} label="Open quote requests" value={data.counts.openQuotes} />
        <Stat icon={Compass} label="Onboarding help pending" value={data.counts.pendingOnboardingHelp} />
        <Stat icon={ListChecks} label="Open feature requests" value={data.counts.openFeatureRequests} />
        <Stat icon={Inbox} label="Waitlist / demo signups" value={data.counts.waitlistCount} />
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-indigo-600" /> Quote &amp; onboarding requests</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {data.quoteRequests.length === 0 ? (
            <EmptyState icon={Sparkles} title="No quote requests yet" description="When a prospective school requests a quote, it appears here." />
          ) : (
            data.quoteRequests.map((q) => (
              <div key={q.id} className="rounded-2xl border border-navy-100 p-4 dark:border-navy-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-navy-900 dark:text-white">{q.schoolName}</p>
                    <p className="text-xs text-navy-500 dark:text-navy-400">{q.contactName} · {q.contactEmail} · {q.contactPhone}</p>
                  </div>
                  <Badge tone={q.status === "LIVE" ? "green" : q.status === "DECLINED" ? "red" : "blue"}>{q.status}</Badge>
                </div>
                <p className="mt-2 text-xs text-navy-500 dark:text-navy-400">
                  {q.declaredStudentCount ?? "—"} students · {q.declaredStaffCount ?? "—"} staff · Instant estimate: {q.instantQuotedPriceKes ? formatKES(q.instantQuotedPriceKes) : "—"}/month
                  {q.finalQuotedPriceKes ? ` · Formal quote sent: ${formatKES(q.finalQuotedPriceKes)}/month` : ""}
                </p>
                {q.formalQuoteRequested && q.status === "REQUESTED" ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Input placeholder="Final quote KES/month" value={quotePrice[q.id] || ""} onChange={(e) => setQuotePrice((prev) => ({ ...prev, [q.id]: e.target.value }))} className="w-48" />
                    <Button size="sm" disabled={busyId === q.id} onClick={() => void sendFormalQuote(q.id)}>Send formal quote</Button>
                  </div>
                ) : null}
                {q.onboardingAssistanceRequested ? (
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-900/20">
                    <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">Onboarding assistance requested{q.onboardingAssistanceNote ? `: ${q.onboardingAssistanceNote}` : ""}</p>
                    {q.onboardingAssistanceDoneAt ? (
                      <p className="mt-1 flex items-center gap-1 text-xs text-green-700 dark:text-green-300"><CheckCircle2 className="h-3.5 w-3.5" /> Helped on {new Date(q.onboardingAssistanceDoneAt).toLocaleDateString()}</p>
                    ) : (
                      <Button size="sm" variant="secondary" className="mt-2" disabled={busyId === q.id} onClick={() => void markOnboardingDone(q.id)}>Mark as helped</Button>
                    )}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ListChecks className="h-5 w-5 text-blue-600" /> Custom feature requests</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {data.customFeatureRequests.length === 0 ? (
            <EmptyState icon={ListChecks} title="No feature requests yet" description="When a school asks NEYO for something bespoke, it appears here." />
          ) : (
            data.customFeatureRequests.map((r) => (
              <div key={r.id} className="rounded-2xl border border-navy-100 p-4 dark:border-navy-800">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-navy-900 dark:text-white">{r.title}</p>
                  <Badge tone={r.status === "DELIVERED" ? "green" : r.status === "DECLINED" ? "red" : "blue"}>{r.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-navy-500 dark:text-navy-400">By {r.requestedByName}</p>
                <p className="mt-1 text-sm text-navy-600 dark:text-navy-300">{r.description}</p>
                {r.quotedPriceKes ? <p className="mt-1 text-xs text-navy-400 dark:text-navy-500">Quoted: {formatKES(r.quotedPriceKes)}/{r.quotedBillingCycle?.toLowerCase()}</p> : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Inbox className="h-5 w-5 text-navy-600" /> Demo &amp; waitlist signups</CardTitle></CardHeader>
        <CardContent>
          {data.waitlistEntries.length === 0 ? (
            <EmptyState icon={Inbox} title="No waitlist signups yet" description="When someone joins a NEYO waitlist, it appears here." />
          ) : (
            <div className="space-y-2">
              {data.waitlistEntries.slice(0, 20).map((w) => (
                <div key={w.id} className="flex items-center justify-between rounded-xl border border-navy-100 px-3 py-2 text-sm dark:border-navy-800">
                  <span className="font-medium text-navy-900 dark:text-white">{w.periodKey}</span>
                  <Badge tone="neutral">{w.summary}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-navy-100 p-3 dark:border-navy-800">
      <div className="flex items-center gap-2 text-xs text-navy-500 dark:text-navy-400"><Icon className="h-4 w-4" /> {label}</div>
      <p className="mt-1 text-lg font-bold text-navy-900 dark:text-white">{value}</p>
    </div>
  );
}
