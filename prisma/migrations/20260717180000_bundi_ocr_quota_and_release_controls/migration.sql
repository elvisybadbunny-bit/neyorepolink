-- CreateTable
CREATE TABLE IF NOT EXISTS "BundiOcrTelemetryAndQuota" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "freeAllowanceUsed" INTEGER NOT NULL DEFAULT 0,
    "topUpScansPurchased" INTEGER NOT NULL DEFAULT 0,
    "topUpScansUsed" INTEGER NOT NULL DEFAULT 0,
    "totalPagesScanned" INTEGER NOT NULL DEFAULT 0,
    "lastScannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BundiOcrTelemetryAndQuota_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BundiOcrTelemetryAndQuota_tenantId_periodKey_key" ON "BundiOcrTelemetryAndQuota"("tenantId", "periodKey");
CREATE INDEX IF NOT EXISTS "BundiOcrTelemetryAndQuota_tenantId_idx" ON "BundiOcrTelemetryAndQuota"("tenantId");

-- CreateTable
CREATE TABLE IF NOT EXISTS "BundiScanTopUpOrder" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "bundleKey" TEXT NOT NULL,
    "scansAdded" INTEGER NOT NULL,
    "priceKes" INTEGER NOT NULL,
    "invoiceId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PAID',
    "purchasedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BundiScanTopUpOrder_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "BundiScanTopUpOrder_tenantId_periodKey_status_idx" ON "BundiScanTopUpOrder"("tenantId", "periodKey", "status");

-- CreateTable
CREATE TABLE IF NOT EXISTS "FeatureReleaseControl" (
    "id" TEXT NOT NULL,
    "featureKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LIVE',
    "whitelistedTenantIdsJson" TEXT NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "updatedBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureReleaseControl_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "FeatureReleaseControl_featureKey_key" ON "FeatureReleaseControl"("featureKey");
CREATE INDEX IF NOT EXISTS "FeatureReleaseControl_status_featureKey_idx" ON "FeatureReleaseControl"("status", "featureKey");

-- AddForeignKey
ALTER TABLE "BundiOcrTelemetryAndQuota" ADD CONSTRAINT "BundiOcrTelemetryAndQuota_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BundiScanTopUpOrder" ADD CONSTRAINT "BundiScanTopUpOrder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
