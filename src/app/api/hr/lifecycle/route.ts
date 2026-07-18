import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { applyStaffTransfer, changeStaffAccess, previewStaffTransfer } from "@/lib/services/staff-lifecycle.service";

export const dynamic = "force-dynamic";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("DEACTIVATE"), userId: z.string().min(1), reason: z.string().trim().min(3).max(300) }),
  z.object({ action: z.literal("REACTIVATE"), userId: z.string().min(1), reason: z.string().trim().min(3).max(300) }),
  z.object({ action: z.literal("PREVIEW_TRANSFER"), userId: z.string().min(1), reason: z.string().trim().min(3).max(300) }),
  z.object({
    action: z.literal("APPLY_TRANSFER"), impactId: z.string().min(1),
    replacementTeacherId: z.string().optional(), terminate: z.boolean(),
    reason: z.string().trim().min(3).max(300),
  }),
]);

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("user.manage_roles");
    const input = schema.parse(await req.json().catch(() => ({})));
    if (input.action === "DEACTIVATE" || input.action === "REACTIVATE") {
      return ok(await changeStaffAccess(user, input));
    }
    if (input.action === "PREVIEW_TRANSFER") {
      return ok(await previewStaffTransfer(user, input.userId, input.reason));
    }
    return ok(await applyStaffTransfer(user, input));
  } catch (error) {
    return handleError(error);
  }
}
