/**
 * T.3 — School-Requested Custom Feature Pipeline.
 *
 * Founder's own words: "have a flag area for custom fees and the team
 * should tell the school about the cost that will be incurred per period
 * when their feature is launched to them and neyo when they feel like can
 * launch the whole to the whole neyo ecosystem or those who request the
 * same can get their features being delivered in the same route."
 *
 * This is deliberately a thin, real, auditable request/quote/deliver
 * pipeline — it does NOT invent a new per-feature PlatformFlag mechanism.
 * Once NEYO Ops actually builds a requested feature, delivering it to the
 * ONE school that asked (and paid) reuses the existing, already-real J.23
 * `feature-grants.service.ts` (`setFeatureGrant()`) — the exact same "give
 * access to just this school" mechanism NEYO already has, never a
 * duplicate. `deliveredFeatureKey` records WHICH real grant key was used,
 * so a later, unrelated school asking for "the same thing" can be
 * recognised by NEYO Ops and delivered instantly via the same existing key
 * (no re-build, no re-quote) — "the same route" the founder asked for.
 * `releaseCustomFeatureToAll()` is NEYO's own separate, later, explicit
 * decision to make a delivered one-off available to literally every real
 * school platform-wide (the founder's "launch the whole to the whole neyo
 * ecosystem") — this NEVER happens automatically as a side effect of a
 * single delivery.
 */
import { db } from "@/lib/db";
import { withTenant } from "@/lib/core/tenant-context";
import { tenantDb } from "@/lib/core/tenant-db";
import type { SessionUser } from "@/lib/core/session";

export class CustomFeatureRequestError extends Error {
  constructor(public code: "NOT_FOUND" | "STATE" | "INVALID", message: string) {
    super(message);
    this.name = "CustomFeatureRequestError";
  }
}

async function audit(actor: { id: string; fullName: string; tenantId: string }, action: string, entityId: string, metadata?: unknown) {
  await db.auditLog.create({
    data: {
      tenantId: actor.tenantId, actorId: actor.id, actorName: actor.fullName,
      action, entityType: "customFeatureRequest", entityId,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
}

/** A school describes a real bespoke feature they want. */
export async function createCustomFeatureRequest(user: SessionUser, input: { title: string; description: string }) {
  return withTenant(user.tenantId, async () => {
    const row = await db.customFeatureRequest.create({
      data: {
        tenantId: user.tenantId, title: input.title, description: input.description,
        requestedById: user.id, requestedByName: user.fullName,
      },
    });
    await audit(user, "custom_feature.requested", row.id, { title: input.title });

    // Notify NEYO's real company accounts (FOUNDER/legacy SUPER_ADMIN, plus
    // any real NEYO_OPS/NEYO_SUPPORT staff who handle these — Y.2) that a
    // new real request needs review.
    try {
      const { notify } = await import("@/lib/services/notification.service");
      const ops = await db.user.findMany({ where: { role: { in: ["FOUNDER", "SUPER_ADMIN", "NEYO_OPS", "NEYO_SUPPORT"] }, isActive: true }, select: { id: true, tenantId: true } });
      for (const o of ops) {
        await notify({
          tenantId: o.tenantId, recipientId: o.id,
          title: "New custom feature request",
          body: `${user.fullName} (a real school) requested: "${input.title}"`,
          category: "system", href: "/founder",
        });
      }
    } catch { /* best-effort */ }

    return row;
  });
}

/** A school's own real requests, row-scoped to their tenant. */
export async function listMyCustomFeatureRequests(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const rows = await tenantDb().customFeatureRequest.findMany({ orderBy: { createdAt: "desc" } });
    return rows;
  });
}

/** The school's own real response to a QUOTED request — accept or decline the quote. */
export async function replyToCustomFeatureQuote(user: SessionUser, requestId: string, input: { approve: boolean; schoolReply?: string }) {
  return withTenant(user.tenantId, async () => {
    const req = await tenantDb().customFeatureRequest.findUnique({ where: { id: requestId } });
    if (!req) throw new CustomFeatureRequestError("NOT_FOUND", "Request not found.");
    if (req.status !== "QUOTED") throw new CustomFeatureRequestError("STATE", "This request isn't awaiting your decision on a quote.");

    const row = await tenantDb().customFeatureRequest.update({
      where: { id: requestId },
      data: input.approve
        ? { status: "APPROVED", schoolReply: input.schoolReply ?? null }
        : { status: "DECLINED", schoolReply: input.schoolReply ?? null, declineReason: input.schoolReply ?? "School declined the quote." },
    });
    await audit(user, input.approve ? "custom_feature.quote_accepted" : "custom_feature.quote_declined", requestId, { schoolReply: input.schoolReply });
    return row;
  });
}

// ---------------------------------------------------------------------------
// NEYO Ops (SUPER_ADMIN) — real cross-tenant review/quote/deliver pipeline.
// ---------------------------------------------------------------------------

/** NEYO Ops: every real request across every real school. */
export async function listAllCustomFeatureRequests(status?: string) {
  const rows = await db.customFeatureRequest.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: "desc" },
    include: { tenant: { select: { name: true } } },
  });
  return rows.map((r) => ({
    id: r.id, tenantId: r.tenantId, schoolName: r.tenant.name,
    title: r.title, description: r.description,
    requestedByName: r.requestedByName, status: r.status,
    quotedPriceKes: r.quotedPriceKes, quotedBillingCycle: r.quotedBillingCycle,
    opsNote: r.opsNote, schoolReply: r.schoolReply, declineReason: r.declineReason,
    deliveredFeatureKey: r.deliveredFeatureKey, deliveredAt: r.deliveredAt,
    releasedToAllSchools: r.releasedToAllSchools, releasedAt: r.releasedAt,
    decidedByName: r.decidedByName, decidedAt: r.decidedAt, createdAt: r.createdAt,
  }));
}

/**
 * NEYO Ops moves a request through its real lifecycle. Recognises a
 * request for something ALREADY delivered elsewhere (same `deliveredFeatureKey`
 * previously used for a different school) so Ops can grant it to this new
 * school immediately without a fresh quote/build cycle — the founder's own
 * "same route" requirement.
 */
export async function updateCustomFeatureRequest(
  actor: { id: string; fullName: string; tenantId: string },
  requestId: string,
  input: { status: "REVIEWING" | "QUOTED" | "APPROVED" | "IN_PROGRESS" | "DELIVERED" | "DECLINED"; quotedPriceKes?: number; quotedBillingCycle?: string; opsNote?: string; declineReason?: string; deliveredFeatureKey?: string }
) {
  const req = await db.customFeatureRequest.findUnique({ where: { id: requestId } });
  if (!req) throw new CustomFeatureRequestError("NOT_FOUND", "Request not found.");

  const data: Record<string, unknown> = {
    status: input.status,
    decidedById: actor.id, decidedByName: actor.fullName, decidedAt: new Date(),
  };
  if (input.opsNote !== undefined) data.opsNote = input.opsNote;
  if (input.status === "QUOTED") {
    data.quotedPriceKes = input.quotedPriceKes;
    data.quotedBillingCycle = input.quotedBillingCycle;
  }
  if (input.status === "DECLINED") {
    data.declineReason = input.declineReason;
  }
  if (input.status === "DELIVERED") {
    if (!input.deliveredFeatureKey) throw new CustomFeatureRequestError("INVALID", "The real feature-grant key used to deliver this is required.");
    data.deliveredFeatureKey = input.deliveredFeatureKey;
    data.deliveredAt = new Date();

    // Deliver by reusing the REAL, existing J.23 grant mechanism — never a
    // bespoke new flag. This is the ONLY place a custom feature request
    // ever actually touches a school's real entitlements. `allowCustomKey`
    // lets a genuinely new one-off feature key be granted even though it
    // isn't part of the curated REVENUE_FEATURE_KEYS catalog.
    const { setFeatureGrant } = await import("@/lib/services/feature-grants.service");
    await setFeatureGrant(actor, req.tenantId, input.deliveredFeatureKey, true, `Custom feature delivery: ${req.title}`, true);
  }

  const row = await db.customFeatureRequest.update({ where: { id: requestId }, data });
  await audit(actor, `custom_feature.${input.status.toLowerCase()}`, requestId, { status: input.status, quotedPriceKes: input.quotedPriceKes, deliveredFeatureKey: input.deliveredFeatureKey });

  // Notify the requesting school of the real status change.
  try {
    const { notify } = await import("@/lib/services/notification.service");
    const requester = await db.user.findUnique({ where: { id: req.requestedById } });
    if (requester) {
      const bodies: Record<string, string> = {
        REVIEWING: `NEYO is reviewing your request: "${req.title}".`,
        QUOTED: `Your request "${req.title}" has been quoted at KES ${input.quotedPriceKes?.toLocaleString("en-KE")} per ${(input.quotedBillingCycle ?? "period").toLowerCase()}. Review it in Settings.`,
        APPROVED: `Your request "${req.title}" was approved and will be built.`,
        IN_PROGRESS: `Work has started on your request: "${req.title}".`,
        DELIVERED: `Your requested feature "${req.title}" is now live on your account.`,
        DECLINED: `Your request "${req.title}" was declined: ${input.declineReason ?? ""}`,
      };
      await notify({
        tenantId: req.tenantId, recipientId: requester.id,
        title: "Custom feature request update", body: bodies[input.status] ?? `Status updated: ${input.status}`,
        category: "system", href: "/settings",
      });
    }
  } catch { /* best-effort */ }

  return row;
}

/**
 * NEYO's own later, explicit, platform-wide decision — genuinely make a
 * delivered custom feature available to EVERY real school, not just the
 * one(s) that originally requested and paid for it. Requires the request
 * to already be DELIVERED (a real feature key must exist to release).
 */
export async function releaseCustomFeatureToAllSchools(actor: { id: string; fullName: string; tenantId: string }, requestId: string) {
  const req = await db.customFeatureRequest.findUnique({ where: { id: requestId } });
  if (!req) throw new CustomFeatureRequestError("NOT_FOUND", "Request not found.");
  if (req.status !== "DELIVERED" || !req.deliveredFeatureKey) {
    throw new CustomFeatureRequestError("STATE", "Only a DELIVERED request with a real feature key can be released platform-wide.");
  }
  if (req.releasedToAllSchools) throw new CustomFeatureRequestError("STATE", "This has already been released to every school.");

  // Genuinely grant the real feature key to EVERY real tenant — not just a
  // flag flip. Reuses the same real grant mechanism as a single-school
  // delivery, just applied to the whole real tenant list at once.
  const { setFeatureGrant } = await import("@/lib/services/feature-grants.service");
  const allTenants = await db.tenant.findMany({ select: { id: true } });
  for (const t of allTenants) {
    await setFeatureGrant(actor, t.id, req.deliveredFeatureKey, true, `Platform-wide release: ${req.title}`, true);
  }

  const row = await db.customFeatureRequest.update({
    where: { id: requestId },
    data: { releasedToAllSchools: true, releasedAt: new Date() },
  });
  await audit(actor, "custom_feature.released_to_all_schools", requestId, { deliveredFeatureKey: req.deliveredFeatureKey, schoolCount: allTenants.length });
  return row;
}
