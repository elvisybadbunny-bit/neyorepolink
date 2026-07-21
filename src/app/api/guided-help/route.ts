import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission, requireUser } from "@/lib/core/session";
import { handleError, ok } from "@/lib/api/respond";
import { contextualGuides, listGuidedHelpVideos, saveGuidedHelpVideo } from "@/lib/services/guided-help.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const mode = req.nextUrl.searchParams.get("mode");
    if (mode === "manage") {
      await requirePermission("platform.founder_ops");
      return ok({ guides: await listGuidedHelpVideos() });
    }
    const pathname = z.string().startsWith("/").max(240).parse(req.nextUrl.searchParams.get("pathname") || "/dashboard");
    const actionKey = req.nextUrl.searchParams.get("actionKey") || undefined;
    return ok({ guides: await contextualGuides(user, pathname, actionKey) });
  } catch (error) { return handleError(error); }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("platform.founder_ops");
    const body = await req.json();
    return ok({ guide: await saveGuidedHelpVideo(user, body) });
  } catch (error) { return handleError(error); }
}
