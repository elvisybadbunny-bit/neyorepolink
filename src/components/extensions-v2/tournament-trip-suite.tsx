"use client";

/**
 * Idea 8 (kenyan-extensions.service.ts) — Co-Curricular Sports & Tournament
 * Trip Organizer. Real backend existed (SchoolTournamentTrip,
 * TournamentParticipant models; /api/finance/activities/tournaments[/participants])
 * with ZERO frontend UI until this fix — found during a full-stack audit of
 * a prior AI session's "12 operational suites" commit. Deliberately
 * separate from the pre-existing R.6 "Trips & Activities" fee-collection
 * flow: this is specifically for organizing a sports/tournament trip
 * roster with bus seating and real automatic fee-clearance checks + parent
 * consent tracking per participant.
 */
import * as React from "react";
import { Trophy, Plus, Loader2, Lock, Users, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { StudentSearchSelect, type StudentSearchOption } from "@/components/students/student-search-select";

const kes = (n: number) => `KES ${n.toLocaleString("en-KE")}`;

interface Participant {
  id: string;
  studentId: string;
  studentName: string;
  feeClearanceOk: boolean;
  busSeatNo: string | null;
  parentConsentStatus: "PENDING" | "CONSENTED" | "DENIED";
}
interface Trip {
  id: string;
  title: string;
  venue: string;
  eventDate: string;
  perDiemKes: number;
  status: string;
  participants: Participant[];
}

const CONSENT_TONE: Record<string, "green" | "red" | "amber"> = { CONSENTED: "green", DENIED: "red", PENDING: "amber" };

export function TournamentTripSuite({ students }: { students: StudentSearchOption[] }) {
  const { toast } = useToast();
  const [trips, setTrips] = React.useState<Trip[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const [title, setTitle] = React.useState("");
  const [venue, setVenue] = React.useState("");
  const [eventDate, setEventDate] = React.useState("");
  const [perDiemKes, setPerDiemKes] = React.useState("");

  const [addStudentId, setAddStudentId] = React.useState("");
  const [addBusSeat, setAddBusSeat] = React.useState("");
  const [adding, setAdding] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/finance/activities/tournaments")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setTrips(j.data.trips ?? []);
        else setError(j.error?.message || "Could not load tournament trips.");
      })
      .catch(() => setError("Network request failed"))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleCreate() {
    if (!title.trim() || !venue.trim() || !eventDate) {
      toast({ title: "Title, venue, and event date are required", tone: "error" });
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/finance/activities/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), venue: venue.trim(), eventDate, perDiemKes: Number(perDiemKes || 0) }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: "Tournament trip created", tone: "success" });
        setTitle("");
        setVenue("");
        setEventDate("");
        setPerDiemKes("");
        load();
      } else {
        toast({ title: json.error?.message || "Could not create trip", tone: "error" });
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleAddParticipant(tripId: string) {
    if (!addStudentId) {
      toast({ title: "Select a student to add to the roster", tone: "error" });
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/finance/activities/tournaments/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId, studentId: addStudentId, busSeatNo: addBusSeat.trim() || undefined }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: "Added to trip roster", tone: "success" });
        setAddStudentId("");
        setAddBusSeat("");
        load();
      } else {
        toast({ title: json.error?.message || "Could not add participant", tone: "error" });
      }
    } finally {
      setAdding(false);
    }
  }

  async function handleConsent(tripId: string, studentId: string, parentConsentStatus: "CONSENTED" | "DENIED") {
    const res = await fetch("/api/finance/activities/tournaments/participants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "consent", tripId, studentId, parentConsentStatus }),
    });
    const json = await res.json();
    if (json.ok) {
      toast({ title: `Consent marked ${parentConsentStatus.toLowerCase()}`, tone: "success" });
      load();
    } else {
      toast({ title: json.error?.message || "Could not update consent", tone: "error" });
    }
  }

  if (error && error.toLowerCase().includes("paused")) {
    return (
      <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-200 space-y-2">
        <h3 className="font-bold flex items-center gap-2 text-base text-amber-300">
          <Lock className="w-5 h-5 text-amber-400" /> Feature switched off in NEYO Ops (Tournament Trip Organizer)
        </h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-navy-950 dark:text-white flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          Co-Curricular Tournament Trip Organizer (`Idea 8`)
        </h2>
        <p className="text-sm text-navy-500 dark:text-navy-400">
          Organize a sports/tournament trip roster: bus seat assignment, automatic fee-clearance checks per student,
          and parent consent tracking — separate from ordinary fee-collection activities.
        </p>
      </div>

      <Card className="rounded-3xl border border-navy-100 dark:border-navy-800">
        <CardHeader>
          <CardTitle className="text-base">New tournament trip</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <Label htmlFor="tt-title">Title</Label>
              <Input id="tt-title" placeholder="e.g. County Athletics Championship" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="tt-venue">Venue</Label>
              <Input id="tt-venue" placeholder="e.g. Nyayo Stadium" value={venue} onChange={(e) => setVenue(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="tt-date">Event date</Label>
              <Input id="tt-date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="tt-perdiem">Per diem (KES)</Label>
              <Input id="tt-perdiem" type="number" min={0} placeholder="e.g. 500" value={perDiemKes} onChange={(e) => setPerDiemKes(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleCreate} disabled={creating} className="mt-3 rounded-full bg-amber-600 hover:bg-amber-700 text-white">
            {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Create trip
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <Skeleton className="h-32 rounded-2xl" />
      ) : trips.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-navy-200 p-8 text-center text-xs text-navy-500 dark:border-navy-800">
          No tournament trips yet. Create one above.
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map((trip) => (
            <Card key={trip.id} className="rounded-3xl border border-navy-100 dark:border-navy-800">
              <CardHeader className="cursor-pointer" onClick={() => setExpanded(expanded === trip.id ? null : trip.id)}>
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-500" /> {trip.title}
                  </span>
                  <Badge tone="blue">
                    <Users className="w-3 h-3 mr-1 inline" /> {trip.participants.length} on roster
                  </Badge>
                </CardTitle>
                <p className="text-xs text-navy-400">
                  {trip.venue} · {new Date(trip.eventDate).toLocaleDateString("en-KE")} · Per diem {kes(trip.perDiemKes)}
                </p>
              </CardHeader>
              {expanded === trip.id && (
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-end gap-2">
                    <div className="flex-1 min-w-[220px]">
                      <StudentSearchSelect students={students} value={addStudentId} onChange={setAddStudentId} label="Add student to roster" required={false} />
                    </div>
                    <div>
                      <Label htmlFor={`seat-${trip.id}`}>Bus seat (optional)</Label>
                      <Input id={`seat-${trip.id}`} placeholder="e.g. 14A" value={addBusSeat} onChange={(e) => setAddBusSeat(e.target.value)} className="w-28" />
                    </div>
                    <Button size="sm" onClick={() => handleAddParticipant(trip.id)} disabled={adding}>
                      {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Add
                    </Button>
                  </div>

                  {trip.participants.length === 0 ? (
                    <p className="text-xs text-navy-400">No participants yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {trip.participants.map((p) => (
                        <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-navy-100 dark:border-navy-800 px-3 py-2 text-sm">
                          <div>
                            <p className="font-medium text-navy-900 dark:text-white">{p.studentName}</p>
                            <p className="text-xs text-navy-400">
                              {p.busSeatNo ? `Seat ${p.busSeatNo}` : "No seat assigned"}
                              {" · "}
                              {p.feeClearanceOk ? "Fee cleared" : "Fee balance outstanding"}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Badge tone={p.feeClearanceOk ? "green" : "red"}>{p.feeClearanceOk ? "Cleared" : "Owes fees"}</Badge>
                            <Badge tone={CONSENT_TONE[p.parentConsentStatus]}>{p.parentConsentStatus}</Badge>
                            {p.parentConsentStatus === "PENDING" && (
                              <div className="flex gap-1">
                                <Button size="sm" variant="secondary" onClick={() => handleConsent(trip.id, p.studentId, "CONSENTED")}>
                                  <CheckCircle2 className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="secondary" onClick={() => handleConsent(trip.id, p.studentId, "DENIED")}>
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
