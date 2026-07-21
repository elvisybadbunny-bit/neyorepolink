import { requirePermission } from "@/lib/core/session";
import { fail, handleError, ok } from "@/lib/api/respond";
import {
  getReportPresentationSetting,
  saveReportPresentationSetting,
} from "@/lib/services/report-presentation.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requirePermission("academics.view");
    return ok(await getReportPresentationSetting(user.tenantId));
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requirePermission("academics.manage");
    const body = await request.json();
    if (typeof body.showFeesOnReport !== "boolean")
      return fail("INVALID", "Fee visibility must be true or false.", 400);
    return ok(await saveReportPresentationSetting(user.tenantId, body));
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Choose"))
      return fail("INVALID", error.message, 400);
    return handleError(error);
  }
}
