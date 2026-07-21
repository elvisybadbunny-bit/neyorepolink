ALTER TABLE "Tenant" ADD COLUMN "studentDutiesEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Tenant" ADD COLUMN "studentDutyExcludeLeaders" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "StudentDutyArea" ADD COLUMN "lightDuty" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "StudentDutyEligibility" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "isStudentLeader" BOOLEAN NOT NULL DEFAULT false,
  "medicalRestriction" TEXT NOT NULL DEFAULT 'NONE',
  "reasonSummary" TEXT,
  "medicalDocumentUrl" TEXT,
  "expiresAt" TIMESTAMP(3),
  "approvedById" TEXT NOT NULL,
  "approvedByName" TEXT NOT NULL,
  "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudentDutyEligibility_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "StudentDutyEligibility_studentId_key" ON "StudentDutyEligibility"("studentId");
CREATE INDEX "StudentDutyEligibility_tenantId_medicalRestriction_idx" ON "StudentDutyEligibility"("tenantId", "medicalRestriction");
CREATE INDEX "StudentDutyEligibility_tenantId_isStudentLeader_idx" ON "StudentDutyEligibility"("tenantId", "isStudentLeader");
