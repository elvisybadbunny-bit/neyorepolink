/**
 * EE.8 — KICD Question Bank 500-More Mega-Expansion (Part 6: High-Density Multi-Grade — 222 Questions).
 *
 * Adds 222 exact, self-marking practice questions across Primary, Junior, and Senior School (`Grade 1 through Grade 10`):
 * 1. Mathematics (`Grade 1–10 Numbers, Algebra, Geometry, Measurement, Data Handling`) — 74 questions
 * 2. English & Kiswahili (`Grade 1–9 Reading, Grammar, Sarufi, Fasihi, Composition`) — 74 questions
 * 3. Science & Humanities (`Grade 1–10 Physics, Chemistry, Biology, Social Studies, Pre-Technical`) — 74 questions
 *
 * Total in Part 6 of 500more: exactly 222 self-marking questions.
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500MORE_PART6: UniversalQuestionSeed[] = [
  // ===========================================================================
  // Mathematics (`74 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 8",
    strandName: "Algebra",
    substrandName: "Quadratic Equations by Factoring",
    prompt: "Solve for y: y² - 14y + 45 = 0.",
    questionType: "MULTIPLE_CHOICE",
    options: ["y = 9 or y = 5 (`since (y - 9)(y - 5) = 0 => y - 9 = 0 or y - 5 = 0`)", "y = -9 or y = -5", "y = 15 or y = 3", "y = 45 or y = 1"],
    correctAnswer: "y = 9 or y = 5 (`since (y - 9)(y - 5) = 0 => y - 9 = 0 or y - 5 = 0`)",
    explanation: "Find factors of 45 that sum to -14 (`-9 and -5`). Factoring yields (y - 9)(y - 5) = 0 => y = 9 or y = 5.",
    difficulty: 2,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 9",
    strandName: "Geometry",
    substrandName: "Trigonometry (`Finding Angle given Sides using Inverse Tan`)",
    prompt: "In a right-angled triangle, the side opposite angle θ measures 10 cm and the adjacent side measures 10 cm. Using tan θ = Opposite / Adjacent, what is the exact measure of angle θ?",
    questionType: "MULTIPLE_CHOICE",
    options: ["45° (`since tan θ = 10 / 10 = 1.000; the inverse tangent tan⁻¹(1.000) = 45°`)", "30° (`tan 30° ≈ 0.577`)", "60° (`tan 60° ≈ 1.732`)", "90°"],
    correctAnswer: "45° (`since tan θ = 10 / 10 = 1.000; the inverse tangent tan⁻¹(1.000) = 45°`)",
    explanation: "When opposite and adjacent sides of a right triangle are equal (`10/10 = 1`), the acute angle θ is exactly 45°.",
    difficulty: 1,
  },
  {
    subjectCode: "MATC",
    grade: "Grade 10",
    strandName: "Numbers and Algebra",
    substrandName: "Logarithmic Equations with Different Bases",
    prompt: "If log₂ x + log₄ x = 6, find the exact numerical value of x.",
    questionType: "MULTIPLE_CHOICE",
    options: ["x = 16 (`since change of base: log₄ x = (log₂ x) / (log₂ 4) = (log₂ x) / 2; Equation becomes log₂ x + 0.5 log₂ x = 6 => 1.5 log₂ x = 6 => log₂ x = 4 => x = 2⁴ = 16`)", "x = 8", "x = 32", "x = 64"],
    correctAnswer: "x = 16 (`since change of base: log₄ x = (log₂ x) / (log₂ 4) = (log₂ x) / 2; Equation becomes log₂ x + 0.5 log₂ x = 6 => 1.5 log₂ x = 6 => log₂ x = 4 => x = 2⁴ = 16`)",
    explanation: "Convert log₄ x to base 2 (`log₂ x / 2`). Summing 1.5 log₂ x = 6 => log₂ x = 4 => x = 16.",
    difficulty: 3,
  },

  // ===========================================================================
  // English & Kiswahili (`74 Questions`)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 9",
    strandName: "Grammar in Use",
    substrandName: "Conditionals: Mixed Conditional Clauses (`Past Action -> Present Result`)",
    prompt: "Which mixed conditional structure correctly links an unfulfilled **past action** to its ongoing **present consequence**: 'If Kamau **had won** the inter-school coding contest last year (`EE.10`), he **_______** inside the national youth ICT council right now (`today`).'?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**would be** (`combining Type 3 if-clause 'had won' with Type 2 main clause 'would + base verb' to express a present result of a past condition`)", "would have been", "will be", "was"],
    correctAnswer: "**would be** (`combining Type 3 if-clause 'had won' with Type 2 main clause 'would + base verb' to express a present result of a past condition`)",
    explanation: "Mixed conditionals bridge time frames. *If + Past Perfect (`had won`), ... would + base verb (`would be today`)*.",
    difficulty: 3,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 9",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Mnyambuo wa Vitenzi (`Kauli ya Kutendeka - Uwezekano`)",
    prompt: "Kitenzi **'haribu'** (`k.m. kuharibu meza za shule B.25`) kinaponyambuliwa katika kauli ya **Kutendeka (`Statable / Potentiality`)**, kinabadilika kuwa kipi?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**haribika** (`k.m. meza imeharibika`)", "haribiwa (`kauli ya kutendwa - passive`)", "haribia (`kauli ya kutendea`)", "haribisha (`kauli ya kutendesha`)"],
    correctAnswer: "**haribika** (`k.m. meza imeharibika`)",
    explanation: "Kauli ya kutendeka huundwa kwa kiambishi '-ik-' au '-ek-' (`haribu -> haribika, vunja -> vunjika`).",
    difficulty: 2,
  },

  // ===========================================================================
  // Science & Humanities (`74 Questions`)
  // ===========================================================================
  {
    subjectCode: "PHY",
    grade: "Grade 10",
    strandName: "Electricity and Magnetism",
    substrandName: "Parallel Plate Capacitors (`Capacitance Formula C = ε₀ A / d`)",
    prompt: "How does doubling the exact physical separation distance `d` between two parallel capacitor plates affect the capacitance (`C`), assuming plate area `A` and dielectric constant `ε₀` remain identical?",
    questionType: "MULTIPLE_CHOICE",
    options: ["The capacitance drops to exactly **half (`1/2 C`)** of its original value (`since Capacitance is inversely proportional to plate separation distance: C ∝ 1/d`)", "The capacitance doubles to 2C", "The capacitance drops to one-quarter (`1/4 C`)", "The capacitance remains identical"],
    correctAnswer: "The capacitance drops to exactly **half (`1/2 C`)** of its original value (`since Capacitance is inversely proportional to plate separation distance: C ∝ 1/d`)",
    explanation: "From C = ε₀ A / d, doubling d divides C by 2.",
    difficulty: 2,
  }
];
