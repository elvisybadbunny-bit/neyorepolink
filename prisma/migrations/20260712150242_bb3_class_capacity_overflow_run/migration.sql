-- CreateTable
CREATE TABLE "ClassCapacityOverflowRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT,
    "overflowCount" INTEGER NOT NULL,
    "decision" TEXT NOT NULL DEFAULT 'PENDING',
    "newClassId" TEXT,
    "autoAssignedTeacherCount" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" DATETIME,
    CONSTRAINT "ClassCapacityOverflowRun_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ClassCapacityOverflowRun_tenantId_createdAt_idx" ON "ClassCapacityOverflowRun"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "ClassCapacityOverflowRun_tenantId_classId_idx" ON "ClassCapacityOverflowRun"("tenantId", "classId");
