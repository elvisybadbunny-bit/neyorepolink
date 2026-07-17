"use client";

/**
 * PART EE.15 — Universal CBC/CBE Presets Modal (`EE.15`).
 * "Where the schools never need to type in adding they just add the presets."
 * 1-Click universal application of 7 Universal Competencies, KICD Formative Rubrics (`EE/ME/AE/BE`),
 * and Core Values/Duties without manual typing.
 */
import * as React from "react";
import { Sparkles, CheckCircle2, Loader2, ShieldCheck, Award, HeartHandshake, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  KICD_UNIVERSAL_COMPETENCIES,
  KICD_4POINT_RUBRICS,
  KICD_CORE_VALUES_AND_DUTIES,
} from "@/lib/data/universal-presets-data";

interface UniversalPresetsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplied?: () => void;
}

export function UniversalPresetsModal({ open, onOpenChange, onApplied }: UniversalPresetsModalProps) {
  const { toast } = useToast();
  const [busy, setBusy] = React.useState(false);
  const [applyingType, setApplyingType] = React.useState<string | null>(null);

  async function applyPreset(presetType: "COMPETENCIES" | "RUBRICS" | "VALUES_DUTIES" | "ALL") {
    setBusy(true);
    setApplyingType(presetType);
    try {
      const res = await fetch("/api/cbc/universal-presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presetType }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({
          title: `✓ Universal Presets Applied (` + json.data.result.addedCount + ` created, ` + json.data.result.skippedCount + ` skipped)`,
          description: "All official KICD frameworks added to your school catalog cleanly (`EE.15`).",
          tone: "success",
        });
        if (onApplied) onApplied();
      } else {
        toast({ title: json.error?.message || "Failed to apply preset", tone: "error" });
      }
    } catch {
      toast({ title: "Network error applying universal presets", tone: "error" });
    } finally {
      setBusy(false);
      setApplyingType(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[88vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader className="border-b border-navy-100 pb-4 dark:border-navy-800">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-black text-navy-950 dark:text-white flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-amber-500" />
                Universal CBC / CBE Presets Engine (`EE.15`)
              </DialogTitle>
              <p className="text-xs font-semibold text-navy-500 dark:text-navy-400 mt-1">
                &ldquo;Where the schools never need to type in adding — they just add the presets.&rdquo; 1-Click universal setup.
              </p>
            </div>
            <Button
              onClick={() => applyPreset("ALL")}
              disabled={busy}
              className="rounded-full bg-navy-900 hover:bg-navy-800 text-white font-black shadow-lg px-6 dark:bg-navy-50 dark:text-navy-900"
            >
              {busy && applyingType === "ALL" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2 text-amber-400" />}
              Apply ALL Universal Presets (`EE.15`)
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* Card 1: 7 Universal Core Competencies */}
          <div className="rounded-2xl border border-navy-200 bg-white p-5 shadow-sm space-y-4 dark:border-navy-800 dark:bg-navy-900 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge tone="blue" className="font-bold">7 Core Competencies (`J.4`)</Badge>
                <Award className="h-5 w-5 text-blue-500" />
              </div>
              <h3 className="text-base font-black text-navy-900 dark:text-navy-50">Official KICD Core Competencies</h3>
              <p className="text-xs text-navy-500 mt-1">
                Universal competency taxonomy across Kenyan primary and secondary schools (`PP1 to Grade 12`).
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-navy-700 dark:text-navy-300 max-h-48 overflow-y-auto pr-1">
                {KICD_UNIVERSAL_COMPETENCIES.map((c) => (
                  <li key={c.code} className="flex items-start gap-1.5 border-b border-navy-50 pb-1 dark:border-navy-800/60">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>{c.name}</strong> ({c.code})</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button
              variant="secondary"
              onClick={() => applyPreset("COMPETENCIES")}
              disabled={busy}
              className="w-full rounded-xl font-bold mt-4 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-300"
            >
              {busy && applyingType === "COMPETENCIES" ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
              Apply 7 Competencies (`1-Click`)
            </Button>
          </div>

          {/* Card 2: 4-Point Formative Rubrics */}
          <div className="rounded-2xl border border-navy-200 bg-white p-5 shadow-sm space-y-4 dark:border-navy-800 dark:bg-navy-900 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge tone="green" className="font-bold">Formative Rubrics (`J.5`)</Badge>
                <ShieldCheck className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-base font-black text-navy-900 dark:text-navy-50">KICD 4-Point Assessment Rubrics</h3>
              <p className="text-xs text-navy-500 mt-1">
                Official national grading descriptors (`EE, ME, AE, BE`) for daily observation and quiz conversion.
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-navy-700 dark:text-navy-300 max-h-48 overflow-y-auto pr-1">
                {KICD_4POINT_RUBRICS.map((r) => (
                  <li key={r.code} className="flex items-start gap-1.5 border-b border-navy-50 pb-1 dark:border-navy-800/60">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0 mt-0.5" />
                    <span><strong>{r.name}</strong>: {r.description.slice(0, 60)}…</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <Button
                variant="secondary"
                onClick={() => applyPreset("RUBRICS")}
                disabled={busy}
                className="w-full rounded-xl font-bold border border-green-200 text-green-700 hover:bg-green-50 dark:border-green-900 dark:text-green-300"
              >
                {busy && applyingType === "RUBRICS" ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                Apply 4-Point Rubrics (`PP1–Grade 9`)
              </Button>
              <Button
                variant="secondary"
                onClick={() => applyPreset("RUBRICS_8POINT" as any)}
                disabled={busy}
                className="w-full rounded-xl font-bold border border-emerald-300 text-emerald-800 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300"
              >
                {busy && applyingType === "RUBRICS_8POINT" ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                Apply 8-Point CBE Rubrics (`Grade 10–12`)
              </Button>
            </div>
          </div>

          {/* Card 3: Core Values & Duty Areas */}
          <div className="rounded-2xl border border-navy-200 bg-white p-5 shadow-sm space-y-4 dark:border-navy-800 dark:bg-navy-900 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge tone="amber" className="font-bold">Values &amp; Duties (`B.1`)</Badge>
                <HeartHandshake className="h-5 w-5 text-amber-500" />
              </div>
              <h3 className="text-base font-black text-navy-900 dark:text-navy-50">Core Values &amp; Student Duties</h3>
              <p className="text-xs text-navy-500 mt-1">
                National constitutional values (`Love, Responsibility, Respect`) and student leadership posts (`Class Prefect`).
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-navy-700 dark:text-navy-300 max-h-48 overflow-y-auto pr-1">
                {KICD_CORE_VALUES_AND_DUTIES.map((v) => (
                  <li key={v.name} className="flex items-start gap-1.5 border-b border-navy-50 pb-1 dark:border-navy-800/60">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>{v.name}</strong> ({v.category})</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button
              variant="secondary"
              onClick={() => applyPreset("VALUES_DUTIES")}
              disabled={busy}
              className="w-full rounded-xl font-bold mt-4 border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-900 dark:text-amber-300"
            >
              {busy && applyingType === "VALUES_DUTIES" ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
              Apply Values &amp; Duties (`1-Click`)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
