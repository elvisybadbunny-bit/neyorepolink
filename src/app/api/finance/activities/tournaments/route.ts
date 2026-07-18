import { NextRequest } from "next/server";
import { getCurrentUser, requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { createSchoolTournamentTrip, listTournamentTrips } from "@/lib/services/kenyan-extensions.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    await requirePermission("finance.view");

    const trips = await listTournamentTrips(user.tenantId);
    return ok({ trips });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    await requirePermission("finance.record_payment");

    const body = await req.json().catch(() => ({}));
    const { title, venue, eventDate, transportRouteId, perDiemKes } = body;
    if (!title || !venue || !eventDate) {
      return handleError(new Error("title, venue, and eventDate required."));
    }

    const trip = await createSchoolTournamentTrip(user.tenantId, { title, venue, eventDate, transportRouteId, perDiemKes: Number(perDiemKes || 0) }, user);
    return ok({ trip });
  } catch (err) {
    return handleError(err);
  }
}
