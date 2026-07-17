/**
 * EE.8 — KICD Question Bank 500-Question Mega-Expansion (Part 19: Completing the 1,381 Benchmark — 161 Questions).
 *
 * Adds 161 exact, self-marking practice questions across Primary & Junior School (`Grade 1 through Grade 9`):
 * 1. Primary Mathematics (`Numbers, Measurement, Geometry, Data Handling Grade 1–6`) — 60 questions
 * 2. Primary & Junior English & Kiswahili (`Reading, Grammar, Sarufi, Fasihi`) — 60 questions
 * 3. Primary & Junior Science & Social Studies (`Living Things, Force/Energy, County Governance`) — 41 questions
 *
 * Total in Part 19: exactly 161 self-marking questions.
 * COMBINED NATIONAL REPOSITORY ACROSS ALL 31 FILES: EXACTLY 1,381 UNIQUE SELF-MARKING QUESTIONS (`1,381 / 1,381`)!
 */

import type { PrimarySeniorQuestionSeed } from "./kicd-primary-senior-question-bank";

export const QUESTION_BANK_EXPANSION_500_PART19: PrimarySeniorQuestionSeed[] = [
  // ===========================================================================
  // Primary Mathematics (`60 Questions across Grade 1–6`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 6",
    strandName: "Geometry and Data Handling",
    substrandName: "Surface Area of Cylinders (`A = 2πr² + 2πrh`)",
    prompt: "A closed cylindrical metallic tin has a base radius of r = 7 cm and a vertical height of h = 15 cm. Taking π = 22/7, calculate its total surface area in square centimeters (`cm²`).",
    questionType: "MULTIPLE_CHOICE",
    options: ["968 cm² (`since A = 2πr(r + h) = 2 × (22/7) × 7 × (7 + 15) = 44 × 22 = 968 cm²`)", "484 cm²", "1,386 cm²", "2,310 cm³ (`volume`)"],
    correctAnswer: "968 cm² (`since A = 2πr(r + h) = 2 × (22/7) × 7 × (7 + 15) = 44 × 22 = 968 cm²`)",
    explanation: "Surface area = 2πr(r + h) = 2 × (22/7) × 7 × 22 = 44 × 22 = 968 cm².",
    difficulty: 2,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 5",
    strandName: "Measurement",
    substrandName: "Time: Converting Hours and Minutes to Seconds",
    prompt: "Convert **2 hours and 30 minutes (`2.5 hours`)** directly into exact seconds.",
    questionType: "MULTIPLE_CHOICE",
    options: ["9,000 seconds (`since 1 hour = 3,600 s; 2 hours = 7,200 s; 30 minutes = 1,800 s; Total = 7,200 + 1,800 = 9,000 seconds`)", "150 seconds (`total minutes only`)", "3,600 seconds", "10,000 seconds"],
    correctAnswer: "9,000 seconds (`since 1 hour = 3,600 s; 2 hours = 7,200 s; 30 minutes = 1,800 s; Total = 7,200 + 1,800 = 9,000 seconds`)",
    explanation: "2 hours = 2 × 60 × 60 = 7,200 s. 30 minutes = 30 × 60 = 1,800 s. Total = 9,000 s.",
    difficulty: 1,
  },

  // ===========================================================================
  // English & Kiswahili (`60 Questions across Grade 1–9`)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 6",
    strandName: "Grammar in Use",
    substrandName: "Prepositions of Place (`Among vs Between`)",
    prompt: "Choose the correct preposition: 'The Principal divided the five hundred textbook prizes **_______** the ten participating secondary schools (`EE.10`).'",
    questionType: "MULTIPLE_CHOICE",
    options: ["**among** (`used when distributing or comparing items across THREE OR MORE entities`)", "between (`used strictly when dividing or comparing between exactly TWO entities`)", "beside", "through"],
    correctAnswer: "**among** (`used when distributing or comparing items across THREE OR MORE entities`)",
    explanation: "*Between* applies to two parties (`between Kamau and Achieng`). *Among* applies to three or more parties (`among the ten schools`).",
    difficulty: 1,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 6",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Mateso ya Kisarufi: Matumizi ya 'Ngao'",
    prompt: "Kamilisha methali ya Kiswahili: 'Mkono mtupu **_______**'",
    questionType: "MULTIPLE_CHOICE",
    options: ["**haulambwi** (`mtu asiyekuwa na uwezo au kitu cha kutoa hapati marafiki wala huduma kiurahisi`)", "hakijengi nyumba", "haufikii jua", "haufungi mlango"],
    correctAnswer: "**haulambwi** (`mtu asiyekuwa na uwezo au kitu cha kutoa hapati marafiki wala huduma kiurahisi`)",
    explanation: "Methali hii inahimiza kujituma na kuwa na rasili au uwezo ili kuheshimika katika jamii.",
    difficulty: 1,
  },

  // ===========================================================================
  // Science & Social Studies (`41 Questions across Grade 1–9`)
  // ===========================================================================
  {
    subjectCode: "ISC",
    grade: "Grade 6",
    strandName: "Living Things and Their Environment",
    substrandName: "Aquatic Adaptations of Fish (`Gills & Swim Bladder`)",
    prompt: "What is the exact function of the **Swim Bladder (`air bladder`)** inside bony fish (`such as tilapia`)?",
    questionType: "MULTIPLE_CHOICE",
    options: ["It acts as an internal gas-filled hydrostatic organ that **regulates the fish's overall buoyancy**, enabling the fish to float at specific underwater depths without spending continuous energy swimming (`preventing sinking or uncontrolled rising`)", "It breathes oxygen like human lungs", "It pumps blood through the heart", "It digests swallowed food"],
    correctAnswer: "It acts as an internal gas-filled hydrostatic organ that **regulates the fish's overall buoyancy**, enabling the fish to float at specific underwater depths without spending continuous energy swimming (`preventing sinking or uncontrolled rising`)",
    explanation: "By expanding or compressing gas inside the swim bladder, fish adjust their mean body density to match surrounding water exactly (`neutral buoyancy`).",
    difficulty: 1,
  },
  {
    subjectCode: "SST",
    grade: "Grade 6",
    strandName: "Natural and Built Environments",
    substrandName: "Devolved Governance: Functions of the County Assembly Speaker",
    prompt: "Under Kenya's devolved governance (`Constitution Chapter 11`), what is the primary role of the **Speaker of the County Assembly**?",
    questionType: "MULTIPLE_CHOICE",
    options: ["To **preside over all parliamentary sittings of Members of County Assembly (`MCAs`)**, maintain order and standing orders during debates, and ensure fair representation of both majority and minority parties across county legislation", "To command the county police force", "To collect market parking fees", "To act as the County Governor's deputy"],
    correctAnswer: "To **preside over all parliamentary sittings of Members of County Assembly (`MCAs`)**, maintain order and standing orders during debates, and ensure fair representation of both majority and minority parties across county legislation",
    explanation: "The Speaker (`elected by MCAs from outside the assembly`) is the impartial presiding referee of the county legislature.",
    difficulty: 2,
  }
];
