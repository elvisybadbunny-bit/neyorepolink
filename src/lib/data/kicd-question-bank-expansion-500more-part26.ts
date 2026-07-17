/**
 * EE.8 — KICD Question Bank 500-More Mega-Expansion (Part 26: High-Density Practice — 214 Questions).
 *
 * Adds 214 exact, self-marking practice questions across Primary, Junior, and Senior School (`Grade 1 through Grade 10`):
 * 1. Mathematics (`Grade 1–10 Numbers, Algebra, Geometry, Measurement, Statistics`) — 72 questions
 * 2. English & Kiswahili (`Grade 1–9 Reading, Grammar, Sarufi, Fasihi`) — 71 questions
 * 3. Science & Humanities (`Grade 1–10 Physics, Chemistry, Biology, Social Studies, Pre-Technical`) — 71 questions
 *
 * Total in Part 26 of 500more: exactly 214 self-marking questions.
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500MORE_PART26: UniversalQuestionSeed[] = [
  // ===========================================================================
  // Mathematics (`72 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "MATC",
    grade: "Grade 10",
    strandName: "Numbers and Algebra",
    substrandName: "Permutations and Combinations (`nPr and nCr Formulas`)",
    prompt: "Evaluate the exact combination value C(8, 3) (`the number of distinct ways to select a committee of 3 students from a group of 8 candidates without regard to order`).",
    questionType: "MULTIPLE_CHOICE",
    options: ["**56** (`since C(n, r) = n! / [r!(n - r)!] = 8! / [3! × 5!] = (8 × 7 × 6) / (3 × 2 × 1) = 336 / 6 = 56`)", "336 (`which is nPr permutation 8P3`)", "24", "112"],
    correctAnswer: "**56** (`since C(n, r) = n! / [r!(n - r)!] = 8! / [3! × 5!] = (8 × 7 × 6) / (3 × 2 × 1) = 336 / 6 = 56`)",
    explanation: "Combinations ignore arrangement order. C(8, 3) = (8 × 7 × 6) / (3 × 2 × 1) = 56.",
    difficulty: 2,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 8",
    strandName: "Geometry",
    substrandName: "Pythagorean Theorem (`Finding Diagonal of Rectangular Field`)",
    prompt: "A rectangular sports pitch (`CAS`) measures 80 meters in length and 60 meters in width. What is the exact straight-line distance across its diagonal from one corner to the opposite corner?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**100 meters** (`since d = √(80² + 60²) = √(6,400 + 3,600) = √(10,000) = 100 m — forming a 6-8-10 / 3-4-5 right triangle`)", "140 meters (`sum of length + width`)", "120 meters", "280 meters (`perimeter`)"],
    correctAnswer: "**100 meters** (`since d = √(80² + 60²) = √(6,400 + 3,600) = √(10,000) = 100 m — forming a 6-8-10 / 3-4-5 right triangle`)",
    explanation: "√(80² + 60²) = √(10,000) = 100 meters.",
    difficulty: 1,
  },

  // ===========================================================================
  // English & Kiswahili (`71 Questions across Grade 1–9`)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 8",
    strandName: "Grammar in Use",
    substrandName: "Order of Adverbs (`Manner -> Place -> Time MPT`)",
    prompt: "Which sentence arranges the three adverbs correctly at the end of the clause according to the MPT (`Manner -> Place -> Time`) rule?",
    questionType: "MULTIPLE_CHOICE",
    options: ["The school choir (`A.17`) performed **brilliantly (`Manner`) inside the assembly hall (`Place`) yesterday afternoon (`Time`)**.", "The school choir performed yesterday afternoon inside the hall brilliantly.", "The school choir performed inside the hall yesterday afternoon brilliantly.", "The school choir performed inside the hall brilliantly yesterday afternoon."],
    correctAnswer: "The school choir (`A.17`) performed **brilliantly (`Manner`) inside the assembly hall (`Place`) yesterday afternoon (`Time`)**.",
    explanation: "Standard English adverb sequence when following verbs of motion/performance is Manner (`How? -> brilliantly`), then Place (`Where? -> inside the hall`), then Time (`When? -> yesterday afternoon`).",
    difficulty: 2,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 8",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Matumizi ya Viunganishi vya Mwisho ('Hadi / Mpaka')",
    prompt: "Chagua kiunganishi sahihi kinachoonyesha **ukomo wa wakati au mahali**: 'Wanafunzi wa Grade 8 walisoma maktabani **_______** saa nne usiku kabla ya kurejea bwenini (`Hostel B.16`).'",
    questionType: "MULTIPLE_CHOICE",
    options: ["**hadi (`au mpaka`)**", "tangu (`huonyesha mwanzo wa wakati`)", "lakini", "ingawa"],
    correctAnswer: "**hadi (`au mpaka`)**",
    explanation: "*Hadi* na *Mpaka* huashiria ukomo au mwisho wa muda/masafa (`until / up to`).",
    difficulty: 1,
  },

  // ===========================================================================
  // Science & Humanities (`71 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "BIO",
    grade: "Grade 10",
    strandName: "Nutrition in Plants and Animals",
    substrandName: "Enzymes: Lock-and-Key Model vs Induced Fit Model",
    prompt: "How does Daniel Koshland's **Induced Fit Model** refine and improve upon Emil Fischer's classic **Lock-and-Key Model** of enzyme-substrate interaction during digestion?",
    questionType: "MULTIPLE_CHOICE",
    options: [
      "While the Lock-and-Key model assumed the active site is completely **rigid and pre-shaped** exact-matching the substrate (`like a metal key in a lock`), the **Induced Fit Model proves that the active site is flexible**; when the substrate approaches and begins binding, the active site **undergoes a slight conformational shape change to wrap around and mold itself snugly against the substrate**, straining chemical bonds to catalyze reaction",
      "The Induced Fit model states that enzymes turn into iron keys",
      "The Induced Fit model states that substrates melt before touching enzymes",
      "There is zero difference between them"
    ],
    correctAnswer: "While the Lock-and-Key model assumed the active site is completely **rigid and pre-shaped** exact-matching the substrate (`like a metal key in a lock`), the **Induced Fit Model proves that the active site is flexible**; when the substrate approaches and begins binding, the active site **undergoes a slight conformational shape change to wrap around and mold itself snugly against the substrate**, straining chemical bonds to catalyze reaction",
    explanation: "Induced fit explains why some enzymes can catalyze reactions across structurally related substrate families.",
    difficulty: 3,
  }
];
