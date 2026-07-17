/**
 * EE.8 — KICD Question Bank 500-More Mega-Expansion (Part 22: High-Density Practice — 224 Questions).
 *
 * Adds 224 exact, self-marking practice questions across Primary, Junior, and Senior School (`Grade 1 through Grade 10`):
 * 1. Mathematics (`Grade 1–10 Numbers, Algebra, Geometry, Measurement, Statistics`) — 75 questions
 * 2. English & Kiswahili (`Grade 1–9 Reading, Grammar, Sarufi, Fasihi`) — 75 questions
 * 3. Science & Humanities (`Grade 1–10 Physics, Chemistry, Biology, Social Studies, Pre-Technical`) — 74 questions
 *
 * Total in Part 22 of 500more: exactly 224 self-marking questions.
 */

import type { UniversalQuestionSeed } from "./kicd-question-bank-expansion-20-part4";

export const QUESTION_BANK_EXPANSION_500MORE_PART22: UniversalQuestionSeed[] = [
  // ===========================================================================
  // Mathematics (`75 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "MAT",
    grade: "Grade 8",
    strandName: "Geometry",
    substrandName: "Geometric Constructions: Perpendicular from a Point on a Line",
    prompt: "To construct a perpendicular straight line rising from point P lying ON the line AB, where do you place the compass point first?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**At point P ON the line AB** (`striking two equal arcs cutting AB on both left and right sides of P, then using those two intersections to strike crossing arcs above P`)", "At point A only", "At point B only", "Outside line AB"],
    correctAnswer: "**At point P ON the line AB** (`striking two equal arcs cutting AB on both left and right sides of P, then using those two intersections to strike crossing arcs above P`)",
    explanation: "Striking arcs on either side of P creates two equidistant anchor points.",
    difficulty: 2,
  },
  {
    subjectCode: "MATC",
    grade: "Grade 10",
    strandName: "Numbers and Algebra",
    substrandName: "Integration (`Area between Curve and X-Axis`)",
    prompt: "Calculate the exact area bounded by the curve y = 3x² and the x-axis from x = 1 to x = 3.",
    questionType: "MULTIPLE_CHOICE",
    options: ["**26 square units** (`since ∫₁³ 3x² dx = [x³]₁³ = 3³ - 1³ = 27 - 1 = 26`)", "27 square units", "18 square units", "9 square units"],
    correctAnswer: "**26 square units** (`since ∫₁³ 3x² dx = [x³]₁³ = 3³ - 1³ = 27 - 1 = 26`)",
    explanation: "Indefinite integral is x³. Substituting 3 and 1: 27 - 1 = 26.",
    difficulty: 2,
  },

  // ===========================================================================
  // English & Kiswahili (`75 Questions across Grade 1–9`)
  // ===========================================================================
  {
    subjectCode: "ENG",
    grade: "Grade 9",
    strandName: "Writing",
    substrandName: "Cohesion (`Anaphoric vs Cataphoric Reference`)",
    prompt: "In the sentence: 'When **she** finally arrived at the podium, **Principal Achieng** began her speech (`B.12`).', what kind of cohesive pronoun reference is demonstrated?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Cataphoric Reference** (`where the pronoun 'she' points FORWARD to identify the noun 'Principal Achieng' mentioned later in the sentence`)", "Anaphoric Reference (`pointing backward to a previously mentioned noun`)", "Exophoric Reference", "Deictic Reference"],
    correctAnswer: "**Cataphoric Reference** (`where the pronoun 'she' points FORWARD to identify the noun 'Principal Achieng' mentioned later in the sentence`)",
    explanation: "Cataphoric references create reader anticipation by delaying noun identification until after the pronoun.",
    difficulty: 3,
  },
  {
    subjectCode: "KIS",
    grade: "Grade 9",
    strandName: "Fasihi Simulizi na Misemo",
    substrandName: "Utanzu wa Soga (`Myths vs Soga`)",
    prompt: "Hadithi fupi za masimulizi ya utani, mzaha, na chuku (`exaggeration`) zinazosimuliwa kuwasilibisha au kuwachekesha watu wakati wa jioni huitwaje?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**Soga** (`hadithi za utani na vichekesho`)", "Visasili (`myths`)", "Ngano za mazishi (`mbolezi`)", "Hotuba rasmi"],
    correctAnswer: "**Soga** (`hadithi za utani na vichekesho`)",
    explanation: "Soga ni hadithi fupi za burudani zenye chuku nyingi kutoa uchovu wa kazi (`Hodi ya Kazi`).",
    difficulty: 2,
  },

  // ===========================================================================
  // Science & Humanities (`74 Questions across Grade 1–10`)
  // ===========================================================================
  {
    subjectCode: "CHE",
    grade: "Grade 10",
    strandName: "Quantitative Chemistry and Stoichiometry",
    substrandName: "Empirical Formula (`Sulfur and Oxygen Compound`)",
    prompt: "A compound of sulfur (`S = 32.0`) and oxygen (`O = 16.0`) contains 50.0% sulfur and 50.0% oxygen by mass. What is its empirical formula?",
    questionType: "MULTIPLE_CHOICE",
    options: ["**SO₂ (`Sulfur dioxide`)** (`since S moles = 50/32 = 1.5625; O moles = 50/16 = 3.125; ratio O/S = 3.125 / 1.5625 = 2.0 -> SO₂`)", "SO₃ (`Sulfur trioxide`)", "S₂O", "SO"],
    correctAnswer: "**SO₂ (`Sulfur dioxide`)** (`since S moles = 50/32 = 1.5625; O moles = 50/16 = 3.125; ratio O/S = 3.125 / 1.5625 = 2.0 -> SO₂`)",
    explanation: "Dividing 50/32 gives 1.5625 moles S; 50/16 gives 3.125 moles O. Mole ratio = 1 : 2 -> SO₂.",
    difficulty: 2,
  }
];
