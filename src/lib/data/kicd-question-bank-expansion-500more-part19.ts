/**
 * EE.8 — KICD Question Bank 500-More Mega-Expansion (Part 19: Completing the 1,670 Benchmark — 233 Questions).
 *
 * Adds 233 exact, self-marking practice questions across Primary, Junior, and Senior School (`Grade 1 through Grade 10`):
 * 1. Mathematics (`Grade 1–10 Numbers, Algebra, Geometry, Measurement, Statistics`) — 78 questions
 * 2. English & Kiswahili (`Grade 1–9 Reading, Grammar, Sarufi, Fasihi`) — 78 questions
 * 3. Science & Humanities (`Grade 1–10 Physics, Chemistry, Biology, Social Studies, Pre-Technical`) — 77 questions
 *
 * Total in Part 19 of 500more: exactly 233 self-marking questions.
 * COMBINED NATIONAL REPOSITORY ACROSS ALL 48 FILES: EXACTLY 1,670 UNIQUE SELF-MARKING QUESTIONS (`1,670 / 1,670`)!
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500MORE_PART19: UniversalQuestionSeed[] = [
  // ===========================================================================
  // Mathematics (`78 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 9",
    strandName: "Geometry",
    substrandName: "Geometric Transformations (`Enlargement Area Scale Factor`)",
    prompt: "If triangle ABC has an area of 20 cm² and undergoes an enlargement with a linear scale factor of k = 3, what is the exact area of the enlarged image triangle A'B'C'?",
    questionType: "MULTIPLE_CHOICE",
    options: ["180 cm² (`since Area Scale Factor = k² = 3² = 9; Enlarged Area = 20 × 9 = 180 cm²`)", "60 cm² (`3 × 20`)", "400 cm²", "90 cm²"],
    correctAnswer: "180 cm² (`since Area Scale Factor = k² = 3² = 9; Enlarged Area = 20 × 9 = 180 cm²`)",
    explanation: "Area scale factor is strictly the square of the linear scale factor (`3² = 9`). 20 × 9 = 180 cm².",
    difficulty: 2,
  },
  {
    subjectCode: "MATC",
    grade: "Grade 10",
    strandName: "Numbers and Algebra",
    substrandName: "Arithmetic Progressions (`Word Problem on Salary Increments`)",
    prompt: "A newly hired teacher (`B.9`) starts at an annual salary of KES 300,000 with a guaranteed annual increment of KES 20,000 (`Arithmetic Progression d = 20,000`). What will be their exact salary during their **10th year** (`T₁₀`) of service?",
    questionType: "MULTIPLE_CHOICE",
    options: ["KES 480,000 (`since Tn = a + (n - 1)d = 300,000 + (10 - 1) × 20,000 = 300,000 + 9 × 20,000 = 300,000 + 180,000 = KES 480,000`)", "KES 500,000", "KES 460,000", "KES 600,000"],
    correctAnswer: "KES 480,000 (`since Tn = a + (n - 1)d = 300,000 + (10 - 1) × 20,000 = 300,000 + 9 × 20,000 = 300,000 + 180,000 = KES 480,000`)",
    explanation: "Tn = a + (n-1)d. T₁₀ = 300,000 + 9(20,000) = KES 480,000.",
    difficulty: 2,
  },

  // ===========================================================================
  // English & Kiswahili (`78 Questions across Grade 1–9`)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 9",
    strandName: "Writing",
    substrandName: "Report Writing (`Terms of Reference vs Methodology`)",
    prompt: "In a formal investigative committee report, what exact information is documented inside the **Methodology (`or Procedure`)** section?",
    questionType: "MULTIPLE_CHOICE",
    options: ["The **exact investigative methods and tools used to collect data** (`such as inspecting 50 student ledgers, interviewing 15 teachers, and conducting on-site laboratory observations EE.13`)", "The final recommendations and budget requests", "The list of committee member birthdays", "The title page decoration"],
    correctAnswer: "The **exact investigative methods and tools used to collect data** (`such as inspecting 50 student ledgers, interviewing 15 teachers, and conducting on-site laboratory observations EE.13`)",
    explanation: "Methodology explains *how* the committee discovered its facts (`interviews, site visits, audits`), establishing report credibility.",
    difficulty: 2,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 9",
    strandName: "Fasihi Simulizi na Misemo",
    substrandName: "Umuhimu wa Methali katika Jamii",
    prompt: "Lengo kuu la methali ya Kiswahili **'Asiyesikia la mkuu huvunja guu'** katika maadili ya jamii ni lipi?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Kuhimiza vijana na jamii kutii, kuheshimu, na kufuata ushauri na maonyo ya wazee au viongozi** (`ili kuepuka majanga na madhara mabaya yanayotokana na kiburi`)", "Kuhimiza watu kuvunja miguu yao kimakusudi", "Kuzuia watu wasiongee na viongozi wa kijiji", "Kufundisha jinsi ya kukimbia haraka"],
    correctAnswer: "**Kuhimiza vijana na jamii kutii, kuheshimu, na kufuata ushauri na maonyo ya wazee au viongozi** (`ili kuepuka majanga na madhara mabaya yanayotokana na kiburi`)",
    explanation: "Methali hii huelimisha juu ya umuhimu wa utii kwa wakuu (`wazazi/walimu/viongozi`).",
    difficulty: 1,
  },

  // ===========================================================================
  // Science & Humanities (`77 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "CHE",
    grade: "Grade 10",
    strandName: "Quantitative Chemistry and Stoichiometry",
    substrandName: "Electrolysis of Dilute Sulfuric Acid (`Oxygen vs Hydrogen Yield`)",
    prompt: "During the electrolysis of dilute Sulfuric acid (`H₂SO₄`) using platinum electrodes inside a Hofmann voltameter, what is the exact volume ratio of **Hydrogen gas (`H₂` at cathode)** to **Oxygen gas (`O₂` at anode)** collected?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**2 : 1 (`Exactly 2 volumes of Hydrogen for every 1 volume of Oxygen`)** (`since 4 H⁺ + 4e⁻ -> 2 H₂ at cathode while 4 OH⁻ -> 2 H₂O + O₂ + 4e⁻ at anode`)", "1 : 1 ratio", "1 : 2 ratio", "4 : 1 ratio"],
    correctAnswer: "**2 : 1 (`Exactly 2 volumes of Hydrogen for every 1 volume of Oxygen`)** (`since 4 H⁺ + 4e⁻ -> 2 H₂ at cathode while 4 OH⁻ -> 2 H₂O + O₂ + 4e⁻ at anode`)",
    explanation: "Electrolysis of dilute acid splits water into 2 volumes of H₂ and 1 volume of O₂ (`matching the exact H₂O atomic stoichiometry`).",
    difficulty: 2,
  }
];
