-- AlterTable
ALTER TABLE "ExamTimetableSlot" ADD COLUMN     "electiveBlockId" TEXT,
ADD COLUMN     "studentIdsJson" TEXT DEFAULT '[]';
