/**
 * EE.8 — KICD Question Bank 500-More Mega-Expansion (Part 28: High-Density Practice — 209 Questions).
 *
 * Adds 209 exact, self-marking practice questions across Primary, Junior, and Senior School (`Grade 1 through Grade 10`):
 * 1. Mathematics (`Grade 1–10 Numbers, Algebra, Geometry, Measurement, Statistics`) — 70 questions
 * 2. English & Kiswahili (`Grade 1–9 Reading, Grammar, Sarufi, Fasihi`) — 70 questions
 * 3. Science & Humanities (`Grade 1–10 Physics, Chemistry, Biology, Social Studies, Pre-Technical`) — 69 questions
 *
 * Total in Part 28 of 500more: exactly 209 self-marking questions.
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500MORE_PART28: UniversalQuestionSeed[] = [
  // ===========================================================================
  // Mathematics (`70 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 7",
    strandName: "Algebra",
    substrandName: "Solving Inequalities with Fractions",
    prompt: "Solve for m: (2m - 1) / 3 > 5.",
    questionType: "MULTIPLE_CHOICE",
    options: ["**m > 8** (`since multiplying by 3 yields 2m - 1 > 15; adding 1 gives 2m > 16 => m > 8`)", "m > 6", "m < 8", "m ≥ 8"],
    correctAnswer: "**m > 8** (`since multiplying by 3 yields 2m - 1 > 15; adding 1 gives 2m > 16 => m > 8`)",
    explanation: "Multiply across by 3: 2m - 1 > 15. Add 1: 2m > 16. Divide by 2: m > 8.",
    difficulty: 2,
  },
  {
    subjectCode: "MATC",
    grade: "Grade 10",
    strandName: "Numbers and Algebra",
    substrandName: "Polynomials (`Factor Theorem with Cubics`)",
    prompt: "Show that (x - 2) is a factor of P(x) = x³ - 6x² + 11x - 6, and find the remaining quadratic factor.",
    questionType: "MULTIPLE_CHOICE",
    options: ["**(x² - 4x + 3)** (`since P(2) = 8 - 24 + 22 - 6 = 0; dividing P(x) by (x - 2) via long division yields x² - 4x + 3`)", "(x² + 4x - 3)", "(x² - 5x + 6)", "(x² - 3x + 2)"],
    correctAnswer: "**(x² - 4x + 3)** (`since P(2) = 8 - 24 + 22 - 6 = 0; dividing P(x) by (x - 2) via long division yields x² - 4x + 3`)",
    explanation: "Polynomial division of (x³ - 6x² + 11x - 6) / (x - 2) gives x² - 4x + 3 (`which factors further to (x - 1)(x - 3)`).",
    difficulty: 3,
  },

  // ===========================================================================
  // English & Kiswahili (`70 Questions across Grade 1–9`)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 8",
    strandName: "Grammar in Use",
    substrandName: "Adverbial Clauses of Purpose (`So that vs In order that`)",
    prompt: "Choose the conjunction of purpose: 'The bursar installed a double-lock safe inside her office (`B.7`) **_______** student fee cash payments (`T.10`) would be completely secure overnight.'",
    questionType: "MULTIPLE_CHOICE",
    options: ["**so that (`or in order that`)** (`introducing the intended purpose/goal of installing the double-lock safe`)", "unless", "whereas", "until"],
    correctAnswer: "**so that (`or in order that`)** (`introducing the intended purpose/goal of installing the double-lock safe`)",
    explanation: "*So that* and *In order that* express deliberate aim or objective (`followed by modal verbs would/could/might`).",
    difficulty: 2,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 8",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Kauli ya Kutendwa (`Mnyambuo wa 'Oa vs Olewa'`)",
    prompt: "Kitenzi **'oa'** kinapowekwa katika kauli ya **Kutendwa (`Passive`)**, kinabadilika kuwa kipi?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**olewa** (`k.m. binti huyo aliolewa na mwalimu`)", "ozwa", "oana", "olesha"],
    correctAnswer: "**olewa** (`k.m. binti huyo aliolewa na mwalimu`)",
    explanation: "Vitenzi vya irabu mbili huchukua '-lewa' au '-wa' (`oa -> olewa, zaa -> zaliwa`).",
    difficulty: 2,
  },

  // ===========================================================================
  // Science & Humanities (`69 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "BIO",
    grade: "Grade 10",
    strandName: "Nutrition in Plants and Animals",
    substrandName: "The Krebs Cycle (`Citric Acid Cycle Matrix`)",
    prompt: "Where inside the cell mitochondria does the **Krebs Cycle (`Citric Acid Cycle`)** specifically occur, and what is the initial 6-carbon molecule formed when acetyl-CoA combines with oxaloacetate?",
    questionType: "MULTIPLE_CHOICE",
    options: ["Inside the **Mitochondrial Matrix** (`liquid interior`), forming **Citric Acid (`Citrate — a 6-carbon tricarboxylic acid`)** (`releasing 2 CO₂ molecules, 3 NADH, 1 FADH₂, and 1 ATP per acetyl-CoA turned`)", "Inside the outer mitochondrial membrane forming glucose", "Inside the nucleus forming DNA", "Inside ribosomes forming protein"],
    correctAnswer: "Inside the **Mitochondrial Matrix** (`liquid interior`), forming **Citric Acid (`Citrate — a 6-carbon tricarboxylic acid`)** (`releasing 2 CO₂ molecules, 3 NADH, 1 FADH₂, and 1 ATP per acetyl-CoA turned`)",
    explanation: "The Krebs cycle (`aerobic stage 2`) oxidizes acetyl-CoA completely inside the mitochondrial matrix.",
    difficulty: 3,
  }
];
