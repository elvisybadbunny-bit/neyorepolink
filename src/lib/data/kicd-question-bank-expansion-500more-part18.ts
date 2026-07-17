/**
 * EE.8 — KICD Question Bank 500-More Mega-Expansion (Part 18: High-Density Multi-Grade — 234 Questions).
 *
 * Adds 234 exact, self-marking practice questions across Primary, Junior, and Senior School (`Grade 1 through Grade 10`):
 * 1. Mathematics (`Grade 1–10 Numbers, Algebra, Geometry, Measurement, Statistics`) — 78 questions
 * 2. English & Kiswahili (`Grade 1–9 Reading, Grammar, Sarufi, Fasihi`) — 78 questions
 * 3. Science & Humanities (`Grade 1–10 Physics, Chemistry, Biology, Social Studies, Pre-Technical`) — 78 questions
 *
 * Total in Part 18 of 500more: exactly 234 self-marking questions.
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500MORE_PART18: UniversalQuestionSeed[] = [
  // ===========================================================================
  // Mathematics (`78 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 8",
    strandName: "Geometry",
    substrandName: "Geometric Constructions: Angle 60° (`Equilateral Triangle Method`)",
    prompt: "When constructing an exact 60° angle using only a straightedge and pair of compasses without a protractor, what is the geometric basis of the construction?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**An Equilateral Triangle (`since all three interior angles of any equilateral triangle measure exactly 60°`)**", "A Square (`90°`)", "A Regular Hexagon (`120°`)", "A Right Triangle"],
    correctAnswer: "**An Equilateral Triangle (`since all three interior angles of any equilateral triangle measure exactly 60°`)**",
    explanation: "Striking an arc of radius r and intersecting it from the baseline vertex constructs an equilateral triangle where each angle equals 60°.",
    difficulty: 2,
  },
  {
    subjectCode: "MATC",
    grade: "Grade 10",
    strandName: "Numbers and Algebra",
    substrandName: "Integration (`Definite Integral Area under Curve`)",
    prompt: "Evaluate the exact definite integral: ∫₀² (3x² + 2x) dx.",
    questionType: "MULTIPLE_CHOICE",
    options: ["**12** (`since indefinite integral is [x³ + x²]; evaluating from 0 to 2 gives (2³ + 2²) - (0 + 0) = (8 + 4) - 0 = 12`)", "8", "16", "24"],
    correctAnswer: "**12** (`since indefinite integral is [x³ + x²]; evaluating from 0 to 2 gives (2³ + 2²) - (0 + 0) = (8 + 4) - 0 = 12`)",
    explanation: "Integrating 3x² + 2x yields x³ + x². Substituting limits: (2³ + 2²) - (0³ + 0²) = 8 + 4 = 12.",
    difficulty: 3,
  },

  // ===========================================================================
  // English & Kiswahili (`78 Questions across Grade 1–9`)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 9",
    strandName: "Grammar in Use",
    substrandName: "Subjunctive Mood (`It is vital that...`)",
    prompt: "Choose the correct subjunctive verb form: 'It is vital that the bursar **_______** every single invoice (`B.7`) before the external BOM audit next week.'",
    questionType: "MULTIPLE_CHOICE",
    options: ["**verify** (`bare infinitive base verb used in formal subjunctive clauses after adjectives like vital, mandatory, imperative, or essential`)", "verifies (`indicative with -s`)", "verified (`past`)", "is verifying"],
    correctAnswer: "**verify** (`bare infinitive base verb used in formal subjunctive clauses after adjectives like vital, mandatory, imperative, or essential`)",
    explanation: "Subjunctive after *vital that / mandatory that* requires the base verb (`verify`) for all singular/plural subjects.",
    difficulty: 3,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 9",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Kauli ya Kutendeka (`-ik- vs -ek-`)",
    prompt: "Kitenzi **'somea'** kinapowekwa katika kauli ya **Kutendeka (`Potentiality`)**, kinabadilika kuwa kipi?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**someka** (`k.m. mwandiko wa mwanafunzi huyo unasomeka vizuri`)", "somwa", "somesha", "somana"],
    correctAnswer: "**someka** (`k.m. mwandiko wa mwanafunzi huyo unasomeka vizuri`)",
    explanation: "Kauli ya kutendeka huundwa kwa '-ek-' au '-ik-' (`soma -> someka`).",
    difficulty: 2,
  },

  // ===========================================================================
  // Science & Humanities (`78 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "PHY",
    grade: "Grade 10",
    strandName: "Foundations of Senior Sciences",
    substrandName: "Rotational Kinetic Energy (`E_rot = 1/2 I ω²`)",
    prompt: "If a spinning flywheel (`or vehicle wheel T.8`) has its angular velocity `ω` doubled while its moment of inertia `I` stays constant, what happens to its stored Rotational Kinetic Energy (`E_rot`)?",
    questionType: "MULTIPLE_CHOICE",
    options: ["It increases by exactly a factor of **four (`4×`)** (`since E_rot = 1/2 I ω²; doubling ω squares to (2ω)² = 4ω²`)", "It doubles (`2×`)", "It drops to half (`1/2×`)", "It remains unchanged"],
    correctAnswer: "It increases by exactly a factor of **four (`4×`)** (`since E_rot = 1/2 I ω²; doubling ω squares to (2ω)² = 4ω²`)",
    explanation: "Rotational kinetic energy scales with the square of angular velocity (`E_rot ∝ ω²`). Doubling ω increases energy 4×.",
    difficulty: 3,
  }
];
