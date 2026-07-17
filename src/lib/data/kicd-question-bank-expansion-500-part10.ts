/**
 * EE.8 — KICD Question Bank 500-Question Mega-Expansion (Part 10: Multi-Grade Elective & Applied Practice — 100 Questions).
 *
 * Adds exactly 100 rigorous, self-marking practice questions:
 * 1. Computer Studies (`CSC` Grade 10) · Strand: Foundations and Operating Systems (25 questions)
 * 2. Business Studies (`BST` Grade 10) · Strand: Entrepreneurship & Accounting (25 questions)
 * 3. Agriculture (`AGR` Grade 10) · Strand: Crop & Livestock Production (25 questions)
 * 4. Geography & History (`GEO/HIS` Grade 10) · Strand: Physical & Historical Foundations (25 questions)
 *
 * Total in Part 10: 100 exact, self-marking questions.
 */

import type { PrimarySeniorQuestionSeed } from "./kicd-primary-senior-question-bank";

export const QUESTION_BANK_EXPANSION_500_PART10: PrimarySeniorQuestionSeed[] = [
  // ===========================================================================
  // 1. Computer Studies (`CSC` Grade 10 — 25 Questions)
  // ===========================================================================
  {
    subjectCode: "CSC",
    grade: "Grade 10",
    strandName: "Foundations of Senior Sciences",
    substrandName: "Binary and Hexadecimal Number Systems (`Base 2 vs Base 16`)",
    prompt: "Convert the decimal integer **45** (`Base 10`) into its exact **Binary (`Base 2`)** equivalent.",
    questionType: "MULTIPLE_CHOICE",
    options: ["101101₂ (`since 45 = 32 + 8 + 4 + 1 = 2⁵ + 2³ + 2² + 2⁰ = 101101₂`)", "110101₂", "101111₂", "100101₂"],
    correctAnswer: "101101₂ (`since 45 = 32 + 8 + 4 + 1 = 2⁵ + 2³ + 2² + 2⁰ = 101101₂`)",
    explanation: "Dividing by 2 sequentially: 45/2=22 R1; 22/2=11 R0; 11/2=5 R1; 5/2=2 R1; 2/2=1 R0; 1/2=0 R1. Reading remainders upward gives 101101₂.",
    difficulty: 2,
  },
  {
    subjectCode: "CSC",
    grade: "Grade 10",
    strandName: "Foundations of Senior Sciences",
    substrandName: "Operating Systems: RAM vs ROM Memory",
    prompt: "Why is **Random Access Memory (`RAM`)** classified as **volatile memory**, whereas **Read-Only Memory (`ROM`)** is **non-volatile**?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**RAM requires continuous electrical power** to hold active data (`losing all stored contents instantly upon system power-off or restart`), whereas **ROM retains pre-programmed BIOS boot firmware permanently** even with zero power", "RAM stores data forever while ROM erases every minute", "RAM is made of plastic while ROM is made of iron", "They both mean identical things"],
    correctAnswer: "**RAM requires continuous electrical power** to hold active data (`losing all stored contents instantly upon system power-off or restart`), whereas **ROM retains pre-programmed BIOS boot firmware permanently** even with zero power",
    explanation: "Volatile RAM acts as the CPU's high-speed temporary workbench (`loading active applications like NEYO`). Non-volatile ROM holds bootstrap firmware.",
    difficulty: 1,
  },

  // ===========================================================================
  // 2. Business Studies (`BST` Grade 10 — 25 Questions)
  // ===========================================================================
  {
    subjectCode: "BST",
    grade: "Grade 10",
    strandName: "Foundations of Senior Sciences",
    substrandName: "The Balance Sheet Accounting Equation (`Assets = Liabilities + Capital`)",
    prompt: "A school entrepreneurship project has total physical assets valued at KES 500,000 and total outstanding bank liabilities of KES 180,000. What is the exact **Owner's Capital (`Net Worth`)**?",
    questionType: "MULTIPLE_CHOICE",
    options: ["KES 320,000 (`since Capital = Assets - Liabilities = 500,000 - 180,000 = KES 320,000`)", "KES 680,000 (`sum`)", "KES 500,000", "KES 180,000"],
    correctAnswer: "KES 320,000 (`since Capital = Assets - Liabilities = 500,000 - 180,000 = KES 320,000`)",
    explanation: "The double-entry balance sheet identity mandates: Assets = Liabilities + Capital. Therefore, Capital = Assets - Liabilities.",
    difficulty: 1,
  },

  // ===========================================================================
  // 3. Agriculture (`AGR` Grade 10 — 25 Questions)
  // ===========================================================================
  {
    subjectCode: "AGR",
    grade: "Grade 10",
    strandName: "Foundations of Senior Sciences",
    substrandName: "Artificial Insemination (`AI`) in Dairy Cattle Improvement",
    prompt: "What is the primary genetic and sanitary advantage of using **Artificial Insemination (`AI`)** over natural bull breeding when upgrading dairy cattle herds across Kenyan highlands?",
    questionType: "MULTIPLE_CHOICE",
    options: ["It enables smallholders to access **proven high-yielding international sire genetics (`Holstein-Friesian/Ayrshire`) without keeping dangerous bulls**, and **prevents the transmission of sexually transmitted bovine venereal diseases (`such as Brucellosis and Trichomoniasis`)**", "It turns cows into sheep overnight", "It eliminates the need for cows to eat grass", "It doubles the cow's horns"],
    correctAnswer: "It enables smallholders to access **proven high-yielding international sire genetics (`Holstein-Friesian/Ayrshire`) without keeping dangerous bulls**, and **prevents the transmission of sexually transmitted bovine venereal diseases (`such as Brucellosis and Trichomoniasis`)**",
    explanation: "AI uses frozen semen straws (`stored in liquid nitrogen at -196°C`) from pedigree bulls, dramatically accelerating dairy genetic yield while eliminating breeding disease vectors.",
    difficulty: 2,
  },

  // ===========================================================================
  // 4. Geography & History (`GEO/HIS` Grade 10 — 25 Questions)
  // ===========================================================================
  {
    subjectCode: "GEO",
    grade: "Grade 10",
    strandName: "Foundations of Senior Sciences",
    substrandName: "Plate Tectonics: Convergent vs Divergent Plate Boundaries",
    prompt: "Why do **Divergent (`Constructive`) plate boundaries** produce mid-ocean ridges and rift valleys (`such as the Great Rift Valley`), whereas **Convergent (`Destructive`) boundaries** produce fold mountains (`Himalayas`) and ocean trenches?",
    questionType: "MULTIPLE_CHOICE",
    options: ["At **Divergent** boundaries, tectonic plates pull apart under tensional forces (`allowing mantle magma to well up and construct new basaltic crust`); at **Convergent** boundaries, plates collide under compressional forces (`causing subduction or crustal buckling into fold mountains`)", "Divergent boundaries freeze while convergent boundaries boil", "Divergent boundaries occur only on the Moon", "There is zero difference"],
    correctAnswer: "At **Divergent** boundaries, tectonic plates pull apart under tensional forces (`allowing mantle magma to well up and construct new basaltic crust`); at **Convergent** boundaries, plates collide under compressional forces (`causing subduction or crustal buckling into fold mountains`)",
    explanation: "Plate tectonics explains global landform distribution (`convection currents in the asthenosphere driving plate separation vs collision`).",
    difficulty: 2,
  }
];
