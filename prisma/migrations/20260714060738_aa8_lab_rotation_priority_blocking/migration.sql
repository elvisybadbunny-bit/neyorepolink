-- AlterTable
ALTER TABLE "ClassSubjectNeed" ADD COLUMN     "labPriority" TEXT NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "noLabAccess" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "VenueSessionHistory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "generationJobId" TEXT,
    "gotSession" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VenueSessionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VenueSessionHistory_tenantId_idx" ON "VenueSessionHistory"("tenantId");

-- CreateIndex
CREATE INDEX "VenueSessionHistory_tenantId_classId_subjectId_idx" ON "VenueSessionHistory"("tenantId", "classId", "subjectId");

-- CreateIndex
CREATE INDEX "VenueSessionHistory_tenantId_classId_subjectId_createdAt_idx" ON "VenueSessionHistory"("tenantId", "classId", "subjectId", "createdAt");

-- AddForeignKey
ALTER TABLE "VenueSessionHistory" ADD CONSTRAINT "VenueSessionHistory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
