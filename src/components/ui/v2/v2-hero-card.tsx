"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface V2HeroCardProps {
  title: string;
  badgeLabel?: string;
  metricValue: string;
  metricLabel: string;
  secondaryValue?: string;
  secondaryLabel?: string;
  progressPct?: number;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function V2HeroCard({
  title,
  badgeLabel,
  metricValue,
  metricLabel,
  secondaryValue,
  secondaryLabel,
  progressPct,
  icon: Icon,
  actions,
  children,
}: V2HeroCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950 via-navy-900 to-slate-900 border border-white/15 p-6 shadow-2xl text-white space-y-5">
      {/* Background Glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10 text-emerald-400">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">{title}</h2>
            {badgeLabel && (
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {badgeLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Primary Hero Metric */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400 block mb-1">
            {metricLabel}
          </span>
          <span className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono">
            {metricValue}
          </span>
        </div>

        {secondaryValue && (
          <div className="text-left sm:text-right">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 block mb-1">
              {secondaryLabel}
            </span>
            <span className="text-xl font-bold text-emerald-400 font-mono">
              {secondaryValue}
            </span>
          </div>
        )}
      </div>

      {/* Optional Progress Bar */}
      {typeof progressPct === "number" && (
        <div className="space-y-1.5">
          <div className="w-full bg-navy-950 rounded-full h-3 overflow-hidden border border-white/10 p-0.5">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-300 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Progress: {progressPct}%</span>
            <span>100% Target</span>
          </div>
        </div>
      )}

      {/* Action Pills */}
      {actions && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
          {actions}
        </div>
      )}

      {children}
    </div>
  );
}
