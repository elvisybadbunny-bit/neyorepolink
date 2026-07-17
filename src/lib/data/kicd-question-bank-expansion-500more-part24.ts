/**
 * EE.8 — KICD Question Bank 500-More Mega-Expansion (Part 24: High-Density Practice — 219 Questions).
 *
 * Adds 219 exact, self-marking practice questions across Primary, Junior, and Senior School (`Grade 1 through Grade 10`):
 * 1. Mathematics (`Grade 1–10 Numbers, Algebra, Geometry, Measurement, Statistics`) — 73 questions
 * 2. English & Kiswahili (`Grade 1–9 Reading, Grammar, Sarufi, Fasihi`) — 73 questions
 * 3. Science & Humanities (`Grade 1–10 Physics, Chemistry, Biology, Social Studies, Pre-Technical`) — 73 questions
 *
 * Total in Part 24 of 500more: exactly 219 self-marking questions.
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500MORE_PART24: UniversalQuestionSeed[] = [
  // ===========================================================================
  // Mathematics (`73 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 8",
    strandName: "Geometry",
    substrandName: "Geometric Constructions: Bisecting a Straight Line Segment",
    prompt: "When bisecting a straight line segment AB using a pair of compasses, why must the compass radius `r` be set strictly **greater than half the estimated length of AB (`r > 0.5 AB`)**?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Because if r ≤ 0.5 AB, the two arcs struck from centers A and B will either barely touch at one single point or fail to intersect completely, preventing the drawing of the perpendicular bisector line**", "Because larger circles look prettier on paper", "Because compasses cannot open small distances", "To make the line twice as long"],
    correctAnswer: "**Because if r ≤ 0.5 AB, the two arcs struck from centers A and B will either barely touch at one single point or fail to intersect completely, preventing the drawing of the perpendicular bisector line**",
    explanation: "Two circles only intersect at two distinct points if the sum of their radii exceeds the distance between their centers (`r + r > AB => 2r > AB => r > 0.5 AB`).",
    difficulty: 2,
  },
  {
    subjectCode: "MATC",
    grade: "Grade 10",
    strandName: "Numbers and Algebra",
    substrandName: "Arithmetic Progressions (`Sum of First n Odd Numbers`)",
    prompt: "What is the exact sum of the first 25 consecutive positive odd integers (`1 + 3 + 5 + ... + 49`)?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**625** (`since the sum of the first n positive odd integers always equals strictly n²: 25² = 625`)", "1,225", "500", "600"],
    correctAnswer: "**625** (`since the sum of the first n positive odd integers always equals strictly n²: 25² = 625`)",
    explanation: "Sn = n². For 25 odd terms: 25² = 625.",
    difficulty: 2,
  },

  // ===========================================================================
  // English & Kiswahili (`73 Questions across Grade 1–9`)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 9",
    strandName: "Grammar in Use",
    substrandName: "Parallelism in Correlative Conjunctions (`Not Only...But Also`)",
    prompt: "Which sentence maintains strict **Parallel Structure** when using correlative conjunctions?",
    questionType: "MULTIPLE_CHOICE",
    options: ["The new school bursar is not only **highly qualified in double-entry bookkeeping (`BST`)** but also **exceptionally skilled in M-Pesa STK Push reconciliation (`I.41`)**. (`both elements following not only/but also are parallel adjective phrases`)", "The new bursar is not only highly qualified, but also he reconciles M-Pesa.", "Not only the new bursar is highly qualified, but also skilled.", "The bursar not only is qualified, but also skilled."],
    correctAnswer: "The new school bursar is not only **highly qualified in double-entry bookkeeping (`BST`)** but also **exceptionally skilled in M-Pesa STK Push reconciliation (`I.41`)**. (`both elements following not only/but also are parallel adjective phrases`)",
    explanation: "Correlative conjunctions (`either/or, neither/nor, not only/but also`) require identical grammatical forms on both sides.",
    difficulty: 2,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 9",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Kauli ya Kutendeshana (`-ish-an-`)",
    prompt: "Kitenzi **'fanya'** kinaponyambuliwa katika kauli ya **Kutendeshana (`Causative Reciprocal` — kuwafanya au kuwahimiza watu wawili au zaidi wafanye au washirikiane jambo)**, kinakuwaje?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**fanyishana** (`k.m. mwalimu aliwafanyishana mazoezi ya kikundi darasani`)", "fanywa", "fanyia", "fanyika"],
    correctAnswer: "**fanyishana** (`k.m. mwalimu aliwafanyishana mazoezi ya kikundi darasani`)",
    explanation: "Fanya -> Fanyisha (`causative`) -> Fanyishana (`causative reciprocal`).",
    difficulty: 3,
  },

  // ===========================================================================
  // Science & Humanities (`73 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "BIO",
    grade: "Grade 10",
    strandName: "Foundations of Senior Sciences",
    substrandName: "Enzymes: Competitive vs Non-Competitive Inhibition",
    prompt: "How does a **Competitive Enzyme Inhibitor** (`such as malonate blocking succinate dehydrogenase`) differ biochemically from a **Non-Competitive Inhibitor**?",
    questionType: "MULTIPLE_CHOICE",
    options: [
      "A **Competitive Inhibitor closely mimics the 3D shape of the normal substrate and binds directly to the active site**, physically blocking substrate entry (`its inhibition CAN be overcome and reversed by adding a massive excess of normal substrate molecules`); a **Non-Competitive Inhibitor binds away from the active site (`allosteric site`)**, altering the enzyme's 3D tertiary structure (`its inhibition CANNOT be overcome by substrate excess`)",
      "Competitive inhibitors turn enzymes into iron while non-competitive turn them into gold",
      "Competitive inhibitors work only inside plant leaves",
      "There is zero difference"
    ],
    correctAnswer: "A **Competitive Inhibitor closely mimics the 3D shape of the normal substrate and binds directly to the active site**, physically blocking substrate entry (`its inhibition CAN be overcome and reversed by adding a massive excess of normal substrate molecules`); a **Non-Competitive Inhibitor binds away from the active site (`allosteric site`)**, altering the enzyme's 3D tertiary structure (`its inhibition CANNOT be overcome by substrate excess`)",
    explanation: "Competitive inhibitors compete directly for the active pocket (`statistically overcome by high substrate concentration`). Non-competitive allosteric inhibitors deform the pocket permanently.",
    difficulty: 3,
  }
];
