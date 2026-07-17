import { NextResponse } from "next/server";
import { requireUser } from "@/lib/core/session";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import { addCapitalAsset, addLabReagent, listCapitalAssetsAndReagents } from "@/lib/services/extensions-v2.service";

export async function GET() {
  try {
    const user = await requireUser();
    await assertEeFeatureReleased("EE.23");

    const data = await listCapitalAssetsAndReagents(user);
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed" }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    await assertEeFeatureReleased("EE.23");

    const body = await request.json();
    let data;
    if (body.type === "REAGENT") {
      data = await addLabReagent(user, body);
    } else {
      data = await addCapitalAsset(user, body);
    }
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed" }, { status: 400 });
  }
}
