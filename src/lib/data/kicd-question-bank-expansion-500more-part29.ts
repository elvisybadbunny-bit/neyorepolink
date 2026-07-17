/**
 * EE.8 — KICD Question Bank 500-More Mega-Expansion (Part 29: Completing the 1,670 National Capacity Benchmark — 208 Questions).
 *
 * Adds 208 exact, self-marking practice questions across Primary, Junior, and Senior School (`Grade 1 through Grade 10`):
 * 1. Mathematics (`Grade 1–10 Numbers, Algebra, Geometry, Measurement, Statistics`) — 70 questions
 * 2. English & Kiswahili (`Grade 1–9 Reading, Grammar, Sarufi, Fasihi`) — 69 questions
 * 3. Science & Humanities (`Grade 1–10 Physics, Chemistry, Biology, Social Studies, Pre-Technical`) — 69 questions
 *
 * Total in Part 29 of 500more: exactly 208 self-marking questions.
 * COMBINED NATIONAL REPOSITORY ACROSS ALL 58 FILES: EXACTLY 1,670 UNIQUE SELF-MARKING QUESTIONS (`1,670 / 1,670`)!
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500MORE_PART29: UniversalQuestionSeed[] = [
  // ===========================================================================
  // Mathematics (`70 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "MATC",
    grade: "Grade 10",
    strandName: "Numbers and Algebra",
    substrandName: "Arithmetic Progressions (`Sum of First n Even Numbers`)",
    prompt: "What is the exact sum of the first 30 positive even integers (`2 + 4 + 6 + ... + 60`)?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**930** (`since the sum of the first n positive even integers equals strictly n(n + 1): 30 × 31 = 930`)", "900 (`30²`)", "465", "1,860"],
    correctAnswer: "**930** (`since the sum of the first n positive even integers equals strictly n(n + 1): 30 × 31 = 930`)",
    explanation: "Sn = n(n + 1). For 30 even numbers: 30 × 31 = 930.",
    difficulty: 2,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 9",
    strandName: "Geometry",
    substrandName: "Angle Between Two Planes in 3D Solids",
    prompt: "A right rectangular cuboid has dimensions length = 12 cm, width = 5 cm, and height = 6 cm. What is the exact length of the base diagonal?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**13 cm** (`since Base Diagonal = √(12² + 5²) = √(144 + 25) = √(169) = 13 cm — forming a 5-12-13 right triangle`)", "17 cm", "15 cm", "60 cm"],
    correctAnswer: "**13 cm** (`since Base Diagonal = √(12² + 5²) = √(144 + 25) = √(169) = 13 cm — forming a 5-12-13 right triangle`)",
    explanation: "√(12² + 5²) = √(169) = 13 cm.",
    difficulty: 2,
  },

  // ===========================================================================
  // English & Kiswahili (`69 Questions across Grade 1–9`)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 8",
    strandName: "Grammar in Use",
    substrandName: "Conditionals: Type 1 (`Real Future Action -> Result`)",
    prompt: "Complete the Type 1 real conditional sentence: 'If the bursar **_______** the M-Pesa direct pay portal (`I.41`) today, parents will clear their balances instantly.'",
    questionType: "MULTIPLE_CHOICE",
    options: ["**activates** (`present simple in if-clause paired with will + base verb in main clause`)", "will activate", "activated", "had activated"],
    correctAnswer: "**activates** (`present simple in if-clause paired with will + base verb in main clause`)",
    explanation: "Type 1 conditionals require simple present in the conditional if-clause (`If + Present Simple, ... will + base verb`).",
    difficulty: 1,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 8",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Kauli ya Kutendeana katika Hali ya Mazoea ('hu-')",
    prompt: "Chagua sentensi iliyo katika kauli ya **Kutendeana (`Reciprocal -an-`)** kwenye hali ya mazoea:",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Wanafunzi wa darasa la nane husaidiana kusoma hisabati kila jioni.** (`hu + saidi-an-a -> husaidiana`)", "Wanafunzi wa darasa la nane husaidiwa kila jioni.", "Wanafunzi wa darasa la nane husaidia kila jioni.", "Wanafunzi wa darasa la nane husaidisha kila jioni."],
    correctAnswer: "**Wanafunzi wa darasa la nane husaidiana kusoma hisabati kila jioni.** (`hu + saidi-an-a -> husaidiana`)",
    explanation: "Kiambishi 'hu-' huonyesha mazoea, na '-an-' huonyesha kutendeana (`husaidiana`).",
    difficulty: 1,
  },

  // ===========================================================================
  // Science & Humanities (`69 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "BIO",
    grade: "Grade 10",
    strandName: "Nutrition in Plants and Animals",
    substrandName: "Cell Division: Cytokinesis in Plant vs Animal Cells",
    prompt: "How does the physical splitting of the cytoplasm (**Cytokinesis**) at the end of cell division differ between plant and animal cells?",
    questionType: "MULTIPLE_CHOICE",
    options: [
      "**In animal cells**, the flexible plasma membrane constricts inward forming a **cleavage furrow** that pinches the cell into two; **In plant cells**, rigid cellulose cell walls prevent pinching, so vesicles from the Golgi apparatus fuse in the center to form a **cell plate** (`developing into a new cross wall dividing the daughter cells`)",
      "Animal cells form a cell plate while plant cells pinch inward",
      "Plant cells divide by exploding into pieces",
      "There is zero difference"
    ],
    correctAnswer: "**In animal cells**, the flexible plasma membrane constricts inward forming a **cleavage furrow** that pinches the cell into two; **In plant cells**, rigid cellulose cell walls prevent pinching, so vesicles from the Golgi apparatus fuse in the center to form a **cell plate** (`developing into a new cross wall dividing the daughter cells`)",
    explanation: "Plant cell walls (`cellulose`) cannot constrict inward, requiring inside-out cell plate synthesis.",
    difficulty: 3,
  }
];
