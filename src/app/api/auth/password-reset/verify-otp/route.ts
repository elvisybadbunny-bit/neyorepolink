import { NextRequest } from "next/server";
import { hash as argonHash } from "@node-rs/argon2";
import { ok, handleError } from "@/lib/api/respond";
import { db } from "@/lib/db";
import { SESSION_COOKIE, SESSION_TTL_DAYS } from "@/lib/core/session";
import { createSessionToken } from "@/lib/services/auth.service";

export const dynamic = "force-dynamic";

/** POST /api/auth/password-reset/verify-otp — body: { phoneOrEmail, otpCode, newPassword } */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { phoneOrEmail, otpCode, newPassword } = body;
    if (!phoneOrEmail || !otpCode || !newPassword) {
      return handleError(new Error("Please provide your account identifier, OTP code, and new password."));
    }
    if (String(newPassword).length < 8) {
      return handleError(new Error("New password must be at least 8 characters long."));
    }

    const queryStr = String(phoneOrEmail).trim();
    const user = await db.user.findFirst({
      where: {
        OR: [
          { phone: queryStr },
          { email: queryStr },
          { customNeyoEmail: queryStr },
          { neyoLoginId: queryStr.toUpperCase() },
        ],
      },
    });

    if (!user || !user.recoveryOtpCode || user.recoveryOtpCode !== String(otpCode).trim()) {
      return handleError(new Error("Invalid or expired recovery code. Check SMS or request a new code."));
    }

    if (user.recoveryOtpExpiresAt && user.recoveryOtpExpiresAt < new Date()) {
      return handleError(new Error("This recovery code has expired. Please request a new code."));
    }

    const passwordHash = await argonHash(String(newPassword));
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        recoveryOtpCode: null,
        recoveryOtpExpiresAt: null,
        hasSetInitialPassword: true,
      },
    });

    // Create session and log the user right in
    const token = await createSessionToken(user.id, {
      userAgent: req.headers.get("user-agent") ?? undefined,
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? undefined,
    });

    const res = ok({
      user: { id: user.id, fullName: user.fullName, role: user.role },
      message: "Password reset and account unlocked!",
    });

    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
    });

    return res;
  } catch (err) {
    return handleError(err);
  }
}
