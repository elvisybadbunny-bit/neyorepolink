/**
 * B.15 Library — catalog, issue/return with availability tracking,
 * AUTO-CALCULATED overdue fines (KES per school day late), barcode lookup
 * (ISBN scanned by phone), digital library files, and per-student reading
 * history (surfaces on the family portal too).
 *
 * T.1 — REAL PER-PHYSICAL-COPY TRACKING (2026-07-08). A school can opt a
 * given book into per-copy tracking ("Generate copy codes"): each physical
 * copy gets its own row (`LibraryBookCopy`) and its own real, scannable QR
 * code, reusing the EXISTING `DocumentVerification` scan-to-resolve pattern
 * (N.2) rather than a second code system. A book with zero copy rows behaves
 * EXACTLY as before — bare `copiesTotal` integer, count-based availability —
 * so nothing changes for a school that never opts in. Once copies exist,
 * they become the real source of truth for that book's availability, and an
 * issue can be pinned to the exact physical copy borrowed.
 */
import { db } from "@/lib/db";
import { withTenant } from "@/lib/core/tenant-context";
import { tenantDb } from "@/lib/core/tenant-db";
import { scopeWhere } from "@/lib/services/student.service";
import { nextTenantId } from "@/lib/services/identity.service";
import { issueVerification } from "@/lib/services/document.service";
import type { SessionUser } from "@/lib/core/session";

export class LibraryError extends Error {
  constructor(public code: "NOT_FOUND" | "DUPLICATE" | "NO_COPIES" | "ALREADY_RETURNED" | "LIMIT" | "INVALID", message: string) {
    super(message);
    this.name = "LibraryError";
  }
}

/** Fine policy: KES per day overdue (school days incl. Saturdays, excl. Sundays). */
export const FINE_PER_DAY_KES = 10;
/** Max books a student may hold at once. */
export const MAX_OPEN_ISSUES = 3;

async function audit(user: SessionUser, action: string, entityType: string, entityId: string, metadata?: unknown) {
  await db.auditLog.create({
    data: {
      tenantId: user.tenantId, actorId: user.id, actorName: user.fullName,
      action, entityType, entityId,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
}

function nairobiToday(): string {
  return new Date(Date.now() + 3 * 3600_000).toISOString().slice(0, 10);
}

/** Days overdue (Sundays don't count — church/family day, school shut). */
export function overdueDays(dueDate: string, onDate = nairobiToday()): number {
  if (onDate <= dueDate) return 0;
  let days = 0;
  const d = new Date(`${dueDate}T00:00:00Z`);
  const end = new Date(`${onDate}T00:00:00Z`);
  while (d < end) {
    d.setUTCDate(d.getUTCDate() + 1);
    if (d.getUTCDay() !== 0) days++; // skip Sundays
  }
  return days;
}

export function computeFine(dueDate: string, onDate = nairobiToday(), finePerDayKes = FINE_PER_DAY_KES): number {
  return overdueDays(dueDate, onDate) * finePerDayKes;
}

// ---------------------------------------------------------------------------
// Fine policy
// ---------------------------------------------------------------------------

export async function libraryPolicy(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const tenant = await db.tenant.findUniqueOrThrow({
      where: { id: user.tenantId },
      select: { libraryFinesEnabled: true, libraryFinePerDayKes: true },
    });
    return { finesEnabled: tenant.libraryFinesEnabled, finePerDayKes: tenant.libraryFinePerDayKes };
  });
}

export async function setLibraryPolicy(user: SessionUser, input: { finesEnabled: boolean; finePerDayKes: number }) {
  return withTenant(user.tenantId, async () => {
    const amount = Math.max(0, Math.min(500, Math.trunc(input.finePerDayKes)));
    const row = await db.tenant.update({
      where: { id: user.tenantId },
      data: { libraryFinesEnabled: input.finesEnabled, libraryFinePerDayKes: amount },
      select: { libraryFinesEnabled: true, libraryFinePerDayKes: true },
    });
    await audit(user, "library.fine_policy_updated", "tenant", user.tenantId, { finesEnabled: row.libraryFinesEnabled, finePerDayKes: row.libraryFinePerDayKes });
    return { finesEnabled: row.libraryFinesEnabled, finePerDayKes: row.libraryFinePerDayKes };
  });
}

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

export async function listBooks(user: SessionUser, q?: string) {
  return withTenant(user.tenantId, async () => {
    const where: Record<string, unknown> = { archived: false };
    if (q?.trim()) {
      const s = q.trim();
      where.OR = [
        { title: { contains: s } },
        { author: { contains: s } },
        { isbn: { contains: s } },
        { category: { contains: s } },
      ];
    }
    const books = await tenantDb().libraryBook.findMany({
      where, orderBy: { title: "asc" }, take: 200,
      include: {
        issues: { where: { returnedAt: null }, select: { id: true } },
        copies: { select: { id: true, status: true } },
      },
    });
    return books.map((b) => {
      // T.1 — once a book has real per-copy rows, THEY are the source of
      // truth for availability (never both systems disagreeing); a book
      // with zero copy rows keeps the original count-based behavior.
      const hasCopyTracking = b.copies.length > 0;
      const copiesTotal = hasCopyTracking
        ? b.copies.filter((c) => c.status !== "RETIRED").length
        : b.copiesTotal;
      const copiesOut = hasCopyTracking
        ? b.copies.filter((c) => c.status === "OUT").length
        : b.issues.length;
      const copiesAvailable = hasCopyTracking
        ? b.copies.filter((c) => c.status === "AVAILABLE").length
        : Math.max(0, b.copiesTotal - b.issues.length);
      return {
        id: b.id, title: b.title, author: b.author, isbn: b.isbn, category: b.category,
        shelf: b.shelf, copiesTotal, copiesOut, copiesAvailable,
        hasCopyTracking, copyCount: b.copies.length,
        fileUrl: b.fileUrl, fileName: b.fileName,
      };
    });
  });
}

export async function addBook(
  user: SessionUser,
  input: { title: string; author?: string; isbn?: string; category?: string; shelf?: string; copiesTotal: number; fileUrl?: string; fileName?: string }
) {
  return withTenant(user.tenantId, async () => {
    if (input.isbn) {
      const dup = await tenantDb().libraryBook.findFirst({ where: { isbn: input.isbn, archived: false } });
      if (dup) throw new LibraryError("DUPLICATE", `That ISBN/barcode is already in the catalog ("${dup.title}"). Edit its copy count instead.`);
    }
    const book = await db.libraryBook.create({
      data: {
        tenantId: user.tenantId, title: input.title, author: input.author ?? null,
        isbn: input.isbn || null, category: input.category ?? null, shelf: input.shelf ?? null,
        copiesTotal: input.copiesTotal, fileUrl: input.fileUrl ?? null, fileName: input.fileName ?? null,
      },
    });
    await audit(user, "library.book_added", "libraryBook", book.id, { title: input.title, copies: input.copiesTotal });
    return book;
  });
}

/** Barcode lookup: scan/type an ISBN → the book + availability + open issues. */
export async function findByBarcode(user: SessionUser, isbn: string) {
  return withTenant(user.tenantId, async () => {
    const book = await tenantDb().libraryBook.findFirst({
      where: { isbn: isbn.trim(), archived: false },
      include: { issues: { where: { returnedAt: null } }, copies: true },
    });
    if (!book) throw new LibraryError("NOT_FOUND", "No book with that barcode/ISBN in the catalog.");
    const hasCopyTracking = book.copies.length > 0;
    const copiesTotal = hasCopyTracking ? book.copies.filter((c) => c.status !== "RETIRED").length : book.copiesTotal;
    const copiesAvailable = hasCopyTracking
      ? book.copies.filter((c) => c.status === "AVAILABLE").length
      : Math.max(0, book.copiesTotal - book.issues.length);
    return {
      id: book.id, title: book.title, author: book.author, shelf: book.shelf,
      copiesTotal, copiesOut: hasCopyTracking ? book.copies.filter((c) => c.status === "OUT").length : book.issues.length,
      copiesAvailable, hasCopyTracking,
      openIssues: book.issues.map((i) => ({
        id: i.id, studentName: i.studentName, admissionNo: i.admissionNo,
        dueDate: i.dueDate, fineSoFarKes: computeFine(i.dueDate),
      })),
    };
  });
}

/**
 * T.1 — real per-copy code scan lookup: scan/type an exact copy's code →
 * the book + THAT specific copy's real status (reuses N.2's exact scan
 * pattern — the frontend just POSTs whatever the camera/USB scanner read;
 * `extractVerifyCode()` from qr-scan.service.ts already strips a full
 * `/verify/<code>` URL down to the bare code before calling this).
 */
export async function findByCopyCode(user: SessionUser, code: string) {
  return withTenant(user.tenantId, async () => {
    const copy = await tenantDb().libraryBookCopy.findFirst({
      where: { code: code.trim().toUpperCase() },
      include: { book: true },
    });
    if (!copy) throw new LibraryError("NOT_FOUND", "No library copy with that code.");
    const openIssue = copy.status === "OUT"
      ? await tenantDb().bookIssue.findFirst({ where: { copyId: copy.id, returnedAt: null } })
      : null;
    return {
      copyId: copy.id, copyNo: copy.copyNo, status: copy.status,
      bookId: copy.book.id, title: copy.book.title, author: copy.book.author, shelf: copy.book.shelf,
      currentHolder: openIssue ? { issueId: openIssue.id, studentName: openIssue.studentName, admissionNo: openIssue.admissionNo, dueDate: openIssue.dueDate, fineSoFarKes: computeFine(openIssue.dueDate) } : null,
    };
  });
}

/**
 * T.1 — generate real per-copy codes for a book, one row + one real
 * DocumentVerification code per NEW physical copy. Idempotent by copy
 * number: re-running with a smaller/equal count changes nothing; a bigger
 * count only ADDS the missing copies (never duplicates or renumbers
 * existing ones, so labels already printed and stuck on books stay valid).
 */
export async function generateCopiesForBook(user: SessionUser, bookId: string, count?: number) {
  return withTenant(user.tenantId, async () => {
    const book = await tenantDb().libraryBook.findUnique({ where: { id: bookId }, include: { copies: true } });
    if (!book || book.archived) throw new LibraryError("NOT_FOUND", "Book not found.");

    // Real transition case: this book may already have OPEN issues from
    // BEFORE it opted into per-copy tracking (copyId still null on those
    // rows) — a real learner is genuinely holding a real physical copy right
    // now. Those legacy open issues must be honestly reflected as OUT on
    // real new copy rows, never silently shown as AVAILABLE just because
    // per-copy tracking is new. Ensure we generate ENOUGH new copies to
    // cover every legacy open issue, even if a smaller count was requested.
    const legacyOpenIssues = await tenantDb().bookIssue.findMany({
      where: { bookId: book.id, returnedAt: null, copyId: null },
    });

    // Real safety rule found + fixed during this session's own testing: this
    // function must NEVER shrink a book's declared copiesTotal as a side
    // effect. `count` only ever means "generate AT LEAST this many real
    // copies" — it can raise the target above copiesTotal (a school buying
    // more physical copies later), but a caller passing a SMALLER number
    // than the book's existing declared copiesTotal must not silently lose
    // real, already-declared copies (confirmed by a real regression test
    // catching exactly this: generating only 3 codes for a 12-copy book had
    // been quietly shrinking copiesTotal to 3 — fixed here).
    const existingNos = new Set(book.copies.map((c) => c.copyNo));
    const minRequired = book.copies.length + legacyOpenIssues.length;
    const target = Math.max(count ?? book.copiesTotal, book.copiesTotal, book.copies.length, minRequired);
    const toCreate: number[] = [];
    for (let n = 1; n <= target && toCreate.length < (target - book.copies.length); n++) {
      if (!existingNos.has(n)) toCreate.push(n);
    }
    if (toCreate.length === 0) {
      return { created: 0, copies: book.copies.map((c) => ({ id: c.id, copyNo: c.copyNo, code: c.code, status: c.status })) };
    }

    const created: { id: string; copyNo: number; code: string; status: string }[] = [];
    for (let i = 0; i < toCreate.length; i++) {
      const copyNo = toCreate[i];
      const code = await issueVerification(
        user.tenantId, "library_copy", `${book.title} — Copy ${copyNo}`,
        { bookId: book.id, copyNo }
      );
      const backfillIssue = legacyOpenIssues[i]; // one legacy open issue -> one real new copy, in order
      const row = await db.libraryBookCopy.create({
        data: { tenantId: user.tenantId, bookId: book.id, copyNo, code, status: backfillIssue ? "OUT" : "AVAILABLE" },
      });
      if (backfillIssue) {
        await db.bookIssue.update({ where: { id: backfillIssue.id }, data: { copyId: row.id } });
      }
      created.push({ id: row.id, copyNo: row.copyNo, code: row.code, status: row.status });
    }

    // Keep copiesTotal in sync with real copy rows once a book has opted in.
    const newTotal = book.copies.length + created.length;
    await db.libraryBook.update({ where: { id: book.id }, data: { copiesTotal: newTotal } });

    await audit(user, "library.copies_generated", "libraryBook", book.id, { created: created.length, newTotal });
    return { created: created.length, copies: [...book.copies.map((c) => ({ id: c.id, copyNo: c.copyNo, code: c.code, status: c.status })), ...created] };
  });
}

/** T.1 — list a book's real per-copy rows (Catalog detail view). */
export async function listCopiesForBook(user: SessionUser, bookId: string) {
  return withTenant(user.tenantId, async () => {
    const copies = await tenantDb().libraryBookCopy.findMany({
      where: { bookId }, orderBy: { copyNo: "asc" },
      include: { issues: { where: { returnedAt: null }, take: 1 } },
    });
    return copies.map((c) => ({
      id: c.id, copyNo: c.copyNo, code: c.code, status: c.status,
      currentHolder: c.issues[0] ? { studentName: c.issues[0].studentName, admissionNo: c.issues[0].admissionNo, dueDate: c.issues[0].dueDate } : null,
    }));
  });
}

/**
 * T.1 — mark a real physical copy LOST/DAMAGED/RETIRED (or back to
 * AVAILABLE), for the real, mundane cases a library actually deals with —
 * a book goes missing, gets water-damaged, or is withdrawn from
 * circulation. A copy that currently has an OPEN issue cannot be marked
 * lost/damaged/retired without returning it first (the return path is the
 * one real place that frees a copy from OUT — never silently overridden).
 */
export async function setCopyStatus(user: SessionUser, copyId: string, status: "AVAILABLE" | "OUT" | "LOST" | "DAMAGED" | "RETIRED") {
  return withTenant(user.tenantId, async () => {
    const copy = await tenantDb().libraryBookCopy.findUnique({ where: { id: copyId } });
    if (!copy) throw new LibraryError("NOT_FOUND", "Copy not found.");
    if (copy.status === "OUT" && status !== "OUT") {
      const openIssue = await tenantDb().bookIssue.findFirst({ where: { copyId, returnedAt: null } });
      if (openIssue) throw new LibraryError("INVALID", "This copy is currently issued out — return it first before changing its status.");
    }
    const row = await tenantDb().libraryBookCopy.update({ where: { id: copyId }, data: { status } });
    await audit(user, "library.copy_status_set", "libraryBookCopy", copyId, { from: copy.status, to: status });
    return { id: row.id, status: row.status };
  });
}

// ---------------------------------------------------------------------------
// Issue / return
// ---------------------------------------------------------------------------

export async function issueBook(
  user: SessionUser,
  input: { bookId: string; copyId?: string; studentId?: string; staffUserId?: string; dueDate: string }
) {
  return withTenant(user.tenantId, async () => {
    const book = await tenantDb().libraryBook.findUnique({
      where: { id: input.bookId },
      include: { issues: { where: { returnedAt: null } }, copies: true },
    });
    if (!book || book.archived) throw new LibraryError("NOT_FOUND", "Book not found.");

    // T.1 — once a book has real per-copy rows, resolve (or auto-pick) the
    // EXACT physical copy being issued; a book with zero copy rows keeps the
    // original bare-count behavior unchanged.
    const hasCopyTracking = book.copies.length > 0;
    let copyId: string | null = null;
    if (hasCopyTracking) {
      if (input.copyId) {
        const chosen = book.copies.find((c) => c.id === input.copyId);
        if (!chosen) throw new LibraryError("NOT_FOUND", "That copy does not belong to this book.");
        if (chosen.status !== "AVAILABLE")
          throw new LibraryError("NO_COPIES", `Copy ${chosen.copyNo} is not available (status: ${chosen.status.toLowerCase()}). Pick a different copy.`);
        copyId = chosen.id;
      } else {
        const free = book.copies.find((c) => c.status === "AVAILABLE");
        if (!free) throw new LibraryError("NO_COPIES", `All tracked copies of "${book.title}" are currently out or unavailable. Next return frees one.`);
        copyId = free.id;
      }
    } else if (book.issues.length >= book.copiesTotal) {
      throw new LibraryError("NO_COPIES", `All ${book.copiesTotal} cop${book.copiesTotal === 1 ? "y is" : "ies are"} out. Next return frees one.`);
    }

    if (input.dueDate <= nairobiToday())
      throw new LibraryError("INVALID", "Due date must be in the future.");

    // H.5 Teacher Book Borrowing — STAFF borrower path.
    if (input.staffUserId) {
      const staff = await tenantDb().user.findFirst({ where: { id: input.staffUserId } });
      if (!staff) throw new LibraryError("NOT_FOUND", "Staff member not found.");
      // Families are not "staff borrowers".
      if (staff.role === "PARENT" || staff.role === "STUDENT")
        throw new LibraryError("INVALID", "Only staff members can borrow on a staff ID.");

      const openS = await tenantDb().bookIssue.count({ where: { borrowerUserId: staff.id, returnedAt: null } });
      if (openS >= MAX_OPEN_ISSUES)
        throw new LibraryError("LIMIT", `${staff.fullName} already holds ${openS} books — the limit is ${MAX_OPEN_ISSUES}. Return one first.`);
      const dupeS = await tenantDb().bookIssue.findFirst({ where: { bookId: book.id, borrowerUserId: staff.id, returnedAt: null } });
      if (dupeS) throw new LibraryError("DUPLICATE", "This staff member already has a copy of this book out.");

      // Staff "library ID" = TSC number from their HR profile when present, else NEYO id.
      const profile = await tenantDb().staffProfile.findFirst({ where: { userId: staff.id } });
      const staffLibraryId = profile?.tscNumber ? `TSC ${profile.tscNumber}` : (staff.neyoLoginId ?? "STAFF");

      const issue = await db.bookIssue.create({
        data: {
          tenantId: user.tenantId, bookId: book.id, copyId,
          borrowerType: "STAFF", borrowerUserId: staff.id, studentId: null,
          studentName: staff.fullName, admissionNo: staffLibraryId,
          issuedById: user.id, issuedByName: user.fullName, dueDate: input.dueDate,
        },
      });
      if (copyId) await db.libraryBookCopy.update({ where: { id: copyId }, data: { status: "OUT" } });
      await audit(user, "library.issued", "bookIssue", issue.id, { book: book.title, staff: staff.fullName, due: input.dueDate, copyId });
      return issue;
    }

    // STUDENT borrower path (default).
    const student = await tenantDb().student.findFirst({
      where: { id: input.studentId, status: "ACTIVE", deletedAt: null },
    });
    if (!student) throw new LibraryError("NOT_FOUND", "Student not found (or not active).");

    const open = await tenantDb().bookIssue.count({ where: { studentId: student.id, returnedAt: null } });
    if (open >= MAX_OPEN_ISSUES)
      throw new LibraryError("LIMIT", `${student.firstName} already holds ${open} books — the limit is ${MAX_OPEN_ISSUES}. Return one first.`);
    const dupe = await tenantDb().bookIssue.findFirst({ where: { bookId: book.id, studentId: student.id, returnedAt: null } });
    if (dupe) throw new LibraryError("DUPLICATE", "This student already has a copy of this book out.");

    const issue = await db.bookIssue.create({
      data: {
        tenantId: user.tenantId, bookId: book.id, copyId,
        borrowerType: "STUDENT", studentId: student.id,
        studentName: [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" "),
        admissionNo: student.admissionNo,
        issuedById: user.id, issuedByName: user.fullName, dueDate: input.dueDate,
      },
    });
    if (copyId) await db.libraryBookCopy.update({ where: { id: copyId }, data: { status: "OUT" } });
    await audit(user, "library.issued", "bookIssue", issue.id, { book: book.title, student: issue.studentName, due: input.dueDate, copyId });
    return issue;
  });
}

/** Return a book — fine auto-computed from days overdue. */
export async function returnBook(user: SessionUser, input: { issueId: string; finePaid?: boolean }) {
  return withTenant(user.tenantId, async () => {
    const issue = await tenantDb().bookIssue.findUnique({ where: { id: input.issueId }, include: { book: true } });
    if (!issue) throw new LibraryError("NOT_FOUND", "Issue record not found.");
    if (issue.returnedAt) throw new LibraryError("ALREADY_RETURNED", "This book was already returned.");

    // T.1 — free the exact real copy back to AVAILABLE the moment it's returned.
    if (issue.copyId) {
      await tenantDb().libraryBookCopy.update({ where: { id: issue.copyId }, data: { status: "AVAILABLE" } });
    }

    const tenant = await db.tenant.findUnique({ where: { id: user.tenantId }, select: { libraryFinesEnabled: true, libraryFinePerDayKes: true } });
    const finesEnabled = tenant?.libraryFinesEnabled ?? true;

    const fineKes = finesEnabled ? computeFine(issue.dueDate, nairobiToday(), tenant?.libraryFinePerDayKes ?? FINE_PER_DAY_KES) : 0;
    const row = await tenantDb().bookIssue.update({
      where: { id: issue.id },
      data: { returnedAt: new Date(), fineKes, finePaid: fineKes === 0 ? true : Boolean(input.finePaid) },
    });
    await audit(user, "library.returned", "bookIssue", row.id, {
      book: issue.book.title, student: issue.studentName, fineKes, finePaid: row.finePaid,
    });
    return { id: row.id, fineKes, finePaid: row.finePaid, daysOverdue: overdueDays(issue.dueDate) };
  });
}

export async function markFinePaid(user: SessionUser, issueId: string) {
  return withTenant(user.tenantId, async () => {
    const issue = await tenantDb().bookIssue.findUnique({ where: { id: issueId } });
    if (!issue) throw new LibraryError("NOT_FOUND", "Issue record not found.");
    const row = await tenantDb().bookIssue.update({ where: { id: issueId }, data: { finePaid: true } });
    await audit(user, "library.fine_paid", "bookIssue", issueId, { fineKes: issue.fineKes });
    return row;
  });
}

/**
 * FOUNDER RULE (2026-06-12): every chargeable service lands on the student's
 * invoice. Bill an unpaid library fine onto a B.7 invoice — the family sees
 * it on the portal and can pay via M-Pesa STK; the fine is marked settled
 * here (it now lives in the fee ledger).
 */
export async function billFineToInvoice(user: SessionUser, issueId: string) {
  return withTenant(user.tenantId, async () => {
    const issue = await tenantDb().bookIssue.findUnique({ where: { id: issueId }, include: { book: true } });
    if (!issue) throw new LibraryError("NOT_FOUND", "Issue record not found.");
    if (!issue.returnedAt) throw new LibraryError("INVALID", "Return the book first — the fine is computed at return.");
    if (issue.fineKes <= 0 || issue.finePaid) throw new LibraryError("INVALID", "No unpaid fine on this record.");
    // H.5 — staff borrowers have no fee invoice; their fines are collected as cash.
    if (issue.borrowerType === "STAFF" || !issue.studentId)
      throw new LibraryError("INVALID", "Staff library fines are paid as cash, not billed to an invoice.");

    const now = new Date(Date.now() + 3 * 3600_000);
    const term = await tenantDb().academicTerm.findFirst({ where: { current: true } });
    const invoiceNo = await nextTenantId(user.tenantId, "INVOICE");
    const due = new Date(now.getTime() + 14 * 24 * 3600_000).toISOString().slice(0, 10);
    const invoice = await db.invoice.create({
      data: {
        tenantId: user.tenantId, invoiceNo, studentId: issue.studentId,
        description: `Library fine — "${issue.book.title}" (${issue.fineKes / FINE_PER_DAY_KES} days late)`,
        totalKes: issue.fineKes, dueDate: due, status: "UNPAID",
        year: now.getUTCFullYear(), term: term?.term ?? 1,
      },
    });
    await tenantDb().bookIssue.update({ where: { id: issueId }, data: { finePaid: true } });
    await audit(user, "library.fine_invoiced", "bookIssue", issueId, { invoiceNo, fineKes: issue.fineKes });
    return { invoiceId: invoice.id, invoiceNo, fineKes: issue.fineKes };
  });
}

/** Open issues (the "out now" desk view) + overdue flags + live fines. */
export async function openIssues(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const tenant = await db.tenant.findUnique({ where: { id: user.tenantId }, select: { libraryFinesEnabled: true, libraryFinePerDayKes: true } });
    const finesEnabled = tenant?.libraryFinesEnabled ?? true;

    const rows = await tenantDb().bookIssue.findMany({
      where: { returnedAt: null },
      include: { book: true, copy: true },
      orderBy: { dueDate: "asc" },
    });
    const today = nairobiToday();
    return rows.map((r) => ({
      id: r.id, bookTitle: r.book.title, isbn: r.book.isbn,
      copyNo: r.copy?.copyNo ?? null,
      studentName: r.studentName, admissionNo: r.admissionNo,
      issuedAt: r.issuedAt, dueDate: r.dueDate,
      overdue: r.dueDate < today,
      daysOverdue: overdueDays(r.dueDate),
      fineSoFarKes: finesEnabled ? computeFine(r.dueDate, today, tenant?.libraryFinePerDayKes ?? FINE_PER_DAY_KES) : 0,
    }));
  });
}

/** Unpaid fines ledger. */
export async function unpaidFines(user: SessionUser) {
  return withTenant(user.tenantId, async () => {
    const rows = await tenantDb().bookIssue.findMany({
      where: { returnedAt: { not: null }, fineKes: { gt: 0 }, finePaid: false },
      include: { book: true },
      orderBy: { returnedAt: "desc" },
    });
    return rows.map((r) => ({
      id: r.id, bookTitle: r.book.title, studentName: r.studentName,
      admissionNo: r.admissionNo, fineKes: r.fineKes, returnedAt: r.returnedAt,
    }));
  });
}

// ---------------------------------------------------------------------------
// Reading history (B.15.6) — also row-scoped for the family portal
// ---------------------------------------------------------------------------

export async function readingHistory(user: SessionUser, studentId: string) {
  return withTenant(user.tenantId, async () => {
    const tenant = await db.tenant.findUnique({ where: { id: user.tenantId }, select: { libraryFinesEnabled: true, libraryFinePerDayKes: true } });
    const finesEnabled = tenant?.libraryFinesEnabled ?? true;

    // Families: scopeWhere restricts to own children; staff with library/student view pass.
    const scope = await scopeWhere(user);
    const student = await tenantDb().student.findFirst({ where: { AND: [{ id: studentId }, scope] } });
    if (!student) throw new LibraryError("NOT_FOUND", "Student not found.");
    const rows = await tenantDb().bookIssue.findMany({
      where: { studentId },
      include: { book: true },
      orderBy: { issuedAt: "desc" },
      take: 50,
    });
    return rows.map((r) => ({
      id: r.id, title: r.book.title, author: r.book.author,
      issuedAt: r.issuedAt, dueDate: r.dueDate, returnedAt: r.returnedAt,
      fineKes: r.fineKes, finePaid: r.finePaid,
      stillOut: r.returnedAt === null,
      fineSoFarKes: r.returnedAt === null 
        ? (finesEnabled ? computeFine(r.dueDate, nairobiToday(), tenant?.libraryFinePerDayKes ?? FINE_PER_DAY_KES) : 0) 
        : r.fineKes,
    }));
  });
}
