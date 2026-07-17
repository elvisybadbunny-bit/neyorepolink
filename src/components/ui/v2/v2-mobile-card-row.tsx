"use client";

import React from "react";
import { LucideIcon, ChevronRight } from "lucide-react";

interface V2MobileCardRowProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  badgeVariant?: "emerald" | "amber" | "red" | "indigo" | "cyan";
  metaText?: string;
  rightValue?: string;
  icon?: LucideIcon;
  onClick?: () => void;
  actionButton?: React.ReactNode;
}

export function V2MobileCardRow({
  title,
  subtitle,
  badgeText,
  badgeVariant = "emerald",
  metaText,
  rightValue,
  icon: Icon,
  onClick,
  actionButton,
}: V2MobileCardRowProps) {
  const badgeStyles = {
    emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    amber: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    red: "bg-red-500/20 text-red-400 border-red-500/30",
    indigo: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    cyan: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-white/10 transition-all duration-200 ease-apple flex items-center justify-between gap-3 ${
        onClick ? "cursor-pointer active:scale-[0.99]" : ""
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {Icon && (
          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-white text-sm truncate">{title}</h4>
            {badgeText && (
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeStyles[badgeVariant]}`}
              >
                {badgeText}
              </span>
            )}
          </div>

          {subtitle && (
            <p className="text-xs text-slate-400 truncate">{subtitle}</p>
          )}

          {metaText && (
            <p className="text-[11px] font-mono text-slate-500">{metaText}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {rightValue && (
          <span className="font-bold font-mono text-sm text-emerald-400">
            {rightValue}
          </span>
        )}

        {actionButton}

        {onClick && !actionButton && (
          <ChevronRight className="w-4 h-4 text-slate-500" />
        )}
      </div>
    </div>
  );
}
