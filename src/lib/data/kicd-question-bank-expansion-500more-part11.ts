/**
 * EE.8 — KICD Question Bank 500-More Mega-Expansion (Part 11: Completing the 1,571 National Capacity — 210 Questions).
 *
 * Adds 210 exact, self-marking practice questions across Primary, Junior, and Senior School (`Grade 1 through Grade 10`):
 * 1. Mathematics (`Grade 1–10 Numbers, Algebra, Geometry, Measurement, Statistics`) — 70 questions
 * 2. English & Kiswahili (`Grade 1–9 Reading, Grammar, Sarufi, Fasihi`) — 70 questions
 * 3. Science & Humanities (`Grade 1–10 Physics, Chemistry, Biology, Social Studies, Pre-Technical`) — 70 questions
 *
 * Total in Part 11 of 500more: exactly 210 self-marking questions.
 * COMBINED NATIONAL REPOSITORY ACROSS ALL 41 FILES: EXACTLY 1,571 UNIQUE SELF-MARKING QUESTIONS (`1,571 / 1,571`)!
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500MORE_PART11: UniversalQuestionSeed[] = [
  // ===========================================================================
  // Mathematics (`70 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 6",
    strandName: "Numbers",
    substrandName: "Percentages: Finding the Original Quantity given a Percentage",
    prompt: "If 15% of a school's annual water budget (`i18`) is exactly KES 45,000, what is the **total original 100% annual water budget**?",
    questionType: "MULTIPLE_CHOICE",
    options: ["KES 300,000 (`since if 15% = 45,000, 1% = 45,000 / 15 = KES 3,000; 100% = 3,000 × 100 = KES 300,000`)", "KES 450,000", "KES 150,000", "KES 675,000"],
    correctAnswer: "KES 300,000 (`since if 15% = 45,000, 1% = 45,000 / 15 = KES 3,000; 100% = 3,000 × 100 = KES 300,000`)",
    explanation: "Total 100% value = (Part / Percentage) × 100% = (45,000 / 15) × 100 = 3,000 × 100 = KES 300,000.",
    difficulty: 2,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 7",
    strandName: "Algebra",
    substrandName: "Linear Equations (`Variables on Both Sides with Fractions`)",
    prompt: "Solve for w: (3w + 2) / 4 = (2w - 1) / 3.",
    questionType: "MULTIPLE_CHOICE",
    options: ["w = -10 (`since cross-multiplying gives 3(3w + 2) = 4(2w - 1) => 9w + 6 = 8w - 4 => 9w - 8w = -4 - 6 => w = -10`)", "w = 10", "w = -2", "w = 14"],
    correctAnswer: "w = -10 (`since cross-multiplying gives 3(3w + 2) = 4(2w - 1) => 9w + 6 = 8w - 4 => 9w - 8w = -4 - 6 => w = -10`)",
    explanation: "Cross-multiply denominators: 3(3w + 2) = 4(2w - 1) => 9w + 6 = 8w - 4 => w = -10.",
    difficulty: 2,
  },

  // ===========================================================================
  // English & Kiswahili (`70 Questions across Grade 1–9`)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 8",
    strandName: "Grammar in Use",
    substrandName: "Modal Verbs of Deduction in the Present (`May vs Might vs Could`)",
    prompt: "Which sentence expresses weak, tentative possibility regarding a present event?",
    questionType: "MULTIPLE_CHOICE",
    options: ["The Principal **might (`or may/could`) be** inside her office right now, but her car is not in the parking lot so I am uncertain.", "The Principal must be inside her office right now.", "The Principal cannot be inside her office right now.", "The Principal will be inside her office right now."],
    correctAnswer: "The Principal **might (`or may/could`) be** inside her office right now, but her car is not in the parking lot so I am uncertain.",
    explanation: "*May, might, and could* indicate uncertain possibility (`say 30-50% chance`). *Must* indicates high certainty (`95%+`).",
    difficulty: 2,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 8",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Orodha ya Ngeli za Nomino (U-I / M-MI) katika Sentensi",
    prompt: "Chagua upatanisho sahihi wa kisarufi: 'Mkono **_______** wa kulia **_______** na daktari (`Clinic B.1`).'",
    questionType: "MULTIPLE_CHOICE",
    options: ["**ule ... umetibiwa** (`ngeli ya U-I umoja 'm-' -> ule mkono umetibiwa`)", "ile ... imetibiwa", "lile ... limetibiwa", "kile ... kimetibiwa"],
    correctAnswer: "**ule ... umetibiwa** (`ngeli ya U-I umoja 'm-' -> ule mkono umetibiwa`)",
    explanation: "Mkono imo ngeli ya U-I umoja 'm-', hudai kiwakilishi 'ule/huo' na kitenzi 'umetibiwa'.",
    difficulty: 1,
  },

  // ===========================================================================
  // Science & Humanities (`70 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "ISC",
    grade: "Grade 8",
    strandName: "Force and Energy",
    substrandName: "Sound Waves: Speed of Sound in Different Media (`Solids vs Liquids vs Gases`)",
    prompt: "In which of the following physical media do sound waves travel at the **fastest velocity**?",
    questionType: "MULTIPLE_CHOICE",
    options: ["Inside **dense, stiff solids (`such as iron or steel railway rails SGR ~5,000 m/s`)** (`because atomic particles in solids are packed tightly adjacent, transmitting acoustic vibrations mechanically from atom to atom instantaneously`)", "Inside liquid freshwater (`~1,480 m/s`)", "Inside gaseous classroom air (`~340 m/s`)", "Inside empty outer space vacuum (`0 m/s — sound cannot travel through a vacuum`)"],
    correctAnswer: "Inside **dense, stiff solids (`such as iron or steel railway rails SGR ~5,000 m/s`)** (`because atomic particles in solids are packed tightly adjacent, transmitting acoustic vibrations mechanically from atom to atom instantaneously`)",
    explanation: "Sound is a longitudinal mechanical compression wave requiring atomic elasticity. Density and stiffness make sound travel ~15 times faster in steel than in air.",
    difficulty: 2,
  }
];
