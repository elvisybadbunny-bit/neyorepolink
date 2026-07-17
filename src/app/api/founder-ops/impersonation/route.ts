import { NextRequest } from "next/server";
import { getCurrentUser, requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { createImpersonationToken, stopImpersonationSession } from "@/lib/services/support-impersonation.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));
    requirePermission(user as any, "platform.founder_ops");

    const body = await req.json().catch(() => ({}));
    const { action, targetTenantId, targetUserId, reason, token } = body;

    if (action === "stop") {
      if (token) await stopImpersonationSession(token, user);
      const res = ok({ message: "Diagnostic session closed." });
      res.cookies.delete("NEYO_DIAGNOSTIC_TOKEN");
      return res;
    }

    if (!targetTenantId || !targetUserId || !reason) {
      return handleError(new Error("Target tenant, target user, and diagnostic reason are required."));
    }

    const impToken = await createImpersonationToken(user, targetTenantId, targetUserId, reason);
    const res = ok({ token: impToken.token, expiresAt: impToken.expiresAt, message: "Read-only diagnostic session started." });
    res.cookies.set("NEYO_DIAGNOSTIC_TOKEN", impToken.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60, // 15 mins
    });
    return res;
  } catch (err) {
    return handleError(err);
  }
}
