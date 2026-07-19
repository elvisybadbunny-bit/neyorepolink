"use client";

/**
 * U.3 — a real, explicit "request account/data deletion" ask. Deliberately
 * NEVER a silent self-service delete — the request goes to NEYO's real
 * Compliance queue for a real human (Founder/Platform Operations) decision, matching
 * the same accountability the Kenya Data Protection Act expects.
 */
import * as React from "react";
import { Trash2, Loader2, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function DataDeletionRequestCard({ canRequest }: { canRequest: boolean }) {
  const { toast } = useToast();
  const [note, setNote] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch("/api/tenant/request-deletion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      const json = await res.json();
      if (json.ok) {
        setSent(true);
        toast({ title: "Request sent to NEYO", tone: "success" });
      } else {
        toast({ title: json.error?.message || "Could not send the request.", tone: "error" });
      }
    } catch {
      toast({ title: "Network problem. Try again.", tone: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request account deletion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 rounded-2xl border border-navy-100 bg-warm-50 p-4 dark:border-navy-800 dark:bg-navy-950">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-300">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <p className="text-sm text-navy-600 dark:text-navy-300">
            This is a real, one-way request — a real NEYO team member will
            personally review it before anything is deleted (never automatic).
            We&apos;ll reach out on your registered phone/email first.
          </p>
        </div>

        {!canRequest ? (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Only the school owner or principal can request account deletion.
          </p>
        ) : sent ? (
          <p className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
            <CheckCircle2 className="h-4 w-4" />Request sent — NEYO will contact you.
          </p>
        ) : (
          <>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional: tell us why (helps us make it right, or improve NEYO)"
              rows={3}
              className="w-full rounded-2xl border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-300 focus:border-navy-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
            />
            <Button variant="danger" onClick={submit} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Request deletion
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
