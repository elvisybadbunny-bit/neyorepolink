-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ElectiveBlockSlotSubject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT,
    "venueId" TEXT,
    "resolvedVenueId" TEXT,
    "comboClassIdsJson" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ElectiveBlockSlotSubject_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "ElectiveBlockSlot" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ElectiveBlockSlotSubject_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ElectiveBlockSlotSubject_resolvedVenueId_fkey" FOREIGN KEY ("resolvedVenueId") REFERENCES "Venue" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ElectiveBlockSlotSubject" ("comboClassIdsJson", "createdAt", "id", "slotId", "subjectId", "teacherId", "tenantId", "updatedAt", "venueId") SELECT "comboClassIdsJson", "createdAt", "id", "slotId", "subjectId", "teacherId", "tenantId", "updatedAt", "venueId" FROM "ElectiveBlockSlotSubject";
DROP TABLE "ElectiveBlockSlotSubject";
ALTER TABLE "new_ElectiveBlockSlotSubject" RENAME TO "ElectiveBlockSlotSubject";
CREATE INDEX "ElectiveBlockSlotSubject_tenantId_idx" ON "ElectiveBlockSlotSubject"("tenantId");
CREATE UNIQUE INDEX "ElectiveBlockSlotSubject_slotId_subjectId_key" ON "ElectiveBlockSlotSubject"("slotId", "subjectId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
