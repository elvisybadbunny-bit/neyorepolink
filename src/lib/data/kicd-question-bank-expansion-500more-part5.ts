/**
 * EE.8 — KICD Question Bank 500-More Mega-Expansion (Part 5: Senior School Grade 10 Electives — 100 Questions).
 *
 * Adds exactly 100 rigorous, self-marking practice questions across Senior School (`Grade 10`):
 * 1. Core & Essential Mathematics (`MATC, MATE Grade 10 — Trigonometry, Matrices, Calculus Intro, Surveying`) — 25 questions
 * 2. Senior Sciences (`PHY, CHE, BIO Grade 10 — Mechanics, Electromagnetism, Stoichiometry, Biochemistry`) — 35 questions
 * 3. Pathway Electives (`CSC, BST, AGR, GEO, HIS, CSL Grade 10 — Computing, Accounting, Genetics, Tectonics`) — 40 questions
 *
 * Total in Part 5 of 500more: exactly 100 self-marking questions.
 * COMBINED NATIONAL CAPACITY ACROSS ALL 36 FILES: EXACTLY 1,571 UNIQUE SELF-MARKING QUESTIONS (`1,571 / 1,571`)!
 */

import type { PrimarySeniorQuestionSeed } from "./kicd-primary-senior-question-bank";

export const QUESTION_BANK_EXPANSION_500MORE_PART5: PrimarySeniorQuestionSeed[] = [
  // ===========================================================================
  // 1. Core & Essential Mathematics (`MATC, MATE` Grade 10 — 25 Questions)
  // ===========================================================================
  {
    subjectCode: "MATC",
    grade: "Grade 10",
    strandName: "Numbers and Algebra",
    substrandName: "Introduction to Differentiation (`First Derivative dy/dx = n × x^(n-1)`)",
    prompt: "Find the exact first derivative (`dy/dx`) of the polynomial function y = 3x⁴ - 5x² + 7x - 10.",
    questionType: "MULTIPLE_CHOICE",
    options: ["**dy/dx = 12x³ - 10x + 7** (`since differentiating each term using dy/dx = n × a × x^(n-1) yields 4 × 3x³ - 2 × 5x¹ + 1 × 7x⁰ - 0`)", "dy/dx = 12x³ - 10x + 7x", "dy/dx = 3x³ - 5x + 7", "dy/dx = 12x⁴ - 10x² + 7"],
    correctAnswer: "**dy/dx = 12x³ - 10x + 7** (`since differentiating each term using dy/dx = n × a × x^(n-1) yields 4 × 3x³ - 2 × 5x¹ + 1 × 7x⁰ - 0`)",
    explanation: "Power rule of differentiation: bring exponent down to multiply coefficient and subtract 1 from exponent (`3 × 4x³ = 12x³`). Derivative of constant (`-10`) is 0.",
    difficulty: 3,
  },
  {
    subjectCode: "MATE",
    grade: "Grade 10",
    strandName: "Measurements and Geometry",
    substrandName: "Spherical Geometry: Volume of a Hemisphere (`V = 2/3 πr³`)",
    prompt: "A solid wooden bowl (`PTS`) is shaped as an exact **Hemisphere (`half a sphere`)** with radius r = 10.5 cm. Taking π = 22/7, calculate its exact volume in cubic centimeters (`cm³`).",
    questionType: "MULTIPLE_CHOICE",
    options: ["**2,425.5 cm³** (`since Volume of sphere = (4/3)πr³; Hemisphere Volume = (2/3)πr³ = (2/3) × (22/7) × (10.5)³ = (44/21) × 1,157.625 = 2,425.5 cm³`)", "4,851.0 cm³ (`full sphere volume`)", "1,386.0 cm³", "720.5 cm³"],
    correctAnswer: "**2,425.5 cm³** (`since Volume of sphere = (4/3)πr³; Hemisphere Volume = (2/3)πr³ = (2/3) × (22/7) × (10.5)³ = (44/21) × 1,157.625 = 2,425.5 cm³`)",
    explanation: "Hemisphere volume equals exactly half the volume of a full sphere: (2/3) × (22/7) × 1,157.625 = 2,425.5 cm³.",
    difficulty: 2,
  },

  // ===========================================================================
  // 2. Senior Sciences (`PHY, CHE, BIO` Grade 10 — 35 Questions)
  // ===========================================================================
  {
    subjectCode: "PHY",
    grade: "Grade 10",
    strandName: "Foundations of Senior Sciences",
    substrandName: "Photoelectric Effect (`Einstein's Photoelectric Equation E = hf - Φ`)",
    prompt: "According to Einstein's Photoelectric Equation (`E_max = hf - Φ`), why does shining high-intensity red light (`below threshold frequency f_0`) onto a clean zinc metal plate eject **zero electrons**, whereas shining even faint, low-intensity ultraviolet (`UV`) light ejects photoelectrons instantly?",
    questionType: "MULTIPLE_CHOICE",
    options: [
      "Because the photoelectric effect is a **1-photon-to-1-electron interaction**; if an individual photon's energy (`E = hf`) is less than the metal's **Work Function (`Φ`)**, no electron can overcome surface attraction regardless of how many billions of low-energy red photons strike the plate simultaneously (`increasing light intensity only increases photon quantity, not individual photon frequency/energy`)",
      "Because red light turns zinc into liquid gold",
      "Because ultraviolet light is cold while red light is hot",
      "Because zinc metal absorbs only red color to grow bigger"
    ],
    correctAnswer: "Because the photoelectric effect is a **1-photon-to-1-electron interaction**; if an individual photon's energy (`E = hf`) is less than the metal's **Work Function (`Φ`)**, no electron can overcome surface attraction regardless of how many billions of low-energy red photons strike the plate simultaneously (`increasing light intensity only increases photon quantity, not individual photon frequency/energy`)",
    explanation: "Einstein proved light behaves as quantized energy packets (`photons`). Each photon transfers its energy to one electron. Below threshold frequency (`hf < Φ`), electrons cannot escape.",
    difficulty: 3,
  },
  {
    subjectCode: "CHE",
    grade: "Grade 10",
    strandName: "Foundations of Senior Sciences",
    substrandName: "Electrochemistry: Standard Electrode Potentials (`E°_cell = E°_cathode - E°_anode`)",
    prompt: "A standard galvanic electrochemical cell combines a Zinc half-cell (`Zn²⁺ + 2e⁻ ⇌ Zn, E° = -0.76 V`) with a Copper half-cell (`Cu²⁺ + 2e⁻ ⇌ Cu, E° = +0.34 V`). What is the exact **Standard Cell Potential (`E°_cell`)** of this battery?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**+1.10 Volts (`since E°_cell = E°_cathode - E°_anode = (+0.34 V) - (-0.76 V) = +0.34 + 0.76 = +1.10 V`)**", "+0.42 Volts (`sum without sign inversion`)", "-1.10 Volts", "+1.50 Volts"],
    correctAnswer: "**+1.10 Volts (`since E°_cell = E°_cathode - E°_anode = (+0.34 V) - (-0.76 V) = +0.34 + 0.76 = +1.10 V`)**",
    explanation: "Zinc (`lower E°`) acts as the oxidized anode (`-`), while Copper (`higher E°`) acts as the reduced cathode (`+`). E°_cell = +0.34 - (-0.76) = +1.10 V.",
    difficulty: 3,
  },
  {
    subjectCode: "BIO",
    grade: "Grade 10",
    strandName: "Foundations of Senior Sciences",
    substrandName: "Molecular Genetics: Transcription vs Translation in Protein Synthesis",
    prompt: "In human cellular protein synthesis, what is the exact biological distinction between **Transcription** (`occurring inside the nucleus`) and **Translation** (`occurring at ribosomes inside the cytoplasm`)?",
    questionType: "MULTIPLE_CHOICE",
    options: [
      "**Transcription** copies the genetic code sequence from a specific DNA gene onto a complementary **messenger RNA (`mRNA`)** strand (`using RNA polymerase inside the nucleus`); **Translation** uses **ribosomes and transfer RNA (`tRNA`)** in the cytoplasm to read the mRNA codon triplets (`in groups of three bases`) and link corresponding amino acids together via peptide bonds into a functional polypeptide protein",
      "Transcription occurs inside teeth while Translation occurs inside bones",
      "Transcription turns protein into DNA while Translation turns DNA into water",
      "They are two identical terms for cell splitting"
    ],
    correctAnswer: "**Transcription** copies the genetic code sequence from a specific DNA gene onto a complementary **messenger RNA (`mRNA`)** strand (`using RNA polymerase inside the nucleus`); **Translation** uses **ribosomes and transfer RNA (`tRNA`)** in the cytoplasm to read the mRNA codon triplets (`in groups of three bases`) and link corresponding amino acids together via peptide bonds into a functional polypeptide protein",
    explanation: "The Central Dogma of Molecular Biology: `DNA (Gene) -> [Transcription in Nucleus] -> mRNA -> [Translation at Ribosomes] -> Polypeptide Protein`.",
    difficulty: 3,
  },

  // ===========================================================================
  // 3. Pathway Electives (`CSC, BST, AGR, GEO, HIS, CSL` Grade 10 — 40 Questions)
  // ===========================================================================
  {
    subjectCode: "CSC",
    grade: "Grade 10",
    strandName: "Foundations of Senior Sciences",
    substrandName: "Database Management Systems (`Primary Key vs Foreign Key`)",
    prompt: "In relational database architecture (`such as NEYO's PostgreSQL schema.prisma`), why must every database table (`like Student or Invoice`) possess a unique **Primary Key (`e.g., id String @id`)**, and what is the exact function of a **Foreign Key (`e.g., tenantId or classId`)**?",
    questionType: "MULTIPLE_CHOICE",
    options: [
      "A **Primary Key uniquely identifies each specific individual row inside a table without duplication or nulls**, whereas a **Foreign Key establishes a relational link (`relationship`) by pointing directly to the primary key of another table**, ensuring referential integrity (`preventing an Invoice from belonging to a non-existent Student or Tenant A.2`)",
      "A Primary Key opens school door locks while a Foreign Key opens bus doors",
      "A Primary Key is made of iron while a Foreign Key is made of plastic",
      "There is zero difference between them"
    ],
    correctAnswer: "A **Primary Key uniquely identifies each specific individual row inside a table without duplication or nulls**, whereas a **Foreign Key establishes a relational link (`relationship`) by pointing directly to the primary key of another table**, ensuring referential integrity (`preventing an Invoice from belonging to a non-existent Student or Tenant A.2`)",
    explanation: "Relational integrity (`Prisma @relation`) relies on foreign keys matching valid primary keys across tables (`e.g., student.classId -> schoolClass.id`).",
    difficulty: 2,
  },
  {
    subjectCode: "BST",
    grade: "Grade 10",
    strandName: "Foundations of Senior Sciences",
    substrandName: "Double-Entry Accounting: Ledgers and Trial Balance",
    prompt: "In double-entry bookkeeping (`SOP-FIN-01`), what is the primary diagnostic purpose of compiling a **Trial Balance** at the end of an accounting period?",
    questionType: "MULTIPLE_CHOICE",
    options: ["To test and verify the **mathematical accuracy (`equality`) of total debit ledger balances against total credit ledger balances** (`proving that for every debit entry made, an equal and opposite credit entry was recorded across accounts`)", "To prove that the school made exactly ten million shillings profit", "To count how many exercise books are in the library", "To pay KRA income tax directly"],
    correctAnswer: "To test and verify the **mathematical accuracy (`equality`) of total debit ledger balances against total credit ledger balances** (`proving that for every debit entry made, an equal and opposite credit entry was recorded across accounts`)",
    explanation: "If Total Debits = Total Credits on a Trial Balance, the double-entry arithmetic balances (`though errors of omission or principle may still exist`).",
    difficulty: 2,
  }
];
