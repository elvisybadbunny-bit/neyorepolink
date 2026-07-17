import { NextResponse } from "next/server";
import { requireUser } from "@/lib/core/session";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import { createMasterDiaryEvent, listMasterDiaryEvents } from "@/lib/services/extensions-v2.service";

export async function GET() {
  try {
    const user = await requireUser();
    await assertEeFeatureReleased("EE.27");

    const data = await listMasterDiaryEvents(user);
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed" }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    await assertEeFeatureReleased("EE.27");

    const body = await request.json();
    const data = await createMasterDiaryEvent(user, body);
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed" }, { status: 400 });
  }
}
