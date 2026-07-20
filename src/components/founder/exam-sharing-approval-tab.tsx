"use client";

/**
 * EE.6 — Platform Operations Approval Queue for cross-school public exam paper sharing.
 * Real backend existed (scannedExamPaper.sharingApprovalStatus, privacyTier,
 * /api/ops/exam-sharing GET/POST) with ZERO frontend UI anywhere until this
 * fix -- found while re-auditing EE.4 through EE.9 against the actual live
 * app, per founder's explicit request to check keenly whether claimed
 * features are genuinely wired full-stack.
 */
import * as React from "react";
import { ShieldCheck, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

interface PendingSharingRequest {
  id: string;
  title: string;
  schoolName: string;
  className: string;
  subject: { id: string; name: string; code: string };
  questions: unknown[];
  sharingRequestedAt: string;
}

export function ExamSharingApprovalTab() {
  const { toast } = useToast();
  const [rows, setRows] = React.useState<PendingSharingRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [decidingId, setDecidingId] = React.useState<string | null>(null);
  const [notes, setNotes] = React.useState<Record<string, string>>({});

  const load = React.useCallback(() => {
    setLoading(true);
    fetch("/api/ops/exam-sharing")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setRows(j.data.requests ?? []);
        else toast({ title: j.error?.message || "Could not load sharing requests", tone: "error" });
      })
      .catch(() => toast({ title: "Network request failed", tone: "error" }))
      .finally(() => setLoading(false));
  }, [toast]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function decide(paperId: string, status: "APPROVED" | "REJECTED") {
    setDecidingId(paperId);
    try {
      const res = await fetch("/api/ops/exam-sharing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paperId, status, decisionNote: notes[paperId] || undefined }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: status === "APPROVED" ? "Exam paper approved for public sharing" : "Exam paper rejected", tone: "success" });
        load();
      } else {
        toast({ title: json.error?.message || "Could not decide on request", tone: "error" });
      }
    } finally {
      setDecidingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy-950 dark:text-white flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          Exam Sharing Approval
        </h2>
        <p className="text-sm text-navy-600 dark:text-navy-300 mt-1">
          Review schools' requests to share tidied exam papers publicly across NEYO. Approving
          moves a paper from `SCHOOL_ONLY` to `PUBLIC_SHARED`.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-navy-600 dark:text-navy-300">
            No pending exam sharing requests right now.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => (
            <Card key={r.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  {r.title}
                  <Badge tone="blue">{r.subject?.name}</Badge>
                </CardTitle>
                <span className="text-xs text-navy-500 dark:text-navy-400">
                  {new Date(r.sharingRequestedAt).toLocaleString()}
                </span>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-navy-700 dark:text-navy-200">
                  {r.schoolName} — {r.className} — {Array.isArray(r.questions) ? r.questions.length : 0} questions
                </div>
                <Input
                  placeholder="Optional decision note"
                  value={notes[r.id] || ""}
                  onChange={(e) => setNotes((prev) => ({ ...prev, [r.id]: e.target.value }))}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={decidingId === r.id}
                    onClick={() => decide(r.id, "APPROVED")}
                  >
                    {decidingId === r.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                    )}
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={decidingId === r.id}
                    onClick={() => decide(r.id, "REJECTED")}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
