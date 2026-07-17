import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { checkCasBlobExists } from "@/lib/services/storage-cas.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return handleError(new Error("Unauthorized"));

    const { sha256 } = await req.json().catch(() => ({}));
    if (!sha256) return ok({ exists: false });

    const match = await checkCasBlobExists(sha256);
    if (!match) return ok({ exists: false });

    return ok({
      exists: true,
      url: match.storageUrl,
      sizeBytes: match.sizeBytes,
      compressionRatioPct: match.compressionRatioPct,
      referenceCount: match.referenceCount,
    });
  } catch (err) {
    return handleError(err);
  }
}
