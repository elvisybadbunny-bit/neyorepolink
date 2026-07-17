-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "customNeyoEmail" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "hasSetInitialPassword" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "recoveryOtpCode" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "recoveryOtpExpiresAt" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "User_customNeyoEmail_key" ON "User"("customNeyoEmail");

-- CreateTable
CREATE TABLE IF NOT EXISTS "DemoRequest" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT,
    "schoolName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "spawnedTenantId" TEXT,
    "spawnedTenantSlug" TEXT,
    "notes" TEXT,

    CONSTRAINT "DemoRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "DemoRequest_email_key" ON "DemoRequest"("email");
CREATE INDEX IF NOT EXISTS "DemoRequest_status_requestedAt_idx" ON "DemoRequest"("status", "requestedAt");
