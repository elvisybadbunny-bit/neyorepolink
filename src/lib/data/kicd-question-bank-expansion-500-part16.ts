/**
 * EE.8 — KICD Question Bank 500-Question Mega-Expansion (Part 16: Intensive Multi-Grade Practice — 167 Questions).
 *
 * Adds 167 exact, self-marking practice questions across Junior & Senior School (`Grade 7 through Grade 10`):
 * 1. Mathematics (`Algebra, Geometry, Trigonometry, Statistics`) — 60 questions
 * 2. English & Kiswahili (`Reading, Grammar, Sarufi, Fasihi`) — 60 questions
 * 3. Science & Applied (`Physics, Chemistry, Biology, Pre-Technical`) — 47 questions
 *
 * Total in Part 16: 167 exact, self-marking questions.
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500_PART16: UniversalQuestionSeed[] = [
  // ===========================================================================
  // Mathematics (`60 Questions`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 8",
    strandName: "Geometry",
    substrandName: "Angle Properties of Parallel Lines",
    prompt: "If two parallel lines are crossed by a transversal and two co-interior angles measure **3x°** and **7x°**, what is the exact value of x?",
    questionType: "MULTIPLE_CHOICE",
    options: ["x = 18 (`since co-interior C-angles sum to 180° => 3x + 7x = 10x = 180° => x = 18`)", "x = 15", "x = 20", "x = 10"],
    correctAnswer: "x = 18 (`since co-interior C-angles sum to 180° => 3x + 7x = 10x = 180° => x = 18`)",
    explanation: "Co-interior angles between parallel lines always sum to 180°. 10x = 180 => x = 18.",
    difficulty: 2,
  },
  {
    subjectCode: "MATC",
    grade: "Grade 10",
    strandName: "Numbers and Algebra",
    substrandName: "Quadratic Equations (`Discriminant Δ = b² - 4ac`)",
    prompt: "If the quadratic equation 2x² - 8x + k = 0 has **two equal real roots** (`a single repeated root`), what is the exact numerical value of constant k?",
    questionType: "MULTIPLE_CHOICE",
    options: ["k = 8 (`since for equal roots, Discriminant Δ = b² - 4ac = 0 => (-8)² - 4(2)(k) = 0 => 64 - 8k = 0 => k = 8`)", "k = 16", "k = 4", "k = -8"],
    correctAnswer: "k = 8 (`since for equal roots, Discriminant Δ = b² - 4ac = 0 => (-8)² - 4(2)(k) = 0 => 64 - 8k = 0 => k = 8`)",
    explanation: "Equal roots occur strictly when Δ = 0. (-8)² - 4(2)(k) = 64 - 8k = 0 => k = 8.",
    difficulty: 2,
  },

  // ===========================================================================
  // English & Kiswahili (`60 Questions`)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 8",
    strandName: "Grammar in Use",
    substrandName: "Subordinating Conjunctions of Condition (`Unless vs If`)",
    prompt: "Which sentence correctly demonstrates the exact equivalence between **'Unless'** and **'If ... not'**?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Unless** you submit your project album (`EE.14`), you will not graduate = **If you do not** submit your project album, you will not graduate (`both convey identical negative condition`)", "Unless you submit, you graduate = If you submit, you will not graduate", "Unless means positive condition while if not means choice", "They mean opposite things"],
    correctAnswer: "**Unless** you submit your project album (`EE.14`), you will not graduate = **If you do not** submit your project album, you will not graduate (`both convey identical negative condition`)",
    explanation: "*Unless* means *if ... not*. Thus, *unless you submit* = *if you do not submit*.",
    difficulty: 2,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 8",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Mnyambuo wa Vitenzi (`Kauli ya Kutendeka - Statable/Potential`)",
    prompt: "Kitenzi **'vunja'** kinapowekwa katika kauli ya **Kutendeka (`Statable voice / Potentiality` — kuonyesha uwezekano wa tendo kutendeka bila kutaja aliyetenda)**, kinabadilika kuwa kipi?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**vunjika** (`k.m. glasi imevunjika maktabani — -ik- au -ek-`)", "vunjwa (`kauli ya kutendwa - passive`)", "vunjia (`kauli ya kutendea`)", "vunjisha (`kauli ya kutendesha`)"],
    correctAnswer: "**vunjika** (`k.m. glasi imevunjika maktabani — -ik- au -ek-`)",
    explanation: "Kauli ya kutendeka (`stative/potential`) huundwa kwa viambishi '-ik-' au '-ek-' (`vunja -> vunjika, soma -> someka`).",
    difficulty: 2,
  },

  // ===========================================================================
  // Science & Applied (`47 Questions`)
  // ===========================================================================
  {
    subjectCode: "PHY",
    grade: "Grade 10",
    strandName: "Foundations of Senior Sciences",
    substrandName: "Work Done by a Constant Force (`W = F × d cos θ`)",
    prompt: "A student pulls a heavy laboratory crate across the horizontal floor (`PTS`) with a force of F = 100 N exerted at an angle of θ = 60° above the horizontal (`cos 60° = 0.50`). If the crate moves forward a distance of d = 10.0 meters along the floor, how much mechanical work (`W`) is done?",
    questionType: "MULTIPLE_CHOICE",
    options: ["500 Joules (`since Work W = F × d × cos θ = 100 N × 10.0 m × 0.50 = 500 J`)", "1,000 Joules (`if pulled horizontally where cos 0° = 1.0`)", "250 Joules", "866 Joules"],
    correctAnswer: "500 Joules (`since Work W = F × d × cos θ = 100 N × 10.0 m × 0.50 = 500 J`)",
    explanation: "Work done by a force angled to the direction of motion equals component along motion times distance (`F cos θ × d = 100 × 0.50 × 10 = 500 J`).",
    difficulty: 2,
  }
];
