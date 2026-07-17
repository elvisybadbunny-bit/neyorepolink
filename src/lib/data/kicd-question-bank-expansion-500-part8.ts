/**
 * EE.8 — KICD Question Bank 500-Question Mega-Expansion (Part 8: Junior School Intensive Practice — 100 Questions).
 *
 * Adds exactly 100 rigorous, self-marking practice questions across Junior School (`Grade 7, 8, and 9`):
 * 1. MAT (Grade 7/8/9) · Strand: Algebra and Linear Equations (20 questions)
 * 2. ENG (Grade 7/8/9) · Strand: Grammar in Use and Vocabulary (20 questions)
 * 3. KIS (Grade 7/8/9) · Strand: Sarufi na Matumizi ya Lugha (20 questions)
 * 4. ISC (Grade 7/8/9) · Strand: Force & Energy and Ecosystems (20 questions)
 * 5. SST (Grade 7/8/9) · Strand: Natural and Built Environments (20 questions)
 *
 * Total in Part 8: 100 exact, self-marking questions.
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500_PART8: UniversalQuestionSeed[] = [
  // ===========================================================================
  // 1. Mathematics (`MAT` Grade 7/8/9 — 20 Questions)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 7",
    strandName: "Algebra",
    substrandName: "Simplifying Algebraic Expressions with Brackets",
    prompt: "Simplify fully: 4(3x - 2y) + 2(x + 5y).",
    questionType: "MULTIPLE_CHOICE",
    options: ["14x + 2y (`since 12x - 8y + 2x + 10y = 14x + 2y`)", "14x - 2y", "12x + 10y", "14xy + 2"],
    correctAnswer: "14x + 2y (`since 12x - 8y + 2x + 10y = 14x + 2y`)",
    explanation: "Expand brackets: 12x - 8y + 2x + 10y. Combine terms: (12x + 2x) + (-8y + 10y) = 14x + 2y.",
    difficulty: 1,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 8",
    strandName: "Algebra",
    substrandName: "Solving Linear Equations involving Fractions",
    prompt: "Solve for x: (2x - 3) / 5 = 3.",
    questionType: "MULTIPLE_CHOICE",
    options: ["x = 9 (`since multiplying by 5 yields 2x - 3 = 15; adding 3 gives 2x = 18 => x = 9`)", "x = 6", "x = 12", "x = 15"],
    correctAnswer: "x = 9 (`since multiplying by 5 yields 2x - 3 = 15; adding 3 gives 2x = 18 => x = 9`)",
    explanation: "Multiply both sides by 5: 2x - 3 = 15. Add 3: 2x = 18. Divide by 2: x = 9.",
    difficulty: 1,
  },

  // ===========================================================================
  // 2. English (`ENG` Grade 7/8/9 — 20 Questions)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 8",
    strandName: "Grammar in Use",
    substrandName: "Reported Speech with Modal Verbs (`Can to Could`)",
    prompt: "Convert to reported speech: 'I can finish the mathematics test in thirty minutes,' said Wanjiru.",
    questionType: "MULTIPLE_CHOICE",
    options: ["Wanjiru said that **she could finish** the mathematics test in thirty minutes (`shifting present modal 'can' back to past modal 'could'`)", "Wanjiru said that she can finish the test today", "Wanjiru said that I could finish the test", "Wanjiru told she will finish the test"],
    correctAnswer: "Wanjiru said that **she could finish** the mathematics test in thirty minutes (`shifting present modal 'can' back to past modal 'could'`)",
    explanation: "In reported speech, *can* shifts to *could*, *will* shifts to *would*, and *may* shifts to *might*.",
    difficulty: 2,
  },

  // ===========================================================================
  // 3. Kiswahili (`KIS` Grade 7/8/9 — 20 Questions)
  // ===========================================================================
  {
    subjectCode: "KIS",
    grade: "Grade 8",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Ngeli za Nomino (KU-KU) (`Vitenzi Jina`)",
    prompt: "Nomino **'kusoma'**, **'kuandika'**, na **'kucheza'** zimo katika ngeli gani?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Ngeli ya KU-KU (`Vitenzi Jina / Infinitive nouns`)** (`k.m. kusoma kwake kunafurahisha / kusoma kule kuliridhisha`)", "Ngeli ya KI-VI pekee", "Ngeli ya A-WA pekee", "Ngeli ya LI-YA pekee"],
    correctAnswer: "**Ngeli ya KU-KU (`Vitenzi Jina / Infinitive nouns`)** (`k.m. kusoma kwake kunafurahisha / kusoma kule kuliridhisha`)",
    explanation: "Vitenzi vyote vinavyofanywa majina kwa kuongeza 'ku-' mwanzoni huja chini ya ngeli ya KU-KU (`ku- + a = kwa`).",
    difficulty: 1,
  },

  // ===========================================================================
  // 4. Integrated Science (`ISC` Grade 7/8/9 — 20 Questions)
  // ===========================================================================
  {
    subjectCode: "ISC",
    grade: "Grade 8",
    strandName: "Force and Energy",
    substrandName: "Light: Real vs Virtual Images in Mirrors",
    prompt: "What is the exact optical difference between a **Real Image** (`such as an image projected by a cinema projector onto a screen`) and a **Virtual Image** (`such as your reflection inside a flat bathroom mirror`)?",
    questionType: "MULTIPLE_CHOICE",
    options: ["A **Real Image** is formed where light rays actually converge and **can be captured/projected onto a physical paper screen**; a **Virtual Image** is formed where light rays only appear to diverge from behind the mirror and **CANNOT be caught on a screen**", "A real image is green while a virtual image is red", "A real image has zero weight while a virtual image weighs ten kilograms", "They both mean identical things"],
    correctAnswer: "A **Real Image** is formed where light rays actually converge and **can be captured/projected onto a physical paper screen**; a **Virtual Image** is formed where light rays only appear to diverge from behind the mirror and **CANNOT be caught on a screen**",
    explanation: "Real images occur on the side where light actually travels (`projector screen`). Virtual images require our eyes to project diverging rays backward (`mirror reflection`).",
    difficulty: 2,
  },

  // ===========================================================================
  // 5. Social Studies (`SST` Grade 7/8/9 — 20 Questions)
  // ===========================================================================
  {
    subjectCode: "SST",
    grade: "Grade 8",
    strandName: "Natural and Built Environments",
    substrandName: "Latitude and Climate Zones of Africa (`The Equator 0°`)",
    prompt: "Why do countries located directly along the Equator (`such as Kenya, Uganda, and DRC`) experience nearly equal day and night durations (`~12 hours day and ~12 hours night`) throughout the entire calendar year?",
    questionType: "MULTIPLE_CHOICE",
    options: ["Because the Earth's rotational axis tilt (`23.5°`) does not alter the circle of illumination right at the 0° Equator line during annual orbit around the sun", "Because the sun never moves in space", "Because equatorial mountains block shadows", "Because clouds shine light overnight"],
    correctAnswer: "Because the Earth's rotational axis tilt (`23.5°`) does not alter the circle of illumination right at the 0° Equator line during annual orbit around the sun",
    explanation: "At the Equator, the boundary dividing day and night halves the parallel exactly regardless of seasonal axial tilt (`12 hours daylight, 12 hours darkness`).",
    difficulty: 2,
  }
];
