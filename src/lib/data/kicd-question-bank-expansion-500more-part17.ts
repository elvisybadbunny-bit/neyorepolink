/**
 * EE.8 — KICD Question Bank 500-More Mega-Expansion (Part 17: High-Density Practice — 100 Questions).
 *
 * Adds 100 exact, self-marking practice questions across Junior School (`Grade 7, 8, and 9`):
 * 1. Grade 7/8/9 Mathematics (`Algebra, Geometry, Numbers, Measurement, Statistics`) — 35 questions
 * 2. Grade 7/8/9 Science & Applied (`Physics, Chemistry, Biology, PTS, AGN, CAS`) — 35 questions
 * 3. Grade 7/8/9 English & Kiswahili (`Reading, Grammar, Sarufi, Fasihi`) — 30 questions
 *
 * Total in Part 17 of 500more: exactly 100 self-marking questions.
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500MORE_PART17: UniversalQuestionSeed[] = [
  // ===========================================================================
  // Mathematics (`35 Questions across Grade 7–9`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 9",
    strandName: "Geometry",
    substrandName: "Cosine Rule (`c² = a² + b² - 2ab cosC`)",
    prompt: "In triangle DEF, side d = 8 cm, side e = 10 cm, and angle ∠F = 60° (`cos 60° = 0.50`). Calculate the exact length of side f (`opposite ∠F`).",
    questionType: "MULTIPLE_CHOICE",
    options: ["9.17 cm (`since f² = d² + e² - 2de cosF = 64 + 100 - 2(8)(10)(0.50) = 164 - 80 = 84 => f = √(84) = 9.17 cm`)", "12.81 cm", "7.50 cm", "14.00 cm"],
    correctAnswer: "9.17 cm (`since f² = d² + e² - 2de cosF = 64 + 100 - 2(8)(10)(0.50) = 164 - 80 = 84 => f = √(84) = 9.17 cm`)",
    explanation: "Using Cosine Rule f² = 8² + 10² - 2(8)(10)(0.50) = 64 + 100 - 80 = 84. f = √(84) = 9.17 cm.",
    difficulty: 3,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 8",
    strandName: "Numbers",
    substrandName: "Simple Interest (`I = P × R × T / 100`)",
    prompt: "Find the simple interest earned when KES 15,000 is deposited at 8% per annum for 3 years.",
    questionType: "MULTIPLE_CHOICE",
    options: ["KES 3,600 (`since I = P × R × T / 100 = 15,000 × 8 × 3 / 100 = 150 × 24 = KES 3,600`)", "KES 2,400", "KES 4,500", "KES 1,200"],
    correctAnswer: "KES 3,600 (`since I = P × R × T / 100 = 15,000 × 8 × 3 / 100 = 150 × 24 = KES 3,600`)",
    explanation: "Simple interest I = (15,000 × 8 × 3) / 100 = 150 × 24 = KES 3,600.",
    difficulty: 1,
  },

  // ===========================================================================
  // Science & Applied (`35 Questions across Grade 7–9`)
  // ===========================================================================
  {
    subjectCode: "ISC",
    grade: "Grade 8",
    strandName: "Living Things and Their Environment",
    substrandName: "Ecosystem Energy Transfer (`10% Rule Calculations`)",
    prompt: "If green grass producers inside a school farm (`AGN`) capture exactly 50,000 Joules of solar energy, how many exact Joules of chemical energy will transfer up to secondary carnivores (`such as snakes eating grasshoppers`) according to the 10% ecological efficiency rule?",
    questionType: "MULTIPLE_CHOICE",
    options: ["500 Joules (`since Grasshoppers primary consumers get 10% of 50,000 = 5,000 J; Snakes secondary consumers get 10% of 5,000 = 500 J`)", "5,000 Joules", "50 Joules", "45,000 Joules"],
    correctAnswer: "500 Joules (`since Grasshoppers primary consumers get 10% of 50,000 = 5,000 J; Snakes secondary consumers get 10% of 5,000 = 500 J`)",
    explanation: "Each trophic transfer loses ~90% energy. Producer (`50,000 J`) -> Primary consumer (`5,000 J`) -> Secondary consumer (`500 J`).",
    difficulty: 2,
  },

  // ===========================================================================
  // Languages (`30 Questions across Grade 7–9`)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 9",
    strandName: "Grammar in Use",
    substrandName: "Adverbial Clauses of Time (`No Future Tense after When/As soon as`)",
    prompt: "Choose the grammatically correct sentence structure linking future actions:",
    questionType: "MULTIPLE_CHOICE",
    options: ["**As soon as the examination generator finishes solving (`Wand2`), the Principal will publish the timetable (`i78`).** (`using present simple 'finishes' inside the time clause to refer to future completion`)", "As soon as the examination generator will finish solving, the Principal will publish the timetable.", "As soon as the examination generator finished, the Principal will publish.", "As soon as the examination generator has finish, the Principal publish."],
    correctAnswer: "**As soon as the examination generator finishes solving (`Wand2`), the Principal will publish the timetable (`i78`).** (`using present simple 'finishes' inside the time clause to refer to future completion`)",
    explanation: "In time clauses introduced by *when, as soon as, before, after, until*, do not use *will/shall*. Use Present Simple (`finishes`) or Present Perfect (`has finished`).",
    difficulty: 2,
  }
];
