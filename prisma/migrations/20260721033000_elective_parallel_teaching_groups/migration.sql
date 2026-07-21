ALTER TABLE "ElectiveBlockSlotSubject" ADD COLUMN "teachingGroupKey" TEXT NOT NULL DEFAULT 'MAIN';
ALTER TABLE "ElectiveBlockSlotSubject" ADD COLUMN "teachingGroupLabel" TEXT;
ALTER TABLE "ElectiveBlockSlotSubject" ADD COLUMN "studentIdsJson" TEXT NOT NULL DEFAULT '[]';
DROP INDEX "ElectiveBlockSlotSubject_slotId_subjectId_key";
CREATE UNIQUE INDEX "ElectiveBlockSlotSubject_slotId_subjectId_teachingGroupKey_key" ON "ElectiveBlockSlotSubject"("slotId", "subjectId", "teachingGroupKey");
