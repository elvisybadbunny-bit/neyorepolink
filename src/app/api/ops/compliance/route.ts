/**
 * U.3 — Compliance queue (NEYO-Ops-wide). Reachable by FOUNDER + accounts
 * granted "neyo.metrics_view".
 * GET ?status=PENDING -> list real export/deletion requests across every
 * real school (never a mock).
 * POST { action: "resolve", id, status, resolutionNote } -> real resolution.
 */
import { NextRequest } from "next/server";
import { requireUser } from "@/lib/core/session";
import { ok, fail, handleError } from "@/lib/api/respond";
import { listComplianceRequests, resolveComplianceRequest } from "@/lib/services/founder-dashboard.service";
import { resolveComplianceRequestSchema } from "@/lib/validations/founder-dashboard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const url = new URL(req.url);
    const status = url.searchParams.get("status") as any;
    const kind = url.searchParams.get("kind") as any;
    return ok({ requests: await listComplianceRequests(user, { status: status || "ALL", kind: kind || undefined }) });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();

    if (body?.action === "resolve") {
      const input = resolveComplianceRequestSchema.parse(body);
      return ok(await resolveComplianceRequest(user, input));
    }

    return fail("VALIDATION_ERROR", "Unknown action.", 422);
  } catch (e) {
    return handleError(e);
  }
}
