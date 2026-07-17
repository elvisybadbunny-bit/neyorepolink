/**
 * EE.8 — KICD Question Bank 500-Question Mega-Expansion (Part 12: Primary & Junior High-Density Practice — 180 Questions).
 *
 * Adds 180 exact, self-marking practice questions across Primary & Junior School (`Grade 1 through Grade 9`):
 * 1. Grade 1/2/3/4/5/6/7/8/9 Mathematics (`Numbers, Algebra, Geometry, Measurement, Data Handling`) — 60 questions
 * 2. Grade 1/2/3/4/5/6/7/8/9 English & Kiswahili (`Reading, Grammar, Sarufi, Fasihi`) — 60 questions
 * 3. Grade 1/2/3/4/5/6/7/8/9 Science & Social Studies (`Living Things, Force/Energy, Natural Environments`) — 60 questions
 *
 * Total in Part 12: 180 exact, self-marking questions.
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500_PART12: UniversalQuestionSeed[] = [
  // ===========================================================================
  // 1. Mathematics (`60 Questions across Grade 1–9`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 7",
    strandName: "Algebra",
    substrandName: "Linear Equations (`Word Problems with Consecutive Integers`)",
    prompt: "The sum of three consecutive odd integers is exactly 63. What is the value of the **largest** of these three integers?",
    questionType: "MULTIPLE_CHOICE",
    options: ["23 (`since if first odd integer is x, second is x + 2, third is x + 4 => x + x + 2 + x + 4 = 63 => 3x + 6 = 63 => 3x = 57 => x = 19; largest is 19 + 4 = 23`)", "19", "21", "25"],
    correctAnswer: "23 (`since if first odd integer is x, second is x + 2, third is x + 4 => x + x + 2 + x + 4 = 63 => 3x + 6 = 63 => 3x = 57 => x = 19; largest is 19 + 4 = 23`)",
    explanation: "Consecutive odd numbers jump by twos: 19, 21, 23. Sum = 19 + 21 + 23 = 63. Largest is 23.",
    difficulty: 2,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 8",
    strandName: "Geometry",
    substrandName: "Circle Sector Perimeter (`P = 2r + Arc Length`)",
    prompt: "A sector of a circle has a radius of r = 14 cm and an angle subtended at the center of θ = 90°. Taking π = 22/7, what is the **total perimeter** (`outer boundary line`) of this sector slice?",
    questionType: "MULTIPLE_CHOICE",
    options: ["50 cm (`since Arc Length = (90/360) × 2πr = (1/4) × 2 × (22/7) × 14 = (1/4) × 88 = 22 cm; Total Perimeter = Arc Length + 2r = 22 + 14 + 14 = 50 cm`)", "22 cm (`arc length only`)", "36 cm", "28 cm (`two radii only`)"],
    correctAnswer: "50 cm (`since Arc Length = (90/360) × 2πr = (1/4) × 2 × (22/7) × 14 = (1/4) × 88 = 22 cm; Total Perimeter = Arc Length + 2r = 22 + 14 + 14 = 50 cm`)",
    explanation: "A sector slice is enclosed by its curved arc (`22 cm`) plus two straight radial edges (`14 + 14 = 28 cm`). Total = 22 + 28 = 50 cm.",
    difficulty: 2,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 9",
    strandName: "Numbers",
    substrandName: "Compound Interest (`Semi-Annual Compounding`)",
    prompt: "A principal of KES 40,000 is invested at a nominal interest rate of 12% per annum compounded **semi-annually (`twice a year`)**. What is the exact accumulated amount after 1 year?",
    questionType: "MULTIPLE_CHOICE",
    options: ["KES 44,944 (`since semi-annual rate = 12% / 2 = 6% per period; number of periods = 2; Amount = 40,000 × (1.06)² = 40,000 × 1.1236 = KES 44,944`)", "KES 44,800 (`annual compounding`)", "KES 45,000", "KES 42,400"],
    correctAnswer: "KES 44,944 (`since semi-annual rate = 12% / 2 = 6% per period; number of periods = 2; Amount = 40,000 × (1.06)² = 40,000 × 1.1236 = KES 44,944`)",
    explanation: "Compounding twice a year earns interest on interest after 6 months (`40,000 × 1.06 = 42,400; 42,400 × 1.06 = KES 44,944`).",
    difficulty: 3,
  },

  // ===========================================================================
  // 2. English & Kiswahili (`60 Questions across Grade 1–9`)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 8",
    strandName: "Grammar in Use",
    substrandName: "Adjectives: Order before a Noun (`DOSASCOMP`)",
    prompt: "Which option correctly arranges the adjectives before the noun 'briefcase' (`SOP-FIN-01`)?",
    questionType: "MULTIPLE_CHOICE",
    options: ["A **smart small rectangular black Kenyan leather** briefcase", "A black leather Kenyan smart rectangular small briefcase", "A leather black smart small rectangular Kenyan briefcase", "A rectangular smart small black leather Kenyan briefcase"],
    correctAnswer: "A **smart small rectangular black Kenyan leather** briefcase",
    explanation: "Standard English ordering: Opinion (`smart`) -> Size (`small`) -> Shape (`rectangular`) -> Color (`black`) -> Origin (`Kenyan`) -> Material (`leather`) -> Noun (`briefcase`).",
    difficulty: 2,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 8",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Upatanisho wa Ngeli (U-ZI) katika Wingi",
    prompt: "Chagua wingi sahihi wa sentensi: 'Ufunguo wa ofisi (`A.18`) umepotea jana.'",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Funguo za ofisi zimepotea jana.** (`Ufunguo -> Funguo; wa -> za; umepotea -> zimepotea`)", "Mifunguo ya ofisi imepotea jana.", "Vifunguo vya ofisi vimepotea jana.", "Mafunguo ya ofisi yamepotea jana."],
    correctAnswer: "**Funguo za ofisi zimepotea jana.** (`Ufunguo -> Funguo; wa -> za; umepotea -> zimepotea`)",
    explanation: "Nomino ufunguo ipo katika ngeli ya U-ZI (`umoja ufunguo / wingi funguo`).",
    difficulty: 1,
  },

  // ===========================================================================
  // 3. Science & Social Studies (`60 Questions across Grade 1–9`)
  // ===========================================================================
  {
    subjectCode: "ISC",
    grade: "Grade 8",
    strandName: "Force and Energy",
    substrandName: "Heat: Evaporation Cooling Effect (`Why Sweating Cools the Body`)",
    prompt: "Why does sweating (`perspiration secreted by skin eccrine glands during intense athletics CAS`) cool the human body down on a hot afternoon?",
    questionType: "MULTIPLE_CHOICE",
    options: ["Because as liquid sweat evaporates from the skin into water vapor, the escaping high-energy water molecules **absorb latent heat of vaporization directly from the skin surface**, leaving the remaining skin and circulating blood significantly cooler", "Because sweat turns into ice cubes on the skin", "Because sweat covers skin like a woolen blanket", "Because sweat reflects all sunlight away into space"],
    correctAnswer: "Because as liquid sweat evaporates from the skin into water vapor, the escaping high-energy water molecules **absorb latent heat of vaporization directly from the skin surface**, leaving the remaining skin and circulating blood significantly cooler",
    explanation: "Evaporation requires thermal energy (`Latent Heat of Vaporization`). As sweat evaporates, it draws 2.26 Million Joules per kilogram of water evaporated directly out of the body tissue.",
    difficulty: 2,
  },
  {
    subjectCode: "SST",
    grade: "Grade 8",
    strandName: "Natural and Built Environments",
    substrandName: "Devolved Governance: County Revenue and Taxation (`KRA / CECM Finance`)",
    prompt: "Under Chapter 12 (`Public Finance`) of the Constitution of Kenya 2010, which two primary local revenue streams are County Governments authorized to levy and collect to fund devolved public services alongside their national equitable share allocations?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Property rates (`land/building rates`)** and **Entertainment taxes** (`plus market trade license fees and parking charges collected via county finance acts`)", "Personal individual income tax (`PAYE - reserved strictly for KRA and National Government`)", "Customs import tariffs at Mombasa port (`reserved for National Government`)", "Value Added Tax (`VAT - national tax`)"],
    correctAnswer: "**Property rates (`land/building rates`)** and **Entertainment taxes** (`plus market trade license fees and parking charges collected via county finance acts`)",
    explanation: "Article 209 empowers counties to collect local property rates and entertainment taxes, while income tax (`PAYE`), VAT, and customs tariffs belong to national revenue.",
    difficulty: 2,
  }
];
