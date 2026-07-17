"use client";

import * as React from "react";
import { ShieldAlert, Key, Play, StopCircle, UserCheck, Clock, CheckCircle2, Loader2, AlertTriangle, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export function SupportImpersonationOpsTab() {
  const { toast } = useToast();
  const [targetTenantId, setTargetTenantId] = React.useState("");
  const [targetUserId, setTargetUserId] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [activeSession, setActiveSession] = React.useState<{ token: string; expiresAt: string } | null>(null);

  async function startImpersonate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!targetTenantId.trim() || !targetUserId.trim() || reason.trim().length < 10) {
      toast({ title: "Please enter Tenant ID, User ID, and a diagnostic reason (min 10 chars)", tone: "error" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/founder-ops/impersonation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", targetTenantId: targetTenantId.trim(), targetUserId: targetUserId.trim(), reason: reason.trim() }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast({ title: json.error?.message || "Could not initiate diagnostic view-as session.", tone: "error" });
        return;
      }
      setActiveSession({ token: json.data.token, expiresAt: json.data.expiresAt });
      toast({ title: "Diagnostic Session Active!", description: "15-minute read-only View-As session minted.", tone: "success" });
    } finally {
      setLoading(false);
    }
  }

  async function stopImpersonate() {
    setLoading(true);
    try {
      await fetch("/api/founder-ops/impersonation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stop", token: activeSession?.token }),
      });
      setActiveSession(null);
      toast({ title: "Diagnostic session terminated and revoked.", tone: "info" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-navy-950 dark:text-white flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            Audit-Safe Diagnostic Impersonation (`View-As Session Replay`)
          </h2>
          <p className="text-xs text-navy-500 dark:text-navy-400">
            Generate time-limited (`15-minute`) read-only diagnostic sessions to inspect exactly what a Principal or Bursar sees when troubleshooting bugs (`A.2 statutory compliance`).
          </p>
        </div>
        {activeSession ? (
          <Badge tone="amber" className="animate-pulse px-3 py-1 text-xs">
            DIAGNOSTIC VIEW-AS ACTIVE
          </Badge>
        ) : (
          <Badge tone="neutral">No Active Diagnostic Session</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-3xl border border-navy-100 dark:border-navy-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Key className="h-4 w-4 text-blue-600" />
              Mint 15-Minute Diagnostic Token
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={startImpersonate} className="space-y-4">
              <div>
                <Label htmlFor="targetTenantId">Target School Tenant ID *</Label>
                <Input
                  id="targetTenantId"
                  placeholder="e.g. cmr..."
                  value={targetTenantId}
                  onChange={(e) => setTargetTenantId(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="targetUserId">Target Staff User ID *</Label>
                <Input
                  id="targetUserId"
                  placeholder="e.g. cmr..."
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="reason">Statutory Diagnostic Reason (`min 10 characters`) *</Label>
                <Input
                  id="reason"
                  placeholder="e.g. Investigating Form 3 East timetable double-booking clash reported on ticket #412"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full rounded-full bg-amber-600 hover:bg-amber-700 text-white font-semibold">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                Mint Read-Only View-As Session
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-navy-100 dark:border-navy-800 bg-navy-50/40 dark:bg-navy-900/40">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              Active Diagnostic Replay Capsule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeSession ? (
              <div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 dark:text-amber-200">Token Active</span>
                  <Badge tone="amber">Read-Only Safety Lock ON</Badge>
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  Cookie <code className="font-mono bg-white/60 dark:bg-navy-900/60 px-1.5 py-0.5 rounded">NEYO_DIAGNOSTIC_TOKEN</code> is set. Every click and view query across the School OS is being logged to <code className="font-mono">SupportImpersonationLog</code>.
                </p>
                <div className="flex items-center gap-2">
                  <a
                    href="/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-green-700 px-4 py-2 text-xs font-bold text-white hover:bg-green-800"
                  >
                    Open Diagnosed School OS <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={stopImpersonate}
                    disabled={loading}
                    className="rounded-full text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <StopCircle className="mr-1.5 h-4 w-4" /> Revoke Now
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-navy-200 p-8 text-center text-xs text-navy-500 dark:border-navy-800 dark:text-navy-400">
                <UserCheck className="mx-auto mb-2 h-8 w-8 text-navy-300" />
                No active view-as session right now. Fill out the target IDs on the left to safely troubleshoot a school's portal in read-only diagnostic mode.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
