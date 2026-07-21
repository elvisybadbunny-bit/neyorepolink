CREATE TABLE "NationalSelectionCatalogVersion" (
  "id" TEXT NOT NULL, "label" TEXT NOT NULL, "effectiveYear" INTEGER NOT NULL, "status" TEXT NOT NULL DEFAULT 'CANDIDATE',
  "sourceUrl" TEXT NOT NULL, "sourceChecksum" TEXT NOT NULL, "retrievedAt" TIMESTAMP(3) NOT NULL,
  "reviewedById" TEXT, "reviewedByName" TEXT, "reviewedAt" TIMESTAMP(3), "activatedAt" TIMESTAMP(3),
  "changeSummary" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "NationalSelectionCatalogVersion_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "NationalSelectionCatalogVersion_effectiveYear_sourceChecksum_key" ON "NationalSelectionCatalogVersion"("effectiveYear", "sourceChecksum");
CREATE INDEX "NationalSelectionCatalogVersion_status_effectiveYear_idx" ON "NationalSelectionCatalogVersion"("status", "effectiveYear");

CREATE TABLE "NationalSubjectCombination" (
  "id" TEXT NOT NULL, "catalogVersionId" TEXT NOT NULL, "officialCode" TEXT NOT NULL, "pathwayGroup" TEXT NOT NULL,
  "trackName" TEXT NOT NULL, "subjectNamesJson" TEXT NOT NULL, "sourceReference" TEXT, "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "NationalSubjectCombination_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "NationalSubjectCombination_catalogVersionId_officialCode_key" ON "NationalSubjectCombination"("catalogVersionId", "officialCode");
CREATE INDEX "NationalSubjectCombination_pathwayGroup_trackName_idx" ON "NationalSubjectCombination"("pathwayGroup", "trackName");
ALTER TABLE "NationalSubjectCombination" ADD CONSTRAINT "NationalSubjectCombination_catalogVersionId_fkey" FOREIGN KEY ("catalogVersionId") REFERENCES "NationalSelectionCatalogVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "StudentSeniorSelectionReconciliation" (
  "id" TEXT NOT NULL, "tenantId" TEXT NOT NULL, "studentId" TEXT NOT NULL, "cohortYear" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT', "pathwayGroup" TEXT, "officialCombinationCode" TEXT,
  "officialSubjectsJson" TEXT NOT NULL DEFAULT '[]', "schoolChoicesJson" TEXT NOT NULL DEFAULT '[]',
  "confirmationFileUrl" TEXT, "confirmationReference" TEXT, "placementJson" TEXT,
  "discrepancyJson" TEXT NOT NULL DEFAULT '[]', "recordedById" TEXT NOT NULL, "recordedByName" TEXT NOT NULL,
  "confirmedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudentSeniorSelectionReconciliation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "StudentSeniorSelectionReconciliation_tenantId_studentId_cohortYear_key" ON "StudentSeniorSelectionReconciliation"("tenantId", "studentId", "cohortYear");
CREATE INDEX "StudentSeniorSelectionReconciliation_tenantId_cohortYear_status_idx" ON "StudentSeniorSelectionReconciliation"("tenantId", "cohortYear", "status");
ALTER TABLE "StudentSeniorSelectionReconciliation" ADD CONSTRAINT "StudentSeniorSelectionReconciliation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentSeniorSelectionReconciliation" ADD CONSTRAINT "StudentSeniorSelectionReconciliation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
