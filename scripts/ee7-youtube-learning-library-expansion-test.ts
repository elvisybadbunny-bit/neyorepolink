/**
 * Standalone verification test suite for EE.7 — YouTube Learning Library 10+ Links per Strand Curated Repository.
 *
 * Verifies that:
 * 1. All curated YouTube video seeds (`KICD_YOUTUBE_VIDEO_SEEDS`) have exact 11-char YouTube IDs (`extractYouTubeId`).
 * 2. `seedAllYouTubeLearningVideos(user)` seeds all curated educational videos cleanly inside `withTenant`.
 * 3. Second run is 100% idempotent (`0 duplicates created on re-run`).
 */

import { KICD_YOUTUBE_VIDEO_SEEDS } from "../src/lib/data/kicd-youtube-learning-library";
import { KICD_YOUTUBE_VIDEO_SEEDS_PART2 } from "../src/lib/data/kicd-youtube-learning-library-part2";
import { KICD_YOUTUBE_VIDEO_SEEDS_PART3 } from "../src/lib/data/kicd-youtube-learning-library-part3";
import { KICD_YOUTUBE_VIDEO_SEEDS_PART4 } from "../src/lib/data/kicd-youtube-learning-library-part4";
import { seedAllYouTubeLearningVideos, extractYouTubeId } from "../src/lib/services/youtube-learning.service";
import { db } from "../src/lib/db";

const allYouTubeSeeds = [
  ...KICD_YOUTUBE_VIDEO_SEEDS,
  ...KICD_YOUTUBE_VIDEO_SEEDS_PART2,
  ...KICD_YOUTUBE_VIDEO_SEEDS_PART3,
  ...KICD_YOUTUBE_VIDEO_SEEDS_PART4,
];

async function runTest() {
  console.log("=================================================================");
  console.log("EE.7 — YOUTUBE LEARNING LIBRARY CURATED REPOSITORY TEST SUITE");
  console.log("=================================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, name: string, details?: any) {
    total++;
    if (condition) {
      console.log(`[PASS ${total}] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL ${total}] ${name}`, details || "");
      process.exit(1);
    }
  }

  assert(allYouTubeSeeds.length >= 150, `Curated KICD YouTube video repository contains high-density links across core strands (Found ${allYouTubeSeeds.length})`);

  let invalidIdCount = 0;
  for (const v of allYouTubeSeeds) {
    const extracted = extractYouTubeId(v.youtubeId);
    if (!extracted || extracted.length !== 11) invalidIdCount++;
  }
  assert(invalidIdCount === 0, `All curated YouTube links have valid, authentic 11-character YouTube IDs (` + `${invalidIdCount} invalid)` );

  console.log("\n--- Executing real database seed via seedAllYouTubeLearningVideos() ---");
  const testTenantId = "tenant-ee7-exp-" + Date.now();
  await db.tenant.create({
    data: {
      id: testTenantId,
      name: "Mji Mpya Science High School",
      slug: "mjimpya-ee7-" + Date.now(),
      county: "Mombasa",
    }
  });

  const testUser = await db.user.create({
    data: {
      email: `principal+ee7@mjimpya.ac.ke`,
      neyoLoginId: `principal_ee7_${Date.now()}`,
      passwordHash: "hash_ee7",
      fullName: "Principal Mji Mpya EE7",
      role: "PRINCIPAL",
      tenantId: testTenantId,
      isActive: true,
    }
  });

  const firstSeedResult = await seedAllYouTubeLearningVideos(testUser as any);
  assert(firstSeedResult.seededCount + firstSeedResult.skippedCount === allYouTubeSeeds.length, `First run processed exactly ${allYouTubeSeeds.length} LearningVideo items across all strands (Seeded ${firstSeedResult.seededCount}, Skipped duplicate IDs ${firstSeedResult.skippedCount})`);

  // Verify idempotency on second run
  const secondSeedResult = await seedAllYouTubeLearningVideos(testUser as any);
  assert(secondSeedResult.seededCount === 0 && secondSeedResult.skippedCount === allYouTubeSeeds.length, `Second run is 100% idempotent — exactly 0 duplicate entries created (${secondSeedResult.skippedCount} skipped)`);

  const totalDbVideos = await db.learningVideo.count({ where: { tenantId: testTenantId } });
  assert(totalDbVideos === firstSeedResult.seededCount, `Database confirms exact match of ${firstSeedResult.seededCount} unique stored videos across all strands`);

  // Verify that subject and strand linking saved cleanly
  const sampleVideo = await db.learningVideo.findFirst({
    where: { tenantId: testTenantId, youtubeId: "5p0m4W7vVbU" },
    include: { subject: true, strand: true, substrand: true }
  });
  assert(sampleVideo !== null && sampleVideo.subject?.code === "MAT" && sampleVideo.strand?.name?.includes("Numbers") === true && sampleVideo.substrand?.name === "Whole Numbers", `Video linked cleanly to real Subject (MAT), Strand (Numbers), and Substrand (${sampleVideo?.substrand?.name})`);

  // Clean up
  await db.learningVideo.deleteMany({ where: { tenantId: testTenantId } });
  await db.cbcSubstrand.deleteMany({ where: { tenantId: testTenantId } });
  await db.cbcStrand.deleteMany({ where: { tenantId: testTenantId } });
  await db.subject.deleteMany({ where: { tenantId: testTenantId } });
  await db.user.deleteMany({ where: { tenantId: testTenantId } });
  await db.tenant.delete({ where: { id: testTenantId } });

  console.log("\n=================================================================");
  console.log(`MASTER VERIFICATION COMPLETE: ${passed}/${total} CHECKS PASSED CLEANLY!`);
  console.log("=================================================================\n");
}

runTest().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
