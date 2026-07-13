-- CreateTable
CREATE TABLE "CustomFeatureRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "requestedByName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "quotedPriceKes" INTEGER,
    "quotedBillingCycle" TEXT,
    "opsNote" TEXT,
    "schoolReply" TEXT,
    "declineReason" TEXT,
    "deliveredFeatureKey" TEXT,
    "deliveredAt" DATETIME,
    "releasedToAllSchools" BOOLEAN NOT NULL DEFAULT false,
    "releasedAt" DATETIME,
    "decidedById" TEXT,
    "decidedByName" TEXT,
    "decidedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CustomFeatureRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BackgroundJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "resultJson" TEXT,
    "error" TEXT,
    "startedById" TEXT NOT NULL,
    "startedByName" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME,
    CONSTRAINT "BackgroundJob_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FeeStructure" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "classId" TEXT,
    "applyToAllLevels" BOOLEAN NOT NULL DEFAULT false,
    "year" INTEGER NOT NULL,
    "term" INTEGER NOT NULL,
    CONSTRAINT "FeeStructure_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FeeStructure" ("classId", "id", "level", "name", "tenantId", "term", "year") SELECT "classId", "id", "level", "name", "tenantId", "term", "year" FROM "FeeStructure";
DROP TABLE "FeeStructure";
ALTER TABLE "new_FeeStructure" RENAME TO "FeeStructure";
CREATE UNIQUE INDEX "FeeStructure_tenantId_level_year_term_classId_key" ON "FeeStructure"("tenantId", "level", "year", "term", "classId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "CustomFeatureRequest_tenantId_status_idx" ON "CustomFeatureRequest"("tenantId", "status");

-- CreateIndex
CREATE INDEX "CustomFeatureRequest_status_idx" ON "CustomFeatureRequest"("status");

-- CreateIndex
CREATE INDEX "BackgroundJob_tenantId_status_idx" ON "BackgroundJob"("tenantId", "status");

-- CreateIndex
CREATE INDEX "BackgroundJob_tenantId_startedById_status_idx" ON "BackgroundJob"("tenantId", "startedById", "status");

