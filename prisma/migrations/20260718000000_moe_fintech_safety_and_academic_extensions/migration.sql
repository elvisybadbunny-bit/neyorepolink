-- AlterTable
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "specialNeedsCode" TEXT;
ALTER TABLE "StaffProfile" ADD COLUMN IF NOT EXISTS "nssfNo" TEXT;
ALTER TABLE "StaffProfile" ADD COLUMN IF NOT EXISTS "nhifNo" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "MoeStatutoryReturn" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "termKey" TEXT NOT NULL,
    "returnType" TEXT NOT NULL,
    "totalBoys" INTEGER NOT NULL DEFAULT 0,
    "totalGirls" INTEGER NOT NULL DEFAULT 0,
    "totalTeachers" INTEGER NOT NULL DEFAULT 0,
    "classroomCount" INTEGER NOT NULL DEFAULT 0,
    "textbookCount" INTEGER NOT NULL DEFAULT 0,
    "crowdingIndexPct" INTEGER NOT NULL DEFAULT 0,
    "textbookRatioStr" TEXT NOT NULL DEFAULT '1:1',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MoeStatutoryReturn_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "MoeStatutoryReturn_tenantId_termKey_returnType_key" ON "MoeStatutoryReturn"("tenantId", "termKey", "returnType");
CREATE INDEX IF NOT EXISTS "MoeStatutoryReturn_tenantId_idx" ON "MoeStatutoryReturn"("tenantId");

-- CreateTable
CREATE TABLE IF NOT EXISTS "TreasuryCheckAndBankSlip" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT,
    "guardianId" TEXT,
    "checkOrSlipNo" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "maturityDate" TIMESTAMP(3) NOT NULL,
    "amountKes" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_CLEARANCE',
    "reminderSentAt" TIMESTAMP(3),
    "clearedAt" TIMESTAMP(3),
    "clearedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TreasuryCheckAndBankSlip_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "TreasuryCheckAndBankSlip_tenantId_checkOrSlipNo_key" ON "TreasuryCheckAndBankSlip"("tenantId", "checkOrSlipNo");
CREATE INDEX IF NOT EXISTS "TreasuryCheckAndBankSlip_tenantId_status_maturityDate_idx" ON "TreasuryCheckAndBankSlip"("tenantId", "status", "maturityDate");

-- CreateTable
CREATE TABLE IF NOT EXISTS "StudentPocketWallet" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "balanceKes" INTEGER NOT NULL DEFAULT 0,
    "totalDepositedKes" INTEGER NOT NULL DEFAULT 0,
    "totalSpentKes" INTEGER NOT NULL DEFAULT 0,
    "isFrozen" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentPocketWallet_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "StudentPocketWallet_studentId_key" ON "StudentPocketWallet"("studentId");
CREATE INDEX IF NOT EXISTS "StudentPocketWallet_tenantId_idx" ON "StudentPocketWallet"("tenantId");

-- CreateTable
CREATE TABLE IF NOT EXISTS "PocketWalletTransaction" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amountKes" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PocketWalletTransaction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PocketWalletTransaction_walletId_createdAt_idx" ON "PocketWalletTransaction"("walletId", "createdAt");
CREATE INDEX IF NOT EXISTS "PocketWalletTransaction_tenantId_studentId_idx" ON "PocketWalletTransaction"("tenantId", "studentId");

-- CreateTable
CREATE TABLE IF NOT EXISTS "BoardingExeatPass" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "passNo" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "departureTime" TIMESTAMP(3) NOT NULL,
    "expectedReturnTime" TIMESTAMP(3) NOT NULL,
    "actualDepartureTime" TIMESTAMP(3),
    "actualReturnTime" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "gateCheckedOutBy" TEXT,
    "gateCheckedInBy" TEXT,
    "qrDataUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BoardingExeatPass_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BoardingExeatPass_passNo_key" ON "BoardingExeatPass"("passNo");
CREATE INDEX IF NOT EXISTS "BoardingExeatPass_tenantId_status_idx" ON "BoardingExeatPass"("tenantId", "status");
CREATE INDEX IF NOT EXISTS "BoardingExeatPass_studentId_status_idx" ON "BoardingExeatPass"("studentId", "status");

-- CreateTable
CREATE TABLE IF NOT EXISTS "InfirmaryDosageLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "medicationPlanId" TEXT,
    "doseName" TEXT NOT NULL,
    "scheduledTime" TEXT NOT NULL,
    "administeredAt" TIMESTAMP(3),
    "administeredBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InfirmaryDosageLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "InfirmaryDosageLog_tenantId_createdAt_status_idx" ON "InfirmaryDosageLog"("tenantId", "createdAt", "status");
CREATE INDEX IF NOT EXISTS "InfirmaryDosageLog_studentId_idx" ON "InfirmaryDosageLog"("studentId");

-- CreateTable
CREATE TABLE IF NOT EXISTS "KnecCandidateRegistration" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "admissionNo" TEXT NOT NULL,
    "knecCentreCode" TEXT NOT NULL,
    "candidateType" TEXT NOT NULL,
    "indexNumber" TEXT NOT NULL,
    "photo300x300Url" TEXT,
    "placementExamId" TEXT,
    "meritRank" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'REGISTERED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnecCandidateRegistration_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "KnecCandidateRegistration_tenantId_knecCentreCode_indexNumber_key" ON "KnecCandidateRegistration"("tenantId", "knecCentreCode", "indexNumber");
CREATE INDEX IF NOT EXISTS "KnecCandidateRegistration_tenantId_candidateType_indexNumber_idx" ON "KnecCandidateRegistration"("tenantId", "candidateType", "indexNumber");

-- CreateTable
CREATE TABLE IF NOT EXISTS "SchoolTournamentTrip" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "transportRouteId" TEXT,
    "perDiemKes" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SchoolTournamentTrip_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SchoolTournamentTrip_tenantId_eventDate_idx" ON "SchoolTournamentTrip"("tenantId", "eventDate");

-- CreateTable
CREATE TABLE IF NOT EXISTS "TournamentParticipant" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "feeClearanceOk" BOOLEAN NOT NULL DEFAULT true,
    "parentConsentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "busSeatNo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TournamentParticipant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "TournamentParticipant_tripId_studentId_key" ON "TournamentParticipant"("tripId", "studentId");
CREATE INDEX IF NOT EXISTS "TournamentParticipant_tenantId_tripId_idx" ON "TournamentParticipant"("tenantId", "tripId");

-- CreateTable
CREATE TABLE IF NOT EXISTS "TeacherRecordOfWork" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "teacherName" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "strandName" TEXT NOT NULL,
    "substrandName" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "dateCovered" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COVERED',
    "supervisorComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherRecordOfWork_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "TeacherRecordOfWork_tenantId_teacherId_weekNumber_idx" ON "TeacherRecordOfWork"("tenantId", "teacherId", "weekNumber");
CREATE INDEX IF NOT EXISTS "TeacherRecordOfWork_tenantId_subjectId_classId_idx" ON "TeacherRecordOfWork"("tenantId", "subjectId", "classId");

-- CreateTable
CREATE TABLE IF NOT EXISTS "PtaConsultationSlot" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "teacherName" TEXT NOT NULL,
    "slotDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,
    "bookedByGuardianId" TEXT,
    "bookedByStudentId" TEXT,
    "bookedTopic" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PtaConsultationSlot_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PtaConsultationSlot_tenantId_teacherId_slotDate_startTime_key" ON "PtaConsultationSlot"("tenantId", "teacherId", "slotDate", "startTime");
CREATE INDEX IF NOT EXISTS "PtaConsultationSlot_tenantId_isBooked_slotDate_idx" ON "PtaConsultationSlot"("tenantId", "isBooked", "slotDate");

-- CreateTable
CREATE TABLE IF NOT EXISTS "BomGovernanceDocument" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "requiresVote" BOOLEAN NOT NULL DEFAULT false,
    "votesYes" INTEGER NOT NULL DEFAULT 0,
    "votesNo" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BomGovernanceDocument_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "BomGovernanceDocument_tenantId_category_status_idx" ON "BomGovernanceDocument"("tenantId", "category", "status");

-- CreateTable
CREATE TABLE IF NOT EXISTS "LostAndFoundItem" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "locationFound" TEXT NOT NULL,
    "photoUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'UNCLAIMED',
    "foundBy" TEXT NOT NULL,
    "claimedByStudentId" TEXT,
    "claimedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LostAndFoundItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "LostAndFoundItem_tenantId_status_createdAt_idx" ON "LostAndFoundItem"("tenantId", "status", "createdAt");

-- AddForeignKey
ALTER TABLE "MoeStatutoryReturn" ADD CONSTRAINT "MoeStatutoryReturn_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TreasuryCheckAndBankSlip" ADD CONSTRAINT "TreasuryCheckAndBankSlip_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentPocketWallet" ADD CONSTRAINT "StudentPocketWallet_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentPocketWallet" ADD CONSTRAINT "StudentPocketWallet_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PocketWalletTransaction" ADD CONSTRAINT "PocketWalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "StudentPocketWallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BoardingExeatPass" ADD CONSTRAINT "BoardingExeatPass_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InfirmaryDosageLog" ADD CONSTRAINT "InfirmaryDosageLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KnecCandidateRegistration" ADD CONSTRAINT "KnecCandidateRegistration_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SchoolTournamentTrip" ADD CONSTRAINT "SchoolTournamentTrip_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TournamentParticipant" ADD CONSTRAINT "TournamentParticipant_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "SchoolTournamentTrip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherRecordOfWork" ADD CONSTRAINT "TeacherRecordOfWork_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PtaConsultationSlot" ADD CONSTRAINT "PtaConsultationSlot_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BomGovernanceDocument" ADD CONSTRAINT "BomGovernanceDocument_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LostAndFoundItem" ADD CONSTRAINT "LostAndFoundItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
