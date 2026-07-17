"use client";

import * as React from "react";
import { Sparkles, DollarSign, Save, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { formatKES } from "@/lib/utils";

interface BundiOcrConfigData {
  freeAllowancePerTerm: number;
  bundle500PriceKes: number;
  bundle1500PriceKes: number;
  bundle5000PriceKes: number;
}

export function BundiOcrConfigTab() {
  const { toast } = useToast();
  const [config, setConfig] = React.useState<BundiOcrConfigData>({
    freeAllowancePerTerm: 500,
    bundle500PriceKes: 1000,
    bundle1500PriceKes: 2500,
    bundle5000PriceKes: 6500,
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const fetchConfig = React.useCallback(async () => {
    try {
      const res = await fetch("/api/founder-ops/bundi-ocr-config");
      const json = await res.json();
      if (json.ok && json.data?.config) {
        setConfig(json.data.config);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  async function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/founder-ops/bundi-ocr-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const json = await res.json();
      if (!json.ok) {
        toast({ title: json.error?.message || "Could not save OCR pricing config.", tone: "error" });
        return;
      }
      toast({ title: "Bundi OCR Quota & Top-Up Pricing Updated!", description: "Live across all Kenyan schools right now.", tone: "success" });
      await fetchConfig();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-navy-950 dark:text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Bundi OCR Scan Quota & Top-Up Revenue Controller
          </h2>
          <p className="text-xs text-navy-500 dark:text-navy-400">
            Configure free school scan allowances (`e.g., 500 pages/term`) and live-edit top-up bundle prices (`KES/bundle`) without changing code ("if in any case OCR goes up the price can be adjusted").
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="rounded-3xl border border-navy-100 dark:border-navy-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-green-600" />
                Live Scan Allowance & Bundle Pricing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <Label htmlFor="freeAllowancePerTerm">Free Scan Allowance per School per Term (Pages) *</Label>
                  <Input
                    id="freeAllowancePerTerm"
                    type="number"
                    value={config.freeAllowancePerTerm}
                    onChange={(e) => setConfig((p) => ({ ...p, freeAllowancePerTerm: Number(e.target.value) }))}
                    required
                  />
                  <p className="text-[11px] text-navy-400 mt-1">When a school exceeds this allowance, they are prompted to unlock a Scan Top-Up Bundle.</p>
                </div>
                <div>
                  <Label htmlFor="b500">Scan Bundle 1 (`500 Pages`) Price (KES) *</Label>
                  <Input
                    id="b500"
                    type="number"
                    value={config.bundle500PriceKes}
                    onChange={(e) => setConfig((p) => ({ ...p, bundle500PriceKes: Number(e.target.value) }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="b1500">Scan Bundle 2 (`1,500 Pages`) Price (KES) *</Label>
                  <Input
                    id="b1500"
                    type="number"
                    value={config.bundle1500PriceKes}
                    onChange={(e) => setConfig((p) => ({ ...p, bundle1500PriceKes: Number(e.target.value) }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="b5000">Scan Bundle 3 (`5,000 Pages`) Price (KES) *</Label>
                  <Input
                    id="b5000"
                    type="number"
                    value={config.bundle5000PriceKes}
                    onChange={(e) => setConfig((p) => ({ ...p, bundle5000PriceKes: Number(e.target.value) }))}
                    required
                  />
                </div>
                <Button type="submit" disabled={saving} className="w-full rounded-full bg-green-700 hover:bg-green-800 text-white font-semibold shadow-sm">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save OCR Revenue & Quota Configuration
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-navy-100 dark:border-navy-800 bg-navy-50/40 dark:bg-navy-900/40">
            <CardHeader>
              <CardTitle className="text-base">Unit Economics & Margin Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-navy-600 dark:text-navy-300">
              <div className="rounded-2xl border border-green-200 bg-green-50/60 p-4 dark:border-green-900/40 dark:bg-green-950/20 space-y-2 font-mono">
                <div className="flex justify-between font-bold text-green-900 dark:text-green-200">
                  <span>500 Page Bundle:</span>
                  <span>{formatKES(config.bundle500PriceKes)} ({Math.round((config.bundle500PriceKes/500)*100)/100} KES/page)</span>
                </div>
                <div className="flex justify-between font-bold text-green-900 dark:text-green-200">
                  <span>1,500 Page Bundle:</span>
                  <span>{formatKES(config.bundle1500PriceKes)} ({Math.round((config.bundle1500PriceKes/1500)*100)/100} KES/page)</span>
                </div>
                <div className="flex justify-between font-bold text-green-900 dark:text-green-200">
                  <span>5,000 Page Bundle:</span>
                  <span>{formatKES(config.bundle5000PriceKes)} ({Math.round((config.bundle5000PriceKes/5000)*100)/100} KES/page)</span>
                </div>
              </div>
              <p className="leading-relaxed">
                Because 100% of initial scans run locally via <strong>Tier 1 Edge OCR (Bundi Edge WebAssembly) at KES 0 cost</strong>, and our image pipeline runs in-browser WebP downsampling (&lt;65KB) with SHA-256 CAS deduplication, these top-up bundles deliver near-100% gross profit margin while giving schools infinite flexibility!
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
