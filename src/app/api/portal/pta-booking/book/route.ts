import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError, fail } from "@/lib/api/respond";
import { withTenant } from "@/lib/core/tenant-context";
import { tenantDb } from "@/lib/core/tenant-db";
import { scopeWhere } from "@/lib/services/student.service";
import { bookPtaConsultationSlot } from "@/lib/services/kenyan-extensions.service";

export const dynamic = "force-dynamic";

/**
 * REAL BUG FIX (found while building the missing PTA-booking parent UI):
 * this route previously trusted a client-supplied `guardianId` and
 * `studentId` completely unverified -- neither `requirePermission` nor any
 * ownership check ran, so any authenticated user (in principle even a
 * STUDENT session, since the only earlier guard was `getCurrentUser()`)
 * could book a PTA slot as ANY guardian for ANY student by simply passing
 * different IDs in the request body. Fixed to require `portal.parent`
 * (same permission the rest of the parent portal already requires) and to
 * derive both the real Guardian row and the real owned-child check from
 * the session itself -- the exact same `scopeWhere`-based pattern already
 * used by every other real parent-portal endpoint in this codebase
 * (see src/lib/services/parent-portal.service.ts's `assertOwnChild`).
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("portal.parent");

    const body = await req.json().catch(() => ({}));
    const { slotId, studentId, bookedTopic } = body;
    if (!slotId || !studentId) {
      return handleError(new Error("slotId and studentId required."));
    }

    return await withTenant(user.tenantId, async () => {
      const guardian = await tenantDb().guardian.findFirst({ where: { userId: user.id }, select: { id: true } });
      if (!guardian) return fail("NOT_FOUND", "No guardian profile is linked to your account.", 404);

      const scope = await scopeWhere(user);
      const child = await tenantDb().student.findFirst({ where: { AND: [{ id: studentId, deletedAt: null }, scope] }, select: { id: true } });
      if (!child) return fail("NOT_FOUND", "Student not found, or is not linked to your account.", 404);

      const booked = await bookPtaConsultationSlot(user.tenantId, slotId, guardian.id, child.id, bookedTopic || "Academic Progress Review");
      return ok({ slot: booked });
    });
  } catch (err) {
    return handleError(err);
  }
}
