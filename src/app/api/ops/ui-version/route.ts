import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/core/session";
import { getGlobalUiVersion, setGlobalUiVersion } from "@/lib/services/ui-version.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const version = await getGlobalUiVersion();
    return NextResponse.json({ ok: true, version });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed" }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const result = await setGlobalUiVersion(user, body.version);
    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed" }, { status: 400 });
  }
}
