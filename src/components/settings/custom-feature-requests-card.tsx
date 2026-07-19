"use client";

/**
 * T.3 — School-Requested Custom Feature Pipeline (school-facing).
 * A school describes a real bespoke feature they want, tracks its real
 * status (SUBMITTED -> REVIEWING -> QUOTED -> APPROVED -> IN_PROGRESS ->
 * DELIVERED, or DECLINED), and — once quoted — accepts or declines the
 * real recurring cost Platform Operations names.
 */
import * as React from "react";
import { Sparkles, Plus, Loader2, Check, X, RefreshCcw, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

interface RequestRow {
  id: string;
  title: string;
  description: string;
  status: string;
  quotedPriceKes: number | null;
  quotedBillingCycle: string | null;
  declineReason: string | null;
  deliveredAt: string | null;
  createdAt: string;
}

const STATUS_TONE: Record<string, "neutral" | "blue" | "green" | "red" | "amber"> = {
  SUBMITTED: "neutral", REVIEWING: "blue", QUOTED: "amber",
  APPROVED: "blue", IN_PROGRESS: "blue", DELIVERED: "green", DECLINED: "red",
};

const kes = (n: number) => `KES ${n.toLocaleString("en-KE")}`;

function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-100 bg-red-50/40 p-8 text-center dark:border-red-900/40 dark:bg-red-950/20">
      <AlertCircle className="h-6 w-6 text-red-500" />
      <p className="text-sm font-medium text-red-700 dark:text-red-300">Could not load your requests.</p>
      <Button size="sm" variant="secondary" onClick={onRetry}><RefreshCcw className="h-3.5 w-3.5" /> Retry</Button>
    </div>
  );
}

export function CustomFeatureRequestsCard() {
  const { toast } = useToast();
  const [rows, setRows] = React.useState<RequestRow[] | null>(null);
  const [error, setError] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    setError(false);
    try {
      const res = await fetch("/api/settings/custom-feature-requests");
      const json = await res.json();
      if (json.ok) setRows(json.data.requests); else setError(true);
    } catch { setError(true); }
  }, []);
  React.useEffect(() => { load(); }, [load]);

  async function reply(id: string, approve: boolean) {
    const res = await fetch("/api/settings/custom-feature-requests", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reply", requestId: id, approve }),
    });
    const json = await res.json();
    if (json.ok) { toast({ title: approve ? "Quote accepted" : "Quote declined", tone: "success" }); load(); }
    else toast({ title: json.error?.message || "Failed", tone: "error" });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-green-600" /> Request a custom feature</span>
          <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="h-3.5 w-3.5" /> New request</Button>
        </CardTitle>
        <p className="mt-1 text-xs text-navy-500 dark:text-navy-400">
          Ask NEYO to build something bespoke for your school. We&apos;ll review it, tell you the real cost per period, and build it once you approve.
        </p>
      </CardHeader>
      <CardContent>
        {error ? (
          <LoadError onRetry={load} />
        ) : rows === null ? (
          <div className="space-y-3">{[0, 1].map((i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}</div>
        ) : rows.length === 0 ? (
          <EmptyState icon={Sparkles} title="No requests yet" description="Have an idea for something NEYO doesn't do yet? Ask us." />
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <div key={r.id} className="rounded-2xl border border-navy-100 bg-white/70 p-4 dark:border-navy-800 dark:bg-navy-900/60">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-navy-900 dark:text-navy-50">{r.title}</p>
                    <p className="mt-0.5 text-sm text-navy-500 dark:text-navy-400">{r.description}</p>
                  </div>
                  <Badge tone={STATUS_TONE[r.status] ?? "neutral"}>{r.status.replace(/_/g, " ")}</Badge>
                </div>
                {r.status === "QUOTED" && r.quotedPriceKes != null && (
                  <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-warm-50 px-3 py-2.5 dark:bg-navy-800">
                    <p className="text-sm font-semibold text-navy-900 dark:text-navy-50">
                      {kes(r.quotedPriceKes)} / {(r.quotedBillingCycle ?? "period").toLowerCase()}
                    </p>
                    <div className="ml-auto flex gap-2">
                      <Button size="sm" onClick={() => reply(r.id, true)}><Check className="h-3.5 w-3.5" /> Accept</Button>
                      <Button size="sm" variant="secondary" onClick={() => reply(r.id, false)}><X className="h-3.5 w-3.5" /> Decline</Button>
                    </div>
                  </div>
                )}
                {r.status === "DECLINED" && r.declineReason && (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400">Declined: {r.declineReason}</p>
                )}
                {r.status === "DELIVERED" && (
                  <p className="mt-2 text-xs font-medium text-green-700 dark:text-green-400">Live on your account since {r.deliveredAt ? new Date(r.deliveredAt).toLocaleDateString("en-KE") : "recently"}.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {createOpen && <CreateRequestDialog onClose={() => setCreateOpen(false)} onDone={() => { setCreateOpen(false); load(); toast({ title: "Request sent to NEYO", tone: "success" }); }} />}
    </Card>
  );
}

function CreateRequestDialog({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { toast } = useToast();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/custom-feature-requests", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const json = await res.json();
      if (json.ok) onDone();
      else toast({ title: json.error?.message || "Failed", tone: "error" });
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-pop dark:bg-navy-900" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-navy-900 dark:text-navy-50">Request a custom feature</h3>
        <div className="mt-4 space-y-3">
          <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Fingerprint gate for the library" /></div>
          <div>
            <Label>Describe what you need</Label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)}
              rows={5} placeholder="Tell us the problem you're trying to solve and how you imagine it working."
              className="mt-1 w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-800"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={save} disabled={saving || title.trim().length < 3 || description.trim().length < 10}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Send request
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
