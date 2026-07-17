-- AlterTable
ALTER TABLE "ScannedExamPaper" ADD COLUMN "sharingApprovalStatus" TEXT NOT NULL DEFAULT 'NONE',
ADD COLUMN "sharingRequestedById" TEXT,
ADD COLUMN "sharingRequestedByName" TEXT,
ADD COLUMN "sharingRequestedAt" TIMESTAMP(3),
ADD COLUMN "sharingDecidedById" TEXT,
ADD COLUMN "sharingDecidedByName" TEXT,
ADD COLUMN "sharingDecidedAt" TIMESTAMP(3),
ADD COLUMN "sharingDecisionNote" TEXT;

-- CreateIndex
CREATE INDEX "ScannedExamPaper_privacyTier_sharingApprovalStatus_idx" ON "ScannedExamPaper"("privacyTier", "sharingApprovalStatus");
