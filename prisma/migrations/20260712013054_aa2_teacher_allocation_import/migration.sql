-- CreateTable
CREATE TABLE "TeacherAllocationImport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "fileName" TEXT,
    "source" TEXT NOT NULL,
    "totalRows" INTEGER NOT NULL,
    "createdNeeds" INTEGER NOT NULL,
    "matchedNeeds" INTEGER NOT NULL,
    "createdTeachers" INTEGER NOT NULL,
    "failedRows" INTEGER NOT NULL,
    "errorRows" TEXT,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeacherAllocationImport_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TeacherAllocationImport_tenantId_createdAt_idx" ON "TeacherAllocationImport"("tenantId", "createdAt");
