import { NextResponse } from "next/server";
import { requireUser } from "@/lib/core/session";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import { recordSchoolFarmYield, listSchoolFarmLedger } from "@/lib/services/extensions-v2.service";

export async function GET() {
  try {
    const user = await requireUser();
    await assertEeFeatureReleased("EE.21");

    const data = await listSchoolFarmLedger(user);
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed" }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    await assertEeFeatureReleased("EE.21");

    const body = await request.json();
    const data = await recordSchoolFarmYield(user, body);
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed" }, { status: 400 });
  }
}
