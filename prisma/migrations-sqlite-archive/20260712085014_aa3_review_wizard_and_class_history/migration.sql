-- CreateTable
CREATE TABLE "ClassYearHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "stream" TEXT,
    "curriculum" TEXT NOT NULL,
    "graduationYear" INTEGER NOT NULL,
    "promotionRunId" TEXT,
    "studentCount" INTEGER NOT NULL,
    "roster" TEXT NOT NULL,
    "subjectTeachers" TEXT NOT NULL,
    "classTeacherId" TEXT,
    "classTeacherName" TEXT,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClassYearHistory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeacherAllocationReviewRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "promotionRunId" TEXT,
    "level" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "decisions" TEXT NOT NULL,
    "appliedCount" INTEGER NOT NULL DEFAULT 0,
    "autoFilledCount" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "TeacherAllocationReviewRun_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ClassYearHistory_tenantId_graduationYear_idx" ON "ClassYearHistory"("tenantId", "graduationYear");

-- CreateIndex
CREATE INDEX "ClassYearHistory_tenantId_classId_idx" ON "ClassYearHistory"("tenantId", "classId");

-- CreateIndex
CREATE INDEX "TeacherAllocationReviewRun_tenantId_createdAt_idx" ON "TeacherAllocationReviewRun"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "TeacherAllocationReviewRun_tenantId_level_idx" ON "TeacherAllocationReviewRun"("tenantId", "level");
