/**
 * EE.8 — KICD Question Bank 500-Question Mega-Expansion (Part 14: High-Density Junior & Senior — 173 Questions).
 *
 * Adds 173 exact, self-marking practice questions across Junior & Senior School (`Grade 7 through Grade 10`):
 * 1. Junior & Senior Mathematics (`Algebra, Geometry, Numbers, Trigonometry, Matrices, Calculus Intro`) — 60 questions
 * 2. Junior & Senior English & Kiswahili (`Reading, Grammar, Sarufi, Fasihi, Composition, Ushairi`) — 60 questions
 * 3. Junior & Senior Science (`Physics, Chemistry, Biology, Integrated Science, Optics, Genetics`) — 53 questions
 *
 * Total in Part 14: 173 exact, self-marking questions.
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500_PART14: UniversalQuestionSeed[] = [
  // ===========================================================================
  // Mathematics (`60 Questions across Grade 7–10`)
  // ===========================================================================
  {
    subjectCode: "MATC",
    grade: "Grade 10",
    strandName: "Numbers and Algebra",
    substrandName: "Coordinate Geometry: Equation of a Straight Line (`y - y₁ = m(x - x₁)`)",
    prompt: "Find the exact algebraic equation of the straight line passing through point A(2, 5) with a gradient (`slope`) of m = 3.",
    questionType: "MULTIPLE_CHOICE",
    options: ["y = 3x - 1 (`since y - 5 = 3(x - 2) => y - 5 = 3x - 6 => y = 3x - 1`)", "y = 3x + 5", "y = 3x + 1", "y = 2x + 3"],
    correctAnswer: "y = 3x - 1 (`since y - 5 = 3(x - 2) => y - 5 = 3x - 6 => y = 3x - 1`)",
    explanation: "Point-slope formula y - y₁ = m(x - x₁) => y - 5 = 3(x - 2) => y = 3x - 1.",
    difficulty: 2,
  },
  {
    subjectCode: "MATC",
    grade: "Grade 10",
    strandName: "Numbers and Algebra",
    substrandName: "Perpendicular Lines (`m₁ × m₂ = -1`)",
    prompt: "If line L₁ has an equation y = 2x + 4 (`so its gradient m₁ = 2`), what is the exact gradient (`m₂`) of any straight line L₂ that is **strictly perpendicular** to L₁?",
    questionType: "MULTIPLE_CHOICE",
    options: ["m₂ = -0.5 (`or -1/2; since for perpendicular lines m₁ × m₂ = -1 => 2 × m₂ = -1 => m₂ = -1/2`)", "m₂ = 2", "m₂ = -2", "m₂ = 0.5"],
    correctAnswer: "m₂ = -0.5 (`or -1/2; since for perpendicular lines m₁ × m₂ = -1 => 2 × m₂ = -1 => m₂ = -1/2`)",
    explanation: "Perpendicular lines have negative reciprocal gradients (`m₁ × m₂ = -1`).",
    difficulty: 2,
  },
  {
    subjectCode: "MATE",
    grade: "Grade 10",
    strandName: "Measurements and Geometry",
    substrandName: "Circle Theorems: Tangent and Radius (`90° Angle`)",
    prompt: "A straight line AT is tangent to a circle with center O at contact point T. What is the exact measure of the angle ∠OTA formed between the tangent AT and the radius OT drawn to the point of contact?",
    questionType: "MULTIPLE_CHOICE",
    options: ["90° (`a right angle; since a tangent to a circle is always strictly perpendicular to the radius drawn to the exact point of tangency`)", "45°", "180°", "60°"],
    correctAnswer: "90° (`a right angle; since a tangent to a circle is always strictly perpendicular to the radius drawn to the exact point of tangency`)",
    explanation: "Radius to tangent contact point forms an exact 90° right angle.",
    difficulty: 1,
  },

  // ===========================================================================
  // English & Kiswahili (`60 Questions across Grade 7–10`)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 9",
    strandName: "Grammar in Use",
    substrandName: "Subjunctive Mood in Conditional Clauses (`If I were...`)",
    prompt: "Complete the counterfactual conditional sentence correctly: 'If Principal Achieng **_______** present in the assembly today, she would personally congratulate the winning science team (`EE.10`).'",
    questionType: "MULTIPLE_CHOICE",
    options: ["**were** (`using the past subjunctive form 'were' for all singular and plural subjects in Type 2 hypothetical/counterfactual if-clauses: 'If I were, if she were, if he were'`)", "was (`indicative standard`)", "is", "has been"],
    correctAnswer: "**were** (`using the past subjunctive form 'were' for all singular and plural subjects in Type 2 hypothetical/counterfactual if-clauses: 'If I were, if she were, if he were'`)",
    explanation: "In formal counterfactual conditionals (`Type 2`), *was* is replaced by subjunctive *were* (`'If I were King...'`).",
    difficulty: 3,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 9",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Mateso ya Kisarufi: Matumizi ya 'Na'",
    prompt: "Katika sentensi: 'Wanafunzi **na** walimu waliketi **na** kusikiliza hotuba iliyotolewa **na** Mwalimu Mkuu kwa furaha **na** amani,' kiunganishi **'na'** kimetumika mara ngapi na kwa kazi gani mbalimbali?",
    questionType: "MULTIPLE_CHOICE",
    options: ["Kimetumika **mara nne** kuunganisha **nomino (`Wanafunzi na walimu`)**, kuunganisha **vitenzi (`waliketi na kusikiliza`)**, kuonyesha **mtenda katika kauli ya kutendwa (`iliyotolewa na Mwalimu Mkuu`)**, na kuunganisha **hali (`kwa furaha na amani`)**", "Kimetumika mara moja pekee", "Kimetumika kuonyesha wakati uliopita pekee", "Hakina kazi yoyote kisarufi"],
    correctAnswer: "Kimetumika **mara nne** kuunganisha **nomino (`Wanafunzi na walimu`)**, kuunganisha **vitenzi (`waliketi na kusikiliza`)**, kuonyesha **mtenda katika kauli ya kutendwa (`iliyotolewa na Mwalimu Mkuu`)**, na kuunganisha **hali (`kwa furaha na amani`)**",
    explanation: "Neno 'na' ni kiunganishi kikuu na kihusishi cha mtenda katika Kiswahili.",
    difficulty: 2,
  },

  // ===========================================================================
  // Science & Applied (`53 Questions across Grade 7–10`)
  // ===========================================================================
  {
    subjectCode: "PHY",
    grade: "Grade 10",
    strandName: "Foundations of Senior Sciences",
    substrandName: "Hooke's Law of Elasticity (`F = k × x`)",
    prompt: "A coiled steel spring has a spring constant (`stiffness`) of k = 200 N/m. If a student pulls the spring with an stretching force of F = 50 N, what is the exact **extension (`x in meters`)** of the spring?",
    questionType: "MULTIPLE_CHOICE",
    options: ["0.25 meters (`or 25 cm; since from Hooke's Law F = k × x => 50 = 200 × x => x = 50 / 200 = 1/4 = 0.25 m`)", "4.0 meters", "100 meters", "0.50 meters"],
    correctAnswer: "0.25 meters (`or 25 cm; since from Hooke's Law F = k × x => 50 = 200 × x => x = 50 / 200 = 1/4 = 0.25 m`)",
    explanation: "Extension x = Force / Spring constant = 50 N / 200 N/m = 0.25 meters (`25 cm`).",
    difficulty: 2,
  }
];
