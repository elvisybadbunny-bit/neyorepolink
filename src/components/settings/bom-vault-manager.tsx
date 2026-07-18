"use client";

/**
 * Idea 11 (kenyan-extensions.service.ts) — BOM & PA Board of Management
 * Document Room. Real backend existed (BomGovernanceDocument model,
 * /api/settings/bom-vault[/vote]) with ZERO frontend UI until this fix —
 * found during a full-stack audit of a prior AI session's "12 operational
 * suites" commit (in fact this very route's authorization bug was the
 * single most severe finding of that audit -- see the security fix commit
 * this session for the `requirePermission(user as any, ...)` class of bug,
 * already fixed there before this UI was built).
 *
 * Principal/Owner uploads a governance document (financial report, audit,
 * capex proposal, minutes); board members cast YES/NO votes; 3 YES votes
 * auto-approves, 3 NO votes auto-rejects (real logic already in the
 * service layer, this UI just surfaces it).
 */
import * as React from "react";
import { Landmark, Plus, Loader2, CheckCircle2, XCircle, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

interface DocRow {
  id: string;
  title: string;
  category: "FINANCIAL_REPORT" | "AUDIT" | "CAPEX_PROPOSAL" | "MINUTES";
  fileUrl: string;
  uploadedBy: string;
  requiresVote: boolean;
  votesYes: number;
  votesNo: number;
  status: "OPEN" | "APPROVED" | "REJECTED";
  createdAt: string;
}

const CATEGORY_LABEL: Record<string, string> = {
  FINANCIAL_REPORT: "Financial Report",
  AUDIT: "Audit",
  CAPEX_PROPOSAL: "Capex Proposal",
  MINUTES: "Minutes",
};
const STATUS_TONE: Record<string, "amber" | "green" | "red"> = { OPEN: "amber", APPROVED: "green", REJECTED: "red" };

export function BomVaultManager() {
  const { toast } = useToast();
  const [documents, setDocuments] = React.useState<DocRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [votingId, setVotingId] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<string>("ALL");

  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState<"FINANCIAL_REPORT" | "AUDIT" | "CAPEX_PROPOSAL" | "MINUTES">("FINANCIAL_REPORT");
  const [fileUrl, setFileUrl] = React.useState("");
  const [requiresVote, setRequiresVote] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/settings/bom-vault?category=${filter}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setDocuments(j.data.documents ?? []);
        else setError(j.error?.message || "Could not load the document room.");
      })
      .catch(() => setError("Network request failed"))
      .finally(() => setLoading(false));
  }, [filter]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleUpload() {
    if (!title.trim() || !fileUrl.trim()) {
      toast({ title: "Title and file URL are required", tone: "error" });
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/settings/bom-vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), category, fileUrl: fileUrl.trim(), requiresVote }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: "Document uploaded to the governance room", tone: "success" });
        setTitle("");
        setFileUrl("");
        setRequiresVote(false);
        load();
      } else {
        toast({ title: json.error?.message || "Could not upload document", tone: "error" });
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleVote(documentId: string, vote: "YES" | "NO") {
    setVotingId(documentId);
    try {
      const res = await fetch("/api/settings/bom-vault/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, vote }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: `Vote recorded (${vote})`, tone: "success" });
        load();
      } else {
        toast({ title: json.error?.message || "Could not cast vote", tone: "error" });
      }
    } finally {
      setVotingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4 text-navy-400" /> Upload a governance document
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="bom-title">Title</Label>
              <Input id="bom-title" placeholder="e.g. Term 2 2026 Financial Report" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="bom-url">Document URL</Label>
              <Input id="bom-url" placeholder="https://... (uploaded PDF link)" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Category</Label>
            <div className="mt-1 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {(["FINANCIAL_REPORT", "AUDIT", "CAPEX_PROPOSAL", "MINUTES"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`rounded-xl border px-2 py-1.5 text-xs font-semibold transition-colors ${category === c ? "border-navy-900 bg-navy-50 dark:border-white dark:bg-navy-800" : "border-navy-200 text-navy-500 dark:border-navy-700"}`}
                >
                  {CATEGORY_LABEL[c]}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-navy-700 dark:text-navy-300">
            <input type="checkbox" checked={requiresVote} onChange={(e) => setRequiresVote(e.target.checked)} className="rounded" />
            Requires board vote (needs 3 YES to approve or 3 NO to reject)
          </label>
          <Button onClick={handleUpload} disabled={creating} className="rounded-full">
            {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Upload document
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2"><Landmark className="h-4 w-4 text-navy-400" /> Document room ({documents.length})</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-full border border-navy-200 bg-white px-2 py-1 text-xs dark:border-navy-700 dark:bg-navy-900"
            >
              <option value="ALL">All categories</option>
              {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-24 rounded-2xl" />
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">{error}</div>
          ) : documents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-navy-200 p-8 text-center text-xs text-navy-500 dark:border-navy-800">No documents yet.</div>
          ) : (
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {documents.map((d) => (
                <div key={d.id} className="rounded-2xl border border-navy-100 dark:border-navy-800 p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-navy-900 dark:text-white text-sm flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-navy-400" /> {d.title}
                      </p>
                      <p className="text-xs text-navy-400">
                        {CATEGORY_LABEL[d.category]} · uploaded by {d.uploadedBy}
                      </p>
                      <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">
                        View document
                      </a>
                    </div>
                    <Badge tone={STATUS_TONE[d.status]}>{d.status}</Badge>
                  </div>
                  {d.requiresVote && (
                    <div className="flex items-center gap-2 pt-1">
                      <Badge tone="blue">{d.votesYes} YES</Badge>
                      <Badge tone="neutral">{d.votesNo} NO</Badge>
                      {d.status === "OPEN" && (
                        <div className="flex gap-1 ml-auto">
                          <Button size="sm" onClick={() => handleVote(d.id, "YES")} disabled={votingId === d.id}>
                            {votingId === d.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => handleVote(d.id, "NO")} disabled={votingId === d.id}>
                            {votingId === d.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
