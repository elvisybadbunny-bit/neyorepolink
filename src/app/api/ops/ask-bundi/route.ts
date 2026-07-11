/**
 * U.3 — "Ask Bundi" (Founder AI). Internal-only, NEVER customer-facing.
 * Reachable by FOUNDER + "neyo.metrics_view" accounts.
 * GET  -> recent question/answer history (real context always included).
 * POST { question } -> real context assembled + real, honestly-gated
 * provider call (NOT_CONFIGURED until a real key exists — never fabricated).
 * GET ?config=1 -> provider config (Founder-tier only, since it's a
 * sensitive company-secret-adjacent setting).
 */
import { NextRequest } from "next/server";
import { requireUser, requireRole } from "@/lib/core/session";
import { ok, fail, handleError } from "@/lib/api/respond";
import {
  askFounderAi,
  listFounderAiHistory,
  getFounderAiProviderConfig,
  saveFounderAiProviderConfig,
} from "@/lib/services/founder-dashboard.service";
import { askFounderAiSchema, founderAiProviderConfigSchema } from "@/lib/validations/founder-dashboard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    if (url.searchParams.get("config") === "1") {
      await requireRole("SUPER_ADMIN"); // FOUNDER equivalence handled centrally
      return ok({ config: await getFounderAiProviderConfig() });
    }
    const user = await requireUser();
    return ok({ history: await listFounderAiHistory(user) });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body?.action === "save_config") {
      const actor = await requireRole("SUPER_ADMIN");
      const parsed = founderAiProviderConfigSchema.parse(body.config);
      return ok({ config: await saveFounderAiProviderConfig(parsed, actor) });
    }

    const user = await requireUser();
    const input = askFounderAiSchema.parse(body);
    return ok(await askFounderAi(user, input.question));
  } catch (e) {
    return handleError(e);
  }
}
