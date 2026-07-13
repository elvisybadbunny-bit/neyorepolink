-- CreateTable
CREATE TABLE "ElectiveBlockAutoBuildRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'ELECTIVES',
    "previewJson" TEXT NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'PREVIEWED',
    "createdElectiveBlockId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" DATETIME,
    CONSTRAINT "ElectiveBlockAutoBuildRun_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ElectiveBlockAutoBuildRun_tenantId_createdAt_idx" ON "ElectiveBlockAutoBuildRun"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "ElectiveBlockAutoBuildRun_tenantId_level_idx" ON "ElectiveBlockAutoBuildRun"("tenantId", "level");
