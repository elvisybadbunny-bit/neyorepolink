ALTER TABLE "DiscountCampaign" ADD COLUMN "code" TEXT;
ALTER TABLE "DiscountCampaign" ADD COLUMN "maxRedemptions" INTEGER;
ALTER TABLE "DiscountCampaign" ADD COLUMN "redemptionCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "DiscountCampaign" ADD COLUMN "freeMonths" INTEGER NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX "DiscountCampaign_code_key" ON "DiscountCampaign"("code");
