ALTER TABLE "TimetableConfig"
  ADD COLUMN "assemblyBeforeLessonsLabel" TEXT,
  ADD COLUMN "assemblyBeforeLessonsMins" INTEGER NOT NULL DEFAULT 0;
