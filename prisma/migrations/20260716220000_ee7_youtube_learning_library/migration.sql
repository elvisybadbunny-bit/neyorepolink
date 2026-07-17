-- AlterTable
ALTER TABLE "LearningVideo" ADD COLUMN "subjectId" TEXT,
ADD COLUMN "strandId" TEXT,
ADD COLUMN "substrandId" TEXT,
ADD COLUMN "grade" TEXT,
ADD COLUMN "scope" TEXT NOT NULL DEFAULT 'SCHOOL',
ADD COLUMN "approvalStatus" TEXT NOT NULL DEFAULT 'APPROVED',
ADD COLUMN "approvedById" TEXT,
ADD COLUMN "approvedByName" TEXT,
ADD COLUMN "approvedAt" TIMESTAMP(3),
ADD COLUMN "rejectionReason" TEXT;

-- CreateIndex
CREATE INDEX "LearningVideo_strandId_approvalStatus_idx" ON "LearningVideo"("strandId", "approvalStatus");

-- CreateIndex
CREATE INDEX "LearningVideo_subjectId_grade_approvalStatus_idx" ON "LearningVideo"("subjectId", "grade", "approvalStatus");

-- CreateIndex
CREATE INDEX "LearningVideo_scope_approvalStatus_idx" ON "LearningVideo"("scope", "approvalStatus");

-- AddForeignKey
ALTER TABLE "LearningVideo" ADD CONSTRAINT "LearningVideo_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningVideo" ADD CONSTRAINT "LearningVideo_strandId_fkey" FOREIGN KEY ("strandId") REFERENCES "CbcStrand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningVideo" ADD CONSTRAINT "LearningVideo_substrandId_fkey" FOREIGN KEY ("substrandId") REFERENCES "CbcSubstrand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
