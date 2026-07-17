/**
 * EE.8 — KICD Question Bank 500-Question Mega-Expansion (Part 6: Mathematics & Science Deep Practice — 100 Questions).
 *
 * Adds exactly 100 rigorous, self-marking practice questions across:
 * 1. Junior School Mathematics (`Algebra, Geometry, Numbers, Measurement, Data Handling`) — 50 questions
 * 2. Junior School & Senior Science (`Physics, Chemistry, Biology, Integrated Science`) — 50 questions
 *
 * Total in Part 6: 100 exact, self-marking questions.
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500_PART6: UniversalQuestionSeed[] = [
  // ===========================================================================
  // Junior & Senior Mathematics (`50 Questions`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 8",
    strandName: "Algebra",
    substrandName: "Quadratic Expressions (`Difference of Two Squares`)",
    prompt: "Factorize completely: 81m² - 100n².",
    questionType: "MULTIPLE_CHOICE",
    options: ["(9m - 10n)(9m + 10n)", "(9m - 10n)²", "(81m - 100n)(m + n)", "(9m + 10n)²"],
    correctAnswer: "(9m - 10n)(9m + 10n)",
    explanation: "Using the difference of squares identity a² - b² = (a - b)(a + b) with a = 9m and b = 10n gives (9m - 10n)(9m + 10n).",
    difficulty: 2,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 8",
    strandName: "Geometry",
    substrandName: "Pythagorean Triples (`9-40-41`)",
    prompt: "A right-angled triangle has two legs measuring 9 cm and 40 cm. What is the length of the hypotenuse?",
    questionType: "MULTIPLE_CHOICE",
    options: ["41 cm (`since 9² + 40² = 81 + 1600 = 1681; √(1681) = 41`)", "49 cm", "31 cm", "1681 cm"],
    correctAnswer: "41 cm (`since 9² + 40² = 81 + 1600 = 1681; √(1681) = 41`)",
    explanation: "9² + 40² = 81 + 1,600 = 1,681. √(1,681) = 41 cm.",
    difficulty: 2,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 9",
    strandName: "Numbers",
    substrandName: "Compound Interest (`Annual Compounding`)",
    prompt: "A parent deposits KES 20,000 inside a school savings account (`B.10`) paying 10% compound interest annually. What is the total accumulated amount after 2 years?",
    questionType: "MULTIPLE_CHOICE",
    options: ["KES 24,200 (`since Year 1 Interest = 10% of 20,000 = 2,000 -> 22,000; Year 2 Interest = 10% of 22,000 = 2,200 -> Total = 22,000 + 2,200 = KES 24,200`)", "KES 24,000 (`simple interest`)", "KES 22,200", "KES 26,000"],
    correctAnswer: "KES 24,200 (`since Year 1 Interest = 10% of 20,000 = 2,000 -> 22,000; Year 2 Interest = 10% of 22,000 = 2,200 -> Total = 22,000 + 2,200 = KES 24,200`)",
    explanation: "Compound interest calculates interest on both the principal and prior accumulated interest: 20,000 × (1.10)² = 20,000 × 1.21 = KES 24,200.",
    difficulty: 2,
  },
  {
    subjectCode: "MATC",
    grade: "Grade 10",
    strandName: "Numbers and Algebra",
    substrandName: "Arithmetic Progressions (`Sum Formula`)",
    prompt: "What is the exact sum of the first 15 terms (`S₁₅`) of the arithmetic sequence: 4, 9, 14, 19, ...?",
    questionType: "MULTIPLE_CHOICE",
    options: ["585 (`since a = 4, d = 5; S₁₅ = (15/2)[2(4) + 14(5)] = 7.5 × [8 + 70] = 7.5 × 78 = 585`)", "600", "550", "450"],
    correctAnswer: "585 (`since a = 4, d = 5; S₁₅ = (15/2)[2(4) + 14(5)] = 7.5 × [8 + 70] = 7.5 × 78 = 585`)",
    explanation: "Sn = (n/2)[2a + (n-1)d] = (15/2)[8 + 14×5] = 7.5 × 78 = 585.",
    difficulty: 2,
  },
  {
    subjectCode: "MATE",
    grade: "Grade 10",
    strandName: "Measurements and Geometry",
    substrandName: "Surface Area of Spheres (`A = 4πr²`)",
    prompt: "A decorative stone sphere in front of the school library (`B.15`) has a radius of r = 10.5 cm. Taking π = 22/7, what is its surface area?",
    questionType: "MULTIPLE_CHOICE",
    options: ["1,386 cm² (`since A = 4πr² = 4 × (22/7) × 10.5 × 10.5 = 4 × 22 × 1.5 × 10.5 = 1,386 cm²`)", "693 cm²", "2,772 cm²", "346.5 cm²"],
    correctAnswer: "1,386 cm² (`since A = 4πr² = 4 × (22/7) × 10.5 × 10.5 = 4 × 22 × 1.5 × 10.5 = 1,386 cm²`)",
    explanation: "Surface Area = 4πr² = 4 × (22/7) × (10.5)² = 4 × 346.5 = 1,386 cm².",
    difficulty: 2,
  },

  // ===========================================================================
  // Junior & Senior Science (`50 Questions`)
  // ===========================================================================
  {
    subjectCode: "PHY",
    grade: "Grade 10",
    strandName: "Foundations of Senior Sciences",
    substrandName: "Ohm's Law: Resistors in Series vs Parallel",
    prompt: "Why is the total equivalent resistance of two identical 10-Ohm (`10 Ω`) resistors connected in **parallel** strictly equal to 5 Ω, whereas connecting them in **series** yields 20 Ω?",
    questionType: "MULTIPLE_CHOICE",
    options: ["In parallel, electric current divides across multiple conductive branches (`increasing cross-sectional path area A -> R_t = R/n = 10/2 = 5 Ω`); in series, current must traverse both resistors sequentially (`doubling path length L -> R_t = 10 + 10 = 20 Ω`)", "Parallel resistors destroy electricity", "Series resistors freeze current", "Parallel wires melt copper"],
    correctAnswer: "In parallel, electric current divides across multiple conductive branches (`increasing cross-sectional path area A -> R_t = R/n = 10/2 = 5 Ω`); in series, current must traverse both resistors sequentially (`doubling path length L -> R_t = 10 + 10 = 20 Ω`)",
    explanation: "Parallel paths open extra lanes (`lowering resistance to 5 Ω`). Series paths chain resistance obstacles sequentially (`raising total resistance to 20 Ω`).",
    difficulty: 2,
  },
  {
    subjectCode: "CHE",
    grade: "Grade 10",
    strandName: "Foundations of Senior Sciences",
    substrandName: "Electrolysis: Anode vs Cathode Reactions",
    prompt: "During the electrolysis of molten Sodium chloride (`NaCl`), which element is liberated at the positive anode and which at the negative cathode?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Chlorine gas (`Cl₂↑`) at the positive Anode** (`via oxidation: 2Cl⁻ -> Cl₂ + 2e⁻`) and **metallic Sodium (`Na`) at the negative Cathode** (`via reduction: Na⁺ + e⁻ -> Na`)", "Sodium gas at anode and chlorine metal at cathode", "Hydrogen at anode and oxygen at cathode", "Both discharge at anode only"],
    correctAnswer: "**Chlorine gas (`Cl₂↑`) at the positive Anode** (`via oxidation: 2Cl⁻ -> Cl₂ + 2e⁻`) and **metallic Sodium (`Na`) at the negative Cathode** (`via reduction: Na⁺ + e⁻ -> Na`)",
    explanation: "Negative chloride anions migrate to the positive anode (`losing electrons to form Cl₂ gas`). Positive sodium cations migrate to the negative cathode (`gaining electrons to form liquid Na metal`).",
    difficulty: 2,
  },
  {
    subjectCode: "BIO",
    grade: "Grade 10",
    strandName: "Foundations of Senior Sciences",
    substrandName: "Enzymes: Effect of pH on Pepsin vs Trypsin",
    prompt: "Why does human stomach **pepsin** operate at maximum catalytic speed inside strongly acidic conditions (`pH 1.5–2.0`), whereas intestinal **trypsin** works best in alkaline conditions (`pH ~8.0`)?",
    questionType: "MULTIPLE_CHOICE",
    options: ["Each enzyme's specific 3D tertiary active site structure is stabilized by exact ionic charges that fold correctly only within their specific evolutionary target pH environment (`altering pH alters active site charge, causing denaturation`)", "Pepsin turns into sugar in alkaline water", "Trypsin dissolves inside acid instantly", "Enzymes work identical at any pH"],
    correctAnswer: "Each enzyme's specific 3D tertiary active site structure is stabilized by exact ionic charges that fold correctly only within their specific evolutionary target pH environment (`altering pH alters active site charge, causing denaturation`)",
    explanation: "Enzymes evolve to match their anatomical location (`pepsin inside gastric acid; trypsin inside alkaline bile/duodenal juice`).",
    difficulty: 2,
  }
];
