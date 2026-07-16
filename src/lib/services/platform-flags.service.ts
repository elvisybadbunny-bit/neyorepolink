/**
 * G.22 Platform feature flags (founder 2026-06-12: "US THE COMPANY SHOULD
 * HAVE A FEATURE WHERE WE CAN PAUSE SOMETHING AS WE STILL CONTINUE BUILDING
 * IT BEFORE RELEASING TO THE PUBLIC").
 *
 * SUPER_ADMIN (NEYO company) pauses a module key GLOBALLY: it vanishes from
 * every school's nav + its page/API returns "coming soon" — while we keep
 * building. NOT tenant-owned; lives at the platform level.
 */
import { db } from "@/lib/db";
import { MODULES, isModuleKey } from "@/lib/core/modules";
import { NAVIGATION } from "@/lib/core/navigation";
import { J_FEATURES, jFeatureKey, isJFeatureKey, J_FEATURE_PREFIX } from "@/lib/core/j-features";
import { EE_FEATURES, eeFeatureKey, EE_FEATURE_PREFIX } from "@/lib/core/ee-features";
import type { SessionUser } from "@/lib/core/session";

export class FlagError extends Error {
  constructor(public code: "NOT_FOUND" | "FORBIDDEN", message: string) {
    super(message);
    this.name = "FlagError";
  }
}

/** Module keys currently paused platform-wide. Cheap query — called per layout render. */
export async function pausedModuleKeys(): Promise<Set<string>> {
  const rows = await db.platformFlag.findMany({ where: { paused: true } });
  return new Set(rows.map((r) => r.moduleKey).filter((k) => !k.startsWith("feature:")));
}

/** Feature hrefs currently paused platform-wide (nav-level launch staging). */
export async function pausedFeatureHrefs(): Promise<Set<string>> {
  const rows = await db.platformFlag.findMany({ where: { paused: true } });
  return new Set(rows.map((r) => r.moduleKey).filter((k) => k.startsWith("feature:")).map((k) => k.slice("feature:".length)));
}

/** Is one module paused? (For API guards.) */
export async function isPaused(moduleKey: string): Promise<{ paused: boolean; note: string | null }> {
  const row = await db.platformFlag.findUnique({ where: { moduleKey } });
  return { paused: Boolean(row?.paused), note: row?.note ?? null };
}

/** All module + navigation feature flags for the SUPER_ADMIN NEYO Ops console. */
export async function listFlags() {
  const rows = await db.platformFlag.findMany();
  const map = new Map(rows.map((r) => [r.moduleKey, r]));
  const moduleFlags = MODULES.filter((m) => !m.core).map((m) => ({
    moduleKey: m.key,
    label: m.label,
    kind: "module" as const,
    href: m.href,
    paused: map.get(m.key)?.paused ?? false,
    note: map.get(m.key)?.note ?? null,
  }));
  const seen = new Set<string>();
  const featureFlags = NAVIGATION.flatMap((section) => section.items).filter((item) => {
    if (seen.has(item.href)) return false;
    seen.add(item.href);
    return item.href !== "/dashboard" && item.href !== "/settings/security";
  }).map((item) => {
    const key = `feature:${item.href}`;
    return {
      moduleKey: key,
      label: item.label,
      kind: "feature" as const,
      href: item.href,
      paused: map.get(key)?.paused ?? false,
      note: map.get(key)?.note ?? null,
    };
  });
  return [...moduleFlags, ...featureFlags].sort((a, b) => (a.kind === b.kind ? a.label.localeCompare(b.label) : a.kind.localeCompare(b.kind)));
}

/** Pause/release a module platform-wide. SUPER_ADMIN only (route-gated). */
export async function setFlag(user: SessionUser, moduleKey: string, paused: boolean, note?: string) {
  const isFeatureKey = moduleKey.startsWith("feature:") && NAVIGATION.some((s) => s.items.some((i) => `feature:${i.href}` === moduleKey));
  const isJFeature = isJFeatureKey(moduleKey);
  if (!isModuleKey(moduleKey) && !isFeatureKey && !isJFeature) throw new FlagError("NOT_FOUND", "Unknown module or feature key.");
  const row = await db.platformFlag.upsert({
    where: { moduleKey },
    create: { moduleKey, paused, note: note ?? null, updatedBy: user.fullName },
    update: { paused, note: note ?? null, updatedBy: user.fullName },
  });
  await db.auditLog.create({
    data: {
      tenantId: user.tenantId, actorId: user.id, actorName: user.fullName,
      action: paused
        ? (isJFeature ? "platform.jfeature_paused" : isFeatureKey ? "platform.feature_paused" : "platform.module_paused")
        : (isJFeature ? "platform.jfeature_released" : isFeatureKey ? "platform.feature_released" : "platform.module_released"),
      entityType: "platformFlag", entityId: row.id,
      metadata: JSON.stringify({ moduleKey, note }),
    },
  });
  return row;
}

// =============================================================================
// Part-J feature toggles (founder 2026-06-29). Default ON (not paused).
// =============================================================================

/** All Part-J feature toggles for the NEYO Ops console (ON = not paused). */
export async function listJFeatureFlags() {
  const rows = await db.platformFlag.findMany({ where: { moduleKey: { startsWith: J_FEATURE_PREFIX } } });
  const map = new Map(rows.map((r) => [r.moduleKey, r]));
  return J_FEATURES.map((f) => {
    const key = jFeatureKey(f.id);
    const row = map.get(key);
    return {
      id: f.id,
      moduleKey: key,
      label: f.label,
      description: f.description,
      // ON = enabled = not paused. Defaults to ON when no flag row exists.
      enabled: !(row?.paused ?? false),
      note: row?.note ?? null,
      updatedBy: row?.updatedBy ?? null,
      updatedAt: row?.updatedAt ?? null,
    };
  });
}

/** Is a given Part-J feature currently switched OFF (paused)? Default: ON. */
export async function isJFeaturePaused(featureId: string): Promise<boolean> {
  const row = await db.platformFlag.findUnique({ where: { moduleKey: jFeatureKey(featureId) } });
  return Boolean(row?.paused);
}

/** Throw a typed error if a Part-J feature is switched off — used by API guards. */
export async function assertJFeatureEnabled(featureId: string) {
  if (await isJFeaturePaused(featureId)) {
    throw new FlagError("FORBIDDEN", "This feature is currently switched off by NEYO Ops. Please check back soon.");
  }
}

// =============================================================================
// Part-EE feature toggles (founder 2026-07-16: "every idea must have a
// release button to be fully released"). Deliberately OPPOSITE default to
// Part-J above: a Part-EE feature is OFF (not released) until NEYO Ops
// explicitly flips it on — no flag row at all means "not yet released",
// never "on by default". Same PlatformFlag table, same `paused` column,
// just read the other way: here `paused=true` OR "no row yet" both mean
// disabled; only an explicit `paused=false` row means released.
// =============================================================================

/** All Part-EE feature toggles for the NEYO Ops console (ON = explicitly released). */
export async function listEeFeatureFlags() {
  const rows = await db.platformFlag.findMany({ where: { moduleKey: { startsWith: EE_FEATURE_PREFIX } } });
  const map = new Map(rows.map((r) => [r.moduleKey, r]));
  return EE_FEATURES.map((f) => {
    const key = eeFeatureKey(f.id);
    const row = map.get(key);
    return {
      id: f.id,
      moduleKey: key,
      label: f.label,
      description: f.description,
      // Released = explicitly NOT paused. No row yet = not released
      // (default OFF) — the founder's own "off before launch" requirement.
      enabled: row ? !row.paused : false,
      note: row?.note ?? null,
      updatedBy: row?.updatedBy ?? null,
      updatedAt: row?.updatedAt ?? null,
    };
  });
}

/** Is a given Part-EE feature currently released? Default: NOT released (OFF). */
export async function isEeFeatureReleased(featureId: string): Promise<boolean> {
  const row = await db.platformFlag.findUnique({ where: { moduleKey: eeFeatureKey(featureId) } });
  return Boolean(row && !row.paused);
}

/** Throw a typed error if a Part-EE feature has not yet been released by NEYO Ops. Default: blocked. */
export async function assertEeFeatureReleased(featureId: string) {
  if (!(await isEeFeatureReleased(featureId))) {
    throw new FlagError("FORBIDDEN", "This feature has not been released yet. Please check back soon.");
  }
}

/** NEYO Ops action: release or re-pause one Part-EE feature platform-wide. */
export async function setEeFeatureReleased(user: SessionUser, featureId: string, released: boolean, note?: string) {
  // REAL BUG FIX (found live while screenshotting this feature): FOUNDER is
  // a strict superset of SUPER_ADMIN everywhere else in this codebase (see
  // permissionsForRole()'s own comment above) because the API route's own
  // requireRole("SUPER_ADMIN") call already expands to allow FOUNDER too --
  // but this function's own internal check compared the literal string
  // "SUPER_ADMIN" and rejected a real FOUNDER account. Fixed to match the
  // same allowed-roles list the route itself was already relying on.
  if (!["SUPER_ADMIN", "FOUNDER"].includes(user.role)) throw new FlagError("FORBIDDEN", "Only NEYO Ops can release or pause a Part-EE feature.");
  if (!EE_FEATURES.some((f) => f.id === featureId)) throw new FlagError("NOT_FOUND", "Unknown Part-EE feature.");
  const moduleKey = eeFeatureKey(featureId);
  const row = await db.platformFlag.upsert({
    where: { moduleKey },
    create: { moduleKey, paused: !released, note: note ?? null, updatedBy: user.fullName },
    update: { paused: !released, note: note ?? null, updatedBy: user.fullName },
  });
  return row;
}

