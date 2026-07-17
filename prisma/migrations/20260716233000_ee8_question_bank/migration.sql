-- CreateTable
CREATE TABLE "QuestionBankEntry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "strandId" TEXT,
    "substrandId" TEXT,
    "grade" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "questionType" TEXT NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    "optionsJson" TEXT NOT NULL DEFAULT '[]',
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 2,
    "illustrationUrl" TEXT,
    "diagramSvg" TEXT,
    "diagramType" TEXT,
    "sourceType" TEXT NOT NULL DEFAULT 'TEACHER_CREATED',
    "scope" TEXT NOT NULL DEFAULT 'SCHOOL',
    "approvalStatus" TEXT NOT NULL DEFAULT 'APPROVED',
    "approvedById" TEXT,
    "approvedByName" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionBankEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionBankAttempt" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "timeTakenSecs" INTEGER NOT NULL DEFAULT 30,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionBankAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuestionBankEntry_tenantId_subjectId_idx" ON "QuestionBankEntry"("tenantId", "subjectId");

-- CreateIndex
CREATE INDEX "QuestionBankEntry_strandId_difficulty_idx" ON "QuestionBankEntry"("strandId", "difficulty");

-- CreateIndex
CREATE INDEX "QuestionBankEntry_grade_subjectId_approvalStatus_idx" ON "QuestionBankEntry"("grade", "subjectId", "approvalStatus");

-- CreateIndex
CREATE INDEX "QuestionBankEntry_scope_approvalStatus_idx" ON "QuestionBankEntry"("scope", "approvalStatus");

-- CreateIndex
CREATE INDEX "QuestionBankAttempt_tenantId_studentId_isCorrect_idx" ON "QuestionBankAttempt"("tenantId", "studentId", "isCorrect");

-- CreateIndex
CREATE INDEX "QuestionBankAttempt_questionId_isCorrect_idx" ON "QuestionBankAttempt"("questionId", "isCorrect");

-- AddForeignKey
ALTER TABLE "QuestionBankEntry" ADD CONSTRAINT "QuestionBankEntry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionBankEntry" ADD CONSTRAINT "QuestionBankEntry_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionBankEntry" ADD CONSTRAINT "QuestionBankEntry_strandId_fkey" FOREIGN KEY ("strandId") REFERENCES "CbcStrand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionBankEntry" ADD CONSTRAINT "QuestionBankEntry_substrandId_fkey" FOREIGN KEY ("substrandId") REFERENCES "CbcSubstrand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionBankAttempt" ADD CONSTRAINT "QuestionBankAttempt_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionBankAttempt" ADD CONSTRAINT "QuestionBankAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionBankAttempt" ADD CONSTRAINT "QuestionBankAttempt_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuestionBankEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
