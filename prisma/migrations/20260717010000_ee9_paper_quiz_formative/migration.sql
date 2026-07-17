-- CreateTable
CREATE TABLE "PaperQuizFormativeBatch" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "strandId" TEXT NOT NULL,
    "substrandId" TEXT,
    "title" TEXT NOT NULL,
    "instructions" TEXT,
    "totalQuizMarks" INTEGER NOT NULL DEFAULT 10,
    "eeThresholdPct" INTEGER NOT NULL DEFAULT 80,
    "meThresholdPct" INTEGER NOT NULL DEFAULT 60,
    "aeThresholdPct" INTEGER NOT NULL DEFAULT 40,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "questionsJson" TEXT NOT NULL DEFAULT '[]',
    "studentScoresJson" TEXT NOT NULL DEFAULT '[]',
    "appliedCount" INTEGER NOT NULL DEFAULT 0,
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaperQuizFormativeBatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PaperQuizFormativeBatch_tenantId_classId_idx" ON "PaperQuizFormativeBatch"("tenantId", "classId");

-- CreateIndex
CREATE INDEX "PaperQuizFormativeBatch_tenantId_strandId_idx" ON "PaperQuizFormativeBatch"("tenantId", "strandId");

-- CreateIndex
CREATE INDEX "PaperQuizFormativeBatch_tenantId_status_idx" ON "PaperQuizFormativeBatch"("tenantId", "status");

-- AddForeignKey
ALTER TABLE "PaperQuizFormativeBatch" ADD CONSTRAINT "PaperQuizFormativeBatch_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaperQuizFormativeBatch" ADD CONSTRAINT "PaperQuizFormativeBatch_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaperQuizFormativeBatch" ADD CONSTRAINT "PaperQuizFormativeBatch_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaperQuizFormativeBatch" ADD CONSTRAINT "PaperQuizFormativeBatch_strandId_fkey" FOREIGN KEY ("strandId") REFERENCES "CbcStrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaperQuizFormativeBatch" ADD CONSTRAINT "PaperQuizFormativeBatch_substrandId_fkey" FOREIGN KEY ("substrandId") REFERENCES "CbcSubstrand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
