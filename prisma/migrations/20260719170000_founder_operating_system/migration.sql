CREATE TABLE "FounderOperatingTask" (
  "id" TEXT NOT NULL,
  "presetKey" TEXT,
  "category" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "why" TEXT,
  "nextAction" TEXT,
  "status" TEXT NOT NULL DEFAULT 'TODO',
  "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
  "cadence" TEXT NOT NULL DEFAULT 'ONCE',
  "dueDate" TIMESTAMP(3),
  "evidence" TEXT,
  "owner" TEXT NOT NULL DEFAULT 'Founder',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FounderOperatingTask_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FounderOperatingTask_presetKey_key" ON "FounderOperatingTask"("presetKey");
CREATE INDEX "FounderOperatingTask_status_priority_idx" ON "FounderOperatingTask"("status", "priority");
CREATE INDEX "FounderOperatingTask_category_status_idx" ON "FounderOperatingTask"("category", "status");
