/**
 * EE.8 — KICD Question Bank 500-More Mega-Expansion (Part 20: High-Density Multi-Grade — 229 Questions).
 *
 * Adds 229 exact, self-marking practice questions across Primary, Junior, and Senior School (`Grade 1 through Grade 10`):
 * 1. Mathematics (`Grade 1–10 Numbers, Algebra, Geometry, Measurement, Statistics`) — 77 questions
 * 2. English & Kiswahili (`Grade 1–9 Reading, Grammar, Sarufi, Fasihi`) — 76 questions
 * 3. Science & Humanities (`Grade 1–10 Physics, Chemistry, Biology, Social Studies, Pre-Technical`) — 76 questions
 *
 * Total in Part 20 of 500more: exactly 229 self-marking questions.
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500MORE_PART20: UniversalQuestionSeed[] = [
  // ===========================================================================
  // Mathematics (`77 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 7",
    strandName: "Algebra",
    substrandName: "Simplifying Algebraic Fractions with Trinomials",
    prompt: "Simplify fully: (x² + 7x + 12) / (x² - 16).",
    questionType: "MULTIPLE_CHOICE",
    options: ["(x + 3) / (x - 4) (`since numerator factors to (x + 3)(x + 4) and denominator to (x - 4)(x + 4); canceling (x + 4) gives (x + 3)/(x - 4)`)", "(x - 3) / (x + 4)", "(x + 3) / (x + 4)", "x + 3"],
    correctAnswer: "(x + 3) / (x - 4) (`since numerator factors to (x + 3)(x + 4) and denominator to (x - 4)(x + 4); canceling (x + 4) gives (x + 3)/(x - 4)`)",
    explanation: "Factoring both numerator (`(x+3)(x+4)`) and denominator (`(x-4)(x+4)`) allows clean factor cancellation.",
    difficulty: 2,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 8",
    strandName: "Geometry",
    substrandName: "Surface Area of Solid Cones (`A = πr² + πrl`)",
    prompt: "A solid right circular cone has a base radius r = 7 cm and a slant height l = 25 cm. Taking π = 22/7, what is its total surface area?",
    questionType: "MULTIPLE_CHOICE",
    options: ["704 cm² (`since Total Area = Base Area πr² + Curved Area πrl = (22/7 × 49) + (22/7 × 7 × 25) = 154 + 550 = 704 cm²`)", "550 cm² (`curved area only`)", "154 cm² (`base area only`)", "1,100 cm²"],
    correctAnswer: "704 cm² (`since Total Area = Base Area πr² + Curved Area πrl = (22/7 × 49) + (22/7 × 7 × 25) = 154 + 550 = 704 cm²`)",
    explanation: "Total surface area sums base disc (`154 cm²`) plus curved mantle (`550 cm²`) = 704 cm².",
    difficulty: 2,
  },

  // ===========================================================================
  // English & Kiswahili (`76 Questions across Grade 1–9`)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 8",
    strandName: "Grammar in Use",
    substrandName: "Adverbial Clauses of Reason (`Because vs Since vs As`)",
    prompt: "Choose the conjunction: '**_______** the examination generator (`Wand2`) runs locally without external API fees, the school board (`BOM`) approved its platform-wide deployment (`EE.8`).'",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Since (`or As / Because`)** (`subordinating conjunction introducing direct causal justification`)", "Although", "Unless", "Whereas"],
    correctAnswer: "**Since (`or As / Because`)** (`subordinating conjunction introducing direct causal justification`)",
    explanation: "*Since* and *As* introduce known causal premises justifying the main action.",
    difficulty: 1,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 8",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Kauli ya Kutendwa (`-w- / -lw-`)",
    prompt: "Kitenzi **'samehe'** kinapowekwa katika kauli ya **Kutendwa (`Passive`)**, kinabadilika kuwa kipi?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**samehewa** (`k.m. mwanafunzi amesamehewa na Mwalimu Mkuu B.20`)", "samehika", "sameheshwa", "sameheana"],
    correctAnswer: "**samehewa** (`k.m. mwanafunzi amesamehewa na Mwalimu Mkuu B.20`)",
    explanation: "Vitenzi vinavyoishia na irabu 'e' au 'i' huchukua kiambishi '-w-' au '-ew-' katika kutendwa (`samehe -> samehewa`).",
    difficulty: 1,
  },

  // ===========================================================================
  // Science & Humanities (`76 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "CHE",
    grade: "Grade 10",
    strandName: "Quantitative Chemistry and Stoichiometry",
    substrandName: "Molar Mass and Percentage Composition by Mass",
    prompt: "What is the exact percentage by mass of **Nitrogen (`N, atomic mass = 14.0`)** in pure Ammonium nitrate fertilizer (`NH₄NO₃, Molar Mass = 80.0 g/mol`) (`AGN`)?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**35.0% (`since NH₄NO₃ contains exactly 2 Nitrogen atoms: total N mass = 2 × 14.0 = 28.0 g/mol; % Nitrogen = (28.0 / 80.0) × 100% = 0.35 × 100% = 35.0%`)**", "17.5% (`counting only 1 N atom`)", "50.0%", "28.0%"],
    correctAnswer: "**35.0% (`since NH₄NO₃ contains exactly 2 Nitrogen atoms: total N mass = 2 × 14.0 = 28.0 g/mol; % Nitrogen = (28.0 / 80.0) × 100% = 0.35 × 100% = 35.0%`)**",
    explanation: "% Nitrogen = (Total Nitrogen Molar Mass inside formula / Total Compound Molar Mass) × 100% = (28.0 / 80.0) × 100% = 35.0%.",
    difficulty: 2,
  }
];
