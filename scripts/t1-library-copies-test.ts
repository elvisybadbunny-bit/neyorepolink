/**
 * T.1 — Per-Physical-Copy Library Tracking — live regression test.
 * Uses its own dedicated, disposable test book so it never disturbs the
 * real seeded "The River and the Source" per-copy demo data.
 */
import { db } from "../src/lib/db";
import {
  addBook, generateCopiesForBook, listCopiesForBook, findByCopyCode,
  issueBook, returnBook, setCopyStatus, listBooks, LibraryError,
} from "../src/lib/services/library.service";
import type { SessionUser } from "../src/lib/core/session";

async function asUser(email: string) {
  return (await db.user.findFirstOrThrow({ where: { email } })) as unknown as SessionUser;
}

let passed = 0, failed = 0;
function assert(cond: boolean, label: string) {
  if (cond) { console.log(`  ✓ ${label}`); passed++; }
  else { console.log(`  ✗ FAIL: ${label}`); failed++; }
}

async function main() {
  const librarian = await asUser("library@karibuhigh.ac.ke").catch(() =>
    db.user.findFirstOrThrow({ where: { role: "LIBRARIAN" } }).then((u) => u as unknown as SessionUser));

  const testIsbn = `T1-TEST-${Date.now()}`;
  const book = await addBook(librarian, { title: "T.1 Test Book — Three Blind Mice", author: "Test Author", isbn: testIsbn, copiesTotal: 3 });

  // A book with zero copy rows behaves exactly as before (bare count).
  const listedBefore = await listBooks(librarian, "T.1 Test Book");
  const beforeRow = listedBefore.find((b) => b.id === book.id);
  assert(beforeRow?.hasCopyTracking === false, "a fresh book with no copy rows reports hasCopyTracking:false");
  assert(beforeRow?.copiesAvailable === 3, "count-based availability still works before opting in (3 available)");

  // Generate copies — real per-copy rows + real DocumentVerification codes.
  const gen1 = await generateCopiesForBook(librarian, book.id, 3);
  assert(gen1.created === 3, `generateCopiesForBook creates real copy rows (created 3, got ${gen1.created})`);
  const codes = new Set(gen1.copies.map((c) => c.code));
  assert(codes.size === 3, "every generated copy gets its own unique real code");

  // Idempotent: re-running with the SAME count creates nothing new.
  const gen2 = await generateCopiesForBook(librarian, book.id, 3);
  assert(gen2.created === 0, "re-generating with the same count creates 0 new copies (idempotent)");

  // Re-running with a BIGGER count only adds the missing ones, never renumbers existing.
  const gen3 = await generateCopiesForBook(librarian, book.id, 5);
  assert(gen3.created === 2, `raising the count to 5 adds exactly 2 more copies (got ${gen3.created})`);
  const copyNosAfterGrow = gen3.copies.map((c) => c.copyNo).sort((a, b) => a - b);
  assert(JSON.stringify(copyNosAfterGrow) === JSON.stringify([1, 2, 3, 4, 5]), "copy numbers 1-5 present, none renumbered");

  // The book now reports real per-copy availability.
  const listedAfter = await listBooks(librarian, "T.1 Test Book");
  const afterRow = listedAfter.find((b) => b.id === book.id);
  assert(afterRow?.hasCopyTracking === true, "book now reports hasCopyTracking:true");
  assert(afterRow?.copiesAvailable === 5, "all 5 real copies show AVAILABLE");

  // Real bug found + fixed this session: a book with a HIGHER real
  // copiesTotal than the requested generate-count must NEVER have its
  // copiesTotal silently shrunk to the smaller number.
  const bigBook = await addBook(librarian, { title: "T.1 Test Book — Big Set (12 copies)", author: "Test Author", isbn: `${testIsbn}-BIG`, copiesTotal: 12 });
  const smallGen = await generateCopiesForBook(librarian, bigBook.id, 3); // deliberately smaller than 12
  assert(smallGen.copies.length === 12, `requesting only 3 codes for a 12-copy book still generates all 12 real copies (got ${smallGen.copies.length})`);
  const bigBookRow = await db.libraryBook.findUniqueOrThrow({ where: { id: bigBook.id } });
  assert(bigBookRow.copiesTotal === 12, `copiesTotal is NEVER shrunk as a side effect of generating copies (stayed 12, got ${bigBookRow.copiesTotal})`);
  await db.libraryBookCopy.deleteMany({ where: { bookId: bigBook.id } });
  await db.documentVerification.deleteMany({ where: { docType: "library_copy", summary: { contains: "Big Set" } } });
  await db.libraryBook.delete({ where: { id: bigBook.id } });

  // Scan a real copy code -> resolves to the exact copy.
  const copy1 = gen3.copies.find((c) => c.copyNo === 1)!;
  const scanned = await findByCopyCode(librarian, copy1.code);
  assert(scanned.copyNo === 1 && scanned.status === "AVAILABLE", "findByCopyCode resolves the exact scanned copy");

  // Issue THAT exact copy to a real student.
  const achieng = await db.student.findFirstOrThrow({ where: { firstName: "Achieng" } });
  const dueDate = new Date(Date.now() + 3 * 3600_000 + 7 * 24 * 3600_000).toISOString().slice(0, 10);
  const issue = await issueBook(librarian, { bookId: book.id, copyId: copy1.id, studentId: achieng.id, dueDate });
  assert(issue.copyId === copy1.id, "issueBook pins the issue to the exact chosen copy");

  const copiesAfterIssue = await listCopiesForBook(librarian, book.id);
  const copy1After = copiesAfterIssue.find((c) => c.id === copy1.id)!;
  assert(copy1After.status === "OUT", "the exact issued copy flips to OUT");
  assert(Boolean(copy1After.currentHolder?.studentName.includes("Achieng")), "the copy's currentHolder is the real borrower");

  // The OTHER 4 copies remain untouched/available.
  const stillAvailable = copiesAfterIssue.filter((c) => c.id !== copy1.id && c.status === "AVAILABLE").length;
  assert(stillAvailable === 4, "the other 4 copies stay AVAILABLE, unaffected");

  // Re-scanning the SAME copy now honestly reports it's not available.
  const rescan = await findByCopyCode(librarian, copy1.code);
  assert(rescan.status === "OUT" && Boolean(rescan.currentHolder?.studentName.includes("Achieng")), "re-scanning an OUT copy honestly shows who holds it");

  // Trying to issue the SAME copy to someone else is rejected.
  const kamau = await db.student.findFirstOrThrow({ where: { firstName: "Kamau" } });
  let blockedDoubleIssue = false;
  try { await issueBook(librarian, { bookId: book.id, copyId: copy1.id, studentId: kamau.id, dueDate }); }
  catch (e) { blockedDoubleIssue = e instanceof LibraryError && e.code === "NO_COPIES"; }
  assert(blockedDoubleIssue, "issuing an already-OUT copy is honestly rejected (NO_COPIES)");

  // Auto-pick (no copyId given) picks a genuinely free copy, never the one that's out.
  const autoIssue = await issueBook(librarian, { bookId: book.id, studentId: kamau.id, dueDate });
  assert(autoIssue.copyId !== null && autoIssue.copyId !== copy1.id, "auto-pick (no copyId) selects a different, genuinely free copy");

  // Cannot mark an OUT copy LOST/DAMAGED/RETIRED without returning it first.
  let blockedStatusChange = false;
  try { await setCopyStatus(librarian, copy1.id, "LOST"); }
  catch (e) { blockedStatusChange = e instanceof LibraryError && e.code === "INVALID"; }
  assert(blockedStatusChange, "cannot mark a currently-OUT copy LOST/DAMAGED/RETIRED before it's returned");

  // Return frees the real copy back to AVAILABLE.
  await returnBook(librarian, { issueId: issue.id });
  const copiesAfterReturn = await listCopiesForBook(librarian, book.id);
  const copy1Returned = copiesAfterReturn.find((c) => c.id === copy1.id)!;
  assert(copy1Returned.status === "AVAILABLE", "returning the book frees the exact copy back to AVAILABLE");

  // NOW marking it lost/retired works.
  const lostResult = await setCopyStatus(librarian, copy1.id, "LOST");
  assert(lostResult.status === "LOST", "a genuinely available copy can be marked LOST");
  const backToAvailable = await setCopyStatus(librarian, copy1.id, "AVAILABLE");
  assert(backToAvailable.status === "AVAILABLE", "a LOST copy can be restored back to AVAILABLE (e.g. it was found)");

  // Cleanup — full removal, confirmed via direct re-query.
  await db.bookIssue.deleteMany({ where: { bookId: book.id } });
  await db.libraryBookCopy.deleteMany({ where: { bookId: book.id } });
  await db.documentVerification.deleteMany({ where: { docType: "library_copy", summary: { contains: "T.1 Test Book" } } });
  await db.libraryBook.delete({ where: { id: book.id } });

  const remainingBooks = await db.libraryBook.count({ where: { isbn: testIsbn } });
  const remainingCopies = await db.libraryBookCopy.count({ where: { book: { isbn: testIsbn } } });
  console.log(`\nCleanup done. Remaining test books: ${remainingBooks} (expected 0), copies: ${remainingCopies} (expected 0).`);
  assert(remainingBooks === 0 && remainingCopies === 0, "full cleanup confirmed via direct DB re-query");

  console.log("\n----------------------------------------");
  console.log(`  ${passed} passed, ${failed} failed`);
  console.log(failed === 0 ? "  ✅ all green" : "  ❌ FAILURES ABOVE");
  if (failed > 0) process.exitCode = 1;
}

main().then(() => process.exit(process.exitCode ?? 0)).catch((e) => { console.error(e); process.exit(1); });
