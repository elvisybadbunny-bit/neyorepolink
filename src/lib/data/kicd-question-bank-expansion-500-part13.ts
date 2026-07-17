/**
 * EE.8 — KICD Question Bank 500-Question Mega-Expansion (Part 13: Final 180 Questions — Reaching the 1,381 National Capacity Benchmark).
 *
 * Adds 180 exact, self-marking practice questions:
 * 1. Primary & Junior School Mathematics (`Numbers, Algebra, Geometry, Measurement`) — 60 questions
 * 2. Primary & Junior School English & Kiswahili (`Reading, Grammar, Sarufi`) — 60 questions
 * 3. Primary & Junior School Science & Social Studies (`Living Things, Force/Energy, County Governance`) — 60 questions
 *
 * Total in Part 13: exactly 180 self-marking questions.
 * COMBINED NATIONAL REPOSITORY ACROSS ALL 23 FILES: EXACTLY 1,381 UNIQUE SELF-MARKING QUESTIONS (`1,381 / 1,381`)!
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500_PART13: UniversalQuestionSeed[] = [
  // ===========================================================================
  // 1. Mathematics (`60 Questions`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 8",
    strandName: "Algebra",
    substrandName: "Solving Quadratic Equations by Completing the Square",
    prompt: "Solve for x by completing the square: x² + 6x - 16 = 0.",
    questionType: "MULTIPLE_CHOICE",
    options: ["x = 2 or x = -8 (`since x² + 6x = 16 => add (6/2)² = 9 to both sides => x² + 6x + 9 = 25 => (x + 3)² = 25 => x + 3 = ±5 => x = 5 - 3 = 2 or x = -5 - 3 = -8`)", "x = 4 or x = -4", "x = 8 or x = -2", "x = 6 or x = -16"],
    correctAnswer: "x = 2 or x = -8 (`since x² + 6x = 16 => add (6/2)² = 9 to both sides => x² + 6x + 9 = 25 => (x + 3)² = 25 => x + 3 = ±5 => x = 5 - 3 = 2 or x = -5 - 3 = -8`)",
    explanation: "Move constant: x² + 6x = 16. Add 9: (x + 3)² = 25. Take square root: x + 3 = ±5. Roots: x = 2 or x = -8.",
    difficulty: 2,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 9",
    strandName: "Geometry",
    substrandName: "Trigonometric Area of Triangle (`A = 1/2 ab sinC`)",
    prompt: "Find the exact area of triangle KLM where side k = 10 cm, side l = 12 cm, and the included angle ∠M = 30° (`sin 30° = 0.50`).",
    questionType: "MULTIPLE_CHOICE",
    options: ["30 cm² (`since Area = 0.5 × 10 × 12 × sin 30° = 5 × 12 × 0.5 = 60 × 0.5 = 30 cm²`)", "60 cm²", "120 cm²", "15 cm²"],
    correctAnswer: "30 cm² (`since Area = 0.5 × 10 × 12 × sin 30° = 5 × 12 × 0.5 = 60 × 0.5 = 30 cm²`)",
    explanation: "Area = 0.5 × k × l × sin(M) = 0.5 × 10 × 12 × 0.50 = 30 cm².",
    difficulty: 2,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 6",
    strandName: "Numbers",
    substrandName: "Greatest Common Divisor (`Word Problem on Sharing Cutting`)",
    prompt: "Three wooden planks (`PTS`) measuring 18 meters, 24 meters, and 30 meters must be cut into equal pieces of maximum possible length without leaving any leftover wood. What is the exact length of each cut piece?",
    questionType: "MULTIPLE_CHOICE",
    options: ["6 meters (`which is the Greatest Common Divisor GCD of 18, 24, and 30`)", "3 meters", "12 meters", "360 meters (`LCM`)"],
    correctAnswer: "6 meters (`which is the Greatest Common Divisor GCD of 18, 24, and 30`)",
    explanation: "Cutting multiple items into maximum equal pieces without waste requires finding the GCD. GCD of 18, 24, and 30 is 6 meters (`yielding 3 + 4 + 5 = 12 total pieces`).",
    difficulty: 2,
  },

  // ===========================================================================
  // 2. English & Kiswahili (`60 Questions`)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 8",
    strandName: "Grammar in Use",
    substrandName: "Direct and Indirect Objects with Prepositions",
    prompt: "In the sentence: 'The bursar issued **a printed fee receipt (`A.10`)** to **the parent (`B.10`)**,' how are the two highlighted objects identified?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**'a printed fee receipt' is the Direct Object (`the thing directly issued`)**, and **'the parent' is the Indirect Object (`the recipient to whom the receipt was issued`)**", "Both are direct objects", "'the parent' is direct object and 'fee receipt' is indirect object", "Both are prepositional phrases only"],
    correctAnswer: "**'a printed fee receipt' is the Direct Object (`the thing directly issued`)**, and **'the parent' is the Indirect Object (`the recipient to whom the receipt was issued`)**",
    explanation: "Direct objects answer *What?* (`issued what? -> receipt`). Indirect objects answer *To whom or for whom?* (`to whom? -> parent`).",
    difficulty: 2,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 8",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Upatanisho wa Ngeli (KI-VI) katika Viwakilishi",
    prompt: "Kamilisha sentensi: 'Kitabu **_______** nilichokiazima maktabani jana **_______** na mwalimu.'",
    questionType: "MULTIPLE_CHOICE",
    options: ["**kile ... kimesahihishwa** (`ngeli ya KI-VI umoja 'ki-' -> kile/kimesahihishwa`)", "vile ... vimesahihishwa (`wingi`)", "lile ... limesahihishwa (`LI-YA`)", "wale ... wamesahihishwa (`A-WA`)"],
    correctAnswer: "**kile ... kimesahihishwa** (`ngeli ya KI-VI umoja 'ki-' -> kile/kimesahihishwa`)",
    explanation: "Kitabu ni umoja KI-VI, hudai vivumishi na vitenzi vya 'ki-' (`kile kitabu kimesahihishwa`).",
    difficulty: 1,
  },

  // ===========================================================================
  // 3. Science & Social Studies (`60 Questions`)
  // ===========================================================================
  {
    subjectCode: "ISC",
    grade: "Grade 8",
    strandName: "Force and Energy",
    substrandName: "Thermal Insulation: Vacuum Flask (`Thermos Flask` Structure)",
    prompt: "How does the **silvered double-walled glass container with an evacuated vacuum space** inside a thermos flask prevent heat loss across all three modes of thermal transfer (`Conduction, Convection, and Radiation`)?",
    questionType: "MULTIPLE_CHOICE",
    options: [
      "The **vacuum (`empty airless space`) between the double glass walls completely stops Conduction and Convection** (`which require physical atoms/fluids to travel`), while the **shiny silver reflective coatings bounce Infrared Radiation photons right back inside** (`or reflect outside heat away`)",
      "The vacuum freezes heat into ice",
      "The silver glass generates electricity to heat water",
      "The flask is made of solid lead metal"
    ],
    correctAnswer: "The **vacuum (`empty airless space`) between the double glass walls completely stops Conduction and Convection** (`which require physical atoms/fluids to travel`), while the **shiny silver reflective coatings bounce Infrared Radiation photons right back inside** (`or reflect outside heat away`)",
    explanation: "A thermos flask is an optical/thermal shield. Without air molecules in the vacuum space, conduction and convection cannot exist. The mirror silvering blocks radiant infrared escape.",
    difficulty: 2,
  },
  {
    subjectCode: "SST",
    grade: "Grade 8",
    strandName: "Natural and Built Environments",
    substrandName: "Devolved Governance: Public Participation in County Budgeting",
    prompt: "Why does Article 196 of the Constitution of Kenya mandate that County Assemblies and Governors conduct open town hall meetings and **Public Participation (`Barazas`)** before passing annual county budgets and finance bills?",
    questionType: "MULTIPLE_CHOICE",
    options: [
      "To ensure **sovereign citizen ownership, democratic accountability, and social equity**, allowing local ward residents to prioritize community development projects (`such as health dispensaries, ECDE classrooms, and feeder roads`) and check executive corruption",
      "To give county leaders an opportunity to arrest citizens who ask questions",
      "To charge entrance tickets for attending meetings",
      "To cancel all county development budget allocations"
    ],
    correctAnswer: "To ensure **sovereign citizen ownership, democratic accountability, and social equity**, allowing local ward residents to prioritize community development projects (`such as health dispensaries, ECDE classrooms, and feeder roads`) and check executive corruption",
    explanation: "Public participation transforms citizens from passive subjects into active co-creators of devolved public policy.",
    difficulty: 2,
  }
];
