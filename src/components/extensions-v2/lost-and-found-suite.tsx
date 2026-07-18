"use client";

/**
 * Idea 12 (kenyan-extensions.service.ts) — Campus Lost & Found Photo
 * Register. Real backend existed (LostAndFoundItem model,
 * /api/reception/lost-and-found[/claim]) with ZERO frontend UI until this
 * fix — found during a full-stack audit of a prior AI session's "12
 * operational suites" commit. Reception logs a found item (with an
 * optional photo), then marks it claimed once the real owner shows up.
 */
import * as React from "react";
import { PackageSearch, Plus, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { StudentSearchSelect, type StudentSearchOption } from "@/components/students/student-search-select";

interface ItemRow {
  id: string;
  title: string;
  description: string;
  category: "UNIFORM" | "BOOK" | "ELECTRONIC" | "OTHER";
  locationFound: string;
  photoUrl: string | null;
  status: "UNCLAIMED" | "CLAIMED";
  foundBy: string;
  claimedByStudentId: string | null;
  createdAt: string;
}

const CATEGORY_LABEL: Record<string, string> = { UNIFORM: "Uniform", BOOK: "Book", ELECTRONIC: "Electronic", OTHER: "Other" };

export function LostAndFoundSuite({ students }: { students: StudentSearchOption[] }) {
  const { toast } = useToast();
  const [items, setItems] = React.useState<ItemRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [claimingId, setClaimingId] = React.useState<string | null>(null);
  const [claimStudentId, setClaimStudentId] = React.useState<Record<string, string>>({});
  const [filter, setFilter] = React.useState<"ALL" | "UNCLAIMED" | "CLAIMED">("UNCLAIMED");

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState<"UNIFORM" | "BOOK" | "ELECTRONIC" | "OTHER">("OTHER");
  const [locationFound, setLocationFound] = React.useState("");

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/reception/lost-and-found?status=${filter}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setItems(j.data.items ?? []);
        else setError(j.error?.message || "Could not load lost & found register.");
      })
      .catch(() => setError("Network request failed"))
      .finally(() => setLoading(false));
  }, [filter]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleCreate() {
    if (!title.trim() || !description.trim() || !locationFound.trim()) {
      toast({ title: "Title, description, and location found are required", tone: "error" });
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/reception/lost-and-found", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim(), category, locationFound: locationFound.trim() }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: "Item logged in register", tone: "success" });
        setTitle("");
        setDescription("");
        setLocationFound("");
        load();
      } else {
        toast({ title: json.error?.message || "Could not log item", tone: "error" });
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleClaim(id: string) {
    const studentId = claimStudentId[id];
    if (!studentId) {
      toast({ title: "Select which student is claiming this item", tone: "error" });
      return;
    }
    setClaimingId(id);
    try {
      const res = await fetch("/api/reception/lost-and-found/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, studentId }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: "Item marked claimed", tone: "success" });
        load();
      } else {
        toast({ title: json.error?.message || "Could not claim item", tone: "error" });
      }
    } finally {
      setClaimingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <PackageSearch className="h-5 w-5 text-amber-400" />
          Campus Lost &amp; Found Register (`Idea 12`)
        </h2>
        <p className="text-sm text-slate-400">
          Log an item found on campus, then mark it claimed once the real owner comes to collect it.
        </p>
      </div>

      <Card className="rounded-3xl border border-white/10">
        <CardHeader>
          <CardTitle className="text-base text-white">Log a found item</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="lf-title">Item title</Label>
              <Input id="lf-title" placeholder="e.g. Blue school sweater" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="lf-loc">Location found</Label>
              <Input id="lf-loc" placeholder="e.g. Dining hall" value={locationFound} onChange={(e) => setLocationFound(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="lf-desc">Description</Label>
            <Input id="lf-desc" placeholder="e.g. Size 14, name tag 'Kamau'" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label>Category</Label>
            <div className="mt-1 grid grid-cols-4 gap-1.5">
              {(["UNIFORM", "BOOK", "ELECTRONIC", "OTHER"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`rounded-xl border px-2 py-1.5 text-xs font-semibold transition-colors ${category === c ? "border-amber-500 bg-amber-500/10 text-amber-300" : "border-white/10 text-slate-400"}`}
                >
                  {CATEGORY_LABEL[c]}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={handleCreate} disabled={creating} className="w-full rounded-full bg-amber-600 hover:bg-amber-700 text-white">
            {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Log item
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border border-white/10">
        <CardHeader>
          <CardTitle className="text-base text-white flex items-center justify-between">
            <span>Register ({items.length})</span>
            <div className="flex gap-1">
              {(["UNCLAIMED", "CLAIMED", "ALL"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${filter === f ? "bg-white text-navy-900" : "bg-white/10 text-slate-300"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-24 rounded-2xl" />
          ) : error ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-xs text-slate-500">No items match this filter.</div>
          ) : (
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {items.map((it) => (
                <div key={it.id} className="rounded-2xl border border-white/10 p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-white text-sm">{it.title}</p>
                      <p className="text-xs text-slate-400">
                        {CATEGORY_LABEL[it.category]} · found at {it.locationFound} · by {it.foundBy}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{it.description}</p>
                    </div>
                    <Badge tone={it.status === "CLAIMED" ? "green" : "amber"}>{it.status}</Badge>
                  </div>
                  {it.status === "UNCLAIMED" && (
                    <div className="flex items-end gap-2 pt-1">
                      <div className="flex-1">
                        <StudentSearchSelect
                          students={students}
                          value={claimStudentId[it.id] ?? ""}
                          onChange={(v) => setClaimStudentId((prev) => ({ ...prev, [it.id]: v }))}
                          label="Claimed by"
                          required={false}
                        />
                      </div>
                      <Button size="sm" onClick={() => handleClaim(it.id)} disabled={claimingId === it.id}>
                        {claimingId === it.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        Mark claimed
                      </Button>
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
