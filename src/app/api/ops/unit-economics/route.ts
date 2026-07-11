/**
 * U.2 — A Genuine Unit-Economics Dashboard.
 * GET ?view=summary -> real company-wide MRR/CAC/LTV.
 * GET ?view=schools -> real per-school revenue/SMS-margin/estimated-cost.
 * GET ?view=cost-snapshots -> real manual cost-snapshot history.
 * POST { action: "upsert_cost_snapshot" | "delete_cost_snapshot" }.
 */
import { NextRequest } from "next/server";
import { requireUser } from "@/lib/core/session";
import { ok, fail, handleError } from "@/lib/api/respond";
import {
  companyUnitEconomicsSummary,
  perSchoolUnitEconomics,
  listCostSnapshots,
  upsertCostSnapshot,
  deleteCostSnapshot,
} from "@/lib/services/unit-economics.service";
import { neyoCostSnapshotSchema } from "@/lib/validations/unit-economics";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const view = new URL(req.url).searchParams.get("view") || "summary";

    if (view === "schools") return ok(await perSchoolUnitEconomics(user));
    if (view === "cost-snapshots") return ok({ snapshots: await listCostSnapshots(user) });
    return ok(await companyUnitEconomicsSummary(user));
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();

    if (body?.action === "upsert_cost_snapshot") {
      const input = neyoCostSnapshotSchema.parse(body);
      return ok(await upsertCostSnapshot(user, input));
    }
    if (body?.action === "delete_cost_snapshot") {
      const id = String(body?.id || "");
      if (!id) return fail("VALIDATION_ERROR", "id is required.", 422);
      return ok(await deleteCostSnapshot(user, id));
    }

    return fail("VALIDATION_ERROR", "Unknown action.", 422);
  } catch (e) {
    return handleError(e);
  }
}
