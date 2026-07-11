import { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/core/session";
import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api/respond";

export const dynamic = "force-dynamic";

const schema = z.object({ enabled: z.boolean() });

/**
 * Z.1 — GET/POST the current user's real Bundle Saver preference.
 * Defaults to `true` (auto-on) per the founder's own explicit choice this
 * session: "every school gets a background best-effort save... no toggle
 * needed" — the user can still turn it off, mirroring the exact same
 * per-user preference pattern already used for popup-style/lg-contrast.
 */
export async function GET() {
  try {
    const user = await requireUser();
    const row = await db.user.findUnique({ where: { id: user.id }, select: { bundleSaverEnabled: true } });
    return ok({ enabled: row?.bundleSaverEnabled ?? true });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { enabled } = schema.parse(await req.json().catch(() => ({})));
    await db.user.update({ where: { id: user.id }, data: { bundleSaverEnabled: enabled } });
    return ok({ enabled });
  } catch (err) {
    return handleError(err);
  }
}
