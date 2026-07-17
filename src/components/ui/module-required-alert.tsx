"use client";

import * as React from "react";
import { Lock, AlertCircle, ArrowRight, Layers3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ModuleRequiredAlert({
  moduleKey,
  moduleLabel,
  featureLabel,
}: {
  moduleKey: string;
  moduleLabel: string;
  featureLabel: string;
}) {
  return (
    <Card className="rounded-3xl border border-amber-200 bg-amber-50/80 p-6 shadow-pop dark:border-amber-900/40 dark:bg-amber-950/20 animate-fade-in max-w-xl mx-auto my-6">
      <CardContent className="p-0 space-y-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
          <Lock className="h-7 w-7 animate-pulse" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-black tracking-tight text-amber-950 dark:text-white">
            🔒 Prerequisite Module Required (`{moduleLabel} Not Active`)
          </h3>
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            The operational feature <strong className="font-bold underline">{featureLabel}</strong> requires the <strong className="font-bold">[{moduleLabel}]</strong> module to be active. Your school has not switched on <strong>[{moduleLabel}]</strong> yet.
          </p>
          <p className="text-[11px] text-navy-500 dark:text-navy-400">
            Enabling optional modules mid-term dynamically updates your end-month billing ledger (`50% midpoint proration`).
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <a
            href="/settings/modules"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition active:scale-95"
          >
            <Layers3 className="h-4 w-4" />
            Switch On [{moduleLabel}] Module Now <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
