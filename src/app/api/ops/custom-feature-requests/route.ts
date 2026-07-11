/**
 * T.3 — NEYO Ops (SUPER_ADMIN) custom feature request pipeline.
 * GET  ?status= -> every real request across every real school.
 * POST { action: "update" | "releaseToAll" }
 */
import { NextRequest } from "next/server";
import { requireRole } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { updateCustomFeatureRequestSchema, releaseCustomFeatureToAllSchema } from "@/lib/validations/custom-feature-request";
import { listAllCustomFeatureRequests, updateCustomFeatureRequest, releaseCustomFeatureToAllSchools } from "@/lib/services/custom-feature-request.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireRole("SUPER_ADMIN");
    const status = req.nextUrl.searchParams.get("status") ?? undefined;
    return ok({ requests: await listAllCustomFeatureRequests(status) });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole("SUPER_ADMIN");
    const body = await req.json();

    if (body?.action === "releaseToAll") {
      const input = releaseCustomFeatureToAllSchema.parse(body);
      return ok(await releaseCustomFeatureToAllSchools(user, input.requestId));
    }

    const input = updateCustomFeatureRequestSchema.parse(body);
    return ok(await updateCustomFeatureRequest(user, body.requestId, input));
  } catch (e) {
    return handleError(e);
  }
}
