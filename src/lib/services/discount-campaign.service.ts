/**
 * T.2 — NEYO-Ops-Configured Discount Campaigns.
 *
 * Founder's own words: "for new users it automatically uses the company
 * rules and their discount is applied accordingly" (a) — an automatic
 * `NEW_SIGNUPS` rule that self-applies with zero manual step per school —
 * and "10% off all plans for the whole of December"-style (b) —
 * `ALL_ACTIVE_SCHOOLS` — for a defined period.
 *
 * Founder-confirmed (2026-07-08): only ONE real campaign may ever be
 * ACTIVE platform-wide at a time (enforced here, not just a UI nicety); a
 * NEW_SIGNUPS discount is a real ONE-TIME reduction on a school's FIRST
 * subscription payment only — the price reverts to full from the second
 * billing cycle onward, mirroring exactly how the pre-existing M.1
 * referral-credit system already treats a referred school's reward.
 *
 * Genuinely distinct from BOTH pre-existing mechanisms audited before this
 * build: M.1's `ReferralCredit` (a fixed 5%, tied to a referral CODE, never
 * a time-boxed platform rule) and J.23's `feature-grants.service.ts` (a
 * free PREMIUM FEATURE for one named school, never a % off the base price).
 */
import { db } from "@/lib/db";

export class DiscountCampaignError extends Error {
  constructor(public code: "NOT_FOUND" | "INVALID" | "ALREADY", message: string) {
    super(message);
    this.name = "DiscountCampaignError";
  }
}

async function audit(actor: { id: string; fullName: string; tenantId: string }, action: string, entityId: string, metadata?: unknown) {
  await db.auditLog.create({
    data: {
      tenantId: actor.tenantId, actorId: actor.id, actorName: actor.fullName,
      action, entityType: "discountCampaign", entityId,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
}

/** NEYO Ops: every real campaign, most recent first. */
export async function listDiscountCampaigns() {
  return db.discountCampaign.findMany({ orderBy: { createdAt: "desc" } });
}

/** The real, currently ACTIVE campaign (genuinely date-inside-window), if any — never more than one. */
export async function currentActiveCampaign(appliesTo?: "NEW_SIGNUPS" | "ALL_ACTIVE_SCHOOLS") {
  const now = new Date();
  const campaigns = await db.discountCampaign.findMany({
    where: { active: true, startDate: { lte: now }, endDate: { gte: now }, ...(appliesTo ? { appliesTo } : {}) },
    orderBy: { createdAt: "desc" },
  });
  return campaigns.find((campaign) => campaign.maxRedemptions == null || campaign.redemptionCount < campaign.maxRedemptions) ?? null;
}

/**
 * NEYO Ops creates a real new campaign. Founder-confirmed: only ONE real
 * campaign may ever be genuinely ACTIVE (date-window-overlapping) platform-
 * wide at a time — creating a second one that would overlap an already-
 * active real campaign's date window is honestly rejected, never silently
 * layered.
 */
export async function createDiscountCampaign(
  actor: { id: string; fullName: string; tenantId: string },
  input: { name: string; appliesTo: "NEW_SIGNUPS" | "ALL_ACTIVE_SCHOOLS"; percentOff: number; code?: string; maxRedemptions?: number | null; freeMonths?: number; startDate: string; endDate: string }
) {
  const start = new Date(input.startDate);
  const end = new Date(input.endDate);

  const overlapping = await db.discountCampaign.findFirst({
    where: {
      active: true,
      OR: [
        { startDate: { lte: end }, endDate: { gte: start } },
      ],
    },
  });
  if (overlapping) {
    throw new DiscountCampaignError(
      "ALREADY",
      `Only one campaign may be active at a time — "${overlapping.name}" already covers an overlapping real date window. End it first.`
    );
  }

  const campaign = await db.discountCampaign.create({
    data: {
      name: input.name, appliesTo: input.appliesTo,
      percentOff: input.freeMonths === 1 ? 1 : input.percentOff,
      code: input.code?.trim().toUpperCase() || null,
      maxRedemptions: input.maxRedemptions ?? null,
      freeMonths: input.freeMonths ?? 0,
      startDate: start, endDate: end,
      createdById: actor.id, createdByName: actor.fullName,
    },
  });
  await audit(actor, "platform.discount_campaign_created", campaign.id, input);
  return campaign;
}

/** NEYO Ops ends a campaign early (never deletes its real history). */
export async function endDiscountCampaign(actor: { id: string; fullName: string; tenantId: string }, campaignId: string) {
  const campaign = await db.discountCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign) throw new DiscountCampaignError("NOT_FOUND", "Campaign not found.");
  if (!campaign.active) throw new DiscountCampaignError("INVALID", "This campaign is already ended.");
  const updated = await db.discountCampaign.update({ where: { id: campaignId }, data: { active: false } });
  await audit(actor, "platform.discount_campaign_ended", campaignId, { name: campaign.name });
  return updated;
}

/**
 * Real, automatic entry point called at a NEW school's first real
 * subscription-payment moment (central-billing.service.ts). Returns the
 * real KES amount to deduct from the full price — 0 if no real ACTIVE
 * NEW_SIGNUPS campaign currently covers today's date, or if this school
 * already used an influencer code instead (T.6's own mutual-exclusivity
 * rule — a school gets ONE OR THE OTHER, never both).
 */
export async function newSignupDiscountKes(tenantId: string, fullAmountKes: number): Promise<{ discountKes: number; campaignId: string | null }> {
  const tenant = await db.tenant.findUnique({ where: { id: tenantId }, select: { hasClaimedFirstTermDiscount: true, appliedInfluencerCodeId: true } });
  if (!tenant || tenant.hasClaimedFirstTermDiscount) return { discountKes: 0, campaignId: null };
  if (tenant.appliedInfluencerCodeId) return { discountKes: 0, campaignId: null }; // T.6 mutual exclusivity

  const campaign = await currentActiveCampaign("NEW_SIGNUPS");
  if (!campaign) return { discountKes: 0, campaignId: null };

  const discountKes = Math.round(fullAmountKes * campaign.percentOff);
  return { discountKes, campaignId: campaign.id };
}

/**
 * Real, automatic entry point for the SECOND real use-case: a real
 * ALL_ACTIVE_SCHOOLS campaign discounts EVERY real currently-subscribed
 * school's real NEXT renewal that falls inside the campaign's real date
 * window — founder-confirmed this applies at the school's own real next
 * renewal, never a forced immediate re-bill of every school the moment the
 * campaign starts.
 */
export async function allSchoolsDiscountKes(fullAmountKes: number): Promise<{ discountKes: number; campaignId: string | null }> {
  const campaign = await currentActiveCampaign("ALL_ACTIVE_SCHOOLS");
  if (!campaign) return { discountKes: 0, campaignId: null };
  const discountKes = Math.round(fullAmountKes * campaign.percentOff);
  return { discountKes, campaignId: campaign.id };
}

/**
 * Marks a school's one-time NEW_SIGNUPS discount as genuinely claimed —
 * called once the discounted first payment is confirmed PAID, mirroring
 * `hasClaimedReferral`'s exact real idempotency pattern.
 */
export async function markFirstTermDiscountClaimed(tenantId: string, campaignId: string, discountKes: number) {
  await db.$transaction(async (tx) => {
    const tenant = await tx.tenant.findUnique({ where: { id: tenantId }, select: { hasClaimedFirstTermDiscount: true, appliedInfluencerCodeId: true } });
    if (!tenant || tenant.hasClaimedFirstTermDiscount || tenant.appliedInfluencerCodeId) return;
    const campaign = await tx.discountCampaign.findUnique({ where: { id: campaignId } });
    if (!campaign || !campaign.active) return;
    const claimed = await tx.discountCampaign.updateMany({
      where: { id: campaignId, ...(campaign.maxRedemptions == null ? {} : { redemptionCount: { lt: campaign.maxRedemptions } }) },
      data: { redemptionCount: { increment: 1 } },
    });
    if (claimed.count !== 1) throw new DiscountCampaignError("INVALID", "This promotion has reached its school limit.");
    await tx.tenant.update({
      where: { id: tenantId },
      data: { hasClaimedFirstTermDiscount: true, appliedCampaignId: campaignId, firstTermDiscountKes: discountKes },
    });
  });
}
