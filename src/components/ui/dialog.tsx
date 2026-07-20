"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/**
 * NEYO Dialog — a lightweight, dependency-free modal primitive.
 *
 * Liquid Glass styling (Odoo structure + Apple craft + Linear speed):
 *  - frosted backdrop, rounded glass panel, calm 200ms apple easing
 *  - controlled via `open` + `onOpenChange` (Radix-compatible API surface)
 *  - closes on Escape and backdrop click; locks body scroll while open
 *
 * Exposes: Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter.
 */

type DialogContextValue = { open: boolean; onOpenChange?: (open: boolean) => void };
const DialogContext = React.createContext<DialogContextValue>({ open: false });

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange?.(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onOpenChange]);

  return <DialogContext.Provider value={{ open, onOpenChange }}>{open ? children : null}</DialogContext.Provider>;
}

export function DialogContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { onOpenChange } = React.useContext(DialogContext);

  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex h-[100dvh] w-screen items-end justify-center overflow-hidden p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Frosted backdrop */}
      <div
        className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm transition-opacity duration-200"
        onClick={() => onOpenChange?.(false)}
        aria-hidden="true"
      />
      {/* Glass panel — deliberately uses the literal `bg-white` / `dark:bg-navy-900`
          utilities (NOT opacity-suffixed like bg-white/95) so the Liquid Glass
          engine's exact-match CSS selectors in globals.css (`html.glass .bg-white`,
          `html.glass.dark .bg-navy-900`) actually apply blur/tint/sheen here.
          An opacity-suffixed class compiles to a different selector and silently
          falls outside the glass system — this was the root cause of modals that
          looked "flat" instead of glass (2026-07-02 audit). */}
      <div
        className={cn(
          "relative z-10 max-h-[calc(100dvh-0.5rem)] w-full max-w-lg touch-pan-y overflow-y-auto overscroll-contain rounded-t-3xl border border-white/40 bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-card-hover backdrop-blur-xl [-webkit-overflow-scrolling:touch] sm:max-h-[90dvh] sm:rounded-2xl sm:p-6",
          "transition-all duration-200 ease-apple",
          "dark:border-navy-700/60 dark:bg-navy-900",
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-2 flex flex-col gap-1.5", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-black text-navy-950 dark:text-white", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-4 flex items-center justify-end gap-2", className)} {...props} />;
}
