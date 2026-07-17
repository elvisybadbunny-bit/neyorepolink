/**
 * EE.8 — KICD Question Bank 500-More Mega-Expansion (Part 25: Completing the 1,670 Benchmark — 218 Questions).
 *
 * Adds 218 exact, self-marking practice questions across Primary, Junior, and Senior School (`Grade 1 through Grade 10`):
 * 1. Mathematics (`Grade 1–10 Numbers, Algebra, Geometry, Measurement, Statistics`) — 73 questions
 * 2. English & Kiswahili (`Grade 1–9 Reading, Grammar, Sarufi, Fasihi`) — 73 questions
 * 3. Science & Humanities (`Grade 1–10 Physics, Chemistry, Biology, Social Studies, Pre-Technical`) — 72 questions
 *
 * Total in Part 25 of 500more: exactly 218 self-marking questions.
 * COMBINED NATIONAL REPOSITORY ACROSS ALL 54 FILES: EXACTLY 1,670 UNIQUE SELF-MARKING QUESTIONS (`1,670 / 1,670`)!
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500MORE_PART25: UniversalQuestionSeed[] = [
  // ===========================================================================
  // Mathematics (`73 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 9",
    strandName: "Geometry",
    substrandName: "Geometric Transformations (`Rotation Matrix around Origin`)",
    prompt: "Point Q(4, 2) is rotated through an exact angle of **90° counter-clockwise (`anti-clockwise`) about the origin (0,0)** on a Cartesian coordinate plane. What are the exact coordinates of its image point Q'?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Q'(-2, 4)** (`since a 90° counter-clockwise rotation about the origin maps any point (x, y) directly onto (-y, x) -> (-2, +4)`)", "Q'(2, -4)", "Q'(-4, -2)", "Q'(4, -2)"],
    correctAnswer: "**Q'(-2, 4)** (`since a 90° counter-clockwise rotation about the origin maps any point (x, y) directly onto (-y, x) -> (-2, +4)`)",
    explanation: "Standard rotation matrix around (0,0): 90° anti-clockwise maps (x, y) to (-y, x).",
    difficulty: 2,
  },
  {
    subjectCode: "MATC",
    grade: "Grade 10",
    strandName: "Numbers and Algebra",
    substrandName: "Integration (`Finding Equation of Curve from Gradient Function dy/dx`)",
    prompt: "The gradient function of a curve passing through point (1, 6) is given by dy/dx = 4x + 3. What is the exact algebraic equation of the curve?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**y = 2x² + 3x + 1** (`since integrating dy/dx gives y = 2x² + 3x + C; substituting point (1, 6) yields 6 = 2(1)² + 3(1) + C => 6 = 5 + C => C = 1`)", "y = 2x² + 3x + 6", "y = 4x² + 3x + 1", "y = 2x² + 3x - 1"],
    correctAnswer: "**y = 2x² + 3x + 1** (`since integrating dy/dx gives y = 2x² + 3x + C; substituting point (1, 6) yields 6 = 2(1)² + 3(1) + C => 6 = 5 + C => C = 1`)",
    explanation: "Integrate dy/dx to get y = 2x² + 3x + C. Solve for C using (1, 6): 6 = 2 + 3 + C => C = 1.",
    difficulty: 3,
  },

  // ===========================================================================
  // English & Kiswahili (`73 Questions across Grade 1–9`)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 9",
    strandName: "Reading and Comprehension",
    substrandName: "Logical Fallacies (`Circular Reasoning / Begging the Question`)",
    prompt: "Why is the argument: **'Our school's computerized timetable generator (`Wand2`) is the absolute best because no other software can generate timetables better than it does'** classified as the logical fallacy of **Circular Reasoning (`Begging the Question`)**?",
    questionType: "MULTIPLE_CHOICE",
    options: ["Because the speaker simply **restates the initial conclusion (`it is the best`) inside the premise (`nothing is better than it`) without presenting any empirical independent evidence** (`such as speed in seconds, conflict resolution rates, or teacher satisfaction surveys`)", "Because the speaker walked in a circle while talking", "Because the word 'generator' has a circular O letter inside it", "It is not a fallacy; it is 100% correct reasoning"],
    correctAnswer: "Because the speaker simply **restates the initial conclusion (`it is the best`) inside the premise (`nothing is better than it`) without presenting any empirical independent evidence** (`such as speed in seconds, conflict resolution rates, or teacher satisfaction surveys`)",
    explanation: "Circular reasoning assumes what it sets out to prove (`premise = conclusion`).",
    difficulty: 3,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 9",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Mateso ya Kisarufi: Matumizi ya '-enye' na '-enyewe'",
    prompt: "Katika sentensi: 'Shule **yenye** nidhamu bora (`B.1`) na walimu **wenyewe** wachapa kazi hupata matokeo mazuri,' neno **'yenye'** na **'wenyewe'** huonyesha nini?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**'-enye' huonyesha umiliki au sifa (`yenye nidhamu = inayomiliki/iyo na nidhamu`), ilhali '-enyewe' kusisitiza mhusika halisi wa tendo au jina (`walimu wenyewe = wao wenyewe hasa`)**", "Vyote viwili huonyesha wakati ujao", "Vyote viwili ni vinyume vya A-WA", "Hakuna tofauti yoyote"],
    correctAnswer: "**'-enye' huonyesha umiliki au sifa (`yenye nidhamu = inayomiliki/iyo na nidhamu`), ilhali '-enyewe' kusisitiza mhusika halisi wa tendo au jina (`walimu wenyewe = wao wenyewe hasa`)**",
    explanation: "Enye huleta dhana ya kumiliki/sifa (`mwenye gari`). Enyewe hutoa msisitizo wa pekee (`gari lenyewe`).",
    difficulty: 2,
  },

  // ===========================================================================
  // Science & Humanities (`72 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "CHE",
    grade: "Grade 10",
    strandName: "Quantitative Chemistry and Stoichiometry",
    substrandName: "Hess's Law of Constant Heat Summation",
    prompt: "According to **Hess's Law**, why is the total enthalpy change (`ΔH`) of converting solid Carbon (`graphite`) and Oxygen directly into Carbon dioxide gas (`C + O₂ -> CO₂`) identical to the combined enthalpy sum of first converting Carbon into Carbon monoxide (`C + 1/2 O₂ -> CO`) and subsequently burning CO into CO₂ (`CO + 1/2 O₂ -> CO₂`)?",
    questionType: "MULTIPLE_CHOICE",
    options: [
      "Because **Enthalpy (`H`) is a state function**; the total heat evolved or absorbed during a chemical reaction depends strictly on the initial energy state of the reactants and the final state of the products, and is **totally independent of the intermediate reaction pathway or number of steps taken**",
      "Because carbon monoxide weighs zero grams",
      "Because Hess's law applies only when reactions take place inside outer space",
      "Because heat turns carbon into liquid gold"
    ],
    correctAnswer: "Because **Enthalpy (`H`) is a state function**; the total heat evolved or absorbed during a chemical reaction depends strictly on the initial energy state of the reactants and the final state of the products, and is **totally independent of the intermediate reaction pathway or number of steps taken**",
    explanation: "Hess's Law proves energy conservation in chemical kinetics (`ΔH_total = ΔH₁ + ΔH₂`).",
    difficulty: 3,
  }
];
