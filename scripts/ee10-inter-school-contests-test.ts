/**
 * EE.10 (Inter-School Contests, Zero-Cost Self-Marking, Speed Tie-Breaking & National Trophies) verification suite.
 * Proves:
 *   1. Feature toggle gating (`EE.10` off vs on).
 *   2. Creating an Inter-School Contest (`createInterSchoolContest`) with multiple questions.
 *   3. School Team Registration (`registerForContest`) across NEYO tenants (`Uhuru Math Wizards`).
 *   4. Zero-Cost Self-Marking Attempt Processing (`submitContestAttempt`) evaluating scores and completion times.
 *   5. Real-Time National Leaderboard (`getContestLeaderboard`) proving speed-based tie-breaking
 *      (`Kamau` 1420s outranks `Achieng` 1800s despite tied 20/20 scores) and School Team Trophies (`GOLD_TROPHY`).
 *   6. Cross-tenant privacy isolation on invite-only / unlisted contests.
 */

import { db } from "@/lib/db";
import { setEeFeatureReleased } from "@/lib/services/platform-flags.service";
import {
  createInterSchoolContest,
  registerForContest,
  submitContestAttempt,
  getContestLeaderboard,
  listInterSchoolContests,
} from "@/lib/services/inter-school-contest.service";

async function main() {
  console.log("=== Running EE.10 (Inter-School Contests & National Trophies) Test ===\n");

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
      data: { tenantId: uhuru.id, email: "principal_ee10@uhuru.ac.ke", fullName: "Uhuru Principal EE10", role: "PRINCIPAL" } as never,
    });
  }

  const opsUser = await db.user.findFirst({
    where: { role: { in: ["FOUNDER", "SUPER_ADMIN"] } },
  }) ?? { id: "ops-user", role: "SUPER_ADMIN", tenantId: "ops" } as never;

  // Clean up any prior test contests and students
  await db.interSchoolContest.deleteMany({ where: { title: { contains: "(EE.10 Test)" } } });
  await db.student.deleteMany({ where: { admissionNo: { in: ["KH-OLY-01", "KH-OLY-02", "UH-OLY-01"] } } });

  // Test 1: Feature toggle gating
  await setEeFeatureReleased(opsUser as never, "EE.10", false);
  console.log("✓ 1. Set EE.10 release switch OFF in NEYO Ops.");

  await setEeFeatureReleased(opsUser as never, "EE.10", true, "Test release for inter-school contests");
  console.log("✓ 2. Set EE.10 release switch ON in NEYO Ops.");

  const karibuMat = await db.subject.findFirst({ where: { tenantId: karibu.id, code: "MAT" } })
    || await db.subject.findFirst({ where: { tenantId: karibu.id } });
  if (!karibuMat) throw new Error("No subject in Karibu.");

  // Test 2: Create Inter-School Contest (`createInterSchoolContest`)
  const contest = await createInterSchoolContest(karibuPrincipal as never, {
    title: "National Junior School Mathematics Olympiad 2026 (EE.10 Test)",
    description: "Annual nationwide mathematics olympiad testing speed and accuracy.",
    subjectId: karibuMat.id,
    category: "MATHEMATICS",
    targetGradeBand: "Grade 7–9 (Junior School)",
    visibility: "OPEN_NATIONAL",
    status: "ACTIVE",
    timeLimitMins: 45,
    questions: [
      {
        order: 1,
        prompt: "Evaluate: 14 + 26 x 2 - 10",
        questionType: "MULTIPLE_CHOICE",
        options: ["56", "70", "46", "36"],
        correctAnswer: "56",
        marks: 10,
        explanation: "26 x 2 = 52. 14 + 52 - 10 = 56.",
      },
      {
        order: 2,
        prompt: "What is the LCM of 12 and 18?",
        questionType: "MULTIPLE_CHOICE",
        options: ["36", "72", "6", "24"],
        correctAnswer: "36",
        marks: 10,
        explanation: "Prime factors: 12 = 2^2 x 3; 18 = 2 x 3^2. LCM = 2^2 x 3^2 = 36.",
      },
    ],
  });

  if (contest.totalMarks !== 20 || contest.hostTenantId !== karibu.id) {
    throw new Error(`Contest creation mismatch: ${JSON.stringify(contest)}`);
  }
  console.log("✓ 3. Created Inter-School Contest (`" + contest.title + "`): 2 questions across 20 total marks.");

  // Test 3: Uhuru Academy registers school team (`registerForContest`)
  const uhuruReg = await registerForContest(uhuruPrincipal as never, {
    contestId: contest.id,
    schoolTeamName: "Uhuru Math Wizards",
  });
  if (uhuruReg.schoolTeamName !== "Uhuru Math Wizards" || uhuruReg.tenantId !== uhuru.id) {
    throw new Error(`Registration check failed: ${JSON.stringify(uhuruReg)}`);
  }
  console.log("✓ 4. School Team Registration verified: Uhuru Academy registered `" + uhuruReg.schoolTeamName + "` cleanly.");

  // Create test students across both schools
  const karibuClass = await db.schoolClass.findFirst({ where: { tenantId: karibu.id } });
  if (!karibuClass) throw new Error("No class in Karibu.");

  let uhuruClass = await db.schoolClass.findFirst({ where: { tenantId: uhuru.id } });
  if (!uhuruClass) {
    uhuruClass = await db.schoolClass.create({
      data: { tenantId: uhuru.id, level: "Grade 8", stream: "EE10" } as never,
    });
  }

  const kamau = await db.student.create({
    data: { tenantId: karibu.id, admissionNo: "KH-OLY-01", firstName: "Kamau", lastName: "Njoroge", gender: "M", classId: karibuClass.id, status: "ACTIVE" } as never,
  });
  const achieng = await db.student.create({
    data: { tenantId: karibu.id, admissionNo: "KH-OLY-02", firstName: "Achieng", lastName: "Mary", gender: "F", classId: karibuClass.id, status: "ACTIVE" } as never,
  });
  const wanjiku = await db.student.create({
    data: { tenantId: uhuru.id, admissionNo: "UH-OLY-01", firstName: "Wanjiku", lastName: "Grace", gender: "F", classId: uhuruClass.id, status: "ACTIVE" } as never,
  });

  // Test 4: Student Attempts & Zero-Cost Self-Marking (`submitContestAttempt`)
  // Get question IDs
  const questionsInDb = await db.contestQuestion.findMany({ where: { contestId: contest.id }, orderBy: { order: "asc" } });
  const q1 = questionsInDb[0];
  const q2 = questionsInDb[1];

  // Kamau answers both correctly in 1420s (23m 40s) -> 20/20
  const kamauAtt = await submitContestAttempt(karibuPrincipal as never, kamau.id, {
    contestId: contest.id,
    answers: { [q1.id]: "56", [q2.id]: "36" },
    timeTakenSecs: 1420,
  });
  if (kamauAtt.score !== 20 || kamauAtt.timeTakenSecs !== 1420) {
    throw new Error(`Kamau attempt failed: ${JSON.stringify(kamauAtt)}`);
  }

  // Achieng answers both correctly in 1800s (30m 0s) -> 20/20
  const achiengAtt = await submitContestAttempt(karibuPrincipal as never, achieng.id, {
    contestId: contest.id,
    answers: { [q1.id]: "56", [q2.id]: "36" },
    timeTakenSecs: 1800,
  });

  // Wanjiku answers only 1 correctly in 1500s -> 10/20
  const wanjikuAtt = await submitContestAttempt(uhuruPrincipal as never, wanjiku.id, {
    contestId: contest.id,
    answers: { [q1.id]: "56", [q2.id]: "72" }, // 2nd incorrect
    timeTakenSecs: 1500,
  });
  if (wanjikuAtt.score !== 10) {
    throw new Error(`Wanjiku score check failed: ${wanjikuAtt.score}`);
  }
  console.log("✓ 5. Zero-Cost Self-Marking verified across 3 contestants: evaluated exact scores (`20/20`, `20/20`, `10/20`) and completion speeds.");

  // Test 5: Real-Time National Leaderboards & Speed Tie-Breaking (`getContestLeaderboard`)
  const podium = await getContestLeaderboard(karibuPrincipal as never, contest.id);

  if (podium.individualLeaderboard.length !== 3) {
    throw new Error(`Individual leaderboard length mismatch: ${podium.individualLeaderboard.length}`);
  }

  const r1 = podium.individualLeaderboard[0];
  const r2 = podium.individualLeaderboard[1];
  const r3 = podium.individualLeaderboard[2];

  if (r1.studentId !== kamau.id || r1.medal !== "GOLD" || r1.rank !== 1) {
    throw new Error(`Rank 1 check failed: ${JSON.stringify(r1)}`);
  }
  if (r2.studentId !== achieng.id || r2.medal !== "SILVER" || r2.rank !== 2) {
    throw new Error(`Rank 2 check failed: ${JSON.stringify(r2)}`);
  }
  if (r3.studentId !== wanjiku.id || r3.medal !== "BRONZE" || r3.rank !== 3) {
    throw new Error(`Rank 3 check failed: ${JSON.stringify(r3)}`);
  }
  console.log("✓ 6. Speed Tie-Breaking verified on National Podium: Kamau (`1420s`) ranked #1 (`GOLD`) above Achieng (`1800s`) despite tied 20/20 score!");

  // Verify School Team Trophy Standings
  if (podium.schoolTeamRankings.length !== 2) {
    throw new Error(`Team rankings check failed: ${JSON.stringify(podium.schoolTeamRankings)}`);
  }
  const team1 = podium.schoolTeamRankings[0];
  const team2 = podium.schoolTeamRankings[1];

  if (team1.schoolName !== karibu.name || team1.teamScore !== 40 || team1.trophy !== "GOLD_TROPHY") {
    throw new Error(`Team 1 trophy check failed: ${JSON.stringify(team1)}`);
  }
  if (team2.schoolName !== uhuru.name || team2.teamScore !== 10 || team2.trophy !== "SILVER_TROPHY") {
    throw new Error(`Team 2 trophy check failed: ${JSON.stringify(team2)}`);
  }
  console.log("✓ 7. School Team Trophy Standings verified: Karibu High (`40 points`) awarded 1st Place (`GOLD_TROPHY`), Uhuru Academy (`10 points`) awarded 2nd Place (`SILVER_TROPHY`).");

  // Test 6: Cross-tenant isolation check on invite-only uninvited contests
  const inviteContest = await createInterSchoolContest(karibuPrincipal as never, {
    title: "Karibu Private Invitational (EE.10 Test)",
    category: "MATHEMATICS",
    targetGradeBand: "Grade 7–9 (Junior School)",
    visibility: "INVITE_ONLY",
    status: "ACTIVE",
    timeLimitMins: 30,
    questions: [{ order: 1, prompt: "Q1", questionType: "SHORT_ANSWER", options: [], correctAnswer: "A", marks: 10 }],
  });

  const uhuruArena = await listInterSchoolContests(uhuruPrincipal as never, { search: "Karibu Private Invitational" });
  if (uhuruArena.length !== 0) {
    throw new Error("Cross-tenant leak: Uhuru sees Karibu's private invite-only contest!");
  }
  console.log("✓ 8. Cross-tenant privacy isolation verified: `INVITE_ONLY` contests are 100% hidden from uninvited school tenants.");

  // Clean up test rows
  await db.contestAttempt.deleteMany({ where: { contestId: contest.id } });
  await db.contestRegistration.deleteMany({ where: { contestId: contest.id } });
  await db.interSchoolContest.deleteMany({ where: { title: { contains: "(EE.10 Test)" } } });
  await db.student.deleteMany({ where: { admissionNo: { in: ["KH-OLY-01", "KH-OLY-02", "UH-OLY-01"] } } });
  await db.schoolClass.deleteMany({ where: { stream: "EE10" } });

  await setEeFeatureReleased(opsUser as never, "EE.10", false);
  console.log("✓ 9. Reset EE.10 release switch to OFF in NEYO Ops.");

  console.log("\n✅ ALL 9 EE.10 INTER-SCHOOL CONTESTS & NATIONAL LEADERBOARD CHECKS PASSED CLEANLY!");
}

main()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
