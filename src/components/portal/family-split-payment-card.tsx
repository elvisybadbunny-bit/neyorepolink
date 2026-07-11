"use client";

/**
 * T.14 — Multi-Child Payment Splitting. Real parent-facing card on the "My
 * children" list: pick one child to pay, or split one real amount evenly
 * across several real children's own open invoices, in a single real STK
 * push. Reuses the exact same real payment.service.ts STK mechanism every
 * other NEYO payment goes through — never a second parallel payment path.
 */
import * as React from "react";
import { Wallet, Loader2, Users, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

interface Child { id: string; name: string; feeBalanceKes: number; hasFeeInvoices: boolean }

const kes = (n: number) => `KES ${n.toLocaleString("en-KE")}`;

export function FamilySplitPaymentCard({ familyChildren }: { familyChildren: Child[] }) {
  const { toast } = useToast();
  const payable = familyChildren.filter((c) => c.hasFeeInvoices && c.feeBalanceKes > 0);
  const [open, setOpen] = React.useState(false);

  if (payable.length < 2) return null; // only worth offering when there's a real choice to make

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2"><Users className="h-5 w-5 text-green-600" /> Pay for more than one child at once</span>
            <Button size="sm" onClick={() => setOpen(true)}><Wallet className="h-3.5 w-3.5" /> Pay now</Button>
          </CardTitle>
          <p className="mt-1 text-xs text-navy-500 dark:text-navy-400">
            Combined open fee balance across your children: <span className="font-semibold text-navy-800 dark:text-navy-100">{kes(payable.reduce((s, c) => s + c.feeBalanceKes, 0))}</span>. Pay one child, or split one M-Pesa payment evenly across the ones you choose.
          </p>
        </CardHeader>
      </Card>
      {open && <SplitPaymentDialog familyChildren={payable} onClose={() => setOpen(false)} />}
    </>
  );
}

function SplitPaymentDialog({ familyChildren, onClose }: { familyChildren: Child[]; onClose: () => void }) {
  const { toast } = useToast();
  const [strategy, setStrategy] = React.useState<"ONE_CHILD" | "SPLIT_EQUALLY">("SPLIT_EQUALLY");
  const [selected, setSelected] = React.useState<Set<string>>(new Set(familyChildren.map((c) => c.id)));
  const [oneChild, setOneChild] = React.useState(familyChildren[0]?.id ?? "");
  const [amountKes, setAmountKes] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [done, setDone] = React.useState(false);

  function toggleChild(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function submit() {
    const studentIds = strategy === "ONE_CHILD" ? [oneChild] : [...selected];
    if (studentIds.length === 0 || (strategy === "SPLIT_EQUALLY" && studentIds.length < 2)) {
      toast({ title: "Choose at least two children to split across.", tone: "error" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/family", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "split_payment", strategy, amountKes: Number(amountKes), studentIds, phone }),
      });
      const json = await res.json();
      if (json.ok) {
        setDone(true);
        toast({ title: "STK push sent — check your phone to complete the payment.", tone: "success" });
      } else {
        toast({ title: json.error?.message || "Could not start the payment.", tone: "error" });
      }
    } finally { setSaving(false); }
  }

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
        <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-pop dark:bg-navy-900" onClick={(e) => e.stopPropagation()}>
          <Check className="mx-auto h-8 w-8 text-green-600" />
          <p className="mt-3 font-semibold text-navy-900 dark:text-navy-50">STK push sent</p>
          <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">Check your phone and enter your M-Pesa PIN to complete the payment.</p>
          <Button className="mt-4 w-full" onClick={onClose}>Done</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-pop dark:bg-navy-900" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-navy-900 dark:text-navy-50">Pay for your children</h3>
        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => setStrategy("ONE_CHILD")}
              className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold ${strategy === "ONE_CHILD" ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20" : "border-navy-200 text-navy-600 dark:border-navy-700 dark:text-navy-300"}`}
            >
              One child
            </button>
            <button
              onClick={() => setStrategy("SPLIT_EQUALLY")}
              className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold ${strategy === "SPLIT_EQUALLY" ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20" : "border-navy-200 text-navy-600 dark:border-navy-700 dark:text-navy-300"}`}
            >
              Split evenly
            </button>
          </div>

          {strategy === "ONE_CHILD" ? (
            <div>
              <Label>Which child</Label>
              <select value={oneChild} onChange={(e) => setOneChild(e.target.value)} className="mt-1 w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-800">
                {familyChildren.map((c) => <option key={c.id} value={c.id}>{c.name} — {kes(c.feeBalanceKes)} owing</option>)}
              </select>
            </div>
          ) : (
            <div>
              <Label>Split across</Label>
              <div className="mt-1 space-y-1.5">
                {familyChildren.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 rounded-xl border border-navy-100 px-3 py-2 text-sm dark:border-navy-800">
                    <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleChild(c.id)} className="h-4 w-4 rounded border-navy-300 text-green-600" />
                    <span className="flex-1">{c.name}</span>
                    <span className="text-xs text-navy-400">{kes(c.feeBalanceKes)} owing</span>
                  </label>
                ))}
              </div>
              <p className="mt-1 text-[11px] text-navy-400">If the split doesn&apos;t divide evenly into whole shillings, the extra 1-2 KES goes to whichever child owes the most.</p>
            </div>
          )}

          <div><Label>Amount to pay now (KES)</Label><Input type="number" min={1} value={amountKes} onChange={(e) => setAmountKes(e.target.value)} /></div>
          <div><Label>M-Pesa phone number</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712 345 678" /></div>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={submit} disabled={saving || !amountKes || !phone}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />} Pay
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
