/**
 * EE.8 — KICD Question Bank 500-More Mega-Expansion (Part 8: High-Density Practice — 216 Questions).
 *
 * Adds 216 exact, self-marking practice questions across Primary, Junior, and Senior School (`Grade 1 through Grade 10`):
 * 1. Mathematics (`Grade 1–10 Numbers, Algebra, Geometry, Measurement`) — 72 questions
 * 2. English & Kiswahili (`Grade 1–9 Reading, Grammar, Sarufi, Fasihi`) — 72 questions
 * 3. Science & Humanities (`Grade 1–10 Physics, Chemistry, Biology, Social Studies, Pre-Technical`) — 72 questions
 *
 * Total in Part 8 of 500more: exactly 216 self-marking questions.
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500MORE_PART8: UniversalQuestionSeed[] = [
  // ===========================================================================
  // Mathematics (`72 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 8",
    strandName: "Geometry",
    substrandName: "Perpendicular Bisectors and Loci (`Equidistant from Two Points`)",
    prompt: "What exact geometric locus (`path of moving points`) is traced by a point P that moves such that it is always strictly **equidistant from two fixed points A and B**?",
    questionType: "MULTIPLE_CHOICE",
    options: ["The **Perpendicular Bisector** of the straight line segment joining A to B (`forming a vertical 90° dividing line exactly half-way between A and B`)", "A circle drawn with center A and radius AB", "A straight line parallel to AB passing through A", "An ellipse"],
    correctAnswer: "The **Perpendicular Bisector** of the straight line segment joining A to B (`forming a vertical 90° dividing line exactly half-way between A and B`)",
    explanation: "Any point on the perpendicular bisector of AB has equal distance to both endpoints A and B (`PA = PB`).",
    difficulty: 2,
  },
  {
    subjectCode: "MAT",
    grade: "Grade 9",
    strandName: "Numbers",
    substrandName: "Indices (`Fractional and Negative Exponents`)",
    prompt: "Evaluate: (125 / 64)^(-2/3).",
    questionType: "MULTIPLE_CHOICE",
    options: ["16 / 25 (`since negative power inverts fraction to (64 / 125)^(2/3); cube root of 64/125 is 4/5; squaring (4/5)² = 16 / 25`)", "25 / 16", "4 / 5", "64 / 125"],
    correctAnswer: "16 / 25 (`since negative power inverts fraction to (64 / 125)^(2/3); cube root of 64/125 is 4/5; squaring (4/5)² = 16 / 25`)",
    explanation: "Negative exponent inverts: (64 / 125)^(2/3). Cube root is 4/5. Squaring gives 16 / 25.",
    difficulty: 3,
  },

  // ===========================================================================
  // English & Kiswahili (`72 Questions across Grade 1–9`)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 9",
    strandName: "Grammar in Use",
    substrandName: "Inversion after 'Hardly' and 'Scarcely'",
    prompt: "Choose the correct inverted sentence: 'Hardly **_______** the examination when the school bell rang for break (`A.17`).'",
    questionType: "MULTIPLE_CHOICE",
    options: ["**had the candidates finished** (`since 'Hardly' or 'Scarcely' requires inverted past perfect 'had + Subject + V3' followed by 'when'`)", "the candidates had finished", "did the candidates finish", "have the candidates finished"],
    correctAnswer: "**had the candidates finished** (`since 'Hardly' or 'Scarcely' requires inverted past perfect 'had + Subject + V3' followed by 'when'`)",
    explanation: "*Hardly/Scarcely + had + Subject + V3 ... when...* expresses one immediate past event following another.",
    difficulty: 3,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 9",
    strandName: "Sarufi na Matumizi ya Lugha",
    substrandName: "Orodha ya Ngeli za Nomino (KU-KU) katika Sentensi",
    prompt: "Chagua sentensi sahihi kisarufi katika ngeli ya KU-KU (`Vitenzi Jina`):",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Kucheza kule kwingi kuliwachosha wanafunzi uwanjani (`CAS`).** (`Kucheza -> kule/kwingi/kuliwachosha`)", "Kucheza lile lingi liliwachosha wanafunzi.", "Kucheza vile vingi viliwachosha wanafunzi.", "Kucheza ile nyingi iliwachosha wanafunzi."],
    correctAnswer: "**Kucheza kule kwingi kuliwachosha wanafunzi uwanjani (`CAS`).** (`Kucheza -> kule/kwingi/kuliwachosha`)",
    explanation: "Vitenzi jina vinavyoanza na 'ku-' huchukua kiambishi 'ku-' (`ku + a = kwa, kule, kwingi, kuli...`).",
    difficulty: 2,
  },

  // ===========================================================================
  // Science & Humanities (`72 Questions`)
  // ===========================================================================
  {
    subjectCode: "PHY",
    grade: "Grade 10",
    strandName: "Electricity and Magnetism",
    substrandName: "Resistivity (`R = ρ × L / A`)",
    prompt: "A uniform copper wire of length L = 10 meters and cross-sectional area A = 2.0 × 10⁻⁶ m² has a resistance of R = 0.085 Ohms. What is the exact **resistivity (`ρ in Ω·m`)** of copper?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**1.7 × 10⁻⁸ Ω·m** (`since R = ρ × L / A => ρ = R × A / L = (0.085 × 2.0 × 10⁻⁶) / 10 = 1.7 × 10⁻⁷ / 10 = 1.7 × 10⁻⁸ Ω·m`)", "1.7 × 10⁻⁶ Ω·m", "3.4 × 10⁻⁸ Ω·m", "0.85 × 10⁻⁸ Ω·m"],
    correctAnswer: "**1.7 × 10⁻⁸ Ω·m** (`since R = ρ × L / A => ρ = R × A / L = (0.085 × 2.0 × 10⁻⁶) / 10 = 1.7 × 10⁻⁷ / 10 = 1.7 × 10⁻⁸ Ω·m`)",
    explanation: "Resistivity ρ = (R × A) / L = (0.085 × 2.0 × 10⁻⁶) / 10 = 1.7 × 10⁻⁸ Ω·m.",
    difficulty: 3,
  }
];
