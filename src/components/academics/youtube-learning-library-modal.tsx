"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  Video,
  Play,
  Plus,
  Search,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Building2,
  Share2,
  ExternalLink,
  Info,
} from "lucide-react";
import type { LearningVideoItem } from "@/lib/validations/youtube-learning";

interface YouTubeLearningLibraryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: { id: string; name: string; code: string }[];
  strands?: { id: string; name: string; subjectId: string }[];
  defaultSubjectId?: string;
  defaultStrandId?: string;
  defaultGrade?: string;
}

export function YouTubeLearningLibraryModal({
  open,
  onOpenChange,
  subjects,
  strands = [],
  defaultSubjectId = "",
  defaultStrandId = "",
  defaultGrade = "",
}: YouTubeLearningLibraryModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState<"BROWSE" | "SUBMIT" | "LIVE_SEARCH">("BROWSE");

  // Browse state
  const [videos, setVideos] = React.useState<LearningVideoItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [subjectFilter, setSubjectFilter] = React.useState(defaultSubjectId);
  const [strandFilter, setStrandFilter] = React.useState(defaultStrandId);
  const [gradeFilter, setGradeFilter] = React.useState(defaultGrade);
  const [scopeFilter, setScopeFilter] = React.useState<"ALL" | "SCHOOL" | "NATIONAL">("ALL");
  const [playingVideoId, setPlayingVideoId] = React.useState<string | null>(null);

  // Submit state
  const [urlOrId, setUrlOrId] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [subSubjectId, setSubSubjectId] = React.useState(defaultSubjectId);
  const [subStrandId, setSubStrandId] = React.useState(defaultStrandId);
  const [subGrade, setSubGrade] = React.useState(defaultGrade);
  const [subScope, setSubScope] = React.useState<"SCHOOL" | "NATIONAL">("SCHOOL");
  const [submitting, setSubmitting] = React.useState(false);
  const [seeding, setSeeding] = React.useState(false);

  // Live search state
  const [liveQuery, setLiveQuery] = React.useState("");
  const [liveResults, setLiveResults] = React.useState<any[]>([]);
  const [liveMsg, setLiveMsg] = React.useState("");
  const [liveSearching, setLiveSearching] = React.useState(false);

  const loadVideos = React.useCallback(async () => {
    if (!open) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (subjectFilter) params.set("subjectId", subjectFilter);
      if (strandFilter) params.set("strandId", strandFilter);
      if (gradeFilter) params.set("grade", gradeFilter);
      if (scopeFilter) params.set("scope", scopeFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/academics/youtube-library?${params.toString()}`);
      const json = await res.json();
      if (json.ok) {
        setVideos(json.data.videos || []);
      } else {
        toast({ title: json.error?.message || "Failed to load video library", tone: "error" });
      }
    } catch {
      toast({ title: "Network error querying video library", tone: "error" });
    } finally {
      setLoading(false);
    }
  }, [open, subjectFilter, strandFilter, gradeFilter, scopeFilter, search, toast]);

  React.useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  async function handleSubmitVideo() {
    if (!urlOrId.trim() || !title.trim()) {
      toast({ title: "Please enter both the YouTube URL/ID and a Title.", tone: "error" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/academics/youtube-library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtubeUrlOrId: urlOrId.trim(),
          title: title.trim(),
          description: desc.trim() || null,
          subjectId: subSubjectId || null,
          strandId: subStrandId || null,
          grade: subGrade || null,
          scope: subScope,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({
          title: subScope === "NATIONAL"
            ? "Video submitted for national review!"
            : "Video saved directly to your school library!",
          tone: "success",
        });
        setUrlOrId("");
        setTitle("");
        setDesc("");
        setActiveTab("BROWSE");
        loadVideos();
      } else {
        toast({ title: json.error?.message || "Submission failed", tone: "error" });
      }
    } catch {
      toast({ title: "Network error submitting video link", tone: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLiveSearch() {
    if (!liveQuery.trim()) return;
    setLiveSearching(true);
    setLiveResults([]);
    try {
      const res = await fetch(`/api/academics/youtube-library/live-search?query=${encodeURIComponent(liveQuery)}`);
      const json = await res.json();
      if (json.ok) {
        setLiveResults(json.data.videos || []);
        setLiveMsg(json.data.message || "");
      } else {
        toast({ title: json.error?.message || "Live search failed", tone: "error" });
      }
    } catch {
      toast({ title: "Network error during live YouTube search", tone: "error" });
    } finally {
      setLiveSearching(false);
    }
  }

  async function handleSeedLibrary() {
    setSeeding(true);
    try {
      const res = await fetch("/api/academics/youtube-library/seed-all", {
        method: "POST",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast({
          title: `Successfully seeded ${json.seededCount} curated KICD educational videos across all strands!`,
          tone: "success",
        });
        loadVideos();
      } else {
        toast({ title: json.error || "Failed to seed YouTube library", tone: "error" });
      }
    } catch {
      toast({ title: "Network error seeding YouTube library", tone: "error" });
    } finally {
      setSeeding(false);
    }
  }

  const filteredStrands = strands.filter(
    (st) => !subjectFilter || st.subjectId === subjectFilter
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto rounded-2xl bg-white/95 backdrop-blur-xl dark:bg-navy-900/95">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-xl font-bold text-navy-900 dark:text-white flex items-center gap-2">
                <Video className="h-5 w-5 text-red-600" /> YouTube Learning Library
              </DialogTitle>
              <p className="text-xs text-navy-500 dark:text-navy-400">
                Strand-linked educational video repository with zero API quota cost and Platform Operations vetting queue.
              </p>
            </div>
            <div className="flex rounded-full bg-navy-100 p-1 dark:bg-navy-800">
              <button
                type="button"
                onClick={() => { setActiveTab("BROWSE"); setPlayingVideoId(null); }}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  activeTab === "BROWSE"
                    ? "bg-white text-navy-900 shadow-sm dark:bg-navy-700 dark:text-white"
                    : "text-navy-600 hover:text-navy-900 dark:text-navy-400 dark:hover:text-white"
                }`}
              >
                <Video className="h-3.5 w-3.5" /> 1. Browse & Watch (`{videos.length}`)
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab("SUBMIT"); setPlayingVideoId(null); }}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  activeTab === "SUBMIT"
                    ? "bg-white text-navy-900 shadow-sm dark:bg-navy-700 dark:text-white"
                    : "text-navy-600 hover:text-navy-900 dark:text-navy-400 dark:hover:text-white"
                }`}
              >
                <Plus className="h-3.5 w-3.5" /> 2. Submit Link
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab("LIVE_SEARCH"); setPlayingVideoId(null); }}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  activeTab === "LIVE_SEARCH"
                    ? "bg-white text-navy-900 shadow-sm dark:bg-navy-700 dark:text-white"
                    : "text-navy-600 hover:text-navy-900 dark:text-navy-400 dark:hover:text-white"
                }`}
              >
                <Search className="h-3.5 w-3.5" /> 3. Live YouTube (`100 Units`)
              </button>
              <button
                type="button"
                onClick={handleSeedLibrary}
                disabled={seeding}
                className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
              >
                {seeding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Video className="h-3.5 w-3.5" />}
                ⚡ Seed YouTube Library
              </button>
            </div>
          </div>
        </DialogHeader>

        {activeTab === "BROWSE" && (
          <div className="space-y-4 pt-2">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy-200 bg-warm-50/60 p-3 dark:border-navy-700 dark:bg-navy-800/50">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-navy-400" />
                  <input
                    type="text"
                    placeholder="Search video title or topic..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-8 w-52 rounded-full border border-navy-200 bg-white pl-8 pr-3 text-xs outline-none focus:border-red-500 dark:border-navy-700 dark:bg-navy-900 dark:text-white"
                  />
                </div>
                <select
                  value={subjectFilter}
                  onChange={(e) => { setSubjectFilter(e.target.value); setStrandFilter(""); }}
                  className="h-8 rounded-full border border-navy-200 bg-white px-3 text-xs font-semibold text-navy-800 dark:border-navy-700 dark:bg-navy-900 dark:text-navy-100"
                >
                  <option value="">All Subjects</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
                <select
                  value={strandFilter}
                  onChange={(e) => setStrandFilter(e.target.value)}
                  className="h-8 rounded-full border border-navy-200 bg-white px-3 text-xs font-semibold text-navy-800 dark:border-navy-700 dark:bg-navy-900 dark:text-navy-100"
                >
                  <option value="">All Strands</option>
                  {filteredStrands.map((st) => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="h-8 rounded-full border border-navy-200 bg-white px-3 text-xs font-semibold text-navy-800 dark:border-navy-700 dark:bg-navy-900 dark:text-navy-100"
                >
                  <option value="">All Grades</option>
                  <option value="Grade 4">Grade 4</option>
                  <option value="Grade 7">Grade 7</option>
                  <option value="Grade 10">Grade 10</option>
                </select>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-navy-500">Scope:</span>
                <select
                  value={scopeFilter}
                  onChange={(e) => setScopeFilter(e.target.value as any)}
                  className="h-8 rounded-full border border-navy-300 bg-white px-2.5 text-xs font-semibold dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                >
                  <option value="ALL">All (School + National Bank)</option>
                  <option value="SCHOOL">My School Library Only</option>
                  <option value="NATIONAL">National NEYO Bank Only</option>
                </select>
              </div>
            </div>

            {/* Embedded Video Player Modal/Box */}
            {playingVideoId && (
              <div className="rounded-2xl border-2 border-red-500/40 bg-black p-4 shadow-xl">
                <div className="flex items-center justify-between pb-2 text-white">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <Play className="h-4 w-4 text-red-500 fill-current" /> Zero-Quota Embedded Playback (`youtube-nocookie.com/embed`)
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setPlayingVideoId(null)}
                    className="h-7 text-xs rounded-full"
                  >
                    Close Player
                  </Button>
                </div>
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-navy-900">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${playingVideoId}?autoplay=1&rel=0`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-0"
                  />
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex h-64 flex-col items-center justify-center space-y-3 rounded-2xl border border-navy-200 bg-warm-50/30 p-8 text-center dark:border-navy-700 dark:bg-navy-800/30">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                <p className="text-sm font-semibold text-navy-800 dark:text-navy-100">
                  Querying zero-quota video repository…
                </p>
              </div>
            ) : videos.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-navy-200 bg-warm-50/30 py-16 text-center dark:border-navy-700 dark:bg-navy-800/30">
                <Video className="h-10 w-10 text-navy-400" />
                <p className="mt-3 text-sm font-bold text-navy-800 dark:text-navy-100">
                  No learning videos found matching your filters.
                </p>
                <p className="mt-1 text-xs text-navy-500">
                  Click "Submit Link" or "Live YouTube" to curate the first educational video for this strand!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {videos.map((v) => (
                  <Card
                    key={v.id}
                    className="flex flex-col justify-between overflow-hidden rounded-2xl border border-navy-200 bg-white shadow-sm transition-all hover:border-red-500 dark:border-navy-700 dark:bg-navy-800"
                  >
                    <div>
                      <div
                        onClick={() => setPlayingVideoId(v.youtubeId)}
                        className="group relative aspect-video w-full cursor-pointer overflow-hidden bg-navy-950"
                      >
                        <img
                          src={v.thumbnailUrl || `https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`}
                          alt={v.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity group-hover:bg-black/20">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-transform group-hover:scale-110">
                            <Play className="h-6 w-6 fill-current ml-0.5" />
                          </div>
                        </div>
                        <div className="absolute top-2 left-2 flex gap-1">
                          {v.scope === "NATIONAL" && (
                            <Badge tone="green" className="gap-1 text-[10px] shadow-sm">
                              <ShieldCheck className="h-3 w-3" /> National Bank
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="p-3.5 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold text-navy-500 uppercase">
                          <span>{v.subjectName || "General Subject"}</span>
                          <span>{v.grade || "All Grades"}</span>
                        </div>
                        <h3 className="text-sm font-bold text-navy-900 dark:text-white line-clamp-2">
                          {v.title}
                        </h3>
                        {v.strandName && (
                          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 truncate">
                            Strand: {v.strandName}
                          </p>
                        )}
                        {v.description && (
                          <p className="text-xs text-navy-500 line-clamp-2">{v.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-navy-100 px-3.5 py-2.5 text-[11px] text-navy-400 dark:border-navy-700">
                      <span>By {v.savedByName}</span>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setPlayingVideoId(v.youtubeId)}
                        className="h-7 rounded-full gap-1 text-xs font-semibold"
                      >
                        <Play className="h-3 w-3 fill-current text-red-600" /> Watch
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "SUBMIT" && (
          <div className="space-y-4 pt-2">
            <div className="rounded-xl border border-navy-200 bg-warm-50/60 p-4 dark:border-navy-700 dark:bg-navy-800/50 space-y-4">
              <div>
                <label className="text-xs font-bold text-navy-800 dark:text-navy-100">
                  YouTube Video Link or 11-Character ID *
                </label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  value={urlOrId}
                  onChange={(e) => setUrlOrId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-navy-300 bg-white p-2.5 text-xs font-mono dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-navy-800 dark:text-navy-100">Video Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Solving Quadratic Equations by Formula (Grade 10)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-navy-300 bg-white p-2.5 text-xs font-semibold dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-navy-800 dark:text-navy-100">Grade Level</label>
                  <select
                    value={subGrade}
                    onChange={(e) => setSubGrade(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-navy-300 bg-white p-2.5 text-xs font-semibold dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                  >
                    <option value="">Select Grade Level...</option>
                    <option value="Grade 4">Grade 4</option>
                    <option value="Grade 7">Grade 7 (Junior School)</option>
                    <option value="Grade 10">Grade 10 (Senior School)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-navy-800 dark:text-navy-100">Learning Area / Subject</label>
                  <select
                    value={subSubjectId}
                    onChange={(e) => setSubSubjectId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-navy-300 bg-white p-2.5 text-xs font-semibold dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                  >
                    <option value="">Select Subject...</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-navy-800 dark:text-navy-100">Connect to KICD Strand</label>
                  <select
                    value={subStrandId}
                    onChange={(e) => setSubStrandId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-navy-300 bg-white p-2.5 text-xs font-semibold dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                  >
                    <option value="">Select Strand...</option>
                    {strands.filter((st) => !subSubjectId || st.subjectId === subSubjectId).map((st) => (
                      <option key={st.id} value={st.id}>{st.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-navy-800 dark:text-navy-100">Description / Teacher Notes</label>
                <textarea
                  placeholder="Explain what specific concept or sub-strand this video clarifies..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-navy-300 bg-white p-2 text-xs dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-navy-200 dark:border-navy-700">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-navy-800 dark:text-navy-100">Library Scope:</span>
                  <select
                    value={subScope}
                    onChange={(e) => setSubScope(e.target.value as any)}
                    className="rounded-full border border-navy-300 bg-white px-3 py-1 text-xs font-semibold text-navy-800 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                  >
                    <option value="SCHOOL">My School Library Only (Instant Save)</option>
                    <option value="NATIONAL">Submit for National Review</option>
                  </select>
                </div>

                <Button
                  onClick={handleSubmitVideo}
                  disabled={submitting}
                  className="rounded-full bg-red-600 hover:bg-red-700 text-white gap-2 px-6 shadow-md"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {subScope === "NATIONAL" ? "Submit Link for National Vetting" : "Save Video to School Library"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "LIVE_SEARCH" && (
          <div className="space-y-4 pt-2">
            <div className="rounded-xl border border-navy-200 bg-warm-50/60 p-4 dark:border-navy-700 dark:bg-navy-800/50">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Photosynthesis leaf structure CBC Grade 7"
                  value={liveQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLiveQuery(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleLiveSearch()}
                  className="flex-1 rounded-full border border-navy-300 bg-white px-4 py-2 text-xs font-semibold outline-none focus:border-red-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                />
                <Button
                  onClick={handleLiveSearch}
                  disabled={liveSearching || !liveQuery.trim()}
                  className="rounded-full bg-red-600 hover:bg-red-700 text-white gap-1.5 text-xs px-5"
                >
                  {liveSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Query YouTube (`100 Quota Units`)
                </Button>
              </div>
              {liveMsg && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-blue-50 p-2.5 text-xs text-blue-800 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-200">
                  <Info className="h-4 w-4 shrink-0 text-blue-600" />
                  <span>{liveMsg}</span>
                </div>
              )}
            </div>

            {liveResults.length > 0 && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {liveResults.map((v) => (
                  <Card key={v.youtubeId} className="flex flex-col justify-between p-3.5 rounded-2xl border border-navy-200 bg-white dark:border-navy-700 dark:bg-navy-800">
                    <div className="flex gap-3">
                      <img
                        src={v.thumbnailUrl}
                        alt={v.title}
                        className="h-24 w-40 rounded-xl object-cover shrink-0 bg-navy-950"
                      />
                      <div className="space-y-1 min-w-0">
                        <h4 className="text-xs font-bold text-navy-900 dark:text-white line-clamp-2">
                          {v.title}
                        </h4>
                        <p className="text-[11px] text-navy-500 font-semibold">{v.channelTitle}</p>
                        <p className="text-[10px] text-navy-400 line-clamp-2">{v.description}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-end gap-2 border-t border-navy-100 pt-2 dark:border-navy-700">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setUrlOrId(v.youtubeId);
                          setTitle(v.title);
                          setDesc(v.description || "");
                          setActiveTab("SUBMIT");
                        }}
                        className="h-7 rounded-full text-xs gap-1 font-semibold text-emerald-700 dark:text-emerald-300"
                      >
                        <Plus className="h-3.5 w-3.5" /> Save & Link to Strand
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
