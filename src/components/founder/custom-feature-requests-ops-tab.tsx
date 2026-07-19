"use client";

/**
 * T.3 — Platform Operations "Custom Feature Requests" tab. Review every real school's
 * bespoke feature ask, quote a real recurring cost, mark progress, and
 * deliver via the existing real J.23 feature-grant mechanism. Recognises
 * when a genuinely new request matches something already DELIVERED
 * elsewhere (the founder's own "same route" requirement) so it can be
 * granted to the new school instantly instead of re-quoted from scratch.
 */
import * as React from "react";
import { Sparkles, Inbox, Check, X, RefreshCcw, Globe2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

interface OpsRequest {
  id: string; tenantId: string; schoolName: string;
  title: string; description: string; requestedByName: string; status: string;
  quotedPriceKes: number | null; quotedBillingCycle: string | null;
  opsNote: string | null; schoolReply: string | null; declineReason: string | null;
  deliveredFeatureKey: string | null; deliveredAt: string | null;
  releasedToAllSchools: boolean; releasedAt: string | null;
  decidedByName: string | null; decidedAt: string | null; createdAt: string;
}

const STATUS_TONE: Record<string, "neutral" | "blue" | "green" | "red" | "amber"> = {
  SUBMITTED: "neutral", REVIEWING: "blue", QUOTED: "amber",
  APPROVED: "blue", IN_PROGRESS: "blue", DELIVERED: "green", DECLINED: "red",
};

const kes = (n: number) => `KES ${n.toLocaleString("en-KE")}`;

export function CustomFeatureRequestsOpsTab() {
  const { toast } = useToast();
  const [rows, setRows] = React.useState<OpsRequest[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/ops/custom-feature-requests");
      const json = await res.json();
      if (json.ok) setRows(json.data.requests); else setError(json.error?.message || "Failed to load");
    } catch { setError("Failed to load"); }
  }, []);
  React.useEffect(() => { void load(); }, [load]);

  // Real, already-delivered feature keys, keyed by lowercase title, so a new
  // request matching a previously-delivered title can be granted instantly.
  const deliveredKeysByTitle = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const r of rows ?? []) {
      if (r.deliveredFeatureKey) map.set(r.title.trim().toLowerCase(), r.deliveredFeatureKey);
    }
    return map;
  }, [rows]);

  async function act(requestId: string, body: Record<string, unknown>) {
    setBusyId(requestId);
    try {
      const res = await fetch("/api/ops/custom-feature-requests", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, ...body }),
      });
      const json = await res.json();
      if (json.ok) { toast({ title: "Updated", tone: "success" }); await load(); }
      else toast({ title: json.error?.message || "Failed", tone: "error" });
    } finally { setBusyId(null); }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-green-600" /> Custom feature requests</CardTitle>
        <p className="mt-1 text-xs text-navy-500 dark:text-navy-400">
          Real school-submitted bespoke feature asks. Quote a real recurring cost, build it, then deliver via the existing feature-grant system —
          never a one-off flag. Once delivered, you can also release it platform-wide to every school.
        </p>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-900/20">
            {error} <Button size="sm" variant="secondary" className="ml-2" onClick={() => void load()}>Retry</Button>
          </div>
        ) : rows === null ? (
          <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}</div>
        ) : rows.length === 0 ? (
          <EmptyState icon={Inbox} title="No custom feature requests yet" description="Real school-submitted requests will appear here." />
        ) : (
          <div className="space-y-3">
            {rows.map((r) => {
              const matchingKey = deliveredKeysByTitle.get(r.title.trim().toLowerCase());
              return (
                <div key={r.id} className="rounded-2xl border border-navy-100 bg-white/70 p-4 dark:border-navy-800 dark:bg-navy-900/60">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-navy-900 dark:text-navy-50">{r.title} <span className="font-normal text-navy-400">— {r.schoolName}</span></p>
                      <p className="mt-0.5 text-sm text-navy-500 dark:text-navy-400">{r.description}</p>
                      <p className="mt-1 text-[11px] text-navy-400">Requested by {r.requestedByName} · {new Date(r.createdAt).toLocaleDateString("en-KE")}</p>
                    </div>
                    <Badge tone={STATUS_TONE[r.status] ?? "neutral"}>{r.status.replace(/_/g, " ")}</Badge>
                  </div>

                  {matchingKey && r.status === "SUBMITTED" && (
                    <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-green-50 px-3 py-2 dark:bg-green-900/20">
                      <p className="text-xs font-semibold text-green-800 dark:text-green-300">
                        Already built for another school as &quot;{matchingKey}&quot; — deliver instantly via the same route?
                      </p>
                      <Button size="sm" disabled={busyId === r.id} onClick={() => act(r.id, { status: "DELIVERED", deliveredFeatureKey: matchingKey })}>
                        {busyId === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Deliver now
                      </Button>
                    </div>
                  )}

                  {r.status === "SUBMITTED" && (
                    <div className="mt-3 flex justify-end">
                      <Button size="sm" variant="secondary" disabled={busyId === r.id} onClick={() => act(r.id, { status: "REVIEWING" })}>Start reviewing</Button>
                    </div>
                  )}

                  {r.status === "REVIEWING" && <QuoteRow requestId={r.id} busy={busyId === r.id} onQuote={(priceKes, cycle) => act(r.id, { status: "QUOTED", quotedPriceKes: priceKes, quotedBillingCycle: cycle })} onDecline={(reason) => act(r.id, { status: "DECLINED", declineReason: reason })} />}

                  {r.status === "QUOTED" && (
                    <p className="mt-3 text-sm font-semibold text-navy-900 dark:text-navy-50">
                      Quoted: {kes(r.quotedPriceKes ?? 0)} / {(r.quotedBillingCycle ?? "period").toLowerCase()} — awaiting the school&apos;s reply.
                    </p>
                  )}

                  {r.status === "APPROVED" && (
                    <div className="mt-3 flex justify-end">
                      <Button size="sm" disabled={busyId === r.id} onClick={() => act(r.id, { status: "IN_PROGRESS" })}>Mark in progress</Button>
                    </div>
                  )}

                  {r.status === "IN_PROGRESS" && <DeliverRow requestId={r.id} busy={busyId === r.id} onDeliver={(key) => act(r.id, { status: "DELIVERED", deliveredFeatureKey: key })} />}

                  {r.status === "DELIVERED" && (
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-medium text-green-700 dark:text-green-400">
                        Delivered as &quot;{r.deliveredFeatureKey}&quot; on {r.deliveredAt ? new Date(r.deliveredAt).toLocaleDateString("en-KE") : ""}.
                        {r.releasedToAllSchools && " Released platform-wide."}
                      </p>
                      {!r.releasedToAllSchools && (
                        <ReleaseButton requestId={r.id} busy={busyId === r.id} onClick={async () => {
                          setBusyId(r.id);
                          try {
                            const res = await fetch("/api/ops/custom-feature-requests", {
                              method: "POST", headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ action: "releaseToAll", requestId: r.id }),
                            });
                            const json = await res.json();
                            if (json.ok) { toast({ title: "Released to every school", tone: "success" }); await load(); }
                            else toast({ title: json.error?.message || "Failed", tone: "error" });
                          } finally { setBusyId(null); }
                        }} />
                      )}
                    </div>
                  )}


                  {r.status === "DECLINED" && r.declineReason && (
                    <p className="mt-2 text-xs text-red-600 dark:text-red-400">Declined: {r.declineReason}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QuoteRow({ requestId, busy, onQuote, onDecline }: { requestId: string; busy: boolean; onQuote: (priceKes: number, cycle: string) => void; onDecline: (reason: string) => void }) {
  const [price, setPrice] = React.useState("");
  const [cycle, setCycle] = React.useState("MONTHLY");
  const [declineReason, setDeclineReason] = React.useState("");
  return (
    <div className="mt-3 space-y-2 rounded-xl bg-warm-50 p-3 dark:bg-navy-800">
      <div className="grid grid-cols-2 gap-2">
        <div><Label>Price (KES)</Label><Input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} /></div>
        <div>
          <Label>Billing cycle</Label>
          <select value={cycle} onChange={(e) => setCycle(e.target.value)} className="mt-1 w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900">
            <option value="MONTHLY">Monthly</option><option value="TERMLY">Termly</option><option value="YEARLY">Yearly</option>
          </select>
        </div>
      </div>
      <Button size="sm" disabled={busy || !price} onClick={() => onQuote(Number(price), cycle)}>Send quote</Button>
      <div className="flex gap-2 pt-1">
        <Input value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} placeholder="Reason if declining instead" className="text-xs" />
        <Button size="sm" variant="secondary" disabled={busy || declineReason.trim().length < 3} onClick={() => onDecline(declineReason)}><X className="h-3.5 w-3.5" /> Decline</Button>
      </div>
    </div>
  );
}

function DeliverRow({ requestId, busy, onDeliver }: { requestId: string; busy: boolean; onDeliver: (key: string) => void }) {
  const [key, setKey] = React.useState("");
  return (
    <div className="mt-3 flex gap-2">
      <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="new_feature_key" className="text-xs" />
      <Button size="sm" disabled={busy || key.trim().length < 2} onClick={() => onDeliver(key.trim())}><Check className="h-3.5 w-3.5" /> Deliver</Button>
    </div>
  );
}

function ReleaseButton({ busy, onClick }: { requestId: string; busy: boolean; onClick: () => void }) {
  return (
    <Button size="sm" variant="secondary" disabled={busy} onClick={onClick}>
      <Globe2 className="h-3.5 w-3.5" /> Release to every school
    </Button>
  );
}
