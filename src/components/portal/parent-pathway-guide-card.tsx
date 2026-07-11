"use client";

/**
 * Y.1 — NEYO Pathway Guide launcher card for a parent's child view. A quick
 * "start the guide" entry point that links to the full quiz at
 * /pathway-guide?studentId=... — kept separate from J.10's ParentPathwayCard
 * (which shows academic readiness for ALREADY-configured pathways) since
 * this is a genuinely different feature: an interest/values questionnaire
 * that RECOMMENDS a pathway + subject combination in the first place.
 */
import * as React from "react";
import { Compass, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ParentPathwayGuideCard({ studentId, studentName }: { studentId: string; studentName: string }) {
  const [enabled, setEnabled] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    let active = true;
    fetch("/api/pathway-guide")
      .then((res) => { if (active) setEnabled(res.ok); })
      .catch(() => { if (active) setEnabled(false); });
    return () => { active = false; };
  }, []);

  if (enabled === false) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Compass className="h-4 w-4 text-indigo-500" /> NEYO Pathway Guide</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-navy-500 dark:text-navy-400">
          Not sure which Senior School pathway or subjects are right for {studentName.split(" ")[0]}? Answer a few honest questions about interests, strengths and dreams — free for NEYO families — and see real university courses that match.
        </p>
        <Button onClick={() => { window.location.href = `/pathway-guide?studentId=${studentId}`; }} size="sm">
          Start the guide <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
}
