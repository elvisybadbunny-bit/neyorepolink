import { db } from "@/lib/db";
import { withTenant } from "@/lib/core/tenant-context";
import { tenantDb } from "@/lib/core/tenant-db";
import type { SessionUser } from "@/lib/core/session";
import { destroyAllSessionsForUser } from "@/lib/services/auth.service";
import {
  analyseTeacherTransferImpact,
  applyTeacherTransferReplacement,
} from "@/lib/services/l7-teacher-transfer-impact.service";

export class StaffLifecycleError extends Error {
  constructor(public code: "FORBIDDEN" | "NOT_FOUND" | "INVALID", message: string) {
    super(message);
    this.name = "StaffLifecycleError";
  }
}

const SCHOOL_STAFF_ROLES = new Set([
  "SCHOOL_OWNER", "PRINCIPAL", "DEPUTY_PRINCIPAL", "DEAN_OF_STUDIES", "HOD",
  "TEACHER", "CLASS_TEACHER", "BURSAR", "ACCOUNTANT", "RECEPTIONIST",
  "LIBRARIAN", "HOSTEL_MASTER", "SUPPORT_STAFF",
]);

async function targetStaff(user: SessionUser, userId: string) {
  const target = await tenantDb().user.findUnique({
    where: { id: userId },
    select: { id: true, fullName: true, role: true, isActive: true },
  });
  if (!target || !SCHOOL_STAFF_ROLES.has(target.role)) {
    throw new StaffLifecycleError("NOT_FOUND", "Staff member not found in this school.");
  }
  if (target.id === user.id) {
    throw new StaffLifecycleError("FORBIDDEN", "You cannot change your own staff access from this workflow.");
  }
  return target;
}

async function audit(user: SessionUser, action: string, targetId: string, metadata: unknown) {
  await db.auditLog.create({
    data: {
      tenantId: user.tenantId,
      actorId: user.id,
      actorName: user.fullName,
      action,
      entityType: "staffAccess",
      entityId: targetId,
      metadata: JSON.stringify(metadata),
    },
  });
}

export async function changeStaffAccess(
  user: SessionUser,
  input: { userId: string; action: "DEACTIVATE" | "REACTIVATE"; reason: string },
) {
  return withTenant(user.tenantId, async () => {
    const target = await targetStaff(user, input.userId);
    if (input.reason.trim().length < 3) throw new StaffLifecycleError("INVALID", "Give a short reason for the audit trail.");
    const activating = input.action === "REACTIVATE";
    if (target.isActive === activating) {
      throw new StaffLifecycleError("INVALID", activating ? "This staff account is already active." : "This staff account is already inactive.");
    }
    await tenantDb().user.update({ where: { id: target.id }, data: { isActive: activating } });
    const sessionsRevoked = activating ? 0 : await destroyAllSessionsForUser(target.id);
    if (activating) {
      await db.staffProfile.updateMany({ where: { tenantId: user.tenantId, userId: target.id }, data: { contractEndDate: null } });
    }
    await audit(user, activating ? "staff.reactivated" : "staff.deactivated", target.id, {
      targetName: target.fullName, reason: input.reason, sessionsRevoked,
    });
    return { userId: target.id, fullName: target.fullName, isActive: activating, sessionsRevoked };
  });
}

export async function previewStaffTransfer(user: SessionUser, userId: string, reason: string) {
  return withTenant(user.tenantId, async () => {
    await targetStaff(user, userId);
    if (reason.trim().length < 3) throw new StaffLifecycleError("INVALID", "Give a short reason before analysing assignments.");
    return analyseTeacherTransferImpact(user, userId, reason);
  });
}

export async function applyStaffTransfer(
  user: SessionUser,
  input: { impactId: string; replacementTeacherId?: string; terminate: boolean; reason: string },
) {
  return withTenant(user.tenantId, async () => {
    const impact = await tenantDb().teacherTransferImpact.findUnique({ where: { id: input.impactId } });
    if (!impact) throw new StaffLifecycleError("NOT_FOUND", "Assignment impact analysis not found.");
    const target = await targetStaff(user, impact.teacherId);
    const result = await applyTeacherTransferReplacement(
      user,
      impact.id,
      input.replacementTeacherId,
      { deactivateDeparting: input.terminate },
    );
    let sessionsRevoked = 0;
    if (input.terminate) {
      sessionsRevoked = await destroyAllSessionsForUser(target.id);
      const today = new Date(Date.now() + 3 * 3600_000).toISOString().slice(0, 10);
      await db.staffProfile.updateMany({ where: { tenantId: user.tenantId, userId: target.id }, data: { contractEndDate: today } });
    }
    await audit(user, input.terminate ? "staff.terminated" : "staff.assignments_transferred", target.id, {
      targetName: target.fullName,
      replacementTeacherId: input.replacementTeacherId ?? null,
      reason: input.reason,
      sessionsRevoked,
      impactId: impact.id,
      timetableJobId: result.timetableJob.id,
    });
    return { ...result, userId: target.id, isActive: input.terminate ? false : target.isActive, sessionsRevoked };
  });
}
