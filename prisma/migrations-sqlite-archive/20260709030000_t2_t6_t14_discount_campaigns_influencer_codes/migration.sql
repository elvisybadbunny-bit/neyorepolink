-- CreateTable
CREATE TABLE "DiscountCampaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "appliesTo" TEXT NOT NULL,
    "percentOff" REAL NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "InfluencerCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "personName" TEXT NOT NULL,
    "personPhone" TEXT,
    "personEmail" TEXT,
    "discountPct" REAL NOT NULL,
    "commissionKes" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "InfluencerCommission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "influencerCodeId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL,
    "amountKes" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OWED',
    "paidAt" DATETIME,
    "paidNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InfluencerCommission_influencerCodeId_fkey" FOREIGN KEY ("influencerCodeId") REFERENCES "InfluencerCode" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InfluencerCommission_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FamilyPaymentSplitPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "initiatedById" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,
    "totalAmountKes" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appliedAt" DATETIME,
    CONSTRAINT "FamilyPaymentSplitPlan_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FamilyPaymentSplitItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amountKes" INTEGER NOT NULL,
    CONSTRAINT "FamilyPaymentSplitItem_planId_fkey" FOREIGN KEY ("planId") REFERENCES "FamilyPaymentSplitPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "idPrefix" TEXT,
    "county" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "osKey" TEXT NOT NULL DEFAULT 'school',
    "principalSignatureUrl" TEXT,
    "schoolStampUrl" TEXT,
    "curriculum" TEXT,
    "educationLevelsOffered" TEXT,
    "onboardedAt" DATETIME,
    "referralCode" TEXT,
    "referredByTenantId" TEXT,
    "hasClaimedReferral" BOOLEAN NOT NULL DEFAULT false,
    "appliedCampaignId" TEXT,
    "appliedInfluencerCodeId" TEXT,
    "firstTermDiscountKes" INTEGER NOT NULL DEFAULT 0,
    "hasClaimedFirstTermDiscount" BOOLEAN NOT NULL DEFAULT false,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "demoExpiresAt" DATETIME,
    "schoolType" TEXT NOT NULL DEFAULT 'DAY',
    "uniformSupplierName" TEXT,
    "uniformSupplierPhone" TEXT,
    "pathwaySchoolType" TEXT NOT NULL DEFAULT 'NONE',
    "enabledPathwayGroups" TEXT DEFAULT '[]',
    "showReligiousHolidays" BOOLEAN NOT NULL DEFAULT true,
    "libraryFinesEnabled" BOOLEAN NOT NULL DEFAULT true,
    "libraryFinePerDayKes" INTEGER NOT NULL DEFAULT 10,
    "motto" TEXT,
    "vision" TEXT,
    "mission" TEXT,
    "about" TEXT,
    "logoUrl" TEXT,
    "brandPrimary" TEXT,
    "brandAccent" TEXT,
    "addressLine" TEXT,
    "socialLinks" TEXT,
    "joiningRequirements" TEXT,
    "documentDesignJson" TEXT,
    "gpsLat" REAL,
    "gpsLng" REAL,
    "gpsRadiusM" INTEGER,
    "collectionTargetPct" INTEGER NOT NULL DEFAULT 85,
    "poApprovalThresholdKes" INTEGER NOT NULL DEFAULT 50000,
    "expenseApprovalThresholdKes" INTEGER NOT NULL DEFAULT 20000,
    "siblingDiscountPct" INTEGER NOT NULL DEFAULT 0,
    "transportMidTermBillingRule" TEXT NOT NULL DEFAULT 'NEXT_TERM_ONLY',
    "allowParentTransportRequests" BOOLEAN NOT NULL DEFAULT false,
    "allowParentCafeteriaRequests" BOOLEAN NOT NULL DEFAULT false,
    "requireBiometricForFinance" BOOLEAN NOT NULL DEFAULT false,
    "allowTeacherCashPayments" BOOLEAN NOT NULL DEFAULT false,
    "feeReminderGraceDays" INTEGER NOT NULL DEFAULT 0,
    "feeReminderDedupeDays" INTEGER NOT NULL DEFAULT 3,
    "enforce2Fa" BOOLEAN NOT NULL DEFAULT false,
    "requireJointOwnerApproval" BOOLEAN NOT NULL DEFAULT false,
    "printLimitPerDay" INTEGER DEFAULT 0,
    "printStationMode" TEXT NOT NULL DEFAULT 'AUTO',
    "cafeteriaTableSize" INTEGER NOT NULL DEFAULT 8,
    "cafeteriaMealModel" TEXT NOT NULL DEFAULT 'HYBRID',
    "cafeteriaMealScope" TEXT NOT NULL DEFAULT 'ALL',
    "navVisibility" TEXT,
    "encryptedDek" TEXT,
    "dekIv" TEXT,
    "dekTag" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Tenant_referredByTenantId_fkey" FOREIGN KEY ("referredByTenantId") REFERENCES "Tenant" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Tenant_appliedInfluencerCodeId_fkey" FOREIGN KEY ("appliedInfluencerCodeId") REFERENCES "InfluencerCode" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Tenant" ("about", "addressLine", "allowParentCafeteriaRequests", "allowParentTransportRequests", "allowTeacherCashPayments", "brandAccent", "brandPrimary", "cafeteriaMealModel", "cafeteriaMealScope", "cafeteriaTableSize", "collectionTargetPct", "county", "createdAt", "curriculum", "dekIv", "dekTag", "demoExpiresAt", "documentDesignJson", "educationLevelsOffered", "email", "enabledPathwayGroups", "encryptedDek", "enforce2Fa", "expenseApprovalThresholdKes", "feeReminderDedupeDays", "feeReminderGraceDays", "gpsLat", "gpsLng", "gpsRadiusM", "hasClaimedReferral", "id", "idPrefix", "isDemo", "joiningRequirements", "libraryFinePerDayKes", "libraryFinesEnabled", "logoUrl", "mission", "motto", "name", "navVisibility", "onboardedAt", "osKey", "pathwaySchoolType", "phone", "poApprovalThresholdKes", "principalSignatureUrl", "printLimitPerDay", "printStationMode", "referralCode", "referredByTenantId", "requireBiometricForFinance", "requireJointOwnerApproval", "schoolStampUrl", "schoolType", "showReligiousHolidays", "siblingDiscountPct", "slug", "socialLinks", "transportMidTermBillingRule", "uniformSupplierName", "uniformSupplierPhone", "updatedAt", "vision") SELECT "about", "addressLine", "allowParentCafeteriaRequests", "allowParentTransportRequests", "allowTeacherCashPayments", "brandAccent", "brandPrimary", "cafeteriaMealModel", "cafeteriaMealScope", "cafeteriaTableSize", "collectionTargetPct", "county", "createdAt", "curriculum", "dekIv", "dekTag", "demoExpiresAt", "documentDesignJson", "educationLevelsOffered", "email", "enabledPathwayGroups", "encryptedDek", "enforce2Fa", "expenseApprovalThresholdKes", "feeReminderDedupeDays", "feeReminderGraceDays", "gpsLat", "gpsLng", "gpsRadiusM", "hasClaimedReferral", "id", "idPrefix", "isDemo", "joiningRequirements", "libraryFinePerDayKes", "libraryFinesEnabled", "logoUrl", "mission", "motto", "name", "navVisibility", "onboardedAt", "osKey", "pathwaySchoolType", "phone", "poApprovalThresholdKes", "principalSignatureUrl", "printLimitPerDay", "printStationMode", "referralCode", "referredByTenantId", "requireBiometricForFinance", "requireJointOwnerApproval", "schoolStampUrl", "schoolType", "showReligiousHolidays", "siblingDiscountPct", "slug", "socialLinks", "transportMidTermBillingRule", "uniformSupplierName", "uniformSupplierPhone", "updatedAt", "vision" FROM "Tenant";
DROP TABLE "Tenant";
ALTER TABLE "new_Tenant" RENAME TO "Tenant";
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");
CREATE UNIQUE INDEX "Tenant_idPrefix_key" ON "Tenant"("idPrefix");
CREATE UNIQUE INDEX "Tenant_referralCode_key" ON "Tenant"("referralCode");
CREATE INDEX "Tenant_osKey_idx" ON "Tenant"("osKey");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "DiscountCampaign_appliesTo_active_idx" ON "DiscountCampaign"("appliesTo", "active");

-- CreateIndex
CREATE INDEX "DiscountCampaign_startDate_endDate_idx" ON "DiscountCampaign"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "InfluencerCode_code_key" ON "InfluencerCode"("code");

-- CreateIndex
CREATE INDEX "InfluencerCode_active_idx" ON "InfluencerCode"("active");

-- CreateIndex
CREATE INDEX "InfluencerCommission_status_idx" ON "InfluencerCommission"("status");

-- CreateIndex
CREATE UNIQUE INDEX "InfluencerCommission_influencerCodeId_tenantId_key" ON "InfluencerCommission"("influencerCodeId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyPaymentSplitPlan_paymentId_key" ON "FamilyPaymentSplitPlan"("paymentId");

-- CreateIndex
CREATE INDEX "FamilyPaymentSplitPlan_tenantId_status_idx" ON "FamilyPaymentSplitPlan"("tenantId", "status");

-- CreateIndex
CREATE INDEX "FamilyPaymentSplitItem_planId_idx" ON "FamilyPaymentSplitItem"("planId");

