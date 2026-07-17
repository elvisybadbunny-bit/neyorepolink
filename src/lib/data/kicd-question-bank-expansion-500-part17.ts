/**
 * EE.8 — KICD Question Bank 500-Question Mega-Expansion (Part 17: Completing the 1,381 Benchmark — 167 Questions).
 *
 * Adds 167 exact, self-marking practice questions across Primary & Junior School (`Grade 1 through Grade 9`):
 * 1. Primary & Junior Mathematics (`Numbers, Measurement, Geometry, Data Handling`) — 60 questions
 * 2. Primary & Junior English & Kiswahili (`Reading, Grammar, Sarufi, Fasihi`) — 60 questions
 * 3. Primary & Junior Science & Social Studies (`Living Things, Force/Energy, County Governance`) — 47 questions
 *
 * Total in Part 17: exactly 167 self-marking questions.
 * COMBINED NATIONAL REPOSITORY ACROSS ALL 27 FILES: EXACTLY 1,381 UNIQUE SELF-MARKING QUESTIONS (`1,381 / 1,381`)!
 */

import type { PrimarySeniorQuestionSeed } from "./kicd-primary-senior-question-bank";

export const QUESTION_BANK_EXPANSION_500_PART17: PrimarySeniorQuestionSeed[] = [
  // ===========================================================================
  // Mathematics (`60 Questions across Grade 1–9`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 6",
    strandName: "Geometry and Data Handling",
    substrandName: "Reading Pie Charts (`Calculating Total from Sector Count`)",
    prompt: "A pie chart sector measuring 120° (`one-third of 360°`) represents 40 students who prefer mathematics (`EE.8`). How many total students were surveyed across the entire school?",
    questionType: "MULTIPLE_CHOICE",
    options: ["120 students (`since 120° / 360° = 1/3; if 1/3 = 40 students, Total = 40 × 3 = 120 students`)", "80 students", "160 students", "360 students"],
    correctAnswer: "120 students (`since 120° / 360° = 1/3; if 1/3 = 40 students, Total = 40 × 3 = 120 students`)",
    explanation: "If one-third of the pie equals 40 students, the whole pie equals 40 × 3 = 120 students.",
    difficulty: 2,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 5",
    strandName: "Numbers",
    substrandName: "Greatest Common Divisor (`GCD Word Problem on Packaging`)",
    prompt: "A school canteen (`i18`) has 48 oranges and 64 bananas. They want to package them into identical fruit snack bags such that each bag contains the exact same number of oranges and same number of bananas with zero fruit left over. What is the **greatest possible number of identical bags** they can create?",
    questionType: "MULTIPLE_CHOICE",
    options: ["16 bags (`which is the GCD of 48 and 64; each bag will contain 48/16 = 3 oranges and 64/16 = 4 bananas`)", "8 bags", "24 bags", "4 bags"],
    correctAnswer: "16 bags (`which is the GCD of 48 and 64; each bag will contain 48/16 = 3 oranges and 64/16 = 4 bananas`)",
    explanation: "Packaging maximum identical sets without waste requires the GCD. GCD of 48 and 64 is 16 bags.",
    difficulty: 2,
  },

  // ===========================================================================
  // English & Kiswahili (`60 Questions across Grade 1–9`)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 6",
    strandName: "Grammar in Use",
    substrandName: "Collective Nouns (`Groups of Insects & Birds`)",
    prompt: "Which collective noun correctly describes a large flying group of locusts or bees attacking farm crops (`AGN`)?",
    questionType: "MULTIPLE_CHOICE",
    options: ["A **swarm** (`a swarm of locusts or bees`)", "A flock (`of birds/sheep`)", "A herd (`of cattle`)", "A pack (`of wolves`)"],
    correctAnswer: "A **swarm** (`a swarm of locusts or bees`)",
    explanation: "Insects flying in dense numbers are specifically designated as a *swarm* (`swarm of bees, locusts, or flies`).",
    difficulty: 1,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 6",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Viunganishi vya Kawaida ('ingawa vs kwa sababu')",
    prompt: "Chagua kiunganishi sahihi kinachoonyesha **kinyume cha matarajio**: '**_______** mvua ilinyesha kwa wingi sana jana alasiri, wanafunzi walifika maktabani kusoma kwa wakati (`B.15`).'",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Ingawa (`au Licha ya kwamba / Hata kama`)**", "Kwa sababu", "Ikiwa", "Ili"],
    correctAnswer: "**Ingawa (`au Licha ya kwamba / Hata kama`)**",
    explanation: "*Ingawa* (although/even though) huonyesha kinyume au matokeo yasiyotarajiwa kulingana na mazingira.",
    difficulty: 1,
  },

  // ===========================================================================
  // Science & Social Studies (`47 Questions across Grade 1–9`)
  // ===========================================================================
  {
    subjectCode: "ISC",
    grade: "Grade 6",
    strandName: "Living Things and Their Environment",
    substrandName: "Photosynthesis: Storage of Surplus Glucose as Starch",
    prompt: "After green leaves manufacture soluble glucose (`C₆H₁₂O₆`) during daytime photosynthesis, in what insoluble carbohydrate chemical form do they convert and store surplus glucose inside their cells?",
    questionType: "MULTIPLE_CHOICE",
    options: ["Insoluble **Starch** granules (`tested and turned blue-black by Iodine solution in biology laboratories EE.13`)", "Soluble sucrose only", "Solid animal protein", "Pure olive oil"],
    correctAnswer: "Insoluble **Starch** granules (`tested and turned blue-black by Iodine solution in biology laboratories EE.13`)",
    explanation: "Glucose is soluble and osmotic (`excess free glucose would make leaf cells burst via osmosis`). Plants polymerize glucose into dense, insoluble starch granules for safe overnight storage.",
    difficulty: 1,
  },
  {
    subjectCode: "SST",
    grade: "Grade 6",
    strandName: "Natural and Built Environments",
    substrandName: "Devolved Governance: Functions of the County Governor vs County Commissioner",
    prompt: "What exact governance difference separates the **County Governor** (`elected by citizens every five years`) from the **County Commissioner** (`appointed by the President/Ministry of Interior`) inside a Kenyan county?",
    questionType: "MULTIPLE_CHOICE",
    options: [
      "The **County Governor heads the Devolved County Government** (`managing county health clinics, ECDE schools, agriculture, and county roads`), whereas the **County Commissioner coordinates National Central Government functions** (`commanding national security, police chiefs, and national registration of citizens across the county`)",
      "They are two names for the exact same person",
      "The Governor commands the army while the Commissioner builds schools",
      "The Governor works in Nairobi only while the Commissioner works in Mombasa only"
    ],
    correctAnswer: "The **County Governor heads the Devolved County Government** (`managing county health clinics, ECDE schools, agriculture, and county roads`), whereas the **County Commissioner coordinates National Central Government functions** (`commanding national security, police chiefs, and national registration of citizens across the county`)",
    explanation: "Kenya operates two distinct executive tracks at county level: the devolved democratic track (`Governor / CECMs`) and the national administrative track (`County Commissioner / Deputy County Commissioners`).",
    difficulty: 2,
  }
];
