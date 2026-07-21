CREATE TABLE "QrAttendanceSession" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "classId" TEXT,
  "date" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdById" TEXT NOT NULL,
  "createdByName" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "closedAt" TIMESTAMP(3),
  CONSTRAINT "QrAttendanceSession_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "QrAttendanceSession_code_key" ON "QrAttendanceSession"("code");
CREATE INDEX "QrAttendanceSession_tenantId_status_date_idx" ON "QrAttendanceSession"("tenantId", "status", "date");
CREATE INDEX "QrAttendanceSession_tenantId_classId_idx" ON "QrAttendanceSession"("tenantId", "classId");

CREATE TABLE "QrAttendanceResponse" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "scannedById" TEXT NOT NULL,
  "scannedByName" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "QrAttendanceResponse_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "QrAttendanceResponse_sessionId_studentId_key" ON "QrAttendanceResponse"("sessionId", "studentId");
CREATE INDEX "QrAttendanceResponse_tenantId_sessionId_idx" ON "QrAttendanceResponse"("tenantId", "sessionId");
