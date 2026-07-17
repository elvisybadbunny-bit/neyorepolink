import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { bookPtaConsultationSlot } from "@/lib/services/kenyan-extensions.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));

    const body = await req.json().catch(() => ({}));
    const { slotId, guardianId, studentId, bookedTopic } = body;
    if (!slotId || !guardianId || !studentId) {
      return handleError(new Error("slotId, guardianId, and studentId required."));
    }

    const booked = await bookPtaConsultationSlot(user.tenantId, slotId, guardianId, studentId, bookedTopic || "Academic Progress Review");
    return ok({ slot: booked });
  } catch (err) {
    return handleError(err);
  }
}
