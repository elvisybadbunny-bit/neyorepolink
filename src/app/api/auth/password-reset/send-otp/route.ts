import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/api/respond";
import { db } from "@/lib/db";
import { enforceRate, clientIp } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

/** POST /api/auth/password-reset/send-otp — body: { phoneOrEmail } */
export async function POST(req: NextRequest) {
  try {
    enforceRate(`pwd-reset:${clientIp(req)}`, 5, 600);
    const body = await req.json().catch(() => ({}));
    const { phoneOrEmail } = body;
    if (!phoneOrEmail) return handleError(new Error("Please enter your phone number or NEYO email."));

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

    if (!user) {
      // Return success shape anyway to prevent account enumeration
      return ok({ message: "If that account exists, a 6-digit verification code has been dispatched via SMS." });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60_000); // 15 mins

    await db.user.update({
      where: { id: user.id },
      data: { recoveryOtpCode: otpCode, recoveryOtpExpiresAt: expiresAt },
    });

    if (user.phone) {
      const { sendSms } = await import("@/lib/notifications/sms");
      await sendSms(user.phone, `NEYO Security: Your password recovery code is ${otpCode}. Never share this with anyone. Valid for 15 minutes.`).catch(() => {});
    }

    return ok({
      message: "6-digit verification code dispatched via SMS.",
      ...(process.env.NODE_ENV !== "production" ? { devCode: otpCode } : {}),
    });
  } catch (err) {
    return handleError(err);
  }
}
