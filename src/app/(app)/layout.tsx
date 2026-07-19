import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { AppShellV2 } from "@/components/shell/app-shell-v2";
import { resolveShellVersion } from "@/lib/services/shell-version.service";
import { effectivePermissionsForUser, getSessionContext } from "@/lib/core/session";
import { ROLE_LABELS } from "@/lib/core/roles";
import { db } from "@/lib/db";
import { currentTenantSlug } from "@/lib/core/current-tenant";
import { getEnabledModuleKeys } from "@/lib/services/module.service";
import { getNavVisibility } from "@/lib/services/nav-visibility.service";
import { pausedFeatureHrefs } from "@/lib/services/platform-flags.service";
import { ImpersonationBanner } from "@/components/shell/impersonation-banner";
import { ViewAsBanner } from "@/components/shell/view-as-banner";
import { DemoBanner } from "@/components/shell/demo-banner";
import { demoStatus } from "@/lib/services/demo.service";
import { PermissionsProvider } from "@/components/auth/permissions-provider";
import { LangProvider } from "@/components/i18n/lang-provider";
import { isLang } from "@/lib/i18n/dictionaries";

/**
 * Layout for the authenticated app area (A.1 + A.2 + A.3).
 * - Server-side guard: no valid session -> redirect to /login.
 * - Subdomain guard (A.2.3): a tenant subdomain that ISN'T the user's is blocked.
 * - Impersonation banner (A.2.9) shown when a NEYO admin is acting as a school.
 * - The EFFECTIVE user + their school name are passed to the shell.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");
  const user = ctx.user; // effective user (impersonated, if impersonating)

  // PERFORMANCE (founder-reported real-world slowness, 2026-07-13): these 6
  // real lookups are all independent (none depends on another's result), so
  // running them with Promise.all lets their real DB round-trips overlap
  // instead of paying for each one's own latency back-to-back in sequence —
  // a real, measurable per-page-load speedup with zero behaviour change.
  const [tenant, enabledModulesSet, hiddenNav, platformHiddenHrefsSet, permissions, demo, shellVersion] = await Promise.all([
    db.tenant.findUnique({
      where: { id: user.tenantId },
      select: { name: true, slug: true, logoUrl: true, brandPrimary: true, brandAccent: true },
    }),
    getEnabledModuleKeys(user.tenantId),
    getNavVisibility(user.tenantId),
    pausedFeatureHrefs(),
    effectivePermissionsForUser(user),
    demoStatus(user.tenantId),
    resolveShellVersion(user),
  ]);

  // A.2.3 enforcement: skip while impersonating (admin operates cross-tenant).
  if (!ctx.isImpersonating) {
    const slug = currentTenantSlug();
    if (slug && tenant && slug !== tenant.slug) {
      redirect("/wrong-school");
    }
  }

  // A.2.6: sidebar shows only modules this (effective) school has enabled.
  // Pass enabled keys (strings) — NOT pre-filtered nav with icon functions,
  // which can't cross the server->client boundary.
  const enabledModules = Array.from(enabledModulesSet);
  const platformHiddenHrefs = Array.from(platformHiddenHrefsSet);

  // Distinguish the two "acting as" modes:
  //  - View-As: in-school, read-only -> blue banner.
  //  - Impersonation (A.2.9): NEYO super-admin cross-tenant -> amber banner.
  const isViewAs = ctx.isImpersonating && ctx.viewAsReadOnly;
  const isSuperImpersonation = ctx.isImpersonating && !ctx.viewAsReadOnly;

  // The user menu shows "View as" only for leaders who AREN'T already acting.
  const canViewAs =
    !ctx.isImpersonating &&
    ["SCHOOL_OWNER", "PRINCIPAL", "DEPUTY_PRINCIPAL"].includes(user.role);

  return (
    <PermissionsProvider initialRole={user.role} initialSecondaryRole={user.secondaryRole} initialPermissions={permissions}>
      <LangProvider initialLang={isLang(user.language) ? user.language : "en"}>
        {demo.isDemo && <DemoBanner hoursLeft={demo.hoursLeft ?? 0} />}
        {isSuperImpersonation && (
          <ImpersonationBanner
            tenantName={tenant?.name ?? "this school"}
            actingAs={user.fullName}
          />
        )}
        {isViewAs && <ViewAsBanner actingAs={user.fullName} />}
        {shellVersion === "v2" ? (
          <AppShellV2
            tenantName={tenant?.name ?? "NEYO"}
            tenantLogoUrl={tenant?.logoUrl}
            userName={user.fullName}
            userRole={ROLE_LABELS[user.role]}
            rawRole={user.role}
            enabledModules={enabledModules}
            hiddenNav={hiddenNav}
            platformHiddenHrefs={platformHiddenHrefs}
            canViewAs={canViewAs}
            brandPrimary={tenant?.brandPrimary}
            brandAccent={tenant?.brandAccent}
          >
            {children}
          </AppShellV2>
        ) : (
          <AppShell
            tenantName={tenant?.name ?? "NEYO"}
            tenantLogoUrl={tenant?.logoUrl}
            userName={user.fullName}
            userRole={ROLE_LABELS[user.role]}
            rawRole={user.role}
            enabledModules={enabledModules}
            hiddenNav={hiddenNav}
            platformHiddenHrefs={platformHiddenHrefs}
            canViewAs={canViewAs}
          >
            {children}
          </AppShell>
        )}
      </LangProvider>
    </PermissionsProvider>
  );
}
