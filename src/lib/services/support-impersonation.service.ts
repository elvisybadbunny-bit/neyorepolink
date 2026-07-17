import crypto from "crypto";
import { db } from "@/lib/db";
import { type SessionUser } from "@/lib/core/session";
import { isFounderTier } from "@/lib/core/roles";

/**
 * Idea 1.3 — Audit-Safe Diagnostic View-As Session Replay.
 * Mints 15-minute read-only diagnostic tokens and logs every action/view.
 */

export class ImpersonationError extends Error {
  constructor(public code: "FORBIDDEN" | "EXPIRED" | "NOT_FOUND", message: string) {
    super(message);
    this.name = "ImpersonationError";
  }
}

export async function createImpersonationToken(
  actor: SessionUser,
  targetTenantId: string,
  targetUserId: string,
  reason: string
) {
  if (!isFounderTier(actor.role) && actor.role !== "SUPER_ADMIN" && actor.role !== "NEYO_OPS") {
    throw new ImpersonationError("FORBIDDEN", "Only authorized NEYO Ops and Founder tier can initiate diagnostic sessions.");
  }
  if (!reason || reason.trim().length < 10) {
    throw new ImpersonationError("FORBIDDEN", "Statutory diagnostic reason (min 10 chars) is required for audit compliance.");
  }

  const token = crypto.randomBytes(32).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60_000); // exactly 15 mins

  const row = await db.supportImpersonationToken.create({
    data: {
      token,
      targetTenantId,
      targetUserId,
      createdById: actor.id,
      createdByName: actor.fullName,
      reason: reason.trim(),
      isReadOnly: true,
      expiresAt,
    },
  });

  await db.auditLog.create({
    data: {
      tenantId: targetTenantId,
      actorId: actor.id,
      actorName: actor.fullName,
      action: "support.diagnostic_impersonation_started",
      entityType: "SupportImpersonationToken",
      entityId: row.id,
      metadata: JSON.stringify({ targetUserId, reason: row.reason, expiresAt }),
    },
  }).catch(() => {});

  return row;
}

export async function resolveImpersonationToken(token: string) {
  const row = await db.supportImpersonationToken.findUnique({ where: { token } });
  if (!row) throw new ImpersonationError("NOT_FOUND", "Diagnostic token not found.");
  if (row.revokedAt || row.expiresAt < new Date()) {
    throw new ImpersonationError("EXPIRED", "Diagnostic session has expired or been revoked.");
  }
  return row;
}

export async function logImpersonationAction(
  tokenId: string,
  targetTenantId: string,
  targetUserId: string,
  action: string,
  path: string,
  metadata: Record<string, unknown> = {}
) {
  return db.supportImpersonationLog.create({
    data: {
      tokenId,
      targetTenantId,
      targetUserId,
      action,
      path,
      metadataJson: JSON.stringify(metadata),
    },
  }).catch(() => null);
}

export async function stopImpersonationSession(token: string, actor: SessionUser) {
  const row = await db.supportImpersonationToken.findUnique({ where: { token } });
  if (!row) return null;

  const updated = await db.supportImpersonationToken.update({
    where: { id: row.id },
    data: { revokedAt: new Date() },
  });

  await db.auditLog.create({
    data: {
      tenantId: row.targetTenantId,
      actorId: actor.id,
      actorName: actor.fullName,
      action: "support.diagnostic_impersonation_stopped",
      entityType: "SupportImpersonationToken",
      entityId: row.id,
    },
  }).catch(() => {});

  return updated;
}
