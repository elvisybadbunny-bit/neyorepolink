"use client";

/**
 * T.2 — Platform Operations "Discount Campaigns" tab. Genuinely distinct from M.1's
 * Referral Engine (a fixed 5%, tied to a referral code) and J.23's Revenue
 * Grants (a free premium feature, not a % off price): a real, time-boxed
 * platform-wide promotional rule. Founder-confirmed: only ONE real
 * campaign may ever be ACTIVE at a time.
 */
import * as React from "react";
import { Percent, Plus, X, Inbox } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

interface Campaign {
  id: string; name: string; appliesTo: string; percentOff: number;
  startDate: string; endDate: string; active: boolean;
  createdByName: string; createdAt: string;
}

export function DiscountCampaignsOpsTab() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = React.useState<Campaign[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/ops/discount-campaigns");
      const json = await res.json();
      if (json.ok) setCampaigns(json.data.campaigns); else setError(json.error?.message || "Failed to load");
    } catch { setError("Failed to load"); }
  }, []);
  React.useEffect(() => { void load(); }, [load]);

  async function endCampaign(campaignId: string) {
    setBusyId(campaignId);
    try {
      const res = await fetch("/api/ops/discount-campaigns", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "end", campaignId }),
      });
      const json = await res.json();
      if (json.ok) { toast({ title: "Campaign ended", tone: "success" }); await load(); }
      else toast({ title: json.error?.message || "Failed", tone: "error" });
    } finally { setBusyId(null); }
  }

  const now = new Date();
  const isCurrentlyLive = (c: Campaign) => c.active && new Date(c.startDate) <= now && new Date(c.endDate) >= now;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2"><Percent className="h-5 w-5 text-green-600" /> Discount campaigns</span>
          <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="h-3.5 w-3.5" /> New campaign</Button>
        </CardTitle>
        <p className="mt-1 text-xs text-navy-500 dark:text-navy-400">
          A real, time-boxed platform-wide promotion — either a one-time discount for new signups, or a temporary discount for every currently-subscribed school.
          Only ONE campaign may be active at a time. Distinct from Revenue Grants (a free feature) and the Referral Engine (a fixed 5% referral reward).
        </p>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-900/20">
            {error} <Button size="sm" variant="secondary" className="ml-2" onClick={() => void load()}>Retry</Button>
          </div>
        ) : campaigns === null ? (
          <div className="space-y-3">{[0, 1].map((i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}</div>
        ) : campaigns.length === 0 ? (
          <EmptyState icon={Inbox} title="No campaigns yet" description="Create a real time-boxed discount for new signups or every active school." />
        ) : (
          <div className="space-y-3">
            {campaigns.map((c) => (
              <div key={c.id} className="rounded-2xl border border-navy-100 bg-white/70 p-4 dark:border-navy-800 dark:bg-navy-900/60">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-navy-900 dark:text-navy-50">{c.name}</p>
                    <p className="mt-0.5 text-sm text-navy-500 dark:text-navy-400">
                      {Math.round(c.percentOff * 100)}% off · {c.appliesTo === "NEW_SIGNUPS" ? "new signups (first term only)" : "every active school's next renewal"}
                    </p>
                    <p className="mt-1 text-[11px] text-navy-400">
                      {new Date(c.startDate).toLocaleDateString("en-KE")} – {new Date(c.endDate).toLocaleDateString("en-KE")} · by {c.createdByName}
                    </p>
                  </div>
                  <Badge tone={isCurrentlyLive(c) ? "green" : c.active ? "amber" : "neutral"}>
                    {isCurrentlyLive(c) ? "LIVE NOW" : c.active ? "scheduled/ended" : "ended"}
                  </Badge>
                </div>
                {c.active && (
                  <div className="mt-3 flex justify-end">
                    <Button size="sm" variant="secondary" disabled={busyId === c.id} onClick={() => endCampaign(c.id)}>
                      <X className="h-3.5 w-3.5" /> End campaign
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {createOpen && <CreateCampaignDialog onClose={() => setCreateOpen(false)} onDone={() => { setCreateOpen(false); load(); toast({ title: "Campaign created", tone: "success" }); }} />}
    </Card>
  );
}

function CreateCampaignDialog({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { toast } = useToast();
  const [name, setName] = React.useState("");
  const [appliesTo, setAppliesTo] = React.useState<"NEW_SIGNUPS" | "ALL_ACTIVE_SCHOOLS">("NEW_SIGNUPS");
  const [percentOff, setPercentOff] = React.useState("20");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/ops/discount-campaigns", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, appliesTo, percentOff: Number(percentOff) / 100, startDate, endDate }),
      });
      const json = await res.json();
      if (json.ok) onDone();
      else toast({ title: json.error?.message || "Failed", tone: "error" });
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-pop dark:bg-navy-900" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-navy-900 dark:text-navy-50">New discount campaign</h3>
        <div className="mt-4 space-y-3">
          <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="August New-School Promo" /></div>
          <div>
            <Label>Applies to</Label>
            <select value={appliesTo} onChange={(e) => setAppliesTo(e.target.value as typeof appliesTo)} className="mt-1 w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-800">
              <option value="NEW_SIGNUPS">New signups only (first term)</option>
              <option value="ALL_ACTIVE_SCHOOLS">Every active school (next renewal)</option>
            </select>
          </div>
          <div><Label>Percent off</Label><Input type="number" min={1} max={90} value={percentOff} onChange={(e) => setPercentOff(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Start date</Label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
            <div><Label>End date</Label><Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={save} disabled={saving || !name || !startDate || !endDate}>Create campaign</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
