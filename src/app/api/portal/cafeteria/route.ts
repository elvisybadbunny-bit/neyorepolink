/**
 * T.9 (founder-requested) — real parent-portal cafeteria enrollment/cancel
 * requests. A school must have explicitly opted in via
 * Tenant.allowParentCafeteriaRequests (enforced server-side inside the real
 * service call, never just hidden in the UI). Mirrors T.8's transport
 * route-change-request portal route exactly.
 */
import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { createCafeteriaEnrollmentRequestSchema } from "@/lib/validations/cafeteria";
import {
  createCafeteriaEnrollmentRequest,
  parentCafeteriaRequests,
  cafeteriaEnrollmentPolicy,
} from "@/lib/services/cafeteria.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission("portal.parent");
    if (req.nextUrl.searchParams.get("view") === "policy") {
      return ok(await cafeteriaEnrollmentPolicy(user));
    }
    return ok({ requests: await parentCafeteriaRequests(user) });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("portal.parent");
    const input = createCafeteriaEnrollmentRequestSchema.parse(await req.json().catch(() => ({})));
    return ok(await createCafeteriaEnrollmentRequest(user, input), 201);
  } catch (e) {
    return handleError(e);
  }
}
