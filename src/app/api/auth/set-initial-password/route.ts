import { NextRequest } from "next/server";
import { hash as argonHash } from "@node-rs/argon2";
import { getCurrentUser } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** POST /api/auth/set-initial-password — body: { newPassword } */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("You must be logged in to set your initial password."));

    const { newPassword } = await req.json().catch(() => ({}));
    if (!newPassword || String(newPassword).length < 8) {
      return handleError(new Error("Password must be at least 8 characters long."));
    }

    const passwordHash = await argonHash(String(newPassword));
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        hasSetInitialPassword: true,
      },
    });

    await db.auditLog.create({
      data: {
        tenantId: user.tenantId,
        actorId: user.id,
        actorName: user.fullName,
        action: "auth.initial_password_set",
        entityType: "User",
        entityId: user.id,
      },
    }).catch(() => {});

    return ok({ message: "Secure password created successfully!" });
  } catch (err) {
    return handleError(err);
  }
}
