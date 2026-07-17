import { NextResponse } from "next/server";
import { requireUser } from "@/lib/core/session";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import { logCampusDisciplineIncident, recordCounselingSession, listDisciplineAndCounseling } from "@/lib/services/extensions-v2.service";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    await assertEeFeatureReleased("EE.18");

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId") ?? undefined;

    const data = await listDisciplineAndCounseling(user, studentId);
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed" }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    await assertEeFeatureReleased("EE.18");

    const body = await request.json();
    let data;
    if (body.type === "COUNSELING") {
      data = await recordCounselingSession(user, body);
    } else {
      data = await logCampusDisciplineIncident(user, body);
    }
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed" }, { status: 400 });
  }
}
