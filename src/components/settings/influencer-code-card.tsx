"use client";

/**
 * T.6 — School-side: apply a real influencer/promoter code (Settings →
 * Billing). Founder-confirmed: mutually exclusive with a discount
 * campaign — a school uses ONE OR THE OTHER at signup, never both.
 */
import * as React from "react";
import { Megaphone, Send, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export function InfluencerCodeCard() {
  const { toast } = useToast();
  const [code, setCode] = React.useState("");
  const [applying, setApplying] = React.useState(false);
  const [applied, setApplied] = React.useState<{ personName: string; discountPct: number } | null>(null);

  async function apply() {
    if (!code.trim()) return;
    setApplying(true);
    try {
      const res = await fetch("/api/billing/influencer-code", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const json = await res.json();
      if (json.ok) {
        setApplied({ personName: json.data.personName, discountPct: json.data.discountPct });
        toast({ title: `Code applied — ${Math.round(json.data.discountPct * 100)}% off your first term`, tone: "success" });
        setCode("");
      } else {
        toast({ title: json.error?.message || "Could not apply that code.", tone: "error" });
      }
    } finally { setApplying(false); }
  }

  if (applied) {
    return (
      <Card>
        <CardContent className="p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-green-400">
            <Megaphone className="h-4 w-4" /> Promo code applied — {Math.round(applied.discountPct * 100)}% off your first term.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-green-600" /> Have a promo code?</CardTitle>
        <p className="mt-1 text-xs text-navy-500 dark:text-navy-400">
          If someone shared a real NEYO promoter code with you, enter it here for a one-time discount on your first term. You can use a promo code OR a referral code — not both.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="NEYO-JUMA01" className="font-mono" />
          <Button onClick={apply} disabled={applying || !code.trim()}>
            {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Apply
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
