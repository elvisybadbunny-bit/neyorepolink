-- Phase 2: governed report presentation and immutable publication evidence.
CREATE TABLE "ReportPresentationSetting" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "rankingPolicy" TEXT NOT NULL DEFAULT 'SHOW_RANKINGS',
  "showFeesOnReport" BOOLEAN NOT NULL DEFAULT false,
  "comparisonBaseline" TEXT NOT NULL DEFAULT 'CLASS_MEAN',
  "printMode" TEXT NOT NULL DEFAULT 'COLOUR',
  "formulaVersion" TEXT NOT NULL DEFAULT 'AVAILABLE_WORK_V1',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ReportPresentationSetting_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ReportPresentationSetting_tenantId_key" ON "ReportPresentationSetting"("tenantId");
ALTER TABLE "ReportPresentationSetting" ADD CONSTRAINT "ReportPresentationSetting_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ReportPublicationSnapshot" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "termId" TEXT NOT NULL,
  "classId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "formulaVersion" TEXT NOT NULL,
  "calculationHash" TEXT NOT NULL,
  "payloadJson" TEXT NOT NULL,
  "publishedById" TEXT NOT NULL,
  "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReportPublicationSnapshot_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ReportPublicationSnapshot_tenantId_termId_studentId_version_key" ON "ReportPublicationSnapshot"("tenantId", "termId", "studentId", "version");
CREATE INDEX "ReportPublicationSnapshot_tenantId_termId_classId_idx" ON "ReportPublicationSnapshot"("tenantId", "termId", "classId");
CREATE INDEX "ReportPublicationSnapshot_tenantId_studentId_idx" ON "ReportPublicationSnapshot"("tenantId", "studentId");
ALTER TABLE "ReportPublicationSnapshot" ADD CONSTRAINT "ReportPublicationSnapshot_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
