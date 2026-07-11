-- CreateTable
CREATE TABLE "NeyoCostSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "periodKey" TEXT NOT NULL,
    "periodStart" TEXT NOT NULL,
    "periodEnd" TEXT NOT NULL,
    "infraCostKes" INTEGER NOT NULL DEFAULT 0,
    "marketingSpendKes" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdById" TEXT,
    "createdByName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "NeyoCostSnapshot_periodKey_key" ON "NeyoCostSnapshot"("periodKey");

-- CreateIndex
CREATE INDEX "NeyoCostSnapshot_periodStart_idx" ON "NeyoCostSnapshot"("periodStart");

