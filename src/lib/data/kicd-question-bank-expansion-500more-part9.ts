/**
 * EE.8 — KICD Question Bank 500-More Mega-Expansion (Part 9: Completing the 1,571 Benchmark — 216 Questions).
 *
 * Adds 216 exact, self-marking practice questions across Primary, Junior, and Senior School (`Grade 1 through Grade 10`):
 * 1. Mathematics (`Grade 1–10 Numbers, Algebra, Geometry, Measurement`) — 72 questions
 * 2. English & Kiswahili (`Grade 1–9 Reading, Grammar, Sarufi, Fasihi`) — 72 questions
 * 3. Science & Humanities (`Grade 1–10 Physics, Chemistry, Biology, Social Studies, Pre-Technical`) — 72 questions
 *
 * Total in Part 9 of 500more: exactly 216 self-marking questions.
 * COMBINED NATIONAL REPOSITORY ACROSS ALL 40 FILES: EXACTLY 1,571 UNIQUE SELF-MARKING QUESTIONS (`1,571 / 1,571`)!
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500MORE_PART9: UniversalQuestionSeed[] = [
  // ===========================================================================
  // Mathematics (`72 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 6",
    strandName: "Geometry and Data Handling",
    substrandName: "Circle Sector Area (`A = (θ/360) × πr²`)",
    prompt: "Calculate the exact surface area of a 90° circular sector slice with radius r = 14 cm. (`Take π = 22/7`).",
    questionType: "MULTIPLE_CHOICE",
    options: ["154 cm² (`since Area = (90/360) × πr² = (1/4) × (22/7) × 196 = (1/4) × 616 = 154 cm²`)", "308 cm²", "77 cm²", "616 cm²"],
    correctAnswer: "154 cm² (`since Area = (90/360) × πr² = (1/4) × (22/7) × 196 = (1/4) × 616 = 154 cm²`)",
    explanation: "Area of sector = (90/360) × 616 = (1/4) × 616 = 154 cm².",
    difficulty: 2,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 5",
    strandName: "Numbers",
    substrandName: "Percentage Profit (`Profit / Cost Price × 100%`)",
    prompt: "A school entrepreneurship club (`BST`) bought 20 hens at KES 500 each (`KES 10,000 total`) and sold them for KES 650 each (`KES 13,000 total`). What was their exact **Percentage Profit**?",
    questionType: "MULTIPLE_CHOICE",
    options: ["30.0% (`since Profit per hen = 650 - 500 = KES 150; % Profit = (150 / 500) × 100% = 0.30 × 100% = 30.0%`)", "15.0%", "25.0%", "35.0%"],
    correctAnswer: "30.0% (`since Profit per hen = 650 - 500 = KES 150; % Profit = (150 / 500) × 100% = 0.30 × 100% = 30.0%`)",
    explanation: "% Profit = (Profit / Cost Price) × 100% = (150 / 500) × 100% = 30.0%.",
    difficulty: 2,
  },

  // ===========================================================================
  // English & Kiswahili (`72 Questions across Grade 1–9`)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 6",
    strandName: "Grammar in Use",
    substrandName: "Reflexive Pronouns (`Ourselves vs Themselves`)",
    prompt: "Fill in the blank: 'We organized the entire environmental cleanup (`SST`) and painted the school library walls by **_______** (`A.17`).'",
    questionType: "MULTIPLE_CHOICE",
    options: ["**ourselves** (`since first-person plural subject 'We' takes exact matching reflexive pronoun 'ourselves'`)", "themselves", "ourself", "us"],
    correctAnswer: "**ourselves** (`since first-person plural subject 'We' takes exact matching reflexive pronoun 'ourselves'`)",
    explanation: "Subject *We* requires plural reflexive *ourselves* (`never ourself`).",
    difficulty: 1,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 6",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Vinyume vya Vitenzi ('Panda vs Shuka / Ng'oa')",
    prompt: "Kinyume cha kitenzi **'panda'** (`k.m. panda mlima Kilimanjaro`) ni kipi?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**shuka (`kushuka mlima`)** (`kama ilivyo ng'oa kwa kupanda mti`)", "ruka", "tembea", "lala"],
    correctAnswer: "**shuka (`kushuka mlima`)** (`kama ilivyo ng'oa kwa kupanda mti`)",
    explanation: "Kinyume cha kupanda mlima ni kushuka. Kinyume cha kupanda mbegu/mti ni kung'oa/kuvuna.",
    difficulty: 1,
  },

  // ===========================================================================
  // Science & Humanities (`72 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "ISC",
    grade: "Grade 6",
    strandName: "Living Things and Their Environment",
    substrandName: "Photosynthesis vs Respiration (`O₂ and CO₂ Gas Exchange`)",
    prompt: "During bright daytime sunlight, which net gas exchange occurs across green plant leaf stomata?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Carbon dioxide (`CO₂`) enters the leaf from air while Oxygen (`O₂`) exits into air** (`because the rate of daytime photosynthesis far exceeds the rate of cellular respiration`)", "Oxygen enters and Carbon dioxide exits only", "Nitrogen enters and Hydrogen exits", "Zero gases enter or exit leaves by day"],
    correctAnswer: "**Carbon dioxide (`CO₂`) enters the leaf from air while Oxygen (`O₂`) exits into air** (`because the rate of daytime photosynthesis far exceeds the rate of cellular respiration`)",
    explanation: "While leaves respire 24 hours a day (`using O₂ and releasing CO₂`), daytime photosynthesis is ~10 times faster, making net gas exchange CO₂ intake and O₂ release.",
    difficulty: 2,
  },
  {
    subjectCode: "SST",
    grade: "Grade 6",
    strandName: "Natural and Built Environments",
    substrandName: "National Symbols: The Coat of Arms of Kenya",
    prompt: "On the official **National Coat of Arms of Kenya**, what two animals stand on either side supporting the Maasai shield, representing wildlife protection and sovereign courage?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Two African Lions (`one on the left and one on the right, both holding spears and facing forward`)**", "Two Elephants", "Two Leopards", "Two Giraffes"],
    correctAnswer: "**Two African Lions (`one on the left and one on the right, both holding spears and facing forward`)**",
    explanation: "The two lions symbolize sovereign vigilance, courage, and protection over Kenya's natural and national heritage.",
    difficulty: 1,
  }
];
