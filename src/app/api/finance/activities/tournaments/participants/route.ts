import { NextRequest } from "next/server";
import { getCurrentUser, requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { addTournamentParticipant, updateParentConsentStatus } from "@/lib/services/kenyan-extensions.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    requirePermission(user as any, "finance.record_payment");

    const body = await req.json().catch(() => ({}));
    const { action, tripId, studentId, busSeatNo, parentConsentStatus } = body;
    if (!tripId || !studentId) return handleError(new Error("tripId and studentId required."));

    if (action === "consent") {
      const updated = await updateParentConsentStatus(user.tenantId, tripId, studentId, parentConsentStatus || "CONSENTED");
      return ok({ participant: updated });
    }

    const added = await addTournamentParticipant(user.tenantId, tripId, { studentId, busSeatNo }, user);
    return ok({ participant: added });
  } catch (err) {
    return handleError(err);
  }
}
