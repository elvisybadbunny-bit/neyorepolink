"use client";

import * as React from "react";
import { Wrench, Calendar, Clock, AlertCircle, CheckCircle2, Loader2, Play, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

interface MaintenanceWindowItem {
  id: string;
  title: string;
  description: string;
  scheduledStartAt: string;
  scheduledEndAt: string;
  status: string; // SCHEDULED | ACTIVE | COMPLETED | CANCELLED
  isReadOnlyLock: boolean;
  createdBy: string;
}

export function PlatformMaintenanceOpsTab() {
  const { toast } = useToast();
  const [windows, setWindows] = React.useState<MaintenanceWindowItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [startAt, setStartAt] = React.useState("");
  const [endAt, setEndAt] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const fetchWindows = React.useCallback(async () => {
    try {
      const res = await fetch("/api/founder-ops/maintenance");
      const json = await res.json();
      if (json.ok && json.data?.windows) {
        setWindows(json.data.windows);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchWindows();
  }, [fetchWindows]);

  async function handleSchedule(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!title || !description || !startAt || !endAt) {
      toast({ title: "Please fill in all scheduled window details.", tone: "error" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/founder-ops/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          scheduledStartAt: startAt,
          scheduledEndAt: endAt,
          isReadOnlyLock: true,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast({ title: json.error?.message || "Could not schedule window.", tone: "error" });
        return;
      }
      toast({ title: "Maintenance Window Scheduled!", description: "All school portals and parent portals will display an automated countdown banner 24 hours prior.", tone: "success" });
      setTitle("");
      setDescription("");
      setStartAt("");
      setEndAt("");
      await fetchWindows();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusUpdate(id: string, status: "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED") {
    try {
      const res = await fetch("/api/founder-ops/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_status", id, status }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: `Window status updated to ${status}`, tone: "info" });
        await fetchWindows();
      }
    } catch {
      toast({ title: "Network error updating window status.", tone: "error" });
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-navy-950 dark:text-white flex items-center gap-2">
            <Wrench className="h-5 w-5 text-blue-600" />
            Scheduled Maintenance & Upgrade Command Center (`Incident Controller`)
          </h2>
          <p className="text-xs text-navy-500 dark:text-navy-400">
            Schedule upcoming database pool & storage vault upgrade windows. Schools automatically see a countdown 24 hours prior and transition into a clean read-only lock screen during the window.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="rounded-3xl border border-navy-100 dark:border-navy-800 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-600" />
              Schedule New Maintenance Window
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSchedule} className="space-y-4">
              <div>
                <Label htmlFor="title">Upgrade Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. Database Pool & Storage Vault Upgrade"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="desc">Public Description (Shown on Lock Screen) *</Label>
                <Input
                  id="desc"
                  placeholder="e.g. NEYO is applying core infrastructure updates. Read-only mode active."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="startAt">Scheduled Start (EAT / UTC) *</Label>
                <Input
                  id="startAt"
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endAt">Scheduled End (EAT / UTC) *</Label>
                <Input
                  id="endAt"
                  type="datetime-local"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Clock className="mr-2 h-4 w-4" />}
                Schedule Maintenance Window
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-navy-100 dark:border-navy-800 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Scheduled & Historical Maintenance Ledger</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
            ) : windows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-navy-200 p-8 text-center text-xs text-navy-500 dark:border-navy-800">
                No maintenance windows scheduled right now.
              </div>
            ) : (
              <div className="space-y-3">
                {windows.map((w) => (
                  <div key={w.id} className="rounded-2xl border border-navy-100 bg-navy-50/40 p-4 dark:border-navy-800 dark:bg-navy-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-navy-950 dark:text-white text-sm">{w.title}</span>
                        <Badge tone={w.status === "ACTIVE" ? "green" : w.status === "SCHEDULED" ? "amber" : "neutral"}>
                          {w.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-navy-600 dark:text-navy-300">{w.description}</p>
                      <p className="text-[11px] text-navy-400 font-mono">
                        {new Date(w.scheduledStartAt).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" })} → {new Date(w.scheduledEndAt).toLocaleTimeString("en-KE", { timeStyle: "short" })}
                      </p>
                    </div>
                    {w.status === "SCHEDULED" && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleStatusUpdate(w.id, "ACTIVE")} className="rounded-full bg-green-700 text-white hover:bg-green-800">
                          Activate Now
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => handleStatusUpdate(w.id, "CANCELLED")} className="rounded-full text-red-600">
                          Cancel
                        </Button>
                      </div>
                    )}
                    {w.status === "ACTIVE" && (
                      <Button size="sm" onClick={() => handleStatusUpdate(w.id, "COMPLETED")} className="rounded-full bg-blue-600 text-white hover:bg-blue-700">
                        Complete & Unlock
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
