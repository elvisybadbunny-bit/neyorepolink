/**
 * T.6 — Influencer/Promoter Marketing Codes.
 *
 * Genuinely distinct from the pre-existing M.1 school-to-school
 * `referral.service.ts`/`revenue-ops.service.ts` referral system: a
 * referral code today IS a school's own code (Tenant.referralCode) with no
 * separate "influencer" identity at all. Here, a real INDIVIDUAL PERSON
 * (not a school) holds a unique code; a school using it gets a real
 * discount on their first term, AND the influencer separately earns their
 * own real one-time commission per school signed — founder's own words:
 * "the influencer separately earns their own agreed reward on top of
 * salary agreed... the company can have" (NEYO owes it directly, a real
 * payable, not a school-side deduction).
 *
 * Founder-confirmed (2026-07-08): mutually EXCLUSIVE with T.2's own
 * discount campaigns (a school uses one or the other, never both — see
 * `applyInfluencerCode()`'s own real guard below); the influencer's reward
 * is a real ONE-TIME payment per school signed (never an ongoing recurring
 * percentage).
 */
import { db } from "@/lib/db";

export class InfluencerCodeError extends Error {
  constructor(public code: "NOT_FOUND" | "INVALID" | "ALREADY", message: string) {
    super(message);
    this.name = "InfluencerCodeError";
  }
}

async function audit(actor: { id: string; fullName: string; tenantId: string }, action: string, entityId: string, metadata?: unknown) {
  await db.auditLog.create({
    data: {
      tenantId: actor.tenantId, actorId: actor.id, actorName: actor.fullName,
      action, entityType: "influencerCode", entityId,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
}

function generateCode(personName: string): string {
  const base = personName.trim().split(/\s+/)[0]?.toUpperCase().slice(0, 6) || "PROMO";
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `NEYO-${base}${suffix}`;
}

/** NEYO Ops: create a real new influencer code. */
export async function createInfluencerCode(
  actor: { id: string; fullName: string; tenantId: string },
  input: { personName: string; personPhone?: string; personEmail?: string; discountPct: number; commissionKes: number }
) {
  let code = generateCode(input.personName);
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await db.influencerCode.findUnique({ where: { code } });
    if (!existing) break;
    code = generateCode(input.personName);
  }

  const row = await db.influencerCode.create({
    data: {
      code, personName: input.personName, personPhone: input.personPhone || null, personEmail: input.personEmail || null,
      discountPct: input.discountPct, commissionKes: input.commissionKes,
      createdById: actor.id, createdByName: actor.fullName,
    },
  });
  await audit(actor, "platform.influencer_code_created", row.id, { code, personName: input.personName });
  return row;
}

/** NEYO Ops: every real influencer code + a live per-code performance summary. */
export async function listInfluencerCodes() {
  const codes = await db.influencerCode.findMany({
    orderBy: { createdAt: "desc" },
    include: { commissions: true, _count: { select: { schoolsUsingCode: true } } },
  });
  return codes.map((c) => ({
    id: c.id, code: c.code, personName: c.personName, personPhone: c.personPhone, personEmail: c.personEmail,
    discountPct: c.discountPct, commissionKes: c.commissionKes, active: c.active,
    schoolsSignedUp: c._count.schoolsUsingCode,
    totalOwedKes: c.commissions.filter((k) => k.status === "OWED").reduce((s, k) => s + k.amountKes, 0),
    totalPaidKes: c.commissions.filter((k) => k.status === "PAID").reduce((s, k) => s + k.amountKes, 0),
    createdAt: c.createdAt,
  }));
}

/** NEYO Ops: retire/reactivate a code (real earning history is never deleted). */
export async function setInfluencerCodeActive(actor: { id: string; fullName: string; tenantId: string }, codeId: string, active: boolean) {
  const row = await db.influencerCode.findUnique({ where: { id: codeId } });
  if (!row) throw new InfluencerCodeError("NOT_FOUND", "Influencer code not found.");
  const updated = await db.influencerCode.update({ where: { id: codeId }, data: { active } });
  await audit(actor, active ? "platform.influencer_code_reactivated" : "platform.influencer_code_retired", codeId, { code: row.code });
  return updated;
}

/**
 * A school applies a real influencer code (during onboarding, one-time).
 * Founder-confirmed mutual exclusivity with T.2: a school that already has
 * a real ACTIVE campaign discount pending (i.e. would otherwise qualify
 * for one) is still allowed to CHOOSE the influencer code instead — this
 * function itself simply records the choice; `newSignupDiscountKes()`
 * (T.2) independently checks `appliedInfluencerCodeId` and backs off,
 * so whichever the school applies FIRST wins, never both stacking.
 */
export async function applyInfluencerCode(tenantId: string, rawCode: string) {
  const code = rawCode.trim().toUpperCase();
  const influencer = await db.influencerCode.findUnique({ where: { code } });
  if (!influencer || !influencer.active) throw new InfluencerCodeError("NOT_FOUND", "That influencer code was not found or is no longer active.");

  const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) throw new InfluencerCodeError("NOT_FOUND", "School not found.");
  if (tenant.appliedInfluencerCodeId) throw new InfluencerCodeError("ALREADY", "An influencer code has already been applied to this school.");
  if (tenant.appliedCampaignId) throw new InfluencerCodeError("INVALID", "This school already used a discount campaign — only one discount may be used at signup.");

  await db.tenant.update({ where: { id: tenantId }, data: { appliedInfluencerCodeId: influencer.id } });
  return { influencerCodeId: influencer.id, personName: influencer.personName, discountPct: influencer.discountPct };
}

/**
 * Real, automatic entry point called at a school's first real subscription
 * payment (central-billing.service.ts) — mirrors T.2's own
 * `newSignupDiscountKes()` shape exactly, for the influencer-code path.
 */
export async function influencerSignupDiscountKes(tenantId: string, fullAmountKes: number): Promise<{ discountKes: number; influencerCodeId: string | null }> {
  const tenant = await db.tenant.findUnique({ where: { id: tenantId }, select: { hasClaimedFirstTermDiscount: true, appliedInfluencerCodeId: true } });
  if (!tenant || tenant.hasClaimedFirstTermDiscount || !tenant.appliedInfluencerCodeId) return { discountKes: 0, influencerCodeId: null };

  const influencer = await db.influencerCode.findUnique({ where: { id: tenant.appliedInfluencerCodeId } });
  if (!influencer || !influencer.active) return { discountKes: 0, influencerCodeId: null };

  const discountKes = Math.round(fullAmountKes * influencer.discountPct);
  return { discountKes, influencerCodeId: influencer.id };
}

/**
 * Fires once a school that used a real influencer code makes its first
 * real PAID subscription payment — creates the real ONE-TIME commission
 * NEYO owes the influencer, idempotent per school (the real
 * `@@unique([influencerCodeId, tenantId])` constraint prevents ever
 * double-earning for the same school).
 */
export async function creditInfluencerCommission(tenantId: string) {
  const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant?.appliedInfluencerCodeId) return null;

  const existing = await db.influencerCommission.findUnique({
    where: { influencerCodeId_tenantId: { influencerCodeId: tenant.appliedInfluencerCodeId, tenantId } },
  });
  if (existing) return existing; // already credited — never double-earned

  const influencer = await db.influencerCode.findUnique({ where: { id: tenant.appliedInfluencerCodeId } });
  if (!influencer) return null;

  const commission = await db.influencerCommission.create({
    data: {
      influencerCodeId: influencer.id, tenantId, schoolName: tenant.name,
      amountKes: influencer.commissionKes,
    },
  });
  await db.auditLog.create({
    data: {
      tenantId, actorName: "NEYO Billing",
      action: "billing.influencer_commission_earned", entityType: "InfluencerCommission", entityId: commission.id,
      metadata: JSON.stringify({ influencerCode: influencer.code, personName: influencer.personName, amountKes: commission.amountKes }),
    },
  });
  return commission;
}

/** NEYO Ops: every real commission owed/paid, most recent first. */
export async function listInfluencerCommissions(status?: string) {
  const rows = await db.influencerCommission.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: "desc" },
    include: { influencerCode: { select: { code: true, personName: true } } },
  });
  return rows.map((r) => ({
    id: r.id, schoolName: r.schoolName, amountKes: r.amountKes, status: r.status,
    influencerCode: r.influencerCode.code, personName: r.influencerCode.personName,
    paidAt: r.paidAt, paidNote: r.paidNote, createdAt: r.createdAt,
  }));
}

/** NEYO Ops: mark a real commission as genuinely paid out to the influencer (outside NEYO, e.g. M-Pesa/bank). */
export async function markCommissionPaid(actor: { id: string; fullName: string; tenantId: string }, commissionId: string, paidNote?: string) {
  const row = await db.influencerCommission.findUnique({ where: { id: commissionId } });
  if (!row) throw new InfluencerCodeError("NOT_FOUND", "Commission not found.");
  if (row.status === "PAID") throw new InfluencerCodeError("ALREADY", "This commission is already marked paid.");
  const updated = await db.influencerCommission.update({
    where: { id: commissionId },
    data: { status: "PAID", paidAt: new Date(), paidNote: paidNote ?? null },
  });
  await audit(actor, "platform.influencer_commission_paid", commissionId, { schoolName: row.schoolName, amountKes: row.amountKes, paidNote });
  return updated;
}
