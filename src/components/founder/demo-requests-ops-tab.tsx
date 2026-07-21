"use client";

import * as React from "react";
import { CheckCircle2, XCircle, Loader2, Phone, Mail, User, Clock, ShieldCheck, Sparkles, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

interface DemoRequestItem {
  id: string;
  phone: string;
  email: string;
  fullName: string | null;
  schoolName: string | null;
  status: string; // PENDING | APPROVED | REJECTED
  requestedAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
  spawnedTenantSlug: string | null;
  notes: string | null;
}

export function DemoRequestsOpsTab() {
  const { toast } = useToast();
  const [requests, setRequests] = React.useState<DemoRequestItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [processingId, setProcessingId] = React.useState<string | null>(null);
  const [accessDetails, setAccessDetails] = React.useState<{ url: string; ownerEmail: string; temporaryPassword: string; smsDelivered: boolean } | null>(null);

  const fetchRequests = React.useCallback(async () => {
    try {
      const res = await fetch("/api/founder-ops/demo-requests");
      const json = await res.json();
      if (json.ok && json.data?.requests) {
        setRequests(json.data.requests);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  async function handleAction(id: string, action: "approve" | "reject") {
    setProcessingId(id);
    try {
      const res = await fetch("/api/founder-ops/demo-requests/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast({ title: json.error?.message || `Could not ${action} request.`, tone: "error" });
        return;
      }
      if (action === "approve" && json.data.demoRes) setAccessDetails(json.data.demoRes);
      toast({
        title: action === "approve" ? "Demo sandbox approved" : "Demo Request Rejected",
        description: action === "approve" ? `Sandbox slug: ${json.data.demoRes?.tenantSlug || "ready"}` : "Visitor notified.",
        tone: action === "approve" ? "success" : "info",
      });
      await fetchRequests();
    } catch {
      toast({ title: "Network error processing request.", tone: "error" });
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-navy-950 dark:text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-green-600" />
            New Users Demo Requests (`Approval Verification`)
          </h2>
          <p className="text-xs text-navy-500 dark:text-navy-400">
            Review and approve prospective school visitors who requested an interactive Day-One demo from `/login`. When approved, a sandboxed School OS (`Demo2026!`) is spawned right away and NEYO attempts SMS delivery and shows one-time access to authorised Ops if delivery needs manual follow-up.
          </p>
        </div>
        <Badge tone={pendingCount > 0 ? "amber" : "green"}>
          {pendingCount} Pending Review
        </Badge>
      </div>

      {requests.length === 0 ? (
        <Card className="rounded-3xl border border-dashed border-navy-200 p-8 text-center dark:border-navy-800">
          <CardContent className="space-y-2">
            <ShieldCheck className="mx-auto h-10 w-10 text-navy-300" />
            <p className="text-sm font-semibold text-navy-700 dark:text-navy-300">No demo requests yet</p>
            <p className="text-xs text-navy-400">When visitors enter their phone number and email on `/login`, their pending verification requests will appear right here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {requests.map((r) => (
            <Card key={r.id} className={`rounded-3xl transition-all ${r.status === "PENDING" ? "border-amber-200 bg-amber-50/20 dark:border-amber-900/40 dark:bg-amber-950/10" : "border-navy-100 dark:border-navy-800"}`}>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-navy-950 dark:text-white text-base">
                        {r.fullName || r.email.split("@")[0]}
                      </span>
                      <Badge tone={r.status === "APPROVED" ? "green" : r.status === "REJECTED" ? "red" : "amber"}>
                        {r.status}
                      </Badge>
                    </div>
                    {r.schoolName && (
                      <p className="text-xs font-semibold text-green-700 dark:text-green-400">{r.schoolName}</p>
                    )}
                  </div>
                  <span className="text-[11px] text-navy-400 font-mono">
                    {new Date(r.requestedAt).toLocaleString("en-KE", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs rounded-2xl bg-navy-50/70 p-3 dark:bg-navy-900/70 text-navy-700 dark:text-navy-300 font-mono">
                  <div className="flex items-center gap-1.5 truncate">
                    <Phone className="h-3.5 w-3.5 text-navy-400 shrink-0" />
                    <span>{r.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="h-3.5 w-3.5 text-navy-400 shrink-0" />
                    <span>{r.email}</span>
                  </div>
                </div>

                {r.status === "APPROVED" && r.spawnedTenantSlug && (
                  <div className="rounded-2xl bg-green-50/60 p-3 text-xs text-green-800 dark:bg-green-950/30 dark:text-green-300 flex items-center justify-between">
                    <div>
                      <strong>Sandbox Slug:</strong> <span className="font-mono font-bold">{r.spawnedTenantSlug}</span>
                      <p className="text-[11px] text-green-600 dark:text-green-400">Approved by {r.approvedBy || "Platform Operations"}</p>
                    </div>
                    <a
                      href={`https://${r.spawnedTenantSlug}.neyo.co.ke`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold underline hover:text-green-900"
                    >
                      Open <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                {r.notes && (
                  <p className="text-[11px] italic text-navy-500 bg-white/60 p-2 rounded-xl border border-navy-100 dark:bg-navy-950/40 dark:border-navy-800">
                    "{r.notes}"
                  </p>
                )}

                {r.status === "PENDING" && (
                  <div className="flex items-center gap-2 pt-1 border-t border-navy-100 dark:border-navy-800">
                    <Button
                      size="sm"
                      onClick={() => handleAction(r.id, "approve")}
                      disabled={processingId === r.id}
                      className="flex-1 rounded-full bg-green-700 hover:bg-green-800 text-white font-semibold"
                    >
                      {processingId === r.id ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1.5 h-4 w-4" />}
                      Approve & Spawn Sandbox
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleAction(r.id, "reject")}
                      disabled={processingId === r.id}
                      className="rounded-full text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-950/30"
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {accessDetails && <div className="fixed inset-0 z-[220] flex items-end justify-center bg-navy-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setAccessDetails(null)}><div className="w-full max-w-lg rounded-t-3xl bg-white p-5 shadow-pop dark:bg-navy-900 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}><h3 className="text-lg font-black text-navy-950 dark:text-white">One-time demo access</h3><p className="mt-1 text-xs text-navy-500">{accessDetails.smsDelivered ? "SMS delivery was requested. Copy these details only if the lead needs assistance." : "SMS was not delivered. Contact the lead securely and share these one-time details."}</p><div className="mt-4 space-y-2 rounded-2xl border border-navy-200 p-4 font-mono text-sm dark:border-navy-700"><p>URL: {accessDetails.url}</p><p>Email: {accessDetails.ownerEmail}</p><p>Temporary password: {accessDetails.temporaryPassword}</p></div><p className="mt-3 text-xs text-amber-700 dark:text-amber-300">This password is not stored in DemoRequest notes or audit metadata. The lead must replace it on first login.</p><div className="mt-4 flex justify-end"><Button onClick={() => setAccessDetails(null)}>I have stored/shared it safely</Button></div></div></div>}
    </div>
  );
}
