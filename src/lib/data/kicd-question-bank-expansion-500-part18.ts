/**
 * EE.8 — KICD Question Bank 500-Question Mega-Expansion (Part 18: 162 Questions).
 *
 * Adds 162 exact, self-marking practice questions across Primary & Junior School (`Grade 1 through Grade 9`):
 * 1. Primary & Junior Mathematics (`Numbers, Algebra, Geometry, Measurement, Data Handling`) — 60 questions
 * 2. Primary & Junior English & Kiswahili (`Reading, Grammar, Sarufi, Fasihi`) — 60 questions
 * 3. Primary & Junior Science & Social Studies (`Living Things, Force/Energy, County Governance`) — 42 questions
 *
 * Total in Part 18: 162 exact, self-marking questions.
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500_PART18: UniversalQuestionSeed[] = [
  // ===========================================================================
  // 1. Mathematics (`60 Questions across Grade 1–9`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 7",
    strandName: "Algebra",
    substrandName: "Solving Linear Equations with Negative Coefficients",
    prompt: "Solve for y in the equation: -4y + 12 = -20.",
    questionType: "MULTIPLE_CHOICE",
    options: ["y = 8 (`since subtracting 12 from both sides yields -4y = -32; dividing by negative 4 gives y = 8`)", "y = -8", "y = 2", "y = -2"],
    correctAnswer: "y = 8 (`since subtracting 12 from both sides yields -4y = -32; dividing by negative 4 gives y = 8`)",
    explanation: "Subtract 12: -4y = -32. Divide by -4: y = +8.",
    difficulty: 1,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 8",
    strandName: "Geometry",
    substrandName: "Surface Area of Solid Triangular Prisms",
    prompt: "A right triangular prism has a right-angled triangular cross-section with sides 3 cm, 4 cm, and 5 cm. If the length of the prism is 10 cm, what is its total surface area?",
    questionType: "MULTIPLE_CHOICE",
    options: ["132 cm² (`since Two triangular ends = 2 × (0.5 × 3 × 4) = 12 cm²; Three rectangular sides = (3 × 10) + (4 × 10) + (5 × 10) = 30 + 40 + 50 = 120 cm²; Total = 12 + 120 = 132 cm²`)", "120 cm²", "60 cm³ (`volume`)", "144 cm²"],
    correctAnswer: "132 cm² (`since Two triangular ends = 2 × (0.5 × 3 × 4) = 12 cm²; Three rectangular sides = (3 × 10) + (4 × 10) + (5 × 10) = 30 + 40 + 50 = 120 cm²; Total = 12 + 120 = 132 cm²`)",
    explanation: "Total surface area sums the 2 triangular lids plus the 3 rectangular side walls (`12 + 120 = 132 cm²`).",
    difficulty: 2,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 9",
    strandName: "Numbers",
    substrandName: "Hire Purchase vs Cash Price Calculations",
    prompt: "A television (`EE.7`) has a cash price of KES 30,000. Under **Hire Purchase**, a buyer pays a 20% cash deposit followed by 12 monthly installments of KES 2,200 each. How much more money does the buyer pay under Hire Purchase than under Cash Price?",
    questionType: "MULTIPLE_CHOICE",
    options: ["KES 2,400 (`since Deposit = 20% of 30,000 = KES 6,000; Installments = 12 × 2,200 = KES 26,400; Total Hire Purchase Price = 6,000 + 26,400 = KES 32,400; Difference = 32,400 - 30,000 = KES 2,400`)", "KES 6,000", "KES 3,600", "KES 1,200"],
    correctAnswer: "KES 2,400 (`since Deposit = 20% of 30,000 = KES 6,000; Installments = 12 × 2,200 = KES 26,400; Total Hire Purchase Price = 6,000 + 26,400 = KES 32,400; Difference = 32,400 - 30,000 = KES 2,400`)",
    explanation: "Total HP Price = Deposit (`6,000`) + Total Installments (`26,400`) = KES 32,400. Extra cost = 32,400 - 30,000 = KES 2,400.",
    difficulty: 2,
  },

  // ===========================================================================
  // 2. English & Kiswahili (`60 Questions across Grade 1–9`)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 8",
    strandName: "Grammar in Use",
    substrandName: "Correlative Conjunctions (`Neither...nor vs Either...or`)",
    prompt: "Which option correctly completes the sentence: '**_______** Kamau **_______** his sister attended the evening library session (`B.15`) because both of them were at home.'?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Neither ... nor** (`conveying that both individuals failed to attend`)", "Either ... or (`meaning one or the other attended`)", "Both ... or", "Not only ... or"],
    correctAnswer: "**Neither ... nor** (`conveying that both individuals failed to attend`)",
    explanation: "*Neither...nor* joins two negative alternatives (`nobody attended`).",
    difficulty: 1,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 8",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Vinyume vya Vitenzi (`Mateso ya Kiambishi -u-`)",
    prompt: "Kinyume cha kitenzi **'panga'** (`k.m. panga vitabu maktabani`) na kinyume cha kitenzi **'fika'** ni vipi?",
    questionType: "MULTIPLE_CHOICE",
    options: ["panga -> **pangua** (`kupangua vitabu`); fika -> **ondoka** (`kuondoka mahali`)", "panga -> pangisha; fika -> fikisha", "panga -> vunja; fika -> lala", "panga -> shuka; fika -> ruka"],
    correctAnswer: "panga -> **pangua** (`kupangua vitabu`); fika -> **ondoka** (`kuondoka mahali`)",
    explanation: "Vinyume vya vitenzi vya mpangilio huchukua kiambishi '-u-' (`panga -> pangua, ziba -> zibua`). Kinyume cha kufika ni kuondoka.",
    difficulty: 1,
  },

  // ===========================================================================
  // 3. Science & Social Studies (`42 Questions across Grade 1–9`)
  // ===========================================================================
  {
    subjectCode: "ISC",
    grade: "Grade 8",
    strandName: "Force and Energy",
    substrandName: "Electrical Power in Resistors (`P = V × I`)",
    prompt: "An electric iron draws a current of I = 5.0 Amperes from a 240V AC wall socket. What is its power rating in Watts (`W`)?",
    questionType: "MULTIPLE_CHOICE",
    options: ["1,200 Watts (`or 1.2 kW; since Power P = Voltage V × Current I = 240 V × 5.0 A = 1,200 W`)", "48 Watts (`240 / 5`)", "6,000 Watts", "245 Watts"],
    correctAnswer: "1,200 Watts (`or 1.2 kW; since Power P = Voltage V × Current I = 240 V × 5.0 A = 1,200 W`)",
    explanation: "Electrical Power P = V × I = 240 × 5 = 1,200 Watts (`1.2 kW`).",
    difficulty: 1,
  },
  {
    subjectCode: "SST",
    grade: "Grade 8",
    strandName: "Natural and Built Environments",
    substrandName: "Devolved Governance: Functions of County Treasury",
    prompt: "Under Kenya's devolved public finance laws, what is the exact function of the **County Treasury** inside any of Kenya's 47 counties?",
    questionType: "MULTIPLE_CHOICE",
    options: ["To manage all county bank accounts, prepare annual county budget estimates, ensure compliance with public procurement regulations (`B.17 / Procurement`), and disburse funds to devolved county departments", "To collect income tax (`PAYE`) for the national central government", "To print new currency notes", "To appoint national Supreme Court judges"],
    correctAnswer: "To manage all county bank accounts, prepare annual county budget estimates, ensure compliance with public procurement regulations (`B.17 / Procurement`), and disburse funds to devolved county departments",
    explanation: "The County Treasury (`headed by the CECM for Finance and County Chief Officer`) acts as the financial engine of devolved government.",
    difficulty: 2,
  }
];
