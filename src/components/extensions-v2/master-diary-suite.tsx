"use client";

import React from "react";
import { Calendar, Send, Users, Bell, Lock } from "lucide-react";

export function MasterDiarySuite() {
  const [events, setEvents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [eventTitle, setEventTitle] = React.useState("Form 3 Academic Clinic & Visiting Day");
  const [category, setCategory] = React.useState("VISITING");
  const [eventDate, setEventDate] = React.useState("2026-08-01");
  const [expectedGuestHeadcount, setExpectedGuestHeadcount] = React.useState(600);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/extensions-v2/diary")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setEvents(j.data ?? []);
        } else {
          setError(j.error || "Feature paused");
        }
      })
      .catch(() => setError("Network request failed"))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleCreateEvent() {
    const res = await fetch("/api/extensions-v2/diary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventTitle,
        category,
        eventDate,
        targetAudience: "PARENTS",
        expectedGuestHeadcount,
      }),
    });
    const j = await res.json();
    if (j.ok) {
      load();
    } else {
      setError(j.error || "Failed to create diary event");
    }
  }

  if (error && error.toLowerCase().includes("not been released")) {
    return (
      <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-200 space-y-2">
        <h3 className="font-bold flex items-center gap-2 text-base text-amber-300">
          <Lock className="w-5 h-5 text-amber-400" /> Feature Switched OFF in NEYO Ops (EE.27: Master School Diary)
        </h3>
        <p className="text-xs text-slate-300">
          This feature can be individually enabled or paused platform-wide in NEYO Ops (/founder).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Termly Master School Diary & Event Scheduler
          </h2>
          <p className="text-sm text-slate-400">
            Multi-category Odoo event calendar, 72-hour automated parent SMS reminders, and interactive parent guest RSVP kitchen forecasting.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-400" /> Schedule Academic Event
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Event Title</label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Event Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
              >
                <option value="VISITING">Visiting / PTA Day</option>
                <option value="EXAM">Termly Academic Exams</option>
                <option value="BREAK">Mid-Term / Closing Break</option>
                <option value="SPORTS">Sports Derby / Tournament</option>
                <option value="BOM">BOM Governance Meeting</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Event Date</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Expected Guests (Kitchen Forecast)</label>
              <input
                type="number"
                value={expectedGuestHeadcount}
                onChange={(e) => setExpectedGuestHeadcount(Number(e.target.value))}
                className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
              />
            </div>
            <button
              onClick={handleCreateEvent}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-xl text-sm transition-colors flex items-center justify-center gap-1"
            >
              <Send className="w-4 h-4" /> Save Event & Queue 72-Hr Parent SMS Broadcast
            </button>
          </div>
        </div>

        <div className="md:col-span-2 glass p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" /> Published Master Diary Events & RSVP Forecasts
          </h3>

          {loading ? (
            <div className="h-32 flex items-center justify-center text-slate-500 text-sm">Loading diary events...</div>
          ) : events.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-slate-500 text-sm">No events scheduled.</div>
          ) : (
            <div className="space-y-3">
              {events.map((ev) => (
                <div key={ev.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{ev.eventTitle}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium">
                        {ev.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Date: {new Date(ev.eventDate).toLocaleDateString()} • Target: {ev.targetAudience}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-blue-400 font-bold block">{ev.parentRsvpCount} Confirmed Parent RSVPs</span>
                    <span className="text-xs text-slate-400">Kitchen Ration Synced</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
