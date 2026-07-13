-- AlterTable
ALTER TABLE "User" ADD COLUMN "lastLoginAt" DATETIME;

-- CreateTable
CREATE TABLE "TeacherCashPaymentRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "submittedByName" TEXT NOT NULL,
    "amountKes" INTEGER NOT NULL,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "decidedById" TEXT,
    "decidedByName" TEXT,
    "decidedAt" DATETIME,
    "rejectReason" TEXT,
    "resultPaymentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeacherCashPaymentRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TeacherCashPaymentRequest_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CafeteriaFeePlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "classId" TEXT,
    "meals" TEXT NOT NULL,
    "termFeeKes" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "term" INTEGER NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CafeteriaFeePlan_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CafeteriaEnrollmentRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "requestedByName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "decidedById" TEXT,
    "decidedByName" TEXT,
    "decidedAt" DATETIME,
    "declineReason" TEXT,
    "resultCardId" TEXT,
    "resultNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CafeteriaEnrollmentRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CafeteriaEnrollmentRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MealCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "cardNo" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "admissionNo" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "meals" TEXT NOT NULL,
    "termFeeKes" INTEGER NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "term" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" DATETIME,
    "followsLiveDefault" BOOLEAN NOT NULL DEFAULT false,
    "feePlanId" TEXT,
    CONSTRAINT "MealCard_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MealCard_feePlanId_fkey" FOREIGN KEY ("feePlanId") REFERENCES "CafeteriaFeePlan" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_MealCard" ("active", "admissionNo", "cancelledAt", "cardNo", "id", "invoiceId", "issuedAt", "meals", "planName", "studentId", "studentName", "tenantId", "term", "termFeeKes", "year") SELECT "active", "admissionNo", "cancelledAt", "cardNo", "id", "invoiceId", "issuedAt", "meals", "planName", "studentId", "studentName", "tenantId", "term", "termFeeKes", "year" FROM "MealCard";
DROP TABLE "MealCard";
ALTER TABLE "new_MealCard" RENAME TO "MealCard";
CREATE INDEX "MealCard_tenantId_studentId_idx" ON "MealCard"("tenantId", "studentId");
CREATE UNIQUE INDEX "MealCard_tenantId_cardNo_key" ON "MealCard"("tenantId", "cardNo");
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
    CONSTRAINT "Tenant_referredByTenantId_fkey" FOREIGN KEY ("referredByTenantId") REFERENCES "Tenant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Tenant" ("about", "addressLine", "allowParentTransportRequests", "brandAccent", "brandPrimary", "cafeteriaMealModel", "cafeteriaMealScope", "cafeteriaTableSize", "collectionTargetPct", "county", "createdAt", "curriculum", "dekIv", "dekTag", "demoExpiresAt", "documentDesignJson", "educationLevelsOffered", "email", "enabledPathwayGroups", "encryptedDek", "enforce2Fa", "expenseApprovalThresholdKes", "gpsLat", "gpsLng", "gpsRadiusM", "hasClaimedReferral", "id", "idPrefix", "isDemo", "joiningRequirements", "libraryFinePerDayKes", "libraryFinesEnabled", "logoUrl", "mission", "motto", "name", "navVisibility", "onboardedAt", "osKey", "pathwaySchoolType", "phone", "poApprovalThresholdKes", "principalSignatureUrl", "printLimitPerDay", "printStationMode", "referralCode", "referredByTenantId", "requireBiometricForFinance", "requireJointOwnerApproval", "schoolStampUrl", "schoolType", "showReligiousHolidays", "siblingDiscountPct", "slug", "socialLinks", "transportMidTermBillingRule", "uniformSupplierName", "uniformSupplierPhone", "updatedAt", "vision") SELECT "about", "addressLine", "allowParentTransportRequests", "brandAccent", "brandPrimary", "cafeteriaMealModel", "cafeteriaMealScope", "cafeteriaTableSize", "collectionTargetPct", "county", "createdAt", "curriculum", "dekIv", "dekTag", "demoExpiresAt", "documentDesignJson", "educationLevelsOffered", "email", "enabledPathwayGroups", "encryptedDek", "enforce2Fa", "expenseApprovalThresholdKes", "gpsLat", "gpsLng", "gpsRadiusM", "hasClaimedReferral", "id", "idPrefix", "isDemo", "joiningRequirements", "libraryFinePerDayKes", "libraryFinesEnabled", "logoUrl", "mission", "motto", "name", "navVisibility", "onboardedAt", "osKey", "pathwaySchoolType", "phone", "poApprovalThresholdKes", "principalSignatureUrl", "printLimitPerDay", "printStationMode", "referralCode", "referredByTenantId", "requireBiometricForFinance", "requireJointOwnerApproval", "schoolStampUrl", "schoolType", "showReligiousHolidays", "siblingDiscountPct", "slug", "socialLinks", "transportMidTermBillingRule", "uniformSupplierName", "uniformSupplierPhone", "updatedAt", "vision" FROM "Tenant";
DROP TABLE "Tenant";
ALTER TABLE "new_Tenant" RENAME TO "Tenant";
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");
CREATE UNIQUE INDEX "Tenant_idPrefix_key" ON "Tenant"("idPrefix");
CREATE UNIQUE INDEX "Tenant_referralCode_key" ON "Tenant"("referralCode");
CREATE INDEX "Tenant_osKey_idx" ON "Tenant"("osKey");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "TeacherCashPaymentRequest_tenantId_status_idx" ON "TeacherCashPaymentRequest"("tenantId", "status");

-- CreateIndex
CREATE INDEX "TeacherCashPaymentRequest_tenantId_invoiceId_idx" ON "TeacherCashPaymentRequest"("tenantId", "invoiceId");

-- CreateIndex
CREATE INDEX "CafeteriaFeePlan_tenantId_archived_idx" ON "CafeteriaFeePlan"("tenantId", "archived");

-- CreateIndex
CREATE UNIQUE INDEX "CafeteriaFeePlan_tenantId_level_year_term_classId_key" ON "CafeteriaFeePlan"("tenantId", "level", "year", "term", "classId");

-- CreateIndex
CREATE INDEX "CafeteriaEnrollmentRequest_tenantId_status_idx" ON "CafeteriaEnrollmentRequest"("tenantId", "status");

-- CreateIndex
CREATE INDEX "CafeteriaEnrollmentRequest_tenantId_studentId_idx" ON "CafeteriaEnrollmentRequest"("tenantId", "studentId");
