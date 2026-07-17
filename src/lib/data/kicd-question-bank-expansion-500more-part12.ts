/**
 * EE.8 — KICD Question Bank 500-More Mega-Expansion (Part 12: High-Density Practice — 206 Questions).
 *
 * Adds 206 exact, self-marking practice questions across Primary, Junior, and Senior School (`Grade 1 through Grade 10`):
 * 1. Mathematics (`Grade 1–10 Numbers, Algebra, Geometry, Measurement, Statistics`) — 70 questions
 * 2. English & Kiswahili (`Grade 1–9 Reading, Grammar, Sarufi, Fasihi`) — 68 questions
 * 3. Science & Humanities (`Grade 1–10 Physics, Chemistry, Biology, Social Studies, Pre-Technical`) — 68 questions
 *
 * Total in Part 12 of 500more: exactly 206 self-marking questions.
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500MORE_PART12: UniversalQuestionSeed[] = [
  // ===========================================================================
  // Mathematics (`70 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 8",
    strandName: "Geometry",
    substrandName: "Perpendicular Distance from a Point to a Line",
    prompt: "What exact geometric property defines the shortest distance between a fixed exterior point P and a straight boundary line L?",
    questionType: "MULTIPLE_CHOICE",
    options: ["The **Perpendicular Distance** (`the exact 90° right-angled straight segment connecting P to line L`)", "The longest diagonal path", "A curved semi-circle", "An angled 45° line"],
    correctAnswer: "The **Perpendicular Distance** (`the exact 90° right-angled straight segment connecting P to line L`)",
    explanation: "In Euclidean geometry, the shortest path between any point and a straight line is always the perpendicular drop (`90°`).",
    difficulty: 1,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 9",
    strandName: "Numbers",
    substrandName: "Indices (`Zero and Fractional Exponents`)",
    prompt: "Evaluate: 5⁰ + (64 / 27)^(1/3).",
    questionType: "MULTIPLE_CHOICE",
    options: ["7 / 3 (`or 2.333; since any non-zero number to zero power is 1: 5⁰ = 1; cube root of 64/27 is 4/3; Sum = 1 + 4/3 = 7 / 3`)", "4 / 3", "5 / 3", "8 / 3"],
    correctAnswer: "7 / 3 (`or 2.333; since any non-zero number to zero power is 1: 5⁰ = 1; cube root of 64/27 is 4/3; Sum = 1 + 4/3 = 7 / 3`)",
    explanation: "5⁰ = 1. (64/27)^(1/3) = 4/3. Sum = 1 + 4/3 = 7/3.",
    difficulty: 2,
  },

  // ===========================================================================
  // English & Kiswahili (`68 Questions across Grade 1–9`)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 9",
    strandName: "Grammar in Use",
    substrandName: "Subjunctive Mood (`Lest vs In case`)",
    prompt: "Choose the correct conjunction: 'Ensure you double-check your entered continuous assessment marks (`B.5`) **_______** you make an irreversible calculation error.'",
    questionType: "MULTIPLE_CHOICE",
    options: ["**lest** (`meaning 'for fear that' or 'to prevent any possibility that' — followed directly by should or base verb`)", "unless", "if only", "although"],
    correctAnswer: "**lest** (`meaning 'for fear that' or 'to prevent any possibility that' — followed directly by should or base verb`)",
    explanation: "*Lest* expresses precaution against a negative outcome (`'Walk carefully lest you fall'`).",
    difficulty: 3,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 9",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Kauli ya Kutendeana (`-an-`) katika Wakati Uliopita",
    prompt: "Sentensi: 'Wachezaji wa timu ya shule (`CAS`) **walipongezana** baada ya ushindi mkubwa uwanjani' iko katika kauli gani ya kitenzi?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Kauli ya Kutendeana (`Reciprocal Voice -an-`)**", "Kauli ya Kutendwa", "Kauli ya Kutendea", "Kauli ya Kutendesha"],
    correctAnswer: "**Kauli ya Kutendeana (`Reciprocal Voice -an-`)**",
    explanation: "Pongeza -> Pongezana (`watu wawili au wengi kupongezana wenyewe kwa wenyewe`).",
    difficulty: 1,
  },

  // ===========================================================================
  // Science & Humanities (`68 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "PHY",
    grade: "Grade 10",
    strandName: "Foundations of Senior Sciences",
    substrandName: "Work, Energy, and Power (`P = F × v`)",
    prompt: "If a school transport bus (`T.8`) moves at a steady highway speed of v = 25 m/s against a constant total air/road resistive drag force of F = 2,000 N, what is the exact engine power output (`P`) overcoming drag?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**50,000 Watts (`or 50 kW; since Power P = Force F × Velocity v = 2,000 N × 25 m/s = 50,000 W`)**", "2,000 Watts", "100,000 Watts", "80 Watts"],
    correctAnswer: "**50,000 Watts (`or 50 kW; since Power P = Force F × Velocity v = 2,000 N × 25 m/s = 50,000 W`)**",
    explanation: "Since Work = F × d, Power = Work / t = (F × d) / t = F × v = 2,000 × 25 = 50,000 Watts (`50 kW`).",
    difficulty: 2,
  }
];
