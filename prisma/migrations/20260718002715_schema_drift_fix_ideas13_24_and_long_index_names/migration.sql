-- AlterTable
ALTER TABLE "Subscription" ALTER COLUMN "planKey" SET DEFAULT 'msingi';

-- CreateTable
CREATE TABLE "BomStaffPayroll" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "staffName" TEXT NOT NULL,
    "idNumber" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "bankAccount" TEXT NOT NULL,
    "basicPay" DOUBLE PRECISION NOT NULL,
    "grossPay" DOUBLE PRECISION NOT NULL,
    "shifDeduction" DOUBLE PRECISION NOT NULL,
    "nssfTier1" DOUBLE PRECISION NOT NULL,
    "nssfTier2" DOUBLE PRECISION NOT NULL,
    "housingLevy" DOUBLE PRECISION NOT NULL,
    "payeTax" DOUBLE PRECISION NOT NULL,
    "netPay" DOUBLE PRECISION NOT NULL,
    "payPeriod" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "remittanceCsvPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BomStaffPayroll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FleetVehicleLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "registrationNo" TEXT NOT NULL,
    "makeModel" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 62,
    "odometerKm" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ntsaExpiry" TIMESTAMP(3) NOT NULL,
    "insuranceExpiry" TIMESTAMP(3) NOT NULL,
    "safetyScore" INTEGER NOT NULL DEFAULT 100,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FleetVehicleLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FleetFuelEntry" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "liters" DOUBLE PRECISION NOT NULL,
    "costPerLiter" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "receiptPhotoUrl" TEXT,
    "fuelEfficiencyKmL" DOUBLE PRECISION NOT NULL,
    "anomalyFlagged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FleetFuelEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampusDisciplineEntry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "incidentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "severityLevel" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "demerits" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL,
    "summonsLetterPdfUrl" TEXT,
    "parentNotifiedSms" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'LOGGED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampusDisciplineEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CounselingRecord" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "counselorName" TEXT NOT NULL,
    "sessionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "encryptedNotes" TEXT NOT NULL,
    "wellnessScore" INTEGER NOT NULL DEFAULT 5,
    "status" TEXT NOT NULL DEFAULT 'ONGOING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CounselingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KitchenStoreRequisition" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "stockOnHand" DOUBLE PRECISION NOT NULL,
    "activeStudentCount" INTEGER NOT NULL,
    "theoreticalRequiredKg" DOUBLE PRECISION NOT NULL,
    "issuedQuantityKg" DOUBLE PRECISION NOT NULL,
    "divergencePct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "divergenceFlagged" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KitchenStoreRequisition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierLpo" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "lpoNumber" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "supplierPin" TEXT NOT NULL,
    "itemDescription" TEXT NOT NULL,
    "totalAmountKes" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ISSUED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplierLpo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostelBedAllocation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dormitoryName" TEXT NOT NULL,
    "cubicleNumber" TEXT NOT NULL,
    "bunkType" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "mattressTag" TEXT NOT NULL,
    "lockerTag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HostelBedAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostelVandalismInspection" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "lockerTag" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "recoveryFeeKes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "feeInvoiceStamped" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HostelVandalismInspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolFarmLedger" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "enterprise" TEXT NOT NULL,
    "dailyYield" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "kitchenTransferQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mpesaStaffSalesKes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "internalRateKes" DOUBLE PRECISION NOT NULL DEFAULT 60,
    "totalInternalCreditKes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "entryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SchoolFarmLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffLeaveSubstitution" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "teacherName" TEXT NOT NULL,
    "leaveType" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "medicalChitUrl" TEXT,
    "affectedLessonsCount" INTEGER NOT NULL DEFAULT 0,
    "substituteTeacherId" TEXT,
    "substituteTeacherName" TEXT,
    "substituteSmsSent" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffLeaveSubstitution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapitalAssetRegistry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "qrTag" TEXT NOT NULL,
    "assetName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "runningHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nextServiceHours" DOUBLE PRECISION NOT NULL DEFAULT 250,
    "status" TEXT NOT NULL DEFAULT 'OPERATIONAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CapitalAssetRegistry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabReagentRegister" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "reagentName" TEXT NOT NULL,
    "quantityLiters" DOUBLE PRECISION NOT NULL,
    "molarity" TEXT NOT NULL,
    "hazardClass" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LabReagentRegister_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlumniEndowmentCampaign" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "targetAmountKes" DOUBLE PRECISION NOT NULL,
    "raisedAmountKes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlumniEndowmentCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlumniPledge" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "alumniName" TEXT NOT NULL,
    "cohortYear" TEXT NOT NULL,
    "amountKes" DOUBLE PRECISION NOT NULL,
    "mpesaReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlumniPledge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitorGateLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "visitorName" TEXT NOT NULL,
    "nationalId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "hostStaffId" TEXT,
    "hostStaffName" TEXT,
    "purpose" TEXT NOT NULL,
    "custodyAlertTriggered" BOOLEAN NOT NULL DEFAULT false,
    "entryApproved" BOOLEAN NOT NULL DEFAULT true,
    "qrBadgePassId" TEXT NOT NULL,
    "checkInTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkOutTime" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'CHECKED_IN',

    CONSTRAINT "VisitorGateLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoursebookAllocation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "bookTitle" TEXT NOT NULL,
    "copyBarcode" TEXT NOT NULL,
    "issuedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ISSUED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoursebookAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TextbookFineRecovery" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "bookTitle" TEXT NOT NULL,
    "copyBarcode" TEXT NOT NULL,
    "replacementCostKes" DOUBLE PRECISION NOT NULL,
    "invoiceSuspenseStamped" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TextbookFineRecovery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterSchoolDiaryEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "eventTitle" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "targetAudience" TEXT NOT NULL,
    "smsReminderSent" BOOLEAN NOT NULL DEFAULT false,
    "parentRsvpCount" INTEGER NOT NULL DEFAULT 0,
    "expectedGuestHeadcount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MasterSchoolDiaryEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BomStaffPayroll_tenantId_payPeriod_idx" ON "BomStaffPayroll"("tenantId", "payPeriod");

-- CreateIndex
CREATE INDEX "FleetVehicleLog_tenantId_registrationNo_idx" ON "FleetVehicleLog"("tenantId", "registrationNo");

-- CreateIndex
CREATE INDEX "CampusDisciplineEntry_tenantId_studentId_idx" ON "CampusDisciplineEntry"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "CounselingRecord_tenantId_studentId_idx" ON "CounselingRecord"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "KitchenStoreRequisition_tenantId_itemName_idx" ON "KitchenStoreRequisition"("tenantId", "itemName");

-- CreateIndex
CREATE INDEX "SupplierLpo_tenantId_lpoNumber_idx" ON "SupplierLpo"("tenantId", "lpoNumber");

-- CreateIndex
CREATE INDEX "HostelBedAllocation_tenantId_dormitoryName_studentId_idx" ON "HostelBedAllocation"("tenantId", "dormitoryName", "studentId");

-- CreateIndex
CREATE INDEX "HostelVandalismInspection_tenantId_studentId_idx" ON "HostelVandalismInspection"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "SchoolFarmLedger_tenantId_enterprise_idx" ON "SchoolFarmLedger"("tenantId", "enterprise");

-- CreateIndex
CREATE INDEX "StaffLeaveSubstitution_tenantId_teacherId_idx" ON "StaffLeaveSubstitution"("tenantId", "teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "CapitalAssetRegistry_qrTag_key" ON "CapitalAssetRegistry"("qrTag");

-- CreateIndex
CREATE INDEX "CapitalAssetRegistry_tenantId_category_idx" ON "CapitalAssetRegistry"("tenantId", "category");

-- CreateIndex
CREATE INDEX "LabReagentRegister_tenantId_reagentName_idx" ON "LabReagentRegister"("tenantId", "reagentName");

-- CreateIndex
CREATE INDEX "AlumniEndowmentCampaign_tenantId_status_idx" ON "AlumniEndowmentCampaign"("tenantId", "status");

-- CreateIndex
CREATE INDEX "VisitorGateLog_tenantId_status_checkInTime_idx" ON "VisitorGateLog"("tenantId", "status", "checkInTime");

-- CreateIndex
CREATE INDEX "CoursebookAllocation_tenantId_studentId_status_idx" ON "CoursebookAllocation"("tenantId", "studentId", "status");

-- CreateIndex
CREATE INDEX "TextbookFineRecovery_tenantId_studentId_idx" ON "TextbookFineRecovery"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "MasterSchoolDiaryEvent_tenantId_category_eventDate_idx" ON "MasterSchoolDiaryEvent"("tenantId", "category", "eventDate");

-- AddForeignKey
ALTER TABLE "BomStaffPayroll" ADD CONSTRAINT "BomStaffPayroll_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FleetVehicleLog" ADD CONSTRAINT "FleetVehicleLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FleetFuelEntry" ADD CONSTRAINT "FleetFuelEntry_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "FleetVehicleLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampusDisciplineEntry" ADD CONSTRAINT "CampusDisciplineEntry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CounselingRecord" ADD CONSTRAINT "CounselingRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitchenStoreRequisition" ADD CONSTRAINT "KitchenStoreRequisition_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierLpo" ADD CONSTRAINT "SupplierLpo_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostelBedAllocation" ADD CONSTRAINT "HostelBedAllocation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostelVandalismInspection" ADD CONSTRAINT "HostelVandalismInspection_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolFarmLedger" ADD CONSTRAINT "SchoolFarmLedger_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffLeaveSubstitution" ADD CONSTRAINT "StaffLeaveSubstitution_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapitalAssetRegistry" ADD CONSTRAINT "CapitalAssetRegistry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabReagentRegister" ADD CONSTRAINT "LabReagentRegister_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlumniEndowmentCampaign" ADD CONSTRAINT "AlumniEndowmentCampaign_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlumniPledge" ADD CONSTRAINT "AlumniPledge_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "AlumniEndowmentCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitorGateLog" ADD CONSTRAINT "VisitorGateLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoursebookAllocation" ADD CONSTRAINT "CoursebookAllocation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TextbookFineRecovery" ADD CONSTRAINT "TextbookFineRecovery_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterSchoolDiaryEvent" ADD CONSTRAINT "MasterSchoolDiaryEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "KnecCandidateRegistration_tenantId_candidateType_indexNumber_id" RENAME TO "KnecCandidateRegistration_tenant_type_index_idx";

-- RenameIndex
ALTER INDEX "KnecCandidateRegistration_tenantId_knecCentreCode_indexNumber_k" RENAME TO "KnecCandidateRegistration_tenant_centre_index_key";

-- RenameIndex
ALTER INDEX "PlatformMaintenanceWindow_status_scheduledStartAt_scheduledEndA" RENAME TO "PlatformMaintenanceWindow_status_window_idx";
