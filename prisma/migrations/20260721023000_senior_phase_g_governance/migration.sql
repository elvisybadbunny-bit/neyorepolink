ALTER TABLE "TimetableGenerationJob" ADD COLUMN "draftSlotsJson" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "TimetableGenerationJob" ADD COLUMN "governanceStatus" TEXT NOT NULL DEFAULT 'GENERATED_DRAFT';
ALTER TABLE "TimetableGenerationJob" ADD COLUMN "headApprovedById" TEXT;
ALTER TABLE "TimetableGenerationJob" ADD COLUMN "headApprovedByName" TEXT;
ALTER TABLE "TimetableGenerationJob" ADD COLUMN "headApprovedAt" TIMESTAMP(3);
ALTER TABLE "TimetableGenerationJob" ADD COLUMN "publishedById" TEXT;
ALTER TABLE "TimetableGenerationJob" ADD COLUMN "publishedByName" TEXT;
ALTER TABLE "TimetableGenerationJob" ADD COLUMN "publishedAt" TIMESTAMP(3);
ALTER TABLE "TimetableGenerationJob" ADD COLUMN "supersededAt" TIMESTAMP(3);

CREATE TABLE "TimetableGovernanceDecision" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "generationJobId" TEXT NOT NULL,
  "decision" TEXT NOT NULL,
  "note" TEXT,
  "actorId" TEXT NOT NULL,
  "actorName" TEXT NOT NULL,
  "actorRole" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TimetableGovernanceDecision_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "TimetableGovernanceDecision_tenantId_generationJobId_createdAt_idx" ON "TimetableGovernanceDecision"("tenantId", "generationJobId", "createdAt");
ALTER TABLE "TimetableGovernanceDecision" ADD CONSTRAINT "TimetableGovernanceDecision_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TimetableGovernanceDecision" ADD CONSTRAINT "TimetableGovernanceDecision_generationJobId_fkey" FOREIGN KEY ("generationJobId") REFERENCES "TimetableGenerationJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
