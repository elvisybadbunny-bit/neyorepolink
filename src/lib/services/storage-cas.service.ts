import { db } from "@/lib/db";

/**
 * Idea 2.2 — Pre-Upload Content-Addressable Storage (CAS) Deduplication.
 * Before a physical file is uploaded, the browser calculates SHA-256 and calls
 * `checkCasBlobExists()`. If true, increments `referenceCount` and returns the existing blob URL.
 */

export async function checkCasBlobExists(sha256: string) {
  if (!sha256 || sha256.length < 32) return null;
  const cleanHash = sha256.toLowerCase().trim();
  const blob = await db.storageVaultBlob.findUnique({ where: { checksumSha256: cleanHash } });
  if (!blob) return null;

  // Deduplication hit! Increment reference count
  const updated = await db.storageVaultBlob.update({
    where: { id: blob.id },
    data: { referenceCount: { increment: 1 } },
  });
  return updated;
}

export async function registerCasBlob(input: {
  checksumSha256: string;
  storageUrl: string;
  mimeType: string;
  sizeBytes: number;
  originalSizeBytes?: number;
  tenantId?: string | null;
}) {
  const cleanHash = input.checksumSha256.toLowerCase().trim();
  const existing = await db.storageVaultBlob.findUnique({ where: { checksumSha256: cleanHash } });
  if (existing) {
    return db.storageVaultBlob.update({
      where: { id: existing.id },
      data: { referenceCount: { increment: 1 } },
    });
  }

  const compressionRatioPct = input.originalSizeBytes && input.originalSizeBytes > 0
    ? Math.round((input.sizeBytes / input.originalSizeBytes) * 100)
    : 100;

  return db.storageVaultBlob.create({
    data: {
      checksumSha256: cleanHash,
      storageUrl: input.storageUrl,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      originalSizeBytes: input.originalSizeBytes ?? input.sizeBytes,
      compressionRatioPct,
      referenceCount: 1,
      firstUploadedByTenantId: input.tenantId || null,
    },
  });
}

export async function getCasStatsSummary() {
  const blobs = await db.storageVaultBlob.findMany();
  const totalUniqueBlobs = blobs.length;
  const totalReferences = blobs.reduce((s, b) => s + b.referenceCount, 0);
  const totalBytesStored = blobs.reduce((s, b) => s + b.sizeBytes, 0);
  const totalOriginalBytesEquivalent = blobs.reduce((s, b) => s + (b.originalSizeBytes ?? b.sizeBytes) * b.referenceCount, 0);
  const totalBytesSaved = Math.max(0, totalOriginalBytesEquivalent - totalBytesStored);

  return {
    totalUniqueBlobs,
    totalReferences,
    totalBytesStored,
    totalOriginalBytesEquivalent,
    totalBytesSaved,
  };
}
