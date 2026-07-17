import { NextResponse } from "next/server";
import { requireUser } from "@/lib/core/session";
import { assertEeFeatureReleased } from "@/lib/services/platform-flags.service";
import { issueKitchenStoreRequisition, createSupplierLpo, listKitchenStoreData } from "@/lib/services/extensions-v2.service";

export async function GET() {
  try {
    const user = await requireUser();
    await assertEeFeatureReleased("EE.19");

    const data = await listKitchenStoreData(user);
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed" }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    await assertEeFeatureReleased("EE.19");

    const body = await request.json();
    let data;
    if (body.type === "LPO") {
      data = await createSupplierLpo(user, body);
    } else {
      data = await issueKitchenStoreRequisition(user, body);
    }
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed" }, { status: 400 });
  }
}
