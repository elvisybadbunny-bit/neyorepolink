-- AA.6 — Hard-blocked timetable slots (assembly, PPI, whole-school games
-- afternoon, etc.) that the Master Button solver must treat as an absolute
-- exclusion.
CREATE TABLE "BlockedTimetableSlot" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "level" TEXT,
    "classId" TEXT,
    "dayOfWeek" INTEGER NOT NULL,
    "period" INTEGER NOT NULL,
    "isDouble" BOOLEAN NOT NULL DEFAULT false,
    "activityName" TEXT,
    "activityColor" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlockedTimetableSlot_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BlockedTimetableSlot_tenantId_scope_idx" ON "BlockedTimetableSlot"("tenantId", "scope");

CREATE INDEX "BlockedTimetableSlot_tenantId_classId_idx" ON "BlockedTimetableSlot"("tenantId", "classId");

ALTER TABLE "BlockedTimetableSlot" ADD CONSTRAINT "BlockedTimetableSlot_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
