/**
 * U.3 — a school explicitly REQUESTS account/data deletion (never a silent
 * self-service delete — a real, human-reviewed Founder/NEYO Ops decision,
 * per the KE Data Protection Act's own accountability requirement).
 * POST { note? } -> real PENDING ComplianceRequest row, visible to NEYO Ops.
 */
import { NextRequest } from "next/server";
import { requireRole } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { fileComplianceRequest } from "@/lib/services/founder-dashboard.service";
import { createComplianceRequestSchema } from "@/lib/validations/founder-dashboard";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole("SUPER_ADMIN", "SCHOOL_OWNER", "PRINCIPAL");
    const body = await req.json().catch(() => ({}));
    const input = createComplianceRequestSchema.parse({ kind: "DELETE_ACCOUNT", note: body?.note || "" });
    return ok(await fileComplianceRequest(user, input));
  } catch (e) {
    return handleError(e);
  }
}
