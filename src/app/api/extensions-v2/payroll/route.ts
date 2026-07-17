import { NextResponse } from "next/server";
import { requireUser } from "@/lib/core/session";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import { runBomPayroll, listBomPayrolls } from "@/lib/services/extensions-v2.service";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    await assertEeFeatureReleased("EE.16");

    const { searchParams } = new URL(request.url);
    const payPeriod = searchParams.get("payPeriod") ?? undefined;

    const data = await listBomPayrolls(user, payPeriod);
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed" }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    await assertEeFeatureReleased("EE.16");

    const body = await request.json();
    const data = await runBomPayroll(user, body);
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed" }, { status: 400 });
  }
}
