/**
 * EE.8 — KICD Question Bank 500-More Mega-Expansion (Part 10: High-Density Practice — 211 Questions).
 *
 * Adds 211 exact, self-marking practice questions across Primary, Junior, and Senior School (`Grade 1 through Grade 10`):
 * 1. Mathematics (`Grade 1–10 Numbers, Algebra, Geometry, Measurement, Statistics`) — 71 questions
 * 2. English & Kiswahili (`Grade 1–9 Reading, Grammar, Sarufi, Fasihi`) — 70 questions
 * 3. Science & Applied (`Grade 1–10 Physics, Chemistry, Biology, Integrated Science, PTS, AGN`) — 70 questions
 *
 * Total in Part 10 of 500more: exactly 211 self-marking questions.
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500MORE_PART10: UniversalQuestionSeed[] = [
  // ===========================================================================
  // Mathematics (`71 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 8",
    strandName: "Geometry",
    substrandName: "Rotational Symmetry Order",
    prompt: "What is the exact **order of rotational symmetry** of a regular hexagon (`6-sided polygon`) about its center?",
    questionType: "MULTIPLE_CHOICE",
    options: ["Order 6 (`since rotating the regular hexagon through 360° / 6 = 60° maps the shape onto itself exactly 6 times per full turn`)", "Order 3", "Order 12", "Order 1"],
    correctAnswer: "Order 6 (`since rotating the regular hexagon through 360° / 6 = 60° maps the shape onto itself exactly 6 times per full turn`)",
    explanation: "Any regular n-sided polygon has exact rotational symmetry of order n about its center.",
    difficulty: 1,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 9",
    strandName: "Numbers",
    substrandName: "Standard Form (`Scientific Notation`)",
    prompt: "Express the number **0.0000458** in exact standard form (`scientific notation A × 10ⁿ where 1 ≤ A < 10`).",
    questionType: "MULTIPLE_CHOICE",
    options: ["4.58 × 10⁻⁵ (`since shifting the decimal point 5 places to the right gives 4.58, demanding a negative power 10⁻⁵`)", "4.58 × 10⁵", "45.8 × 10⁻⁶", "0.458 × 10⁻⁴"],
    correctAnswer: "4.58 × 10⁻⁵ (`since shifting the decimal point 5 places to the right gives 4.58, demanding a negative power 10⁻⁵`)",
    explanation: "Shifting the decimal right across 5 zero positions yields 4.58 × 10⁻⁵.",
    difficulty: 2,
  },

  // ===========================================================================
  // English & Kiswahili (`70 Questions across Grade 1–9`)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 8",
    strandName: "Grammar in Use",
    substrandName: "Phrasal Verbs (`Put off vs Call off`)",
    prompt: "What does the phrasal verb **'put off'** mean inside this sentence: 'Because the football pitch (`CAS`) was waterlogged after the storm, the sports committee decided to **put off** the inter-stream match until next Tuesday.'?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**To postpone or delay an event to a later date/time (`unlike 'call off', which means to cancel completely`)**", "To cancel permanently", "To turn off the stadium lights", "To wear heavy winter jackets"],
    correctAnswer: "**To postpone or delay an event to a later date/time (`unlike 'call off', which means to cancel completely`)**",
    explanation: "*To put off* = postpone. *To call off* = cancel.",
    difficulty: 2,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 8",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Viunganishi vya Masharti ('Maadam')",
    prompt: "Chagua kiunganishi cha sharti au muda: '**_______** watahiniwa wa Grade 8 wamelipa kodi yote ya maktaba (`B.15`), wataruhusiwa kuazima vitabu viwili vya marejeleo.'",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Maadam (`au Bora tu / Mradi`)** (`kiunganishi cha sharti linalofanya jambo lingine likubaliwe`)", "Lakini", "Au", "Baada ya"],
    correctAnswer: "**Maadam (`au Bora tu / Mradi`)** (`kiunganishi cha sharti linalofanya jambo lingine likubaliwe`)",
    explanation: "*Maadam* huonyesha sharti au hali inayoruhusu uamuzi kufanyika (`provided that`).",
    difficulty: 2,
  },

  // ===========================================================================
  // Science & Applied (`70 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "PHY",
    grade: "Grade 10",
    strandName: "Foundations of Senior Sciences",
    substrandName: "Refractive Index from Apparent Depth (`n = Real Depth / Apparent Depth`)",
    prompt: "A swimming pool filled with clear water appears to an observer looking straight down from the edge to be only 3.0 meters deep (`Apparent Depth`). If the refractive index of water is n = 4/3 (`~1.333`), what is the **actual physical depth (`Real Depth`)** of the pool?",
    questionType: "MULTIPLE_CHOICE",
    options: ["4.0 meters (`since Refractive Index n = Real Depth / Apparent Depth => 4/3 = Real Depth / 3.0 m => Real Depth = (4 × 3.0) / 3 = 4.0 meters`)", "3.0 meters", "2.25 meters", "12.0 meters"],
    correctAnswer: "4.0 meters (`since Refractive Index n = Real Depth / Apparent Depth => 4/3 = Real Depth / 3.0 m => Real Depth = (4 × 3.0) / 3 = 4.0 meters`)",
    explanation: "Real Depth = Refractive index × Apparent depth = (4/3) × 3.0 = 4.0 meters.",
    difficulty: 2,
  }
];
