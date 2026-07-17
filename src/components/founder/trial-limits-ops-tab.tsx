"use client";

import * as React from "react";
import { ShieldAlert, Save, Loader2, Users, Smartphone, HardDrive, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

interface TrialConfigData {
  students: number;
  staff: number;
  smsPerTerm: number;
  storageGb: number;
}

export function TrialLimitsOpsTab() {
  const { toast } = useToast();
  const [config, setConfig] = React.useState<TrialConfigData>({
    students: 50,
    staff: 15,
    smsPerTerm: 0,
    storageGb: 1.0,
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const fetchConfig = React.useCallback(async () => {
    try {
      const res = await fetch("/api/founder-ops/trial-limits");
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
      const res = await fetch("/api/founder-ops/trial-limits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const json = await res.json();
      if (!json.ok) {
        toast({ title: json.error?.message || "Could not save trial limits.", tone: "error" });
        return;
      }
      toast({ title: "Trial Usage Limits Updated!", description: "Active across all schools in their 30-Day Free Trial.", tone: "success" });
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
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            30-Day Free Trial Usage Caps & Safeguards (`Trial Limits Controller`)
          </h2>
          <p className="text-xs text-navy-500 dark:text-navy-400">
            Configure exact capacity caps for schools during their 30-Day Free Trial (`status: "TRIAL"`) to prevent exhaustive/abusive consumption before paying. Once a trial school hits these limits or their 30 days expire, they must choose their pricing model (`Capacity vs Modular`) and complete M-Pesa activation.
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
                <Users className="h-4 w-4 text-green-600" />
                Live Trial Capacity Limits (`TRIAL Status`)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <Label htmlFor="tStudents">Max Enrolled Students Allowed During Trial *</Label>
                  <Input
                    id="tStudents"
                    type="number"
                    value={config.students}
                    onChange={(e) => setConfig((p) => ({ ...p, students: Number(e.target.value) }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tStaff">Max Staff Accounts Allowed During Trial *</Label>
                  <Input
                    id="tStaff"
                    type="number"
                    value={config.staff}
                    onChange={(e) => setConfig((p) => ({ ...p, staff: Number(e.target.value) }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tStorage">Max Storage Quota Allowed During Trial (GB) *</Label>
                  <Input
                    id="tStorage"
                    type="number"
                    step="0.1"
                    value={config.storageGb}
                    onChange={(e) => setConfig((p) => ({ ...p, storageGb: Number(e.target.value) }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tSms">Free SMS Allowance During Trial (Messages) *</Label>
                  <Input
                    id="tSms"
                    type="number"
                    value={config.smsPerTerm}
                    onChange={(e) => setConfig((p) => ({ ...p, smsPerTerm: Number(e.target.value) }))}
                    required
                  />
                </div>
                <Button type="submit" disabled={saving} className="w-full rounded-full bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-sm">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Trial Limits & Safety Configuration
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-navy-100 dark:border-navy-800 bg-navy-50/40 dark:bg-navy-900/40">
            <CardHeader>
              <CardTitle className="text-base">Trial Conversion Safeguard Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-navy-600 dark:text-navy-300">
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/40 dark:bg-amber-950/20 space-y-2 font-mono">
                <div className="flex justify-between font-bold text-amber-900 dark:text-amber-200">
                  <span>Student Cap:</span>
                  <span>{config.students} learners</span>
                </div>
                <div className="flex justify-between font-bold text-amber-900 dark:text-amber-200">
                  <span>Staff Cap:</span>
                  <span>{config.staff} accounts</span>
                </div>
                <div className="flex justify-between font-bold text-amber-900 dark:text-amber-200">
                  <span>Storage Cap:</span>
                  <span>{config.storageGb} GB</span>
                </div>
              </div>
              <p className="leading-relaxed">
                When a trial school reaches these limits (`or when their 30-Day Free Trial period ends`), our <code>checkLimit()</code> engine automatically halts further enrollment and triggers our dynamic checkout prompt. The school principal goes right to <strong>Settings → Billing</strong>, chooses their exact pricing philosophy (`Capacity Complete vs Modular User & Module V1`), and completes their first M-Pesa IPN payment to instantly activate their full school census!
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
