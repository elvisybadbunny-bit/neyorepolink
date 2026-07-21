ALTER TABLE "BlockedTimetableSlot" ADD COLUMN "classIdsJson" TEXT NOT NULL DEFAULT '[]';

CREATE TABLE "PracticeTeacherPlacement" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "traineeUserId" TEXT NOT NULL,
  "traineeName" TEXT NOT NULL,
  "mentorUserId" TEXT NOT NULL,
  "mentorName" TEXT NOT NULL,
  "subjectIdsJson" TEXT NOT NULL DEFAULT '[]',
  "classIdsJson" TEXT NOT NULL DEFAULT '[]',
  "startsOn" TEXT NOT NULL,
  "endsOn" TEXT NOT NULL,
  "canTeachSolo" BOOLEAN NOT NULL DEFAULT false,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "note" TEXT,
  "createdById" TEXT NOT NULL,
  "createdByName" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PracticeTeacherPlacement_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PracticeTeacherPlacement_tenantId_status_idx" ON "PracticeTeacherPlacement"("tenantId", "status");
CREATE INDEX "PracticeTeacherPlacement_tenantId_traineeUserId_idx" ON "PracticeTeacherPlacement"("tenantId", "traineeUserId");
CREATE INDEX "PracticeTeacherPlacement_tenantId_mentorUserId_idx" ON "PracticeTeacherPlacement"("tenantId", "mentorUserId");
