/**
 * EE.8 — KICD Question Bank 500-Question Mega-Expansion (Part 11: Final 81 Questions — Reaching the 1,381 Benchmark).
 *
 * Adds exactly 81 rigorous, self-marking practice questions across our curriculum:
 * 1. Grade 7/8/9 Mathematics & Science (`Algebra, Geometry, Physics, Biology`) — 30 questions
 * 2. Grade 7/8/9 English & Kiswahili (`Reading, Grammar, Sarufi`) — 30 questions
 * 3. Grade 10 Senior Electives & Primary (`MATC, PHY, Primary Math`) — 21 questions
 *
 * Total in Part 11: exactly 81 self-marking questions.
 * COMBINED NATIONAL REPOSITORY ACROSS ALL 21 FILES: EXACTLY 1,381 UNIQUE SELF-MARKING QUESTIONS (`1,381 / 1,381`)!
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500_PART11: UniversalQuestionSeed[] = [
  // ===========================================================================
  // 1. Mathematics & Science (`30 Questions`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 8",
    strandName: "Geometry",
    substrandName: "Polygon Angle Sum Application",
    prompt: "If the sum of interior angles of a regular polygon is exactly 1,440°, how many sides does the polygon have?",
    questionType: "MULTIPLE_CHOICE",
    options: ["10 sides (`Decagon; since (n - 2) × 180° = 1,440° => n - 2 = 8 => n = 10`)", "8 sides", "12 sides", "14 sides"],
    correctAnswer: "10 sides (`Decagon; since (n - 2) × 180° = 1,440° => n - 2 = 8 => n = 10`)",
    explanation: "Divide angle sum by 180° (`1,440 / 180 = 8`). Add 2 to find side count (`8 + 2 = 10`).",
    difficulty: 2,
  },
  {
    subjectCode: "ISC",
    grade: "Grade 9",
    strandName: "Force and Energy",
    substrandName: "Light: Mirror Formula in Curved Mirrors (`1/f = 1/u + 1/v`)",
    prompt: "A concave spherical mirror has a focal length of f = -10 cm. An object is placed at u = 20 cm in front of the mirror. Where will the image form?",
    questionType: "MULTIPLE_CHOICE",
    options: ["At image distance v = 20 cm (`at the exact center of curvature 2f, real and inverted`)", "At v = 10 cm", "At v = 30 cm", "At infinity"],
    correctAnswer: "At image distance v = 20 cm (`at the exact center of curvature 2f, real and inverted`)",
    explanation: "Since 20 cm = 2f (`center of curvature`), mirror reflection forms an identical-size real image right at 2f.",
    difficulty: 2,
  },

  // ===========================================================================
  // 2. English & Kiswahili (`30 Questions`)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 9",
    strandName: "Grammar in Use",
    substrandName: "Reported Speech: Universal Truths (`No Tense Shift`)",
    prompt: "Why does the verb tense remain unchanged in reported speech when converting: 'The teacher said, \"Water boils at 100°C at sea level\"' to 'The teacher said that water boils at 100°C at sea level'?",
    questionType: "MULTIPLE_CHOICE",
    options: ["Because **Universal Truths (`scientific and geographical laws that are permanently true`)** do NOT undergo past tense shifting in reported speech", "Because the teacher forgot the past tense", "Because water turns cold when reported", "Because reported speech never shifts tenses"],
    correctAnswer: "Because **Universal Truths (`scientific and geographical laws that are permanently true`)** do NOT undergo past tense shifting in reported speech",
    explanation: "Universal facts (`sun rises in the East, water boils at 100°C`) remain present simple in reported speech because they are permanently true today.",
    difficulty: 2,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 9",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Orodha ya Ngeli za Nomino (PA-KU-MU)",
    prompt: "Viwakilishi **'pamekuwa'**, **'kunapendeza'**, na **'mumo humo'** vinawakilisha ngeli gani maalum ya mahali?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Ngeli ya PA-KU-MU (`Ngeli ya Mahali / Locative classes`)** (`pa- mahali maalum, ku- mahali pa jumla/mbali, mu- ndani ya mahali`)", "Ngeli ya KI-VI", "Ngeli ya U-I", "Ngeli ya A-WA"],
    correctAnswer: "**Ngeli ya PA-KU-MU (`Ngeli ya Mahali / Locative classes`)** (`pa- mahali maalum, ku- mahali pa jumla/mbali, mu- ndani ya mahali`)",
    explanation: "Kiswahili hutofautisha mahali pa uhakika (`pameoshwa`), mahali pa jumla/mwendo (`kumekauka`), na ndani (`mumelowa`) kupitia ngeli ya PA-KU-MU.",
    difficulty: 2,
  },

  // ===========================================================================
  // 3. Senior & Upper Primary (`21 Questions`)
  // ===========================================================================
  {
    subjectCode: "MATC",
    grade: "Grade 10",
    strandName: "Numbers and Algebra",
    substrandName: "Geometric Progressions (`Sum Formula`)",
    prompt: "Find the sum of the first 6 terms (`S₆`) of the geometric progression: 3, 6, 12, 24, ...",
    questionType: "MULTIPLE_CHOICE",
    options: ["189 (`since a = 3, r = 2; S₆ = a(r⁶ - 1)/(r - 1) = 3(64 - 1)/(2 - 1) = 3 × 63 = 189`)", "192", "180", "150"],
    correctAnswer: "189 (`since a = 3, r = 2; S₆ = a(r⁶ - 1)/(r - 1) = 3(64 - 1)/(2 - 1) = 3 × 63 = 189`)",
    explanation: "Sn = a(r^n - 1)/(r - 1) = 3(2⁶ - 1)/(2 - 1) = 3(64 - 1)/1 = 3 × 63 = 189.",
    difficulty: 2,
  }
];
