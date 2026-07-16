-- AlterTable
ALTER TABLE "CbcAssessment" ADD COLUMN     "commentFromBank" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "substrandId" TEXT;

-- CreateTable
CREATE TABLE "CbcSubstrand" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "strandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "learningOutcome" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CbcSubstrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CbcCommentBankEntry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "strandId" TEXT,
    "substrandId" TEXT,
    "level" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CbcCommentBankEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CbcSubstrand_tenantId_strandId_idx" ON "CbcSubstrand"("tenantId", "strandId");

-- CreateIndex
CREATE UNIQUE INDEX "CbcSubstrand_tenantId_strandId_name_key" ON "CbcSubstrand"("tenantId", "strandId", "name");

-- CreateIndex
CREATE INDEX "CbcCommentBankEntry_tenantId_subjectId_level_idx" ON "CbcCommentBankEntry"("tenantId", "subjectId", "level");

-- CreateIndex
CREATE INDEX "CbcCommentBankEntry_tenantId_strandId_idx" ON "CbcCommentBankEntry"("tenantId", "strandId");

-- CreateIndex
CREATE INDEX "CbcCommentBankEntry_tenantId_substrandId_idx" ON "CbcCommentBankEntry"("tenantId", "substrandId");

-- CreateIndex
CREATE INDEX "CbcAssessment_tenantId_substrandId_idx" ON "CbcAssessment"("tenantId", "substrandId");

-- AddForeignKey
ALTER TABLE "CbcSubstrand" ADD CONSTRAINT "CbcSubstrand_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CbcSubstrand" ADD CONSTRAINT "CbcSubstrand_strandId_fkey" FOREIGN KEY ("strandId") REFERENCES "CbcStrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CbcAssessment" ADD CONSTRAINT "CbcAssessment_substrandId_fkey" FOREIGN KEY ("substrandId") REFERENCES "CbcSubstrand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CbcCommentBankEntry" ADD CONSTRAINT "CbcCommentBankEntry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
