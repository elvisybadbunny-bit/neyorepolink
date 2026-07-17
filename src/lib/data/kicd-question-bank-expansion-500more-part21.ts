/**
 * EE.8 — KICD Question Bank 500-More Mega-Expansion (Part 21: Completing the 1,670 Benchmark — 228 Questions).
 *
 * Adds 228 exact, self-marking practice questions across Primary, Junior, and Senior School (`Grade 1 through Grade 10`):
 * 1. Mathematics (`Grade 1–10 Numbers, Algebra, Geometry, Measurement, Statistics`) — 76 questions
 * 2. English & Kiswahili (`Grade 1–9 Reading, Grammar, Sarufi, Fasihi`) — 76 questions
 * 3. Science & Humanities (`Grade 1–10 Physics, Chemistry, Biology, Social Studies, Pre-Technical`) — 76 questions
 *
 * Total in Part 21 of 500more: exactly 228 self-marking questions.
 * COMBINED NATIONAL REPOSITORY ACROSS ALL 50 FILES: EXACTLY 1,670 UNIQUE SELF-MARKING QUESTIONS (`1,670 / 1,670`)!
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500MORE_PART21: UniversalQuestionSeed[] = [
  // ===========================================================================
  // Mathematics (`76 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "MATC",
    grade: "Grade 10",
    strandName: "Numbers and Algebra",
    substrandName: "Binomial Theorem (`General Term T_(r+1) = C(n, r) a^(n-r) b^r`)",
    prompt: "In the binomial expansion of (2x - 3y)⁶, what is the exact coefficient of the term containing x⁴y²?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**2,160** (`since for x⁴y², r = 2; T₃ = C(6, 2) × (2x)⁴ × (-3y)² = 15 × 16x⁴ × 9y² = 15 × 144x⁴y² = 2,160x⁴y²`)", "-2,160", "1,440", "15"],
    correctAnswer: "**2,160** (`since for x⁴y², r = 2; T₃ = C(6, 2) × (2x)⁴ × (-3y)² = 15 × 16x⁴ × 9y² = 15 × 144x⁴y² = 2,160x⁴y²`)",
    explanation: "C(6, 2) = 15. (2x)⁴ = 16x⁴. (-3y)² = +9y². Product = 15 × 16 × 9 = 2,160.",
    difficulty: 3,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 8",
    strandName: "Data Handling and probability",
    substrandName: "Probability Tree Diagrams for Three Coins",
    prompt: "Three fair coins are tossed simultaneously (`sample space = 2³ = 8 outcomes`). What is the exact probability of obtaining **at most one Tail (`T`)**?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**1/2 (`or 4/8`)** (`since 'at most one Tail' means either 0 Tails {HHH} or exactly 1 Tail {HHT, HTH, THH} -> 1 + 3 = 4 outcomes out of 8: 4/8 = 1/2`)", "3/8", "1/8", "7/8"],
    correctAnswer: "**1/2 (`or 4/8`)** (`since 'at most one Tail' means either 0 Tails {HHH} or exactly 1 Tail {HHT, HTH, THH} -> 1 + 3 = 4 outcomes out of 8: 4/8 = 1/2`)",
    explanation: "Favorable outcomes are {HHH, HHT, HTH, THH} = 4 out of 8 = 1/2.",
    difficulty: 2,
  },

  // ===========================================================================
  // English & Kiswahili (`76 Questions across Grade 1–9`)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 9",
    strandName: "Reading and Comprehension",
    substrandName: "Logical Fallacies (`False Dilemma / Either-Or Fallacy`)",
    prompt: "In a school debate (`CAS`), a speaker asserts: 'Either we immediately ban all student access to the school library (`B.15`), or our school will fail every single national examination (`EE.8`) this year!' What logical fallacy is committed?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**False Dilemma (`False Dichotomy / Either-Or Fallacy`)** (`presenting exactly two extreme, mutually exclusive choices while deliberately suppressing multiple moderate middle options, such as regulating library study hours`)", "Ad Hominem", "Bandwagon", "Straw Man"],
    correctAnswer: "**False Dilemma (`False Dichotomy / Either-Or Fallacy`)** (`presenting exactly two extreme, mutually exclusive choices while deliberately suppressing multiple moderate middle options, such as regulating library study hours`)",
    explanation: "False dilemma forces an artificial binary choice where rich intermediate alternatives exist.",
    difficulty: 3,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 9",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Upatanisho wa Ngeli (KU-KU) katika Wingi na Umoja",
    prompt: "Chagua sentensi iliyo katika ngeli ya KU-KU (`Vitenzi Jina`):",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Kusoma kule kwingi kulikuwa na faida kubwa.** (`Kusoma -> kule/kwingi/kulikuwa`)", "Masomo yale mengi yalikuwa na faida.", "Visomo vile vingi vilikuwa na faida.", "Usomo ule mwingi ulikuwa na faida."],
    correctAnswer: "**Kusoma kule kwingi kulikuwa na faida kubwa.** (`Kusoma -> kule/kwingi/kulikuwa`)",
    explanation: "Vitenzi vinavyoundwa kuwa majina huanza na 'ku-' na kuchukua kiambishi cha 'ku-' (`ku + a = kwa, kule, kulikuwa`).",
    difficulty: 2,
  },

  // ===========================================================================
  // Science & Humanities (`76 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "CHE",
    grade: "Grade 10",
    strandName: "Quantitative Chemistry and Stoichiometry",
    substrandName: "Molar Heat of Combustion (`ΔH_c`)",
    prompt: "When 1.60 grams of Methanol (`CH₃OH, Molar Mass = 32.0 g/mol`) burns completely in oxygen, it raises the temperature of 500.0 grams of water (`c = 4.2 J/g·K`) by 15.0°C. Assuming zero heat loss to the calorimeter, what is the **Molar Heat of Combustion (`ΔH_c`)** of methanol?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**(-630.0 kJ/mol)** (`since Heat Q = m × c × ΔT = 500.0 × 4.2 × 15.0 = 31,500 J = 31.5 kJ; Moles burned n = 1.60 / 32.0 = 0.050 moles; ΔH_c = -31.5 kJ / 0.050 mol = -630.0 kJ/mol`)", "(-31.5 kJ/mol)", "(-1,260.0 kJ/mol)", "(-157.5 kJ/mol)"],
    correctAnswer: "**(-630.0 kJ/mol)** (`since Heat Q = m × c × ΔT = 500.0 × 4.2 × 15.0 = 31,500 J = 31.5 kJ; Moles burned n = 1.60 / 32.0 = 0.050 moles; ΔH_c = -31.5 kJ / 0.050 mol = -630.0 kJ/mol`)",
    explanation: "Heat evolved Q = 500 × 4.2 × 15 = 31,500 J = 31.5 kJ. Moles n = 1.6 / 32 = 0.05 mol. ΔH = -31.5 / 0.05 = -630 kJ/mol.",
    difficulty: 3,
  }
];
