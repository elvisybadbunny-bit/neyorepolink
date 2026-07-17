-- CreateTable
CREATE TABLE "ScannedExamPaper" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "examId" TEXT,
    "title" TEXT NOT NULL,
    "instructions" TEXT,
    "timeAllowedMins" INTEGER NOT NULL DEFAULT 120,
    "totalMarks" INTEGER NOT NULL DEFAULT 100,
    "status" TEXT NOT NULL DEFAULT 'TIDIED',
    "questionsJson" TEXT NOT NULL DEFAULT '[]',
    "rawScanUrl" TEXT,
    "privacyTier" TEXT NOT NULL DEFAULT 'SCHOOL_ONLY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScannedExamPaper_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScannedExamPaper_tenantId_subjectId_idx" ON "ScannedExamPaper"("tenantId", "subjectId");

-- CreateIndex
CREATE INDEX "ScannedExamPaper_tenantId_classId_idx" ON "ScannedExamPaper"("tenantId", "classId");

-- CreateIndex
CREATE INDEX "ScannedExamPaper_tenantId_status_idx" ON "ScannedExamPaper"("tenantId", "status");

-- AddForeignKey
ALTER TABLE "ScannedExamPaper" ADD CONSTRAINT "ScannedExamPaper_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScannedExamPaper" ADD CONSTRAINT "ScannedExamPaper_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScannedExamPaper" ADD CONSTRAINT "ScannedExamPaper_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScannedExamPaper" ADD CONSTRAINT "ScannedExamPaper_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;
