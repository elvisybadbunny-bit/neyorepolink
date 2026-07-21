CREATE TABLE "ExamApplicationSubmission" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "studentName" TEXT NOT NULL,
  "admissionNo" TEXT NOT NULL,
  "examName" TEXT NOT NULL,
  "documentType" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "submittedById" TEXT NOT NULL,
  "submittedByName" TEXT NOT NULL,
  "submittedByRole" TEXT NOT NULL,
  "reviewNote" TEXT,
  "reviewedById" TEXT,
  "reviewedByName" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "packageLabel" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ExamApplicationSubmission_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ExamApplicationSubmission_tenantId_status_createdAt_idx" ON "ExamApplicationSubmission"("tenantId", "status", "createdAt");
CREATE INDEX "ExamApplicationSubmission_tenantId_studentId_idx" ON "ExamApplicationSubmission"("tenantId", "studentId");
CREATE INDEX "ExamApplicationSubmission_tenantId_examName_idx" ON "ExamApplicationSubmission"("tenantId", "examName");
