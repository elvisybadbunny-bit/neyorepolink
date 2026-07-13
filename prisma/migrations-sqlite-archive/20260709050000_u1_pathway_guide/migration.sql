-- CreateTable
CREATE TABLE "KuccpsCluster" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "subjectRulesJson" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "KuccpsCourse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clusterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minGradesJson" TEXT NOT NULL,
    "minMeanGrade" TEXT NOT NULL,
    "typicalCutoff" REAL,
    "careerAreas" TEXT NOT NULL DEFAULT '[]',
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "KuccpsCourse_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "KuccpsCluster" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PathwayGuideSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT,
    "studentId" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "fullName" TEXT,
    "phone" TEXT,
    "interestsJson" TEXT NOT NULL DEFAULT '[]',
    "skillsJson" TEXT NOT NULL DEFAULT '[]',
    "valuesJson" TEXT NOT NULL DEFAULT '[]',
    "aspirationsJson" TEXT NOT NULL DEFAULT '[]',
    "recommendedGroup" TEXT,
    "recommendedTrack" TEXT,
    "recommendedSubjectsJson" TEXT NOT NULL DEFAULT '[]',
    "careerAreasJson" TEXT NOT NULL DEFAULT '[]',
    "unlocked" BOOLEAN NOT NULL DEFAULT false,
    "unlockedAt" DATETIME,
    "paymentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PathwayGuideSession_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "PathwayGuidePayment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PathwayGuidePayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "amountKes" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "checkoutRequestId" TEXT,
    "mpesaRef" TEXT,
    "resultDesc" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "KuccpsCluster_number_key" ON "KuccpsCluster"("number");

-- CreateIndex
CREATE INDEX "KuccpsCourse_clusterId_idx" ON "KuccpsCourse"("clusterId");

-- CreateIndex
CREATE UNIQUE INDEX "PathwayGuideSession_paymentId_key" ON "PathwayGuideSession"("paymentId");

-- CreateIndex
CREATE INDEX "PathwayGuideSession_tenantId_idx" ON "PathwayGuideSession"("tenantId");

-- CreateIndex
CREATE INDEX "PathwayGuideSession_studentId_idx" ON "PathwayGuideSession"("studentId");

-- CreateIndex
CREATE INDEX "PathwayGuideSession_phone_idx" ON "PathwayGuideSession"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "PathwayGuidePayment_checkoutRequestId_key" ON "PathwayGuidePayment"("checkoutRequestId");

-- CreateIndex
CREATE INDEX "PathwayGuidePayment_phone_idx" ON "PathwayGuidePayment"("phone");

-- CreateIndex
CREATE INDEX "PathwayGuidePayment_status_idx" ON "PathwayGuidePayment"("status");

