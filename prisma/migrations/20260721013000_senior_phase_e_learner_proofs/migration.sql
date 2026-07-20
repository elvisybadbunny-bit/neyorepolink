ALTER TABLE "TimetableGenerationJob" ADD COLUMN "learnerProofValid" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "TimetableGenerationJob" ADD COLUMN "learnerProofInvalid" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "SeniorLearnerTimetableProof" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "generationJobId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "classId" TEXT NOT NULL,
  "level" TEXT NOT NULL,
  "valid" BOOLEAN NOT NULL,
  "timetableJson" TEXT NOT NULL DEFAULT '[]',
  "issuesJson" TEXT NOT NULL DEFAULT '[]',
  "optionAId" TEXT,
  "optionBId" TEXT,
  "optionCId" TEXT,
  "mathVariant" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SeniorLearnerTimetableProof_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SeniorLearnerTimetableProof_generationJobId_studentId_key" ON "SeniorLearnerTimetableProof"("generationJobId", "studentId");
CREATE INDEX "SeniorLearnerTimetableProof_tenantId_studentId_createdAt_idx" ON "SeniorLearnerTimetableProof"("tenantId", "studentId", "createdAt");
CREATE INDEX "SeniorLearnerTimetableProof_tenantId_generationJobId_valid_idx" ON "SeniorLearnerTimetableProof"("tenantId", "generationJobId", "valid");
ALTER TABLE "SeniorLearnerTimetableProof" ADD CONSTRAINT "SeniorLearnerTimetableProof_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SeniorLearnerTimetableProof" ADD CONSTRAINT "SeniorLearnerTimetableProof_generationJobId_fkey" FOREIGN KEY ("generationJobId") REFERENCES "TimetableGenerationJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SeniorLearnerTimetableProof" ADD CONSTRAINT "SeniorLearnerTimetableProof_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
