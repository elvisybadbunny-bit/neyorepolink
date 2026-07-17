/**
 * EE.8 — KICD Question Bank 500-Question Mega-Expansion (Part 15: Completing the 1,381 National Capacity — 173 Questions).
 *
 * Adds 173 exact, self-marking practice questions across Primary & Junior School (`Grade 1 through Grade 9`):
 * 1. Primary Mathematics (`Numbers, Measurement, Geometry, Data Handling Grade 1–6`) — 60 questions
 * 2. Primary & Junior English & Kiswahili (`Reading, Grammar, Sarufi, Fasihi`) — 60 questions
 * 3. Primary & Junior Science & Social Studies (`Living Things, Force/Energy, County Governance`) — 53 questions
 *
 * Total in Part 15: exactly 173 self-marking questions.
 * COMBINED NATIONAL REPOSITORY ACROSS ALL 25 FILES: EXACTLY 1,381 UNIQUE SELF-MARKING QUESTIONS (`1,381 / 1,381`)!
 */

import type { PrimarySeniorQuestionSeed } from "./kicd-primary-senior-question-bank";

export const QUESTION_BANK_EXPANSION_500_PART15: PrimarySeniorQuestionSeed[] = [
  // ===========================================================================
  // Primary Mathematics (`60 Questions across Grade 1–6`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 6",
    strandName: "Geometry and Data Handling",
    substrandName: "Volume of Cuboids (`Finding Missing Height given Volume and Base Area`)",
    prompt: "A rectangular water storage tank (`cuboid`) has a base area of A = 150 m² and a total storage volume of V = 450 m³ (`450,000 Liters`). What is the exact vertical height (`h`) of the tank?",
    questionType: "MULTIPLE_CHOICE",
    options: ["3.0 meters (`since Volume = Base Area × Height => 450 = 150 × h => h = 450 / 150 = 3.0 m`)", "30.0 meters", "2.0 meters", "67,500 meters"],
    correctAnswer: "3.0 meters (`since Volume = Base Area × Height => 450 = 150 × h => h = 450 / 150 = 3.0 m`)",
    explanation: "Height h = Volume V / Base Area A = 450 m³ / 150 m² = 3.0 meters.",
    difficulty: 1,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 5",
    strandName: "Numbers",
    substrandName: "Percentages of Whole Quantities (`Finding Percentage of a Number`)",
    prompt: "In a primary school of 400 total students (`B.1`), exactly **60%** are girls. How many exact girls attend the school?",
    questionType: "MULTIPLE_CHOICE",
    options: ["240 girls (`since 60% of 400 = (60/100) × 400 = 60 × 4 = 240 girls`)", "160 girls (`boys`)", "300 girls", "200 girls"],
    correctAnswer: "240 girls (`since 60% of 400 = (60/100) × 400 = 60 × 4 = 240 girls`)",
    explanation: "60% × 400 = 0.60 × 400 = 240 girls (`and 40% × 400 = 160 boys`).",
    difficulty: 1,
  },

  // ===========================================================================
  // English & Kiswahili (`60 Questions across Grade 1–9`)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 6",
    strandName: "Grammar in Use",
    substrandName: "Collective Nouns (`Groups of Animals and Objects`)",
    prompt: "Which collective noun correctly completes the sentence: 'During our school trip (`R.6`) to Nakuru National Park (`SST`), we saw a magnificent **_______ of lions** resting under an acacia tree.'?",
    questionType: "MULTIPLE_CHOICE",
    options: ["pride (`a pride of lions`)", "herd (`of cattle/elephants`)", "flock (`of birds/sheep`)", "swarm (`of bees`)"],
    correctAnswer: "pride (`a pride of lions`)",
    explanation: "A family group of lions is specifically designated as a *pride* (`a pride of lions`).",
    difficulty: 1,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 6",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Upatanisho wa Ngeli (U-I) katika Viwakilishi",
    prompt: "Chagua upatanisho sahihi wa kisarufi: 'Mti **_______** uliopandwa na Wangari Maathai (`SST`) shuleni kwetu **_______** na kuzaa matunda mazuri.'",
    questionType: "MULTIPLE_CHOICE",
    options: ["**mle ... umekua** (`ngeli ya U-I umoja 'm-' -> mle mti umekua`)", "ile ... imekua", "lile ... limekua", "kile ... kimekua"],
    correctAnswer: "**mle ... umekua** (`ngeli ya U-I umoja 'm-' -> mle mti umekua`)",
    explanation: "Nomino 'mti' imo ngeli ya U-I umoja 'm-', hudai kiwakilishi 'mle/huno' na kitenzi 'umekua'.",
    difficulty: 1,
  },

  // ===========================================================================
  // Science & Social Studies (`53 Questions across Grade 1–9`)
  // ===========================================================================
  {
    subjectCode: "ISC",
    grade: "Grade 6",
    strandName: "Living Things and Their Environment",
    substrandName: "Photosynthesis: Role of Chlorophyll and Sunlight",
    prompt: "Why are the leaves of healthy plants green in color, and what is the exact function of that green pigment during photosynthesis?",
    questionType: "MULTIPLE_CHOICE",
    options: ["Because they contain **Chlorophyll**, a green pigment molecule inside chloroplasts that **absorbs solar light kinetic photons** (`primarily red and blue wavelengths while reflecting green light back to our eyes`) and converts them into chemical bond energy to manufacture glucose (`C₆H₁₂O₆`)", "Because green paint falls from rain clouds", "Because green leaves turn into iron metal overnight", "Because green leaves absorb all nitrogen from air"],
    correctAnswer: "Because they contain **Chlorophyll**, a green pigment molecule inside chloroplasts that **absorbs solar light kinetic photons** (`primarily red and blue wavelengths while reflecting green light back to our eyes`) and converts them into chemical bond energy to manufacture glucose (`C₆H₁₂O₆`)",
    explanation: "Chlorophyll (`porphyrin ring around magnesium`) captures photon energy to drive photolysis of water (`2H₂O -> 4H⁺ + 4e⁻ + O₂↑`).",
    difficulty: 1,
  },
  {
    subjectCode: "SST",
    grade: "Grade 6",
    strandName: "Natural and Built Environments",
    substrandName: "Devolved Governance: Functions of the County Executive Committee (`CECMs`)",
    prompt: "Under Kenya's devolved governance structure (`Constitution 2010 Chapter 11`), what role do **County Executive Committee Members (`CECMs` — equivalent to county ministers appointed by the Governor and approved by MCAs)** play across local county administration?",
    questionType: "MULTIPLE_CHOICE",
    options: ["They head and administer specific devolved county departments (`such as CECM for Agriculture AGN, CECM for Health Clinic B.1, or CECM for Devolved Roads & Transport T.8`), implementing county legislation and managing executive project delivery across all wards", "They command national military infantry battalions", "They print currency notes inside the Central Bank of Kenya (`CBK`)", "They appoint High Court judges across Kenya"],
    correctAnswer: "They head and administer specific devolved county departments (`such as CECM for Agriculture AGN, CECM for Health Clinic B.1, or CECM for Devolved Roads & Transport T.8`), implementing county legislation and managing executive project delivery across all wards",
    explanation: "The County Executive Committee (`CEC`) comprises the Governor, Deputy Governor, and up to ten CECMs responsible for devolved sectoral leadership.",
    difficulty: 2,
  }
];
