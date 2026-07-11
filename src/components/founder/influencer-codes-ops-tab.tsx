"use client";

/**
 * T.6 — NEYO Ops "Influencer Codes" tab. A real INDIVIDUAL PERSON (not a
 * school) holds a unique code; a school using it gets a real discount, and
 * the influencer earns a real one-time commission per school signed.
 * Genuinely distinct from M.1's school-to-school referral system.
 */
import * as React from "react";
import { Users, Plus, Inbox, Check, Pause, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

interface Code {
  id: string; code: string; personName: string; personPhone: string | null; personEmail: string | null;
  discountPct: number; commissionKes: number; active: boolean;
  schoolsSignedUp: number; totalOwedKes: number; totalPaidKes: number; createdAt: string;
}
interface Commission {
  id: string; schoolName: string; amountKes: number; status: string;
  influencerCode: string; personName: string; paidAt: string | null; paidNote: string | null; createdAt: string;
}

const kes = (n: number) => `KES ${n.toLocaleString("en-KE")}`;

export function InfluencerCodesOpsTab() {
  const { toast } = useToast();
  const [codes, setCodes] = React.useState<Code[] | null>(null);
  const [commissions, setCommissions] = React.useState<Commission[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setError(null);
    try {
      const [codesRes, commRes] = await Promise.all([
        fetch("/api/ops/influencer-codes"),
        fetch("/api/ops/influencer-codes?view=commissions&status=OWED"),
      ]);
      const codesJson = await codesRes.json();
      const commJson = await commRes.json();
      if (codesJson.ok) setCodes(codesJson.data.codes); else setError(codesJson.error?.message || "Failed to load");
      if (commJson.ok) setCommissions(commJson.data.commissions);
    } catch { setError("Failed to load"); }
  }, []);
  React.useEffect(() => { void load(); }, [load]);

  async function toggleActive(codeId: string, active: boolean) {
    setBusyId(codeId);
    try {
      const res = await fetch("/api/ops/influencer-codes", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setActive", codeId, active }),
      });
      const json = await res.json();
      if (json.ok) { toast({ title: active ? "Reactivated" : "Retired", tone: "success" }); await load(); }
      else toast({ title: json.error?.message || "Failed", tone: "error" });
    } finally { setBusyId(null); }
  }

  async function markPaid(commissionId: string) {
    setBusyId(commissionId);
    try {
      const res = await fetch("/api/ops/influencer-codes", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markPaid", commissionId }),
      });
      const json = await res.json();
      if (json.ok) { toast({ title: "Marked paid", tone: "success" }); await load(); }
      else toast({ title: json.error?.message || "Failed", tone: "error" });
    } finally { setBusyId(null); }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2"><Users className="h-5 w-5 text-green-600" /> Influencer / promoter codes</span>
            <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="h-3.5 w-3.5" /> New code</Button>
          </CardTitle>
          <p className="mt-1 text-xs text-navy-500 dark:text-navy-400">
            A real individual promoter's own code — a school using it gets a real discount, and the promoter earns a real one-time commission per school signed. Mutually exclusive with a discount campaign at signup.
          </p>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-900/20">
              {error} <Button size="sm" variant="secondary" className="ml-2" onClick={() => void load()}>Retry</Button>
            </div>
          ) : codes === null ? (
            <div className="space-y-3">{[0, 1].map((i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}</div>
          ) : codes.length === 0 ? (
            <EmptyState icon={Inbox} title="No influencer codes yet" description="Create a real code for a promoter/influencer to share." />
          ) : (
            <div className="space-y-3">
              {codes.map((c) => (
                <div key={c.id} className="rounded-2xl border border-navy-100 bg-white/70 p-4 dark:border-navy-800 dark:bg-navy-900/60">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-navy-900 dark:text-navy-50">{c.personName} <span className="font-mono text-xs text-navy-400">({c.code})</span></p>
                      <p className="mt-0.5 text-sm text-navy-500 dark:text-navy-400">
                        {Math.round(c.discountPct * 100)}% school discount · {kes(c.commissionKes)} commission per school
                      </p>
                      <p className="mt-1 text-[11px] text-navy-400">
                        {c.schoolsSignedUp} school{c.schoolsSignedUp === 1 ? "" : "s"} signed up · owed {kes(c.totalOwedKes)} · paid {kes(c.totalPaidKes)}
                      </p>
                    </div>
                    <Badge tone={c.active ? "green" : "neutral"}>{c.active ? "active" : "retired"}</Badge>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button size="sm" variant="secondary" disabled={busyId === c.id} onClick={() => toggleActive(c.id, !c.active)}>
                      {c.active ? <><Pause className="h-3.5 w-3.5" /> Retire</> : <><Play className="h-3.5 w-3.5" /> Reactivate</>}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Commissions owed</CardTitle>
          <p className="mt-1 text-xs text-navy-500 dark:text-navy-400">Real payables NEYO owes each promoter — mark paid once you've actually settled it (M-Pesa/bank, outside NEYO).</p>
        </CardHeader>
        <CardContent>
          {commissions === null ? (
            <div className="space-y-2">{[0, 1].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>
          ) : commissions.length === 0 ? (
            <EmptyState icon={Check} title="Nothing owed right now" description="Real commissions will appear here once a school an influencer referred pays their first invoice." />
          ) : (
            <div className="space-y-2">
              {commissions.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-navy-100 bg-white/70 p-3 dark:border-navy-800 dark:bg-navy-900/60">
                  <div>
                    <p className="text-sm font-semibold text-navy-900 dark:text-navy-50">{c.schoolName} — {kes(c.amountKes)}</p>
                    <p className="text-xs text-navy-400">{c.personName} ({c.influencerCode})</p>
                  </div>
                  <Button size="sm" disabled={busyId === c.id} onClick={() => markPaid(c.id)}><Check className="h-3.5 w-3.5" /> Mark paid</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {createOpen && <CreateCodeDialog onClose={() => setCreateOpen(false)} onDone={() => { setCreateOpen(false); load(); toast({ title: "Influencer code created", tone: "success" }); }} />}
    </div>
  );
}

function CreateCodeDialog({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { toast } = useToast();
  const [personName, setPersonName] = React.useState("");
  const [personPhone, setPersonPhone] = React.useState("");
  const [discountPct, setDiscountPct] = React.useState("10");
  const [commissionKes, setCommissionKes] = React.useState("3000");
  const [saving, setSaving] = React.useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/ops/influencer-codes", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personName, personPhone, discountPct: Number(discountPct) / 100, commissionKes: Number(commissionKes) }),
      });
      const json = await res.json();
      if (json.ok) onDone();
      else toast({ title: json.error?.message || "Failed", tone: "error" });
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-pop dark:bg-navy-900" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-navy-900 dark:text-navy-50">New influencer code</h3>
        <div className="mt-4 space-y-3">
          <div><Label>Full name</Label><Input value={personName} onChange={(e) => setPersonName(e.target.value)} placeholder="Juma Otieno" /></div>
          <div><Label>Phone (optional)</Label><Input value={personPhone} onChange={(e) => setPersonPhone(e.target.value)} placeholder="0712 345 678" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>School discount %</Label><Input type="number" min={1} max={50} value={discountPct} onChange={(e) => setDiscountPct(e.target.value)} /></div>
            <div><Label>Commission (KES)</Label><Input type="number" min={1} value={commissionKes} onChange={(e) => setCommissionKes(e.target.value)} /></div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={save} disabled={saving || personName.trim().length < 2}>Create code</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
