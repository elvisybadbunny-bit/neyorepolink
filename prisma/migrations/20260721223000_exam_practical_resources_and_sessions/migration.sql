ALTER TABLE "ExamTimetableSlot" ADD COLUMN "candidateCount" INTEGER;
ALTER TABLE "ExamTimetableSlot" ADD COLUMN "sessionCapacity" INTEGER;
ALTER TABLE "ExamTimetableSlot" ADD COLUMN "sessionLengthMins" INTEGER;
ALTER TABLE "ExamTimetableSlot" ADD COLUMN "sessionGapMins" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ExamTimetableSlot" ADD COLUMN "practicalResourceIdsJson" TEXT DEFAULT '[]';

CREATE TABLE "ExamPracticalResource" (
  "id" TEXT NOT NULL, "tenantId" TEXT NOT NULL, "name" TEXT NOT NULL, "resourceType" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1, "learnerCapacity" INTEGER, "availableFrom" TEXT, "availableTo" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true, "notes" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "ExamPracticalResource_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ExamPracticalResource_tenantId_name_key" ON "ExamPracticalResource"("tenantId", "name");
CREATE INDEX "ExamPracticalResource_tenantId_active_idx" ON "ExamPracticalResource"("tenantId", "active");
ALTER TABLE "ExamPracticalResource" ADD CONSTRAINT "ExamPracticalResource_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ExamTimetableSession" (
  "id" TEXT NOT NULL, "tenantId" TEXT NOT NULL, "slotId" TEXT NOT NULL, "sessionNo" INTEGER NOT NULL,
  "startTime" TEXT NOT NULL, "endTime" TEXT NOT NULL, "candidateStart" INTEGER NOT NULL, "candidateEnd" INTEGER NOT NULL,
  "candidateCount" INTEGER NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ExamTimetableSession_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ExamTimetableSession_slotId_sessionNo_key" ON "ExamTimetableSession"("slotId", "sessionNo");
CREATE INDEX "ExamTimetableSession_tenantId_startTime_idx" ON "ExamTimetableSession"("tenantId", "startTime");
ALTER TABLE "ExamTimetableSession" ADD CONSTRAINT "ExamTimetableSession_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExamTimetableSession" ADD CONSTRAINT "ExamTimetableSession_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "ExamTimetableSlot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
