-- AlterTable
ALTER TABLE "User" ADD COLUMN "timetableShortCode" TEXT;

-- CreateTable
CREATE TABLE "Venue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortCode" TEXT,
    "supportsSubjectIds" TEXT NOT NULL DEFAULT '[]',
    "capacityPerPeriod" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Venue_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ClassSubjectNeed" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT,
    "lessonsPerWeek" INTEGER NOT NULL DEFAULT 5,
    "doubleCount" INTEGER NOT NULL DEFAULT 0,
    "allowSplitDouble" BOOLEAN NOT NULL DEFAULT false,
    "venueId" TEXT,
    CONSTRAINT "ClassSubjectNeed_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClassSubjectNeed_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ClassSubjectNeed" ("allowSplitDouble", "classId", "doubleCount", "id", "lessonsPerWeek", "subjectId", "teacherId", "tenantId") SELECT "allowSplitDouble", "classId", "doubleCount", "id", "lessonsPerWeek", "subjectId", "teacherId", "tenantId" FROM "ClassSubjectNeed";
DROP TABLE "ClassSubjectNeed";
ALTER TABLE "new_ClassSubjectNeed" RENAME TO "ClassSubjectNeed";
CREATE INDEX "ClassSubjectNeed_tenantId_idx" ON "ClassSubjectNeed"("tenantId");
CREATE INDEX "ClassSubjectNeed_tenantId_venueId_idx" ON "ClassSubjectNeed"("tenantId", "venueId");
CREATE UNIQUE INDEX "ClassSubjectNeed_tenantId_classId_subjectId_key" ON "ClassSubjectNeed"("tenantId", "classId", "subjectId");
CREATE TABLE "new_CombinationGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT,
    "lessonsPerWeek" INTEGER NOT NULL DEFAULT 4,
    "doubleCount" INTEGER NOT NULL DEFAULT 0,
    "scope" TEXT NOT NULL DEFAULT 'SELECTED',
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "venueId" TEXT,
    CONSTRAINT "CombinationGroup_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CombinationGroup_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CombinationGroup" ("active", "createdAt", "doubleCount", "id", "lessonsPerWeek", "name", "scope", "source", "subjectId", "teacherId", "tenantId", "updatedAt") SELECT "active", "createdAt", "doubleCount", "id", "lessonsPerWeek", "name", "scope", "source", "subjectId", "teacherId", "tenantId", "updatedAt" FROM "CombinationGroup";
DROP TABLE "CombinationGroup";
ALTER TABLE "new_CombinationGroup" RENAME TO "CombinationGroup";
CREATE INDEX "CombinationGroup_tenantId_idx" ON "CombinationGroup"("tenantId");
CREATE INDEX "CombinationGroup_tenantId_venueId_idx" ON "CombinationGroup"("tenantId", "venueId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Venue_tenantId_idx" ON "Venue"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Venue_tenantId_name_key" ON "Venue"("tenantId", "name");
