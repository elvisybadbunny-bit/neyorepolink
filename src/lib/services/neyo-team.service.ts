/**
 * PART Y.2 — NEYO Team & Access.
 *
 * A real Founder-only page/service to create, suspend, and edit NEYO
 * company accounts. Founder's own words (2026-07-09): "have a founder page
 * for founders account that can give the neyo support and any other neyo
 * role to access but since am alone for now me the founder can access
 * everything in the system." FOUNDER/legacy SUPER_ADMIN are unrestricted by
 * definition (never managed here); NEYO_OPS/NEYO_SUPPORT accounts get a
 * real base-role permission set PLUS individually-grantable extra
 * permissions (founder's own answer: "option 3... you pick permissions
 * individually per account").
 *
 * A NEYO company account is still a real `User` row (so it can log in via
 * the exact same existing session/auth machinery every other account
 * uses), but it is NOT scoped to any one school's real day-to-day tenant
 * data — it belongs to the first real tenant purely for storage, exactly
 * matching the pre-existing SUPER_ADMIN pattern (A.2.9).
 */
import { db } from "@/lib/db";
import { hash as argonHash } from "@node-rs/argon2";
import crypto from "crypto";
import type { SessionUser } from "@/lib/core/session";
import { isFounderTier, ROLE_LABELS, type Role } from "@/lib/core/roles";
import { generateNeyoLoginId } from "@/lib/services/identity.service";
import { PERMISSIONS, ROLE_PERMISSIONS, type Permission } from "@/lib/core/permissions";
import type { CreateNeyoTeamMemberInput, UpdateNeyoTeamMemberInput } from "@/lib/validations/neyo-team";

export class NeyoTeamError extends Error {
  constructor(public code: "NOT_FOUND" | "FORBIDDEN" | "INVALID" | "DUPLICATE", message: string) {
    super(message);
    this.name = "NeyoTeamError";
  }
}

function assertFounder(actor: SessionUser) {
  if (!isFounderTier(actor.role)) {
    throw new NeyoTeamError("FORBIDDEN", "Only the NEYO Founder can manage NEYO team accounts.");
  }
}

function generateTempPassword(): string {
  // A real, genuinely random one-time password shown ONCE to the founder to
  // relay to the new team member — never emailed/SMS'd in plaintext,
  // matching the project's own "never send real secrets over an
  // unencrypted channel" discipline elsewhere (e.g. company secrets vault).
  const raw = crypto.randomBytes(9).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
  return `Neyo${raw}!1`;
}

export async function listNeyoTeamMembers() {
  const users = await db.user.findMany({
    where: { role: { in: ["FOUNDER", "NEYO_OPS", "NEYO_SUPPORT", "SUPER_ADMIN"] } },
    select: {
      id: true, fullName: true, email: true, phone: true, role: true, isActive: true, lastLoginAt: true, createdAt: true, neyoLoginId: true,
      neyoTeamMember: { select: { extraPermissionsJson: true, note: true, active: true, invitedByName: true, createdAt: true, updatedAt: true } },
    },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });
  return users.map((u) => {
    const extra: string[] = u.neyoTeamMember?.extraPermissionsJson ? JSON.parse(u.neyoTeamMember.extraPermissionsJson) : [];
    const basePermissions = isFounderTier(u.role as Role) ? [...PERMISSIONS] : (ROLE_PERMISSIONS[u.role as Role] ?? []);
    return {
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      role: u.role,
      roleLabel: ROLE_LABELS[u.role as Role] ?? u.role,
      neyoLoginId: u.neyoLoginId,
      isFounderTier: isFounderTier(u.role as Role),
      isActive: u.isActive && (u.neyoTeamMember?.active ?? true),
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
      note: u.neyoTeamMember?.note ?? null,
      invitedByName: u.neyoTeamMember?.invitedByName ?? null,
      basePermissions,
      extraPermissions: extra,
      effectivePermissions: Array.from(new Set([...basePermissions, ...extra])).sort(),
    };
  });
}

export async function createNeyoTeamMember(actor: SessionUser, input: CreateNeyoTeamMemberInput) {
  assertFounder(actor);

  const existingEmail = await db.user.findFirst({ where: { email: input.email } });
  if (existingEmail) throw new NeyoTeamError("DUPLICATE", "A real NEYO account already uses that email.");

  const founderTenant = await db.tenant.findFirstOrThrow({ orderBy: { createdAt: "asc" } });
  const neyoLoginId = await generateNeyoLoginId();
  const tempPassword = generateTempPassword();
  const passwordHash = await argonHash(tempPassword);

  const created = await db.user.create({
    data: {
      tenantId: founderTenant.id,
      neyoLoginId,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      role: input.role,
      passwordHash,
      isActive: true,
    },
  });

  const validExtra = input.extraPermissions.filter((p): p is Permission => (PERMISSIONS as readonly string[]).includes(p));
  await db.neyoTeamMember.create({
    data: {
      userId: created.id,
      extraPermissionsJson: JSON.stringify(validExtra),
      note: input.note || null,
      active: true,
      invitedById: actor.id,
      invitedByName: actor.fullName,
    },
  });

  await db.auditLog.create({
    data: {
      tenantId: actor.tenantId, actorId: actor.id, actorName: actor.fullName,
      action: "neyo_team.created", entityType: "User", entityId: created.id,
      metadata: JSON.stringify({ role: input.role, email: input.email, extraPermissions: validExtra }),
    },
  });

  return { user: created, neyoLoginId, tempPassword };
}

export async function updateNeyoTeamMember(actor: SessionUser, input: UpdateNeyoTeamMemberInput) {
  assertFounder(actor);

  const target = await db.user.findUnique({ where: { id: input.userId }, include: { neyoTeamMember: true } });
  if (!target) throw new NeyoTeamError("NOT_FOUND", "That NEYO team account was not found.");
  if (isFounderTier(target.role as Role)) {
    throw new NeyoTeamError("FORBIDDEN", "The Founder account cannot be edited from this page.");
  }

  const dataUser: { role?: string } = {};
  if (input.role) dataUser.role = input.role;
  if (Object.keys(dataUser).length > 0) {
    await db.user.update({ where: { id: target.id }, data: dataUser });
  }

  const validExtra = input.extraPermissions
    ? input.extraPermissions.filter((p): p is Permission => (PERMISSIONS as readonly string[]).includes(p))
    : undefined;

  await db.neyoTeamMember.upsert({
    where: { userId: target.id },
    create: {
      userId: target.id,
      extraPermissionsJson: JSON.stringify(validExtra ?? []),
      note: input.note ?? null,
      active: input.active ?? true,
      invitedById: actor.id,
      invitedByName: actor.fullName,
    },
    update: {
      ...(validExtra !== undefined ? { extraPermissionsJson: JSON.stringify(validExtra) } : {}),
      ...(input.note !== undefined ? { note: input.note || null } : {}),
      ...(input.active !== undefined ? { active: input.active } : {}),
    },
  });

  // A real, instant off-switch: suspending here also flips the underlying
  // User.isActive so every OTHER real login path (OTP, magic link, passkey)
  // is blocked too, not just permission checks.
  if (input.active !== undefined) {
    await db.user.update({ where: { id: target.id }, data: { isActive: input.active } });
  }

  await db.auditLog.create({
    data: {
      tenantId: actor.tenantId, actorId: actor.id, actorName: actor.fullName,
      action: "neyo_team.updated", entityType: "User", entityId: target.id,
      metadata: JSON.stringify({ role: input.role, active: input.active, extraPermissions: validExtra }),
    },
  });

  return listNeyoTeamMembers();
}

export async function resetNeyoTeamMemberPassword(actor: SessionUser, userId: string) {
  assertFounder(actor);
  const target = await db.user.findUnique({ where: { id: userId } });
  if (!target) throw new NeyoTeamError("NOT_FOUND", "That NEYO team account was not found.");
  if (isFounderTier(target.role as Role)) {
    throw new NeyoTeamError("FORBIDDEN", "The Founder account's password is changed from Settings → Security, not here.");
  }
  const tempPassword = generateTempPassword();
  const passwordHash = await argonHash(tempPassword);
  await db.user.update({ where: { id: target.id }, data: { passwordHash } });
  await db.auditLog.create({
    data: { tenantId: actor.tenantId, actorId: actor.id, actorName: actor.fullName, action: "neyo_team.password_reset", entityType: "User", entityId: target.id },
  });
  return { tempPassword };
}

export async function deleteNeyoTeamMember(actor: SessionUser, userId: string) {
  assertFounder(actor);
  const target = await db.user.findUnique({ where: { id: userId } });
  if (!target) throw new NeyoTeamError("NOT_FOUND", "That NEYO team account was not found.");
  if (isFounderTier(target.role as Role)) {
    throw new NeyoTeamError("FORBIDDEN", "The Founder account cannot be deleted from this page.");
  }
  await db.user.delete({ where: { id: target.id } });
  await db.auditLog.create({
    data: { tenantId: actor.tenantId, actorId: actor.id, actorName: actor.fullName, action: "neyo_team.deleted", entityType: "User", entityId: userId, metadata: JSON.stringify({ email: target.email, role: target.role }) },
  });
  return { deleted: true };
}

/** All real, grantable permissions with a short human label, grouped for the UI. */
export function listGrantablePermissions() {
  return [...PERMISSIONS];
}
