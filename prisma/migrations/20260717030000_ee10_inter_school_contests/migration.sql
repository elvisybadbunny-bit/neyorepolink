-- CreateTable
CREATE TABLE "InterSchoolContest" (
    "id" TEXT NOT NULL,
    "hostTenantId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "subjectId" TEXT,
    "category" TEXT NOT NULL DEFAULT 'MATHEMATICS',
    "targetGradeBand" TEXT NOT NULL DEFAULT 'Grade 7–9 (Junior School)',
    "visibility" TEXT NOT NULL DEFAULT 'OPEN_NATIONAL',
    "status" TEXT NOT NULL DEFAULT 'UPCOMING',
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "timeLimitMins" INTEGER NOT NULL DEFAULT 45,
    "totalMarks" INTEGER NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterSchoolContest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContestQuestion" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    "questionBankId" TEXT,
    "prompt" TEXT NOT NULL,
    "questionType" TEXT NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    "optionsJson" TEXT NOT NULL DEFAULT '[]',
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT,
    "marks" INTEGER NOT NULL DEFAULT 2,
    "diagramSvg" TEXT,

    CONSTRAINT "ContestQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContestRegistration" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "registeredById" TEXT NOT NULL,
    "registeredByName" TEXT NOT NULL,
    "schoolTeamName" TEXT,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContestRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContestAttempt" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "admissionNo" TEXT NOT NULL,
    "answersJson" TEXT NOT NULL DEFAULT '{}',
    "score" INTEGER NOT NULL DEFAULT 0,
    "totalMarks" INTEGER NOT NULL DEFAULT 20,
    "scorePct" INTEGER NOT NULL DEFAULT 0,
    "timeTakenSecs" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "ContestAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InterSchoolContest_hostTenantId_status_idx" ON "InterSchoolContest"("hostTenantId", "status");

-- CreateIndex
CREATE INDEX "InterSchoolContest_visibility_status_idx" ON "InterSchoolContest"("visibility", "status");

-- CreateIndex
CREATE INDEX "ContestQuestion_contestId_order_idx" ON "ContestQuestion"("contestId", "order");

-- CreateIndex
CREATE INDEX "ContestRegistration_tenantId_idx" ON "ContestRegistration"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ContestRegistration_contestId_tenantId_key" ON "ContestRegistration"("contestId", "tenantId");

-- CreateIndex
CREATE INDEX "ContestAttempt_contestId_score_timeTakenSecs_idx" ON "ContestAttempt"("contestId", "score", "timeTakenSecs");

-- CreateIndex
CREATE INDEX "ContestAttempt_tenantId_studentId_idx" ON "ContestAttempt"("tenantId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "ContestAttempt_contestId_studentId_key" ON "ContestAttempt"("contestId", "studentId");

-- AddForeignKey
ALTER TABLE "InterSchoolContest" ADD CONSTRAINT "InterSchoolContest_hostTenantId_fkey" FOREIGN KEY ("hostTenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterSchoolContest" ADD CONSTRAINT "InterSchoolContest_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestQuestion" ADD CONSTRAINT "ContestQuestion_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "InterSchoolContest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestQuestion" ADD CONSTRAINT "ContestQuestion_questionBankId_fkey" FOREIGN KEY ("questionBankId") REFERENCES "QuestionBankEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestRegistration" ADD CONSTRAINT "ContestRegistration_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "InterSchoolContest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestRegistration" ADD CONSTRAINT "ContestRegistration_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestAttempt" ADD CONSTRAINT "ContestAttempt_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "InterSchoolContest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestAttempt" ADD CONSTRAINT "ContestAttempt_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestAttempt" ADD CONSTRAINT "ContestAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
