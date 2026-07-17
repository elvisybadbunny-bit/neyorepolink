/**
 * EE.8 — POST /api/academics/question-bank/seed-all
 * Idempotently populates our entire Junior School (`Grade 7-9`), Primary School (`Grade 1-6`),
 * and Senior School (`Grade 10`) Question Bank across every core and pathway learning area!
 */

import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { seedAllQuestionBanks } from "@/lib/services/question-bank.service";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("academics.manage");
    await assertEeFeatureReleased("EE.8");

    const seeded = await seedAllQuestionBanks(user);
    return ok(seeded);
  } catch (e) {
    return handleError(e);
  }
}
