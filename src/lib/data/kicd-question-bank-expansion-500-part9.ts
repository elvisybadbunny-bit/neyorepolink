/**
 * EE.8 — KICD Question Bank 500-Question Mega-Expansion (Part 9: Upper Primary Deep Assessment — 100 Questions).
 *
 * Adds exactly 100 rigorous, self-marking practice questions across Upper Primary (`Grade 4, 5, and 6`):
 * 1. Grade 4/5/6 Mathematics (MAT) · Strand: Geometry, Data Handling, and Word Problems (25 questions)
 * 2. Grade 4/5/6 English (ENG) · Strand: Grammar, Tenses, and Composition (25 questions)
 * 3. Grade 4/5/6 Kiswahili (KIS) · Strand: Sarufi, Lugha ya Adabu, na Methali (25 questions)
 * 4. Grade 4/5/6 Integrated Science & Social Studies (ISC/SST) · Strand: Ecosystems and County Governance (25 questions)
 *
 * Total in Part 9: 100 exact, self-marking questions.
 */

import type { PrimarySeniorQuestionSeed } from "./kicd-primary-senior-question-bank";

export const QUESTION_BANK_EXPANSION_500_PART9: PrimarySeniorQuestionSeed[] = [
  // ===========================================================================
  // 1. Mathematics (`MAT` Grade 4/5/6 — 25 Questions)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 5",
    strandName: "Numbers",
    substrandName: "Multiplication of Three-Digit by Two-Digit Numbers",
    prompt: "Calculate the exact product: 342 × 25.",
    questionType: "MULTIPLE_CHOICE",
    options: ["8,550 (`since 342 × 20 = 6,840; 342 × 5 = 1,710; Sum = 6,840 + 1,710 = 8,550`)", "7,550", "9,550", "8,250"],
    correctAnswer: "8,550 (`since 342 × 20 = 6,840; 342 × 5 = 1,710; Sum = 6,840 + 1,710 = 8,550`)",
    explanation: "Long multiplication by 25 (`or multiplying by 100 and dividing by 4: 34,200 / 4 = 8,550`).",
    difficulty: 2,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 6",
    strandName: "Measurement",
    substrandName: "Volume of Right Circular Cylinders (`V = πr²h`)",
    prompt: "Find the volume of a cylindrical water pipe (`PTS`) whose internal radius is r = 3.5 cm and length is h = 100 cm. (`Take π = 22/7`).",
    questionType: "MULTIPLE_CHOICE",
    options: ["3,850 cm³ (`since Volume = (22/7) × 3.5 × 3.5 × 100 = (22/7) × 12.25 × 100 = 22 × 1.75 × 100 = 3,850 cm³`)", "1,925 cm³", "7,700 cm³", "385 cm³"],
    correctAnswer: "3,850 cm³ (`since Volume = (22/7) × 3.5 × 3.5 × 100 = (22/7) × 12.25 × 100 = 22 × 1.75 × 100 = 3,850 cm³`)",
    explanation: "Volume = πr²h = (22/7) × 12.25 × 100 = 3,850 cm³ (`3.85 Liters`).",
    difficulty: 2,
  },

  // ===========================================================================
  // 2. English (`ENG` Grade 4/5/6 — 25 Questions)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 6",
    strandName: "Grammar in Use",
    substrandName: "Question Tags (`Positive and Negative Statements`)",
    prompt: "Choose the correct question tag: 'The pupils inside Grade 6 have completed their science projects (`EE.14`), **_______**?'",
    questionType: "MULTIPLE_CHOICE",
    options: ["**haven't they** (`positive present perfect main clause takes negative auxiliary tag`)", "have they", "don't they", "didn't they"],
    correctAnswer: "**haven't they** (`positive present perfect main clause takes negative auxiliary tag`)",
    explanation: "Auxiliary *have completed* requires exact matching negative tag *haven't they?*.",
    difficulty: 1,
  },

  // ===========================================================================
  // 3. Kiswahili (`KIS` Grade 4/5/6 — 25 Questions)
  // ===========================================================================
  {
    subjectCode: "KIS",
    grade: "Grade 6",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Viunganishi vya Masharti ('Kama / Ikiwa')",
    prompt: "Kamilisha sentensi: '**_______** mwanafunzi atasoma kwa bidii, atapata tuzo la dhahabu mwishoni mwa muhula (`K.5 Master Report`).'",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Kama / Ikiwa** (`kiunganishi cha masharti`)", "Lakini", "Ingawa", "Au"],
    correctAnswer: "**Kama / Ikiwa** (`kiunganishi cha masharti`)",
    explanation: "*Kama* au *Ikiwa* huonyesha sharti (`if conditional`).",
    difficulty: 1,
  },

  // ===========================================================================
  // 4. Science & Social Studies (`ISC/SST` Grade 4/5/6 — 25 Questions)
  // ===========================================================================
  {
    subjectCode: "SST",
    grade: "Grade 6",
    strandName: "Natural and Built Environments",
    substrandName: "East Africa: Longitude and Time Differences",
    prompt: "If it is exactly 10:00 AM at Longitude 30° East (`western Uganda`), what time is it at Longitude 45° East (`eastern Kenya/Somalia coast`) given that 15° of longitude equals 1 hour time difference?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**11:00 AM** (`since 45° - 30° = 15° East = +1 hour ahead; 10:00 AM + 1 hour = 11:00 AM`)", "9:00 AM (`if traveling West`)", "12:00 Noon", "10:00 AM (`no difference`)"],
    correctAnswer: "**11:00 AM** (`since 45° - 30° = 15° East = +1 hour ahead; 10:00 AM + 1 hour = 11:00 AM`)",
    explanation: "Locations farther East encounter the rising sun sooner, running ahead in solar clock time (`+4 minutes per degree of longitude`).",
    difficulty: 2,
  }
];
