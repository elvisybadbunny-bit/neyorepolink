import { NextRequest } from "next/server";
import { getCurrentUser, requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { db } from "@/lib/db";
import { createDemoSchool } from "@/lib/services/demo.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    await requirePermission("platform.founder_ops");

    const body = await req.json().catch(() => ({}));
    const { id, action, notes } = body; // action: "approve" | "reject"

    const request = await db.demoRequest.findUnique({ where: { id } });
    if (!request) return handleError(new Error("Demo request not found."));
    if (request.status !== "PENDING") return handleError(new Error(`This request is already ${request.status.toLowerCase()}.`));

    if (action === "reject") {
      const updated = await db.demoRequest.update({
        where: { id },
        data: {
          status: "REJECTED",
          approvedAt: new Date(),
          approvedBy: user.fullName,
          notes: notes || "Rejected by NEYO Ops review.",
        },
      });
      return ok({ request: updated });
    }

    // Approve: spawn the sandboxed demo school right now
    const demoRes = await createDemoSchool({
      userAgent: req.headers.get("user-agent") ?? undefined,
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? undefined,
    });

    const updated = await db.demoRequest.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        approvedBy: user.fullName,
        spawnedTenantId: demoRes.tenantId,
        spawnedTenantSlug: demoRes.tenantSlug,
        notes: notes || `Spawned sandbox: ${demoRes.tenantSlug}. Temporary access sent to the approved lead.`,
      },
    });

    // Send SMS when configured. Return one-time credentials to authorised Ops so failed delivery can be handled securely.
    const { sendSms } = await import("@/lib/notifications/sms");
    const demoUrl = `https://${demoRes.tenantSlug}.neyo.co.ke`;
    let smsDelivered = true;
    await sendSms(
      request.phone,
      `NEYO Ops: Your demo is approved. Open ${demoUrl} and sign in as ${demoRes.ownerEmail} with temporary password ${demoRes.temporaryPassword}. You will be required to replace it on first login.`,
      { prefix: false }
    ).then((result) => { smsDelivered = result.ok; }).catch(() => { smsDelivered = false; });

    await db.auditLog.create({
      data: {
        tenantId: demoRes.tenantId,
        actorId: user.id,
        actorName: user.fullName,
        action: "platform.demo_request_approved_and_spawned",
        entityType: "DemoRequest",
        entityId: updated.id,
        metadata: JSON.stringify({ email: request.email, phone: request.phone, tenantSlug: demoRes.tenantSlug, temporaryPasswordExposed: false }),
      },
    }).catch(() => {});

    return ok({ request: updated, demoRes: { tenantId: demoRes.tenantId, tenantSlug: demoRes.tenantSlug, ownerEmail: demoRes.ownerEmail, demoExpiresAt: demoRes.demoExpiresAt, url: demoUrl, temporaryPassword: demoRes.temporaryPassword, smsDelivered } });
  } catch (err) {
    return handleError(err);
  }
}
