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
        notes: notes || `Spawned sandbox: ${demoRes.tenantSlug} (${demoRes.ownerEmail} / Demo2026!)`,
      },
    });

    // Send an automated SMS and Email notification (or simulated notification in dev)
    const [{ sendSms }, { createInApp }] = await Promise.all([
      import("@/lib/notifications/sms"),
      import("@/lib/services/notification.service"),
    ]);

    await sendSms(
      request.phone,
      `NEYO Ops: Your interactive demo sandbox is approved and ready! Login at https://${demoRes.tenantSlug}.neyo.co.ke using email: ${demoRes.ownerEmail} and password: Demo2026!`
    ).catch(() => {});

    await db.auditLog.create({
      data: {
        tenantId: demoRes.tenantId,
        actorId: user.id,
        actorName: user.fullName,
        action: "platform.demo_request_approved_and_spawned",
        entityType: "DemoRequest",
        entityId: updated.id,
        metadata: JSON.stringify({ email: request.email, phone: request.phone, tenantSlug: demoRes.tenantSlug }),
      },
    }).catch(() => {});

    return ok({ request: updated, demoRes });
  } catch (err) {
    return handleError(err);
  }
}
