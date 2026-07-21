CREATE TABLE "PublicBrandAsset" (
  "id" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "bytes" BYTEA NOT NULL,
  "byteSize" INTEGER NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT false,
  "replacedById" TEXT,
  "createdById" TEXT NOT NULL,
  "createdByName" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PublicBrandAsset_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PublicBrandAsset_kind_active_idx" ON "PublicBrandAsset"("kind", "active");
CREATE INDEX "PublicBrandAsset_createdAt_idx" ON "PublicBrandAsset"("createdAt");
