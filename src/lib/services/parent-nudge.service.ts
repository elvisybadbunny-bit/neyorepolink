/**
 * T.11b — "Never logged in" parent SMS nudge campaign.
 *
 * Real, genuinely new capability (confirmed nothing like it existed before
 * this session — no existing job/report identified parents who have never
 * once logged into NEYO). Built on the real T.11b User.lastLoginAt column
 * (stamped by every real login path — see auth.service.ts, magic-link,
 * totp, passkey). A PARENT with lastLoginAt still null has genuinely NEVER
 * logged in for real, ever — an honest, precise signal, not an estimate.
 *
 * Founder-confirmed trigger: MANUAL, not automatic — a bursar/principal
 * sees a real live count and clicks a button to send nudges on their own
 * schedule, never a background cron running unattended.
 */
import { db } from "@/lib/db";
import { withTenant } from "@/lib/core/tenant-context";
import { tenantDb } from "@/lib/core/tenant-db";
import type { SessionUser } from "@/lib/core/session";

export class ParentNudgeError extends Error {
  constructor(public code: "QUOTA" | "EMPTY", message: string) {
    super(message);
    this.name = "ParentNudgeError";
  }
}

/** Real, live count + list of parents who have NEVER logged in. */
export async function neverLoggedInParents(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const parents = await tenantDb().user.findMany({
      where: { role: "PARENT", isActive: true, lastLoginAt: null, phone: { not: null } },
      select: { id: true, fullName: true, phone: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    return {
      count: parents.length,
      parents: parents.map((p) => ({ id: p.id, fullName: p.fullName, phone: p.phone, accountCreatedAt: p.createdAt })),
    };
  });
}

/**
 * Real, manually-triggered SMS nudge to every parent who has never logged
 * in (optionally capped to a smaller real batch via `limit`, so a bursar
 * can test with a few before sending to everyone).
 */
export async function sendNeverLoggedInNudge(user: SessionUser, limit?: number) {
  return withTenant(user.tenantId, async () => {
    const { parents } = await neverLoggedInParents(user);
    const batch = limit ? parents.slice(0, limit) : parents;
    if (batch.length === 0) throw new ParentNudgeError("EMPTY", "No parents currently match — everyone with a phone number has logged in at least once.");

    const { checkSmsQuota, recordUsage } = await import("@/lib/services/limits.service");
    const quota = await checkSmsQuota(user.tenantId, batch.length);
    if (!quota.allowed) throw new ParentNudgeError("QUOTA", quota.message ?? "SMS quota exceeded for this term.");

    const tenant = await db.tenant.findUniqueOrThrow({ where: { id: user.tenantId }, select: { name: true } });
    const { sendSms } = await import("@/lib/notifications/sms");
    let sent = 0; let skipped = 0;

    for (const parent of batch) {
      if (!parent.phone) { skipped++; continue; }
      try {
        await sendSms(
          parent.phone,
          `${tenant.name}: Your NEYO parent account is ready — log in to check fees, attendance and results for your child(ren). Ask the school office if you need help signing in.`
        );
        sent++;
      } catch { skipped++; }
    }

    if (sent > 0) {
      await recordUsage(user.tenantId, "smsPerTerm", sent);
      await db.auditLog.create({
        data: {
          tenantId: user.tenantId, actorId: user.id, actorName: user.fullName,
          action: "parent.never_logged_in_nudge_sent", entityType: "tenant", entityId: user.tenantId,
          metadata: JSON.stringify({ sent, skipped, requested: batch.length }),
        },
      });
    }

    return { sent, skipped, total: batch.length };
  });
}
