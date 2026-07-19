"use client";

/**
 * Idea 10 (kenyan-extensions.service.ts) — Academic Consultation / PTA Day
 * Slot Booking Portal. Real backend existed (PtaConsultationSlot model,
 * /api/portal/pta-booking[/book]) with ZERO frontend UI until this fix —
 * found during a full-stack audit of a prior AI session's "12 operational
 * suites" commit. Also found and fixed a real authorization gap in the
 * book route itself while wiring this up (see that route's own comment).
 *
 * Two views in one component:
 *  - Teacher view (`forTeacher`): create a batch of consultation slots for
 *    a given date, see which are booked and by whom.
 *  - Parent view (default): browse open slots across all teachers and book
 *    one for a specific child.
 */
import * as React from "react";
import { CalendarClock, Plus, Loader2, CheckCircle2, Lock, User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

interface Slot {
  id: string;
  teacherId: string;
  teacherName: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  bookedTopic: string | null;
}

export function PtaBookingSuite({
  forTeacher,
  teacherId,
  teacherName,
  studentId,
  studentName,
}: {
  forTeacher: boolean;
  teacherId?: string;
  teacherName?: string;
  studentId?: string;
  studentName?: string;
}) {
  const { toast } = useToast();
  const [slots, setSlots] = React.useState<Slot[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [booking, setBooking] = React.useState<string | null>(null);

  const [slotDate, setSlotDate] = React.useState("");
  const [startTime, setStartTime] = React.useState("09:00 AM");
  const [count, setCount] = React.useState("8");
  const [durationMins, setDurationMins] = React.useState("15");
  const [creating, setCreating] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    const qs = forTeacher && teacherId ? `?teacherId=${teacherId}` : "";
    fetch(`/api/portal/pta-booking${qs}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setSlots(j.data.slots ?? []);
        else setError(j.error?.message || "Could not load consultation slots.");
      })
      .catch(() => setError("Network request failed"))
      .finally(() => setLoading(false));
  }, [forTeacher, teacherId]);

  React.useEffect(() => {
    load();
  }, [load]);

  function generateStartTimes(): string[] {
    const [time, meridian] = startTime.split(" ");
    const [hStr, mStr] = time.split(":");
    let h = parseInt(hStr, 10);
    let m = parseInt(mStr, 10);
    if (meridian === "PM" && h !== 12) h += 12;
    if (meridian === "AM" && h === 12) h = 0;
    const times: string[] = [];
    const dur = Number(durationMins) || 15;
    for (let i = 0; i < Number(count || 1); i++) {
      const totalMins = h * 60 + m + i * dur;
      const hh = Math.floor(totalMins / 60) % 24;
      const mm = totalMins % 60;
      const displayH = hh % 12 === 0 ? 12 : hh % 12;
      const displayMeridian = hh < 12 ? "AM" : "PM";
      times.push(`${String(displayH).padStart(2, "0")}:${String(mm).padStart(2, "0")} ${displayMeridian}`);
    }
    return times;
  }

  async function handleCreateSlots() {
    if (!slotDate || !teacherId) {
      toast({ title: "Pick a date first", tone: "error" });
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/portal/pta-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId,
          teacherName,
          slotDate,
          startTimes: generateStartTimes(),
          durationMins: Number(durationMins) || 15,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: `${json.data.count} consultation slots created`, tone: "success" });
        load();
      } else {
        toast({ title: json.error?.message || "Could not create slots", tone: "error" });
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleBook(slotId: string) {
    if (!studentId) {
      toast({ title: "Select a child first", tone: "error" });
      return;
    }
    setBooking(slotId);
    try {
      const res = await fetch("/api/portal/pta-booking/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId, studentId, bookedTopic: `Progress review for ${studentName ?? "my child"}` }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: "Consultation slot booked", tone: "success" });
        load();
      } else {
        toast({ title: json.error?.message || "Could not book slot", tone: "error" });
      }
    } finally {
      setBooking(null);
    }
  }

  if (error && error.toLowerCase().includes("paused")) {
    return (
      <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-200 space-y-2">
        <h3 className="font-bold flex items-center gap-2 text-base text-amber-300">
          <Lock className="w-5 h-5 text-amber-400" /> This service is currently unavailable (PTA Consultation Booking)
        </h3>
      </div>
    );
  }

  const openSlots = slots.filter((s) => !s.isBooked);
  const bookedSlots = slots.filter((s) => s.isBooked);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-navy-950 dark:text-white flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-blue-600" />
          {forTeacher ? "PTA Consultation Slots" : "Book an academic consultation"}
        </h2>
        <p className="text-sm text-navy-500 dark:text-navy-400">
          {forTeacher
            ? "Open a batch of consultation slots for a PTA day — parents book directly, no double-booking possible."
            : "Pick an open slot with your child's teacher for a short academic progress conversation."}
        </p>
      </div>

      {forTeacher && (
        <Card className="rounded-3xl border border-navy-100 dark:border-navy-800">
          <CardHeader>
            <CardTitle className="text-base">Open new slots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <Label htmlFor="pta-date">Date</Label>
                <Input id="pta-date" type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="pta-start">First slot start</Label>
                <Input id="pta-start" placeholder="09:00 AM" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="pta-count">How many slots</Label>
                <Input id="pta-count" type="number" min={1} value={count} onChange={(e) => setCount(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="pta-dur">Minutes each</Label>
                <Input id="pta-dur" type="number" min={5} value={durationMins} onChange={(e) => setDurationMins(e.target.value)} />
              </div>
            </div>
            <Button onClick={handleCreateSlots} disabled={creating} className="mt-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white">
              {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Create slots
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-3xl border border-navy-100 dark:border-navy-800">
        <CardHeader>
          <CardTitle className="text-base">{forTeacher ? "My slots" : "Open slots"} ({forTeacher ? slots.length : openSlots.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-24 rounded-2xl" />
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">{error}</div>
          ) : (forTeacher ? slots : openSlots).length === 0 ? (
            <div className="rounded-2xl border border-dashed border-navy-200 p-8 text-center text-xs text-navy-500 dark:border-navy-800">
              {forTeacher ? "No slots created yet." : "No open consultation slots right now — check back closer to PTA day."}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(forTeacher ? slots : openSlots).map((s) => (
                <div
                  key={s.id}
                  className={`rounded-xl border p-3 text-xs ${s.isBooked ? "border-green-300 bg-green-50 dark:bg-green-950/30" : "border-navy-200 dark:border-navy-800"}`}
                >
                  <p className="font-semibold text-navy-900 dark:text-white">{s.startTime}</p>
                  {!forTeacher && <p className="text-navy-400 flex items-center gap-1"><User className="w-3 h-3" /> {s.teacherName}</p>}
                  <p className="text-navy-400">{new Date(s.slotDate).toLocaleDateString("en-KE")}</p>
                  {s.isBooked ? (
                    <Badge tone="green" className="mt-1">
                      <CheckCircle2 className="w-3 h-3 mr-1 inline" /> Booked
                    </Badge>
                  ) : !forTeacher ? (
                    <Button size="sm" className="mt-1 w-full" onClick={() => handleBook(s.id)} disabled={booking === s.id}>
                      {booking === s.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Book"}
                    </Button>
                  ) : (
                    <Badge tone="amber" className="mt-1">Open</Badge>
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
