import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/api/respond";
import { getActiveOrUpcomingMaintenanceWindow } from "@/lib/services/maintenance.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const window = await getActiveOrUpcomingMaintenanceWindow();
    return ok({ window });
  } catch (err) {
    return handleError(err);
  }
}
