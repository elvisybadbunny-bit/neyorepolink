-- CreateTable
CREATE TABLE "LibraryBookCopy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "copyNo" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LibraryBookCopy_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LibraryBookCopy_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "LibraryBook" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BookIssue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "copyId" TEXT,
    "borrowerType" TEXT NOT NULL DEFAULT 'STUDENT',
    "studentId" TEXT,
    "borrowerUserId" TEXT,
    "studentName" TEXT NOT NULL,
    "admissionNo" TEXT NOT NULL DEFAULT '',
    "issuedById" TEXT NOT NULL,
    "issuedByName" TEXT NOT NULL,
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TEXT NOT NULL,
    "returnedAt" DATETIME,
    "fineKes" INTEGER NOT NULL DEFAULT 0,
    "finePaid" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "BookIssue_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BookIssue_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "LibraryBook" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BookIssue_copyId_fkey" FOREIGN KEY ("copyId") REFERENCES "LibraryBookCopy" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_BookIssue" ("admissionNo", "bookId", "borrowerType", "borrowerUserId", "dueDate", "fineKes", "finePaid", "id", "issuedAt", "issuedById", "issuedByName", "returnedAt", "studentId", "studentName", "tenantId") SELECT "admissionNo", "bookId", "borrowerType", "borrowerUserId", "dueDate", "fineKes", "finePaid", "id", "issuedAt", "issuedById", "issuedByName", "returnedAt", "studentId", "studentName", "tenantId" FROM "BookIssue";
DROP TABLE "BookIssue";
ALTER TABLE "new_BookIssue" RENAME TO "BookIssue";
CREATE INDEX "BookIssue_tenantId_bookId_idx" ON "BookIssue"("tenantId", "bookId");
CREATE INDEX "BookIssue_tenantId_studentId_idx" ON "BookIssue"("tenantId", "studentId");
CREATE INDEX "BookIssue_tenantId_returnedAt_idx" ON "BookIssue"("tenantId", "returnedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "LibraryBookCopy_tenantId_bookId_status_idx" ON "LibraryBookCopy"("tenantId", "bookId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryBookCopy_tenantId_bookId_copyNo_key" ON "LibraryBookCopy"("tenantId", "bookId", "copyNo");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryBookCopy_tenantId_code_key" ON "LibraryBookCopy"("tenantId", "code");
