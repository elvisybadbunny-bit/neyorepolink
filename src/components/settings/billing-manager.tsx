"use client";

import * as React from "react";
import { Check, Loader2, Send, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { formatKES } from "@/lib/utils";

interface PlanDef {
  key: string;
  name: string;
  pricePerTerm: number;
  highlights: string[];
}
interface LimitStatus {
  metric: string;
  used: number;
  limit: number;
  blocked: boolean;
  overLimit: boolean;
}
interface BillingData {
  subscription: {
    planKey: string;
    planName: string;
    status: string;
    price: number;
    currentPeriodEnd: string;
    pricingMode?: string;
    sizeBasedPriceKes?: number;
  };
  limits: LimitStatus[];
  plans: PlanDef[];
  dualPricing?: {
    currentMode: string;
    activePriceKes: number;
    capacityModel: { monthlyPriceKes: number; rawScore: number };
    modularModel: {
      termTotalKes: number;
      baseCoreFeeKes: number;
      studentFeeKes: number;
      staffFeeKes: number;
      modulesFeeKes: number;
      optionalModulesCount: number;
    };
    rates: {
      perStudentRateKes: number;
      perStaffRateKes: number;
      baseCoreFeeKes: number;
      perModuleRateKes: number;
    };
  };
}

const STATUS_TONE: Record<string, "green" | "amber" | "red" | "neutral"> = {
  ACTIVE: "green",
  GRACE: "amber",
  PAST_DUE: "amber",
  SUSPENDED: "red",
  CANCELLED: "neutral",
};

const METRIC_LABEL: Record<string, string> = {
  students: "Students",
  staff: "Staff",
  smsPerTerm: "SMS top-up balance",
};

export function BillingManager({
  data,
  canManage,
}: {
  data: BillingData;
  canManage: boolean;
}) {
  const { toast } = useToast();
  const [sub, setSub] = React.useState(data.subscription);
  const [pending, setPending] = React.useState<string | null>(null);
  const [supportSubject, setSupportSubject] = React.useState("Billing question");
  const [supportBody, setSupportBody] = React.useState("");
  const [supportPriority, setSupportPriority] = React.useState("NORMAL");
  const [sendingSupport, setSendingSupport] = React.useState(false);

  const [currentMode, setCurrentMode] = React.useState(data.dualPricing?.currentMode || sub.pricingMode || "SIZE_BASED_V2");
  const [switchingModel, setSwitchingModel] = React.useState<string | null>(null);

  async function subscribe(planKey: string) {
    setPending(planKey);
    try {
      const res = await fetch("/api/billing/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast({ title: json.error?.message || "Could not change plan.", tone: "error" });
        return;
      }
      setSub((s) => ({
        ...s,
        planKey: json.data.planKey,
        planName: json.data.planName,
        status: json.data.status,
      }));
      toast({ title: `You're now on ${json.data.planName}`, tone: "success" });
    } finally {
      setPending(null);
    }
  }

  async function switchModel(mode: "SIZE_BASED_V2" | "MODULAR_USERS_V1") {
    setSwitchingModel(mode);
    try {
      const res = await fetch("/api/billing/switch-model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPricingMode: mode }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast({ title: json.error?.message || "Could not switch pricing model.", tone: "error" });
        return;
      }
      setCurrentMode(mode);
      setSub((s) => ({
        ...s,
        price: json.data.subscription?.sizeBasedPriceKes || s.price,
        sizeBasedPriceKes: json.data.subscription?.sizeBasedPriceKes,
        pricingMode: mode,
      }));
      toast({
        title: `Switched to ${mode === "SIZE_BASED_V2" ? "Capacity-Based Model V2" : "Modular User & Module Model V1"}`,
        description: `Your active term pricing is now ${formatKES(json.data.subscription?.sizeBasedPriceKes || 0)}.`,
        tone: "success",
      });
    } finally {
      setSwitchingModel(null);
    }
  }


  async function contactNeyo() {
    if (!supportSubject.trim() || !supportBody.trim()) {
      toast({ title: "Write the subject and message first.", tone: "error" });
      return;
    }
    setSendingSupport(true);
    try {
      const res = await fetch("/api/neyo-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_thread", subject: supportSubject, body: supportBody, priority: supportPriority }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || "Could not contact NEYO.");
      setSupportBody("");
      toast({ title: "Message sent to NEYO", description: "The NEYO team will reply in this account.", tone: "success" });
    } catch (error: any) {
      toast({ title: error.message || "Could not contact NEYO", tone: "error" });
    } finally {
      setSendingSupport(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Current plan */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Current plan</CardTitle>
          <Badge tone={STATUS_TONE[sub.status] ?? "neutral"}>{sub.status}</Badge>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-navy-900 dark:text-navy-50">
              {sub.planName}
            </span>
            <span className="text-sm text-navy-500 dark:text-navy-400">
              {sub.price > 0 ? `${formatKES(sub.price)} / term` : "Free"}
            </span>
          </div>
          <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">
            Renews{" "}
            {new Date(sub.currentPeriodEnd).toLocaleDateString("en-KE", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          {/* Usage bars */}
          <div className="mt-5 space-y-4">
            {data.limits.map((l) => {
              const pct = l.limit > 0 ? Math.min(100, Math.round((l.used / l.limit) * 100)) : 0;
              const barColor = l.blocked
                ? "bg-red-500"
                : l.overLimit
                  ? "bg-amber-500"
                  : "bg-green-500";
              return (
                <div key={l.metric}>
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-600 dark:text-navy-300">
                      {METRIC_LABEL[l.metric] ?? l.metric}
                    </span>
                    <span className="text-navy-500 dark:text-navy-400">
                      {l.metric === "smsPerTerm" && l.limit === 0
                        ? "Buy SMS top-up"
                        : `${l.used.toLocaleString()} / ${l.limit.toLocaleString()}`}

                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-navy-100 dark:bg-navy-800">
                    <div
                      className={`h-full rounded-full ${barColor} transition-all duration-200 ease-apple`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact NEYO about billing or your account</CardTitle>
          <p className="text-sm text-navy-500 dark:text-navy-400">Send a support thread directly to NEYO. Replies arrive inside your school account.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
            <input value={supportSubject} onChange={(e) => setSupportSubject(e.target.value)} className="h-10 rounded-full border border-navy-200 bg-white px-4 text-sm dark:border-navy-700 dark:bg-navy-900" placeholder="Subject" />
            <select value={supportPriority} onChange={(e) => setSupportPriority(e.target.value)} className="h-10 rounded-full border border-navy-200 bg-white px-4 text-sm dark:border-navy-700 dark:bg-navy-900"><option>LOW</option><option>NORMAL</option><option>HIGH</option><option>URGENT</option></select>
          </div>
          <textarea rows={4} value={supportBody} onChange={(e) => setSupportBody(e.target.value)} className="w-full rounded-2xl border border-navy-200 bg-white px-4 py-3 text-sm dark:border-navy-700 dark:bg-navy-900" placeholder="Tell NEYO what you need help with…" />
          <Button onClick={contactNeyo} disabled={sendingSupport || !supportBody.trim()}>
            {sendingSupport ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send to NEYO
          </Button>
        </CardContent>
      </Card>

      {/* Dual Pricing Model Selector */}
      {data.dualPricing && (
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-navy-400 dark:text-navy-500">
            Select School Pricing Model (Configurable in Settings)
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Card 1: Capacity-Based Model V2 */}
            <Card className={`rounded-3xl transition-all duration-300 ${currentMode === "SIZE_BASED_V2" ? "ring-2 ring-green-500/60 bg-green-50/20 dark:bg-green-950/10" : "hover:border-navy-300"}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge tone={currentMode === "SIZE_BASED_V2" ? "green" : "neutral"}>
                      {currentMode === "SIZE_BASED_V2" ? "Active Model" : "Alternative Model"}
                    </Badge>
                    <h3 className="mt-2 text-lg font-bold text-navy-950 dark:text-white">Capacity-Based Model V2</h3>
                    <p className="text-xs text-navy-500">Neyo Complete — All 18+ Modules Included by Default</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-navy-950 dark:text-white">
                      {formatKES(data.dualPricing.capacityModel.monthlyPriceKes)}
                    </p>
                    <p className="text-[11px] text-navy-400">/ term (flat capacity quote)</p>
                  </div>
                </div>
                <ul className="mt-4 space-y-2 border-t border-navy-100 pt-4 text-xs text-navy-600 dark:border-navy-800 dark:text-navy-300">
                  <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" /> Every core and optional module unlocked instantly</li>
                  <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" /> Fixed quote based on overall school size and usage score</li>
                  <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" /> No surprise fees when teachers test new tools or modules</li>
                </ul>
                {canManage && currentMode !== "SIZE_BASED_V2" && (
                  <Button
                    onClick={() => switchModel("SIZE_BASED_V2")}
                    disabled={switchingModel !== null}
                    className="mt-5 w-full rounded-full bg-green-700 hover:bg-green-800 text-white font-semibold"
                  >
                    {switchingModel === "SIZE_BASED_V2" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                    Switch to Capacity Complete Model
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Card 2: Modular User & Module V1 */}
            <Card className={`rounded-3xl transition-all duration-300 ${currentMode === "MODULAR_USERS_V1" ? "ring-2 ring-blue-500/60 bg-blue-50/20 dark:bg-blue-950/10" : "hover:border-navy-300"}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge tone={currentMode === "MODULAR_USERS_V1" ? "blue" : "neutral"}>
                      {currentMode === "MODULAR_USERS_V1" ? "Active Model" : "Alternative Model"}
                    </Badge>
                    <h3 className="mt-2 text-lg font-bold text-navy-950 dark:text-white">Modular User & Module Model V1</h3>
                    <p className="text-xs text-navy-500">Pay-Per-User + Pay-Per-Module Opened</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-navy-950 dark:text-white">
                      {formatKES(data.dualPricing.modularModel.termTotalKes)}
                    </p>
                    <p className="text-[11px] text-navy-400">/ term (exact user & module total)</p>
                  </div>
                </div>
                <div className="mt-3 rounded-2xl bg-navy-50/60 p-3 text-[11px] text-navy-600 dark:bg-navy-900/60 dark:text-navy-300 space-y-1">
                  <div className="flex justify-between"><span>Base Core Fee (`students, attendance, finance`):</span><span className="font-mono font-semibold">{formatKES(data.dualPricing.modularModel.baseCoreFeeKes)}</span></div>
                  <div className="flex justify-between"><span>Active Students / Staff (`at KES {data.dualPricing.rates.perStudentRateKes} / {data.dualPricing.rates.perStaffRateKes}`):</span><span className="font-mono font-semibold">{formatKES(data.dualPricing.modularModel.studentFeeKes + data.dualPricing.modularModel.staffFeeKes)}</span></div>
                  <div className="flex justify-between"><span>Optional Modules Opened (`{data.dualPricing.modularModel.optionalModulesCount} active @ KES {data.dualPricing.rates.perModuleRateKes}`):</span><span className="font-mono font-semibold text-blue-600">{formatKES(data.dualPricing.modularModel.modulesFeeKes)}</span></div>
                </div>
                <ul className="mt-4 space-y-2 border-t border-navy-100 pt-4 text-xs text-navy-600 dark:border-navy-800 dark:text-navy-300">
                  <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" /> Exact per-user calculation directly aligned with student census</li>
                  <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" /> Price scales only when you choose to open extra optional modules</li>
                  <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" /> Ideal for schools using only targeted modules</li>
                </ul>
                {canManage && currentMode !== "MODULAR_USERS_V1" && (
                  <Button
                    onClick={() => switchModel("MODULAR_USERS_V1")}
                    disabled={switchingModel !== null}
                    className="mt-5 w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    {switchingModel === "MODULAR_USERS_V1" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                    Switch to Modular User & Module Model
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Plan picker */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-navy-400 dark:text-navy-500">
          Plans
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {data.plans.map((p) => {
            const isCurrent = p.key === sub.planKey;
            return (
              <Card
                key={p.key}
                className={
                  isCurrent ? "ring-2 ring-green-500/50" : undefined
                }
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-navy-900 dark:text-navy-50">
                      {p.name}
                    </h3>
                    {isCurrent && <Badge tone="green">Current</Badge>}
                  </div>
                  <p className="mt-1 text-xl font-semibold text-navy-900 dark:text-navy-50">
                    {p.pricePerTerm > 0 ? formatKES(p.pricePerTerm) : "Free"}
                    {p.pricePerTerm > 0 && (
                      <span className="text-sm font-normal text-navy-400">
                        {" "}
                        / term
                      </span>
                    )}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {p.highlights.map((h) => (
                      <li
                        key={h}
                        className="flex items-start gap-2 text-sm text-navy-600 dark:text-navy-300"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                        {h}
                      </li>
                    ))}
                  </ul>
                  {canManage && !isCurrent && (
                    <Button
                      className="mt-5 w-full"
                      onClick={() => subscribe(p.key)}
                      disabled={pending !== null}
                    >
                      {pending === p.key ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4" />
                      )}
                      {p.pricePerTerm > sub.price ? "Upgrade" : "Switch"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        {!canManage && (
          <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
            Only school leadership can change the plan.
          </p>
        )}
      </div>
    </div>
  );
}
