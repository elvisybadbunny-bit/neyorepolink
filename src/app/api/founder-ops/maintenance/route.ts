import { NextRequest } from "next/server";
import { getCurrentUser, requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { createMaintenanceWindow, listAllMaintenanceWindows, updateMaintenanceStatus } from "@/lib/services/maintenance.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    requirePermission(user as any, "platform.founder_ops");

    const windows = await listAllMaintenanceWindows();
    return ok({ windows });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    requirePermission(user as any, "platform.founder_ops");

    const body = await req.json().catch(() => ({}));
    const { action, id, status, title, description, scheduledStartAt, scheduledEndAt, isReadOnlyLock } = body;

    if (action === "update_status" && id && status) {
      const updated = await updateMaintenanceStatus(id, status, user);
      return ok({ window: updated });
    }

    if (!title || !description || !scheduledStartAt || !scheduledEndAt) {
      return handleError(new Error("Title, description, start time, and end time are required."));
    }

    const created = await createMaintenanceWindow(user, {
      title,
      description,
      scheduledStartAt: new Date(scheduledStartAt),
      scheduledEndAt: new Date(scheduledEndAt),
      isReadOnlyLock: isReadOnlyLock ?? true,
    });
    return ok({ window: created });
  } catch (err) {
    return handleError(err);
  }
}
