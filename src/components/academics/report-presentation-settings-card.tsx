"use client";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function ReportPresentationSettingsCard({
  canManage,
}: {
  canManage: boolean;
}) {
  const { toast } = useToast();
  const [settings, setSettings] = React.useState({
    rankingPolicy: "SHOW_RANKINGS",
    showFeesOnReport: false,
    printMode: "COLOUR",
  });
  React.useEffect(() => {
    fetch("/api/academics/grading/report-settings")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setSettings(j.data);
      })
      .catch(() => {});
  }, []);
  async function save() {
    const response = await fetch("/api/academics/grading/report-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    const json = await response.json();
    toast({
      title: json.ok
        ? "Learner report policy saved"
        : json.error?.message || "Could not save report policy.",
      tone: json.ok ? "success" : "error",
    });
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Consolidated learner report policy
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        <label className="text-xs font-semibold text-navy-600">
          Ranking display
          <select
            disabled={!canManage}
            value={settings.rankingPolicy}
            onChange={(e) =>
              setSettings((s) => ({ ...s, rankingPolicy: e.target.value }))
            }
            className="mt-1 h-10 w-full rounded-xl border bg-white px-3 dark:bg-navy-900"
          >
            <option value="SHOW_RANKINGS">
              Show subject and overall positions
            </option>
            <option value="HIDE_RANKINGS">Hide positions</option>
            <option value="BANDS_ONLY">Show grades/CBE levels only</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-navy-600">
          Print appearance
          <select
            disabled={!canManage}
            value={settings.printMode}
            onChange={(e) =>
              setSettings((s) => ({ ...s, printMode: e.target.value }))
            }
            className="mt-1 h-10 w-full rounded-xl border bg-white px-3 dark:bg-navy-900"
          >
            <option value="COLOUR">Colour</option>
            <option value="BLACK_AND_WHITE">Black and white</option>
          </select>
        </label>
        <label className="flex items-center gap-2 rounded-xl border p-3 text-xs font-semibold">
          <input
            disabled={!canManage}
            type="checkbox"
            checked={settings.showFeesOnReport}
            onChange={(e) =>
              setSettings((s) => ({ ...s, showFeesOnReport: e.target.checked }))
            }
          />
          Show approved fee information on reports
        </label>
        <p className="text-xs text-navy-500 sm:col-span-3">
          These choices change presentation only. They never change marks.
          Missing work that the school did not conduct remains omitted.
        </p>
        {canManage && (
          <div className="sm:col-span-3">
            <Button variant="secondary" onClick={save}>
              Save Report Policy
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
