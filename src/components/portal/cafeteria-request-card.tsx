"use client";

/**
 * T.9 (founder-requested) — real parent-portal card: request to enroll or
 * cancel this child's feeding-program membership. Mirrors T.8's
 * TransportRequestCard exactly. Only shown as an active request-flow when
 * the school has explicitly opted in via Tenant.allowParentCafeteriaRequests
 * (server-enforced regardless — this card just honestly hides the
 * "request" action when the school hasn't turned it on).
 */
import * as React from "react";
import { UtensilsCrossed, Loader2, Plus, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

interface RequestRow {
  id: string; studentId: string; studentName: string;
  action: string; status: string; createdAt: string;
  decidedAt: string | null; declineReason: string | null;
}

const STATUS_TONE: Record<string, "amber" | "green" | "neutral"> = { PENDING: "amber", APPROVED: "green", DECLINED: "neutral", CANCELLED: "neutral" };

export function CafeteriaRequestCard({ studentId, studentName, hasActiveCard }: { studentId: string; studentName: string; hasActiveCard: boolean }) {
  const { toast } = useToast();
  const [policy, setPolicy] = React.useState<boolean | null>(null);
  const [requests, setRequests] = React.useState<RequestRow[] | null>(null);
  const [requesting, setRequesting] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const [polRes, reqRes] = await Promise.all([
        fetch("/api/portal/cafeteria?view=policy"),
        fetch("/api/portal/cafeteria"),
      ]);
      const [polJson, reqJson] = await Promise.all([polRes.json(), reqRes.json()]);
      if (polJson.ok) setPolicy(polJson.data.allowParentCafeteriaRequests);
      if (reqJson.ok) setRequests(reqJson.data.requests.filter((r: RequestRow) => r.studentId === studentId));
    } catch { /* non-blocking card */ }
  }, [studentId]);
  React.useEffect(() => { load(); }, [load]);

  // Nothing real to show — school hasn't opted in and no history — stay out of the way.
  if (policy === false && (requests === null || requests.length === 0)) return null;

  const hasPending = requests?.some((r) => r.status === "PENDING") ?? false;

  return (
    <>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><UtensilsCrossed className="h-4 w-4 text-navy-400" /> Feeding program</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {policy === null || requests === null ? (
            <Skeleton className="h-16 rounded-2xl" />
          ) : (
            <>
              <div className="rounded-2xl bg-warm-50 px-3 py-2.5 dark:bg-navy-800">
                <p className="text-sm font-medium text-navy-900 dark:text-navy-50">
                  {hasActiveCard ? `${studentName} has an active meal card.` : `${studentName} is not currently on a feeding plan.`}
                </p>
              </div>

              {policy ? (
                <Button size="sm" variant="secondary" onClick={() => setRequesting(true)} disabled={hasPending}>
                  <Plus className="h-3.5 w-3.5" /> {hasActiveCard ? "Request to cancel" : "Request to enroll"}
                </Button>
              ) : (
                <p className="text-xs text-navy-400">Feeding-program requests aren&apos;t open from the portal — contact the school office.</p>
              )}

              {requests.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-navy-400">Your requests</p>
                  <ul className="space-y-1.5">
                    {requests.map((r) => (
                      <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-navy-100 px-3 py-2 text-xs dark:border-navy-800">
                        <span className="text-navy-700 dark:text-navy-200">
                          {r.action === "ENROLL" ? "Enroll" : "Cancel"}
                          {r.status === "DECLINED" && r.declineReason ? ` — ${r.declineReason}` : ""}
                        </span>
                        <Badge tone={STATUS_TONE[r.status] ?? "neutral"}>{r.status.toLowerCase()}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {requesting && (
        <RequestDialog
          studentId={studentId}
          action={hasActiveCard ? "CANCEL" : "ENROLL"}
          onClose={() => setRequesting(false)}
          onDone={() => { setRequesting(false); toast({ title: "Request sent to the school ✓", tone: "success" }); load(); }}
        />
      )}
    </>
  );
}

function RequestDialog({ studentId, action, onClose, onDone }: { studentId: string; action: "ENROLL" | "CANCEL"; onClose: () => void; onDone: () => void }) {
  const { toast } = useToast();
  const [reason, setReason] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function submit() {
    setSaving(true);
    try {
      const res = await fetch("/api/portal/cafeteria", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, action, reason: reason || undefined }),
      });
      const json = await res.json();
      if (json.ok) onDone();
      else toast({ title: json.error?.message || "Could not send the request", tone: "error" });
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy-950/40 p-4 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-card dark:bg-navy-900" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-base font-semibold text-navy-900 dark:text-navy-50">{action === "ENROLL" ? "Request to enroll" : "Request to cancel"}</h3>
          <button onClick={onClose} className="rounded-full p-1 text-navy-400 hover:bg-navy-50 dark:hover:bg-navy-800" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3">
          <div><Label>Reason (optional)</Label><Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. We'd like our child to join the lunch program" /></div>
          <Button onClick={submit} disabled={saving} className="w-full">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Send request
          </Button>
        </div>
      </div>
    </div>
  );
}
