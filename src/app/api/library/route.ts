/**
 * B.15 Library API.
 * GET  /api/library?q=&view=open|fines       — catalog / open issues / unpaid fines
 * GET  /api/library?barcode=                 — barcode/ISBN lookup (phone scan)
 * GET  /api/library?copyCode=                — T.1 per-copy code lookup (phone/USB scan)
 * GET  /api/library?copiesOf=<bookId>         — T.1 per-copy list for one book
 * POST /api/library {action:"addBook"|...}   — addBook / issue / return / finePaid / generateCopies / setCopyStatus
 * Permissions: library.view (read), library.manage (write).
 */
import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/core/session";
import { ok, handleError } from "@/lib/api/respond";
import { bookSchema, issueSchema, returnSchema, generateCopiesSchema, setCopyStatusSchema } from "@/lib/validations/library";
import {
  listBooks, addBook, findByBarcode, issueBook, returnBook, markFinePaid,
  openIssues, unpaidFines, billFineToInvoice, libraryPolicy, setLibraryPolicy,
  findByCopyCode, listCopiesForBook, generateCopiesForBook, setCopyStatus,
} from "@/lib/services/library.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission("library.view");
    const sp = req.nextUrl.searchParams;
    const barcode = sp.get("barcode");
    if (barcode) return ok(await findByBarcode(user, barcode));
    const copyCode = sp.get("copyCode");
    if (copyCode) return ok(await findByCopyCode(user, copyCode));
    const copiesOf = sp.get("copiesOf");
    if (copiesOf) return ok({ copies: await listCopiesForBook(user, copiesOf) });
    const view = sp.get("view");
    if (view === "open") return ok({ issues: await openIssues(user) });
    if (view === "fines") return ok({ fines: await unpaidFines(user) });
    if (view === "policy") return ok(await libraryPolicy(user));
    return ok({ books: await listBooks(user, sp.get("q") ?? undefined) });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("library.manage");
    const body = await req.json().catch(() => ({}));
    const action = z.object({ action: z.enum(["addBook", "issue", "return", "finePaid", "billFine", "finePolicy", "generateCopies", "setCopyStatus"]) }).parse(body).action;
    if (action === "addBook") return ok(await addBook(user, bookSchema.parse(body)), 201);
    if (action === "finePolicy") {
      const input = z.object({ finesEnabled: z.boolean(), finePerDayKes: z.coerce.number().int().min(0).max(500) }).parse(body);
      return ok(await setLibraryPolicy(user, input));
    }
    if (action === "issue") return ok(await issueBook(user, issueSchema.parse(body)), 201);
    if (action === "return") return ok(await returnBook(user, returnSchema.parse(body)));
    if (action === "generateCopies") {
      const input = generateCopiesSchema.parse(body);
      return ok(await generateCopiesForBook(user, input.bookId, input.count), 201);
    }
    if (action === "setCopyStatus") {
      const input = setCopyStatusSchema.parse(body);
      return ok(await setCopyStatus(user, input.copyId, input.status));
    }
    const { issueId } = z.object({ issueId: z.string().min(1) }).parse(body);
    if (action === "billFine") return ok(await billFineToInvoice(user, issueId), 201); // founder rule: fines → student invoices
    return ok(await markFinePaid(user, issueId));
  } catch (e) {
    return handleError(e);
  }
}

