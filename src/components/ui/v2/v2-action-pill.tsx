"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface V2ActionPillProps {
  label: string;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "accent" | "danger";
  onClick?: () => void;
  disabled?: boolean;
}

export function V2ActionPill({
  label,
  icon: Icon,
  variant = "primary",
  onClick,
  disabled = false,
}: V2ActionPillProps) {
  const styles = {
    primary:
      "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-md border border-emerald-400/30",
    secondary:
      "bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-sm",
    accent:
      "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold shadow-md border border-amber-300/40",
    danger:
      "bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full px-5 py-2.5 text-xs font-semibold flex items-center gap-2 transition-all duration-200 ease-apple active:scale-95 disabled:opacity-50 ${styles[variant]}`}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span>{label}</span>
    </button>
  );
}
