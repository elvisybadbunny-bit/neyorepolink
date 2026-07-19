import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/core/session";
import { savePaymentCredentials, getPaymentConfigStatus } from "@/lib/services/payment.service";
import { ok, handleError } from "@/lib/api/respond";

export const dynamic = "force-dynamic";

const schema = z.object({
  connectionMode: z.enum(["STK_PAYBILL", "STK_TILL", "PAYBILL_ONLY", "MANUAL"]),
  shortcode: z.string().trim().default(""),
  environment: z.enum(["sandbox", "production"]).default("sandbox"),
  consumerKey: z.string().trim().optional(),
  consumerSecret: z.string().trim().optional(),
  passkey: z.string().trim().optional(),
  accountReferenceFormat: z.string().trim().max(120).optional(),
}).superRefine((value, ctx) => {
  const usesStk = value.connectionMode === "STK_PAYBILL" || value.connectionMode === "STK_TILL";
  const needsShortcode = usesStk || value.connectionMode === "PAYBILL_ONLY";
  if (needsShortcode && value.shortcode.length < 4) {
    ctx.addIssue({ code: "custom", path: ["shortcode"], message: "Enter the school’s Paybill or Till number" });
  }
  if (usesStk) {
    for (const [field, message] of [
      ["consumerKey", "Consumer key is required for STK Push"],
      ["consumerSecret", "Consumer secret is required for STK Push"],
      ["passkey", "Online Passkey is required for STK Push"],
    ] as const) {
      if (!value[field]) ctx.addIssue({ code: "custom", path: [field], message });
    }
  }
});

export async function GET() {
  try {
    const user = await requirePermission("tenant.manage_settings");
    return ok(await getPaymentConfigStatus(user.tenantId));
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("tenant.manage_settings");
    const input = schema.parse(await req.json().catch(() => ({})));
    await savePaymentCredentials(user.tenantId, input);
    return ok(await getPaymentConfigStatus(user.tenantId));
  } catch (err) {
    return handleError(err);
  }
}
