ALTER TABLE "DemoRequest" ADD COLUMN "countySubCounty" TEXT;
ALTER TABLE "DemoRequest" ADD COLUMN "contactRole" TEXT;
ALTER TABLE "DemoRequest" ADD COLUMN "schoolType" TEXT;
ALTER TABLE "DemoRequest" ADD COLUMN "levelsJson" TEXT DEFAULT '[]';
ALTER TABLE "DemoRequest" ADD COLUMN "approximateLearners" INTEGER;
ALTER TABLE "DemoRequest" ADD COLUMN "topProblems" TEXT;
ALTER TABLE "DemoRequest" ADD COLUMN "preferredDemoDate" TEXT;
ALTER TABLE "DemoRequest" ADD COLUMN "consentToContact" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "DemoRequest" ADD COLUMN "campaignSource" TEXT;
