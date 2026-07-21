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

CREATE TABLE "OnboardingPayment" (
  "id" TEXT NOT NULL,
  "quoteId" TEXT NOT NULL,
  "amountKes" INTEGER NOT NULL,
  "phone" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "accountRef" TEXT NOT NULL,
  "checkoutRequestId" TEXT,
  "mpesaRef" TEXT,
  "resultCode" TEXT,
  "resultDesc" TEXT,
  "rawCallback" TEXT,
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OnboardingPayment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "OnboardingPayment_checkoutRequestId_key" ON "OnboardingPayment"("checkoutRequestId");
CREATE UNIQUE INDEX "OnboardingPayment_mpesaRef_key" ON "OnboardingPayment"("mpesaRef");
CREATE INDEX "OnboardingPayment_quoteId_status_idx" ON "OnboardingPayment"("quoteId", "status");
CREATE INDEX "OnboardingPayment_status_createdAt_idx" ON "OnboardingPayment"("status", "createdAt");

CREATE TABLE "OnboardingRun" (
  "id" TEXT NOT NULL,
  "quoteId" TEXT NOT NULL,
  "tenantId" TEXT,
  "schoolName" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "checklistJson" TEXT NOT NULL,
  "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OnboardingRun_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "OnboardingRun_quoteId_key" ON "OnboardingRun"("quoteId");
CREATE INDEX "OnboardingRun_tenantId_status_idx" ON "OnboardingRun"("tenantId", "status");
