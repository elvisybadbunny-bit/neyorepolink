"use client";

import * as React from "react";
import { Search, Menu, ChevronDown } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { NotificationBell } from "./notification-bell";
import { BackgroundJobsBadge } from "./background-jobs-badge";
import { OfflineIndicator } from "@/components/offline/offline-indicator";
import { NeyoLogo } from "@/components/brand/neyo-logo";
import { SchoolSwitcher } from "./school-switcher";

/**
 * Top bar (Odoo module switcher + Linear Cmd+K search affordance).
 * The module switcher and search are wired to real features in later chunks
 * (A.11 Search, A.7 Notifications). For now they present the correct surface.
 * Upgraded to show the school badge/logo in place of NEYO's icon at the top-left.
 */
export function Topbar({
  tenantName,
  tenantLogoUrl,
  mobileWordmarkUrl,
  userName,
  userRole,
  rawRole,
  canViewAs = false,
  onMenuClick,
}: {
  tenantName: string;
  tenantLogoUrl?: string | null;
  mobileWordmarkUrl?: string | null;
  userName: string;
  userRole: string;
  rawRole?: string;
  canViewAs?: boolean;
  onMenuClick: () => void;
}) {
  const [showExtra, setShowExtra] = React.useState(false);

  return (
    <header className="print:hidden sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-navy-100 bg-warm-50/90 px-3 backdrop-blur-md dark:border-navy-800 dark:bg-navy-950/90 sm:px-5">
      {/* Mobile-only precision bar: one Liquid navigation card, an editable
          NEYO wordmark/account card, search, and one circular notification
          card. Desktop remains unchanged. */}
      <div className="flex w-full items-center gap-2 sm:hidden">
        <button onClick={onMenuClick} aria-label="Open Liquid navigation" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-white/80 text-navy-700 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-navy-900/80 dark:text-white"><Menu className="h-5 w-5" /></button>
        <button type="button" onClick={() => setShowExtra((shown) => !shown)} aria-expanded={showExtra} aria-label="Open account and school switcher" className="flex h-10 min-w-0 items-center gap-1.5 rounded-2xl border border-white/70 bg-white/80 px-3 text-navy-950 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-navy-900/80 dark:text-white">
          {mobileWordmarkUrl ? <img src={mobileWordmarkUrl} alt="NEYO" className="h-6 max-w-[88px] object-contain" /> : <NeyoLogo variant="wordmark" className="h-5 max-w-[88px]" />}
          <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-navy-400 transition-transform ${showExtra ? "rotate-180" : ""}`} />
        </button>
        <span className="min-w-0 flex-1" />
        <button onClick={() => window.dispatchEvent(new Event("neyo:open-search"))} aria-label="Search NEYO" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-white/80 text-navy-700 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-navy-900/80 dark:text-white"><Search className="h-5 w-5" /></button>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/80 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-navy-900/80"><NotificationBell /></div>
      </div>

      {/* Legacy mobile menu is replaced above; desktop navigation remains in the sidebar. */}
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        className="hidden h-9 w-9 items-center justify-center rounded-full text-navy-600 hover:bg-navy-100 dark:text-navy-300 dark:hover:bg-navy-800 sm:flex lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Brand + module switcher */}
      <div className="hidden items-center gap-2 sm:flex">
        {tenantLogoUrl ? (
          <img
            src={tenantLogoUrl}
            alt={tenantName}
            className="h-8 w-8 rounded-full object-cover border border-navy-200/50 shadow-sm"
          />
        ) : (
          <NeyoLogo variant="mark" className="h-8" title="NEYO" />
        )}
        {rawRole === "PARENT" ? (
          <SchoolSwitcher userRole={rawRole} currentTenantName={tenantName} />
        ) : (
          <button className="hidden items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-semibold text-navy-800 hover:bg-navy-100 dark:text-navy-100 dark:hover:bg-navy-800 sm:flex">
            {tenantName}
            <ChevronDown className="h-4 w-4 text-navy-400" />
          </button>
        )}
      </div>

      {/* Cmd+K search */}
      <button
        onClick={() => window.dispatchEvent(new Event("neyo:open-search"))}
        className="ml-2 hidden h-9 max-w-xs flex-1 items-center gap-2 rounded-full border border-navy-200 bg-white px-3.5 text-sm text-navy-400 transition-colors duration-200 ease-apple hover:border-navy-300 dark:border-navy-700 dark:bg-navy-900 md:flex"
      >
        <Search className="h-4 w-4" />
        <span>Search students, fees, staff…</span>
        <kbd className="ml-auto rounded border border-navy-200 bg-navy-50 px-1.5 py-0.5 text-[10px] font-medium text-navy-500 dark:border-navy-700 dark:bg-navy-800">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto hidden items-center gap-1 sm:flex">
        {/* Desktop utilities */}
        <div className="hidden sm:flex items-center gap-1.5">
          <BackgroundJobsBadge />
          <NotificationBell />
          <OfflineIndicator />
          <ThemeToggle />
          <UserMenu userName={userName} userRole={userRole} rawRole={rawRole} canViewAs={canViewAs} />
        </div>
      </div>

      {/* Mobile Dropped-Down Secondary controls */}
      {showExtra && (
        <div className="absolute left-3 right-3 top-[3.65rem] z-40 flex items-center justify-around gap-2 rounded-2xl border border-white/70 bg-white/90 p-3 text-navy-900 shadow-pop backdrop-blur-xl animate-fade-in sm:hidden dark:border-white/10 dark:bg-navy-950/90 dark:text-white">
          {rawRole === "PARENT" ? <SchoolSwitcher userRole={rawRole} currentTenantName={tenantName} mobileTrigger /> : null}
          <BackgroundJobsBadge />
          <OfflineIndicator />
          <ThemeToggle />
          <UserMenu userName={userName} userRole={userRole} rawRole={rawRole} canViewAs={canViewAs} />
        </div>
      )}
    </header>
  );
}
