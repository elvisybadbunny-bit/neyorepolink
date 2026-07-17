"use client";

import React from "react";
import { Search, Plus, Bell, Home } from "lucide-react";

interface V2FloatingDockProps {
  onSearchClick?: () => void;
  onActionClick?: () => void;
  actionLabel?: string;
}

export function V2FloatingDock({
  onSearchClick,
  onActionClick,
  actionLabel = "Action",
}: V2FloatingDockProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-sm w-[92%] px-4 py-3 rounded-full bg-slate-950/80 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center justify-between gap-3 text-white">
      <a
        href="/dashboard"
        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-emerald-400 transition-colors"
        title="Home Dashboard"
      >
        <Home className="w-5 h-5" />
      </a>

      {onSearchClick && (
        <button
          onClick={onSearchClick}
          className="flex-1 bg-white/10 hover:bg-white/15 px-4 py-2 rounded-full text-xs text-slate-300 flex items-center gap-2 border border-white/10 transition-colors"
        >
          <Search className="w-4 h-4 text-emerald-400" />
          <span>Quick Search (⌘K)...</span>
        </button>
      )}

      {onActionClick && (
        <button
          onClick={onActionClick}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-full text-xs flex items-center gap-1.5 transition-all shadow-lg active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
