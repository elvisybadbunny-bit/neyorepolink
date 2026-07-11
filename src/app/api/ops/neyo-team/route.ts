/**
 * Y.2 — NEYO Team & Access. Founder-only.
 * GET  -> every real NEYO company account + its effective permissions.
 * POST { action: "create" | "update" | "reset_password" | "delete" }
 */
import { NextRequest } from "next/server";
import { requireRole } from "@/lib/core/session";
import { ok, fail, handleError } from "@/lib/api/respond";
import {
  listNeyoTeamMembers,
  createNeyoTeamMember,
  updateNeyoTeamMember,
  resetNeyoTeamMemberPassword,
  deleteNeyoTeamMember,
  listGrantablePermissions,
} from "@/lib/services/neyo-team.service";
import {
  createNeyoTeamMemberSchema,
  updateNeyoTeamMemberSchema,
  resetNeyoTeamMemberPasswordSchema,
} from "@/lib/validations/neyo-team";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireRole("SUPER_ADMIN"); // FOUNDER equivalence handled centrally in requireRole()
    const [members, grantablePermissions] = await Promise.all([
      listNeyoTeamMembers(),
      Promise.resolve(listGrantablePermissions()),
    ]);
    return ok({ members, grantablePermissions });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole("SUPER_ADMIN");
    const body = await req.json();

    if (body?.action === "create") {
      const input = createNeyoTeamMemberSchema.parse(body);
      const result = await createNeyoTeamMember(user, input);
      return ok(result, 201);
    }
    if (body?.action === "update") {
      const input = updateNeyoTeamMemberSchema.parse(body);
      return ok({ members: await updateNeyoTeamMember(user, input) });
    }
    if (body?.action === "reset_password") {
      const input = resetNeyoTeamMemberPasswordSchema.parse(body);
      return ok(await resetNeyoTeamMemberPassword(user, input.userId));
    }
    if (body?.action === "delete") {
      const userId = String(body?.userId || "");
      if (!userId) return fail("VALIDATION_ERROR", "userId is required.", 422);
      return ok(await deleteNeyoTeamMember(user, userId));
    }

    return fail("VALIDATION_ERROR", "Unknown action.", 422);
  } catch (e) {
    return handleError(e);
  }
}
