ALTER TABLE "Subject" ADD COLUMN "recommendedMaxGroupSize" INTEGER;
ALTER TABLE "Subject" ADD COLUMN "practicalMaxGroupSize" INTEGER;
ALTER TABLE "Subject" ADD COLUMN "practicalHeavy" BOOLEAN NOT NULL DEFAULT false;
