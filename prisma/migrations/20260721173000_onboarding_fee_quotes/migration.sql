CREATE TABLE "OnboardingFeeQuote" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT,
  "schoolQuoteRequestId" TEXT,
  "schoolName" TEXT NOT NULL,
  "inputJson" TEXT NOT NULL,
  "breakdownJson" TEXT NOT NULL,
  "formulaVersion" INTEGER NOT NULL DEFAULT 1,
  "calculatedFeeKes" INTEGER NOT NULL,
  "finalFeeKes" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "waiverReason" TEXT,
  "reviewedById" TEXT,
  "reviewedByName" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "approvedAt" TIMESTAMP(3),
  "createdById" TEXT NOT NULL,
  "createdByName" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OnboardingFeeQuote_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "OnboardingFeeQuote_tenantId_status_idx" ON "OnboardingFeeQuote"("tenantId", "status");
CREATE INDEX "OnboardingFeeQuote_schoolQuoteRequestId_idx" ON "OnboardingFeeQuote"("schoolQuoteRequestId");
CREATE INDEX "OnboardingFeeQuote_status_updatedAt_idx" ON "OnboardingFeeQuote"("status", "updatedAt");
