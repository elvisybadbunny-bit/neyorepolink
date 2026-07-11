/**
 * T.1 — printable A4 sheet of per-copy QR labels for one book (plain grid,
 * cut with scissors; each label = QR + book title + copy number as text).
 * GET -> application/pdf. Permission: library.manage (this is a staff
 * printing tool, not a family-facing document).
 */
import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/core/session";
import { handleError, fail } from "@/lib/api/respond";
import { withTenant } from "@/lib/core/tenant-context";
import { tenantDb } from "@/lib/core/tenant-db";
import { buildLibraryLabelsPdf } from "@/lib/services/document.service";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { bookId: string } }) {
  try {
    const user = await requirePermission("library.manage");
    const { book, copies } = await withTenant(user.tenantId, async () => {
      const b = await tenantDb().libraryBook.findUnique({ where: { id: params.bookId } });
      const c = await tenantDb().libraryBookCopy.findMany({ where: { bookId: params.bookId }, orderBy: { copyNo: "asc" } });
      return { book: b, copies: c };
    });
    if (!book) return fail("NOT_FOUND", "Book not found.", 404);
    if (copies.length === 0) return fail("NO_COPIES", "This book has no per-copy codes yet — generate them first.", 422);

    const { pdf, fileName } = await buildLibraryLabelsPdf(
      user.tenantId,
      copies.map((c) => ({ copyNo: c.copyNo, code: c.code })),
      book.title
    );
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (e) {
    return handleError(e);
  }
}
