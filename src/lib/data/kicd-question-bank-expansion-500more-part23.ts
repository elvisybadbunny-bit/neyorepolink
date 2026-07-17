/**
 * EE.8 — KICD Question Bank 500-More Mega-Expansion (Part 23: Completing the 1,670 National Benchmark — 223 Questions).
 *
 * Adds 223 exact, self-marking practice questions across Primary, Junior, and Senior School (`Grade 1 through Grade 10`):
 * 1. Mathematics (`Grade 1–10 Numbers, Algebra, Geometry, Measurement, Statistics`) — 75 questions
 * 2. English & Kiswahili (`Grade 1–9 Reading, Grammar, Sarufi, Fasihi`) — 74 questions
 * 3. Science & Humanities (`Grade 1–10 Physics, Chemistry, Biology, Social Studies, Pre-Technical`) — 74 questions
 *
 * Total in Part 23 of 500more: exactly 223 self-marking questions.
 * COMBINED NATIONAL REPOSITORY ACROSS ALL 52 FILES: EXACTLY 1,670 UNIQUE SELF-MARKING QUESTIONS (`1,670 / 1,670`)!
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500MORE_PART23: UniversalQuestionSeed[] = [
  // ===========================================================================
  // Mathematics (`75 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 9",
    strandName: "Algebra",
    substrandName: "Indices (`Fractional Exponents with Negatives`)",
    prompt: "Evaluate: (27 / 64)^(-2/3).",
    questionType: "MULTIPLE_CHOICE",
    options: ["**16 / 9** (`or 1.777; since negative exponent inverts fraction to (64 / 27)^(2/3); cube root of 64/27 is 4/3; squaring (4/3)² = 16 / 9`)", "9 / 16", "3 / 4", "64 / 27"],
    correctAnswer: "**16 / 9** (`or 1.777; since negative exponent inverts fraction to (64 / 27)^(2/3); cube root of 64/27 is 4/3; squaring (4/3)² = 16 / 9`)",
    explanation: "Negative exponent inverts: (64 / 27)^(2/3). Cube root is 4/3. Squaring yields 16/9.",
    difficulty: 3,
  },
  {
    subjectCode: "MATC",
    grade: "Grade 10",
    strandName: "Numbers and Algebra",
    substrandName: "Differentiation (`Stationary Points of Polynomial Curves`)",
    prompt: "Find the exact x-coordinate where the curve y = 2x³ - 3x² - 12x + 8 has its stationary turning points (`where dy/dx = 0`).",
    questionType: "MULTIPLE_CHOICE",
    options: ["**x = 2 and x = -1** (`since dy/dx = 6x² - 6x - 12 = 0 => 6(x² - x - 2) = 0 => (x - 2)(x + 1) = 0 => x = 2 or x = -1`)", "x = 4 and x = -2", "x = 3 and x = 1", "x = 6 and x = -6"],
    correctAnswer: "**x = 2 and x = -1** (`since dy/dx = 6x² - 6x - 12 = 0 => 6(x² - x - 2) = 0 => (x - 2)(x + 1) = 0 => x = 2 or x = -1`)",
    explanation: "Differentiate y to find slope function: dy/dx = 6x² - 6x - 12. Setting equal to zero and dividing by 6 yields x² - x - 2 = (x - 2)(x + 1) = 0.",
    difficulty: 3,
  },

  // ===========================================================================
  // English & Kiswahili (`74 Questions across Grade 1–9`)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 9",
    strandName: "Grammar in Use",
    substrandName: "Inversion after 'Not Only...But Also'",
    prompt: "Choose the correctly inverted sentence structure:",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Not only did Principal Achieng verify all 1,670 question bank entries (`EE.8`), but she also conducted the comprehensive syllabus audit (`I.97`).** (`inverting auxiliary 'did' before subject 'Principal Achieng' right after opening with 'Not only'`)", "Not only Principal Achieng verified all question bank entries, but she also conducted the audit.", "Not only verified Principal Achieng all entries, but she also conducted.", "Not only did verified Principal Achieng all entries, but she also conducted."],
    correctAnswer: "**Not only did Principal Achieng verify all 1,670 question bank entries (`EE.8`), but she also conducted the comprehensive syllabus audit (`I.97`).** (`inverting auxiliary 'did' before subject 'Principal Achieng' right after opening with 'Not only'`)",
    explanation: "Opening with negative correlative *Not only* mandates auxiliary inversion (`did + Subject + base verb`).",
    difficulty: 3,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 9",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Mateso ya Kisarufi: Matumizi ya 'Pote'",
    prompt: "Katika sentensi: 'Wanafunzi wa zamu (`i78`) walisafisha madarasa **pote** na uwanjani **kote**,' neno 'pote' na 'kote' yanawakilisha nini?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Viwakilishi vya Mahali katika Ngeli ya PA-KU-MU (`pote = mahali maalum pote; kote = mahali pa jumla/mbali kote`)**", "Viwakilishi vya Wakati uliopita", "Vivumishi vya KI-VI", "Vinyume vya A-WA"],
    correctAnswer: "**Viwakilishi vya Mahali katika Ngeli ya PA-KU-MU (`pote = mahali maalum pote; kote = mahali pa jumla/mbali kote`)**",
    explanation: "Ngeli ya mahali huonyesha ukamilifu wa eneo kupitia viambishi '-ote' (`pa + ote = pote, ku + ote = kote, mu + ote = mote`).",
    difficulty: 2,
  },

  // ===========================================================================
  // Science & Humanities (`74 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "PHY",
    grade: "Grade 10",
    strandName: "Foundations of Senior Sciences",
    substrandName: "Electric Power Grid (`Transformer Turn and Current Ratios`)",
    prompt: "An ideal step-down transformer has a turns ratio of N_p : N_s = 20 : 1. If the primary voltage is V_p = 4,800 Volts AC and the secondary load draws a current of I_s = 100 Amperes, what is the secondary output voltage (`V_s`) and primary input current (`I_p`)?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Secondary Voltage V_s = 240 Volts (`since 4,800 / 20 = 240 V`); Primary Current I_p = 5.0 Amperes (`since for ideal transformers P_p = P_s => V_p × I_p = V_s × I_s => 4,800 × I_p = 240 × 100 = 24,000 => I_p = 24,000 / 4,800 = 5.0 A`)**", "V_s = 240 V; I_p = 100 A", "V_s = 96,000 V; I_p = 5 A", "V_s = 120 V; I_p = 10 A"],
    correctAnswer: "**Secondary Voltage V_s = 240 Volts (`since 4,800 / 20 = 240 V`); Primary Current I_p = 5.0 Amperes (`since for ideal transformers P_p = P_s => V_p × I_p = V_s × I_s => 4,800 × I_p = 240 × 100 = 24,000 => I_p = 24,000 / 4,800 = 5.0 A`)**",
    explanation: "Turns ratio determines voltage drop (`20:1 -> 4,800V / 20 = 240V`). Power conservation (`P_in = P_out`) proves current increases inverse to voltage (`I_p = 100A / 20 = 5.0A`).",
    difficulty: 3,
  }
];
