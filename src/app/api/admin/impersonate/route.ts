import { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionContext, effectivePermissionsForUser } from "@/lib/core/session";
import { startImpersonation } from "@/lib/services/impersonation.service";
import { ok, fail, handleError } from "@/lib/api/respond";
import { isFounderTier } from "@/lib/core/roles";

export const dynamic = "force-dynamic";

const schema = z.object({ targetUserId: z.string().min(1, "Missing target user") });

/**
 * POST /api/admin/impersonate — body: { targetUserId }.
 * Y.2: FOUNDER/legacy SUPER_ADMIN always allowed (unrestricted). A
 * NEYO_OPS/NEYO_SUPPORT account is allowed ONLY if individually granted the
 * real "neyo.impersonate" permission via `NeyoTeamMember` — a genuinely
 * sensitive, audit-logged capability the founder's own answers said should
 * default to OFF for support/ops staff.
 */
export async function POST(req: NextRequest) {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return fail("UNAUTHENTICATED", "You must be signed in.", 401);
    if (ctx.isImpersonating) {
      return fail("ALREADY_IMPERSONATING", "Stop the current session first.", 409);
    }
    if (!isFounderTier(ctx.user.role)) {
      const effective = await effectivePermissionsForUser(ctx.user);
      if (!effective.includes("neyo.impersonate")) {
        return fail("FORBIDDEN", "Only NEYO admins can impersonate.", 403);
      }
    }

    const { targetUserId } = schema.parse(await req.json().catch(() => ({})));
    const result = await startImpersonation(ctx.token, ctx.user.id, targetUserId);
    return ok(result);
  } catch (err) {
    return handleError(err);
  }
}
