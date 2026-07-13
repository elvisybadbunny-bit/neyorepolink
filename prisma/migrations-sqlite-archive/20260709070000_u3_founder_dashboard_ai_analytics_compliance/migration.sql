-- CreateTable
CREATE TABLE "FounderAiQuery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "question" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_CONFIGURED',
    "contextJson" TEXT NOT NULL,
    "answer" TEXT,
    "provider" TEXT,
    "model" TEXT,
    "promptTokens" INTEGER,
    "outputTokens" INTEGER,
    "costUsd" REAL,
    "costKes" INTEGER,
    "errorMessage" TEXT,
    "askedById" TEXT NOT NULL,
    "askedByName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ComplianceRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "tenantName" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "requestedById" TEXT NOT NULL,
    "requestedByName" TEXT NOT NULL,
    "requestedByRole" TEXT NOT NULL,
    "resolvedById" TEXT,
    "resolvedByName" TEXT,
    "resolutionNote" TEXT,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "FounderAiQuery_createdAt_idx" ON "FounderAiQuery"("createdAt");

-- CreateIndex
CREATE INDEX "FounderAiQuery_askedById_idx" ON "FounderAiQuery"("askedById");

-- CreateIndex
CREATE INDEX "ComplianceRequest_tenantId_idx" ON "ComplianceRequest"("tenantId");

-- CreateIndex
CREATE INDEX "ComplianceRequest_status_idx" ON "ComplianceRequest"("status");

-- CreateIndex
CREATE INDEX "ComplianceRequest_kind_idx" ON "ComplianceRequest"("kind");
