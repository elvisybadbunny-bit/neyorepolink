"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { BookOpenText, GripHorizontal, Play, Video, X } from "lucide-react";

type Guide = { id: string; title: string; youtubeId: string; version: number; transcript?: string | null; durationSeconds?: number | null };

export function ContextualGuidedHelp() {
  const pathname = usePathname();
  const [guides, setGuides] = React.useState<Guide[]>([]);
  const [active, setActive] = React.useState<Guide | null>(null);
  const [offer, setOffer] = React.useState<Guide | null>(null);
  const [transcriptOpen, setTranscriptOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 16, y: 88 });
  const drag = React.useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);

  React.useEffect(() => {
    setActive(null); setTranscriptOpen(false); setGuides([]); setOffer(null);
    fetch(`/api/guided-help?pathname=${encodeURIComponent(pathname)}`)
      .then((response) => response.json())
      .then((json) => {
        if (!json.ok) return;
        const rows = json.data.guides ?? [];
        setGuides(rows);
        const first = rows[0] as Guide | undefined;
        if (!first) return;
        const key = `neyo-guide-offer:${first.id}:v${first.version}`;
        if (localStorage.getItem(key) !== "dismissed") setOffer(first);
      }).catch(() => {});
  }, [pathname]);

  function dismissOffer(guide: Guide) {
    localStorage.setItem(`neyo-guide-offer:${guide.id}:v${guide.version}`, "dismissed");
    setOffer(null);
  }

  function beginDrag(event: React.PointerEvent) {
    drag.current = { x: event.clientX, y: event.clientY, startX: position.x, startY: position.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function moveDrag(event: React.PointerEvent) {
    if (!drag.current) return;
    const maxX = Math.max(8, window.innerWidth - 360);
    const maxY = Math.max(70, window.innerHeight - 240);
    setPosition({ x: Math.max(8, Math.min(maxX, drag.current.startX + event.clientX - drag.current.x)), y: Math.max(70, Math.min(maxY, drag.current.startY - (event.clientY - drag.current.y))) });
  }

  if (guides.length === 0 && !active) return null;

  return (
    <>
      {offer && !active ? (
        <div className="fixed left-1/2 top-3 z-[75] w-[min(94vw,430px)] -translate-x-1/2 animate-island rounded-[1.75rem] border border-white/10 bg-navy-950 p-3 text-white shadow-2xl">
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-300"><Video className="h-5 w-5"/></span><div className="min-w-0 flex-1"><p className="text-[10px] font-black uppercase tracking-wider text-green-300">Guide available</p><p className="truncate text-sm font-bold">{offer.title}</p></div><button onClick={() => { setActive(offer); setOffer(null); }} className="rounded-full bg-white px-3 py-2 text-xs font-black text-navy-950">Watch</button><button onClick={() => dismissOffer(offer)} className="rounded-full p-2 text-white/60 hover:bg-white/10" aria-label="Dismiss guide suggestion"><X className="h-4 w-4"/></button></div>
        </div>
      ) : null}

      {!active ? (
        <button onClick={() => setActive(guides[0])} className="fixed bottom-24 right-4 z-40 flex min-h-11 items-center gap-2 rounded-full border border-navy-200 bg-white px-4 py-2 text-xs font-black text-navy-800 shadow-pop dark:border-navy-700 dark:bg-navy-900 dark:text-white sm:bottom-5" aria-label="Open video guide for this screen">
          <Play className="h-4 w-4 text-green-600"/>Help for this screen
        </button>
      ) : (
        <aside className="fixed z-[76] w-[min(92vw,350px)] overflow-hidden rounded-3xl border border-navy-700 bg-navy-950 text-white shadow-2xl" style={{ left: position.x, bottom: position.y }} aria-label="Contextual video guide">
          <div className="flex cursor-move touch-none items-center gap-2 px-3 py-2" onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={() => { drag.current = null; }}>
            <GripHorizontal className="h-4 w-4 text-white/40"/><p className="min-w-0 flex-1 truncate text-xs font-bold">{active.title}</p><button onClick={() => setTranscriptOpen(!transcriptOpen)} className="rounded-full p-1.5 text-green-300 hover:bg-white/10" aria-label="Toggle transcript"><BookOpenText className="h-4 w-4"/></button><button onClick={() => setActive(null)} className="rounded-full p-1.5 text-white/60 hover:bg-white/10" aria-label="Close guide"><X className="h-4 w-4"/></button>
          </div>
          {transcriptOpen ? <div className="max-h-72 overflow-y-auto border-t border-white/10 p-4 text-xs leading-6 text-white/80">{active.transcript || "A transcript has not been published for this guide yet. Video playback requires a connection."}</div> : <div className="aspect-video bg-black"><iframe src={`https://www.youtube-nocookie.com/embed/${active.youtubeId}?rel=0&modestbranding=1&playsinline=1`} title={active.title} className="h-full w-full" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/></div>}
        </aside>
      )}
    </>
  );
}
