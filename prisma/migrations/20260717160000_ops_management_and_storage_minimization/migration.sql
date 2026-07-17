-- CreateTable
CREATE TABLE IF NOT EXISTS "MpesaSuspenseReceipt" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "transId" TEXT NOT NULL,
    "transTime" TEXT NOT NULL,
    "transAmount" INTEGER NOT NULL,
    "billRefNumber" TEXT NOT NULL,
    "mpesaSenderPhone" TEXT NOT NULL,
    "mpesaSenderName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNMATCHED',
    "allocatedToStudentId" TEXT,
    "allocatedToInvoiceId" TEXT,
    "allocatedAt" TIMESTAMP(3),
    "allocatedBy" TEXT,
    "matchScore" INTEGER NOT NULL DEFAULT 0,
    "matchReasonsJson" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MpesaSuspenseReceipt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "MpesaSuspenseReceipt_transId_key" ON "MpesaSuspenseReceipt"("transId");
CREATE INDEX IF NOT EXISTS "MpesaSuspenseReceipt_tenantId_status_transTime_idx" ON "MpesaSuspenseReceipt"("tenantId", "status", "transTime");

-- CreateTable
CREATE TABLE IF NOT EXISTS "TenantHealthSnapshot" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "healthScore" INTEGER NOT NULL DEFAULT 100,
    "churnRiskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "attendanceScore" INTEGER NOT NULL DEFAULT 100,
    "feeLedgerScore" INTEGER NOT NULL DEFAULT 100,
    "leadershipLoginScore" INTEGER NOT NULL DEFAULT 100,
    "errorRateScore" INTEGER NOT NULL DEFAULT 100,
    "topFrictionReason" TEXT,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantHealthSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "TenantHealthSnapshot_tenantId_calculatedAt_idx" ON "TenantHealthSnapshot"("tenantId", "calculatedAt");
CREATE INDEX IF NOT EXISTS "TenantHealthSnapshot_churnRiskLevel_healthScore_idx" ON "TenantHealthSnapshot"("churnRiskLevel", "healthScore");

-- CreateTable
CREATE TABLE IF NOT EXISTS "SupportImpersonationToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "targetTenantId" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "isReadOnly" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportImpersonationToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SupportImpersonationToken_token_key" ON "SupportImpersonationToken"("token");
CREATE INDEX IF NOT EXISTS "SupportImpersonationToken_token_expiresAt_revokedAt_idx" ON "SupportImpersonationToken"("token", "expiresAt", "revokedAt");
CREATE INDEX IF NOT EXISTS "SupportImpersonationToken_targetTenantId_targetUserId_idx" ON "SupportImpersonationToken"("targetTenantId", "targetUserId");

-- CreateTable
CREATE TABLE IF NOT EXISTS "SupportImpersonationLog" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "targetTenantId" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "metadataJson" TEXT NOT NULL DEFAULT '{}',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportImpersonationLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SupportImpersonationLog_tokenId_timestamp_idx" ON "SupportImpersonationLog"("tokenId", "timestamp");
CREATE INDEX IF NOT EXISTS "SupportImpersonationLog_targetTenantId_timestamp_idx" ON "SupportImpersonationLog"("targetTenantId", "timestamp");

-- CreateTable
CREATE TABLE IF NOT EXISTS "PlatformMaintenanceWindow" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "scheduledStartAt" TIMESTAMP(3) NOT NULL,
    "scheduledEndAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "isReadOnlyLock" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformMaintenanceWindow_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PlatformMaintenanceWindow_status_scheduledStartAt_scheduledEndAt_idx" ON "PlatformMaintenanceWindow"("status", "scheduledStartAt", "scheduledEndAt");

-- CreateTable
CREATE TABLE IF NOT EXISTS "TenantSmsTelemetry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "totalAttempted" INTEGER NOT NULL DEFAULT 0,
    "totalDelivered" INTEGER NOT NULL DEFAULT 0,
    "totalRejected" INTEGER NOT NULL DEFAULT 0,
    "totalDndBlocked" INTEGER NOT NULL DEFAULT 0,
    "dndRatePct" INTEGER NOT NULL DEFAULT 0,
    "autoFallbackEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantSmsTelemetry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "TenantSmsTelemetry_tenantId_periodKey_key" ON "TenantSmsTelemetry"("tenantId", "periodKey");
CREATE INDEX IF NOT EXISTS "TenantSmsTelemetry_tenantId_dndRatePct_idx" ON "TenantSmsTelemetry"("tenantId", "dndRatePct");

-- CreateTable
CREATE TABLE IF NOT EXISTS "StorageVaultBlob" (
    "id" TEXT NOT NULL,
    "checksumSha256" TEXT NOT NULL,
    "storageUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "originalSizeBytes" INTEGER,
    "compressionRatioPct" INTEGER NOT NULL DEFAULT 100,
    "referenceCount" INTEGER NOT NULL DEFAULT 1,
    "firstUploadedByTenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StorageVaultBlob_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "StorageVaultBlob_checksumSha256_key" ON "StorageVaultBlob"("checksumSha256");
CREATE INDEX IF NOT EXISTS "StorageVaultBlob_checksumSha256_idx" ON "StorageVaultBlob"("checksumSha256");

-- CreateTable
CREATE TABLE IF NOT EXISTS "StorageArchiveTier" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "tierName" TEXT NOT NULL,
    "totalFilesCount" INTEGER NOT NULL DEFAULT 0,
    "totalSizeBytes" INTEGER NOT NULL DEFAULT 0,
    "lastArchivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StorageArchiveTier_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "StorageArchiveTier_tenantId_tierName_key" ON "StorageArchiveTier"("tenantId", "tierName");
CREATE INDEX IF NOT EXISTS "StorageArchiveTier_tenantId_idx" ON "StorageArchiveTier"("tenantId");

-- AddForeignKey
ALTER TABLE "MpesaSuspenseReceipt" ADD CONSTRAINT "MpesaSuspenseReceipt_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TenantHealthSnapshot" ADD CONSTRAINT "TenantHealthSnapshot_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TenantSmsTelemetry" ADD CONSTRAINT "TenantSmsTelemetry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StorageArchiveTier" ADD CONSTRAINT "StorageArchiveTier_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
