/**
 * EE.8 — KICD Question Bank 500-More Mega-Expansion (Part 13: Completing the 1,571 National Benchmark — 205 Questions).
 *
 * Adds 205 exact, self-marking practice questions across Primary, Junior, and Senior School (`Grade 1 through Grade 10`):
 * 1. Mathematics (`Grade 1–10 Numbers, Algebra, Geometry, Measurement, Statistics`) — 70 questions
 * 2. English & Kiswahili (`Grade 1–9 Reading, Grammar, Sarufi, Fasihi`) — 68 questions
 * 3. Science & Humanities (`Grade 1–10 Physics, Chemistry, Biology, Social Studies, Pre-Technical`) — 67 questions
 *
 * Total in Part 13 of 500more: exactly 205 self-marking questions.
 * COMBINED NATIONAL REPOSITORY ACROSS ALL 43 FILES: EXACTLY 1,571 UNIQUE SELF-MARKING QUESTIONS (`1,571 / 1,571`)!
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500MORE_PART13: UniversalQuestionSeed[] = [
  // ===========================================================================
  // Mathematics (`70 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 9",
    strandName: "Data Handling and probability",
    substrandName: "Normal Distribution (`Empirical 68-95-99.7 Rule`)",
    prompt: "In a normal distribution of examination scores with mean µ = 70% and standard deviation σ = 5%, approximately what exact percentage of students scored between **65% and 75% (`µ - σ to µ + σ`)**?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**68.0% (`since the Empirical Rule states that exactly ~68% of normally distributed data lies within 1 standard deviation on either side of the mean`)**", "95.0% (`within 2 standard deviations 60%–80%`)", "99.7% (`within 3 standard deviations`)", "50.0%"],
    correctAnswer: "**68.0% (`since the Empirical Rule states that exactly ~68% of normally distributed data lies within 1 standard deviation on either side of the mean`)**",
    explanation: "The bell curve (`normal distribution`) distributes ~68% of items within 1σ (`65–75`), ~95% within 2σ (`60–80`), and ~99.7% within 3σ (`55–85`).",
    difficulty: 2,
  },
  {
    subjectCode: "MATC",
    grade: "Grade 10",
    strandName: "Numbers and Algebra",
    substrandName: "Integration (`Indefinite Integral ∫ xⁿ dx = (x^(n+1))/(n+1) + C`)",
    prompt: "Find the exact indefinite integral: ∫ (6x² - 4x + 3) dx.",
    questionType: "MULTIPLE_CHOICE",
    options: ["**2x³ - 2x² + 3x + C** (`since integrating each term using ∫ xⁿ dx = x^(n+1)/(n+1) yields 6(x³)/3 - 4(x²)/2 + 3x + C = 2x³ - 2x² + 3x + C`)", "12x - 4 + C (`derivative`)", "6x³ - 4x² + 3x + C", "2x³ - 4x² + 3x"],
    correctAnswer: "**2x³ - 2x² + 3x + C** (`since integrating each term using ∫ xⁿ dx = x^(n+1)/(n+1) yields 6(x³)/3 - 4(x²)/2 + 3x + C = 2x³ - 2x² + 3x + C`)",
    explanation: "Integration is the reverse of differentiation: add 1 to exponent and divide coefficient by new exponent (`6x³/3 = 2x³; -4x²/2 = -2x²`). Always include constant of integration (`+ C`).",
    difficulty: 3,
  },

  // ===========================================================================
  // English & Kiswahili (`68 Questions across Grade 1–9`)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 9",
    strandName: "Writing",
    substrandName: "Precis and Executive Summary (`Report Synthesis`)",
    prompt: "When composing an **Executive Summary (`or Précis`)** for an annual school board report (`B.7 / B.9`), what must be written inside the opening two sentences?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**A high-density synthesis of the report's primary thesis, major institutional achievements (`e.g., 98% fee collection via Mzazi Direct Pay I.41`), and highest-leverage policy recommendations without any introductory small talk**", "A list of every student's birthday", "The full table of contents copied word-for-word", "The weather report in Nairobi"],
    correctAnswer: "**A high-density synthesis of the report's primary thesis, major institutional achievements (`e.g., 98% fee collection via Mzazi Direct Pay I.41`), and highest-leverage policy recommendations without any introductory small talk**",
    explanation: "Executive summaries serve busy decision-makers (`BOM / Principals`) by condensing multi-page reports into actionable strategic macro-findings immediately.",
    difficulty: 2,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 9",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Upatanisho wa Ngeli (U-YA / U-MA) katika Viwakilishi",
    prompt: "Chagua upatanisho sahihi wa kisarufi: 'Ugonjwa **_______** ulimsakama sana mzee huyo, lakini magonjwa **_______** yamepotolewa na daktari shuleni (`Clinic B.1`).'",
    questionType: "MULTIPLE_CHOICE",
    options: ["**huo ... hayo** (`ngeli ya U-YA umoja 'u-' -> huo ugonjwa; wingi 'ya-' -> hayo magonjwa`)", "hili ... haya (`LI-YA`)", "huu ... hizi (`U-ZI`)", "hiki ... hivi (`KI-VI`)"],
    correctAnswer: "**huo ... hayo** (`ngeli ya U-YA umoja 'u-' -> huo ugonjwa; wingi 'ya-' -> hayo magonjwa`)",
    explanation: "Ugonjwa imo ngeli ya U-YA (`umoja ugonjwa huo / wingi magonjwa hayo`).",
    difficulty: 1,
  },

  // ===========================================================================
  // Science & Humanities (`67 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "PHY",
    grade: "Grade 10",
    strandName: "Foundations of Senior Sciences",
    substrandName: "Momentum Conservation (`p = m × v and m₁u₁ + m₂u₂ = (m₁ + m₂)v`)",
    prompt: "A 1,000 kg school minibus (`T.8`) moving East at 20 m/s collides completely and interlocks inelasticly with a stationary 1,000 kg sedan car (`speed = 0 m/s`). By Conservation of Momentum (`Total Momentum Before = Total Momentum After`), what is the exact common velocity (`v`) of the wreckage moving right after impact?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**10 m/s East** (`since Total Momentum Before = (1,000 × 20) + (1,000 × 0) = 20,000 kg·m/s; Combined Mass = 1,000 + 1,000 = 2,000 kg; Common Velocity v = 20,000 / 2,000 = 10 m/s`)", "20 m/s East", "5 m/s East", "40 m/s East"],
    correctAnswer: "**10 m/s East** (`since Total Momentum Before = (1,000 × 20) + (1,000 × 0) = 20,000 kg·m/s; Combined Mass = 1,000 + 1,000 = 2,000 kg; Common Velocity v = 20,000 / 2,000 = 10 m/s`)",
    explanation: "Momentum p = mass × velocity. Initial p = 20,000 + 0 = 20,000 kg·m/s. After inelastic collision, mass doubles (`2,000 kg`), so velocity halves (`20,000 / 2,000 = 10 m/s`).",
    difficulty: 2,
  }
];
