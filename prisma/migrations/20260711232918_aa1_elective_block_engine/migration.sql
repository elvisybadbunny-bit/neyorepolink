-- CreateTable
CREATE TABLE "ElectiveBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'MULTI_SLOT',
    "preferAfterBreak" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ElectiveBlock_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ElectiveBlockClass" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    CONSTRAINT "ElectiveBlockClass_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "ElectiveBlock" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ElectiveBlockSlot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isDouble" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ElectiveBlockSlot_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "ElectiveBlock" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ElectiveBlockSlotSubject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT,
    "venueId" TEXT,
    "comboClassIdsJson" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ElectiveBlockSlotSubject_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "ElectiveBlockSlot" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ElectiveBlockSlotSubject_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ElectiveBlock_tenantId_idx" ON "ElectiveBlock"("tenantId");

-- CreateIndex
CREATE INDEX "ElectiveBlockClass_tenantId_idx" ON "ElectiveBlockClass"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ElectiveBlockClass_blockId_classId_key" ON "ElectiveBlockClass"("blockId", "classId");

-- CreateIndex
CREATE INDEX "ElectiveBlockSlot_tenantId_idx" ON "ElectiveBlockSlot"("tenantId");

-- CreateIndex
CREATE INDEX "ElectiveBlockSlot_blockId_idx" ON "ElectiveBlockSlot"("blockId");

-- CreateIndex
CREATE INDEX "ElectiveBlockSlotSubject_tenantId_idx" ON "ElectiveBlockSlotSubject"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ElectiveBlockSlotSubject_slotId_subjectId_key" ON "ElectiveBlockSlotSubject"("slotId", "subjectId");
