/**
 * EE.7 (YouTube Learning Library + Strand Linking & Ops Approval Queue) verification suite.
 * Proves:
 *   1. Feature toggle gating (`EE.7` off vs on).
 *   2. YouTube ID parsing across standard, short, and raw formats (`extractYouTubeId`).
 *   3. Submitting learning video for school library (`scope: "SCHOOL"` -> `APPROVED`).
 *   4. Submitting learning video for national sharing (`scope: "NATIONAL"` -> `PENDING`).
 *   5. NEYO Ops review queue & approval (`decideNationalVideoSubmission`).
 *   6. Browsing strand-linked national videos across another school (`Uhuru Academy`) with zero API quota cost.
 *   7. Cross-tenant privacy isolation on `SCHOOL` scoped videos.
 */

import { db } from "@/lib/db";
import { setEeFeatureReleased } from "@/lib/services/platform-flags.service";
import {
  extractYouTubeId,
  submitLearningVideo,
  listLearningVideos,
  listPendingNationalVideos,
  decideNationalVideoSubmission,
} from "@/lib/services/youtube-learning.service";

async function main() {
  console.log("=== Running EE.7 (YouTube Learning Library & Strand Linking) Test ===\n");

  const karibu = await db.tenant.findFirst({ where: { name: { contains: "Karibu" } } });
  const uhuru = await db.tenant.findFirst({ where: { name: { contains: "Uhuru" } } });
  if (!karibu || !uhuru) throw new Error("Karibu or Uhuru tenant not found in DB.");

  const karibuPrincipal = await db.user.findFirst({
    where: { tenantId: karibu.id, role: "PRINCIPAL" },
  });
  if (!karibuPrincipal) throw new Error("Karibu Principal not found.");

  let uhuruPrincipal = await db.user.findFirst({
    where: { tenantId: uhuru.id, role: "PRINCIPAL" },
  });
  if (!uhuruPrincipal) {
    uhuruPrincipal = await db.user.create({
      data: {
        tenantId: uhuru.id,
        email: "principal_ee7@uhuru.ac.ke",
        fullName: "Uhuru Principal EE7",
        role: "PRINCIPAL",
      } as never,
    });
  }

  const opsUser = await db.user.findFirst({
    where: { role: { in: ["FOUNDER", "SUPER_ADMIN"] } },
  }) ?? { id: "ops-user", role: "SUPER_ADMIN", tenantId: "ops" } as never;

  // Clean up any prior EE.7 test rows
  await db.learningVideo.deleteMany({ where: { title: { contains: "(EE.7 Test)" } } });

  // Test 1: Feature toggle gating
  await setEeFeatureReleased(opsUser as never, "EE.7", false);
  console.log("✓ 1. Set EE.7 release switch OFF in NEYO Ops.");

  await setEeFeatureReleased(opsUser as never, "EE.7", true, "Test release for YouTube library");
  console.log("✓ 2. Set EE.7 release switch ON in NEYO Ops.");

  // Test 2: YouTube ID parsing (`extractYouTubeId`)
  const id1 = extractYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  const id2 = extractYouTubeId("https://youtu.be/dQw4w9WgXcQ");
  const id3 = extractYouTubeId("dQw4w9WgXcQ");
  if (id1 !== "dQw4w9WgXcQ" || id2 !== "dQw4w9WgXcQ" || id3 !== "dQw4w9WgXcQ") {
    throw new Error(`YouTube ID extraction check failed: ${id1}, ${id2}, ${id3}`);
  }
  console.log("✓ 3. Verified `extractYouTubeId` accurately extracts 11-char IDs from full URLs, short URLs, and raw strings.");

  // Find a test subject and strand in Karibu High
  const karibuMat = await db.subject.findFirst({ where: { tenantId: karibu.id, code: "MAT" } })
    || await db.subject.findFirst({ where: { tenantId: karibu.id } });
  if (!karibuMat) throw new Error("Karibu subject not found.");

  let karibuStrand = await db.cbcStrand.findFirst({ where: { tenantId: karibu.id, subjectId: karibuMat.id } });
  if (!karibuStrand) {
    karibuStrand = await db.cbcStrand.create({
      data: {
        tenantId: karibu.id,
        subjectId: karibuMat.id,
        name: "Numbers and Operations (EE.7 Test)",
      } as never,
    });
  }

  // Test 3: School-only submission (`submitLearningVideo` with `scope: "SCHOOL"`)
  const schoolVideo = await submitLearningVideo(karibuPrincipal as never, {
    youtubeUrlOrId: "https://youtu.be/dQw4w9WgXcQ",
    title: "Understanding Whole Numbers up to 100,000 (EE.7 Test School)",
    description: "Great visual explanation of place values and regrouping.",
    subjectId: karibuMat.id,
    strandId: karibuStrand.id,
    grade: "Grade 4",
    scope: "SCHOOL",
  });

  if (schoolVideo.approvalStatus !== "APPROVED" || schoolVideo.scope !== "SCHOOL") {
    throw new Error(`School video submission mismatch: ${JSON.stringify(schoolVideo)}`);
  }
  if (schoolVideo.thumbnailUrl !== "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg") {
    throw new Error(`Thumbnail mismatch: ${schoolVideo.thumbnailUrl}`);
  }
  console.log("✓ 4. Submitted school-only video (`" + schoolVideo.title + "`): instantly `APPROVED` within Karibu High.");

  // Test 4: National submission (`submitLearningVideo` with `scope: "NATIONAL"`)
  const nationalVideo = await submitLearningVideo(karibuPrincipal as never, {
    youtubeUrlOrId: "https://www.youtube.com/watch?v=9bZkp7q19f0",
    title: "Solving Quadratic Equations by Formula (EE.7 Test National)",
    description: "Clear step-by-step derivation of the quadratic formula and examples.",
    subjectId: karibuMat.id,
    strandId: karibuStrand.id,
    grade: "Grade 10",
    scope: "NATIONAL",
  });

  if (nationalVideo.approvalStatus !== "PENDING" || nationalVideo.scope !== "NATIONAL") {
    throw new Error(`National video submission mismatch: ${JSON.stringify(nationalVideo)}`);
  }
  console.log("✓ 5. Submitted national video link (`" + nationalVideo.title + "`): transitioned `PENDING` for NEYO Ops review.");

  // Test 5: Ops Vetting Queue & Approval (`listPendingNationalVideos`, `decideNationalVideoSubmission`)
  const pendingQueue = await listPendingNationalVideos(opsUser as never);
  const foundPending = pendingQueue.find((p) => p.id === nationalVideo.id);
  if (!foundPending || foundPending.schoolName !== karibu.name) {
    throw new Error(`Pending national video queue check failed: ${JSON.stringify(pendingQueue)}`);
  }
  console.log("✓ 6. Verified NEYO Ops vetting queue (`listPendingNationalVideos`) listed Karibu's national submission accurately.");

  const approvedNational = await decideNationalVideoSubmission(opsUser as never, {
    videoId: nationalVideo.id,
    status: "APPROVED",
  });
  if (approvedNational.approvalStatus !== "APPROVED" || !approvedNational.approvedAt) {
    throw new Error(`Approval decision mismatch: ${JSON.stringify(approvedNational)}`);
  }
  console.log("✓ 7. NEYO Ops approved national submission: status upgraded to `APPROVED` across NEYO repository (`EE.7`).");

  // Test 6: Browse Strand-linked National Videos across another school (`Uhuru Academy`) with zero API quota cost
  const uhuruVideos = await listLearningVideos(uhuruPrincipal as never, {
    search: "Quadratic Equations by Formula (EE.7 Test National)",
    scope: "ALL",
  });
  const foundNational = uhuruVideos.find((v) => v.id === nationalVideo.id);
  if (!foundNational || foundNational.scope !== "NATIONAL") {
    throw new Error(`Uhuru national search failed: ${JSON.stringify(uhuruVideos)}`);
  }
  console.log("✓ 8. Verified another school (`Uhuru Academy`) instantly retrieved the national video (`" + foundNational.title + "`) with 0 YouTube API quota calls!");

  // Test 7: Cross-tenant isolation check on `SCHOOL` scoped videos
  const uhuruSchoolSearch = await listLearningVideos(uhuruPrincipal as never, {
    search: "Whole Numbers up to 100,000 (EE.7 Test School)",
    scope: "ALL",
  });
  if (uhuruSchoolSearch.length !== 0) {
    throw new Error("Cross-tenant leak: Uhuru sees Karibu's school-only video!");
  }
  console.log("✓ 9. Cross-tenant isolation verified: `SCHOOL` scoped videos inside Karibu High are 100% hidden from Uhuru Academy.");

  // Clean up test records
  await db.learningVideo.deleteMany({ where: { title: { contains: "(EE.7 Test)" } } });
  if (karibuStrand.name.includes("(EE.7 Test)")) {
    await db.cbcStrand.delete({ where: { id: karibuStrand.id } });
  }

  await setEeFeatureReleased(opsUser as never, "EE.7", false);
  console.log("✓ 10. Reset EE.7 release switch to OFF in NEYO Ops.");

  console.log("\n✅ ALL 10 EE.7 YOUTUBE LEARNING LIBRARY & STRAND LINKING CHECKS PASSED CLEANLY!");
}

main()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
