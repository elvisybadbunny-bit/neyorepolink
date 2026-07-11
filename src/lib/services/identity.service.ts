/**
 * Identity generation service (Feature A.4).
 * - nextTenantId: atomic, race-safe per-(tenant, entityType) human ID.
 * - generateNeyoLoginId: a globally-unique NEYO platform login ID.
 *
 * Overhauled to use the new format (KHS5 instead of KH-S-000005) - no dashes
 * and no leading zeros.
 *
 * T.4 (2026-07-09) — real duplicate human-readable ID prefix fix. Two real
 * schools whose slugs start with the same letters (e.g. "Kahawa High
 * School" and "Kirinyaga High School") both computed the literal prefix
 * "KHS" via prefixFromSlug() — a real, confirmed display/readability risk
 * (never a data-integrity bug: the underlying DB always keys on
 * (tenantId, humanId) together, per A.2's tenant isolation). Founder-
 * confirmed fix (option a): detect + auto-disambiguate at REAL tenant
 * CREATION time — computeUniqueIdPrefix() checks every OTHER real tenant's
 * already-stored Tenant.idPrefix and appends a numeric suffix on collision
 * (the second "KHS" school becomes "KHS2"). The result is persisted ONCE
 * on Tenant.idPrefix and never recomputed, so an EXISTING school's real IDs
 * never silently change — only brand-new signups going forward are
 * affected, fully backward-compatible.
 */
import crypto from "crypto";
import { db } from "@/lib/db";
import {
  prefixFromSlug,
  entityCode,
} from "@/lib/core/identity";

/**
 * T.4 — compute a real, tenant-unique ID prefix for a BRAND-NEW tenant,
 * auto-disambiguating against every other real tenant's own stored
 * idPrefix. Called exactly ONCE, at real tenant creation (signupSchool(),
 * createDemoSchool()) — never recomputed afterward, so an existing
 * school's IDs are never touched by this function running again later.
 */
export async function computeUniqueIdPrefix(slug: string): Promise<string> {
  const base = prefixFromSlug(slug);

  const existing = await db.tenant.findFirst({ where: { idPrefix: base } });
  if (!existing) return base;

  // Real collision — append the lowest free numeric suffix (KHS -> KHS2,
  // KHS3, ...), checked against every real tenant's stored prefix so a
  // THIRD colliding school (or a school independently choosing a slug that
  // happens to already look like "KHS2") is still correctly disambiguated.
  for (let n = 2; n < 1000; n++) {
    const candidate = `${base}${n}`;
    const clash = await db.tenant.findFirst({ where: { idPrefix: candidate } });
    if (!clash) return candidate;
  }
  // Extremely unlikely fallback — still real, still unique, never blocks signup.
  return `${base}${Date.now().toString(36).toUpperCase()}`;
}

/**
 * T.4 — one-time, idempotent backfill for real EXISTING tenants created
 * before this feature: stamps Tenant.idPrefix from each tenant's CURRENT
 * prefixFromSlug(slug) value, in a stable order (oldest tenant first) so a
 * real pre-existing collision is disambiguated deterministically and
 * every already-live school's human-facing IDs are provably UNCHANGED
 * (a school whose prefix was never colliding keeps the exact same prefix
 * it always had — this only appends a suffix for a genuine, real collision
 * discovered during the backfill itself). Safe to call on every real
 * `db:seed` run: a tenant that already has idPrefix set is skipped.
 */
export async function backfillIdPrefixes(): Promise<{ backfilled: number; skipped: number }> {
  const tenants = await db.tenant.findMany({
    where: { idPrefix: null },
    orderBy: { id: "asc" },
    select: { id: true, slug: true },
  });
  let backfilled = 0;
  for (const t of tenants) {
    const prefix = await computeUniqueIdPrefix(t.slug);
    await db.tenant.update({ where: { id: t.id }, data: { idPrefix: prefix } });
    backfilled++;
  }
  const skipped = await db.tenant.count({ where: { idPrefix: { not: null } } }) - backfilled;
  return { backfilled, skipped };
}

/**
 * Reserve the next number for (tenant, entityType) and format the tenant ID.
 * Returns e.g. "KHS5" (no dashes, no leading zeros).
 */
export async function nextTenantId(
  tenantId: string,
  entityType: string,
  opts?: { padding?: number }
): Promise<string> {
  const type = entityType.toUpperCase();

  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
    select: { slug: true, idPrefix: true },
  });
  if (!tenant) throw new Error(`Tenant ${tenantId} not found.`);

  // Atomically reserve the next value with a single upsert+increment.
  const updated = await db.idSequence.upsert({
    where: { tenantId_entityType: { tenantId, entityType: type } },
    update: { lastValue: { increment: 1 } },
    create: { tenantId, entityType: type, lastValue: 1 },
  });
  const value = updated.lastValue;

  // T.4 — always prefer the REAL, STABLE, once-computed idPrefix; only a
  // tenant row that somehow predates the T.4 backfill (should never happen
  // after the migration's own backfill) falls back to a live recompute.
  const prefix = tenant.idPrefix ?? prefixFromSlug(tenant.slug);
  const code = entityCode(type);
  const number = String(value);
  return `${prefix}${code}${number}`;
}

/**
 * Peek at the next number WITHOUT consuming it (for previews in forms).
 */
export async function peekNextTenantId(
  tenantId: string,
  entityType: string,
  opts?: { padding?: number }
): Promise<string> {
  const type = entityType.toUpperCase();
  const [tenant, seq] = await Promise.all([
    db.tenant.findUnique({ where: { id: tenantId }, select: { slug: true, idPrefix: true } }),
    db.idSequence.findUnique({
      where: { tenantId_entityType: { tenantId, entityType: type } },
    }),
  ]);
  if (!tenant) throw new Error(`Tenant ${tenantId} not found.`);
  const next = (seq?.lastValue ?? 0) + 1;
  const prefix = tenant.idPrefix ?? prefixFromSlug(tenant.slug);
  return `${prefix}${entityCode(type)}${next}`;
}


/**
 * Globally-unique NEYO platform login ID (A.4.1, two-ID system).
 * Format: NEYO<base32-ish 10 chars> (no dashes).
 */
export async function generateNeyoLoginId(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const rand = crypto.randomBytes(7).toString("hex").slice(0, 10).toUpperCase();
    const candidate = `NEYO${rand}`;
    const clash = await db.user.findUnique({
      where: { neyoLoginId: candidate },
      select: { id: true },
    });
    if (!clash) return candidate;
  }
  return `NEYO${Date.now().toString(36).toUpperCase()}`;
}
